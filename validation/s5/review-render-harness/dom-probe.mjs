import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {seedStatic} from '../render-release/seed-static.mjs';
const here=import.meta.dirname,project=path.resolve(here,'../../..'),require=createRequire(path.join(project,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
fs.mkdirSync(path.join(here,'t'),{recursive:true});process.env.TEMP=path.join(here,'t');process.env.TMP=process.env.TEMP;
const {chromium}=require('playwright'),browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true}),p=await context.newPage();
const report={agentId:'A06',jobId:'S5-REVIEW-AX-DOT-HARNESS',startedAt:new Date().toISOString(),browser:await browser.version(),pageErrors:[]};p.on('pageerror',e=>report.pageErrors.push(e.message));
try{
 await seedStatic(p,{activityId:'alevel/dot-and-cross',questionId:'h2',seed:0,level:1},'A06-selector-probe');
 await p.getByText('Keyboard and non-drag controls',{exact:true}).click();
 await p.getByRole('button',{name:'Add atom',exact:true}).tap();await p.getByText('Saved on this device',{exact:true}).waitFor();
 await p.locator('.dc-atom-list button').last().tap();await p.getByLabel('Ion charge',{exact:true}).fill('-1');await p.getByRole('button',{name:'Apply bracket and charge',exact:true}).tap();await p.getByText('Saved on this device',{exact:true}).waitFor();
 const svg=p.locator('g[aria-label^="Ion "][aria-label$="charge -1"]');report.svg={count:await svg.count(),outerHTML:await svg.evaluate(el=>el.outerHTML),ariaSnapshot:await svg.ariaSnapshot()};
 await p.getByText('Electron inventory and deletion',{exact:true}).click();
 const broad=p.locator('details').filter({has:p.getByText('Electron inventory and deletion',{exact:true})});
 const precise=p.locator('details').filter({has:p.locator(':scope > summary').filter({hasText:/^Electron inventory and deletion$/})});
 report.broadCount=await broad.count();report.preciseCount=await precise.count();report.details=await broad.evaluateAll(es=>es.map(el=>({className:el.className,outerHTML:el.outerHTML})));
 report.inventory={text:await precise.innerText(),aria:await precise.ariaSnapshot(),lastItemText:await precise.getByRole('listitem').last().innerText()};
 assert.equal(report.broadCount,2);assert.equal(report.preciseCount,1);assert(report.inventory.lastItemText.includes('−'));assert(report.inventory.aria.includes('−'));assert(report.inventory.aria.includes('Remove bracket and charge'));assert.equal(report.pageErrors.length,0);
 await p.screenshot({path:path.join(here,'inventory-dom.png'),fullPage:true});report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'dom-probe.json'),JSON.stringify(report,null,2)+'\n');await context.close();await browser.close();console.log(JSON.stringify({status:report.status,broadCount:report.broadCount,preciseCount:report.preciseCount,failure:report.failure}));}
