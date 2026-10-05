import {validatePreviousQuestionIds} from '../../../../src/content/canonical-identity.ts';
import {developmentCode,decodeDevelopmentCode,developmentSeed,developmentSeedCount,validateDevelopmentRef} from '../../../../src/development/identity.ts';
import type {
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
  MarkingPolicy,
  Responses,
} from '../../../../src/contracts/index.ts';
import { dilutionData } from './data.ts';
import { authoringSources } from './provenance.ts';
export const activityId = 'alevel/acid-base-calculations' as const;
export const gemId = 'u6-t1-1-2';
export const proofSlot = 53;
const validSeed = (s: number) => Number.isSafeInteger(s) && s >= 0 && s < developmentSeedCount;
export function proofRef(level: 1 | 2 | 3, seed: number): QuestionRef {
  if (!validSeed(seed)) throw Error('Bounded development seed required');
  return {
    activityId,
    questionId: developmentCode(activityId, proofSlot, level, level === 1 ? 0 : seed),
    seed: level === 1 ? 0 : seed,
    level,
  };
}
export function dilutionValues(ref: QuestionRef) {
  if (
    ref.activityId !== activityId ||
    ![1, 2, 3].includes(ref.level) ||
    !validSeed(ref.seed) ||
    ref.questionId !== proofRef(ref.level, ref.seed).questionId ||
    (ref.level === 1 && ref.seed !== 0)
  )
    throw Error('Unknown DEV proof identity/seed/level');
  validateDevelopmentRef(ref, proofSlot);
  const s = ref.seed;
  const c =
    ref.level === 1 ? dilutionData.fixed.concentration : dilutionData.concentrations[s % 4]!;
  const initialVolume =
    ref.level === 1
      ? dilutionData.fixed.initialVolume
      : dilutionData.initialVolumes[Math.floor(s / 4) % 3]!;
  const factor = ref.level === 1 ? 10 : dilutionData.dilutionFactors[Math.floor(s / 12) % 3]!;
  const finalVolume = initialVolume * factor,
    concentration = c / factor,
    pH = -Math.log10(concentration);
  return { c, initialVolume, factor, finalVolume, concentration, pH };
}
export function proofQuestion(ref: QuestionRef): Question {
  const v = dilutionValues(ref);
  const application = ref.level === 3;
  return {
    ref,
    title: 'DEV authoring proof · hydrochloric acid dilution',
    layout: 'multipart',
    submission: 'all-required-parts',
    context: [
      {
        kind: 'text',
        text: application
          ? `A technician dilutes ${v.initialVolume} cm³ of ${v.c} mol dm⁻³ hydrochloric acid until its hydrogen ion concentration corresponds to an exact target pH of ${v.pH.toPrecision(12)}. Calculate the final total volume (not the volume of water added) and predict the change in pH.`
          : `Dilute ${v.initialVolume} cm³ of ${v.c} mol dm⁻³ hydrochloric acid to a total volume of ${v.finalVolume} cm³. Calculate the resulting pH and predict its change.`,
      },
      { kind: 'text', text: dilutionData.assumptions },
      {
        kind: 'text',
        text: application
          ? 'Give final total volume to 3 significant figures. Treat the supplied pH as exact for the calculation.'
          : 'Give pH to 2 decimal places.',
      },
    ],
    parts: [
      {
        id: 'ph',
        kind: 'numeric',
        marks: 1,
        required: true,
        dependsOn: [],
        prompt: [
          {
            kind: 'text',
            text: application ? 'What is the final total volume?' : 'What is the final pH?',
          },
        ],
        unit: application ? 'cm³' : '',
        acceptance: application
          ? {
              kind: 'relative',
              expected: v.finalVolume,
              relativeTolerance: 0.005,
              absoluteFloor: 0.01,
            }
          : { kind: 'rounding', expected: v.pH, digits: 2, mode: 'decimal-places' },
      },
      {
        id: 'change',
        kind: 'choice',
        presentation: 'single',
        marks: 1,
        required: true,
        dependsOn: [],
        prompt: [{ kind: 'text', text: 'How does pH change during this dilution?' }],
        options: [
          {
            id: 'increase',
            content: [
              { kind: 'text', text: 'pH increases because hydrogen ion concentration decreases.' },
            ],
          },
          {
            id: 'decrease',
            content: [{ kind: 'text', text: 'pH decreases because the acid becomes weaker.' }],
          },
          {
            id: 'same',
            content: [
              { kind: 'text', text: 'pH is unchanged because moles of acid are conserved.' },
            ],
          },
        ],
        acceptedOptionSets: [['increase']],
      },
    ],
    scaffolds:
      ref.level === 1
        ? [
            {
              id: 'dilution',
              level: 1,
              purpose: 'Connect conservation of moles with the logarithmic pH scale.',
              content: [{ kind: 'formula', text: 'c₁V₁ = c₂V₂; [H⁺] = c₂; pH = −log₁₀([H⁺])' }],
            },
          ]
        : [],
    hints: [
      {
        id: 'logarithm',
        content: [
          {
            kind: 'text',
            text: 'The acid remains strong: dilution changes concentration, not the extent of dissociation. A tenfold fall in [H⁺] increases pH by 1.',
          },
        ],
      },
    ],
    workedAnswer: [
      {
        kind: 'formula',
        text: application
          ? `[H⁺] = 10^(−${v.pH.toPrecision(12)}) = ${v.concentration.toPrecision(3)} mol dm⁻³`
          : `c₂ = ${v.c} × ${v.initialVolume} / ${v.finalVolume} = ${v.concentration.toPrecision(3)} mol dm⁻³`,
      },
      {
        kind: 'formula',
        text: application
          ? `V₂ = c₁V₁ / c₂ = ${v.c} × ${v.initialVolume} / ${v.concentration.toPrecision(3)} = ${v.finalVolume.toPrecision(3)} cm³`
          : `pH = −log₁₀(${v.concentration.toPrecision(3)}) = ${v.pH.toFixed(2)}`,
      },
      {
        kind: 'text',
        text: 'Moles of acid are conserved; hydrogen ion concentration falls and pH rises. Strong refers to dissociation, not concentration.',
      },
    ],
    sources: authoringSources,
  };
}
export const proofProvider: QuestionProvider = {
  coverage: [
    { kind: 'fixed', questionIds: [proofRef(1, 0).questionId] },
    {
      kind: 'generated',
      families: [
        { templateId: 'DEV-RUNNABLE-DILUTION-v1-GENERATED', levels: [2] },
        { templateId: 'DEV-RUNNABLE-DILUTION-v1-APPLICATION', levels: [3] },
      ],
    },
  ],
  select(s: QuestionSelection) {
    validatePreviousQuestionIds(activityId, s.previousQuestionIds ?? []);
    if (s.activityId !== activityId || s.gemId !== gemId || ![1, 2, 3].includes(s.level))
      throw Error('Unsupported DEV route');
    return proofRef(s.level, developmentSeed(s.seed));
  },
  restore: proofQuestion,
  resolveLink(code) {
    try {
      const decoded = decodeDevelopmentCode(activityId, code.trim().toUpperCase());
      if (decoded.slot !== proofSlot) return null;
      const ref = proofRef(decoded.level, decoded.seed);
      return ref.questionId === code.trim().toUpperCase() ? ref : null;
    } catch {return null;}
  },
};
export const proofMarking: MarkingPolicy = {
  id: 'DEV-RUNNABLE-DILUTION-v1-marking',
  mark(question: Question, responses: Responses) {
    const canonical = proofQuestion(question.ref),
      v = dilutionValues(question.ref),
      n = responses.ph,
      ch = responses.change;
    if (JSON.stringify(canonical) !== JSON.stringify(question))
      throw Error('DEV content no longer matches its validated identity');
    if (
      n?.kind !== 'numeric' ||
      n.unit !== (question.ref.level === 3 ? 'cm³' : '') ||
      !/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(n.raw.trim()) ||
      !Number.isFinite(Number(n.raw)) ||
      ch?.kind !== 'choice' ||
      ch.selected.length !== 1 ||
      !['increase', 'decrease', 'same'].includes(ch.selected[0]!)
    )
      return {
        accepted: false,
        issues: [
          {
            partId: 'ph',
            message:
              'Supply a finite numerical response with the displayed unit and choose one prediction.',
          },
        ],
      };
    const good =
      question.ref.level === 3
        ? Math.abs(Number(n.raw) - v.finalVolume) <= v.finalVolume * 0.005 + 1e-12
        : Math.abs(Number(n.raw) - Number(v.pH.toFixed(2))) <= 0.005 + 1e-12;
    const points = [
      {
        partId: 'ph',
        pointId: 'ph',
        earned: good ? 1 : 0,
        available: 1,
        message:
          question.ref.level === 3
            ? good
              ? 'Correct final total volume.'
              : 'Use [H⁺] = 10^(−pH), then conserve moles using c₁V₁ = c₂V₂.'
            : good
              ? 'Correct pH.'
              : 'Use the diluted hydrogen ion concentration in the logarithm.',
      },
      {
        partId: 'change',
        pointId: 'concentration',
        earned: ch.selected[0] === 'increase' ? 1 : 0,
        available: 1,
        message:
          ch.selected[0] === 'increase'
            ? 'Correct concentration reasoning.'
            : 'Dilution decreases concentration while hydrochloric acid remains fully dissociated.',
      },
    ];
    return {
      accepted: true,
      marks: { earned: points.reduce((n, p) => n + p.earned, 0), available: 2, points },
    };
  },
  masteryScore: (m) => (m.earned === m.available ? 1 : m.earned > 0 ? 0.5 : 0),
};
