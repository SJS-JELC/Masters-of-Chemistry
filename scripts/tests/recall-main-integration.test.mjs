import test from 'node:test';
import assert from 'node:assert/strict';
import { recallFacts } from '../../src/recall/facts.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../../src/contracts/recall.ts';
import { createRecallProvider, recallRef } from '../../src/recall/provider.ts';
import {
  createRecallMarkingPolicy,
  createRecallLearningReviewPolicy,
} from '../../src/recall/marking.ts';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController } from '../../src/domain/attempt/attempt.ts';
import {
  isModelAnswerShown,
  isModelAnswerPanelShown,
} from '../../src/domain/attempt/model-answer.ts';
import { assessmentToRecallEvidence } from '../../src/recall/scheduler.ts';
import { validateRecallAttempt } from '../../src/persistence/validation.ts';
function wrongAttempt(course, id, current = true, value = 'incorrect') {
  const ref = recallRef(course, id),
    question = createRecallProvider(recallFacts, course).restore(ref);
  const attemptId = 'model-' + course + '-' + id;
  let sample = {
    monotonicMs: 0,
    wallMs: Date.parse('2026-10-10T12:00:00Z'),
    visible: true,
    focused: true,
    suspended: false,
  };
  const state = {
    mode: 'student',
    namespace: { course, profileId: 'integration' },
    attemptId,
    ref,
    target: { kind: 'recall', course, activityId: ref.activityId, factId: id, level: 1 },
    currentResponses: { answer: { kind: 'text', value } },
    assistance: [],
    phase: 'answering',
    timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
    ...(current ? { definitionId: CURRENT_RECALL_DEFINITION_ID } : {}),
  };
  const clock = createActiveClock({ attemptId, idleLimitMs: 60000, now: () => sample });
  const c = createAttemptController({
    state,
    question,
    policy: createRecallMarkingPolicy(recallFacts),
    ...(course === 'igcse' && current
      ? { learningReviewPolicy: createRecallLearningReviewPolicy(recallFacts) }
      : {}),
    clock,
    sample: () => sample,
  });
  sample = { ...sample, monotonicMs: 2000, wallMs: sample.wallMs + 2000 };
  c.sample(sample);
  const result = c.dispatch({ kind: 'submit', at: sample.wallMs });
  assert.equal(result.accepted, true);
  return { c, result, question };
}
test('current IGCSE immediate model is separate from frozen independent wrong evidence and timing', () => {
  const { c, result } = wrongAttempt('igcse', 'igcse-recall-014');
  const a = result.state;
  assert.equal(a.phase, 'assessed');
  assert.equal(a.firstAssessment.score, 0);
  assert.equal(isModelAnswerShown(a), true);
  assert.equal(isModelAnswerPanelShown(a), true);
  assert.deepEqual(a.firstResponse.assistance, []);
  assert.equal(a.firstResponse.timing.activeMs, 2000);
  validateRecallAttempt(a);
  const evidence = assessmentToRecallEvidence(a);
  assert.equal(evidence.outcome, 'wrong');
  c.dispatch({ kind: 'respond', partId: 'answer', response: { kind: 'text', value: 'solute' } });
  assert.equal(c.dispatch({ kind: 'check-correction' }).accepted, false);
  assert.deepEqual(assessmentToRecallEvidence(c.state()), evidence);
});
test('A Level wrong recall retains inherited hidden model behaviour', () => {
  const { result } = wrongAttempt('alevel', 'ionic-lattice-solid');
  assert.equal(result.state.firstAssessment.score, 0);
  assert.equal(isModelAnswerShown(result.state), false);
  assert.equal(isModelAnswerPanelShown(result.state), false);
  validateRecallAttempt(result.state);
});
test('legacy assessed wrong model presentation does not acquire current IGCSE automation', () => {
  const { result } = wrongAttempt('igcse', 'igcse-recall-013', false);
  assert.equal(isModelAnswerShown(result.state), false);
  assert.equal(isModelAnswerPanelShown(result.state), false);
});

test('durable eligible wording correction validates separately while forged corrections fail', () => {
  const { c, result } = wrongAttempt(
    'igcse',
    'igcse-recall-065',
    true,
    'Solid melts into a spherical bead',
  );
  const first = structuredClone(result.state.firstAssessment),
    evidence = assessmentToRecallEvidence(result.state);
  const corrected = c.dispatch({
    kind: 'review-valid-alternative',
    decision: { partId: 'answer', pointId: 'answer', judgement: 'equivalent', reviewer: 'student' },
  });
  assert.equal(corrected.accepted, true);
  assert.equal(corrected.state.learningReview.reviewedMarks.earned, 1);
  validateRecallAttempt(corrected.state);
  assert.deepEqual(corrected.state.firstAssessment, first);
  assert.deepEqual(assessmentToRecallEvidence(corrected.state), evidence);
  assert.equal(evidence.outcome, 'wrong');
  const edited = c.dispatch({
    kind: 'respond',
    partId: 'answer',
    response: { kind: 'text', value: 'learning edit' },
  });
  assert.equal(edited.accepted, true);
  validateRecallAttempt(edited.state);
  assert.deepEqual(edited.state.learningReview, corrected.state.learningReview);
  assert.deepEqual(assessmentToRecallEvidence(edited.state), evidence);
  const forged = structuredClone(corrected.state);
  forged.learningReview.reviewedMarks.available = 2;
  assert.throws(() => validateRecallAttempt(forged));
  const forbidden = wrongAttempt('igcse', 'igcse-recall-014').result.state;
  const injected = {
    ...forbidden,
    learningReview: {
      kind: 'post-assessment-learning',
      decisions: [
        { partId: 'answer', pointId: 'answer', judgement: 'equivalent', reviewer: 'student' },
      ],
      reviewedMarks: {
        ...forbidden.firstAssessment.marks,
        earned: 1,
        points: forbidden.firstAssessment.marks.points.map((p) => ({ ...p, earned: 1 })),
      },
    },
  };
  assert.throws(() => validateRecallAttempt(injected));
});
