# H0 host lifecycle and metadata audit

Job H0-INTEGRATION; owner H01 (`/root/question_chrome_foreman`), requested gpt-6.1-sol/high, effective settings and usage unknown. Audit only. No runtime edits, builds, releases, original hydration or publication performed.

## Verified starting state

`capture.mjs` establishes the accepted editor source/build closure (564 inputs), 25 inspected integration sources, 794 readable protected-original files and 523 metadata-only offline files. It records 23,709 historical evidence fingerprints covering S0–S5, landing and editor audit/implementation. Known offline files were never opened. Both original Git/dependency inventories remain included in the original baseline check.

Source Vite at 5183 serves `alevel.html`. Port 5182 answers the two tested paths with 404. These are retained observations; production path/prefix must be checked before reuse, and no unrelated server is stopped.

## Current lifecycle findings

1. `ActivityHost.readSavedData` restores the attempt, exact provider reference/seed and session, then mirrors persisted paused status into React state. Paused state removes the player and offers the only visible Resume control. Simply deleting that control would strand historical paused sessions.
2. Existing `resume` applies the resumed session before the attempted write and unconditionally clears paused state after saving an existing attempt. A failed save can therefore enable the player before durable session restoration. H1 must change this host orchestration, while preserving repository/clock/assessment algorithms.
3. The timing-binding effect currently checks attempt/preview/paused, but not a pending fresh launch, loading, setup or view/session mismatch. It can temporarily bind a restored old session before a requested fresh launch replaces it. Initial loading and request intent must suppress old-session binding.
4. Explicit Start and Next create UUIDs and seeds; existing effects create no identity. Launch tokens and pending refs already prevent duplicate StrictMode launches. Retain these checks and test them after adding auto-restoration.
5. The real `bindBrowserAttemptTiming` samples once per second and persists changed checkpoints at five-second intervals. A second host interval exists solely for `clockDisplay`. Remove that display interval/state and its setters; do not replace or modify the authoritative binding. Attempt checkpoints and first-response timing remain unchanged.
6. `leaveAttempt`, selected-view navigation and ProductionFoundation's popstate guard await response commands, pause/checkpoint the controller, await save queues and block departure on failures. Eagle/back must use those exact guards. Their text can say save failure without exposing pause/time controls or notices.
7. Teacher view uses a separate preview question and no attempt controller. The header must follow that preview question, not the stored pupil target or the teacher activity selection while its provider is still loading. Runtime/provider load completion should be identity guarded to prevent stale metadata winning a rapid selection race.

## Proposed H1 lifecycle

- Keep internal pause state as a binding/save gate. Remove its visible controls, pause notices and alternate hidden-player Resume branch.
- After a successful read, explicitly classify intent: teacher preview; fresh practice launch; changed revision selection; identical revision continuation; or ordinary matching stored-session continuation. Only the latter two may resume the stored attempt. Do not infer continuation from a generic activity family or URL level alone.
- Gate timing binding on ready matching student view/session, no setup, no pending launch/navigation/auto-resume, no read error and successful required session save. A fresh/new selection remains gated until its explicit adoption/save finishes; unchanged completed attempts bind a finished clock.
- Deduplicate automatic continuation by a ref keyed to session/attempt identity and request intent. Re-check current identity, current view and request token before asynchronous commit. Initial effects/remounts can restore an existing identity but never allocate one or add evidence.
- Resume through the existing queued repository path: persist the matching resumed session, commit the resumed session and enable binding only in the successful onSaved callback. Keep pending transition ownership so timing/correction saves cannot overwrite an uncommitted transition. Preserve retry closures; failed writes retain failure/Retry and cannot silently enable answering or leave.
- During the brief required restoration save, show ordinary loading status; on save failure show the explicit retained failure/Retry. Do not render an apparently interactive player whose commands would be ignored by a paused controller. No visible pause/time wording is needed.
- Returning from guarded navigation restores the same attempt/ref/responses/editor drawing and saved activeMs. A new clock starts from its checkpoint at current time, so away time cannot accrue. First responses/assessment/evidence remain immutable.
- Delete the complete practice-progress/result-count/revision-status section and all development timer announcements. Keep DEV test harness snapshots for persisted checks.

## Metadata interface and ownership

Shared shell input: optional `questionHeader: { readonly subtopic: string; readonly questionId?: string }`. Its presence selects question-screen masthead, divider and single-column question layout; non-question screens retain their current CourseShell. Shell supplies a presentational context for pane pill/duplicate heading suppression. Eagle/back invoke `onSelectView('home')`; the host wraps that call in the existing navigation guard. No mode/course badge subtitle is added.

