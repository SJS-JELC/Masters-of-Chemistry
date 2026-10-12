# Factual Recall refinements

> Generated verification reports were retired on12 October2026 after root acceptance, independent cleanup review and dependency preservation. Historical counts/dispositions below remain historical; the source-owned [cleanup record](docs/maintenance/recent-verification-cleanup.md) records current checks.

Accepted 2026-10-11T13:39:47.053Z after implementation and separate independent review.

## Delivered

- Lean Factual Recall landing with Flashcards and Mastery Test icon cards.
- Saved, removable topic pills with recall mastery colours; compact + Choose Content dropdown, year/batch controls and no empty topics.
- Cleaner Flashcards pane, quieter IDs, SPACE above reveal and actual next-question preview.
- Reveal eligibility survives flipping back, reload and undo; fresh cards remain locked until revealed.
- Back to Recall replaces direct Home; redundant progress/instruction sections removed.

Topic mastery is the mean existing recall stage across distinct linked facts, with missing facts at zero. It does not alter graded awards or scheduling.

## Verification

Author46 focused tests, typecheck and production build passed. Independent reviewer19 focused tests,10 browser check groups and12 inspected desktop/mobile screenshots passed with no blocking findings. Root inspected shared-state changes and representative renders; all11 scoped source hashes still match review. Protected sibling apps1320 files unchanged. Local release225 runtime files/16 activities/96 lazy JS chunks; initial JavaScript196353 gzip bytes within204800 budget. No deployment.

[Open IGCSE Recall](http://127.0.0.1:5203/?course=igcse&view=recall) · [Open A Level Recall](http://127.0.0.1:5203/?course=alevel&view=recall)

## Evidence and limits

See final manifest (historical report retired12 October2026), author handoff (historical report retired12 October2026) and independent review (historical report retired12 October2026) for reproduction commands and evidence. Headless Edge/mobile viewport/CDP touch testing is not physical-phone certification. Five outside-scope files differ from historical S5; they were preserved and their timing/authorship are unverified. Historical529 baseline differences and five unrelated formulae test failures remain documented; no all-repository-green claim.
