import test from 'node:test';
import assert from 'node:assert/strict';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController, assessmentToEvidence } from '../../src/domain/attempt/attempt.ts';
import {
  isModelAnswerShown,
  isModelAnswerPanelShown,
} from '../../src/domain/attempt/model-answer.ts';
import { questionActionState } from '../../src/ui/action-state.ts';
import { checkQuestionInput } from '../../src/domain/attempt/input-checks.ts';
import { validateRecallAttempt } from '../../src/persistence/recall-validation.ts';
import { recallFacts } from '../../src/recall/facts.ts';
import { recallFields, createRecallMarkingPolicy } from '../../src/recall/marking.ts';
import { createRecallProvider, recallRef } from '../../src/recall/provider.ts';
import { assessmentToRecallEvidence } from '../../src/recall/scheduler.ts';
function scenario(course = 'igcse', saved, custom) {
  const fact = recallFacts.find((f) => f.course === course),
    ref = recallRef(course, fact.id);
  const q = custom?.q ?? createRecallProvider(recallFacts, course).restore(ref);
  let sample = {
    monotonicMs: 0,
    wallMs: 1800000000000,
    visible: true,
    focused: true,
    suspended: false,
  };
  const state = saved ?? {
    mode: 'student',
    namespace: { course, profileId: 'followup-lock' },
    attemptId: 'lock-' + course,
    ref: q.ref,
    target: { kind: 'recall', course, activityId: ref.activityId, factId: fact.id, level: 1 },
    phase: 'answering',
    currentResponses: {},
    assistance: [],
    timing: { attemptId: 'lock-' + course, activeMs: 0, idleLimitMs: 60000, finished: false },
  };
  const clock = createActiveClock({
    attemptId: state.attemptId,
    idleLimitMs: 60000,
    now: () => sample,
    ...(state.phase === 'answering' ? { saved: state.timing } : { completed: true }),
  });
  const c = createAttemptController({
    question: q,
    state,
    policy: custom?.policy ?? createRecallMarkingPolicy(recallFacts),
    clock,
    sample: () => sample,
  });
  return {
    c,
    q,
    fact,
    at: () => sample.wallMs,
    advance(ms) {
      sample = { ...sample, monotonicMs: sample.monotonicMs + ms, wallMs: sample.wallMs + ms };
      c.sample(sample);
    },
    answer(correct = true) {
      for (const f of recallFields(fact))
        c.dispatch({
          kind: 'respond',
          partId: f.id,
          response: { kind: 'text', value: correct ? f.answer : 'wrong answer' },
        });
    },
  };
}
function reveal(s) {
  return s.c.dispatch({
    kind: 'assist',
    assistance: {
      kind: s.c.state().phase === 'assessed' ? 'worked-answer' : 'reveal',
      supportId: 'worked-answer',
      at: s.at(),
    },
  });
}
function assertLocked(s) {
  assert(isModelAnswerShown(s.c.state()));
  assert.equal(
    questionActionState(s.c.state(), undefined, {
      modelAnswerVisible: isModelAnswerShown(s.c.state()),
    }).checkEnabled,
    false,
  );
  assert.equal(s.c.dispatch({ kind: 'submit', at: s.at() }).accepted, false);
  assert.equal(s.c.dispatch({ kind: 'check-correction' }).accepted, false);
}
for (const course of ['igcse', 'alevel']) {
  test(
    course +
      ': reveal before first freezes assistance/timing; clear/edit/copy/reload cannot unlock; Next is fresh',
    () => {
      const s = scenario(course);
      s.advance(1200);
      reveal(s);
      const frozen = structuredClone(s.c.state().firstResponse);
      assert.equal(s.c.state().firstAssessment.kind, 'revealed');
      for (const cmd of [
        { kind: 'clear' },
        ...recallFields(s.fact).map((f) => ({
          kind: 'respond',
          partId: f.id,
          response: { kind: 'text', value: f.answer },
        })),
      ]) {
        assert(s.c.dispatch(cmd).accepted);
        assertLocked(s);
        assert.deepEqual(s.c.state().firstResponse, frozen);
      }
      const saved = JSON.parse(JSON.stringify(s.c.state()));
      validateRecallAttempt(saved);
      assertLocked(scenario(course, saved));
      assert.equal(questionActionState(scenario(course).c.state(), undefined).checkEnabled, true);
      assert.equal(assessmentToRecallEvidence(s.c.state()).outcome, 'revealed');
    },
  );
  test(
    course +
      ': wrong correction can become correct once, then durable auto-model locks without new score/time',
    () => {
      const s = scenario(course);
      s.answer(false);
      s.advance(1000);
      assert(s.c.dispatch({ kind: 'submit', at: s.at() }).accepted);
      const evidence = structuredClone(assessmentToRecallEvidence(s.c.state()));
      assert.equal(questionActionState(s.c.state(), undefined).checkEnabled, true);
      s.answer();
      s.advance(5000);
      const result = s.c.dispatch({ kind: 'check-correction' });
      assert.equal(result.correctionFeedback.status, 'correct');
      assert.equal(s.c.state().modelAnswerPanelShown, true);
      assert(isModelAnswerPanelShown(s.c.state()));
      assertLocked(s);
      s.c.dispatch({ kind: 'clear' });
      s.answer();
      assertLocked(s);
      assert.deepEqual(assessmentToRecallEvidence(s.c.state()), evidence);
      validateRecallAttempt(s.c.state());
      assertLocked(scenario(course, JSON.parse(JSON.stringify(s.c.state()))));
    },
  );
  test(
    course +
      ': reveal after wrong and first correct preserve first evidence, and legacy latch inference',
    () => {
      for (const correct of [false, true]) {
        const s = scenario(course);
        s.answer(correct);
        s.advance(500);
        s.c.dispatch({ kind: 'submit', at: s.at() });
        const evidence = structuredClone(assessmentToRecallEvidence(s.c.state()));
        reveal(s);
        assertLocked(s);
        assert.deepEqual(assessmentToRecallEvidence(s.c.state()), evidence);
        const legacy = structuredClone(s.c.state());
        delete legacy.modelAnswerShown;
        delete legacy.currentGiveUp;
        assert(isModelAnswerShown(legacy));
        validateRecallAttempt(legacy);
      }
      const s = scenario(course);
      s.answer();
      s.c.dispatch({ kind: 'submit', at: s.at() });
      const legacy = structuredClone(s.c.state());
      delete legacy.modelAnswerShown;
      assert(isModelAnswerShown(legacy));
      assert.equal(questionActionState(legacy, undefined).checkEnabled, false);
    },
  );
}
test('teacher/review cannot Check or create evidence; strict latch only accepts true', () => {
  for (const mode of ['teacher', 'review']) {
    const a = { mode, ref: scenario().q.ref, currentResponses: {} };
    assert.equal(questionActionState(a, undefined).checkEnabled, false);
    assert.equal(assessmentToEvidence(a), null);
  }
  const s = scenario();
  reveal(s);
  for (const v of [false, 1, 'true', null])
    assert.throws(() => validateRecallAttempt({ ...s.c.state(), modelAnswerShown: v }));
});
test('marked coefficient blank=1 and exact rational syntax; parenthesized states stay raw; generic input unchanged', () => {
  const q = {
    ...scenario().q,
    parts: [
      { id: 'n', kind: 'numeric', required: true, coefficientEntry: 'positive-rational-blank-one' },
      {
        id: 's',
        kind: 'choice',
        required: true,
        stateEntry: 'parenthesized',
        options: [{ id: 'aq' }, { id: 's' }],
        presentation: 'single',
      },
    ],
  };
  for (const raw of ['', '1/2', '½', '0.5', '1/3'])
    assert.equal(
      checkQuestionInput(q, {
        n: { kind: 'numeric', raw, unit: '' },
        s: { kind: 'choice', selected: ['( aq )'] },
      }).length,
      0,
      raw,
    );
  assert.equal(checkQuestionInput(q, { s: { kind: 'choice', selected: ['(aq)'] } }).length, 0);
  for (const raw of ['0', '-1', '1/0', 'NaN', '1e3', '0.333x'])
    assert(
      checkQuestionInput(q, {
        n: { kind: 'numeric', raw, unit: '' },
        s: { kind: 'choice', selected: ['(aq)'] },
      }).length,
    );
  for (const raw of ['aq', '[aq]', '(water)', '(aq)(s)'])
    assert(checkQuestionInput(q, { s: { kind: 'choice', selected: [raw] } }).length);
  assert(
    checkQuestionInput({ ...q, parts: [{ id: 'n', kind: 'numeric', required: true }] }, {}).length,
  );
});

