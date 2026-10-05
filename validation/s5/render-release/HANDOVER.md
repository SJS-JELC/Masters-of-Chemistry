# A23 · S5 independent rendering, accessibility, performance, release and authoring

Status: PASS for the assigned S5 independent render/accessibility/release/performance/authoring review. Final current freeze 35e6… passes fresh checks, including the independently diagnosed and separately fixed Next-on-blur defect. Root stage acceptance remains separate.

Requested model/effort: `gpt-6.1-sol` / `high`. Effective settings and actual usage were not exposed; no measurements are invented. No children were delegated.

## Ownership and method

Only `validation/s5/render-release/` and the new CLI-generated `development/authoring/families/dev-s5-independent/` were written. No runtime/source/configuration/dependency/release/official build changes were made by A23. The source fixture copies and metadata sandbox are independent retained verification artifacts. The original applications were read only: [protected check](protected-originals-check.json) passes for 1,317 items with 523 metadata-only cloud placeholders; none were hydrated.

Browsers were actual Microsoft Edge 154.0.4258.48 controlled through the explicitly read-only root Playwright 1.62.1 dependency. All browser work here is **headless**. CUA reported `apps=[]`, `browsers=[]` and `Browser is not available: edge`; no native/trusted timing claim is made. Timing-boundary review belongs to A21. The static server served the existing exact `dist/` files under `/nested/{course}/` on owned port 5203, with no Vite/HMR. DEV port 5195 was reserved by A01 and uses a private Vite cache under this evidence directory. No original-app browser store was opened or written.

## Fresh rendered and accessibility inspection

[render-browser.json](render-browser.json) passes 29 groups; [a11y-detail.json](a11y-detail.json) adds four focused checks. Screens are freshly generated from these builds, not inherited acceptance screenshots. All desktop views use 1440 × 1000; mobile uses 390 × 844. Screenshot filenames in [screens/](screens/) distinguish whole, detail, teacher and navigation views.

I visually inspected the fresh desktop and mobile orbital, energy, titration, dot and molecule images, teacher orbital/energy/titration/dot models, molecule reference structures and reaction network, and generated catalogue/fixed correction/inverse application/teacher pages. The bright scientific diagrams have readable dark labels; their small mobile whole view preserves orientation, with separate detail controls for legible inspection. Orbital subshell order, eight displayed subshells and vertical energy direction remain visible. Titration axes, units and indicator instructions remain visible. Dot origin symbols, shell overlap and hydrogen labels are readable; larger teacher diagrams scroll inside their container. The C3 mobile network uses a bounded horizontal viewport and a separate row of slot buttons; the selected structure/editor follows the network. Long C3 reaction/source pages retain meaningful headings and sequential stages. They require vertical scrolling; this is explicit, not a claim of a single-screen experience.

Actual interaction checks use UI controls, not mock renderers: keyboard spin entry and alternate spin selection; touch orbital cycling; energy numeric positioning plus keyboard movement; titration numeric input and slider arrows; dot atom creation, keyboard selection/movement and non-drag controls; all ten C3 classification inputs/Check/Continue prerequisites followed by molecule drawing, keyboard movement and saved graph restoration. A second molecule example deliberately selects an atom and uses touch **Extend selected atom** to make a connected C–O graph, then Fit/Zoom/Pan. The first screenshot's overlapping unconnected atoms represent that first test's deliberately incomplete draft, not a checked chemical model. Teacher curriculum pages show immediate checked diagrams and omit blank response workspaces. C3 teacher mode retains populated read-only molecule controls and reference structures; it is not a blank disabled editor.

Active answering hides the practice setup and sidebar, with explicit Change activity/view and Pause/save controls. Practice, Revision, Teacher, Statistics, Import progress and A Level Olympiad navigation have understandable labels and distinct selected states; IGCSE has no Olympiad view. Name invariants and retained accessibility trees cover interactive controls. The real first Tab reveals **Skip to question** and Enter activates its main destination. Keyboard diagram detail scrolling changes actual scroll offsets. Focus rings are visibly present in the fresh orbital, energy and teacher ladder images. These checks are bounded, not an exhaustive WCAG or screen-reader certification.

