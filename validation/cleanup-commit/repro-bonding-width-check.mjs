import { chromium } from '../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const here=import.meta.dirname,browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),run='specialist-feedback-'+Date.now();
const report={status:'RUNNING',checks:[],failures:[],pageErrors:[]};page.on('pageerror',e=>report.pageErrors.push(e.message));
const snapshot=()=>page.evaluate(()=>window.__mastersActivity.snapshot()),flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
async function ready(){await page.waitForFunction(()=>window.__mastersActivity);await page.waitForFunction(()=>window.__mastersActivity.snapshot().saveStatus.kind!=='saving');}
async function reload(){await page.reload();await ready();if(await page.getByRole('button',{name:'Resume saved attempt',exact:true}).count())await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await page.locator('.question-player').waitFor();await flush();}
async function fixture(activityId){await page.goto(`http://127.0.0.1:5203/alevel.html?run=${run}-${activityId.split('/')[1]}&view=practice&activity=${activityId}`);await ready();await page.evaluate(async activityId=>{const {productionRegistry}=await import('/src/foundation/registry.ts'),{createChemistryRepository}=await import('/src/persistence/index.ts'),registration=productionRegistry.get(activityId),provider=await registration.provider(),level=1,target={course:'alevel',activityId,gemId:registration.gems[0].id,level},ref=provider.resolveLink('EB-000003'),q=provider.restore(ref),id=crypto.randomUUID(),namespace={course:'alevel',profileId:'local'};const attempt={mode:'student',namespace,attemptId:id,ref,target,currentResponses:{},assistance:[],phase:'answering',timing:{attemptId:id,activeMs:0,idleLimitMs:registration.idleAllowance(q),finished:false}},session={kind:'practice',namespace,id:'current-session',target,selection:'fixed-level',currentAttemptId:id,previousQuestionIds:[],paused:false};const saved=await createChemistryRepository(window.__mastersActivity.snapshot().databaseName).saveCurriculum({attempt,session});if(!saved.ok)throw Error(saved.error.message);},activityId);await reload();}
async function runCheck(id,fn){try{await fn();report.checks.push({id,status:'PASS'});}catch(error){report.failures.push({id,error:error.stack});await page.screenshot({path:path.join(here,'specialist-failure-'+id+'.png'),fullPage:true});}}
try {
 await fixture('alevel/electrons-bonding');
 assert.equal((await snapshot()).question.ref.questionId,'EB-000003');
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.getByRole('button',{name:'Show hint',exact:true}).count(),0);
  assert.equal(await page.locator('.source-hint').count(),0);
  const boxes=await page.locator('.question-workspace').evaluate(el=>({workspace:el.getBoundingClientRect().width,content:el.querySelector('.question-content').getBoundingClientRect().width}));
  assert(Math.abs(boxes.workspace-boxes.content)<2,JSON.stringify(boxes));
  const input=page.locator('.source-bonding textarea,.source-bonding input').first();
  assert(await input.isVisible());
  const inputWidth=(await input.boundingBox()).width;
  assert(inputWidth>boxes.workspace*.9);
  await input.fill('test response');await flush();
  await page.screenshot({path:path.join(here,'bonding-width-'+width+'.png'),animations:'disabled',timeout:60000});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await reload();assert.equal(await page.locator('.source-bonding textarea,.source-bonding input').first().inputValue(),'test response');
 await page.getByRole('button',{name:'Give Up',exact:true}).click();await flush();
 await page.getByRole('heading',{name:'Worked answer',exact:true}).waitFor();
 const below=await page.locator('.question-workspace').evaluate(el=>{const q=el.querySelector('.question-content').getBoundingClientRect(),a=el.querySelector('.marking-pane').getBoundingClientRect();return a.top>=q.bottom&&Math.abs(a.width-q.width)<2;});
 assert(below);assert.equal(await page.getByRole('button',{name:'Show hint',exact:true}).count(),0);
 assert.deepEqual(report.pageErrors,[]);
 console.log('PASS EB-000003: no hint, full-width question/input, model below, desktop/mobile and saved response.');
} finally {await browser.close();}
