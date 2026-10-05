# Recall

Shared, lazy-loaded self-marked flashcards at `?view=recall&course=alevel` or
`?view=recall&course=igcse`. Both landing maps have a Recall tile. The page has a
Home button and preserves its course through browser history and reload.

`FlashcardTable.tsx` is the approved reusable component; the development catalogue
imports this same component for its layout fixtures. Every visit/pass starts
fresh, with no database, curriculum score or time writes. Once an answer has been
revealed, buttons, arrows and swiping can sort either face. Undo restores the
revealed card. The dark remaining deck has separate pale card edges.

## Starter content and review

Six facts per course; this is a starter set, not full curriculum coverage.

- **A Level:** approved electron-shell/subshell capacities, filling rules, solid
  ionic structure, dative bond and average bond enthalpy. Retained OCR Chemistry A
  version 3.1 (May 2026) references are recorded per card in `provenance.json`.
  The orbital prompt's grammar is corrected without changing its answer. The
  ionic prompt explicitly says **solid**, with the new ID `ionic-lattice-solid`.
- **IGCSE:** six unflagged teacher-reviewed single-answer CSV entries: aqueous
  state symbol, melting, condensation, freezing, sublimation and solvent. These
  are selected from the Pearson IGCSE particles/solutions bank. Chemistry review
  confirms the directions of all state changes, `(aq)` for aqueous solution and
  solvent as the liquid in which the solute dissolves. Capitalisation of
  “Sublimation” is retained. No full Pearson specification audit is claimed.

All A-level answers were substantively reviewed with the approved prototype:
2n² capacities, 2/6/10 subshells, Aufbau/Pauli/Hund rules, solid ionic lattice,
one-atom donation of a shared pair, and gas-phase molar average bond enthalpy.
All answers remain unchanged. Both prompt adaptations remove the documented
prototype limitations. No diagrams, equation balancing or numerical marking are
introduced. The IGCSE CSV is readable even though the newer working JSON remains
an unavailable cloud placeholder; none of the former game's code/assets is used.

## Reproduce and verify

From this app directory:

```powershell
node scripts/prepare_recall.mjs
npm.cmd run typecheck
npm.cmd run build
node scripts/preview.mjs
```

With the preview running, run `node scripts/review_recall_hub.mjs` in a second
terminal. The existing `node scripts/review_flashcards.mjs` checks the shared
table through the development catalogue (dev server port 5181). Run
`npm.cmd run check:originals` to check the read-only sibling apps.

`prepare_recall.mjs --write` deliberately regenerates only the runtime starter
data/provenance from the reviewed sources. It never overwrites the teacher CSV.
Source hashes and selected original records are retained in `provenance.json`,
which is not imported into the runtime. Current scope is in `recall-contract.md`.
