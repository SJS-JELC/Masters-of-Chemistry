import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,origin='http://127.0.0.1:5183';
const {chromium}=await import(pathToFileURL(path.join(process.cwd(),'node_modules/playwright/index.mjs')).href);
const response=await fetch(origin+'/src/editors/molecule/MoleculeEditor.tsx');const source=await response.text();assert.equal(response.status,200);assert(source.includes('MoleculeEditor'));
const browser=await chromium.launch({channel:'msedge',headless:true}),report={status:'RUNNING',originVerified:true,checks:[],errors:[],headless:true};
try {
 for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]) {
  const context=await browser.newContext({viewport}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(`${origin}/alevel.html?run=e03-audit-${name}-${Date.now()}&view=olympiad`);await page.waitForFunction(()=>window.__mastersOlympiad!==undefined);
  await page.locator('.c3-intro').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(here,`react-${name}-intro.png`),fullPage:true});
  await page.getByRole('button',{name:'Start part (a)',exact:true}).click();await page.screenshot({path:path.join(here,`react-${name}-a.png`),fullPage:true});
  await page.evaluate(async()=>{const m=await import('/src/activities/olympiad/c3l6/index.ts');for(const item of m.c3Challenge.classifications)await window.__mastersOlympiad.command({kind:'classify',id:item.id,value:item.answer});});
  await page.getByRole('button',{name:'Check part (a)',exact:true}).click();await page.getByRole('button',{name:'Continue to part (b)',exact:true}).click();await page.locator('.molecule-editor').waitFor();
  await page.screenshot({path:path.join(here,`react-${name}-b-blank.png`),fullPage:true});
  await page.getByRole('button',{name:'Add atom',exact:true}).click();await page.getByLabel('Selected atom',{exact:true}).selectOption('1');
  await page.getByRole('button',{name:'Extend selected atom',exact:true}).click();await page.getByLabel('New element',{exact:true}).selectOption('O');await page.getByLabel('Selected atom',{exact:true}).selectOption('2');await page.getByRole('button',{name:'Change selected to O',exact:true}).click();
  await page.locator('.molecule-editor').screenshot({path:path.join(here,`react-${name}-editor-detail.png`)});
  await page.evaluate(()=>window.__mastersOlympiad.flush());const before=await page.evaluate(()=>window.__mastersOlympiad.snapshot());await page.reload();await page.locator('.molecule-editor').waitFor();
  const after=await page.evaluate(()=>window.__mastersOlympiad.snapshot());assert.deepEqual(before.progress.drawingsB.A,after.progress.drawingsB.A);
  report.checks.push(`${name}: current React intro/A/B screenshots, two-atom inspector edits, saved graph+history restore`);
  await page.getByRole('button',{name:'Teacher preview',exact:true}).click();await page.getByRole('button',{name:'Part (c)',exact:true}).click();await page.screenshot({path:path.join(here,`react-${name}-teacher-c.png`),fullPage:true});
  await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';
} catch(e) {report.status='FAIL';report.failure=e.stack;process.exitCode=1;}
finally {await browser.close();await fs.writeFile(path.join(here,'react-browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
