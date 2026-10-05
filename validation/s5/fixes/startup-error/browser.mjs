import {chromium} from '../../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,base='http://127.0.0.1:5207',report={startedAt:new Date().toISOString(),status:'RUNNING',checks:[],failures:[],headless:true};
const browser=await chromium.launch({channel:'msedge',headless:true,args:[`--disk-cache-dir=${path.join(here,'cache')}`]});
async function raw(page,name){return page.evaluate(async name=>{const db=await new Promise((resolve,reject)=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});const rows={};for(const store of db.objectStoreNames)rows[store]=await new Promise((resolve,reject)=>{const q=db.transaction(store).objectStore(store).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});db.close();return rows;},name);}
async function put(page,name,store,value){await page.evaluate(async({name,store,value})=>{const db=await new Promise((resolve,reject)=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});await new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=resolve;t.onabort=()=>reject(t.error)});db.close();},{name,store,value});}
async function notice(page){await page.getByRole('alert',{name:'Saved data unavailable'}).waitFor();assert.equal(await page.getByRole('button',{name:'Start practice',exact:true}).isEnabled(),false);assert.equal(await page.getByTestId('saved-result-count').count(),0);assert.equal(await page.getByRole('button',{name:'Resume saved attempt',exact:true}).count(),0);assert.equal(await page.locator('.question-player').count(),0);}
try{for(const course of ['alevel','igcse']){
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),run=`a17-s5-${course}-${Date.now()}`;
 page.on('pageerror',error=>report.failures.push({course,error:error.message}));
 try{
  await page.goto(`${base}/${course}.html?run=${run}`);await page.getByRole('button',{name:'Start practice',exact:true}).waitFor();
  await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.waitForFunction(()=>!!window.__mastersActivity?.snapshot().attempt);
  const input=page.locator('.question-part input').first();if(await input.count())await input.fill('1.23');
  await page.getByRole('button',{name:'Pause and save',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());
  const saved=await page.evaluate(()=>window.__mastersActivity.snapshot()),name=saved.databaseName,original=await raw(page,name);
  assert(original.attempts.length===1);assert(original.sessions.length===1);
  const corrupt={...original.sessions[0],value:{kind:'practice',namespace:{course,profileId:'local'},id:'current-session',target:{invalid:true}}};
  await put(page,name,'sessions',corrupt);await page.reload();await notice(page);
  const beforeRetry=await raw(page,name);await page.getByRole('button',{name:'Retry reading saved data',exact:true}).click();await page.getByRole('button',{name:'Retry reading saved data',exact:true}).waitFor();await notice(page);assert.deepEqual(await raw(page,name),beforeRetry);
  await page.screenshot({path:path.join(here,`${course}-corrupt-session.png`),fullPage:true});
  await put(page,name,'sessions',original.sessions[0]);await page.getByRole('button',{name:'Retry reading saved data',exact:true}).click();await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();
  assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.snapshot().attempt),saved.attempt);assert.deepEqual(await raw(page,name),original);
  report.checks.push({id:course+'-corrupt-session',status:'PASS',rawPreserved:true,retryRecoveredExactAttempt:true});
  for(const fault of ['missing-attempt','corrupt-attempt']){
   if(fault==='missing-attempt')await put(page,name,'sessions',{...original.sessions[0],value:{...original.sessions[0].value,currentAttemptId:'synthetic-missing-attempt'}});
   else await put(page,name,'attempts',{...original.attempts[0],value:{...original.attempts[0].value,phase:'synthetic-corrupt-phase'}});
   await page.reload();await notice(page);const broken=await raw(page,name);
   await page.getByRole('button',{name:'Retry reading saved data',exact:true}).click();await page.getByRole('button',{name:'Retry reading saved data',exact:true}).waitFor();await notice(page);assert.deepEqual(await raw(page,name),broken);
   await page.screenshot({path:path.join(here,`${course}-${fault}.png`),fullPage:true});
   await put(page,name,fault==='missing-attempt'?'sessions':'attempts',fault==='missing-attempt'?original.sessions[0]:original.attempts[0]);
   await page.getByRole('button',{name:'Retry reading saved data',exact:true}).click();await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();assert.deepEqual(await raw(page,name),original);
   assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.snapshot().attempt),saved.attempt);
   report.checks.push({id:course+'-'+fault,status:'PASS',rawPreserved:true,retryRecoveredExactAttempt:true});
  }
  const malformed={course,profileId:'local',id:'synthetic-invalid-history',value:{invalid:true}};
  await put(page,name,'evidence',malformed);await page.reload();await notice(page);const badHistory=await raw(page,name);
  await page.getByRole('button',{name:'Retry reading saved data',exact:true}).click();await page.getByRole('button',{name:'Retry reading saved data',exact:true}).waitFor();await notice(page);assert.deepEqual(await raw(page,name),badHistory);
  await page.screenshot({path:path.join(here,`${course}-corrupt-history.png`),fullPage:true});
  report.checks.push({id:course+'-corrupt-history',status:'PASS',rawPreserved:true,retryPreservesPersistentFault:true});
  // Separate fault fixture restores only the injected synthetic history row, never application reset/delete.
  await page.evaluate(async name=>{const db=await new Promise(resolve=>{const q=indexedDB.open(name);q.onsuccess=()=>resolve(q.result)});await new Promise(resolve=>{const t=db.transaction('evidence','readwrite');t.objectStore('evidence').delete([location.pathname.includes('alevel')?'alevel':'igcse','local','synthetic-invalid-history']);t.oncomplete=resolve});db.close();},name);
  await page.getByRole('button',{name:'Retry reading saved data',exact:true}).click();await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();assert.deepEqual(await raw(page,name),original);
  await page.getByRole('button',{name:'Teacher',exact:true}).click();await page.locator('.teacher-answer').waitFor();assert.deepEqual(await raw(page,name),original);
  await page.getByRole('button',{name:'Practice',exact:true}).click();await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();
  await page.screenshot({path:path.join(here,`${course}-recovered.png`),fullPage:true});
  report.checks.push({id:course+'-normal-recovery-teacher',status:'PASS',exactAttempt:saved.attempt.attemptId,newEvidence:0});
  await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();
  if(course==='alevel'){
   const parts=(await page.evaluate(()=>window.__mastersActivity.snapshot())).question.parts;
   for(let i=0;i<parts.length;i++)await page.locator('.question-part').nth(i).locator('input').fill(String(parts[i].acceptance.expected));
   await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());
   const first=await page.evaluate(()=>window.__mastersActivity.snapshot());
   await page.getByRole('button',{name:'Check correction',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());
   assert.deepEqual((await page.evaluate(()=>window.__mastersActivity.snapshot())).attempt.firstResponse,first.attempt.firstResponse);
  }else{
   const sections=page.locator('.question-part input,.question-part textarea');assert.equal(await sections.count(),7);for(let i=0;i<await sections.count();i++)await sections.nth(i).fill('Independent chemistry explanation.');
   await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());
   await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).waitFor();
   const first=await page.evaluate(()=>window.__mastersActivity.snapshot());
   while(await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).count()){await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());}
   await page.getByRole('button',{name:'Finish self-review',exact:true}).click();await page.evaluate(()=>window.__mastersActivity.flush());
   assert.deepEqual((await page.evaluate(()=>window.__mastersActivity.snapshot())).attempt.firstResponse,first.attempt.firstResponse);
  }
  const assessed=await page.evaluate(()=>window.__mastersActivity.snapshot());assert.equal(assessed.attempt.phase,'assessed');assert.equal(assessed.history.length,1);
  const assessedRows=await raw(page,name);await page.reload();await page.locator('.assessment-feedback').waitFor();assert.equal((await raw(page,name)).evidence.length,1);assert.deepEqual((await raw(page,name)).evidence,assessedRows.evidence);
  report.checks.push({id:course+'-assessment-after-recovery',status:'PASS',independentEvidence:1,firstResponseAndTimingFrozen:true,reloadNoDuplicate:true});
 }catch(error){report.failures.push({course,error:error.stack});await page.screenshot({path:path.join(here,`${course}-failure.png`),fullPage:true}).catch(()=>{});}finally{await context.close();}
 const blocked=await browser.newContext({viewport:{width:390,height:844}}),blockedPage=await blocked.newPage(),blockedRun=run+'-blocked';
 try{
  await blocked.addInitScript(()=>{const original=IDBFactory.prototype.open;window.__restoreOpen=()=>{IDBFactory.prototype.open=original;};IDBFactory.prototype.open=function(){throw new DOMException('Synthetic blocked storage','SecurityError')};});
  await blockedPage.goto(`${base}/${course}.html?run=${blockedRun}`);await notice(blockedPage);await blockedPage.screenshot({path:path.join(here,`${course}-unavailable-open.png`),fullPage:true});
  await blockedPage.evaluate(()=>window.__restoreOpen());await blockedPage.getByRole('button',{name:'Retry reading saved data',exact:true}).click();
  await blockedPage.waitForFunction(()=>{const buttons=[...document.querySelectorAll('button')];return buttons.some(b=>b.textContent==='Start practice'&&!b.disabled)});
  assert.equal(await blockedPage.getByRole('alert',{name:'Saved data unavailable'}).count(),0);
  await blockedPage.getByRole('button',{name:'Start practice',exact:true}).click();await blockedPage.waitForFunction(()=>!!window.__mastersActivity?.snapshot().attempt);
  await blockedPage.getByRole('button',{name:'Pause and save',exact:true}).click();await blockedPage.evaluate(()=>window.__mastersActivity.flush());
  report.checks.push({id:course+'-unavailable-open',status:'PASS',retryRecovered:true,newAttemptSaved:true});
 }catch(error){report.failures.push({course,id:'unavailable-open',error:error.stack});await blockedPage.screenshot({path:path.join(here,`${course}-blocked-failure.png`),fullPage:true}).catch(()=>{});}finally{await blocked.close();}
}}finally{await browser.close();report.status=report.failures.length?'FAIL':'PASS';report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failures.length)process.exitCode=1;}
