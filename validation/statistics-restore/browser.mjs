import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
const app=path.resolve(import.meta.dirname,'../..'),dir=import.meta.dirname;
const require=createRequire(path.resolve(app,'../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const {chromium}=require('playwright');
const devServer=await createServer({root:app,cacheDir:path.join(dir,'vite-cache'),optimizeDeps:{noDiscovery:true,include:['react','react-dom/client','react/jsx-runtime','react/jsx-dev-runtime','dexie','zustand','zustand/vanilla']},server:{host:'127.0.0.1',port:5203,strictPort:true,hmr:false}});
await devServer.listen();
const baseline=JSON.parse(fs.readFileSync(path.join(app,'validation/original-app-baseline.json'),'utf8'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf'};
// Original source is served read-only from its known readable source inventory.
const originalServer=http.createServer((request,response)=>{
 const url=new URL(request.url,'http://localhost'),match=/^\/original\/(alevel|igcse)\/(.*)$/.exec(decodeURIComponent(url.pathname));
 if(!match){response.writeHead(404);response.end();return;}
 const root=`apps/Masters-of-${match[1]==='alevel'?'A-Level':'IGCSE'}-Chemistry/src/`,relative=root+match[2];
 const prior=baseline.files[relative];
 if(!prior||prior.contentHashUnavailable||match[2].includes('..')){response.writeHead(404);response.end();return;}
 response.setHeader('Content-Type',mime[path.extname(relative)]??'application/octet-stream');response.end(fs.readFileSync(path.resolve(app,'../..',relative)));
});
await new Promise(resolve=>originalServer.listen(5202,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[],errors=[];
const now=Date.now(),run='stats-restore-'+now;
const raw=course=>[
 ...Array.from({length:25},(_,index)=>({id:`${course}-recent-${index}`,leafId:course==='alevel'?'l6-t2-1-2':'lower-10-3',...(course==='alevel'?{level:(index%3)+1}:{grade:(index%3)+1,question:`CAL-${index}`}),score:[1,.5,0][index%3],completedAt:now-(25-index)*60000,...(index%5===0?{}:{timing:{version:1,activeMs:(index+1)*30000,idleLimitMs:60000}})})),
 {id:`${course}-long`,leafId:course==='alevel'?'l6-t2-1-2':'lower-10-3',...(course==='alevel'?{level:1}:{grade:1,question:'OLD-CAL'}),score:1,completedAt:now-90*86400000,timing:{version:1,activeMs:240000,idleLimitMs:60000}},
 ...(course==='alevel'?[{id:'upper-current',leafId:'u6-t1-1-2',level:1,progressionVersion:2,score:.5,completedAt:now-7200000,timing:{version:1,activeMs:120000,idleLimitMs:180000}},{id:'earlier-acid',leafId:'u6-t1-1-2',level:1,progressionVersion:1,score:1,completedAt:now-1000000},{id:'diagram-alias',leafId:'l6-t2-1-4',level:1,score:1,completedAt:now-100000}]:[{id:'fourth-current',leafId:'fourth-3-1',grade:1,score:0,completedAt:now-7200000},{id:'lower-unavailable-level',leafId:'lower-10-2',grade:2,score:1,completedAt:now-100000}])
];
async function scenario(id,fn){try{const evidence=await fn();results.push({id,status:'PASS',evidence});}catch(error){results.push({id,status:'FAIL',error:String(error.stack??error)});}finally{fs.writeFileSync(path.join(dir,'browser-progress.json'),JSON.stringify(results,null,2));}}
async function context(){const context=await browser.newContext({viewport:{width:1366,height:1000},timezoneId:'Europe/London'});context.on('page',page=>page.on('pageerror',e=>errors.push(e.message)));return context;}
const base='http://127.0.0.1:5203';
async function readEvidence(page,course){return page.evaluate(async({course,run})=>{const {createChemistryRepository}=await import('/src/persistence/repository.ts'),{alphaDatabaseName}=await import('/src/persistence/alpha-namespace.ts');const repo=createChemistryRepository(alphaDatabaseName(course,run));const result=await repo.curriculumHistory({course,profileId:'local'});repo.close?.();if(!result.ok)throw Error(result.error.message);return result.value;},{course,run});}
async function seed(page,course,namespaceRun=run){
 await page.goto(`${base}/alevel.html?course=${course}&view=statistics&run=${namespaceRun}`,{waitUntil:'networkidle'});
 const result=await page.evaluate(async({course,run,records})=>{
  const {parseLegacyImport}=await import('/src/persistence/legacy.ts'),{createChemistryRepository}=await import('/src/persistence/repository.ts'),{alphaDatabaseName}=await import('/src/persistence/alpha-namespace.ts');
  const parsed=parseLegacyImport({namespace:{course,profileId:'local'},sourceKey:course==='alevel'?'masters-alevel-results-v1':'masters-igcse-results-v2',rawText:JSON.stringify(records)});if(!parsed.ok)throw Error(parsed.error.message);
  const database=alphaDatabaseName(course,run),repo=createChemistryRepository(database);const initialized=await repo.curriculumHistory({course,profileId:'local'});if(!initialized.ok)throw Error(initialized.error.message);repo.close?.();
  // Alpha import accepts canonical new attempts only. Historical rendering fixtures
  // are schema-valid parsed records inserted into this isolated test database.
  await new Promise((resolve,reject)=>{const request=indexedDB.open(database);request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('evidence','readwrite');for(const value of parsed.value.curriculum)tx.objectStore('evidence').put({course,profileId:'local',id:value.id,value});tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
  return{fixture:'validated historical records; isolated IndexedDB fixture seed, no migration/import change',records:parsed.value.curriculum.length};
 },{course,run:namespaceRun,records:raw(course)});
 assert.equal(result.records,raw(course).length);await page.reload({waitUntil:'networkidle'});await page.getByTestId('statistics-total').waitFor();return result;
}
try{
 for(const course of ['alevel','igcse']){
  await scenario(`${course}-populated-responsive-interactions`,async()=>{
   const ctx=await context(),page=await ctx.newPage();try{
    const seeded=await seed(page,course),evidenceBefore=await readEvidence(page,course);assert.equal(await page.locator('.stats-metric').count(),5);assert.equal(await page.getByRole('button',{name:'All time',exact:true}).getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.course-navigation,.platform-navigation').count(),0);assert.equal(await page.getByRole('heading',{name:'Your Stats',exact:true}).count(),1);
    const count=Number(await page.getByTestId('statistics-total').innerText());assert.equal(count,28);
    const total=Number(await page.getByTestId('statistics-time').getAttribute('data-active-ms'));assert.equal(await page.locator('.stats-chart-bar').evaluateAll(bars=>bars.reduce((n,b)=>n+Number(b.dataset.activeMs),0)),total);
    const scroll=page.locator('.stats-chart-scroll');assert(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth));
    const topic=page.locator(`[data-topic="${course==='alevel'?'l6-t2-1':'lower-10'}"]`);await topic.locator('summary').click();await topic.locator('.stats-level').first().waitFor({state:'visible'});
    const gem=page.locator(`[data-gem="${course==='alevel'?'l6-t2-1-2':'lower-10-3'}"]`);assert.equal(await gem.locator('.stats-recent button').count(),20);
    const recent=gem.locator('.stats-recent button');const firstLabel=await recent.first().getAttribute('aria-label'),lastLabel=await recent.last().getAttribute('aria-label');assert(firstLabel.includes(course==='igcse'?'CAL-5':'Question Not recorded'));assert(lastLabel.includes(course==='igcse'?'CAL-24':'Question Not recorded'));
    await recent.first().focus();assert((await gem.locator('.stats-result-detail').innerText()).includes(course==='alevel'?'Level':'Grade'));await recent.last().click();assert.equal(await gem.locator('.stats-result-detail').innerText(),lastLabel);
    const masteryBefore=await page.locator('[role=meter]').evaluateAll(items=>items.map(item=>item.getAttribute('aria-valuenow')));
    await page.getByRole('button',{name:'Month',exact:true}).click();assert.equal(await topic.getAttribute('open'),'');assert.equal(await scroll.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
    const monthOverview=await page.locator('.stats-number').allTextContents();
    assert.deepEqual(await page.locator('[role=meter]').evaluateAll(items=>items.map(item=>item.getAttribute('aria-valuenow'))),masteryBefore);
    await page.locator('.stats-chart-bar').last().focus();assert((await page.locator('.stats-chart-detail').innerText()).includes('correct,'));await page.keyboard.press('Enter');
    const years=course==='alevel'?['l6','u6']:['fourth','lower','upper'];for(const year of years){await page.getByLabel('Course year',{exact:true}).selectOption(year);assert((await page.locator('.stats-topic').evaluateAll(items=>items.map(item=>item.dataset.topic))).every(id=>id.startsWith(year+'-')));}
    await page.getByLabel('Course year',{exact:true}).selectOption('all');await page.getByRole('button',{name:'All time',exact:true}).click();
    const forbidden=await page.locator('.statistics').innerText();assert(!/Attempt ID|mark points|half-life|Saved first response|Raw marks|Median time/.test(forbidden));assert.equal(await page.locator('.stats-history').getAttribute('open'),null);
    for(const [label,width,height] of [['desktop',1366,1000],['tablet',820,1080],['mobile',390,844]]){await page.setViewportSize({width,height});await page.getByRole('button',{name:'Month',exact:true}).click();await page.screenshot({path:path.join(dir,`${course}-${label}-populated.png`),fullPage:true});if(label==='mobile'){await page.locator('.stats-chart-card').screenshot({path:path.join(dir,`${course}-mobile-chart.png`)});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(dir,`${course}-mobile-overview.png`)});}const geometry=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,stats:document.querySelector('.statistics').getBoundingClientRect().width,chart:document.querySelector('.stats-chart-scroll').scrollWidth-document.querySelector('.stats-chart-scroll').clientWidth}));assert(geometry.width<=width+1,JSON.stringify(geometry));assert(geometry.stats<=1180);assert(geometry.chart<=1);}
    await page.setViewportSize({width:1366,height:1000});await page.getByRole('button',{name:'Day',exact:true}).click();assert((await page.locator('.stats-chart-card').innerText()).includes('Last 24 hours'));await page.getByRole('button',{name:'Week',exact:true}).click();
    await page.getByRole('button',{name:'Back to course map',exact:true}).last().focus();await page.keyboard.press('Enter');await page.waitForURL(/view=home/);assert.equal(new URL(page.url()).searchParams.get('course'),course);
    assert.deepEqual(await readEvidence(page,course),evidenceBefore);
    return{count,total,seeded,monthOverview,evidenceUnchanged:true,latest20:{firstLabel,lastLabel},backURL:page.url(),screenshots:['desktop','tablet','mobile'].map(label=>`${course}-${label}-populated.png`)};
   }finally{await ctx.close();}
  });
  await scenario(`${course}-empty-responsive`,async()=>{
   const ctx=await context(),page=await ctx.newPage();try{await page.goto(`${base}/alevel.html?course=${course}&view=statistics&run=${run}-empty`,{waitUntil:'networkidle'});await page.getByTestId('statistics-total').waitFor();assert.equal(await page.getByTestId('statistics-total').innerText(),'0');assert((await page.locator('.stats-empty').innerText()).includes('first recorded attempt'));
    for(const [label,width,height] of [['desktop',1366,1000],['tablet',820,1080],['mobile',390,844]]){await page.setViewportSize({width,height});await page.screenshot({path:path.join(dir,`${course}-${label}-empty.png`),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
    return{noInventedTime:await page.getByTestId('statistics-time').getAttribute('data-active-ms')};
   }finally{await ctx.close();}
  });
  await scenario(`${course}-original-layout-comparison`,async()=>{
   const ctx=await context(),page=await ctx.newPage();try{
    await page.goto(`http://127.0.0.1:5202/original/${course}/stats.html`,{waitUntil:'networkidle'});
    await page.evaluate(({course,records})=>localStorage.setItem(course==='alevel'?'masters-alevel-results-v1':'masters-igcse-results-v2',JSON.stringify(records)),{course,records:raw(course)});await page.reload({waitUntil:'networkidle'});await page.locator('.stats-metric').first().waitFor();await page.locator(`.stats-topic[data-topic="${course==='alevel'?'l6-t2-1':'lower-10'}"] summary`).click();await page.locator('button[data-days="30"]').click();
    const original=await page.locator('.stats-metric').evaluateAll(items=>items.map(item=>({title:item.querySelector('h2').textContent,value:item.querySelector('.stats-number').textContent})));await page.screenshot({path:path.join(dir,`${course}-original-desktop.png`),fullPage:true});
    assert.equal(original.length,5);const current=results.find(item=>item.id===`${course}-populated-responsive-interactions`)?.evidence?.monthOverview;assert.deepEqual(original.map(item=>item.value),current,'Month cards must agree with original source for identical historical records');return{original,current,screenshot:`${course}-original-desktop.png`,scope:'Original sources served read-only, synthetic browser storage on separate task origin. Current header uses shared eagle/arrow/background.'};
   }finally{await ctx.close();}
  });
 }
 await scenario('storage-failure-and-retry',async()=>{
  const ctx=await context(),page=await ctx.newPage();try{await page.addInitScript(()=>{const open=indexedDB.open.bind(indexedDB);let fail=true;window.__statsAllowStorage=()=>{fail=false;};indexedDB.open=(...args)=>{if(fail)throw new DOMException('Task fixture storage unavailable','SecurityError');return open(...args);};});await page.goto(`${base}/alevel.html?course=alevel&view=statistics&run=${run}-fault`,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Retry',exact:true}).waitFor();assert((await page.getByRole('alert').innerText()).includes('could not be read'));await page.screenshot({path:path.join(dir,'storage-error.png'),fullPage:true});await page.evaluate(()=>window.__statsAllowStorage());await page.getByRole('button',{name:'Retry',exact:true}).click();await page.getByTestId('statistics-total').waitFor();assert.equal(await page.getByTestId('statistics-total').innerText(),'0');return{retryRecovered:true};}finally{await ctx.close();}
 });
}finally{
 await browser.close();await new Promise(resolve=>originalServer.close(resolve));await devServer.close();
 const report={status:results.length===7&&results.every(r=>r.status==='PASS')&&errors.length===0?'PASS':'FAIL',checkedAt:new Date().toISOString(),browser:'headless Microsoft Edge',playwright:'1.62.1',timezone:'Europe/London',run,results,errors};fs.writeFileSync(path.join(dir,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
}
