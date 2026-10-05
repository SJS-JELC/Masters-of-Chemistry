# OLY2011-IMPLEMENT recovery handoff — W02

## Outcome

The surviving W01 implementation is review-ready. W02 reconciled the current app after the power cut, completed source and rendered review, corrected one neutral SVG accessibility attribute, and reran the applicable gates. Worker PASS is not root acceptance; the separate R01 review remains required. Nothing was published.

Requested role/model: replacement implementation worker W02, `gpt-6.1-sol/high`; effective model/effort and token usage are not independently exposed. No nested delegation. Root retains contracts, progress, log and final acceptance.

## Implemented behavior and integration

- Seven independent, immediately available drawings, with the existing checked molecular editor and independent undo histories. All source clues and a collapsible general NMR guide are present.
- React-independent graph marking reserves fully correct positions before consuming each remaining answer identity once. Duplicate surplus, blanks and invalid/wrong structures never inflate either count. Partial checks show only the two aggregate counts; all seven boxes receive the same yellow question-mark assessment styling. Edits remove all assessment feedback. Seven correct placements lock the drawings, save completion and enable challenge-specific restart.
- Two typed Olympiad registrations and separate discriminated progress types share the host/repository. Plain Olympiad navigation opens the selector. Explicit new and C3L6 links, Back/Forward, reload and late asynchronous loading preserve the chosen challenge.
- C3L6 compatibility, historical storage/erratum behavior, and the default one-argument `loadOlympiad` remain intact. New challenge state has no mastery, revision, gem, curriculum timing, attempt or statistics evidence. Teacher preview is view-only and does not save pupil state.

The approved spectrum source remains unchanged at SHA256 `07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d`. Runtime SHA256 is `e2c70e8a6b201e389974056092b2b1c79d2f6d8b24f0085b3f3cb57d3d58bf66`. After removing metadata/title/description, source and runtime text are byte-identical. The runtime generator reproduces the exact corrected asset. Browser DOMParser verifies valid XML and both neutral accessible IDs.

## W02 changes

1. `scripts/prepare-olympiad-2011.mjs` and its runtime SVG: corrected `<desc> id="spectrum-description">` to `<desc id="spectrum-description">`; no drawing changes.
2. `scripts/tests/c3-regression.test.ts` and its preparation script: added project-confined `OLYMPIAD_EVIDENCE_DIR` support, preserving all chemistry assertions, to direct future fixture regeneration into new evidence folders.
3. New recovery-only harnesses and evidence in this folder; both local builds and runtime manifests regenerated from current source.

Current task-related hashes, baseline hashes and W02 ownership are in `task-files.json` (35 files). `task-baseline.diff` retains existing-file diffs against immutable root baseline; new-file paths appear in `baseline-comparison.json` and their current source files. Shared file diffs also contain concurrent component-fidelity edits. This handoff does not accept or claim ownership of that unrelated work. Root contract/progress/baseline and sibling apps were not edited.

## Substantive chemistry and source review

W02 visually inspected retained immutable source renders `implementation/question-6.png`, `question-7.png`, and `scheme-4.png`, and read `resources/Olympiads/audit/organic-pilot-brief.md`. All clues match: C4H10O; alcohol/ether boiling and IR distinction; optical isomers of 2; compound 3 four proton environments/integrals 2:1:1:6; two proton environments for 4 and 5; 5 triplet δ1.21 / relative integral3 and quartet δ3.47 / integral2; 6 four and 7 three carbon-13 environments. The guide appropriately limits the n+1 rule to simple first-order equivalent-neighbor splitting and qualifies exchangeable OH behavior.

The fixed answer graphs agree with source scheme4: 1 butan-1-ol, 2 butan-2-ol, 3 2-methylpropan-1-ol, 4 2-methylpropan-2-ol, 5 ethoxyethane, 6 1-methoxypropane, 7 2-methoxypropane. Each is neutral, connected, single-bond C4H10O with five heavy atoms; all seven are graph-distinct. Box2 needs connectivity, not stereobonds. Tested equivalent atom order/IDs/orientation and explicitly attached hydrogen graphs are accepted. Charges, wrong formula/valence, disconnection and wrong bond orders cannot count.

The seven-point aggregate challenge intentionally follows the current user-approved contract, superseding the source's names/skeletal bonus and the older brief's hints/mastery proposals. It is an Olympiad extension related to organic representation/isomerism and NMR, using the source brief's checked OCR H432 v3.1 (May2026) mapping to 4.1.1 and 6.3.2; it does not claim the entire Olympiad puzzle as a prescribed OCR learning outcome. Suitable after the stated organic/NMR prerequisites. Learning objective: combine formula, functional-group evidence, integration/splitting and symmetry to construct and distinguish supported isomer graphs. No new formal specification audit is claimed.

## Actual rendered review

Inspected W01 desktop clues, partial uniform feedback, all-correct, teacher reference, tablet, mobile touch and mobile enlargement captures. Then inspected fresh W02 desktop clues, all-correct, mobile touch and enlarged spectrum captures from the passing browser run. The seven molecular previews match scheme4, with correct OH versus ether connectivity and no crowded/colliding labels. Spectrum geometry, integral values and C/B/A labels remain as approved, on white. Desktop content is legible; tablet uses stacked workspace and mobile two-column boxes, with no measured horizontal page overflow. On small screens the inline spectrum is a thumbnail; the modal supplies a large scrollable white view. Yellow questions and green ticks match aggregate policy, selected-box cyan outline marks selection only. No names or assignments leak through pupil alt/zoom/neutral SVG text. Teacher names appear only in explicit teacher preview.

