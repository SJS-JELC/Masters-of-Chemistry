# Flashcard table prototype

One React/TypeScript component for course-independent, self-marked factual recall.
The shared component now lives in `src/recall/` and powers the authorised Recall
hub view. This development catalogue and its fixtures remain excluded from both
production builds. No new runtime dependency, font, card image or network service
is required. All state is in memory; refresh starts again. It creates no pupil
assessment, mastery, revision or timing records.

## Preview and reproduce

Run these commands from `apps/Masters-of-Chemistry`:

```powershell
npm.cmd run dev
```

Open <http://127.0.0.1:5181/development/authoring/index.html?component=flashcards>.
The existing catalogue also links to it. Keep the development server running for
browser checks. In another terminal:

```powershell
node scripts/prepare_flashcards.mjs
npm.cmd run typecheck
npm.cmd run build
node scripts/review_flashcards.mjs
npm.cmd run check:originals
```

`prepare_flashcards.mjs` checks exact regeneration against the read-only approved
source. After deliberately reviewing source changes, `--write` regenerates the
sample and provenance. It refuses a different card count or newly added diagrams.
It does not overwrite either original app or teacher review exports.

The browser check uses the workspace-pinned Playwright and installed Edge. It saves
results, browser screenshots and a measured standalone component bundle under
`validation/flashcards/`. `FLASHCARD_URL` can override the local preview URL.
The bundle measurement includes the reused content/diagram renderer and excludes
React, the demo deck and the existing shared font; it is not a whole-app download
measurement. Previous `failure.*` files retain superseded development failures;
`results.json` records final passing checks.

## Component contract

```tsx
<FlashcardTable deckId="my-reviewed-deck" cards={cards} />
```

Each card has a unique stable `id`, `prompt` and `answer`. Both content fields use
the existing readonly `ContentBlock[]` model (text, formula, image or table).
Supply a new `deckId` when replacing the deck. Cards are presented in supplied
order. The component owns its temporary pass state and exposes no score callback.
Later integration must use the shared attempt/revision/timing contracts and must
not treat this self-marked practice as independently assessed mastery evidence.

- Tap or Space turns the card. Once its answer has been revealed at least once,
  sorting stays available on either face. Each new card/pass starts unrevealed;
  undo restores a previously revealed card with sorting enabled.
- Buttons, left/right arrows and horizontal pointer gestures sort the card.
  Horizontal travel must reach 22% of the card width, capped at 100px. Smaller
  drags return; vertical touch movement retains page scrolling.
- Sorting locks during the 340ms flight/commit interval. The next card receives
  focus. Reduced motion removes transforms in time (instant flip/sort, no deal
  animation); counts and interactions remain the same.
- Undo restores the last card with its answer showing, including after completion.
- Missed-card practice starts a new pass in original order. Counts and undo history
  reset for each pass. Restart always returns to the complete original deck.
- Counts represent unanswered cards including the current card. Each stack has
  at most ten decorative layers; larger counts increase layer spacing gradually,
  capped at 4px. The remaining deck uses pale card edges offset 4px vertically
  and 2px horizontally beneath its dark top card. Exact counts remain visible.
  Rotations are deterministic.
- The page scrolls naturally for small screens and long answers. Hidden faces are
  inert and absent from the accessibility tree; results use a polite live region.

## Sample and substantive review

Audience: A-level pupils revisiting electron structure, bonding and enthalpy after
initial teaching. Objectives: recall shell/subshell capacities; state orbital
filling rules; identify the solid ionic structure; explain dative bonding and
average bond enthalpy. This six-card example is not an exhaustive topic bank or a
claim that all six facts are required at GCSE.

`provenance.json` retains source IDs, the approved bank revision, source SHA-256
and OCR references. The source is the six teacher-approved September 2026 records.
The retained OCR specification map identifies version 3.1 (May 2026), reviewed
10 September 2026; this task does not claim a new full-specification audit.

Chemistry review on 4 October 2026:

- Shell maxima 2, 8, 18, 32 agree with 2n²; s/p/d maxima 2/6/10 are correct.
- Orbital filling includes increasing energy, opposite spins within an orbital,
  and singly occupied equal-energy orbitals with parallel spins before pairing.
- Giant ionic lattice is the expected **solid-state** structure. The approved
  question leaves the state implicit. Resolve this before pupil-facing integration.
- Dative bonding correctly assigns both shared electrons to one donating atom.
- Average bond enthalpy correctly specifies breaking one mole of the given bonds
  in gaseous molecules and averaging over different compounds. The retained
  review locates it at OCR 3.2.1(f), rather than the bond-strength statement alone.

The approved orbital prompt also contains a grammatical omission. Both wording
issues are documented rather than silently changing a teacher-approved bank.
All six prompts and answers are compared verbatim in the browser check. None of
these approved source records contains a diagram field; no chemical image was
created. The former IGCSE bank is a cloud placeholder unavailable locally; no
IGCSE content or coverage claim is fabricated.

The development-only layout selector adds empty, single-card, long-text/notation
and 60-card repeated-content fixtures. These are explicitly layout checks, not
new curriculum content.

## Acceptance and boundaries

Implemented locally without subagents. Browser checks cover hidden answers,
keyboard and pointer input, native browser touch scrolling/swiping, repeated
events, undo and focus, complete/missed/restarted passes, zero/one/many cards,
reduced motion, long content, exact counts and production exclusion. Screenshots
are reviewed at desktop and mobile sizes; browser emulation is not a physical
phone hardware test.

No publication or assessed activity registration. The later hub promotion is
recorded separately in `recall-contract.md` and `src/recall/README.md`; it uses
course-appropriate starter decks and fixes the two sample wording issues. The
developer sample retains its original wording for reproducibility.
