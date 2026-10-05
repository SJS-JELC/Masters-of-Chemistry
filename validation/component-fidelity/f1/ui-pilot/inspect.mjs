import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';
const here=import.meta.dirname,require=createRequire(path.resolve(here,'../../../../../../package.json'));const{chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
await page.goto('http://127.0.0.1:5188/igcse.html?run=f03-inspect&course=igcse');await page.locator('.original-landing').waitFor();
await page.evaluate(()=>location.hash='lower-10-2');await page.locator('#gemDetails').waitFor({state:'visible'});console.log(await page.locator('#gemDetails').innerText());console.log(await page.locator('#gemDetails a').evaluateAll(es=>es.map(e=>({text:e.textContent,href:e.getAttribute('href'),practice:e.getAttribute('data-practice')}))));
await page.locator('a.practice-choice[data-practice="2"]').click();await page.locator('.question-player').waitFor();console.log(JSON.stringify(await page.evaluate(()=>window.__mastersActivity.snapshot())));
await page.screenshot({path:path.join(here,'inspect.png'),fullPage:true});await browser.close();
