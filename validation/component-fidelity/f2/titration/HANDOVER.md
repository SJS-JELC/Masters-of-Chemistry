# F06 — F2 titration source restoration (verification in progress)

## Ownership and source

F06 owns only `src/editors/titration-curve/TitrationCurveEditor.tsx`, `titration.css`, and this evidence directory. Requested model/effort: gpt-6.1-sol/high; effective runtime settings are not exposed. No nested delegation. No provider, chemistry, identity, timing, evidence or persistence engine changes.

Canonical original reference: A Level `activities/ph-titration-curves/index.html`, `styles.css`, `app.js`, `data.js`, `core.js`; `source-fingerprints.json` records unchanged readable bytes. Final appended style overrides are authoritative. Baseline exact implementation snapshots are `f2/before/src/editors/titration-curve/`; `path-hash-map.json` and exact no-index diffs retain before/current ownership evidence.

## Implementation proof

- Source builder DOM hierarchy: `builder-layout` → `piece-panel` (two `piece-group` / `piece-grid` groups, indicator panel) and `graph-panel` (source heading/chart/help). Source selectors are scoped beneath `titration-workspace`; common masthead/code/level/footer/timing are not owned here.
- Source SVG coordinates restored: 820×460, plot x76–780/y32–370, eight pH ticks0–14 and six volume ticks, labels/axes/guides; initial/final labelled yellow anchor rings; calculated equivalence joining pH; mint/purple sampled curve halves with SVG glow; source sharp strong-titrant thumbnail icons.
- Source diagram-only buttons retain descriptive accessible names/pressed states. Indicator names/ranges/acid↔alkali swatches use checked original data; both rows' source final sidebar cascade and graph-first breakpoints preserved.
- Source-equilibrium `curve`, `selectPiece`, `constrain`, and typed response alone remain authoritative. No marking/first-evidence/timing/storage engine in editor. `workspaceAside` mounts below builder for shared source actions/feedback.
- Accessible numeric/Undo controls are retained under a small expandable non-drag section. Local incomplete/out-of-range/off-step draft text is never sent as a typed curve response; Enter/blur commits valid completed numbers, Escape restores prior input, invalid commits retain the checked curve state with accessible status.
- A read-only editor with no supplied response derives the existing checked `answer(q)` model; no response callback fires. Shared teacher route must actually mount this editor before accepting teacher source fidelity.
- No hardcoded question-ID presentation list. Test sample IDs are evidence fixtures only. Supports all36 fixed source records and true levels2/3.

## Chemistry and curriculum

The unchanged checked source bank/provider retains OCR A5.1.3(n–o) provenance. All36 original-core answers and equilibrium curves compare exactly to current outputs; all36 model marks and typed submission validity pass. Chemical equations/calculation/equilibrium conventions are unchanged. Diprotic examples retain the question's complete-dissociation assumption. Equivalence is acid/base equivalents, distinct from observed indicator endpoint; the current scaffold preserves this meaningful explanation. No equation reference control exists in the canonical titration original.

## Retained failures and pending final gates

`provisional/` preserves first actual source/current full-size captures and provisional result files. The first rendered review found omitted `.curve-before`, `.curve-after`, `.curve-join` and `.guide-eq` selectors in scoped CSS extraction; these are now explicit. Earlier screenshots without curve strokes are not a visual PASS. Final captures wait for F03 wrapper/pane/teacher integration freeze and will assert visible curve/guide strokes.

Harness failures are retained: strict metric locator, synthetic fixture incorrectly reassigned the same immutable attempt ID, float input formatting expectation. They do not change implementation tests. Last provisional capture encountered transient incomplete shared `source-family` import. The first teacher probe diagnosed shared student-only ResponseControl mounting; relayed to F01/F03. Revision probe had not flipped the A Level year card before clicking an Upper Sixth leaf; harness now uses the visible switch.

Actual keyboard arrows/mouse drag/Undo, local invalid draft/Escape, mobile taps and browser CDP touch anchor drag plus non-drag input have passed. Actual practice assessment/correction/reload/first marks/time preservation and fresh Next have passed. These are headless Edge/pinned root Playwright1.62.1 browser interactions; native OS hidden/suspend is not claimed. Final teacher/revision/resume and rendered paired contacts remain pending shared freeze.

Protected original check: PASS1317 readable files and523 metadata-only placeholders unchanged. The intermediate typecheck has no titration diagnostics; it records concurrent shared implementation incompleteness and a historical test typing issue. Final integration checks belong to F01.
