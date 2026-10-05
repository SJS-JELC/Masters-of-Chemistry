import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import type {
  QuestionProvider,
  QuestionRef,
  Question,
  QuestionPart,
  QuestionSelection,
} from '../../../contracts/index.ts';
import type { PracticalRecord } from './types.ts';
import { data } from './data.ts';
export const bank = data.questions as PracticalRecord[];
export function record(id: string): PracticalRecord {
  const q = bank.find((q) => q.id === id);
  if (!q) throw Error('Unknown practical code.');
  return q;
}
function seedCheck(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Invalid practical seed.');
}
export function practicalRef(id: string, seed = 0): QuestionRef {
  seedCheck(seed);
  const q = record(id);
  return {
    activityId: 'igcse/energetics-practical',
    questionId: q.id,
    level: q.band === '9' ? 3 : 2,
    seed,
  };
}
export function correctionSegments(q: PracticalRecord) {
  let start = 0;
  return (q.correction?.segments ?? []).map((segment) => {
    const range = { id: segment.id, start, end: start + segment.text.length, text: segment.text };
    start = range.end;
    return range;
  });
}
export function practicalGraph(): string {
  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 330"><rect width="760" height="330" fill="white"/><g stroke="#142844" fill="none" stroke-width="3"><path d="M106 259V48 M106 259H697"/><path d="M119 234L464 82L680 155" stroke="#067b9c"/><path d="M464 82L464 259" stroke="#607089" stroke-dasharray="7 7"/></g><g font-family="sans-serif" font-size="19" fill="#142844"><text x="300" y="310">Volume of acid added</text><text transform="translate(40 230) rotate(-90)">Temperature</text><text x="478" y="69">Maximum</text></g></svg>',
    )
  );
}
function restore(ref: QuestionRef): Question {
  seedCheck(ref.seed);
  const q = record(ref.questionId);
  if (ref.activityId !== 'igcse/energetics-practical' || ref.level !== (q.band === '9' ? 3 : 2))
    throw Error('Practical identity and level mismatch.');
  const parts: QuestionPart[] = [];
  if (q.correction)
    parts.push({
      id: 'correction',
      kind: 'correction',
      prompt: [
        {
          kind: 'text',
          text: 'Select the incorrect phrase and replace it. The replacement point requires the correct source phrase.',
        },
      ],
      required: true,
      dependsOn: [],
      marks: 2,
      sourceText: q.correction.segments.map((s) => s.text).join(''),
      segments: correctionSegments(q),
      segmentSelection: 'single',
      markingPolicyId: `practical-correction:${q.id}`,
    });
  q.fields.forEach((f, i) => {
    if (q.correction && i === 0) return;
    parts.push({
      id: f.id,
      required: true,
      dependsOn: [],
      marks: 1,
      prompt: [{ kind: 'text', text: f.label }],
      ...(f.options
        ? {
            kind: 'choice' as const,
            presentation: f.multiselect ? ('multiple' as const) : ('single' as const),
            options: f.options.map((value) => ({
              id: value,
              content: [{ kind: 'text' as const, text: value }],
            })),
            acceptedOptionSets: f.multiselect ? [f.answers] : f.answers.map((value) => [value]),
          }
        : { kind: 'text' as const, accepted: f.answers, normalization: 'chemical-text' as const }),
    });
  });
  return {
    ref,
    title: `Energetics practical · ${q.id}`,
    context: [
      { kind: 'text', text: q.context },
      { kind: 'text', text: q.prompt },
      ...(q.diagram === 'graph'
        ? [
            {
              kind: 'image' as const,
              src: practicalGraph(),
              alt: 'Temperature rises with acid addition to a maximum, then falls as more acid is added.',
            },
          ]
        : []),
    ],
    layout: 'multipart',
    submission: 'all-required-parts',
    parts,
    scaffolds: q.fields.some((f) => f.multiselect)
      ? [
          {
            id: 'selection-count',
            level: ref.level,
            purpose: 'Original complete-set selection scaffold.',
            content: [
              {
                kind: 'text',
                text: `Select exactly ${q.fields.find((f) => f.multiselect)?.selectCount ?? 3} variables.`,
              },
            ],
          },
        ]
      : [],
    hints: [],
    workedAnswer: [
      ...q.fields.flatMap((f) => [
        { kind: 'text' as const, text: f.model },
        { kind: 'text' as const, text: f.feedback ?? '' },
      ]),
      ...(q.correction
        ? [
            {
              kind: 'text' as const,
              text: `Incorrect phrase: ${q.correction.segments.find((s) => s.id === q.correction?.errorId)?.text ?? ''}`,
            },
          ]
        : []),
    ],
    sources: [
      {
        path: 'apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/data.js',
        sha256: 'aae68163593ee677d1d5fb543b720e9bd8aa29f322940659390a97ac5afec4f2',
        symbolOrSection: q.id,
      },
    ],
  };
}
function select(s: QuestionSelection): QuestionRef {
  validatePreviousQuestionIds(s.activityId, s.previousQuestionIds);
  seedCheck(s.seed);
  if (
    s.activityId !== 'igcse/energetics-practical' ||
    (s.gemId && s.gemId !== 'lower-10-2') ||
    ![2, 3].includes(s.level)
  )
    throw Error('Unsupported practical route.');
  const pool = bank.filter((q) => (q.band === '9' ? 3 : 2) === s.level),
    remaining = pool.filter((q) => !s.previousQuestionIds.includes(q.id));
  const q = (remaining.length ? remaining : pool)[s.seed % (remaining.length || pool.length)];
  if (!q) throw Error('Practical bank missing.');
  return practicalRef(q.id, s.seed);
}
export const practicalProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: bank.map((q) => q.id) }],
  restore,
  select,
  resolveLink: (code) => {
    try {
      return practicalRef(code.trim().toUpperCase());
    } catch {
      return null;
    }
  },
};
