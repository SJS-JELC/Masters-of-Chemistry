import test from 'node:test';
import assert from 'node:assert/strict';
import { questionActionState, responseFingerprint } from '../../../../src/ui/action-state.ts';
import { createNumericScenario } from '../../../s1/attempt/scenarios.ts';
import { assessmentToEvidence } from '../../../../src/domain/attempt/attempt.ts';

const sample = () => ({ monotonicMs: 1000, wallMs: 100000, visible: true, focused: true, suspended: false });
const answer = raw => ({ kind: 'respond', partId: 'ph', response: { kind: 'numeric', raw, unit: '' } });
const submit = { kind: 'submit', at: 100000 };
const reveal = { kind: 'assist', assistance: { kind: 'reveal', supportId: 'worked-answer', at: 100000 } };
const ui = (controller, correction) => questionActionState(controller.state(), correction);

test('initial/invalid/wrong/correction/correct/edit/Clear availability and immutable first evidence', () => {
  const { controller } = createNumericScenario(sample);
  assert.equal(ui(controller).primary, 'check');
  assert.equal(ui(controller).nextEnabled, false);
  assert.equal(controller.dispatch(submit).accepted, false);
  assert.equal(ui(controller).nextEnabled, false);
  controller.dispatch(answer('3'));
  controller.dispatch(submit);
  const evidence = assessmentToEvidence(controller.state());
  const frozen = structuredClone(controller.state().firstResponse);
  assert.equal(ui(controller).nextEnabled, true);
  assert.equal(ui(controller).primary, 'check');
  controller.dispatch(answer('2'));
  const correction = controller.dispatch({ kind: 'check-correction' });
  assert.equal(ui(controller, correction.correctionFeedback).primary, 'next');
  assert.deepEqual(assessmentToEvidence(controller.state()), evidence);
  controller.dispatch(answer('3'));
  assert.equal(ui(controller).primary, 'check');
  assert.equal(controller.dispatch({ kind: 'clear' }).accepted, true);
  assert.deepEqual(controller.state().currentResponses, {});
  assert.equal(ui(controller).nextEnabled, true);
  assert.equal(ui(controller).primary, 'check');
  assert.deepEqual(controller.state().firstResponse, frozen);
  assert.deepEqual(assessmentToEvidence(controller.state()), evidence);
  assert.equal(questionActionState(controller.state(), undefined, {canNext:false}).nextEnabled, false);
});

test('correct first result highlights Next; edit/reverting/Clear require a current correction', () => {
  const { controller } = createNumericScenario(sample);
  controller.dispatch({kind:'clear'});
  controller.dispatch(answer('2'));
  controller.dispatch(submit);
  assert.equal(ui(controller).primary, 'next');
  const first = structuredClone(controller.state().firstAssessment);
  controller.dispatch(answer('3'));
  controller.dispatch(answer('2'));
  assert.equal(ui(controller).primary, 'check');
  controller.dispatch({kind:'clear'});
  assert.equal(ui(controller).primary, 'check');
  assert.deepEqual(controller.state().firstAssessment, first);
});

test('Give Up, learning correction after reveal, Clear and restore never fabricate independent evidence', () => {
  const { controller } = createNumericScenario(sample);
  controller.dispatch(reveal);
  assert.equal(ui(controller).primary, 'next');
  assert.equal(ui(controller).nextEnabled, true);
  assert.equal(assessmentToEvidence(controller.state()), null);
  const first = structuredClone(controller.state().firstAssessment);
  controller.dispatch(answer('2'));
  assert.equal(ui(controller).primary, 'check');
  const correction = controller.dispatch({kind:'check-correction'});
  assert.equal(ui(controller, correction.correctionFeedback).primary, 'next');
  controller.dispatch({kind:'assist',assistance:{...reveal.assistance,kind:'worked-answer'}});
  assert.equal(ui(controller).primary, 'next');
  controller.dispatch({kind:'clear'});
  assert.equal(ui(controller).primary, 'check');
  const restored = createNumericScenario(sample, structuredClone(controller.state()));
  assert.equal(ui(restored.controller).primary, 'check');
  assert.deepEqual(restored.controller.state().firstAssessment, first);
  assert.equal(assessmentToEvidence(restored.controller.state()), null);
});

test('post-assessment Give Up preserves first result and earned Next access', () => {
  const { controller } = createNumericScenario(sample);
  controller.dispatch(answer('3')); controller.dispatch(submit);
  const evidence = assessmentToEvidence(controller.state());
  controller.dispatch({kind:'assist',assistance:{...reveal.assistance,kind:'worked-answer'}});
  assert.equal(ui(controller).primary, 'next');
  assert.deepEqual(assessmentToEvidence(controller.state()), evidence);
  controller.dispatch({kind:'clear'});
  assert.equal(ui(controller).nextEnabled, true);
  assert.deepEqual(assessmentToEvidence(controller.state()), evidence);
});

test('staged review and preview disable all four footer actions; legacy first comparison is stable', () => {
  const { controller } = createNumericScenario(sample);
  controller.dispatch(answer('2')); controller.dispatch(submit);
  const base = controller.state();
  for (const phase of ['rubric-review','drawing-review']) {
    const state = {...base,phase,firstAssessment:undefined};
    const actions = questionActionState(state, undefined);
    assert.deepEqual([actions.checkEnabled,actions.clearEnabled,actions.giveUpEnabled,actions.nextEnabled], [false,false,false,false]);
  }
  const preview = questionActionState({mode:'teacher',ref:base.ref,currentResponses:{}}, undefined);
  assert.deepEqual([preview.checkEnabled,preview.clearEnabled,preview.giveUpEnabled,preview.nextEnabled], [false,false,false,false]);
  assert.equal(responseFingerprint({b:2,a:1}), responseFingerprint({a:1,b:2}));
});
