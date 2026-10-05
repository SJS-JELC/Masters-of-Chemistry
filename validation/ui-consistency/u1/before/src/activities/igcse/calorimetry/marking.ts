import type { MarkingPolicy } from '../../../contracts/index.ts';
import { calorimetryQuestion, calorimetrySource } from './provider.ts';
import { markNumbers, score } from '../../../chemistry/thermochemistry/marking.ts';
export const calorimetryMarking: MarkingPolicy = {
  id: 'calorimetry-source-numeric',
  mark(question, responses) {
    const checked = calorimetryQuestion(question.ref),
      source = calorimetrySource(question.ref.questionId);
    if (
      JSON.stringify(question.parts.map((p) => p.id)) !==
      JSON.stringify(checked.parts.map((p) => p.id))
    )
      throw Error('Calorimetry response parts disagree with source');
    return markNumbers(source.responses, responses);
  },
  masteryScore: score,
};
