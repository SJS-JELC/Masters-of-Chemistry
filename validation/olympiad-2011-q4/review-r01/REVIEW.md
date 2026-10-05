# OLY2011-REVIEW — independent R01 review

## Disposition

**PASS. No substantive scoped defect found; no author correction required.** The implementation meets the user-approved `olympiad-2011-q4-contract.md`. This is independent review evidence for root's final acceptance, not publication or acceptance of concurrent component-fidelity work.

R01 requested `gpt-6.1-sol/high`; effective model/effort and actual token usage are not exposed. Work remained local under the agreed single direct-child review route, with no delegates. Personal plan-delegation and repository delegate-work instructions were read. Source, runtime, contracts, prior evidence and shared log were read-only; R01 writes only this folder.

## Evidence inspected and substantive findings

Read the workspace/project AGENTS, project-contract, IMPLEMENTATION, project/addition progress, approved addition contract, W02 handoff/completion, all task-file hashes, baseline comparison and relevant existing-file diffs. Inspected current new content/policy/view/CSS/generator/tests and the shared host, registry, routing, repository and validation code. This was a shared-code review, not manifest-only acceptance.

| Area | Independent finding |
|---|---|
| Chemistry/source | Visually inspected original question pages 6–7 and scheme 4 retained in `../implementation/`, and read the organic pilot brief. All source clues agree with the app: C4H10O; alcohol/ether boiling and broad 3300 cm−1 IR distinction; optical isomerism of 2; compound 3 NMR evidence; two proton environments for 4/5;5's δ1.21 triplet/integral3 and δ3.47 quartet/integral2; four/three carbon environments for 6/7. Guide qualifies first-order n+1 splitting and variable exchangeable OH behavior. |
| Answer graphs | Independently reconciled edge lists, names and scheme: 1 butan-1-ol; 2 butan-2-ol; 3 2-methylpropan-1-ol; 4 2-methylpropan-2-ol; 5 ethoxyethane; 6 1-methoxypropane; 7 2-methoxypropane. Each has four C/one O, neutral connected single-bond connectivity and formula C4H10O. The seven graphs are distinct; box 2 needs connectivity without stereochemistry. No source name/skeletal bonus was inadvertently retained. |
| Aggregate marking | Exact placements reserve their target identities first. Each remaining isomer can then count once. Blanks, invalid graphs, wrong structures and surplus duplicates do not inflate either count. Counts sum to at most7. Deterministic tests exhaust 5040 permutations and 1500 seeded partial/duplicate mixtures, plus charge/valence/formula/disconnection and explicit-H/ID/orientation equivalence cases. |
| Feedback/accessibility | Until all 7 are correct, all 7 boxes have the same yellow #ffde59/question-mark state, including blank and correct boxes. Only aggregate counts are supplied; status glyphs are aria-hidden and numbered labels carry no correctness/identity diagnoses. Selection outline means selection. An edit clears check/borders; selecting a box preserves assessment. All7 correct produces green ticks and view-only drawings. General NMR/drawing instructions are appropriate; no pupil answer reveal/name fields/extra hints were enabled. |
| Persistence/races | Activity-discriminated progress retains separate storage keys/profile namespace and default one-argument C3 loading. Stored checks are recomputed against current graphs/fingerprint; stale/forged completion is rejected. Host uses generation checks around import/load, current activity/read-only refs, immediate in-memory state and serialized copied saves. Navigation waits for saves and refuses to discard failed saves. Independent rapid queued commands preserved all seven graphs and the final saved record; reload matched exactly. Failed-save browser Back was blocked, and retry restored navigation. |
| C3 compatibility/integration | C3 policy/bank remains its own staged channel. Typed registries/progress APIs add the new challenge without curriculum identity changes. Olympiad selection/direct links/history use activity query values, and old C3 query links retain routing. C3 chemical/historical/erratum tests reproduce current source evidence and retain past raw outcomes. Import/export union and per-activity keys preserve challenge isolation. |
| No curriculum evidence/teacher | Both registrations remain outside mastery, gems, revision, curriculum timing and statistics. In the independent completed pupil run: one Olympiad row, zero attempts/evidence/sessions. Fresh direct teacher mode showed checked structures/names, disabled editing, and zero rows in all four stores. Existing pupil mode switches retain drawings; teacher selection is local. |
| SVG/provenance | Approved source SHA256 remains `07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d`. Runtime SHA256 is `e2c70e8a6b201e389974056092b2b1c79d2f6d8b24f0085b3f3cb57d3d58bf66`. Removing metadata/title/description yields byte-identical SVG drawing text. The corrected neutral generator output is exact, without running the mutating generator. W02 browser DOMParser/ID checks were inspected. Pupil image/enlargement text is neutral; chemical identity appears only in explicit teacher reference. |

The curriculum treatment is an Olympiad extension after organic/isomerism/NMR prerequisites, consistent with the checked brief's OCR H432 v3.1 mapping to 4.1.1/6.3.2. This review introduces no new formal specification-coverage claim. Older brief suggestions for hints/mastery/timing/transfer items are superseded for this addition by the approved contract.

