# Masters-of-Chemistry implementation contract

The machine-readable scope is `project-contract.json`; root alone owns its revisions. This document supplies the implementation decisions and stage gates. No stage authorises deployment. The original apps are read-only references, never build targets.

## End state

One self-contained project here with shared React/TypeScript modules and separate A Level/IGCSE static builds. Keep the checked chemistry, IDs, supported levels, mastery weighting/thresholds and meaningful learning scaffolds. Redesign navigation, controls, feedback, revision and statistics consistently using the existing brand, eagle/gems and Comfortaa. Curriculum data, source artefacts and executable browser content stay separate. Import only needed runtime content and preserve provenance.

C3L6 2012 Q2 stays in the Olympiad strand with its introduction, linked structures, sequential stages, molecular editor and saved completion. No mastery labels, gems, revision selection or mastery/statistics evidence. Rocket Recall is completely absent from the new runtime and imports. The standalone molecule-builder prototype is not enabled; its checked editor/graph dependencies may serve C3L6. Other unpublished drafts are out of scope.

## Architecture

Agree exact modules and typed contracts in S0 before dependent workers start. Use source-owned shared modules, not external runtime packages/CDNs. Minimum boundaries: course catalogue; content and seeded question generators; React-free marking/chemistry; attempt reducer/controller; session scheduler; React components/editor surfaces; persistence repository. React, TypeScript, Vite, Zustand and Dexie are the selected stack. Keep APIs small and explicit; no generic plugin marketplace, microservices, event-sourcing infrastructure or speculative backend.

One registration supplies stable activity/gem IDs, supported levels, content provider, interaction renderer, marking policy, idle allowance and release availability. Catalogue display order cannot determine stable identity. Practice and revision use the same question player directly. Remove iframe bridges, DOM-derived titles, global page CSS/state and independently implemented mastery saving.

Fixed content and deterministic generators produce a common composable question model. Normal response controls: choice (single/multiple/dropdown), short text, numeric, extended explanation, selected text/correction, diagram selection. Specialist editors: electron configuration, dot-and-cross, energy profile, titration curve, molecule. Keep distinct chemical validators and purposeful spatial layouts; share interface conventions and editor frames. Existing validated engines may be extracted, but an unchanged whole legacy page/script hidden behind React is not a migrated activity.

Store question IDs and seeds, current answer/editor state, first response/assessment, assistance and timing; no full question-content snapshots. Different responses or retries do not mutate first evidence. Use IndexedDB transactions, stable attempt IDs and course/profile namespaces. Handle storage failure explicitly and deduplicate repeated saves/imports. Legacy data may be read/imported but never modified; absent historic timing/response details remain absent. C3L6 completion is stored separately from curriculum evidence. Ordinary stats derive from curriculum assessments, not from game/challenge completion.

Shared active timing retains the tested algorithm and documented question-appropriate idle limits. Stop at first assessment; rubric self-review is after independent timing. Keep timing independent of React render loops, and ensure effects/remounts cannot create attempts or duplicate evidence. Treat built-in level scaffolds differently from extra hint/reveal assistance. Preserve raw meaningful marks plus existing mastery-score mapping. Teacher/review modes never save pupil evidence.

## User experience decisions

Standardise typography, spacing, colour meaning, headers, progress placement, question codes, navigation, save status, explicit teacher preview, Check/Next controls and feedback panels. Use compact, multipart and workspace layouts, not one fixed card geometry. Ordinary flow: respond, check, feedback, optional worked answer/correction, next. A reveal can end independent answering without requiring a meaningless guess; assistance cannot later be erased. Freeze written responses before rubric marking. Preserve meaningful all-parts/step submission, C3L6 dependencies, scientific rounding/acceptance rules and subject-specific editor models. Do not reinterpret a self-assessed explanation as automatically marked.

Use CSS tokens/modules and the licensed brand font. Provide keyboard, touch and non-drag alternatives, readable formulae and responsive workspace layouts. Lazy-load activity code/banks/editors and statistics. Render high-frequency editor gestures locally; checkpoint meaningful edits rather than persisting every pointer movement. The initial shell JS gzip budget is 204800 bytes, to be measured rather than claimed. Profile on a documented throttled browser plus available real-browser surface. Offline downloads and accounts are deferred; provide a replaceable repository boundary, not an unfinished backend.

## Delegation and work packages

Root is active runtime parent; its model/effort must be reported as unknown if not exposed. One foreman and every worker/reviewer request gpt-6.1-sol/high with narrow forks. Foreman owns direct-child lifecycle, integration, progress state and log. Workers never spawn children. Initial S0 staffing: two workers. Later maximum: six implementation workers plus two genuine-exception reviewers; root+foreman totals at most ten of the available twenty-six slots. Do not fill slots without independent ownership.

Use stable IDs/job IDs, explicit files, dependencies, necessary source evidence and completion manifests. Foreman exclusively owns shared integration files unless it assigns them to one worker. Workers may not change scope or contract; propose interface changes through foreman/root. One clarified retry for a bounded failure, then a substantive disposition/review instead of blindly repeating. Reuse bounded relevant contexts; replacements receive new IDs. No model substitutions. No invented usage measurements or token budgets.