Browser technology: installed Edge, headless, through the pinned read-only workspace Playwright dependency. Keyboard, pointer and emulated touch events act on the actual React UI; fixtures load graphs only for exhaustive completion/persistence scenarios. No manual OS-device or screen-reader session is claimed. `production-alevel-teacher.png` and `production-igcse-teacher.png` capture actual built teacher views.

## Validation

| Gate | Result / evidence |
|---|---|
| Current typecheck | PASS, `typecheck-final.txt` |
| Applicable tests | 55/55 PASS, `unit-tests-final.txt`: 5040 permutations, 1500 seeded duplicate/partial mixtures, chemical equivalence/error graphs, current C3 source regression, shared attempt behavior, all41 revision targets, timing registration, 273 mastery-equivalence/statistics cases |
| Actual React dev UI | All10 groups PASS / zero page errors, `browser-results.json`, including keyboard/touch editing, save failure/retry, undo/restore, uniform feedback, teacher no writes, completion locking/restart, challenge isolation/history, zero curriculum tables |
| Late asynchronous load | PASS, `async-navigation.json`: isomer module deliberately held while switching to C3, then released; C3 state remains selected |
| Both course builds | PASS, `build.txt` |
| Prefixed production smoke | All3 groups PASS / zero page errors, `production-smoke.json`: both entry prefixes, direct new link/refresh/teacher mode, legacy C3 link/selector/new challenge |
| Runtime releases | Both PASS, `release-checks.json`: A Level7, IGCSE6, exact13 switchable registrations, 154 runtime files each; shell gzip178523 /178522 bytes under204800 |
| Protected originals | PASS, `protected-originals-final.json`: 1317 files, zero changes,523 previously known metadata-only placeholders |
| Approved vector preservation | PASS, `spectrum-validation.json` |

The Vite server started by W02 was stopped after testing. Each browser harness closes its browser in `finally`; the production harness also stops its own preview child. No W02 test browser/server remains active. Existing unrelated processes were not stopped.

## Retained failures and limits

- `browser-cold-attempt1.*`: first page load exceeded the unchanged30s timeout during cold Vite preparation; no assertions ran. Warm rerun followed.
- `browser-warm-attempt2.*`: save retry completed, but the old harness immediately read React's closure-based save-status snapshot before the render. The new recovery harness waits for `saved` after flushing; all storage/failure assertions remain and then pass. No runtime storage change was made.
- `production-smoke-attempt1.*`: preview startup exited1 before browser checks; underlying startup reason was not retained. Using port5204 succeeded. `production-smoke-attempt2.*` passed both new-challenge entry checks then timed out on a nonexistent C3 heading in the new harness. The selector was corrected to C3's actual source heading; final smoke passes. No runtime routing change was made.
- The first C3 rerun unexpectedly rewrote W01's four deterministic fixture JSONs. Pre-rerun hashes were not captured, so W02 cannot certify those four files' prior immutability. After redirecting future output, separately generated recovery fixtures compare byte-identically with their current W01 equivalents (`fixture-reconciliation.json`). All other W01 evidence was retained. Do not relabel regenerated fixtures as independently pre-rerun fingerprinted.
- W01's `historical-broad-tests-attempt1.txt` remains a failed historical broad run. Old fixed12-registration/canonical-ID fixtures include obsolete IDs such as `h2o`; they are not a passing current full-suite claim. The55 current meaningful suites above and targeted browser gates are the scope evidence.
- Existing523 cloud placeholders, historical missing timing, prior Python/runtime and source-rights boundaries remain as previously recorded. This work requires no new Python/NMR regeneration and makes no publication/rights claim. Original approved spectrum provenance is retained.

## Reproduction

From the app directory, use `npm.cmd` in Windows PowerShell to avoid the local script-execution restriction:

```powershell
npm.cmd run typecheck
$env:OLYMPIAD_EVIDENCE_DIR = 'validation/olympiad-2011-q4/recovery-w02'
node --test scripts/tests/olympiad-2011.test.ts scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs validation/s1/attempt/attempt.test.mjs scripts/tests/c3-regression.test.ts validation/s4/statistics/model.test.mjs
node scripts/build.mjs
node scripts/release-s4.mjs alevel
node scripts/release-s4.mjs igcse
node scripts/protect-originals.mjs check --output validation/olympiad-2011-q4/recovery-w02/protected-originals-final.json
node validation/olympiad-2011-q4/recovery-w02/audit.mjs
```

For dev UI/async tests start `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5187 --strictPort`, then run this folder's `browser.mjs` and `async-navigation.mjs`, and stop Vite. `production-smoke.mjs` starts/stops its own local preview on5204. Before a new review, copy harnesses or preserve these recovery results and use a new evidence folder. The source SVG preparation script regenerates the neutral runtime asset from the immutable approved source; its default evidence destination is the historical implementation folder, so do not run it during a read-only review. `audit.mjs` checks exact generator output without overwriting it.
