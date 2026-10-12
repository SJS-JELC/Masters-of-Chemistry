import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFlashcardDeck,
  reduceFlashcardDeck,
  flashcardPileTop,
} from '../../src/recall/flashcard-checkpoint.ts';
import { questionActionState } from '../../src/ui/action-state.ts';
const sort = (s, c) =>
  reduceFlashcardDeck(reduceFlashcardDeck(s, { type: 'flip' }), {
    type: 'classify',
    classification: c,
  });
test('pile tops follow current-round sort history, undo, reload, retry and restart', () => {
  let s = createFlashcardDeck(['a', 'b', 'c', 'd']);
  assert.equal(flashcardPileTop(s, 'got-it'), null);
  s = sort(s, 'got-it');
  s = sort(s, 'practise-again');
  s = sort(s, 'got-it');
  assert.equal(flashcardPileTop(s, 'got-it'), 'c');
  assert.equal(flashcardPileTop(s, 'practise-again'), 'b');
  s = reduceFlashcardDeck(structuredClone(s), { type: 'undo' });
  assert.equal(flashcardPileTop(s, 'got-it'), 'a');
  s = reduceFlashcardDeck(s, { type: 'classify', classification: 'practise-again' });
  s = sort(s, 'got-it');
  assert.equal(s.currentFactId, null);
  assert.equal(flashcardPileTop(s, 'got-it'), 'd');
  s = reduceFlashcardDeck(s, { type: 'retry-missed' });
  assert.equal(flashcardPileTop(s, 'got-it'), null);
  assert.equal(flashcardPileTop(s, 'practise-again'), null);
  s = sort(s, 'got-it');
  assert.equal(flashcardPileTop(s, 'got-it'), 'b');
  s = reduceFlashcardDeck(s, { type: 'undo' });
  assert.equal(s.classifications.b, 'practise-again');
  assert.equal(flashcardPileTop(s, 'practise-again'), null);
  assert.equal(flashcardPileTop(reduceFlashcardDeck(s, { type: 'restart' }), 'got-it'), null);
});
const answering = {
  ref: { activityId: 'alevel/recall', questionId: 'test', seed: 0, level: 1 },
  mode: 'student',
  attemptId: 'test',
  phase: 'answering',
  currentResponses: {},
  assistance: [],
};
const assessed = (earned) => ({
  ...answering,
  phase: 'assessed',
  firstResponse: { responses: {}, assistance: [] },
  firstAssessment: { kind: 'marked', marks: { earned, available: 1, points: [] } },
});
test('automatic model presentation preserves first-assessment, readiness and durable Next gates', () => {
  assert.equal(questionActionState(answering, undefined, { ready: false }).checkEnabled, false);
  assert.equal(
    questionActionState(answering, undefined, { modelAnswerVisible: false }).nextEnabled,
    false,
  );
  for (const earned of [0, 1]) {
    const a = assessed(earned),
      before = structuredClone(a);
    const state = questionActionState(a, undefined, { modelAnswerVisible: true, canNext: false });
    assert.equal(state.checkEnabled, false);
    assert.equal(state.primary, 'next');
    assert.equal(state.nextEnabled, false);
    assert.equal(
      questionActionState(a, undefined, { modelAnswerVisible: true, canNext: true }).nextEnabled,
      true,
    );
    assert.deepEqual(a, before);
  }
  assert.equal(questionActionState(assessed(0), undefined).checkEnabled, true);
  assert.equal(questionActionState(assessed(0), undefined).giveUpEnabled, true);
  assert.equal(
    questionActionState({ mode: 'teacher', currentResponses: {} }, undefined, {
      modelAnswerVisible: true,
    }).nextEnabled,
    false,
  );
});