H01 owns `src/foundation/ActivityHost.tsx`, new `src/foundation/question-heading.ts` resolver and optional bounded `src/foundation/session-continuation.ts` pure intent helper, their new validation tests/scripts, new H1 integration evidence/build/release closure. ProductionFoundation, contracts, domain clock/binding/attempt/session/mastery, persistence, providers/banks, registry and statistics remain unchanged unless a material H0 interface amendment is accepted by root.

H02 owns CourseShell, new presentational QuestionChrome/context/QuestionLevelPill modules, platform CSS scoped to question screens, QuestionPlayer/DotCrossPlayer suppression of duplicated IDs/levels/equal headings and pause/time wording, and OlympiadHost/C3L6View/C3 CSS chrome wrapper changes only. H02 does not edit ActivityHost, any editor engine/palette/layout/gesture, providers/content/policies or timing/storage. Exact final H02 file list is retained in the presentation proposal.

Student title: registration gem label found by the exact `attempt.target.activityId` + `gemId`. This follows scheduler-selected revision targets rather than generic activity title. Teacher title: current shown QuestionRef/provider identity; single-gem registrations use that sole supported gem label; IGCSE dot-and-cross uses the existing source record category and existing `categoryByGem`/gem labels; acid questions use `acidTemplateFor` and exact existing engine scope membership for current templates. Historical acid questions or ambiguous source templates use the meaningful restored question title rather than arbitrarily selecting a gem. A Level dot-and-cross has one active registered gem; its historical alias remains unchanged. Never invent a gem/ID or parse labels/DOM to determine identity. Teacher provider helpers stay lazy to preserve the shell budget.

C3 identity is its exact existing displayed `C3L6 2012 Q2` literal, supported by source content; it is not a fabricated QuestionRef. C3 subtopic is the current registered challenge title. Pane has cyan OLYMPIAD QUESTION. Remove only top repeated kicker/title; introduction chemistry, diagrams, stage/subpart headings, stage controls, editor surfaces and read-only/erratum notices remain intact.

## H1 verification gate

1. Typecheck, scoped meaningful lifecycle/metadata tests and retained project regression/registration/timing/reference assertions, executed with outputs only under new validation/question-chrome/implementation paths. Never run historical report/capture writers in their old folders.
2. Source exactness: all content/providers/banks/marking/mastery/timing algorithms, landing runtime/assets and specialist editor engines/palettes/geometry byte-identical against H0 current fingerprints. Review changed shared diffs; allowed ownership list checked deterministically.
3. Fresh isolated Playwright contexts using pinned workspace dependency by read-only import. Source DEV harness confirms exact attempt ID/ref/seed/responses/drawings on current and historical paused restoration; ordinary reload, identical revision continuation, fresh practice, changed revision selection and StrictMode idempotence; teacher/revision title/level transitions and no teacher evidence.
4. Eagle/back checkpoint/save guard; actual quota/fault save failure blocks departure; Retry commits and resumes safely. First-score cutoff/retry/reveal/reload/Next deduplication and timing transfer to statistics verified through IndexedDB/harness data, never visible counters.
5. Actual real idle-cutoff plateau for a short-allowance question and relevant editor allowance, background/focus/hidden boundaries where supported, no away time on guarded map/reload. Preserve all raw failed capability probes and honest prior E04 limitations. Clock/binding remain byte-exact, but changed Host requires fresh host lifecycle evidence; old whole-host native equivalence cannot be claimed. A genuinely untestable changed-host native requirement returns through independent exception/root disposition rather than fabricated freeze events.
6. Both course builds/releases, current prefixes/direct refresh, runtime inventory and initial shell gzip budget, production desktop/mobile smoke. All three A Level/IGCSE label/colour variants plus C3, one stable header ID, no nav/sidebar/duplicate level/pause/time/after-summary. Numeric, multipart/rubric, dot editor, other editor, teacher and C3 staging smoke; substantive actual image inspection at desktop/mobile, long title/ID wrapping and accessible arrow/eagle controls.
7. New current source/build/release/input closure after final edits. Recheck protected original readable hashes/known offline metadata and all 23,709 historical evidence files; preserve old evidence byte-exact and report new closure separately.

## Limits and next action

H0 is an audit gate, not implementation or browser-behaviour acceptance. Requested/effective runtime model and usage cannot be independently measured from tool exposure. Current headless native freeze/background limitations remain explicitly retained from E04. Root accepts the exact ownership/interface/lifecycle proposal before H1 dispatch.