Brand headings load the source-owned custom Comfortaa-Bold font; ordinary body text actually renders Segoe UI/system UI. CDP platform-font inspection and the visible [scientific glyph probe](scientific-glyph-probe.png) confirm superscripts, subscripts, Greek delta, arrows, Å and minus are available, including system fallback when Comfortaa needs it. Eight core source colour pairs have contrast ratios 9.86–17.31:1, above 4.5:1; see the exact colours/ratios in the detail report. The runtime font, OFL licence and eagle asset are byte-identical to their approved project source assets. This does not assign the school's eagle to the font's OFL licence.

## Editor update and performance evidence

[performance.json](performance.json) documents all settings and actual samples. CDP emulation: 4× CPU slowdown; 150 ms latency; 200,000 bytes/s download (1.6 Mbit/s); 93,750 bytes/s upload (750 kbit/s); cache disabled; 390 × 844, DPR 1. The actual host hardware is unspecified. Three fresh-context cold samples per course measure navigation to a visible Start practice control, then the separate activity-load/player-ready path. On the initial S5 build, shell ranges are A Level 4,532–4,577 ms and IGCSE 4,530–4,617 ms. Activity start ranges are A Level 923–943 ms and IGCSE 1,451–1,656 ms, for the explicitly recorded selected targets. These are small descriptive series, not a device guarantee.

The desktop titration workspace is then measured under the same CPU/network settings. Three 30-step real mouse drags render local previews with **zero attempt puts during movement** and one meaningful state checkpoint at pointer-up. End-to-end gesture plus two animation frames took 564–588 ms, including all 30 automated movements; this is not per-frame input latency. Pointer-release to observed checkpoint took 84–101 ms. Three numeric fill actions reached two animation frames in 72–81 ms and persisted in 91–99 ms. Layout overflow and browser errors were absent. Two animation frames are a DOM readiness observation, not physical hardware presentation.

[editor-gestures.json](editor-gestures.json) independently tests 30-step energy, dot and molecule gestures with 4× CPU and explicitly **unthrottled network**: each local draft changes while write counts remain unchanged; release creates one state write. Observed release-to-put times are approximately 46, 29 and 30 ms respectively. One gesture per additional editor is a functional checkpoint test, not a statistical performance benchmark. Source review agrees: energy `draft/live`, dot `preview/drag`, titration `preview/latest` and molecule `drag/gesture` own high-frequency previews locally, while completed semantic edits use the shared host/repository. Orbital key/button/select operations are discrete semantic edits.

## Release and prefix review

[release-validation.json](release-validation.json) contains read-only regeneration **in memory** of the current inventories and their deterministic validation. Each independent entry enables six activities and six compatibility aliases; each inventory contains 129 explicit runtime files and 59 deferred JS chunks. Initial FULL eager JS is 150,983 bytes gzip for A Level and 150,982 for IGCSE, below the 204,800-byte budget. The scope includes the course entry and actual ProductionFoundation plus all their eager imports; it is not the smaller entry stub alone. Individual JS gzip sizes use Node default `gzipSync` and are summed.

The physical graph is shared: the universal registry references both courses' deferred providers/banks/editors, so both physical builds contain deferred chunks for both courses. Only the six course registrations are enabled in each entry. No physically course-exclusive bank packaging is claimed. Request traces show deferred activity loading; statistics, import and Olympiad load through lazy panels. Runtime manifests exclude DEV starter/catalogue/fixtures/tests, source, package files, maps, node_modules and iframe wrappers. The only Rocket text allowed is the explicit compatibility-link rejection; no Rocket activity/dependency/asset is enabled. `.vite/manifest.json` is retained build evidence, not a release file.

[release-browser.json](release-browser.json) passes 23 actual-browser checks: 12 codeless old activity aliases plus 11 coded curriculum routes, nested-prefix preservation and direct refresh. Codeless curriculum aliases intentionally open the selected activity's practice setup; they do not show an invented error. Coded routes retain exact question ID/seed/level and open teacher review. C3 aliases open the separate Olympiad strand. All requested JS/assets resolved with no 4xx responses, and no iframe was mounted. No official manifest/build was rewritten by this worker and nothing was deployed.

