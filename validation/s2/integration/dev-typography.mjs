import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(directory,'../../..');
const require=createRequire(path.resolve(project,'../../package.json'));const {chromium}=require('playwright');
const context=await chromium.launchPersistentContext(path.join(project,'.browser','a01font-'+Date.now().toString(36)),{channel:'msedge',headless:true,args:['--no-first-run','--no-default-browser-check']});
const results=[];
try{for(const course of ['alevel','igcse']){const page=await context.newPage();await page.goto(`http://127.0.0.1:5181/${course}.html?run=a01-font&mode=teacher`);await page.locator('.question-player h2').waitFor();await page.evaluate(()=>document.fonts.ready);
 const client=await context.newCDPSession(page);await client.send('DOM.enable');await client.send('CSS.enable');const doc=await client.send('DOM.getDocument');const content=await client.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'.question-player>.content p'});const {fonts}=await client.send('CSS.getPlatformFontsForNode',{nodeId:content.nodeId});
 assert(fonts.some(font=>font.familyName==='Segoe UI'&&font.glyphCount>0));
 const computed=await page.evaluate(()=>Array.from(document.querySelectorAll('html,body,.question-player>.content p,.question-part>.content p,h1,h2')).map(node=>({tag:node.tagName,className:node.className,text:node.textContent.slice(0,120),fontFamily:getComputedStyle(node).fontFamily,fontWeight:getComputedStyle(node).fontWeight})));
 results.push({course,computed,actualQuestionContextFonts:fonts});await page.close();}}
finally{await context.close();fs.writeFileSync(path.join(directory,'dev-typography.json'),JSON.stringify({status:results.length===2?'PASS':'FAIL',checkedAt:new Date().toISOString(),results},null,2)+'\n');}
console.log(JSON.stringify(results));
