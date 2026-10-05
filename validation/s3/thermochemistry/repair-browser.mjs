import fs from 'node:fs';
const file=new URL('./browser.mjs',import.meta.url);
let text=fs.readFileSync(file,'utf8');
text=text.replace(/name:`Bond enthalpy [^`]+\$\{reaction.name\}`/g,'name:new RegExp(reaction.name)');
text=text.replace(/name:'Calorimetry [^']+Dissolving'/g,"name:/Calorimetry/");
text=text.replace("await flush();const after=await snap();assert.equal(JSON.stringify(after.attempt.firstResponse),frozen);","await flush();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().history.length===1);const after=await snap();assert.equal(JSON.stringify(after.attempt.firstResponse),frozen);");
const revision=` await scenario('revision-topic-add-all-pause-reload-next',async()=>{
  await open('revision','&session=revision');await page.getByRole('button',{name:'ADD ALL lower-10',exact:true}).click();const selected=(await snap()).selectedCount;assert(selected>=6);await start('lower-10-3:1');
  const visited=[];for(let route=0;route<18;route++){
   let current=await snap();const activity=current.question.ref.activityId;
   if(activity==='igcse/energy-enthalpy'){
    for(const part of current.question.parts){if(part.kind==='choice')await page.evaluate(({id,selected})=>window.__mastersActivity.respond(id,{kind:'choice',selected}),{id:part.id,selected:part.acceptedOptionSets[0]});else if(part.kind==='text')await page.evaluate(({id,value})=>window.__mastersActivity.respond(id,{kind:'text',value}),{id:part.id,value:part.accepted[0]});else if(part.kind==='energy-profile'){const {record}=await import('../../../src/activities/igcse/energy-enthalpy/provider.ts');const {modelProfile}=await import('../../../src/chemistry/energy-profile/index.ts');await page.evaluate(({id,response})=>window.__mastersActivity.respond(id,response),{id:part.id,response:modelProfile(record(current.question.ref.questionId))});}}
   }else if(activity==='igcse/energetics-practical'){
    const {record,correctionSegments}=await import('../../../src/activities/igcse/energetics-practical/provider.ts'),source=record(current.question.ref.questionId);
    for(const part of current.question.parts){if(part.kind==='choice')await page.evaluate(({id,selected})=>window.__mastersActivity.respond(id,{kind:'choice',selected}),{id:part.id,selected:part.acceptedOptionSets[0]});else if(part.kind==='text')await page.evaluate(({id,value})=>window.__mastersActivity.respond(id,{kind:'text',value}),{id:part.id,value:part.accepted[0]});else if(part.kind==='correction'){const segment=correctionSegments(source).find(s=>s.id===source.correction.errorId);await page.evaluate(({id,selection,replacement})=>window.__mastersActivity.respond(id,{kind:'correction',selections:[selection],replacement}),{id:part.id,selection:segment,replacement:source.fields[0].answers[0]});}}
   }else {assert(['igcse/calorimetry','igcse/bond-enthalpy'].includes(activity));await fill(true);
    await page.getByRole('button',{name:'Pause',exact:true}).click();await flush();const paused=await snap();await page.reload();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.attemptId);await page.getByRole('button',{name:'Resume saved attempt',exact:true}).click();await flush();assert.equal((await snap()).attempt.attemptId,paused.attempt.attemptId);assert.deepEqual((await snap()).attempt.currentResponses,paused.attempt.currentResponses);visited.push(activity);
   }
   await submit();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().attempt?.phase==='assessed');await flush();await page.waitForFunction(()=>window.__mastersActivity?.snapshot().saveStatus.kind==='saved');current=await snap();assert.equal(current.attempt.firstAssessment.score,1);
   const previous=current.attempt.attemptId;await page.getByRole('button',{name:'Next question',exact:true}).click();await page.waitForFunction(id=>window.__mastersActivity?.snapshot().attempt?.attemptId!==id,previous);if(visited.includes('igcse/calorimetry')&&visited.includes('igcse/bond-enthalpy'))break;
  }assert(visited.includes('igcse/calorimetry')&&visited.includes('igcse/bond-enthalpy'));return {selected,visited,sessionKind:(await snap()).session.kind,next:(await snap()).question.ref};
 });`;
text=text.replace(/ await scenario\('revision-topic-add-all-pause-reload-next',[^\n]+/,revision);
fs.writeFileSync(file,text);
