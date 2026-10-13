import aliases from './question-display-aliases.json' with { type: 'json' };
import fixedIds from './canonical-fixed-ids.json' with { type: 'json' };
import { canonicalQuestionPattern, questionPrefixes } from './canonical-identity.ts';
import { formulaIdentity, equationIdentity } from '../chemistry/formulae-equations/identity.ts';
import type { Course } from '../contracts/identity.ts';
import { rateQuestionCode, rateSource } from '../activities/alevel/rate-equations/identity.ts';

export interface DisplayQuestionIdentity {
  readonly course: Course;
  readonly activityId: string;
  readonly questionId: string;
  readonly seed?: number;
}
/** Display aliases only. Internal refs and embedded generator seeds are never rewritten. */
export function questionDisplayCode(identity: DisplayQuestionIdentity): string | undefined {
  const { course, activityId, questionId } = identity;
  if (!activityId.startsWith(course + '/')) return undefined;
  if (activityId === 'alevel/rate-equations' && identity.seed !== undefined) {
    const source = rateSource(questionId);
    if (source && source.gem !== 'mechanisms') return rateQuestionCode(questionId, identity.seed);
  }
  if (canonicalQuestionPattern.test(questionId)) return questionId;
  const row = aliases.rows.find(row => row.course === course && row.activityId === activityId && row.questionId === questionId);
  if (row) return row.code;
  try {
    if (activityId === 'igcse/formulae') return formulaIdentity(questionId).code;
    if (activityId === 'igcse/equations') return equationIdentity(questionId).code;
  } catch { return undefined; }
  for (const prefix of questionPrefixes[activityId] ?? []) {
    const table = fixedIds[prefix as keyof typeof fixedIds] as Readonly<Record<string, string>> | undefined;
    if (table?.[questionId]) return table[questionId];
  }
  return undefined;
}
/** Existing providers still own source aliases and encoded seeds. Only explicit display aliases reverse here. */
export function questionLookupInput(course: Course, activityId: string, input: string): string {
  const raw = input.trim();
  if (!activityId.startsWith(course + '/')) return raw;
  const alias = aliases.rows.find(row => row.course === course && row.activityId === activityId && row.code === raw.toUpperCase());
  if (alias) return alias.questionId;
  return raw;
}
export function recallLookupIdentity(course: Course, input: string) {
  const raw = input.trim();
  return aliases.rows.find(row => row.course === course && row.activityId === course + '/recall' && row.code === raw.toUpperCase()) ?? null;
}
