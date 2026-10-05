import fs from 'node:fs';import path from 'node:path';import{createRequire}from'node:module';
const here=import.meta.dirname,require=createRequire(path.resolve(here,'../../../../../../package.json'));const{chromium}=require('playwright'),browser=await chromium.launch({channel:'msedge',headless:true});
for(const size of['desktop','tablet','mobile']){
 const page=await browser.newPage({viewport:{width:1250,height:1000}});
 const items=['unanswered','partial','incorrect','correct','correction','model'].map(state=>`<section><h2>${size} / ${state}</h2>${['original','react'].map(app=>{const file=`${app}-${size}-${state}.png`;return`<p>${app}</p><img src="data:image/png;base64,${fs.readFileSync(path.join(here,file)).toString('base64')}" alt="${file}">`;}).join('')}</section>`).join('');
 await page.setContent(`<style>body{margin:0;padding:12px;background:white;color:black;font:14px Arial}main{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}section{border:1px solid #777;padding:8px;min-width:0}h2{font-size:16px;margin:0 0 8px}p{margin:6px 0}img{width:100%;height:auto;display:block}</style><main>${items}</main>`);await page.screenshot({path:path.join(here,`contact-${size}.png`),fullPage:true});await page.close();
}await browser.close();console.log('Three source-versus-React six-state contact sheets saved.');
