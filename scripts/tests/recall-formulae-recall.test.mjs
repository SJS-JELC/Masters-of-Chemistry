import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  recallFacts,
  factsFor,
  recallCoverage,
  recallFactAliases,
} from '../../src/recall/facts.ts';
import {
  matchesRecall,
  normalizeRecallChemical,
  recallFields,
  markRecallFact,
  createRecallMarkingPolicy,
} from '../../src/recall/marking.ts';
import { createRecallProvider, recallRef } from '../../src/recall/provider.ts';
import {
  applyRecallEvidence,
  assessmentToRecallEvidence,
  createRecallSession,
  selectRecallFact,
} from '../../src/recall/scheduler.ts';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController, assessmentToEvidence } from '../../src/domain/attempt/attempt.ts';
import {
  validateRecallAttempt,
  validateRecallSession,
} from '../../src/persistence/recall-validation.ts';
import { validateAttempt } from '../../src/persistence/validation.ts';
import { rawModelResponses } from '../../src/recall/marking-fixtures.mjs';
import { CURRENT_RECALL_DEFINITION_ID } from '../../src/contracts/recall.ts';
const namespace = { course: 'igcse', profileId: 'test' };
function answers(fact, values) {
  if (!values) return rawModelResponses(fact);
  return Object.fromEntries(
    recallFields(fact).map((f, i) => [f.id, { kind: 'text', value: values[i] }]),
  );
}
function fact(id) {
  return recallFacts.find((f) => f.id === id);
}
function controller(id, attemptId = 'independent', initial) {
  const f = fact(id),
    ref = recallRef(f.course, id),
    q = createRecallProvider(recallFacts, f.course).restore(ref);
  let sample = {
    monotonicMs: 0,
    wallMs: Date.parse('2026-10-10T09:00:00Z'),
    visible: true,
    focused: true,
    suspended: false,
  };
  const state = initial ?? {
    mode: 'student',
    definitionId: CURRENT_RECALL_DEFINITION_ID,
    namespace: { ...namespace, course: f.course },
    attemptId,
    ref,
    target: { kind: 'recall', course: f.course, activityId: ref.activityId, factId: id, level: 1 },
    currentResponses: {},
    assistance: [],
    phase: 'answering',
    timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
  };
  const clock = createActiveClock({
    attemptId: state.attemptId,
    idleLimitMs: 60000,
    now: () => sample,
    ...(state.phase === 'answering' ? { saved: state.timing } : { completed: true }),
  });
  const c = createAttemptController({
    state,
    question: q,
    policy: createRecallMarkingPolicy(recallFacts),
    clock,
    sample: () => sample,
  });
  return {
    c,
    advance(ms) {
      sample = { ...sample, monotonicMs: sample.monotonicMs + ms, wallMs: sample.wallMs + ms };
      c.sample(sample);
    },
    at: () => sample.wallMs,
  };
}
test('latest source-approved records, stable starters, aliases and explicit empty coverage', () => {
  assert.equal(new Set(recallFacts.map((f) => f.course + ':' + f.id)).size, recallFacts.length);
  assert.equal(factsFor('alevel').length, 6);
  assert.equal(factsFor('igcse').length, 121);
  assert(!fact('igcse-recall-087'));
  assert(!fact('igcse-recall-088'));
  assert.equal(fact('igcse-recall-013').answer, 'solvent');
  assert.equal(fact('igcse-recall-007').answer, 'melting');
  assert.equal(recallFactAliases['igcse-ion-nitrate-charge'], 'igcse-recall-027');
  assert(fact('igcse-recall-027').gemIds.includes('fourth-16-1'));
  assert(fact('igcse-recall-027').gemIds.includes('fourth-16-2'));
  assert(recallCoverage('alevel').some((g) => !g.factIds.length));
  for (const f of recallFacts) {
    assert(f.sources.length && f.sources.every((s) => /^[a-f0-9]{64}$/.test(s.sha256)), f.id);
    assert(markRecallFact(f, answers(f)), f.id + ' model');
  }
});
test('chemical aliases preserve element case, general formula terms, counts and explicit charge', () => {
  for (const response of ['SO4^2-', 'SO₄²⁻', 'SO4 -2'])
    assert(markRecallFact(fact('igcse-recall-033'), answers(fact('igcse-recall-033'), [response])));
  for (const response of ['so4^2-', 'SO4', 'SO4^+', 'SO3^2-'])
    assert(
      !markRecallFact(fact('igcse-recall-033'), answers(fact('igcse-recall-033'), [response])),
    );
  assert.equal(normalizeRecallChemical('CnH2n+2'), 'CnH2n+2');
  for (const response of ['CnH2n+2', 'CₙH₂ₙ₊₂'])
    assert(markRecallFact(fact('igcse-recall-101'), answers(fact('igcse-recall-101'), [response])));
  assert(!markRecallFact(fact('igcse-recall-101'), answers(fact('igcse-recall-101'), ['CnH2n2+'])));
  assert(!matchesRecall('naoh', 'NaOH'));
  assert(matchesRecall('NaOH', 'NaOH'));
  assert(matchesRecall('melting.', 'Melting'));
  assert(!matchesRecall('not melting', 'Melting'));
});
test('reviewed order, pairs, exception groups and any-N require distinct correct answers', () => {
  const f = fact('igcse-recall-062'),
    a = recallFields(f).map((f) => f.answer);
  assert(markRecallFact(f, answers(f, [...a.slice(2), ...a.slice(0, 2)])));
  assert(!markRecallFact(f, answers(f, [a[0], a[3], a[2], a[1]])));
  const sol = fact('igcse-recall-084');
  const exceptions = (values) => ({
    rule: { kind: 'text', value: 'soluble' },
    exceptions: {
      kind: 'text',
      value: JSON.stringify(values.map((value, i) => ({ id: 'exception-' + i, value }))),
    },
  });
  assert(markRecallFact(sol, exceptions(['Lead', 'AgCl'])));
  for (const bad of ['Agcl', 'agcl', 'AGCL'])
    assert(!markRecallFact(sol, exceptions(['Lead', bad])));
  assert(!markRecallFact(sol, exceptions(['Silver', 'Silver chloride'])));
  const ordered = fact('igcse-recall-091');
  assert(
    !markRecallFact(
      ordered,
      answers(
        ordered,
        recallFields(ordered)
          .map((f) => f.answer)
          .reverse(),
      ),
    ),
  );
  const any = fact('igcse-recall-090');
  assert(markRecallFact(any, answers(any, ['Oiling', 'Greasing', 'Painting'])));
  assert(!markRecallFact(any, answers(any, ['Oiling', 'Oil coating', 'Painting'])));
});
test('root accepted chemistry errata and qualifiers have positive and negative marking fixtures', () => {
  const f = fact('igcse-recall-107');
  for (const good of ['C=C', 'C≡C', 'A molecule containing at least one carbon-carbon triple bond'])
    assert(markRecallFact(f, answers(f, [good])));
  for (const bad of [
    'Only single carbon-carbon bonds',
    'C=O',
    'Triple bonds cannot make a molecule unsaturated',
  ])
    assert(!markRecallFact(f, answers(f, [bad])));
  assert.match(
    fact('igcse-recall-046').answer + ' ' + fact('igcse-recall-046').context.join(' '),
    /standard atmospheric pressure/,
  );
  assert(
    markRecallFact(
      fact('igcse-recall-046'),
      answers(fact('igcse-recall-046'), ['Measure freezing point', 'Freezes at 0 degrees Celsius']),
    ),
  );
  assert(
    !markRecallFact(
      fact('igcse-recall-046'),
      answers(fact('igcse-recall-046'), ['Measure freezing point', 'Boils at 100 °C']),
    ),
  );
  assert(
    markRecallFact(
      fact('igcse-recall-113'),
      answers(fact('igcse-recall-113'), ['30 degrees Celsius']),
    ),
  );
  assert(!markRecallFact(fact('igcse-recall-113'), answers(fact('igcse-recall-113'), ['35 °C'])));
  const p = fact('igcse-recall-109');
  assert(
    markRecallFact(
      p,
      answers(p, ['Many do not biodegrade', 'Burning some can release toxic gases']),
    ),
  );
  assert(
    !markRecallFact(
      p,
      answers(p, ['Every polymer is non-biodegradable', 'All plastics release the same toxic gas']),
    ),
  );
  assert(
    !matchesRecall('does not turn blue', 'Turns blue', [], {
      kind: 'concepts',
      all: [['turns blue']],
    }),
  );
  assert(
    !matchesRecall('Turns blue and explodes', 'Turns blue', [], {
      kind: 'concepts',
      all: [['turns blue']],
    }),
  );
});
test('shared first assessment, restoration, assistance/reveal and curriculum isolation', () => {
  const { c, advance, at } = controller('igcse-recall-007');
  c.dispatch({ kind: 'respond', partId: 'answer', response: { kind: 'text', value: 'melting' } });
  for (let i = 0; i < 3; i++) advance(1000);
  const submitted = c.dispatch({ kind: 'submit', at: at() });
  assert(submitted.accepted);
  validateRecallAttempt(c.state());
  assert.throws(() => validateAttempt(c.state()));
  assert.equal(assessmentToEvidence(c.state()), null);
  const evidence = assessmentToRecallEvidence(c.state());
  assert.equal(evidence.outcome, 'correct');
  assert.equal(evidence.firstResponse.timing.activeMs, 3000);
  advance(1000);
  c.dispatch({ kind: 'respond', partId: 'answer', response: { kind: 'text', value: 'freezing' } });
  c.dispatch({ kind: 'check-correction' });
  assert.deepEqual(assessmentToRecallEvidence(c.state()), evidence);
  assert(!c.dispatch({ kind: 'submit', at: at() }).accepted);
  const resumed = controller('igcse-recall-007', 'x', c.state());
  assert.deepEqual(assessmentToRecallEvidence(resumed.c.state()), evidence);
  const draft = controller('igcse-recall-007', 'draft');
  draft.c.dispatch({
    kind: 'respond',
    partId: 'answer',
    response: { kind: 'text', value: 'melt' },
  });
  draft.advance(1000);
  const restored = controller('igcse-recall-007', 'draft', draft.c.checkpoint());
  assert.equal(restored.c.state().attemptId, 'draft');
  assert.equal(restored.c.state().currentResponses.answer.value, 'melt');
  assert.equal(restored.c.state().timing.activeMs, 1000);
  const assisted = controller('igcse-recall-007', 'assisted');
  assisted.c.dispatch({
    kind: 'assist',
    assistance: { kind: 'hint', supportId: 'test-hint', at: assisted.at() },
  });
  assisted.c.dispatch({
    kind: 'respond',
    partId: 'answer',
    response: { kind: 'text', value: 'melting' },
  });
  assisted.c.dispatch({ kind: 'submit', at: assisted.at() });
  assert.equal(assessmentToRecallEvidence(assisted.c.state()).outcome, 'assisted');
  const reveal = controller('igcse-recall-007', 'reveal');
  reveal.c.dispatch({
    kind: 'assist',
    assistance: { kind: 'reveal', supportId: 'answer', at: reveal.at() },
  });
  assert.equal(assessmentToRecallEvidence(reveal.c.state()).outcome, 'revealed');
  assert.equal(
    assessmentToRecallEvidence({
      mode: 'teacher',
      ref: recallRef('igcse', 'igcse-recall-007'),
      currentResponses: {},
    }),
    null,
  );
});
test('both courses use1/3/7/14/30; one advance per London day, wrong immediately, no assisted success', () => {
  const { c, at } = controller('igcse-recall-007');
  c.dispatch({ kind: 'respond', partId: 'answer', response: { kind: 'text', value: 'melting' } });
  c.dispatch({ kind: 'submit', at: at() });
  const e = assessmentToRecallEvidence(c.state());
  let p = applyRecallEvidence(undefined, e);
  assert.equal(p.stage, 1);
  assert.equal(p.dueAt - e.completedAt, 86400000);
  assert.deepEqual(applyRecallEvidence(p, e), p);
  p = applyRecallEvidence(p, { ...e, id: 'same-day', completedAt: e.completedAt + 1000 });
  assert.equal(p.stage, 1);
  p = applyRecallEvidence(p, {
    ...e,
    id: 'wrong',
    outcome: 'wrong',
    completedAt: e.completedAt + 2000,
  });
  assert.equal(p.stage, 0);
  assert.equal(p.dueAt, e.completedAt + 2000);
  p = applyRecallEvidence(p, {
    ...e,
    id: 'same-day-after-wrong',
    completedAt: e.completedAt + 3000,
  });
  assert.equal(p.stage, 0);
  for (const [i, d] of [1, 3, 7, 14, 30].entries()) {
    p = applyRecallEvidence(p, {
      ...e,
      id: 'day-' + i,
      completedAt: Math.max(p.dueAt, p.lastCompletedAt + 86400000),
    });
    assert.equal(p.stage, i + 1);
    assert.equal(p.dueAt - p.lastCompletedAt, d * 86400000);
  }
  const same = {
    ...e,
    namespace: { course: 'alevel', profileId: 'test' },
    factId: 'electron-shell-capacities',
  };
  assert.equal(applyRecallEvidence(undefined, same).stage, 1);
  assert.equal(
    applyRecallEvidence(p, {
      ...e,
      id: 'revealed',
      outcome: 'revealed',
      completedAt: p.lastCompletedAt + 1000,
    }).stage,
    0,
  );
  const session = createRecallSession(
    namespace,
    'whole',
    'recall-practice',
    factsFor('igcse', ['fourth-16-1']).map((f) => f.id),
    ['fourth-16-1'],
  );
  validateRecallSession(session);
  assert.throws(() => validateRecallSession({ ...session, factIds: session.factIds.slice(1) }));
  assert(session.factIds.includes('igcse-recall-027'));
  const revision = { ...session, kind: 'recall-revision', visitedFactIds: session.factIds };
  assert.equal(selectRecallFact(revision, [], at()), null);
});

