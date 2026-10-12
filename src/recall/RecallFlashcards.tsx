import { shuffleRecallIds } from './selection.ts';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Namespace } from '../contracts/identity.ts';
import type { RecallEntry, RecallFact } from '../contracts/recall.ts';
import type { ChemistryRepository } from '../contracts/repository.ts';
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
  readonly onVisibleCardIdChange?: (id: string | null) => void;
  readonly onRegisterLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
}
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
  onRegisterLeaveGuard,
  onVisibleCardIdChange,
}: RecallFlashcardsProps) {
  const [freshDeck] = useState(() => createFlashcardDeck(shuffleRecallIds(facts.map((f) => f.id))));
  const [state, setState] = useState<FlashcardDeckState | null>(null);
  const [saved, setSaved] = useState<RecallFlashcardCheckpoint | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [stale, setStale] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const current = useRef<FlashcardDeckState | null>(null);
  const active = useRef(true);
  const sequence = useRef(0);
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
          if (active.current) setSaveError(result.error.message);
          return false;
        }
        return true;
      }),
    [repository],
  );
  function save(next: FlashcardDeckState): Promise<boolean> {
    const id = ++sequence.current;
    return queue.enqueue(checkpointForDeck(next, namespace, scope)).then((ok) => {
      if (active.current && id === sequence.current) {
        if (ok) setSaveError('');
        else setSaveError((error) => error || 'Could not save this deck. Retry before leaving.');
      }
      return ok;
    });
  }
  function change(next: FlashcardDeckState) {
    current.current = next;
    setState(next);
    void save(next);
  }
  useEffect(() => {
    active.current = true;
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
    onRegisterLeaveGuard?.(async () => (current.current ? save(current.current) : queue.flush()));
    return () => onRegisterLeaveGuard?.(null);
  }, [onRegisterLeaveGuard, queue]);
  const tableVisible = !!facts.length && loaded && (!!state || !(saved || stale));
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
              current.current = saved;
              setState(saved);
            }}
          >
            Resume deck
          </button>
        )}
        <button onClick={() => change(createFlashcardDeck(shuffleRecallIds(facts.map((f) => f.id))))}>
          Restart deck
        </button>
      </section>
    );
  const shown = state ?? freshDeck;
  return (
    <div className="recall-flashcards">
      {saveError && (
        <div className="fc-save-status" role="alert">
          <>
            <span>{saveError}</span>
            <button onClick={() => void save(current.current ?? shown)}>Retry save</button>
          </>
        </div>
      )}
      <FlashcardTable
        deckId={recallScopeKey(namespace, scope)}
        cards={cards}
        state={shown}
        onStateChange={change}
        {...(onVisibleCardIdChange ? { onVisibleCardIdChange } : {})}
      />
    </div>
  );
}