## Genuine independent authoring proof

The existing scaffold CLI ran **once** to generate `dev-s5-independent`. The output includes reviewed data, pure provider/marking, DEV registry, component catalogue, plan, README, provenance, fixed/generated/typed fixtures, browser fixture, tsconfig and generation manifest. [generated-integrity.json](generated-integrity.json) verifies every generated fingerprint and every template input fingerprint, plus the generator fingerprint. No generated output was manually edited or registered in production.

The generated fixture output paths are hardcoded into S4, outside this worker's ownership. Separate owned copies therefore change **only import and evidence locations**; all substantive assertions are retained, and the originals remain byte-identical. The Node fixtures pass all 72 finite generated configurations (36 at level 2 and 36 inverse-volume level 3), fixed level 1, conservation/logarithm calculations, correct/wrong/incomplete answers, invalid-code/seed rejection, JSON typed restoration, true three-level revision targets and current provenance. The generated tsconfig typecheck passes.

[generated-browser/browser-results.json](generated-browser/browser-results.json) passes seven actual unchanged shared-host/controller/repository/session groups: fixed first wrong result/timing; pause/reload with same attempt/response/time; correct learning correction without changing first evidence; completed reload and fresh Next; seeded restore/correct first result; ADD ALL three-level revision and scheduler progression into genuine inverse-dilution level 3; teacher code restore with no history/timing/mastery evidence. The generated browser fixture still uses its original 30-second navigation deadline. Before it ran, [initial-cold-dev-preparation.json](initial-cold-dev-preparation.json) recorded 29,431 ms to actual host readiness on this fresh private Vite cache; the separate preparation probe has a 90-second readiness deadline and is not a student load benchmark. The substantive fixture was not weakened or given inflated assertions/timeouts.

[metadata-proof.json](metadata-proof.json) is code proof of genuinely new metadata onboarding: the **actual unchanged generator** runs on an owned copied input tree with a synthetic new activity, and its generated catalogue is supplied through a scoped Node test loader to the actual unchanged scope, registry, revision-selection and persistence-boundary modules. New supported levels propagate, duplicate IDs fail, and metadata without an explicit adapter is not enabled. Production authored metadata stays empty. For a genuinely new production activity, the documented explicit `ActivityId` union also needs its authorised extension; this synthetic runtime proof is not a production typecheck/approval. The current generated family on an existing gem typechecks separately. The original-store legacy parser remains historically scoped; new content is not added to it. Retired identities remain `historicalOnly`.

## Retained probe failures and limits

`render-probe-selector-failure.json`, `render-probe-c3-controls-failure.json`, `render-probe-import-label-failure.json` and `release-probe-codeless-expectation-failure.json` retain my initial harness mistakes: actual dot label is Fit diagram; populated C3 teacher controls are permitted read-only controls; navigation says Import progress; codeless aliases correctly choose practice. These are separate automation expectation failures, not runtime fixes. Assertions were corrected to the documented observable behavior, with geometry/state/checkpoint assertions preserved. An initial direct Node import of the Vite-only C3 content module failed on its JSON/glob boundary; the independent Node harness instead imports the pure source bank. The first synthetic registry-only metadata call was correctly rejected by the current canonical scope; the final proof performs the real metadata-generation step before exercising derived modules. No runtime guard was weakened.

Inherited cloud-source, current OCR full-PDF, exact managed-Python, missing historical timing and native-probe limitations remain explicit in S4 acceptance and the other independent reviews. This worker does not re-certify chemistry/source completeness or all timing boundaries. No publication authority is inferred.

## Reproduction

Run from the project root. `servers.mjs` uses owned ports 5203 and reserved 5195; close it afterward. Do not rerun the scaffold CLI against the existing folder.

```powershell
node validation/s5/render-release/servers.mjs
node validation/s5/render-release/warm-dev.mjs
node --test validation/s5/render-release/independent-family.test.mjs
node node_modules/typescript/bin/tsc --project development/authoring/families/dev-s5-independent/tsconfig.json
node validation/s5/render-release/independent-browser.mjs
node validation/s5/render-release/render-browser.mjs
node validation/s5/render-release/a11y-detail.mjs
node validation/s5/render-release/editor-gestures.mjs
node validation/s5/render-release/performance.mjs
node validation/s5/render-release/release-browser.mjs
node validation/s5/render-release/metadata-proof.mjs
```

