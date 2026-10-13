import test from 'node:test';
import assert from 'node:assert/strict';
import { factsFor, recallCoverage } from '../../src/recall/facts.ts';
import { factsForRecallScope } from '../../src/recall/session-contract.ts';
import { matchesRecall } from '../../src/recall/marking.ts';
import { matchesHistoricalRecall } from '../../src/recall/historical-marking.ts';
import { questionDisplayCode, recallLookupIdentity } from '../../src/content/question-display-identity.ts';
import { makeGraphs } from '../../src/activities/alevel/rate-equations/graphs.ts';

test('half-life formula is recall-linked and absent from question context', () => {
  const all = factsFor('alevel');
  const fact = all.find(f => f.id === 'first-order-half-life-rate-constant');
  assert.ok(fact);
  assert.ok(factsFor('alevel', ['u6-t1-2-graphs']).includes(fact));
  for (const scope of [{kind:'gem',gemId:'u6-t1-2-graphs'}, {kind:'global',topicIds:['u6-t1-2']}])
    assert.deepEqual(factsForRecallScope(all,'alevel',scope).map(f=>f.id),[fact.id]);
  assert.ok(recallCoverage('alevel').find(g=>g.gemId==='u6-t1-2-graphs').factIds.includes(fact.id));
  const code = questionDisplayCode({course:'alevel',activityId:'alevel/recall',questionId:fact.id});
  assert.equal(code,'RCA-000007');
  assert.equal(recallLookupIdentity('alevel',code).questionId,fact.id);
  for(const match of [matchesRecall,matchesHistoricalRecall]) {
    for(const answer of [fact.answer,...fact.accepted]) assert.equal(match(answer,fact.answer,fact.accepted,fact.matching),true,answer);
    for(const answer of ['k=t½/ln2','k=ln2*t½','k=2/t½']) assert.equal(match(answer,fact.answer,fact.accepted,fact.matching),false,answer);
  }
  assert.ok(!JSON.stringify(makeGraphs(2,42).question.context).includes('ln 2'));
});
