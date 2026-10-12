import { shuffleRecallIds } from './selection.ts';
import type { Namespace } from '../contracts/identity.ts';
import type { PlayerAttempt } from '../contracts/attempt.ts';
import type { RecallEvidence, RecallProgress, RecallSession } from '../contracts/recall.ts';
export const RECALL_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
export const RECALL_DAY_TIMEZONE = 'Europe/London';
export function recallDate(at: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: RECALL_DAY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}
export function initialRecallProgress(namespace: Namespace, factId: string): RecallProgress {
  return {
    namespace,
    factId,
    stage: 0,
    dueAt: 0,
    lastAdvancedDate: null,
    lastCompletedAt: 0,
    lastAttemptId: null,
  };
}
export function assessmentToRecallEvidence(state: PlayerAttempt): RecallEvidence | null {
  if (
    state.mode !== 'student' ||
    !('kind' in state.target) ||
    state.target.kind !== 'recall' ||
    state.phase !== 'assessed'
  )
    return null;
  const first = state.firstAssessment;
  return {
    kind: 'recall',
    id: state.attemptId,
    namespace: state.namespace,
    factId: state.target.factId,
    ...('definitionId' in state && state.definitionId ? { definitionId: state.definitionId } : {}),
    ref: state.ref as RecallEvidence['ref'],
    completedAt: first.assessedAt,
    outcome:
      first.kind === 'revealed'
        ? 'revealed'
        : state.firstResponse.assistance.length
          ? 'assisted'
          : first.kind === 'marked' && first.score === 1
            ? 'correct'
            : 'wrong',
    firstResponse: state.firstResponse,
    firstAssessment: first,
  };
}
/** Called inside the dedicated repository transaction; only first evidence advances. */
export function applyRecallEvidence(
  previous: RecallProgress | undefined,
  evidence: RecallEvidence,
): RecallProgress {
  const p = previous ?? initialRecallProgress(evidence.namespace, evidence.factId);
  if (
    p.factId !== evidence.factId ||
    p.namespace.course !== evidence.namespace.course ||
    p.namespace.profileId !== evidence.namespace.profileId
  )
    throw Error('Recall progress namespace mismatch.');
  if (p.lastAttemptId === evidence.id) return p;
  if (evidence.completedAt < p.lastCompletedAt) return p; // late restored assessment cannot rewrite a newer schedule
  const date = recallDate(evidence.completedAt);
  const correct = evidence.outcome === 'correct';
  const advance = correct && evidence.completedAt >= p.dueAt && date !== p.lastAdvancedDate;
  const stage = (correct ? Math.min(5, p.stage + (advance ? 1 : 0)) : 0) as RecallProgress['stage'];
  return {
    ...p,
    stage,
    dueAt: correct
      ? advance
        ? evidence.completedAt + RECALL_INTERVAL_DAYS[Math.max(0, stage - 1)]! * 86400000
        : p.dueAt
      : evidence.completedAt,
    lastAdvancedDate: advance ? date : p.lastAdvancedDate,
    lastCompletedAt: evidence.completedAt,
    lastAttemptId: evidence.id,
  };
}
export function selectRecallFact(
  session: RecallSession,
  progress: readonly RecallProgress[],
  at: number,
): string | null {
  const byId = new Map(progress.map((p) => [p.factId, p]));
  const fresh = session.factIds.filter((id) => !session.visitedFactIds.includes(id));
  if (session.kind === 'recall-practice') return fresh[0] ?? null;
  return (
    fresh
      .filter((id) => (byId.get(id)?.dueAt ?? 0) <= at)[0] ?? null
  );
}
export function createRecallSession(
  namespace: Namespace,
  id: string,
  kind: RecallSession['kind'],
  factIds: readonly string[],
  gemIds: readonly string[] | null = null,
): RecallSession {
  return {
    kind,
    id,
    namespace,
    gemIds,
    factIds: shuffleRecallIds(factIds),
    currentAttemptId: null,
    currentFactId: null,
    submittedAttemptIds: [],
    visitedFactIds: [],
    status: 'active',
  };
}
