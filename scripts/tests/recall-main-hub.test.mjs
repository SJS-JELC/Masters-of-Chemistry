import assert from 'node:assert/strict';
import test from 'node:test';
import { factsFor } from '../../src/recall/facts.ts';
import { createRecallSession } from '../../src/recall/scheduler.ts';
import {
  initialRecallPreferences,
  recallTestSessionId,
  reconcileRecallTestSession,
  addRecallTopics,
  activeRecallTopics,
  recallTopicMastery,
} from '../../src/recall/recall-hub.ts';
import {
  factsForRecallScope,
  topicsFor,
  rememberRecallLaunch,
  validateRecallPreferences,
} from '../../src/recall/session-contract.ts';
const ns = { course: 'igcse', profileId: 'hub:test-profile' };
const bank = factsFor('igcse');

test('default chooser has course topics and preferences survive gem/mode launch without global contamination', () => {
  const prefs = initialRecallPreferences(ns);
  validateRecallPreferences(prefs);
  assert.deepEqual(
    prefs.globalTopicIds,
    topicsFor('igcse').map((t) => t.id),
  );
  const gem = rememberRecallLaunch(prefs, 'flashcards', { kind: 'gem', gemId: 'fourth-3-1' });
  assert.deepEqual(gem.globalTopicIds, prefs.globalTopicIds);
  assert.equal(gem.mode, 'flashcards');
  assert.equal(gem.lastScope.kind, 'gem');
  const subset = rememberRecallLaunch(gem, 'test', {
    kind: 'global',
    topicIds: ['fourth-3', 'fourth-3', 'lower-6'],
  });
  assert.deepEqual(subset.globalTopicIds, ['fourth-3', 'lower-6']);
  validateRecallPreferences(subset);
  assert.deepEqual(
    initialRecallPreferences({ course: 'alevel', profileId: ns.profileId }).globalTopicIds,
    topicsFor('alevel').map((t) => t.id),
  );
});
test('topic additions are deduplicated and four A Level batches contain correct physical/inorganic topics', () => {
  assert.deepEqual(addRecallTopics(['x'], ['x', 'y']), ['x', 'y']);
  const physical = topicsFor('alevel', { strand: 'physical-inorganic' }).map((t) => t.id);
  assert(physical.includes('l6-t2-1'));
  assert(physical.includes('l6-t2-2'));
  assert(physical.includes('u6-t2-7'));
  assert.equal(new Set(topicsFor('alevel').map((t) => t.batchId)).size, 4);
});
test('session identity separates kind/scope/course and remains bounded independently of profile', () => {
  const a = { kind: 'global', topicIds: ['fourth-3', 'lower-6'] };
  const b = { kind: 'global', topicIds: ['lower-6', 'fourth-3'] };
  assert.equal(
    recallTestSessionId(ns, a, 'recall-practice'),
    recallTestSessionId(ns, b, 'recall-practice'),
  );
  assert.notEqual(
    recallTestSessionId(ns, a, 'recall-practice'),
    recallTestSessionId(ns, a, 'recall-revision'),
  );
  assert.equal(
    recallTestSessionId(ns, a, 'recall-practice'),
    recallTestSessionId({ ...ns, profileId: 'p'.repeat(500) }, a, 'recall-practice'),
  );
  const largestScope = { kind: 'global', topicIds: topicsFor('alevel').map((t) => t.id) };
  assert(
    recallTestSessionId(
      { course: 'alevel', profileId: 'p'.repeat(500) },
      largestScope,
      'recall-practice',
    ).length <= 500,
  );
  assert.notEqual(
    recallTestSessionId(ns, a, 'recall-practice'),
    recallTestSessionId(ns, { kind: 'gem', gemId: 'fourth-3-1' }, 'recall-practice'),
  );
});
test('queue restoration removes retired and out-of-scope facts, retains submitted history and adds current identities unvisited', () => {
  const scope = { kind: 'gem', gemId: 'fourth-3-1' };
  const selected = factsForRecallScope(bank, 'igcse', scope);
  assert(selected.length);
  const old = createRecallSession(
    ns,
    'legacy',
    'recall-practice',
    ['igcse-recall-061', selected[0].id, 'igcse-recall-124'],
    ['fourth-3-1'],
  );
  const session = {
    ...old,
    currentFactId: 'igcse-recall-061',
    currentAttemptId: 'retired-attempt',
    visitedFactIds: ['igcse-recall-061', selected[0].id],
    submittedAttemptIds: ['old-assessed'],
  };
  const next = reconcileRecallTestSession(session, 'igcse', bank, selected, scope);
  assert.deepEqual([...next.factIds].sort(), selected.map((f) => f.id).sort());
  assert.equal(next.currentAttemptId, null);
  assert.equal(next.currentFactId, null);
  assert.deepEqual(next.visitedFactIds, [selected[0].id]);
  assert.deepEqual(next.submittedAttemptIds, ['old-assessed']);
  assert.equal(next.mode, 'test');
  assert.deepEqual(next.scope, scope);
  assert.equal(session.currentAttemptId, 'retired-attempt');
});
test('compatible active queue keeps the same attempt pointer and visits; an empty selection creates no playable IDs', () => {
  const scope = { kind: 'global', topicIds: ['fourth-3'] };
  const selected = factsForRecallScope(bank, 'igcse', scope);
  const old = {
    ...createRecallSession(
      ns,
      'current',
      'recall-practice',
      selected.map((f) => f.id),
    ),
    currentFactId: selected[0].id,
    currentAttemptId: 'same-attempt',
    visitedFactIds: [selected[1].id],
  };
  const next = reconcileRecallTestSession(old, 'igcse', bank, selected, scope);
  assert.equal(next.currentAttemptId, 'same-attempt');
  assert.equal(next.currentFactId, selected[0].id);
  assert.deepEqual(next.visitedFactIds, old.visitedFactIds);
  assert.deepEqual(
    reconcileRecallTestSession(old, 'igcse', bank, [], { kind: 'global', topicIds: [] }).factIds,
    [],
  );
});

