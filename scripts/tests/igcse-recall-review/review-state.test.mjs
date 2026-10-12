import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyReview, updateTrial, reviewPayload } from './review-state.ts';
const firstResponse = { responses: { answer: { kind: 'text', value: 'Solid melts into a spherical bead' } }, submittedAt: 10, timing: { activeMs: 0, idleLimitMs: 60000 }, assistance: [] };
const firstAssessment = { kind: 'marked', assessedAt: 10, marks: { earned: 0, available: 1, points: [] }, score: 0, selfAssessed: false };
const state = { mode: 'student', phase: 'assessed', attemptId: 'review-trial-1', currentResponses: firstResponse.responses, firstResponse, firstAssessment };
const automaticResult = { correct: false, fields: [{ fieldId: 'answer', correct: false, alternativeEligible: true }], missingGroupIds: [] };
test('learning review and correction retain frozen first automatic evidence', () => {
 const original = updateTrial(emptyReview(), state, { kind: 'submit', at: 10 }, automaticResult);
 const changed = updateTrial(original, { ...state, currentResponses: { answer: { kind: 'text', value: 'Forms a ball' } }, learningReview: { kind: 'post-assessment-learning', decisions: [{ partId: 'answer', pointId: 'answer', judgement: 'equivalent', reviewer: 'student' }], reviewedMarks: { earned: 1, available: 1, points: [] } } }, { kind: 'check-correction' }, { ...automaticResult, correct: true }, { kind: 'correction-learning', status: 'correct', marks: { earned: 1, available: 1, points: [] } });
 assert.deepEqual(changed.trials[0].firstResponse, firstResponse);
 assert.deepEqual(changed.trials[0].firstAssessment, firstAssessment);
 assert.equal(changed.trials[0].automaticResult.correct, false);
 assert.equal(changed.trials[0].learningReview.decisions[0].judgement, 'equivalent');
 assert.equal(changed.trials[0].currentResponses.answer.value, 'Forms a ball');
 assert.equal(changed.trials[0].corrections[0].feedback.status, 'correct');
 assert.equal(original.trials[0].currentResponses.answer.value, 'Solid melts into a spherical bead');
 assert.equal(original.trials[0].learningReview, null);
});
test('fresh reset trial keeps previous trials and notes', () => {
 const old = updateTrial({ ...emptyReview(), note: 'Check ambiguity', status: 'issue' }, state, { kind: 'submit', at: 10 }, automaticResult);
 const next = updateTrial({ ...old, activeAttempt: null }, { ...state, attemptId: 'review-trial-2' }, { kind: 'submit', at: 11 }, automaticResult);
 assert.equal(next.trials.length, 2);
 assert.equal(next.note, 'Check ambiguity');
 assert.equal(next.status, 'issue');
 assert.equal(next.activeAttempt.attemptId, 'review-trial-2');
});
test('export covers unreviewed and unentered IDs with cloned separate data', () => {
 const reviewed = updateTrial(emptyReview(), state, { kind: 'submit', at: 10 }, automaticResult);
 const payload = reviewPayload([{ id: 'one', prompt: 'First' }, { id: 'two', prompt: 'Second' }], { one: reviewed }, 'f'.repeat(64), { exclusions: { old: 'Historical only' } });
 assert.equal(payload.reviews.length, 2);
 assert.equal(payload.reviews[1].status, 'unreviewed');
 assert.deepEqual(payload.reviews[1].trials, []);
 assert.equal(payload.reviews[1].activeAttempt, null);
 assert.equal(payload.independentEvidence, false);
 payload.reviews[0].trials[0].firstResponse.responses.answer.value = 'Changed export';
 assert.equal(reviewed.trials[0].firstResponse.responses.answer.value, 'Solid melts into a spherical bead');
});
