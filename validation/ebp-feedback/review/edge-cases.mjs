import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { propertiesBank } from '../../../src/activities/alevel/explaining-properties/bank.ts';
const here=import.meta.dirname, base='http://127.0.0.1:5203',run='feedback-'+Date.now();
const report={status:'RUNNING',run,startedAt:new Date().toISOString(),method:'Pinned workspace Playwright 1.62.1, headless Microsoft Edge, real shared host/controller/storage and browser inputs; no synthetic timing.',checks:[],failures:[],pageErrors:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Europe/London'});
const page=await context.newPage();page.on('pageerror',error=>report.pageErrors.push(error.message));
const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
const flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
const check=async()=>{await page.getByRole('button',{name:'Check',exact:true}).click();await flush();};
async function ready(){await page.waitForFunction(()=>window.__mastersActivity);await page.waitForFunction(()=>window.__mastersActivity.snapshot().saveStatus.kind!=='saving');}
async function shot(name){await page.screenshot({path:path.join(here,name+'.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Document overflow');}
async function fixture(code,suffix='',kind='practice',historicalHint=false){
 const record=propertiesBank.find(item=>item.code===code);assert(record);
 await page.goto(`${base}/alevel.html?run=${run}-${suffix||code}&view=${kind}&activity=alevel/explaining-properties`);await ready();
 await page.evaluate(async ({code,level,kind,historicalHint})=>{
  const {productionRegistry}=await import('/src/foundation/registry.ts');const {createChemistryRepository}=await import('/src/persistence/index.ts');
  const registration=productionRegistry.get('alevel/explaining-properties'),provider=await registration.provider(),ref=provider.resolveLink(code),q=provider.restore(ref),namespace={course:'alevel',profileId:'local'},target={course:'alevel',activityId:registration.id,gemId:registration.gems[0].id,level},id=crypto.randomUUID();
  let session={kind:'practice',namespace,id:'current-session',target,selection:'fixed-level',currentAttemptId:id,previousQuestionIds:[],paused:false};
  if(kind==='revision'){const {createRevisionSession,revisionScheduler,bindRevisionQuestion}=await import('/src/domain/session/revision.ts');const selected=[1,2].map(level=>({...target,level})),summaries=selected.map(t=>({gemId:t.gemId,level:t.level,score:level===2&&t.level===1?1:null,count:level===2&&t.level===1?5:0,mastered:level===2&&t.level===1,lastCompletedAt:level===2&&t.level===1?Date.now():null}));session=createRevisionSession({namespace,id:'current-session',selected,settings:registration.gems.map(gem=>gem.mastery),summaries,now:Date.now()});if(level===2)session={...session,levels:session.levels.map(item=>item.target.level===1?{...item,confirmedAt:Date.now(),streak:1}:item)};session=revisionScheduler.next(session,summaries,Date.now(),id);session=bindRevisionQuestion(session,ref);}
  const attempt={mode:'student',namespace,attemptId:id,ref,target,currentResponses:{},assistance:historicalHint?[{kind:'hint',supportId:'properties-hint',at:Date.now()}]:[],phase:'answering',timing:{attemptId:id,activeMs:0,idleLimitMs:registration.idleAllowance(q),finished:false}};
  const result=await createChemistryRepository(window.__mastersActivity.snapshot().databaseName).saveCurriculum({attempt,session});if(!result.ok)throw Error(result.error.message);
 },{code,level:record.level,kind,historicalHint});
 await page.reload();await ready();await page.waitForFunction(code=>window.__mastersActivity.snapshot().attempt?.ref.questionId===code,code);
 if(await page.getByRole('button',{name:'Resume saved attempt',exact:true}).count())await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();
 await page.locator('.question-player').waitFor();await flush();return record;
}
async function reload(){await page.reload();await ready();if(await page.getByRole('button',{name:'Resume saved attempt',exact:true}).count())await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await page.locator('.question-player').waitFor();await flush();}
async function fill(record,wrong=false){
 if(record.format==='gaps'){for(let i=0;i<record.answers.length;i++)await page.locator('.inline-gap input').nth(i).fill(wrong?'wrong response':record.answers[i][0]);}
 else {await page.locator(`[data-error-id="phrase-${record.errorIndex}"]`).click();await page.getByLabel('Replacement / correction',{exact:true}).fill(wrong?'wrong replacement':record.answers[0][0]);}
 await flush();
}
async function clean(){assert.equal(await page.locator('.assessment-feedback,.correction-feedback,.hint-panel,.question-parts .marks,.properties-correction legend').count(),0);assert.equal(await page.getByRole('button',{name:'Request hint',exact:true}).count(),0);assert(!await page.locator('.question-player').innerText().then(text=>/Complete each gap|Complete the explanation|Your response|Learning correction check|First assessment|marks remain fixed/.test(text)));}
async function ideal(shown){assert.equal(await page.getByRole('heading',{name:'Ideal answer',exact:true}).count(),shown?1:0);if(shown)assert(await page.locator('.question-parts').evaluate(el=>el.nextElementSibling?.classList.contains('worked-answer')));}
async function runCheck(id,fn){try{await fn();report.checks.push({id,status:'PASS'});console.log('PASS '+id);}catch(error){report.failures.push({id,error:error.stack});await shot('failure-'+id).catch(()=>{});console.log('FAIL '+id+' '+error.message);}}
report.method += ' Independent additional reviewer assertions; start helpers copied from author fixture only.';
try {
 await runCheck('all32-checked-accessibility-restoration', async () => {
  for(const item of propertiesBank) {
   const record=await fixture(item.code,'all32-'+item.code);
   await fill(record,true);await check();await ideal(false);
   const first=await snap(), history=await page.evaluate(()=>window.__mastersActivity.history());
   await fill(record);await check();await ideal(true);await reload();await ideal(true);
   const expected=record.format==='gaps'?record.answers.length:2;
   assert.equal(await page.locator('[data-response-status="correct"]').count(),expected,record.code);
   assert.equal(await page.locator('[data-response-status="incorrect"]').count(),0,record.code);
   const fields=await page.locator('input[data-response-status],textarea[data-response-status]').evaluateAll(els=>els.map(el=>({label:el.getAttribute('aria-label'),description:document.getElementById(el.getAttribute('aria-describedby'))?.textContent,invalid:el.getAttribute('aria-invalid'),border:getComputedStyle(el).borderTopWidth})));
   assert(fields.every(f=>f.label&&f.description?.includes('Correct')&&f.invalid===null&&f.border==='2px'),record.code+' accessible field results');
   if(record.format==='correction') {
    assert.equal(await page.locator('button[data-response-status]').count(),1);
    assert.match(await page.locator('button[data-response-status]').getAttribute('aria-label'),/correct selection/);
    assert.equal(await page.locator('button[data-error-id]:not([data-response-status])').count(),record.sentence.match(/\[[^\]]+\]/g).length-1);
   }
   assert.deepEqual((await snap()).attempt.firstResponse,first.attempt.firstResponse);
   assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);
   assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);
   await clean();
  }
 });
 await runCheck('check-edit-burst-restores-neutral-not-stale',async()=>{
  const record=await fixture('EBP-K7M2Q9','burst');await fill(record,true);await check();const first=await snap();
  await fill(record);await page.evaluate(()=>document.querySelector('[data-question-action="check"]').click());
  await page.locator('.inline-gap input').first().fill('wrong response');
  await flush();await ideal(false);assert.equal(await page.locator('[data-response-status]').count(),0);
  await reload();await ideal(false);assert.equal(await page.locator('[data-response-status]').count(),0);
  await check();await reload();assert.equal(await page.locator('[data-response-status="incorrect"]').count(),1);
  assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);
  assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,1);
 });
 await runCheck('incomplete-retry-clear-and-restoration',async()=>{
  const record=await fixture('EBP-C6R2Y8','incomplete');await fill(record,true);await check();const first=await snap();
  await page.getByLabel('Replacement / correction',{exact:true}).fill('');await check();await ideal(false);
  assert.equal(await page.locator('[data-response-status]').count(),0);
  await reload();await ideal(false);assert.equal(await page.locator('[data-response-status]').count(),0);
  assert(await page.locator('.validation-issue').count()>0);
  await page.getByRole('button',{name:'Clear',exact:true}).click();await flush();await check();await reload();
  assert.equal(await page.locator('button[aria-pressed="true"]').count(),0);await ideal(false);
  assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);
 });
 await runCheck('checked-save-failure-retry-without-extra-evidence',async()=>{
  const record=await fixture('EBP-K7M2Q9','save-failure');await fill(record,true);await check();const first=await snap(),history=await page.evaluate(()=>window.__mastersActivity.history());
  await fill(record);await flush();
  await page.evaluate(()=>{window.__reviewOriginalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='attempts')throw new DOMException('Independent review save-failure injection','QuotaExceededError');return window.__reviewOriginalPut.apply(this,args);};});
  try {
   await check();await page.waitForFunction(()=>window.__mastersActivity.snapshot().saveStatus.kind==='error');
   await ideal(true);assert(await page.getByRole('button',{name:'Next',exact:true}).isDisabled());
   await shot('save-failure');
  } finally {
   await page.evaluate(()=>{IDBObjectStore.prototype.put=window.__reviewOriginalPut;delete window.__reviewOriginalPut;});
  }
  await page.getByRole('button',{name:'Retry save',exact:true}).click();await flush();
  assert.equal((await snap()).saveStatus.kind,'saved');await reload();await ideal(true);
  assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);
  assert.deepEqual((await snap()).attempt.firstResponse,first.attempt.firstResponse);
  assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);
 });
 await runCheck('give-up-edit-clear-current-ui-observation',async()=>{
  await fixture('EBP-I5B9S3','giveup-observation');await page.getByRole('button',{name:'Give Up',exact:true}).click();await flush();await ideal(true);
  await page.getByLabel('Replacement / correction',{exact:true}).fill('wrong');await flush();
  const afterEdit={idealCount:await page.getByRole('heading',{name:'Ideal answer',exact:true}).count(),state:(await snap()).attempt};
  await page.getByRole('button',{name:'Clear',exact:true}).click();await flush();await reload();
  report.giveUpObservation={afterEdit,afterClear:{idealCount:await page.getByRole('heading',{name:'Ideal answer',exact:true}).count(),state:(await snap()).attempt}};
  assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);
  await shot('giveup-clear');
 });
} finally {
 report.finishedAt=new Date().toISOString();report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';
 fs.writeFileSync(path.join(here,'edge-cases-results.json'),JSON.stringify(report,null,2)+'\n');
 await context.close();await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures,pageErrors:report.pageErrors}));if(report.status!=='PASS')process.exitCode=1;
}
