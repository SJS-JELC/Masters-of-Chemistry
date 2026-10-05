# Proposed S1 packages after root acceptance

These are bounded handoffs prepared using the repository `delegate-work` skill and work-package reference. They do not dispatch S1. Each implementation worker requests gpt-6.1-sol/high with a narrow context, reports only to the one foreman, writes only assigned paths, and never spawns children or writes the swarm log. Foreman assigns stable agent IDs and routes interface changes before edits.

All packages read new-app AGENTS.md/project-contract.json/IMPLEMENTATION.md, this architecture baseline and `src/contracts/`. Old sources are read-only. No package changes: the foreman owns dependencies, compiler and build configuration, registration aggregation, cross-worker integration and release files. Workers retain detailed validation locally and return compact completion manifests.

## S1-SHELL — two course shells and reusable player surfaces

**Owner:** `src/ui/**`, `src/shell/**`, `src/styles/**`, `src/main-alevel.tsx`, `src/main-igcse.tsx`, `validation/s1/shell/**`. UI/editor frame contracts may be declared inside owned modules but must consume the existing domain types. `src/editors/**` and chemistry adapters are deferred to activity owners.

**Input:** `ActivityRegistry`, `Question`, `PlayerAttempt`, `AttemptCommand`, `RepositoryResult`, `CurriculumSession`. Receive live immutable state, command callback, save-status callback and scheduler Next callback as props; do not import a singleton store that owns attempts. Teacher/review supplies `PreviewAttempt` and read-only controls.

**Required exports:** `QuestionPlayer({question, attempt, onCommand, onNext, saveStatus})`; `CourseShell({course, registry, children})`; standard choice/dropdown/text/numeric/explanation/correction/diagram-selection surfaces; shared editor frame with injected activity/editor React surface. Zustand stores UI state/view selectors only; identity and evidence remain in the attempt/session layer. Standard controls preserve typed `Response` discriminants.

**Source evidence:** IGCSE structure/bonding `levelTwoSections` (registered levels 2/3 only; level 1 tables are dormant support); A Level acid scaffold rows/response headings; editor source gesture/read-only conventions; licensed Comfortaa/eagle/gems. Keep response lock, evidence selection/non-drag text-range input and explicit hint/reveal controls distinct. Render unrecognized-text validation separately from recognised incorrect feedback and provide explicit post-assessment equivalent-wording learning review where policy permits it. No fake chemical checker or checkbox-only rubric stand-in.

**Done:** both course shells render locally with development-only representative contract fixtures; practice/revision mount the same player directly; accessible ordinary controls and multipart/workspace layouts work; save failures visible. No demo activity enters runtime registration.

**Validation:** type/build; browser screenshot/keyboard/touch/non-drag checks on both shells; locked explanation selection and teacher evidence exclusion; responsive workspace. Browser test harness uses a new synthetic namespace. Retain browser evidence and known deferred editor/activity checks.

## S1-ATTEMPT — first assessment and active time

**Owner:** `src/domain/attempt/**`, `src/domain/timing/**`, `validation/s1/attempt/**`.

**Required exports:** `createActiveClock({attemptId,idleLimitMs,saved?,now})` implementing `ActiveClock`; pure `transitionAttempt({question,state,command,policy,learningReviewPolicy?,sample,timingResult})`; `createAttemptController({question,state,policy,learningReviewPolicy?,clock})` implementing `AttemptController`; `assessmentToEvidence(state)` returning valid curriculum evidence or null. Do not create identity inside React effects. Controller construction requires an existing student attempt; preview has a separate no-write path.

**Dependencies:** `MarkingPolicy`, optional `LearningReviewPolicy`, `Question`, `StudentAttempt` supplied by host; repository is not imported. The host samples browser timing and persists accepted transitions. Rubric submission freezes all text and finishes timing; review judgements are separate transitions; no automatic language marking. Invalid blank/number/graph and unrecognized-text submissions do not freeze. Assistance appends, reveal ends answering, assessed retries cannot mutate frozen data. `review-valid-alternative` is allowed only after a marked first result and only for eligible points; update `learningReview`, preserving `firstResponse`/`firstAssessment` and timing. It emits no independent evidence/scheduler confirmation and is rejected during pre-assessment/rubric-review phases.

**Source evidence:** both `active-question-time.js` clocks; IGCSE `igcse-question-time.js`; structure/bonding submission/self-review sequence; active acid `levels.js score` (all required) and levels-app persistence.

**Done:** first response/assessment immutable and idempotent; legal answering → rubric review → assessed flow; restores same attempt; stop time on first accepted submission/reveal; teacher/review produces no evidence.

