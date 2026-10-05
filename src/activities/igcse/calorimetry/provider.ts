import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import type {
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
  Level,
  SourceReference,
} from '../../../contracts/index.ts';
import { core } from '../../../chemistry/thermochemistry/calorimetry-core.js';
import type {
  CalorimetryConfig,
  CalorimetryResult,
} from '../../../chemistry/thermochemistry/types.ts';
import {
  calorimetryCodec,
  seeded,
  validateSeed,
} from '../../../chemistry/thermochemistry/identity.ts';
import {
  text,
  svgImage,
  calculationBlocks,
  numericalTolerance,
} from '../../../chemistry/thermochemistry/presentation.ts';
import { workingFramework } from '../../../chemistry/thermochemistry/framework.ts';
export const calorimetryActivityId = 'igcse/calorimetry' as const;
export const calorimetryFamilies = [
  { id: 'solution-q', setup: 'solution', target: 'q' },
  { id: 'combustion-q', setup: 'combustion', target: 'q' },
  { id: 'solution-dh', setup: 'solution', target: 'dh' },
  { id: 'combustion-dh', setup: 'combustion', target: 'dh' },
] as const;
const sources: readonly SourceReference[] = [
  {
    path: 'apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/core.js',
    sha256: '8c540133a5dc4ea8067ff43e4d0bce7a6db79d032a44a296db00c5bfac35a2ac',
    symbolOrSection: 'Exact calculation generator, routes and source sign conventions',
  },
];
export function calorimetryCode(config: CalorimetryConfig, seed: number): string {
  validateSeed(seed);
  const r = core.generate(config, seed);
  return calorimetryCodec.encode(
    {
      ...r.config,
      example: r.example.id,
      difficulty: r.difficulty,
      structure: r.structure,
      amountRoute: r.config.target === 'q' ? 'given' : r.config.amountRoute,
    },
    seed,
  );
}
export function calorimetrySource(code: string): CalorimetryResult {
  const d = calorimetryCodec.decode(code),
    example = core.examples.find((e) => e.id === d.config.example);
  if (!example) throw Error('Unknown calorimetry example');
  return core.generate(
    { ...d.config, setup: example.setup } as unknown as CalorimetryConfig,
    d.seed,
  );
}
export function calorimetryRef(code: string): QuestionRef {
  const d = calorimetryCodec.decode(code),
    r = calorimetrySource(d.id);
  return { activityId: calorimetryActivityId, questionId: d.id, seed: d.seed, level: r.difficulty };
}
export function calorimetryQuestion(ref: QuestionRef): Question {
  const actual = calorimetryRef(ref.questionId);
  if (
    ref.questionId !== actual.questionId ||
    ref.activityId !== actual.activityId ||
    ref.seed !== actual.seed ||
    ref.level !== actual.level
  )
    throw Error('Calorimetry code, seed and level disagree');
  const r = calorimetrySource(ref.questionId);
  const diagram = r.diagram.match(/<svg[\s\S]*<\/svg>/)?.[0];
  return {
    ref,
    title: `Calorimetry · ${r.labels.group}`,
    context: [
      text(r.intro),
      ...(r.example.equation ? [{ kind: 'formula' as const, text: r.example.equation }] : []),
      { kind: 'table', headers: ['Quantity', 'Value'], rows: r.rows },
      ...(diagram
        ? [
            svgImage(
              diagram,
              'Initial and final thermometer readings. Each small division is 1 °C. Read the two scales to determine the temperature change.',
            ),
          ]
        : []),
      text(
        'ΔT and Q describe the water or solution. The reaction enthalpy has the opposite sign. Give final numerical answers to 3 significant figures, using unrounded values in subsequent parts.',
      ),
    ],
    layout: r.responses.length > 1 ? 'multipart' : 'compact',
    submission: 'all-required-parts',
    parts: r.responses.map((response, i) => ({
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
    scaffolds: [],
    hints: r.responses.map((response) => ({
      id: `working-${response.key}`,
      content: [
        text(
          `A working framework for ${response.accessibleLabel.toLowerCase()} is available beside the response. Fill the missing numbers, then check your working.`,
        ),
      ],
    })),
    workedAnswer: r.answerParts.flatMap(calculationBlocks),
    sources,
  };
}
export function calorimetryConfigurations(): CalorimetryConfig[] {
  const configs: CalorimetryConfig[] = [];
  for (const level of [1, 2, 3])
    for (const e of core.examples)
      for (const target of ['q', 'dh'])
        for (const massRoute of e.massRoutes)
          for (const amountRoute of e.amountRoutes.filter(
            (r) => target === 'q' || r !== 'limiting' || level === 3,
          ))
            for (const temperatureRoute of ['initial-final', 'delta', 'thermometers'])
              for (const structure of core
                .structureOptions(target, amountRoute, level)
                .filter((s) => s.value !== 'auto'))
                configs.push({
                  difficulty: level,
                  setup: e.setup,
                  example: e.id,
                  target,
                  massRoute,
                  amountRoute,
                  temperatureRoute,
                  structure: structure.value,
                });
  return configs;
}
function select(selection: QuestionSelection): QuestionRef {
  validatePreviousQuestionIds(selection.activityId, selection.previousQuestionIds);
  if (
    selection.activityId !== calorimetryActivityId ||
    (selection.gemId && selection.gemId !== 'lower-10-3')
  )
    throw Error('Unsupported calorimetry target');
  validateSeed(selection.seed);
  const level = selection.level,
    rng = seeded(selection.seed),
    pick = <T>(items: readonly T[]): T => items[Math.floor(rng() * items.length)]!;
  const used = selection.previousQuestionIds
      .map(calorimetrySource)
      .filter((q) => q.difficulty === level)
      .map((q) => `${q.example.setup}-${q.config.target}`),
    fresh = calorimetryFamilies.filter((f) => !used.includes(f.id)),
    family = pick(fresh.length ? fresh : calorimetryFamilies),
    example = pick(core.examples.filter((e) => e.setup === family.setup));
  const amountRoute = pick(
    level === 1
      ? ['given']
      : example.amountRoutes.filter((route) => level === 3 || route !== 'limiting'),
  );
  const config = {
    setup: family.setup,
    target: family.target,
    example: example.id,
    difficulty: level,
    massRoute: level === 1 ? 'direct' : pick(example.massRoutes),
    amountRoute,
    temperatureRoute:
      level === 1 ? 'initial-final' : pick(['initial-final', 'thermometers', 'delta']),
    structure:
      family.target === 'q'
        ? level === 3
          ? 'single-q'
          : 'staged-q'
        : level === 3
          ? 'single-dh'
          : 'full-staged',
  };
  return calorimetryRef(calorimetryCode(config, selection.seed));
}
export const calorimetryProvider: QuestionProvider = {
  coverage: [
    {
      kind: 'generated',
      families: calorimetryFamilies.map((f) => ({
        templateId: f.id,
        levels: [1, 2, 3] as readonly Level[],
      })),
    },
  ],
  select,
  restore: calorimetryQuestion,
  resolveLink(code) {
    try {
      return calorimetryRef(code);
    } catch {
      return null;
    }
  },
};
