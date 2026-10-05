import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const owned=import.meta.dirname,project=path.resolve(owned,'../../../..');
const require=createRequire(path.resolve(project,'../../package.json'));assert.equal(require('playwright/package.json').version,'1.62.1');const {chromium}=require('playwright');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const inputs=['development/authoring/serve.mjs','development/authoring/families/dev-refinement-starter/browser.mjs','development/authoring/families/dev-refinement-starter/generation-manifest.json','development/authoring/families/dev-refinement-starter/mount.tsx','development/authoring/families/dev-refinement-starter/Catalogue.tsx','development/authoring/families/dev-refinement-starter/tsconfig.json','src/foundation/ActivityHost.tsx'];
const fingerprint=()=>Object.fromEntries(inputs.map(p=>[p,hash(fs.readFileSync(path.join(project,p)))]));
const report={agentId:'A06',jobId:'S4-REVIEW-SCAFFOLD-STARTUP',startedAt:new Date().toISOString(),before:fingerprint(),cases:[],effectiveModelEffort:null,usage:null};
const short=path.join(owned,'t'),originalTemp=path.join(project,'validation/s4/authoring-release/refinement/dev-refinement-starter/browser-temp');
const long=path.join(owned,'x'.repeat(originalTemp.length-owned.length-1));assert.equal(long.length,originalTemp.length);
for(const [id,temp] of [['long',long],['short',short]]){
 fs.mkdirSync(temp,{recursive:true});process.env.TEMP=temp;process.env.TMP=temp;process.env.TMPDIR=temp;const row={id,temp,tempLength:temp.length,nodeTempRoot:os.tmpdir(),events:[],errors:[],navigations:[],startedAt:new Date().toISOString()};assert.equal(row.nodeTempRoot,temp);report.cases.push(row);
 let browser;
 try{browser=await chromium.launch({channel:'msedge',headless:true,args:[`--disk-cache-dir=${path.join(temp,'cache')}`],env:{...process.env,TEMP:temp,TMP:temp,TMPDIR:temp}});row.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 page.on('pageerror',e=>row.errors.push(e.message));page.on('response',r=>row.events.push({event:'response',url:r.url(),status:r.status(),at:Date.now()}));page.on('requestfailed',r=>row.events.push({event:'requestfailed',url:r.url(),error:r.failure(),at:Date.now()}));page.on('domcontentloaded',()=>row.events.push({event:'domcontentloaded',at:Date.now()}));page.on('load',()=>row.events.push({event:'load',at:Date.now()}));page.on('framenavigated',frame=>{if(frame===page.mainFrame())row.navigations.push({url:frame.url(),at:Date.now()});});
 const began=Date.now();await page.goto('http://127.0.0.1:5195/development/authoring/families/dev-refinement-starter/preview.html?run=a06-scaffold-'+id+'-'+Date.now(),{waitUntil:'domcontentloaded',timeout:30000});row.domReadyMs=Date.now()-began;
 await page.waitForFunction(()=>!!window.__mastersActivity,null,{timeout:15000});row.hostReadyMs=Date.now()-began;row.hostReady=true;
 try{await page.waitForLoadState('load',{timeout:10000});row.loadReadyMs=Date.now()-began;}catch(e){row.loadFailure=String(e);}
 row.document=await page.evaluate(()=>({readyState:document.readyState,timeOrigin:performance.timeOrigin,navigation:performance.getEntriesByType('navigation').map(e=>({type:e.type,domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd})),databaseName:window.__mastersActivity?.snapshot().databaseName,historyLength:window.__mastersActivity?.snapshot().history.length,attempt:window.__mastersActivity?.snapshot().attempt??null}));
 await page.screenshot({path:path.join(owned,id+'-startup.png'),fullPage:true});
 }catch(e){row.failure=String(e.stack??e);}finally{if(browser)await browser.close();row.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(owned,'diagnostic-corrected.json'),JSON.stringify(report,null,2));}
}
report.after=fingerprint();report.changed=inputs.filter(p=>report.before[p]!==report.after[p]);report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(owned,'diagnostic-corrected.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.cases.map(r=>({id:r.id,tempLength:r.tempLength,nodeTempRoot:r.nodeTempRoot,hostReady:r.hostReady,domReadyMs:r.domReadyMs,hostReadyMs:r.hostReadyMs,loadReadyMs:r.loadReadyMs,loadFailure:r.loadFailure,failure:r.failure,errors:r.errors,navigations:r.navigations.length})),changed:report.changed}));
