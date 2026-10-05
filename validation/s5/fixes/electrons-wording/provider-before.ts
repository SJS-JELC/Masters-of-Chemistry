import type { QuestionProvider, QuestionRef, QuestionSelection } from '../../../contracts/index.ts';
import { data } from './data.js';
function hash(value: string) {
  let n = 2166136261;
  for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  return n || 1;
}
export const bondingQuestionIds = data.questions.map((q) => q.id);
export function bondingRecord(id: string) {
  const item = data.questions.find((item) => item.id === id);
  if (!item) throw Error('Unknown bonding question.');
  return item;
}
function validate(ref: QuestionRef | QuestionSelection) {
  if (
    ref.activityId !== 'alevel/electrons-bonding' ||
    ref.level !== 1 ||
    !Number.isInteger(ref.seed) ||
    ref.seed < 0 ||
    ref.seed > 0xffffffff
  )
    throw Error('Unsupported bonding route or seed.');
}
export const electronsBondingProvider: QuestionProvider = {
  coverage: [{ kind: 'fixed', questionIds: bondingQuestionIds }],
  select(selection) {
    validate(selection);
    if (selection.gemId && selection.gemId !== 'l6-t2-1-1') throw Error('Unsupported bonding gem.');
    const previous = selection.previousQuestionIds.at(-1);
    const pool = data.questions.filter((q) => q.id !== previous);
    const choices = pool.length ? pool : data.questions;
    const record = choices[((hash(String(selection.seed)) - 1) >>> 0) % choices.length];
    return {
      activityId: selection.activityId,
      questionId: (record ?? choices[0]!).id,
      seed: selection.seed,
      level: 1,
    };
  },
  restore(ref) {
    validate(ref);
    const q = bondingRecord(ref.questionId);
    return {
      ref,
      title: `${q.strand} · ${q.id}`,
      context: [{ kind: 'text', text: q.prompt }],
      layout: 'compact',
      submission: 'all-required-parts',
      parts: q.fields.map((field, i) => ({
        id: `answer-${i}`,
        kind: 'text',
        presentation: q.rules ? 'multiline' : 'single-line',
        prompt: [{ kind: 'text', text: field.label }],
        marks: q.points.length,
        required: true,
        dependsOn: [],
        accepted: field.accept,
        normalization: 'chemical-text',
      })),
      scaffolds: [],
      hints: [{ id: 'source-hint', content: [{ kind: 'text', text: q.hint }] }],
      workedAnswer: [
        {
          kind: 'text',
          text: q.sourceAnswer.includes(';')
            ? 'Accepted alternatives: ' + q.sourceAnswer
            : q.sourceAnswer,
        },
        ...q.points.map((text) => ({ kind: 'text' as const, text })),
        { kind: 'text', text: q.feedback },
      ],
      sources: [
        {
          path: data.source.path,
          sha256: data.source.sha256,
          symbolOrSection: `reviewed source row ${q.sourceRow}; OCR ${q.spec}`,
        },
      ],
    };
  },
  resolveLink(code) {
    const id = code.trim().toUpperCase();
    return bondingQuestionIds.includes(id)
      ? { activityId: 'alevel/electrons-bonding', questionId: id, seed: 0, level: 1 }
      : null;
  },
};
