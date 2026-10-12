import type { MarkingPolicy } from '../../../contracts/index.ts';
import { formulaeQuestion } from './provider.ts';
import { normalizeChemicalFormula } from '../../../chemistry/formulae-equations/notation.ts';
export const formulaeMarking: MarkingPolicy = {
  id: 'formulae-neutral-lowest-ratio',
  mark(question, responses) {
    const q = formulaeQuestion(question.ref),
      response = responses.formula;
    if (response?.kind !== 'text' || !response.value.trim())
      return {
        accepted: false,
        issues: [{ partId: 'formula', message: 'Enter the compound formula before checking.' }],
      };
    const part = q.parts[0]!;
    const expected = part.kind === 'text' ? part.accepted[0]! : '';
    const correct = normalizeChemicalFormula(response.value) === expected;
    return {
      accepted: true,
      marks: {
        earned: correct ? 1 : 0,
        available: 1,
        points: [
          {
            partId: 'formula',
            pointId: 'neutral-formula',
            earned: correct ? 1 : 0,
            available: 1,
            message: correct
              ? 'Correct neutral formula in the lowest ion ratio.'
              : 'Check the ion charges, lowest ratio, capital letters and brackets.',
          },
        ],
      },
    };
  },
  masteryScore(marks) {
    return marks.earned === marks.available ? 1 : 0;
  },
};
