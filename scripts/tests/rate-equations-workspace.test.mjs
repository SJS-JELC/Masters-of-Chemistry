import test from 'node:test';
import assert from 'node:assert/strict';
import { isRateGraphWorkspaceState, supportsRateGraphWorkspace } from '../../src/contracts/workspace.ts';
import { defaultRateGraphWorkspace, restoreRateGraphWorkspace, rateGraphValueAt } from '../../src/activities/alevel/rate-equations/workspace-state.ts';
import { restoreRateExample } from '../../src/activities/alevel/rate-equations/provider.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { createAttemptController, assessmentToEvidence } from '../../src/domain/attempt/attempt.ts';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { validateAttempt, validateWrite } from '../../src/persistence/validation.ts';
const at = 1791763200000;
const ref = (gem = 'graphs', level = 2, seed = 7) => ({ activityId: 'alevel/rate-equations', questionId: `RATE-POC-${gem}-L${level}`, level, seed });
function fixture(saved) {
  const example = restoreRateExample(saved?.ref ?? ref());
  let time = 0;
  const sample = () => ({ wallMs: at + time, monotonicMs: time, visible: true, focused: true, suspended: false });
  const attemptId = saved?.attemptId ?? 'workspace-unit-attempt';
  const clock = createActiveClock({ attemptId, idleLimitMs: 300000, now: sample,
    ...(saved?.phase === 'answering' ? { saved: saved.timing } : saved ? { completed: true } : {}) });
  const state = saved ?? { mode: 'student', namespace: { course: 'alevel', profileId: 'workspace-unit' }, attemptId,
    ref: example.question.ref, target: { course: 'alevel', activityId: ref().activityId, gemId: 'u6-t1-2-graphs', level: example.question.ref.level },
    phase: 'answering', currentResponses: {}, assistance: [], timing: clock.checkpoint() };
  const controller = createAttemptController({ question: example.question, state, policy: rateMarking, clock, sample });
  return { example, controller, advance: ms => { time += ms; }, sample, clock };
}
const workspace = { kind: 'rate-graph-tools', marker: 40, extended: false, readings: [{ x: 60, y: .07 }, { x: 120, y: .035 }] };
test('minimal graph state rejects non-finite, injected, missing and malformed fields', () => {
  assert(isRateGraphWorkspaceState(workspace));
  const sparse = new Array(2);
  for (const bad of [null, {}, { ...workspace, marker: NaN }, { ...workspace, marker: Infinity },
    { ...workspace, marker: -1 }, { ...workspace, marker: 1e10 }, { ...workspace, extended: 1 },
    { ...workspace, readings: [null] }, { ...workspace, readings: sparse },
    { ...workspace, readings: [undefined, null] }, { ...workspace, readings: [{ x: 1, y: 2, score: 1 }, null] },
    { ...workspace, readings: [{ x: -1, y: 2 }, null] }, { ...workspace, readings: [{ x: 1, y: Infinity }, null] },
    { ...workspace, score: 1 }, { ...workspace, curve: [1, 2] }]) assert(!isRateGraphWorkspaceState(bad));
  assert(supportsRateGraphWorkspace(ref()));
  assert(!supportsRateGraphWorkspace(ref('orders')));
  assert(!supportsRateGraphWorkspace({ ...ref(), activityId: 'alevel/acid-base-calculations' }));
  assert(!supportsRateGraphWorkspace({ ...ref(), questionId: 'RATE-POC-graphs-L1' }));
});
test('graph restoration clamps coordinates and recomputes pins in underlying analytical units', () => {
  for (const level of [1, 2, 3]) for (const seed of [0, 1, 7, 42, 2026]) {
    const graph = restoreRateExample(ref('graphs', level, seed)).graph;
    const restored = restoreRateGraphWorkspace(graph, { ...workspace, marker: 1e8, extended: true,
      readings: [{ x: 1e8, y: 123 }, { x: graph.maxTime / 2, y: -123 }] });
    assert.equal(restored.marker, graph.maxTime);
    assert.equal(restored.extended, false);
    assert.equal(restored.readings[0].x, graph.maxTime);
    assert.equal(restored.readings[1].y, rateGraphValueAt(graph, graph.maxTime / 2));
    assert.equal(defaultRateGraphWorkspace(graph).marker, graph.initialMarker);
    assert.deepEqual(defaultRateGraphWorkspace(graph).readings, [null, null]);
  }
  const graph = restoreRateExample(ref('arrhenius', 3)).graph;
  const extended = restoreRateGraphWorkspace(graph, { ...workspace, marker: 0, extended: true });
  assert.equal(extended.marker, 0);
  assert.deepEqual(extended.readings, [null, null]);
  assert.equal(rateGraphValueAt(graph, extended.marker), graph.intercept);
  assert.equal(restoreRateGraphWorkspace(graph, { ...extended, extended: false }).marker, graph.minX);
  assert.deepEqual(restoreRateGraphWorkspace(graph, { ...workspace, marker: NaN }), defaultRateGraphWorkspace(graph));
});
test('controller checkpoint JSON roundtrip restores same ID, controls and answering clock', () => {
  const f = fixture();
  f.advance(1000);
  assert(f.controller.dispatch({ kind: 'workspace', workspace }).accepted);
  assert.deepEqual(f.controller.state().currentResponses, {});
  assert.equal(assessmentToEvidence(f.controller.state()), null);
  const saved = JSON.parse(JSON.stringify(f.controller.checkpoint()));
  validateAttempt(saved);
  validateWrite({ attempt: saved });
  const restored = fixture(saved).controller.state();
  assert.equal(restored.attemptId, saved.attemptId);
  assert.deepEqual(restored.workspace, workspace);
  assert.equal(restored.timing.activeMs, 1000);
  assert.deepEqual(restored.currentResponses, {});
  for (const value of [{ ...saved, workspace: { ...workspace, score: 1 } },
    { ...saved, workspace: { ...workspace, marker: null } },
    { ...saved, workspace: { ...workspace, readings: [null, { x: 2, y: 'x' }] } }]) assert.throws(() => validateAttempt(value));
});
test('workspace edits cannot submit, mutate first evidence or alter correction presentation', () => {
  const f = fixture();
  f.controller.dispatch({ kind: 'workspace', workspace });
  assert.equal(f.controller.dispatch({ kind: 'submit', at }).accepted, false);
  for (const [partId, response] of Object.entries(f.example.correctResponses)) f.controller.dispatch({ kind: 'respond', partId, response });
  f.advance(2000);
  assert(f.controller.dispatch({ kind: 'submit', at: at + 2000 }).accepted);
  const first = f.controller.state();
  const evidence = assessmentToEvidence(first);
  assert.equal(evidence.score, 1);
  assert(!('workspace' in first.firstResponse));
  f.advance(4000);
  f.controller.dispatch({ kind: 'workspace', workspace: { ...workspace, marker: 90 } });
  const after = f.controller.checkpoint();
  assert.deepEqual(after.firstResponse, first.firstResponse);
  assert.deepEqual(after.firstAssessment, first.firstAssessment);
  assert.deepEqual(assessmentToEvidence(after), evidence);
  assert(!('currentResponseChanged' in after));
  assert.equal(f.clock.checkpoint().finished, true);
  validateWrite({ attempt: after, evidence: assessmentToEvidence(after) });
  const [partId, response] = Object.entries(f.example.correctResponses)[0];
  f.controller.dispatch({ kind: 'respond', partId, response: { ...response, raw: '0' } });
  assert(f.controller.state().currentResponseChanged);
  f.controller.dispatch({ kind: 'workspace', workspace: { ...workspace, marker: 100 } });
  assert(f.controller.state().currentResponseChanged);
  assert.deepEqual(assessmentToEvidence(f.controller.state()), evidence);
});
test('workspace command validates ownership and payload before accepting a checkpoint', () => {
  const f = fixture();
  assert(!f.controller.dispatch({ kind: 'workspace', workspace: { ...workspace, marker: NaN } }).accepted);
  assert(!f.controller.state().workspace);
  const example = restoreRateExample(ref('orders', 1));
  const clock = createActiveClock({ attemptId: 'other', idleLimitMs: 300000, now: f.sample });
  const c = createAttemptController({ question: example.question, clock, policy: rateMarking, sample: f.sample,
    state: { ...f.controller.state(), attemptId: 'other', ref: example.question.ref,
      target: { course: 'alevel', activityId: ref().activityId, gemId: 'u6-t1-2-orders', level: 1 }, timing: clock.checkpoint() } });
  assert(!c.dispatch({ kind: 'workspace', workspace }).accepted);
  assert.throws(() => validateAttempt({ ...c.state(), workspace }));
  assert.throws(() => validateAttempt({ ...f.controller.state(), mode: 'teacher', workspace }));
});
test('meaningful workspace changes resume an idle clock and new attempts start clean', () => {
  const f = fixture();
  f.advance(6000); f.controller.sample(f.sample()); // suspension closes the old interval
  f.controller.dispatch({ kind: 'workspace', workspace });
  f.advance(1000); f.controller.sample(f.sample());
  assert.equal(f.controller.state().timing.activeMs, 1000);
  const fresh = fixture().controller.state();
  assert(!('workspace' in fresh));
  assert.deepEqual(fresh.currentResponses, {});
  assert.equal(fresh.timing.activeMs, 0);
});
