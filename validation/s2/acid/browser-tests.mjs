import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const directory=import.meta.dirname;
const project=resolve(directory,'../../..');
const require=createRequire(resolve(project,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright');
const ordinary=process.argv.includes('--ordinary');
// Keep Chrome's own nested profile paths below Windows path limits.
const profile=resolve(directory,'p',Date.now().toString().slice(-7));mkdirSync(profile,{recursive:true});
const port=9358;
let browserProcess,browser,context;
if(ordinary){context=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:1366,height:1000},args:['--no-first-run','--no-default-browser-check']});}
else{
 browserProcess=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--window-size=1366,1000','about:blank'],{stdio:['ignore','ignore','pipe'],windowsHide:false});
 browserProcess.stderr.on('data',data=>writeFileSync(resolve(directory,'native-browser-stderr.log'),String(data),{flag:'a'}));
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${port}/json/version`)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}assert(ready,'Native isolated Chrome CDP endpoint');
 browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`,{noDefaults:true,artifactsDir:directory,isLocal:true});context=browser.contexts()[0];assert(context);
}
const page=context.pages()[0]??await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize({width:1366,height:1000});
const results=[];let run=0;
const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
const flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
async function open(id,query=''){
 await page.goto(`http://127.0.0.1:5181/alevel.html?run=a08-${id}-${Date.now()}-${run++}${query}`);
 await page.waitForFunction(()=>!!window.__mastersActivity);await page.getByRole('button',{name:'Start practice',exact:true}).waitFor();
 if(!query.includes('mode=teacher')&&!query.includes('review='))await page.getByRole('button',{name:'Start practice',exact:true}).waitFor({state:'visible'});
 if(!query.includes('mode=teacher')&&!query.includes('review='))await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Start practice')?.disabled);
}
async function start(target='u6-t1-1-5:1'){
 const previous=(await snap()).attempt?.attemptId??null;
 await page.getByLabel('Target',{exact:true}).selectOption(target);await page.getByRole('button',{name:'Start practice',exact:true}).click();
 await page.waitForFunction(id=>{const attempt=window.__mastersActivity.snapshot().attempt;return attempt?.phase==='answering'&&attempt.attemptId!==id;},previous);await flush();return snap();
}
async function fill(kind='correct'){
 const current=await snap();const inputs=page.getByLabel(/Your answer/);assert.equal(await inputs.count(),current.question.parts.length);
 for(let i=0;i<current.question.parts.length;i++){const part=current.question.parts[i];assert.equal(part.kind,'numeric');const value=kind==='correct'||kind==='partial'&&i===0?part.acceptance.expected:part.acceptance.expected+100;await inputs.nth(i).fill(String(value));}await flush();
}
async function check(){await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity.snapshot().attempt?.phase==='assessed');await flush();await page.waitForFunction(()=>{const snapshot=window.__mastersActivity.snapshot();return snapshot.history.length===1&&snapshot.saveStatus.kind==='saved';});}
async function scenario(id,operation){const began=Date.now();try{const evidence=await operation();results.push({id,status:'PASS',elapsedMs:Date.now()-began,evidence});}catch(error){results.push({id,status:'FAIL',elapsedMs:Date.now()-began,error:String(error.stack||error)});await page.screenshot({path:resolve(directory,`${id}-failure.png`),fullPage:true});}writeFileSync(resolve(directory,'browser-progress.json'),JSON.stringify(results,null,2));}
try{
 await scenario('all15-active-acid-targets-real-launch',async()=>{
  const launched=[];
  for(const gem of ['u6-t1-1-2','u6-t1-1-3','u6-t1-1-5','u6-t1-1-7','u6-t1-1-8'])for(const level of [1,2,3]){
   await open(`route-${gem}-${level}`);const current=await start(`${gem}:${level}`);assert(current.question.ref.questionId.startsWith('AB2-'));assert.equal(current.attempt.target.gemId,gem);assert.equal(current.question.ref.level,level);
   assert.equal(current.attempt.assistance.length,0);await fill();await check();const marked=await snap();assert.equal(marked.attempt.firstAssessment.score,1);assert.equal(marked.history.length,1);assert.equal(marked.history[0].timing.activeMs,marked.attempt.firstResponse.timing.activeMs);
   launched.push({gem,level,id:current.question.ref.questionId,parts:current.question.parts.length,idleLimitMs:current.attempt.timing.idleLimitMs});
  }return {targets:launched};
 });
 await scenario('structured-partial-incomplete-correction-fixed-evidence',async()=>{
  await open('partial');await start();const source=await snap();assert(source.question.parts.length>=2);assert(source.question.scaffolds.length>0);
  await page.getByRole('button',{name:'Check answer',exact:true}).click();await flush();assert.equal((await snap()).attempt.phase,'answering');assert.equal((await snap()).history.length,0);
  await fill('partial');await page.waitForTimeout(1200);await check();const first=await snap();assert.equal(first.attempt.firstAssessment.score,0.5);assert.equal(first.history.length,1);assert.equal(first.attempt.firstResponse.assistance.length,0);
  const frozen=JSON.stringify(first.attempt.firstResponse),assessment=JSON.stringify(first.attempt.firstAssessment);await fill('correct');await page.getByRole('button',{name:'Check correction',exact:true}).click();await flush();await page.waitForFunction(()=>window.__mastersActivity.snapshot().correctionFeedback?.status==='correct');const correction=await snap();assert.equal(correction.correctionFeedback.status,'correct');assert.equal(JSON.stringify(correction.attempt.firstResponse),frozen);assert.equal(JSON.stringify(correction.attempt.firstAssessment),assessment);assert.equal(correction.history.length,1);
  await page.getByRole('button',{name:'Show worked answer',exact:true}).click();await flush();await page.screenshot({path:resolve(directory,'desktop-structured-correction.png'),fullPage:true});
  await page.reload();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId===id,first.attempt.attemptId);await flush();const restored=await snap();assert.equal(JSON.stringify(restored.attempt.firstResponse),frozen);assert.equal(restored.history.length,1);
  await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snap();assert.equal(next.attempt.phase,'answering');assert.notEqual(next.question.ref.questionId,source.question.ref.questionId);assert.equal(next.attempt.assistance.length,0);
  return {source:source.question.ref,firstScore:0.5,firstTimeMs:first.attempt.firstResponse.timing.activeMs,correctedWithoutNewEvidence:true,nextRef:next.question.ref};
 });
 await scenario('revision-add-all-pause-reload-next',async()=>{
  await open('revision','&session=revision');await page.getByRole('button',{name:'ADD ALL u6-t1-1',exact:true}).click();assert.equal((await snap()).selectedCount,15);await start('u6-t1-1-2:1');await fill('wrong');await page.getByRole('button',{name:'Pause',exact:true}).click();await flush();const paused=await snap();assert.equal(paused.session.status,'paused');
  await page.reload();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId===id,paused.attempt.attemptId);await flush();const restored=await snap();assert.deepEqual(restored.attempt.currentResponses,paused.attempt.currentResponses);assert.equal(restored.session.status,'paused');
  await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await fill('correct');await check();const first=await snap();assert.equal(first.history.length,1);assert.equal(first.session.current.completed,true);await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snap();assert.notEqual(next.attempt.target.gemId,first.attempt.target.gemId);assert.equal(next.attempt.phase,'answering');await page.screenshot({path:resolve(directory,'revision-next.png'),fullPage:true});
  return {selected:15,restoredAttempt:paused.attempt.attemptId,first:first.question.ref,next:next.question.ref,rotation:[first.attempt.target.gemId,next.attempt.target.gemId]};
 });
 await scenario('teacher-readonly-no-evidence-mobile',async()=>{
  await open('teacher','&mode=teacher');await page.getByLabel('Target',{exact:true}).selectOption('u6-t1-1-7:3');await page.getByRole('heading',{name:'Alkali volume for target pH',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Start practice',exact:true}).isDisabled(),true);assert.equal(await page.getByLabel(/Your answer/).isEditable(),false);assert.equal((await snap()).attempt,null);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);
  await page.screenshot({path:resolve(directory,'desktop-application-teacher.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:resolve(directory,'mobile-application-teacher.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  await page.setViewportSize({width:1366,height:1000});return {attempts:0,evidence:0,readOnly:true,mobileOverflow:false};
 });
 await scenario('current-and-historical-review-links-readonly',async()=>{
  const history=JSON.parse(readFileSync(resolve(project,'../../development/tests/fixtures/acid-legacy-reviews.json'),'utf8')).questions;
  const codes=['AB2-0-1-0',history.find(item=>item.reviewId.startsWith('AB-')).reviewId,history.find(item=>item.reviewId.startsWith('ABL-'))?.reviewId].filter(Boolean);
  for(const code of codes){await open('review',`&review=${encodeURIComponent(code)}`);await page.getByText('Review · read only',{exact:true}).waitFor();await page.getByText(code,{exact:true}).waitFor();assert.equal((await snap()).attempt,null);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);assert.equal(await page.getByRole('heading',{name:'Worked answer',exact:true}).count(),1);assert.equal(await page.getByLabel(/Your answer/).first().isEditable(),false);}
  await page.screenshot({path:resolve(directory,'historical-review.png'),fullPage:true});return {codes,attempts:0,evidence:0};
 });
 if(!ordinary)await scenario('real-idle-cutoff-background-pause-first-stop',async()=>{
  await open('timing');let current;
  for(let i=0;i<30;i++){current=await start('u6-t1-1-2:1');if(current.attempt.timing.idleLimitMs===60000)break;}
  assert.equal(current.attempt.timing.idleLimitMs,60000);await page.bringToFront();assert.equal(await page.evaluate(()=>document.visibilityState),'visible');await flush();
  await page.waitForTimeout(31000);await page.waitForTimeout(31000);await page.evaluate(()=>window.__mastersActivity.checkpoint());await flush();const idle=(await snap()).attempt.timing.activeMs;assert(idle>=59500&&idle<=62000);
  await page.waitForTimeout(1500);await page.evaluate(()=>window.__mastersActivity.checkpoint());await flush();assert(Math.abs((await snap()).attempt.timing.activeMs-idle)<100);
  const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();assert.equal(await page.evaluate(()=>document.visibilityState),'hidden');await page.waitForTimeout(1700);await page.bringToFront();await page.evaluate(()=>window.__mastersActivity.checkpoint());await flush();assert(Math.abs((await snap()).attempt.timing.activeMs-idle)<250);await other.close();
  await fill('correct');await page.waitForTimeout(1200);await check();const first=await snap(),frozenTime=first.attempt.firstResponse.timing.activeMs;assert(frozenTime>idle);assert.equal(first.history[0].timing.activeMs,frozenTime);await page.waitForTimeout(1300);await page.evaluate(()=>window.__mastersActivity.checkpoint());await flush();assert.equal((await snap()).attempt.firstResponse.timing.activeMs,frozenTime);assert.equal((await snap()).history.length,1);
  return {idleAllowance:60000,idleActiveMs:idle,firstAssessmentTime:frozenTime,hiddenTabObserved:true,noBackgroundAccrual:true,stoppedAtFirstAssessment:true};
 });
 await scenario('no-old-browser-store-writes',async()=>{assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);const dbs=await page.evaluate(()=>indexedDB.databases());assert(dbs.every(db=>db.name.startsWith('masters-of-chemistry-')));return {databases:dbs.map(db=>db.name),localStorageKeys:[]};});
}finally{
 const report={status:results.every(result=>result.status==='PASS')&&!errors.length?'PASS':'FAIL',checkedAt:new Date().toISOString(),playwright:'1.62.1',browser:context.browser()?.version()??'Edge persistent context',profile,host:'Actual production ActivityHost with real acid provider/marking/controller/clock/Dexie/revision scheduler; DEV harness only reads/checkpoints the actual runtime',results,pageErrors:errors};
 writeFileSync(resolve(directory,ordinary?'ordinary-browser-results.json':'browser-results.json'),JSON.stringify({...report,nativeForeground:!ordinary,connection:ordinary?'Pinned Playwright headless Edge; genuine native idle/background reviewed separately by A07':'CDP noDefaults:true; no Playwright focus emulation',...(ordinary?{pendingNativeReview:'validation/s2/review-native (A07; foreman-owned acceptance)'}:{})},null,2)+'\n');if(browser)await browser.close();else await context.close();browserProcess?.kill();console.log(JSON.stringify(report));
 if(report.status!=='PASS')process.exitCode=1;
}
