# Factual Recall main-app handoff

> Generated verification reports were retired on12 October2026 after root acceptance, independent cleanup review and dependency preservation. Historical counts/dispositions below remain historical; the source-owned [cleanup record](docs/maintenance/recent-verification-cleanup.md) records current checks.

Run RECALL-MAIN-20261010: root acceptedS0–S5 and the completed implementation; status ACCEPTED_COMPLETE. No deployment or commit. Current combined React app only; historical siblings/source teacher inputs and frozen150 historical definitions/marker preserved.

## Open the live source

- [Main app / fresh A Level default](http://127.0.0.1:5261/)
- [IGCSE Recall](http://127.0.0.1:5261/?course=igcse&view=recall)
- [A Level Recall](http://127.0.0.1:5261/?course=alevel&view=recall)
- [All121 IGCSE review harness](http://127.0.0.1:5261/scripts/tests/igcse-recall-review/index.html)
- [Direct review example Q004](http://127.0.0.1:5261/scripts/tests/igcse-recall-review/index.html?id=igcse-recall-004)

The historical Recall task preview5203 and the historical production preview5182 were closed only after their generated log locks were identified during cleanup. Current main source preview5261 and the unrelated5197 source service remain. These local development links are not a deployment. The review harness uses production controls/marker and separate review-local storage; it creates no pupil evidence or timing. Export review JSON to retain raw answers, fixed automatic results, separate learning decisions and notes for all IDs.

## Delivered behavior

Global and gem-scoped Flashcards/Test share the live121 IGCSE/six inherited A Level facts. IDs appear in both modes. Topic/year/strand choices and mode/deck/attempt checkpoints persist in the existing course/profile namespace. Empty gem launches are absent; linked facts retain one canonical identity.

IGCSE Test provides accessible per-field feedback and immediate qualified models; selective prose corrections stay separate from immutable first evidence. Formula overlays preserve raw errors/caret/delete. Dynamic exceptions start at zero without disclosed expected counts. Flashcards support reveal/sort/undo/missed retry/restart/keyboard/touch and create no independent marks. Historical changed formats start fresh while old evidence remains intact. Existing graded A Level behavior/mastery is preserved. Global Stats adds a separate ungraded Recall time chart using independent original checks only.

## Reproduce from the app folder

```powershell
# Start a new local source server only when port5203 is free.
npm.cmd run dev -- --port 5203

# Regenerate reviewed content; original teacher inputs stay unchanged.
node --experimental-strip-types src/recall/prepare-approved.mjs

# Scoped controls/content/contracts/persistence/Statistics regressions.
node --test scripts/tests/recall-main-*.test.mjs
npm.cmd run typecheck

# Production-component manual review harness checks.
node --experimental-strip-types --test scripts/tests/igcse-recall-review/review-state.test.mjs
node node_modules/typescript/bin/tsc --noEmit -p scripts/tests/igcse-recall-review/tsconfig.json
node scripts/tests/igcse-recall-review/verify.mjs

# Combined production build and local inventory only.
npm.cmd run build
npm.cmd run release:app
npm.cmd run check:release
```

Generator evidence defaults to .artifacts/recall-main/generated-content; RECALL_CONTENT_EVIDENCE_DIR can select a new run-local evidence path. Do not reuse accepted stage paths. Production output is dist/app, inventory release/app.runtime.json; neither command deploys.

## Acceptance evidence

- S4 aggregate (historical report retired12 October2026): substantive chemistry/all24 amendments/all121 models and independent defaultmain390 assertions, actual121 production checks, restored decks/attempts/migration, accessibility/rendering and mastery. All review defects fixed and independently closed.
- Independent chemistry (historical report retired12 October2026) and main behavior (historical report retired12 October2026).
- Actual native timing (historical report retired12 October2026): hidden checkpoint unchanged, real60s idle stops,6500ms renderer stall excluded, first timing fixed across edits/reload and fresh Next0ms. Exact native Recall and graded Stats transfer (historical report retired12 October2026).
- Final gate matrix (historical report retired12 October2026), final manifest (historical report retired12 October2026), current fingerprints (historical report retired12 October2026).

Build/check:54 scoped tests, types, harness3 state tests/types, root/app registration/timing gates and build pass.223 runtime files/16 activities/96 lazy JavaScript chunks; initial gzip195990 of204800bytes. Separate Recall hub metadata included; development harness excluded.

## Retained limitations

Current-run protected baseline passes1320/0; historical original guard FAIL529 remains unchanged and is not rewritten. Broader wildcard Recall suite passes75/80, with five unrelated existing formulae identity failures;20 direct input hashes equalS0. These are accepted documented limitations, not scope blockers. No whole-repository-green claim.

Native hidden-tab and renderer sampling suspension are observed; physical laptop sleep, minimized-window visibility, hardware IME and physical phone behavior are not certified. Native Edge uses CDP noDefaults without DOM/focus/visibility emulation; OS occlusion calculation is disabled to observe actual selected/background tab visibility. Missing historical durations remain missing. Formal fresh full-PDF OCR audit is not claimed; inherited A Level definitions remain unchanged.
