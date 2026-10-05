# S2-DOTCROSS handover

Job A10 / S2-DOTCROSS, run MASTERS-REACT-20261002. Requested GPT-6.1 Sol High; effective runtime and usage are not exposed. Worker did not delegate. Changes are restricted to assigned activity/editor/chemistry/validation folders. Protected originals were read only; no original builds, dependencies, Git state, hydration or browser stores were touched.

## Implemented

- `src/activities/alevel/dot-and-cross/index.ts` exports the typed lazy `dotCrossAdapter`. Provider exposes all 91 teacher IDs, exact original deduplicated pupil pools at levels 1/2/3, hashed DAC review codes, stable source IDs and old l6-t2-1-4 gem alias. The source formula-only unnamed-isomer prompt and one-valid-example worked answer are retained. Active A Level `hideFormula()` is false, so fixed/named and ionic prompts retain name plus formula. Level1/2 categories alternate and refill independently; level3 is unrestricted.
- `bank.js` is complete checked source data. `core.js` extracts the existing pure chemical validator unchanged. `layout.js` extracts only pure pair/slot geometry, with a per-question factory replacing global mutable question state. Neither contains page rendering, timing, storage or scheduling. Typed declarations define their boundary.
- `DotCrossEditor` is a React atom/electron/shared-bond/group/bracket/charge editor using the existing outer shared frame. It has spatial/touch placement, movable atoms, consistent dot/cross/triangle origins, explicit slot/charge controls, deletion, semantic undo/redo and shared bounded history restoration. Keyboard movement and all non-drag construction routes were exercised in a real browser.
- Fit/Magnify keeps large labels/electrons in an internal scroll viewport. Worked diagrams use actual source bounds, charges and padding; small screens scroll internally instead of shrinking every symbol. The unchanged diagram label font remains distinct from the course/editor's licensed Comfortaa branding; no font embedding or extra dependency was introduced.
- Marking distinguishes incomplete/malformed inputs from structurally valid chemical wrongness. It preserves original substantive0/.5/1 score mathematics using one aggregate mark plus zero-weight feedback criteria. The shared attempt controller alone owns first response/results, assistance, timing, persistence and progression.

The source and per-record gates are described in `CHEMISTRY-REVIEW.md`. `source-fingerprints.json` retains the original six-module evidence. `final-source-fingerprints.json` identifies every final owned runtime file.

## Checks and evidence

Run from the workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/s2/dot-cross/extract.mjs
node apps/Masters-of-Chemistry/validation/s2/dot-cross/port-reference-checks.mjs
node apps/Masters-of-Chemistry/validation/s2/dot-cross/run-checks.mjs
node apps/Masters-of-Chemistry/node_modules/typescript/bin/tsc --noEmit -p apps/Masters-of-Chemistry/tsconfig.json
node apps/Masters-of-Chemistry/validation/s2/dot-cross/render-bank.mjs
node apps/Masters-of-Chemistry/validation/s2/dot-cross/browser.mjs
```

`extract.mjs` reproduces bank/core/layout. Run it only when intentionally regenerating those owned modules from current protected-source evidence. `render-bank.mjs` resets visual dispositions to PENDING; direct inspection of every image is required before retaining a new PASS. `finish-evidence.mjs` records the already-performed review, not an automatic substitute for inspection.

- TypeScript compilation passed after the final runtime changes.
- Six suites pass: provider/91 records/all level pools/identities/history/conservation, inherited72 independent inventory/geometry/provenance, advanced91 chemistry with19 independently counted inventories, unseen valid isomers, lithium retained-duet alternatives, seven pair-layout rotation/partial-entry/obstruction cases. Commands/results/logs are retained in `unit-results.json` and sibling `.log` files.
- `atlas-provenance.json` repairs the historic path using actual layout-migration evidence and the real local IGCSE corpus. All referenced IDs and observed bands are checked; no provenance is fabricated. Both original tests remain untouched.
- All 91 model diagrams were XML-checked, browser-decoded and rendered into11 contact sheets. A10 opened and substantively inspected all11, including every reference's labels, electrons, ionic brackets/charges, incomplete/expanded central shells and crowding. PASS and screenshot fingerprints are retained in `rendered-bank.json`.
- Final production-host headless browser passed12 flows using pinned workspace Playwright1.62.1/Microsoft Edge. Real non-drag UI built the complete NaCl reference, including correct origin slots, ion brackets and charges; no response seam substituted for editor construction. Deterministic native seed1 was set only in this isolated test context to trigger a known source-bank route. UI wrong-check/undo/correction, reload/restore, fixed first evidence, Next, pause/reload/resume, keyboard movement, touch placement, Fit/Magnify, teacher/review, mobile bounds, revision ADD ALL/launch/check/Next all passed. `browser-results.json` and dated results preserve actual runs. Screenshots are retained beside the script.

## Retained failures and fixes

Early harness failures were setup/assertion issues: bundled headless Chromium was unavailable (resolved by installed Edge channel); a nested `summary` selector was ambiguous (scoped to direct child); Playwright string selectOption matched the human slot label as well as numeric value (resolved by explicit `{value:…}`); asynchronous Next needed an identity-change wait, not only the preceding save-status wait. Dated failed result files retain these observed failures where the script reached its report handler. The initial launcher failed before that handler; its exact tool output was “Executable doesn't exist … chromium_headless_shell-1234 …”. No install or source workaround was performed.

Rendered review found an unnecessary nested editor frame and mobile symbols too small. The foreman authorized the bounded owned-source legibility fix. All affected browser/model checks were rerun after it. Earlier screenshots may contain the old frames or a Suspense placeholder; final named screenshots were replaced after waiting for loaded editor and decoded image, while dated prior results preserve their limited scope.

## Remaining acceptance gates

1. **Native timing: pending A07.** Foreman owns the independent native-headed reservation and final dot-cross3/5-minute idle/background tail. Headless visibility emulation is not proof. This worker does not claim native idle/background/suspension or stats-chart acceptance. Actual history transferred immutable first timing in the headless production flow; independent native and final stats integration disposition must be attached by foreman.
2. **Shared first-assessment feedback label: resolved and verified.** The initial shared player prefixed every0/0 informational criterion “Correct”, even for failed “○ …” criteria. The before-fix screenshot is retained as `shared-informational-label-failure.png`; the foreman acknowledged its first replacement had silently missed. A01 subsequently applied and verified an ASCII-safe structural guard. A10 ran the focused real production ionic flow in `feedback-fix.mjs`: all failed informational criteria have no Correct prefix or strong tag; the aggregate still shows Partly correct at0.5 and Incorrect at0; a complete corrected NaCl built through the real editor checks correct while preserving the first partial result and one evidence record. `shared-feedback-fix.json` and three new screenshots retain the separate post-fix evidence. A10 inspected the final correction screenshot and confirmed the old label contradiction is gone. No owned runtime source changed in this follow-up.

Final worker disposition is ESCALATE solely for the remaining independent native timing/suspension acceptance gate, with usable complete owned outputs. No app publication is authorized or performed.
