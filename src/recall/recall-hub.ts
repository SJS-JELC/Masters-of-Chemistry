import type { Course, Namespace } from '../contracts/identity.ts';
import type { RecallFact, RecallProgress, RecallSession } from '../contracts/recall.ts';
import { activeRecallQueue } from './compatibility.ts';
import {
  canonicalRecallScope,
  factsForRecallScope,
  type RecallTopic,
  topicsFor,
  type RecallLaunchScope,
  type RecallPreferences,
} from './session-contract.ts';

export function initialRecallPreferences(namespace: Namespace): RecallPreferences {
  const scope = { kind: 'global' as const, topicIds: topicsFor(namespace.course).map((t) => t.id) };
  return { namespace, globalTopicIds: scope.topicIds, mode: 'test', lastScope: scope };
}
export function recallTestSessionId(
  namespace: Namespace,
  scope: RecallLaunchScope,
  kind: RecallSession['kind'],
): string {
  // The repository already keys by namespace; keep IDs bounded for long profile IDs.
  return (
    'recall:test:' + kind + ':' + JSON.stringify([namespace.course, canonicalRecallScope(scope)])
  );
}
/** Preserve submitted history; active queues contain only currently selected canonical facts. */
export function reconcileRecallTestSession(
  session: RecallSession,
  course: Course,
  facts: readonly RecallFact[],
  selected: readonly RecallFact[],
  scope: RecallLaunchScope,
): RecallSession {
  const allowed = new Set(selected.map((f) => f.id));
  const active = activeRecallQueue(session.factIds, course, facts).filter((id) => allowed.has(id));
  // Newly authorised facts are included without inheriting a retired question's visits.
  const factIds = [...new Set([...active, ...selected.map((f) => f.id)])];
  const keepCurrent = !!session.currentFactId && factIds.includes(session.currentFactId);
  return {
    ...session,
    mode: 'test',
    scope: canonicalRecallScope(scope),
    factIds,
    visitedFactIds: session.visitedFactIds.filter((id) => factIds.includes(id)),
    currentFactId: keepCurrent ? session.currentFactId : null,
    currentAttemptId: keepCurrent ? session.currentAttemptId : null,
  };
}
export function addRecallTopics(
  current: readonly string[],
  additional: readonly string[],
): readonly string[] {
  return [...new Set([...current, ...additional])];
}

/** Display-only recall progress: canonical facts count once; untested facts stay at stage zero. */
export function recallTopicMastery(
  namespace: Namespace,
  facts: readonly RecallFact[],
  topicId: string,
  progress: readonly RecallProgress[],
) {
  const selected = factsForRecallScope(facts, namespace.course, {
    kind: 'global',
    topicIds: [topicId],
  });
  const stages = new Map<string, RecallProgress>();
  for (const record of progress) {
    if (
      record.namespace.course !== namespace.course ||
      record.namespace.profileId !== namespace.profileId
    )
      continue;
    const previous = stages.get(record.factId);
    if (!previous || record.lastCompletedAt >= previous.lastCompletedAt)
      stages.set(record.factId, record);
  }
  const meanStage = selected.length
    ? selected.reduce((sum, fact) => sum + (stages.get(fact.id)?.stage ?? 0), 0) / selected.length
    : 0;
  return {
    factCount: selected.length,
    meanStage,
    colour: meanStage === 0 ? 'grey' : meanStage < 2 ? 'yellow' : meanStage < 4 ? 'mint' : 'purple',
    label:
      selected.length +
      (selected.length === 1 ? ' fact' : ' facts') +
      ' · Recall mastery ' +
      meanStage.toFixed(1) +
      ' / 5',
  };
}
export function activeRecallTopics(
  course: Course,
  facts: readonly RecallFact[],
): readonly RecallTopic[] {
  return topicsFor(course).filter(
    (topic) =>
      factsForRecallScope(facts, course, { kind: 'global', topicIds: [topic.id] }).length > 0,
  );
}

/** Bulk selection is scoped: outside topics survive both directions. */
export function allRecallTopicsSelected(current: readonly string[], eligible: readonly string[]): boolean {
  return eligible.length > 0 && eligible.every(id => current.includes(id));
}
export function toggleRecallTopics(current: readonly string[], eligible: readonly string[]): readonly string[] {
  return allRecallTopicsSelected(current, eligible)
    ? current.filter(id => !eligible.includes(id))
    : addRecallTopics(current, eligible);
}
