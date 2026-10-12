# Recall content and provenance

The active canonical bank contains **121 IGCSE facts and six unchanged A Level facts**. `facts.ts` is the shared live-bank export; a fact may link multiple gems and keeps one stable ID/progress identity.

## Authoritative inputs and generation

- Original teacher working bank and completed review are retained byte-for-byte in `resources/recall/source-audit/`.
- The 10 October 2026 user amendments are recorded in `resources/recall/authority/recall-main-authorized-plan.md` and implemented in `approved-amendments.mjs`. Amendment wording is user-authorized; it is not relabelled as the original teacher wording.
- `prepare-approved.mjs` reproduces the source conversion and applies the amendments, writes `approved-igcse-facts.json`, the current run's disposition, `typed-provenance.json` and `marking-fixtures.json`.
- `provenance.json` remains the original starter/source audit. `typed-provenance.json` records current authority, source hashes, IDs, links, aliases, counts and historical-only additions.
- `historical-facts.json` retains all actual150 earlier definitions, including144 IGCSE and six A Level. `historical-marking.ts` is frozen. Missing `definitionId` selects those historical semantics; the amended definition is `recall-main-20261010`.

Run from the app directory:

```powershell
node --experimental-strip-types src/recall/prepare-approved.mjs
node --experimental-strip-types --test scripts/tests/recall-main-content.test.mjs
npm run typecheck
```

The generator writes disposition evidence to `.artifacts/recall-main/generated-content/` by default. Set `RECALL_CONTENT_EVIDENCE_DIR` to a run-local directory when retaining stage evidence, for example `.artifacts/recall-main/s4/author-content`. Both generator modules use the same directory; regeneration never rewrites earlier accepted stage history. The source bank is not edited during generation. Six A Level definitions remain deeply equal to their frozen historical definitions.

## Active-bank boundaries

Q087 remains quarantined and088 remains removed.061 is retired.025 becomes separate025a (ionic lattice) and025b (metallic lattice), with no invented transfer of old success. New119–124 are the six explicitly authorized sulphuric/nitric/hydrochloric acid name/formula facts. The29 generated Formulae/Equations additions are absent from the active export; their source data and historical definitions remain unchanged. Ion aliases resolve to existing numbered facts. Acid records link acid, anion-test and organic prerequisites without duplicating facts. The 11 October 2026 mapping correction excludes all six acid name/formula facts (119–124) from Fourth Form Formulae and Equations; ion and state-symbol recall remains linked.

## Response and chemistry contracts

Ordinary fields are single-line raw text. Choices store stable option IDs while models show human labels. Numeric entries store digits/decimal/fraction notation with units external; proton charge004 requires a sign. Formula entry has field-specific molecular/ion/general-formula metadata: NH3 and K2Cr2O7/H2SO4 have subscript atom counts; Zn2+/Ag+ have superscript charges; polyatomic ions distinguish body counts from charge digits. Entry controls must preserve incorrect raw values and must permit accepted names in formula/name reagent fields114/117.

016 has inline sentence gaps.091 and100 each have six labelled ascending fields for compact vertical rendering.062 has two distinct Test/Result tuples in either order.046 accepts one coherent boiling100°C or melting/freezing0°C tuple. Its displayed model is exactly `Test: Heat it until boiling` / `Result: Boils at exactly 100°C`; standard pressure is an authoring-only assumption, and paired melting/freezing alternatives remain accepted.082–086 have one Soluble/Insoluble choice and a hidden exception collection, whose raw value is a JSON array of `{id,value}` entries. The editor starts at `[]` with zero boxes; a fixture needing exceptions must explicitly construct its entries. Distinct groups may be answered by ion names or correct full compounds. Duplicate synonyms cannot count twice.

Approved bonding patterns are anchored complete responses with chemically correct attraction/participant relationships. Prose alternatives have explicit opt-in; choice/numeric/charge/formula controls, recognized contradictions, duplicates and pair mismatches cannot use self-correction. An override is learning feedback only and never rewrites first automatic evidence or advances the recall schedule. Unsaturation107 retains scientifically valid triple-bond alternatives, with the existing extension qualification, while the model uses C=C. Hydrochloric acid is explicitly aqueous hydrogen chloride; HCl(g) is not an accepted acid formula/name here.

