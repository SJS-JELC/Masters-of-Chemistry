import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {bank,titrationProvider,reviewCode} from '../../../src/activities/alevel/ph-titration-curves/provider.ts';
import {titrationMarking} from '../../../src/activities/alevel/ph-titration-curves/marking.ts';
import {titrationAdapter} from '../../../src/activities/alevel/ph-titration-curves/index.ts';
import {answer,curve,grade} from '../../../src/chemistry/titration-curve/core.js';
import {modelSVG} from '../../../src/chemistry/titration-curve/model.ts';
import {checkSubmission} from '../../../src/chemistry/titration-curve/engine.ts';
import {activityDefinitions} from '../../../src/catalogue/definitions.ts';
const ref=q=>({activityId:'alevel/ph-titration-curves',questionId:q.id,seed:0,level:q.level});
test('exact full source content, fixed IDs, supported levels and historical hash codes',()=>{
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('../Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/data.js','utf8'),ctx);assert.deepEqual(bank,JSON.parse(JSON.stringify(ctx.TitrationData.questions)));
 assert.equal(bank.length,36);assert.equal(new Set(bank.map(q=>reviewCode(q.id))).size,36);
 for(const q of bank){const question=titrationProvider.restore(ref(q));assert.equal(question.context[0].text,q.prompt);assert.equal(question.ref.questionId,q.id);assert.deepEqual(titrationProvider.resolveLink(reviewCode(q.id)),ref(q));assert.deepEqual(titrationProvider.resolveLink(q.id),ref(q));assert.equal(question.parts[0].marks,6);assert.equal(titrationAdapter.idleAllowance(question),600000);assert(modelSVG(q).includes('<svg'));}
 assert.equal(titrationProvider.resolveLink('TC-ZZZZZZ'),null);assert.throws(()=>titrationProvider.restore({...ref(bank[0]),level:1}));assert.throws(()=>titrationProvider.restore({...ref(bank[0]),seed:-1}));
});
test('all36 model/wrong/incomplete/malformed alternatives and restoration',()=>{
 const rows=[];const answerKey=JSON.parse(fs.readFileSync('../../development/alevel/validation/ph-titration-curves/answer-key.json','utf8'));const original=vm.createContext({});vm.runInContext(fs.readFileSync('../Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/core.js','utf8'),original);
 for(const q of bank){const question=titrationProvider.restore(ref(q)),state={kind:'titration-curve',...answer(q)};assert.deepEqual(answer(q),JSON.parse(JSON.stringify(original.TitrationCore.answer(q))));
 const retained=answerKey.questions.find(item=>item.id===q.id);assert(retained);for(const [key,value] of Object.entries(answer(q)))assert.deepEqual(value,retained[key]);assert.equal(retained.prompt,q.prompt);assert.deepEqual(grade(q,state).items.map(item=>({criterion:item.label,explanation:item.feedback})),retained.working);const correct=titrationMarking.mark(question,{curve:state});assert(correct.accepted);assert.equal(correct.marks.earned,6);assert.equal(titrationMarking.masteryScore(correct.marks),1);
 for(const field of ['before','after','indicator']){assert.equal(checkSubmission(q,{...state,[field]:null}).status,'incomplete');assert.equal(titrationMarking.mark(question,{curve:{...state,[field]:null}}).accepted,false);}
 for(const patch of [{initialPH:NaN},{equivalenceVolume:0},{initialPH:14.1},{after:'bad'},{indicator:'bad'},{initialPH:2.34}])assert.equal(checkSubmission(q,{...state,...patch}).status,'malformed');
 for(const patch of [{initialPH:state.initialPH+.1},{equivalenceVolume:state.equivalenceVolume+.5},{indicator:'none'}]){const wrong=titrationMarking.mark(question,{curve:{...state,...patch}});assert(wrong.accepted);assert.equal(wrong.marks.earned,5);assert.equal(titrationMarking.masteryScore(wrong.marks),.5);}
 for(const indicator of answer(q).acceptedIndicators){const result=titrationMarking.mark(question,{curve:{...state,indicator}});assert(result.accepted);assert.equal(result.marks.earned,6);}
 assert.equal(grade(q,{...state,before:'before-weak-base',after:q.reverse?'after-strong-base':'after-strong-acid',initialPH:14,finalPH:0,equivalenceVolume:.5,indicator:'none'}).earned,0);
 assert.deepEqual(JSON.parse(JSON.stringify(state)),state);assert.deepEqual(curve(q,state),JSON.parse(JSON.stringify(original.TitrationCore.curve(q,state))));
 rows.push({id:q.id,level:q.level,family:q.family,answer:answer(q),referencePASS:true,wrongAssessed:true,incompleteBlocked:true,malformedBlocked:true,sourceCurveEqual:true});
 }fs.writeFileSync('validation/s3/titration/reference-review.json',JSON.stringify(rows,null,2));
});
test('source sequential selection visits all18 at each level and revision has exactly2 titration plus15 acid targets',()=>{
 for(const level of [2,3]){const visited=[];for(let i=0;i<18;i++){const next=titrationProvider.select({activityId:'alevel/ph-titration-curves',gemId:'u6-t1-1-9',level,seed:i,previousQuestionIds:visited});visited.push(next.questionId);}assert.deepEqual(visited,bank.filter(q=>q.level===level).map(q=>q.id));const next=titrationProvider.select({activityId:'alevel/ph-titration-curves',level,seed:0,previousQuestionIds:visited});assert.equal(next.questionId,visited[0]);}
 const titration=activityDefinitions.find(a=>a.id==='alevel/ph-titration-curves');assert.deepEqual(titration.gems.map(g=>[g.id,g.supportedLevels]),[['u6-t1-1-9',[2,3]]]);
 const acid=activityDefinitions.find(a=>a.id==='alevel/acid-base-calculations');assert.equal(acid.gems.reduce((n,g)=>n+g.supportedLevels.length,0),15);
});


