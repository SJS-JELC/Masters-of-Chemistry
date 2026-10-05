import type { DotCrossState, MarkingPolicy, RawMarks } from '../../../contracts/index.ts';
import { check, validateReference } from '../../../chemistry/dot-and-cross/core.js';
import { dotCrossEngine } from '../../../chemistry/dot-and-cross/engine.ts';
import { getRecord } from './provider.ts';
import { referenceRecord } from './types.ts';
export const igcseCriterionMessage = (message: string) =>
  message
    .replaceAll('dots, crosses or triangles', 'dots and crosses')
    .replaceAll(
      'Choose any two of dots, crosses and triangles for each shared pair',
      'Use one dot and one cross for each shared pair',
    );
/** Source0/0.5/1 credit excludes vacuous empty-origin/bond/neutral-group checks. */
export function sourceScore(state: DotCrossState, questionId: string): 0 | 0.5 | 1 {
  const record = referenceRecord(getRecord(questionId)),
    result = check(state, record);
  if (result.correct) return 1;
  return result.criteria.some((criterion) => {
    if (!criterion.passed || criterion.id === 'state-valid' || criterion.id === 'shared-electrons')
      return false;
    if (['lone-electrons', 'electron-origins'].includes(criterion.id) && !state.electrons.length)
      return false;
    if (
      criterion.id === 'groups-and-charges' &&
      record.category === 'covalent' &&
      !state.groups.length
    )
      return false;
    return true;
  })
    ? 0.5
    : 0;
}
export const igcseDotCrossMarking: MarkingPolicy = {
  id: 'igcse-dot-and-cross',
  mark(question, responses) {
    const record = referenceRecord(getRecord(question.ref.questionId)),
      response = responses.diagram;
    const referenceErrors = validateReference(record);
    if (referenceErrors.length)
      return {
        accepted: false,
        issues: [
          { partId: 'diagram', message: `Reference cannot be assessed: ${referenceErrors[0]}` },
        ],
      };
    if (response?.kind !== 'dot-and-cross')
      return {
        accepted: false,
        issues: [{ partId: 'diagram', message: 'Build a diagram before checking.' }],
      };
    const submission = dotCrossEngine.checkSubmission(response);
    if (submission.status !== 'ready')
      return {
        accepted: false,
        issues: submission.issues.map((issue) => ({ partId: 'diagram', message: issue.message })),
      };
    // Original IGCSE state schema accepts only dot/cross and its16 supported elements.
    if (
      response.electrons.some((electron) => electron.symbol === 'triangle') ||
      response.atoms.some((atom) => atom.element === 'B' || atom.element === 'P')
    )
      return {
        accepted: false,
        issues: [
          {
            partId: 'diagram',
            message:
              'This IGCSE diagram uses an unsupported element or electron symbol. Use the supplied elements, dots and crosses.',
          },
        ],
      };
    const result = check(response, record),
      earned = sourceScore(response, question.ref.questionId);
    return {
      accepted: true,
      marks: {
        earned,
        available: 1,
        points: [
          {
            partId: 'diagram',
            pointId: 'diagram-score',
            earned,
            available: 1,
            message: result.correct
              ? 'Correct diagram.'
              : earned === 0.5
                ? 'Some substantive chemical criteria are met; correct the remaining diagram.'
                : 'Correct the diagram using the checks below.',
          },
          ...result.criteria
            .filter((criterion) => criterion.id !== 'state-valid')
            .map((criterion) => ({
              partId: 'diagram',
              pointId: criterion.id,
              earned: 0,
              available: 0,
              message: `${criterion.passed ? '✓' : '○'} ${igcseCriterionMessage(criterion.message)}`,
            })),
        ],
      },
    };
  },
  masteryScore: (marks: RawMarks) => (marks.earned === 1 ? 1 : marks.earned > 0 ? 0.5 : 0),
};
