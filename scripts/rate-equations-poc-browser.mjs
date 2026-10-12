import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, projectRoot } from './browser/paths.mjs';
import { makeOrders } from '../src/activities/alevel/rate-equations/orders.ts';
import { makeMechanisms } from '../src/activities/alevel/rate-equations/mechanisms.ts';
import { makeGraphs, makeArrhenius } from '../src/activities/alevel/rate-equations/graphs.ts';
const output=path.join(projectRoot,'.artifacts/rate-equations-poc/ui-refinement');
const screenshots=path.join(output,'screenshots');
fs.mkdirSync(screenshots,{recursive:true});
fs.mkdirSync(path.join(output,'.tmp'),{recursive:true});
process.env.TEMP=path.join(output,'.tmp');process.env.TMP=process.env.TEMP;
const base=process.env.RATE_POC_URL || 'http://127.0.0.1:5184/?harness=rate-equations';
// Starting examples are regenerated from source, never read from a disposable report.
const examples=Object.values({orders:makeOrders,graphs:makeGraphs,mechanisms:makeMechanisms,arrhenius:makeArrhenius})
  .flatMap(factory=>[1,2,3].map(level=>factory(level,0)));
const report={status:'RUNNING',startedAt:new Date().toISOString(),url:base,checks:[],screenshots:[],pageErrors:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});
report.browser=await browser.version();
const context=await browser.newContext({viewport:{width:1440,height:1050}});
const page=await context.newPage();page.on('pageerror',error=>report.pageErrors.push(error.message));
const titles={orders:'Orders & Rate Calculations',graphs:'Rate Graphs & Half-life',mechanisms:'Rate Equations & Mechanisms',arrhenius:'Arrhenius & Temperature'};
async function choose(example) {
  await page.getByRole('button',{name:new RegExp(titles[example.gem].replace(/[&]/g,'&'))}).click();
  await page.getByLabel('Level',{exact:true}).selectOption(String(example.question.ref.level));
  await page.locator('.question-player').waitFor();
}
async function shot(name){const file=path.join(screenshots,name+'.png');await page.screenshot({path:file,fullPage:true});report.screenshots.push(path.relative(projectRoot,file).replaceAll('\\','/'));}
try {
  await page.goto(base);await page.locator('.question-player').waitFor();await page.evaluate(()=>document.fonts.ready);
  await shot('orders-structured');
  for(const example of examples) {
    await choose(example);
    const q=example.question;
    for(let i=0;i<q.parts.length;i++) {
      const part=q.parts[i], response=example.correctResponses[part.id], surface=page.locator('.question-part').nth(i);
      if(response.kind==='numeric') await surface.locator('input[data-answer-input]').fill(response.raw);
      else if(response.kind==='text') await surface.locator('input[data-answer-input]').fill(response.value);
      else if(response.kind==='choice') {
        if(part.presentation==='dropdown') await surface.locator('select').selectOption(response.selected[0]);
        else for(const id of response.selected) await surface.getByRole('radio').nth(part.options.findIndex(o=>o.id===id)).click();
      }
    }
    await page.getByRole('button',{name:'Check',exact:true}).click();
    await page.locator('.response-result').filter({hasText:'Correct.'}).waitFor();
    assert.equal(await page.locator('.worked-answer').count(),1);
    report.checks.push({id:`${example.gem}-L${q.ref.level}-correct-marking`,status:'PASS'});
    if(q.ref.level===3) await shot(`${example.gem}-applications-marked`);
    await page.getByRole('button',{name:'Next',exact:true}).click();
    assert.equal(await page.locator('.worked-answer').count(),0,'Next creates fresh answering state');
  }
  // Changed graph interactions are checked by ui-refinement/A02/browser-results.json.
  const graph=examples.find(x=>x.gem==='graphs'&&x.question.ref.level===1);
  await choose(graph);
  await shot('graphs-tools');
  await page.getByRole('button',{name:'Teacher answer',exact:true}).click();
  assert.equal(await page.locator('.teacher-answer').count(),1);
  assert.equal(await page.getByRole('button',{name:'Check',exact:true}).count(),0);
  report.checks.push({id:'teacher-answer-read-only',status:'PASS'});
  await page.setViewportSize({width:390,height:844});await shot('mobile-graphs');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Mobile horizontal layout');
  assert.equal(await page.evaluate(()=>localStorage.length),0,'No localStorage writes in preview');
  assert.deepEqual(await page.evaluate(async()=> (await indexedDB.databases()).map(x=>x.name)),[],'No IndexedDB writes in preview');
  assert.equal(report.pageErrors.length,0);
  report.status='PASS';
} catch(error) { report.status='FAIL'; report.error=error.stack; await shot('failure'); throw error; }
finally { report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'browser-validation.json'),JSON.stringify(report,null,2)+'\n');await browser.close(); }