test('wrong practical automatic model locks at submission and legacy restore', () => {
  const base = scenario();
  const q = { ...base.q, ref: { ...base.q.ref, activityId: 'igcse/energetics-practical' } };
  const state = {
    ...base.c.state(),
    ref: q.ref,
    target: { course: 'igcse', activityId: q.ref.activityId, gemId: 'lower-10-2', level: 1 },
  };
  let now = {
    monotonicMs: 0,
    wallMs: 1800000000000,
    visible: true,
    focused: true,
    suspended: false,
  };
  const clock = createActiveClock({
    attemptId: state.attemptId,
    idleLimitMs: 60000,
    now: () => now,
  });
  const c = createAttemptController({
    state,
    question: q,
    policy: createRecallMarkingPolicy(recallFacts),
    clock,
    sample: () => now,
  });
  for (const f of recallFields(base.fact))
    c.dispatch({
      kind: 'respond',
      partId: f.id,
      response: { kind: 'text', value: 'wrong answer' },
    });
  const r = c.dispatch({ kind: 'submit', at: now.wallMs });
  assert(r.accepted);
  assert.equal(r.state.firstAssessment.marks.earned, 0);
  assert.equal(r.state.modelAnswerShown, true);
  assert.equal(c.dispatch({ kind: 'check-correction' }).accepted, false);
  const legacy = structuredClone(c.state());
  delete legacy.modelAnswerShown;
  assert(isModelAnswerShown(legacy));
});

