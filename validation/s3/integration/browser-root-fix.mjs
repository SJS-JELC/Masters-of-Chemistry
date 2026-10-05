import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
const project=path.resolve(import.meta.dirname,'../../..');
const require=createRequire(path.resolve(project,'../../package.json')),{chromium}=require('playwright');
const server=await createServer({root:project,configFile:path.join(project,'vite.config.ts'),cacheDir:path.join(import.meta.dirname,'.vite-root-fix'),server:{host:'127.0.0.1',port:5190,strictPort:true,hmr:false}});
await server.listen();
const context=await chromium.launchPersistentContext(path.join(project,'.browser','a01s3rubric-'+Date.now().toString(36)),{channel:'msedge',headless:true,viewport:{width:1280,height:900}});
const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
const checks=[];let status='FAIL',failure;
try{
  await page.goto(`http://127.0.0.1:5190/igcse.html?run=a01-rubric-${Date.now()}`);
  await page.waitForFunction(()=>window.__mastersActivity!==undefined);
  await page.getByLabel('Target',{exact:true}).selectOption('lower-6-5:3');
  await page.getByRole('button',{name:'Start practice',exact:true}).click();
  await page.locator('.question-part textarea').waitFor();
  await page.locator('.question-part textarea').fill('This frozen explanation contains the evidence text for our self-review.');
  await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();
  await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='rubric-review');
  let first=true;
  while(await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).count()){
    if(first){first=false;await page.getByRole('button',{name:'My answer meets this point',exact:true}).click();const picker=page.locator('.rubric-active .range-picker');await picker.getByLabel('Start',{exact:true}).fill('0');await picker.getByLabel('End (exclusive)',{exact:true}).fill('4');await picker.getByRole('button',{name:'Use selected text',exact:true}).click();}
    else await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();
  }
  await page.getByRole('button',{name:'Finish self-review',exact:true}).click();
  await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');
  await page.evaluate(()=>window.__mastersActivity.flush());
  const labels=await page.locator('.assessment-feedback .mark-feedback strong').allTextContents();
  assert(labels.includes('Met'));assert(labels.includes('Not met'));assert(!labels.some(label=>/Incorrect|Correct/i.test(label)));
  const before=await page.evaluate(()=>window.__mastersActivity.snapshot().attempt);
  const history=await page.evaluate(()=>window.__mastersActivity.history());assert.equal(history.length,1);
  checks.push({id:'true-model-rubric-statements-use-met-not-met',status:'PASS',labels,firstMarks:before.firstAssessment.marks.earned,firstTime:before.firstResponse.timing});
  await page.screenshot({path:path.join(import.meta.dirname,'rubric-met-not-met.png'),fullPage:true});
  await page.reload();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');
  const after=await page.evaluate(()=>window.__mastersActivity.snapshot().attempt);
  assert.deepEqual(after.firstResponse,before.firstResponse);assert.deepEqual(after.firstAssessment,before.firstAssessment);assert.equal((await page.evaluate(()=>window.__mastersActivity.history())).length,1);
  assert.deepEqual(await page.locator('.assessment-feedback .mark-feedback strong').allTextContents(),labels);
  checks.push({id:'rubric-label-fix-preserves-first-response-result-time-and-one-evidence',status:'PASS'});
  await page.getByRole('button',{name:'Pause',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());
  await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();assert.equal(await page.locator('.question-player').count(),0);
  await page.reload();await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();assert.equal(await page.locator('.question-player').count(),0);
  await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await page.locator('.question-player').waitFor();
  assert.deepEqual((await page.evaluate(()=>window.__mastersActivity.snapshot().attempt)).firstAssessment,before.firstAssessment);
  checks.push({id:'paused-attempt-prevents-interaction-and-restores-same-assessed-state',status:'PASS'});
  assert.deepEqual(pageErrors,[]);status='PASS';
}catch(error){failure=error.stack;throw error;}
finally{await context.close();await server.close();fs.writeFileSync(path.join(import.meta.dirname,'browser-root-fix.json'),JSON.stringify({status,checkedAt:new Date().toISOString(),playwright:require('playwright/package.json').version,checks,pageErrors,...(failure?{failure}:{})},null,2)+'\n');}
console.log(JSON.stringify({status,checks:checks.length,pageErrors}));
