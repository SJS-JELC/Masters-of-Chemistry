import type { CorrectionFeedback, PlayerAttempt } from '../contracts/attempt.ts';

/** Stable response comparison also supports attempts saved before the UI markers existed. */
export function responseFingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(responseFingerprint).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${responseFingerprint(item)}`)
      .join(',')}}`;
  return JSON.stringify(value) ?? 'undefined';
}

export interface QuestionActionState {
  readonly primary: 'check' | 'next';
  readonly checkEnabled: boolean;
  readonly clearEnabled: boolean;
  readonly giveUpEnabled: boolean;
  readonly nextEnabled: boolean;
  readonly currentCorrect: boolean;
}

/** UI availability never creates an assessment or skips a staged review. */
export function questionActionState(
  attempt: PlayerAttempt,
  correctionFeedback: CorrectionFeedback | undefined,
  { ready = true, canNext = true, canCorrect = true } = {},
): QuestionActionState {
  const student = attempt.mode === 'student';
  const reviewing =
    student && (attempt.phase === 'rubric-review' || attempt.phase === 'drawing-review');
  const assessed = student && attempt.phase === 'assessed';
  const sameFirst =
    assessed &&
    !attempt.currentResponseChanged &&
    responseFingerprint(attempt.currentResponses) ===
      responseFingerprint(attempt.firstResponse.responses);
  const currentCorrect =
    assessed &&
    (correctionFeedback?.status === 'correct' ||
      (!correctionFeedback &&
        sameFirst &&
        attempt.firstAssessment.kind !== 'revealed' &&
        attempt.firstAssessment.marks.earned === attempt.firstAssessment.marks.available));
  const gaveUp =
    student &&
    (attempt.currentGiveUp === true ||
      (attempt.currentGiveUp === undefined &&
        !attempt.currentResponseChanged &&
        assessed &&
        attempt.firstAssessment.kind === 'revealed' &&
        sameFirst));
  return {
    primary: currentCorrect || gaveUp ? 'next' : 'check',
    checkEnabled: student && !reviewing && ready && (!assessed || canCorrect),
    clearEnabled: student && !reviewing,
    giveUpEnabled: student && !reviewing,
    nextEnabled: assessed && canNext,
    currentCorrect,
  };
}
