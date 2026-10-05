import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import { fixedIdentity } from '../../../content/canonical-identity.ts';
const identity = fixedIdentity('DC');
import type {
  Level,
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
} from '../../../contracts/index.ts';
import { bank } from './bank.js';
import { modelImage } from '../../../chemistry/dot-and-cross/model.ts';
import { referenceRecord, type IgcseRecord } from './types.ts';
export const categoryByGem = { 'fourth-3-1': 'ionic', 'fourth-3-2': 'covalent' } as const;
export function reviewCode(sourceId: string): string {
  return identity.code(sourceId);
}
/** Original per-level/category filter precedes covalent formula de-duplication. */
export function pupilPool(
  level: Level,
  category: 'all' | 'ionic' | 'covalent' = 'all',
): readonly IgcseRecord[] {
  const seen = new Set<string>();
  return bank.filter((record) => {
    const key = record.category === 'covalent' ? `covalent:${record.formula}` : record.id;
    if (
      (category !== 'all' && record.category !== category) ||
      !record.grades.includes(level) ||
      seen.has(key)
    )
      return false;
    seen.add(key);
    return true;
  });
}
export const teacherQuestionIds = bank.map((record) => reviewCode(record.id));
export const curriculumEnrichmentIds = ['propane', 'propene'] as const;
const source = {
  path: 'apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/data.js',
  sha256: 'aef37042527937c3664fecd1bea6d322ac2bb8a543ba027e30c7eaa7c6c20944',
  symbolOrSection:
    'complete separate 72-record IGCSE bank; Edexcel specification 1.40/1.46, Issue3 September2024, accessed2026-09-12',
};
export function getRecord(id: string): IgcseRecord {
  const record = bank.find((item) => item.id === identity.sourceId(id));
  if (!record) throw Error(`Unknown IGCSE dot-and-cross question: ${id}`);
  return record;
}
function seedCheck(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Question seed must be an unsigned 32-bit integer.');
}
function restore(ref: QuestionRef): Question {
  if (ref.activityId !== 'igcse/dot-and-cross' || ![1, 2, 3].includes(ref.level))
    throw Error('Unsupported IGCSE dot-and-cross identity.');
  seedCheck(ref.seed);
  const record = getRecord(ref.questionId),
    isomer = record.category === 'covalent',
    hidden = record.category === 'ionic' && ref.level === 2;
  const formula = record.formula.replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'.charAt(Number(digit)));
  const label = isomer ? formula : record.name + (hidden ? '' : `, ${formula}`);
  return {
    ref,
    title: `${label} · ${reviewCode(record.id)}`,
    context: [
      {
        kind: 'text',
        text: `Draw a dot-and-cross diagram for ${isomer ? formula : record.name.toLowerCase() + (hidden ? '' : `, ${formula}`)}.`,
      },
    ],
    layout: 'workspace',
    submission: 'all-required-parts',
    parts: [
      {
        id: 'diagram',
        kind: 'dot-and-cross',
        prompt: [
          {
            kind: 'text',
            text: 'Build the diagram using atoms, shared electron pairs, lone electrons and any required brackets and charges.',
          },
        ],
        marks: 1,
        required: true,
        dependsOn: [],
        initial: { kind: 'dot-and-cross', atoms: [], electrons: [], groups: [] },
        markingPolicyId: `igcse-dot-cross:${ref.questionId}`,
      },
    ],
    scaffolds: [
      {
        id: 'source-drawing-conventions',
        level: ref.level,
        purpose: 'Use outer-shell electrons and consistent electron-origin symbols.',
        content: [{ kind: 'text', text: record.prompt }],
      },
    ],
    hints: [
      {
        id: 'check-inventory',
        content: [
          {
            kind: 'text',
            text: 'Count the original outer electrons. For ionic compounds, infer the ion charges and use the smallest neutral ratio. Count shared pairs and non-bonding electrons separately.',
          },
        ],
      },
    ],
    workedAnswer: [
      {
        kind: 'text',
        text: isomer
          ? `One valid example: ${record.name}. Other valid neutral isomers of this formula are accepted.`
          : 'Checked answer.',
      },
      ...(curriculumEnrichmentIds.some((id) => id === record.id)
        ? [
            {
              kind: 'text' as const,
              text: 'Extension: this three-carbon diagram develops the same electron-accounting skill beyond the up-to-two-carbon examples in Pearson specification1.46.',
            },
          ]
        : []),
      {
        kind: 'text',
        text: 'On smaller screens, swipe or scroll the model diagram horizontally to inspect all electrons and charges.',
      },
      {
        kind: 'image',
        src: modelImage(referenceRecord(record)),
        alt: `Checked dot-and-cross diagram of ${record.name}; ${record.explanation}`,
      },
      { kind: 'text', text: record.explanation },
    ],
    sources: [source],
  };
}
function select(selection: QuestionSelection): QuestionRef {
  validatePreviousQuestionIds(selection.activityId, selection.previousQuestionIds);
  if (selection.activityId !== 'igcse/dot-and-cross')
    throw Error('Unsupported IGCSE dot-and-cross activity.');
  const gem = selection.gemId;
  if (gem && !(gem in categoryByGem)) throw Error('Unsupported IGCSE dot-and-cross gem.');
  const category = gem ? categoryByGem[gem as keyof typeof categoryByGem] : 'all';
  if (category === 'ionic' && selection.level === 3)
    throw Error('IGCSE ionic diagrams support levels1/2 only.');
  seedCheck(selection.seed);
  const pool = pupilPool(selection.level, category);
  if (!pool.length) throw Error('No IGCSE dot-and-cross questions at this level.');
  const remaining = pool.filter(
    (record) => !selection.previousQuestionIds.includes(reviewCode(record.id)),
  );
  const last = selection.previousQuestionIds.at(-1);
  const eligible = remaining.length ? remaining : pool.filter((record) => record.id !== last);
  const candidates = eligible.length ? eligible : pool;
  const record = candidates[Math.floor((selection.seed / 4294967296) * candidates.length)]!;
  return {
    activityId: 'igcse/dot-and-cross',
    questionId: reviewCode(record.id),
    seed: selection.seed,
    level: selection.level,
  };
}
export const igcseDotCrossProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: teacherQuestionIds }],
  select,
  restore,
  resolveLink(code) {
    const trimmed = code.trim();
    const record = bank.find((item) => reviewCode(item.id) === trimmed.toUpperCase());
    if (!record) return null;
    return {
      activityId: 'igcse/dot-and-cross',
      questionId: reviewCode(record.id),
      seed: 0,
      level: record.grades[0] ?? 1,
    };
  },
};
