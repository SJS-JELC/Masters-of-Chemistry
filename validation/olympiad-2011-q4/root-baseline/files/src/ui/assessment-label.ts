import type { QuestionPart } from '../contracts/question.ts';

/** A model rubric statement remains chemically true when student evidence is absent. */
export function assessmentPointLabel(
  part: QuestionPart | undefined,
  earned: number,
  available: number,
): string {
  if (part?.kind === 'explanation' || part?.kind === 'drawing-self-check')
    return earned === available ? 'Met' : earned > 0 ? 'Partly met' : 'Not met';
  return earned === available ? 'Correct' : earned > 0 ? 'Partly correct' : 'Incorrect';
}
