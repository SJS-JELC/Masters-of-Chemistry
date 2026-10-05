import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {compatibilityRoutes} from '../../../src/compatibility/routes.ts';
import {acidEngine} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
import {calorimetryConfigurations,calorimetryCode} from '../../../src/activities/igcse/calorimetry/provider.ts';
import {bondCode} from '../../../src/activities/igcse/bond-enthalpy/provider.ts';
import {resolveCompatibilityLink} from '../../../src/compatibility/links.ts';
const here=import.meta.dirname,origin=process.argv[2]??'http://127.0.0.1:5197/stage-s4';
const codes={alevel:[acidEngine.reviewId('h-to-ph',1,123),'EB01','EC-TXDM70','n2','TC01'],igcse:[calorimetryCode(calorimetryConfigurations()[0],123),bondCode('methane-combustion',1,123),'SBC-U5FSU0','DC-3QP3I7','EE-8IPP11','EP-BJLHC1']};
const targets={alevel:['u6-t1-1-2:1','l6-t2-1-1:1','l6-t2-1-2:1','l6-t2-1-3:1','u6-t1-1-9:2'],igcse:['lower-10-3:1','lower-10-4:1','lower-6-5:2','fourth-3-1:1','lower-10-1:1','lower-10-2:2']};
const fingerprint=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const buildFiles=Object.entries(compatibilityRoutes).flatMap(([course,routes])=>[`dist/${course}/index.html`,...routes.map(route=>`dist/${course}/${route}`)]);
const report={jobId:'S4-COMPATIBILITY',agentId:'A19',startedAt:new Date().toISOString(),origin,sampledBuild:Object.fromEntries(buildFiles.map(file=>[file,fingerprint(path.join(here,'../../..',file))])),checks:[],errors:[],routes:[]};
const context=await chromium.launchPersistentContext(path.join(here,`profiles/prefix-${Date.now()}`),{channel:'msedge',headless:true,viewport:{width:1280,height:1000}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
try{
 for(const [course,routes] of Object.entries(compatibilityRoutes))for(const [index,route] of routes.entries()){
  const code=codes[course][index],url=`${origin}/${course}/${route}${code?`?review=${code}`:''}`;
  const response=await page.goto(url);assert(response.status()<400,url);
  if(route.includes('c3l6')){await page.getByRole('heading',{name:'Organic reactions: classify and draw products',exact:true}).waitFor();report.routes.push({course,route,kind:'olympiad',url:page.url()});continue;}
  const expected=await resolveCompatibilityLink(course,code);assert.equal(expected.kind,'curriculum');
  await page.locator('.question-meta code').waitFor();assert.equal(await page.locator('.question-meta code').innerText(),expected.ref.questionId);assert.equal(await page.locator('.question-meta span').innerText(),`Level ${expected.ref.level}`);
  assert.match(page.url(),new RegExp(`/stage-s4/${course}/index.html`));
  const before=page.url();await page.reload();await page.locator('.question-meta code').waitFor();assert.equal(await page.locator('.question-meta code').innerText(),expected.ref.questionId);assert.equal(page.url(),before);
  assert(await page.getByText('Teacher preview · read only',{exact:true}).isVisible());
  report.routes.push({course,route,kind:'curriculum',ref:expected.ref,url:before});
  if(route.includes('electron-configurations')||route.includes('calorimetry'))await page.screenshot({path:path.join(here,`${course}-prefix-review.png`),fullPage:true});
  await page.goto(`${origin}/${course}/${route}`);await page.getByRole('combobox',{name:'Target',exact:true}).waitFor();await page.waitForFunction(expected=>document.querySelector('[aria-label="Target"]')?.value===expected,targets[course][index]);assert.equal(new URL(page.url()).searchParams.get('view'),'practice');await page.reload();await page.getByRole('combobox',{name:'Target',exact:true}).waitFor();await page.waitForFunction(expected=>document.querySelector('[aria-label="Target"]')?.value===expected,targets[course][index]);
 }
 report.checks.push('All 12 actual original filenames load under /stage-s4/<course>/; 11 original question codes restore exact identity and teacher ref after canonical refresh; C3 opens separate Olympiad.');
 report.checks.push('All 11 code-less curriculum aliases route to the correct activity practice setup and survive direct refresh.');
 // Explicitly selected fixed levels and seeds also survive refreshed canonical links.
 await page.goto(`${origin}/alevel/index.html?review=n2&activity=alevel%2Fdot-and-cross&level=3&seed=4294967295`);await page.locator('.question-meta code').waitFor();assert.equal(await page.locator('.question-meta span').innerText(),'Level 3');assert.equal(new URL(page.url()).searchParams.get('seed'),'4294967295');await page.reload();await page.locator('.question-meta code').waitFor();assert.equal(await page.locator('.question-meta span').innerText(),'Level 3');
 report.checks.push('Canonical fixed n2 Level 3 / uint32 max seed survives real refresh.');
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=String(e);await page.screenshot({path:path.join(here,'prefix-failure.png'),fullPage:true});throw e;}finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'prefix-browser-results.json'),JSON.stringify(report,null,2));await context.close();}
