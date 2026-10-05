import { chromium } from '../../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { propertiesBank } from '../../../../src/activities/alevel/explaining-properties/bank.ts';
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

async function statuses(selection,replacement,generic=false){
 const controls=page.locator('.field-result');assert.equal(await controls.count(),2);
 for(const el of await controls.all())assert(await el.evaluate(el=>{const style=getComputedStyle(el);return el.classList.contains('sr-only')&&style.position==='absolute'&&style.overflow==='hidden'&&style.clip==='rect(0px, 0px, 0px, 0px)'&&style.display!=='none'&&style.visibility!=='hidden';}));
 assert.equal(await page.locator('.field-result[role="status"]').count(),1);
 assert.equal(await page.locator(`${generic?'.choice-option':'button'}[data-response-status="${selection}"]`).count(),1);
 if(!generic)assert.equal(await page.locator('button[data-error-id]:not([data-response-status])').count(),2);
 const field=page.getByLabel('Replacement / correction',{exact:true});assert.equal(await field.getAttribute('data-response-status'),replacement);
 assert.equal(await field.getAttribute('aria-invalid'),replacement==='incorrect'?'true':null);
 const description=await field.getAttribute('aria-describedby');assert(description);
 assert.equal(await field.evaluate((_el,id)=>document.getElementById(id).textContent,description),replacement==='correct'?'Correct replacement.':'Replacement needs correction.');
 if(!generic)assert.equal(await page.getByRole('button',{name:new RegExp(selection==='correct'?': correct selection$':': needs correction$')}).count(),1);
 const cdp=await context.newCDPSession(page),ax=await cdp.send('Accessibility.getFullAXTree');await cdp.detach();
 const textbox=ax.nodes.find(node=>node.role?.value==='textbox'&&node.name?.value==='Replacement / correction');assert(textbox);assert.equal(textbox.description?.value,replacement==='correct'?'Correct replacement.':'Replacement needs correction.');
 assert.equal(await field.evaluate(el=>getComputedStyle(el).borderTopWidth),'2px');
}
try{
 for(const [code,kind] of [['EBP-C6R2Y8','practice'],['EBP-I5B9S3','revision']])await runCheck(code+'-'+kind+'-hidden-accessible-statuses',async()=>{
  const record=await fixture(code,'fix-'+kind,kind);await fill(record,true);await check();await statuses('correct','incorrect');await ideal(false);
  const first=await snap(),history=await page.evaluate(()=>window.__mastersActivity.history());
  await shot('desktop-'+code+'-partial');await page.setViewportSize({width:390,height:844});await shot('mobile-'+code+'-partial');await page.setViewportSize({width:1440,height:1000});
  await reload();await statuses('correct','incorrect');await ideal(false);
  await page.getByLabel('Replacement / correction',{exact:true}).fill(record.answers[0][0]);await flush();assert.equal(await page.locator('.field-result,[data-response-status]').count(),0);
  await page.getByRole('button',{name:'Check',exact:true}).focus();assert(await page.getByRole('button',{name:'Check',exact:true}).evaluate(el=>getComputedStyle(el).outlineStyle!=='none'));await page.keyboard.press('Space');await flush();await statuses('correct','correct');await ideal(true);await reload();await statuses('correct','correct');await ideal(true);
  await shot('desktop-'+code+'-correct');await page.setViewportSize({width:390,height:844});await shot('mobile-'+code+'-correct');await page.setViewportSize({width:1440,height:1000});
  assert.deepEqual((await snap()).attempt.firstAssessment,first.attempt.firstAssessment);assert.deepEqual((await snap()).attempt.firstResponse,first.attempt.firstResponse);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),history);
 });
 await runCheck('generic-correction-hidden-accessible-statuses',async()=>{await page.goto('http://127.0.0.1:5203/validation/ebp-feedback/implementation/generic.html?kind=correction');await page.getByLabel('molecules',{exact:true}).check();await page.getByLabel('Replacement / correction',{exact:true}).fill('wrong');await page.getByRole('button',{name:'Check',exact:true}).click();await page.locator('.field-result').first().waitFor();await statuses('correct','incorrect',true);await page.getByLabel('Replacement / correction',{exact:true}).fill('ions');assert.equal(await page.locator('.field-result,[data-response-status]').count(),0);await page.getByRole('button',{name:'Check',exact:true}).click();await page.getByRole('heading',{name:'Ideal answer',exact:true}).waitFor();await statuses('correct','correct',true);});
}finally{report.finishedAt=new Date().toISOString();report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await context.close();await browser.close();console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;}
