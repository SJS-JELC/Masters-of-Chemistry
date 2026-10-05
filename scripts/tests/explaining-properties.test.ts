import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { propertiesBank } from '../../src/activities/alevel/explaining-properties/bank.ts';
import { propertiesProvider as provider,propertiesActivity as activityId,propertiesGem as gemId,correctionSegments,correctedSentence } from '../../src/activities/alevel/explaining-properties/provider.ts';
import { propertiesMarking as marking } from '../../src/activities/alevel/explaining-properties/marking.ts';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController,assessmentToEvidence } from '../../src/domain/attempt/attempt.ts';
import { leafBoundary } from '../../src/persistence/catalogue-boundary.ts';
import { productionRegistry } from '../../src/foundation/registry.ts';
import { teacherCatalogue } from '../../src/ui/teacher-catalogue.ts';
import { resolveCompatibilityLink } from '../../src/compatibility/links.ts';
import type { Responses,StudentAttempt } from '../../src/contracts/index.ts';
function answers(record:typeof propertiesBank[number],wrong=false): Responses {
  if(record.format==='gaps')return Object.fromEntries(record.answers.map((answer,i)=>[`gap-${i}`,{kind:'text',value:wrong?'incorrect complete response':answer[0]!}]));
  const selected=correctionSegments(record)[record.errorIndex!]!;
  return {correction:{kind:'correction',selections:[selected],replacement:wrong?'incorrect complete replacement':record.answers[0]![0]!}};
}
const sample=(ms:number)=>({monotonicMs:ms,wallMs:1_000_000+ms,visible:true,focused:true,suspended:false});
test('exact approved bank, levels, permanent identities, full corrected feedback and no transport requirement',async()=>{
  assert.equal(propertiesBank.length,32);assert.equal(new Set(propertiesBank.map(r=>r.code)).size,32);
  for(const level of [1,2])for(const format of ['gaps','correction'])assert.equal(propertiesBank.filter(r=>r.level===level&&r.format===format).length,8);
  for(const record of propertiesBank) {
    assert.match(record.code,/^EBP-[A-Z0-9]{6}$/);const ref=provider.resolveLink(record.code)!;assert(ref);
    const question=provider.restore(ref);assert.equal(question.ref.level,record.level);
    assert(!/carrying charge|carry charge|charge carriers|charge transport|transport charge/i.test(JSON.stringify(question)));
    assert.deepEqual(question.workedAnswer,[{kind:'text',text:correctedSentence(record)}]);
    if(record.format==='gaps')assert.equal(question.sentenceTokens!.filter(t=>typeof t!=='string').length,question.parts.length);
    else assert.equal(correctionSegments(record).length,3);
    const full=marking.mark(question,answers(record));assert(full.accepted);assert.equal(full.marks.earned,full.marks.available);
    assert.equal(full.marks.available,record.format==='gaps'?record.answers.length:2);
    assert(full.marks.points.some(p=>p.message.includes(correctedSentence(record))));
    assert.equal(marking.mark(question,{}).accepted,false);
    const wrong=marking.mark(question,answers(record,true));assert(wrong.accepted);assert.equal(wrong.marks.earned,record.format==='correction'?1:0);
    for(let i=0;i<record.answers.length;i++)for(const alternative of record.answers[i]!) {
      const response=structuredClone(answers(record)) as Record<string,any>;
      if(record.format==='gaps')response[`gap-${i}`].value=alternative;else response.correction.replacement=alternative;
      const result=marking.mark(question,response);assert(result.accepted);assert.equal(result.marks.earned,result.marks.available,`${record.code}: ${alternative}`);
      if(record.format==='gaps')response[`gap-${i}`].value='not '+alternative;else response.correction.replacement='not '+alternative;
      const negated=marking.mark(question,response);assert(negated.accepted);assert(negated.marks.earned<negated.marks.available);
    }
    if(record.format==='correction') {
      const ranges=correctionSegments(record),wrongRange=ranges[(record.errorIndex!+1)%3]!;
      const result=marking.mark(question,{correction:{kind:'correction',selections:[wrongRange],replacement:record.answers[0]![0]!}});
      assert(result.accepted);assert.equal(result.marks.earned,0);
      assert.equal(marking.mark(question,{correction:{kind:'correction',selections:[{...wrongRange,text:'tampered'}],replacement:'ions'}}).accepted,false);
    }
    assert.equal((await resolveCompatibilityLink('alevel',record.code)).kind,'curriculum');
  }
  assert.equal((await teacherCatalogue(activityId)).length,32);
});
test('provider bounds, no immediate repeats, full level coverage and exact legacy alias isolation',()=>{
  assert.deepEqual(leafBoundary[gemId],{activityId,levels:[1,2]});
  assert.deepEqual(leafBoundary['l6-t2-1-4'],{activityId:'alevel/dot-and-cross',levels:[1,2,3],historicalOnly:true});
  const landing=JSON.parse(fs.readFileSync(new URL('../../src/landing/catalogue-data.json',import.meta.url),'utf8'));
  assert.equal(landing.alevel.display.identities['l6-t2-1-4'],gemId);
  const registration=productionRegistry.get(activityId)!;assert.equal(registration.strand,'curriculum');
  if(registration.strand==='curriculum'){assert.equal(registration.idleAllowance(provider.restore(provider.resolveLink(propertiesBank[0]!.code)!)),180000);assert.equal(registration.revision,true);assert.deepEqual(registration.gems[0]!.mastery.historicalAliases,[]);assert.deepEqual(registration.gems[0]!.mastery.legacySourceKeys,[]);}
  for(const level of [1,2] as const){const previous:string[]=[];for(let i=0;i<16;i++){const ref=provider.select({activityId,gemId,level,seed:42,previousQuestionIds:previous});assert(!previous.includes(ref.questionId));previous.push(ref.questionId);}assert.equal(new Set(previous).size,16);assert.notEqual(provider.select({activityId,gemId,level,seed:0,previousQuestionIds:previous}).questionId,previous.at(-1));}
  for(const seed of [-1,1.1,Infinity,4294967296])assert.throws(()=>provider.select({activityId,gemId,level:1,seed,previousQuestionIds:[]}));
  assert.throws(()=>provider.select({activityId,gemId,level:3,seed:0,previousQuestionIds:[]}));
  assert.throws(()=>provider.select({activityId,gemId:'l6-t2-1-4',level:1,seed:0,previousQuestionIds:[]}));
  assert.throws(()=>provider.select({activityId,gemId,level:1,seed:0,previousQuestionIds:['1G1']}));
  assert.throws(()=>provider.restore({...provider.resolveLink(propertiesBank[0]!.code)!,level:2}));
  assert.equal(provider.resolveLink('1G1'),null);
  for(const code of ['EBP-J2Y7B4','EBP-V6P3H9']){const question=provider.restore(provider.resolveLink(code)!);const response=answers(propertiesBank.find(r=>r.code===code)!) as Record<string,any>;const index=code==='EBP-J2Y7B4'?1:2;for(const bad of ['free ions','electrons','not free to move','carry charge']){response[`gap-${index}`].value=bad;const marked=marking.mark(question,response);assert(marked.accepted);assert(marked.marks.earned<marked.marks.available);}}
  const diagram=provider.restore(provider.resolveLink('EBP-S8L4J2')!);for(const bad of ['O','O-','O2+']){const result=marking.mark(diagram,{'gap-0':{kind:'text',value:bad},'gap-1':{kind:'text',value:'Ca2+'}});assert(result.accepted);assert.equal(result.marks.earned,1);}
});
test('every complete wrong first response freezes marks, timing and evidence across corrected retry and reveal',()=>{
  for(const record of propertiesBank){let now=0;const ref=provider.resolveLink(record.code)!,question=provider.restore(ref),attemptId=record.code;
    const clock=createActiveClock({attemptId,idleLimitMs:180000,now:()=>sample(now)});
    const state:StudentAttempt={mode:'student',namespace:{course:'alevel',profileId:'fixture'},attemptId,target:{course:'alevel',activityId,gemId,level:record.level},ref:{...ref,activityId},phase:'answering',currentResponses:answers(record,true),assistance:[],timing:clock.checkpoint()!};
    const controller=createAttemptController({question,state,policy:marking,clock,sample:()=>sample(now)});
    now=1200;assert(controller.dispatch({kind:'submit',at:1_000_000+now}).accepted);const first=structuredClone(controller.state());const evidence=assessmentToEvidence(first);assert(evidence);assert.equal(evidence.timing!.activeMs,1200);
    for(const [partId,response] of Object.entries(answers(record)))controller.dispatch({kind:'respond',partId,response:response!});
    now=5000;controller.dispatch({kind:'submit',at:1_000_000+now});controller.dispatch({kind:'assist',assistance:{kind:'reveal',supportId:'worked-answer',at:1_000_000+now}});
    assert.deepEqual(assessmentToEvidence(controller.state()),evidence);assert.deepEqual((controller.state() as any).firstAssessment,(first as any).firstAssessment);assert.deepEqual((controller.state() as any).firstResponse,(first as any).firstResponse);assert.equal(clock.checkpoint()!.activeMs,1200);
  }
});
