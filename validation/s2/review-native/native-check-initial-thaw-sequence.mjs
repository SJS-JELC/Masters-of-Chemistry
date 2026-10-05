import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import {spawn} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=import.meta.dirname,project=resolve(here,'../../..'),run=`a07s2-${Date.now().toString(36)}`;
const profile=resolve(project,'.browser',run),port=9367;
mkdirSync(profile,{recursive:true});mkdirSync(here,{recursive:true});
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
function fingerprints(root){return readdirSync(root,{withFileTypes:true}).flatMap(e=>{const p=resolve(root,e.name);return e.isDirectory()?fingerprints(p):[{path:relative(project,p).replaceAll('\\','/'),sha256:sha(p)}];});}
const channel=process.argv[2]||'chrome';
const exe=channel==='edge'?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':'C:/Program Files/Google/Chrome/Application/chrome.exe';
const args=[`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-gpu','--window-size=1440,1000','about:blank'];
const report={id:'S2-REVIEW-NATIVE',agentId:'A07',runId:'MASTERS-REACT-20261002',run,startedAt:new Date().toISOString(),status:'RUNNING',channel,exe,args,profile,noDefaults:true,requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModel:null,effectiveEffort:null,usage:null,playwright:JSON.parse(readFileSync(resolve(project,'../../node_modules/playwright/package.json'))).version,sourceBefore:fingerprints(resolve(project,'src')),cases:[],pageErrors:[]};
assert.equal(report.playwright,'1.62.1');
const save=()=>writeFileSync(resolve(here,`${run}-results.json`),JSON.stringify(report,null,2)+'\n');save();
const child=spawn(exe,args,{stdio:['ignore','ignore','pipe'],windowsHide:false});
child.stderr.on('data',data=>writeFileSync(resolve(here,`${run}-browser-stderr.log`),data,{flag:'a'}));
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let browser,page,cdp;
try{
 let ready=false;for(let i=0;i<80;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok){report.endpoint=await r.json();ready=true;break;}}catch{}await delay(250);}assert(ready,'Isolated native browser endpoint');
 browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`,{noDefaults:true,isLocal:true,artifactsDir:here});report.browserVersion=browser.version();
 const context=browser.contexts()[0];page=context.pages()[0]??await context.newPage();cdp=await context.newCDPSession(page);
 page.on('pageerror',error=>report.pageErrors.push(error.message));
 const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
 const flush=()=>page.evaluate(async()=>{await window.__mastersActivity.checkpoint();await window.__mastersActivity.flush();});
 const active=s=>s.attempt.phase==='answering'?s.attempt.timing.activeMs:s.attempt.firstResponse.timing.activeMs;
 const clock=s=>s.attempt.phase==='answering'?s.attempt.timing:s.attempt.firstResponse.timing;
 const observe=async(c,label)=>{await flush();const state=await snap(),window=await cdp.send('Browser.getWindowForTarget'),native=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus(),visibility:document.visibilityState,wallMs:Date.now(),monoMs:performance.now()}));const value={label,...native,window,phase:state.attempt.phase,attemptId:state.attempt.attemptId,activeMs:active(state),idleLimitMs:clock(state).idleLimitMs};c.observations.push(value);save();return value;};
 async function interact(){await page.keyboard.press('Tab');await delay(1500);await flush();}
 async function fillAnswer(c){
  const s=await snap();
  if(c.family==='acid'){const controls=page.getByLabel(/Your answer/);for(let i=0;i<s.question.parts.length;i++)await controls.nth(i).fill(String(s.question.parts[i].acceptance.expected));}
  if(c.family==='structure')await page.getByLabel('Your explanation',{exact:true}).fill('I am unsure why the bonding and structure produce these different properties.');
  if(c.family==='dot'){
   const details=page.locator('.editor-alternatives');if(!await details.evaluate(el=>el.open))await details.locator(':scope > summary').click();
   await page.getByLabel('Element',{exact:true}).selectOption('H');await page.getByRole('button',{name:'Add atom',exact:true}).click();
  }
  await flush();
 }
 const definitions=[{id:'acid-60000',course:'alevel',family:'acid',target:'u6-t1-1-2:1',allowance:60000},{id:'structure-180000',course:'igcse',family:'structure',target:'lower-6-5:3',allowance:180000},{id:'dot-180000',course:'alevel',family:'dot',target:'l6-t2-1-3:1',allowance:180000},{id:'dot-300000',course:'alevel',family:'dot',target:'l6-t2-1-3:3',allowance:300000}];
 for(const definition of definitions){
  const c={...definition,status:'RUNNING',startedAt:new Date().toISOString(),observations:[],checks:[]};report.cases.push(c);save();console.log(JSON.stringify({milestone:'CASE START',id:c.id,allowanceMs:c.allowance}));
  await page.goto(`http://127.0.0.1:5181/${c.course}.html?run=${run}-${c.id}`);await page.bringToFront();
  await page.getByLabel('Target',{exact:true}).selectOption(c.target);
  for(let n=0;n<25;n++){
   const old=(await snap()).attempt?.attemptId;await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id&&!!window.__mastersActivity?.snapshot().attempt,old);await flush();
   if(clock(await snap()).idleLimitMs===c.allowance)break;
  }
  let s=await snap();assert.equal(clock(s).idleLimitMs,c.allowance);c.initialRef=s.question.ref;c.initialAttemptId=s.attempt.attemptId;
  await page.evaluate(()=>{window.__A07Events=[];for(const name of ['visibilitychange','blur','focus'])(name==='visibilitychange'?document:window).addEventListener(name,event=>window.__A07Events.push({name,trusted:event.isTrusted,at:Date.now(),hidden:document.hidden,focused:document.hasFocus()}));});
  await fillAnswer(c);await interact();const initial=await observe(c,'foreground');assert.equal(initial.hidden,false);assert.equal(initial.focused,true);assert(initial.activeMs>0);
  const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await delay(600);const background=await observe(c,'native other tab foreground');assert(background.hidden);assert.equal(background.focused,false);
  await delay(3200);const backgroundEnd=await observe(c,'after background interval');assert.equal(backgroundEnd.activeMs,background.activeMs);
  await page.bringToFront();await delay(1300);const returned=await observe(c,'foreground without input');assert.equal(returned.hidden,false);assert.equal(returned.activeMs,background.activeMs);
  await interact();const resumed=await observe(c,'trusted key resumes');assert(resumed.activeMs>returned.activeMs);await other.close();c.checks.push('native background stops; focus alone stopped; trusted input resumes');
  const win=await cdp.send('Browser.getWindowForTarget');await cdp.send('Browser.setWindowBounds',{windowId:win.windowId,bounds:{windowState:'minimized'}});await delay(500);const minimized=await observe(c,'minimized');assert.equal(minimized.window.bounds.windowState,'minimized');assert(minimized.hidden&&!minimized.focused);
  await delay(1800);assert.equal((await observe(c,'minimized interval')).activeMs,minimized.activeMs);
  await cdp.send('Browser.setWindowBounds',{windowId:win.windowId,bounds:{windowState:'normal'}});await page.bringToFront();await delay(1100);assert.equal((await observe(c,'restore without input')).activeMs,minimized.activeMs);
  await interact();assert((await observe(c,'input after restore')).activeMs>minimized.activeMs);c.checks.push('actual minimized bounds and native hidden/focus stop until trusted input');
  const beforeSuspension=await observe(c,'before native lifecycle freeze');const frozenAt=Date.now();await cdp.send('Page.setWebLifecycleState',{state:'frozen'});await delay(6500);await cdp.send('Page.setWebLifecycleState',{state:'active'});await delay(1100);const afterSuspension=await observe(c,'after native lifecycle thaw');c.suspensionWallMs=Date.now()-frozenAt;assert.equal(afterSuspension.activeMs,beforeSuspension.activeMs);await interact();assert((await observe(c,'trusted input after thaw')).activeMs>afterSuspension.activeMs);c.checks.push('real browser lifecycle freeze callback gap excludes suspension; trusted input resumes');
  await page.getByRole('button',{name:'Pause',exact:true}).click();await flush();const paused=await snap();await delay(1100);await flush();assert.equal(active(await snap()),active(paused));
  await page.reload();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId===id,paused.attempt.attemptId);await flush();s=await snap();assert.deepEqual(s.attempt.currentResponses,paused.attempt.currentResponses);assert.deepEqual(s.attempt.ref,paused.attempt.ref);assert.equal(active(s),active(paused));
  await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await interact();assert(active(await snap())>active(paused));c.checks.push('pause/reload/restore keeps ID/ref/answers/time; resume interaction accrues');
  await page.keyboard.press('Tab');const idleStart=await observe(c,'last trusted input before real idle');c.idleWaitStartedAt=new Date().toISOString();save();console.log(JSON.stringify({milestone:'REAL IDLE START',id:c.id,allowanceMs:c.allowance}));
  const wallIdleStart=Date.now();let remaining=c.allowance+1700;while(remaining>0){const chunk=Math.min(30000,remaining);await delay(chunk);remaining-=chunk;}
  const idleEnd=await observe(c,'real documented idle cutoff');c.actualIdleWallMs=Date.now()-wallIdleStart;const delta=idleEnd.activeMs-idleStart.activeMs;assert.equal(idleEnd.hidden,false);assert.equal(idleEnd.focused,true);assert(delta>=c.allowance-1800&&delta<=c.allowance+500,`Idle delta ${delta} matches ${c.allowance}`);
  await delay(1400);assert.equal((await observe(c,'after cutoff no input')).activeMs,idleEnd.activeMs);c.idleDeltaMs=delta;c.checks.push('minimum real documented wall idle reaches native source allowance and remains stopped');save();console.log(JSON.stringify({milestone:'REAL IDLE PASS',id:c.id,wallMs:c.actualIdleWallMs,activeDeltaMs:delta}));
  await interact();assert(active(await snap())>idleEnd.activeMs);await fillAnswer(c);
  const submitName=c.family==='structure'?'Submit and freeze response':'Check answer';await page.getByRole('button',{name:submitName,exact:true}).click();await flush();s=await snap();assert.equal(s.attempt.phase,c.family==='structure'?'rubric-review':'assessed');const firstResponse=structuredClone(s.attempt.firstResponse);c.firstTiming=firstResponse.timing;
  await delay(1200);await flush();assert.deepEqual((await snap()).attempt.firstResponse,firstResponse);
  if(c.family==='structure'){
   while((await snap()).attempt.reviews.some(r=>r.activePointId!==null)){await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).first().click();await flush();}
   await page.getByRole('button',{name:'Finish self-review',exact:true}).click();await flush();
  }
  s=await snap();assert.equal(s.attempt.phase,'assessed');assert.equal(s.history.length,1);assert.deepEqual(s.history[0].timing,firstResponse.timing);c.firstAssessment=structuredClone(s.attempt.firstAssessment);
  await page.reload();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId===id,c.initialAttemptId);await flush();s=await snap();assert.deepEqual(s.attempt.firstResponse,firstResponse);assert.deepEqual(s.attempt.firstAssessment,c.firstAssessment);assert.equal(s.history.length,1);c.nativeEvents=await page.evaluate(()=>window.__A07Events??[]); // reload clears diagnostic listener; earlier observations retain native states
  await page.screenshot({path:resolve(here,`${run}-${c.id}-assessed.png`),fullPage:true});c.screenshot=`${run}-${c.id}-assessed.png`;
  const assessedId=s.attempt.attemptId;await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id,assessedId);await flush();s=await snap();assert.equal(s.attempt.phase,'answering');assert(s.attempt.timing.activeMs<1200);assert.equal(s.history.length,1);c.nextRef=s.attempt.ref;c.nextAttemptId=s.attempt.attemptId;c.checks.push('first freeze/rubric time and one saved evidence persist on reload; Next fresh identity/time');
  c.status='PASS';c.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({milestone:'CASE PASS',id:c.id,firstActiveMs:c.firstTiming.activeMs,nextId:c.nextAttemptId}));
 }
 report.sourceAfter=fingerprints(resolve(project,'src'));assert.deepEqual(report.sourceAfter,report.sourceBefore);report.sourceUnchanged=true;assert.deepEqual(report.pageErrors,[]);report.status='PASS';
}catch(error){report.status='ESCALATE';report.failure={message:error.message,stack:error.stack};if(page){report.failureSnapshot=await page.evaluate(()=>({hidden:document.hidden,focused:document.hasFocus(),body:document.body.innerText,snapshot:window.__mastersActivity?.snapshot()})).catch(e=>({error:e.message}));await page.screenshot({path:resolve(here,`${run}-failure.png`),fullPage:true}).catch(()=>{});}report.sourceAfter=fingerprints(resolve(project,'src'));report.sourceUnchanged=JSON.stringify(report.sourceAfter)===JSON.stringify(report.sourceBefore);console.error(error);}
finally{report.finishedAt=new Date().toISOString();report.scriptSha256=sha(resolve(here,'native-check.mjs'));save();writeFileSync(resolve(here,'latest-results.json'),JSON.stringify(report,null,2)+'\n');if(browser){const session=await browser.newBrowserCDPSession().catch(()=>null);if(session)await session.send('Browser.close').catch(()=>{});await browser.close().catch(()=>{});}child.kill();console.log(JSON.stringify({status:report.status,run,result:`validation/s2/review-native/${run}-results.json`}));process.exitCode=report.status==='PASS'?0:1;}
