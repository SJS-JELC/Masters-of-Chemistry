import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { c3Fixture, isomerFixture } from './fixtures.ts';
const project = path.resolve(import.meta.dirname,'../../../..'), here = import.meta.dirname;
const require = createRequire(path.resolve(project,'../../package.json'));
const browserTmp = path.join(project,'.u05tmp'); fs.mkdirSync(browserTmp,{recursive:true});
process.env.TEMP = browserTmp; process.env.TMP = browserTmp;
const browser = await require('playwright').chromium.launch({channel:'msedge',headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000}}), page = await context.newPage();
const run = 'ui-u05-'+Date.now(), databaseName = 'masters-of-chemistry-alpha-v2-alevel-'+run;
const base = 'http://127.0.0.1:5188/alevel.html?run='+run+'&view=olympiad';
const report = {startedAt:new Date().toISOString(),run,databaseName,browser:'Pinned workspace Playwright / installed Edge headless',checks:[],layouts:[],screenshots:[],errors:[],status:'RUNNING'};
page.on('pageerror', error => report.errors.push(error.message));
const card = id => page.locator(`[data-challenge-id="${id}"]`);
const landing = async () => {await page.getByRole('heading',{name:'Olympiad challenges',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('#olympiad-challenges')?.getAttribute('aria-busy')==='false');};
const ready = id => page.waitForFunction(id=>window.__mastersOlympiad?.snapshot().progress?.activityId===id,id);
const seed = async state => page.evaluate(async ({values,name})=>{const {createChemistryRepository}=await import('/src/persistence/repository.ts');const repo=createChemistryRepository(name);for(const value of values){const r=await repo.saveOlympiad(value);if(!r.ok)throw Error(r.error.message);}}, {values:[c3Fixture(state),isomerFixture(state)],name:databaseName});
const shot = async name => {await page.screenshot({path:path.join(here,name+'.png'),fullPage:true});report.screenshots.push(name+'.png');};
async function layout(name,width) {
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
  const value=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,frame:document.querySelector('.olympiad-question-frame')?.getBoundingClientRect().width ?? null,bodyBackground:getComputedStyle(document.body).backgroundImage,fonts:[...document.querySelectorAll('.olympiad-landing h1,.olympiad-gem-card strong,.challenge-mode-controls button,.c3-nav button,.c3-classification label,.isomer-editor h2,.molecule-workspace text')].map(e=>({selector:e.tagName,text:e.textContent?.slice(0,45),font:getComputedStyle(e).fontFamily}))}));
  assert(value.scrollWidth<=value.width,`${name} page overflow ${value.scrollWidth}/${value.width}`);
  assert(value.fonts.length>0);assert(value.fonts.every(f=>f.font.includes('Comfortaa')),`${name} fonts ${JSON.stringify(value.fonts)}`);
  report.layouts.push({name,...value});await shot(name+'-'+width);
}
async function check(name,fn){await fn();report.checks.push({name,status:'PASS',at:new Date().toISOString()});}
try {
  await page.goto(base);await landing();
  await check('exactly-two-registered-gems-accessible-dim-unstarted',async()=>{assert.equal(await page.locator('.olympiad-gem-card').count(),2);for(const id of ['alevel/c3l6-organic-reactions','alevel/olympiad-2011-q4'])assert.equal(await card(id).getAttribute('data-completion'),'unstarted');});
  for(const width of [350,390,820,1440])await layout('map-unstarted',width);
  for(const state of ['partial','complete']) {
    await seed(state);await page.reload();await landing();
    for(const id of ['alevel/c3l6-organic-reactions','alevel/olympiad-2011-q4'])assert.equal(await card(id).getAttribute('data-completion'),state);
    await shot('map-'+state+'-1440');
    for(const id of ['alevel/c3l6-organic-reactions','alevel/olympiad-2011-q4']) {
      await card(id).click();await ready(id);report.checks.push({name:'loaded-'+id,state,snapshot:await page.evaluate(()=>window.__mastersOlympiad.snapshot())});await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await landing();assert.equal(await card(id).getAttribute('data-completion'),state, id+' '+await page.locator('#olympiad-challenges').innerText());
    }
    report.checks.push({name:`both-${state}-states-policy-seeded-return-reload`,status:'PASS'});
  }
  await seed('unstarted');await page.reload();await landing();
  await card('alevel/c3l6-organic-reactions').click();await ready('alevel/c3l6-organic-reactions');
  await check('C3-real-staged-classification-check-partial-and-return',async()=>{
    await page.getByRole('button',{name:'Start part (a)',exact:true}).click();
    const choices=await page.evaluate(async()=>{const {chemicalChallenge}=await import('/src/activities/olympiad/c3l6/source-bank.ts');return chemicalChallenge.classifications.map((a,i)=>({id:a.id,value:i===0?a.answer:a.answer==='oxidation'?'reduction':'oxidation'}));});
    for(const choice of choices)await page.locator(`input[name="c3-${choice.id}"]`).locator('..').filter({hasText:new RegExp('^'+choice.value+'$')}).click();
    await page.getByRole('button',{name:'Check part (a)',exact:true}).click();await page.evaluate(()=>window.__mastersOlympiad.flush());assert.equal((await page.evaluate(()=>window.__mastersOlympiad.snapshot().progress)).aCheck.correct,1);
    await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await landing();assert.equal(await card('alevel/c3l6-organic-reactions').getAttribute('data-completion'),'partial');
  });
  await card('alevel/olympiad-2011-q4').click();await ready('alevel/olympiad-2011-q4');
  await check('isomer-check-partial-return-reload',async()=>{
    await page.evaluate(async()=>{const {isomerChallenge}=await import('/src/activities/olympiad/isomers2011/content.ts');await window.__mastersOlympiad.command({kind:'draw',box:'1',drawing:{kind:'molecule',graph:structuredClone(isomerChallenge.answers[0].graph),history:[]}});});
    await page.getByRole('button',{name:'Check',exact:true}).click();await page.evaluate(()=>window.__mastersOlympiad.flush());
    await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await landing();assert.equal(await card('alevel/olympiad-2011-q4').getAttribute('data-completion'),'partial');await page.reload();await landing();assert.equal(await card('alevel/olympiad-2011-q4').getAttribute('data-completion'),'partial');
  });
  await seed('complete');await page.reload();await landing();
  await card('alevel/c3l6-organic-reactions').click();await ready('alevel/c3l6-organic-reactions');
  for(const width of [350,390,820,1440]) {
    await page.getByRole('button',{name:'Introduction',exact:true}).click();await layout('c3-intro',width);
    await page.getByRole('button',{name:'Part (a) · Complete',exact:true}).click();await layout('c3-a',width);
    await page.getByRole('button',{name:'Part (b) · Complete',exact:true}).click();await layout('c3-b',width);
    await page.getByRole('button',{name:'Part (c) · Complete',exact:true}).click();await layout('c3-c',width);
  }
  await check('teacher-preview-does-not-persist',async()=>{
    const before=await page.evaluate(()=>window.__mastersOlympiad.snapshot().progress);await page.getByRole('button',{name:'Teacher preview',exact:true}).click();await page.getByRole('button',{name:'Introduction',exact:true}).click();await page.getByRole('button',{name:'Part (a) · Complete',exact:true}).click();await page.evaluate(()=>window.__mastersOlympiad.command({kind:'restart'}));assert.deepEqual(await page.evaluate(()=>window.__mastersOlympiad.snapshot().progress),before);await page.getByRole('button',{name:'Return to challenge',exact:true}).click();
  });
  await page.getByRole('button',{name:'All Olympiad challenges',exact:true}).click();await landing();await card('alevel/olympiad-2011-q4').click();await ready('alevel/olympiad-2011-q4');
  for(const width of [350,390,820,1440])await layout('isomers',width);
  await check('isomer-teacher-preview-no-persistence',async()=>{const before=await page.evaluate(()=>window.__mastersOlympiad.snapshot().progress);await page.getByRole('button',{name:'Teacher preview',exact:true}).click();await page.getByRole('button',{name:'View compound 4',exact:true}).click();await page.evaluate(()=>window.__mastersOlympiad.command({kind:'restart'}));assert.deepEqual(await page.evaluate(()=>window.__mastersOlympiad.snapshot().progress),before);await page.getByRole('button',{name:'Return to challenge',exact:true}).click();});
  await check('separate-challenge-storage-zero-curriculum-evidence',async()=>{const counts=await page.evaluate(async name=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(name);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const names=[...db.objectStoreNames];const counts={};for(const name of names)counts[name]=await new Promise((resolve,reject)=>{const r=db.transaction(name).objectStore(name).count();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();return counts;},databaseName);report.storeCounts=counts;for(const [name,count]of Object.entries(counts))if(name!=='olympiad')assert.equal(count,0,name);assert.equal(counts.olympiad,2);});
  assert.deepEqual(report.errors,[]);report.status='PASS';
} catch(error) {report.status='FAIL';report.failure=error.stack;await shot('failure');throw error;}
finally {report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-report.json'),JSON.stringify(report,null,2));await browser.close();}
