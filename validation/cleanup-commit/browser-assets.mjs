import { chromium } from '../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:5204/feedback/alevel/?view=olympiad&activity=alevel/c3l6-organic-reactions');
  await page.locator('.c3l6').waitFor();
  const images=await page.locator('.c3l6 img').evaluateAll(async images=>{
    await Promise.all(images.map(image=>image.complete?null:new Promise(resolve=>{image.onload=resolve;image.onerror=resolve;})));
    return images.map(image=>({alt:image.alt,src:image.getAttribute('src'),naturalWidth:image.naturalWidth}));
  });
  assert(images.length>=15,'C3 introduction should render its fifteen approved examples');
  assert(images.every(image=>image.src&&image.naturalWidth>0),'All displayed C3 images must load');
  assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(import.meta.dirname,'c3-assets-desktop.png'),fullPage:true});
  fs.writeFileSync(path.join(import.meta.dirname,'browser-assets.json'),JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),method:'Pinned workspace Playwright and Microsoft Edge, current production build',images,errors},null,2)+'\n');
  console.log(`PASS: ${images.length} C3 introductory images render in production.`);
} finally {await browser.close();}
