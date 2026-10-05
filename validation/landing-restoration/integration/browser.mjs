import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const here = import.meta.dirname, project = path.resolve(here, '../../..');
const require = createRequire(path.join(project, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const temp = path.join(here, '.browser-tmp'); fs.mkdirSync(temp, { recursive: true }); process.env.TEMP = temp; process.env.TMP = temp;
const browser = await require('playwright').chromium.launch({ channel: 'msedge', headless: true });
const report = { startedAt: new Date().toISOString(), browser: await browser.version(), playwright: '1.62.1', sourceURL: 'http://127.0.0.1:5183', checks: [], failures: [], pageErrors: [] };
const base = 'http://127.0.0.1:5183';
async function open(course, run) {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    window.storageWrites = []; window.puts = []; window.failSave = false;
    for (const key of ['setItem', 'removeItem', 'clear']) { const original = Storage.prototype[key]; Storage.prototype[key] = function(...args) { window.storageWrites.push([key,...args]); return original.apply(this,args); }; }
    for (const name of ['put', 'add']) { const original = IDBObjectStore.prototype[name]; IDBObjectStore.prototype[name] = function(...args) { if (this.name === 'attempts' && window.failSave) throw new DOMException('Landing test actual save quota', 'QuotaExceededError'); window.puts.push({ table:this.name, value:structuredClone(args[0]) }); return original.apply(this,args); }; }
  });
  const page = await context.newPage(); page.on('pageerror', error => report.pageErrors.push({ run, error:error.message }));
  await page.goto(`${base}/${course}.html?course=${course}&run=${run}`); await page.locator('.original-landing').waitFor();
  return { context, page };
}
async function snapshot(page) { return page.evaluate(() => window.__mastersActivity.snapshot()); }
async function flush(page) { await page.evaluate(() => window.__mastersActivity.flush()); await page.getByText('Saved on this device', { exact:true }).waitFor(); }
async function rows(page, course, run) { return page.evaluate(async ({ course, run }) => { const db = await new Promise((resolve,reject) => { const r=indexedDB.open(`masters-of-chemistry-${course}-${run}`);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error); }); try { const result={}; for(const table of ['attempts','sessions','evidence']) result[table]=await new Promise((resolve,reject)=>{const r=db.transaction(table).objectStore(table).getAll();r.onsuccess=()=>resolve(r.result.map(row=>row.value));r.onerror=()=>reject(r.error);});return result; } finally{db.close();} }, {course,run}); }
async function gem(page, id) { await page.evaluate(id => { location.hash=id; }, id); await page.locator('#gemDetails').waitFor({state:'visible'}); }
async function check(name, fn) { try { const details=await fn(); report.checks.push({name,status:'PASS',...details}); console.log('PASS '+name); } catch(error) { report.failures.push({name,error:error.stack}); console.log('FAIL '+name+' '+error.message); } }
try {
for(const course of ['alevel','igcse']) await check(course+' fixed, mastery, fresh, Home, Back, storage and teacher', async()=>{
  const run='landing-'+course+'-'+Date.now(),{context,page}=await open(course,run);
  try {
    const metadata=await page.evaluate(async course=>{ const{productionRegistry}=await import('/src/foundation/registry.ts');return productionRegistry.curriculumFor(course).map(reg=>({activityId:reg.id,gems:reg.gems})); },course);
    const chosen=metadata.find(r=>r.activityId===(course==='alevel'?'alevel/acid-base-calculations':'igcse/calorimetry')).gems[0], nextLevel=chosen.supportedLevels[1];
    await gem(page,chosen.id); await page.locator(`a.practice-choice[data-practice="${nextLevel}"]`).click(); await page.locator('.question-player').waitFor();await flush(page);
    const fixed=await snapshot(page);assert.equal(fixed.attempt.target.gemId,chosen.id);assert.equal(fixed.attempt.ref.level,nextLevel);assert.equal(fixed.session.selection,'fixed-level');assert.equal(await page.locator('[aria-label="Practice setup"]').count(),0);
    await page.waitForTimeout(150);assert.equal((await rows(page,course,run)).attempts.length,1,'StrictMode created duplicate attempts');
    for(const part of fixed.question.parts){assert.equal(part.kind,'numeric');await page.evaluate(async({id,unit,raw})=>window.__mastersActivity.respond(id,{kind:'numeric',unit,raw}),{id:part.id,unit:part.unit,raw:String(part.acceptance.expected)});}await flush(page);await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.locator('.assessment-feedback').waitFor();await flush(page);assert.equal((await rows(page,course,run)).evidence.length,1);
    await page.screenshot({path:path.join(here,course+'-focused-home.png'),fullPage:true});await page.getByRole('button',{name:'Home',exact:true}).click();await page.locator('.original-landing').waitFor();const saved=await rows(page,course,run);assert.equal(saved.evidence.length,1);await page.waitForFunction(id=>document.querySelector('[data-leaf="'+id+'"]')?.getAttribute('data-freshness')==='fresh',chosen.id);assert.equal(saved.sessions[0].paused,true);assert.equal(saved.attempts[0].attemptId,fixed.attempt.attemptId);
    await gem(page,chosen.id);await page.locator(`a.practice-choice[data-practice="${nextLevel}"]`).click();await page.locator('.question-player').waitFor();await flush(page);const fresh=await snapshot(page);assert.notEqual(fresh.attempt.attemptId,fixed.attempt.attemptId);assert.equal((await rows(page,course,run)).attempts.length,2,'Fresh erased older attempt');
    await page.evaluate(()=>window.failSave=true);await page.getByRole('button',{name:'Home',exact:true}).click();await page.getByRole('button',{name:'Retry save',exact:true}).waitFor();assert.equal(await page.locator('.original-landing').count(),0);assert.equal(new URL(page.url()).searchParams.get('view'),'practice');
    await page.goBack();await page.waitForTimeout(300);assert.equal(await page.locator('.original-landing').count(),0);assert.equal(new URL(page.url()).searchParams.get('view'),'practice','Blocked Back failed to restore URL');
    await page.evaluate(()=>window.failSave=false);await page.getByRole('button',{name:'Retry save',exact:true}).click();await page.getByRole('button',{name:'Home',exact:true}).click();await page.locator('.original-landing').waitFor();
    // Current repository history seeds mastery; no original app records or keys are used.
    await page.evaluate(async ({course,run,chosen,activityId})=>{const{createChemistryRepository}=await import('/src/persistence/index.ts');const r=createChemistryRepository(`masters-of-chemistry-${course}-${run}`);const evidence={kind:'curriculum',provenance:'legacy-import',id:'landing-synthetic-mastered',sourceKey:'landing-synthetic',profileId:'local',course,activityId,gemId:chosen.id,score:1,completedAt:Date.now(),...(course==='alevel'?{level:chosen.supportedLevels[0]}:{grade:chosen.supportedLevels[0]})};const result=await r.importBatch({namespace:{course,profileId:'local'},source:{key:'landing-synthetic',fingerprint:'landing-fixture'},curriculum:Array.from({length:40},(_,index)=>({...evidence,id:evidence.id+'-'+index,completedAt:Date.now()-400+index,progressionVersion:chosen.mastery.activeProgressionVersion||1})),olympiad:[]});r.close();if(!result.ok)throw Error(JSON.stringify(result));},{course,run,chosen,activityId:fixed.attempt.ref.activityId});
    await page.reload();await page.locator('.original-landing').waitFor();await gem(page,chosen.id);await page.locator('a.practice-choice[data-practice="mastery"]').click();await page.locator('.question-player').waitFor();await flush(page);const mastery=await snapshot(page);assert.equal(mastery.session.selection,'mastery');assert.equal(mastery.attempt.ref.level,nextLevel);assert.equal((await rows(page,course,run)).evidence.length,41);const masteryId=mastery.attempt.attemptId;
    await page.reload();await page.locator('.question-player').waitFor();assert.equal((await snapshot(page)).attempt.attemptId,masteryId,'Reload relaunched consumed token');assert.equal((await rows(page,course,run)).attempts.length,3);
    await page.goBack();await page.locator('.original-landing').waitFor();assert.equal((await rows(page,course,run)).sessions[0].paused,true);
    if(course==='igcse') {await page.getByRole('button',{name:'Switch to teacher question selection',exact:true}).click();await gem(page,chosen.id);await page.locator('#activityLink').click();await page.locator('.teacher-answer').waitFor();assert.equal(await page.getByLabel('Teacher activity',{exact:true}).inputValue(),'igcse/calorimetry');await page.getByRole('button',{name:'Home',exact:true}).click();await page.locator('.original-landing').waitFor();}
    else{if(await page.locator('#gemDetails[open]').count())await page.getByRole('button',{name:'Close gem details',exact:true}).click();await page.getByRole('button',{name:'Teacher',exact:true}).click();await page.locator('.teacher-answer').waitFor();await page.getByRole('button',{name:'Home',exact:true}).click();await page.locator('.original-landing').waitFor();}
    const final=await rows(page,course,run);assert.equal(final.attempts.length,3);assert.equal(final.evidence.length,41);const writes=await page.evaluate(()=>window.storageWrites);assert(writes.every(row=>row[0]==='setItem'&&row[1].startsWith('masters-of-chemistry:landing:')));await page.screenshot({path:path.join(here,course+'-home.png'),fullPage:true});
    return {run,fixedId:fixed.attempt.attemptId,freshId:fresh.attempt.attemptId,masteryId,masteryLevel:mastery.attempt.ref.level,attemptCount:final.attempts.length,independentScorePreserved:final.evidence.length===41,homeFreshnessRefresh:true,teacherNoNewEvidence:true,saveFailureBlocksHomeAndBack:true,namespacedWrites:[...new Set(writes.map(row=>row[1]))]};
  }finally{await context.close();}
});
} finally {report.finishedAt=new Date().toISOString();report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;}




