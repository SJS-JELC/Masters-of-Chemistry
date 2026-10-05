import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { c3Fixture, isomerFixture, applyC3 } from '../ui-consistency/u1/olympiad/fixtures.ts';
import { chemicalChallenge } from '../../src/activities/olympiad/c3l6/source-bank.ts';
const app = path.resolve(import.meta.dirname, '../..'), out = import.meta.dirname;
const require = createRequire(path.resolve(app, '../../package.json'));
const tmp = path.join(app, 'btmp-popup'); fs.mkdirSync(tmp, {recursive:true});
process.env.TEMP = tmp; process.env.TMP = tmp;
const browser = await require('playwright').chromium.launch({channel:'msedge',headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000},hasTouch:true});
const page = await context.newPage();
const run = 'popup-'+Date.now(), db = 'masters-of-chemistry-alpha-v2-alevel-'+run;
const base = `http://127.0.0.1:5188/alevel.html?run=${run}&view=olympiad`;
const report = {at:new Date().toISOString(),checks:[],layouts:[],errors:[],status:'RUNNING'};
page.on('pageerror', e => report.errors.push(e.message));
const dlg = page.locator('.olympiad-drawing-dialog');
const canvas = () => dlg.locator('.molecule-workspace');
const done = async () => {await dlg.getByRole('button',{name:'Done',exact:true}).click(); await dlg.waitFor({state:'detached'});};
const flush = () => page.evaluate(()=>window.__mastersOlympiad.flush());
const snapshot = () => page.evaluate(()=>window.__mastersOlympiad.snapshot().progress);
const ready = id => page.waitForFunction(id=>window.__mastersOlympiad?.snapshot().progress?.activityId===id,id);
const launch = async id => {await page.goto(base+'&activity='+id);await ready(id);};
const seed = async value => {await flush();await page.evaluate(async ({value,db})=>{const {createChemistryRepository}=await import('/src/persistence/repository.ts'); const r=await createChemistryRepository(db).saveOlympiad(value);if(!r.ok)throw Error(r.error.message);},{value,db});};
const check = async (name,fn) => {await fn();report.checks.push(name);console.log('PASS '+name);};
async function layout(name,width) {
  await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);
  const sizes=await page.evaluate(()=>{const d=document.querySelector('.olympiad-drawing-dialog'),r=d?.getBoundingClientRect();return {page:document.documentElement.scrollWidth,width:innerWidth,dialog:r?{x:r.x,right:r.right,height:r.height}:null,overflow:d?d.scrollWidth>d.clientWidth:false,doneVisible:d?d.querySelector('button').getBoundingClientRect().bottom<=innerHeight:false};});
  assert(sizes.page<=width, name+' page overflow');if(sizes.dialog){assert(sizes.dialog.x>=0&&sizes.dialog.right<=width);assert(sizes.dialog.height<=900);assert(!sizes.overflow);assert(sizes.doneVisible);}
  report.layouts.push({name,width,...sizes});await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:!sizes.dialog});
}
try {
  await launch('alevel/olympiad-2011-q4');
  await check('No redundant controls or permanent drawing panel',async()=>{
    assert.equal(await page.getByRole('button',{name:/Teacher preview|All Olympiad challenges|Return to challenge/}).count(),0);
    assert.equal(await page.locator('.molecule-workspace').count(),0);
  });
  await check('Isomer popup drawing, undo, keyboard Escape, focus and autosave',async()=>{
    const box=page.locator('[data-isomer-box="1"]');await box.click();await dlg.waitFor();
    assert.equal(await dlg.getByRole('heading').innerText(),'Compound 1');
    await canvas().click({position:{x:190,y:180}});await flush();assert.equal((await snapshot()).drawings['1'].graph.atoms.length,1);
    await dlg.getByRole('button',{name:'Undo',exact:true}).click();await flush();assert.equal((await snapshot()).drawings['1'].graph.atoms.length,0);
    await canvas().click({position:{x:190,y:180}});await canvas().focus();await page.keyboard.press('Escape');assert(await dlg.isVisible());
    await done();assert(await box.evaluate(e=>e===document.activeElement));
    await box.click();assert.equal(await canvas().locator('[data-atom]').count(),1);
    await dlg.getByRole('button',{name:'Done',exact:true}).focus();await page.keyboard.press('Escape');await dlg.waitFor({state:'detached'});
    await flush();await page.reload();await ready('alevel/olympiad-2011-q4');assert.equal(await dlg.count(),0);assert.equal((await snapshot()).drawings['1'].graph.atoms.length,1);
    await page.locator('[data-isomer-box="2"]').click();assert.equal(await canvas().locator('[data-atom]').count(),0);await done();
  });
  await check('Dialog tab focus, backdrop and responsive layouts',async()=>{
    await page.locator('[data-isomer-box="1"]').click();
    for(let i=0;i<35;i++){const before=await page.evaluate(()=>document.activeElement.outerHTML.slice(0,180));await page.keyboard.press('Tab');assert(await dlg.evaluate(d=>d.contains(document.activeElement)),JSON.stringify({i,before,after:await page.evaluate(()=>document.activeElement.outerHTML.slice(0,180)),fields:await dlg.locator('button,input,select,textarea,a[href],[tabindex]').evaluateAll(es=>es.filter(e=>e.tabIndex>=0&&!e.matches(':disabled')&&e.getClientRects().length>0).map(e=>e.outerHTML.slice(0,120)))}));}
    await page.mouse.click(1,1);assert(await dlg.isVisible());
    for(const width of [1440,820,390,350])await layout('isomer-popup',width);
    await done();await layout('isomer-question',350);
    await page.locator('[data-isomer-box="3"]').tap();const bounds=await canvas().boundingBox();await page.touchscreen.tap(bounds.x+bounds.width/2,bounds.y+100);await flush();assert.equal((await snapshot()).drawings['3'].graph.atoms.length,1);await done();
  });
  await check('Save failure is visible inside dialog and retry recovers',async()=>{
    await page.setViewportSize({width:1440,height:1000});await page.locator('[data-isomer-box="2"]').click();await flush();
    await page.evaluate(()=>{window.__popupOriginalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='olympiad')throw new DOMException('Popup test quota failure','QuotaExceededError');return window.__popupOriginalPut.apply(this,args);};});
    await canvas().click({position:{x:190,y:180}});await dlg.getByRole('alert').waitFor();assert.match(await dlg.getByRole('alert').innerText(),/storage|space|quota/i);
    await done();await page.locator('.question-back').click();assert.equal(await page.locator('.olympiad-landing').count(),0);
    await page.locator('[data-isomer-box="2"]').click();
    await page.evaluate(()=>{IDBObjectStore.prototype.put=window.__popupOriginalPut;delete window.__popupOriginalPut;});
    await dlg.getByRole('button',{name:'Retry save'}).click();await page.waitForFunction(()=>window.__mastersOlympiad.snapshot().saveStatus.kind==='saved');await done();
  });
  await check('Question back returns to Olympiad then A Level',async()=>{
    await page.locator('.question-back').click();await page.locator('.olympiad-landing').waitFor();assert.equal(await page.locator('.question-back').innerText(),'←');await layout('olympiad-landing',1440);
    await page.getByRole('button',{name:'Back to A Level landing'}).click();await page.locator('.original-landing.alevel').waitFor();
  });
  await launch('alevel/c3l6-organic-reactions');
  await check('C3 toolbar, introduction and restart confirmation',async()=>{
    assert.equal(await page.locator('.c3-question-introduction,.c3l6>.question-level-pill').count(),0);
    assert(await page.getByRole('heading',{name:'This question is about classifying simple organic reactions'}).isVisible());
    const toolbar=page.getByRole('navigation',{name:'Challenge stages'});assert.equal(await toolbar.getByRole('button').count(),5);
    const buttons=await toolbar.getByRole('button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));assert.equal(new Set(buttons).size,1);
    await toolbar.getByRole('button',{name:'Restart challenge'}).click();await page.getByRole('button',{name:'Cancel restart'}).click();assert.equal((await snapshot()).stage,'intro');
  });
  let unlocked=c3Fixture('unstarted');for(const item of chemicalChallenge.classifications)unlocked=applyC3(unlocked,{kind:'classify',id:item.id,value:item.answer});unlocked=applyC3(unlocked,{kind:'check-a'});unlocked=applyC3(unlocked,{kind:'navigate',stage:'b'});
  await seed(unlocked);await page.reload();await ready('alevel/c3l6-organic-reactions');
  await check('C3 part b popup drawing and slot isolation',async()=>{
    const box=page.locator('button[data-slot="A"]');
    const target=await box.count()?box:page.getByRole('button',{name:/Draw structure A|Edit structure A|Structure A/}).first();
    await target.click();await dlg.waitFor();assert.match(await dlg.getByRole('heading').innerText(),/Structure A · Mr/);
    await canvas().click({position:{x:190,y:180}});await flush();assert.equal((await snapshot()).drawingsB.A.graph.atoms.length,1);
    for(const width of [1440,390,350])await layout('c3-b-popup',width);
    await done();await layout('c3-b-question',350);await flush();await page.reload();await ready('alevel/c3l6-organic-reactions');assert.equal(await dlg.count(),0);assert.equal((await snapshot()).drawingsB.A.graph.atoms.length,1);
  });
  const editableC=c3Fixture('complete');editableC.stage='c';editableC.completed.c=false;delete editableC.drawingsC.R;delete editableC.slotChecks.R;
  await seed(editableC);await page.reload();await ready('alevel/c3l6-organic-reactions');
  await check('C3 network editable popup, keyboard bonds, undo after reopen and restart',async()=>{
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('.c3-network-controls button').first().click();await dlg.waitFor();
    await canvas().click({position:{x:190,y:180}});const atom=canvas().locator('[data-atom]').first();await atom.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');await flush();
    assert.equal((await snapshot()).drawingsC.R.graph.bonds.length,1);await done();
    await page.locator('.c3-network-controls button').first().click();await dlg.getByRole('button',{name:'Undo',exact:true}).click();await flush();assert.equal((await snapshot()).drawingsC.R.graph.bonds.length,0);await done();
    await page.locator('.c3-restart').click();await page.getByRole('button',{name:'Confirm restart',exact:true}).click();await flush();
    assert.equal((await snapshot()).stage,'intro');assert.equal(Object.keys((await snapshot()).drawingsB).length,0);assert.equal(Object.keys((await snapshot()).drawingsC).length,0);
  });
  const complete=c3Fixture('complete');complete.stage='c';await seed(complete);await page.reload();await ready('alevel/c3l6-organic-reactions');
  await check('Completed C3 network opens read-only and completion survives navigation',async()=>{
    await page.locator('.c3-network-controls button').first().click();await dlg.waitFor();const before=await snapshot();
    assert(await dlg.getByRole('button',{name:'Clear structure',exact:true}).isDisabled());
    await canvas().click({position:{x:100,y:100}});assert.deepEqual(await snapshot(),before);
    await layout('c3-c-popup',350);await done();await page.locator('.question-back').click();await page.locator('[data-challenge-id="alevel/c3l6-organic-reactions"][data-completion="complete"]').waitFor();
  });
  await launch('alevel/olympiad-2011-q4');await seed(isomerFixture('complete'));await page.reload();await ready('alevel/olympiad-2011-q4');
  await check('Completed isomer popup read-only and gem remains complete',async()=>{
    await page.locator('[data-isomer-box="7"]').click();assert(await dlg.getByRole('button',{name:'Clear structure',exact:true}).isDisabled());await done();await page.locator('.question-back').click();await page.locator('[data-challenge-id="alevel/olympiad-2011-q4"][data-completion="complete"]').waitFor();
  });
  assert.deepEqual(report.errors,[]);report.status='PASS';
} catch(e) {report.status='FAIL';report.failure=e.stack;await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});process.exitCode=1;}
finally {report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
