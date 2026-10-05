import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(directory,'../../..');
const require=createRequire(path.resolve(project,'../../package.json'));assert.equal(require('playwright/package.json').version,'1.62.1');const {chromium}=require('playwright');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.json':'application/json'};
const server=http.createServer((request,response)=>{try{
 const parts=decodeURIComponent(new URL(request.url,'http://localhost').pathname).split('/').filter(Boolean);
 if(parts[0]!=='stage-s2'||!['alevel','igcse'].includes(parts[1])){response.writeHead(404).end();return;}
 const root=path.join(project,'dist',parts[1]),file=path.resolve(root,...parts.slice(2));
 if(!file.startsWith(root+path.sep)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
 response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(response);
 }catch{response.writeHead(404).end();}});
await new Promise(resolve=>server.listen(5186,'127.0.0.1',resolve));
const context=await chromium.launchPersistentContext(path.join(project,'.browser','a01s2-'+Date.now().toString(36)),{channel:'msedge',headless:true,viewport:{width:1280,height:900},args:['--no-first-run','--no-default-browser-check']});
const results=[],errors=[],failedRequests=[];
try{for(const course of ['alevel','igcse']){
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)failedRequests.push({url:response.url(),status:response.status()});});
 const client=await context.newCDPSession(page);await client.send('Emulation.setCPUThrottlingRate',{rate:4});await client.send('Network.enable');await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
 const began=Date.now();await page.goto(`http://127.0.0.1:5186/stage-s2/${course}/index.html`);await page.getByRole('button',{name:'Start practice',exact:true}).waitFor();await page.waitForFunction(()=>!Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Start practice').disabled);await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.brand-eagle').evaluate(image=>image.complete&&image.naturalWidth>0),true);
 assert.equal(await page.evaluate(()=>document.fonts.check('700 16px Comfortaa')),true);assert.equal(await page.evaluate(()=>window.__mastersFoundation===undefined&&window.__mastersActivity===undefined),true);
 await page.getByRole('button',{name:'Start practice',exact:true}).click();await page.locator('.question-player h2').waitFor();
 if(course==='alevel'){for(const input of await page.locator('.question-part input').all())await input.fill('1');await page.getByRole('button',{name:'Check answer',exact:true}).click();}
 else {for(const input of await page.locator('.explanation-sections input,.explanation-sections textarea').all())await input.fill('This deliberately incorrect sentence has sufficient length for source review.');await page.getByRole('button',{name:'Submit and freeze response',exact:true}).click();while(await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).count())await page.getByRole('button',{name:'My answer does not meet this point',exact:true}).click();await page.getByRole('button',{name:'Finish self-review',exact:true}).click();}
 await page.getByRole('heading',{name:'First assessment',exact:true}).waitFor();await page.getByTestId('saved-result-count').filter({hasText:'1 saved practice result'}).waitFor();await page.getByText('Saved on this device',{exact:true}).waitFor();
 await client.send('DOM.enable');await client.send('CSS.enable');
 const documentNode=await client.send('DOM.getDocument');
 const computedFonts=await page.evaluate(()=>['html','body','main p:not(.eyebrow)','h1','h2'].map(selector=>({selector,fontFamily:getComputedStyle(document.querySelector(selector)).fontFamily,fontWeight:getComputedStyle(document.querySelector(selector)).fontWeight})));
 const renderedFonts=[];for(const selector of ['main p:not(.eyebrow)','h1','h2']){const {nodeId}=await client.send('DOM.querySelector',{nodeId:documentNode.root.nodeId,selector});const {fonts}=await client.send('CSS.getPlatformFontsForNode',{nodeId});renderedFonts.push({selector,fonts});}
 assert(computedFonts.find(item=>item.selector==='body').fontFamily.includes('system-ui'));
 assert(renderedFonts[0].fonts.some(font=>font.familyName==='Segoe UI'&&!font.isCustomFont&&font.glyphCount>0));
 for(const item of renderedFonts.slice(1))assert(item.fonts.some(font=>font.familyName==='Comfortaa'&&font.isCustomFont&&font.glyphCount>0));
 assert.equal(await page.getByText('S1 foundation development harness',{exact:true}).count(),0);assert.equal(await page.locator('.course-navigation li').count(),course==='alevel'?2:1);
 const disclosure=page.locator('.course-navigation details').first(),summary=disclosure.locator('summary');
 assert.equal(await disclosure.evaluate(element=>element.open),true);await summary.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('.course-navigation details').open);
 await page.keyboard.press('Space');await page.waitForFunction(()=>document.querySelector('.course-navigation details').open);
 await page.screenshot({path:path.join(directory,`${course}-production-prefix.png`),fullPage:true});
 const metrics=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation').map(entry=>({domContentLoadedMs:entry.domContentLoadedEventEnd,start:entry.startTime})),resources:performance.getEntriesByType('resource').map(entry=>({name:entry.name,duration:entry.duration,transferSize:entry.transferSize}))}));
 await page.reload();await page.locator('.question-player h2').waitFor();await page.getByRole('heading',{name:'First assessment',exact:true}).waitFor();await page.getByTestId('saved-result-count').filter({hasText:'1 saved practice result'}).waitFor();
 results.push({course,status:'PASS',prefix:`/stage-s2/${course}/`,directRefresh:true,nativeKeyboardZustandDisclosure:true,computedFonts,renderedFonts,visibleCourse:await page.locator('h1').innerText(),elapsedIncludingRefreshMs:Date.now()-began,throttle:{cpu:4,latencyMs:150,downloadMbps:1.6,uploadKbps:750},metrics});await page.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failedRequests,[]);
}finally{const report={status:results.length===2&&!errors.length&&!failedRequests.length?'PASS':'FAIL',checkedAt:new Date().toISOString(),playwright:'1.62.1',results,pageErrors:errors,failedRequests,limits:'Throttled real S2 production host and first-assessed restore under two URL prefixes; full editor stress/accessibility remains S5.'};fs.writeFileSync(path.join(directory,'build-browser.json'),JSON.stringify(report,null,2)+'\n');await context.close();await new Promise(resolve=>server.close(resolve));console.log(JSON.stringify({status:report.status,courses:results.length,errors,failedRequests}));}
