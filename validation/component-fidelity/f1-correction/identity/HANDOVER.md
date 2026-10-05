# F02 — F1-CODEC-DEV / DEV-AUTHORING-CANONICAL

**Worker result: PASS, pending F01 integration and ROOT acceptance.** Requested gpt-6.1-sol/high; effective model, effort, tokens and cost are not exposed. No nested delegation. All writes are within `apps/Masters-of-Chemistry`.

## Outcome

The production acid/base ID codec now has permanent template slots. Development controls, the root authoring proof, six retained generated families and a newly scaffolded independent proof use canonical curriculum refs in isolated fresh DEV databases. Chemistry, response and marking functions, shared first-assessment/timing ownership and QuestionRef shape remain unchanged. Production activity registrations were not extended.

### Permanent acid/base identity

`src/activities/alevel/acid-base-calculations/identity.ts` assigns the existing 38 template names explicit numeric slots0–37, exactly matching their pre-correction indices. The permanent slot count is64, level offsets are64 and the configuration radix is192. Encoding is `seed × 192 + (level−1) × 64 + permanentSlot`, represented as six uppercase base36 digits after `AB-`. Seed domain is0–11,337,407. Selection still accepts unsigned32 entropy and maps it into that bounded seed domain. Decoding rejects unassigned slots38–63. Unsupported chemistry template/level combinations remain rejected by the existing engine/provider.

`createAcidCodec` is the shared encoder/decoder factory. The regression registers a synthetic future template in reserved slot38 through that actual factory, verifies456 current codes are unchanged, and verifies current production decoding rejects156 reserved-slot boundary codes. No future production template is registered. The capacity is exactly192 × 11,337,408; there is no fractional numeric tail. Six-digit reserved tail codes and seven-digit overflow formats are rejected.

Before editing the codec, I captured all63 supported chemistry configurations at seeds0,1,712345 and corrected maximum11,337,407. All252 question-content fixtures reproduce exactly, excluding only the changed review code; their complete checked numeric marks pass. The old F1 fixture maximum19,094,580 remains preserved outside the new bounded domain and is not reused to weaken this correction's bound.

### Development identity and authoring

`src/development/identity.ts` owns a separate DEV codec context with64 slots,192 configuration radix and the same bounded seed domain. Synthetic controls have explicit slots38–47. `development/authoring/family-slots.json` explicitly assigns root proof48, retained generated families49–54 and the new CLI proof55. These assignments are permanent. DEV refs use the current activity's canonical prefix and exactly encode slot/level/seed; production acid decoding rejects their reserved slots. No DEV-specific bypass was added to persistence validation or current production import resolution.

`fixtures.ts` now selects, restores and resolves canonical refs, bounds selection entropy and checks previous-ID format. The educational control content is identical to the captured before-text module across1,650 refs (11 activities ×10 controls ×3 levels ×5 seeds). Numeric marking equivalence was also checked. Schema persistence assertions use only genuinely supported catalogue targets; unsupported synthetic combinations do not receive any validation exemption.

All seven original authoring providers and their marking policies reproduce77 captured pre-correction question/content/value/marking fixtures exactly, excluding refs. Their fixed level1 remains seed0; levels2/3 retain the original36 finite chemistry configurations while permitting bounded deterministic seeds. Canonical resolve rejects old DEV question codes and ref/seed/level mismatches. Current authoring coverage totals eight families, including the new `dev-canonical-correction` proof, with104 distinct canonical boundary refs tested.

The scaffold takes the next unused explicit slot48–63, refuses exhausted slots, invalid/overlong slugs and existing folders, and never renumbers existing assignments. The CLI actually generated `dev-canonical-correction` in slot55; its provider, typed mount, source fingerprints, tests and preview are present and validated. It is unpublished and DEV-only. The generated proof uses the existing activity/gem and genuine levels1/2/3; no new curriculum registration or shared assessment plumbing was added.

Current templates/browser tests write only new correction evidence. The former prepare script now refreshes from the current canonical independent source instead of reintroducing obsolete IDs from historical validation. The authoring server directs its cache to an app-owned development folder and uses5181. Existing reviewed chemistry/provenance hashes are retained; generated plans/manifests add current correction fingerprints alongside their original generation provenance.

### Fresh development database boundary

