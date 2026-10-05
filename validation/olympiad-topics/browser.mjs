import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(path.resolve('../../package.json'));
process.env.TEMP=path.resolve('btmp-popup'); process.env.TMP=process.env.TEMP;
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const report={status:'RUNNING',layouts:[],errors:[]};
page.on('pageerror',error=>report.errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:5192/alevel/?course=alevel&view=olympiad');
  await page.locator('#olympiad-challenges[aria-busy=false]').waitFor();
  assert.equal(await page.locator('.olympiad-topic-pill').count(),8);
  for (const width of [1440,768,390,350]) {
    await page.setViewportSize({width,height:1000});
    await page.evaluate(()=>document.fonts.ready);
    const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      contained:[...document.querySelectorAll('.olympiad-topic-pill')].every(p=>{
        const r=p.getBoundingClientRect(), c=p.closest('button').getBoundingClientRect();
        return r.left>=c.left && r.right<=c.right;
      })}));
    assert(layout.contained); assert(layout.scrollWidth<=width); report.layouts.push(layout);
    await page.screenshot({path:`validation/olympiad-topics/landing-${width}.png`,fullPage:true});
  }
  for (const title of ['A Class of their Own','The Magnificent Seven']) {
    const card=page.getByRole('button',{name:new RegExp(title)});
    const description=await card.getAttribute('aria-describedby');
    assert(description && await page.locator(`[id="${description}"]`).textContent());
    await card.click();
    await page.locator('.question-back[aria-label="Back to Olympiad landing"]').waitFor();
    await page.locator('.question-back[aria-label="Back to Olympiad landing"]').click();
    await page.locator('#olympiad-challenges[aria-busy=false]').waitFor();
  }
  assert.deepEqual(report.errors,[]); report.status='PASS';
} catch(error) { report.status='FAIL'; report.failure=error.stack; process.exitCode=1; }
finally {fs.writeFileSync('validation/olympiad-topics/browser-report.json',JSON.stringify(report,null,2)); console.log(report); await browser.close();}
