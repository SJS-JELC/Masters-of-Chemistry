import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import type { ContentBlock } from '../contracts/question.ts';
import { Content } from '../ui/Content.tsx';
import './flashcards.css';
import {
  createFlashcardDeck,
  flashcardPosition,
  flashcardAnswerSeen,
  flashcardPileTop,
  reduceFlashcardDeck,
  type FlashcardAction,
  type FlashcardDeckState,
} from './flashcard-checkpoint.ts';

export interface Flashcard {
  readonly id: string;
  readonly prompt: readonly ContentBlock[];
  readonly answer: readonly ContentBlock[];
  readonly promptContent?: ReactNode;
  readonly answerContent?: ReactNode;
}
export interface FlashcardTableProps {
  readonly deckId: string;
  readonly cards: readonly Flashcard[];
  readonly state?: FlashcardDeckState;
  readonly onStateChange?: (state: FlashcardDeckState) => void;
  /** Reports the displayed card, including the outgoing card during its flight. */
  readonly onVisibleCardIdChange?: (id: string | null) => void;
}
type Side = 'again' | 'got';
type Flight = {
  x: number;
  y: number;
  scale: number;
  side: Side;
  card: Flashcard;
  position: number;
  showingAnswer: boolean;
};
const interactive = 'button, a, input, select, textarea, summary';

function Stack({
  count,
  label,
  side,
  nextCard,
}: {
  count: number;
  label: string;
  side: Side | 'deck';
  nextCard?: Flashcard;
}) {
  const layers = Math.min(count, 10);
  const spacing = side === 'deck' ? 4 : count > 10 ? Math.min(4, 2 + Math.log2(count / 10)) : 2;
  return (
    <div className={`fc-stack fc-stack-${side}`} data-count={count}>
      <div className="fc-stack-cards" data-destination={side} aria-hidden="true">
        {Array.from({ length: layers }, (_, index) => (
          <span
            className="fc-layer"
            key={index}
            style={
              {
                '--rise': `${-index * spacing}px`,
                '--shift': `${side === 'deck' ? (layers - index - 1) * 2 : 0}px`,
                '--angle': `${side === 'deck' ? 0 : ((index * 7) % 5) - 2}deg`,
              } as CSSProperties
            }
          >
            {index === layers - 1 && nextCard ? (
              <span
                className="fc-next-question"
                data-next-fact-id={nextCard.id}
                data-preview-fact-id={nextCard.id}
              >
                {nextCard.promptContent ?? <Content blocks={nextCard.prompt} />}
              </span>
            ) : (
              index === layers - 1 && (
                <span className="fc-stack-symbol">
                  {side === 'got' ? '✓' : side === 'again' ? '↻' : '✦'}
                </span>
              )
            )}
          </span>
        ))}
        {!count && (
          <span className="fc-empty-mark">
            {side === 'got' ? '✓' : side === 'again' ? '↻' : '✦'}
          </span>
        )}
      </div>
      <p>
        <span>{label}</span>
        <strong>{count}</strong>
      </p>
    </div>
  );
}

/** Change deckId to start a different deck. No persistence or assessment side effects. */
export function FlashcardTable(props: FlashcardTableProps) {
  return <TableSession key={props.deckId} {...props} />;
}

