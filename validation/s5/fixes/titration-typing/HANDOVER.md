# A14 S5-FIX-TITRATION-TYPING

## Result

Fixed the independent A23 finding that actual Ctrl+A → Backspace → sequential `3.1` typed into Initial pH became14. The three numeric anchor fields now keep editable local text and update semantic graph data only after a completed valid value on blur/Enter. Empty, partial decimal and temporarily out-of-range text stay intact while typing. Invalid completion explicitly restores the previous graph value with status text and aria-invalid; Escape cancels. Valid values retain existing source range/step and curve-species constraints.

Only runtime file changed: src/editors/titration-curve/TitrationCurveEditor.tsx. New AnchorInput helper is React presentation state only; marking, numerical engine, shared host/controller/timing/persistence remain unchanged. Values synchronise with controlled external value changes, Undo, SVG keyboard/pointer gestures and reload. Question changes/read-only transitions clear local curve history/preview/drag; keyed inputs reset drafts on Next. Existing teacher model-only UI is preserved, with no editable anchors/evidence. An explicitly readOnly editor input is also disabled by the helper.

Draft text is intentionally transient and is not a saved answer. Enter or leaving the field commits it. A23's original typing performance script must use that completion event before measuring a semantic save. Source pH0.1 and volume0.5 steps remain required; invalid text never enters the chemistry engine. A rejected draft returns to the visibly displayed previous semantic value, preventing hidden invalid scoring state.

## Verification

Own Vite DEV server127.0.0.1:5208; installed Microsoft Edge headless with workspace-pinned Playwright. Isolated new-project a14-s5-typing databases. Server closed after verification; no deployment/build writes or changes to original apps.

Nine actual browser checks pass:

- Exact focus/Ctrl+A/Backspace/40ms sequential keystrokes for3.1,4.2,5.3.
- Final pH12.9 and longer equivalence volume37.5; both Enter and blur commit.
- Out-of-range20 and off-step3.15 remain editable until completion, restore previous value with explicit feedback, recover to2.8.
- Empty/dot-only drafts and Escape cancellation.
- Undo and externally changed controlled response sync all inputs.
- Existing slider arrow keys and actual SVG pointer drag still work.
- Zero independent evidence during editing; committed values reload under same attempt/question.
- First response/timing remains fixed through a correction; Next resets question drafts/history.
- Current teacher checked model contains no editable anchor controls/evidence; mobile no page overflow.

Strict TypeScript and single-file Prettier pass. Seven existing full36-question source/chemistry fixtures pass. Protected1317 original files pass. Retained before/after, SHA256s, actual diff, logs, screenshot and browser-results.json support review.

One verification side effect is disclosed: invoking the existing S3 regression test deterministically rewrote validation/s3/titration/reference-review.json with deterministic source-derived records. Before hash/bytes were not captured, so byte-identical historical evidence is not independently claimed. No source/chemistry changes were made; this test-side output was not planned ownership. Further fix evidence remains in this owned S5 folder. Initial float equality fixture used binary5.3/2.8 exact equality; changed to1e-7 comparison, matching unchanged source snap arithmetic. Initial teacher fixture used former S3 editor/heading assumptions; adapted to current S4 checked-answer-only teacher UI. Raw failures retained. No product checks were weakened.

Requested model/effort gpt-6.1-sol/high; effective runtime and usage unknown. This worker PASS is not independent acceptance; A23 owns fresh static-build acceptance.

## Reproduce

From project root:

```
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5208 --strictPort
node validation/s5/fixes/titration-typing/browser.mjs
npm.cmd run typecheck
node node_modules/prettier/bin/prettier.cjs --check src/editors/titration-curve/TitrationCurveEditor.tsx
```

The chemistry regression and original-protection logs retain their executed commands; avoid rerunning the former without redirecting its generated reference review into owned current-stage evidence.

