import fs from 'node:fs';import path from 'node:path';
import {chromium} from '../../../../../../node_modules/playwright/index.mjs';
const temp=path.join(import.meta.dirname,'t');fs.mkdirSync(temp,{recursive:true});process.env.TEMP=temp;process.env.TMP=temp;process.env.TMPDIR=temp;
const report={temp,tempLength:temp.length,events:[],errors:[],startedAt:new Date().toISOString()};
const browser=await chromium.launch({channel:'msedge',headless:true,args:[`--disk-cache-dir=${path.join(temp,'cache')}`]}),page=await browser.newPage();
page.on('response',r=>report.events.push({event:'response',url:r.url(),status:r.status()}));page.on('requestfailed',r=>report.events.push({event:'requestfailed',url:r.url(),failure:r.failure()}));page.on('pageerror',e=>report.errors.push(e.message));
try{await page.goto('http://127.0.0.1:5195/development/authoring/families/dev-refinement-starter/preview.html?run=a20-diagnostic',{timeout:15000,waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__mastersActivity,{timeout:10000});report.hostReady=true;report.text=await page.locator('body').innerText();await page.screenshot({path:path.join(import.meta.dirname,'diagnostic-short-temp.png'),fullPage:true});}catch(e){report.failure=e.stack;report.url=page.url();}
finally{await browser.close();fs.writeFileSync(path.join(import.meta.dirname,'diagnostic-short-temp.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({hostReady:report.hostReady,errors:report.errors,failure:report.failure?.split('\n')[0],events:report.events.length}));}