## Retained verification and stage limits

`marking-fixtures.json` has expected independent aggregate booleans, positive per-field outcomes and selected negative partial-feedback outcomes for all121 model responses, approved aliases and meaningful chemical/numeric/order/pair/duplicate/exception negatives. `notationEditing` supplies raw/display/paste/delete examples for S2 control checks. These are expected fixtures: S1 content tests establish coverage, source preservation, valid controls, patterns, IDs, links and schema; they do not claim the future S2 marker or rendered controls have passed.

Detailed manual chemistry review, exact S0-matching before files, bounded diffs and regeneration evidence were recorded in the accepted S1 run. Recent generated reports are retired12 October2026; durable source, frozen inputs, marking fixtures and regeneration commands remain. See [the cleanup record](../../docs/maintenance/recent-verification-cleanup.md). Shared attempt/timing, persistence, scheduling, post-check feedback, global/gem launch, flashcards, browser inspection and independent review remain the later implementation/acceptance gates. Existing old recall tests contain superseded count/response-shape assertions; their required adaptations are documented in the content handover rather than weakened in this stage.

Precheck context conveys only scope/conditions. Requested answers, numerical purity results, solubility exception identities and unsaturation qualifications appear in the checked model rather than precheck context. This prevents unassisted first checks from receiving their answers in advance.

## Current implementation gates (11 October 2026)

Root acceptedS1 content,S2 main controls/navigation/flashcards,S3 production harness,S4 independent chemistry/main behavior/native timing. Earlier stage statements describe their original boundaries; the accepted S4 run recorded independent evidence, now retired12 October2026. All121 models/705 semantic cases, negative tails, notation/editing, historical migration, default main modes and ungraded Stats transfer verified. `RECALL-MAIN-HANDOFF.md` gives commands/limits. S5 and the completed implementation are root accepted; ACCEPTED_COMPLETE. No deployment.

## 11 October standard-code and Recall follow-up

Current user-facing references use shared standard codes (`RCI` for IGCSE Recall and `RCA` for A Level Recall). The append-only display alias table is `src/content/question-display-aliases.json`; internal fact IDs and saved refs remain unchanged. Exact question links and review-harness URLs take standard codes only. The latest user instruction removes new raw Recall/source-code lookup fallbacks and historical reference clutter from review tools. Existing graded generator codecs are preserved. Review exports provide displayCode, retain necessary nested attempt/ref identities, and omit duplicate raw top-level questionId and the historical-ID catalogue.

037 uses the requested percentage prompt and existing0.04% answer/unit.039 alone presents Acidic/Basic choice buttons with unchanged option IDs.046 uses the exact two-line model and preserves paired alternatives. Standard-pressure scope is recorded in generated authoringAssumptions rather than student context. Direct per-field learning review sits below eligible unchanged wrong prose, including bounded048 Test/Result paraphrases; it preserves the automatic first result and stage and supports saved undo. Current generated semantic fixtures total707. Regenerate with `RECALL_CONTENT_EVIDENCE_DIR=.artifacts/recall-codes/implementation/generated-content` and `node src/recall/prepare-approved.mjs`.
# Smooth loading preparation

Root navigation preloads the Recall module and calls `prepareRecall` in `prepare.ts` with the explicit destination course, database and loading ticket. Pass its `PreparedRecall` result to `RecallView`; dispose an abandoned result. Prepared Test/auto-start attempts and fresh Flashcard decks are durable before they become visible, and preparation never creates a clock or hidden player.

The callable Recall leave guard exposes `freeze()` and `resume(ticket)`. Freeze detaches document timing synchronously. Resume recovers queued failures and saves the retained attempt/session through the ticket before controls or timing reactivate. Recall validation lives in `persistence/recall-validation.ts` and is imported by async repository operations before their transactions. Caller-owned write payloads and read selectors are captured synchronously before that import yields.

Focused regression: `node --test --test-isolation=none scripts/tests/smooth-loading-recall.test.mjs`. Browser verification: `node scripts/smooth-loading-recall-browser.mjs` against the development server at port 5261 (override `SMOOTH_LOADING_APP_URL`).