function TableSession({
  cards,
  state: controlledState,
  onStateChange,
  onVisibleCardIdChange,
}: FlashcardTableProps) {
  const [localState, setLocalState] = useState(() => createFlashcardDeck(cards.map((c) => c.id)));
  const state = controlledState ?? localState;
  const stateRef = useRef(state);
  stateRef.current = state;
  function dispatch(action: FlashcardAction) {
    const next = reduceFlashcardDeck(stateRef.current, action);
    stateRef.current = next;
    if (onStateChange) onStateChange(next);
    else setLocalState(next);
  }
  const round = state.roundFactIds;
  const position = flashcardPosition(state);
  const revealed = state.revealed;
  const [flight, setFlight] = useState<Flight | null>(null);
  const [drag, setDrag] = useState(0);
  const [message, setMessage] = useState('');
  const table = useRef<HTMLElement>(null);
  const mover = useRef<HTMLDivElement>(null);
  const reader = useRef<HTMLElement>(null);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gesture = useRef<{ id: number; x: number; y: number; dx: number } | null>(null);
  const suppressClick = useRef(false);
  const card = flight?.card ?? cards.find((c) => c.id === state.currentFactId);
  useLayoutEffect(() => {
    onVisibleCardIdChange?.(card?.id ?? null);
  }, [card?.id, onVisibleCardIdChange]);
  useLayoutEffect(() => () => onVisibleCardIdChange?.(null), [onVisibleCardIdChange]);
  const pileCard = (classification: 'got-it' | 'practise-again') =>
    cards.find((c) => c.id === flashcardPileTop(state, classification));
  const missed = round
    .slice(0, position)
    .filter((id) => state.classifications[id] === 'practise-again');
  const correct = position - missed.length;
  const showingAnswer = flight ? flight.showingAnswer : revealed;
  const canSort = flashcardAnswerSeen(state);
  const nextCard = cards.find((c) => c.id === (flight ? state.currentFactId : round[position + 1]));
  const waitingCount = Math.max(0, round.length - position - (flight ? 0 : 1));

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useLayoutEffect(() => {
    // Measure layout before painting so the deal starts on the actual bottom deck.
    const moving = mover.current;
    const deck = table.current?.querySelector('[data-destination="deck"]');
    if (moving && deck && deck.getBoundingClientRect().width > 0) {
      const destination = moving.parentElement!.getBoundingClientRect();
      const origin = deck.getBoundingClientRect();
      moving.style.setProperty(
        '--deal-x',
        `${origin.x + origin.width / 2 - destination.x - destination.width / 2}px`,
      );
      moving.style.setProperty(
        '--deal-y',
        `${origin.y + origin.height / 2 - destination.y - destination.height / 2}px`,
      );
      moving.style.setProperty('--deal-scale', String(origin.width / destination.width));
    }
    if (!flight) reader.current?.focus({ preventScroll: true });
  }, [position, round, flight]);

  function flip() {
    if (busy.current || !card) return;
    dispatch({ type: 'flip' });
  }
  function sort(side: Side) {
    if (!card || !flashcardAnswerSeen(stateRef.current) || busy.current) return;
    busy.current = true;
    const from = mover.current!.getBoundingClientRect();
    const to = table
      .current!.querySelector(`[data-destination="${side}"]`)!
      .getBoundingClientRect();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setDrag(0);
    setFlight({
      x: to.x + to.width / 2 - (from.x + from.width / 2),
      y: to.y + to.height / 2 - (from.y + from.height / 2),
      scale: to.width / from.width,
      side,
      card,
      position,
      showingAnswer: stateRef.current.revealed,
    });
    dispatch({ type: 'classify', classification: side === 'got' ? 'got-it' : 'practise-again' });
    setMessage(
      `Card ${position + 1} moved to ${side === 'got' ? 'Got it' : 'Practise again'}. ${round.length - position - 1} remaining.`,
    );
    timer.current = setTimeout(
      () => {
        setFlight(null);
        busy.current = false;
      },
      reduce ? 0 : 340,
    );
  }
  function undo() {
    if (busy.current || !state.undoStack.length) return;
    dispatch({ type: 'undo' });
    setMessage('Last card restored. Ready to sort.');
  }
  function start(type: 'retry-missed' | 'restart') {
    if (busy.current) return;
    dispatch({ type });
    setMessage(type === 'restart' ? 'Deck restarted.' : 'New pass of missed cards.');
  }

  function pointerDown(event: PointerEvent<HTMLElement>) {
    suppressClick.current = false;
    if (
      !canSort ||
      busy.current ||
      !event.isPrimary ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest(interactive)
    )
      return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLElement>) {
    const point = gesture.current;
    if (!point || point.id !== event.pointerId) return;
    const dx = event.clientX - point.x;
    const dy = event.clientY - point.y;
    if (Math.abs(dy) > Math.max(12, Math.abs(dx))) {
      gesture.current = null;
      suppressClick.current = true;
      setDrag(0);
      return;
    }
    point.dx = dx;
    if (Math.abs(dx) > 8) suppressClick.current = true;
    setDrag(dx);
  }

  function pointerEnd(event: PointerEvent<HTMLElement>) {
    const point = gesture.current;
    gesture.current = null;
    setDrag(0);
    if (!point || point.id !== event.pointerId || event.type === 'pointercancel') return;
    const threshold = Math.min(100, event.currentTarget.clientWidth * 0.22);
    if (Math.abs(point.dx) >= threshold) sort(point.dx < 0 ? 'again' : 'got');
  }

  return (
    <section
      className="fc-table"
      ref={table}
      aria-label="Flashcard table"
      onKeyDown={(event) => {
        if (
          event.target instanceof HTMLElement &&
          event.target.closest('input, textarea, select, a, summary')
        )
          return;
        if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault();
          if (!event.repeat) sort(event.key === 'ArrowLeft' ? 'again' : 'got');
        } else if (event.code === 'Space' && !(event.target as HTMLElement).closest('button')) {
          event.preventDefault();
          if (!event.repeat) flip();
        }
      }}
    >
      <div className="fc-arena">
        <Stack
          count={missed.length}
          label="Practise again"
          side="again"
          {...(pileCard('practise-again') ? { nextCard: pileCard('practise-again')! } : {})}
        />
        <div className="fc-reading">
          {card ? (
            <div
              key={card.id}
              className={`fc-mover${flight ? ' fc-flying' : ''}`}
              ref={mover}
              style={
                flight
                  ? {
                      transform: `translate(${flight.x}px, ${flight.y}px) scale(${flight.scale}) rotate(${flight.side === 'got' ? 3 : -3}deg)`,
                      opacity: 0.35,
                    }
                  : undefined
              }
            >
              <article
                className={`fc-card${showingAnswer ? ' fc-revealed' : ''}${canSort ? ' fc-sortable' : ''}${drag ? ' fc-dragging' : ''}`}
                ref={reader}
                tabIndex={0}
                aria-label={`Card ${(flight?.position ?? position) + 1}, ${showingAnswer ? 'answer' : 'question'}`}
                style={{ '--drag': `${drag}px`, '--tilt': `${drag / 24}deg` } as CSSProperties}
                onPointerDown={pointerDown}
                onPointerMove={pointerMove}
                onPointerUp={pointerEnd}
                onPointerCancel={pointerEnd}
                onDragStart={(event) => event.preventDefault()}
                onClick={(event) => {
                  if (!suppressClick.current && !(event.target as HTMLElement).closest(interactive))
                    flip();
                }}
              >
                <div className="fc-face fc-front" aria-hidden={showingAnswer} inert={showingAnswer}>
                  {card.promptContent ?? <Content blocks={card.prompt} />}
                </div>
                <div
                  className="fc-face fc-back"
                  aria-hidden={!showingAnswer}
                  inert={!showingAnswer}
                >
                  {card.answerContent ?? <Content blocks={card.answer} />}
                </div>
              </article>
            </div>
          ) : (
            <article className="fc-complete" ref={reader} tabIndex={-1}>
              <span className="fc-complete-symbol" aria-hidden="true">
                {round.length ? '✓' : '✦'}
              </span>
              <h2>{round.length ? 'A little more remembered.' : 'No cards in this deck'}</h2>
              <p>
                {round.length
                  ? `${correct} got it · ${missed.length} to practise again`
                  : 'Choose a deck to start practising.'}
              </p>
              {missed.length > 0 && (
                <button className="fc-primary" onClick={() => start('retry-missed')}>
                  Practise missed cards
                </button>
              )}
              {cards.length > 0 && <button onClick={() => start('restart')}>Restart deck</button>}
            </article>
          )}
        </div>
        <Stack
          count={correct}
          label="Got it"
          side="got"
          {...(pileCard('got-it') ? { nextCard: pileCard('got-it')! } : {})}
        />
        <div className="fc-controls">
          {card && (
            <div className="fc-actions">
              <button
                className="fc-again"
                disabled={!canSort || !!flight}
                onClick={() => sort('again')}
              >
                <span aria-hidden="true">←</span> Practise again
              </button>
              <button
                className="fc-flip"
                aria-label={showingAnswer ? 'Show question' : 'Reveal answer'}
                disabled={!!flight}
                onClick={flip}
              >
                <kbd aria-hidden="true">SPACE</kbd>
                <span className="fc-flip-label">
                  {showingAnswer ? 'Show question' : 'Reveal answer'}
                </span>
              </button>
              <button
                className="fc-got"
                disabled={!canSort || !!flight}
                onClick={() => sort('got')}
              >
                Got it <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </div>
        <Stack
          count={waitingCount}
          label={waitingCount ? 'Waiting cards' : 'No waiting cards'}
          side="deck"
          {...(nextCard ? { nextCard } : {})}
        />
      </div>
      <footer className="fc-table-footer">
        {card && (
          <button disabled={!!flight} onClick={() => start('restart')}>
            Restart deck
          </button>
        )}
        <button disabled={!position || !!flight} onClick={undo}>
          ↶ Undo last card
        </button>
      </footer>
      <p className="fc-sr" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
