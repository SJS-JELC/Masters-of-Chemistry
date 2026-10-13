import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFlashcardDeck,
  reduceFlashcardDeck,
  checkpointForDeck,
  flashcardDeckRestorable,
  createFlashcardSaveQueue,
} from '../../src/recall/flashcard-checkpoint.ts';
import { flashcardModel, flashcardAnswerValue } from '../../src/recall/flashcard-content.ts';
import { validateSavedRecallFlashcards } from '../../src/persistence/recall-validation.ts';

import { recallFacts } from '../../src/recall/facts.ts';
import {
  factsForRecallScope,
  topicsFor,
  validateFlashcardCheckpoint,
  flashcardCheckpointCompatible,
} from '../../src/recall/session-contract.ts';
const action = (state, type, classification) =>
  reduceFlashcardDeck(state, { type, ...(classification ? { classification } : {}) });
test('sorting requires an exposed answer and remains eligible after flip back and reload', () => {
  const fresh = createFlashcardDeck(['a', 'b']);
  assert.equal(action(fresh, 'classify', 'got-it'), fresh);
  const flipped = action(action(fresh, 'flip'), 'flip');
  assert.equal(flipped.revealed, false);
  assert.equal(flipped.answerSeen, true);
  const sorted = action(structuredClone(flipped), 'classify', 'got-it');
  assert.equal(sorted.currentFactId, 'b');
  assert.equal(sorted.answerSeen, false);
  assert.equal(action(sorted, 'classify', 'got-it'), sorted);
  const undone = action(structuredClone(sorted), 'undo');
  assert.equal(undone.revealed, false);
  assert.equal(undone.answerSeen, true);
  assert.equal(action(undone, 'classify', 'practise-again').currentFactId, 'b');
  const { answerSeen: _seen, ...oldFront } = flipped;
  assert.equal(action(oldFront, 'classify', 'got-it'), oldFront);
  const oldBack = { ...oldFront, revealed: true };
  assert.equal(action(oldBack, 'classify', 'got-it').currentFactId, 'b');
  const restored = structuredClone(action(fresh, 'flip'));
  assert.equal(action(restored, 'classify', 'got-it').currentFactId, 'b');
});
test('undo restores classifications and revealed side across completed and retry rounds', () => {
  let state = createFlashcardDeck(['a', 'b']);
  state = action(action(state, 'flip'), 'classify', 'practise-again');
  state = action(action(state, 'flip'), 'classify', 'got-it');
  assert.equal(state.currentFactId, null);
  assert.ok(flashcardDeckRestorable(state));
  const undone = action(structuredClone(state), 'undo');
  assert.equal(undone.currentFactId, 'b');
  assert.equal(undone.revealed, true);
  assert.equal(undone.classifications.b, undefined);
  state = action(state, 'retry-missed');
  assert.equal(state.round, 2);
  assert.deepEqual(state.roundFactIds, ['a']);
  assert.deepEqual(state.undoStack, []);
  assert.equal(state.answerSeen, false);
  state = action(action(state, 'flip'), 'classify', 'got-it');
  state = action(state, 'undo');
  assert.equal(state.classifications.a, 'practise-again');
  state = action(action(state, 'classify', 'got-it'), 'retry-missed');
  assert.equal(state.currentFactId, null);
  const restarted = action(state, 'restart');
  assert.notEqual(restarted.studyRunId, state.studyRunId);
  assert.deepEqual(restarted, { ...createFlashcardDeck(['a', 'b']), studyRunId: restarted.studyRunId });
});
test('live course scope checkpoint validates, changed decks and namespaces require restart', () => {
  assert.equal(recallFacts.length, 127);
  for (const course of ['igcse', 'alevel']) {
    const namespace = { course, profileId: 'flash-unit' };
    const scope = { kind: 'global', topicIds: topicsFor(course).map((t) => t.id) };
    const facts = factsForRecallScope(recallFacts, course, scope);
    let state = createFlashcardDeck(facts.map((f) => f.id));
    state = action(action(state, 'flip'), 'classify', 'practise-again');
    const checkpoint = checkpointForDeck(state, namespace, scope);
    validateFlashcardCheckpoint(checkpoint, recallFacts);
    validateSavedRecallFlashcards(checkpoint);
    let front = action(action(state, 'flip'), 'flip');
    front = action(front, 'classify', 'got-it');
    validateSavedRecallFlashcards(checkpointForDeck(front, namespace, scope));
    assert.ok(flashcardDeckRestorable(checkpoint));
    assert.ok(flashcardCheckpointCompatible(checkpoint, namespace, scope, recallFacts));
    assert.equal(
      flashcardCheckpointCompatible(
        checkpoint,
        { ...namespace, profileId: 'other' },
        scope,
        recallFacts,
      ),
      false,
    );
    assert.equal(
      flashcardCheckpointCompatible(
        checkpoint,
        namespace,
        scope,
        recallFacts.filter((f) => f.id !== facts[0].id),
      ),
      false,
    );
    assert.throws(() =>
      validateFlashcardCheckpoint({ ...checkpoint, answer: 'snapshot' }, recallFacts),
    );
    assert.equal(flashcardDeckRestorable({ ...checkpoint, undoStack: [] }), false);
    assert.equal('firstAssessment' in checkpoint, false);
  }
});
test('live authored models retain qualifications, pairs, exception rows and option labels', () => {
  const fact = (n) => recallFacts.find((f) => f.id === 'igcse-recall-' + n);
  assert.equal(flashcardModel(fact('046')).rows.length, 2);
  assert.equal(flashcardModel(fact('046')).summary, null);
  assert.deepEqual(flashcardModel(fact('046')).rows.map(row => row.label + ': ' + row.value), ['Test: Heat it until boiling', 'Result: Boils at exactly 100°C']);
  assert.equal(fact('046').answerPairs.length, 2);
  assert.equal(flashcardModel(fact('062')).rows.length, 4);
  assert.equal(flashcardModel(fact('082')).rows.at(-1).value, 'None in this classroom rule');
  assert.equal(flashcardModel(fact('100')).rows.length, 6);
  assert.equal(
    flashcardAnswerValue({
      answer: 'soluble',
      entry: { kind: 'choice', options: [{ id: 'soluble', label: 'Soluble' }] },
    }),
    'Soluble',
  );
  for (const f of recallFacts) {
    const model = flashcardModel(f);
    assert.ok(model.summary || model.rows.length);
    assert.ok(!JSON.stringify(model).includes('firstAssessment'));
  }
});
test('ordered writes retain latest state, survive failure, and flush reports failure', async () => {
  const calls = [];
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const queue = createFlashcardSaveQueue(async (value) => {
    calls.push(value);
    if (value === 1) await gate;
    return value !== 2;
  });
  const first = queue.enqueue(1);
  const failed = queue.enqueue(2);
  const last = queue.enqueue(3);
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(calls, [1]);
  release();
  assert.equal(await first, true);
  assert.equal(await failed, false);
  assert.equal(await last, true);
  assert.equal(await queue.flush(), true);
  assert.deepEqual(calls, [1, 2, 3]);
  const failure = createFlashcardSaveQueue(async () => {
    throw Error('quota');
  });
  await failure.enqueue(1);
  assert.equal(await failure.flush(), false);
});
