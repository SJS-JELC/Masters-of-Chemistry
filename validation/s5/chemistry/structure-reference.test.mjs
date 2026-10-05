import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {comparisons,identities,sources} from '../../../src/activities/igcse/structure-and-bonding/data.ts';
import {structureProvider,comparisonRef,guidedSections} from '../../../src/activities/igcse/structure-and-bonding/provider.ts';
import {structureMarking} from '../../../src/activities/igcse/structure-and-bonding/marking.ts';
import {structureAdapter} from '../../../src/activities/igcse/structure-and-bonding/index.ts';
import {createAttemptController,assessmentToEvidence} from '../../../src/domain/attempt/attempt.ts';
import {createActiveClock} from '../../../src/domain/timing/active-clock.ts';
import {checkQuestionInput} from '../../../src/domain/attempt/input-checks.ts';

const original=new URL('../../../../Masters-of-IGCSE-Chemistry/src/',import.meta.url);
const context={};
for(const file of ['data.js','core.js']) vm.runInNewContext(fs.readFileSync(new URL(`activities/structure-and-bonding/${file}`,original),'utf8'),context);
const source=context.StructureBondingComparisonCore;
const plain=x=>JSON.parse(JSON.stringify(x));
const sample=ms=>({monotonicMs:ms,wallMs:100000+ms,visible:true,focused:true,suspended:false});
function scenario(level=2,sourceId=comparisons[0].id,restored) {
  let now=sample(0);
  const question=structureProvider.restore(comparisonRef(sourceId,level,17));
  const state=restored??{mode:'student',namespace:{course:'igcse',profileId:'S2-structure'},attemptId:'S2-structure-attempt',ref:question.ref,
    target:{course:'igcse',activityId:'igcse/structure-and-bonding',gemId:'lower-6-5',level},phase:'answering',currentResponses:{},assistance:[],timing:{attemptId:'S2-structure-attempt',activeMs:0,idleLimitMs:180000,finished:false}};
  const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:180000,now:()=>now,...(state.phase==='answering'?{saved:state.timing}:{completed:true,saved:{...state.firstResponse.timing,attemptId:state.attemptId,finished:true}})});
  const controller=createAttemptController({question,state,policy:structureMarking,clock,sample:()=>now});
  const response={kind:'explanation',sections:question.parts[0].sections.map((section,i)=>({id:section.id,text:`  exact section ${i+1}: covalent / lattice / property reasoning.  `}))};
  return {question,controller,clock,response,tick(ms){now=sample(ms);controller.sample(now);},command(command){return controller.dispatch(command);},submit(){return controller.dispatch({kind:'submit',at:now.wallMs});},finish(){return controller.dispatch({kind:'finish-rubric',at:now.wallMs});}};
}
test('independent exact source and accepted historical identity coverage',()=>{
  assert.deepEqual(plain(comparisons),plain(source.questions));
  assert.equal(comparisons.length,9);assert.equal(comparisons.reduce((n,q)=>n+q.points.length,0),44);
  assert.equal(identities.length,18);assert.equal(new Set(identities.map(i=>i.questionId)).size,18);
  const historical={};vm.runInNewContext(fs.readFileSync(new URL('assets/question-review.js',original),'utf8'),historical);
  const bank=historical.QuestionReview.bank('SBC',source.questions.flatMap(q=>[2,3].map(level=>({id:`${q.id}:${level}`}))));
  for(const entry of identities) assert.equal(entry.questionId,bank.id({id:entry.sourceKey}));
  for(const ref of sources) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(`../../../../../${ref.path}`,import.meta.url))).digest('hex'),ref.sha256);
  const tables=JSON.parse(fs.readFileSync(new URL('../../../src/activities/igcse/structure-and-bonding/dormant-level-one.json',import.meta.url),'utf8'));
  assert.deepEqual(tables,plain(context.StructureBondingComparisonData.levelOneTables));
});
test('all 18 full questions roundtrip every boundary seed, and historical saved IDs',()=>{
  for(const item of comparisons) for(const level of [2,3]) for(const seed of [0,1,17,0xffffffff]) {
    const ref=comparisonRef(item.id,level,seed);const question=structureProvider.restore(ref);
    assert.deepEqual(question.ref,ref);assert.deepEqual(structureProvider.restore(ref),question);
    assert.equal(question.context[0].text,item.prompt);assert.equal(question.parts[0].marks,item.points.length);
    assert.deepEqual(question.parts[0].rubric.map(({text,reject})=>reject?{text,reject}:{text}),plain(item.points));
    assert.equal(structureProvider.resolveLink(ref.questionId).questionId,ref.questionId);
    assert.equal(structureProvider.resolveLink(`${item.id}:${level}`).level,level);
    assert.equal(structureProvider.restore({...ref,questionId:item.id}).parts[0].marks,item.points.length);
    if(level===2) {
      assert.equal(question.parts[0].sections.length,7);
      assert.deepEqual(guidedSections(item).map(s=>({title:s.label,...(s.help?{help:s.help}:{})})),plain(source.levelTwoSections(item)).map(s=>({title:s.title,...(s.help?{help:s.help}:{})})));
      assert.deepEqual(question.parts[0].sections.map(s=>s.presentation),['single-line','single-line','multiline','single-line','single-line','multiline','multiline']);
    } else assert.equal(question.parts[0].sections.length,1);
    assert.equal(question.hints.length,0);assert.equal(structureAdapter.idleAllowance(question),180000);
  }
  assert.throws(()=>structureProvider.restore({...comparisonRef(comparisons[0].id,2),level:1}));
  assert.throws(()=>structureProvider.restore({...comparisonRef(comparisons[0].id,2),level:3}));
  for(const seed of [-1,1.5,0x100000000]) assert.throws(()=>comparisonRef(comparisons[0].id,2,seed));
  assert.equal(structureProvider.resolveLink('SBC-000000'),null);
});
test('deterministic complete selection excludes previous comparisons and grade 1',()=>{
  for(const level of [2,3]) {
    const seen=[];
    for(let seed=0;seed<9;seed++) {
      const request={activityId:'igcse/structure-and-bonding',gemId:'lower-6-5',level,seed,previousQuestionIds:seen};
      const ref=structureProvider.select(request);assert.deepEqual(structureProvider.select(request),ref);assert.ok(!seen.includes(ref.questionId));seen.push(ref.questionId);
    }
    assert.equal(new Set(seen).size,9);
  }
  assert.throws(()=>structureProvider.select({activityId:'igcse/structure-and-bonding',level:1,seed:0,previousQuestionIds:[]}));
});
test('source completeness gate prevents freeze for short/missing sections, without auto marking',()=>{
  for(const level of [2,3]) {
    const s=scenario(level);s.tick(1000);
    s.command({kind:'respond',partId:'explanation',response:{...s.response,sections:s.response.sections.map((section,i)=>i===0?{...section,text:' x '}:section)}});
    assert.equal(s.submit().accepted,false);assert.equal(s.controller.state().phase,'answering');assert.equal(s.clock.checkpoint().finished,false);
    assert.ok(checkQuestionInput(s.question,{explanation:{...s.response,sections:[]}}).length);
    assert.equal(structureMarking.mark(s.question,{explanation:s.response}).accepted,false);
  }
});
test('every rubric freezes exact untrimmed words, ordered evidence, restored review, immutable timing and mastery',()=>{
  for(const comparison of comparisons) for(const level of [2,3]) for(const earned of [0,1,comparison.points.length]) {
    const s=scenario(level,comparison.id);s.tick(1000);s.command({kind:'respond',partId:'explanation',response:s.response});s.tick(2000);assert.equal(s.submit().accepted,true);
    const frozen=s.controller.state();assert.equal(frozen.phase,'rubric-review');assert.equal(frozen.reviews[0].lockedText,s.response.sections.map(s=>s.text).join('\n\n'));
    assert.equal(assessmentToEvidence(frozen),null);assert.equal(s.clock.checkpoint().finished,true);
    const originalTiming=plain(frozen.firstResponse.timing);
    assert.equal(s.command({kind:'respond',partId:'explanation',response:s.response}).accepted,false);
    assert.equal(s.command({kind:'judge-rubric',partId:'explanation',judgement:{pointId:'point-2',status:'not-met'}}).accepted,false);
    assert.equal(s.finish().accepted,false);
    const r=scenario(level,comparison.id,plain(frozen));r.tick(4000);
    for(let i=0;i<comparison.points.length;i++) {
      const pointId=`point-${i+1}`;
      if(i<earned) {
        assert.equal(r.command({kind:'judge-rubric',partId:'explanation',judgement:{pointId,status:'met',evidence:{start:2,end:7,text:'exact'}}}).accepted,false);
        assert.equal(r.command({kind:'judge-rubric',partId:'explanation',judgement:{pointId,status:'awaiting-evidence'}}).accepted,true);
        assert.equal(r.command({kind:'judge-rubric',partId:'explanation',judgement:{pointId,status:'met',evidence:{start:2,end:7,text:'false'}}}).accepted,false);
        assert.equal(r.command({kind:'judge-rubric',partId:'explanation',judgement:{pointId,status:'met',evidence:{start:2,end:7,text:'exact'}}}).accepted,true);
      } else assert.equal(r.command({kind:'judge-rubric',partId:'explanation',judgement:{pointId,status:'not-met'}}).accepted,true);
    }
    assert.equal(r.finish().accepted,true);const assessed=r.controller.state();const evidence=assessmentToEvidence(assessed);
    assert.equal(evidence.score,earned===0?0:earned===comparison.points.length?1:0.5);assert.equal(evidence.firstAssessment.marks.earned,earned);assert.equal(evidence.firstAssessment.marks.available,comparison.points.length);
    assert.deepEqual(evidence.timing,originalTiming);r.tick(5000);assert.deepEqual(assessmentToEvidence(r.controller.state()),evidence);
    assert.equal(r.submit().accepted,false);assert.equal(r.finish().accepted,false);assert.equal(Object.isFrozen(assessed.firstResponse.responses),true);
  }
});
test('reveals and teacher/review never create independent curriculum evidence',()=>{
  const s=scenario();s.tick(1000);assert.equal(s.command({kind:'assist',assistance:{kind:'reveal',supportId:'worked-answer',at:101000}}).accepted,true);
  assert.equal(assessmentToEvidence(s.controller.state()),null);
  for(const mode of ['teacher','review']) assert.equal(assessmentToEvidence({mode,ref:s.question.ref,currentResponses:{}}),null);
});
