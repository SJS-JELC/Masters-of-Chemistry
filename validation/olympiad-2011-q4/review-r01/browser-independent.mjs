import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const here=import.meta.dirname, project=path.resolve(here,'../../..');
const require=createRequire(path.resolve(project,'../../package.json'));
const port=5193, origin=`http://127.0.0.1:${port}`, run=`r01-${Date.now()}`;
const log=fs.openSync(path.join(here,'vite.txt'),'w');
const server=spawn(process.execPath,[path.join(project,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:project,windowsHide:true,stdio:['ignore',log,log]});
const report={job:'OLY2011-REVIEW',startedAt:new Date().toISOString(),checks:[],errors:[],status:'RUNNING',browser:'Pinned workspace Playwright; installed Edge; headless'};
let browser,page;
const ready=()=>page.waitForFunction(()=>window.__mastersOlympiad?.snapshot().progress?.activityId==='alevel/olympiad-2011-q4');
const snap=()=>page.evaluate(()=>window.__mastersOlympiad.snapshot());
const flush=()=>page.evaluate(()=>window.__mastersOlympiad.flush());
const settleFocus=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function check(id,fn){await fn();report.checks.push({id,status:'PASS',at:new Date().toISOString()});}
async function tableCounts(p=page){return p.evaluate(async()=>{
 const name=window.__mastersOlympiad.snapshot().databaseName;
 const db=await new Promise((r,j)=>{const q=indexedDB.open(name);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});
 const out={};for(const name of ['olympiad','attempts','evidence','sessions'])out[name]=await new Promise((r,j)=>{const q=db.transaction(name).objectStore(name).count();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});db.close();return out;
});}
try{
 await new Promise((resolve,reject)=>{let bytes='';const deadline=setTimeout(()=>reject(Error('Vite readiness deadline')),20000);const stream=fs.createReadStream(path.join(here,'vite.txt'));stream.close();const timer=setInterval(()=>{bytes=fs.readFileSync(path.join(here,'vite.txt'),'utf8');if(bytes.includes(`:${port}/`)){clearInterval(timer);clearTimeout(deadline);resolve();}if(server.exitCode!==null){clearInterval(timer);clearTimeout(deadline);reject(Error('Vite failed: '+bytes));}},100);});
 browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:1000}});page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 report.requests=[];page.on('requestfailed',q=>report.requests.push({url:q.url(),failed:q.failure()}));page.on('response',r=>{if(r.status()>=400)report.requests.push({url:r.url(),status:r.status()});});
 const url=`${origin}/alevel.html?run=${run}&view=olympiad`;
 try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor({timeout:30000});}
 catch(e){report.coldBootstrap=String(e);await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor({timeout:30000});}
 await page.getByRole('button',{name:'UK Olympiad 2011 · Seven isomers',exact:true}).click();await ready();
 await check('actual-keyboard-construction-butan1ol-and-uniform-accessible-feedback',async()=>{
  const canvas=page.locator('.molecule-workspace');await canvas.focus();await canvas.press('Enter');await settleFocus();
  for(let i=0;i<3;i++){const atom=page.locator('.molecule-workspace [data-atom]').last();await atom.focus();await atom.press('ArrowRight');await atom.press('Enter');await flush();await settleFocus();assert.equal((await snap()).progress.drawings['1'].graph.atoms.length,i+2);}
  await page.getByRole('button',{name:'Oxygen',exact:true}).click();const atom=page.locator('.molecule-workspace [data-atom]').last();await atom.focus();await atom.press('ArrowRight');await atom.press('Enter');await flush();await settleFocus();
  assert.equal((await snap()).progress.drawings['1'].graph.atoms.length,5);
  await page.getByRole('button',{name:'Check',exact:true}).click();await flush();
  assert.equal((await snap()).progress.check.fullyCorrect,1);
  assert.equal(await page.locator('.isomer-assessment [role=status]').innerText(),'1 fully correct; 0 correct but in the wrong place.');
  const states=await page.locator('[data-isomer-box]').evaluateAll(ns=>ns.map(n=>({label:n.getAttribute('aria-label'),border:getComputedStyle(n).borderColor,mark:n.querySelector('.answer-status').textContent,hidden:n.querySelector('.answer-status').getAttribute('aria-hidden')})));
  assert(states.every(s=>s.border==='rgb(255, 222, 89)'&&s.mark==='?'&&s.hidden==='true'&&!/correct|wrong|butan/i.test(s.label)));
  assert.equal(await page.locator('[data-isomer-box].is-correct').count(),0);
  await page.screenshot({path:path.join(here,'keyboard-alcohol-partial.png'),fullPage:true});
  await page.getByRole('button',{name:'Undo',exact:true}).click();await flush();assert.equal((await snap()).progress.check,null);assert.equal(await page.locator('.answer-status').count(),0);
 });
 await check('rapid-queued-commands-preserve-all-boxes-and-final-save',async()=>{
  await page.evaluate(async()=>{const {isomerChallenge}=await import('/src/activities/olympiad/isomers2011/content.ts');await Promise.all(isomerChallenge.answers.map(a=>window.__mastersOlympiad.command({kind:'draw',box:a.id,drawing:{kind:'molecule',graph:a.graph,history:[]}})));await window.__mastersOlympiad.flush();});
  const before=(await snap()).progress;assert.equal(Object.keys(before.drawings).length,7);
  const stored=await page.evaluate(async()=>{const {createChemistryRepository}=await import('/src/persistence/repository.ts');const r=createChemistryRepository(window.__mastersOlympiad.snapshot().databaseName);try{return(await r.loadOlympiad('local','alevel/olympiad-2011-q4')).value;}finally{r.close();}});assert.deepEqual(stored,before);
  await page.reload();await ready();assert.deepEqual((await snap()).progress,before);
 });
 await check('failed-save-back-is-blocked-then-retry-restores-navigation',async()=>{
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();await page.getByRole('button',{name:'UK Olympiad 2011 · Seven isomers',exact:true}).click();await ready();
  await page.evaluate(()=>{window.originalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...a){if(this.name==='olympiad')throw new DOMException('Full','QuotaExceededError');return window.originalPut.apply(this,a);};});
  await page.locator('[data-isomer-box="7"]').click();await flush();await page.getByRole('alert').filter({hasText:'Storage is full'}).waitFor();
  await page.goBack();await page.waitForFunction(()=>new URL(location.href).searchParams.get('activity')==='alevel/olympiad-2011-q4');assert.equal((await snap()).progress.selected,'7');
  await page.evaluate(()=>IDBObjectStore.prototype.put=window.originalPut);await page.getByRole('button',{name:'Retry save',exact:true}).click();await flush();await page.waitForFunction(()=>window.__mastersOlympiad.snapshot().saveStatus.kind==='saved');
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();
  await page.getByRole('button',{name:'UK Olympiad 2011 · Seven isomers',exact:true}).click();await ready();assert.equal((await snap()).progress.selected,'7');
 });
 await check('seven-correct-completion-lock-restart-cancel-and-no-curriculum-records',async()=>{
  await page.getByRole('button',{name:'Check',exact:true}).click();await flush();assert.equal((await snap()).progress.completed,true);
  assert.equal(await page.locator('[data-isomer-box].is-correct').count(),7);assert(await page.getByRole('button',{name:'Undo',exact:true}).isDisabled());
  const before=(await snap()).progress;await page.getByRole('button',{name:'Restart challenge',exact:true}).click();await page.getByRole('button',{name:'Keep drawings',exact:true}).click();assert.deepEqual((await snap()).progress,before);
  await page.screenshot({path:path.join(here,'completion.png'),fullPage:true});
  assert.deepEqual(await tableCounts(),{olympiad:1,attempts:0,evidence:0,sessions:0});
 });
 await check('fresh-teacher-direct-link-writes-no-pupil-progress',async()=>{
  const teacher=await context.newPage();teacher.on('pageerror',e=>report.errors.push(e.message));await teacher.goto(`${origin}/alevel.html?run=${run}-teacher&activity=alevel/olympiad-2011-q4&mode=teacher`);await teacher.waitForSelector('.isomer-teacher-answer');
  await teacher.locator('[data-isomer-box="6"]').click();assert((await teacher.locator('.isomer-teacher-answer').innerText()).includes('1-Methoxypropane'));
  assert(await teacher.getByRole('button',{name:'Oxygen',exact:true}).isDisabled());await teacher.locator('.molecule-workspace').focus();await teacher.keyboard.press('Enter');
  assert.deepEqual(await tableCounts(teacher),{olympiad:0,attempts:0,evidence:0,sessions:0});await teacher.close();
 });
 await check('mobile-touch-modal-scroll-keyboard-focus-and-320px-reflow',async()=>{
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}), p=await mobile.newPage();p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto(`${origin}/alevel.html?run=${run}-mobile&activity=alevel/olympiad-2011-q4`);await p.waitForSelector('.molecule-workspace');
  await p.locator('[data-isomer-box="5"]').tap();const canvas=p.locator('.molecule-workspace');await canvas.scrollIntoViewIfNeeded();const b=await canvas.boundingBox();await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await p.evaluate(()=>window.__mastersOlympiad.flush());assert.equal((await p.evaluate(()=>window.__mastersOlympiad.snapshot())).progress.drawings['5'].graph.atoms.length,1);
  const opener=p.getByRole('button',{name:'Enlarge compound 3 NMR spectrum',exact:true});await opener.tap();const dialog=p.getByRole('dialog',{name:'Enlarged compound 3 NMR spectrum'});await dialog.waitFor();
  const scroller=dialog.getByLabel('Scroll enlarged spectrum');const geometry=await scroller.evaluate(n=>({width:n.clientWidth,scroll:n.scrollWidth}));assert(geometry.scroll>geometry.width);
  await scroller.focus();await scroller.press('End');await scroller.evaluate(n=>{n.scrollLeft=n.scrollWidth;n.scrollTop=n.scrollHeight;});assert(await scroller.evaluate(n=>n.scrollLeft>0));await p.screenshot({path:path.join(here,'mobile-zoom-right.png')});
  await p.keyboard.press('Escape');assert(!(await dialog.isVisible()));assert(await opener.evaluate(n=>n===document.activeElement));
  await p.setViewportSize({width:320,height:740});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(here,'mobile-320.png'),fullPage:true});await mobile.close();
 });
 assert.equal(report.errors.length,0);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=String(e.stack||e);process.exitCode=1;if(page)await page.screenshot({path:path.join(here,'failure.png'),fullPage:true}).catch(()=>{});}
finally{if(browser)await browser.close();server.kill();await new Promise(resolve=>server.exitCode!==null?resolve():server.once('exit',resolve));fs.closeSync(log);report.finishedAt=new Date().toISOString();report.cleanup={browserClosed:true,serverExitCode:server.exitCode,serverSignal:server.signalCode};fs.writeFileSync(path.join(here,'browser-independent.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
