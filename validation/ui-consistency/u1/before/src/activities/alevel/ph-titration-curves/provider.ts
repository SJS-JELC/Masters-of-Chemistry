import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import { fixedIdentity } from '../../../content/canonical-identity.ts';
const identity = fixedIdentity('TC');
import type { Question, QuestionProvider, QuestionRef } from '../../../contracts/index.ts';
import { bank } from './bank.ts';
import { modelImage } from '../../../chemistry/titration-curve/model.ts';
import { answer, grade, initial } from '../../../chemistry/titration-curve/core.js';
export { bank };
export function getRecord(id: string) {
  const q = bank.find((q) => q.id === identity.sourceId(id));
  if (!q) throw Error(`Unknown titration question: ${id}`);
  return q;
}
export function reviewCode(sourceId: string): string {
  return identity.code(sourceId);
}
function seedCheck(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Titration seed must be an unsigned 32-bit integer.');
}
const source = {
  path: 'apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/data.js',
  sha256: 'b1c6255a35a1380c867e3183034d03e08bf9c67e2b7d57c622eb815ba75ebf00',
  symbolOrSection: 'complete 36-record source bank; OCR A Chemistry 5.1.3(n–o)',
};
export function restore(ref: QuestionRef): Question {
  const q = getRecord(ref.questionId);
  seedCheck(ref.seed);
  if (ref.activityId !== 'alevel/ph-titration-curves' || ref.level !== q.level)
    throw Error('Unsupported titration identity or level.');
  const a = answer(q),
    working = grade(q, a);
  return {
    ref,
    title: `${q.title} · ${reviewCode(q.id)}`,
    context: [{ kind: 'text', text: q.prompt }],
    layout: 'workspace',
    submission: 'all-required-parts',
    parts: [
      {
        id: 'curve',
        kind: 'titration-curve',
        prompt: [
          {
            kind: 'text',
            text: 'Choose both curve sections, set initial and final pH and equivalence volume, then select an indicator.',
          },
        ],
        marks: 6,
        required: true,
        dependsOn: [],
        initial: { kind: 'titration-curve', ...initial(q) },
        markingPolicyId: `titration:${ref.questionId}`,
      },
    ],
    scaffolds: [
      {
        id: 'curve-conventions',
        level: q.level,
        purpose: 'Original curve-construction conventions and indicator transition ranges.',
        content: [
          {
            kind: 'text',
            text: 'Drag the three anchors or use the numeric controls. pH steps are 0.1; volume steps are 0.5 cm³. The joining pH is calculated from the selected acid/base species. Equivalence means equal acid/base equivalents; an indicator end-point is its observed colour change.',
          },
        ],
      },
    ],
    hints: [
      {
        id: 'equivalents',
        content: [
          {
            kind: 'text',
            text: 'Find moles of acid/base equivalents first. Before equivalence consider the starting reagent and any buffer; after equivalence consider the added reagent and the total mixed volume.',
          },
        ],
      },
    ],
    workedAnswer: [
      {
        kind: 'text',
        text: 'On smaller screens, swipe the model graph horizontally to inspect its full axis and final pH.',
      },
      {
        kind: 'image',
        src: modelImage(q),
        alt: 'Checked titration curve with source-equilibrium shape and all three numerical anchors.',
      },
      {
        kind: 'text',
        text: `Initial pH ${a.initialPH.toFixed(1)}; equivalence ${a.equivalenceVolume.toFixed(1)} cm³ (pH ${a.equivalencePH.toFixed(1)}); final pH ${a.finalPH.toFixed(1)}.`,
      },
      ...working.items.map((item) => ({ kind: 'text' as const, text: item.feedback })),
      {
        kind: 'text',
        text: 'The curve uses charge balance, weak-species equilibrium and Kw = 1.0 × 10⁻¹⁴ at 25 °C with ideal concentrations and additive volumes. A weak-acid buffer before equivalence has acid and conjugate base; added weak titrant after equivalence may form a buffer. Diprotic cases use the question’s stated complete-dissociation model.',
      },
    ],
    sources: [source],
  };
}
export const titrationProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: bank.map((q) => reviewCode(q.id)) }],
  restore,
  select(s) {
    validatePreviousQuestionIds(s.activityId, s.previousQuestionIds);
    if (
      s.activityId !== 'alevel/ph-titration-curves' ||
      (s.gemId && s.gemId !== 'u6-t1-1-9') ||
      ![2, 3].includes(s.level)
    )
      throw Error('Unsupported titration route.');
    seedCheck(s.seed);
    const pool = bank.filter((q) => q.level === s.level),
      last = s.previousQuestionIds.at(-1),
      index = pool.findIndex((q) => reviewCode(q.id) === last),
      q = pool[(index + 1) % pool.length]!;
    return {
      activityId: 'alevel/ph-titration-curves',
      questionId: reviewCode(q.id),
      seed: s.seed,
      level: s.level,
    };
  },
  resolveLink(code) {
    const text = code.trim().toUpperCase(),
      q = bank.find((q) => reviewCode(q.id) === text);
    return q
      ? {
          activityId: 'alevel/ph-titration-curves',
          questionId: reviewCode(q.id),
          seed: 0,
          level: q.level,
        }
      : null;
  },
};