test('mandatory drawing review stays confirmable after its displayed model locks ordinary checking', () => {
  const base = scenario();
  const q = {
    ...base.q,
    parts: [
      { id: 'n', kind: 'numeric', required: true, marks: 1 },
      { id: 'd', kind: 'drawing-self-check', marks: 1, model: [], criteria: ['model'] },
    ],
  };
  const policy = {
    mark(q) {
      return {
        accepted: true,
        marks: {
          earned: 1,
          available: 1,
          points: [{ partId: 'n', pointId: 'n', earned: 1, available: 1, message: 'correct' }],
        },
      };
    },
    masteryScore: (m) => (m.earned === m.available ? 1 : 0.5),
  };
  const s = scenario('igcse', undefined, { q, policy });
  s.c.dispatch({ kind: 'respond', partId: 'n', response: { kind: 'numeric', raw: '1', unit: '' } });
  s.c.dispatch({ kind: 'submit', at: s.at() });
  assert.equal(s.c.state().phase, 'drawing-review');
  assert.equal(isModelAnswerPanelShown(s.c.state()), false);
  assert(isModelAnswerShown(s.c.state()));
  const first = structuredClone(s.c.state().firstResponse);
  assert.equal(s.c.dispatch({ kind: 'check-correction' }).accepted, false);
  assert.equal(
    s.c.dispatch({ kind: 'confirm-drawing', partId: 'd', matches: false, at: s.at() }).accepted,
    true,
  );
  assert.equal(s.c.state().phase, 'assessed');
  assert.equal(isModelAnswerPanelShown(s.c.state()), false);
  assertLocked(s);
  assert.deepEqual(s.c.state().firstResponse, first);
});
test('mandatory rubric commands complete before correct auto-model latch', () => {
  const base = scenario();
  const q = {
    ...base.q,
    parts: [
      {
        id: 'e',
        kind: 'explanation',
        required: true,
        marks: 1,
        sections: [{ id: 'x', label: 'Explanation' }],
        rubric: [{ id: 'r', text: 'Reference point', marks: 1 }],
      },
    ],
  };
  const policy = {
    mark() {
      throw Error('no auto parts');
    },
    masteryScore: (m) => (m.earned === m.available ? 1 : 0),
  };
  const s = scenario('igcse', undefined, { q, policy });
  s.c.dispatch({
    kind: 'respond',
    partId: 'e',
    response: { kind: 'explanation', sections: [{ id: 'x', text: 'valid evidence' }] },
  });
  s.c.dispatch({ kind: 'submit', at: s.at() });
  assert.equal(s.c.state().phase, 'rubric-review');
  assert.equal(s.c.state().modelAnswerShown, undefined);
  assert.equal(questionActionState(s.c.state(), undefined).checkEnabled, false);
  assert(
    s.c.dispatch({
      kind: 'judge-rubric',
      partId: 'e',
      judgement: { pointId: 'r', status: 'awaiting-evidence' },
    }).accepted,
  );
  assert(
    s.c.dispatch({
      kind: 'judge-rubric',
      partId: 'e',
      judgement: {
        pointId: 'r',
        status: 'met',
        evidence: { start: 0, end: 14, text: 'valid evidence' },
      },
    }).accepted,
  );
  assert(s.c.dispatch({ kind: 'finish-rubric', at: s.at() }).accepted);
  assertLocked(s);
});

