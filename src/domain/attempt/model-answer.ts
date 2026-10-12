import type { Question, RawMarks } from '../../contracts/question.ts';
import type { PlayerAttempt } from '../../contracts/attempt.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../../contracts/recall.ts';

function currentIGCSERecall(attempt: PlayerAttempt | undefined): boolean {
  return (
    !!attempt &&
    attempt.ref.activityId === 'igcse/recall' &&
    'definitionId' in attempt &&
    attempt.definitionId === CURRENT_RECALL_DEFINITION_ID
  );
}

const automaticReferenceActivities = new Set([
  'igcse/energetics-practical',
  'igcse/energy-enthalpy',
  'alevel/electrons-bonding',
  'alevel/ph-titration-curves',
]);

/** A displayed model permanently closes checking, including legacy saved attempts. */
export function automaticModelAnswerShown(
  question: Question,
  marks: RawMarks,
  attempt?: PlayerAttempt,
): boolean {
  // These source first-result rows disclose checked models, reference explanations or target values even for wrong answers.
  return (
    marks.available > 0 &&
    (marks.earned === marks.available ||
      automaticReferenceActivities.has(question.ref.activityId) ||
      currentIGCSERecall(attempt))
  );
}

export function isModelAnswerShown(attempt: PlayerAttempt): boolean {
  if (attempt.mode !== 'student') return true;
  if (attempt.phase === 'drawing-review') return true;
  if (
    attempt.modelAnswerShown === true ||
    attempt.modelAnswerPanelShown === true ||
    attempt.assistance.some((item) => item.kind === 'reveal' || item.kind === 'worked-answer')
  )
    return true;
  return (
    attempt.phase === 'assessed' &&
    (attempt.firstAssessment.kind === 'revealed' ||
      currentIGCSERecall(attempt) ||
      (automaticReferenceActivities.has(attempt.ref.activityId) &&
        attempt.firstAssessment.marks.available > 0) ||
      (attempt.firstAssessment.marks.available > 0 &&
        attempt.firstAssessment.marks.earned === attempt.firstAssessment.marks.available))
  );
}

/** Full model visibility is separate from partial references that permanently close checking. */
export function isModelAnswerPanelShown(attempt: PlayerAttempt): boolean {
  if (attempt.mode !== 'student') return true;
  if (
    attempt.modelAnswerPanelShown === true ||
    attempt.assistance.some(
      (item) =>
        (item.kind === 'reveal' || item.kind === 'worked-answer') &&
        item.supportId !== 'model-answer-reference',
    )
  )
    return true;
  return (
    attempt.phase === 'assessed' &&
    (attempt.firstAssessment.kind === 'revealed' ||
      currentIGCSERecall(attempt) ||
      (attempt.firstAssessment.marks.available > 0 &&
        attempt.firstAssessment.marks.earned === attempt.firstAssessment.marks.available))
  );
}
