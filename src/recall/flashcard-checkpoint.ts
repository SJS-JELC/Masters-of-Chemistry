import type { Namespace } from '../contracts/identity.ts';
import type {
  RecallFlashcardCheckpoint,
  RecallFlashcardClassification,
  RecallLaunchScope,
} from './session-contract.ts';
import { canonicalRecallScope } from './session-contract.ts';
export type FlashcardDeckState = Pick<
  RecallFlashcardCheckpoint,
  | 'studyRunId'
  | 'factIds'
  | 'round'
  | 'roundFactIds'
  | 'currentFactId'
  | 'classifications'
  | 'revealed'
  | 'answerSeen'
  | 'undoStack'
>;
export type FlashcardAction =
  | { type: 'flip' }
  | { type: 'classify'; classification: RecallFlashcardClassification }
  | { type: 'undo' }
  | { type: 'retry-missed' }
  | { type: 'restart' };
export function createFlashcardDeck(ids: readonly string[]): FlashcardDeckState {
  const factIds = [...new Set(ids)];
  return {
    studyRunId: crypto.randomUUID(),
    factIds,
    round: 1,
    roundFactIds: factIds,
    currentFactId: factIds[0] ?? null,
    classifications: {},
    revealed: false,
    answerSeen: false,
    undoStack: [],
  };
}
export function flashcardPosition(state: FlashcardDeckState): number {
  return state.currentFactId === null
    ? state.roundFactIds.length
    : state.roundFactIds.indexOf(state.currentFactId);
}
/** Legacy checkpoints only establish eligibility when their answer face is visible. */
export function flashcardAnswerSeen(
  state: Pick<FlashcardDeckState, 'revealed' | 'answerSeen'>,
): boolean {
  return state.answerSeen ?? state.revealed;
}
/** Seeing an answer permits sorting on either face, without producing assessment evidence. */
export function reduceFlashcardDeck(
  state: FlashcardDeckState,
  action: FlashcardAction,
): FlashcardDeckState {
  if (action.type === 'restart') return createFlashcardDeck(state.factIds);
  if (action.type === 'flip')
    return state.currentFactId ? { ...state, revealed: !state.revealed, answerSeen: true } : state;
  if (action.type === 'classify') {
    const id = state.currentFactId;
    if (!id || !flashcardAnswerSeen(state)) return state;
    return {
      ...state,
      currentFactId: state.roundFactIds[flashcardPosition(state) + 1] ?? null,
      revealed: false,
      answerSeen: false,
      classifications: { ...state.classifications, [id]: action.classification },
      undoStack: [
        ...state.undoStack,
        {
          factId: id,
          previous: state.classifications[id] ?? null,
          revealed: state.revealed,
          answerSeen: true,
        },
      ],
    };
  }
  if (action.type === 'undo') {
    const last = state.undoStack.at(-1);
    if (!last) return state;
    const classifications = { ...state.classifications };
    if (last.previous === null) delete classifications[last.factId];
    else classifications[last.factId] = last.previous;
    return {
      ...state,
      currentFactId: last.factId,
      classifications,
      revealed: last.revealed,
      answerSeen: last.answerSeen ?? last.revealed,
      undoStack: state.undoStack.slice(0, -1),
    };
  }
  if (state.currentFactId !== null) return state;
  const missed = state.roundFactIds.filter((id) => state.classifications[id] === 'practise-again');
  return missed.length
    ? {
        ...state,
        round: state.round + 1,
        roundFactIds: missed,
        currentFactId: missed[0]!,
        revealed: false,
        answerSeen: false,
        undoStack: [],
      }
    : state;
}
export function checkpointForDeck(
  state: FlashcardDeckState,
  namespace: Namespace,
  scope: RecallLaunchScope,
): RecallFlashcardCheckpoint {
  return { namespace: { ...namespace }, scope: canonicalRecallScope(scope), ...state };
}
/** Validate positional coherence beyond the storage schema before offering resume. */
export function flashcardDeckRestorable(state: FlashcardDeckState): boolean {
  const position = flashcardPosition(state);
  return (
    state.roundFactIds.length > 0 &&
    position >= 0 &&
    state.undoStack.length === position &&
    state.undoStack.every(
      (u, i) =>
        u.factId === state.roundFactIds[i] &&
        flashcardAnswerSeen(u) &&
        !!state.classifications[u.factId],
    )
  );
}
/** Serialize saves; failures never poison the next retry or allow an older write to win. */
export function createFlashcardSaveQueue<T>(save: (value: T) => Promise<boolean>) {
  let tail = Promise.resolve(true);
  return {
    enqueue(value: T): Promise<boolean> {
      tail = tail
        .catch(() => false)
        .then(() => save(value))
        .catch(() => false);
      return tail;
    },
    flush(): Promise<boolean> {
      return tail;
    },
  };
}

/** Latest question sorted to each pile in this round; earlier-round classifications stay hidden. */
export function flashcardPileTop(
  state: FlashcardDeckState,
  classification: RecallFlashcardClassification,
): string | null {
  return (
    state.roundFactIds
      .slice(0, flashcardPosition(state))
      .reverse()
      .find((id) => state.classifications[id] === classification) ?? null
  );
}
