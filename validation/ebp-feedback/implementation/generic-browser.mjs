import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=import.meta.dirname, browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1100,height:900}});
const report={status:'RUNNING',method:'Rendered generic QuestionPlayer fixture, actual shared attempt engine and browser controls; fixture-only synthetic marking values.',checks:[],failures:[],pageErrors:[]};page.on('pageerror',error=>report.pageErrors.push(error.message));
async function run(id,fn){try{await fn();report.checks.push({id,status:'PASS'});}catch(error){report.failures.push({id,error:error.stack});await page.screenshot({path:path.join(here,'generic-failure-'+id+'.png'),fullPage:true});}}
const check=()=>page.getByRole('button',{name:'Check',exact:true}).click();
async function result(){await page.getByRole('status').filter({hasText:'Check your response.'}).waitFor();assert.equal(await page.locator('.assessment-feedback,.correction-feedback').count(),0);assert(!await page.locator('.question-player').innerText().then(t=>/Verbose fixture|Verbose model|Verbose selection|First assessment|Learning correction/.test(t)));assert.equal(await page.getByRole('heading',{name:'Ideal answer'}).count(),0);}
try{
 for(const kind of ['text','numeric','choice','dropdown','multiple','diagram'])await run(kind,async()=>{
  await page.goto(`http://127.0.0.1:5203/validation/ebp-feedback/implementation/generic.html?kind=${kind}`);await page.locator('.question-player').waitFor();
  if(kind==='text')await page.getByLabel('Your answer',{exact:true}).fill('wrong');
  if(kind==='numeric')await page.locator('[data-answer-input]').first().fill('1');
  if(kind==='choice'||kind==='multiple')await page.getByLabel('No',{exact:true}).check();
  if(kind==='dropdown')await page.getByLabel('Answer',{exact:true}).selectOption('no');
  if(kind==='diagram')await page.getByLabel('B',{exact:true}).check();
  await check();await result();
  if(kind==='text'){assert.equal(await page.getByText('Review equivalent wording',{exact:true}).count(),1);await page.getByText('Review equivalent wording',{exact:true}).click();assert.equal(await page.getByRole('button',{name:'My wording is equivalent',exact:true}).count(),1);await page.getByLabel('Your answer',{exact:true}).fill('ions');}
  if(kind==='numeric')await page.locator('[data-answer-input]').first().fill('2');
  if(kind==='choice')await page.getByLabel('Yes',{exact:true}).check();
  if(kind==='multiple'){await page.getByLabel('No',{exact:true}).uncheck();await page.getByLabel('Yes',{exact:true}).check();}
  if(kind==='dropdown')await page.getByLabel('Answer',{exact:true}).selectOption('yes');
  if(kind==='diagram'){await page.getByLabel('B',{exact:true}).uncheck();await page.getByLabel('A',{exact:true}).check();}
  await check();await page.getByRole('heading',{name:'Ideal answer',exact:true}).waitFor();assert(await page.locator('.question-parts').evaluate(el=>el.nextElementSibling.classList.contains('worked-answer')));assert.equal(await page.locator('.response-result').textContent(),'Correct.');
 });
 await run('correction',async()=>{await page.goto('http://127.0.0.1:5203/validation/ebp-feedback/implementation/generic.html?kind=correction');await page.getByLabel('molecules',{exact:true}).check();await page.getByLabel('Replacement / correction',{exact:true}).fill('wrong');await check();assert.equal(await page.locator('.choice-option[data-response-status="correct"]').count(),1);assert.equal(await page.locator('textarea[data-response-status="incorrect"]').count(),1);assert.equal(await page.getByRole('heading',{name:'Ideal answer'}).count(),0);assert.equal(await page.locator('.assessment-feedback,.correction-feedback').count(),0);await page.getByLabel('Replacement / correction',{exact:true}).fill('ions');assert.equal(await page.locator('[data-response-status]').count(),0);await check();await page.getByRole('heading',{name:'Ideal answer'}).waitFor();});
 await run('self-rubric',async()=>{await page.goto('http://127.0.0.1:5203/validation/ebp-feedback/implementation/generic.html?kind=explanation');await page.getByLabel('Explanation',{exact:true}).fill('Molecules are present.');await check();await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();await page.getByRole('button',{name:'Finish self-review',exact:true}).click();await result();await page.getByRole('button',{name:'Give Up',exact:true}).click();await page.getByRole('heading',{name:'Ideal answer',exact:true}).waitFor();});
 await run('mixed-self-review-remains-required',async()=>{await page.goto('http://127.0.0.1:5203/validation/ebp-feedback/implementation/generic.html?kind=mixed');await page.locator('[data-answer-input]').first().fill('1');await page.getByLabel('Explanation',{exact:true}).fill('Molecules are present.');await check();await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();await page.getByRole('button',{name:'Finish self-review',exact:true}).click();await result();await page.locator('[data-answer-input]').first().fill('2');await check();await result();await page.getByRole('button',{name:'Give Up',exact:true}).click();await page.getByRole('heading',{name:'Ideal answer',exact:true}).waitFor();});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(here,'generic-self-review-mobile.png'),fullPage:true});
}finally{report.status=report.failures.length||report.pageErrors.length?'FAIL':'PASS';fs.writeFileSync(path.join(here,'generic-browser-results.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;}
