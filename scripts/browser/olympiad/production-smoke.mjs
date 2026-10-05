import { projectRoot, outputDirectory, devOrigin, previewOrigin } from '../paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const project=projectRoot,here=outputDirectory('olympiad');
const require=createRequire(path.resolve(project,'../../package.json'));
const report={startedAt:new Date().toISOString(),status:'RUNNING',checks:[],errors:[]};
const server=spawn(process.execPath,['scripts/preview.mjs','--port','5204'],{cwd:project,windowsHide:true,stdio:['ignore','pipe','pipe']});
server.stderr.on('data',data=>{report.serverStderr=(report.serverStderr||'')+data.toString();});
let browser;
try {
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('Preview exited '+code)));});
  browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1366,height:1000}});
  page.on('pageerror',error=>report.errors.push(error.message));
  for(const entry of ['alevel','igcse']) {
    await page.goto(`http://127.0.0.1:5204/${entry}/?activity=alevel/olympiad-2011-q4&mode=teacher`);
    await page.getByRole('heading',{name:'Seven isomers',exact:true}).waitFor();
    assert.equal(await page.locator('[data-isomer-box]').count(),7);
    assert(await page.getByRole('button',{name:'Carbon',exact:true}).isDisabled());
    await page.locator('[data-isomer-box="7"]').click();
    assert.match(await page.locator('.isomer-teacher-answer').innerText(),/2-Methoxypropane/);
    await page.reload();await page.getByRole('heading',{name:'Seven isomers',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>Object.hasOwn(window,'__mastersOlympiad')),false);
    await page.screenshot({path:path.join(here,`production-${entry}-teacher.png`),fullPage:true});
    report.checks.push({id:`${entry}-prefixed-build-direct-link-refresh-teacher`,status:'PASS'});
  }
  await page.goto('http://127.0.0.1:5204/alevel/?olympiad=c3l6');
  await page.getByRole('heading',{name:'This question is about classifying simple organic reactions',exact:true}).waitFor();
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();
  await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();
  await page.getByRole('button',{name:'UK Olympiad 2011 · Seven isomers',exact:true}).click();
  await page.getByRole('heading',{name:'Seven isomers',exact:true}).waitFor();
  assert(await page.getByRole('button',{name:'Check',exact:true}).isDisabled());
  report.checks.push({id:'c3-legacy-link-selector-new-challenge',status:'PASS'});
  assert.equal(report.errors.length,0);
  report.status='PASS';
} catch(error) {report.status='FAIL';report.failure=String(error.stack||error);process.exitCode=1;}
finally {
  if(browser)await browser.close();
  server.kill();await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));
  report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(here,'production-smoke.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report));
