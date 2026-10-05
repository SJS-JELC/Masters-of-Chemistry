import { projectRoot, outputDirectory, devOrigin, previewOrigin } from '../paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const project=projectRoot, here=outputDirectory('olympiad');
const require=createRequire(path.resolve(project,'../../package.json'));
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1366,height:1000}}),page=await context.newPage();
const report={startedAt:new Date().toISOString(),browser:'Pinned workspace Playwright + installed Edge, headless actual React UI',checks:[],errors:[],status:'RUNNING'};
page.on('pageerror',e=>report.errors.push(e.message));
const run='oly2011-'+Date.now(), base=`${devOrigin}/alevel.html?run=`+run;
const ready=()=>page.waitForFunction(()=>window.__mastersOlympiad?.snapshot().progress?.activityId==='alevel/olympiad-2011-q4');
const snapshot=()=>page.evaluate(()=>window.__mastersOlympiad.snapshot());
async function flush(){await page.evaluate(()=>window.__mastersOlympiad.flush());}
async function check(id,fn){await fn();report.checks.push({id,status:'PASS',at:new Date().toISOString()});}
async function fill(ids){await page.evaluate(async ids=>{const {isomerChallenge}=await import('/src/activities/olympiad/isomers2011/content.ts');for(const [i,id]of ids.entries())await window.__mastersOlympiad.command({kind:'draw',box:String(i+1),drawing:{kind:'molecule',graph:id===null?{atoms:[],bonds:[]}:structuredClone(isomerChallenge.answers[id].graph),history:[]}});},ids);}
try {
await page.goto(base+'&view=olympiad');
await check('selector-and-url-selection',async()=>{
  await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();
  await page.getByRole('button',{name:'UK Olympiad 2011 · Seven isomers',exact:true}).click();await ready();
  assert.equal(new URL(page.url()).searchParams.get('activity'),'alevel/olympiad-2011-q4');
  assert.equal(await page.locator('[data-isomer-box]').count(),7);
  assert(await page.getByRole('button',{name:'Check',exact:true}).isDisabled());
  await page.screenshot({path:path.join(here,'desktop-clues-spectrum.png'),fullPage:true});
});
await check('desktop-keyboard-editor-partial-check-uniform-feedback',async()=>{
  const canvas=page.locator('.molecule-workspace');await canvas.focus();await canvas.press('Enter');await flush();
  assert.equal((await snapshot()).progress.drawings['1'].graph.atoms.length,1);
  const atom=page.locator('.molecule-workspace [data-atom]').first();await atom.focus();await atom.press('ArrowRight');await atom.press('Enter');await flush();
  assert.equal((await snapshot()).progress.drawings['1'].graph.atoms.length,2);
  await page.getByRole('button',{name:'Undo',exact:true}).click();await flush();assert.equal((await snapshot()).progress.drawings['1'].graph.atoms.length,1);
  await page.getByRole('button',{name:'Check',exact:true}).click();await flush();
  assert.equal(await page.locator('.isomer-assessment [role=status]').innerText(),'0 fully correct; 0 correct but in the wrong place.');
  const boxes=await page.locator('[data-isomer-box]').evaluateAll(nodes=>nodes.map(n=>({border:getComputedStyle(n).borderColor,status:n.querySelector('.answer-status')?.textContent,label:n.getAttribute('aria-label')})));
  assert(boxes.every(b=>b.border==='rgb(255, 222, 89)'&&b.status==='?'&& !/correct|wrong/i.test(b.label)));
  await page.screenshot({path:path.join(here,'desktop-partial-uniform.png'),fullPage:true});
  await page.getByRole('button',{name:'Clear structure',exact:true}).click();await flush();assert.equal(await page.locator('.answer-status').count(),0);assert.equal(await page.locator('.isomer-assessment [role=status]').innerText(),'');
});
await check('duplicate-exact-priority-independent-undo-restore',async()=>{
  await fill([1,1,null,null,null,null,null]);await page.getByRole('button',{name:'Check',exact:true}).click();await flush();
  assert.equal(await page.locator('.isomer-assessment [role=status]').innerText(),'1 fully correct; 0 correct but in the wrong place.');
  await page.locator('[data-isomer-box="2"]').click();await page.getByRole('button',{name:'Clear structure',exact:true}).click();await flush();
  const before=await snapshot();assert.equal(before.progress.drawings['1'].graph.atoms.length,5);assert.equal(before.progress.drawings['2'].graph.atoms.length,0);assert.equal(before.progress.drawings['2'].history.length,1);
  await page.reload();await ready();assert.deepEqual((await snapshot()).progress,before.progress);
  await page.getByRole('button',{name:'Undo',exact:true}).click();await flush();assert.equal((await snapshot()).progress.drawings['2'].graph.atoms.length,5);
});
await check('spectrum-keyboard-zoom-neutral-metadata',async()=>{
  const opener=page.getByRole('button',{name:'Enlarge compound 3 NMR spectrum',exact:true});await opener.focus();await opener.press('Enter');
  const dialog=page.getByRole('dialog',{name:'Enlarged compound 3 NMR spectrum'});await dialog.waitFor();
  assert(await dialog.getByRole('button',{name:'Close spectrum'}).evaluate(n=>n===document.activeElement));
  const svg=await page.locator('.isomer-spectrum img').evaluate(async n=>(await fetch(n.src)).text());assert(!/methylpropan|OH broad|methine|Butan-/i.test(svg));
  const metadata = await page.evaluate(svg => {const doc=new DOMParser().parseFromString(svg,'image/svg+xml');return {errors:doc.querySelectorAll('parsererror').length, title:doc.getElementById('spectrum-title')?.textContent, desc:doc.getElementById('spectrum-description')?.textContent, refs:doc.documentElement.getAttribute('aria-labelledby')};},svg);
  assert.deepEqual(metadata,{errors:0,title:'Compound 3 proton NMR spectrum',desc:'Proton NMR spectrum with signal labels, relative integrals, chemical shifts in ppm and expanded multiplets.',refs:'spectrum-title spectrum-description'});
  await page.screenshot({path:path.join(here,'spectrum-enlarged.png')});await page.keyboard.press('Escape');assert(!(await dialog.isVisible()));
});
await check('save-error-memory-guard-retry',async()=>{
  await page.evaluate(()=>{window.olyPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='olympiad')throw new DOMException('Full','QuotaExceededError');return window.olyPut.apply(this,args);};});
  await page.locator('[data-isomer-box="3"]').click();await flush();
  await page.getByRole('alert').filter({hasText:'Storage is full'}).waitFor();assert.equal((await snapshot()).progress.selected,'3');
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();assert.equal(new URL(page.url()).searchParams.get('activity'),'alevel/olympiad-2011-q4');
  await page.evaluate(()=>{IDBObjectStore.prototype.put=window.olyPut;});await page.getByRole('button',{name:'Retry save',exact:true}).click();await flush();await page.waitForFunction(()=>window.__mastersOlympiad?.snapshot().saveStatus.kind==='saved');assert.equal((await snapshot()).saveStatus.kind,'saved');
});
await check('teacher-readonly-no-pupil-write',async()=>{
  const before=(await snapshot()).progress;await page.getByRole('button',{name:'Teacher preview',exact:true}).click();await page.locator('[data-isomer-box="7"]').click();
  assert(await page.getByRole('button',{name:'Carbon',exact:true}).isDisabled());
  assert((await page.locator('.isomer-teacher-answer').innerText()).includes('2-Methoxypropane'));
  assert.deepEqual((await snapshot()).progress,before);await page.screenshot({path:path.join(here,'teacher-reference.png'),fullPage:true});
  await page.getByRole('button',{name:'Return to challenge',exact:true}).click();assert.equal((await snapshot()).progress.selected,'3');
});
await check('c3-retained-isolation-navigation-and-history',async()=>{
  const before=(await snapshot()).progress;
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();
  await page.getByRole('button',{name:'C3L6 organic reactions',exact:true}).click();await page.waitForFunction(()=>window.__mastersOlympiad?.snapshot().progress?.activityId==='alevel/c3l6-organic-reactions');
  await page.evaluate(()=>window.__mastersOlympiad.command({kind:'navigate',stage:'a'}));await flush();
  const c3=(await snapshot()).progress;assert.equal(c3.stage,'a');
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await page.getByRole('button',{name:'UK Olympiad 2011 · Seven isomers',exact:true}).click();await ready();assert.deepEqual((await snapshot()).progress,before);
  await page.goBack();await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();await page.goBack();await page.waitForFunction(()=>window.__mastersOlympiad?.snapshot().progress?.activityId==='alevel/c3l6-organic-reactions');assert.deepEqual((await snapshot()).progress,c3);
  await page.goForward();await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();await page.goForward();await ready();assert.deepEqual((await snapshot()).progress,before);
});
await check('all-correct-lock-completion-restore-restart-isolation',async()=>{
  await fill([0,1,2,3,4,5,6]);await page.getByRole('button',{name:'Check',exact:true}).click();await flush();assert.equal((await snapshot()).progress.completed,true);
  assert.equal(await page.locator('.isomer-assessment [role=status]').innerText(),'7 fully correct; 0 correct but in the wrong place.');
  assert.equal(await page.locator('[data-isomer-box].is-correct').count(),7);assert.equal(await page.locator('.answer-status').filter({hasText:'✓'}).count(),7);assert(await page.getByRole('button',{name:'Carbon',exact:true}).isDisabled());
  await page.screenshot({path:path.join(here,'all-correct-green.png'),fullPage:true});const completed=(await snapshot()).progress;await page.reload();await ready();assert.deepEqual((await snapshot()).progress,completed);
  const isolated=await page.evaluate(async()=>{const {createChemistryRepository}=await import('/src/persistence/repository.ts');const db=createChemistryRepository(window.__mastersOlympiad.snapshot().databaseName);return (await db.loadOlympiad('local')).value;});
  await page.getByRole('button',{name:'Restart challenge',exact:true}).click();await page.getByRole('button',{name:'Restart',exact:true}).click();await flush();assert.equal((await snapshot()).progress.completed,false);assert.deepEqual((await snapshot()).progress.drawings,{});
  const after=await page.evaluate(async()=>{const {createChemistryRepository}=await import('/src/persistence/repository.ts');return(await createChemistryRepository(window.__mastersOlympiad.snapshot().databaseName).loadOlympiad('local')).value;});assert.deepEqual(after,isolated);
});
await check('repository-transactions-union-validation-no-curriculum-evidence',async()=>{
  const result=await page.evaluate(async()=>{
    const {createRepository}=await import('/src/persistence/repository.ts');const {blankIsomerProgress,isomerPolicy}=await import('/src/activities/olympiad/isomers2011/policy.ts');const {isomerChallenge}=await import('/src/activities/olympiad/isomers2011/content.ts');
    const {blankC3Progress}=await import('/src/activities/olympiad/c3l6/policy.ts');const name=window.__mastersOlympiad.snapshot().databaseName;
    const repo=createRepository(name);const c3=(await repo.loadOlympiad('local')).value;
    const isolated=blankIsomerProgress('separate-profile');await repo.saveOlympiad(isolated);if((await repo.loadOlympiad('local','alevel/olympiad-2011-q4')).value.profileId!=='local')throw Error('Profile overwritten');
    const bad=await repo.saveOlympiad({...isolated,completed:true});if(bad.ok)throw Error('Forged completion saved');
    const faulty=createRepository(name,point=>{if(point==='olympiad')throw new DOMException('Full','QuotaExceededError');});const fail=await faulty.saveOlympiad({...isolated,selected:'7'});if(fail.ok||(await repo.loadOlympiad('separate-profile','alevel/olympiad-2011-q4')).value.selected!=='1')throw Error('Failed transaction mutated');
    let completed={...blankIsomerProgress('import-profile'),drawings:Object.fromEntries(isomerChallenge.answers.map(a=>[a.id,{kind:'molecule',graph:a.graph,history:[]}]))};completed=isomerPolicy.transition(isomerChallenge,completed,{kind:'check'}).progress;
    const batch={namespace:{course:'alevel',profileId:'import-profile'},source:{key:'current',fingerprint:'import'},curriculum:[],olympiad:[blankC3Progress('import-profile'),completed]};const imported=await repo.importBatch(batch), duplicate=await repo.importBatch(batch);
    if(!imported.ok||imported.value.inserted!==2||!duplicate.ok||duplicate.value.duplicates!==2)throw Error('Union import failure');
    const history=await repo.curriculumHistory({course:'alevel',profileId:'local'});if(!history.ok||history.value.length)throw Error('Challenge created curriculum evidence');
    const db=await new Promise((r,j)=>{const q=indexedDB.open(name);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});const counts={};for(const table of ['attempts','evidence','sessions'])counts[table]=await new Promise((r,j)=>{const q=db.transaction(table).objectStore(table).count();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});db.close();if(Object.values(counts).some(n=>n!==0))throw Error('Challenge generated curriculum records');
    return {counts,imported:imported.value,duplicate:duplicate.value,c3Retained:c3.stage==='a',forgery:bad.error.code,failure:fail.error.code};
  });report.repository=result;
});
await check('tablet-and-mobile-real-pointer-touch-editing',async()=>{
  await page.setViewportSize({width:820,height:1180});await page.screenshot({path:path.join(here,'tablet-seven-boxes.png'),fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});const touch=await mobile.newPage();touch.on('pageerror',e=>report.errors.push(e.message));
  await touch.goto(base+'&view=olympiad&activity=alevel/olympiad-2011-q4');await touch.waitForSelector('.molecule-workspace');
  await touch.locator('[data-isomer-box="4"]').tap();const canvas=touch.locator('.molecule-workspace');await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox();await touch.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await touch.evaluate(()=>window.__mastersOlympiad.flush());
  assert.equal((await touch.evaluate(()=>window.__mastersOlympiad.snapshot())).progress.drawings['4'].graph.atoms.length,1);
  await touch.getByRole('button',{name:'Check',exact:true}).tap();assert.equal(await touch.locator('[data-isomer-box].is-incorrect').count(),7);
  assert(await touch.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await touch.screenshot({path:path.join(here,'mobile-touch-partial.png'),fullPage:true});
  await touch.getByRole('button',{name:'Enlarge compound 3 NMR spectrum',exact:true}).tap();await touch.screenshot({path:path.join(here,'mobile-spectrum-zoom.png')});await touch.getByRole('button',{name:'Close spectrum'}).tap();await mobile.close();
});
assert.equal(report.errors.length,0);report.status='PASS';
} catch(error) {report.status='FAIL';report.failure=String(error.stack||error);await page.screenshot({path:path.join(here,'failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}
finally {report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({status:report.status,checks:report.checks.map(c=>c.id),failure:report.failure,errors:report.errors}));
