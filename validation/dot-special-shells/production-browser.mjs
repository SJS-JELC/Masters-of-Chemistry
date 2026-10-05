import {chromium} from '../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {fixedIdentity} from '../../src/content/canonical-identity.ts';
const here=import.meta.dirname,browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
try{
for(const [course,sourceId,element] of [['alevel','sulfur-hexafluoride','S'],['alevel','phosphorus-pentachloride','P'],['igcse','h2o','O']]){
 const code=fixedIdentity(course==='alevel'?'DAC':'DC').code(sourceId),url=`http://127.0.0.1:5204/feedback/${course}/?review=${code}&activity=${course}/dot-and-cross&level=${course==='alevel'?3:2}&seed=0`;
 await page.goto(url);await page.locator('.dot-cross-editor svg').waitFor();assert.equal(await page.evaluate(()=>typeof window.__mastersActivity),'undefined');assert.equal(await page.locator('.dot-question-actions').count(),0);
 const atom=page.locator('.dot-cross-editor .atom').filter({hasText:element}).first();assert.equal(await atom.locator('.shell').getAttribute('r'),course==='alevel'?'100':'64');assert.equal(await page.locator('.teacher-answer .shell[r="100"]').count(),course==='alevel'?1:0);
 await page.screenshot({path:path.join(here,'production-'+sourceId+'.png'),fullPage:false,animations:'disabled'});
 await page.reload();await page.locator('.dot-cross-editor svg').waitFor();assert.equal(await atom.locator('.shell').getAttribute('r'),course==='alevel'?'100':'64');
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(here,'production-'+sourceId+'-mobile.png'),fullPage:false,animations:'disabled'});await page.setViewportSize({width:1440,height:1000});checks.push({course,sourceId,code,status:'PASS',url});
}
assert.deepEqual(errors,[]);
}finally{await browser.close();fs.writeFileSync(path.join(here,'production-browser-results.json'),JSON.stringify({status:checks.length===3&&!errors.length?'PASS':'FAIL',checks,errors,checkedAt:new Date().toISOString()},null,2)+'\n');}