test('scheduler regression: successes respect due intervals and preserve due time when not advancing', () => {
  const day = 86400000;
  const start = Date.parse('2026-10-10T09:00:00Z');
  for (const course of ['igcse', 'alevel']) {
    const evidence = {
      kind: 'recall',
      id: course + '-first',
      namespace: { course, profileId: 'scheduler-fix' },
      factId: course + '-fixture',
      completedAt: start,
      outcome: 'correct',
    };
    let p = applyRecallEvidence(undefined, evidence);
    assert.equal(p.stage, 1, course + ' initial success');
    const firstDue = p.dueAt;
    p = applyRecallEvidence(p, {
      ...evidence,
      id: course + '-same-day',
      completedAt: start + 1000,
    });
    assert.equal(p.stage, 1, course + ' same-day stage');
    assert.equal(p.dueAt, firstDue, course + ' same-day success must preserve dueAt');
    p = applyRecallEvidence(p, { ...evidence, id: course + '-first-due', completedAt: firstDue });
    assert.equal(p.stage, 2, course + ' due-date advancement');
    const secondDue = p.dueAt;
    assert.equal(secondDue, firstDue + 3 * day, course + ' second interval');
    p = applyRecallEvidence(p, {
      ...evidence,
      id: course + '-next-day-early',
      completedAt: firstDue + day,
    });
    assert.equal(p.stage, 2, course + ' next London day before due must not advance');
    assert.equal(p.dueAt, secondDue, course + ' early success must preserve dueAt');
    p = applyRecallEvidence(p, {
      ...evidence,
      id: course + '-still-early',
      completedAt: secondDue - 1,
    });
    assert.equal(p.stage, 2, course + ' one millisecond before due');
    assert.equal(p.dueAt, secondDue, course + ' repeated early success must preserve dueAt');
    p = applyRecallEvidence(p, { ...evidence, id: course + '-second-due', completedAt: secondDue });
    assert.equal(p.stage, 3, course + ' exact due timestamp advances');
    assert.equal(p.dueAt, secondDue + 7 * day, course + ' third interval');
    for (const outcome of ['wrong', 'assisted', 'revealed']) {
      const failureAt = secondDue + 1000;
      const failed = applyRecallEvidence(p, {
        ...evidence,
        id: course + '-' + outcome,
        completedAt: failureAt,
        outcome,
      });
      assert.equal(failed.stage, 0, course + ' ' + outcome + ' resets stage');
      assert.equal(failed.dueAt, failureAt, course + ' ' + outcome + ' immediately due');
      const corrected = applyRecallEvidence(failed, {
        ...evidence,
        id: course + '-' + outcome + '-same-day-success',
        completedAt: failureAt + 1000,
      });
      assert.equal(
        corrected.stage,
        0,
        course + ' same-day success after ' + outcome + ' must not advance',
      );
      assert.equal(
        corrected.dueAt,
        failureAt,
        course + ' same-day success after ' + outcome + ' must retain immediate due time',
      );
      const nextDay = applyRecallEvidence(corrected, {
        ...evidence,
        id: course + '-' + outcome + '-next-day-success',
        completedAt: secondDue + day,
      });
      assert.equal(nextDay.stage, 1, course + ' following day restarts first interval');
      assert.equal(nextDay.dueAt, secondDue + 2 * day, course + ' restart interval');
    }
  }
});
