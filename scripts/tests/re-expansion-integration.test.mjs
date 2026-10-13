import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {allRateQuestionSources,rateQuestionSources,rateActivityId,rateGemIds,rateSource,rateQuestionCode,decodeRateQuestionCode} from '../../src/activities/alevel/rate-equations/identity.ts';
import {rateProvider,restoreRateExample} from '../../src/activities/alevel/rate-equations/provider.ts';
import {rateMarking} from '../../src/activities/alevel/rate-equations/marking.ts';
import {equivalentRateLaw,formatRateInput,parseRateLaw} from '../../src/activities/alevel/rate-equations/input-syntax.ts';
import {questionDisplayCode,questionLookupInput} from '../../src/content/question-display-identity.ts';
import {resolveCompatibilityLink} from '../../src/compatibility/links.ts';
import {supportsRateGraphWorkspace} from '../../src/contracts/workspace.ts';
import {isCanonicalQuestionId} from '../../src/content/canonical-identity.ts';
import {teacherCatalogue} from '../../src/ui/teacher-catalogue.ts';
import {makeOrders} from '../../src/activities/alevel/rate-equations/orders.ts';import {makeGraphs,makeArrhenius} from '../../src/activities/alevel/rate-equations/graphs.ts';import {makeMechanisms} from '../../src/activities/alevel/rate-equations/mechanisms.ts';
const refFor=(source,seed=0)=>({activityId:rateActivityId,questionId:source.questionId,level:source.level,seed});
const expanded=allRateQuestionSources.filter(s=>s.bank==='expanded');
test('900 displayed numerical variants plus six fixed mechanisms restore and fully mark',()=>{
 let count=0;
 for(const source of expanded){const signatures=new Set();for(const seed of source.gem==='mechanisms'?[0]:Array.from({length:100},(_,i)=>i)){
  const ref=refFor(source,seed),ex=restoreRateExample(ref),code=questionDisplayCode({course:'alevel',...ref});
  assert.deepEqual(rateProvider.resolveLink(code),ref);assert.deepEqual(ex.question.ref,ref);assert.deepEqual(rateProvider.restore(ref),ex.question);
  const result=rateMarking.mark(ex.question,ex.correctResponses);assert(result.accepted);assert.equal(result.marks.earned,result.marks.available);assert(result.marks.available>0);
  signatures.add(JSON.stringify({context:ex.question.context,parts:ex.question.parts.map(p=>({id:p.id,prompt:p.prompt,kind:p.kind})),graph:ex.graph}));count++;
 }
 assert.equal(signatures.size,source.gem==='mechanisms'?1:100);
 }
 assert.equal(count,906);assert.equal(expanded.length,15);
});
test('both permanent seeded namespaces round-trip full uint32 seeds and teacher URL conflict checks',async()=>{
 const seen=new Set();
 for(const source of allRateQuestionSources.filter(s=>s.gem!=='mechanisms'))for(const seed of [0,1,99,100,0x7fffffff,0xffffffff]){
  const ref=refFor(source,seed),code=rateQuestionCode(source.questionId,seed);assert.match(code,source.bank==='legacy'?/^RE-[0-9A-Z]{7}$/:/^RE-[0-9A-Z]{8}$/);assert(!seen.has(code));seen.add(code);
  assert.deepEqual(decodeRateQuestionCode(code.toLowerCase()),ref);assert.deepEqual(rateProvider.resolveLink(code),ref);assert.deepEqual((await resolveCompatibilityLink('alevel',code)).ref,ref);
  const url=`/?course=alevel&activity=alevel%2Frate-equations&review=${code}&seed=${seed}&level=${source.level}`;
  assert.deepEqual((await resolveCompatibilityLink('alevel',url)).ref,ref);
  assert.equal((await resolveCompatibilityLink('alevel',url.replace(`seed=${seed}`,`seed=${seed===0?1:0}`))).kind,'unrecognized');
  assert.equal((await resolveCompatibilityLink('alevel',url.replace(`level=${source.level}`,`level=${source.level===1?2:1}`))).kind,'unrecognized');
 }
 for(const code of ['RE-00000000','RE-00000001','RE-00000010','RE-0000000W','RE-ZZZZZZZZ','RE-0000000!','RE-000000000','RE-0000000','RE-0000007','RE-ZZZZZZZ']){assert.equal(decodeRateQuestionCode(code),null);assert.equal((await resolveCompatibilityLink('alevel',code)).kind,'unrecognized');}
 for(const seed of [-1,1.5,NaN,Infinity,0x100000000])assert.throws(()=>rateQuestionCode('RATE-EXP-orders-L1',seed));
 for(const source of allRateQuestionSources.filter(s=>s.gem==='mechanisms')){
  const ref=refFor(source),code=questionDisplayCode({course:'alevel',...ref});assert.match(code,/^RE-[0-9A-Z]{6}$/);assert.equal(questionLookupInput('alevel',rateActivityId,code),source.questionId);assert.deepEqual((await resolveCompatibilityLink('alevel',code)).ref,ref);assert.throws(()=>rateProvider.restore({...ref,seed:1}));
 }
});
test('new selection targets expanded banks and three fixed mechanisms per level without repeat where possible',()=>{
 for(const gem of Object.keys(rateGemIds))for(const level of [1,2,3]){
  const previous=[];for(const seed of [0,1,2]){const ref=rateProvider.select({activityId:rateActivityId,gemId:rateGemIds[gem],level,seed,previousQuestionIds:previous});const source=rateSource(ref.questionId);assert.equal(source.gem,gem);assert.equal(source.level,level);assert(isCanonicalQuestionId(rateActivityId,ref.questionId));if(gem==='mechanisms'){assert(!previous.includes(ref.questionId));assert.equal(ref.seed,0);}else{assert.notEqual(source.bank,'legacy');assert.equal(ref.seed,seed);}previous.push(ref.questionId);}
  assert.doesNotThrow(()=>rateProvider.select({activityId:rateActivityId,gemId:rateGemIds[gem],level,seed:42,previousQuestionIds:previous}));
 }
 for(const source of allRateQuestionSources){assert.equal(supportsRateGraphWorkspace(refFor(source)),['graphs','arrhenius'].includes(source.gem));assert.equal(supportsRateGraphWorkspace({...refFor(source),level:4}),false);}
 for(const id of ['RATE-EXP-orders-L4','RATE-EXP-mechanisms-fake-L1','RATE-EXP-graphs-L1 ','RATE-POC-orders-L1\n'])assert.equal(isCanonicalQuestionId(rateActivityId,id),false);
});
test('ion charge is parsed and formatted independently from reaction order',()=>{
 const species=['Fe3+','I-'];for(const value of ['k[Fe3+][I-]^2','rate = k[I⁻]²[Fe³⁺]','k[Fe^3+][I^-]^2'])assert(equivalentRateLaw(value,'k[Fe³⁺][I⁻]²',species),value);
 for(const value of ['k[Fe2+][I-]^2','k[Fe3+][I-]','k[Fe3+]^2[I-]','k[Fe][I]^2','k[Fe3+][I+]^2','k[Fe3+][I-]^3'])assert.equal(equivalentRateLaw(value,'k[Fe³⁺][I⁻]²',species),false,value);
 for(const value of ['k[S2O3^2-]','k[S₂O₃²⁻][H+]^0','k[H⁺]⁰[S2O3^2-]'])assert(equivalentRateLaw(value,'k[S₂O₃²⁻]',['S2O3^2-','H+']),value);
 assert.equal(parseRateLaw('k[S2O3-]',['S2O3^2-']),null);assert.equal(parseRateLaw('k[S2O3^2-]^2',['S2O3^2-'])['S2O3^2-'],2);
 assert.equal(formatRateInput('[Fe3+][I-]^2','rate-law').value,'[Fe³⁺][I⁻]²');assert.equal(formatRateInput('[S2O3^2-][H+]^0','rate-law').value,'[S₂O₃²⁻][H⁺]⁰');
 const formatted=formatRateInput('[Fe3+]^2','rate-law',5,7);assert.equal(formatted.value,'[Fe³⁺]²');assert(formatted.start<=formatted.end);assert(formatted.end<=formatted.value.length);
});
test('teacher catalogue includes all closed source configurations',async()=>{const rows=await teacherCatalogue(rateActivityId);assert.equal(rows.length,allRateQuestionSources.length);assert.equal(new Set(rows.map(r=>r.ref.questionId)).size,allRateQuestionSources.length);for(const row of rows){assert(rateSource(row.ref.questionId));assert.deepEqual(rateProvider.resolveLink(questionDisplayCode({course:'alevel',...row.ref})),row.ref);}});
test('original generators exactly preserve1236 measured before-run outputs',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('../../.artifacts/re-expansion/old-output-starting-hashes.json',import.meta.url),'utf8'));const factories={orders:makeOrders,graphs:makeGraphs,arrhenius:makeArrhenius,mechanisms:makeMechanisms};assert.equal(baseline.cases.length,1236);for(const row of baseline.cases){assert.equal(crypto.createHash('sha256').update(JSON.stringify(factories[row.gem](row.level,row.seed))).digest('hex'),row.sha256);}
 assert.equal(rateQuestionSources.length,12);
});

