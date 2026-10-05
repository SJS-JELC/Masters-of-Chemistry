import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const app=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname,require=createRequire(path.resolve(app,'../../package.json'));
process.env.TEMP=path.join(app,'btmp-popup');process.env.TMP=process.env.TEMP;
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
const report={status:'RUNNING',at:new Date().toISOString(),layouts:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const base=`http://127.0.0.1:5188/alevel.html?course=alevel&activity=alevel/olympiad-2011-q4&run=layout-${Date.now()}`;
try {
  await page.goto(base);await page.locator('[data-isomer-box="7"]').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.isomers2011>header').count(),0);
  for(const width of [1440,1024,820,768,600,390,350]) {
    await page.setViewportSize({width,height:1000});
    const r=await page.evaluate(()=>{const boxes=[...document.querySelectorAll('[data-isomer-box]')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,bottom:r.bottom,right:r.right}});return {width:innerWidth,scroll:document.documentElement.scrollWidth,boxes,heading:document.querySelector('.isomer-question-heading').getBoundingClientRect().bottom,clues:document.querySelector('.isomer-clues').getBoundingClientRect().top,rows:new Set(boxes.map(b=>b.y)).size};});
    assert.equal(r.boxes.length,7);assert(r.boxes.every(b=>b.y>=r.heading&&b.bottom<r.clues&&b.right<=width));assert(r.scroll<=width);
    assert.equal(r.rows,width>=768?1:width>480?2:4);assert(Math.max(...r.boxes.map(b=>b.w))-Math.min(...r.boxes.map(b=>b.w))<1);report.layouts.push(r);
    await page.screenshot({path:path.join(out,'empty-'+width+'.png'),fullPage:true});
  }
  await page.locator('[data-isomer-box="7"]').click();const dlg=page.locator('.olympiad-drawing-dialog');await dlg.waitFor();assert.equal(await dlg.getByRole('heading').innerText(),'Compound 7');
  const canvas=dlg.locator('.molecule-workspace'),r=await canvas.boundingBox();await canvas.click({position:{x:r.width/2,y:r.height/2}});await page.evaluate(()=>window.__mastersOlympiad.flush());await dlg.getByRole('button',{name:'Done',exact:true}).click();
  assert(await page.locator('[data-isomer-box="7"]').evaluate(e=>e===document.activeElement));await page.reload();await page.locator('[data-isomer-box="7"] .molecule-preview').waitFor();
  await page.locator('.isomer-assessment').getByRole('button',{name:'Check',exact:true}).click();await page.getByRole('status').filter({hasText:'fully correct'}).waitFor();
  await page.getByRole('button',{name:'Enlarge compound 3 NMR spectrum'}).click();await page.getByRole('dialog',{name:'Enlarged compound 3 NMR spectrum'}).waitFor();await page.getByRole('button',{name:'Close spectrum'}).click();
  await page.goto(base+'&mode=teacher');await page.locator('[data-isomer-box="7"] .molecule-preview').waitFor();
  for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(out,'structures-'+width+'.png'),fullPage:true});}
  assert.deepEqual(report.errors,[]);report.status='PASS';report.behaviour='Popup box7 draw/autosave/reload, focus return, aggregate Check and spectrum enlargement passed; reference structures rendered at desktop/tablet/mobile.';
}catch(e){report.status='FAIL';report.failure=e.stack;process.exitCode=1;await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});}
finally{fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,layouts:report.layouts.length,failure:report.failure}));await browser.close();}
