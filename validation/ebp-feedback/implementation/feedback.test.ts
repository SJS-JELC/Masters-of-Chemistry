import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import ts from '../../../node_modules/typescript/lib/typescript.js';
import { propertiesBank } from '../../../src/activities/alevel/explaining-properties/bank.ts';
import { propertiesProvider, correctionSegments } from '../../../src/activities/alevel/explaining-properties/provider.ts';
import { propertiesMarking } from '../../../src/activities/alevel/explaining-properties/marking.ts';
import { createAttemptController, assessmentToEvidence } from '../../../src/domain/attempt/attempt.ts';
import { createActiveClock } from '../../../src/domain/timing/active-clock.ts';
import { restoreCheckedFeedback } from '../../../src/ui/current-feedback.ts';
import { questionActionState } from '../../../src/ui/action-state.ts';
import type { Responses, StudentAttempt } from '../../../src/contracts/index.ts';

const git = 'C:/Users/JELC/AppData/Local/GitHubDesktop/app-3.6.6/resources/app/git/cmd/git.exe';
const source = 'src/activities/alevel/explaining-properties/provider.ts';
const oldSource = execFileSync(git, ['show', `HEAD:${source}`], { encoding: 'utf8' });
// Resolve baseline imports against the original provider directory.
const baselineJavascript = ts.transpileModule(oldSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  .replace(/from '([^']+)'/g, (_match, relative) => `from ${JSON.stringify(new URL(relative, new URL(`../../../${source}`, import.meta.url)).href)}`);
const baseline = await import(`data:text/javascript;base64,${Buffer.from(baselineJavascript).toString('base64')}`);
const answers = (record: typeof propertiesBank[number], wrong = false): Responses => record.format === 'gaps'
  ? Object.fromEntries(record.answers.map((accepted, i) => [`gap-${i}`, { kind: 'text', value: wrong ? 'wrong response' : accepted[0] }]))
  : { correction: { kind: 'correction', selections: [correctionSegments(record)[record.errorIndex!]!], replacement: wrong ? 'wrong replacement' : record.answers[0]![0]! } };
const sample = (ms: number) => ({ monotonicMs: ms, wallMs: 1_000_000 + ms, visible: true, focused: true, suspended: false });

test('all 32 semantic parts, IDs, answers, chemistry context, provenance and marking equal the pre-change provider', () => {
  assert.equal(propertiesBank.length, 32);
  for (const record of propertiesBank) {
    const ref = propertiesProvider.resolveLink(record.code)!;
    const current = propertiesProvider.restore(ref), old = baseline.propertiesProvider.restore(ref);
    for (const key of ['ref', 'parts', 'sentenceTokens', 'workedAnswer', 'sources', 'submission', 'scaffolds'])
      assert.deepEqual((current as any)[key], old[key], `${record.code}: ${key}`);
    assert.deepEqual(current.context, record.context);
    assert.deepEqual(current.hints, []);
    for (const wrong of [false, true]) assert.deepEqual(propertiesMarking.mark(current, answers(record, wrong)), propertiesMarking.mark(old, answers(record, wrong)));
  }
});

test('checked retries restore display; unchecked edits stay neutral; first marks, assistance and time stay immutable for all 32', () => {
  for (const record of propertiesBank) {
    const ref = propertiesProvider.resolveLink(record.code)!, question = propertiesProvider.restore(ref);
    let now = 0;
    const clock = createActiveClock({ attemptId: record.code, idleLimitMs: 180000, now: () => sample(now) });
    const initial: StudentAttempt = { mode: 'student', namespace: { course: 'alevel', profileId: 'test' }, attemptId: record.code,
      ref, target: { course: 'alevel', activityId: ref.activityId, gemId: 'l6-t2-1-properties', level: record.level },
      currentResponses: {}, assistance: [], phase: 'answering', timing: clock.checkpoint()! };
    const controller = createAttemptController({ question, policy: propertiesMarking, clock, state: initial, sample: () => sample(now) });
    const respond = (values: Responses) => Object.entries(values).forEach(([partId, response]) => assert(controller.dispatch({ kind: 'respond', partId, response }).accepted));
    respond(answers(record, true)); now = 1500; assert(controller.dispatch({ kind: 'submit', at: 1_001_500 }).accepted);
    const first = structuredClone(controller.state()) as Extract<StudentAttempt, { phase: 'assessed' }>;
    const evidence = assessmentToEvidence(first);
    respond(answers(record));
    assert.equal(restoreCheckedFeedback(question, structuredClone(controller.state()), propertiesMarking), undefined);
    const checked = controller.dispatch({ kind: 'check-correction' }); assert(checked.accepted);
    assert.equal(checked.correctionFeedback?.status, 'correct');
    const restored = structuredClone(controller.state());
    const display = restoreCheckedFeedback(question, restored, propertiesMarking);
    assert.equal(display?.status, 'correct'); assert(questionActionState(restored, display).currentCorrect);
    assert.deepEqual(assessmentToEvidence(restored), evidence);
    assert.deepEqual((restored as any).firstResponse, first.firstResponse);
    assert.deepEqual((restored as any).firstAssessment, first.firstAssessment);
    respond(answers(record, true)); const wrong = controller.dispatch({ kind: 'check-correction' }); assert(wrong.accepted);
    assert.equal(wrong.correctionFeedback?.status, 'wrong');
    assert(!questionActionState(structuredClone(controller.state()), undefined).currentCorrect);
    assert.deepEqual(assessmentToEvidence(controller.state()), evidence);
  }
});
