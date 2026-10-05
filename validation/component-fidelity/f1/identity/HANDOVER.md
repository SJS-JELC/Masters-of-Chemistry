# F02 / F1-IDENTITY handover

## Outcome and evidence

Canonical curriculum refs now use the contract prefixes throughout fixed provider coverage, selection/history, restore, marking and editor lookups, teacher entries, current links and persistence. `QuestionRef`, response/marking semantics and shared attempt/time ownership are unchanged. Source banks remain exact source provenance; raw bank IDs are used only behind canonical source lookups and by their checked source presentation/chemistry engines (including source-specific dot-cross layouts). They are not saved, selected, displayed or linked as curriculum question refs.

- `coverage-results.json`: 863 complete fixed codes, no duplicate global IDs; all restore and current links reproduce their exact refs. All fixed banks and every current teacher catalogue covered.
- AB: 38 permanent explicit template indices, 3-level radix, 63 supported configurations, 19,094,581 bounded seed values (`0…19,094,580`). 5,481 distinct config/seed codes checked. `AB-` encodes seed × 114 + configuration directly; no hashing/truncation. Unsupported template/level combinations and unused final code-space tail are rejected.
- `acid-source-fixtures.json`: 252 pre-change content fixtures across every supported template/level and seeds 0, 1, 712345 and max. Only former reviewId was excluded from content comparison. Chemistry, rows, answers, rounding, calculations and audit data are exact.
- 267 complete promoted-bank marking records checked, with correct/incorrect/incomplete perturbations and source-core comparison where applicable; every 564 EC reference checked. ECB refs now use the code-decoded seed, and mismatches are rejected.
- `tests.log`: 35/35 pass (10 current identity/persistence tests plus 25 retained pure timing/assessment/correction tests). Retained test files and prior validation evidence were not edited; the retained attempt suite is read-only and does not write its evidence directory.
- `browser-results.json`: isolated Edge 154 / pinned workspace Playwright 1.62.1. Actual IndexedDB attempt/practice/revision restore; first evidence and 2500 ms timing unchanged after correction; actual UI export, reload, deduplicated import, import into a fresh database; old-code and cross-course import rejection. Instrumented browser storage operations, including landing preferences, use alpha-v2 only. Old repository name fails validation before opening. Zero page errors.
- `current-export.json` and `current-import-browser.png`: actual exported canonical first evidence and browser UI evidence. Generated export supports deterministic Node import checks; browser run regenerates it in an isolated context.
- `source-preservation.json`: 144 unaffected activity/chemistry files match frozen F1 baseline SHA256 byte-for-byte.
- `changed-paths.json`: baseline and current source hashes, including new source paths. No Git repository/before-source snapshots were available; this is a hash change manifest, **not** an exact before/after textual diff.

## Precise function-level change review

