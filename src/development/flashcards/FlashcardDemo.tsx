import { useState } from 'react';
import { FlashcardTable, type Flashcard } from '../../recall/FlashcardTable.tsx';
import { reviewedCards } from './data.ts';

const longCard: Flashcard = {
  id: 'layout-fixture',
  prompt: [
    {
      kind: 'text',
      text: 'Layout check: a deliberately long question. Read the complete card, reveal the answer, and confirm that the controls remain reachable on a narrow screen.',
    },
  ],
  answer: [
    {
      kind: 'text',
      text: 'Layout fixture — not a curriculum question.\n\nThis deliberately longer paragraph checks wrapping and natural card height. The card must grow with its content, preserve readable line spacing, and allow the page to scroll without accidentally sorting it.',
    },
    { kind: 'formula', text: 'SO₄²⁻   ·   NH₄⁺   ·   mol dm⁻³' },
    {
      kind: 'text',
      text: 'Subscripts, superscripts and charges should remain clear.\n\nTurn back to the question, then reveal again. Both faces should have enough room. Buttons must remain below the card rather than covering the final line.',
    },
  ],
};
const decks: Record<string, readonly Flashcard[]> = {
  reviewed: reviewedCards,
  single: reviewedCards.slice(0, 1),
  empty: [],
  long: [longCard],
  large: Array.from({ length: 60 }, (_, index) => ({
    ...reviewedCards[index % reviewedCards.length]!,
    id: `stack-fixture-${index}`,
  })),
};

export function FlashcardDemo() {
  const [deck, setDeck] = useState('reviewed');
  return (
    <main className="fc-demo">
      <header className="fc-demo-header">
        <div>
          <span className="fc-eyebrow">Masters of Chemistry / Flashcards</span>
          <h1>Build your recall.</h1>
          <p>Think of the answer, then turn the card.</p>
        </div>
        <span className="fc-demo-badge">A level · 6 reviewed facts</span>
      </header>
      <FlashcardTable deckId={deck} cards={decks[deck]!} />
      <footer className="fc-demo-footer">
        <span>Electron structure, bonding & enthalpy</span>
        <a href="?">← Component catalogue</a>
      </footer>
      <details className="fc-demo-details">
        <summary>About this prototype & layout checks</summary>
        <p>
          Six teacher-approved A-level cards, retained verbatim from the September 2026 review. This
          reusable component also accepts GCSE decks. Practice stays in memory and does not save
          scores or timing.
        </p>
        <label>
          Preview deck
          <select value={deck} onChange={(event) => setDeck(event.target.value)}>
            <option value="reviewed">Reviewed sample</option>
            <option value="single">One card</option>
            <option value="empty">Empty deck</option>
            <option value="long">Long text & notation fixture</option>
            <option value="large">60-card stack fixture (repeated content)</option>
          </select>
        </label>
        <p>
          The source wording is preserved, including its orbital-question grammar and the
          ionic-lattice question’s implicit solid-state context. These are sample-content
          limitations to resolve before pupil-facing integration.
        </p>
      </details>
    </main>
  );
}