## Independent validation and rendered inspection

| Gate | R01 result/evidence |
|---|---|
| Scoped chemistry/C3 tests |18/18 PASS; `independent-unit.txt`;5040 permutations and 1500 seeded mixtures included. Four C3 fixtures independently regenerated here and byte-match W02 recovery fixtures. |
| Actual React/browser |6/6 focused groups PASS; `browser-independent.json`; zero page errors/failed requests. Pinned workspace Playwright and installed Edge, headless. |
| Typecheck |PASS; `typecheck.txt`. |
| Source/baseline/vector hashes |PASS; `fingerprint-audit.json`; 33 source/test task files match W02, existing-file baseline hashes match retained copies. |
| Current production release integrity |Both PASS; independently call `validateRelease` in `fingerprint-audit.mjs`. Exact 13 switchable activities, approved runtime closure and shell budgets retained. No builds/releases were performed by R01. |
| Protected siblings |PASS; 1317 files, zero changes; 523 metadata-only placeholders remain explicit in `protected-originals.json`. |
| Catalogue reproduction check |`node scripts/write-catalogue-definitions.mjs --check` PASS: 13 activities/16 curriculum gems. No catalogue rewrite. |
| Cleanup |Own browser closed in finally; own Vite terminated; `process-cleanup.json` verifies port 5193 no longer listening. |

The six browser groups supplement W02's inspected 10-group dev UI, late-module race, three prefixed production-smoke groups and 55 applicable tests. They independently exercise a complete butan-1-ol built through keyboard controls, correct/blank uniform feedback and edit clearing; queued saves; failed-save Back/retry; completion locking and cancelled restart; fresh teacher direct link/no writes; mobile touch editing, modal scrolling/Escape/focus restoration and320px reflow. Runtime harness commands were used only for exhaustive multi-box queue/completion fixtures, not for the actual keyboard/touch interaction checks.

Visually inspected original source images; W02 desktop completed/mobile partial/mobile enlarged captures; and fresh R01 `keyboard-alcohol-partial.png`, `completion.png`, `mobile-320.png`, `mobile-zoom-right.png`. The seven solved depictions match the source scheme, with correct OH versus ether placement and no label collisions. The supplied spectrum remains white and its labels/integrals retain the approved geometry. On small screens the inline spectrum is a thumbnail; the large scrollable dialog makes it inspectable. Mobile tap highlight in the immediate enlargement capture is transient browser feedback, not SVG drawing content. No horizontal page overflow was measured at 320px.

## Retained failures and boundaries

- `browser-cold-attempt1.json/.png` and `browser-cold-attempt2.json/.png` retain initial cold Vite bootstrap timeouts, before assertions and without page errors. The successful run also records its initial cold-bootstrap timeout; warming the same live server allowed the app to load. This is development bootstrap evidence, not a production latency measurement.
- `browser-keyboard-attempt3.json/.png` retains a scripted keyboard sequence that raced the existing editor's animation-frame focus transfer and produced four rather than five atoms. The final harness explicitly waits for focus settling and checks every added atom; it constructs the complete alcohol and marks it correctly. No runtime correction was made, and no guarantee of arbitrarily fast synthetic keyboard dispatch is claimed.
- Only generated `release/alevel.runtime.json` and `release/igcse.runtime.json` changed from the W02 ledger during review. Root confirmed a separately authorised F2 recovery/build session. R01 records both old/current hashes and validates current release bytes; it does not accept that session's unrelated curriculum changes. All 33 task source/test inputs remained unchanged.
- W02's four original W01 fixture files were regenerated before W02 captured pre-rerun hashes. Independent current reproduction confirms consistency, not their earlier immutability. That limitation is preserved.
- Historical broad S1/S5 fixture failures remain failures; they are not cited as passing current full-suite evidence.
- Headless Edge/emulated touch and DOM/keyboard verification do not claim a physical-device or screen-reader session. No new Python/NMR generation or source-rights decision occurred. No publication is authorised by this review.

## Reproduction

Run from this app folder, keeping all evidence in this review folder:

```powershell
$env:OLYMPIAD_EVIDENCE_DIR = 'validation/olympiad-2011-q4/review-r01'
node --test scripts/tests/olympiad-2011.test.ts scripts/tests/c3-regression.test.ts
npm.cmd run typecheck
node validation/olympiad-2011-q4/review-r01/fingerprint-audit.mjs
node scripts/write-catalogue-definitions.mjs --check
node scripts/protect-originals.mjs check --output validation/olympiad-2011-q4/review-r01/protected-originals.json
node validation/olympiad-2011-q4/review-r01/browser-independent.mjs
```

The browser harness starts/stops its own Vite on 5193 and closes its Edge browser in finally. Preserve current evidence before rerunning. Do not run the preparation generator during review: its default output includes historical evidence. Root owns final acceptance and progress/log updates.