test('display mastery uses distinct scoped facts, missing zero, and only matching namespace progress', () => {
  const facts = [bank[0], bank[0], { ...bank[0], id: 'second-fact' }];
  const topic = topicsFor('igcse').find((t) => t.gemIds.some((id) => bank[0].gemIds.includes(id)));
  const p = (stage, namespace = ns, at = 1) => ({
    namespace,
    factId: bank[0].id,
    stage,
    lastCompletedAt: at,
  });
  assert.equal(recallTopicMastery(ns, facts, topic.id, []).colour, 'grey');
  const shown = recallTopicMastery(ns, facts, topic.id, [
    p(5),
    p(1, ns, 0),
    p(5, { ...ns, profileId: 'other' }, 2),
  ]);
  assert.equal(shown.factCount, 2);
  assert.equal(shown.meanStage, 2.5);
  assert.equal(shown.colour, 'mint');
  assert.match(shown.label, /2 facts.*2.5 \/ 5/);
  for (const [stage, colour] of [
    [1, 'yellow'],
    [2, 'mint'],
    [3, 'mint'],
    [4, 'purple'],
    [5, 'purple'],
  ]) {
    assert.equal(recallTopicMastery(ns, [bank[0]], topic.id, [p(stage)]).colour, colour);
  }
  for (const course of ['igcse', 'alevel']) {
    const all = factsFor(course);
    const active = activeRecallTopics(course, all);
    assert.ok(active.length);
    assert.ok(active.length < topicsFor(course).length);
    assert.ok(
      active.every(
        (t) => factsForRecallScope(all, course, { kind: 'global', topicIds: [t.id] }).length,
      ),
    );
  }
});
