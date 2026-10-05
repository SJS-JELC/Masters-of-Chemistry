# S1 attempt implementation and shared contract refinements

> Evidence retirement (5 October 2026): historical validation reports, screenshots and acceptance records were deleted by user request after executable dependencies were migrated. Remaining `validation/` path names and past test counts describe historical records, not present files or fresh acceptance. See [validation cleanup](../maintenance/validation-cleanup.md).

Owner A03, job S1-ATTEMPT, run MASTERS-REACT-20261002. This document clarifies the accepted S0 boundaries; it does not enable an activity or authorise S2.

## Public modules and host responsibilities

`src/domain/attempt/index.ts` exports `transitionAttempt`, `createAttemptController`, `assessmentToEvidence`, `checkQuestionInput`, `checkEditorSubmission`, `checkMoleculeIntegrity`, and `parseScientificNumber`. `src/domain/timing/index.ts` exports `createActiveClock`, `browserClockSample`, `bindBrowserAttemptTiming`, `IDLE_LIMITS`, and `validTiming`.

The pure transition accepts `{question,state,command,policy,learningReviewPolicy?,sample,timingResult?}` and returns the existing typed `AttemptTransition`. The controller accepts `{question,state,policy,learningReviewPolicy?,clock,sample?}`. The host supplies an existing identity and matching checkpoint, restores content with its provider, queues transactional saves, displays save failures, and owns session Next. Controller construction and browser binding never create IDs. Teacher/review use `PreviewAttempt` and cannot enter the student controller or generate evidence.

Bind timing once per mounted attempt with `{controller,onCheckpoint}`; dispose on pause/navigation. It samples each second, queues changed checkpoints at five-second intervals, and checkpoints on hidden/blur/pagehide/disposal. Trusted input/keyboard/pointer/touch/wheel/scroll resumes timing; pointer movement without a pressed button does not. The host must dispose before changing identity. Nothing in these modules imports React, Dexie, a singleton store, or an old app page.

## Source-based refinements

* Automatic text parts optionally request `presentation: 'single-line' | 'multiline'`. Presentation never changes their marking policy. Evidence-linked explanation self review retains its separate part/response type.
* Curriculum `submission` is only `all-required-parts`. `dependsOn` contains `response-reference`, which identifies related responses without locking draft controls. Active acid scaffold rows and numeric calorimetry/bond fields are submitted together in the included sources. No speculative interim part assessment is implemented. C3L6 retains its separate challenge controller and staged dependencies.
* `EditorSubmissionCheck` distinguishes `ready` with optional chemical issues from `incomplete` or `malformed` with input issues. Empty required graphs, duplicate IDs, dangling endpoints, impossible serialized field shapes, and nonfinite coordinates reject before freezing. An intact excessive-valence structure remains ready and is assessed wrong by the chemistry policy. Disconnected or chemically incorrect drawings are not automatically labelled malformed. Each specialist editor keeps its actual typed payload.
* IGCSE bond-enthalpy Grade 3 requires drawing the displayed equation before calculating, then comparing it with the worked model after submitting the numeric answer. `drawing-self-check` carries explicit model content and criteria. First numeric submission freezes the original response/automatic marks/time into `drawing-review`. `confirm-drawing {partId,matches,at}` adds the source drawing point, creating one final `self-drawing` aggregate assessment. Numeric retries before confirmation cannot replace the original correctness vector. The source still maps all points correct to 1, some to 0.5, and none to 0; the injected course policy preserves that mapping.
* Explanation submission freezes all text and time before sequential judgements. A positive point requires an awaiting-evidence step followed by an exact, nonempty text range in the locked joined sections; negative judgement requires no fabricated range. Mixed automatic/explanation questions retain their original automatic marks until final aggregation. No included registered source mixes explanation self review with drawing self review; that combination is explicitly rejected rather than pretending to support a new review workflow.
* `review-valid-alternative` alters only post-assessment learning decisions and reviewed marks through its source policy. It cannot replace the immutable first response/result/time or produce a new independent record. Hint/reveal assistance before first assessment suppresses independent evidence. Built-in scaffolds are content, not assistance. Corrections and later support preserve first evidence.
* Legacy imports preserve optional source key/leaf/progression version and question/family/strand facts without constructing a provider reference or seed. Settings retain the source's active progression version. Session/mastery owners apply the approved version rules. These fields are limited to actual legacy provenance; they introduce no content-version framework.

