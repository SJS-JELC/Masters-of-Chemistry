import type { Namespace } from '../contracts/identity.ts';
import type {
  RecallAttempt,
  RecallEvidence,
  RecallProgress,
  RecallSession,
} from '../contracts/recall.ts';
import { recallFacts, factsFor } from '../recall/facts.ts';
import {
  recallFields,
  createRecallMarkingPolicy,
  createRecallLearningReviewPolicy,
} from '../recall/marking.ts';
import { assessmentToRecallEvidence } from '../recall/scheduler.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../contracts/recall.ts';
import {
  historicalRecallFacts,
  recallDefinitionFor,
  isKnownRecallFact,
} from '../recall/compatibility.ts';
import {
  historicalRecallFields,
  createHistoricalRecallMarkingPolicy,
} from '../recall/historical-marking.ts';
import {
  factsForRecallScope,
  validateRecallScope,
  validateRecallPreferences,
  validateFlashcardCheckpoint,
} from '../recall/session-contract.ts';
import type { RecallPreferences, RecallFlashcardCheckpoint } from '../recall/session-contract.ts';
import {
  InvalidData,
  requireData,
  record,
  keys,
  identifiers,
  finite,
  id,
  same,
  safeJson,
  validateNamespace,
  validateAttemptState,
  array,
  type JsonObject,
} from './validation.ts';
export { assessmentToRecallEvidence, applyRecallEvidence } from '../recall/scheduler.ts';
export { recallScopeKey, validateRecallScope } from '../recall/session-contract.ts';
export { recallAttemptRestoreDisposition } from '../recall/compatibility.ts';
export { recallFacts } from '../recall/facts.ts';
export function validateRecallAttempt(value: unknown): asserts value is RecallAttempt {
  validateAttemptState(value, {
    target: recallTarget,
    reference: recallReference,
    validate: validateRecallFields,
  });
}
function validateRecallFields(
  a: import('./validation.ts').JsonObject,
  t: import('./validation.ts').JsonObject,
): void {
  validateNamespace(a.namespace);

  requireData(
    a.definitionId === undefined || a.definitionId === CURRENT_RECALL_DEFINITION_ID,
    'Unknown recall definition ID',
  );
  const fact = recallDefinitionFor(
    a.namespace.course as Namespace['course'],
    String(t.factId),
    recallFacts,
    a.definitionId as RecallAttempt['definitionId'],
  );
  requireData(fact, 'Missing recall definition');
  const historical = a.definitionId === undefined;
  const fields = historical ? historicalRecallFields(fact) : recallFields(fact);
  const responseFieldIds = [
    ...fields.map((field) => field.id),
    ...(!historical && fact.exceptionCollection ? [fact.exceptionCollection.id] : []),
  ];
  requireData(
    Object.entries(record(a.currentResponses, 'recall responses')).every(
      ([id, v]) => responseFieldIds.includes(id) && record(v, 'recall text').kind === 'text',
    ),
    'Invalid recall response field',
  );
  requireData(
    a.phase === 'answering' || a.phase === 'assessed',
    'Recall uses automatic typed assessment only',
  );
  if (a.phase === 'assessed') {
    const first = record(a.firstResponse, 'recall first response');
    requireData(
      Object.entries(record(first.responses, 'recall frozen responses')).every(
        ([id, v]) => responseFieldIds.includes(id) && record(v, 'recall text').kind === 'text',
      ),
      'Invalid frozen recall response field',
    );
    const assessmentValue = record(a.firstAssessment, 'recall assessment');
    requireData(
      assessmentValue.kind === 'marked' || assessmentValue.kind === 'revealed',
      'Unsupported recall assessment',
    );
    if (assessmentValue.kind === 'marked') {
      const q = {
        ref: a.ref,
        parts: fields.map((f) => ({ id: f.id })),
      } as unknown as import('../contracts/question.ts').Question;
      const marked = (
        historical ? createHistoricalRecallMarkingPolicy([fact]) : createRecallMarkingPolicy([fact])
      ).mark(q, first.responses as import('../contracts/question.ts').Responses);
      requireData(
        marked.accepted &&
          same(marked.marks, assessmentValue.marks) &&
          assessmentValue.score === (marked.marks.earned === marked.marks.available ? 1 : 0),
        'Recall first assessment differs from deterministic marking',
      );
    }
    if ('learningReview' in a) {
      requireData(
        !historical && a.namespace.course === 'igcse',
        'Learning corrections require a current IGCSE recall definition',
      );
      const q = {
        ref: a.ref,
        parts: fields.map((f) => ({ id: f.id })),
      } as unknown as import('../contracts/question.ts').Question;
      const review = record(a.learningReview, 'recall learning review');
      try {
        const expected = createRecallLearningReviewPolicy([fact]).review(
          q,
          a.firstResponse as unknown as import('../contracts/attempt.ts').FrozenResponse,
          a.firstAssessment as unknown as import('../contracts/attempt.ts').Assessment,
          // Durable decisions refer to the frozen original, even after later learning edits.
          (a.firstResponse as unknown as import('../contracts/attempt.ts').FrozenResponse)
            .responses,
          review.decisions as unknown as readonly import('../contracts/attempt.ts').ValidAlternativeDecision[],
        );
        requireData(
          same(expected, review),
          'Recall learning correction differs from eligible frozen response review',
        );
      } catch (error) {
        if (error instanceof InvalidData) throw error;
        throw new InvalidData(
          error instanceof Error ? error.message : 'Invalid recall learning correction',
        );
      }
    }
  }
}
function recallTarget(value: unknown, course: unknown): JsonObject {
  const t = record(value, 'recall target');
  keys(t, ['kind', 'course', 'activityId', 'factId', 'level']);
  requireData(
    t.kind === 'recall' &&
      t.course === course &&
      t.activityId === String(course) + '/recall' &&
      t.level === 1 &&
      isKnownRecallFact(course as Namespace['course'], String(t.factId), recallFacts),
    'Invalid recall target/fact',
  );
  return t;
}
function recallReference(value: unknown, course: unknown): JsonObject {
  const r = record(value, 'recall reference');
  keys(r, ['activityId', 'questionId', 'seed', 'level']);
  requireData(
    r.activityId === String(course) + '/recall' &&
      r.seed === 0 &&
      r.level === 1 &&
      isKnownRecallFact(course as Namespace['course'], String(r.questionId), recallFacts),
    'Invalid recall reference',
  );
  return r;
}
export function validateRecallEvidence(value: unknown): asserts value is RecallEvidence {
  safeJson(value);
  const e = record(value, 'recall evidence');
  keys(e, [
    'definitionId',
    'kind',
    'id',
    'namespace',
    'factId',
    'ref',
    'completedAt',
    'outcome',
    'firstResponse',
    'firstAssessment',
  ]);
  validateNamespace(e.namespace);
  requireData(
    e.kind === 'recall' && id(e.id) && id(e.factId) && finite(e.completedAt) && e.completedAt > 0,
    'Invalid recall evidence',
  );
  const attempt = {
    mode: 'student',
    ...(e.definitionId !== undefined ? { definitionId: e.definitionId } : {}),
    namespace: e.namespace,
    attemptId: e.id,
    ref: e.ref,
    target: {
      kind: 'recall',
      course: e.namespace.course,
      activityId: e.namespace.course + '/recall',
      factId: e.factId,
      level: 1,
    },
    currentResponses: record(e.firstResponse, 'first').responses,
    assistance: record(e.firstResponse, 'first').assistance,
    phase: 'assessed',
    firstResponse: e.firstResponse,
    firstAssessment: e.firstAssessment,
  };
  validateRecallAttempt(attempt);
  requireData(
    same(assessmentToRecallEvidence(attempt), e),
    'Recall evidence provenance/outcome mismatch',
  );
}
export function validateRecallProgress(value: unknown): asserts value is RecallProgress {
  safeJson(value);
  const p = record(value, 'recall progress');
  keys(p, [
    'namespace',
    'factId',
    'stage',
    'dueAt',
    'lastAdvancedDate',
    'lastCompletedAt',
    'lastAttemptId',
  ]);
  validateNamespace(p.namespace);
  requireData(
    isKnownRecallFact(
      record(p.namespace, 'namespace').course as Namespace['course'],
      String(p.factId),
      recallFacts,
    ) &&
      Number.isInteger(p.stage) &&
      Number(p.stage) >= 0 &&
      Number(p.stage) <= 5 &&
      finite(p.dueAt) &&
      p.dueAt >= 0 &&
      finite(p.lastCompletedAt) &&
      p.lastCompletedAt >= 0 &&
      (p.lastAttemptId === null || id(p.lastAttemptId)) &&
      (p.lastAdvancedDate === null ||
        (typeof p.lastAdvancedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.lastAdvancedDate))),
    'Invalid recall progress',
  );
}
export function validateRecallSession(value: unknown): asserts value is RecallSession {
  safeJson(value);
  const s = record(value, 'recall session');
  keys(s, [
    'mode',
    'scope',
    'kind',
    'id',
    'namespace',
    'gemIds',
    'factIds',
    'currentAttemptId',
    'currentFactId',
    'submittedAttemptIds',
    'visitedFactIds',
    'status',
  ]);
  validateNamespace(s.namespace);
  requireData(
    id(s.id) &&
      ['recall-practice', 'recall-revision'].includes(String(s.kind)) &&
      ['active', 'paused', 'complete'].includes(String(s.status)),
    'Invalid recall session',
  );
  const gems = s.gemIds === null ? null : identifiers(s.gemIds, 'recall selected gems');
  const selected = identifiers(s.factIds, 'recall selected facts');
  if (s.mode !== undefined)
    requireData(s.mode === 'test' || s.mode === 'flashcards', 'Invalid recall session mode');
  if (s.scope !== undefined) {
    const scope = record(s.scope, 'recall scope');
    keys(scope, scope.kind === 'global' ? ['kind', 'topicIds'] : ['kind', 'gemId']);
    validateRecallScope(
      scope as unknown as import('../recall/session-contract.ts').RecallLaunchScope,
      s.namespace.course,
    );
    const expected = factsForRecallScope(
      recallFacts,
      s.namespace.course,
      scope as unknown as import('../recall/session-contract.ts').RecallLaunchScope,
    ).map((f) => f.id);
    requireData(
      same([...selected].sort(), expected.sort()),
      'Recall session must select its complete topic or gem scope',
    );
  } else {
    const expected = factsFor(s.namespace.course, gems).map((f) => f.id);
    const course = s.namespace.course;
    const previous = historicalRecallFacts
      .filter(
        (f) => f.course === course && (gems === null || f.gemIds.some((g) => gems.includes(g))),
      )
      .map((f) => f.id);
    requireData(
      same([...selected].sort(), expected.sort()) || same([...selected].sort(), previous.sort()),
      'Recall session must select whole legacy or current gem sets/global bank',
    );
  }
  requireData(
    identifiers(s.visitedFactIds, 'visited facts').every((id) => selected.includes(id)),
    'Unknown visited recall fact',
  );
  identifiers(s.submittedAttemptIds, 'recall submitted attempts');
  requireData(
    (s.currentAttemptId === null && s.currentFactId === null) ||
      (id(s.currentAttemptId) && selected.includes(String(s.currentFactId))),
    'Invalid current recall attempt',
  );
}

