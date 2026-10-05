import {chromium} from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,before=process.env.UX_NAV_BEFORE==='1',tag=before?'before':'after',run=`a17-teacher-nav-${tag}-${Date.now()}`;
const report={status:'RUNNING',headless:true,playwright:'1.62.1',scope:'Actual production host/controller/repository, teacher sidebar and paused practice restoration',checks:[],errors:[]};
const context=await chromium.launchPersistentContext(path.join(here,run),{channel:'msedge',headless:true,viewport:{width:1440,height:1000}}),page=await context.newPage();
page.on('pageerror',error=>report.errors.push(error.message));
const snap=()=>page.evaluate(()=>window.__mastersActivity.snapshot()),flush=()=>page.evaluate(()=>window.__mastersActivity.flush());
const highlighted=()=>page.locator('.course-navigation button[aria-current="page"]').allTextContents();
try{
 await page.clock.install();
 await page.goto(`http://127.0.0.1:5192/alevel.html?run=${run}`);
 await page.getByLabel('Target',{exact:true}).selectOption('u6-t1-1-2:1');
 await page.getByRole('button',{name:'Start practice',exact:true}).click();
 await page.waitForFunction(()=>!!window.__mastersActivity&&window.__mastersActivity.snapshot().attempt!=null);
 await page.locator('.question-part input').first().fill('1.23');
 await flush();await page.clock.runFor(2100);
 await page.getByRole('button',{name:'Pause and save',exact:true}).click();await flush();
 const paused=await snap();report.paused=paused;const pupilHighlight=await highlighted();
 assert.equal(paused.session.paused,true);assert(Object.keys(paused.attempt.currentResponses).length>0);
 assert(paused.attempt.timing.activeMs>0);assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);
 await page.getByRole('button',{name:'Teacher',exact:true}).click();
 await page.getByLabel('Teacher activity',{exact:true}).selectOption('alevel/electron-configurations');
 await page.getByTestId('teacher-catalogue-count').filter({hasText:'1144 of 1144'}).waitFor();
 await page.getByLabel('Question code',{exact:true}).fill('EC-CMICC5');
 await page.getByRole('button',{name:'Open question code',exact:true}).click();
 await page.locator('.question-meta code').filter({hasText:'EC-CMICC5'}).waitFor();
 report.orbital={question:await page.locator('.question-meta code').innerText(),highlighted:await highlighted(),activity:await page.getByLabel('Teacher activity',{exact:true}).inputValue()};
 await page.screenshot({path:path.join(here,`teacher-navigation-${tag}-orbital.png`),fullPage:true});
 const bondingButton=page.locator('.course-navigation').getByRole('button',{name:'Electrons and bonding',exact:true});
 await bondingButton.click();
 if(before){
  await page.clock.runFor(300);
  report.sidebarClick={question:await page.locator('.question-meta code').innerText(),highlighted:await highlighted(),activity:await page.getByLabel('Teacher activity',{exact:true}).inputValue()};
  assert.equal(report.orbital.highlighted.length,1);assert(!report.orbital.highlighted[0].includes('Electron configurations'));
  assert.equal(report.sidebarClick.activity,'alevel/electron-configurations');
  report.status='OBSERVED_FAIL';report.checks.push('Reproduced reported wrong acid sidebar highlight and teacher sidebar click leaving orbital preview unchanged');
 }else{
  assert.deepEqual(report.orbital.highlighted,['Electron configurations']);
  await page.getByTestId('teacher-catalogue-count').filter({hasText:'14 of 14'}).waitFor();
  await page.waitForFunction(()=>document.querySelector('.question-meta code')?.textContent!== 'EC-CMICC5');
  report.sidebarClick={question:await page.locator('.question-meta code').innerText(),highlighted:await highlighted(),activity:await page.getByLabel('Teacher activity',{exact:true}).inputValue()};
  assert.equal(report.sidebarClick.activity,'alevel/electrons-bonding');
  assert.deepEqual(report.sidebarClick.highlighted,['Electrons and bonding']);
  assert.notEqual(report.sidebarClick.question,report.orbital.question);
  assert(await page.locator('.teacher-answer').count()>0);
  assert.equal(await page.locator('.question-part input').count(),0);
  report.checks.push('Teacher orbital EC-CMICC5 highlights its own activity; sidebar selects complete bonding catalogue and immediately displays checked source question');
 }
 await flush();assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);
 assert.deepEqual((await snap()).attempt,paused.attempt);assert.deepEqual((await snap()).session,paused.session);
 await page.screenshot({path:path.join(here,`teacher-navigation-${tag}-sidebar.png`),fullPage:true});
 await page.getByRole('button',{name:'Practice',exact:true}).click();
 await page.getByRole('button',{name:'Resume saved attempt',exact:true}).waitFor();await flush();
 const restored=await snap();report.restored=restored;
 assert.deepEqual(restored.attempt,paused.attempt);assert.deepEqual(restored.session,paused.session);
 assert.deepEqual(await page.evaluate(()=>window.__mastersActivity.history()),[]);
 assert.deepEqual(await highlighted(),pupilHighlight);
 await page.screenshot({path:path.join(here,`teacher-navigation-${tag}-practice.png`),fullPage:true});
 report.checks.push('Teacher visits create zero evidence and leave the entire real paused attempt/session unchanged; Practice restores exact ID, response and active time');
 if(!before){
  await page.getByRole('button',{name:'Teacher',exact:true}).click();
  await page.getByTestId('teacher-catalogue-count').filter({hasText:'14 of 14'}).waitFor();
  await page.getByLabel('Teacher activity',{exact:true}).selectOption('alevel/electron-configurations');
  await page.getByTestId('teacher-catalogue-count').filter({hasText:'1144 of 1144'}).waitFor();
  await page.getByLabel('Teacher question',{exact:true}).selectOption('EC-CMICC5:3');
  await page.locator('.question-meta span').filter({hasText:'Level 3'}).waitFor();await page.clock.runFor(1000);
  assert.equal(await page.getByLabel('Teacher activity',{exact:true}).inputValue(),'alevel/electron-configurations');
  assert.equal(await page.getByLabel('Teacher question',{exact:true}).inputValue(),'EC-CMICC5:3');
  assert.deepEqual(await highlighted(),['Electron configurations']);
  assert.deepEqual((await snap()).attempt,paused.attempt);
  report.checks.push('Teacher dropdown activity and chosen level remain selected after reopening and subsequent sidebar catalogue changes');
  const exact=await page.evaluate(async()=>{
   const {acidProvider}=await import('/src/activities/alevel/acid-base-calculations/provider.ts');
   const ref=acidProvider.select({activityId:'alevel/acid-base-calculations',gemId:'u6-t1-1-2',level:3,seed:17,previousQuestionIds:[]});
   return {ref,question:acidProvider.restore(ref)};
  });
  const linked=await context.newPage();
  const url=new URL('http://127.0.0.1:5192/alevel.html');url.search=new URLSearchParams({run:run+'-link',view:'teacher',review:exact.ref.questionId,activity:exact.ref.activityId,level:'3',seed:'17'}).toString();
  await linked.goto(url.href);await linked.locator('.teacher-answer').waitFor();
  assert.equal(await linked.locator('.question-meta code').innerText(),exact.ref.questionId);
  assert.equal(await linked.locator('.question-meta span').innerText(),'Level 3');
  const answer=await linked.locator('.teacher-answer').innerText();
  for(const block of exact.question.workedAnswer)if(block.kind==='formula'||block.kind==='text')assert(answer.includes(block.text));
  assert.deepEqual(await linked.evaluate(()=>window.__mastersActivity.history()),[]);
  report.exactLink={ref:exact.ref,renderedAnswer:answer};
  await linked.screenshot({path:path.join(here,'teacher-navigation-exact-link.png'),fullPage:true});await linked.close();
  report.checks.push('Exact provided generated review link preserves level 3 and seed 17: encoded source ID and every checked-answer value match real provider.restore(ref), with zero evidence');
 }
 assert.deepEqual(report.errors,[]);if(!before)report.status='PASS';
}catch(error){report.status='FAIL';report.failure=error.stack;process.exitCode=1;await page.screenshot({path:path.join(here,`teacher-navigation-${tag}-failure.png`),fullPage:true}).catch(()=>{});console.error(error);}
finally{fs.writeFileSync(path.join(here,`teacher-navigation-${tag}-results.json`),JSON.stringify(report,null,2));await context.close();console.log(JSON.stringify({status:report.status,checks:report.checks,errors:report.errors}));}
