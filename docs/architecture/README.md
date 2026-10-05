# S0 architecture and contract decisions

> Evidence retirement (5 October 2026): historical validation reports, screenshots and acceptance records were deleted by user request after executable dependencies were migrated. Remaining `validation/` path names and past test counts describe historical records, not present files or fresh acceptance. See [validation cleanup](../maintenance/validation-cleanup.md).

Run `MASTERS-REACT-20261002`; job `S0-CONTRACTS`; owner A03. This is the interface baseline for the new project. It authorises no later stage, deployment, new curriculum or enabled prototypes. Root accepts stages; the foreman owns aggregation and integration. Requested model/effort: gpt-6.1-sol/high; effective runtime and usage are not exposed.

## Boundaries

`src/contracts/index.ts` exports types only. The eight small modules separate stable identity, chemical editor data, questions/marking, attempts/timing, curriculum sessions/mastery, Olympiad completion, registration and repository access. They import no React, DOM, storage or old-page scripts. Old apps remain read-only evidence. The React player mounts directly in practice and revision; no page, iframe or bridge wrapping is an implementation strategy.

| Implementation module | Responsibility | Must not own |
|---|---|---|
| `src/catalogue/` | Exact explicit 12 registrations, gem/level configuration, course navigation and release selection | Bank-order IDs, chemistry, evidence writes |
| `src/activities/<course>/<activity>/` | Complete fixed bank/generator families, checked chemistry, source ID restoration, purposeful scaffolds | Own timers, persistence, revision scheduling |
| `src/domain/attempt/` | First response, first assessment, assistance, pure transitions; one controller | Chemistry algorithms, storage implementation, independent mastery writes |
| `src/domain/timing/` | Monotonic clock, visibility/focus/suspension and idle cutoff | React lifecycle identity creation |
| `src/domain/session/` | Practice/revision selection, scheduler-controlled Next and confirmation | Olympiad completion, chemistry |
| `src/domain/mastery/` | Course adapters preserving mathematics and historical aliases | Student UI, mutable first evidence |
| `src/persistence/` | Dexie transactions, validation, deduplication, graceful failures and read-only legacy import | Rendering, scheduling decisions, writes to old keys |
| `src/ui/`, `src/shell/` | Shared React player/components, Zustand view selectors, course shells, accessible editor frames | Independent scoring, timing or storage |
| `src/editors/<kind>/` | Checked chemical engine plus React editor adapter, semantic edits and accessible interactions | Legacy page state, prototype registration |

Activities use the same player and first-assessment engine. Chemical marking is a pure `Question + Responses -> MarkingOutcome` function. A rejected submission (blank, invalid numeric input, malformed serialized graph) produces no assessment and does not stop independent time. An intact chemically incorrect graph is assessable wrong. Raw marks and mastery scores are separate: retain chemically meaningful marks, then apply the original activity mapping. The [S1 attempt implementation](s1-attempt.md) documents the published refinements and source-required drawing review.

## Source-dependent decisions

All paths and SHA-256 hashes are retained in `source-evidence.json` (retired historical evidence; former path `../../validation/s0/contracts/source-evidence.json`), with the relevant symbol/section. These are representative architectural evidence; the inventory worker owns whole-scope coverage.

