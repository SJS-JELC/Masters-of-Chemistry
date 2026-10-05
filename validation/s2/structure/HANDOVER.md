# S2-STRUCTURE implementation and validation

Job S2-STRUCTURE, worker A09, run MASTERS-REACT-20261002. Requested model/effort gpt-6.1-sol/high. Effective runtime model, actual usage and costs are not exposed; no measurements are invented. No child delegation.

## Implementation

Only `src/activities/igcse/structure-and-bonding/**` and `validation/s2/structure/**` are owned/written. Both original applications are read-only. No original build, hydration, dependency installation, browser storage or Git changes were performed. Shared contract/UI/input refinements and production registry/host changes were proposed to and implemented by A01.

`index.ts` exports `structureAdapter:CurriculumAdapter`. Its provider and marking policy load lazily and are independent of React, the DOM, time, persistence and revision. The shared player is used directly. No legacy page/script wrapper is imported. No checkbox rubric replacement or fixture bank is used.

All nine original comparison records and all 44 point texts/exclusions are preserved exactly, with 18 original SBC review IDs. Level 2 retains seven structured sections (two sets of bonding/structure/property plus a final comparison), including the original short-input/long-text distinction and property-specific help. Level 3 retains the original single open-response section. Root/foreman clarified that the seven-section requirement applies to Level 2; introducing seven sections at Level 3 would change source pedagogy. Nine Level 1 teaching tables remain in `dormant-level-one.json`, outside runtime imports; selection/restoration explicitly reject Level 1.

Historical public review IDs resolve through `resolveLink`; original saved source IDs restore with their supplied level. Identity and unsigned 32-bit seed roundtrip without full runtime question snapshots. Stable IDs come from accepted S0 inventory and are independently checked against the original source hash utility. Source/policy fingerprints and extraction counts are retained in `source-fingerprints.json`.

The adapter refuses to claim automatic marking for a written explanation. The shared controller validates completeness, freezes every exact word before rubric review, and links met marks to actual ranges in that frozen text. The source score mapping is all marks → 1, some → 0.5, none → 0. The original idle allowance is 180000 ms and ends at response freeze, before self-review. The shared host owns the only clock/repository/session/controller. Teacher/review/reveals cannot create independent evidence.

## Reproducible commands

Run from the workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/s2/structure/extract-source.mjs
node --test apps/Masters-of-Chemistry/validation/s2/structure/structure.test.mjs
node apps/Masters-of-Chemistry/node_modules/typescript/bin/tsc --noEmit -p apps/Masters-of-Chemistry/tsconfig.json
node apps/Masters-of-Chemistry/validation/s2/structure/browser-checks.mjs
```

Extraction regenerates only the activity-owned source/data and validation provenance. Source files are read as UTF-8. The browser command requires the foreman-owned Vite host already running on 127.0.0.1:5181, workspace-pinned Playwright 1.62.1, and installed Edge. It uses a unique new-project database and an owned browser profile. It never visits the original apps. Native visibility/180000 ms idle verification is assigned to independent A07 in `validation/s2/review-native/`; ordinary Playwright browser focus emulation cannot establish that gate.

## Validation evidence

- `structure.test.mjs` and `tests.txt`: six passing suites. Independent original VM equality, all18 IDs/seeds/routes, exact guided helpers/marks/rejects, dormant data, missing/short input gate, zero/partial/full self-review for every comparison/level, pending-review restore, out-of-order/incorrect-range rejection, immutable time/evidence, and reveal/teacher exclusion.
- `CHEMISTRY-REVIEW.md`: substantive review of every comparison, pedagogical distinctions, official curriculum reference/date, valid wording and source model boundaries.
- `browser-checks.mjs` / `browser-results.json`: four ordinary browser scenarios PASS on actual production host/controller/clock/Dexie/session, Edge 154.0.4258.48. Desktop/mobile screenshots, native keyboard selection and exact offsets, draft/pending-review reload, practice/revision/teacher/historical review, immutable first timing and fresh Next identity. All 18 historic codes rendered with every source rubric point at both levels. Native idle/background proof is explicitly pending independent A07 evidence, not claimed by these headless checks.
- `browser-launch-initial.json`: first Chrome CDP connection failed before activity checks. A01/A07 identified a concrete GPU launch failure and assigned independent native verification. No repeated native launches were attempted by A09.
- `browser-results-ordinary-initial.json` and `*-failure.png`: ordinary initial checks reached successful persistence/rendering, but immediate React history snapshot assertions raced a render; the mobile writer also assumed every dormant table had a Structure row. One bounded validation-only retry waited for actual saved-history settlement and used the original Arrangement row fallback. Four scenarios then passed, with zero page errors. No activity/shared source was changed to obtain PASS.

Visual inspection: A09 opened six captured desktop/mobile writing/evidence/open-response/review/rubric screenshots. The two substance groups retain four short inputs and three long controls, stack correctly on mobile, and preserve complete prompts and exclusions. Exact evidence quotes and model rubric text are legible. There are no horizontal collisions or missing sections. Long Ctrl+A evidence produces a correspondingly long quote; precise offset selection is available and tested. A minor shared host separator currently appears as `? Level`; A01 was notified to correct its UI label during the next shared mutation window.

Browser status and visual inspection outcomes are recorded after completion; no PASS is inferred from the existence of this handover. The foreman performs shared diff/registry/build integration and protected-app checks. Root owns stage acceptance. S2 does not authorise S3 or publication.

## Final disposition

Owned implementation, source/chemical review, six domain suites, four actual-host ordinary browser scenarios and six rendered inspections PASS. Strict whole-project typecheck was run again successfully after the final shared mutation window. `output-fingerprints.json` records the five final activity-owned files. `completion.json` uses ESCALATE solely for the external native gate: A01 reports independently retained A07 source180000 ms idle/background/suspension/restore evidence, with the independent first-assessment/reload/Next tail still completing. The foreman attaches the final A07 disposition before stage acceptance; A09 does not invent its results. Earlier screenshots showing the shared `? Level` separator are retained as before-fix evidence after A01's correction; final prefix screenshots belong to foreman integration.