`prepare.mjs` captures/regenerates the initial evidence files; preserve them before invoking it again. Final fresh evidence and any coordinated fix disposition will be appended below.

## Genuine keyboard failures discovered during expanded typing review

The prior numeric **fill** checks were accurate but did not establish real keystroke entry. The subsequent real focus/Control+A/Backspace/character sequence exposed three substantive editor issues, promptly routed to A01 for separately owned bounded fixes:

| Editor / actual route | Expected input | Observed UI and trusted events | Retained evidence |
| --- | --- | --- | --- |
| Titration TC01, initial pH | `3.1` | Initial `4`; clearing re-renders `4`; `3` inserts `43`, clamps to `14`; dot/1 remains `14`. Same failure at normal CPU and 4× CPU. | `typing-first-failure.json`, `typing-diagnosis.json`, screenshots |
| Energy D01 level 2, right level screen y | `200` | Initial `220`; clearing immediately clamps to `55`; typing appends to that value and clamps to `340`. Normal CPU, unthrottled network. | `energy-typing-diagnosis.json`, `energy-typing-failure.png` |
| Dot h2, Ion charge local control | `-1` | Clearing creates `0`; minus is lost; `1` leaves `01`. Normal CPU, unthrottled network. No Apply/marking was involved. | `dot-typing-diagnosis.json`, `dot-typing-failure.png` |

These are not dismissed as harness failures and none is fixed by changing a test expectation. The final stage disposition depends on independent actual keystroke, meaningful commit, restore and regression checks after the author's bounded source fix and the foreman's fresh builds. The exact new-app saved-session fixture in `seed-static.mjs` selects editor routes; all reported typing itself uses trusted browser UI events. The preliminary energy level-1 selection had no editor and is separately retained as `energy-typing-level1-harness-failure.json`.

## First frozen build review (before Next fix)

All 517 foreman-frozen inputs are independently byte-identical to tree `75a6c5c275efc120705e199e9527f8241721d41ab24d7a85284ec9f00aa07b88`. [final-input-fingerprints.json](final-input-fingerprints.json) also lists the exact separately authored source changes, current build inventory and unedited generated family/template integrity. No source/configuration change was made by this reviewer.

| Current release | Manifest SHA-256 | FULL eager JS gzip | Runtime / lazy chunks |
| --- | --- | --- | --- |
| A Level | `f8e70c3ad97bff98d36675bb00bad2f1a84e71f9754dde741c8108363d51cb0f` | 151,520 bytes | 129 / 59 |
| IGCSE | `72e673aeec902d71d94505b0a26ea816ab2ce683bc621cd1c92ab23f9e543f60` | 151,520 bytes | 129 / 59 |

The final full eager budget is 53,280 bytes below 204,800 per course. Six enabled registrations and six old aliases per entry remain unchanged. Current in-memory inventory validation passes. Shared deferred physical graphs remain as described above.

Final fresh full rendering passes 29 groups; focused accessibility passes four; old-link/prefix/direct-refresh checks pass 23. Earlier screenshots and report JSON are preserved under `initial-screens/` and `initial-*.json`, respectively. The final screenshot directory contains fresh current-build images. I inspected the new mobile typed energy/titration fields, storage-failure banner, historical acid volume instructions and C3 K accepted/excluded detail: readable labels, visible focus, correct current typed values and explicit source erratum. The accepted K model is the aldehyde hydrate; its inherited orthoacid appears only under **Source erratum · excluded K alternative**, accompanied by an explicit not-accepted explanation. Current accepted alternatives total 22; raw source total remains 23. [final-c3-k.json](final-c3-k.json) passes both desktop/mobile, one accepted reference for K, accessible excluded-source explanation and no document overflow. A first part-b-only count of 14 was my harness error; its raw failure is preserved, and the corrected count includes both drawing stages.

