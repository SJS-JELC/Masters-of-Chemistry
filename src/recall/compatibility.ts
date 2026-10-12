import type { Course } from '../contracts/identity.ts';
import type {
  RecallAttempt,
  RecallDefinitionId,
  RecallFact,
  RecallField,
  RecallEntry,
  RecallExceptionEntryResponse,
} from '../contracts/recall.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../contracts/recall.ts';
import definitions from './historical-facts.json' with { type: 'json' };

function freeze(value: unknown): void {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}
freeze(definitions);
/** Static definition catalogue; never a question snapshot embedded in an attempt. */
export const historicalRecallFacts = definitions as readonly RecallFact[];
const historicalById = new Map(historicalRecallFacts.map((f) => [f.course + ':' + f.id, f]));
export function historicalRecallFact(course: Course, factId: string): RecallFact | null {
  return historicalById.get(course + ':' + factId) ?? null;
}
/** Unknown named contracts fail closed instead of being interpreted using today's bank. */
export function recallDefinitionFor(
  course: Course,
  factId: string,
  currentFacts: readonly RecallFact[],
  definitionId?: RecallDefinitionId,
): RecallFact | null {
  if (definitionId === undefined) return historicalRecallFact(course, factId);
  if (definitionId !== CURRENT_RECALL_DEFINITION_ID) throw Error('Unknown recall definition ID.');
  return currentFacts.find((f) => f.course === course && f.id === factId) ?? null;
}
function fields(fact: RecallFact): readonly RecallField[] {
  return (
    fact.fields ?? [
      {
        id: 'answer',
        label: 'Answer',
        answer: fact.answer,
        accepted: fact.accepted ?? [],
        ...(fact.matching ? { matching: fact.matching } : {}),
        ...(fact.entry ? { entry: fact.entry } : {}),
        ...(fact.alternative ? { alternative: fact.alternative } : {}),
      },
    ]
  );
}
/** Conservative semantics comparison: unchanged IDs/kinds alone cannot establish compatibility. */
export function recallResponseFormatSignature(fact: RecallFact): string {
  const field = (f: RecallField) => ({
    id: f.id,
    label: f.label,
    answer: f.answer,
    entry: f.entry ?? { kind: 'text' },
  });
  return JSON.stringify({
    prompt: fact.prompt,
    answer: fact.answer,
    responseFormat: fact.responseFormat ?? null,
    fields: fields(fact).map(field),
    fieldOrder: fact.fieldOrder ?? 'labelled',
    answerGroups: (fact.answerGroups ?? fields(fact)).map(field),
    exceptionCollection: fact.exceptionCollection ?? null,
    responsePairs: fact.responsePairs ?? null,
    answerPairs: fact.answerPairs ?? null,
    pairCoverage: fact.pairCoverage ?? null,
  });
}
export function recallResponseFormatCompatible(previous: RecallFact, current: RecallFact): boolean {
  return (
    previous.id === current.id &&
    previous.course === current.course &&
    recallResponseFormatSignature(previous) === recallResponseFormatSignature(current)
  );
}
export type RecallRestoreDisposition =
  | Readonly<{ kind: 'resume'; fact: RecallFact; definitionId: RecallDefinitionId }>
  | Readonly<{ kind: 'history'; fact: RecallFact; active: boolean }>
  | Readonly<{ kind: 'fresh'; reason: 'retired' | 'response-format-changed' }>;