test('audited source reference disclosures lock wrong first results; generic wrong feedback stays checkable', () => {
  for (const activityId of [
    'igcse/energy-enthalpy',
    'alevel/electrons-bonding',
    'alevel/ph-titration-curves',
  ]) {
    const base = scenario(),
      q = { ...base.q, ref: { ...base.q.ref, activityId } },
      course = activityId.startsWith('alevel/') ? 'alevel' : 'igcse',
      state = {
        ...base.c.state(),
        namespace: { course, profileId: 'followup' },
        ref: q.ref,
        target: { course, activityId, gemId: 'fixture', level: 1 },
      };
    const now = {
        monotonicMs: 0,
        wallMs: 1800000000000,
        visible: true,
        focused: true,
        suspended: false,
      },
      clock = createActiveClock({ attemptId: state.attemptId, idleLimitMs: 60000, now: () => now });
    const c = createAttemptController({
      state,
      question: q,
      policy: {
        mark(q) {
          const points = q.parts.map((p) => ({
            partId: p.id,
            pointId: p.id,
            earned: 0,
            available: 1,
            message: 'Checked reference',
          }));
          return { accepted: true, marks: { earned: 0, available: points.length, points } };
        },
        masteryScore() {
          return 0;
        },
      },
      clock,
      sample: () => now,
    });
    for (const f of recallFields(base.fact))
      c.dispatch({
        kind: 'respond',
        partId: f.id,
        response: { kind: 'text', value: 'wrong answer' },
      });
    assert(c.dispatch({ kind: 'submit', at: now.wallMs }).accepted);
    assert.equal(c.state().firstAssessment.marks.earned, 0);
    assert.equal(c.state().modelAnswerShown, true);
    assert.equal(isModelAnswerPanelShown(c.state()), false);
    const legacy = structuredClone(c.state());
    delete legacy.modelAnswerShown;
    assert(isModelAnswerShown(legacy));
    assert.equal(c.dispatch({ kind: 'check-correction' }).accepted, false);
  }
});

test('partial reference assistance locks checking without exposing a full model; explicit model request then exposes it', () => {
  const s = scenario();
  s.answer(false);
  s.c.dispatch({ kind: 'submit', at: s.at() });
  const first = structuredClone(s.c.state().firstResponse),
    assessment = structuredClone(s.c.state().firstAssessment);
  assert(
    s.c.dispatch({
      kind: 'assist',
      assistance: { kind: 'worked-answer', supportId: 'model-answer-reference', at: s.at() },
    }).accepted,
  );
  assertLocked(s);
  assert.equal(isModelAnswerPanelShown(s.c.state()), false);
  assert.equal(isModelAnswerPanelShown(JSON.parse(JSON.stringify(s.c.state()))), false);
  assert.deepEqual(s.c.state().firstResponse, first);
  assert.deepEqual(s.c.state().firstAssessment, assessment);
  reveal(s);
  assert(isModelAnswerPanelShown(s.c.state()));
  assert.deepEqual(s.c.state().firstResponse, first);
});

test('raw panel-only state defensively locks direct correction although strict persistence rejects it', () => {
  const s = scenario();
  s.answer(false);
  s.c.dispatch({ kind: 'submit', at: s.at() });
  const raw = { ...s.c.state(), modelAnswerPanelShown: true };
  delete raw.modelAnswerShown;
  assert(isModelAnswerPanelShown(raw));
  assert(isModelAnswerShown(raw));
  assert.equal(scenario('igcse', raw).c.dispatch({ kind: 'check-correction' }).accepted, false);
  assert.throws(() => validateRecallAttempt(raw));
});
