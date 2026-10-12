import test from 'node:test';import assert from 'node:assert/strict';
import {resolveCompatibilityLink} from '../../src/compatibility/links.ts';
import {rateQuestionSources} from '../../src/activities/alevel/rate-equations/identity.ts';
import {questionDisplayCode} from '../../src/content/question-display-identity.ts';
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