| Boundary | Changes and retained semantics |
|---|---|
| `content/canonical-identity.ts`, `canonical-fixed-ids.json` | Permanent exhaustive EB/TC/DAC/DC/EE source→canonical mappings. TC/DAC/DC/EE promote the previous checked review codes; EB uses explicit permanent source-number codes. Reverse source lookup accepts canonical IDs only; module checks format/uniqueness. Shared prefix/previous-history validator supplies all11 curriculum providers. |
| Acid `identity.ts`, `engine.js`, `engine.d.ts` | Explicit template map independent of display order; reversible mixed radix; generation rejects seeds outside bounded domain. Original chemistry builders/RNG/marking remain intact. `decodeCanonical` replaces old AB2 decoding and `generateFromReview` has one canonical branch. Historical AB/ABL branches removed. |
| Acid `provider.ts`, `index.ts` | Selection entropy is still uint32; it is reduced into bounded seed space **before** generation, so returned/ref/decoded seed are identical. Different entropy values may choose the same bounded question; this is selection entropy, not a collision between accepted config+seed identities. Previous IDs decode canonically. Timing decodes template from canonical code with original per-template allowance. Old historical review context removed. |
| EB/TC/DAC/DC/EE providers | Coverage/selected refs/previous IDs/title code/policy references use canonical IDs. `bondingRecord`/`getRecord`/`record` resolve canonical IDs to exact unchanged provenance records. Source ID link alternatives removed. Same fixed selection pools/order/category balance, levels, content and seed inputs retained. |
| Both dot marking policies | `sourceScore` is called with `question.ref.questionId` instead of source record.id; criteria and 0/0.5/1 calculation unchanged. |
| EC provider | Existing EC codes retained. Selected ECB ref seed equals code numeric payload; restore checks agreement. Existing matching generator/selection/species/representations unchanged. |
| SBC provider | Existing SBC codes retained; restore/link/previous-history source-ID compatibility branches removed. Source `comparisonRef` construction remains provenance→canonical, and exact explanations/rubrics remain unchanged. |
| CAL/BE/EP providers | Existing codes retained. Canonical previous-history validation added. CAL/BE restore also checks exact canonical questionId equality (rejects noncanonical internal lowercase refs). |
| `teacher-catalogue.ts` | Removed obsolete historical acid catalogue branch. All current complete configurations retained; dot entry labels use one canonical code instead of duplicate/raw codes. |
| `alpha-namespace.ts`, repository, three production hosts, DEV foundation, course preference, landing preferences | Fresh database `masters-of-chemistry-alpha-v2-{course}-{run}` and preference prefix `masters-of-chemistry-alpha-v2:`. Repository guard rejects earlier alpha databases before any open. Fresh DB isolates saved sessions/attempts/Olympiad completion as well as evidence. Transactions, conflict checks and first-evidence rules unchanged; obsolete imported-legacy sourceKey equality exception removed. |
| `persistence/validation.ts` | Curriculum refs validate activity-specific canonical prefix/format; saved practice histories also validate canonical IDs. Current imports accept checked `new-attempt` evidence, namespace and canonical refs, replacing legacy-only admission. Existing immutable first response/assessment/timing/schema checks retained. |
| Current import plan and import view | User must paste/upload an explicit current ImportBatch JSON. Entire payload checked including actual current provider refs/level/seed; no old keys read and no old-code migration. UI exports actual current evidence and separate Olympiad progress; preview then import preserves exact first evidence/deduplicates it. The internal pre-existing Legacy* type/function names remain to avoid unrelated interface churn; UI text describes current exports. |
| `compatibility/links.ts`, routes, runtime aliases, navigation/ProductionFoundation | Current canonical exact codes or code URLs retained, including current activity entry aliases. Obsolete EE/source fallback and original `?legacy=` interpretation removed; AB encoded-code test uses AB only. Original-source route-course recognition removed. Canonical generated code seed/level constraints retained. |
| `persistence/index.ts` | Legacy parser no longer exported from production persistence entry. Its unused direct module/source helpers remain for byte-preserved historical fixtures; no production importer calls it. `C3_LEGACY_KEY` is a provenance-only exported constant for old fixture typechecking, neither readable nor admitted. |

## Reproduction

From workspace root:

```powershell
node apps/Masters-of-Chemistry/scripts/test-component-identity.mjs
npm.cmd --prefix apps/Masters-of-Chemistry run typecheck
# With the app's existing Vite dev server at http://127.0.0.1:5181:
node apps/Masters-of-Chemistry/validation/component-fidelity/f1/identity/browser.mjs
```

The fixed mapping is permanent checked source data, not regenerated from runtime display order. The acid template-index list is permanent. Current source + canonical code regenerates question content; no full question snapshots were introduced. The test golden is verification evidence, not stored student question content.

## Limits and parent-owned gates

- AB cannot losslessly encode all former uint32 seeds with every template/level in six base36 characters. The contract explicitly authorizes a bounded seed space; direct out-of-range generation now fails. Old links/data are intentionally unsupported and untouched.
- No prior storage is loaded or migrated. Explicit current exports retain supported first evidence; raw previous exports are rejected.
- Browser proof uses a new isolated automation context and app-owned temporary files; it does not access the user's original app/browser stores. Evidence mode's deterministic clock verifies transfer/immutability; full real idle/background/suspension/fresh-Next and rendered component fidelity are parent integration/F2 gates.
- Developer-only synthetic fixture IDs remain in their previous unregistered authoring fixtures; they are not active curriculum banks. Canonical persistence rejects their synthetic refs if that obsolete DEV fixture is used to save; active production activities are covered exhaustively.
- Both builds/release budget and original-app fingerprint acceptance are foreman/root-owned, not claimed by this worker. F01 reported preliminary original/prior-evidence integrity PASS independently.
- Requested model/effort: gpt-6.1-sol/high. Effective runtime and usage were not exposed. No model/cost measurements invented.

Code is frozen pending parent review. Vite server is left available on port5181 (exec session22990).

Rendered inspection: inspected current-import-browser.png directly after export/import rejection checks. Labels, upload field, current canonical JSON, status and shared navigation/footer are visible and unclipped at 1280 × 905. Full component states/responsive acceptance remain F2/root gates.
