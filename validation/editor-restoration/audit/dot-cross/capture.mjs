import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const here=import.meta.dirname, project=path.resolve(here,'../../../..'), workspace=path.resolve(project,'../..');
const require=createRequire(path.join(workspace,'package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');
const roots={alevel:path.join(workspace,'apps/Masters-of-A-Level-Chemistry/src'),igcse:path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src')};
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json'};
const server=http.createServer((req,res)=>{const [course,...parts]=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1).split('/');const root=roots[course];if(!root){res.writeHead(404).end();return;}const file=path.resolve(root,parts.join('/')||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('content-type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
fs.mkdirSync(path.join(here,'screens'),{recursive:true});fs.mkdirSync(path.join(here,'tmp'),{recursive:true});process.env.TEMP=path.join(here,'tmp');process.env.TMP=process.env.TEMP;
const report={startedAt:new Date().toISOString(),method:'Pinned root Playwright1.62.1/headless Edge; fresh isolated contexts; ephemeral readonly reference static server; no source app builds or real browser stores',origins:{reference:base},pageErrors:[],cases:[],failures:[]};
for(const port of [5182,5183]){try{const res=await fetch(`http://127.0.0.1:${port}/alevel.html`),text=await res.text();report.origins[port]={status:res.status,sha256:crypto.createHash('sha256').update(text).digest('hex'),vite:text.includes('/@vite/client'),title:text.match(/<title>(.*?)<\/title>/)?.[1],scripts:[...text.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1])};}catch(e){report.origins[port]={error:e.message};}}
assert.equal(report.origins[5183].vite,true,'5183 must be the inspected React Vite source origin');
const browser=await require('playwright').chromium.launch({channel:'msedge',headless:true});report.browserVersion=browser.version();
async function capture(page,name,selector){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(here,'screens',name+'.png'),fullPage:true});if(selector&&await page.locator(selector).count())await page.locator(selector).screenshot({path:path.join(here,'screens',name+'-editor.png')});}
async function geometry(page,source){return page.evaluate(source=>{const sels=source?['.editor','.toolbar','.workspace','.canvas-wrap','#canvas','.marking']:['.question-player','.dot-cross-editor','.dc-controls','.dc-viewport','.dc-canvas','.action-row'];return Object.fromEntries(sels.map(s=>{const e=document.querySelector(s);if(!e)return[s,null];const b=e.getBoundingClientRect(),css=getComputedStyle(e);return[s,{x:b.x,y:b.y,width:b.width,height:b.height,background:css.background,color:css.color,viewBox:e.getAttribute('viewBox')}];}));},source);}
try{
for(const course of ['alevel','igcse'])for(const [label,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:label==='mobile'}),old=await context.newPage(),current=await context.newPage();
 for(const page of [old,current])page.on('pageerror',e=>report.pageErrors.push({course,label,error:e.message}));
 await current.goto(`http://127.0.0.1:5183/${course}.html?course=${course}&run=e02-dot-${course}-${label}-${Date.now()}`);
 await current.locator('.original-landing').waitFor();const gem=course==='alevel'?'l6-t2-1-3':'fourth-3-1';
 await current.evaluate(gem=>location.hash=gem,gem);await current.locator('#gemDetails[open]').waitFor();await current.locator('a.practice-choice[data-practice="1"]').click();await current.locator('.dot-cross-editor').waitFor();
 const snap=await current.evaluate(()=>window.__mastersActivity.snapshot());
 await old.goto(`${base}/${course}/activities/dot-and-cross/index.html?level=1&category=${course==='igcse'?'ionic':'all'}&question=${snap.question.ref.questionId}`);await old.locator('#prompt').filter({hasText:'Draw'}).waitFor();
 for(const page of [old,current])await page.evaluate(()=>document.fonts.ready);
 const entry={course,label,questionId:snap.question.ref.questionId,level:snap.question.ref.level,initial:{original:await geometry(old,true),current:await geometry(current,false)},checks:[]};
 await capture(old,`${course}-${label}-initial-original`,'.editor');await capture(current,`${course}-${label}-initial-current`,'.dot-cross-editor');
 for(const [page,selector]of [[old,'#canvas'],[current,'.dc-canvas']]){const b=await page.locator(selector).boundingBox();await page.mouse.click(b.x+b.width*.42,b.y+b.height*.5);}
 assert.equal(await old.locator('#canvas [data-atom]').count(),1);assert.equal(await current.locator('.dc-canvas [data-object^="a"]').count(),1);entry.checks.push('Tap atom placement observed in both original and current');
 await capture(old,`${course}-${label}-atom-original`,'.editor');await capture(current,`${course}-${label}-atom-current`,'.dot-cross-editor');
 await old.locator('#check').click();await current.getByRole('button',{name:'Check answer',exact:true}).click();await current.locator('.assessment-feedback').waitFor();
 entry.firstAssessment=await current.evaluate(()=>{const s=window.__mastersActivity.snapshot();return{phase:s.attempt.phase,attemptId:s.attempt.attemptId,kind:s.attempt.firstAssessment.kind,marks:s.attempt.firstAssessment.marks,timing:s.attempt.firstResponse.timing};});
 await capture(old,`${course}-${label}-feedback-original`,'.editor');await capture(current,`${course}-${label}-feedback-current`,'.question-player');
 await old.locator('#showAnswer').click();await old.locator('#answer[open]').waitFor();await capture(old,`${course}-${label}-answer-original`);
 const answerButton=current.getByRole('button',{name:'Show worked answer',exact:true});if(await answerButton.count()){await answerButton.click();await capture(current,`${course}-${label}-answer-current`);}else entry.checks.push('Current worked-answer button name differs; full feedback screenshot retained');
 entry.originalFeedback=await old.locator('#feedback').innerText();entry.currentFeedback=await current.locator('.assessment-feedback').innerText();entry.overflow={original:await old.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),current:await current.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)};
 report.cases.push(entry);await context.close();
}
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
await page.goto(`${base}/alevel/activities/dot-and-cross/index.html?level=3&question=phosphorus-pentachloride`);await page.locator('#prompt').filter({hasText:'phosphorus'}).waitFor();await page.locator('[data-element="P"]').click();const box=await page.locator('#canvas').boundingBox();await page.mouse.click(box.x+box.width*.48,box.y+box.height*.5);await page.locator('[data-element="Cl"]').click();await page.mouse.click(box.x+box.width*.70,box.y+box.height*.5);await page.locator('[data-tool="dot"]').click();await page.mouse.move(box.x+box.width*.63,box.y+box.height*.5);await capture(page,'alevel-desktop-expanded-shell-region-original','.editor');report.expandedShellGeometry=await page.locator('#canvas .shell').evaluateAll(nodes=>nodes.map(e=>({r:e.getAttribute('r'),cx:e.getAttribute('cx'),cy:e.getAttribute('cy')})));await context.close();
report.status='PASS';
}catch(error){report.status='FAIL';report.failures.push(error.stack);process.exitCode=1;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:report.cases.length,failures:report.failures}));}
