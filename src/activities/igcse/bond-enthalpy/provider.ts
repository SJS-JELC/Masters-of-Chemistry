import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import type {
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
  SourceReference,
} from '../../../contracts/index.ts';
import { core } from '../../../chemistry/thermochemistry/bond-enthalpy-core.js';
import { bondCodec, seeded, validateSeed } from '../../../chemistry/thermochemistry/identity.ts';
import {
  text,
  svgImage,
  calculationBlocks,
  numericalTolerance,
} from '../../../chemistry/thermochemistry/presentation.ts';
import { workingFramework } from '../../../chemistry/thermochemistry/framework.ts';
import { reviewedMethanolSynthesisSVG } from '../../../chemistry/thermochemistry/reviewed-co-svg.ts';
export const bondActivityId = 'igcse/bond-enthalpy' as const;
const sources: readonly SourceReference[] = [
  {
    path: 'apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/data.js',
    sha256: '7d12bd91a5565e6bb42ef9c3b297e4b64e76889c6a86315ea686051202b49c59',
    symbolOrSection:
      '16 balanced reactions and checked displayed SVGs. RDKit 2026.03.5; Pearson 4CH1 Issue 3 September 2024, points 3.6C/3.7C, accessed 2 September 2026',
  },
];
export function bondSource(code: string) {
  const d = bondCodec.decode(code);
  return core.generate(
    { reaction: String(d.config.reaction), difficulty: Number(d.config.difficulty) },
    d.seed,
  );
}
export function bondRef(code: string): QuestionRef {
  const d = bondCodec.decode(code),
    r = bondSource(d.id);
  return { activityId: bondActivityId, questionId: d.id, seed: d.seed, level: r.difficulty };
}
export function bondCode(reaction: string, level: number, seed: number) {
  validateSeed(seed);
  core.generate({ reaction, difficulty: level }, seed);
  return bondCodec.encode({ reaction, difficulty: level }, seed);
}
export function bondQuestion(ref: QuestionRef): Question {
  const actual = bondRef(ref.questionId);
  if (
    ref.questionId !== actual.questionId ||
    ref.activityId !== actual.activityId ||
    ref.seed !== actual.seed ||
    ref.level !== actual.level
  )
    throw Error('Bond code, seed and level disagree');
  const r = bondSource(ref.questionId),
    image = svgImage(
      r.reaction.id === 'methanol-synthesis' ? reviewedMethanolSynthesisSVG : r.reaction.svg,
      r.reaction.description,
    );
  return {
    ref,
    title: `Bond enthalpy · ${r.reaction.name}`,
    context: [
      { kind: 'formula', text: r.reaction.equation },
      ...(r.difficulty === 3
        ? [
            text(
              'Draw the balanced displayed equation on paper or a whiteboard before counting bonds.',
            ),
          ]
        : [image]),
      {
        kind: 'table',
        headers: ['Bond', 'Average bond enthalpy / kJ mol⁻¹'],
        rows: r.bondTable.map((row) => [row.bond, row.energy === null ? '?' : String(row.energy)]),
      },
    ],
    layout: 'multipart',
    submission: 'all-required-parts',
    parts: [
      ...r.responses.map((response, i) => ({
        id: response.key,
        kind: 'numeric' as const,
        inputMode: 'text' as const,
        prompt: [text(r.parts[i]!)],
        marks: 1,
        required: true,
        dependsOn: [],
        unit: response.unit,
        acceptance: {
          kind: 'absolute' as const,
          expected: response.expected,
          tolerance: numericalTolerance(response.expected),
        },
        workingFramework: workingFramework(r.answerParts[i]!, `working-${response.key}`),
      })),
      ...(r.difficulty === 3
        ? [
            {
              id: 'displayed-equation',
              kind: 'drawing-self-check' as const,
              prompt: [
                text(
                  'Keep your own displayed equation for the self-check after your calculation is frozen.',
                ),
              ],
              marks: 1,
              required: true,
              dependsOn: [],
              model: [image],
              criteria: [
                'Every atom and every bond in each displayed formula matches the model.',
                'All balancing coefficients match the equation as written.',
              ],
            },
          ]
        : []),
    ],
    scaffolds: [],
    hints: [
      ...r.responses.map((response) => ({
        id: `working-${response.key}`,
        content: [
          text(
            'Open the working framework beside the response and fill its missing numerical steps.',
          ),
        ],
      })),
      ...(r.difficulty === 3 ? [{ id: 'displayed-formulae', content: [image] }] : []),
    ],
    workedAnswer: [
      image,
      ...r.answerParts.flatMap(calculationBlocks),
      text(
        'Average bond enthalpies estimate the enthalpy change for gaseous covalent species. The value applies to the balanced equation as written.',
      ),
    ],
    sources,
  };
}
function select(selection: QuestionSelection): QuestionRef {
  validatePreviousQuestionIds(selection.activityId, selection.previousQuestionIds);
  if (
    selection.activityId !== bondActivityId ||
    (selection.gemId && selection.gemId !== 'lower-10-4')
  )
    throw Error('Unsupported bond target');
  validateSeed(selection.seed);
  const rng = seeded(selection.seed),
    prior = selection.previousQuestionIds
      .map(bondSource)
      .filter((q) => q.difficulty === selection.level),
    families = selection.level === 1 ? ['enthalpy-change'] : ['enthalpy-change', 'unknown-bond'],
    unseen = families.filter((f) => !prior.some((q) => q.questionType === f)),
    family = (unseen.length ? unseen : families)[
      Math.floor(rng() * (unseen.length || families.length))
    ]!,
    last = prior.filter((q) => q.questionType === family).at(-1),
    eligible = core.eligibleReactions(selection.level),
    varied = eligible.filter((r) => r.id !== last?.reaction.id),
    reactions = varied.length ? varied : eligible,
    reaction = reactions[Math.floor(rng() * reactions.length)]!;
  for (let attempt = 0; attempt < 1000; attempt++) {
    const code = bondCode(reaction.id, selection.level, (selection.seed + attempt) >>> 0);
    if (bondSource(code).questionType === family) return bondRef(code);
  }
  throw Error('Unable to select bond family with canonical seed.');
}
export const bondProvider: QuestionProvider = {
  coverage: [
    {
      kind: 'generated',
      families: [
        { templateId: 'enthalpy-change', levels: [1, 2, 3] },
        { templateId: 'unknown-bond', levels: [2, 3] },
      ],
    },
  ],
  select,
  restore: bondQuestion,
  resolveLink(code) {
    try {
      return bondRef(code);
    } catch {
      return null;
    }
  },
};
