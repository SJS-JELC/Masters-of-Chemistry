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
try {
 for(const [code,kind] of [['EBP-K7M2Q9','practice'],['EBP-S8L4J2','revision']])await runCheck('gap-cycle-'+kind,async()=>{
  const record=await fixture(code,kind,kind);await clean();await ideal(false);
  const pane=await page.locator('.question-parts').boundingBox(),article=await page.locator('.question-player').boundingBox();assert(pane.width>750);assert(article.width-pane.width<100);
  await check();assert.equal((await snap()).attempt.phase,'answering');await ideal(false);
  await fill(record,true);await check();assert.equal(await page.locator('.inline-gap input[data-response-status="incorrect"]').count(),record.answers.length);await ideal(false);await clean();
  const first=await snap(),history=await page.evaluate(()=>window.__mastersActivity.history());assert.equal(history.length,1);
  await page.locator('.inline-gap input').first().fill(record.answers[0][0]);await flush();assert.equal(await page.locator('[data-response-status]').count(),0);await ideal(false);await reload();assert.equal(await page.locator('[data-response-status]').count(),0);await ideal(false);
  await check();assert.equal(await page.locator('.inline-gap input[data-response-status="correct"]').count(),1);await ideal(record.answers.length===1);await reload();assert.equal(await page.locator('.inline-gap input[data-response-status="correct"]').count(),1);
  await fill(record);await check();await ideal(true);assert.equal(await page.locator('.inline-gap input[data-response-status="correct"]').count(),record.answers.length);await reload();await ideal(true);
  const saved=await snap();assert.deepEqual(saved.attempt.firstAssessment,first.attempt.firstAssessment);assert.deepEqual(saved.attempt.firstResponse,first.attempt.firstResponse);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);
  await shot('desktop-'+code+'-correct');await page.setViewportSize({width:390,height:844});await shot('mobile-'+code+'-correct');await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button',{name:'Clear',exact:true}).click();await flush();await ideal(false);assert.equal(await page.locator('[data-response-status]').count(),0);await check();await ideal(false);await reload();await ideal(false);
  await page.getByRole('button',{name:'Give Up',exact:true}).click();await flush();await ideal(true);await reload();await ideal(true);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);
  await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity.snapshot().attempt?.attemptId!==id,first.attempt.attemptId);await flush();const next=await snap();assert.equal(next.attempt.phase,'answering');assert(next.attempt.timing.activeMs<2500);await ideal(false);if(kind==='revision')assert.equal(next.session.submittedAttemptIds.filter(id=>id===first.attempt.attemptId).length,1);
 });
 for(const [code,kind] of [['EBP-C6R2Y8','practice'],['EBP-I5B9S3','revision']])await runCheck('correction-cycle-'+kind,async()=>{
  const record=await fixture(code,kind+'-correction',kind);await clean();await ideal(false);
  await page.locator('[data-error-id="phrase-0"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-error-id="phrase-0"]').getAttribute('aria-pressed'),'true');assert(await page.locator('[data-error-id="phrase-0"]').evaluate(el=>getComputedStyle(el).outlineStyle!=='none'));
  const wrongIndex=(record.errorIndex+1)%3;await page.locator(`[data-error-id="phrase-${wrongIndex}"]`).click();await page.getByLabel('Replacement / correction',{exact:true}).fill(record.answers[0][0]);await check();
  assert.equal(await page.locator('button[data-response-status="incorrect"]').count(),1);assert.equal(await page.locator('button[data-error-id]:not([data-response-status])').count(),2);assert.equal(await page.getByLabel('Replacement / correction',{exact:true}).getAttribute('data-response-status'),'incorrect');await ideal(false);
  const first=await snap(),history=await page.evaluate(()=>window.__mastersActivity.history());
  await fill(record,true);assert.equal(await page.locator('[data-response-status]').count(),0);await check();assert.equal(await page.locator('button[data-response-status="correct"]').count(),1);assert.equal(await page.getByLabel('Replacement / correction',{exact:true}).getAttribute('data-response-status'),'incorrect');await ideal(false);await reload();assert.equal(await page.locator('button[data-response-status="correct"]').count(),1);await ideal(false);
  await shot('desktop-'+code+'-partial');await page.setViewportSize({width:390,height:844});await shot('mobile-'+code+'-partial');await page.setViewportSize({width:1440,height:1000});
  await fill(record);await check();await ideal(true);await reload();await ideal(true);assert.equal(await page.getByLabel('Replacement / correction',{exact:true}).getAttribute('data-response-status'),'correct');
  assert.deepEqual((await snap()).attempt.firstResponse,first.attempt.firstResponse);assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);
 });
 await runCheck('correct-first-edits-and-reload',async()=>{const record=await fixture('EBP-K7M2Q9','correct-first');await fill(record);await check();await ideal(true);const first=await snap();await reload();await ideal(true);await page.locator('.inline-gap input').first().fill('wrong');await flush();await ideal(false);await reload();await ideal(false);assert.equal(await page.locator('[data-response-status]').count(),0);await check();await ideal(false);await reload();await ideal(false);assert.equal(await page.locator('.inline-gap input[data-response-status="incorrect"]').count(),1);assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);});
 await runCheck('historical-hint-assistance-preserved',async()=>{const record=await fixture('EBP-K7M2Q9','historical-hint','practice',true);await clean();await fill(record);await check();await ideal(true);assert.equal((await snap()).attempt.assistance[0].supportId,'properties-hint');assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);await reload();await clean();assert.equal((await snap()).attempt.firstResponse.assistance[0].kind,'hint');});
 await runCheck('unanswered-give-up-reload-no-evidence',async()=>{await fixture('EBP-I5B9S3','reveal');await page.getByRole('button',{name:'Give Up',exact:true}).click();await flush();await ideal(true);assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);await reload();await ideal(true);assert.equal((await snap()).attempt.firstAssessment.kind,'revealed');});
 await runCheck('teacher-all32',async()=>{await page.goto(`${base}/alevel.html?run=${run}-teacher&view=teacher&activity=alevel/explaining-properties`);await ready();await page.getByLabel('Teacher activity',{exact:true}).selectOption('alevel/explaining-properties');const chooser=page.getByLabel('Teacher question',{exact:true});await page.waitForFunction(()=>document.querySelector('[data-testid="teacher-catalogue-count"]')?.textContent.includes('32'));const options=await chooser.locator('option').evaluateAll(options=>options.map(o=>({value:o.value,text:o.textContent})));for(const record of propertiesBank){await chooser.selectOption(options.find(o=>o.text.includes(record.code)).value);await page.locator('.teacher-answer').waitFor();await ideal(true);await clean();assert.equal(await page.locator('.question-parts input,.question-parts textarea').count(),0);}assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);await shot('teacher');});
} finally {report.finishedAt=new Date().toISOString();report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await context.close();await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures,pageErrors:report.pageErrors}));if(report.status!=='PASS')process.exitCode=1;}
