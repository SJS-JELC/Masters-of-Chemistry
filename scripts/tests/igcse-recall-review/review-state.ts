import { questionDisplayCode } from '../../../src/content/question-display-identity.ts';
import type { RecallAttempt, RecallFact, RecallFactOutcome } from '../../../src/contracts/recall.ts';
import type { AttemptCommand, CorrectionFeedback, FrozenResponse, Assessment, PostAssessmentReview } from '../../../src/contracts/attempt.ts';
import type { Responses } from '../../../src/contracts/question.ts';
export type Trial = {
  attemptId: string; at: string; reviewOnly: true;
  firstResponse: FrozenResponse; firstAssessment: Assessment;
  automaticResult: RecallFactOutcome | null;
  currentResponses: Responses;
  learningReview: PostAssessmentReview | null;
  corrections: { at: string; responses: Responses; feedback: CorrectionFeedback | null }[];
};
export type Review = { status: 'unreviewed' | 'reviewed' | 'issue'; note: string; activeAttempt: RecallAttempt | null; trials: Trial[] };
export const emptyReview = (): Review => ({ status: 'unreviewed', note: '', activeAttempt: null, trials: [] });
/** Copy fixed automatic evidence once; later edits/reviews update only their own fields. */
export function updateTrial(review: Review, state: RecallAttempt, command: AttemptCommand, automatic: RecallFactOutcome | null, correction?: CorrectionFeedback): Review {
  const next = structuredClone(review);
  next.activeAttempt = structuredClone(state);
  if (state.phase !== 'assessed') return next;
  let trial = next.trials.find(t => t.attemptId === state.attemptId);
  if (!trial) {
    trial = { attemptId: state.attemptId, at: new Date().toISOString(), reviewOnly: true,
      firstResponse: structuredClone(state.firstResponse), firstAssessment: structuredClone(state.firstAssessment),
      automaticResult: structuredClone(automatic), currentResponses: {}, learningReview: null, corrections: [] };
    next.trials.push(trial);
  }
  trial.currentResponses = structuredClone(state.currentResponses);
  trial.learningReview = structuredClone(state.learningReview ?? null);
  if (command.kind === 'check-correction') trial.corrections.push({ at: new Date().toISOString(), responses: structuredClone(state.currentResponses), feedback: structuredClone(correction ?? null) });
  return next;
}
export function reviewPayload(bank: readonly RecallFact[], reviews: Record<string, Review>, fingerprint: string, provenance: unknown) {
  return { schemaVersion: 2, course: 'igcse', total: bank.length, bankFingerprint: fingerprint,
    fingerprintAlgorithm: 'SHA-256 of JSON.stringify(factsFor(igcse))', exportedAt: new Date().toISOString(),
    reviewOnly: true, independentEvidence: false, timing: 'synthetic-zero-review-only',
    provenance: (() => { const source = provenance as Record<string, unknown>; return {authority: source?.authority, authoringInputs: source?.reviewedInputs, followupAuthority: source?.followupAuthority}; })(),
    reviews: bank.map(f => {
      const r = reviews[f.id] ?? emptyReview();
      return { displayCode: questionDisplayCode({course:f.course, activityId:f.course+'/recall', questionId:f.id}), prompt: f.prompt, status: r.status, note: r.note,
        currentResponses: structuredClone(r.activeAttempt?.currentResponses ?? {}),
        activeAttempt: structuredClone(r.activeAttempt), trials: structuredClone(r.trials) };
    }) };
}
