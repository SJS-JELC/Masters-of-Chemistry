# E02 — DOT-CROSS-RESTORE

## Outcome and boundary

Restores the original A Level and IGCSE dot-and-cross drawing workspace in declarative React, using the original pure geometry and interaction algorithms. E02 owns only the eight runtime files below and this implementation evidence folder. E0 evidence and historical reports remain unchanged. This worker result is subject to E01 integration gates and root acceptance.

The shared player owns question selection, prompts, authoritative first assessment, correction feedback, timers, saves, revision progression, teacher projection and the native checked-answer dialog. The editor neither duplicates those services nor writes browser storage. It sends one semantic response on completed edits; pointer movement stays local.

## Runtime files

| File | Responsibility |
| --- | --- |
| `src/editors/dot-and-cross/DotCrossEditor.tsx` | Original palette, source DOM topology, adaptive view, pointer capture/preview/commit/cancellation, keyboard/touch, readOnly guards, non-drag alternatives |
| `src/editors/dot-and-cross/Diagram.tsx` | Declarative original drawing layers, hit regions, shells/labels/electron glyphs, brackets/local charge, cursor and ghosts |
| `src/editors/dot-and-cross/editor.css` | Scoped effective original navy/Comfortaa workspace, palette order/geometry, 1100px sidebar breakpoint, tablet/mobile heights, glyph/focus colours |
| `src/chemistry/dot-and-cross/interaction.ts` | Pure original snap, bounds/adaptive view, connected-component charge routing and whole-group displacement |
| `src/chemistry/dot-and-cross/engine.ts` | Semantic edits, caps/spacing, electron relocation/cycle/organisation, charge replacement, chemical history and independent circle preference |
| `src/chemistry/dot-and-cross/layout.js` | Existing source layout retained; exports original transparent lens/region helpers needed by React drawing |
| `src/chemistry/dot-and-cross/layout.d.ts` | Typed lens/region/free-slot helper interfaces |
| `src/chemistry/dot-and-cross/model.ts` | Pure `modelSVG(record,{circles?})`, `modelImage(record,{circles?})`, actual source answer fit/local charge/glyphs |

## Source reuse and substantive behaviour

Provenance is both original `src/activities/dot-and-cross/{index.html,styles.css,app.js,renderer.js}` directories and the previously accepted extracted shared layout. The original controller was not wrapped or mounted; React owns the drawing elements and local gesture previews.

- Exact original element order and course limits: A Level adds B/P and triangles; IGCSE has its 16 elements and dot/cross tools. No inferred atom-count palette hints.
- Source snap uses shell-derived bond spacing, 30° directions, the original distance window and 45-unit atom-label spacing. Canvas cap is 30 atoms. Expanded PCl5/SF6 central shells retain the 100-unit source radius.
- Original default view geometry and heights remain exact. At 1100px the 330px marking pane sits beside the 520px canvas; smaller screens stack the pane. Source default narrow drawing panes can crop wide ionic reference diagrams, as the original did. The collapsed magnified horizontal viewport and checked-answer fit provide an additional way to inspect the complete drawing.
- Atom/group/electron dragging works across tools. Shared-region/lone-region repeated taps use free slots; ghost positions use the same packing geometry. Palette drags support atoms, electron symbols and charges. Invalid/outside drops, Escape, pointercancel, lost capture and blur restore the pre-gesture diagram.
- Whole-group moves preserve all relative positions. Deleting atoms cascades to attached electrons/brackets; deleting an electron repacks its region. Source local covalent charge versus whole connected-ion brackets is retained, including same-group charge updates and overlapping bracket replacement.
- A Level source organisation alternates symbol queues in first-symbol order. IGCSE source organisation always starts with dots, then crosses. `DotCrossCommand.organisation?: 'alevel'|'igcse'` is a command-only hint; the editor supplies its course, existing callers default to A Level. It is never stored in responses or snapshots. Unexpected third-symbol data is retained rather than discarded; IGCSE UI does not offer triangles. Direct tests run each actual original organiser against intermediate add/cycle/delete/relocate states.
- Circle visibility defaults to true when absent. Toggling circles sends a display-preference response without changing chemical snapshots/history or score. All chemical edits, clear, undo and redo preserve the current preference. Shared strict persistence validation rejects nonboolean circles and circles inside historical chemical snapshots.
- Focused arrows/Space/Delete/Backspace and source Check/Next Enter routing are supported; document shortcuts remain available when palette drags leave body focus. Ctrl/Meta+Z and Shift redo are guarded in readOnly and avoid text fields/dialogs. Ordinary touch button taps use the original explicit-click/duplicate-native-click suppression algorithm. Collapsed controls provide atoms, selection/movement/deletion, electron placement/relocation/cycling and bracket/charge operations without dragging.
- `readOnly` prevents palette, pointer, keyboard, touch and non-drag response changes. This intentionally respects the shared teacher-preview rule even though the original teacher page allowed editing.

## Shared interfaces

