import { isPrimaryRecallGem } from './selection.ts';
import type { Course, Namespace } from '../contracts/identity.ts';
import type { RecallFact, RecallSession } from '../contracts/recall.ts';
import catalogue from '../landing/catalogue-data.json' with { type: 'json' };
import type { LandingCatalogue } from '../landing/catalogue.ts';
const catalogues = catalogue as unknown as Record<Course, LandingCatalogue>;

export type RecallMode = 'test' | 'flashcards';
export type RecallLaunchScope =
  | Readonly<{ kind: 'global'; topicIds: readonly string[] }>
  | Readonly<{ kind: 'gem'; gemId: string }>;
export type RecallYear = 'l6' | 'u6' | 'fourth' | 'lower' | 'upper';
export type RecallStrand = 'physical-inorganic' | 'organic';
export interface RecallTopic {
  readonly id: string;
  readonly course: Course;
  readonly title: string;
  readonly year: RecallYear;
  readonly strand?: RecallStrand;
  readonly batchId: string;
  readonly gemIds: readonly string[];
}
/** Explicit curriculum assignments; map display groups are not strand authority. */
const assignments: Readonly<
  Record<
    string,
    Readonly<{ year: RecallYear; physical: readonly number[]; organic: readonly number[] }>
  >
> = {
  'l6-t1': { year: 'l6', physical: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], organic: [] },
  'l6-t2': { year: 'l6', physical: [1, 2], organic: [3, 4, 5, 6, 7, 8, 9] },
  'u6-t1': { year: 'u6', physical: [1, 2, 3, 4, 5], organic: [] },
  'u6-t2': { year: 'u6', physical: [7], organic: [1, 2, 3, 4, 5, 6] },
  fourth: { year: 'fourth', physical: [], organic: [] },
  lower: { year: 'lower', physical: [], organic: [] },
  upper: { year: 'upper', physical: [], organic: [] },
};
export const recallTopics: readonly RecallTopic[] = (['alevel', 'igcse'] as const).flatMap(
  (course) =>
    catalogue[course].groups.flatMap((group) => {
      const assignment = assignments[group.key];
      if (!assignment) throw Error('Missing recall topic assignment: ' + group.key);
      return group.topics.map((topic) => {
        const n = topic[0] as number;
        const strand =
          course === 'alevel'
            ? assignment.physical.includes(n)
              ? 'physical-inorganic'
              : assignment.organic.includes(n)
                ? 'organic'
                : null
            : null;
        if (course === 'alevel' && !strand)
          throw Error('Missing recall strand: ' + group.key + '-' + n);
        return {
          id: group.key + '-' + n,
          course,
          title: topic[1] as string,
          year: assignment.year,
          ...(strand ? { strand } : {}),
          batchId: assignment.year + (strand ? '-' + strand : ''),
          gemIds: (topic[2] as readonly string[]).flatMap((_, i) => {
            const legacy = group.key + '-' + n + '-' + (i + 1);
            const current = catalogues[course].display.identities?.[legacy];
            return current && current !== legacy ? [legacy, current] : [legacy];
          }),
        };
      });
    }),
);
export function topicsFor(
  course: Course,
  filter: Readonly<{ year?: RecallYear; strand?: RecallStrand; batchId?: string }> = {},
): readonly RecallTopic[] {
  return recallTopics.filter(
    (t) =>
      t.course === course &&
      (!filter.year || t.year === filter.year) &&
      (!filter.strand || t.strand === filter.strand) &&
      (!filter.batchId || t.batchId === filter.batchId),
  );
}
/** One canonical ID even when several selected topics/gems share a fact. */
export function factsForRecallScope(
  facts: readonly RecallFact[],
  course: Course,
  scope: RecallLaunchScope,
): readonly RecallFact[] {
  const gems =
    scope.kind === 'gem'
      ? [scope.gemId]
      : topicsFor(course)
          .filter((t) => scope.topicIds.includes(t.id))
          .flatMap((t) => t.gemIds);
  const seen = new Set<string>();
  return facts.filter(
    (f) =>
      f.course === course && isPrimaryRecallGem(f, gems) && !seen.has(f.id) && !!seen.add(f.id),
  );
}
export function canonicalRecallScope(scope: RecallLaunchScope): RecallLaunchScope {
  return scope.kind === 'gem'
    ? scope
    : { kind: 'global', topicIds: [...new Set(scope.topicIds)].sort() };
}
/** Namespace and scope encoded as a tuple; delimiters in profile IDs cannot collide. */
export function recallScopeKey(namespace: Namespace, scope: RecallLaunchScope): string {
  return JSON.stringify([namespace.profileId, namespace.course, canonicalRecallScope(scope)]);
}
export interface RecallPreferences {
  readonly namespace: Namespace;
  readonly globalTopicIds: readonly string[];
  readonly mode: RecallMode;
  readonly lastScope: RecallLaunchScope;
}
export function rememberRecallLaunch(
  preferences: RecallPreferences,
  mode: RecallMode,
  scope: RecallLaunchScope,
): RecallPreferences {
  return {
    ...preferences,
    mode,
    lastScope: canonicalRecallScope(scope),
    ...(scope.kind === 'global' ? { globalTopicIds: [...new Set(scope.topicIds)] } : {}),
  };
}
export function sessionRecallMode(session: RecallSession): RecallMode {
  return session.mode ?? 'test';
}
/** Legacy whole-bank global sessions map to all course topics. */
export function sessionRecallScope(session: RecallSession): RecallLaunchScope {
  if (session.scope) return session.scope;
  if (session.gemIds?.length === 1) return { kind: 'gem', gemId: session.gemIds[0]! };
  const topics = topicsFor(session.namespace.course);
  if (
    session.gemIds !== null &&
    topics.some(
      (t) =>
        t.gemIds.some((g) => session.gemIds!.includes(g)) &&
        !t.gemIds.every((g) => session.gemIds!.includes(g)),
    )
  )
    throw Error('Legacy partial-topic selection needs an explicit fresh topic selection.');
  return {
    kind: 'global',
    topicIds: topics
      .filter((t) => session.gemIds === null || t.gemIds.every((g) => session.gemIds!.includes(g)))
      .map((t) => t.id),
  };
}
export type RecallFlashcardClassification = 'got-it' | 'practise-again';
/** Only references and learner deck state: no answer snapshots, marks or assessment evidence. */
export interface RecallFlashcardCheckpoint {
  readonly studyRunId?: string;
  readonly namespace: Namespace;
  readonly scope: RecallLaunchScope;
  readonly factIds: readonly string[];
  readonly round: number;
  readonly roundFactIds: readonly string[];
  readonly currentFactId: string | null;
  readonly classifications: Readonly<Record<string, RecallFlashcardClassification>>;
  readonly revealed: boolean;
  /** Seen-answer eligibility is independent of the visible face; absent in older checkpoints. */
  readonly answerSeen?: boolean;
  readonly undoStack: readonly Readonly<{
    factId: string;
    previous: RecallFlashcardClassification | null;
    revealed: boolean;
    answerSeen?: boolean;
  }>[];
}
export function validateRecallScope(scope: RecallLaunchScope, course: Course): void {
  const topics = topicsFor(course);
  if (scope.kind === 'gem') {
    if (!topics.some((t) => t.gemIds.includes(scope.gemId)))
      throw Error('Unknown recall gem scope.');
  } else if (scope.kind === 'global') {
    if (
      !Array.isArray(scope.topicIds) ||
      new Set(scope.topicIds).size !== scope.topicIds.length ||
      scope.topicIds.some((id) => !topics.some((t) => t.id === id))
    )
      throw Error('Unknown or duplicate recall topic.');
  } else throw Error('Invalid recall scope.');
}
export function validateFlashcardCheckpoint(
  checkpoint: RecallFlashcardCheckpoint,
  facts: readonly RecallFact[],
): void {
  const allowed = [
    'namespace',
    'scope',
    'factIds',
    'round',
    'roundFactIds',
    'currentFactId',
    'classifications',
    'revealed',
    'answerSeen',
    'undoStack',
    'studyRunId',
  ];
  if (Object.keys(checkpoint).some((k) => !allowed.includes(k)))
    throw Error('Unsupported flashcard checkpoint field.');
  if (
    checkpoint.studyRunId !== undefined &&
    (typeof checkpoint.studyRunId !== 'string' ||
      !/^[a-zA-Z0-9-]{1,100}$/.test(checkpoint.studyRunId))
  )
    throw Error('Invalid flashcard study run.');
  validateRecallScope(checkpoint.scope, checkpoint.namespace.course);
  const expected = factsForRecallScope(facts, checkpoint.namespace.course, checkpoint.scope).map(
    (f) => f.id,
  );
  const unique = (ids: readonly string[]) =>
    Array.isArray(ids) &&
    new Set(ids).size === ids.length &&
    ids.every((id) => typeof id === 'string');
  if (
    !checkpoint.namespace.profileId ||
    !Number.isSafeInteger(checkpoint.round) ||
    checkpoint.round < 1 ||
    typeof checkpoint.revealed !== 'boolean' ||
    (checkpoint.answerSeen !== undefined && typeof checkpoint.answerSeen !== 'boolean') ||
    (checkpoint.revealed && checkpoint.answerSeen === false) ||
    !unique(checkpoint.factIds) ||
    !expected.length ||
    JSON.stringify([...checkpoint.factIds].sort()) !== JSON.stringify([...expected].sort())
  )
    throw Error('Invalid flashcard selection.');
  if (
    !unique(checkpoint.roundFactIds) ||
    checkpoint.roundFactIds.some((id) => !checkpoint.factIds.includes(id)) ||
    (checkpoint.currentFactId !== null &&
      !checkpoint.roundFactIds.includes(checkpoint.currentFactId)) ||
    (checkpoint.currentFactId === null && (checkpoint.revealed || checkpoint.answerSeen))
  )
    throw Error('Invalid flashcard round.');
  if (
    Object.entries(checkpoint.classifications).some(
      ([id, value]) =>
        !checkpoint.factIds.includes(id) || !['got-it', 'practise-again'].includes(value),
    )
  )
    throw Error('Invalid flashcard classification.');
  if (
    !Array.isArray(checkpoint.undoStack) ||
    checkpoint.undoStack.some(
      (u) =>
        !checkpoint.factIds.includes(u.factId) ||
        typeof u.revealed !== 'boolean' ||
        (u.answerSeen !== undefined && typeof u.answerSeen !== 'boolean') ||
        (u.revealed && u.answerSeen === false) ||
        (u.previous !== null && !['got-it', 'practise-again'].includes(u.previous)),
    )
  )
    throw Error('Invalid flashcard undo history.');
}

export function validateRecallPreferences(preferences: RecallPreferences): void {
  if (
    !preferences.namespace.profileId ||
    !['alevel', 'igcse'].includes(preferences.namespace.course) ||
    !['test', 'flashcards'].includes(preferences.mode)
  )
    throw Error('Invalid recall preferences.');
  validateRecallScope(
    { kind: 'global', topicIds: preferences.globalTopicIds },
    preferences.namespace.course,
  );
  validateRecallScope(preferences.lastScope, preferences.namespace.course);
}
/** A changed active deck needs an explicit restart; never silently relabel saved classifications. */
export function flashcardCheckpointCompatible(
  checkpoint: RecallFlashcardCheckpoint,
  namespace: Namespace,
  scope: RecallLaunchScope,
  facts: readonly RecallFact[],
): boolean {
  if (recallScopeKey(checkpoint.namespace, checkpoint.scope) !== recallScopeKey(namespace, scope))
    return false;
  try {
    validateFlashcardCheckpoint(checkpoint, facts);
    return true;
  } catch {
    return false;
  }
}
