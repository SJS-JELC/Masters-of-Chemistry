# Rate Equations

## Additional formats (13 October 2026)

Fifteen additional configurations mix into the existing practice/revision pools. Eight new numerical templates each have100 distinct variants (800 additional numerical questions); the prior900 and historical refs remain reproducible. New numerical formats cover three-reactant deduction, pH and dilution rate changes, initial tangent rate, half-life versus concentration, successive-half-life order deduction, mixed table/graph evidence and inverse Arrhenius temperature. Three conceptual configurations use fixed reviewed pools: k-unit order, excess-reactant reasoning and graph recognition. Four fixed Level3 mechanisms require both full equations, accepting exactly ten original OCR step pairs. The unpublished structured-comparison templates at Levels1 and2 and their codes were removed at the user's request. Numerical order options appear in ascending order.

The eight-character namespace preserves the full uint32 seed (`seed *256 + slot`): new orders slots65–71, graphs81–85, reverse Arrhenius97. Prior slot meanings remain unchanged. Fixed mechanism aliases RE-00000J/K/L/M respectively identify NO2/CO, F2/NO2, Fe3+/I− and thiosulfate/H+, with seed0. The teacher catalogue lists44 permanent configurations. The mixed question has only Rate Graphs mastery ownership. Source metadata defines family, level and format; fresh template IDs are selected before repeating recent ones.

The dedicated mechanism parser accepts reviewed species, ASCII/Unicode notation, reordered species and compatible optional states. It checks atoms/charge per step, combined net equation and slow-step molecularity. Step2 must pair with the submitted permitted Step1. Scaled slow equations and invented balanced pathways are rejected. The IGCSE parser and shared ChemicalEntry are preserved; both typed drafts use the existing attempt persistence.

Static evidence plots regenerate from the ref. Initial tangent rate starts at t=0, with the existing optional tangent. Marker/tangent/Arrhenius extension settings use the existing workspace schema. Order deduction asks for k units separately, avoiding an answer disclosed by supplied units. Deduction variants use zero and first order only. Excess concentration held approximately constant does not demonstrate zero intrinsic order. Reverse Arrhenius models show ln(k), reciprocal Kelvin temperature, Kelvin and Celsius using273.15.

Evidence and teacher codes: `.artifacts/re-new-types/aggregate.json`, `HANDOFF.md`, `teacher-review-list.json`. Focused checks use `node --test --test-isolation=none scripts/tests/re-new-orders.test.mjs scripts/tests/re-new-graphs.test.mjs scripts/tests/re-new-mechanisms.test.mjs scripts/tests/re-new-arrhenius.test.mjs scripts/tests/re-new-types-integration.test.mjs`, `npm.cmd run typecheck`, and `node .artifacts/re-new-types/browser-check.mjs` against Vite5181. Extensive practice/revision/native-timing reruns remain deferred by the user. Historical immutable snapshot drift is retained; separate before-run hashes establish preservation without resetting the old fixture. Sibling apps remain read-only; no release, deployment or commit.

The combined React app owns one A Level Rate Equations activity with four gems,
each supporting Structured, Unstructured and Applications levels. The user
authorized main-app integration on12 October2026. Publication remains separate.

| Stable gem | Family | OCR Chemistry A |
| --- | --- | --- |
|`u6-t1-2-orders`|Orders & Rate Calculations|5.1.1(a–c)|
|`u6-t1-2-graphs`|Rate Graphs & Half-life|5.1.1(d–f)|
|`u6-t1-2-mechanisms`|Rate Equations & Mechanisms|5.1.1(i)|
|`u6-t1-2-arrhenius`|Arrhenius & Temperature|5.1.1(k)|

Source: `src/activities/alevel/rate-equations/`. The12 accepted prototype
question identities remain `RATE-POC-{family}-L{level}` internally; permanent
legacy display aliases use `RE-000001` through `RE-00000C`. Numerical families restore
from the source ID and uint32 seed; the three checked mechanisms use seed0.
These historical examples remain reproducible alongside the expanded numerical banks and fixed mechanisms below. Practical-method and scattered-data best-fit questions remain outside this bank.

### Teacher-reproducible generated codes

Generated questions now display `RE-XXXXXXX` (seven base-36 characters).
`identity.ts` encodes `seed * 16 + permanentSlot`, preserving the full uint32
seed. Slots 1–6 and 10–12 identify the existing numerical template/level pairs;
other slots are reserved and rejected. Never renumber or reuse assigned slots.
Seven characters are necessary to preserve all existing seeds. The three fixed
mechanisms retain `RE-000007`–`RE-000009` and seed 0.

Pupil headers, teacher views and statistics use the actual reference seed.
Teacher lookup accepts a generated code alone and restores its exact reference,
including numerical data, graph and answer. Conflicting explicit URL seeds or
levels are rejected. Old six-character aliases and source-ID links remain valid:
they default to seed 0 or use their explicit URL seed. Saved references, attempts,
scores and timing are not migrated or rewritten.

