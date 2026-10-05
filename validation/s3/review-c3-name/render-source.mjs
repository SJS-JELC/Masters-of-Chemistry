import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=import.meta.dirname, project=resolve(here,'../../..');
const original=resolve(project,'../Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions');
const current=resolve(project,'src/activities/olympiad/c3l6');
const paths=['panels/b.html','assets/digitised/b/gyromitrin-skeletal-notes.svg','content.js'].map(p=>resolve(original,p));
paths.push(...['assets/digitised/b/gyromitrin-skeletal-notes.svg','content.ts','bank.json','source-bank.ts','dependencies.ts'].map(p=>resolve(current,p)));
const fingerprints=paths.map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
writeFileSync(resolve(here,'fingerprints.json'),JSON.stringify(fingerprints,null,2)+'\n');
const svg=readFileSync(paths[1],'utf8');
assert.equal(svg,readFileSync(resolve(current,'assets/digitised/b/gyromitrin-skeletal-notes.svg'),'utf8'));
const html=readFileSync(paths[0],'utf8');
const biii=html.match(/<article class="digitised-reaction" aria-labelledby="part-b-iii">[\s\S]*?<\/article>/)[0];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
const page=await browser.newPage({viewport:{width:1000,height:650},deviceScaleFactor:2});
const report={status:'RUNNING',headless:true,browser:browser.version(),playwright:JSON.parse(readFileSync(resolve(here,'../../../../../node_modules/playwright/package.json'))).version,copiedSvgBytesMatch:true,images:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
try{
 report.xml=await page.evaluate(svg=>{const d=new DOMParser().parseFromString(svg,'image/svg+xml');return{errors:d.querySelectorAll('parsererror').length,title:d.querySelector('title').textContent,description:d.querySelector('desc').textContent,paths:d.querySelectorAll('path').length};},svg);
 assert.equal(report.xml.errors,0);
 const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 await page.setContent(`<style>body{font:18px sans-serif;margin:24px;color:#17212b}h1{font-size:22px}.b-reaction-row{display:flex;align-items:center;gap:25px}.digitised-start{width:600px}.digitised-start img{width:100%;height:auto}.digitised-molecule{margin:0}.digitised-equilibrium svg{display:block;width:100px}.digitised-product{display:inline-block;margin:12px}.digitised-mass{display:block}p{margin:10px 0}</style><h1>Retained source B(iii), with inherited label</h1>${biii.replace('../assets/digitised/b/gyromitrin-skeletal-notes.svg',uri)}`);
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 await page.screenshot({path:resolve(here,'source-biii-desktop.png'),fullPage:true});report.images.push('source-biii-desktop.png');
 await page.locator('img').screenshot({path:resolve(here,'source-structure.png')});report.images.push('source-structure.png');
 await page.setViewportSize({width:390,height:420});
 await page.setContent(`<style>body{font:16px sans-serif;margin:16px;color:#17212b}img{width:100%;height:auto}p{line-height:1.5}</style><p>Hydrazone model compound (Mr 114), undergoing hydrolysis to D (58) + E (46) + F (46).</p><img alt="Skeletal formula of the hydrazone model compound used in reaction (iii)" src="${uri}"/><p>Water is the reagent; use the displayed structure and masses.</p>`);
 await page.waitForFunction(()=>document.images[0].complete&&document.images[0].naturalWidth>0);
 await page.screenshot({path:resolve(here,'proposed-model-mobile.png'),fullPage:true});report.images.push('proposed-model-mobile.png');
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.failure=e.stack;throw e;}
finally{writeFileSync(resolve(here,'render-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report));}
