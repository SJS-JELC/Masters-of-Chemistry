# F11 — titration fidelity resume

Job `F2-TITRATION`; replaces unavailable F06. Requested `gpt-6.1-sol/high`; effective model/effort and usage are not exposed. No children and no swarm-log ownership. F1 accepted; this is F2 work only, with root acceptance still required.

## Ownership and changes

Only `src/editors/titration-curve/TitrationCurveEditor.tsx`, `titration.css`, and this new evidence directory were changed by F11. The completed F06 source workspace restoration was preserved. The baseline and F06 hashes remain unchanged in prior evidence; `path-hash-map.json` retains exact baseline/current diffs and exact before-F11 bytes, verified by SHA-256 against F06 before the small fixes.

F11 fixes:

1. Apply source `review-mode` to the editor root, and scope its read-only cursor selectors to that root. Disabled handles no longer misleadingly show a grab cursor.
2. Stop numeric Enter propagation after the editor's own commit handling. A real browser probe showed invalid Final pH=15 was correctly rejected locally but then bubbled to the shared player, creating an unwanted first assessment. `enter-probe-results.json` preserves that FAIL; `enter-probe-fixed-results.json` records answering phase, no first assessment, and the accessible invalid status after the fix.
3. Preserve original read-only button opacity for the curve/indicator options. The shared disabled-button style had dimmed source model choices; scoped opacity1 restores their legibility while retaining disabled semantics.
4. Restore source `touch-action:auto` on the chart while retaining `none` on the handles. A trusted mobile horizontal swipe moved the original chart306px but current chart0px; the retained FAIL is `mobile-pan-results.json`. The replacement PASS moved original306px/current334px and the subsequent handle/non-drag input rerun also passed.

No chemistry, provider, bank, identity, persistence, timing or marking code was changed. The editor continues to send typed curve responses through the shared controller. It owns no assessment or evidence saving.

## Source and chemistry

`audit-results.json` verifies all five canonical original titration source files against their retained fingerprints. Original final `styles.css`, including appended sidebar, indicator, narrow-screen and read-only overrides, remains the reference. The source DOM workspace, source thumbnail paths, indicator ranges/swatches, 820×460 chart coordinates, 76–780/32–370 plot, eight pH/six volume ticks, mint/purple curve halves, yellow rings/guides and calculated equivalence join are preserved.

All36 source/current model answers, initial/model/wrong equilibrium curves and complete grading results match exactly. All36 model marks are6/6, typed model submissions are ready, and canonical references restore the same source question and level. Source OCR A Chemistry5.1.3(n–o) provenance is retained. Equivalence remains a count of acid/base equivalents; indicator endpoint is distinguished from equivalence. Diprotic questions retain the original complete-dissociation assumption. No chemical model, arithmetic or scope was altered.

There are seven source families and twelve genuine family/level combinations. The five single-equivalence families occur at levels2 and3; the two diprotic families occur at level3 only. No level2 diprotic variants were invented.

## Shared integration findings and resolved evidence

F11 reported the initially missing embedded question prompt, pale primary action text, and missing titration feedback topology to the foreman. F08 restored the source context, source heading/compact six-check feedback, dark-text mint action and checked model editor mounting. `capture-freeze.json` retains F08's shared five-file freeze and final editor hashes.

`pre-prompt-failure/` retains incomplete prompt captures; `final/` retains the second-model strict-locator harness FAIL; `final-v2/` and `final-v3/` retain interrupted pre-final-fix sweeps. None is a final visual PASS. Old F06 failures and evidence were not overwritten. The final locator explicitly selects the response chart because the worked-answer state has a separate checked model chart.

## Browser/lifecycle evidence

`final-interactions/interaction-results.json`: PASS for actual keyboard arrows, mouse drag/Undo, invalid drafts/Escape, mobile piece taps, browser CDP touch anchor drag and non-drag numeric commits. It also passes practice answering restoration, first response/marks/time freeze, reveal/history deduplication, fresh Next, actual revision selection/launch/reload/assessment/scheduler Next and all36 teacher no-evidence checks. This ran after the numeric Enter fix; the subsequent opacity change changes only read-only presentation.

