import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecallStatistics, buildStatistics } from '../../src/statistics/model.ts';
import { recallFacts } from '../../src/recall/facts.ts';
import { historicalRecallFacts } from '../../src/recall/compatibility.ts';
import { topicsFor } from '../../src/recall/session-contract.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../../src/contracts/recall.ts';
const now = Date.UTC(2026, 9, 11, 12),
  ns = { course: 'igcse', profileId: 'local' };
const fact = recallFacts.find((f) => f.course === 'igcse');
const evidence = (id, extra = {}) => ({
  kind: 'recall',
  id,
  namespace: ns,
  factId: fact.id,
  definitionId: CURRENT_RECALL_DEFINITION_ID,
  ref: { activityId: 'igcse/recall', questionId: fact.id },
  completedAt: now - 1000,
  outcome: 'correct',
  firstResponse: {
    responses: {},
    submittedAt: now - 1000,
    assistance: [],
    timing: { activeMs: 1200, idleLimitMs: 60000 },
  },
  firstAssessment: {
    kind: 'marked',
    assessedAt: now - 1000,
    selfAssessed: false,
    score: 1,
    marks: {},
  },
  ...extra,
});
const model = (records, options = {}) =>
  buildRecallStatistics(ns, records, { days: 0, now, facts: recallFacts, ...options });
test('only original independent automatic first checks contribute; canonical attempt ID deduplicates', () => {
  const wrong = evidence('wrong', {
    outcome: 'wrong',
    firstAssessment: { kind: 'marked', selfAssessed: false, score: 0, marks: {} },
    learningReview: { score: 1 },
  });
  const assisted = evidence('assist', {
    firstResponse: {
      assistance: [{ kind: 'hint' }],
      timing: { activeMs: 99999, idleLimitMs: 60000 },
    },
  });
  const self = evidence('self', {
    firstAssessment: { kind: 'self-rubric', selfAssessed: true, score: 1 },
  });
  const records = [
    evidence('one'),
    evidence('one', {
      firstResponse: { assistance: [], timing: { activeMs: 99999, idleLimitMs: 60000 } },
    }),
    wrong,
    assisted,
    self,
    evidence('reveal', { outcome: 'revealed' }),
    evidence('flash', { kind: 'flashcard' }),
    evidence('corrected', {
      outcome: 'correct',
      firstAssessment: { kind: 'marked', selfAssessed: false, score: 0 },
    }),
  ];
  const result = model(records);
  assert.deepEqual(
    result.records.map((r) => r.id),
    ['one', 'wrong'],
  );
  assert.deepEqual(result.counts, {
    total: 2,
    correct: 1,
    wrong: 1,
    timed: 2,
    untimed: 0,
    activeMs: 2400,
    timeByOutcome: { correct: 1200, wrong: 1200 },
  });
});
test('zero time is recorded; missing or unusable historical timing remains untimed', () => {
  const result = model([
    evidence('zero', {
      firstResponse: { assistance: [], timing: { activeMs: 0, idleLimitMs: 60000 } },
    }),
    evidence('old', { firstResponse: { assistance: [] } }),
    evidence('bad', {
      firstResponse: { assistance: [], timing: { activeMs: -1, idleLimitMs: 60000 } },
    }),
  ]);
  assert.equal(result.counts.total, 3);
  assert.equal(result.counts.timed, 1);
  assert.equal(result.counts.untimed, 2);
  assert.equal(result.counts.activeMs, 0);
  assert.equal(result.bins[0].counts.total, 3);
});
test('namespace and malformed evidence boundaries exclude mixed histories', () => {
  const result = model([
    evidence('okay'),
    null,
    evidence('other-profile', { namespace: { course: 'igcse', profileId: 'other' } }),
    evidence('other-course', { namespace: { course: 'alevel', profileId: 'local' } }),
    evidence('no-ns', { namespace: null }),
    evidence('no-ref', { ref: null }),
    evidence('future', { completedAt: now + 1 }),
    evidence('no-first', { firstResponse: null }),
    evidence('no-mark', { firstAssessment: null }),
  ]);
  assert.deepEqual(
    result.records.map((r) => r.id),
    ['okay'],
  );
  assert.equal(
    buildRecallStatistics({ course: 'unknown', profileId: 'local' }, [evidence('okay')], {
      days: 0,
      now,
    }).counts.total,
    0,
  );
  assert.equal(
    buildRecallStatistics({ course: 'igcse', profileId: '' }, [evidence('okay')], { days: 0, now })
      .counts.total,
    0,
  );
});
test('date and course-year filters retain unmapped/untimed history in All years and count shared links once', () => {
  const year = topicsFor('igcse').find((t) => t.gemIds.some((g) => fact.gemIds.includes(g))).year;
  const shared = {
    ...fact,
    gemIds: [...fact.gemIds, topicsFor('igcse').find((t) => t.year !== year).gemIds[0]],
  };
  const retired = historicalRecallFacts.find((f) => f.course === 'igcse');
  const records = [
    evidence('shared'),
    evidence('old', { completedAt: now - 10 * 86400000 }),
    evidence('unmapped', {
      factId: 'retired-unknown',
      ref: { activityId: 'igcse/recall', questionId: 'retired-unknown' },
      firstResponse: { assistance: [] },
    }),
    evidence('historical', {
      factId: retired.id,
      definitionId: undefined,
      ref: { activityId: 'igcse/recall', questionId: retired.id },
      firstResponse: { assistance: [] },
    }),
  ];
  const result = model(records, { days: 1, year, facts: [shared] });
  assert.equal(result.records.length, 4);
  assert.equal(result.visible.filter((r) => r.id === 'shared').length, 1);
  assert.equal(result.unmapped.length, 1);
  assert.ok(!result.visible.some((r) => r.id === 'old' || r.id === 'unmapped'));
  const all = model(records, { days: 1, facts: [shared] });
  assert.equal(all.counts.total, 3);
  assert.equal(all.counts.untimed, 2);
  const otherYear = topicsFor('igcse').find((t) => t.year !== year).year;
  assert.equal(model([records[0]], { year: otherYear, facts: [shared] }).counts.total, 1);
});
test('Recall additions have no effect on graded buildStatistics', () => {
  const registry = { curriculumFor: () => [] };
  const options = { days: 0, now };
  const before = buildStatistics(ns, registry, [], options);
  model([evidence('one')]);
  assert.deepEqual(buildStatistics(ns, registry, [], options), before);
  assert.equal(before.counts.total, 0);
  assert.equal(before.counts.activeMs, 0);
  assert.equal(before.mastered, 0);
});
