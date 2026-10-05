import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {bank} from '../../../src/activities/igcse/dot-and-cross/bank.js';
import {reviewCode,pupilPool} from '../../../src/activities/igcse/dot-and-cross/provider.ts';
const here=import.meta.dirname,run=`a15-full-bank-${Date.now()}`,report={startedAt:new Date().toISOString(),status:'RUNNING',teacher:[],routes:[],errors:[]};
const prior=path.join(here,'bank-routes-browser.json');if(fs.existsSync(prior))fs.copyFileSync(prior,path.join(here,`bank-routes-prior-${Date.now()}.json`));
const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
try{
 for(const record of bank){await page.goto(`http://127.0.0.1:5181/igcse.html?run=${run}-teacher&review=${reviewCode(record.id)}`);await page.locator('.dc-canvas').waitFor();await page.locator('.worked-answer img').evaluate(img=>img.decode());assert.equal(await page.locator('.question-meta code').innerText(),record.id);assert((await page.locator('.question-header h2').innerText()).includes(reviewCode(record.id)));assert.equal(await page.getByRole('button',{name:'Triangle',exact:true}).count(),0);assert.equal(await page.getByLabel('Element',{exact:true}).locator('option[value="B"],option[value="P"]').count(),0);assert.equal(await page.evaluate(()=>window.__mastersActivity.history().then(records=>records.length)),0);report.teacher.push({id:record.id,historicalCode:reviewCode(record.id),workedImageDecoded:true,readOnly:true,noEvidence:true,sourcePalette:true});}
 for(const [gem,category,levels] of [['fourth-3-1','ionic',[1,2]],['fourth-3-2','covalent',[1,2,3]]])for(const level of levels){
  await page.goto(`http://127.0.0.1:5181/igcse.html?run=${run}-${category}-${level}`);await page.getByLabel('Target',{exact:true}).selectOption(`${gem}:${level}`);await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.locator('.dc-canvas').waitFor();let state=await page.evaluate(()=>window.__mastersActivity.snapshot());assert(pupilPool(level,category).some(q=>q.id===state.question.ref.questionId));assert.equal(state.attempt.timing.idleLimitMs,180000);
  const record=bank.find(q=>q.id===state.question.ref.questionId);if(category==='ionic'&&level===2)assert(!(await page.locator('.question-header h2').innerText()).includes(record.formula));
  await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());state=await page.evaluate(()=>window.__mastersActivity.snapshot());assert.equal(state.attempt.phase,'answering');assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);assert(await page.getByText('Complete every required response.',{exact:true}).count());
  report.routes.push({category,level,gemId:gem,selected:record.id,sourcePool:true,idleMs:180000,emptyBlocked:true});
  if(category==='ionic'&&level===2){await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(here,'ionic-level2-infer-formula-mobile.png'),fullPage:true});await page.setViewportSize({width:1440,height:1050});}
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;try{await page.screenshot({path:path.join(here,'bank-routes-failure.png'),fullPage:true});}catch{}}
finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'bank-routes-browser.json'),JSON.stringify(report,null,2));await browser.close();}console.log(JSON.stringify({status:report.status,teacher:report.teacher.length,routes:report.routes.length,failure:report.failure}));
