import type { Course, Namespace } from '../contracts/identity.ts';
import type {
  RecallAttempt,
  RecallFact,
  RecallProgress,
  RecallSession,
} from '../contracts/recall.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../contracts/recall.ts';
import type { ChemistryRepository, RepositoryResult } from '../contracts/repository.ts';
import type { LoadingTicket } from '../loading/coordinator.ts';
import { repositoryError } from '../loading/module-errors.ts';
import { createChemistryRepository } from '../persistence/repository.ts';
import { factsFor } from './facts.ts';
import { historicalRecallFact, recallAttemptRestoreDisposition } from './compatibility.ts';
import { createRecallSession, selectRecallFact } from './scheduler.ts';
import { recallRef } from './provider.ts';
import { shuffleRecallIds } from './selection.ts';
import { createFlashcardDeck, checkpointForDeck } from './flashcard-checkpoint.ts';
import {
  initialRecallPreferences,
  recallTestSessionId,
  reconcileRecallTestSession,
} from './recall-hub.ts';
import {
  factsForRecallScope,
  topicsFor,
  type RecallLaunchScope,
  type RecallPreferences,
  type RecallFlashcardCheckpoint,
  type RecallMode,
} from './session-contract.ts';

export type RecallDestination =
  | Readonly<{ kind: 'chooser' }>
  | Readonly<{ kind: 'test'; attempt: RecallAttempt; session: RecallSession }>
  | Readonly<{
      kind: 'teacher';
      fact: RecallFact;
      historical: boolean;
      factIds: readonly string[];
      index: number;
    }>
  | Readonly<{ kind: 'flashcards'; checkpoint: RecallFlashcardCheckpoint | null; fresh: boolean }>
  | Readonly<{ kind: 'completed'; session: RecallSession }>;
export interface PreparedRecall {
  readonly namespace: Namespace;
  readonly repository: ChemistryRepository;
  readonly preferences: RecallPreferences;
  readonly scope: RecallLaunchScope;
  readonly progress: readonly RecallProgress[];
  readonly destination: RecallDestination;
  /** Only abandoned preparation calls this; the visible host owns normal disposal. */
  dispose(): void;
}
export interface PrepareRecallInput {
  readonly course: Course;
  readonly databaseName: string;
  readonly ticket: LoadingTicket;
  readonly profileId?: string;
  readonly repository?: ChemistryRepository;
  readonly gemIds?: readonly string[];
  readonly mode?: 'student' | 'teacher';
  readonly reviewFact?: Readonly<{ factId: string; historical: boolean }>;
  readonly flowSessionId?: string;
  readonly autoStart?: boolean;
  /** Internal chooser/Next requests reuse the same preparation and persistence gate. */
  readonly launchMode?: RecallMode;
  readonly kind?: RecallSession['kind'];
  readonly preferences?: RecallPreferences;
  readonly scope?: RecallLaunchScope;
  readonly currentSession?: RecallSession;
  readonly freshFactId?: string;
}
export function recallResult<T>(result: RepositoryResult<T>): T {
  if (!result.ok) throw repositoryError(result.error);
  return result.value;
}
function current(ticket: LoadingTicket): void {
  if (!ticket.isCurrent()) throw new DOMException('Recall preparation superseded', 'AbortError');
}
// Failed first saves retry the same identity. Successful writes restore through IndexedDB.
const retainedAttempts = new Map<
  string,
  Readonly<{ attempt: RecallAttempt; session: RecallSession }>
