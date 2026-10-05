import type {
  Question,
  QuestionProvider,
  QuestionRef,
  QuestionSelection,
  TextRange,
} from '../../../contracts/index.ts';
import { validatePreviousQuestionIds } from '../../../content/canonical-identity.ts';
import { propertiesBank, type PropertiesRecord } from './bank.ts';
export const propertiesActivity = 'alevel/explaining-properties' as const;
export const propertiesGem = 'l6-t2-1-properties';
export function propertiesRecord(code: string): PropertiesRecord {
  const record = propertiesBank.find((item) => item.code === code);
  if (!record) throw Error('Unknown Explaining Properties code.');
  return record;
}
export function correctionSegments(
  record: PropertiesRecord,
): readonly (TextRange & { readonly id: string })[] {
  let offset = 0;
  return [...record.sentence.matchAll(/\[([^\]]+)\]/g)].map((match, index) => {
    const start = match.index - offset;
    offset += 2;
    return { id: `phrase-${index}`, start, end: start + match[1]!.length, text: match[1]! };
  });
}
export function correctedSentence(record: PropertiesRecord): string {
  if (record.format === 'gaps') {
    let i = 0;
    return record.sentence.replace(/\[\]/g, () => record.answers[i++]![0]!);
  }
  let i = 0;
  return record.sentence.replace(/\[([^\]]+)\]/g, (_match, phrase: string) =>
    i++ === record.errorIndex ? record.answers[0]![0]! : phrase,
  );
}
function validate(ref: QuestionRef | QuestionSelection) {
  if (
    ref.activityId !== propertiesActivity ||
    ![1, 2].includes(ref.level) ||
    !Number.isInteger(ref.seed) ||
    ref.seed < 0 ||
    ref.seed > 0xffffffff
  )
    throw Error('Unsupported properties route, level or seed.');
}
export const propertiesProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: propertiesBank.map((item) => item.code) }],
  select(selection) {
    validate(selection);
    validatePreviousQuestionIds(propertiesActivity, selection.previousQuestionIds);
    if (selection.gemId && selection.gemId !== propertiesGem)
      throw Error('Unsupported properties gem.');
    const previous = new Set(selection.previousQuestionIds);
    const pool = propertiesBank.filter(
      (item) => item.level === selection.level && !previous.has(item.code),
    );
    const choices = pool.length
      ? pool
      : propertiesBank.filter(
          (item) =>
            item.level === selection.level && item.code !== selection.previousQuestionIds.at(-1),
        );
    const record = choices[selection.seed % choices.length]!;
    return {
      activityId: propertiesActivity,
      questionId: record.code,
      seed: selection.seed,
      level: record.level,
    };
  },
  restore(ref): Question {
    validate(ref);
    const record = propertiesRecord(ref.questionId);
    if (ref.level !== record.level)
      throw Error('Question code does not belong to the requested level.');
    const sourceText = record.sentence.replace(/[\[\]]/g, '');
    const parts: Question['parts'] =
      record.format === 'gaps'
        ? record.answers.map((accepted, index) => ({
            id: `gap-${index}`,
            kind: 'text',
            prompt: [{ kind: 'text', text: `Gap ${index + 1}` }],
            marks: 1,
            required: true,
            dependsOn: [],
            accepted,
            normalization: 'chemical-text',
            presentation: 'single-line',
          }))
        : [
            {
              id: 'correction',
              kind: 'correction',
              prompt: [],
              marks: 2,
              required: true,
              dependsOn: [],
              sourceText,
              markingPolicyId: 'properties-curated',
              segments: correctionSegments(record),
              segmentSelection: 'single',
            },
          ];
    let gapIndex = 0;
    const sentenceTokens =
      record.format === 'gaps'
        ? record.sentence
            .split(/(\[\])/)
            .filter(Boolean)
            .map((token) => (token === '[]' ? { partId: `gap-${gapIndex++}` } : token))
        : undefined;
    return {
      ref,
      title: record.format === 'gaps' ? 'Complete the gaps.' : 'Find and correct the mistake.',
      context: record.context,
      layout: 'compact',
      submission: 'all-required-parts',
      parts,
      ...(sentenceTokens ? { sentenceTokens } : {}),
      scaffolds: [],
      hints: [],
      workedAnswer: [{ kind: 'text', text: correctedSentence(record) }],
      sources: [
        ...(record.provenance.startsWith('Adapted')
          ? [
              {
                path: 'resources/a-level-past-paper-atlas/data/aggregate.json',
                sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7',
                symbolOrSection: record.provenance,
              },
            ]
          : []),
        {
          path: 'development/alevel/validation/electrons-bonding-audit-20261004/official-specification-scope.json',
          sha256: 'df0c62e0dcb1f189546464b48abb8ac2a1a73ec5d660d135d994865ab5e52a97',
          symbolOrSection: `OCR Chemistry A Version 3.1 May 2026; ${record.spec}; ${record.provenance}; teaching marks, not OCR mark allocations.`,
        },
      ],
    };
  },
  resolveLink(code) {
    const record = propertiesBank.find((item) => item.code === code.trim().toUpperCase());
    return record
      ? { activityId: propertiesActivity, questionId: record.code, seed: 0, level: record.level }
      : null;
  },
};
