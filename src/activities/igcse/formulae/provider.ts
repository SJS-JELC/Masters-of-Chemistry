import type { Question, QuestionProvider, QuestionRef } from '../../../contracts/index.ts';
import { allowedPairs } from '../../../chemistry/formulae-equations/ions.ts';
import {
  decodeFormulaCode,
  selectFormula,
} from '../../../chemistry/formulae-equations/generator.ts';
import { formulaeSources } from '../../../chemistry/formulae-equations/sources.ts';
export const formulaeActivityId = 'igcse/formulae' as const;
export function formulaeRef(code: string, seed?: number): QuestionRef {
  const d = decodeFormulaCode(code, seed);
  return { activityId: formulaeActivityId, questionId: code, seed: d.seed, level: d.pair.level };
}
export function formulaeQuestion(ref: QuestionRef): Question {
  const actual = formulaeRef(ref.questionId, ref.seed);
  if (
    ref.activityId !== actual.activityId ||
    ref.seed !== actual.seed ||
    ref.level !== actual.level
  )
    throw Error('Formula ref disagrees with code');
  const d = decodeFormulaCode(ref.questionId, ref.seed);
  return {
    ref,
    title: 'Formulae · ' + d.pair.name,
    chemicalPresentation: { kind: 'formula', compoundName: d.pair.name },
    context: [
      {
        kind: 'text',
        text:
          'Write the formula of ' +
          d.pair.name +
          '. Recall the ions and combine them in the lowest neutral ratio. Do not include ionic charges in the compound formula.',
      },
    ],
    layout: 'compact',
    submission: 'all-required-parts',
    parts: [
      {
        id: 'formula',
        kind: 'text',
        prompt: [{ kind: 'text', text: 'Compound formula' }],
        marks: 1,
        required: true,
        dependsOn: [],
        accepted: [d.formula],
        normalization: 'exact',
      },
    ],
    scaffolds: [],
    hints: [
      {
        id: 'charge-balance',
        content: [
          {
            kind: 'text',
            text: 'Total positive charge must equal total negative charge. Put brackets around a polyatomic ion only when it is repeated.',
          },
        ],
      },
    ],
    workedAnswer: [
      { kind: 'formula', text: d.formula },
      ...d.explanationLines.map((text) => ({ kind: 'text' as const, text })),
    ],
    sources: formulaeSources,
  };
}
export const formulaeProvider: QuestionProvider = {
  coverage: [
    {
      kind: 'generated',
      families: allowedPairs.map((p) => ({ templateId: p.id, levels: [p.level] })),
    },
  ],
  select(s) {
    if (s.activityId !== formulaeActivityId || (s.gemId && s.gemId !== 'fourth-16-1'))
      throw Error('Unsupported formula target');
    return formulaeRef(selectFormula(s.level, s.seed, s.previousQuestionIds), s.seed);
  },
  restore: formulaeQuestion,
  resolveLink(code) {
    try {
      return formulaeRef(code);
    } catch {
      return null;
    }
  },
};
