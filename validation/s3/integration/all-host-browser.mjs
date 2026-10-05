import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const project=path.resolve(import.meta.dirname,'../../..'),directory=import.meta.dirname;
const expected=JSON.parse(fs.readFileSync(path.join(directory,'production-target-expectations.json'),'utf8'));
const require=createRequire(path.resolve(project,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright'),results=[],errors=[],failedRequests=[];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{try{const pieces=new URL(req.url,'http://localhost').pathname.split('/').filter(Boolean);assert.equal(pieces.shift(),'s3-complete');const course=pieces.shift();assert(['alevel','igcse'].includes(course));const root=path.join(project,'dist',course),file=path.resolve(root,...pieces);assert(file.startsWith(root+path.sep));res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(5191,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
for(const course of ['alevel','igcse']){
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failedRequests.push(r.url());});
 const base=`http://127.0.0.1:5191/s3-complete/${course}/index.html`;
 await page.goto(base+'?mode=teacher');await page.getByLabel('Target',{exact:true}).waitFor();
 const options=await page.getByLabel('Target',{exact:true}).locator('option').evaluateAll(items=>items.map(item=>({value:item.value,label:item.textContent})));
 const records=[];
 for(const item of options){await page.getByLabel('Target',{exact:true}).selectOption(item.value);await page.waitForFunction(code=>document.querySelector('.question-header code')?.textContent===code,expected[course][item.value].questionId);await page.locator('.question-header h2').waitFor();await page.waitForFunction(()=>!Array.from(document.querySelectorAll('[role=status]')).some(x=>/Loading .*workspace/.test(x.textContent)));records.push({target:item.value,title:await page.locator('.question-header h2').innerText()});}
 assert.equal(records.length,course==='alevel'?24:17);
 // Teacher selection is real provider mounting. Inspect the actual new database,
 // not an independent repository mock; read-only mode must create no pupil rows.
 const stores=await page.evaluate(async course=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(`masters-of-chemistry-${course}-local`);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const counts={};for(const store of db.objectStoreNames){counts[store]=await new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).count();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}db.close();return counts;},course);
 for(const [name,count] of Object.entries(stores))assert.equal(count,0,`Teacher wrote ${name}`);
 if(course==='alevel'){await page.goto(base+'?olympiad=c3l6&mode=teacher');await page.getByText('Olympiad challenge',{exact:true}).waitFor();await page.waitForFunction(()=>!document.body.innerText.includes('Loading challenge content'));assert.equal(await page.getByLabel('Target',{exact:true}).count(),0);assert.equal(await page.getByText('Start practice',{exact:true}).count(),0);await page.screenshot({path:path.join(directory,'c3-production-teacher.png'),fullPage:true});}
 results.push({course,status:'PASS',targets:records,teacherStoreCounts:stores,productionSeamsAbsent:await page.evaluate(()=>!window.__mastersActivity&&!window.__mastersOlympiad&&!window.__mastersFoundation)});await context.close();
}
 assert.equal(results.flatMap(row=>row.targets).length,41);assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));const report={status:results.length===2&&!errors.length&&!failedRequests.length?'PASS':'FAIL',checkedAt:new Date().toISOString(),results,errors,failedRequests,scope:'Actual production all41 target teacher mounting, complete12 navigation and separate C3 lazy host; pupil/editor/revision interaction evidence is retained in assigned worker browsers.'};fs.writeFileSync(path.join(directory,'all-host-browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,courses:results.length,targets:results.flatMap(row=>row.targets).length}));}
