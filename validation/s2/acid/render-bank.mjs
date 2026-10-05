import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {acidEngine} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
const directory=import.meta.dirname,project=resolve(directory,'../../..');
const require=createRequire(resolve(project,'../../package.json'));assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright');const profile=resolve(directory,'p',Date.now().toString().slice(-7));mkdirSync(profile,{recursive:true});
const context=await chromium.launchPersistentContext(profile,{channel:'msedge',headless:true,viewport:{width:1366,height:1000}});
const page=await context.newPage(),errors=[],routes=[];page.on('pageerror',error=>errors.push(error.message));
const began=Date.now();
try{
 for(const scope of acidEngine.scopes)for(const level of [1,2,3])for(const template of scope.levels[level]){
  const source=acidEngine.generate(template,level,2718);
  await page.goto(`http://127.0.0.1:5181/alevel.html?review=${source.reviewId}&run=a08-render-${began}`);
  await page.getByText(source.reviewId,{exact:true}).waitFor();await page.getByRole('heading',{name:'Worked answer',exact:true}).waitFor();
  assert.equal(await page.getByLabel(/Your answer/).count(),source.responses.length);assert.equal(await page.locator('.worked-answer .formula').count(),source.working.flatMap(line=>line.split(';')).length);
  assert.equal(await page.getByLabel(/Your answer/).first().isEditable(),false);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  assert.equal((await page.evaluate(()=>window.__mastersActivity.snapshot())).attempt,null);
  const desktop={width:1366,horizontalOverflow:false};
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  if(template==='weak-acid-amount'&&level===1)await page.screenshot({path:resolve(directory,'mobile-four-part-weak-acid.png'),fullPage:true});
  if(template==='buffer-recipe-deviation'&&level===3)await page.screenshot({path:resolve(directory,'mobile-buffer-recipe-deviation.png'),fullPage:true});
  await page.setViewportSize({width:1366,height:1000});
  if(template==='buffer-recipe-deviation'&&level===3)await page.screenshot({path:resolve(directory,'desktop-buffer-recipe-deviation.png'),fullPage:true});
  routes.push({gem:scope.id,template,level,reviewId:source.reviewId,parts:source.responses.length,workedLines:source.working.flatMap(line=>line.split(';')).length,desktop,mobile:{width:390,horizontalOverflow:false}});
 }
 assert.equal(routes.length,63);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);assert.deepEqual(errors,[]);
 const report={status:'PASS',checkedAt:new Date().toISOString(),playwright:'1.62.1',browser:context.browser()?.version(),profile,routes,checks:['All63 exact real-host AB2 review routes','Correct original numeric field/complete worked-line counts','Read-only and zero attempts/evidence','Every route fits desktop1366/mobile390 without horizontal overflow'],pageErrors:errors};
 writeFileSync(resolve(directory,'render-bank-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,routes:routes.length,pageErrors:errors}));
}catch(error){writeFileSync(resolve(directory,'render-bank-results.json'),JSON.stringify({status:'FAIL',routes,error:String(error.stack||error),pageErrors:errors},null,2));await page.screenshot({path:resolve(directory,'render-bank-failure.png'),fullPage:true});throw error;}finally{await context.close();}