>();
/** Prepare data and durable attempt identity without mounting a host or starting a clock. */
export async function prepareRecall(input: PrepareRecallInput): Promise<PreparedRecall> {
  const { course, ticket, gemIds, flowSessionId } = input;
  const namespace: Namespace = { course, profileId: input.profileId ?? 'local' };
  const repository = input.repository ?? createChemistryRepository(input.databaseName);
  try {
    const bank = factsFor(course);
    const preferences =
      input.preferences ??
      recallResult(await repository.loadRecallPreferences(namespace)) ??
      initialRecallPreferences(namespace);
    current(ticket);
    const progress = recallResult(await repository.recallProgress(namespace));
    current(ticket);
    const scope: RecallLaunchScope =
      input.scope ??
      (gemIds?.length === 1 ? { kind: 'gem', gemId: gemIds[0]! } : preferences.lastScope);
    const selected =
      gemIds && gemIds.length > 1
        ? factsFor(course, gemIds)
        : factsForRecallScope(bank, course, scope);
    let destination: RecallDestination = { kind: 'chooser' };
    const launchMode = input.launchMode ?? (input.autoStart && flowSessionId ? 'test' : undefined);
    if (input.mode === 'teacher' && input.reviewFact) {
      const fact = input.reviewFact.historical
        ? historicalRecallFact(course, input.reviewFact.factId)
        : bank.find((f) => f.id === input.reviewFact!.factId);
      if (!fact) throw Error('This question is unavailable for review.');
      destination = {
        kind: 'teacher',
        fact,
        historical: input.reviewFact.historical,
        factIds: [],
        index: 0,
      };
    } else if (launchMode === 'flashcards') {
      let checkpoint = recallResult(await repository.loadRecallFlashcards(namespace, scope));
      current(ticket);
      const fresh = !checkpoint;
      if (!checkpoint) {
        checkpoint = checkpointForDeck(
          createFlashcardDeck(shuffleRecallIds(selected.map((f) => f.id))),
          namespace,
          scope,
        );
        const value = checkpoint;
        recallResult(await ticket.persist(() => repository.saveRecallFlashcards(value)));
        current(ticket);
      }
      destination = { kind: 'flashcards', checkpoint, fresh };
    } else if (launchMode === 'test' || input.currentSession) {
      if (!selected.length)
        throw Error('No active facts in this selection. Add another topic to begin.');
      if (input.mode === 'teacher') {
        destination = {
          kind: 'teacher',
          fact: selected[0]!,
          historical: false,
          factIds: selected.map((f) => f.id),
          index: 0,
        };
      } else {
        const kind = input.kind ?? 'recall-practice';
        const id = flowSessionId ?? recallTestSessionId(namespace, scope, kind);
        const selection = gemIds?.length ? gemIds : scope.kind === 'gem' ? [scope.gemId] : null;
        let stored =
          input.currentSession ?? recallResult(await repository.loadRecallSession(namespace, id));
        current(ticket);
        if (!stored && !flowSessionId && !input.currentSession) {
          const legacyId =
            'recall:' +
            kind +
            ':' +
            (selection === null ? 'global' : [...selection].sort().join(','));
          const legacy = recallResult(await repository.loadRecallSession(namespace, legacyId));
          current(ticket);
          if (
            legacy &&
            (selection !== null ||
              (scope.kind === 'global' && scope.topicIds.length === topicsFor(course).length))
          )
            stored = { ...legacy, id };
        }
        if (flowSessionId && stored?.status === 'complete')
          destination = { kind: 'completed', session: stored };
        else {
          const reconciled = stored
            ? reconcileRecallTestSession(stored, course, bank, selected, scope)
            : null;
          const restored =
            reconciled && gemIds && gemIds.length > 1
              ? (() => {
                  const { scope: _scope, ...legacy } = reconciled;
                  return legacy;
                })()
              : reconciled;
          let session: RecallSession =
            restored && restored.status !== 'complete'
              ? { ...restored, status: 'active' }
              : {
                  ...createRecallSession(
                    namespace,
                    id,
                    kind,
                    selected.map((f) => f.id),
                    selection,
                  ),
                  mode: 'test',
                  ...(gemIds && gemIds.length > 1 ? {} : { scope }),
                };
          let attempt: RecallAttempt | null = null;
          let freshFactId = input.freshFactId;
          if (session.currentAttemptId) {
            const saved = recallResult(
              await repository.loadRecallAttempt(namespace, session.currentAttemptId),
            );
            current(ticket);
            if (!saved)
              throw Error(
                'The saved recall attempt is missing. Its session was preserved for review.',
              );
            const disposition = recallAttemptRestoreDisposition(saved, bank);
            if (disposition.kind === 'fresh') freshFactId = saved.target.factId;
            else
              attempt =
                disposition.kind === 'resume'
                  ? { ...saved, definitionId: disposition.definitionId }
                  : saved;
          }
          const retainedKey = JSON.stringify([
            input.databaseName,
            namespace,
            id,
            session.visitedFactIds,
            freshFactId ?? null,
            selected.map((f) => f.id),
          ]);
          const retained = retainedAttempts.get(retainedKey);
          if (!attempt && retained) {
            attempt = retained.attempt;
            session = retained.session;
          }
          if (!attempt) {
            const factId =
              freshFactId && session.factIds.includes(freshFactId)
                ? freshFactId
                : selectRecallFact(session, progress, Date.now());
            if (!factId) {
              session = {
                ...session,
                status: 'complete',
                currentAttemptId: null,
                currentFactId: null,
              };
              recallResult(await ticket.persist(() => repository.saveRecallSession(session)));
              current(ticket);
              destination = { kind: 'completed', session };
            } else {
              const ref = recallRef(course, factId),
                attemptId = crypto.randomUUID();
              attempt = {
                mode: 'student',
                definitionId: CURRENT_RECALL_DEFINITION_ID,
                namespace,
                attemptId,
                ref,
                target: { kind: 'recall', course, activityId: ref.activityId, factId, level: 1 },
                currentResponses: {},
                assistance: [],
                phase: 'answering',
                timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
              };
              session = {
                ...session,
                currentAttemptId: attemptId,
                currentFactId: factId,
                status: 'active',
              };
              retainedAttempts.set(retainedKey, { attempt, session });
            }
          }
          if (attempt) {
            const state = attempt;
            recallResult(
              await ticket.persist(() => repository.saveRecall({ attempt: state, session })),
            );
            for (const [key, retained] of retainedAttempts)
              if (retained.attempt.attemptId === state.attemptId) retainedAttempts.delete(key);
            current(ticket);
            destination = { kind: 'test', attempt, session };
          }
        }
      }
    }
    return {
      namespace,
      repository,
      preferences,
      scope,
      progress,
      destination,
      dispose() {
        if (!input.repository) repository.close?.();
      },
    };
  } catch (error) {
    if (!input.repository) repository.close?.();
    throw error;
  }
}