* **Acid calculations:** the active path is `levels-app.js` plus `AcidBaseLevels` in `levels.js`, not the old `app.js` path or 33-template legacy core. The active provider covers 38 templates/five active gems. It accepts all required numeric answers before assessment and retains source `0/0.5/1` mapping, `dp2` absolute tolerance (0.0051), scientific input parsing and level-specific fading support. Source AB2 codes encode the fixed source template index, level and seed. Preserve those codes and historical resolver; new display order must not redefine them. `ProviderCoverage` distinguishes full fixed IDs from generated template families.
* **Electron configurations:** active `levels-app.js`/`levels.js` uses group and representation eligibility, level 3 matching, and eight subshells through 4p. The editor preserves counts, noble-gas core, up/down/paired spins, identity and matching selections; core validation still checks Hund/Pauli, electron totals, Cr/Cu exceptions and 4s removal before 3d. The general choice/text controls can compose with the editor; a bank/generator adapter must preserve current selection diversity, not shrink to one example.
* **Dot-and-cross:** atom anchors have eight slots; bond anchors have six. Electron provenance includes dot/cross/triangle. Charged bracket groups reference atom IDs. Coordinates are user drawing data, while chemical checks derive bonds, symbols, lone pairs and charge separately. `EditorPart` correlates `kind` with exact editor state. Passing a molecule graph where an energy profile is expected is a compile error.
* **Explanation comparison:** only levels 2/3 are registered. Level 1 table/dropdown code is dormant support and must not be enabled. Level 2 separates bonding/structure/property for both substances plus a comparison; level 3 is an open explanation. Both explanation levels freeze the joined text before sequential self review. A met mark requires a precise text range, not a checkbox. Reject text and valid alternative wording remain in the rubric. `rubric-review` holds the frozen response and finished timing but no final assessment. Finishing rubric judgements records self-assessed marks, never automatic text marking.
* **Energy profile:** preserve reactant/product/peak heights, axis/species/pathway labels and activation/enthalpy arrows with anchored or temporarily free ends. Repair/catalyst/profile tasks have different checks and scaffolds. Do not replace this with a generic drawn polyline.
* **Energetics practical valid alternatives:** `core.gradeQuestion` distinguishes automatic correctness from displayed correctness after explicit equivalent-wording self review. Override is permitted only for nonempty free text that failed automatic matching and passed any correction prerequisite, never options/multiselect or a gated replacement. First automatic result stops timing and is saved once before overrides. `PostAssessmentReview` and `review-valid-alternative` retain the later learning decision/marks separately; they cannot replace first score, restart time or create mastery evidence. Model answer/rubric support is attached to eligible marked points; `LearningReviewPolicy` applies the source eligibility checks. This differs from an explanation's pre-result sequential self rubric.
* **Energy text classification:** source `markField` returns correct/incorrect/empty/unknown, mapped to accepted/rejected/empty/unrecognized. Empty/unrecognized text rejects submission, preserves the response and offers wording/teacher support; it is not silently counted as incorrect or accepted through a new invented automatic override. `MarkingIssue` retains this distinction and rubric support. A recognised incorrect answer produces an assessment normally. Any later valid-alternative learning review remains distinct from immutable first evidence.
* **Titration:** preserve before/after curve selection, initial/final pH, equivalence volume and indicator. Pure source functions retain charge-balance/additive-volume assumptions, ideal concentrations, Kw at 25 °C and accepted indicator alternatives. Curve selection/data is not a screenshot snapshot.
* **Molecular editor:** reusable dependency has numeric atom IDs, element/charge/explicit hydrogen data, atom coordinates, bonds and bounded graph undo history. Optional annotation fields use source numeric dipoles, lone-pair angles and chemically attached arrows. Their serialization is retained to prevent data loss; this does not enable the molecule/mechanism prototype. Valence and exact labelled graph equivalence remain distinct from display coordinates; aromatic/resonance normalisation is not silently added.
* **C3L6:** introduction → correct classification part (a) → seven part (b) unit checks → individual part (c) structures. B unit `b-iii` supports interchangeable E/F. Completed drawings become read-only; stale checks must be revalidated against their saved graph fingerprint and chemical answer. This is a challenge-specific controller, not curriculum attempt evidence. Only `C3L6Progress` stores completion/drawings; its type forbids gems, mastery, score and revision. Its registration is Olympiad-only and cannot be a `CurriculumTarget`. Its provider returns a typed `C3L6Challenge` (introduction, reaction classifications, grouped hydrolysis slots, reaction network and accepted molecular alternatives) and `C3L6Policy`; it has no artificial curriculum level or timer.

## First evidence, timing and restoration

State is readonly at the boundary. Reducers create new state and never mutate `firstResponse`/`firstAssessment`. Runtime guards must enforce immutability/idempotence; TypeScript alone cannot prevent a caller from forging JSON or performing an unsafe cast.

1. A student attempt gets one stable attempt ID and a provider-produced `QuestionRef` (activity, original question ID, seed, supported level). Teacher/review uses `PreviewAttempt` and has no persistence entry point.
2. Normal responses/editor data change under `currentResponses`. Built-in `Scaffold` support is level-specific and differs from append-only requested `Assistance`.
3. First accepted assessment freezes responses, assistance and validated timing. Rubric submission freezes before review; reveals finish answering and remain explicitly assisted. There is no score for a reveal masquerading as an independent response.
4. Corrections/retries update current response for learning but preserve frozen evidence. Reload restores the same ID, responses, first evidence and timing. Next alone starts a fresh attempt; remount/effect reruns cannot do so.
5. Store question reference and user data only. Restore question content through the provider. Never store a full `Question`, content snapshot, DOM or image of the answer.

`ActiveClock` receives explicit monotonic/wall/visible/focused/suspended samples. The source excludes frozen event loops over five seconds, idle intervals after the deadline, hidden/background time and pauses. Restore only a checkpoint matching attempt ID and idle limit. The source allowance domain is 1/3/5/10 minutes. A Level acid template work uses the reviewed map; electron build/matching uses three minutes, identify one; dot/cross uses three/five by level; titration uses ten. Current IGCSE wrapper uses three minutes. Any allowance revision needs activity evidence and documented rationale, not a count of visible fields. Historical untimed records remain untimed.

