import test from 'node:test';
import assert from 'node:assert/strict';
import { historicalRecallFacts } from '../../src/recall/compatibility.ts';
import {
  historicalRecallFields,
  createHistoricalRecallMarkingPolicy,
} from '../../src/recall/historical-marking.ts';
import { recallFacts } from '../../src/recall/facts.ts';
import { assessmentToRecallEvidence, initialRecallProgress } from '../../src/recall/scheduler.ts';
import { factsForRecallScope } from '../../src/recall/session-contract.ts';
import {
  validateRecallAttempt,
  validateRecallEvidence,
  validateRecallProgress,
  validateRecallSession,
  validateSavedRecallPreferences,
  validateSavedRecallFlashcards,
} from '../../src/persistence/validation.ts';
const at = Date.parse('2026-10-10T12:00:00Z'),
  policy = createHistoricalRecallMarkingPolicy(historicalRecallFacts);
function legacy(f) {
  const ref = { activityId: f.course + '/recall', questionId: f.id, seed: 0, level: 1 },
    responses = Object.fromEntries(
      historicalRecallFields(f).map((x) => [x.id, { kind: 'text', value: x.answer }]),
    ),
    marks = policy.mark({ ref }, responses).marks;
  return {
    mode: 'student',
    namespace: { course: f.course, profileId: 'legacy' },
    attemptId: 'old-' + f.id,
    ref,
    target: {
      kind: 'recall',
      course: f.course,
      activityId: ref.activityId,
      factId: f.id,
      level: 1,
    },
    phase: 'assessed',
    currentResponses: responses,
    assistance: [],
    firstResponse: {
      responses,
      submittedAt: at,
      timing: { activeMs: 2400, idleLimitMs: 60000 },
      assistance: [],
    },
    firstAssessment: { kind: 'marked', assessedAt: at, marks, score: 1, selfAssessed: false },
  };
}
test('all150 pre-amendment first assessments remain validated under frozen definitions and marker', () => {
  for (const f of historicalRecallFacts) {
    const a = legacy(f),
      before = JSON.stringify(a);
    validateRecallAttempt(a);
    const e = assessmentToRecallEvidence(a);
    validateRecallEvidence(e);
    assert.equal(e.outcome, 'correct');
    assert.ok(!('definitionId' in e));
    assert.equal(JSON.stringify(a), before);
    validateRecallProgress(initialRecallProgress(a.namespace, f.id));
  }
});
test('legacy result corruption and unknown named definitions fail without rewriting input', () => {
  const a = legacy(historicalRecallFacts[0]),
    changed = structuredClone(a);
  changed.firstAssessment.score = 0;
  assert.throws(() => validateRecallAttempt(changed));
  assert.throws(() => validateRecallAttempt({ ...a, definitionId: 'unknown' }));
  assert.throws(() =>
    validateRecallEvidence({ ...assessmentToRecallEvidence(a), outcome: 'wrong' }),
  );
});
test('legacy complete-bank session remains readable and new explicit empty/foreign scopes cannot broaden selection', () => {
  const namespace = { course: 'igcse', profileId: 'legacy' },
    ids = historicalRecallFacts.filter((f) => f.course === 'igcse').map((f) => f.id),
    s = {
      kind: 'recall-practice',
      id: 'old-global',
      namespace,
      gemIds: null,
      factIds: ids,
      currentAttemptId: null,
      currentFactId: null,
      submittedAttemptIds: [],
      visitedFactIds: [],
      status: 'paused',
    };
  validateRecallSession(s);
  assert.throws(() => validateRecallSession({ ...s, scope: { kind: 'global', topicIds: [] } }));
  assert.throws(() => validateRecallSession({ ...s, scope: { kind: 'gem', gemId: 'l6-t2-1-1' } }));
});
test('dedicated selection/flashcard state is namespaced and rejects score/evidence injection', () => {
  const namespace = { course: 'igcse', profileId: 'deck' },
    scope = { kind: 'gem', gemId: 'fourth-16-1' },
    ids = factsForRecallScope(recallFacts, 'igcse', scope).map((f) => f.id),
    p = { namespace, globalTopicIds: ['fourth-16'], mode: 'flashcards', lastScope: scope };
  validateSavedRecallPreferences(p);
  assert.throws(() => validateSavedRecallPreferences({ ...p, score: 1 }));
  const d = {
    namespace,
    scope,
    factIds: ids,
    round: 1,
    roundFactIds: ids,
    currentFactId: ids[0],
    classifications: {},
    revealed: false,
    undoStack: [],
  };
  validateSavedRecallFlashcards(d);
  assert.throws(() => validateSavedRecallFlashcards({ ...d, firstAssessment: { score: 1 } }));
  assert.throws(() =>
    validateSavedRecallFlashcards({ ...d, namespace: { course: 'igcse', profileId: '' } }),
  );
  assert.throws(() =>
    validateSavedRecallFlashcards({
      ...d,
      undoStack: [{ factId: ids[0], previous: null, revealed: false, score: 1 }],
    }),
  );
});
