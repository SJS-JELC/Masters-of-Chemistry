import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import {spawn} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=import.meta.dirname,project=resolve(here,'../../..'),run=`a06s2-${Date.now().toString(36)}`;
mkdirSync(here,{recursive:true});
const profile=resolve(project,`.browser/${run}`),port=9368;
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const fingerprints=root=>readdirSync(root,{withFileTypes:true}).flatMap(e=>{const p=resolve(root,e.name);return e.isDirectory()?fingerprints(p):[{path:relative(project,p).replaceAll('\\','/'),sha256:sha(p)}];});
const priorPath=resolve(project,'validation/s2/review-native/tail-results.json'),prior=JSON.parse(readFileSync(priorPath));
const priorDot=prior.cases.find(c=>c.id==='dot-180000'),priorBefore=priorDot.observations.find(o=>o.label==='before native lifecycle freeze'),priorAfter=priorDot.observations.find(o=>o.label==='after native lifecycle thaw');
const report={agentId:'A06',jobId:'S2-REVIEW-SUSPENSION',run,startedAt:new Date().toISOString(),status:'RUNNING',requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModelEffort:null,usage:null,profile,playwright:JSON.parse(readFileSync(resolve(project,'../../node_modules/playwright/package.json'))).version,sourceBefore:fingerprints(resolve(project,'src')),priorEvidence:{path:relative(project,priorPath).replaceAll('\\','/'),sha256:sha(priorPath),status:prior.status,before:priorBefore,after:priorAfter,analysis:'Retained failure has a backwards performance.now and cleared diagnostic array, consistent with a replaced document. Original report did not retain document timeOrigin or navigation records; 996ms cannot be assigned to frozen accrual from that evidence alone.'},cases:[],nativeEvents:[],navigations:[],cdpLifecycle:[],console:[],pageErrors:[]};
const save=()=>writeFileSync(resolve(here,'results.json'),JSON.stringify(report,null,2)+'\n');
save();assert.equal(report.playwright,'1.62.1');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const exe='C:/Program Files/Google/Chrome/Application/chrome.exe';
const args=[`--user-data-dir=${profile}`,`--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--disable-gpu','--window-size=1440,1000','about:blank'];
report.launch={exe,args,noDefaults:true};
const child=spawn(exe,args,{stdio:['ignore','ignore','pipe'],windowsHide:false});
child.stderr.on('data',data=>writeFileSync(resolve(here,'browser-stderr.log'),data,{flag:'a'}));
let browser,page,cdp;
try {
 let ready=false;for(let n=0;n<80;n++){try{const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok){report.endpoint=await r.json();ready=true;break;}}catch{}await delay(250);}assert(ready,'Isolated native browser endpoint');
 browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`,{noDefaults:true,isLocal:true,artifactsDir:here});report.browserVersion=browser.version();
 const context=browser.contexts()[0];page=context.pages()[0]??await context.newPage();
 await page.exposeBinding('__a06Record',(_,value)=>{report.nativeEvents.push(value);});
 await page.addInitScript(()=>{
   const origin=performance.timeOrigin,token=crypto.randomUUID();window.__a06Document={origin,token};
   const emit=(event,stage)=>window.__a06Record({event:event.type,trusted:event.isTrusted,stage,wallMs:Date.now(),monoMs:performance.now(),timeOrigin:origin,token,url:location.href,hidden:document.hidden,focused:document.hasFocus(),key:event.key,attempt:window.__mastersActivity?.snapshot().attempt});
   for(const type of ['visibilitychange','freeze','resume','keydown'])document.addEventListener(type,event=>{emit(event,'capture');queueMicrotask(()=>emit(event,'after handlers'));},{capture:true});
   for(const type of ['focus','blur','pagehide','pageshow'])window.addEventListener(type,event=>{emit(event,'capture');queueMicrotask(()=>emit(event,'after handlers'));},{capture:true});
 });
 page.on('pageerror',e=>report.pageErrors.push(e.message));
 page.on('framenavigated',frame=>{if(frame===page.mainFrame())report.navigations.push({at:Date.now(),url:frame.url()});});
 page.on('console',message=>{if(/vite|disconnect|reload/i.test(message.text()))report.console.push({at:Date.now(),type:message.type(),text:message.text()});});
 cdp=await context.newCDPSession(page);await cdp.send('Page.setLifecycleEventsEnabled',{enabled:true});cdp.on('Page.lifecycleEvent',event=>report.cdpLifecycle.push({...event,nodeWallMs:Date.now()}));
 const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot());
 const flush=()=>page.evaluate(async()=>{await window.__mastersActivity.checkpoint();await window.__mastersActivity.flush();});
 const observe=async(c,label)=>{await flush();const result=await page.evaluate(label=>{const state=window.__mastersActivity.snapshot();return {label,wallMs:Date.now(),monoMs:performance.now(),timeOrigin:performance.timeOrigin,documentToken:window.__a06Document.token,hidden:document.hidden,focused:document.hasFocus(),visibility:document.visibilityState,attemptId:state.attempt.attemptId,phase:state.attempt.phase,activeMs:state.attempt.phase==='answering'?state.attempt.timing.activeMs:state.attempt.firstResponse.timing.activeMs,idleLimitMs:state.attempt.phase==='answering'?state.attempt.timing.idleLimitMs:state.attempt.firstResponse.timing.idleLimitMs}},label);c.observations.push(result);save();return result;};
 async function reviewFreeze(c){
  const before=await observe(c,'before freeze');assert(!before.hidden&&before.focused);
  const freezeEventIndex=report.nativeEvents.length,navigationIndex=report.navigations.length;
  const freezeRequestWall=Date.now();await cdp.send('Page.setWebLifecycleState',{state:'frozen'});const freezeAckWall=Date.now();await delay(6700);const thawRequestWall=Date.now();await cdp.send('Page.setWebLifecycleState',{state:'active'});const thawAckWall=Date.now();await delay(1200);
  const after=await observe(c,'after thaw without input');c.freeze={freezeRequestWall,freezeAckWall,thawRequestWall,thawAckWall,measuredFreezeMs:thawRequestWall-freezeAckWall,navigations:report.navigations.slice(navigationIndex),events:report.nativeEvents.slice(freezeEventIndex)};
  assert.equal(after.timeOrigin,before.timeOrigin,'Freeze must retain same document timeOrigin');assert.equal(after.documentToken,before.documentToken,'Freeze must retain same diagnostic document');assert.equal(c.freeze.navigations.length,0,'No document reload may masquerade as suspension');
  const boundary=c.freeze.events.filter(e=>e.timeOrigin===before.timeOrigin&&e.stage==='after handlers'&&['visibilitychange','freeze','blur'].includes(e.event)&&e.attempt?.attemptId===before.attemptId).at(-1);
  c.freeze.boundary=boundary??null;
  if(boundary){assert(boundary.trusted);assert(boundary.hidden||boundary.event==='freeze'||!boundary.focused);assert.equal(after.activeMs,boundary.attempt.timing.activeMs,'Frozen interval accrues no time after native boundary');const elapsed=boundary.monoMs-before.monoMs;const delta=boundary.attempt.timing.activeMs-before.activeMs;assert(delta>=0&&delta<=Math.max(0,elapsed)+1100,'Pre-freeze accounting cannot exceed real pre-boundary time plus measured one-second sample lag');c.freeze.preBoundaryDeltaMs=delta;c.freeze.preBoundaryElapsedMs=elapsed;}
  else assert.equal(after.activeMs,before.activeMs,'No suspension accrual without lifecycle pause boundary');
  await delay(1500);const stopped=await observe(c,'post-thaw stability without input');assert.equal(stopped.activeMs,after.activeMs);
  const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.bringToFront();await delay(600);const foreground=await observe(c,'native foreground no input');assert(!foreground.hidden&&foreground.focused);assert.equal(foreground.activeMs,after.activeMs);
  await page.keyboard.press('Tab');await delay(1600);const restarted=await observe(c,'trusted input resumes');assert(restarted.activeMs>foreground.activeMs);await other.close();c.checks.push('Same-document real lifecycle freeze and thaw exclude frozen interval; stable until trusted input');
 }
 for(const definition of [{id:'dot-180000',target:'l6-t2-1-3:1',allowance:180000},{id:'dot-300000',target:'l6-t2-1-3:3',allowance:300000}]){
  const c={...definition,status:'RUNNING',observations:[],checks:[]};report.cases.push(c);save();
  await page.goto(`http://127.0.0.1:5181/alevel.html?run=${run}-${c.id}`);await page.bringToFront();await page.getByLabel('Target',{exact:true}).selectOption(c.target);await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.waitForFunction(()=>!!window.__mastersActivity?.snapshot().attempt);await flush();
  let s=await snap();assert.equal(s.attempt.timing.idleLimitMs,c.allowance);assert.equal(s.attempt.ref.activityId,'alevel/dot-and-cross');assert.equal(s.session.kind,'practice');c.initialAttemptId=s.attempt.attemptId;c.initialRef=s.attempt.ref;
  await page.locator('.editor-alternatives > summary').click();await page.getByLabel('Element',{exact:true}).selectOption('H');await page.getByRole('button',{name:'Add atom',exact:true}).click();await page.keyboard.press('Tab');await delay(1600);
  await page.keyboard.press('Tab');const idleStart=await observe(c,'after final trusted input before idle');const key=report.nativeEvents.filter(e=>e.event==='keydown'&&e.trusted&&e.stage==='after handlers'&&e.timeOrigin===idleStart.timeOrigin).at(-1);assert(key);assert.equal(key.attempt.attemptId,c.initialAttemptId);c.idle={keyEvent:key,start:idleStart,nodeStartWall:Date.now()};save();console.log(JSON.stringify({milestone:'REAL IDLE START',id:c.id,allowance:c.allowance}));
  const waitUntil=Date.now()+c.allowance+2200;while(Date.now()<waitUntil)await delay(Math.min(30000,waitUntil-Date.now()));
  const idleEnd=await observe(c,'after documented real idle');c.idle.end=idleEnd;c.idle.actualWallMs=Date.now()-c.idle.nodeStartWall;c.idle.deltaMs=idleEnd.activeMs-idleStart.activeMs;c.idle.preObservationMs=idleStart.monoMs-key.monoMs;
  assert(!idleEnd.hidden&&idleEnd.focused);assert.equal(idleEnd.timeOrigin,idleStart.timeOrigin);assert(c.idle.actualWallMs>=c.allowance);assert(c.idle.deltaMs<=c.allowance+2&&c.idle.deltaMs>=c.allowance-c.idle.preObservationMs-2,`Idle delta ${c.idle.deltaMs} must match deadline allowance minus observed input-to-checkpoint interval ${c.idle.preObservationMs}`);
  await delay(1600);assert.equal((await observe(c,'idle cutoff stays stopped')).activeMs,idleEnd.activeMs);c.checks.push(`Real ${c.allowance}ms documented idle allowance reaches precise deadline and remains stopped`);save();console.log(JSON.stringify({milestone:'REAL IDLE PASS',id:c.id,wallMs:c.idle.actualWallMs,deltaMs:c.idle.deltaMs}));
  await page.keyboard.press('Tab');await delay(1400);assert((await observe(c,'trusted input after idle')).activeMs>idleEnd.activeMs);
  await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');await flush();s=await snap();const firstResponse=structuredClone(s.attempt.firstResponse),firstAssessment=structuredClone(s.attempt.firstAssessment);c.firstResponse=firstResponse;c.firstAssessment=firstAssessment;assert.equal(s.history.length,1);assert.deepEqual(s.history[0].timing,firstResponse.timing);
  await delay(1500);await page.keyboard.press('Tab');await flush();assert.deepEqual((await snap()).attempt.firstResponse,firstResponse);await page.reload();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId===id,c.initialAttemptId);await flush();s=await snap();assert.deepEqual(s.attempt.firstResponse,firstResponse);assert.deepEqual(s.attempt.firstAssessment,firstAssessment);assert.equal(s.history.length,1);c.restored=s;
  await page.screenshot({path:resolve(here,`${c.id}-assessed.png`),fullPage:true});await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id,c.initialAttemptId);const next=await observe(c,'fresh Next');s=await snap();assert.equal(s.attempt.phase,'answering');assert.equal(s.attempt.timing.idleLimitMs,c.allowance);assert(next.activeMs<1200);assert.equal(s.history.length,1);c.next=s;c.checks.push('First timing/response/assessment immutable with one record after reload; Next creates fresh ID and correct allowance');
  c.status='PASS';save();console.log(JSON.stringify({milestone:'CASE PASS',id:c.id}));
 }
 const freezeCase=report.cases.at(-1);await page.keyboard.press('Tab');await delay(1500);await reviewFreeze(freezeCase);freezeCase.suspensionStatus='PASS';save();
 report.sourceAfter=fingerprints(resolve(project,'src'));assert.deepEqual(report.sourceAfter,report.sourceBefore);report.sourceUnchanged=true;assert.deepEqual(report.pageErrors,[]);report.status='PASS';
}catch(error){report.status='ESCALATE';report.failure={message:error.message,stack:error.stack};if(page){report.failureSnapshot=await page.evaluate(()=>({wallMs:Date.now(),monoMs:performance.now(),timeOrigin:performance.timeOrigin,hidden:document.hidden,focused:document.hasFocus(),snapshot:window.__mastersActivity?.snapshot()})).catch(e=>({error:e.message}));await page.screenshot({path:resolve(here,'failure.png'),fullPage:true}).catch(()=>{});}report.sourceAfter=fingerprints(resolve(project,'src'));report.sourceUnchanged=JSON.stringify(report.sourceAfter)===JSON.stringify(report.sourceBefore);console.error(error);}
finally{report.finishedAt=new Date().toISOString();report.scriptSha256=sha(resolve(here,'native-check.mjs'));save();if(browser){const session=await browser.newBrowserCDPSession().catch(()=>null);if(session)await session.send('Browser.close').catch(()=>{});await browser.close().catch(()=>{});}child.kill();console.log(JSON.stringify({status:report.status,result:'validation/s2/review-suspension/results.json'}));process.exitCode=report.status==='PASS'?0:1;}