## Clock semantics and historical gaps

The implementation preserves the original active-question-time deadline algorithm and 60/180/300/600-second allowances. Hidden, unfocused, suspended, backward-clock, or callback gaps exceeding five seconds stop accrual. Returning focus alone does not restart stopped timing; trusted interaction does. Checkpoint restoration requires the same ID and allowance. The controller rejects a mismatched clock/state rather than silently inventing another identity. Once submission/reveal is accepted, timing is immutable throughout rubric/drawing review, corrections, reload, and revisits. Completed historical records without validated timing stay untimed.

## Evidence and validation

### Root-requested correction Check refinement

`AttemptCommand` now includes `{kind: 'check-correction'}`. Once assessed, this marks only current automatic parts with the existing injected marking policy after question-aware input checks. It works after automatic assessment, mixed automatic/self-review assessment, or reveal. Explanation and drawing self-review parts and their responses are excluded from the policy call. A question with no automatic parts, or an attempt still answering/in pending review, rejects the command.

The accepted transition returns the exact same attempt state and optional ephemeral `CorrectionFeedback`: `kind: 'correction-learning'`, with either `status: 'correct' | 'wrong'` and raw `marks`, or `status: 'incomplete' | 'unrecognized'` and typed `issues`. Partial automatic work is `wrong` with its meaningful points visible. This result has no score, timing, independent flag, or saved-attempt field. The controller never invokes mastery scoring for it. First response, first assessment, frozen timing, valid-alternative decisions, and curriculum evidence remain unchanged.

The host forwards feedback to the player and returns before persistence/scheduler handling. The player clears it on edits; the host clears it on adopting/changing an attempt. Ephemeral feedback need not survive reload and cannot become stale saved evidence. This is distinct from the source valid-alternative learning-review decision, which still uses its own command/policy. Detailed root-fix evidence is retained separately in `validation/s1/attempt/root-fix/`; the earlier 19-test output and browser PARTIAL record remain unchanged. The expanded suite passes 25 tests, with six new correction scenarios and three additional negative type assertions (ten S1 assertions total).

Nine directly exercised source files and SHA256 hashes are retained in `validation/s1/attempt/source-evidence.json`; the accepted S0 and clarification manifests retain wider editor/rubric/legacy provenance. Native Node 24 TypeScript tests execute the actual legacy clock, active acid scorer, and IGCSE Grade 3 bond generator/mastery adapter read-only. Nineteen tests pass, including source-equivalent drawing true/false paths, scientific numeric input notation, immutable evidence, timing edge cases, malformed versus wrong graph, and sequential rubric constraints. Seven additional negative compile assertions pass under the shared strict compiler.

The integrated host uses the actual controller/clock/repository/session. Isolated Chrome 154 with pinned Playwright 1.62.1 passed six browser checks: pause/reload, first evidence/time freeze and fresh Next, a real 60-second idle cutoff, two-section sequential evidence-linked rubric, drawing aggregate freeze, and excessive valence assessed wrong. Four screenshots were inspected and show the corresponding saved states without clipped controls or missing feedback. These synthetic development fixtures are absent from runtime registration; they do not establish full source-bank/editor acceptance.

One browser observation remains blocked: actual hidden/background state. Headless and headed Chrome, real tab switching, disabling the automation focus override through a CDP session, and actual window minimisation still reported `document.hidden === false` and `document.hasFocus() === true`; window bounds confirmed minimised. No fake visibility setter or synthetic event was substituted. `browser-results.json` is explicitly PARTIAL, and failed observation runs remain retained. Deterministic background/suspension tests pass; final browser acceptance needs a usable actual background observation. The foreman/root owns that disposition. No original app, dependency, Git, or browser store was modified.

Commands from the new project:

```powershell
npm.cmd run typecheck
npm.cmd run test:s5
```

The original S1 browser recipe and reports were retired. Its earlier results and blocked observation are historical; fresh browser review must establish timing after substantive changes. No deployment is involved.