**Validation:** deterministic clock tests (idle boundary, background/focus, monotonic/wall suspension, pause/resume, mismatched checkpoint, completed historical untimed); transitions for rejected/incorrect/partial/correct, hints/reveal/retries and evidence-range sequence; unknown text remains unanswered; valid-alternative toggles alter learning marks only and preserve first automatic score/time; option/multiselect/empty/gated override rejection; development harness real-browser hide/reload/Next/remount verification. Preserve course score mapping through the injected policy.

## S1-PERSISTENCE — transactional repository and import primitives

**Owner:** `src/persistence/**`, `validation/s1/persistence/**`.

**Required export:** `createChemistryRepository(databaseName)` implementing `ChemistryRepository`, plus `parseLegacyImport({namespace,sourceKey,rawText})` returning validated payload/error. Database name belongs exclusively to the new project. Provide explicit pure validators in owned modules; no writes to old keys or old stores, and no reading app browser storage during tests.

**Storage schema:** attempts keyed by course/profile/attempt; curriculum evidence same identity; sessions course/profile/session; Olympiad course/profile/activity; import receipts namespace/source key/fingerprint. IndexedDB/Dexie internal schema is this owner's concern. `saveCurriculum` validates and atomically commits attempt+first evidence+optional session. Evidence equality makes duplicate saves no-ops; differing first evidence is conflict. `importBatch` validates/deduplicates/commits with receipt atomically.

**Source evidence:** A Level mastery historical source keys and dot/cross alias; IGCSE landing progress grade/timing cleaning; C3L6 assessment restore and graph/history export. Retain historical gaps; separate revised acid progression; reject excluded activity/game imports. Do not broaden import support beyond inventory-confirmed legacy keys/shapes.

**Done:** concrete Dexie repository with explicit failures, immutable conflict guard and namespace isolation; read-only legacy parsers preserve original IDs/dates/scores/timing gaps; separate challenge store; no snapshots. Failed save does not destroy draft.

**Validation:** real-browser IndexedDB save/restore; repeated saves/imports; rollback of deliberately failed multi-store transaction; quota/unavailable injection; conflict collision; cross-course/profile rejection; historical no-timing fixture; malformed graph/range rejection; C3L6 stale checks do not invent completion. Retain actual DB tests rather than relying exclusively on memory mocks.

## S1-SESSION — course mastery and revision/practice scheduling

**Owner:** `src/domain/mastery/**`, `src/domain/session/**`, `validation/s1/session/**`.

**Required exports:** `createCourseMastery(course)` implementing `CourseMastery`; pure `revisionScheduler` implementing `RevisionScheduler`; `createRevisionSession({namespace,id,selected,settings,summaries,now})`; `selectPracticeQuestion({session,provider,seed,summaries})`; selection helpers use `CurriculumRegistration` only. Foreman supplies exact registration/config aggregation; worker cannot edit catalogue.

**Dependencies:** repository/history data and summary inputs are passed in; scheduler owns Next but does not write persistence. Host commits scheduler state with accepted attempt through `CurriculumWrite`. Question providers receive target and previous identities; restore title and question via provider rather than DOM. Session references only IDs/seeds and targets, never full content or old iframe state.

**Source evidence:** A Level mastery recurrence/config/historical progression separation, IGCSE landing progress recurrence/grade bands and config; both source `test-mode-core.js` scheduling/accept/expire. Preserve source strict threshold, empty null score, oldest-first ordering, supported levels, confirmation and recency rules.

**Done:** exact course mastery equivalence and curriculum-only revision; ADD ALL includes every genuinely supported gem/level in selected topic; pause/current attempt restoration; deduplicated acceptance; scheduler Next chooses a fresh identity; assistance does not award independent confirmation.

**Validation:** read-only legacy-equivalence golden values for empty/all-correct/partial/mixed/time ordering/threshold edge and per-gem half-lives; previous alias and old acid exclusion; revision ordering/rotation/expiry/one-two confirmation/failure-to-practice; duplicate outcome rejection; no C3L6 registration/target/evidence; actual browser select/launch/score/pause/reload/resume/Next with foundation fixtures.

## Foreman integration contract

Freeze these interfaces before concurrent dispatch. A material mismatch returns to foreman/root; workers do not cast away types. Foreman owns `src/catalogue/**`, package/lock/config/scripts/build roots and integration composition. It connects repository writes to accepted attempt transitions, clock lifecycle to the visible player, and session scheduler to Next. It compiles all fixtures and reviews shared diffs before the S1 report. Root must inspect real shell/browser outputs and evidence before accepting S1. No S2 activity implementation begins before that acceptance.

Return format for every package: `{agentId,jobId,status,outputPaths,validation,confidence,reason}` with retained detailed test output, screenshots/source hashes, changed-file ownership and remaining assumptions. A worker PASS is not stage acceptance.
