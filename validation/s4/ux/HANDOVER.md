# S4-UX handover — A17

Requested model/effort: GPT-6.1 Sol / High. Effective settings and usage are not exposed. Worker verification is separate from foreman validation and root stage acceptance.

## Result

Focused practice and revision hide the course activity list, view tabs and setup while responding. **Change activity or view** pauses the actual controller and flushes pending commands/repository writes before exposing navigation. A failed save blocks departure and has a reachable retry. Returning preserves the same question, answer, attempt and time; Resume collapses setup. Selecting a different session mode opens its setup without rewriting the saved session.

Teacher preview shows the checked source answer/diagrams before the question prompts and omits empty disabled pupil controls. The searchable catalogue preserves exact source refs, source levels, stable IDs and historical code lookup. Resolved compatibility refs retain their supplied seed/level. Teacher visits create no curriculum evidence. The generic registered-provider fallback contains no authoring-proof IDs.

Whole-fit and explicit detail views now cover orbital ladders/rows, energy profiles, titration graphs and large content images. The labelled detail region supports keyboard arrows and trusted touchscreen scrolling. Pupil editor engines, spin keys, pointer gestures and non-drag controls remain intact. Existing molecule and dot/cross fit controls remain intact. C3's fixed network retains its original outer scroll and exact SVG/node coordinate geometry.

## Owned changes

- `src/foundation/ActivityHost.tsx`: focus/navigation, pause/flush/error handling, teacher mounting and exact refs.
- `src/shell/CourseShell.tsx`: optional view navigation/focus props.
- `src/ui/TeacherPicker.tsx`, `teacher-catalogue.ts`, `historical-acid-catalogue.js/.d.ts`: complete source chooser and generic provider fallback.
- `src/ui/DiagramViewport.tsx`, `Content.tsx`: shared fit/detail presentation.
- `src/ui/QuestionPlayer.tsx`: immediate checked teacher content; pupil assessment/correction/rubric controls retained.
- `src/editors/electron-configuration/index.tsx`, `energy-profile/index.tsx`, `titration-curve/TitrationCurveEditor.tsx`: presentation wrappers only.
- `src/styles/platform.css`: responsive focus/chooser/diagram presentation, prefix-safe Comfortaa font asset, preserved fixed C3 geometry.

No chemistry, source bank, marking, mastery, timing algorithm, repository, contract, registry, main entry or protected sibling was changed by A17.

## Coverage

`catalogue-results.json` validates every entry through the actual provider, checks unique descriptor keys, complete fixed IDs and exact refs/provenance:

| Activity | Teacher descriptors |
| --- | ---: |
| Acid calculations | 139 current and historical |
| Structure/bonding | 18 |
| A Level dot/cross | 123 source grade combinations |
| IGCSE dot/cross | 104 including two teacher-only references outside pupil pools |
| Titration curves | 36 |
| Calorimetry | 4512 configurations |
| Bond enthalpy | 69 reaction/level/family routes |
| Electrons/bonding | 14 |
| Electron configurations | 1144: 1060 fixed level routes plus 84 eligible matching family/group masks |
| Energy/enthalpy | 54 |
| Energetics practical | 14 |

Calorimetry rows count source configurations. Some canonicalised generator aliases share a question ref; they are retained as separate source descriptors. Numerical seeds are reproducible instances, and arbitrary supported historical/generated codes remain accessible through code lookup. Empty source grades stay empty; teacher-reference entries do not create pupil/revision routes. C3 remains in its separate Olympiad host and has no curriculum catalogue rows.

## Verification

- `catalogue.test.mjs`: complete source catalogue invariants PASS.
- `teacher-catalogue-browser-results.json`: scoped verified subset of the retained `retry-browser-results.json`; all eleven teacher catalogue counts/last-row routes, no blank workspace or evidence, PASS for those eleven checks before the independently retained fixture stop.
- `accepted-tail-browser-results.json`: final corrected tail PASS; eight substantive groups cover desktop/mobile editors, focused practice, immutable correction/evidence/time, pause/reload/return, actual revision ADD ALL/Next, C3 molecular editing, self-rubric Not met labels, exact compatibility teacher ref and explicit-view precedence, and loaded Comfortaa. The filename is a probe tag; it is **not** root acceptance.
- `molecule-browser-results.json`: actual Part(a) prerequisite UI, molecular non-drag editing/restoration, separate repository channel and zero curriculum evidence PASS.
- `touch-network-results.json`: trusted touchscreen orbital detail swipe and C3 SVG720×1030/node R alignment/outer swipe PASS.
- `timing-navigation-results.json`: registered idle cutoff, trusted restart, suspension exclusion, frozen time/evidence/statistics transfer, fresh Next and exact pause/reload duration PASS using the real host/binding/controller/repository with an accelerated browser clock.
- `s3-regression.log`: complete unchanged chemistry/reference suite PASS, including exhaustive4512-configuration thermochemistry coverage.
- `typecheck.log`, `protected-apps.json`: PASS; protected originals unchanged (1317 files;523 original metadata-only placeholders retained).
- `source-hashes.json`: affected display files, accepted source provider files and immutable scope/acceptance controls retained with SHA-256 fingerprints.
- Screenshots were visually inspected for orbital whole/detail, energy whole/detail, titration, dot/cross, molecule, checked teacher orbitals, frozen rubric feedback and network geometry. Desktop1440×1000 and mobile390×844 checks assert no document overflow.

