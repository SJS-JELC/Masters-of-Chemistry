import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{createRequire}from'node:module';
const here=import.meta.dirname,require=createRequire(path.resolve(here,'../../../../../../package.json'));
assert.equal(require('playwright/package.json').version,'1.62.1');const{chromium}=require('playwright');
const base='http://127.0.0.1:5188',original='http://127.0.0.1:5197/igcse/activities/energetics-practical/index.html';
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={runId:'COMPONENT-FIDELITY-20261003',jobId:'F1-UI-PILOT',agentId:'F03',startedAt:new Date().toISOString(),status:'RUNNING',browser:'Microsoft Edge headless / pinned root Playwright 1.62.1',originalIsolation:'Fresh nonpersistent contexts; synthetic ephemeral source responses; originals served GET/HEAD only; no original builds/user stores',checks:[],screenshots:[],metrics:[],errors:[],limitations:['Native OS hidden/minimized/suspend is not tested or claimed in this UI pilot.','Other activities and graph correction await F2 restoration and rendered acceptance.']};
const snap=p=>p.evaluate(()=>window.__mastersActivity.snapshot()),flush=p=>p.evaluate(()=>window.__mastersActivity.flush());
async function shoot(p,name,selector){await p.evaluate(()=>document.fonts.ready);const file=name+'.png';await p.locator(selector).screenshot({path:path.join(here,file)});report.screenshots.push(file);}
async function startReact(context,kind='practice'){
 await context.addInitScript(()=>{crypto.getRandomValues=(array)=>{array.fill(3);return array;};});
 const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto(`${base}/igcse.html?course=igcse&run=f03-${kind}-${Date.now()}-${Math.random()}`);await p.locator('.original-landing').waitFor();
 if(kind==='revision'){
  await p.getByRole('button',{name:'Revision',exact:true}).click();
  await p.locator('[data-topic="lower-topic-10"] .topic-trigger').click();
  await p.locator('[data-leaf="lower-10-2"]').click();
  await p.getByRole('button',{name:'Go: start revision',exact:true}).click();
 }else{
  await p.evaluate(()=>location.hash='lower-10-2');await p.locator('#gemDetails').waitFor({state:'visible'});
  await p.locator('a.practice-choice[data-practice="2"]').click();
 }
 await p.locator('.ep-pilot').waitFor();await flush(p);assert.equal((await snap(p)).question.ref.questionId,'EP-CXMNAV');return p;
}
async function startOriginal(context){
 await context.addInitScript(()=>{
  localStorage.setItem('energetics-practical-local-2-pupil',JSON.stringify({level:'7-8',currentId:'EP-CXMNAV',review:false,responses:{},checked:{}}));
 });
 const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));await p.goto(original+'?grade=2&mode=pupil');await p.locator('#questionCard .error-segment').first().waitFor();
 assert.equal(await p.locator('#questionCard .context').innerText(),'A pupil explains the use of an insulated cup during an exothermic reaction. One selectable phrase is incorrect.');return p;
}
async function metrics(p,app,viewport){return p.evaluate(({app,viewport})=>{
 const pick=s=>{const e=document.querySelector(s),c=getComputedStyle(e),r=e.getBoundingClientRect();return{tag:e.tagName,fontFamily:c.fontFamily,fontSize:c.fontSize,lineHeight:c.lineHeight,fontWeight:c.fontWeight,color:c.color,background:c.backgroundColor,padding:c.padding,border:c.border,borderRadius:c.borderRadius,width:r.width,height:r.height};};
 return{app,viewport,correction:pick('.correction-segments'),phrase:pick('.error-segment'),input:pick('.answer-input'),overflow:document.documentElement.scrollWidth>innerWidth};
 },{app,viewport});}
