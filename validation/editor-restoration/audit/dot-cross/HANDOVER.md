# E02 · DOT-CROSS-AUDIT · E0

## Outcome

Restore the original integrated dot-and-cross workspace through source reuse. Keep the accepted React chemistry, banks, marking, attempt controller, timing, persistence and scheduler. This audit makes no runtime edits. E1 is pending root acceptance.

The original has one compact prompt, a full element/electron/charge palette, a dark drawing surface and an adjacent marking pane on desktop. On mobile the pane follows the canvas. The current React editor has an element dropdown, a white canvas, several nested frames and additional pre-canvas instruction panels. Its feedback and worked answer follow the whole editor. These are material geometry and interaction differences, confirmed in actual desktop/mobile screenshots.

## Retained evidence and reproduction

- `audit.json`: 24 source-backed UI/interaction/course entries, current presence/gaps, source reuse, E1 ownership/interfaces and acceptance gates.
- `inventory-verification.json`: all 91 A Level and 72 IGCSE records exactly equal source; all references validate and self-mark correct; 2,380 individual electron points and all shell radii equal the original renderers.
- `source-fingerprints.json`: inspected original and current source plus loaded original presentation assets.
- `browser-results.json`, `screens/`: original/current 1440×1000 and 390×844 initial, single atom, failed feedback and checked/worked answer; additional original PCl5 expanded shell and hover preview. Geometry is measured after fonts load. Four paired browser cases, no page errors or document overflow.
- `inspected-original-integrity.json`: every inspected original file/asset still equals its protected historical baseline.
- `completion.json`: compact completion manifest; PASS is audit completion, not E1 acceptance.

From workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/editor-restoration/audit/dot-cross/inventory.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/audit/dot-cross/capture.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/audit/dot-cross/write-audit.mjs
```

`capture.mjs` requires the already verified new source server at `127.0.0.1:5183`. It asserts the pinned root Playwright 1.62.1, launches headless Edge in fresh isolated contexts and serves originals read-only on an ephemeral localhost port. It never builds original apps or opens a real browser profile. `/alevel.html` at 5182 returned 404 and was not treated as production evidence. Scripts only write this audit folder. Whole protected-app checks remain with the foreman because their existing script writes a shared report and reads broad historical cloud placeholders.

## Reuse, rather than approximate

1. Recreate original `index.html` editor subtree in React: toolbar → workspace → drawing-area/canvas-wrap plus marking aside. Retain original classes beneath one scoped `.dot-cross-editor` root. Do not import page-global CSS, legacy `app.js`, storage, bridge or mastery globals.
2. Extract original final effective CSS cascade, palette order, hit areas, glyphs, colours, desktop 330px/520px sidebar/canvas geometry and mobile wrapping. Earlier rules are overridden: use the measured final source cascade. The live surface is navy; the checked answer is black on white. Preserve course colour differences and Comfortaa Bold.
3. Reuse original `snap`, `organise`, connected-component charge routing and pointer capture/cancellation algorithms as React-free helpers/semantic engine commands. Keep shared `layout.js`: its entire accepted reference geometry was checked against original renderers. Expose `lensPath`/region helpers as necessary rather than duplicate geometric guesses.
4. Render original SVG topology declaratively: brackets behind atoms; large transparent shell/shared-region targets; atom shell plus radius-25 hit; element label; electron radius-8 hit plus exact dot/cross/triangle mark; ghost previews and drawing cursor. Retain the original renderer's focus restoration intent in React.
5. Keep current explicit keyboard/non-drag controls in a collapsed accessible section. Source gestures and visible palette must work without opening it. Default source adaptive viewBox is not a fixed 1000×650 letterbox. Original has no wheel/pinch zoom; the current magnify/scroll option can remain a secondary accessibility affordance if it does not alter the normal source layout.

## E1 shared interface and ownership

**Dot worker owns:** `src/editors/dot-and-cross/**`, `src/chemistry/dot-and-cross/engine.ts`, `layout.js`, `layout.d.ts`, `model.ts`, and `validation/editor-restoration/implementation/dot-cross/**`.

**Foreman owns:** `ActivityHost.tsx`, `QuestionPlayer.tsx`, `styles/platform.css`, `ResponseControl.tsx`, `EditorFrame.tsx`, `Content.tsx`/`DiagramViewport.tsx` only where required for dot scoped integration, shared `contracts/editors.ts`, strict `persistence/validation.ts`, integration tests/builds. Accepted landing, other editors, both source apps, banks and chemical core are read-only.

Minimal proposed interface: optional `workspaceAside?: ReactNode` on `EditorSurfaceProps`. `QuestionPlayer` constructs its existing actions/assessment/correction/save content once, passes it through `ResponseControl` to the dot editor and renders it inside the source marking pane. A specialised dot response branch bypasses the generic nested EditorFrame. The player presents one source-style question prompt and exposes retained built-in conventions through compact help. This is a presentation change, not another attempt controller. Provider changes need explicit file assignment and must preserve all accepted content/IDs/selection.

The player also owns the native answer dialog and existing assistance commands. Before assessment, reveal still ends independent answering as assisted; after assessment, Show answer records support but never improves the original first result. Dialog close/reopen is UI-only. Check dispatches the existing submit command for the first response and check-correction thereafter. Next remains scheduler-controlled. Save errors stay visible in the pane and preserve pause/Home/Next guard behaviour.

### Circle toggle and checked renderer

Original `circles` is saved outside chemical state/history, including revision snapshots. Restore it with optional boolean `DotCrossState.circles`, default true when absent. Strict persistence validation must reject a non-boolean or any other unknown field. Chemical history snapshots exclude it. Every edit, clear, undo and redo must preserve the current circle preference separately; the circle command changes only this preference and adds no chemical history. It must not change marks, assistance, first assessment or timing. This bounded field is the only proposed persisted state addition; no full question snapshots are needed.

`modelSVG`/`modelImage` can accept a `{circles?: boolean}` presentation option and use original mark glyphs, Comfortaa, local charge placement and reference-fit calculation. The original dialog's SVG initially declares 1000×650, but `renderer.draw(...,{answer:true})` **replaces the viewBox** with bounds centred on atom positions, minimum width 360/height 260, span plus 220. Preserve this actual fitting behaviour, not only the initial HTML attribute. The answer background remains white; the surrounding dialog remains dark. Original local unbracketed charge belongs at atom.x+20,y−15; the current model incorrectly uses the group bounds corner. These are display corrections; the accepted reference chemistry does not change.

The host can recover a checked reference by existing stable question ID/provider/model functions. Avoid moving the reference into persisted part state or duplicating banks. Circle preference is read from the current response for the answer, with true fallback for teacher mode. A shared SVG renderer/helper may replace `modelImage` where preferable, provided it stays independent of the attempt controller and retains provenance.

The current `Content.tsx` sometimes wraps a model in shared `DiagramViewport` with Fit whole diagram/Zoom for detail. However the dot-specific CSS forces `.worked-answer .content-image` to `min-width:600px`, overriding the shared fit width. The retained IGCSE mobile KI worked answer shows only the K ion initially; the original modal fits both ions. Remove this conflict in the dot scope or bypass the shared viewport with the source-style native dialog. E1 must check the whole reference is visible in fit mode before asserting answer fidelity.

## Course and chemistry distinctions

- A Level: 91 records; merged `l6-t2-1-3` gem and historical `l6-t2-1-4` alias; levels 1/2 alternate ionic/covalent categories, level 3 enriched named species. Full 18-element palette and dot/cross/triangle. All current A Level prompts show formula. Neutral unnamed formulas hide isomer names and accept valid neutral isomers. Named species retain exact charge/phase/coordinate and origin alternatives. PCl5 phosphorus and SF6 sulfur shells use radius 100; other non-H shells 64, H 40.
- IGCSE: separate 72-record bank; ionic `fourth-3-1` supports only levels 1/2, covalent `fourth-3-2` levels 1/2/3. Ionic level 2 is names-only, hiding formula. Full 16-element palette, no B/P/triangle. Preserve its source curriculum authority and accepted propane/propene extension labels. Do not import A Level enriched questions into IGCSE.
- Retain original per-level filtering before formula de-duplication, review-code hashes, link IDs, origin/charge validators, empty or full-shell positive cation convention, source 0/0.5/1 score mapping, and rejection of vacuous partial credit. Molecular geometry is not chemically graded. No dot-specific bank erratum was discovered in this audit; existing accepted project chemistry/errata evidence must remain unchanged.
- Safeguards take precedence over original incidental behaviour: original IGCSE standalone Next can skip assessment; current first-assessment/scheduler guard remains. Original teacher could draw; current teacher/review is read-only and creates no evidence. Neither warrants reinstating legacy evidence behaviour.

## Missing interactions that matter

Restore drag-from-palette for elements/electrons/charges; 30° atom snapping; tool-independent atom drag; whole-ion bracket drag; electron drag between regions and symbol cycling; region hit lenses and yellow previews; repeated taps on existing electron marks; automatic slot packing/origin alternation; direct local/whole-ion charge targeting; circles; focused Delete/Backspace; cursor/region keyboard placement; Escape drag rollback; and modal answer.

Original source has a capture-phase Enter shortcut that follows highlighted Check/Next and intercepts drawing Enter. Space is the reliable focused drawing placement/cycle key. E1 must test and document actual key routing instead of claiming that Enter reliably places atoms based only on the SVG handler. Preserve keyboard/non-drag alternatives, pointer cancellation, out-of-canvas rollback and touch button duplicate suppression.

## E1 acceptance gates

`audit.json` contains concrete operation, chemistry, visual and integration gates. Required browser work includes both modes/courses, source/new desktop/tablet/mobile and 1099/1100 breakpoint comparisons; correct/partial/wrong feedback; ionic/local/polyatomic charges; expanded shells; drag previews/cancel; keyboard focus; trusted touch capture; circle/answer toggles; first check/correction/reveal; Next; pause/reload/restore; save failure/retry; teacher isolation. Check source glyph positions and colour/geometry invariants, then inspect actual screenshots.

Keep shared timing allowances: A Level levels1/2 180s, level3 300s; IGCSE all levels180s. Verify no duplicate attempts or evidence, no time growth after first assessment, same attempt ID on restore, and no original-key writes. Run focused meaningful editor tests, retained relevant S2/S3/S5 regressions, typecheck, both builds/budgets and foreman protected-original gate. Root reviews shared diffs and rendered comparisons before accepting E1; no publication is authorised.

## Limits

This E0 browser audit verifies source/current initial geometry, tap placement, failed first assessment/feedback, worked/checked answers and an expanded-shell source preview. It does not claim exhaustive gestures, real-device touch, native background/idle timing, restore or save-failure verification. Those are E1 gates. Source review and all-reference invariants supplement the existing accepted S5 chemistry/timing evidence without rewriting it. Model/effort usage is not exposed; requested Sol 6.1 High is recorded, effective settings and usage remain unknown.
