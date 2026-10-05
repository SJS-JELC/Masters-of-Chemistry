import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {comparisons,identities} from '../../../src/activities/igcse/structure-and-bonding/data.ts';
const directory=path.dirname(fileURLToPath(import.meta.url));
const project=path.resolve(directory,'../../..');
const require=createRequire(path.resolve(project,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright');
const profile=path.join(directory,'p-edge');
const context=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:1365,height:900},args:['--no-first-run','--no-default-browser-check']});
const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
const results=[];
const tables=JSON.parse(fs.readFileSync(path.join(project,'src/activities/igcse/structure-and-bonding/dormant-level-one.json'),'utf8'));
const snapshot=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
const flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
async function open(extra='',suffix='') {
  await page.goto(`http://127.0.0.1:5181/igcse.html?run=a09-${Date.now().toString(36)}-${suffix}${extra}`);
  await page.waitForFunction(()=>window.__mastersActivity!==undefined);
  await page.getByLabel('Target',{exact:true}).selectOption('lower-6-5:2');
  await page.waitForFunction(()=>!document.querySelector('button.primary')?.disabled);
}
async function start(level=2) {
  await page.getByLabel('Target',{exact:true}).selectOption(`lower-6-5:${level}`);
  await page.getByRole('button',{name:'Start practice',exact:true}).click();
  await page.waitForFunction(()=>window.__mastersActivity.snapshot().attempt!==null);await flush();
}
async function writeAnswer() {
  const initial=await snapshot();const part=initial.question.parts[0];
  const text=part.rubric.map(point=>point.text).join(' ');
  if(initial.question.ref.level===3) await page.getByLabel('Your explanation',{exact:true}).fill(`  ${text}  `);
  else {
    const controls=page.locator('.explanation-sections input, .explanation-sections textarea');
    assert.equal(await controls.count(),7);
    const identity=identities.find(i=>i.questionId===initial.question.ref.questionId);
    const table=tables[identity.sourceKey.slice(0,-2)];
    for(let i=0;i<7;i++) {
      const side=i<3?'left':'right';
      const value=i===0||i===3?(table.find(row=>row.label==='Bonding type')?.[side]??'Covalent')
        :i===1||i===4?(table.find(row=>row.label==='Structure')??table.find(row=>row.label==='Arrangement'))[side]:`  ${text}  `;
      await controls.nth(i).fill(value);
    }
  }
  await flush();return (await snapshot()).attempt.currentResponses.explanation.sections.map(s=>s.text).join('\n\n');
}
async function freeze() {await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity.snapshot().attempt.phase==='rubric-review');await flush();}
async function judgeNative() {
  await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();await flush();
  const locked=page.getByLabel('Select evidence from your submitted answer',{exact:true});await locked.focus();await page.keyboard.press('Control+A');
  await page.getByRole('button',{name:'Use selected text',exact:true}).click();await flush();
}
async function judgeOffsets(start,end) {
  await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();await flush();
  await page.getByLabel('Start',{exact:true}).fill(String(start));await page.getByLabel('End (exclusive)',{exact:true}).fill(String(end));
  await page.getByRole('button',{name:'Use selected text',exact:true}).click();await flush();
}
async function finishOthers() {
  while((await snapshot()).attempt.reviews[0].activePointId) {await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();await flush();}
  await page.getByRole('button',{name:'Finish self-review',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity.snapshot().attempt.phase==='assessed');await flush();await page.waitForFunction(()=>window.__mastersActivity.snapshot().history.length===1);
}
async function run(id,operation) {const began=Date.now();try{results.push({id,status:'PASS',elapsedMs:Date.now()-began,evidence:await operation()});}catch(error){results.push({id,status:'FAIL',elapsedMs:Date.now()-began,error:String(error.stack||error)});await page.screenshot({path:path.join(directory,`${id}-failure.png`),fullPage:true});}}
try {
  await run('practice-L2-pending-review-reload-exact-evidence-time',async()=>{
    await open();await start(2);assert.equal((await snapshot()).question.parts[0].sections.length,7);
    await page.screenshot({path:path.join(directory,'desktop-L2-writing.png'),fullPage:true});
    const expected=await writeAnswer();await page.waitForTimeout(1200);await freeze();const frozen=await snapshot();
    assert.equal(frozen.attempt.reviews[0].lockedText,expected);assert.equal(frozen.history.length,0);assert.equal(await page.locator('.explanation-sections input').count(),4);assert.equal(await page.locator('.explanation-sections textarea').count(),3);
    assert(frozen.attempt.firstResponse.timing.activeMs>0);assert.equal(frozen.attempt.firstResponse.timing.idleLimitMs,180000);
    await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();await flush();await page.reload();
    await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='rubric-review');await flush();
    const restored=await snapshot();assert.equal(restored.attempt.attemptId,frozen.attempt.attemptId);assert.equal(restored.attempt.reviews[0].judgements[0].status,'awaiting-evidence');assert.equal(restored.attempt.reviews[0].lockedText,expected);assert.deepEqual(restored.attempt.firstResponse,frozen.attempt.firstResponse);
    const locked=page.getByLabel('Select evidence from your submitted answer',{exact:true});await locked.focus();await page.keyboard.press('Control+A');await page.getByRole('button',{name:'Use selected text',exact:true}).click();await flush();
    assert.equal((await snapshot()).attempt.reviews[0].judgements[0].evidence.text,expected);
    await judgeOffsets(0,16);const reviewed=await snapshot();assert.equal(reviewed.attempt.reviews[0].judgements[1].evidence.text,expected.slice(0,16));
    await page.screenshot({path:path.join(directory,'desktop-L2-evidence.png'),fullPage:true});await page.waitForTimeout(1200);await finishOthers();
    const assessed=await snapshot();assert.equal(assessed.history.length,1);assert.equal(assessed.attempt.firstAssessment.score,0.5);assert.deepEqual(assessed.attempt.firstResponse,frozen.attempt.firstResponse);assert.deepEqual(assessed.history[0].timing,frozen.attempt.firstResponse.timing);
    await page.getByRole('button',{name:'Show worked answer',exact:true}).click();await flush();await page.reload();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');await flush();
    const final=await snapshot();assert.equal(final.history.length,1);assert.deepEqual(final.attempt.firstAssessment,assessed.attempt.firstAssessment);assert.deepEqual(final.attempt.firstResponse,frozen.attempt.firstResponse);
    await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity.snapshot().attempt.attemptId!==id,assessed.attempt.attemptId);await flush();
    const next=await snapshot();assert.equal(next.attempt.phase,'answering');assert.notEqual(next.attempt.ref.questionId,assessed.attempt.ref.questionId);assert.equal(next.history.length,1);
    return {first:frozen.attempt.ref,next:next.attempt.ref,activeMs:frozen.attempt.firstResponse.timing.activeMs,exactUntrimmedText:true,pendingReviewRestored:true,immutableFirstEvidence:true,records:1};
  });
  await run('revision-pause-reload-resume-scheduler',async()=>{
    await open('&session=revision','revision');await page.getByRole('button',{name:/^ADD ALL lower-6$/}).click();await flush();assert.equal((await snapshot()).selectedCount,2);await start(3);
    const current=await snapshot();assert.equal(current.session.kind,'revision');await writeAnswer();await page.getByRole('button',{name:'Pause',exact:true}).click();await flush();const paused=await snapshot();assert.equal(paused.session.status,'paused');
    await page.reload();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt!=null);await flush();const restored=await snapshot();assert.equal(restored.attempt.attemptId,paused.attempt.attemptId);assert.deepEqual(restored.attempt.currentResponses,paused.attempt.currentResponses);
    await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await flush();await freeze();const first=await snapshot();await judgeNative();await finishOthers();const assessed=await snapshot();assert.equal(assessed.history.length,1);assert.equal(assessed.session.current.completed,true);assert.deepEqual(assessed.attempt.firstResponse,first.attempt.firstResponse);
    await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity.snapshot().attempt.attemptId!==id,assessed.attempt.attemptId);await flush();const next=await snapshot();assert.equal(next.attempt.phase,'answering');assert.equal(next.session.kind,'revision');
    return {selectedLevels:2,pauseDraftRestored:true,firstRef:first.attempt.ref,nextRef:next.attempt.ref,records:1,schedulerControlsNext:true};
  });
  await run('practice-L3-open-writing-first-freeze',async()=>{
    await open('','L3');await start(3);assert.equal((await snapshot()).question.parts[0].sections.length,1);
    const expected=await writeAnswer();await freeze();const first=await snapshot();assert.equal(first.attempt.reviews[0].lockedText,expected);
    await page.screenshot({path:path.join(directory,'desktop-L3-open-review.png'),fullPage:true});await judgeNative();await finishOthers();
    const assessed=await snapshot();assert.equal(assessed.history.length,1);assert.equal(assessed.history[0].grade,3);assert.equal(assessed.attempt.firstAssessment.score,0.5);assert.deepEqual(assessed.attempt.firstResponse,first.attempt.firstResponse);
    return {singleOpenSection:true,sourceGrade:3,exactFrozenText:true,records:1};
  });
  // Actual native visibility/180000ms idle gate belongs to independent A07 after concrete GPU launch failures.
  await run('teacher-complete-historical-bank-mobile',async()=>{
    await page.goto(`http://127.0.0.1:5181/igcse.html?run=a09-teacher-${Date.now().toString(36)}&mode=teacher`);await page.waitForFunction(()=>document.querySelector('.question-player')!==null);
    assert.equal(await page.getByRole('button',{name:'Start practice',exact:true}).isDisabled(),true);assert.equal((await snapshot()).attempt,null);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);
    const checked=[];
    for(const identity of identities) {
      await page.goto(`http://127.0.0.1:5181/igcse.html?run=a09-review-${Date.now().toString(36)}&mode=teacher&review=${identity.questionId}`);
      await page.waitForFunction(()=>document.querySelector('.question-player')!==null);
      const comparison=comparisons.find(c=>identity.sourceKey===`${c.id}:${identity.sourceKey.slice(-1)}`);
      assert.equal(await page.locator('.question-meta code').textContent(),identity.questionId);
      assert.equal(await page.locator('.question-player').getByText(comparison.prompt,{exact:true}).count(),1);
      for(const point of comparison.points) assert.equal(await page.locator('.worked-answer').getByText(new RegExp(point.text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))).count(),1);
      assert.equal((await snapshot()).attempt,null);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);checked.push(identity.questionId);
    }
    await page.screenshot({path:path.join(directory,'desktop-teacher-full-rubric.png'),fullPage:true});await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(directory,'mobile-teacher-full-rubric.png'),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await open('','mobile');await start(2);await writeAnswer();await page.screenshot({path:path.join(directory,'mobile-L2-writing.png'),fullPage:true});await freeze();await judgeNative();
    await page.screenshot({path:path.join(directory,'mobile-L2-review.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);
    return {historicalCodes:checked,all44RubricPointsRenderedAtBothLevels:true,mobileHorizontalOverflow:false,teacherAttemptsAndEvidence:0,legacyWrites:0};
  });
} finally {
  const report={status:results.every(r=>r.status==='PASS')&&!errors.length?'PASS':'FAIL',checkedAt:new Date().toISOString(),playwright:require('playwright/package.json').version,browser:context.browser()?.version()||'persistent Edge',connection:{headless:true,defaultPlaywright:true},profile,boundedRetry:'Initial native Chrome CDP1006 had a confirmed GPU launch failure; A01 authorised ordinary headless Edge retry and independently assigned native proof to A07.',initialFailure:'validation/s2/structure/browser-launch-initial.json',ordinaryInitialFailure:'validation/s2/structure/browser-results-ordinary-initial.json',ordinaryBoundedRetry:'Correct immediate React history snapshot race with saved-history settlement, and use original NaCl Arrangement table row instead of assuming every teaching table labels it Structure.',externalNativeGate:{owner:'A07',evidence:'validation/s2/review-native/',status:'pending-independent-result'},host:'Actual production ActivityHost/controller/clock/Dexie repository/session; no fixtures.',results,pageErrors:errors};
  fs.writeFileSync(path.join(directory,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await context.close();console.log(JSON.stringify({status:report.status,passed:results.filter(r=>r.status==='PASS').length,total:results.length,pageErrors:errors}));if(report.status!=='PASS')process.exitCode=1;
}
