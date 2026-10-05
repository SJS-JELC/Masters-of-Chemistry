import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import {reviewedMethanolSynthesisSVG} from '../../../src/chemistry/thermochemistry/reviewed-co-svg.ts';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const here=import.meta.dirname;
const copied=readFileSync(resolve(here,'original-reaction.svg'),'utf8');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-gpu']});
const context=await browser.newContext({viewport:{width:1000,height:450},deviceScaleFactor:2});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report={status:'RUNNING',browser:browser.version(),playwright:JSON.parse(readFileSync(resolve(here,'../../../../../node_modules/playwright/package.json'))).version,headless:true,images:[],errors};
function img(svg,id){return `<img id="${id}" alt="Displayed reaction neutral carbon monoxide plus two hydrogen molecules forms methanol" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/currentColor/g,'#17212b'))}"/>`;}
try{
 const xml=await page.evaluate(svg=>{const dom=new DOMParser().parseFromString(svg,'image/svg+xml');return{parseErrors:dom.querySelectorAll('parsererror').length,negativePaths:dom.querySelectorAll('[data-reviewed-charge="carbon-minus"]').length,pathCount:dom.querySelectorAll('path').length,viewBox:dom.documentElement.getAttribute('viewBox')};},reviewedMethanolSynthesisSVG);
 assert.equal(xml.parseErrors,0);assert.equal(xml.negativePaths,1);assert.equal(xml.viewBox,'0 0 883 190');report.xml=xml;
 await page.setContent(`<style>body{margin:16px;background:#fff;color:#17212b;font:16px sans-serif}figure{margin:0 0 18px}img{display:block;width:883px;height:190px;max-width:100%}</style><figure>Inherited missing carbon charge${img(copied,'old')}</figure><figure>Reviewed neutral CO${img(reviewedMethanolSynthesisSVG,'new')}</figure>`);
 await page.locator('#new').waitFor();await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
 await page.screenshot({path:resolve(here,'desktop-before-after.png'),fullPage:true});
 await page.locator('#new').screenshot({path:resolve(here,'reviewed-full-reaction.png')});
 report.images.push({path:'reviewed-full-reaction.png',bounds:await page.locator('#new').boundingBox()});
 await page.setViewportSize({width:390,height:400});
 await page.setContent(`<style>body{margin:16px;background:#fff;color:#17212b;font:16px sans-serif}img{display:block;width:883px;max-width:100%;height:auto}</style>${img(reviewedMethanolSynthesisSVG,'new')}`);
 await page.waitForFunction(()=>document.images[0].complete&&document.images[0].naturalWidth>0);const mobile=await page.locator('#new').boundingBox();
 await page.screenshot({path:resolve(here,'mobile-full-reaction.png'),fullPage:true});
 await page.screenshot({path:resolve(here,'mobile-co-charge-detail.png'),clip:{x:mobile.x,y:mobile.y+20,width:110,height:40}});
 report.images.push({path:'mobile-full-reaction.png',bounds:mobile,minusCssWidth:10.6*mobile.width/883,minusCssHeight:2.3*mobile.width/883,deviceScaleFactor:2});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));assert.deepEqual(errors,[]);report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.stack;throw error;}
finally{writeFileSync(resolve(here,'render-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report));}
