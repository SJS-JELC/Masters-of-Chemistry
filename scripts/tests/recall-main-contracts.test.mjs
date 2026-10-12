import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController } from '../../src/domain/attempt/attempt.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CURRENT_RECALL_DEFINITION_ID } from '../../src/contracts/recall.ts';
import {
  historicalRecallFacts,
  historicalRecallFact,
  recallDefinitionFor,
  recallResponseFormatCompatible,
  recallAttemptRestoreDisposition,
  activeRecallQueue,
  hasExistingRecallProgressIdentity,
  encodeRecallExceptionEntries,
  decodeRecallExceptionEntries,
  recallAlternativeEligible,
  recallEntryForField,
  validateRecallEntry,
} from '../../src/recall/compatibility.ts';
import {
  historicalRecallFields,
  createHistoricalRecallMarkingPolicy,
  markHistoricalRecallFact,
} from '../../src/recall/historical-marking.ts';
import {
  recallTopics,
  topicsFor,
  factsForRecallScope,
  recallScopeKey,
  rememberRecallLaunch,
  sessionRecallMode,
  sessionRecallScope,
  validateFlashcardCheckpoint,
  flashcardCheckpointCompatible,
  validateRecallPreferences,
} from '../../src/recall/session-contract.ts';
const historical = (n) => historicalRecallFact('igcse', 'igcse-recall-' + n);
const ns = { profileId: 'contract-pupil', course: 'igcse' };
const scope = { kind: 'global', topicIds: ['fourth-3', 'lower-6'] };
const clone = (x) => structuredClone(x);
const current = historicalRecallFacts
  .filter(
    (f) =>
      f.course !== 'igcse' ||
      (/^igcse-recall-/.test(f.id) && !['igcse-recall-061', 'igcse-recall-025'].includes(f.id)),
  )
  .map(clone);
for (const n of ['025a', '025b', '119', '120', '121', '122', '123', '124'])
  current.push({
    ...clone(historical('025')),
    id: 'igcse-recall-' + n,
    fields: undefined,
    answerGroups: undefined,
  });
const response = (values, fact) =>
  Object.fromEntries(
    historicalRecallFields(fact).map((f, i) => [f.id, { kind: 'text', value: values[i] }]),
  );
const attempt = (fact, phase = 'answering', extras = {}) => ({
  namespace: { profileId: 'p', course: fact.course },
  target: { factId: fact.id },
  phase,
  ...extras,
});

