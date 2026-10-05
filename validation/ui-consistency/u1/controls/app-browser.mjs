import {chromium} from '../../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=import.meta.dirname,browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
const results={status:'RUNNING',method:'Current production entry in DEV on port5188; real headless Edge and isolated alpha-v2 run namespace; IndexedDB readback, reload and Next; no sibling storage',checks:[],errors:[]};
page.on('pageerror',e=>results.errors.push(e.message));
const dbName='masters-of-chemistry-alpha-v2-alevel-ui-controls-u1';
const row=()=>page.locator('.question-actions');
const action=k=>page.locator(`[data-question-action="${k}"]`);
async function read(){return page.evaluate(async dbName=>{
 const db=await new Promise(r=>{const q=indexedDB.open(dbName);q.onsuccess=()=>r(q.result)});
 const all=await new Promise(r=>{const q=db.transaction('attempts').objectStore('attempts').getAll();q.onsuccess=()=>r(q.result)});db.close();
 return all.map(x=>x.value);
},dbName);}
async function saved(){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await read();}
try{
 const url='http://127.0.0.1:5188/alevel.html?activity=alevel/acid-base-calculations&view=practice&run=ui-controls-u1';
 await page.goto(url);await page.getByRole('button',{name:'Start practice',exact:true}).waitFor();
 const q=await page.evaluate(async dbName=>{
  const {productionRegistry}=await import('/src/foundation/registry.ts');const reg=productionRegistry.get('alevel/acid-base-calculations'),provider=await reg.provider();
  const gem=reg.gems.find(g=>g.supportedLevels.includes(2));
  const ref=provider.select({activityId:reg.id,gemId:gem.id,level:2,seed:11,previousQuestionIds:[]});const q=provider.restore(ref);
  const attemptId='U1-APP-ACID',namespace={course:'alevel',profileId:'local'},target={course:'alevel',activityId:reg.id,gemId:gem.id,level:2};
  const attempt={mode:'student',namespace,attemptId,ref,target,currentResponses:{},assistance:[],phase:'answering',timing:{attemptId,activeMs:0,idleLimitMs:reg.idleAllowance(q),finished:false}};
  const session={kind:'practice',namespace,id:'current-session',target,selection:'fixed-level',currentAttemptId:attemptId,previousQuestionIds:[]};
  const db=await new Promise(r=>{const op=indexedDB.open(dbName);op.onsuccess=()=>r(op.result)});
  await new Promise((r,j)=>{const t=db.transaction(['attempts','sessions'],'readwrite');for(const [name,value,id] of [['attempts',attempt,attemptId],['sessions',session,session.id]])t.objectStore(name).put({course:'alevel',profileId:'local',id,value});t.oncomplete=r;t.onerror=j;});db.close();return q;
 },dbName);
 await page.reload();await row().waitFor();const input=page.locator('[data-answer-input]').first();
 assert.equal(await input.evaluate(el=>el===document.activeElement),true);
 await input.fill('99');await input.press('Enter');await saved();
 let first=(await read()).find(x=>x.attemptId==='U1-APP-ACID');assert.equal(first.phase,'assessed');assert.equal(first.firstAssessment.marks.earned,0);
 assert.equal(await action('next').isEnabled(),true);assert.equal(await row().locator('button.primary').innerText(),'Check');
 await input.fill(q.parts[0].acceptance.expected.toFixed(2));await input.press('Enter');await saved();
 assert.equal(await row().locator('button.primary').innerText(),'Next');
 await action('clear').click();await saved();
 let cleared=(await read()).find(x=>x.attemptId===first.attemptId);
 assert.deepEqual(cleared.currentResponses,{});assert.deepEqual(cleared.firstResponse,first.firstResponse);assert.deepEqual(cleared.firstAssessment,first.firstAssessment);
 assert.equal(await page.locator('[aria-label="Learning correction check"]').count(),0);
 await page.reload();await row().waitFor();assert.equal(await input.inputValue(),'');assert.equal(await row().locator('button.primary').innerText(),'Check');assert.equal(await action('next').isEnabled(),true);
 let restored=(await read()).find(x=>x.attemptId===first.attemptId);assert.deepEqual(restored.firstResponse,first.firstResponse);
 await action('give-up').click();await saved();assert.equal(await row().locator('button.primary').innerText(),'Next');
 await page.reload();await row().waitFor();assert.equal(await row().locator('button.primary').innerText(),'Next');
 await action('clear').click();await saved();await page.reload();await row().waitFor();assert.equal(await row().locator('button.primary').innerText(),'Check');
 await action('next').click();await saved();await row().waitFor();assert.equal(await action('next').isDisabled(),true);
 const attempts=await read();assert.equal(attempts.length,2);const fresh=attempts.find(x=>x.attemptId!==first.attemptId);assert.equal(fresh.phase,'answering');assert.notEqual(fresh.attemptId,first.attemptId);
 assert.equal(await page.locator('[data-answer-input]').first().evaluate(el=>el===document.activeElement),true);
 await action('give-up').click();await saved();const given=(await read()).find(x=>x.attemptId===fresh.attemptId);assert.equal(given.firstAssessment.kind,'revealed');
 await action('clear').click();await saved();await page.reload();await row().waitFor();assert.equal(await row().locator('button.primary').innerText(),'Check');
 const after=(await read()).find(x=>x.attemptId===fresh.attemptId);assert.deepEqual(after.firstAssessment,given.firstAssessment);assert.deepEqual(after.firstResponse,given.firstResponse);
 results.checks.push({id:'app-first-evidence-reload-next',status:'PASS',questionId:q.ref.questionId,firstAttemptId:first.attemptId,freshAttemptId:fresh.attemptId,checks:['wrong first result unlock','current correction Next','Clear removes correction display','first response score time preserved','Clear persistence and reload','GiveUp reload primary','post-assess GiveUp preserves first','Next fresh attempt and autofocus','blank GiveUp Clear reload Check']});
 await page.screenshot({path:path.join(here,'screens','actual-app-reload.png'),fullPage:true});
 results.status='PASS';
}catch(e){results.status='FAIL';results.failure=e.stack;process.exitCode=1;await page.screenshot({path:path.join(here,'screens','actual-app-failure.png'),fullPage:true}).catch(()=>{});}
finally{fs.writeFileSync(path.join(here,'app-browser-results.json'),JSON.stringify(results,null,2));await browser.close();console.log(JSON.stringify(results,null,2));}