try{
 for(const [size,viewport]of Object.entries({desktop:{width:1440,height:1000},tablet:{width:820,height:1180},mobile:{width:390,height:844}})){
  const rc=await browser.newContext({viewport,hasTouch:size==='mobile'}),oc=await browser.newContext({viewport,hasTouch:size==='mobile'});
  const r=await startReact(rc),o=await startOriginal(oc);
  assert.equal(await r.locator('.header-question-code').count(),1);assert.equal(await r.locator('.header-question-code').innerText(),'EP-CXMNAV');assert.equal(await r.locator('.ep-pilot .question-review-id,.ep-pilot .review-id').count(),0);
  await r.screenshot({path:path.join(here,`react-${size}-full-chrome.png`),fullPage:true});report.screenshots.push(`react-${size}-full-chrome.png`);
  await shoot(r,`react-${size}-unanswered`,'.ep-pilot');await shoot(o,`original-${size}-unanswered`,'#questionCard');
  const rm=await metrics(r,'react',size),om=await metrics(o,'original',size);report.metrics.push(rm,om);
  assert.equal(rm.overflow,false);assert.equal(om.overflow,false);
  for(const kind of['correction','phrase','input'])for(const property of['fontFamily','fontSize','lineHeight','fontWeight'])assert.equal(rm[kind][property],om[kind][property],`${size} ${kind} ${property}`);
  await r.getByRole('button',{name:'completely prevents',exact:true}).focus();await r.keyboard.press('Space');assert.equal(await r.getByLabel('Replacement phrase',{exact:true}).evaluate(e=>document.activeElement===e),true);
  await o.getByRole('button',{name:'completely prevents',exact:true}).click();
  await shoot(r,`react-${size}-partial`,'.ep-pilot');await shoot(o,`original-${size}-partial`,'#questionCard');
  assert.equal(await r.getByRole('button',{name:'Check answer',exact:true}).isDisabled(),true);
  await flush(r);const partial=await snap(r);await r.reload();await r.locator('.ep-pilot').waitFor();await flush(r);
  assert.equal((await snap(r)).attempt.attemptId,partial.attempt.attemptId);assert.deepEqual((await snap(r)).attempt.currentResponses,partial.attempt.currentResponses);
  await r.getByLabel('Replacement phrase',{exact:true}).fill('increases');await o.getByLabel('Replacement phrase',{exact:true}).fill('increases');
  await r.getByLabel('Replacement phrase',{exact:true}).press('Enter');await o.getByRole('button',{name:'Check answer',exact:true}).click();
  await r.locator('.assessment-feedback').waitFor();await flush(r);const first=await snap(r);
  assert.equal(first.attempt.firstAssessment.marks.earned,1);assert.equal(first.attempt.firstAssessment.marks.available,2);
  assert(first.attempt.firstResponse.timing.activeMs>0);assert.equal(first.attempt.timing,undefined);
  await shoot(r,`react-${size}-incorrect`,'.ep-pilot');await shoot(o,`original-${size}-incorrect`,'#questionCard');
  assert.deepEqual(await r.locator('.result-icon').allTextContents(),['✓','✗']);
  const alternative=r.getByRole('button',{name:'My answer means the same',exact:true});
  await alternative.click();await flush(r);assert.equal(await alternative.getAttribute('aria-pressed'),'true');assert.equal((await snap(r)).attempt.learningReview.reviewedMarks.earned,2);
  await alternative.click();await flush(r);assert.equal(await alternative.getAttribute('aria-pressed'),'false');assert.equal((await snap(r)).attempt.learningReview.reviewedMarks.earned,1);assert.deepEqual((await snap(r)).attempt.firstAssessment,first.attempt.firstAssessment);
  await o.getByRole('button',{name:'Try again',exact:true}).click();
  await r.getByLabel('Replacement phrase',{exact:true}).fill('reduces');await o.getByLabel('Replacement phrase',{exact:true}).fill('reduces');
  await r.getByRole('button',{name:'Check correction',exact:true}).click();await o.getByRole('button',{name:'Check answer',exact:true}).click();
  await r.locator('.correction-feedback').waitFor();await flush(r);
  const corrected=await snap(r);assert.equal(corrected.correctionFeedback.marks.earned,2);assert.deepEqual(corrected.attempt.firstAssessment,first.attempt.firstAssessment);assert.deepEqual(corrected.attempt.firstResponse,first.attempt.firstResponse);
  const history=await r.evaluate(()=>window.__mastersActivity.history());assert.equal(history.length,1);assert.equal(history[0].score,first.attempt.firstAssessment.score);
  await shoot(r,`react-${size}-correction`,'.ep-pilot');await shoot(o,`original-${size}-correction`,'#questionCard');
  await r.getByRole('button',{name:'Show worked answer',exact:true}).click();await o.getByRole('button',{name:'Review model answers',exact:true}).click();
  await r.locator('.worked-answer').waitFor();await flush(r);
  await shoot(r,`react-${size}-model`,'.ep-pilot');await shoot(o,`original-${size}-model`,'#questionCard');
  const model=await snap(r);await r.reload();await r.locator('.worked-answer').waitFor();await flush(r);const restored=await snap(r);
  assert.equal(restored.attempt.attemptId,first.attempt.attemptId);assert.deepEqual(restored.attempt.firstAssessment,first.attempt.firstAssessment);assert.deepEqual(restored.attempt.currentResponses,model.attempt.currentResponses);assert.deepEqual(restored.attempt.firstResponse.timing,first.attempt.firstResponse.timing);
  assert.equal((await r.evaluate(()=>window.__mastersActivity.history())).length,1);
  const correctRc=await browser.newContext({viewport,hasTouch:size==='mobile'}),correctOc=await browser.newContext({viewport,hasTouch:size==='mobile'}),cr=await startReact(correctRc),co=await startOriginal(correctOc);
  if(size==='mobile')await cr.getByRole('button',{name:'completely prevents',exact:true}).tap();else await cr.getByRole('button',{name:'completely prevents',exact:true}).click();
  await co.getByRole('button',{name:'completely prevents',exact:true}).click();await cr.getByLabel('Replacement phrase',{exact:true}).fill('reduces');await co.getByLabel('Replacement phrase',{exact:true}).fill('reduces');
  await cr.getByRole('button',{name:'Check answer',exact:true}).click();await co.getByRole('button',{name:'Check answer',exact:true}).click();await cr.locator('.assessment-feedback').waitFor();await flush(cr);
  assert.equal((await snap(cr)).attempt.firstAssessment.marks.earned,2);
  await shoot(cr,`react-${size}-correct`,'.ep-pilot');await shoot(co,`original-${size}-correct`,'#questionCard');
  const teacher=await rc.newPage();await teacher.goto(`${base}/igcse.html?course=igcse&run=f03-teacher-${size}&view=teacher&activity=igcse%2Fenergetics-practical&review=EP-CXMNAV&level=2&seed=3`);await teacher.locator('.teacher-answer').waitFor();await flush(teacher);
  assert.equal((await snap(teacher)).attempt,null);assert.equal((await teacher.evaluate(()=>window.__mastersActivity.history())).length,0);assert.equal(await teacher.getByLabel('Replacement phrase',{exact:true}).getAttribute('readonly'),'');
  await shoot(teacher,`react-${size}-teacher-model`,'.ep-pilot');
  report.checks.push({size,question:'EP-CXMNAV',states:['unanswered','partial','incorrect','correct','correction','model'],keyboardSelectionFocus:true,enterSubmission:true,touchPointerCompatible:true,restoreSameAttempt:true,firstEvidenceImmutable:true,historyDeduplicated:true,equivalentWordToggleLearningOnly:true,teacherNoEvidence:true,computedFinalFontMatch:true});
  await correctRc.close();await correctOc.close();await rc.close();await oc.close();
 }
 const revisionContext=await browser.newContext({viewport:{width:1440,height:1000}}),revision=await startReact(revisionContext,'revision');
 const rev=await snap(revision);assert.equal(rev.session.kind,'revision');
 await revision.getByRole('button',{name:'completely prevents',exact:true}).click();await revision.getByLabel('Replacement phrase',{exact:true}).fill('reduces');await flush(revision);const revPartial=await snap(revision);
 await revision.reload();await revision.locator('.ep-pilot').waitFor();await flush(revision);assert.equal((await snap(revision)).attempt.attemptId,revPartial.attempt.attemptId);assert.deepEqual((await snap(revision)).attempt.currentResponses,revPartial.attempt.currentResponses);
 await revision.getByRole('button',{name:'Check answer',exact:true}).click();await revision.locator('.assessment-feedback').waitFor();await flush(revision);const revAssessed=await snap(revision);assert.equal(revAssessed.attempt.firstAssessment.marks.earned,2);assert.equal((await revision.evaluate(()=>window.__mastersActivity.history())).length,1);
 await revision.getByRole('button',{name:'Next question',exact:true}).click();await revision.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id,revAssessed.attempt.attemptId);await revision.locator('.question-player').waitFor();await flush(revision);assert.notEqual((await snap(revision)).attempt.attemptId,revAssessed.attempt.attemptId);
 report.checks.push({mode:'revision',restoration:true,firstEvidence:true,schedulerNext:true,freshAttempt:true});await revisionContext.close();
 report.status='PASS';
}catch(error){report.status='FAIL';report.errors.push(error.stack??String(error));console.error(error);}finally{report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(here,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,screenshots:report.screenshots.length,errors:report.errors}));if(report.status!=='PASS')process.exitCode=1;}
