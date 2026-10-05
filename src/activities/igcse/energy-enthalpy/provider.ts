import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import { fixedIdentity } from '../../../content/canonical-identity.ts';
const identity = fixedIdentity('EE');
import type {
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
  QuestionPart,
} from '../../../contracts/index.ts';
import type { EnergyBank, ProfileOptions } from './types.ts';
import type { EnergyProfileState } from '../../../contracts/editors.ts';
import { data as sourceData } from './data.ts';
import { modelProfile, initialProfile } from '../../../chemistry/energy-profile/index.ts';
import { profileSVG, svgImage } from '../../../chemistry/energy-profile/svg.ts';
export const bank = sourceData as EnergyBank;
export function reviewCode(sourceId: string): string {
  return identity.code(sourceId);
}
export function record(id: string) {
  const q = bank.questions.find((q) => q.id === identity.sourceId(id));
  if (!q) throw Error('Unknown energy question.');
  return q;
}
function seedCheck(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Invalid energy seed.');
}
export function energyRef(id: string, seed = 0): QuestionRef {
  seedCheck(seed);
  const q = record(id);
  return {
    activityId: 'igcse/energy-enthalpy',
    questionId: reviewCode(q.id),
    level: q.grade,
    seed,
  };
}
/** Original EnergyEditor.reference variants, selected by source diagram metadata. */
export function energyReference(code: string): { model: EnergyProfileState; options: Partial<ProfileOptions>; alt: string } {
  let model: EnergyProfileState = {
    ...modelProfile({ polarity: code.startsWith('Y') ? 'endo' : 'exo' } as import('./types.ts').EnergyRecord),
    left: 'A',
    right: 'C',
  };
  let options: Partial<ProfileOptions> = { letters: true };
  if (code === 'Y-arrows') {
    options = { ...options, numberArrows: true };
    model = { ...model, arrows: {
      ea: { x: 280, tail: { anchor: 'r' }, head: { anchor: 'peak' } },
      delta: { x: 560, tail: { anchor: 'r' }, head: { anchor: 'p' } },
    } };
  }
  if (code === 'X-wrong') model = { ...model, arrows: {
    delta: { x: 560, tail: { anchor: 'peak' }, head: { anchor: 'p' } },
  } };
  if (code === 'Y-axes') model = { ...model, vertical: '', horizontal: '' };
  if (code === 'Z') {
    model = { ...model, r: 220, p: 300, peak: 145 };
    options = { ...options, overlay: true, letters: false };
  }
  const alt = code === 'Z'
    ? 'Energy pathways P and Q: solid P has a higher peak than dashed Q, with the same reactant and product levels.'
    : `Profile ${code.startsWith('Y') ? 'Y' : 'X'}: A is the reactant level, B the peak and C the product level. Products are ${model.p < model.r ? 'higher' : 'lower'} in energy than reactants.${code === 'Y-arrows' ? ' Arrow 1 runs from A to B; arrow 2 runs from A to C.' : code === 'X-wrong' ? ' The displayed enthalpy arrow runs from the peak to the product level.' : code === 'Y-axes' ? ' Both axes require labels.' : ''}`;
  return { model, options, alt };
}
function restore(ref: QuestionRef): Question {
  seedCheck(ref.seed);
  const q = record(ref.questionId);
  if (ref.activityId !== 'igcse/energy-enthalpy' || ref.level !== q.grade)
    throw Error('Energy identity and level mismatch.');
  const parts: QuestionPart[] = q.fields
    ? q.fields.map((f, i) => ({
        id: `field-${i}`,
        required: true,
        dependsOn: [],
        marks: 1,
        prompt: [{ kind: 'text', text: f.label }],
        ...(f.options
          ? {
              kind: 'choice' as const,
              presentation: 'single' as const,
              options: f.options.map((option) => ({
                id: option,
                content: [{ kind: 'text' as const, text: option }],
              })),
              acceptedOptionSets: f.accept.filter((a) => f.options?.includes(a)).map((a) => [a]),
            }
          : { kind: 'text' as const, accepted: f.accept, normalization: 'chemical-text' as const }),
      }))
    : [
        {
          id: 'profile',
          kind: 'energy-profile',
          required: true,
          dependsOn: [],
          marks: q.points.length,
          prompt: [
            {
              kind: 'text',
              text: 'Arrange the energy levels, labels and arrow endpoints. Up on the graph means greater energy. Each arrow has a tail and a single arrowhead.',
            },
          ],
          initial: initialProfile(q),
          markingPolicyId: `energy-profile:${ref.questionId}`,
        },
      ];
  const context: Question['context'] = [
    { kind: 'text', text: q.prompt },
    ...(q.equation ? [{ kind: 'formula' as const, text: q.equation }] : []),
    ...(q.enthalpyText ? [{ kind: 'text' as const, text: q.enthalpyText }] : []),
  ];
  const diagram = q.diagram
    ? (() => {
        const reference = energyReference(q.diagram!);
        return {
          kind: 'image' as const,
          src: svgImage(profileSVG(reference.model, reference.options)),
          alt: reference.alt,
        };
      })()
    : null;
  return {
    ref,
    title: `${bank.strands.find((s) => s.id === q.strand)?.name} · ${reviewCode(q.id)}`,
    context: [...context, ...(diagram ? [diagram] : [])],
    layout: q.editor ? 'workspace' : 'multipart',
    submission: 'all-required-parts',
    parts,
    scaffolds: [],
    hints: [{ id: q.strand, content: [{ kind: 'text', text: bank.hints[q.strand] ?? '' }] }],
    workedAnswer: [
      ...q.points.map((text) => ({ kind: 'text' as const, text })),
      { kind: 'text', text: q.feedback },
      ...(q.editor
        ? [
            {
              kind: 'image' as const,
              src: svgImage(profileSVG(modelProfile(q), q.editor)),
              alt: `Checked profile: ${q.feedback}`,
            },
          ]
        : []),
    ],
    sources: [
      {
        path: 'apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/data.js',
        sha256: '47ed6cff73bc965276ce87fcc2c27dd05140be8b7b8bb5885f9ca4b3c54c57b0',
        symbolOrSection: q.id,
      },
    ],
  };
}
function select(s: QuestionSelection): QuestionRef {
  validatePreviousQuestionIds(s.activityId, s.previousQuestionIds);
  seedCheck(s.seed);
  if (
    s.activityId !== 'igcse/energy-enthalpy' ||
    (s.gemId && s.gemId !== 'lower-10-1') ||
    ![1, 2].includes(s.level)
  )
    throw Error('Unsupported energy route.');
  const pool = bank.questions.filter((q) => q.grade === s.level),
    remaining = pool.filter((q) => !s.previousQuestionIds.includes(reviewCode(q.id)));
  const picked = (remaining.length ? remaining : pool)[s.seed % (remaining.length || pool.length)];
  if (!picked) throw Error('Energy bank missing.');
  return energyRef(reviewCode(picked.id), s.seed);
}
export const energyProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: bank.questions.map((q) => reviewCode(q.id)) }],
  restore,
  select,
  resolveLink: (code) => {
    try {
      return energyRef(code.trim().toUpperCase());
    } catch {
      return null;
    }
  },
};
