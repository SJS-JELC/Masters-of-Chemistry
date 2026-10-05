import { projectRoot, outputDirectory, devOrigin, previewOrigin, chromium } from '../../paths.mjs';
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const here=outputDirectory('landing/design'),project=projectRoot,workspace=path.resolve(project,'../..');
const roots={alevel:path.join(workspace,'apps/Masters-of-A-Level-Chemistry/src'),igcse:path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src')};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json'};
const server=http.createServer((req,res)=>{const [course,...parts]=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1).split('/');const root=roots[course];if(!root){res.writeHead(404);res.end();return;}const file=path.resolve(root,parts.join('/')||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}try{const bytes=fs.readFileSync(file);res.setHeader('content-type',mime[path.extname(file)]||'application/octet-stream');res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const port=server.address().port;
fs.mkdirSync(path.join(here,'screens'),{recursive:true});fs.mkdirSync(path.join(here,'tmp'),{recursive:true});process.env.TEMP=path.join(here,'tmp');process.env.TMP=process.env.TEMP;
const report={startedAt:new Date().toISOString(),browser:'Pinned root Playwright1.62.1 with headless Edge; fresh contexts and ephemeral original static origin',status:'RUNNING',comparisons:[],checks:[],errors:[]};
const fingerprint=()=>crypto.createHash('sha256').update(fs.readdirSync(path.join(project,'src/landing')).sort().map(name=>name+crypto.createHash('sha256').update(fs.readFileSync(path.join(project,'src/landing',name))).digest('hex')).join('\n')).digest('hex');report.ownedSourceFingerprint=fingerprint();report.visualMethod='Infinite CSS sparkle/shine animations paused at phase zero in both screenshot pages; real interaction tests use unfrozen animations. Comparison HMR socket blocked.';
const browser=await chromium.launch({channel:'msedge',headless:true});report.browserVersion=browser.version();
async function pair(course,viewport,grade,days){const context=await browser.newContext({viewport});const old=await context.newPage(),newPage=await context.newPage();await newPage.routeWebSocket('**',socket=>socket.close());for(const page of [old,newPage])page.on('pageerror',error=>report.errors.push(error.message));
  await old.addInitScript(({grade,days})=>{const records=[];const now=Date.now();const aLeaves=['l6-t2-1-1','l6-t2-1-2','l6-t2-1-3','u6-t1-1-2','u6-t1-1-3','u6-t1-1-5','u6-t1-1-7','u6-t1-1-8','u6-t1-1-9'],iLeaves=['fourth-3-1','fourth-3-2','lower-6-1','lower-6-2','lower-6-3','lower-6-4','lower-6-5','lower-10-1','lower-10-2','lower-10-3','lower-10-4'];for(const leafId of [...aLeaves,...iLeaves])for(let level=1;level<=grade;level++)for(let index=0;index<16;index++)records.push({id:`fixture-${leafId}-${level}-${index}`,leafId,level,grade:level,score:1,completedAt:now-days*86400000-(16-index)*1000,...(leafId.startsWith('u6')&&leafId!=='u6-t1-1-9'?{progressionVersion:2}:{})});localStorage.setItem('masters-alevel-results-v1',JSON.stringify(records.filter(r=>r.leafId.startsWith('l6')||r.leafId==='u6-t1-1-9')));localStorage.setItem('masters-alevel-results-acid-v2',JSON.stringify(records.filter(r=>r.leafId.startsWith('u6')&&r.leafId!=='u6-t1-1-9')));localStorage.setItem('masters-igcse-results-v2',JSON.stringify(records.filter(r=>r.leafId.startsWith('fourth')||r.leafId.startsWith('lower'))));},{grade,days});
  await old.goto(`http://127.0.0.1:${port}/${course}/index.html`);await newPage.goto(`${devOrigin}/scripts/browser/fixtures/landing/harness.html?course=${course}&grade=${grade}&days=${days}`);for(const page of [old,newPage]){await page.locator('#yearGrid .gem').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(180);}
  return {context,old,newPage};
}
async function shot(pair,name){for(const [kind,page]of [['original',pair.old],['restored',pair.newPage]]){await page.evaluate(()=>{scrollTo(0,0);for(const animation of document.getAnimations()){if(animation.effect?.getComputedTiming().iterations===Infinity){animation.pause();animation.currentTime=0;}}});await page.waitForTimeout(260);await page.screenshot({path:path.join(here,'screens',`${name}-${kind}.png`),fullPage:true});}const geometry=async page=>page.locator('#yearGrid .year-card[aria-hidden="false"],#yearGrid .year-group').evaluateAll(nodes=>nodes.map(node=>{const b=node.getBoundingClientRect();return {width:b.width,height:b.height,x:b.x,y:b.y};}));const original=await geometry(pair.old),restored=await geometry(pair.newPage);assert.deepEqual(original.map(({width,height})=>({width,height})),restored.map(({width,height})=>({width,height})),name+' source map width/height');report.comparisons.push({name,original,restored});}
try{
for(const course of ['alevel','igcse'])for(const [label,width,height]of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]])for(const [state,grade,days]of [['unassessed',0,0],['yellow-fresh',1,0],['green-steady',2,14],['purple-due',3,30]]){
  const p=await pair(course,{width,height},grade,days),name=`${course}-${label}-${state}`;await shot(p,name);
  assert.equal(await p.newPage.locator('#yearGrid .gem').count(),course==='alevel'?152:64);assert(await p.newPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const gemStyles=page=>page.locator('#yearGrid .gem').evaluateAll(nodes=>nodes.map(node=>{const body=node.querySelector('.gem-body'),css=getComputedStyle(body);return {id:node.dataset.leaf,fill:css.fill,stroke:css.stroke,opacity:css.opacity,filter:css.filter};}));
  assert.deepEqual(await gemStyles(p.old),await gemStyles(p.newPage),name+' original gem colour/freshness rendering');
  const labels=page=>page.locator('#yearGrid .gem').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.leaf,label:node.getAttribute('aria-label')})));assert.deepEqual(await labels(p.old),await labels(p.newPage),name+' original gem accessibility text');
  if(label==='desktop'&&state==='unassessed'){
    for(const page of [p.old,p.newPage])await page.locator('#testModeTile').hover();await shot(p,name+'-revision-hover');
    for(const page of [p.old,p.newPage]){await page.mouse.move(0,0);await page.locator('#testModeTile').focus();}await shot(p,name+'-revision-focus');
  }
  if(label==='desktop'||state==='unassessed'){
    if(course==='alevel'){await p.old.locator('#flipYear').click();await p.newPage.locator('#flipYear').click();await p.old.waitForTimeout(720);await p.newPage.waitForTimeout(720);await shot(p,name+'-upper');}
    const topic=course==='alevel'?'#u6-t1-topic-1':'#topic-10';await p.old.locator(topic+' .topic-trigger').click();await p.newPage.locator(topic+' .topic-trigger').click();await p.old.waitForTimeout(450);await p.newPage.waitForTimeout(450);await shot(p,name+'-expanded');
    const leaf=course==='alevel'?'u6-t1-1-2':'lower-10-3';await p.old.locator(`[data-leaf="${leaf}"]`).click();await p.newPage.locator(`[data-leaf="${leaf}"]`).click();await shot(p,name+'-details');await p.old.keyboard.press('Escape');await p.newPage.keyboard.press('Escape');assert(!await p.newPage.locator('#gemDetails').evaluate(node=>node.open));
    await p.old.locator('#testModeTile').click();await p.newPage.locator('#testModeTile').click();await p.old.locator(`[data-leaf="${leaf}"]`).click();await p.newPage.locator(`[data-leaf="${leaf}"]`).click();await shot(p,name+'-revision');assert.equal(await p.newPage.locator('#testSelectionCount').textContent(),'1 gem selected');
    if(state==='unassessed'&&label==='desktop'){
      for(const page of [p.old,p.newPage])await page.locator('#testCancel').click();
      if(course==='alevel'){for(const page of [p.old,p.newPage])await page.locator('#flipYear').click();await p.old.waitForTimeout(720);await p.newPage.waitForTimeout(720);}
      const unavailable=course==='alevel'?'l6-t1-1-1':'fourth-1-1';
      for(const page of [p.old,p.newPage])await page.locator(`[data-leaf="${unavailable}"]`).click();
      await shot(p,name+'-unavailable-details');for(const page of [p.old,p.newPage])await page.keyboard.press('Escape');
      if(course==='igcse'){
        for(const page of [p.old,p.newPage]){await page.locator('[data-mode-toggle]').click();await page.locator('[data-leaf="lower-10-3"]').click();}
        await shot(p,name+'-teacher-details');
        const sourceColour=await p.old.locator('#detailGem').evaluate(e=>getComputedStyle(e).color),newColour=await p.newPage.locator('#detailGem').evaluate(e=>getComputedStyle(e).color);assert.equal(newColour,sourceColour);
        assert.equal(await p.newPage.locator('#activityLink').getAttribute('data-type'),'calculation');
        for(const page of [p.old,p.newPage]){await page.keyboard.press('Escape');await page.locator('[data-mode-toggle]').click();}
        for(const specific of ['fourth-3-1','lower-10-1']){
          for(const page of [p.old,p.newPage])await page.locator(`[data-leaf="${specific}"]`).click();
          await shot(p,name+'-'+specific+'-choices');assert.equal(await p.newPage.locator('.practice-choice[data-practice="mastery"] > span').textContent(),await p.old.locator('.practice-choice[data-practice="mastery"] > span').textContent());
          for(const page of [p.old,p.newPage])await page.keyboard.press('Escape');
        }
      }
    }
  }
  await p.context.close();
}
report.checks.push('Full catalogue counts, desktop/tablet/mobile overflow, original/new 24 state pairs plus upper/expanded/details/revision comparisons, Escape dismissal');
assert.deepEqual(report.errors,[]);report.finishedOwnedSourceFingerprint=fingerprint();assert.equal(report.finishedOwnedSourceFingerprint,report.ownedSourceFingerprint,'Owned landing source remained unchanged throughout the comparison');report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.stack;process.exitCode=1;console.error(error);}finally{await browser.close();await new Promise(resolve=>server.close(resolve));report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-comparison.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,comparisons:report.comparisons.length,failure:report.failure}));}