[startup-fix-browser.json](startup-fix-browser.json) passes eight groups: both courses and both unavailable IndexedDB.open/corrupt session startup paths show role=alert, honest unavailable counts, gated Start, saved-record preservation text and keyboard-operable Retry. Repeated failure remains visible; restored storage recovers normally; corrupt original row remains unchanged. Fresh affected EB07/08/09 teacher prompts show subshell/solid-ionic wording, and actual historical direct-neutralisation volume asks for two decimal places with model 46.88 cm³.

Final [performance.json](performance.json) contains six cold and six editor observations with the same fully stated CDP settings. A Level shell: 4,548–4,568 ms; lazy start: 926–940 ms. IGCSE shell: 4,447–4,546 ms; lazy start: 1,408–1,429 ms. Three real 30-step titration gestures plus two frames: 565–568 ms; release-to-checkpoint: 59–63 ms. Three real sequential three-character inputs (40 ms imposed delay per character) plus two frames: 207–215 ms for local draft; **zero attempt writes before semantic Enter**. Enter-to-two-frames: 47–49 ms; Enter-to-checkpoint: 57–61 ms; full typing-through-checkpoint: 270–280 ms. These totals include automation overhead and imposed character delay; they are not per-character/per-frame/hardware presentation guarantees. No layout overflow or browser errors occurred.

Performance ran 05:05:37.752–05:06:25.986 UTC. A06's independently retained dot DOM probe began 05:06:44.629 UTC, 18.643 seconds after this series ended, so those runs did not overlap. Host background CPU activity and other workers were not instrumented; no claim of hardware-isolated profiling is made. The three other editor drags are functional state/write tests under 4× CPU and unthrottled network, run alongside the DEV authoring fixture: they pass no-write-during-drag/one-checkpoint-on-release, with observed release waits 61/36/32 ms for energy/dot/molecule. Those single concurrent observations are not performance comparisons.

The current shared-host generated DEV browser fixture repeats all seven substantive groups successfully after actual host preparation. Final prepared-host readiness was 1,496 ms on retained private cache, distinct from the initial 29,431-ms cold preparation; both artifacts remain retained. The generated output, its original hardcoded S4 evidence labels and substantive assertions remain untouched. Current fixed+72 generated fixture tests and generated tsconfig typecheck pass again.

### Import label finding disposition

[import-label-probe.json](import-label-probe.json) uses a realistic 20,327-character synthetic JSON value without Preview/Import submission. Exact Playwright getByLabel count changes 1→0 because its DOM label text includes the textarea child value. Actual getByRole textbox name remains exactly **Source JSON**. Direct CDP AX tree separates computed name **Source JSON** from value length 20,327; no JSON text pollutes that name. This is a selector limitation, not a proven screen-reader accessible-name defect. No product label change was requested or made.

### Final fixture exception evidence

The dot SVG generic group has a DOM aria-label but Playwright AX snapshot contains only its visible minus text; the real HTML **Electron inventory and deletion** list provides atom ID, minus sign and semantically named Remove/Delete control. A06 independently verified that equivalent readback, retained the exact SVG/HTML/AX evidence, and approved the inner-details locator clarification. Links: [A06 handover](../review-render-harness/HANDOVER.md), [raw DOM/AX probe](../review-render-harness/dom-probe.json). My raw first SVG-name assumption and second nested-details ambiguity are retained separately. The next exact replay passed first HTML/AX readback and correct persisted/reloaded group but omitted reopening the outer details after reload; that raw failure is also retained. No further replay occurs without exact reviewed parent disposition.

The energy tail independently passes peak 150 and arrow tail240/head160/x300 trusted sequential typing/commit/reload. Its first Check correctly rejected my incomplete labels/ΔH arrow. After the approved complete-UI retry, actual persisted checkProfile is ready, assessment succeeds and Next becomes visible; changed-code wait failed. The fixture's launch history was empty although real practice selection records the launched ID. A06 identified that a live-host database correction could be overwritten by pagehide and required setup with the old host unloaded. The unexecuted amended candidate uses an existing same-origin inert document, updates durable history, returns to the host and asserts history before typing. All raw failures and old proposals are retained; actual Next/new attempt/code/local-draft-reset assertions and timeouts remain intact.

