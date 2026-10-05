import test from 'node:test';
import assert from 'node:assert/strict';
import { createNumericScenario } from '../../s1/attempt/scenarios.ts';
import { assessmentToEvidence, transitionAttempt } from '../../../src/domain/attempt/attempt.ts';
import { validateAttempt } from '../../../src/persistence/validation.ts';
// Synthetic S1 fixture: valid registry identity for schema checks only; nothing is stored.
const validateShape = state => validateAttempt({ ...state, ref: { ...state.ref, questionId: 'AB-00068J' } });

function setup() {
  let ms = 0;
  const sample = () => ({ monotonicMs: ms, wallMs: 100000 + ms, visible: true, focused: true, suspended: false });
  const scenario = createNumericScenario(sample);
  const command = value => scenario.controller.dispatch(value);
  return { ...scenario, command, sample, advance: value => { ms = value; },
    respond: raw => command({ kind: 'respond', partId: 'ph', response: { kind: 'numeric', raw, unit: '' } }),
    submit: () => command({ kind: 'submit', at: sample().wallMs }),
    giveUp: () => command({ kind: 'assist', assistance: { kind: 'reveal', supportId: 'ui-give-up', at: sample().wallMs } }) };
}
test('clear answering empties editable responses while retaining attempt/time/assistance', () => {
  const s = setup(); s.advance(1000); s.respond('3');
  s.command({ kind: 'assist', assistance: { kind: 'hint', supportId: 'equation', at: s.sample().wallMs } });
  const before = structuredClone(s.controller.state());
  const cleared = s.command({ kind: 'clear' });
  assert.equal(cleared.accepted, true); assert.deepEqual(cleared.state.currentResponses, {});
  assert.equal(cleared.state.attemptId, before.attemptId); assert.deepEqual(cleared.state.assistance, before.assistance);
  assert.deepEqual(cleared.state.timing, before.timing); assert.equal(cleared.state.phase, 'answering');
  assert.equal(cleared.state.currentResponseChanged, undefined);
  validateShape(cleared.state);
  assert.equal(s.submit().accepted, false);
});
for (const raw of ['3', '2']) test(`clear after first ${raw === '2' ? 'correct' : 'wrong'} result preserves exact evidence across reload`, () => {
  const s = setup(); s.advance(1000); s.respond(raw); assert.equal(s.submit().accepted, true);
  const before = assessmentToEvidence(s.controller.state());
  s.advance(2000); const cleared = s.command({ kind: 'clear' });
  assert.equal(cleared.accepted, true); assert.equal(cleared.state.currentResponseChanged, true);
  assert.deepEqual(assessmentToEvidence(cleared.state), before); validateShape(cleared.state);
  const restored = createNumericScenario(s.sample, structuredClone(cleared.state));
  assert.deepEqual(assessmentToEvidence(restored.controller.state()), before);
  assert.equal(restored.controller.state().currentResponseChanged, true);
  s.respond('2'); assert.equal(s.command({ kind: 'check-correction' }).correctionFeedback.status, 'correct');
  assert.deepEqual(assessmentToEvidence(s.controller.state()), before);
});
test('blank Give Up followed by Clear stays distinct after reload and never creates evidence', () => {
  const s = setup(); s.advance(1000); const given = s.giveUp();
  assert.equal(given.accepted, true); assert.equal(given.state.currentGiveUp, true); validateShape(given.state);
  assert.equal(assessmentToEvidence(given.state), null);
  const first = structuredClone(given.state.firstResponse), assessment = structuredClone(given.state.firstAssessment);
  const cleared = s.command({ kind: 'clear' });
  assert.equal(cleared.state.currentGiveUp, undefined); assert.equal(cleared.state.currentResponseChanged, true);
  validateShape(cleared.state);
  const restored = createNumericScenario(s.sample, structuredClone(cleared.state)).controller.state();
  assert.deepEqual(restored.firstResponse, first); assert.deepEqual(restored.firstAssessment, assessment);
  assert.equal(restored.currentGiveUp, undefined); assert.equal(assessmentToEvidence(restored), null);
  const repeated = s.giveUp();
  assert.equal(repeated.state.currentGiveUp, true); assert.equal(repeated.state.assistance.length, given.state.assistance.length);
  assert.deepEqual(repeated.state.firstResponse, first); assert.deepEqual(repeated.state.firstAssessment, assessment);
});
test('post-assessment Give Up and edited-back response do not mutate first score or stale action flags', () => {
  const s = setup(); s.advance(1000); s.respond('2'); s.submit();
  const first = assessmentToEvidence(s.controller.state());
  s.respond('3'); s.respond('2'); assert.equal(s.controller.state().currentResponseChanged, true);
  s.command({ kind: 'assist', assistance: { kind: 'worked-answer', supportId: 'worked', at: s.sample().wallMs } });
  assert.equal(s.controller.state().currentGiveUp, true);
  s.respond('2'); assert.equal(s.controller.state().currentGiveUp, undefined);
  assert.deepEqual(assessmentToEvidence(s.controller.state()), first); validateShape(s.controller.state());
});
test('clear refuses required staged review and rejects forged persistence markers', () => {
  const s = setup();
  for (const phase of ['rubric-review', 'drawing-review']) {
    const state = { ...s.controller.state(), phase };
    const result = transitionAttempt({ question: s.question, state, command: { kind: 'clear' }, policy: {}, sample: s.sample() });
    assert.equal(result.accepted, false); assert.equal(result.state, state);
  }
  assert.throws(() => validateShape({ ...s.controller.state(), currentResponseChanged: true }));
  assert.throws(() => validateShape({ ...s.controller.state(), currentGiveUp: true }));
});
