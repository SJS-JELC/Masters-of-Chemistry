# Migration coverage inventory

Run `MASTERS-REACT-20261002`; stable worker A02 / S0-INVENTORY. This inventory is a source preservation baseline, not a new chemistry audit, a migrated activity or publication approval. Both source apps were read-only. No browser storage was accessed and no original build or content generator ran.

## Reproduce and verify

From the workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/s0/inventory/collect.cjs
node apps/Masters-of-Chemistry/validation/s0/inventory/collect.cjs check
node apps/Masters-of-Chemistry/validation/s0/inventory/run-reference-checks.cjs
node apps/Masters-of-Chemistry/validation/s0/inventory/test-acid-levels-ported.cjs
node apps/Masters-of-Chemistry/validation/s0/inventory/validate-source-models.cjs
node apps/Masters-of-Chemistry/validation/s0/inventory/build-docs.cjs
```

The original reference suite intentionally retains one failure: `test_acid_levels.js` assumes every U6 registration is acid and rejects the subsequently valid titration registration. The owned port checks the exact five acid leaves plus the separately registered titration leaf/levels, then runs the unchanged 15 mastery routes and 33 historical question fixtures. Its changes are only root resolution and that outdated assertion. No original test is edited.

The [machine manifest](../../validation/s0/inventory/coverage-manifest.json) contains one record per exact contract ID, supported level-to-source-ID lists, every bank array and family/template count, teacher/runtime entrypoint scripts, release inclusion, dependencies and source SHA-256/bytes. Per-activity `*-evidence.json` files retain source path/line/text for IDs, random seeds, marking, scaffolds, timing and storage. `identity-index.json` maps existing source keys to supported historical review IDs without using display order. No full generated-question snapshots are introduced.

## Exact scope

| Activity | Supported levels | Coverage |
|---|---|---|
| `alevel/acid-base-calculations` | 1, 2, 3 | 38 active V2 templates; 63 supported template-level routes; 33 legacy templates |
| `alevel/electrons-bonding` | 1 | 14 fixed questions |
| `alevel/electron-configurations` | 1, 2, 3 | 71 species; 36 atom entries; 4 representations; both directions + seeded matching |
| `alevel/dot-and-cross` | 1, 2, 3 | 91 fixed questions |
| `alevel/ph-titration-curves` | 2, 3 | 36 fixed questions |
| `alevel/c3l6-organic-reactions` | Olympiad stages only | 10 classifications; 12 B targets / 7 units; 9 C targets; 23 structure alternatives |
| `igcse/calorimetry` | 1, 2, 3 | 16 examples / 4 mastery families / 4512 teacher configurations |
| `igcse/bond-enthalpy` | 1, 2, 3 | 16 reactions / 2 mastery families |
| `igcse/structure-and-bonding` | 2, 3 | 9 fixed questions |
| `igcse/dot-and-cross` | 1, 2, 3 | 72 fixed questions |
| `igcse/energy-enthalpy` | 1, 2 | 54 fixed questions |
| `igcse/energetics-practical` | 2, 3 | 14 fixed questions |

**Exclusions:** Rocket Recall contributes no runtime, navigation, dependencies, release assets or imported progress. Original Rocket files are untouched. Dormant molecule-builder index/app, mechanism prototype, old acid portable/mastery pages and electron legacy pages are not activated. The shared checked molecule core/layout/editor/styles required by C3L6 are dependencies, not an additional activity. C3L6 has no gem, curriculum revision, mastery score or curriculum timing/statistics evidence.

## Source and level decisions

### alevel/acid-base-calculations

- Entry: `apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/index.html`. Active scripts: `../../assets/site-version.js`, `../../assets/question-review.js`, `../../assets/alevel-mastery.js`, `../../assets/active-question-time.js`, `data.js`, `core.js`, `levels.js`, `../../assets/test-mode-bridge.js`, `levels-app.js`.
- Leaf IDs: `u6-t1-1-2`, `u6-t1-1-3`, `u6-t1-1-5`, `u6-t1-1-7`, `u6-t1-1-8`. Levels: 1, 2, 3.
- Source ownership: levels.js active V2 appended module; data.js/core.js carry legacy generator and compound constants; scaffold.js checked helper. mastery-src, mastery.html and app.js are legacy/support, not released entrypoints.
- Identity and seed: AB2-<canonical template index base36>-<level>-<unsigned seed base36>; generateFromReview also preserves legacy AB/ABC decoding. Existing template list indices must not be reordered.
- Editor/response: Numeric multi-part or single response.
- Marking: Strict numeric parsing with per-response scientific-figure/decimal tolerance; all required parts gate submission; 1/0.5/0 mastery mapping.
- Pedagogical differences: V2: levels 1 and 2 share template scope; level 1 exposes stages, level 2 final response; level 3 applications. Built-in structure differs from extra assistance.
- Curriculum/reference boundary: OCR H432 5.1.3; calculation practice does not assess practical buffer preparation.
- Timing: Template-specific 1/3/5/10 minutes from ActiveQuestionTime.acidMinutes.
- Level 1: 25 source identities (exact lists in manifest).
- Level 2: 25 source identities (exact lists in manifest).
- Level 3: 13 source identities (exact lists in manifest).

### alevel/electrons-bonding

- Entry: `apps/Masters-of-A-Level-Chemistry/src/activities/electrons-bonding/index.html`. Active scripts: `../../assets/question-review.js`, `../../assets/test-mode-bridge.js`, `../../assets/alevel-mastery.js`, `../../assets/active-question-time.js`, `data.js`, `core.js`, `app.js`.
- Leaf IDs: `l6-t2-1-1`. Levels: 1.
- Source ownership: data.js reviewed fixed bank; core.js independent marking.
- Identity and seed: Fixed EB01–EB14 source IDs directly used by question/review URL; no hash codec.
- Editor/response: Typed full-answer definitions.
- Marking: BondingCore whole-field marking preserves required meaning and rejected misconceptions; mark points and partial result map to score.
- Pedagogical differences: One full-answer field per question; isolated keywords do not substitute for definitions.
- Curriculum/reference boundary: OCR 2.2.1/2.2.2 with explicit linked periodicity and bond-enthalpy recall.
- Timing: One-minute idle allowance in active app.
- Level 1: 14 source identities (exact lists in manifest).

### alevel/electron-configurations

- Entry: `apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/index.html`. Active scripts: `../../assets/question-review.js`, `../../assets/alevel-mastery.js`, `../../assets/active-question-time.js`, `../../assets/periodic-table-data.js`, `../../assets/periodic-table.js`, `data.js`, `core.js`, `session.js`, `levels.js`, `../../assets/test-mode-bridge.js`, `levels-app.js`.
- Leaf IDs: `l6-t2-1-2`. Levels: 1, 2, 3.
- Source ownership: data.js counts bank; core.js validator; session.js shared matching support; levels.js active level scheduler.
- Identity and seed: EC source-key hash on speciesId:direction:representation, ECB seeded matching; session RNG xorshift32. Preserve session.js matching generator even though app.js/mastery.html are inactive.
- Editor/response: Full/abbreviated notation, row boxes, energy boxes, build/identify and matching.
- Marking: Occupancy and orbital validators preserve Pauli/Hund rules and d-block neutral/ion distinctions; species counts are checked separately.
- Pedagogical differences: L1 main atoms with full/row/energy; L2 adds main ions and abbreviated notation; L3 adds d-atoms/d-ions and isoelectronic matching. Open-ended practice; TARGET=10 is a smoke-test target.
- Curriculum/reference boundary: OCR 2.2.1(b–d), 5.3.1(a); source metadata retains NIST/OCR/MIT evidence.
- Timing: Build/matching 3 minutes; identify 1 minute.
- Level 1: 156 source identities (exact lists in manifest).
- Level 2: 340 source identities (exact lists in manifest).
- Level 3: 564 source identities plus seeded matching (exact lists in manifest).

### alevel/dot-and-cross

- Entry: `apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/index.html`. Active scripts: `../../assets/active-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/alevel-mastery.js`, `../../assets/question-review.js`, `data.js`, `core.js`, `renderer.js`, `app.js`.
- Leaf IDs: `l6-t2-1-3`. Levels: 1, 2, 3.
- Source ownership: A-level data.js is enriched independent bank (91), not interchangeable with IGCSE data.js (72). core/renderer checked graph model.
- Identity and seed: DAC source-key hash; fixed bank IDs survive order changes. Former covalent leaf l6-t2-1-4 canonicalises to l6-t2-1-3 while sourceLeafId/history are retained.
- Editor/response: Atoms, shell electrons, bond pairs, lone pairs, bracket groups and charges; undo/redo.
- Marking: Graph isomorphism, electron totals/ownership, bond topology, ion ratios/groups/charges. Empty or retained full-shell cations permitted; geometry intentionally not chemically graded.
- Pedagogical differences: Combined ionic/covalent/coordinate level progression; generic covalent formula duplicates are deduplicated in pupil pool while named species remain distinct. Teacher bank retains all 91.
- Curriculum/reference boundary: OCR 2.2.2(a–f); inherited data header refers to Edexcel, so do not use that header to mislabel A-level curriculum.
- Timing: Levels 1/2 3 minutes; level 3 5 minutes.
- Level 1: 35 source identities; pupil pools ionic 25, covalent 10 (exact lists in manifest).
- Level 2: 54 source identities; pupil pools ionic 32, covalent 22 (exact lists in manifest).
- Level 3: 34 source identities; pupil pools ionic 3, covalent 28 (exact lists in manifest).

### alevel/ph-titration-curves

- Entry: `apps/Masters-of-A-Level-Chemistry/src/activities/ph-titration-curves/index.html`. Active scripts: `../../assets/site-version.js`, `../../assets/question-review.js`, `../../assets/test-mode-bridge.js`, `../../assets/alevel-mastery.js`, `../../assets/active-question-time.js`, `data.js`, `core.js`, `app.js`, `session.js`.
- Leaf IDs: `u6-t1-1-9`. Levels: 2, 3.
- Source ownership: data.js generated by scripts/generate_ph_titration_curves.js from development/alevel/data/ph-titration-curves.json; core.js solver; session.js persistence/first scoring.
- Identity and seed: TC01–TC36 fixed source IDs plus QuestionReview bank prefix TC.
- Editor/response: Titration curve anchor/sections and indicators.
- Marking: Quantitative equilibrium/charge balance plus six independent rubric points; valid indicator alternatives accepted.
- Pedagogical differences: 18 Level 2 and 18 Level 3 fixed cases; no level 1. Preserve reverse titrations, weak acids/bases, diprotic/dihydroxide factors and dilution/application cases.
- Curriculum/reference boundary: OCR 5.1.3(n–o); assumptions 25 °C, Kw=1e-14, additive volumes/ideal concentrations; complete two-proton dissociation only where explicitly stated.
- Timing: 10 minutes.
- Level 2: 18 source identities (exact lists in manifest).
- Level 3: 18 source identities (exact lists in manifest).

### alevel/c3l6-organic-reactions

- Entry: `apps/Masters-of-A-Level-Chemistry/src/activities/c3l6-organic-reactions/index.html`. Active scripts: `../molecule-builder/core.js`, `../molecule-builder/layout.js`, `../molecule-builder/editor.js`, `content.js`, `assessment.js?v=20260930-intro-centred`, `activity.js?v=20260930-intro-centred`.
- Leaf IDs: none. Levels: none; separate challenge progression.
- Source ownership: Promoted src content.js/assessment.js and digitised panels are authoritative runtime; historical draft contains provenance/review only. Shared molecule-builder core/layout/editor/styles are dependencies; molecule-builder index/app are dormant.
- Identity and seed: Challenge c3l6:2012-q2; stage+source target labels (a (1)–(10), b A–M without I, c R–Z); no random generator.
- Editor/response: Checked molecule graph editor with labelled targets.
- Marking: Stage a classification; stage b seven dependent units over 12 target slots (G/K alternatives, interchangeable target handling); stage c nine target slots. Graph equivalence preserves permitted structures.
- Pedagogical differences: Introduction then sequential a→b→c unlocks; linked displayed structures and functional-group-level explanations. Content is extension/Olympiad, never ordinary curriculum evidence.
- Curriculum/reference boundary: Cambridge Chemistry Challenge Lower Sixth 2012 Q2; Olympiad extension only.
- Timing: No curriculum active-time/mastery/revision evidence. Completion/drawings stored separately; source localStorage key sjs:c3l6:2012-q2:draft:v1.

### igcse/calorimetry

- Entry: `apps/Masters-of-IGCSE-Chemistry/src/activities/calorimetry/index.html`. Active scripts: `../../assets/question-review.js`, `../../assets/active-question-time.js`, `../../assets/igcse-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/site-version.js`, `../../assets/learning-mode.js`, `data.js`, `core.js`, `../../assets/generated-review.js`, `../../assets/numeric-mastery.js`, `mastery-core.js`, `../../assets/igcse-mastery-config.js`, `../../landing/progress.js`, `../../assets/numeric-practice.js`, `mastery-ui.js`, `../../assets/print-button.js`, `app.js`, `../../assets/question-header.js`.
- Leaf IDs: `lower-10-3`. Levels: 1, 2, 3.
- Source ownership: data.js examples/constants; core.js deterministic generator; mastery-core/UI and NumericMastery adapt pupil scheduling.
- Identity and seed: CAL mixed-radix codec in generated-review.js, uint32 seed and mulberry32 generation; codec generates from decoded canonical seed, not original UI randomness.
- Editor/response: Numeric response with meaningful working scaffold.
- Marking: q=mcΔT, enthalpy=-q/n with unit conversion, amount and limiting-reactant routes; numeric rounding tolerance and Grade 9 worked-answer confirmation retained.
- Pedagogical differences: Four mastery families × 16 setups with permitted per-example mass/amount routes; grade 1 direct/given/initial-final, grade 2 excludes limiting, grade 3 includes limiting/unstructured. Preserve teacher generator filters and staged structures.
- Curriculum/reference boundary: Edexcel International GCSE energetics/calorimetry; retain original extension labels and contexts.
- Timing: 3 minutes via IGCSEQuestionTime.
- Level 1: 16 source identities (exact lists in manifest).
- Level 2: 16 source identities (exact lists in manifest).
- Level 3: 16 source identities (exact lists in manifest).

### igcse/bond-enthalpy

- Entry: `apps/Masters-of-IGCSE-Chemistry/src/activities/bond-enthalpy/index.html`. Active scripts: `../../assets/question-review.js`, `../../assets/active-question-time.js`, `../../assets/igcse-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/site-version.js`, `../../assets/learning-mode.js`, `data.js`, `core.js`, `../../assets/generated-review.js`, `../../assets/print-button.js`, `../../assets/numeric-mastery.js`, `mastery-core.js`, `../../assets/igcse-mastery-config.js`, `../../landing/progress.js`, `../../assets/numeric-practice.js`, `app.js`, `../../assets/activity-modes.js`, `../../assets/question-header.js`.
- Leaf IDs: `lower-10-4`. Levels: 1, 2, 3.
- Source ownership: data.js generated/checked reaction structures; core.js numerical generator; assets/generated-review.js codecs; scripts/build_bond_enthalpy_generator.py owner.
- Identity and seed: BE mixed-radix codec reaction radix256/difficulty radix4 with canonical seed; no bank truncation or reaction reordering in codec values.
- Editor/response: Numeric plus displayed formula/drawing working support.
- Marking: Bond broken minus bond made; unknown average bond enthalpy inversion at grades 2/3; preserve coefficients, bond counts, rounded values and Grade 9 confirmation.
- Pedagogical differences: 16 reactions, explicit allowedLevels; enthalpy-change family grades 1/2/3, unknown-bond grades 2/3. Level 1 three parts, level 2 displayed equation, level 3 draw before calculating.
- Curriculum/reference boundary: Edexcel 3.6C/3.7C, source generation metadata retained.
- Timing: 3 minutes via IGCSEQuestionTime.
- Level 1: 13 source identities (exact lists in manifest).
- Level 2: 16 source identities (exact lists in manifest).
- Level 3: 12 source identities (exact lists in manifest).

### igcse/structure-and-bonding

- Entry: `apps/Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/index.html`. Active scripts: `../../assets/question-review.js`, `../../assets/active-question-time.js`, `../../assets/igcse-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/site-version.js`, `../../assets/learning-mode.js`, `data.js`, `core.js`, `../../assets/print-button.js`, `../../assets/igcse-mastery-config.js`, `../../landing/progress.js`, `app.js`, `../../assets/activity-modes.js`, `../../assets/question-header.js`.
- Leaf IDs: `lower-6-5`. Levels: 2, 3.
- Source ownership: data.js comparison/rubric bank and legacy teaching tables; core.js scaffold helpers; app.js controller must be replaced.
- Identity and seed: SBC hash on question.id:level; 18 supported question-level identities, not table order.
- Editor/response: Structured written sections or extended explanation with frozen response and rubric judgments.
- Marking: Self-assessed mark points and explicit misconception rejection; raw rubric points preserved; do not claim explanation automatically marked.
- Pedagogical differences: Nine comparisons across melting/boiling, conductivity and hardness. Grade 2 structured prompts versus Grade 3 extended explanation. Nine legacy levelOneTables retained as teaching/support data, not an enabled grade1 activity.
- Curriculum/reference boundary: Edexcel structure/bonding property explanation; preserve molecular/lattice distinction and mobile-charge arguments.
- Timing: 3 minutes, stopped when written response locks before self-review.
- Level 2: 9 source identities (exact lists in manifest).
- Level 3: 9 source identities (exact lists in manifest).

### igcse/dot-and-cross

- Entry: `apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/index.html`. Active scripts: `../../assets/active-question-time.js`, `../../assets/igcse-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/learning-mode.js`, `../../assets/igcse-mastery-config.js`, `../../landing/progress.js`, `../../assets/question-review.js`, `data.js`, `core.js`, `renderer.js`, `app.js`, `../../assets/question-header.js`.
- Leaf IDs: `fourth-3-1`, `fourth-3-2`. Levels: 1, 2, 3.
- Source ownership: data.js 72 question bank; core.js graph validator; renderer.js visual representation.
- Identity and seed: DAC source-key hash with category/grade in saved state, source fixed molecule IDs.
- Editor/response: Dot/cross diagram editor with atoms, electron pairs, bracket groups and charges.
- Marking: Graph/electron/charge/ion-ratio validator, same meaningful drawing acceptance as source.
- Pedagogical differences: Ionic grades 1/2 only; covalent grades 1/2/3. Teacher bank 72; pupil covalent generic formula duplicates are deduplicated. No A-level-only enriched bank substitutions.
- Curriculum/reference boundary: Edexcel Issue3 September2024 sections 1.40/1.46 source access 2026-09-12.
- Timing: 3 minutes via IGCSEQuestionTime.
- Level 1: 35 source identities; pupil pools ionic 25, covalent 10 (exact lists in manifest).
- Level 2: 46 source identities; pupil pools ionic 30, covalent 16 (exact lists in manifest).
- Level 3: 21 source identities; pupil pools ionic 0, covalent 18 (exact lists in manifest).

### igcse/energy-enthalpy

- Entry: `apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/index.html`. Active scripts: `../../assets/active-question-time.js`, `../../assets/igcse-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/learning-mode.js`, `../../assets/igcse-mastery-config.js`, `../../landing/progress.js`, `data.js`, `core.js`, `editor.js`, `../../assets/print-button.js`, `app.js`, `../../assets/activity-modes.js`, `../../assets/question-review.js`, `../../assets/question-header.js`.
- Leaf IDs: `lower-10-1`. Levels: 1, 2.
- Source ownership: data.js generated by scripts/build_energy_enthalpy.js from reviewed markdown and scripts/energy_enthalpy_reactions.js; editor/core independent models.
- Identity and seed: EE hash on fixed question.id; historical custom core status model does not replace shared mastery equations.
- Editor/response: Whole-field typed/choice responses and reaction-profile construction/repair.
- Marking: Automatic text accept/reject/unknown classification and independent geometric rubric. 54 questions, 28 grade1 and 26 grade2; no grade3 despite reserved mastery half-life.
- Pedagogical differences: Energy transfer/sign/interpretation, drawing and bond explanation/comparison. Preserve exo/endo, arrow endpoints, catalyst barrier and equation-side labels.
- Curriculum/reference boundary: Edexcel energetics: experimental observation vs energy transfer models remain distinct.
- Timing: 3 minutes via IGCSEQuestionTime.
- Level 1: 28 source identities (exact lists in manifest).
- Level 2: 26 source identities (exact lists in manifest).

### igcse/energetics-practical

- Entry: `apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/index.html`. Active scripts: `../../assets/active-question-time.js`, `../../assets/igcse-question-time.js`, `../../assets/test-mode-bridge.js`, `../../assets/learning-mode.js`, `../../assets/igcse-mastery-config.js`, `../../landing/progress.js`, `data.js`, `diagrams.js`, `core.js`, `../../assets/question-review.js`, `../../assets/print-button.js`, `app.js`, `../../assets/activity-modes.js`, `../../assets/question-header.js`.
- Leaf IDs: `lower-10-2`. Levels: 2, 3.
- Source ownership: data.js teacher-reviewed bank, core.js marking, diagrams.js authored apparatus visual models.
- Identity and seed: EP fixed IDs are already stable review IDs; source question patterns retained; no generated content seed.
- Editor/response: Text, dropdown/multiselect, diagram selection, highlighted error correction.
- Marking: Whole-field alternative matching, selected-set equality, correction gates; valid text may use explicit self-review override, never unrestricted auto acceptance.
- Pedagogical differences: 14 fixed questions: eight Grade 7?8 (level 2), six Grade 9 (level 3); retain linked fields, selection/highlight, diagrams and meaningful explanation points. Incomplete combustion is a model interpretation, not uniquely inferred from underestimation alone.
- Curriculum/reference boundary: Edexcel 3.2, 3.8 and experimental skills p28; data.js sources map source QP/MS pages.
- Timing: 3 minutes; stop at first automatic assessment before optional valid-answer overrides.
- Level 2: 8 source identities (exact lists in manifest).
- Level 3: 6 source identities (exact lists in manifest).

## Persistence and migration constraints

Source activity evidence retains exact key strings and saved fields. Import reads must preserve question IDs/seed, response/diagram state, attempt ID, immutable first evidence, hint/reveal state and validated timing where present. Existing absent timing stays absent. Never write old keys. Replace source page controllers/iframe bridges and DOM/title-derived registrations with the shared attempt/session/repository boundary; retain checked marking/editor engines.

A-level mastery retains threshold 0.8; electron/bonding/dot half-lives are 3, acid half-lives 2 with progressionVersion 2, titration half-lives 2 at levels 2/3. Former covalent `l6-t2-1-4` maps to diagram `l6-t2-1-3` while retaining historical source IDs; hidden Ka/pKa `u6-t1-1-4` routes to weak acid `u6-t1-1-5`. Historical stores and progression versions remain explicit. IGCSE keeps threshold 0.8 and each activity/grade half-life in `masteryRegistrations`; Grade 9 energy tuning is reserved and does not authorise a Grade 9 activity. C3L6 stores challenge completion/graphs separately with source answer-version/signature checks.

Extra hint/reveal assistance is distinct from built-in level scaffolding. Stop time on first assessment, including written-answer lock before rubric review; retries/corrections/reloads cannot produce independent evidence. Teacher/review views are evidence-free. Rebuild behaviour and actual browser/rendered checks are later-stage gates; the static inventory does not claim those have passed.

## Checked chemistry/reference map and limitations

Fifteen original read-only model/regression scripts pass. Among their retained output are independent acid reconstruction of 38 templates / 228 questions / 2,936 checks, 1,242 calorimetry outputs, 123 exact bond reaction/level/seed outputs and the full 91-entry A-level diagram reference bank. The separate source-model check passes 63 acid identity routes, 33 historical fixtures, all 23 C3L6 graph/formula alternatives and all 14 practical model responses/empty-response/correction gates. These are regression/invariant checks; they do not establish a fresh expert audit.

`reference-validation-map.json` maps each activity to checks, retained source provenance and status. IGCSE `test_dot_cross_bank.js` still names absent `resources/past-paper-atlas/data/atlas.json`; do not run it as-is or remove the provenance check to claim PASS. Port its independent electron-count fixture and resolve the historical atlas mapping during migration. Other diagram checks do pass.

Historical C3L6 draft chemistry reports were identified by path and metadata but are offline cloud placeholders; none was hydrated. Live promoted content/answer graphs were inspected instead and validated against the readable source editor model. The historical reports remain provenance to recover only with separately authorised access if needed. All original `src` content is readable, so this limitation does not prevent exact bank preservation.

The repository OCR gem map was consulted: it records OCR H432 Version 3.1 (May 2026), reviewed 10 September 2026. Acid source metadata retains its older Version 3.0 (2025) / access 4 September 2026 provenance; do not silently rewrite historical metadata or treat its version as the current specification. This is a migration inventory, not a formal new curriculum coverage audit. IGCSE uses its Pearson specification evidence; Olympiad extension is labelled separately.

No source equations, constants, names, charges or diagrams were changed. Embedded reaction SVGs and C3L6 assets must retain original checked fingerprints; any future changed chemistry/depictions needs fresh substantive and rendered review. Teacher-edited bank exports must never be overwritten by generators.