## Retained failures and corrections

1. `first-catalogue-results.json` / `first-browser-results.json`: empty-grade IGCSE teacher rows omitted. Corrected with explicit outside-pupil-pool reference descriptors; chemistry/source grades unchanged.
2. `retry-browser-results.json`: optional-chain guard accepted undefined before reload readiness. Corrected to actual harness/attempt presence.
3. `tail-browser-results.json`: inner orbital scroller captured detail overflow. Corrected to one effective outer region.
4. `tail-fixed-browser-results.json`: immediate native keyboard-scroll assertion was unreliable. Added explicit outer-region keyboard scrolling without intercepting child editor keys.
5. `keyboard-fixed-tail-browser-results.json`: fixture expected first DOM orbital to be4p; accepted DOM order starts1s despite reversed visual energy rows. Corrected fixture index only.
6. `verified-tail-browser-results.json` / `final-browser-results.json`: C3 fixture called the harness before its runtime was available. Final probe waits the visible actual Part(a) entry, preserving prerequisite semantics. Dedicated UI-only molecule probe also passes.

Failures and screenshots remain unchanged; no failed probe is presented as a full PASS.

## Limits and regeneration

No native foreground permission was assigned. The headless timing probe reports actual background/focus state; it did not expose native background state, so it makes no new native claim. Accepted S3 native timing evidence remains applicable to the unchanged binding/algorithm, with its original explicit limits. Foreman/root and the independent S5 gate own final acceptance.

Run a project-local Vite server on5192, then:

```powershell
node validation/s4/ux/catalogue.test.mjs
$env:UX_RUN_TAG='new-probe'
node validation/s4/ux/browser.mjs
node validation/s4/ux/molecule-browser.mjs
node validation/s4/ux/touch-network-browser.mjs
node validation/s4/ux/timing-navigation-browser.mjs
npm.cmd run typecheck
node scripts/test-s3.mjs
node scripts/protect-originals.mjs check
```

Playwright1.62.1 is imported read-only from the pinned workspace dependency. Profiles, screenshots and outputs are within this new project. Nothing was deployed or published.

## Bounded final teacher navigation correction

The final composite render exposed a teacher orbital preview with the persisted acid pupil activity highlighted. The teacher sidebar also changed only pupil setup. Before source files, hashes and completion remain in navigation-before-*; teacher-navigation-before-results.json retains the actual reproduction (OBSERVED_FAIL).

Exact source scope: ActivityHost now highlights teacherActivity during preview and sends teacher curriculum sidebar choices to setTeacherActivity. Its C3 branch and pupil checkpoint/pause/flush/selection path are unchanged. TeacherPicker marks its first unlinked catalogue selection handled after external initialRef/initialCode handling, preventing a later remembered preview ref from switching activity back. Imports and the DEV harness API are unchanged. navigation-diff.txt contains the complete two-file diff.

Retained probes: teacher-navigation-first-before-results.json failed only its guessed acid title assertion; corrected baseline compares the actual starting highlight. teacher-navigation-first-after-results.json caught the genuine chooser initialization race. One corrected full sidebar tail passes; the expanded required check also passes dropdown persistence and exact supplied level/seed. No failure was relabelled PASS.

teacher-navigation-after-results.json PASS proves existing paused acid response/time/ID/session unchanged through teacher orbital EC-CMICC5, sidebar to the complete 14-entry electrons/bonding catalogue, and return Practice; zero independent evidence. Sidebar highlight and checked answer agree. Reopened teacher dropdown activity and EC-CMICC5 level 3 remain selected. A direct generated acid level 3/seed 17 link matches the exact encoded source ID and every checked-answer value from actual provider.restore(ref), with zero evidence. Actual before/after screenshots were visually inspected. Typecheck and protected-original guard pass. Headless checks only; no new native background claim.

src/foundation/ActivityHost.tsx: SHA-256 2fd0fa0c97d659e361b35accfe5baab355f226d5625d7a4cc31d30e3f24188bd -> a49f1e65ffaa9808588bb8abc93b3fcb6de20ffec8517746ac317ad0a0e72265.

src/ui/TeacherPicker.tsx: SHA-256 d498788ad45215f5322503d3a7e44c30b89fe04197a38b57bf01b20fe7655c1f -> efb6918cdd54e59e47842ada4e47537b8f18d3e6e7e10739d156951254d7fe66.

Regenerate this bounded check with node validation/s4/ux/teacher-navigation-browser.mjs on port 5192. source-hashes.json and completion.json include this correction. Worker PASS remains separate from foreman/root acceptance and S5.
