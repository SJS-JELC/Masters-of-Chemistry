import type { ClockSample, StudentAttempt } from '../../../../../../src/contracts/attempt.ts';
import type { MarkingPolicy, Question } from '../../../../../../src/contracts/question.ts';
import { createActiveClock } from '../../../../../../src/domain/timing/active-clock.ts';
import { createAttemptController } from '../../../../../../src/domain/attempt/attempt.ts';
import { parseScientificNumber } from '../../../../../../src/domain/attempt/input-checks.ts';

/** Development-only fixture; never registered as curriculum content. Browser host passes real sample. */
export const numericQuestion: Question = {
  ref: { activityId: 'alevel/acid-base-calculations', questionId: 'S1-synthetic-numeric', seed: 1, level: 1 },
  title: 'Foundation numeric response', context: [], layout: 'compact', submission: 'all-required-parts',
  parts: [{ id: 'ph', kind: 'numeric', prompt: [{ kind: 'text', text: 'For [H⁺] = 0.0100 mol dm⁻³, calculate pH.' }],
    marks: 1, required: true, dependsOn: [], unit: '', acceptance: { kind: 'absolute', expected: 2, tolerance: 0.0051 } }],
  scaffolds: [], hints: [{ id: 'equation', content: [{ kind: 'formula', text: 'pH = −log₁₀[H⁺]' }] }],
  workedAnswer: [{ kind: 'formula', text: 'pH = 2.00' }], sources: [],
};
export const numericPolicy: MarkingPolicy = {
  id: 'S1-synthetic-numeric',
  mark(question,responses) {
    const points = question.parts.map(part => {
      const response = responses[part.id];
      const correct = part.kind === 'numeric' && part.acceptance.kind === 'absolute' && response?.kind === 'numeric'
        && Math.abs(parseScientificNumber(response.raw)-part.acceptance.expected) <= part.acceptance.tolerance;
      return { partId: part.id, pointId: part.id, earned: correct ? part.marks : 0, available: part.marks, message: correct ? 'Correct.' : 'Review the calculation.' };
    });
    return { accepted: true, marks: { points, earned: points.reduce((n,p) => n+p.earned,0), available: points.reduce((n,p) => n+p.available,0) } };
  },
  masteryScore: marks => marks.earned === marks.available ? 1 : marks.earned ? 0.5 : 0,
};
export function answeringState(question: Question = numericQuestion, attemptId = 'S1-synthetic-attempt'): StudentAttempt {
  if (question.ref.activityId !== 'alevel/acid-base-calculations') throw new Error('Use explicit source-owned targets for other activities.');
  return { mode: 'student', namespace: { course: 'alevel', profileId: 'S1-synthetic' }, attemptId,
    ref: { ...question.ref, activityId: 'alevel/acid-base-calculations' },
    target: { course: 'alevel', activityId: 'alevel/acid-base-calculations', gemId: 'u6-t1-1-2', level: question.ref.level },
    phase: 'answering', currentResponses: {}, assistance: [], timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false } };
}
export function createNumericScenario(sample: () => ClockSample, restored?: StudentAttempt) {
  const state = restored ?? answeringState();
  const clock = createActiveClock({ attemptId: state.attemptId, idleLimitMs: 60000, now: sample,
    ...(state.phase === 'answering' ? { saved: state.timing } : { completed: true,
      saved: { ...state.firstResponse.timing, attemptId: state.attemptId, finished: true } }) });
  return { question: numericQuestion, clock,
    controller: createAttemptController({ question: numericQuestion, state, policy: numericPolicy, clock, sample }) };
}
