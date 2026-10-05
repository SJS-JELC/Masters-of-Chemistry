/** Compile-only negative assertions; never imported by browser/runtime tests. */
import type { ActiveClock, ClockSample, CorrectionFeedback, DrawingSelfCheck, PreviewAttempt, StudentAttempt } from '../../../src/contracts/attempt.ts';
import type { EditorSubmissionCheck } from '../../../src/contracts/editors.ts';
import type { MarkingPolicy, Question, QuestionPart } from '../../../src/contracts/question.ts';
import { createAttemptController } from '../../../src/domain/attempt/attempt.ts';

declare const clock: ActiveClock;
declare const sample: () => ClockSample;
declare const preview: PreviewAttempt;
declare const question: Question;
declare const policy: MarkingPolicy;
declare const attempt: StudentAttempt;

// @ts-expect-error Preview cannot enter the student controller and persistence path.
createAttemptController({ question, state: preview, policy, clock, sample });
// @ts-expect-error Curriculum has no speculative per-part grading mode.
export const staged: Question = { ...question, submission: 'dependency-steps' };
// @ts-expect-error Response dependency is a reference, never an assessment gate.
export const gated: QuestionPart = { id: 'a', kind: 'text', prompt: [], marks: 1, required: true, accepted: [], normalization: 'exact', dependsOn: [{ partId: 'b', condition: 'correct' }] };
// @ts-expect-error Chemical errors are compatible with ready input; not malformed payload status.
export const wrongIntegrity: EditorSubmissionCheck = { status: 'malformed', chemicalIssues: [] };
// @ts-expect-error Drawing self-review needs its explicit model content and criteria.
export const unmodelledDrawing: QuestionPart = { id: 'drawing', kind: 'drawing-self-check', prompt: [], marks: 1, required: true, dependsOn: [] };
// @ts-expect-error A drawing pass is not explanation evidence-linked rubric marking.
export const drawingTick: DrawingSelfCheck = { partId: 'drawing', judgement: 'met' };
export function prematureScore(): number | null {
  if (attempt.phase === 'drawing-review') {
    // @ts-expect-error No aggregate independent score exists until the source drawing confirmation.
    return attempt.firstAssessment.score;
  }
  return null;
}
// @ts-expect-error Correction feedback has no independent mastery score.
export const correctionScore: CorrectionFeedback = { kind: 'correction-learning', status: 'wrong', marks: { earned: 0, available: 1, points: [] }, score: 0 };
// @ts-expect-error Unrecognized learning feedback retains issues, not pretend awarded marks.
export const correctionUnknown: CorrectionFeedback = { kind: 'correction-learning', status: 'unrecognized', marks: { earned: 0, available: 1, points: [] } };
// @ts-expect-error Ephemeral correction feedback cannot become part of a saved attempt.
export const savedCorrection: StudentAttempt = { ...attempt, correctionFeedback: { kind: 'correction-learning', status: 'incomplete', issues: [] } };