`EditorSurfaceProps.workspaceAside` is rendered once in `.workspace > .marking` after `.drawing-area`. E01 supplies source-style `.actions` and `data-dot-action="check"`/`"next"` hooks. Enter calls that existing button; scheduler, first-evidence and disabled-Next rules remain authoritative. `.dot-cross-editor` and `.dc-canvas` retained test hooks remain present.

`modelSVG` returns only internally generated, escaped reference SVG. Inline rendering inherits the licensed host Comfortaa font. `modelImage` remains a pure provider-compatible data URI, although external image rendering cannot inherit the host font; E01 uses inline SVG. Answer viewBox is the actual source renderer fit (minimum 360×260 and atom-centre span +220), rather than the original HTML's initial 1000×650 placeholder. Local charge stays at atom x+20/y−15. Source checked answers use 22px charge text: the original 18px local-charge override applies only to the live `#canvas`. No question/snapshot schema enlargement is needed.

## Chemistry/data safeguards

All 91 A Level and 72 IGCSE bank records remain byte/structure-equivalent to the original source fixtures. All source question IDs, pool/scaffold metadata, errata and course differences remain in their existing banks/providers/marking. The worker changed none of them. Every retained reference validates and self-marks correctly; all 2,380 source electron positions match the shared layout exactly. Source expanded-valence shells, bracket charges, origin symbols and teacher-answer structures were inspected in rendered PCl5, SF6, nitrate, ammonium, water, MgO and KI states. The symbol differences are origin conventions, not distinct kinds of electron.

## Evidence and rerun

Run from workspace:

```powershell
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/dot-cross/verify.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/dot-cross/browser.mjs
```

`verify.mjs` retains nine focused source/invariant/persistence/history tests, final project typecheck, owned-runtime format check and 32 original-file fingerprint comparisons in `verification.json`, `unit.log`, `typecheck.log`, `format.log` and `source-fingerprints.json`. All pass. No original build, dependency, output, Git setting or real browser store was mutated.

`browser.mjs` verifies the existing 5183 React source origin and launches pinned root Playwright 1.62.1 with headless Edge in fresh isolated contexts. A readonly ephemeral static server serves actual original source pages. Original reference snapshots are injected through an isolated bridge stub; the new evidence harness mounts the real editor with a source-style marking pane. Shared attempt/timing/storage logic is deliberately outside this isolated editor harness and is E01-owned.

The retained browser report and PNGs cover 24 matching reference states across both courses at desktop 1440×1000, tablet 820×1180, mobile 390×844 and the 1099/1100 breakpoint; correct-feedback states; 12 source/new checked-answer SVG states with circles on/off; matched drag previews; palette/electron/charge/group operations; gesture rollback; trusted CDP touch; keyboard, readOnly, serialized preference/history restoration and non-drag/magnified controls. Static editor geometry, SVG attributes and palette sizing/positions/styles are checked exactly. Only completed gesture SVG coordinates permit 0.001 source-unit precision because native float CTMs differ with each page's absolute top; raw numerical differences are retained. Observed group difference was approximately 0.000029 units, with the intended 50×20 displacement and relative geometry independently checked.

Final `browser-results.json` is PASS: all six browser groups, 29 matching-state comparisons and zero page errors/failures. `image-review.json` records substantive inspection of eight representative groups and metadata for all 125 unedited PNGs (62 original/restored pairs plus the non-drag full-page image). It distinguishes crop rounding from checked DOM geometry. `verification.json` is PASS for all nine tests, typecheck, owned formatting and original fingerprints.

Answer PNG crops are normalized to 600×400 to inspect the renderer itself; responsive native dialog geometry is E01's separate real-host gate. Worker source/editor browser evidence does not establish independent first-assessment, timing, revision, save/reload, production-build or native dialog acceptance. E01 must rerun those gates against the final runtime fingerprints.

## Retained retries

`browser-results-attempt-1.json`, `-2.json`, `-3.json`, `-5.json` and the earlier matching-only report are retained, not rewritten. Initial tests exposed an actual Escape/body-focus defect and image review exposed palette centring/mobile sizing/rounded pane details; both were fixed. Test-only retries corrected float equality expectations, nonunique electron selectors, the KI source ID and an aria-label mismatch. One duplicate run was cancelled after a shell quoting failure, and a later passing partial run was cancelled to fix the newly discovered IGCSE organiser difference. Initial TypeScript strictness errors were fixed before the retained final typecheck. A PowerShell `npm.ps1` execution-policy failure was resolved using existing `npm.cmd`/local compiler binaries; no policy/dependency change occurred.

## Remaining acceptance

No known E02 editor/runtime exception remains once the final browser report is PASS. E01 owns both-course production builds and broad host first-score/correction/reveal/Next/timer/persistence/revision/teacher/browser closure. PASS is a worker completion, not final acceptance or publication authority. Effective model/effort and actual usage were not exposed; requested inherited settings were Sol 6.1/high.

For final real-host persistence closure, explicitly toggle circles false, make a chemical edit, save/reload the attempt, then Undo/Redo and verify that false remains. The isolated editor browser covers serialized roundtrip and the unit gate covers the shared strict persistence validator, rather than the actual host database.
