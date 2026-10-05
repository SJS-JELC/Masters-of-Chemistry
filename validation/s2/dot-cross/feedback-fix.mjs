import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,run=`a10-feedback-${Date.now()}`;
const result={jobId:'S2-DOTCROSS',checkedAt:new Date().toISOString(),run,status:'RUNNING',checks:[],errors:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1100}});
await context.addInitScript(()=>{const original=crypto.getRandomValues.bind(crypto);Object.defineProperty(crypto,'getRandomValues',{value:array=>array instanceof Uint32Array&&array.length===1?(array[0]=1,array):original(array)});});
const page=await context.newPage();page.on('pageerror',error=>result.errors.push(error.message));
const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
const flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
const wait=()=>page.waitForFunction(()=>window.__mastersActivity?.snapshot().saveStatus.kind==='saved');
const click=async name=>{await page.getByRole('button',{name,exact:true}).click();await flush();await wait();};
try{
 await page.goto(`http://127.0.0.1:5181/alevel.html?run=${run}`);await page.getByLabel('Target',{exact:true}).selectOption('l6-t2-1-3:1');await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt!==null);await flush();await wait();assert.equal((await snap()).question.ref.questionId,'nacl');
 await page.getByText('Keyboard and non-drag controls',{exact:true}).click();
 for(const atom of [{element:'Na',x:300,y:325},{element:'Cl',x:600,y:325}]){await page.getByLabel('Element',{exact:true}).selectOption(atom.element);await page.getByLabel('X position',{exact:true}).fill(String(atom.x));await page.getByLabel('Y position',{exact:true}).fill(String(atom.y));await click('Add atom');}
 // Correct atoms with missing chloride electrons/brackets earns source partial credit.
 await click('Check answer');let state=await snap();assert.equal(state.attempt.firstAssessment.score,0.5);
 const rows=page.locator('.assessment-feedback .mark-feedback');assert.equal(await rows.first().locator('strong').innerText(),'Partly correct');
 for(const row of await rows.all()){const text=await row.innerText();if(text.startsWith('○')||text.startsWith('✓')){assert.equal(await row.locator('strong').count(),0);assert(!/^Correct\s*[·?]/.test(text));}}
 const failed=rows.filter({hasText:'○ One or more shared pairs'}); // NaCl has no shared pairs; another wrong criterion must exist.
 const failedRows=await rows.evaluateAll(nodes=>nodes.filter(node=>node.textContent.trim().startsWith('○')).map(node=>({text:node.textContent.trim(),strong:node.querySelectorAll('strong').length})));
 assert(failedRows.length>0);assert(failedRows.every(row=>row.strong===0&&!row.text.startsWith('Correct')));result.failedInformationalRows=failedRows;void failed;
 const firstResponse=structuredClone(state.attempt.firstResponse),firstAssessment=structuredClone(state.attempt.firstAssessment);
 await page.screenshot({path:path.join(here,'shared-feedback-fixed-partial-ionic.png'),fullPage:true});result.checks.push('partial aggregate correctly labelled Partly correct; all failed informational criteria have no Correct prefix or strong tag');
 // Construct corrected chloride shell and two ion groups through the actual editor controls.
 for(let slot=0;slot<8;slot++){await page.getByLabel('Electron symbol',{exact:true}).selectOption(slot===7?'cross':'dot');await page.getByLabel('First atom',{exact:true}).selectOption('a2');await page.getByLabel('Second atom',{exact:true}).selectOption('');await page.getByLabel('Electron slot',{exact:true}).selectOption({value:String(slot)});await click('Add electron');}
 for(const group of [{label:'Na a1',charge:1},{label:'Cl a2',charge:-1}]){for(const button of await page.locator('.dc-atom-list button[aria-pressed=true]').all())await button.click();await page.locator('.dc-atom-list').getByRole('button',{name:group.label,exact:true}).click();await page.getByLabel('Ion charge',{exact:true}).fill(String(group.charge));await click('Apply bracket and charge');}
 await click('Check correction');state=await snap();assert.equal(state.correctionFeedback.status,'correct');assert.deepEqual(state.attempt.firstResponse,firstResponse);assert.deepEqual(state.attempt.firstAssessment,firstAssessment);assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,1);await page.screenshot({path:path.join(here,'shared-feedback-fixed-ionic-correction.png'),fullPage:true});result.checks.push('correct learning feedback preserves partial first response/assessment and one evidence record');
 // A separate empty-electron wrong species earns zero, preserving aggregate Incorrect.
 await page.goto(`http://127.0.0.1:5181/alevel.html?run=${run}-wrong`);await page.getByLabel('Target',{exact:true}).selectOption('l6-t2-1-3:1');await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt!==null);await page.getByText('Keyboard and non-drag controls',{exact:true}).click();await page.getByLabel('Element',{exact:true}).selectOption('H');await click('Add atom');await click('Check answer');assert.equal((await snap()).attempt.firstAssessment.score,0);assert.equal(await page.locator('.assessment-feedback .mark-feedback').first().locator('strong').innerText(),'Incorrect');await page.screenshot({path:path.join(here,'shared-feedback-fixed-wrong-ionic.png'),fullPage:true});result.checks.push('zero-score aggregate remains Incorrect; zero-weight failed criteria remain plain messages');
 assert.deepEqual(result.errors,[]);result.status='PASS';
}catch(error){result.status='FAIL';result.failure=error.stack;console.error(error);process.exitCode=1;}finally{result.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'shared-feedback-fix.json'),JSON.stringify(result,null,2));await browser.close();}
