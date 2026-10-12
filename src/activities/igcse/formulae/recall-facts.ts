import type { RecallFact } from '../../../contracts/recall.ts';
import { ionBank } from '../../../chemistry/formulae-equations/ions.ts';
import {
  formulaeSources,
  equationsSources,
} from '../../../chemistry/formulae-equations/sources.ts';
const chargeText = (charge: number) => String(Math.abs(charge)) + (charge > 0 ? '+' : '-');
const ionicFormula = (formula: string, charge: number) =>
  formula + '^' + (Math.abs(charge) === 1 ? '' : Math.abs(charge)) + (charge > 0 ? '+' : '-');
export const formulaeRecallFacts: readonly RecallFact[] = [
  ...ionBank.flatMap((ion) => [
    {
      id: 'igcse-ion-' + ion.id + '-formula',
      course: 'igcse' as const,
      prompt:
        'Write the formula of the ' +
        ion.name +
        ' ion, including its charge. Use a caret for a typed charge, for example SO4^2-.',
      answer: ionicFormula(ion.formula, ion.charge),
      gemIds: ['fourth-16-1', 'fourth-16-2'],
      sources: formulaeSources,
      matching: { kind: 'chemical' as const },
    },
    {
      id: 'igcse-ion-' + ion.id + '-charge',
      course: 'igcse' as const,
      prompt:
        'What is the signed charge on a ' +
        ion.name +
        ' ion? Include + or -; do not enter a bare number.',
      answer: chargeText(ion.charge),
      accepted: [(ion.charge > 0 ? '+' : '-') + Math.abs(ion.charge)],
      gemIds: ['fourth-16-1', 'fourth-16-2'],
      sources: formulaeSources,
      matching: { kind: 'text' as const, caseSensitive: true },
    },
  ]),
  ...(['s', 'l', 'g'] as const).map((state, index) => ({
    id: 'igcse-state-' + state,
    course: 'igcse' as const,
    prompt: 'What is the state symbol for a ' + ['solid', 'liquid', 'gas'][index] + '?',
    answer: '(' + state + ')',
    accepted: [state],
    gemIds: ['fourth-16-2'],
    sources: equationsSources,
    matching: { kind: 'text' as const, caseSensitive: true },
  })),
];
/** Merge these links into the existing fact, preserving its stable ID/content/progress. */
export const existingRecallGemLinks: Readonly<Record<string, readonly string[]>> = {
  'igcse-recall-012': ['fourth-16-2'],
};