Final [final-keyboard.json](final-keyboard.json) now passes all three editor groups after exact independently reviewed/parent-approved dot fixture continuations. The actual HTML/AX minus readback passes before and after reload; the SVG DOM label is recorded separately. [final-dot-invalid-undo.json](final-dot-invalid-undo.json) adds trusted invalid '-' and out-of-range99 Apply rejection with visible status and unchanged prior group, Undo preserving the atom while removing its bracket/charge, Redo restoring−1, reload and accessible inventory readback. [typing-browser.json](typing-browser.json) repeats the original titration regression for3.1/4.2/5.3 with semantic Enter. A source-backed binary-float harness assertion failure5.300000000000001 vs5.3 is retained in typing-final-float-assertion-failure.json; comparison within1e−12 plus exact aria-valuetext 'pH 5.3' passes. The chemistry engine's existing0.1 snap/marking behavior was untouched.

A21 subsequently confirms its browser suite ended05:04:02.445 UTC and all browsers/servers closed by05:04:14.211 UTC. The final performance series therefore overlaps neither A21's browser nor A06's later DOM probe. Background host activity remains uninstrumented; this is still headless CDP emulation, not a physical mobile benchmark. Runtime metadata parser proof also executes: a known historical original leaf imports successfully, while the synthetic new authored gem and the new gem attached to an existing activity are rejected by the unchanged historical parser despite their valid canonical derived boundary/revision targets. See metadata-proof.json.

The exact reviewed energy-v2 fixture continuation records durable launchHistory=['D03'] but again times out at the Next changed-code check. Cause remains unknown; all pre-Next peak/endpoint/complete-assessment assertions pass. Raw final-energy-v2-next-code-wait-failure.json is retained, no assertion was relaxed, and A06 owns targeted actual Next-versus-clean-control event/repository classification before any further disposition. This is the sole pending substantive tail.

## Independently confirmed Next-on-blur defect

A06's separate actual reproduction establishes the product failure: trusted Next mousedown occurs while enabled; coordinate blur commits peak270 and sets Saving; Next becomes disabled before pointerup and no click fires. The same durable attempt/code D03 remains; peak270 is saved, first response/result/evidence remain immutable. Clean and second-click control cases advance. See [A06 actual execution](../review-render-harness/energy-next-classification/execution.json), [independent handover](../review-render-harness/energy-next-classification/HANDOVER.md) and verification.json. This is genuine independent classification, not a reinterpretation of my raw earlier failures without post-click state. No further harness retry is approved or performed. The parent owns any bounded product fix and new freeze.

All passing evidence for freeze75a6… is preserved under `before-next-fix/`, including screenshots, manifests, performance and generated-host result. New final acceptance must be tied to a subsequent current freeze and fresh affected actual UI checks; this review is not yet complete.

## Final current acceptance evidence — PASS

The sole follow-up runtime change after the first freeze was the separately owned Host Next-save handling. A06 independently reviewed the bounded fix and current dirty/clean/quota/duplicate cases. A23 preserved all earlier passing/failing reports and screenshots under `before-next-fix/`, kept all raw exception records, then tested the fresh current build. No authoring output, editor, source bank, provider or marking change occurred in this follow-up.

All **517 frozen inputs** are independently byte-identical before and after this final browser/performance work: tree `35e6c969f6b9f5fefff7577922dd6703b6a645dc2308a460d44d19d3ce790eb1`. [final-input-fingerprints.json](final-input-fingerprints.json) records current file hashes, unchanged CLI output/template/generator fingerprints and read-only in-memory inventory validation.

| Final current entry | Manifest SHA-256 | FULL eager JS gzip | Runtime / lazy chunks |
| --- | --- | --- | --- |
| A Level | `7aaff9bc8e9a60eac7f1934a22fa77e0e0044bafb7f7485eee1e7de17bbe2763` | 151,587 bytes | 129 / 59 |
| IGCSE | `d05ff28920b81a9436179ff16eea0d8576a00e3519284f610cee763800adaa28` | 151,587 bytes | 129 / 59 |

