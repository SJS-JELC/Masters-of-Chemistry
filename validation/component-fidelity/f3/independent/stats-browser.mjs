import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const here=import.meta.dirname, project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const require=createRequire(path.join(workspace,'package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
process.env.TEMP=process.env.TMP=path.join(project,'.component-fidelity-tmp');fs.mkdirSync(process.env.TEMP,{recursive:true});
const original=fs.readFileSync(path.join(workspace,'apps/Masters-of-A-Level-Chemistry/src/index.html'),'utf8');
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});
const result={status:'PASS',checkedAt:new Date().toISOString(),source:'apps/Masters-of-A-Level-Chemistry/src/index.html#statsTile',checks:[],limits:['Headless Edge rendering; no native OS background/suspension certification.']};
try {
 for(const width of [1440,820,390]) {
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.argv[2] || 'http://127.0.0.1:5192/alevel/') + '?view=home&course=alevel');
  await page.locator('.original-landing.alevel').waitFor();await page.evaluate(()=>document.fonts.ready);
  const read=()=>page.locator('#statsTile svg').evaluate((svg,html)=>{
   const shape=el=>({tag:el.tagName,attrs:Object.fromEntries([...el.attributes].map(a=>[a.name,a.value]).sort()),children:[...el.children].map(shape)});
   const source=new DOMParser().parseFromString(html,'text/html').querySelector('#statsTile svg');
   const box=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
   return {actual:shape(svg),source:shape(source),tile:box(svg.closest('button')),icon:box(svg),overflow:document.documentElement.scrollWidth>innerWidth};
  },original);
  const a=await read();assert.deepEqual(a.actual,a.source);assert(!a.overflow);
  await page.locator('#statsTile').screenshot({path:path.join(here,`stats-alevel-${width}.png`)});
  await page.locator('#flipCourse').click();await page.locator('.original-landing.igcse').waitFor();
  const i=await read();assert.deepEqual(i.actual,a.actual);assert.deepEqual(i.tile,a.tile);assert.deepEqual(i.icon,a.icon);assert(!i.overflow);
  await page.locator('#statsTile').screenshot({path:path.join(here,`stats-igcse-${width}.png`)});
  assert.deepEqual(errors,[]);result.checks.push({width,svg:'exact-original-DOM',identicalAcrossCourses:true,geometry:{alevel:a.tile,igcse:i.tile},errors});await context.close();
 }
} catch(error) {result.status='FAIL';result.error={message:error.message,stack:error.stack};process.exitCode=1;}
finally {await browser.close();fs.writeFileSync(path.join(here,'stats-browser.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
