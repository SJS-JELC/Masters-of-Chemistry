import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium,projectRoot} from './browser/paths.mjs';
import {restoreRateExample} from '../src/activities/alevel/rate-equations/provider.ts';
const base=process.env.RATE_APP_URL||'http://127.0.0.1:5261';
const out=path.join(projectRoot,'.artifacts/rate-equations-integration/browser');
fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
fs.mkdirSync(path.join(out,'.tmp'),{recursive:true});process.env.TEMP=path.join(out,'.tmp');process.env.TMP=process.env.TEMP;
const report={status:'RUNNING',startedAt:new Date().toISOString(),url:base,checks:[],failures:[],pageErrors:[],screenshots:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});report.browser=browser.version();
const gems=['orders','graphs','mechanisms','arrhenius'];
const context=await browser.newContext({viewport:{width:1440,height:1050}});
const page=await context.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message));
const snapshot=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
const flush=async()=>{await page.evaluate(()=>window.__mastersActivity.flush());await page.waitForFunction(()=>window.__mastersActivity?.snapshot().saveStatus.kind==='saved');};
const open=async(gem,level,run)=>{await page.goto(`${base}/?course=alevel&run=${run}&view=practice&activity=alevel%2Frate-equations&gem=u6-t1-2-${gem}&level=${level}&fresh=1`);await page.locator('.question-player').waitFor();await flush();};
const shot=async name=>{const file=path.join(out,'screenshots',name+'.png');await page.screenshot({path:file,fullPage:true});report.screenshots.push(path.relative(projectRoot,file).replaceAll('\\','/'));};
async function answer(example){for(let i=0;i<example.question.parts.length;i++){
 const part=example.question.parts[i],response=example.correctResponses[part.id],surface=page.locator('.question-part').nth(i);
 if(response.kind==='text'||response.kind==='numeric')await surface.locator('input[data-answer-input]').fill(response.kind==='text'?response.value:response.raw);
 else if(response.kind==='choice')for(const id of response.selected)await surface.getByRole('radio').nth(part.options.findIndex(o=>o.id===id)).click();
}await flush();}
async function check(name,fn){try{report.checks.push({name,status:'PASS',...await fn()});console.log('PASS '+name);}catch(e){report.failures.push({name,error:e.stack});console.log('FAIL '+name+' '+e.message);await shot('failure-'+name.replaceAll(/[^a-z0-9]+/gi,'-')).catch(()=>{});}fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');}
try{
 for(const gem of gems)for(const level of [1,2,3])await check(gem+' L'+level+' practice score and fresh Next',async()=>{
  await open(gem,level,'rate-'+gem+'-'+level+'-'+Date.now());
  const first=await snapshot(),example=restoreRateExample(first.question.ref);
  assert.equal(first.attempt.target.gemId,'u6-t1-2-'+gem);assert.equal(first.attempt.ref.level,level);assert.equal(first.attempt.timing.idleLimitMs,300000);
  assert.equal(await page.locator('.rate-graph-assessed').count(),0);
  await answer(example);await page.getByRole('button',{name:'Check',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');await flush();
  const assessed=await snapshot(),history=await page.evaluate(()=>window.__mastersActivity.history());assert.equal(history.length,1);assert.equal(history[0].score,1);assert.equal(assessed.attempt.firstAssessment.marks.earned,assessed.attempt.firstAssessment.marks.available);assert.deepEqual(history[0].timing,assessed.attempt.firstResponse.timing);
  if(level===3||gem==='graphs'&&level===2)await shot(gem+'-L'+level+'-desktop');
  await page.reload();await page.locator('.question-player').waitFor();await flush();const restored=await snapshot();assert.equal(restored.attempt.attemptId,first.attempt.attemptId);assert.deepEqual(restored.attempt.firstAssessment,assessed.attempt.firstAssessment);assert.deepEqual((await page.evaluate(()=>window.__mastersActivity.history()))[0].timing,history[0].timing);
  await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snapshot();assert.equal(next.attempt.phase,'answering');assert.equal(next.attempt.target.level,level);assert.equal(next.attempt.workspace,undefined);assert.equal(next.history.length,1);
  return {questionId:first.attempt.ref.questionId,seed:first.attempt.ref.seed,marks:history[0].rawMarks,activeMs:history[0].timing.activeMs,firstAttempt:first.attempt.attemptId,nextAttempt:next.attempt.attemptId};
 });
 await check('graph marker pins and numeric answer reload restore',async()=>{
  await open('graphs',2,'rate-graph-restore-'+Date.now());await page.getByLabel(/^Marker time/).fill('12');await page.getByRole('button',{name:'Pin reading 1',exact:true}).click();await page.getByLabel(/^Marker time/).fill('24');await page.getByRole('button',{name:'Pin reading 2',exact:true}).click();await page.locator('.question-part').first().locator('input[data-answer-input]').fill('12');await flush();const saved=await snapshot();assert(saved.attempt.workspace);await page.reload();await page.locator('.rate-graph-tools').waitFor();await flush();const restored=await snapshot();assert.equal(restored.attempt.attemptId,saved.attempt.attemptId);assert.deepEqual(restored.attempt.currentResponses,saved.attempt.currentResponses);assert.deepEqual(restored.attempt.workspace,saved.attempt.workspace);assert.equal(await page.getByLabel(/^Marker time/).inputValue(),'24');await shot('graphs-restored');return {workspace:saved.attempt.workspace};
 });
 await check('Arrhenius true intercept extension reload restore',async()=>{
  await open('arrhenius',3,'rate-arrhenius-restore-'+Date.now());await page.getByLabel('Extend the line to 1/T = 0').check();await page.getByRole('slider',{name:'Arrhenius coordinate marker',exact:true}).focus();await page.keyboard.press('Home');await flush();const saved=await snapshot();assert(saved.attempt.workspace?.extended);await page.reload();await page.locator('.rate-graph-tools').waitFor();await flush();assert.deepEqual((await snapshot()).attempt.workspace,saved.attempt.workspace);assert.equal(await page.getByLabel('Extend the line to 1/T = 0').isChecked(),true);await shot('arrhenius-intercept-restored');return {workspace:saved.attempt.workspace};
 });
 await check('four map leaves and rate topic ADD ALL revision',async()=>{
  await page.goto(`${base}/?course=alevel&run=rate-revision-${Date.now()}`);await page.locator('.original-landing.alevel').waitFor();for(const gem of gems)assert.equal(await page.locator(`[data-leaf="u6-t1-2-${gem}"]`).count(),1);for(const n of [1,2,3,4,5,6,7])assert.equal(await page.locator(`[data-leaf="u6-t1-2-${n}"]`).count(),0);
  await page.getByRole('switch',{name:'Upper Sixth',exact:true}).click();await page.getByRole('button',{name:'Revision',exact:true}).click();await page.locator('[data-topic="u6-t1-topic-2"] .topic-trigger').click();await page.getByRole('button',{name:'Add all available gems in Rate Equations',exact:true}).click();assert.equal(await page.locator('#testSelectionCount').innerText(),'4 gems selected');await page.getByRole('button',{name:'Go: start revision',exact:true}).click();await page.locator('.question-player').waitFor();await flush();const first=await snapshot();assert.equal(first.session.kind,'revision');assert.equal(first.session.levels.length,12);assert.deepEqual([...first.session.selectedGemIds].sort(),gems.map(g=>'u6-t1-2-'+g).sort());
  await answer(restoreRateExample(first.question.ref));await page.getByRole('button',{name:'Check',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');await flush();await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snapshot();await page.reload();await page.locator('.question-player').waitFor();await flush();assert.equal((await snapshot()).attempt.attemptId,next.attempt.attemptId);return {levelTargets:first.session.levels.length,firstTarget:first.attempt.target,nextTarget:next.attempt.target};
 });
 await check('teacher graph tools isolated from pupil evidence',async()=>{
  const run='rate-teacher-'+Date.now();await page.goto(`${base}/?course=alevel&run=${run}&view=teacher&activity=alevel%2Frate-equations&review=RATE-POC-graphs-L2`);await page.locator('.mode-notice').waitFor();await page.locator('.rate-graph-tools').waitFor();await page.getByLabel(/^Marker time/).fill('12');await page.getByRole('button',{name:'Pin reading 1',exact:true}).click();const state=await snapshot();assert.equal(state.attempt,null);assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);assert.equal(await page.getByRole('button',{name:'Check',exact:true}).count(),0);await shot('teacher-graphs');return {attempt:null,history:0};
 });
 await check('mobile graph labels scrolling keyboard and typed controls',async()=>{
  await page.setViewportSize({width:390,height:844});await open('graphs',2,'rate-mobile-'+Date.now());await page.getByRole('slider',{name:'Concentration–time marker',exact:true}).focus();await page.keyboard.press('End');await page.keyboard.press('ArrowLeft');await flush();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('.rate-graph-coordinate-box').count(),1);await shot('graphs-mobile');await open('orders',2,'rate-mobile-orders-'+Date.now());await page.locator('[data-rate-input="rate-law"]').fill('rate=k[A]2[B]1');assert.match(await page.locator('[data-rate-input="rate-law"]').inputValue(),/[¹²]/);await shot('orders-mobile-typed');await page.setViewportSize({width:1440,height:1050});return {viewport:'390x844',pageOverflow:false};
 });
 await check('native pointer drag checkpoints on release and restores',async()=>{
  await open('graphs',1,'rate-drag-'+Date.now());const first=await snapshot();
  const slider=page.getByRole('slider',{name:/^Concentration/});await slider.scrollIntoViewIfNeeded();const initialMarker=Number(await slider.getAttribute('aria-valuenow'));
  const box=await slider.boundingBox();assert(box);const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+90,y-12,{steps:8});
  const mid=await snapshot();assert.equal(mid.attempt.workspace,undefined,'Live drag must remain local');
  await page.mouse.up();await flush();const saved=await snapshot();assert(saved.attempt.workspace);assert(saved.attempt.workspace.marker>initialMarker,'Dragging right must move the analytical marker forward');
  await page.reload();await page.locator('.rate-graph-tools').waitFor();await flush();assert.deepEqual((await snapshot()).attempt.workspace,saved.attempt.workspace);return {workspace:saved.attempt.workspace};
 });
 await check('isolated native Dexie workspace transaction roundtrips',async()=>{
  const result=await page.evaluate(async()=>
   (await import('/scripts/tests/rate-equations-workspace.browser.ts')).runRateWorkspacePersistence());
  assert.equal(result.checks.length,8);return result;
 });
}finally{report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures,pageErrors:report.pageErrors}));if(report.status==='FAIL')process.exitCode=1;}