/** Dedicated self-marked deck/selection state cannot contain assessment evidence. */
export function validateSavedRecallPreferences(value: unknown): asserts value is RecallPreferences {
  safeJson(value);
  const p = record(value, 'recall preferences');
  keys(p, ['namespace', 'globalTopicIds', 'mode', 'lastScope']);
  validateNamespace(p.namespace);
  const scope = record(p.lastScope, 'recall preference scope');
  keys(scope, scope.kind === 'global' ? ['kind', 'topicIds'] : ['kind', 'gemId']);
  try {
    validateRecallPreferences(value as RecallPreferences);
  } catch (error) {
    throw new InvalidData(String(error));
  }
}
export function validateSavedRecallFlashcards(
  value: unknown,
): asserts value is RecallFlashcardCheckpoint {
  safeJson(value);
  const p = record(value, 'recall flashcards');
  validateNamespace(p.namespace);
  const scope = record(p.scope, 'recall flashcard scope');
  keys(scope, scope.kind === 'global' ? ['kind', 'topicIds'] : ['kind', 'gemId']);
  for (const u of array(p.undoStack, 'flashcard undo'))
    keys(record(u, 'flashcard undo entry'), ['factId', 'previous', 'revealed', 'answerSeen']);
  try {
    validateFlashcardCheckpoint(value as RecallFlashcardCheckpoint, recallFacts);
  } catch (error) {
    throw new InvalidData(String(error));
  }
}