This is **53,213 bytes below the 204,800-byte full eager shell budget**, per entry. Each course retains six enabled activities and six aliases; banks are physically deferred through the shared universal registry as disclosed above. Final fresh checks pass: full render29, focused a11y4, old-link/prefix/direct-refresh23, startup recovery/wording8, C3 K desktop/mobile2 and unchanged generated shared-host7. Fresh current-build whole/detail/navigation/model/startup/Next screenshots are in `screens/`; earlier source-identical editor typing images remain explicitly labelled in [screenshot provenance](screens/provenance.json) and the previous-freeze archive. The three-editor raw-draft/semantic-commit/invalid/Undo/restore proof and pure authoring tests carry unchanged editor/generator fingerprints; current fresh Host/Next and shared-host tests supplement them.

[final-energy-tail.json](final-energy-tail.json) now passes the **exact reviewed unchanged v2 assertion tail** against the product fix: D03 peak150 and activation-arrow tail240/head160/x300 typed/committed/restored; required labels and ΔH arrow supplied through actual UI; persisted profile ready; assessed Next; unfinished270 followed by one Next click advances to D11 with a fresh attempt and clean220 coordinates. No old270 draft leaks. The earlier failure causes remain preserved exactly as recorded, and A06's separate event classification supplies the genuine product evidence.

[final-titration-next.json](final-titration-next.json) independently tests the same interaction in the other numeric editor. Actual trusted events show Next enabled at mousedown, blur, mouseup and click while the save status is Saving; one click advances TC01→TC02 and creates a fresh attempt with empty responses. Original first response and first assessment are byte-equivalent; the unfinished11.2 draft does not leak to the fresh input. Both tests use actual UI, current saved repository state and source-faithful durable launch history written only after unloading the old host.

Final current [performance.json](performance.json) measures six cold and six editor observations in the explicitly coordinated quiet browser window **05:35:10.299–05:35:58.392 UTC**. A06 browsers closed by05:32:39.910; A21 was held browser-idle by the foreman until this reservation closed. All other A23 browsers were closed. The actual profiling browser is closed and all three parties were notified of the interval/reservation release. Background host processes were not instrumented; this remains a descriptive small headless CDP series, not a physical device/hardware-isolated benchmark.

| Final current measurement | Three-sample observed range |
| --- | --- |
| A Level cold shell / lazy start | 4,521–4,577 ms / 902–932 ms |
| IGCSE cold shell / lazy start | 4,456–4,569 ms / 1,426–1,440 ms |
| Titration30-step gesture plus two frames / release checkpoint | 560–565 ms / 55–63 ms |
| Real three-character draft plus two frames | 202–214 ms, including imposed40 ms/character delay |
| Enter-to-two-frames / Enter-to-checkpoint | 43–49 ms / 55–59 ms |
| Full real typing through checkpoint | 265–278 ms |

Settings remain4× CPU,150ms latency,200000B/s down,93750B/s up, cache disabled,390×844 DPR1; interaction chart switches to1440×1000. Actual local gesture movement and raw typing create **zero attempt writes before pointer release or Enter**; each meaningful commit saves state. No layout overflow/page errors occurred. The source-owned explicit request trace records actual lazy-load boundaries. No invented benchmarks/timing/storage/scheduler changes were made.

[cleanup.json](cleanup.json) confirms both owned listeners5195/5203 are closed; every owned browser closed in finally, and no other process was stopped. The generated DEV preview emitted existing Vite public-directory path advisories for its source font reference; requests/font rendering succeeded and production prefix/font checks pass. Generated outputs remain untouched. The root receives this assigned review as PASS; full chemistry, inherited cloud/Python/source limits and native timing disposition remain with their separately assigned reviews/root acceptance. No publication occurred.

Final visual readback also inspected the new-freeze orbital desktop whole/mobile detail, teacher energy whole, titration/dot desktop detail, teacher molecule detail and both fresh Next mobile screenshots. Scientific arrows, units/formula glyphs, focused answering layout and populated teacher models remain readable. Fresh Next views show deliberate new unanswered diagrams/controls, with energy coordinates220 and titration pH4; these are initial responses rather than checked models. Screenshot provenance records72 current images and4 explicitly carried source-identical typing images.