## Curriculum evidence and mastery

A Level stores `level`; IGCSE stores `grade`; the union prevents substitution. Preserve original IDs, dates, scores, missing response/timing details and known historical leaf aliases. A Level former covalent diagrams canonicalise to the current dot/cross leaf; legacy Ka/pKa and old acid progression remain historical, without seeding the revised active acid progression. Imports retain source provenance and read old keys without writing them. The excluded recall game's data must never be imported.

Both current courses use a zero-prior recurrence over oldest-first scores:

`decay = 2 ** (-1 / halfLife)`; `value = value * decay + score * (1 - decay)`.

Mastery requires strictly greater than the configured threshold (0.8 in the inspected source), not `>=`, and empty evidence returns null. Half-lives and supported levels come from each course/gem configuration, never a guessed universal default. Revision retains lowest unfinished eligible level, deficit/level ordering, no immediate same-gem repetition when alternatives exist, expiry after seven days and one/two independent pass confirmations as in `test-mode-core.js`. An assisted result can advance learning navigation but cannot extend independent evidence or confirmation streaks.

## Repository contract and error handling

`saveCurriculum` transactionally saves the current attempt, optional first evidence and optional scheduler state. Compound identities are course/profile/attempt; identical repeated saves return `already-present`, while a differing immutable record for the same identity returns `conflict`. The repository validates matching namespace/course/target/ref/session and first-evidence fields before committing. It must not silently replace evidence or merge conflicting first responses. Session-only pause/navigation saves are explicit. Olympiad has separate storage/methods and never appears in curriculum history/statistics.

`RepositoryResult` exposes unavailable/quota/conflict/invalid-data. A visible save failure preserves the in-memory work and supports retry; it must never show a false saved state. Import validation produces `ImportBatch`; dedup uses namespace plus original attempt identity, and source fingerprints provide repeated import receipt identity. No backend, migration marketplace, generic event bus, event-sourcing or speculative content versions are introduced. Retained legacy source formats/fingerprints are data provenance, not new application version infrastructure.

## Compiler, packages and verification

S0 uses the foreman's TypeScript 5.9.3 with strict/noUnused/exactOptionalPropertyTypes/noUncheckedIndexedAccess, ES2022+DOM and Bundler resolution. Contracts have no runtime packages. S1 installs only pinned React/React DOM, Vite, Zustand, Dexie and relevant compiler types within the selected stack, inside this new project. Foreman exclusively owns package/lock/tsconfig/config/scripts.

Prefer Node's built-in test runner for pure domain/repository fixtures; on the available Node 24 use native `.ts` stripping with explicit `.ts` runtime imports and foreman-owned `allowImportingTsExtensions: true` in no-emit configuration. No test-framework package is necessary. JSX/editor interactions are checked through real browser builds with the pinned read-only workspace Playwright dependency; test outputs stay here. Dexie integration tests require actual IndexedDB in the browser, including transaction rollback and failure injection; in-memory repository tests alone are insufficient. Browser tests use synthetic profiles only and must never touch old browser keys.

Commands at the S0 boundary:

```powershell
cd apps/Masters-of-Chemistry
npm.cmd run typecheck
npm.cmd run test:s5
```

The retained compile fixtures exercise all response/editor families, rubric freeze/review, reveal outcomes, historical missing timing, C3L6 dependency data and forbidden cross-boundary assignments. The read-only reference check verifies 38 active acid templates, exact source AB2 regeneration and C3L6 slot IDs; it hashes 25 representative sources. This is not complete migration validation, chemistry acceptance or browser acceptance. Later owners must verify their full banks/generators, rendered chemistry, course-supported levels and runtime semantics.

Historical S0 clarification added compile fixtures and corroborating source reports. Its standalone validators and reports were retired. Current retained regression suites cover assessment/evidence boundaries; run `npm.cmd run test:s5` alongside typecheck.

## Open implementation checks (not scope decisions)

* S1 foreman must reconcile interfaces with S0 inventory, then root accepts before dispatch.
* Provider adapters enforce unsigned 32-bit seeds, supported levels, ID consistency and complete coverage. Strings/numbers intentionally preserve legacy IDs instead of introducing opaque wrappers; runtime validation is mandatory.
* Record validators enforce text-range bounds/content, graph referential integrity/limits, rubric sequence, marks/totals, assistance and legal phase transitions. Readonly types do not establish chemistry correctness.
* Do not ship the illustrative explanation fixture as bank content; source-owned complete rubric and seven-section level 2 layout belong to S2.
* Shell budget, cross-prefix releases, compatibility links, accessibility, genuine browser timing and imports remain later-stage gates. No rendered S0 resource or full runtime is claimed.
