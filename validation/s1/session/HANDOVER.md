# S1 session/mastery handover — A02

This package implements React-free source-equivalent mastery and practice/revision scheduling. It writes no browser storage and has no UI, repository or activity-bank dependency. No source app was built or changed. Source-equivalence fixtures are validation inputs only; no fixture is registered as migrated activity content.

## Exports and argument contracts

`src/domain/mastery/index.ts`:

- `createCourseMastery(course, now?: () => number): CourseMastery`. Call `summarize(records, setting, level)` with one profile's course history and the foreman-owned source-derived setting. Invalid/future records do not enter weights; first encountered valid duplicate attempt wins before stable oldest-first sorting. Unknown active mastery settings are rejected. Retained old dot/cross aliases can enter the active diagram summary. Legacy progression must match the active version (v1 permits missing/1; v2 requires explicit2); current new-attempt evidence belongs to the current setting. Nothing removes the retained historical records.
- `weightedScore(scores, halfLife): number | null`: exact zero-prior recurrence, no sample-normalised denominator. `exceedsMasteryThreshold(score, threshold)` uses strictly greater, including the 0.8 edge.
- `nextMasteryLevel(summaries): Level | null` sorts supported level summaries and returns the first not mastered. `summarizeSettings(course, records, settings, now?)` builds all supported summaries.

`src/domain/session/index.ts`:

- `createRevisionSession({namespace,id,selected: readonly CurriculumTarget[],settings: readonly MasterySetting[],summaries: readonly MasterySummary[],now:number}): RevisionSession`. Selection contains every genuine supported level of each selected gem, with one uniquely matching setting. Olympiad/unknown targets and incomplete levels are rejected. Creation starts without an attempt; host explicitly calls Next with a fresh ID.
- `revisionScheduler.next(session,summaries,now,attemptId)` and `.accept(session,outcome,summaries,now)` match the accepted contract. Both return immutable session objects; ignored duplicate/invalid outcomes return the original object. Next owns gem/level ordering and requires fresh attempt IDs. An unfinished current attempt is reused. Accepted results remain current until Next, which stores only previous target/ref identities and rotates gems by level, mastery deficit and source ID.
- `bindRevisionQuestion(session,ref)` validates the provider ref against current activity/level/seed and binds it once. Existing current question identity cannot be replaced. Host restores the title/content through `provider.restore(current.ref)`.
- `pauseRevisionSession(session)` / `resumeRevisionSession(session)` preserve current attempt/ref and confirmation state. A paused scheduler does not create Next attempts. `revisionAttemptId(session)` reads the current ID.
- `selectPracticeQuestion({session:PracticeSession,provider:QuestionProvider,seed,summaries}): {session,question,ref} | null`. Fixed-level uses its target. Mastery uses only genuine levels; missing summaries are empty/unmastered, never false completion. All supported levels mastered yields null. Provider selection receives previous IDs; restore must reproduce the exact returned ID/seed/level. The result session contains identity/history only, never full content. Host supplies fresh attempt IDs separately and persists target/history with the resulting attempt.
- `selectCurriculumTargets(registrations: readonly CurriculumRegistration[],course,selectedGemIds)` returns all registered genuine target levels, preserving supplied gem IDs. `topicTargets(registrations,course,topicId)` implements topic ADD ALL. `validCurriculumTarget(target)`, `supportedCurriculumLevels(target)` and `sameTarget(a,b)` use source-owned scope IDs, never UI order.

## Source rules retained

Original A-level and IGCSE clocks are outside this owner; timing is carried by the host's attempt/repository. Source mastery and scheduling logic is retained in `source-golden.json` with SHA-256/bytes for five original JS inputs and 273 cases covering all sixteen settings / 41 supported levels. Both original scheduler files have identical source fingerprints; six transitions capture their exact deficit/rotation/failure logic.

Initial secure revision needs one independent confirmation if its last evidence is at most seven completed whole days old, two if **floor(days) > 7**. A confirmation expires after **exact elapsed time > 7 days**, or as soon as the supplied mastery summary is no longer mastered. The difference between these recency calculations is deliberate source behaviour.

An independent score1 increments the confirmation streak. Any other result resets it; a failed/assisted check becomes practice requiring two independent successes. Confirmation additionally requires the updated mastery summary to be mastered. A duplicate attempt never contributes a second streak, first outcome or additional evidence. Hints/reveals/non-independent results cannot confirm revision.

The host must commit first attempt/evidence through the repository, derive updated summaries, then call scheduler accept with those summaries. For assistance/reveal, submit the non-independent outcome to the scheduler without inventing independent evidence. No learning-review override is a scheduler outcome.

## Validation

From the workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/s1/session/capture-source-golden.mjs
node --test apps/Masters-of-Chemistry/validation/s1/session/session.test.mjs
node apps/Masters-of-Chemistry/node_modules/typescript/bin/tsc -p apps/Masters-of-Chemistry/validation/s1/session/tsconfig.json --noEmit
```

Golden capture reads originals into isolated VM memory stores only. The default test reuses the retained golden, checks its original hashes, and does not regenerate it. Eight tests pass; the focused strict compiler is clean. Initial full-project checks only reported not-yet-created foreman integration modules, with no errors in this owner's modules. Full-project type/build and the protected-app fingerprint check remain foreman integration gates.

## Required real-browser integration scenarios

The foreman-owned foundation harness must use the actual attempt controller and actual repository in a new synthetic namespace. Pure-model tests do not establish browser acceptance.

1. Select a topic ADD ALL in each course for genuinely enabled harness adapters. Verify every supported level of those adapters and no unavailable provider is offered. The domain metadata fixture counts all source-backed A-level24 / IGCSE17 target levels; that does not claim their full banks are migrated or available in S1. Energy has levels1/2, ionic diagrams1/2, titration2/3, C3L6 none.
2. Launch revision; scheduler chooses deficit/level order and host loads the same QuestionPlayer as practice directly. Verify provider question title/ID/seed and chosen level transfer.
3. Assess an independent answer and save its actual first evidence. Recompute summaries before accept. A secure one-confirmation state can confirm; an old secure state needs two independent confirmations.
4. Hint/reveal, correction retry or post-assessment equivalent-wording review cannot create confirmation/evidence. Duplicate save/accept preserves the first result and timing.
5. Pause/checkpoint, reload from IndexedDB, resume: same current attempt/ref/drawing/response and timing. Next produces a new attempt ID, retains previous identity for provider selection and rotates to another incomplete gem where available.
6. Teacher/review and C3L6 do not call curriculum scheduler/evidence. Inspect actual stores/statistics alongside rendered UI; challenge completion remains separate.

Requested model/effort: gpt-6.1-sol/high. Effective runtime model/effort and actual usage are not exposed; recorded as unknown.