Root initialises .codex/swarm-status.md preserving the completed predecessor. Foreman is sole writer during each stage, with five-minute truthful progress entries. The stage is the authorised queue: foreman returns a final aggregate and stops dispatch, allowing root to review before the next stage. Root waits silently when it has no independent work. No user approval is needed between accepted internal stages.

## Stages

### S0: baseline and typed contracts

- ROOT: scope contract, protected-app baseline, control files and goal.
- S0-INVENTORY: exact activity/content/level/ID/marking/editor/storage coverage, reference sources and validation map. All twelve activities; distinguish active and legacy/dormant code. Record pedagogical exceptions and dependencies.
- S0-CONTRACTS: minimal compilable typed interfaces, module/ownership map, implementation/test design and package strategy. No full UI implementation before root gate.
- Foreman: reconcile inventory with interfaces, propose exact next-stage work packages and return S0 report.
- Gate: full coverage, no excluded functionality, coherent interfaces, protected-app PASS, source evidence supporting choices. Root accepts/revises before S1.

### S1: shared foundation

Up to four workers: shell/design/components; attempt/active timing; persistence/import primitives; session/mastery. Define ownership before dispatch. Foreman owns dependency lock, registration aggregation and integration unless explicitly assigned. Gate: two shells run; representative fixtures exercise saving, first assessment, restoration, revision and equivalent mastery. All shared diffs reviewed by root.

### S2: representative activities

Three workers: A Level acid calculations; IGCSE structure-and-bonding explanations/rubric; A Level dot-and-cross. Keep genuine chemistry and pedagogical checks with each owner. Gate: complete original content/generator/level coverage, meaningful tests and actual rendered/interaction verification for standalone/revision/teacher modes. Fix architecture exposed by pilots before scale.

### S3: remaining activities

Six coherent groups: (1) A Level electrons-bonding and electron configurations; (2) IGCSE calorimetry and bond enthalpy; (3) IGCSE energy-enthalpy and energetics practical; (4) A Level titration curves; (5) IGCSE dot-and-cross reusing shared editor; (6) Olympiad and C3L6. Shared code changes have a single owner. Gate: all twelve migrated, checked content/levels present, no wrappers, educational differences preserved and complete browser evidence.

### S4: integration and authoring

Finish cross-course statistics, all supported historical imports and compatibility links, checked independent releases, activity scaffold and development component catalogue. Prove adding one representative generated/fixed family needs no timing/storage/revision changes; do not add unsolicited student-facing content to the release. Gate: both builds complete, all contract requirements mapped to validation, root accepts authoring proof and course UX.

### S5: verification/fixes

Separate Sol validation assignments inspect cross-course runtime behaviour, chemistry/regression/coverage and final rendering/performance/accessibility. Authors fix failures; root inspects relevant shared diffs and representative final browser outputs. Port registration/active-question-time gates without editing originals. Test URL prefixes, direct refresh and old supported question links. Check no Rocket assets, Olympiad isolation and original-app fingerprints. Final report must distinguish passed, blocked and untested checks. Goal complete only when every requirement and stage is accepted with evidence.

## Durable progress and completion

progress.json stores stages/jobs/requirement acceptance and evidence references. The foreman records worker results but only root sets stage accepted and requirement final acceptance. Read files and reconcile evidence after resume/compaction. Do not trust an orphan PASS or mark work complete because children exited. Preserve failures with their accepted fixes and actual test results. No claim of complete based only on a green build or component count.

Deliver reproducible commands, both course builds, authoring documentation, retained provenance, screenshots/browser checks, original-app integrity report and final handoff. Continue through fixes within scope; escalate only genuine consequential decisions/external blockers.

## Authorised addition: Olympiad 2011 Q4 (3 October 2026)

The user-approved plan in `olympiad-2011-q4-contract.md` adds the seven-box NMR
challenge to the current React app. The active scope is thirteen activities.
This supersedes earlier no-new-activities/prototype exclusions only for this
addition, including the component-fidelity contract boundary. All other current
identity, UI, preservation and publication requirements remain in force. The
addition has separate progress/evidence; do not rewrite earlier stage acceptance.

## Authorised addition: Recall hub (4 October 2026)

The user requested the approved standalone flashcard table as a brain-icon Recall
tile in both course hubs. `recall-contract.md` records this separate platform view,
starter content, retained self-marked behaviour and acceptance checks. This
supersedes the prototype exclusion for the shared Recall view only; developer
fixtures and the former Rocket game stay excluded. No new assessed activity or
gem registration is introduced. Publication remains outside scope.


## Authorised addition: Explaining Properties (4 October 2026)

The approved `explaining-properties-contract.md` adds 32 questions at Levels 1 and 2 to the React app. Current scope is fourteen activities. The new explicit gem identity preserves historical Dot-and-Cross aliases. This amendment supersedes earlier no-new-activity exclusions for this addition only. The approved sequential direct-worker/reviewer delegation replaces the older roster for this addition. Preserve historical stage acceptance; retain new evidence separately. No publication.
