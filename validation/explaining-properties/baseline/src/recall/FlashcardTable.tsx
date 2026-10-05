import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import type { ContentBlock } from '../contracts/question.ts';
import { Content } from '../ui/Content.tsx';
import './flashcards.css';

export interface Flashcard {
  readonly id: string;
  readonly prompt: readonly ContentBlock[];
  readonly answer: readonly ContentBlock[];
}
export interface FlashcardTableProps {
  readonly deckId: string;
  readonly cards: readonly Flashcard[];
}
type Side = 'again' | 'got';
type Result = { card: Flashcard; side: Side };
type Flight = { x: number; y: number; scale: number; side: Side };
const interactive = 'button, a, input, select, textarea, summary';

function Stack({ count, label, side }: { count: number; label: string; side: Side | 'deck' }) {
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
            {index === layers - 1 && (
              <span className="fc-stack-symbol">
                {side === 'got' ? '✓' : side === 'again' ? '↻' : '✦'}
              </span>
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

function TableSession({ cards }: FlashcardTableProps) {
  const [round, setRound] = useState(cards);
  const [history, setHistory] = useState<Result[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [hasSeenAnswer, setHasSeenAnswer] = useState(false);
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
  const card = round[history.length];
  const missed = history.filter((item) => item.side === 'again');
  const correct = history.length - missed.length;

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
    if (moving && deck) {
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
    reader.current?.focus({ preventScroll: true });
  }, [history.length, round]);

  function flip() {
    if (busy.current || !card) return;
    setHasSeenAnswer(true);
    setRevealed((value) => !value);
  }

  function sort(side: Side) {
    if (!card || !hasSeenAnswer || busy.current) return;
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
    });
    timer.current = setTimeout(
      () => {
        setHistory((items) => [...items, { card, side }]);
        setRevealed(false);
        setHasSeenAnswer(false);
        setFlight(null);
        setMessage(
          `Card ${history.length + 1} moved to ${side === 'got' ? 'Got it' : 'Practise again'}. ${round.length - history.length - 1} remaining.`,
        );
        busy.current = false;
      },
      reduce ? 0 : 340,
    );
  }

  function undo() {
    if (busy.current || !history.length) return;
    setHistory((items) => items.slice(0, -1));
    setRevealed(true);
    setHasSeenAnswer(true);
    setMessage('Last card restored. Answer revealed.');
  }

  function start(next: readonly Flashcard[]) {
    if (busy.current) return;
    setRound([...next]);
    setHistory([]);
    setRevealed(false);
    setHasSeenAnswer(false);
    setMessage(`New pass. ${next.length} cards.`);
  }

  function pointerDown(event: PointerEvent<HTMLElement>) {
    suppressClick.current = false;
    if (
      !hasSeenAnswer ||
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
      <div className="fc-round-meta">
        <span>
          {history.length === round.length && round.length ? 'Pass complete' : 'Your own pace'}
        </span>
        <span>
          {history.length} / {round.length} sorted
        </span>
      </div>
      <div className="fc-progress" aria-hidden="true">
        <span style={{ width: `${round.length ? (history.length / round.length) * 100 : 0}%` }} />
      </div>
      <div className="fc-arena">
        <Stack count={missed.length} label="Practise again" side="again" />
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
                className={`fc-card${revealed ? ' fc-revealed' : ''}${hasSeenAnswer ? ' fc-sortable' : ''}${drag ? ' fc-dragging' : ''}`}
                ref={reader}
                tabIndex={0}
                aria-label={`Card ${history.length + 1}, ${revealed ? 'answer' : 'question'}`}
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
                <div className="fc-face fc-front" aria-hidden={revealed} inert={revealed}>
                  <div className="fc-card-meta">
                    <span>THE QUESTION</span>
                    <span>{String(history.length + 1).padStart(2, '0')}</span>
                  </div>
                  <Content blocks={card.prompt} />
                  <span className="fc-card-hint">Think of your answer · tap to turn</span>
                </div>
                <div className="fc-face fc-back" aria-hidden={!revealed} inert={!revealed}>
                  <div className="fc-card-meta">
                    <span>THE ANSWER</span>
                    <span>{String(history.length + 1).padStart(2, '0')}</span>
                  </div>
                  <Content blocks={card.answer} />
                  <span className="fc-card-hint">How did you do? Choose a pile.</span>
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
                <button
                  className="fc-primary"
                  onClick={() => start(missed.map((item) => item.card))}
                >
                  Practise missed cards
                </button>
              )}
              {cards.length > 0 && <button onClick={() => start(cards)}>Restart deck</button>}
            </article>
          )}
        </div>
        <Stack count={correct} label="Got it" side="got" />
        <div className="fc-controls">
          {card && (
            <div className="fc-actions">
              <button
                className="fc-again"
                disabled={!hasSeenAnswer || !!flight}
                onClick={() => sort('again')}
              >
                <span aria-hidden="true">←</span> Practise again
              </button>
              <button className="fc-flip" disabled={!!flight} onClick={flip}>
                {revealed ? 'Show question' : 'Reveal answer'}
                <span aria-hidden="true">↻</span>
              </button>
              <button
                className="fc-got"
                disabled={!hasSeenAnswer || !!flight}
                onClick={() => sort('got')}
              >
                Got it <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
          <p className="fc-instructions">
            {card
              ? hasSeenAnswer
                ? 'Swipe or use ← → to sort'
                : 'Recall first. Space or tap to reveal.'
              : 'Every pass is a fresh start.'}
          </p>
        </div>
        <Stack count={round.length - history.length} label="Cards remaining" side="deck" />
      </div>
      <footer className="fc-table-footer">
        <span>Self-marked practice</span>
        <button disabled={!history.length || !!flight} onClick={undo}>
          ↶ Undo last card
        </button>
      </footer>
      <p className="fc-sr" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