`final-teacher-v2/teacher-results.json` passes108 checks: all36 checked source models at desktop/tablet/mobile, exact anchor values and indicator, disabled controls, cursor default/pointer-events none, source opacity1, no attempt/history, prompt context and no page overflow. Its representative model reloads verify no teacher evidence after restore. `contacts.html` in that folder links36 native-size paired source/current teacher images. The final touch-action change cannot affect those checked models or read-only evidence semantics; refreshed trusted mobile pan images show the current final stylesheet.

`final-accepted/browser-results.json` passes36 family-level-viewport combinations in unanswered, partial, incorrect, correct, correction and model states:432 source/current full-page renders and432 native-size workspace crops. `computed-source-match.json` passes216 exact paired SVG style comparisons, including820×460 viewBox and meaningful strokes, fills, widths, dashes, tick fonts and font metrics. `contacts.json` indexes36 paired six-state HTML/PNG sheets, linking original native-size renders. `artifact-manifest.json` validates/fingerprints all864 PNGs.

F11 viewed12 stratified six-state source/current contact sheets covering all seven families and all twelve genuine family-level combinations, plus actual full-size desktop/tablet/mobile response and teacher renders and the refreshed panned mobile final image. `render-review.json` records the exact files and findings. Native chart labels, selected curve diagrams, indicator bands, contextual chemistry, compact feedback and preserved shared chrome were checked. Contact sheets are overviews; their linked native-size images establish legibility.

The long final-v4 sweep completed30 combinations then encountered an Edge screenshot timeout after fonts had loaded, with no page errors. Its raw report staysFAIL. `final-tail/` is the one bounded successful retry of the six unfinished mobile combinations. The aggregate links only complete, validated six-state combinations; it does not relabel the interrupted reportPASS. The foreman explicitly authorized reuse of geometrically unchanged rendered evidence after the one-property touch-action change and F08's unrelated numeric/EC shared delta. `pan-render-reuse-disposition.json` and aggregate provenance retain the before/current hashes and applicability reason. Current shared/owned hashes are recorded in the aggregate and `path-hash-map.json`.

Source contexts are fresh and nonpersistent. The original apps were served read-only through the foreman's GET server and were never built.

## Limits and acceptance boundary

Browser evidence uses headless Edge and pinned root Playwright1.62.1 through an explicit root dependency path, with a short app-owned temporary directory. It exercises trusted browser keyboard/mouse/CDP touch input; it does not claim native OS suspension or hidden-app verification. Existing shared timing evidence remains relevant; F11 owns no timing changes. Desktop source and React components have different available widths because the accepted common React shell is preserved; native coordinates and meaningful computed SVG styles are compared rather than claiming pixel-identical whole pages. Mobile source and React charts retain source horizontal scrolling at650px minimum width.

`typecheck-final.log` passed after all TypeScript/opacity changes; the subsequent touch-action change is CSS only. `protected-originals-final.log` passes 1317 total entries, including 794 byte-hash checks and 523 metadata-only placeholders without hydrating them. Final shared build/release checks and F2 acceptance belong to the foreman/root. Olympiad2011 concurrent changes and its independent acceptance were not touched or claimed.

## Reproduction

From the workspace root:

```text
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/audit.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/retain-cursor-patch.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/enter-probe.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/final-interactions.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/browser.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/tail.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/merge-final.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/compare-final.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/contacts.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/teacher.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/teacher-contacts.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/mobile-pan.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/mobile-input-final.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/titration/resume-f11/finalize.mjs
```

Serve the current app at127.0.0.1:5188 and the canonical read-only originals at5197 first. Preserve retained outputs before intentionally rerunning an evidence-producing harness.

## Final capture disposition

F11 workerPASS. All assigned source, chemistry, browser/lifecycle, touch, teacher, rendered review and evidence gates are satisfied. No unresolved titration issue remains. Root still owns F2 acceptance; this is neither F3 nor publication authorization.