test('150 actual immutable historical definitions retained with source fingerprint', () => {
  assert.equal(historicalRecallFacts.length, 150);
  assert.equal(historicalRecallFacts.filter((f) => f.course === 'igcse').length, 144);
  assert.equal(new Set(historicalRecallFacts.map((f) => f.course + ':' + f.id)).size, 150);
  const capture = JSON.parse(
    readFileSync(
      new URL('./fixtures/recall-main/historical-capture.json', import.meta.url),
    ),
  );
  assert.equal(
    createHash('sha256')
      .update(readFileSync(new URL('../../src/recall/historical-facts.json', import.meta.url)))
      .digest('hex'),
    capture.sha256,
  );
  assert.throws(() => {
    historical('014').answer = 'solute';
  }, TypeError);
});
test('frozen historical marker accepts every historical model and retains original point allocation', () => {
  const policy = createHistoricalRecallMarkingPolicy(historicalRecallFacts);
  for (const fact of historicalRecallFacts) {
    const fields = historicalRecallFields(fact),
      q = {
        ref: { activityId: fact.course + '/recall', questionId: fact.id },
        parts: fields.map((f) => ({ id: f.id })),
      };
    const result = policy.mark(
      q,
      response(
        fields.map((f) => f.answer),
        fact,
      ),
    );
    assert.equal(result.accepted, true, fact.id);
    assert.equal(result.marks.earned, result.marks.available, fact.id);
    assert.equal(result.marks.available, fields.length, fact.id);
  }
  const f = historical('062');
  assert.equal(
    markHistoricalRecallFact(
      f,
      response(['Add sodium hydroxide', 'Blue precipitate', 'Flame test', 'Green flame'], f),
    ),
    true,
  );
  assert.equal(
    markHistoricalRecallFact(
      f,
      response(['Add sodium hydroxide', 'Green flame', 'Flame test', 'Blue precipitate'], f),
    ),
    false,
  );
  const any = historicalRecallFacts.find(
    (f) =>
      f.fieldOrder === 'any' &&
      f.fields.length > 1 &&
      new Set(f.fields.map((x) => x.answer)).size === f.fields.length,
  );
  assert.ok(any);
  assert.equal(
    markHistoricalRecallFact(
      any,
      response(
        any.fields.map(() => any.fields[0].answer),
        any,
      ),
    ),
    false,
  );
});
test('definition absence selects historical semantics, named contract selects amended semantics', () => {
  const old = historical('014'),
    changed = {
      ...clone(old),
      prompt: 'What is the name for the solid that dissolves in a liquid?',
      answer: 'solute',
    };
  const bank = current.map((f) => (f.id === old.id ? changed : f));
  assert.equal(recallDefinitionFor('igcse', old.id, bank).answer, old.answer);
  assert.equal(
    recallDefinitionFor('igcse', old.id, bank, CURRENT_RECALL_DEFINITION_ID).answer,
    'solute',
  );
  assert.throws(() => recallDefinitionFor('igcse', old.id, bank, 'unrecognised-contract'));
  assert.equal(
    recallAttemptRestoreDisposition(attempt(old, 'assessed'), bank).fact.answer,
    old.answer,
  );
  assert.equal(recallAttemptRestoreDisposition(attempt(old), bank).kind, 'fresh');
  assert.equal(
    recallAttemptRestoreDisposition(
      attempt(old, 'answering', { definitionId: CURRENT_RECALL_DEFINITION_ID }),
      bank,
    ).kind,
    'resume',
  );
});
test('same text IDs do not establish compatibility for changed meaning, order or controls', () => {
  const old = historical('091');
  assert.equal(
    recallResponseFormatCompatible(old, { ...clone(old), fields: clone(old.fields).reverse() }),
    false,
  );
  assert.equal(
    recallResponseFormatCompatible(old, { ...clone(old), responseFormat: 'smallest-first' }),
    false,
  );
  const ordinary = historical('015');
  assert.equal(
    recallResponseFormatCompatible(ordinary, { ...clone(ordinary), answer: 'solution' }),
    false,
  );
  assert.equal(
    recallResponseFormatCompatible(ordinary, {
      ...clone(ordinary),
      entry: { kind: 'choice', options: [{ id: 'solution', label: 'Solution' }] },
    }),
    false,
  );
  assert.equal(
    recallResponseFormatCompatible(ordinary, {
      ...clone(ordinary),
      exceptionCollection: {
        id: 'exceptions',
        label: 'Exceptions',
        responsePrefix: 'exception-',
        entry: { kind: 'text' },
        groups: [],
      },
    }),
    false,
  );
  assert.equal(
    recallResponseFormatCompatible(ordinary, {
      ...clone(ordinary),
      gemIds: [...ordinary.gemIds, 'fourth-16-1'],
      accepted: [...ordinary.accepted, 'another approved equivalent'],
    }),
    true,
  );
});
test('retired IDs skip queues while historical evidence remains addressable; new identities inherit no success', () => {
  const extra = historicalRecallFacts.find(
    (f) => f.course === 'igcse' && !/^igcse-recall-/.test(f.id),
  );
  assert.deepEqual(
    activeRecallQueue(
      ['igcse-recall-061', 'igcse-recall-025', extra.id, 'igcse-recall-014', 'igcse-recall-014'],
      'igcse',
      current,
    ),
    ['igcse-recall-014'],
  );
  assert.equal(
    recallAttemptRestoreDisposition(attempt(historical('061')), current).reason,
    'retired',
  );
  assert.equal(
    recallAttemptRestoreDisposition(attempt(historical('061'), 'assessed'), current).active,
    false,
  );
  for (const id of ['025a', '025b', '119', '120', '121', '122', '123', '124'])
    assert.equal(hasExistingRecallProgressIdentity('igcse', 'igcse-recall-' + id, current), false);
  assert.equal(hasExistingRecallProgressIdentity('igcse', 'igcse-recall-014', current), true);
});
test('explicit curriculum metadata assigns bonding/molecules and transition elements to physical/inorganic', () => {
  assert.equal(recallTopics.find((t) => t.id === 'l6-t2-1').batchId, 'l6-physical-inorganic');
  assert.equal(recallTopics.find((t) => t.id === 'l6-t2-2').batchId, 'l6-physical-inorganic');
  assert.equal(recallTopics.find((t) => t.id === 'u6-t2-7').batchId, 'u6-physical-inorganic');
  assert.equal(topicsFor('alevel', { batchId: 'l6-organic' }).length, 7);
  assert.equal(topicsFor('alevel', { batchId: 'u6-organic' }).length, 6);
  assert.equal(topicsFor('alevel', { strand: 'physical-inorganic' }).length, 18);
  assert.deepEqual(
    [...new Set(topicsFor('igcse').map((t) => t.year))],
    ['fourth', 'lower', 'upper'],
  );
});
test('scope keys isolate profile/course/global/gem and selected facts deduplicate', () => {
  assert.equal(
    recallScopeKey(ns, scope),
    recallScopeKey(ns, { kind: 'global', topicIds: [...scope.topicIds].reverse() }),
  );
  assert.notEqual(
    recallScopeKey(ns, scope),
    recallScopeKey({ ...ns, profileId: 'another' }, scope),
  );
  assert.notEqual(recallScopeKey(ns, scope), recallScopeKey({ ...ns, course: 'alevel' }, scope));
  assert.notEqual(
    recallScopeKey(ns, scope),
    recallScopeKey(ns, { kind: 'gem', gemId: 'fourth-3-1' }),
  );
  const selected = factsForRecallScope([...current, ...current], 'igcse', scope);
  assert.ok(selected.length);
  assert.equal(selected.length, new Set(selected.map((f) => f.id)).size);
  assert.deepEqual(factsForRecallScope(current, 'igcse', { kind: 'global', topicIds: [] }), []);
});
test('gem launch preserves remembered global topics; test/mode scope resumes explicitly', () => {
  const prefs = { namespace: ns, globalTopicIds: scope.topicIds, mode: 'test', lastScope: scope };
  const next = rememberRecallLaunch(prefs, 'flashcards', { kind: 'gem', gemId: 'fourth-3-1' });
  assert.deepEqual(next.globalTopicIds, prefs.globalTopicIds);
  assert.equal(next.mode, 'flashcards');
  validateRecallPreferences(next);
  assert.throws(() => validateRecallPreferences({ ...next, globalTopicIds: ['l6-t2-1'] }));
  assert.equal(sessionRecallMode({}), 'test');
  assert.equal(sessionRecallMode({ mode: 'flashcards' }), 'flashcards');
  assert.deepEqual(sessionRecallScope({ namespace: ns, gemIds: ['fourth-3-1'] }), {
    kind: 'gem',
    gemId: 'fourth-3-1',
  });
  assert.deepEqual(sessionRecallScope({ namespace: ns, gemIds: null, scope }), scope);
  assert.throws(
    () => sessionRecallScope({ namespace: ns, gemIds: ['fourth-3-1', 'lower-6-1'] }),
    /fresh topic selection/,
  );
});
test('checkpoint contains only refs/classifications and rejects wrong namespace/selection/evidence injection', () => {
  const ids = factsForRecallScope(current, 'igcse', scope).map((f) => f.id);
  const checkpoint = {
    namespace: ns,
    scope,
    factIds: ids,
    round: 1,
    roundFactIds: ids,
    currentFactId: ids[0],
    classifications: {},
    revealed: false,
    undoStack: [],
  };
  validateFlashcardCheckpoint(checkpoint, current);
  assert.equal(flashcardCheckpointCompatible(checkpoint, ns, scope, current), true);
  assert.equal(
    flashcardCheckpointCompatible(checkpoint, { ...ns, profileId: 'another' }, scope, current),
    false,
  );
  assert.throws(() =>
    validateFlashcardCheckpoint({ ...checkpoint, roundFactIds: [ids[0], ids[0]] }, current),
  );
  assert.throws(() =>
    validateFlashcardCheckpoint({ ...checkpoint, classifications: { unknown: 'got-it' } }, current),
  );
  assert.throws(() =>
    validateFlashcardCheckpoint({ ...checkpoint, firstAssessment: { score: 1 } }, current),
  );
  assert.equal(
    flashcardCheckpointCompatible(
      checkpoint,
      ns,
      scope,
      current.filter((f) => f.id !== ids[0]),
    ),
    false,
  );
});
test('zero-to-many exception payloads preserve raw entries, reject malformed/duplicate IDs', () => {
  assert.deepEqual(decodeRecallExceptionEntries('[]'), []);
  const entries = [
    { id: 'exception-0', value: 'silver chloride' },
    { id: 'exception-2', value: 'lead' },
  ];
  assert.deepEqual(decodeRecallExceptionEntries(encodeRecallExceptionEntries(entries)), entries);
  assert.throws(() => decodeRecallExceptionEntries('silver chloride'));
  assert.throws(() => decodeRecallExceptionEntries('{}'));
  assert.throws(() => decodeRecallExceptionEntries('[{"id":"x","value":"silver","correct":true}]'));
  assert.throws(() =>
    encodeRecallExceptionEntries([
      { id: 'x', value: 'silver' },
      { id: 'x', value: 'lead' },
    ]),
  );
});
test('valid-alternative display requires explicit wrong typed post-assessment opt-in', () => {
  const field = {
    id: 'answer',
    label: 'Answer',
    answer: 'model',
    accepted: [],
    alternative: {
      kind: 'valid-alternative',
      guidance: 'Check that the chemical idea is equivalent.',
    },
  };
  assert.deepEqual(recallEntryForField(field), { kind: 'text' });
  assert.equal(recallAlternativeEligible(field, 'equivalent wording', 'assessed', false), true);
  assert.equal(recallAlternativeEligible(field, 'equivalent wording', 'answering', false), false);
  assert.equal(
    recallAlternativeEligible(field, 'not the model', 'assessed', false, 'rejected'),
    false,
  );
  assert.equal(recallAlternativeEligible(field, 'equivalent wording', 'assessed', true), false);
  assert.equal(recallAlternativeEligible(field, '   ', 'assessed', false), false);
  assert.equal(
    recallAlternativeEligible(
      { ...field, alternative: { kind: 'none' } },
      'wrong',
      'assessed',
      false,
    ),
    false,
  );
  for (const entry of [
    { kind: 'numeric', unit: '°C' },
    { kind: 'signed-charge', requireSign: true },
    { kind: 'chemical-formula', notation: 'molecular' },
    { kind: 'choice', options: [] },
    { kind: 'general-formula' },
  ])
    assert.equal(recallAlternativeEligible({ ...field, entry }, 'wrong', 'assessed', false), false);
});