For future generators, a displayed code must reproduce the exact variant, not
merely select its template. Store permanent slots/configurations and the actual
seed, preserve previous code meanings, and test boundary seeds, malformed codes,
all templates/levels and teacher lookup round trips. Keep generation deterministic;
substantive content replacements require new identities. Do not silently change
historical variants or shorten codes by discarding seed information.

Focused check: `node --test --test-isolation=none scripts/tests/rate-equations-links.test.mjs`.
Practical-method questions and scattered-data best-fit editing remain deferred.

Practice and revision use the same QuestionPlayer, attempt controller, active
clock, scheduler and IndexedDB repository. All four registered gems supply
all three levels to topic ADD ALL. First independent responses, marks and time
remain immutable. Teacher mode produces no pupil evidence. Five minutes of idle
allowance supports the multipart numerical and graph work.

The graph workspace is an unmarked measuring aid. It persists only marker,
two pinned readings and the Arrhenius extension toggle, under the same attempt
ID. Curves and tangent geometry regenerate analytically. Drag rendering stays
local and checkpoints on release; keyboard/direct inputs remain available.
The gradient quotient appears only after assessment.

Typed rate laws and k units keep the checked bounded semantic parser: equivalent
factor ordering and supported powers are accepted; malformed input, wrong
species/case/orders and incorrect units are rejected. This is not a general
algebra parser. Formula digits remain subscripts; factor powers format as
superscripts. The source-reviewed fixed mechanism chemistry is unchanged.

Historical numeric rate gem IDs retain their old meaning in frozen Recall/atlas
provenance. No numeric redirect, historical score import, catalogue reinterpretation
or atlas migration is performed. Landing display slots explicitly map to the four
new semantic IDs.

## Reproducible checks

Run from the app folder:

```powershell
npm.cmd run typecheck
node --test scripts/tests/rate-equations-content.test.mjs scripts/tests/rate-equations-workspace.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node scripts/review_active_question_time.mjs
npm.cmd run build
node scripts/release-s4.mjs app
node scripts/validate-s4-release.mjs app
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5261 --strictPort
# In another terminal; RATE_APP_URL can override localhost5261:
node scripts/rate-equations-integration-browser.mjs
node scripts/rate-equations-integration-timing-browser.mjs
```

The timing browser uses real Microsoft Edge with a real300-second idle period.
Keep source unchanged during this measurement so development hot reload cannot
restart the clock. Generated screenshots, temporary browser profiles and reports
are disposable verification outputs. Durable preservation fixtures live in
`scripts/tests/fixtures/rate-equations-preservation.json`; they do not depend on
old validation trees. Browser timing reports distinguish real event-loop
suspension-gap verification from native operating-system suspend.

The development preview remains `?harness=rate-equations`, importing the same
production engines. Its own memory-only host is separate from pupil persistence.

## Bank expansion — 13 October 2026

Normal numerical selection now uses nine permanent RATE-EXP-{orders|graphs|arrhenius}-L{1|2|3} templates. Each template has100 distinct displayed variants (seed modulo100 chooses a bounded configuration), totalling900 numerical questions. The reference and displayed code preserve the entire original uint32 seed. Orders vary independent A/B concentrations plus readable comparison factors, orders and k. Each concentration level has100 distinct first-order curves from10 initial concentrations ×10 half-lives; marker settings also vary. Arrhenius uses independent gradient/intercept choices and four distinct temperature tables. Existing POC factories and their seven-character code meanings are unchanged.

The new generated namespace is RE-XXXXXXXX (eight base36 characters), encoding seed ×256 + permanentSlot. Slots17–19 identify expanded orders,33–35 expanded graphs,49–51 expanded Arrhenius; all other expanded slots are reserved and rejected. This namespace is distinct from the retained seven-character seed ×16 codec and six-character fixed/legacy aliases. Neither codec truncates the seed. Teacher, pupil chrome and statistics use these same identities; explicit conflicting URL seeds/levels are rejected.

Six new fixed mechanism questions use source-reviewed OCR June2018 H432/01 Q17(a) (Fe3+/I-) and October2021 H432/01 Q21(a)(ii) (acidified thiosulfate) at all three existing levels. Permanent aliases RE-00000D–RE-00000F identify iron/iodide; RE-00000G–RE-00000I identify thiosulfate. Fixed questions require seed0. Each level selects from its retained original mechanism plus both additions, avoiding previous question IDs when possible. No named chemistry is freely randomised. Charges inside concentration brackets are parsed independently from orders outside brackets; explicit ASCII polyatomic charge uses S2O3^2-.

Validation/handoff: .artifacts/re-expansion/HANDOFF.md and aggregate.json; teacher review codes: .artifacts/re-expansion/teacher-review-list.json. Commands use --test-isolation=none because this sandbox blocks Node child test processes. The focused suite has42 passing checks and one unchanged historical full-output fixture failure (all72 starting hash mismatches retained). The separate before-run preservation gate checks1236 current original outputs exactly. TypeScript and registration/timing wiring pass;15 isolated teacher renders were inspected. Extensive pupil practice/revision/native-timing browser reruns are explicitly deferred by the user. Protected-original baseline retains529 preexisting drift paths across1320 files; before/after changed-path sets match. No build, release, deployment or commit is part of this expansion.