/** Caller retains the old attempt/evidence and creates a new ID/clock for fresh attempts. */
export function recallAttemptRestoreDisposition(
  attempt: RecallAttempt,
  currentFacts: readonly RecallFact[],
): RecallRestoreDisposition {
  const previous = recallDefinitionFor(
    attempt.namespace.course,
    attempt.target.factId,
    currentFacts,
    attempt.definitionId,
  );
  if (!previous) throw Error('Missing historical recall definition.');
  const current = currentFacts.find(
    (f) => f.course === attempt.namespace.course && f.id === attempt.target.factId,
  );
  if (attempt.phase === 'assessed') return { kind: 'history', fact: previous, active: !!current };
  if (!current) return { kind: 'fresh', reason: 'retired' };
  if (!recallResponseFormatCompatible(previous, current))
    return { kind: 'fresh', reason: 'response-format-changed' };
  return { kind: 'resume', fact: current, definitionId: CURRENT_RECALL_DEFINITION_ID };
}
/** Legacy IDs remain valid for history/progress storage even when absent from active queues. */
export function isKnownRecallFact(
  course: Course,
  factId: string,
  currentFacts: readonly RecallFact[],
): boolean {
  return (
    !!historicalRecallFact(course, factId) ||
    currentFacts.some((f) => f.course === course && f.id === factId)
  );
}
export function activeRecallQueue(
  factIds: readonly string[],
  course: Course,
  currentFacts: readonly RecallFact[],
): readonly string[] {
  const active = new Set(currentFacts.filter((f) => f.course === course).map((f) => f.id));
  return [...new Set(factIds)].filter((id) => active.has(id));
}
/** Stable existing IDs retain their progress; retired/replacement/new IDs cannot inherit it. */
export function hasExistingRecallProgressIdentity(
  course: Course,
  factId: string,
  currentFacts: readonly RecallFact[],
): boolean {
  return (
    !!historicalRecallFact(course, factId) &&
    currentFacts.some((f) => f.course === course && f.id === factId)
  );
}

/** Every control stores kind:text raw data so shared submit/timing remain authoritative. */
export function recallEntryForField(field: RecallField): RecallEntry {
  return field.entry ?? { kind: 'text' };
}
export function encodeRecallExceptionEntries(
  entries: readonly RecallExceptionEntryResponse[],
): string {
  // Apply the same checks on encode and decode; learner-entered strings stay unchanged.
  const encoded = JSON.stringify(entries);
  decodeRecallExceptionEntries(encoded);
  return encoded;
}
export function decodeRecallExceptionEntries(raw: string): readonly RecallExceptionEntryResponse[] {
  const value: unknown = JSON.parse(raw);
  if (
    !Array.isArray(value) ||
    value.length > 1000 ||
    value.some(
      (v) =>
        !v ||
        typeof v !== 'object' ||
        Object.keys(v).sort().join(',') !== 'id,value' ||
        typeof v.id !== 'string' ||
        !/^[a-zA-Z0-9_-]+$/.test(v.id) ||
        typeof v.value !== 'string',
    ) ||
    new Set(value.map((v) => v.id)).size !== value.length
  )
    throw Error('Malformed recall exception entries.');
  return value as readonly RecallExceptionEntryResponse[];
}
/** Explicit opt-in plus post-check wrong nonempty free text; never changes automatic marks. */
export function recallAlternativeEligible(
  field: RecallField,
  raw: string,
  phase: 'answering' | 'assessed',
  automaticCorrect: boolean,
  classification: 'rejected' | 'unrecognized' = 'unrecognized',
): boolean {
  return (
    phase === 'assessed' &&
    classification === 'unrecognized' &&
    !automaticCorrect &&
    !!raw.trim() &&
    recallEntryForField(field).kind === 'text' &&
    field.alternative?.kind === 'valid-alternative'
  );
}

/** Content/entry boundary checks are independent of formula acceptance/correctness. */
export function validateRecallEntry(entry: RecallEntry): void {
  switch (entry.kind) {
    case 'text':
    case 'general-formula':
      return;
    case 'numeric':
      if (typeof entry.unit === 'string') return;
      break;
    case 'signed-charge':
      if (typeof entry.requireSign === 'boolean') return;
      break;
    case 'choice':
      if (
        (entry.presentation === undefined || entry.presentation === 'buttons') &&
        Array.isArray(entry.options) &&
        entry.options.length > 0 &&
        new Set(entry.options.map((o) => o.id)).size === entry.options.length &&
        entry.options.every(
          (o) => typeof o.id === 'string' && !!o.id && typeof o.label === 'string' && !!o.label,
        )
      )
        return;
      break;
    case 'chemical-formula':
      if (entry.notation === 'molecular') return;
      if (
        entry.notation === 'ion' &&
        Number.isSafeInteger(entry.atomCountDigits) &&
        entry.atomCountDigits >= 0 &&
        entry.atomCountDigits <= 100
      )
        return;
      break;
  }
  throw Error('Invalid recall entry metadata.');
}
