import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(path.join(projectRoot,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright');
const out=path.join(projectRoot,'.artifacts/recall-formulae-ux/s1/identity');
const temp=path.join(out,'.tmp');fs.mkdirSync(temp,{recursive:true});process.env.TEMP=temp;process.env.TMP=temp;
const report={status:'RUNNING',checks:[],pageErrors:[],startedAt:new Date().toISOString()};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5208','--strictPort'],{cwd:projectRoot,stdio:['ignore','pipe','pipe'],windowsHide:true});
let serverText='';server.stdout.on('data',x=>serverText+=x);server.stderr.on('data',x=>serverText+=x);
let browser;
try {
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  for(let n=0;n<100;n++){try{if((await fetch('http://127.0.0.1:5208')).ok)break;}catch{} await new Promise(r=>setTimeout(r,100));}
  const context=await browser.newContext();const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(e.message));
  const fixture='http://127.0.0.1:5208/scripts/browser/recall-identity/repository-fixture.html';
  await page.goto(fixture);await page.waitForFunction(()=>!!window.__identityReport);
  const first=await page.evaluate(()=>window.__identityReport);report.checks.push(first);assert.equal(first.status,'PASS');
  await page.goto(fixture+'?reload=1');await page.waitForFunction(()=>!!window.__identityReport);
  const reloaded=await page.evaluate(()=>window.__identityReport);report.checks.push(reloaded);assert.equal(reloaded.status,'PASS');assert.equal(reloaded.isReload,true);
  assert.equal(report.pageErrors.length,0);report.status='PASS';
  await context.close();
} catch(error){report.status='FAIL';report.error={message:error.message,stack:error.stack};process.exitCode=1;}
finally {report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'repository-browser.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(out,'repository-server.txt'),serverText);await browser?.close();server.kill();}
console.log(JSON.stringify(report));
