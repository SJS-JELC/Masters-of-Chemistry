import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {productionRegistry} from '../../../../src/foundation/registry.ts';
const app=path.resolve(import.meta.dirname,'../../../..'),out=import.meta.dirname,require=createRequire(path.resolve(app,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
process.env.TEMP=process.env.TMP=path.join(app,'.u05tmp');fs.mkdirSync(process.env.TEMP,{recursive:true});
const before=process.argv.includes('--before');
const report={status:'RUNNING',startedAt:new Date().toISOString(),base:'http://127.0.0.1:5192/',checks:[],errors:[],scope:before?'Retained pre-fix current static calorimetry failure':'Current post-fix static all11 curriculum families; compact widths as well as row alignment'};
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext(),page=await context.newPage();
page.on('pageerror',error=>report.errors.push(error.message));
try {
 for(const width of before?[1440]:[1440,390,350]) {
  await page.setViewportSize({width,height:width>1000?1000:844});
  const targets=productionRegistry.activities.filter(a=>a.strand==='curriculum'&&(!before||a.id==='igcse/calorimetry'));
  for(const activity of targets) {
   const gem=activity.gems[0],url=report.base+activity.course+'/?course='+activity.course+'&activity='+encodeURIComponent(activity.id)+'&gem='+gem.id+'&level='+gem.supportedLevels[0]+'&fresh=1';
   await page.goto(url);await page.locator('.question-actions').waitFor();await page.evaluate(()=>document.fonts.ready);
   const row=await page.locator('.question-actions').evaluate(element=>{
    const rect=element.getBoundingClientRect();const buttons=[...element.querySelectorAll('button')].map(button=>{const box=button.getBoundingClientRect(),css=getComputedStyle(button);return{text:button.textContent.trim(),left:box.left,right:box.right,y:box.y,width:box.width,height:box.height,font:css.fontFamily};});
    return{viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,rowCount:document.querySelectorAll('.question-actions').length,row:{left:rect.left,right:rect.right,width:rect.width},buttons,totalOccupied:buttons.at(-1).right-buttons[0].left};
   });
   const name=activity.id.replace('/','-')+'-'+width;row.name=name;report.checks.push(row);
   const screenshot=before?'before-'+name+'.png':name+'.png';await page.screenshot({path:path.join(out,screenshot),fullPage:true});
   assert.equal(row.rowCount,1);assert.deepEqual(row.buttons.map(button=>button.text),['Check','Clear','Give Up','Next']);
   assert(row.buttons.every(button=>Math.abs(button.y-row.buttons[0].y)<1&&button.height>=44&&button.font.startsWith('Comfortaa')));
   assert(Math.abs(row.row.right-row.buttons.at(-1).right)<1);assert(row.pageWidth<=row.viewport);
   // Right-edge alignment alone allowed four width100% flex children to fill the entire row.
   // Assert natural compact widths and a substantial left gap on desktop too.
   const compact=row.buttons.every(button=>button.width<160)&&row.totalOccupied<400;
   row.compact=compact;
   if(width>=1000)assert(row.totalOccupied<row.row.width*.6,'Desktop footer fills pane: '+name);
   assert(compact,'Footer buttons are not compact: '+name);
   row.status='PASS';
  }
 }
 assert.equal(report.errors.length,0);report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.stack;if(!before)process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,before?'footer-browser-before.json':'footer-browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure}));}
