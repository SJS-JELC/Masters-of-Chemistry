import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const app=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const require=createRequire(path.resolve(app,'../../package.json'));
process.env.TEMP=path.join(app,'btmp-popup');process.env.TMP=process.env.TEMP;
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
const report={at:new Date().toISOString(),status:'RUNNING',checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
try {
  for(const course of ['alevel','igcse']) {
    const base=`http://127.0.0.1:5192/${course}/`;
    await page.goto(base+'?course=alevel&view=olympiad&activity=alevel/olympiad-2011-q4');
    await page.locator('[data-isomer-box="1"]').click();const d=page.locator('.olympiad-drawing-dialog');await d.waitFor();
    assert.equal(await page.evaluate(()=>typeof window.__mastersOlympiad),'undefined');
    await d.locator('.molecule-workspace').click({position:{x:180,y:170}});
    await d.getByRole('button',{name:'Done',exact:true}).click();await page.locator('.question-back').click();await page.locator('.olympiad-landing').waitFor();
    assert.equal(await page.locator('.question-back').innerText(),'←');
    await page.locator('[data-challenge-id="alevel/olympiad-2011-q4"]').click();await page.locator('[data-isomer-box="1"] .molecule-preview').waitFor();
    await page.reload();await page.locator('[data-isomer-box="1"] .molecule-preview').waitFor();assert.equal(await d.count(),0);
    await page.locator('.question-back').click();await page.getByRole('button',{name:'Back to A Level landing'}).click();await page.locator('.original-landing.alevel').waitFor();
    report.checks.push(course+' prefix: draw/save/guarded navigation/reload/two back destinations');
    await page.goto(base+'?course=alevel&view=olympiad&activity=alevel/c3l6-organic-reactions&mode=teacher');
    await page.getByRole('button',{name:'Part (b)',exact:true}).click();await page.getByRole('button',{name:/Draw structure A|Edit structure A|Structure A/}).first().click();await d.waitFor();
    assert(await d.getByRole('button',{name:'Clear structure',exact:true}).isDisabled());await d.getByRole('button',{name:'Done',exact:true}).click();
    report.checks.push(course+' prefix: direct read-only C3 preserved, no preview toggle');
    await page.goto(base+'?course='+course+'&activity='+(course==='alevel'?'alevel/electron-configurations':'igcse/calorimetry')+'&level=1&fresh=1');
    await page.getByRole('button',{name:'Start practice',exact:true}).click();
    await page.locator('.question-back[aria-label="Back to course map"]').waitFor();await page.locator('.question-back').click();await page.locator('.original-landing.'+course).waitFor();
    report.checks.push(course+' curriculum back default unchanged');
  }
  await page.goto('http://127.0.0.1:5192/alevel/?course=alevel&view=olympiad');await page.locator('.olympiad-landing').waitFor();await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'production-landing-390.png'),fullPage:true});
  await page.locator('[data-challenge-id="alevel/olympiad-2011-q4"]').click();await page.locator('[data-isomer-box="1"]').click();await page.screenshot({path:path.join(out,'production-popup-390.png')});
  assert.deepEqual(report.errors,[]);report.status='PASS';
} catch(e) {report.status='FAIL';report.failure=e.stack;process.exitCode=1;await page.screenshot({path:path.join(out,'production-failure.png')});}
finally {fs.writeFileSync(path.join(out,'production-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
