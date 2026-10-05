import {chromium} from '../../../../../../node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=import.meta.dirname;
fs.mkdirSync(path.join(here,'screens'),{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const page=await context.newPage();
const results={status:'RUNNING',method:'Pinned workspace Playwright, actual headless Edge, fresh context; owned harness mounts current players and real attempt controller, no app storage or sibling stores',checks:[],errors:[]};
page.on('pageerror',e=>results.errors.push(e.message));
const action=name=>page.locator(`[data-question-action="${name}"]`);
const state=()=>page.evaluate(()=>structuredClone(window.u1.state));
const primary=()=>page.locator('.question-actions button.primary').innerText();
const nextCount=()=>page.evaluate(()=>window.u1.nextCount);
const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
try{
 await page.goto('http://127.0.0.1:5188/validation/ui-consistency/u1/controls/harness.html');
 await action('check').waitFor();
 let fields=page.locator('[data-answer-input]');
 assert.equal(await fields.count(),2);
 assert.equal(await fields.nth(0).evaluate(el=>el===document.activeElement),true,'Initial typed autofocus');
 assert.equal(await action('next').isDisabled(),true);
 await fields.nth(0).fill('3');await fields.nth(0).press('Enter');
 assert.equal(await fields.nth(1).evaluate(el=>el===document.activeElement),true);
 await fields.nth(1).fill('wrong');
 for(const event of [{isComposing:true},{repeat:true}]){
  const before=await page.evaluate(()=>window.u1.commands.length);
  await fields.nth(1).evaluate((el,event)=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true,...event})),event);
  assert.equal(await page.evaluate(()=>window.u1.commands.length),before);
 }
 await fields.nth(1).press('Shift+Enter');assert((await fields.nth(1).inputValue()).includes('\n'));
 await fields.nth(1).fill('wrong');await fields.nth(1).press('Enter');await settle();
 assert.equal((await state()).phase,'assessed');assert.equal(await action('next').isEnabled(),true);assert.equal(await primary(),'Check');
 const frozen=await state();
 assert.equal(await page.evaluate(()=>window.u1.commands.filter(x=>x==='submit').length),1,'Enter submits once');
 await fields.nth(0).fill('2');await fields.nth(1).fill('correct');await fields.nth(1).press('Enter');await settle();
 assert.equal(await primary(),'Next');assert.deepEqual((await state()).firstResponse,frozen.firstResponse);
 const n=await nextCount();await fields.nth(0).press('Enter');await settle();assert.equal(await nextCount(),n+1,'Next primary bypasses multipart field advancement');
 await fields.nth(1).fill('changed');await settle();assert.equal(await primary(),'Check');
 await action('clear').click();await settle();
 assert.deepEqual((await state()).currentResponses,{});assert.equal(await primary(),'Check');assert.equal(await action('next').isEnabled(),true);
 assert.deepEqual((await state()).firstAssessment,frozen.firstAssessment);assert.deepEqual((await state()).firstResponse,frozen.firstResponse);
 assert.equal(await fields.nth(0).inputValue(),'');assert.equal(await fields.nth(1).inputValue(),'');
 assert.equal(await page.evaluate(()=>window.u1.commands.filter(x=>x==='clear').length),1);
 await action('give-up').click();await settle();assert.equal(await primary(),'Next');
 assert.deepEqual((await state()).firstAssessment,frozen.firstAssessment);
 await action('clear').click();await settle();assert.equal(await primary(),'Check');
 await page.evaluate(()=>window.setCanNext(false));await settle();assert.equal(await action('next').isDisabled(),true);
 // Button Enter uses the native click exactly once, and selects remain untouched.
 const checks=await page.evaluate(()=>window.u1.commands.filter(x=>x==='check-correction').length);
 await action('check').focus();await action('check').press('Enter');await settle();
 assert.equal(await page.evaluate(()=>window.u1.commands.filter(x=>x==='check-correction').length),checks+1);
 const commands=await page.evaluate(()=>window.u1.commands.length);
 await page.getByLabel('Unrelated select').focus();await page.getByLabel('Unrelated select').press('Enter');await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>window.u1.commands.length),commands);
 results.checks.push({id:'generic-state-keyboard',status:'PASS',checks:['initial autofocus','rerender keeps focus','Enter multipart','single submit','ShiftEnter newline','IME/repeat guards','wrong unlock','correct correction','Next Enter','edit invalidation','Clear one dispatch and blank','first answer score time unchanged','post-assess GiveUp','canNext gate','native button single activation','select guard']});
 await page.screenshot({path:path.join(here,'screens','generic-desktop.png'),fullPage:true});
 // New generic attempt autofocuses again and unassessed Give Up preserves no score.
 await fields.nth(1).focus();await page.evaluate(()=>window.loadFixture());await settle();
 assert.equal(await fields.nth(0).evaluate(el=>el===document.activeElement),true);
 await action('give-up').click();await settle();assert.equal((await state()).firstAssessment.kind,'revealed');assert.equal(await primary(),'Next');
 await action('clear').click();await settle();assert.equal(await primary(),'Check');
 // Real source-family questions share exactly one action row at desktop/tablet/mobile.
 for(const [activity,level,fixed] of [['alevel/acid-base-calculations',2],['alevel/electrons-bonding',1],['alevel/electron-configurations',1],['alevel/ph-titration-curves',2],['igcse/calorimetry',1],['igcse/bond-enthalpy',1],['igcse/energy-enthalpy',2],['igcse/energetics-practical',2],['igcse/structure-and-bonding',2],['alevel/dot-and-cross',1],['igcse/dot-and-cross',1]]){
  await page.evaluate(([a,l,f])=>window.loadFixture(a,l,'student',f),[activity,level,fixed]);
  await action('check').waitFor();await settle();
  assert.deepEqual(await page.locator('.question-actions button').allTextContents(),['Check','Clear','Give Up','Next']);
  assert.equal(await page.locator('.question-actions').count(),1);
  assert.equal(await action('next').isDisabled(),true);
  for(const width of [1280,768,390]){
   await page.setViewportSize({width,height:900});await settle();
   const boxes=await page.locator('.question-actions button').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,font:getComputedStyle(n).fontFamily};}));
   assert(boxes.every(x=>Math.abs(x.top-boxes[0].top)<1),'One row');
   assert(boxes.every(x=>x.left>=0&&x.right<=width),'Action viewport fit');
   assert(boxes.every(x=>x.font.includes('Comfortaa')));
   const right=await page.locator('.question-actions').evaluate(n=>n.getBoundingClientRect().right);
   assert(Math.abs(boxes.at(-1).right-right)<1,'Right aligned');
   await page.screenshot({path:path.join(here,'screens',`${activity.replace('/','-')}-${width}.png`),fullPage:true});
  }
  await action('give-up').click();await settle();
  assert.equal(await primary(),'Next');assert.equal((await state()).firstAssessment.kind,'revealed');
  if(activity.includes('dot-and-cross'))await page.getByRole('button',{name:'Close answer',exact:true}).click();
  await action('clear').click();await settle();assert.deepEqual((await state()).currentResponses,{});assert.equal(await primary(),'Check');
  if(activity==='alevel/electron-configurations')assert.equal(await page.getByText('Set spins without cycling',{exact:true}).count(),0);
  results.checks.push({id:activity,status:'PASS',questionId:(await state()).ref.questionId,views:[1280,768,390],exactSharedRow:true,giveUp:true,clear:true});
 }
 // Actual source self-review must finish its rubric before any footer action can progress.
 await page.evaluate(()=>window.loadFixture('igcse/structure-and-bonding',2));await action('check').waitFor();
 fields=page.locator('[data-answer-input]');
 for(let i=0;i<await fields.count();i++)await fields.nth(i).fill('A submitted explanation for reviewing evidence and marking points.');
 await action('check').click();await settle();assert.equal((await state()).phase,'rubric-review');
 assert.equal(await page.locator('.question-actions button:disabled').count(),4);
 assert.equal(await page.getByRole('button',{name:'Finish marking',exact:true}).isDisabled(),true);
 const locked=structuredClone((await state()).firstResponse);
 while(await page.locator('.decision.no:not(:disabled)').count())await page.locator('.decision.no:not(:disabled)').first().click();
 assert.equal(await action('next').isDisabled(),true);
 await page.getByRole('button',{name:'Finish marking',exact:true}).click();await settle();
 assert.equal((await state()).phase,'assessed');assert.equal(await action('next').isEnabled(),true);
 assert.deepEqual((await state()).firstResponse,locked);assert.equal((await state()).firstAssessment.kind,'self-rubric');
 results.checks.push({id:'source-rubric-staging',status:'PASS',checks:['Check freezes writing','four footer controls disabled during review','Finish disabled until every judgement','Next cannot bypass','judgements and Finish retained','frozen response/time unchanged']});
 await page.evaluate(()=>window.loadFixture('igcse/bond-enthalpy',3));await action('check').waitFor();
 const numeric=await page.evaluate(()=>window.u1.question.parts.filter(p=>p.kind==='numeric').map(p=>p.acceptance.expected));
 fields=page.locator('[data-answer-input]');
 for(let i=0;i<numeric.length;i++)await fields.nth(i).fill(String(numeric[i]));
 await action('check').click();await settle();assert.equal((await state()).phase,'drawing-review');
 assert.equal(await page.locator('.question-actions button:disabled').count(),4);
 const drawingFrozen=structuredClone((await state()).firstResponse);
 await page.getByRole('button',{name:'My drawing meets every criterion',exact:true}).click();await settle();
 assert.equal((await state()).phase,'assessed');assert.equal((await state()).firstAssessment.kind,'self-drawing');
 assert.deepEqual((await state()).firstResponse,drawingFrozen);assert.equal(await action('next').isEnabled(),true);
 results.checks.push({id:'source-drawing-staging',status:'PASS',checks:['automatic calculation freezes first','footer cannot bypass drawing review','required criteria confirm retained','same first response/timing after final aggregate']});
 // Editor-owned input Enter still commits locally and Clear removes its transient draft/undo.
 await page.evaluate(()=>window.loadFixture('igcse/energy-enthalpy',2));await action('check').waitFor();
 await page.getByText('Keyboard and non-drag profile controls',{exact:true}).click();
 const coordinate=page.getByLabel('Right level screen y',{exact:true});
 const initial=await coordinate.inputValue();await coordinate.fill('210');await coordinate.press('Enter');await settle();
 assert.equal((await state()).phase,'answering');assert.equal((await state()).currentResponses[Object.keys((await state()).currentResponses)[0]].p,210);
 await coordinate.fill('220');await action('clear').click();await settle();
 assert.equal(await coordinate.inputValue(),initial);assert.deepEqual((await state()).currentResponses,{});
 assert.equal(await page.locator('.source-energy-profile').getByRole('button',{name:'Undo',exact:true}).isDisabled(),true);
 results.checks.push({id:'energy-editor-keyboard-clear',status:'PASS',checks:['editor Enter commits locally without submitting','Clear discards uncommitted draft','Clear resets undo and initial diagram']});
 // Orbital cycling and explicit keyboard spin shortcuts remain intact after panel removal.
 await page.evaluate(()=>window.loadFixture('alevel/electron-configurations',1));await action('check').waitFor();
 const orbital=page.locator('[data-orbital]').first();await orbital.focus();await orbital.press('2');await settle();
 assert.equal((await state()).currentResponses[Object.keys((await state()).currentResponses)[0]].boxes[0][0],3);
 await orbital.press('Space');await settle();assert.equal((await state()).currentResponses[Object.keys((await state()).currentResponses)[0]].boxes[0][0],0);
 await action('clear').click();await settle();assert.deepEqual((await state()).currentResponses,{});
 assert.equal(await page.getByText('Set spins without cycling',{exact:true}).count(),0);
 results.checks.push({id:'electron-cycling-keyboard',status:'PASS'});
 results.status='PASS';
}catch(e){results.status='FAIL';results.failure=e.stack;process.exitCode=1;await page.screenshot({path:path.join(here,'screens','failure.png'),fullPage:true}).catch(()=>{});}
finally{fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();console.log(JSON.stringify(results,null,2));}
