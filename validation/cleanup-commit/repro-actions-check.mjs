import { chromium } from '../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const here=import.meta.dirname,browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),run='specialist-feedback-'+Date.now();
const report={status:'RUNNING',checks:[],failures:[],pageErrors:[]};page.on('pageerror',e=>report.pageErrors.push(e.message));
const snapshot=()=>page.evaluate(()=>window.__mastersActivity.snapshot()),flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
async function ready(){await page.waitForFunction(()=>window.__mastersActivity);await page.waitForFunction(()=>window.__mastersActivity.snapshot().saveStatus.kind!=='saving');}
async function reload(){await page.reload();await ready();if(await page.getByRole('button',{name:'Resume saved attempt',exact:true}).count())await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await page.locator('.question-player').waitFor();await flush();}
async function fixture(activityId){await page.goto(`http://127.0.0.1:5203/alevel.html?course=${activityId.split('/' )[0]}&run=${run}-${activityId.split('/')[1]}&view=practice&activity=${activityId}`);await ready();await page.evaluate(async activityId=>{const {productionRegistry}=await import('/src/foundation/registry.ts'),{createChemistryRepository}=await import('/src/persistence/index.ts'),registration=productionRegistry.get(activityId),provider=await registration.provider(),level=1,target={course:activityId.split('/')[0],activityId,gemId:registration.gems[0].id,level},ref=provider.select({activityId,gemId:target.gemId,level,seed:5,previousQuestionIds:[]}),q=provider.restore(ref),id=crypto.randomUUID(),namespace={course:activityId.split('/')[0],profileId:'local'};const attempt={mode:'student',namespace,attemptId:id,ref,target,currentResponses:{},assistance:[],phase:'answering',timing:{attemptId:id,activeMs:0,idleLimitMs:registration.idleAllowance(q),finished:false}},session={kind:'practice',namespace,id:'current-session',target,selection:'fixed-level',currentAttemptId:id,previousQuestionIds:[],paused:false};const saved=await createChemistryRepository(window.__mastersActivity.snapshot().databaseName).saveCurriculum({attempt,session});if(!saved.ok)throw Error(saved.error.message);},activityId);await reload();}
async function runCheck(id,fn){try{await fn();report.checks.push({id,status:'PASS'});}catch(error){report.failures.push({id,error:error.stack});await page.screenshot({path:path.join(here,'specialist-failure-'+id+'.png'),fullPage:false,animations:'disabled',timeout:60000});}}
try {
 for(const course of ['alevel','igcse']) {
  await page.setViewportSize({width:1440,height:1000});
  await fixture(course+'/dot-and-cross');
  await page.locator('.dot-cross-editor .workspace').waitFor();
  assert.equal(await page.locator('.dot-help,.dot-cross-editor .marking').count(),0);
  assert.equal(await page.locator('.dc-question-actions .question-actions').count(),1);
  assert.equal(await page.locator('.dot-cross-player .player-footer').count(),0);
  var actionBox=await page.locator('.dc-question-actions').boundingBox(),canvasBox=await page.locator('.canvas-wrap').boundingBox(),lastButton=await page.locator('.dc-question-actions button').last().boundingBox();
  assert(actionBox && canvasBox && lastButton);
  assert(actionBox.y+actionBox.height<=canvasBox.y+2);
  assert(Math.abs(actionBox.x+actionBox.width-lastButton.x-lastButton.width-12)<4);
  const bounds=await page.locator('.dot-cross-editor .workspace').evaluate(el=>({workspace:el.getBoundingClientRect().width,canvas:el.querySelector('.canvas-wrap').getBoundingClientRect().width}));
  assert(Math.abs(bounds.workspace-bounds.canvas)<4,JSON.stringify(bounds));
  await page.screenshot({path:path.join(here,'actions-'+course+'.png'),fullPage:false,animations:'disabled',timeout:60000});
  await page.getByRole('button',{name:'Give Up',exact:true}).click();await flush();
  await page.getByRole('button',{name:'Close answer',exact:true}).click();
  await page.locator('.dot-feedback .assessment-feedback').waitFor();
  const first=(await snapshot()).attempt.firstAssessment;
  await reload();
  assert.deepEqual((await snapshot()).attempt.firstAssessment,first);
  assert.equal(await page.locator('.dot-help,.dot-cross-editor .marking').count(),0);
  assert.equal(await page.locator('.dc-question-actions .question-actions').count(),1);
  assert.equal(await page.locator('.dot-cross-player .player-footer').count(),0);
  var actionBox=await page.locator('.dc-question-actions').boundingBox(),canvasBox=await page.locator('.canvas-wrap').boundingBox(),lastButton=await page.locator('.dc-question-actions button').last().boundingBox();
  assert(actionBox && canvasBox && lastButton);
  assert(actionBox.y+actionBox.height<=canvasBox.y+2);
  assert(Math.abs(actionBox.x+actionBox.width-lastButton.x-lastButton.width-12)<4);
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(here,'actions-'+course+'-mobile.png'),fullPage:false,animations:'disabled',timeout:60000});
  const mobileActions=await page.locator('.dc-question-actions').boundingBox(),mobileCanvas=await page.locator('.canvas-wrap').boundingBox();
  assert(mobileActions.y+mobileActions.height<=mobileCanvas.y+2);
  await page.locator('[data-question-action="clear"]').click();await flush();
  await page.locator('[data-question-action="check"]').click();await flush();
  console.log('PASS '+course+': full width, no help/sidebar, reveal/feedback/reload, mobile');
 }
 assert.deepEqual(report.pageErrors,[]);
} finally { await browser.close(); }
