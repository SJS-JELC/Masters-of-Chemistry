import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
const project=path.resolve(directory,'../../..');
const require=createRequire(path.resolve(project,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright');
const profile=path.join(project,'.browser','a01-s1-'+Date.now().toString(36));
fs.mkdirSync(directory,{recursive:true});
const context=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:1280,height:900},args:['--no-first-run','--no-default-browser-check']});
const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const only=process.argv.includes('--revision-only');
const initial=only?JSON.parse(fs.readFileSync(path.join(directory,'browser-results-initial.json'),'utf8')):null;
const results=initial?initial.results.filter(result=>result.status==='PASS'):[];
const snap=()=>page.evaluate(()=>window.__mastersFoundation.snapshot());
const flush=()=>page.evaluate(()=>window.__mastersFoundation.flush());
async function open(course,kind,extra=''){
 await page.goto(`http://127.0.0.1:5181/${course}.html?run=a01-${kind}-${Date.now().toString(36)}&fixture=${kind}${extra}`);
 await page.waitForFunction(()=>window.__mastersFoundation!==undefined);
 await page.getByRole('button',{name:'Start fixture',exact:true}).isVisible();
}
async function start(){await page.getByRole('button',{name:'Start fixture',exact:true}).click();await page.waitForFunction(()=>window.__mastersFoundation.snapshot().attempt!==null);await flush();}
async function answer(value='42'){await page.getByLabel(/Your answer/).fill(value);await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.waitForFunction(()=>window.__mastersFoundation.snapshot().attempt?.phase==='assessed');await flush();}
async function scenario(id,operation){if(only&&id!=='alevel-revision-pause-restore-rotation-assistance')return;const began=Date.now();try{const evidence=await operation();results.push({id,status:'PASS',elapsedMs:Date.now()-began,evidence});}catch(error){results.push({id,status:'FAIL',elapsedMs:Date.now()-began,error:String(error.stack||error)});await page.screenshot({path:path.join(directory,`${id}-failure.png`),fullPage:true});}}
try{
 await scenario('practice-first-evidence-next',async()=>{
  await open('alevel','numeric');assert.equal((await snap()).attempt,null);await start();await page.waitForTimeout(1200);await answer();
  const first=await snap();assert.equal(first.history.length,1);assert.equal(first.attempt.firstAssessment.score,1);const firstFrozen=JSON.stringify(first.attempt.firstResponse),firstAssessment=JSON.stringify(first.attempt.firstAssessment),time=first.attempt.firstResponse.timing.activeMs;
  await page.getByLabel(/Your answer/).fill('41');await flush();await page.getByRole('button',{name:'Show worked answer',exact:true}).click();await flush();
  await page.reload();await page.waitForFunction(()=>window.__mastersFoundation?.snapshot().attempt?.phase==='assessed');await flush();
  const restored=await snap();assert.equal(restored.attempt.attemptId,first.attempt.attemptId);assert.equal(restored.attempt.currentResponses.answer.raw,'41');assert.equal(JSON.stringify(restored.attempt.firstResponse),firstFrozen);assert.equal(JSON.stringify(restored.attempt.firstAssessment),firstAssessment);assert.equal(restored.history.length,1);
  await page.screenshot({path:path.join(directory,'alevel-first-evidence.png'),fullPage:true});
  await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersFoundation.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();
  const next=await snap();assert.equal(next.attempt.phase,'answering');assert(next.attempt.timing.activeMs<time||time===0);assert.notEqual(next.attempt.ref.questionId,first.attempt.ref.questionId);
  await page.reload();await page.waitForFunction(id=>window.__mastersFoundation?.snapshot().attempt?.attemptId===id,next.attempt.attemptId);assert.equal((await snap()).history.length,1);
  return {firstAttempt:first.attempt.attemptId,nextAttempt:next.attempt.attemptId,firstActiveMs:time,records:1,firstResponseAndResultUnchanged:true};
 });
 await scenario('alevel-revision-pause-restore-rotation-assistance',async()=>{
  await open('alevel','numeric','&session=revision');await page.getByRole('button',{name:'ADD ALL u6-t1-1',exact:true}).click();assert.equal((await snap()).selectedCount,17);await start();
  await page.getByLabel(/Your answer/).fill('40');await page.getByRole('button',{name:'Pause',exact:true}).click();await flush();const paused=await snap();assert.equal(paused.session.status,'paused');
  await page.reload();await page.waitForFunction(()=>window.__mastersFoundation?.snapshot().attempt!=null);assert.equal((await snap()).attempt.attemptId,paused.attempt.attemptId);assert.equal((await snap()).attempt.currentResponses.answer.raw,'40');
  await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await answer('40');const first=await snap();assert.equal(first.history.length,1);assert.equal(first.attempt.firstAssessment.score,0);assert.equal(first.session.current.completed,true);
  const oldGem=first.session.current.target.gemId;await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersFoundation.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snap();assert.notEqual(next.session.current.target.gemId,oldGem);
  await page.getByRole('button',{name:'Request hint',exact:true}).click();await answer();const assisted=await snap();assert.equal(assisted.history.length,1);assert(assisted.attempt.firstResponse.assistance.length>0);assert.equal(assisted.session.levels.find(level=>level.target.gemId===assisted.attempt.target.gemId&&level.target.level===assisted.attempt.target.level).streak,0);
  return {selectedLevels:17,pausedAttemptRestored:true,rotation:[oldGem,next.session.current.target.gemId],assistanceAddsEvidence:false};
 });
 await scenario('igcse-revision-grade-and-scope',async()=>{
  await open('igcse','numeric','&session=revision');await page.getByRole('button',{name:'ADD ALL lower-10',exact:true}).click();assert.equal((await snap()).selectedCount,10);await start();await answer();
  const result=await snap();assert.equal(result.history.length,1);assert.equal(result.history[0].course,'igcse');assert.equal(result.history[0].grade,result.attempt.target.level);assert.equal('level' in result.history[0],false);assert.equal(result.history[0].timing.activeMs,result.attempt.firstResponse.timing.activeMs);
  await page.screenshot({path:path.join(directory,'igcse-revision.png'),fullPage:true});return {selectedLevels:10,grade:result.history[0].grade,timingTransferred:true};
 });
 await scenario('excessive-valence-assessed-and-persisted',async()=>{
  await open('alevel','editor');await start();await page.getByRole('button',{name:'Set excessive-valence drawing',exact:true}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.waitForFunction(()=>window.__mastersFoundation.snapshot().attempt?.phase==='assessed');await flush();
  const result=await snap();assert.equal(result.attempt.firstAssessment.score,0);assert.equal(result.history.length,1);assert.equal(result.attempt.firstResponse.responses.answer.graph.bonds.length,5);assert.equal(result.saveStatus.kind,'saved');return {chemicallyWrong:true,structurallyValid:true,assessedScore:0,persisted:true};
 });
 await scenario('teacher-preview-no-evidence',async()=>{
  await open('igcse','automatic-text','&mode=teacher');await page.waitForFunction(()=>window.__mastersFoundation.snapshot().question===null);assert.equal(await page.getByRole('button',{name:'Start fixture',exact:true}).isDisabled(),true);assert.equal(await page.getByLabel('Your answer', {exact:true}).isEditable(),false);assert.equal((await snap()).attempt,null);assert.deepEqual(await page.evaluate(()=>window.__mastersFoundation.history()),[]);return {attempts:0,evidence:0,readonly:true};
 });
 await scenario('no-legacy-browser-writes',async()=>{
  const keys=await page.evaluate(()=>Object.keys(localStorage));assert.deepEqual(keys,[]);const databases=await page.evaluate(()=>indexedDB.databases());assert(databases.every(database=>database.name.startsWith('masters-of-chemistry-')));return {localStorageKeys:keys,databases:databases.map(database=>database.name)};
 });
}finally{
 const report={status:results.every(result=>result.status==='PASS')&&!errors.length?'PASS':'FAIL',checkedAt:new Date().toISOString(),...(only?{boundedRetry:'Only failed Alevel revision scenario rerun after correcting expected supported target count from15 to17 (five acid gems + titration). Other PASS results retained unchanged from browser-results-initial.json.',priorEvidence:'validation/s1/integration/browser-results-initial.json'}:{}),playwright:'1.62.1',browser:context.browser()?.version()||'persistent Edge',profile,scope:'Actual shared controller, active clock, Dexie and session in DEV-only fixture host; no complete migrated bank or hidden/background idle proof claimed here.',results,pageErrors:errors};
 fs.writeFileSync(path.join(directory,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await context.close();console.log(JSON.stringify({status:report.status,passed:results.filter(r=>r.status==='PASS').length,total:results.length,errors,report:'validation/s1/integration/browser-results.json'}));if(report.status!=='PASS')process.exitCode=1;
}