With parent authorization, `ActivityHost.tsx` changes only its namespace import and database-name call. `activityDatabaseName` returns the exact existing production name unless both DEV and `registryOverride` are true. The DEV case uses a permanent source-owned family route token plus run under `masters-of-chemistry-alpha-v2-…-dev-authoring-…`. Root authoring routes share the root proof token; different family routes have distinct tokens. Unknown DEV override routes fail clearly. Family/run bounds fit the existing repository name guard without truncation. No guard was broadened.

The synthetic `src/development/FoundationApp.tsx` changes only its database run prefix to `dev-controls-`. Its shared attempt, clock, scheduler and repository behavior are unchanged. Production namespaces/preferences remain the existing fresh alpha-v2 names. Original/test sibling stores are never opened automatically.

## Exact source review and file ownership

Before text was captured before edits, including the additionally authorized host/namespace files. The exact correction diff is [before-current-source.patch](before-current-source.patch), with before/current hashes and all66 changed/new source/documentation/authoring paths in [changed-paths.json](changed-paths.json). New files have a null before hash. [baseline-current-diff-manifest.json](baseline-current-diff-manifest.json) relates the parent's current-runtime baseline to this worker's owned boundaries. The patch is a real `git diff --no-index` comparison of preserved before text and current sources, not an invented repository history.

Function-level review:

| Boundary | Change | Review evidence |
| --- | --- | --- |
| Acid `acidCode`, `decodeAcidCode` | permanent explicit slots; factory with reserved slots and bounded seed; no count-derived radix | exact diff,252 chemistry fixtures,5,481 supported code roundtrips, future registration regression |
| DEV codec | exact bounded prefix/slot/level/seed encoder and ref consistency validation | distinct fixture/authoring refs, production reserved-code rejection, restore mismatch tests |
| Fixture `fixtureRef`, `fixtureQuestion`, provider selection/link | canonical refs; checked entropy/history; content body retained |1,650 before-content comparisons and actual10-control browser restoration |
| Authoring `proofRef`, `dilutionValues`, provider selection/link | canonical exact refs; fixed seed0; bounded generated seed; teaching/marks retained |77 content/marking goldens,14 generated-family tests, seven typechecks, root/S5 full browsers |
| Host database boundary | DEV+override gets permanent family token; production unchanged | existing guard retained; unit selection matrix; actual same-run two-family browser |
| Synthetic host database | fresh dev-controls prefix | instrumented browser opens only dev-controls alpha stores |
| Scaffold/templates | explicit new-slot allocation; current canonical checks/evidence paths; safe refusal | actual new CLI output, rejected-input no-write tests, source hashes and current typechecks |

No edits were made to QuestionPlayer, ResponseControl, CorrectionSegments, OriginalLanding, teacher catalogue data, marking modules, chemistry builders, common chrome, persistence schema validation or production registration.

## Validation

All current evidence belongs under this correction identity directory.

| Gate | Result | Evidence |
| --- | --- | --- |
| Canonical identity/current persistence/shared attempt regressions | PASS39/39 | `tests.log`, `coverage-results.json` |
| Fixed-bank complete coverage and canonical uniqueness | PASS863 refs | `coverage-results.json` |
| Supported production AB code/seed/level roundtrip | PASS63 configs,5,481 codes | `coverage-results.json` |
| Permanent future registration invariance/reserved slots | PASS456 unchanged,156 rejected | `future-stability-results.json` |
| Pre-correction AB chemistry/checked marking | PASS252 | `acid-pre-correction-fixtures.json`, `tests.log` |
| Retained authoring content/marking | PASS77 exact | `authoring-pre-correction-fixtures.json`, `authoring-codec-results.json` |
| Synthetic exact-content/canonical refs | PASS1,650 | `development-fixtures-results.json`, `tests.log` |
| Generated family fixtures | PASS14/14 across seven folders | `all-authoring-tests.log` |
| Main app + each generated family typecheck | PASS | `verification-results.json`, `typecheck*.log` |
| Current production export/import/store guard browser | PASS6 checks | `browser-results.json`, `current-export.json`, `current-import-browser.png` |
| Root authoring real practice/revision/teacher | PASS7 checks | `authoring/authoring-proof/browser-results.json` and screenshots |
| Independent S5 real practice/revision/teacher | PASS7 checks | `authoring/dev-s5-independent/browser-results.json` and screenshots |
| DEV controls + same-run family scope browser | PASS13 checks | `development-browser-results.json`, `dev-controls-*.png`, `dev-family-scope-*.png` |
| Prior F1 evidence | PASS113 frozen files plus freeze-manifest fingerprint | `prior-f1-integrity.json` |

