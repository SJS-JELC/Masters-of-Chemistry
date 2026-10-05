# H1 question chrome and lifecycle handover

The shared question screens now use the accepted eagle/molecule masthead, course and actual subtopic, one existing pink question ID, guarded map arrow, divider, and the exact curriculum/Olympiad question pill. Question-only navigation, duplicate metadata, Pause/Resume controls, visible clocks, routine save notices, practice target strip, Change activity, saved-result counts and revision summary are removed. Meaningful scientific headings, instructions, assessment, teacher read-only views, stage controls, save errors and Retry remain.

CourseShell's optional `questionHeader` scopes these changes to questions. Generic setup/statistics/import routes retain navigation, including Home. Student headings use the exact selected gem; teacher headings follow the currently displayed provider identity, with lazy acid scope and IGCSE dot category mappings. C3 uses its existing `C3L6 2012 Q2` display identity, without inventing a curriculum QuestionRef.

## Lifecycle

Stored attempts automatically continue only after their matching session is durably saved active. Loading, save failure, setup, teacher mode, explicit fresh/changed-selection requests, uncommitted transitions and departing intent prevent continuation/binding. Continuation reuses the attempt ID, question reference, response and drawing; it creates no new assessment evidence and excludes away time. The display clock interval was removed; authoritative timing, attempt, persistence and scheduler domain bytes are unchanged.

The first browser run exposed controller disposal before guarded pause. H01 retained the controller until explicit pause/save. H03 then independently reproduced a browser Back race: automatic continuation could resume during asynchronous departure. A synchronous departing-intent guard now suppresses that path. Retry also retains the actual committed session pause state, then durably resumes before enabling the player. H03 independently verified normal/delayed Back and failed departure/Retry/restore on the final Host. Raw failures, bounded fixes and corrected harness selectors remain in this evidence directory.

## Current verification

- Five focused lifecycle/heading tests and 188 retained source/activity/landing assertions pass. Retained report writes are redirected into this new directory; historical assertions and three existing historical fixture exceptions are preserved.
- H02's 16 source-browser cases cover all pills, stable IDs, exact pink computed styling, specialist players, teacher, C3 and heading accessibility. Its immutable scope is 71 runtime files plus five read-only original references.
- H01's final 15 source-browser cases verify paused drawing restoration in both courses, first-score freeze, reload/correction/Next/statistics, failed resume save/Retry, fresh and changed selection isolation, teacher identity, revision continuation and C3 guarded save. Reference drawing fixtures use the retained DEV response harness; assessment/navigation/pickers are actual UI actions.
- Nine final static-production cases run at a nested deployment prefix in fresh contexts with pinned root Playwright 1.62.1 and headless Edge. They use actual typing, checks, self-rubric, drawing gestures and navigation. Actual screenshots were visually inspected for content, readable geometry, masthead, question identity, controls and wrapping, in addition to overflow checks. Two final regenerated desktop/mobile captures were inspected again.
- The final Host's real 60-second and 180-second idle allowances plateau exactly in durable IndexedDB and restart after trusted input. No visible counter, clock patch, synthetic visibility or timing hook supplies this proof. First assessment/reload/retry/Next timing and statistics are also verified from persisted data.
- H03's three independent current browser cases close the Back/Retry race. Its numeric restoration fixture uses the retained DEV harness, as stated in its source review.
- Both current builds/releases pass: 143 runtime files each, six activities per course, 62 lazy JavaScript chunks, initial JavaScript gzip 168116 bytes (A Level) and 168115 bytes (IGCSE) below 204800. Fresh closure fingerprints 570 current source/build/release inputs.
- All 23709 historical evidence files remain byte-exact. All readable 794 original baseline files remain byte-exact; 523 known offline files retain exact metadata and were never opened. Editor, chemistry, landing, provider/bank, domain, persistence, statistics, contracts and public source boundaries remain exact.

## Native limits

Native freeze/hidden/physical background/minimization/OS suspension remain **UNESTABLISHED**. CDP freeze yielded no actual freeze/resume event. H03's correctly targeted minimized window remained visible/focused in the actual documents without trusted hidden/blur boundaries. Command acknowledgement is not native behaviour proof. This preserves the historical E04 disposition and does not claim whole-Host native equivalence, new native PASS, an invariant waiver or publication authority. Root reviews bounded final acceptance with these limits.

Headless mobile/touch layouts are not physical-device or screen-reader certification. Workspace root is not a Git repository, so source review uses explicit ownership/fingerprints/current code rather than an invented Git diff. Requested models/efforts are recorded; effective settings and usage are unavailable and remain null.

## Root hierarchy correction

Root review identified the brand/course hierarchy as reversed. A bounded three-rule CSS correction makes the mint uppercase brand an 11px eyebrow and the foreground course/subtopic the main 24px Comfortaa heading; mobile uses 10px and 21px. Exact text/order and wrapping remain. Only `src/styles/platform.css` differs from the previous submitted runtime sources; Host/domain/timing and all other runtime bytes remain exact. Previous successful integration scripts, reports, renders and CSS are retained in `before-root-hierarchy-correction/`.

Six fresh numeric/dot/C3 desktop/mobile cases verify actual computed hierarchy and capture current renders at the persistent preview; all six images were opened and visually inspected. All nine production cases, focused tests, typecheck, both builds/releases and current/protected/historical closure pass again. Per root instruction, long idle tests were carried with exact final Host/domain identity and were not repeated for this CSS-only change. An initial Edge launch hit Windows path length in the deeply nested temporary profile; the one bounded retry uses shorter `.qhc-tmp` inside the new app. That environment limitation is retained explicitly.

Verified review URLs: `http://127.0.0.1:5182/alevel/` and `http://127.0.0.1:5182/igcse/`. Both return HTTP200 with bytes equal to the current build entry HTML; actual questions on that preview show the new computed styles. The previously failing bare `/alevel.html` path is not the preview's course-prefix route.

## Reproduce inside the new app

```powershell
node validation/question-chrome/implementation/integration/retained-tests.mjs
node validation/question-chrome/implementation/integration/build.mjs
node validation/question-chrome/implementation/integration/browser.mjs
node validation/question-chrome/implementation/integration/production-browser.mjs
node validation/question-chrome/implementation/integration/hierarchy-browser.mjs
node validation/question-chrome/implementation/integration/timing-browser.mjs
node validation/question-chrome/implementation/integration/closure.mjs
node validation/question-chrome/implementation/integration/exception-review/verify-evidence.mjs
node validation/question-chrome/implementation/integration/final-report.mjs
```

`browser.mjs` expects the verified current-app source Vite server at 5183. Production/timing scripts own ephemeral static servers and isolated contexts. Do not run historical report writers into their accepted folders. No original build, real browser store, dependency install, cloud hydration or publication was performed.
