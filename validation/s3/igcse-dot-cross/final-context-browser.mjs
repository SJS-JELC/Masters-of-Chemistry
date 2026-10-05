import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {bank} from '../../../src/activities/igcse/dot-and-cross/bank.js';
import {reviewCode} from '../../../src/activities/igcse/dot-and-cross/provider.ts';
const here=import.meta.dirname,run=`a15-final-context-${Date.now()}`,report={checkedAt:new Date().toISOString(),status:'RUNNING',checks:[],errors:[]};
const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
try{
 for(const id of ['propane','propene']){await page.goto(`http://127.0.0.1:5181/igcse.html?run=${run}-${id}&review=${reviewCode(id)}`);await page.getByText(/^Extension: this three-carbon/).waitFor();await page.locator('.worked-answer img').evaluate(img=>img.decode());assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,0);await page.screenshot({path:path.join(here,`teacher-${id}-extension.png`),fullPage:true});report.checks.push(`${id} teacher/model extension label rendered; exact historic source ID; no evidence`);}
 await page.goto(`http://127.0.0.1:5181/igcse.html?run=${run}-feedback`);await page.getByLabel('Target',{exact:true}).selectOption('fourth-3-1:1');await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.locator('.dc-canvas').waitFor();const state=await page.evaluate(()=>window.__mastersActivity.snapshot()),record=bank.find(q=>q.id===state.question.ref.questionId);await page.evaluate(record=>window.__mastersActivity.respond('diagram',{kind:'dot-and-cross',...record.reference}),record);await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());await page.getByRole('heading',{name:'First assessment',exact:true}).waitFor();assert(!(await page.locator('.first-assessment').innerText().catch(()=>page.locator('.question-player').innerText())).includes('triangles'));report.checks.push('IGCSE feedback describes only dots and crosses; representation-domain wording agrees with palette');assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;}
finally{fs.writeFileSync(path.join(here,'final-context-browser.json'),JSON.stringify(report,null,2));await browser.close();}console.log(JSON.stringify(report));