Production export/import browser tests still reject obsolete/cross-course/unresolvable refs and deduplicate current canonical first evidence without changing marks or timing. Their current fixture uses the corrected AB codec and a unique correction-only run.

The root/S5 browsers each verify built-in scaffold, finite wrong first response1/2, corrected2/2 learning feedback preserving original assessment/response/timing, completed reload, fresh Next, generated exact save/reload, ADD ALL's three levels, actual revision progression into inverse-dilution level3 and teacher seed24 no evidence. The current back-to-map action checkpoints/pauses; reload automatically continues the same saved attempt, matching current UI behavior.

DEV control browser checks all10 control response types, exact ref/content/responses/attempt/timing on reload, a numeric first independent score/time, revision scoring/scheduler Next and teacher no attempt/evidence. Two authoring family routes with the identical run use different database names and each reproduce their own exact saved code/ref/content/response on reload.

Rendered inspection covered desktop fixed correction/model,390px correction/model, root component examples/formula/table, seed24 teacher model and level3 inverse-dilution model, plus the independently scaffolded saved family. Canonical codes are visible in shared question chrome; the reviewed HCl assumptions, conservation equations, units, concentration reasoning and checked answers agree. This is identity/DEV restoration review, not a new full curriculum/specification audit.

### Failed probes retained

The initial nested authoring temporary-profile path exceeded Windows path limits. Browser temp moved to the shorter app-owned correction `.bt` path. An initial percent-encoded DEV route name was refused by the existing repository name guard; its JSON/screenshot is retained as `authoring/dev-s5-independent/browser-before-scope-token-failure.json` / `scope-token-failure.png`. Source-owned bounded family tokens corrected the name without changing the guard. An old Pause/Resume selector failed against current UI; its report/screenshot remains under the same folder, and the test was ported to real back-to-map/automatic continuation. Synthetic browser probes initially used an obsolete numeric label and an incomplete test-only TextRange; both failure reports remain (`development-browser-label-failure.json`, `development-browser-incomplete-range-fixture-failure.json`). The final browser uses the current accessible label and complete unchanged TextRange schema. No assertions or runtime validation were weakened.

## Commands

From the app directory, with the existing pinned dependencies and Vite5181:

```powershell
node scripts/test-component-identity.mjs
node validation/component-fidelity/f1-correction/identity/verify-current.mjs
node validation/component-fidelity/f1-correction/identity/browser.mjs
node validation/component-fidelity/f1-correction/identity/authoring-root-browser.mjs
node development/authoring/families/dev-s5-independent/browser.mjs
node validation/component-fidelity/f1-correction/identity/development-browser.mjs
```

These current scripts do not overwrite historical F1/S1/S4/S5 evidence. `verify-current.mjs` refreshes current generated correction metadata deliberately. Historical script runners were not executed. No dependencies, lockfiles or original build tools changed.

## Risks and remaining acceptance ownership

- F01 owns current production builds, DEV exclusion/release closure, protected-original integrity and final integration; ROOT owns F1 acceptance. Worker PASS is not acceptance or publication.
- The new permanent codec intentionally changes the previous provisional F1 AB IDs and reduces its seed domain. Old provisional refs/data remain untouched and unused; no migration/compatibility is provided, as authorized. Maximum seed is11,337,407.
- DEV refs use a separate provider context and separate DBs. They are not production questions and must remain excluded from production registration/releases. The explicit authoring space has eight unused slots56–63; exhaustion must be reviewed rather than renumbered or silently hashed.
- The inherited authoring specification limitation remains explicit: retained official OCR archive/departmental map provenance supports the unchanged teaching; no fresh full specification PDF audit was performed or claimed.
- F01 resolved the reported shared TeacherPicker wording with four canonical-copy replacements and separately retained before text/review under `validation/component-fidelity/f1-correction/teacher-copy/review.json`. That integration edit is outside F02's changed-path manifest; F01 owns its build refresh. No functional compatibility resolver remains.
- Browser failures above were test/environment/namespace probes with recorded final fixes; no unresolved browser or test gate remains in this worker's scope. Requested/effective runtime and usage mismatch cannot be measured and is not invented.