test('ion count boundary is explicit; molecular and general formula entry are independent', () => {
  validateRecallEntry({ kind: 'chemical-formula', notation: 'ion', atomCountDigits: 0 });
  validateRecallEntry({ kind: 'chemical-formula', notation: 'ion', atomCountDigits: 1 });
  validateRecallEntry({ kind: 'chemical-formula', notation: 'molecular' });
  validateRecallEntry({ kind: 'general-formula' });
  assert.throws(() => validateRecallEntry({ kind: 'chemical-formula', notation: 'ion' }));
  assert.throws(() =>
    validateRecallEntry({ kind: 'chemical-formula', notation: 'ion', atomCountDigits: -1 }),
  );
  assert.throws(() =>
    validateRecallEntry({
      kind: 'choice',
      options: [
        { id: 'same', label: 'A' },
        { id: 'same', label: 'B' },
      ],
    }),
  );
});

test('actual shared controller post-check model preserves first response assistance, marks and timing', () => {
  const f = historical('014'),
    ref = { activityId: 'igcse/recall', questionId: f.id, seed: 0, level: 1 };
  const q = {
    ref,
    title: 'Recall',
    context: [],
    layout: 'compact',
    submission: 'all-required-parts',
    parts: [
      {
        id: 'answer',
        kind: 'text',
        prompt: [],
        marks: 1,
        required: true,
        dependsOn: [],
        accepted: [f.answer],
        normalization: 'exact',
        presentation: 'single-line',
      },
    ],
    scaffolds: [],
    hints: [],
    workedAnswer: [],
    sources: f.sources,
  };
  let sample = {
    monotonicMs: 0,
    wallMs: 1800000000000,
    visible: true,
    focused: true,
    suspended: false,
  };
  const state = {
    mode: 'student',
    namespace: ns,
    attemptId: 'contract-shared-clock',
    ref,
    target: { kind: 'recall', course: 'igcse', activityId: 'igcse/recall', factId: f.id, level: 1 },
    phase: 'answering',
    currentResponses: {},
    assistance: [],
    timing: {
      attemptId: 'contract-shared-clock',
      activeMs: 0,
      idleLimitMs: 60000,
      finished: false,
    },
  };
  const clock = createActiveClock({
    attemptId: state.attemptId,
    idleLimitMs: 60000,
    now: () => sample,
    saved: state.timing,
  });
  const c = createAttemptController({
    question: q,
    state,
    policy: createHistoricalRecallMarkingPolicy([f]),
    clock,
    sample: () => sample,
  });
  assert(
    c.dispatch({ kind: 'respond', partId: 'answer', response: { kind: 'text', value: f.answer } })
      .accepted,
  );
  sample = { ...sample, monotonicMs: 1000, wallMs: sample.wallMs + 1000 };
  c.sample(sample);
  assert(c.dispatch({ kind: 'submit', at: sample.wallMs }).accepted);
  const first = clone(c.state().firstResponse),
    assessment = clone(c.state().firstAssessment);
  assert.deepEqual(first.assistance, []);
  assert.equal(assessment.score, 1);
  assert(
    c.dispatch({
      kind: 'assist',
      assistance: { kind: 'worked-answer', supportId: 'model-answer', at: sample.wallMs },
    }).accepted,
  );
  assert.deepEqual(c.state().firstResponse, first);
  assert.deepEqual(c.state().firstAssessment, assessment);
  assert.equal(c.state().modelAnswerShown, true);
  assert.equal(c.state().assistance.length, 1);
  assert.equal(c.dispatch({ kind: 'check-correction' }).accepted, false);
});
