# E03 molecule/C3L6 restoration audit

The chemical graph core is already reused exactly. The original UI and main drawing behaviour have not been restored: the React editor changes an atom drag from **growing the structure** to **moving an atom**, replaces the compact palette with an inspector, and omits chain drawing, bond-click cycling, erase mode, clean-up and original keyboard growth. This is a substantive interaction gap, not just styling.

## Findings and source reuse

Read [audit.json](audit.json) for the complete fifteen-operation inventory, six educational-context gaps, source geometry, E1 file ownership and acceptance plan. [source-fingerprints.json](source-fingerprints.json) retains SHA-256/byte evidence for 80 source/current inputs; every requested file was readable. [verification.json](verification.json) confirms the whitespace-normalised original/current chemical core body is identical.

Original authority is `apps/Masters-of-A-Level-Chemistry/src/activities/molecule-builder/{editor.js,core.js,layout.js,styles.css}` plus `c3l6-organic-reactions/{index.html,activity.js,activity.css,panels/*}`. `editor.js` uses SVG DOM nodes; a small canvas measures Comfortaa glyph widths. Reuse its graph gesture and depiction mathematics directly in React-free helpers, render the original layer/card/toolbar topology in JSX, and scope selected CSS declarations preserving final override order. Convert only module/global boundaries. Do not mount the old page/script or enable the standalone prototype.

Restore original 74px/30° bond growth, snapping to existing atoms, chain whole-drag commits, true hydrogen subscripts, direction-aware OH/HO labels and label-clipped bonds. Preserve current `MoleculeState`, controlled `onChange`, bounded history, accessible inspector alternatives, teacher protection and useful zoom/pan controls as secondary affordances. The original has automatic fit, **no manual zoom/pan**, **no redo**, **no charge menu**, and **no atom-move gesture**; don't invent missing source requirements.

The educational layout also matters. Original part (b) embeds product slots, masses, coefficients, equilibrium arrows and checks into connected reaction schemes; source H/J drawings reappear as reagents. Original part (c) has Check above each network node. Current React has much of the same data and dependencies but changes those relationships into vertical cards and a selected-structure check. Intro explanatory paragraphs currently all appear before example groups; restore the original teaching sequence and boxed C–C constraint.

## Chemistry and isolation boundaries

Keep current `qualification.ts/json`: the source's “Gyromitrin” label is incorrect for the drawn hydrazone model. Keep current K aldehyde-hydrate acceptance and separate rejected orthoacid teacher erratum, source bank, raw historical snapshot, and revalidation/import behaviour. Visual restoration must not reinstate either source error. Preserve all question/slot/unit IDs, existing vectors and chemistry, E/F interchangeability, both G alternatives and current accepted 22 graph alternatives.

Keep `C3L6View` React-owned. Existing `ChallengeCommand` and policy govern stages, slot selection/checking and read-only completion. `OlympiadHost` remains foreman-owned and retains separate IndexedDB challenge saving; no old localStorage or mastery/revision evidence. The new shell and accepted landing stay intact. No contract or runtime file was edited in this audit.

## Rendered and operation evidence

[reference-browser-results.json](reference-browser-results.json): PASS in fresh nonpersistent headless Edge contexts at 1440×1000 and 390×844. The script owns an ephemeral loopback read-only source server and closes it. It navigates Intro→A→B, uses all ten original source answers to satisfy A, and exercises atom placement, bond-growing drag/ghost, bond cycling, oxygen replacement, Clean up, chain drawing and whole-chain undo. No page errors. Original C is captured through documented developer inspection, not claimed as pupil completion.

[react-browser-results.json](react-browser-results.json): PASS against separately verified current source server at `127.0.0.1:5183`, using fresh contexts and isolated `run` names. Current Intro/A/B screenshots, inspector-built two-atom drawing, graph/history reload restoration and read-only teacher C capture pass. No page errors. The pre-existing server is left running.

Visually inspected: original desktop/mobile editor crops, original B layout, original mobile introduction, React desktop/mobile editor crops and B, original C, React teacher C. The source palette is compact and workspace-led; React controls occupy much more vertical space and display smaller structural labels at mobile width. Original B/C source schemes preserve spatial chemical dependencies. Whole-page shells differ by design; acceptance should compare the scoped activity/editor surfaces and document permitted shell and chemistry-qualification differences.

These are browser-engine screenshots, not physical touch/native-foreground proof. The source carbonyl and React methanol crops demonstrate interfaces rather than pixel-identical compounds. Full touch/keyboard and all-accepted-structure depictions remain required E1 acceptance work.

## E1 ownership and completion gates

Assign one molecule worker `src/editors/molecule/**`, selected new React-free interaction/depiction/layout modules, `engine.ts`, and `C3L6View.tsx`/`c3l6.css`, plus bounded tests/evidence. Keep policy, core, source bank, qualification, IDs, copied assets and dependencies read-only. Foreman owns Host, shared contracts/shell/test aggregation/build/release configuration. Existing props and state schema suffice; atomic graph replacement/clean can extend the local command union without a storage migration. Material shared-interface changes return to foreman/root.

Require operation parity including cancel/outside release, keyboard bond growth and bond focus, single-pointer touch, history/restoration, source-fit geometry, clear/clean undo, read-only barriers and non-drag alternatives. Verify preserved chemistry/errata and successful sequence/check/locking; save failure/retry; no curriculum evidence. Compare original/current desktop/mobile scoped crops for matching structures and meaningful states, inspect subscripts/labels/bond endpoints, and complete type/build/release/protected-app gates plus root diff/render review. E0 PASS authorises no implementation; root acceptance must precede E1.

## Reproduce

From workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/editor-restoration/audit/molecule/capture-reference.mjs
# Only after independently verifying the current source server at localhost:5183:
node apps/Masters-of-Chemistry/validation/editor-restoration/audit/molecule/capture-react.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/audit/molecule/verify-sources.mjs
```

Pinned root Playwright is imported through its explicit path. No package installs, source builds, original Git changes, broad hydration or real browser storage access. Runtime settings/usage are not exposed; requested Sol 6.1/high is recorded with actual settings/usage unknown.
