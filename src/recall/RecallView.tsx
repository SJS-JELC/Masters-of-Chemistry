import type { Course } from '../contracts/identity.ts';
import { RecallIcon } from '../landing/RecallIcon.tsx';
import { FlashcardTable } from './FlashcardTable.tsx';
import { starterDecks } from './starter-decks.ts';

export function RecallView({
  course,
  onHome,
}: {
  readonly course: Course;
  readonly onHome: () => void;
}) {
  const label = course === 'alevel' ? 'A Level' : 'IGCSE';
  const cards = starterDecks[course];
  return (
    <main className="fc-demo" aria-label={`${label} Recall`}>
      <header className="fc-demo-header">
        <div>
          <span className="fc-eyebrow">Masters of Chemistry / {label}</span>
          <h1 className="recall-heading">
            <RecallIcon />
            Recall
          </h1>
          <p>Think of the answer, then turn the card.</p>
        </div>
        <button className="recall-home" onClick={onHome}>
          ← Home
        </button>
      </header>
      <FlashcardTable deckId={`${course}-recall`} cards={cards} />
      <footer className="fc-demo-footer">
        <span>
          {label} · {cards.length} starter cards
        </span>
        <span>Self-marked practice · start fresh each visit</span>
      </footer>
    </main>
  );
}
