import { shuffleRecallIds } from './selection.ts';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Namespace } from '../contracts/identity.ts';
import type { RecallEntry, RecallFact } from '../contracts/recall.ts';
import type { ChemistryRepository, StorageFailure } from '../contracts/repository.ts';
import { ChemicalNotation, ChemicalProse } from '../ui/ChemicalEntry.tsx';
import { FlashcardTable, type Flashcard } from './FlashcardTable.tsx';
import {
  checkpointForDeck,
  createFlashcardDeck,
  createFlashcardSaveQueue,
  flashcardDeckRestorable,
  type FlashcardDeckState,
} from './flashcard-checkpoint.ts';
import { flashcardModel } from './flashcard-content.ts';
import { useLoading } from '../loading/LoadingProvider.tsx';
import { repositoryError } from '../loading/module-errors.ts';
import { bindFlashcardTiming, createFlashcardTiming } from './flashcard-timing.ts';
import {
  flashcardCheckpointCompatible,
  recallScopeKey,
  type RecallFlashcardCheckpoint,
  type RecallLaunchScope,
} from './session-contract.ts';
export interface RecallFlashcardsProps {
  readonly facts: readonly RecallFact[];
  readonly namespace: Namespace;
  readonly scope: RecallLaunchScope;
  readonly repository: ChemistryRepository;
  readonly preparedCheckpoint?: RecallFlashcardCheckpoint | null;
  readonly preparedFreshDeck?: boolean;
  readonly mode?: 'student' | 'teacher';
  readonly onVisibleCardIdChange?: (id: string | null) => void;
  readonly onRegisterLeaveGuard?: (guard: FlashcardLeaveGuard | null) => void;
  readonly onRegisterDrain?: (drain: () => Promise<unknown>) => void;
}
export type FlashcardLeaveGuard = (() => Promise<boolean>) & { freeze: () => void };
function ModelValue({ value, entry }: { value: string; entry?: RecallEntry }) {
  if (entry?.kind === 'general-formula')
    return (
      <>
        {value
          .split(/(n|2n(?:\+2)?)/g)
          .map((part, i) =>
            /^(?:n|2n(?:\+2)?)$/.test(part) ? (
              <sub key={i}>{part}</sub>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
      </>
    );
  if (entry?.kind === 'signed-charge') return <ChemicalNotation value={value} mode="equation" />;
  return <ChemicalProse value={value} />;
}
function FactAnswer({ fact }: { fact: RecallFact }) {
  const model = flashcardModel(fact);
  return (
    <div className="content fc-model">
      {model.summary && (
        <p>
          <ModelValue value={model.summary} {...(fact.entry ? { entry: fact.entry } : {})} />
        </p>
      )}
      {!!model.rows.length && (
        <dl>
          {model.rows.map((row, i) => (
            <div key={i}>
              <dt>{row.label}</dt>
              <dd>
                <ModelValue value={row.value} {...(row.entry ? { entry: row.entry } : {})} />
                {row.entry?.kind === 'numeric' && <span> {row.entry.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {fact.context?.map((text, i) => (
        <p className="fc-context" key={i}>
          <ChemicalProse value={text} />
        </p>
      ))}
    </div>
  );
}
export function RecallFlashcards(props: RecallFlashcardsProps) {
  return (
    <DeckSession
      key={
        recallScopeKey(props.namespace, props.scope) + JSON.stringify(props.facts.map((f) => f.id))
      }
      {...props}
    />
  );
}
function DeckSession({
  facts,
  namespace,
  scope,
  repository,
  preparedCheckpoint,
  preparedFreshDeck,
  mode = 'student',
  onRegisterLeaveGuard,
  onRegisterDrain,
  onVisibleCardIdChange,
}: RecallFlashcardsProps) {
  const loading = useLoading();
  const [freshDeck] = useState(() => createFlashcardDeck(shuffleRecallIds(facts.map((f) => f.id))));
  const [state, setState] = useState<FlashcardDeckState | null>(
    preparedFreshDeck ? (preparedCheckpoint ?? null) : null,
  );
  const [saved, setSaved] = useState<RecallFlashcardCheckpoint | null>(preparedCheckpoint ?? null);
  const [loaded, setLoaded] = useState(preparedCheckpoint !== undefined);
  const [stale, setStale] = useState(
    () =>
      !!preparedCheckpoint &&
      (!flashcardCheckpointCompatible(preparedCheckpoint, namespace, scope, facts) ||
        !flashcardDeckRestorable(preparedCheckpoint)),
  );
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [timeError, setTimeError] = useState('');
  const surface = useRef<HTMLDivElement>(null);
  const fallbackRunId = useRef(crypto.randomUUID());
  function withRun(deck: FlashcardDeckState): FlashcardDeckState {
    return deck.studyRunId ? deck : { ...deck, studyRunId: fallbackRunId.current };
  }
  const saveFailure = useRef<StorageFailure | null>(null);
  const current = useRef<FlashcardDeckState | null>(state);
  const active = useRef(true);
  const sequence = useRef(0);
  const [timing] = useState(() =>
    createFlashcardTiming({
      namespace,
      scopeKey: recallScopeKey(namespace, scope),
      load: async () => {
        if (!(await save(current.current ?? freshDeck)))
          return { ok: false as const, error: saveFailure.current! };
        return repository.flashcardStudyTimeHistory(namespace);
      },
      save: (record) => repository.saveFlashcardStudyTime(record),
      onFailure: (failure) => {
        if (active.current) setTimeError(failure?.message ?? '');
      },
    }),
  );
  const cards = useMemo<readonly Flashcard[]>(
    () =>
      facts.map((fact) => ({
        id: fact.id,
        prompt: [{ kind: 'text', text: fact.prompt }],
        answer: [{ kind: 'text', text: fact.answer }],
        promptContent: (
          <div className="content">
            <p>
              <ChemicalProse value={fact.prompt} />
            </p>
            {fact.sentenceTokens && (
              <p>{fact.sentenceTokens.map((t) => (typeof t === 'string' ? t : '___')).join('')}</p>
            )}
            {fact.context?.map((text, i) => (
              <p className="fc-context" key={i}>
                <ChemicalProse value={text} />
              </p>
            ))}
          </div>
        ),
        answerContent: <FactAnswer fact={fact} />,
      })),
    [facts],
  );
  const queue = useMemo(
    () =>
      createFlashcardSaveQueue(async (checkpoint: RecallFlashcardCheckpoint) => {
        const result = await repository.saveRecallFlashcards(checkpoint);
        if (!result.ok) {
          saveFailure.current = result.error;
          if (active.current) setSaveError(result.error.message);
          return false;
        }
        saveFailure.current = null;
        return true;
      }),
    [repository],
  );
  function save(next: FlashcardDeckState): Promise<boolean> {
    const id = ++sequence.current;
    return queue.enqueue(checkpointForDeck(withRun(next), namespace, scope)).then((ok) => {
      if (active.current && id === sequence.current) {
        if (ok) setSaveError('');
        else setSaveError((error) => error || 'Could not save this deck. Retry before leaving.');
      }
      return ok;
    });
  }
  function change(next: FlashcardDeckState) {
    if (loading.pending || loading.error) return;
    next = withRun(next);
    current.current = next;
    timing.setCard(next.studyRunId!, next.currentFactId);
    timing.setEligible(mode === 'student' && !!next.currentFactId);
    void timing.persist();
    setState(next);
    void save(next);
  }
  useEffect(() => {
    active.current = true;
    if (preparedCheckpoint !== undefined)
      return () => {
        active.current = false;
      };
    let cancelled = false;
    void repository
      .loadRecallFlashcards(namespace, scope)
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setLoadError(result.error.message);
          setStale(true);
        } else if (result.value) {
          setSaved(result.value);
          setStale(
            !flashcardCheckpointCompatible(result.value, namespace, scope, facts) ||
              !flashcardDeckRestorable(result.value),
          );
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Could not load the saved deck.');
          setStale(true);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
      active.current = false;
    };
  }, [repository]);
  useEffect(() => {
    const freeze = () => {
      timing.freeze();
      void timing.persist();
    };
    const guard: FlashcardLeaveGuard = Object.assign(
      async () => {
        freeze();
        const [ok, timeOk] = await Promise.all([
          current.current ? save(current.current) : queue.flush(),
          timing.flush(),
        ]);
        if (!ok && saveFailure.current?.recovery === 'reload')
          throw repositoryError(saveFailure.current);
        if (!timeOk && timing.failure()?.recovery === 'reload')
          throw repositoryError(timing.failure()!);
        return ok && timeOk;
      },
      { freeze },
    );
    onRegisterLeaveGuard?.(guard);
    // Keep this captured drain available to the parent after guard deregistration.
    onRegisterDrain?.(() => Promise.all([queue.flush(), timing.flush()]));
    return () => onRegisterLeaveGuard?.(null);
  }, [onRegisterLeaveGuard, onRegisterDrain, queue, timing]);
  const tableVisible = !!facts.length && loaded && (!!state || !(saved || stale));
  const studyEligible = tableVisible && !!(state ?? freshDeck).currentFactId && mode === 'student';
  const studyEligibleRef = useRef(studyEligible);
  studyEligibleRef.current = studyEligible;
  useEffect(
    () =>
      loading.onCancelComplete(() => {
        timing.resume();
        const status = loading.snapshot();
        timing.setEligible(studyEligibleRef.current && !status.pending && !status.error);
      }),
    [timing, loading.onCancelComplete, loading.snapshot],
  );
  useEffect(() => {
    const sync = () => {
      const status = loading.snapshot();
      timing.setEligible(studyEligibleRef.current && !status.pending && !status.error);
      if (status.pending || status.error) void timing.persist();
    };
    sync();
    return loading.subscribe(sync);
  }, [timing, loading.subscribe, loading.snapshot, studyEligible]);
  useEffect(() => {
    if (!tableVisible || mode !== 'student') return;
    return bindFlashcardTiming({
      controller: timing,
      isEligible: () => {
        const status = loading.snapshot();
        return studyEligibleRef.current && !status.pending && !status.error;
      },
    });
  }, [tableVisible, timing, loading.snapshot, mode]);
  useLayoutEffect(() => {
    const deck = state ?? freshDeck;
    timing.setCard(
      deck.studyRunId ?? fallbackRunId.current,
      tableVisible ? deck.currentFactId : null,
    );
  }, [timing, tableVisible, state, freshDeck]);
  useLayoutEffect(() => {
    if (!tableVisible) onVisibleCardIdChange?.(null);
  }, [tableVisible, onVisibleCardIdChange]);
  useLayoutEffect(() => () => onVisibleCardIdChange?.(null), [onVisibleCardIdChange]);
  if (!facts.length) return <p>No cards in this selection.</p>;
  if (!loaded) return <p role="status">Loading flashcards…</p>;
  if (!state && (saved || stale))
    return (
      <section className="fc-resume" aria-label="Saved flashcard deck">
        <h2>{stale ? 'This saved deck needs a restart' : 'Continue your flashcards?'}</h2>
        <p>
          {loadError ||
            (stale
              ? 'The selected facts have changed. Start a new deck to use the current content. Your saved deck stays unchanged until you choose restart.'
              : 'Your saved deck is ready to continue.')}
        </p>
        {!stale && saved && (
          <button
            onClick={() => {
              current.current = withRun(saved);
              timing.setCard(current.current.studyRunId!, saved.currentFactId);
              void save(current.current);
              timing.resume();
              timing.setEligible(mode === 'student' && !!saved.currentFactId);
              setState(current.current);
            }}
          >
            Resume deck
          </button>
        )}
        <button
          onClick={() =>
            void loading.run(
              'question',
              async (ticket) => {
                const next = createFlashcardDeck(shuffleRecallIds(facts.map((f) => f.id)));
                if (!(await ticket.persist(() => save(next))))
                  throw saveFailure.current
                    ? repositoryError(saveFailure.current)
                    : Error('Could not save this deck. Retry before continuing.');
                return next;
              },
              (next) => {
                current.current = next;
                timing.resume();
                setState(next);
              },
            )
          }
        >
          Restart deck
        </button>
      </section>
    );
  const shown = state ?? freshDeck;
  return (
    <div className="recall-flashcards" ref={surface}>
      {(saveError || timeError) && (
        <div className="fc-save-status" role="alert">
          <>
            <span>{saveError || timeError}</span>
            <button
              onClick={() => {
                void save(current.current ?? shown);
                void timing.persist();
              }}
            >
              Retry save
            </button>
          </>
        </div>
      )}
      <FlashcardTable
        deckId={recallScopeKey(namespace, scope)}
        cards={cards}
        inactive={loading.pending || !!loading.error}
        isInactive={() => loading.snapshot().pending || !!loading.snapshot().error}
        state={shown}
        onStateChange={change}
        {...(onVisibleCardIdChange ? { onVisibleCardIdChange } : {})}
      />
    </div>
  );
}
