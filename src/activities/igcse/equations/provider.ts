import type {
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionPart,
  ChemicalPresentation,
} from '../../../contracts/index.ts';
import { equationBank, selectableEquationBank } from './bank.ts';
import { equationIdentity } from '../../../chemistry/formulae-equations/identity.ts';
import {
  parseChemicalEquation,
  equationAtomCounts,
} from '../../../chemistry/formulae-equations/notation.ts';
import { validateSeed } from '../../../chemistry/formulae-equations/generator.ts';
import { equationsSources } from '../../../chemistry/formulae-equations/sources.ts';
export const equationsActivityId = 'igcse/equations' as const;
export function equationsRef(code: string): QuestionRef {
  const identity = equationIdentity(code);
  const r = equationBank.find((q) => q.id === identity.sourceId);
  if (!r) throw Error('Unknown equation ID');
  return { activityId: equationsActivityId, questionId: code, seed: 0, level: r.level };
}
export function equationsQuestion(ref: QuestionRef): Question {
  const actual = equationsRef(ref.questionId);
  if (ref.activityId !== actual.activityId || ref.seed !== 0 || ref.level !== actual.level)
    throw Error('Equation ref disagrees with fixed ID');
  const r = equationBank.find((q) => q.id === equationIdentity(ref.questionId).sourceId)!,
    parsed = parseChemicalEquation(r.answer)!;
  const parts: QuestionPart[] = [];
  const fixed = r.family.includes('balance') || r.family === 'states';
  if (fixed) {
    for (const [side, species] of [
      ['r', parsed.reactants],
      ['p', parsed.products],
    ] as const)
      for (const [i, s] of species.entries()) {
        const label = (side === 'r' ? 'Reactant ' : 'Product ') + (i + 1) + ' · ' + s.formula;
        if (r.family !== 'states' || r.task === 'balance-and-states')
          parts.push({
            id: side + i + '-coefficient',
            kind: 'numeric',
            inputMode: 'text',
            coefficientEntry: 'positive-rational-blank-one',
            prompt: [
              {
                kind: 'text',
                text: label + ' coefficient (a blank means 1)',
              },
            ],
            marks: 1,
            required: true,
            dependsOn: [],
            unit: '',
            acceptance: { kind: 'absolute', expected: s.coefficient, tolerance: 0 },
          });
        if (r.family === 'states')
          parts.push({
            id: side + i + '-state',
            kind: 'choice',
            presentation: 'dropdown',
            stateEntry: 'parenthesized',
            prompt: [{ kind: 'text', text: label + ' state' }],
            marks: 1,
            required: true,
            dependsOn: [],
            options: ['s', 'l', 'g', 'aq'].map((state) => ({
              id: state,
              content: [{ kind: 'text', text: '(' + state + ')' }],
            })),
            acceptedOptionSets: [[s.state!]],
          });
      }
  } else
    parts.push({
      id: 'equation',
      kind: 'text',
      presentation: 'multiline',
      prompt: [
        {
          kind: 'text',
          text: 'Balanced symbol equation. Use -> or → between sides; write normal digits or subscripts.',
        },
      ],
      marks: r.family === 'paragraph' || r.task === 'complex-words-states' ? 3 : 2,
      required: true,
      dependsOn: [],
      accepted: [r.answer],
      normalization: 'exact',
    });
  const balancing = r.family.includes('balance') || r.task === 'balance-and-states';
  const speciesPresentation = (
    side: 'reactants' | 'products',
    task: 'balance' | 'states',
    readOnly = false,
  ) =>
    parsed[side].map((species, i) => ({
      formula: species.formula,
      coefficient: balancing
        ? {
            kind: 'response' as const,
            partId: (side === 'reactants' ? 'r' : 'p') + i + '-coefficient',
            ...(readOnly ? { readOnly: true as const } : {}),
          }
        : { kind: 'fixed' as const, value: species.coefficient },
      ...(task === 'states'
        ? { statePartId: (side === 'reactants' ? 'r' : 'p') + i + '-state' }
        : species.state && r.task !== 'balance-and-states'
          ? { state: species.state }
          : {}),
    }));
  const presentationPrompt =
    r.family === 'states'
      ? r.prompt.replace(
          / (?:Add state symbols to the balanced equation|Balance the equation AND add state symbols)\.$/,
          '',
        )
      : r.prompt.replace(/^Write a balanced symbol equation:\s*/, '');
  const row = (task: 'balance' | 'states', readOnly = false) => ({
    task,
    reactants: speciesPresentation('reactants', task, readOnly),
    products: speciesPresentation('products', task, readOnly),
  });
  const presentation: ChemicalPresentation =
    r.task === 'balance-and-states'
      ? {
          kind: 'equation-rows',
          prompt: presentationPrompt,
          rows: [row('balance'), row('states', true)],
        }
      : fixed
        ? {
            kind: 'equation-row',
            ...(r.family === 'states' ? { prompt: presentationPrompt } : {}),
            ...row(r.family === 'states' ? 'states' : 'balance'),
          }
        : { kind: 'equation-writing', prompt: presentationPrompt };
  return {
    ref,
    ...(presentation ? { chemicalPresentation: presentation } : {}),
    title: 'Equations · ' + r.family.replaceAll('-', ' '),
    context: [
      { kind: 'text', text: r.prompt.replaceAll('->', '→') },
      ...(r.skeleton ? [{ kind: 'formula' as const, text: r.skeleton.replaceAll('->', '→') }] : []),
      {
        kind: 'text',
        text: 'Use positive coefficients that conserve atoms; decimals and fractions are allowed. A blank coefficient box means 1. Keep substance formulae unchanged.',
      },
    ],
    layout: fixed ? 'multipart' : 'compact',
    submission: 'all-required-parts',
    parts,
    scaffolds: [],
    hints: [
      {
        id: 'conserve-atoms',
        content: [
          {
            kind: 'text',
            text: 'Count each element on both sides. Change coefficients, never the subscripts in a substance formula. State symbols describe physical form, not coefficients.',
          },
        ],
      },
    ],
    workedAnswer: [
      { kind: 'formula', text: r.answer },
      ...(balancing
        ? [
            {
              kind: 'table' as const,
              headers: ['Element', 'Reactants', 'Products'],
              rows: equationAtomCounts(r.answer)!.map(({ element, reactants, products }) => [
                element,
                String(reactants),
                String(products),
              ]),
            },
          ]
        : []),
    ],
    sources: equationsSources,
  };
}
export const equationsProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: equationBank.map((r) => equationIdentity(r.id).code) }],
  select(s) {
    if (s.activityId !== equationsActivityId || (s.gemId && s.gemId !== 'fourth-16-2'))
      throw Error('Unsupported equation target');
    validateSeed(s.seed);
    const prior = s.previousQuestionIds.map(equationsRef),
      eligible = selectableEquationBank.filter((r) => r.level === s.level);
    if (!eligible.length) throw Error('Unsupported equation level');
    const unseen = eligible.filter(
      (r) => !prior.some((p) => equationIdentity(p.questionId).sourceId === r.id),
    );
    const candidates = unseen.length
      ? unseen
      : eligible.filter(
          (r) =>
            r.id !==
            (prior.length ? equationIdentity(prior.at(-1)!.questionId).sourceId : undefined),
        );
    return equationsRef(equationIdentity(candidates[s.seed % candidates.length]!.id).code);
  },
  restore: equationsQuestion,
  resolveLink(code) {
    try {
      return equationsRef(code);
    } catch {
      return null;
    }
  },
};
