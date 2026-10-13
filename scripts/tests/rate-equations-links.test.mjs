import test from 'node:test';import assert from 'node:assert/strict';
import {resolveCompatibilityLink} from '../../src/compatibility/links.ts';
import {rateQuestionSources} from '../../src/activities/alevel/rate-equations/identity.ts';
import {questionDisplayCode} from '../../src/content/question-display-identity.ts';
import {rateQuestionCode,decodeRateQuestionCode} from '../../src/activities/alevel/rate-equations/identity.ts';
import {rateProvider,restoreRateExample} from '../../src/activities/alevel/rate-equations/provider.ts';

test('generated RE codes preserve exact seeds, content and graphs across every template', async()=>{
 const seen=new Set();
 for(const row of rateQuestionSources.filter(row=>row.gem!=='mechanisms')){
  for(const seed of [0,1,42,0x7fffffff,0xffffffff]){
   const ref={activityId:'alevel/rate-equations',questionId:row.questionId,seed,level:row.level};
   const code=questionDisplayCode({course:'alevel',...ref});
   assert.match(code,/^RE-[0-9A-Z]{7}$/);
   assert.equal(code,rateQuestionCode(row.questionId,seed));
   assert.ok(!seen.has(code));seen.add(code);
   assert.deepEqual(decodeRateQuestionCode(code.toLowerCase()),ref);
   assert.deepEqual(rateProvider.resolveLink(code),ref);
   const result=await resolveCompatibilityLink('alevel',code);
   assert.equal(result.kind,'curriculum');assert.deepEqual(result.ref,ref);
   assert.deepEqual(restoreRateExample(result.ref),restoreRateExample(ref));
   const url=`/?course=alevel&activity=alevel%2Frate-equations&review=${code}&seed=${seed}&level=${row.level}`;
   assert.deepEqual((await resolveCompatibilityLink('alevel',url)).ref,ref);
   assert.equal((await resolveCompatibilityLink('alevel',url.replace(`seed=${seed}`,`seed=${seed===0?1:0}`))).kind,'unrecognized');
   assert.equal((await resolveCompatibilityLink('alevel',url.replace(`level=${row.level}`,`level=${row.level===1?2:1}`))).kind,'unrecognized');
  }
 }
});
test('RE codec rejects malformed, reserved and overflow values; fixed codes stay unchanged',async()=>{
 for(const code of ['RE-0000000','RE-0000007','RE-000000F','RE-ZZZZZZZ','RE-00000001','RE-00000!1']){
  assert.equal(decodeRateQuestionCode(code),null);
  assert.equal((await resolveCompatibilityLink('alevel',code)).kind,'unrecognized');
 }
 for(const seed of [-1,0x100000000,1.5,NaN])assert.throws(()=>rateQuestionCode('RATE-POC-orders-L1',seed));
 for(const row of rateQuestionSources.filter(row=>row.gem==='mechanisms')){
  const code=questionDisplayCode({course:'alevel',activityId:'alevel/rate-equations',questionId:row.questionId,seed:0});
  assert.equal(code,`RE-00000${row.level+6}`);
  assert.equal(rateProvider.resolveLink(code).seed,0);
 }
});
test('rate source IDs and display aliases resolve current teacher links with exact seed/level ownership',async()=>{
 for(const row of rateQuestionSources){
  const identity={course:'alevel',activityId:'alevel/rate-equations',questionId:row.questionId};
  for(const code of [row.questionId,questionDisplayCode(identity)]){
   const seed=row.gem==='mechanisms'?0:42;
   const result=await resolveCompatibilityLink('alevel',`/?course=alevel&activity=alevel%2Frate-equations&review=${code}&seed=${seed}&level=${row.level}`);
   assert.equal(result.kind,'curriculum');assert.deepEqual(result.ref,{activityId:'alevel/rate-equations',questionId:row.questionId,seed,level:row.level});
   assert.equal((await resolveCompatibilityLink('igcse',code)).kind,'unrecognized');
  }
 }
 for(const input of ['/?course=alevel&activity=alevel%2Frate-equations&review=RATE-POC-mechanisms-L1&seed=1','/?course=alevel&activity=alevel%2Frate-equations&review=RATE-POC-graphs-L2&level=3','RATE-POC-graphs-L4','u6-t1-2-3'])assert.equal((await resolveCompatibilityLink('alevel',input)).kind,'unrecognized');
});
