import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const project=path.resolve(import.meta.dirname,'../../..');
const require=createRequire(path.resolve(project,'../../package.json'));
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const report={startedAt:new Date().toISOString(),status:'RUNNING',errors:[]};
try {
  const page=await browser.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  let unblock,requested;
  const gate=new Promise(resolve=>{unblock=resolve;}),seen=new Promise(resolve=>{requested=resolve;});
  await page.route('**/src/activities/olympiad/isomers2011/index.ts*',async route=>{requested();await gate;await route.continue();});
  await page.goto(`http://127.0.0.1:5187/alevel.html?run=async-w02-${Date.now()}&view=olympiad&activity=alevel/olympiad-2011-q4`,{waitUntil:'domcontentloaded'});
  await seen;
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();
  await page.getByRole('button',{name:'C3L6 organic reactions',exact:true}).click();
  await page.waitForFunction(()=>window.__mastersOlympiad?.snapshot().progress?.activityId==='alevel/c3l6-organic-reactions');
  const response=page.waitForResponse(response=>response.url().includes('/src/activities/olympiad/isomers2011/index.ts'));
  unblock();await response;
  // The released dynamic module must finish before checking the retained C3 progress.
  await page.evaluate(async()=>{await import('/src/activities/olympiad/isomers2011/index.ts');});
  assert.equal(await page.evaluate(()=>window.__mastersOlympiad.snapshot().progress.activityId),'alevel/c3l6-organic-reactions');
  await page.getByRole('heading',{name:'This question is about classifying simple organic reactions',exact:true}).waitFor();
  assert.equal(await page.locator('[data-isomer-box]').count(),0);
  assert.equal(report.errors.length,0);report.status='PASS';
  report.check='Delayed isomer module returns after switching to C3; stale load does not replace challenge/progress.';
}catch(error){report.status='FAIL';report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser.close();report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(import.meta.dirname,'async-navigation.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
