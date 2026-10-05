import {chromium} from '../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {propertiesBank} from '../../src/activities/alevel/explaining-properties/bank.ts';
const here=import.meta.dirname,base='http://127.0.0.1:5197',run='ebp-'+Date.now();
const report={status:'RUNNING',run,startedAt:new Date().toISOString(),method:'Pinned workspace Playwright 1.62.1, actual headless Microsoft Edge; no synthetic clock for browser checks.',checks:[],failures:[],pageErrors:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Europe/London'});const page=await context.newPage();page.on('pageerror',error=>report.pageErrors.push(error.message));
const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot());const flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
async function ready(){await page.waitForFunction(()=>window.__mastersActivity);await page.waitForFunction(()=>window.__mastersActivity.snapshot().saveStatus.kind!=='saving');}
async function shot(name){await page.screenshot({path:path.join(here,name+'.png'),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Document overflow');}
async function fixture(code,suffix='',kind='practice'){
 const record=propertiesBank.find(item=>item.code===code);assert(record);
 await page.goto(`${base}/alevel.html?run=${run}-${suffix||code}&view=${kind}&activity=alevel/explaining-properties`);await ready();
 await page.evaluate(async ({code,level,kind})=>{
  const {productionRegistry}=await import('/src/foundation/registry.ts');const {createChemistryRepository}=await import('/src/persistence/index.ts');
  const registration=productionRegistry.get('alevel/explaining-properties'),provider=await registration.provider(),ref=provider.resolveLink(code),q=provider.restore(ref),namespace={course:'alevel',profileId:'local'},target={course:'alevel',activityId:registration.id,gemId:registration.gems[0].id,level},id=crypto.randomUUID();
  let session={kind:'practice',namespace,id:'current-session',target,selection:'fixed-level',currentAttemptId:id,previousQuestionIds:[],paused:false};
  if(kind==='revision'){const {createRevisionSession,revisionScheduler,bindRevisionQuestion}=await import('/src/domain/session/revision.ts');const selected=[1,2].map(level=>({...target,level})),summaries=selected.map(t=>({gemId:t.gemId,level:t.level,score:level===2&&t.level===1?1:null,count:level===2&&t.level===1?5:0,mastered:level===2&&t.level===1,lastCompletedAt:level===2&&t.level===1?Date.now():null}));session=createRevisionSession({namespace,id:'current-session',selected,settings:registration.gems.map(gem=>gem.mastery),summaries,now:Date.now()});if(level===2)session={...session,levels:session.levels.map(item=>item.target.level===1?{...item,confirmedAt:Date.now(),streak:1}:item)};session=revisionScheduler.next(session,summaries,Date.now(),id);session=bindRevisionQuestion(session,ref);}
  const attempt={mode:'student',namespace,attemptId:id,ref,target,currentResponses:{},assistance:[],phase:'answering',timing:{attemptId:id,activeMs:0,idleLimitMs:registration.idleAllowance(q),finished:false}};
  const result=await createChemistryRepository(window.__mastersActivity.snapshot().databaseName).saveCurriculum({attempt,session});if(!result.ok)throw Error(result.error.message);
 },{code,level:record.level,kind});
 await page.reload();await ready();await page.waitForFunction(code=>window.__mastersActivity.snapshot().attempt?.ref.questionId===code,code);
 if(await page.getByRole('button',{name:'Resume saved attempt',exact:true}).count())await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();
 await page.locator('.question-player').waitFor();await flush();return record;
}
async function fill(record,wrong=false){
 if(record.format==='gaps'){for(let i=0;i<record.answers.length;i++)await page.locator('.inline-gap input').nth(i).fill(wrong?'incorrect response':record.answers[i][0]);}
 else{await page.locator(`[data-error-id="phrase-${record.errorIndex}"]`).click();await page.getByLabel('Replacement / correction',{exact:true}).fill(wrong?'incorrect replacement':record.answers[0][0]);}
 await flush();
}
async function check(){await page.getByRole('button',{name:'Check',exact:true}).click();await page.locator('.assessment-feedback').waitFor();await flush();}
async function runCheck(id,fn){try{await fn();report.checks.push({id,status:'PASS'});console.log('PASS '+id);}catch(error){report.failures.push({id,error:error.stack});await shot('failure-'+id).catch(()=>{});console.log('FAIL '+id+' '+error.message);}}
try {
 for(const [code,format] of [['EBP-K7M2Q9','gaps'],['EBP-C6R2Y8','correction'],['EBP-S8L4J2','gaps'],['EBP-I5B9S3','correction']])await runCheck('render-'+code,async()=>{
  const record=await fixture(code);await shot('desktop-'+code);await page.setViewportSize({width:390,height:844});await shot('mobile-'+code);
  assert.equal(await page.locator('input,textarea').filter({visible:true}).count(),format==='gaps'?record.answers.length:1);
  if(format==='gaps'){const input=page.locator('.inline-gap input').first();await input.focus();await page.keyboard.type(record.answers[0][0]);await page.keyboard.press('Tab');assert(await page.locator('.inline-gap input').nth(1).evaluate(el=>el===document.activeElement));}
  else{await page.locator('[data-error-id="phrase-0"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-error-id="phrase-0"]').getAttribute('aria-pressed'),'true');}
  await page.setViewportSize({width:1440,height:1000});await fill(record);await check();assert.equal((await snap()).attempt.firstAssessment.marks.earned,format==='gaps'?record.answers.length:2);
 });
 for(const kind of ['practice','revision'])for(const code of ['EBP-H9C4F7','EBP-Y7H3M8','EBP-V6P3H9','EBP-X2G7V4'])await runCheck(kind+'-first-retry-'+code,async()=>{
  const record=await fixture(code,kind+'-'+code,kind);const started=await snap();await fill(record,true);await page.waitForTimeout(1100);await check();const first=await snap(),history=await page.evaluate(()=>window.__mastersActivity.history());
  assert.equal(history.length,1);assert.equal(first.attempt.firstAssessment.marks.earned,record.format==='gaps'?0:1);assert.deepEqual(history[0].timing,first.attempt.firstResponse.timing);
  await fill(record);await page.getByRole('button',{name:'Check',exact:true}).click();await page.locator('.correction-feedback').waitFor();await flush();assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);assert.deepEqual((await snap()).attempt.firstResponse,first.attempt.firstResponse);
  const saved=await snap(),returnURL=page.url();await page.getByRole('button',{name:'Back to course map',exact:true}).first().click();await page.getByRole('button',{name:/Explaining Properties.*practice available/}).waitFor();await page.goto(returnURL);await ready();await page.locator('.question-player').waitFor();assert.equal((await snap()).attempt.attemptId,started.attempt.attemptId);assert.deepEqual((await snap()).attempt.currentResponses,saved.attempt.currentResponses);
  await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snap();assert.equal(next.attempt.phase,'answering');assert(next.attempt.timing.activeMs<2000);assert.equal(next.attempt.ref.activityId,'alevel/explaining-properties');
  if(kind==='revision'){assert.equal(next.session.submittedAttemptIds.filter(id=>id===first.attempt.attemptId).length,1);}
 });
 for(const support of ['hint','reveal'])await runCheck('assistance-'+support,async()=>{
  const record=await fixture('EBP-W3B6L9',support);await page.getByRole('button',{name:support==='hint'?'Request hint':'Give Up',exact:true}).click();await flush();
  if(support==='hint'){await fill(record);await check();}else await page.locator('.worked-answer').waitFor();
  assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);assert((await snap()).attempt.assistance.length>0);await shot('assisted-'+support);
 });
 await runCheck('teacher-all-32',async()=>{
  await page.goto(`${base}/alevel.html?run=${run}-teacher&view=teacher&activity=alevel/explaining-properties`);await ready();await page.getByLabel('Teacher activity',{exact:true}).selectOption('alevel/explaining-properties');
  const chooser=page.getByLabel('Teacher question',{exact:true});await page.waitForFunction(()=>document.querySelector('[data-testid="teacher-catalogue-count"]')?.textContent.includes('32'));
  assert.equal(await chooser.locator('option').count(),33);
  for(const record of propertiesBank){const options=await chooser.locator('option').evaluateAll(options=>options.map(o=>({value:o.value,text:o.textContent})));const row=options.find(o=>o.text.includes(record.code));assert(row);await chooser.selectOption(row.value);await page.locator('.teacher-answer').waitFor();await page.waitForFunction(code=>document.body.textContent.includes(code),record.code);assert.equal(await page.locator('.question-parts input,.question-parts textarea').count(),0);}
  assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);await shot('teacher-final');
 });
 await runCheck('landing-identity-add-all',async()=>{
  await page.goto(`${base}/alevel.html?run=${run}-landing&view=home`);await page.getByRole('button',{name:/Explaining Properties.*practice available/}).waitFor();await shot('landing-properties');
  await page.getByRole('button',{name:/Explaining Properties.*practice available/}).click();await page.getByRole('link',{name:/Level 1/}).first().waitFor();await shot('landing-levels');
  await page.goto(`${base}/alevel.html?run=${run}-addall&view=revision`);await ready();await page.getByRole('button',{name:'ADD ALL l6-t2-1',exact:true}).click();assert.equal((await snap()).selectedCount,9); // Verify against actual course count below, never a display index.
 });
} finally {
 report.finishedAt=new Date().toISOString();report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await context.close();await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures,pageErrors:report.pageErrors}));if(report.status!=='PASS')process.exitCode=1;
}
