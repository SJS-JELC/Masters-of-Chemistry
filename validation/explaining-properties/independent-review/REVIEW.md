# EBP-REVIEW · A02-EBP

**Disposition: ESCALATE.** The chemistry, exact current bank, identity, marking and tested attempt behaviour pass independent review. Four bounded author fixes are required. Native hidden/background and lifecycle timing acceptance remain unestablished; root owns final disposition. No publication occurred.

## Required fixes

1. Preserve the existing **A Class of their Own** C3L6 title. Catalogue regeneration changed it to **C3L6 organic reactions** without authorisation. Correct the generator's accepted title/source so `write-catalogue-definitions.mjs --check` remains reproducible; a manual generated-file correction alone is insufficient.
2. Remove the answer-disclosing continuation from initial CaO correction context (`EBP-I5B9S3`). The text currently says the lattice continues beyond the fragment and represents part of a three-dimensional structure, supplying its own replacement answer. Put that explanatory detail in requested support/feedback. Retain an honest neutral diagram description and accessible ion labels.
3. Bound the CaO lattice image to an appropriate desktop width, approximately520px maximum with mobile scaling. Its current approximately1050×500px display dominates the question and displaces the response below the initial viewport. Scope the change so other activity images retain their existing sizing.
4. Display the intentionally erroneous molecular formula as **Ca₄O₄**, preserving the misconception and correct 4Ca²⁺/4O²⁻ diagram while using proper chemical subscripts. Recompute segment offsets through the existing deterministic provider and retain conditional correction marking.

These findings incorporate root's independent shared/render review and my actual live captures. The gap-mark separator is correctly encoded **U+00B7**, not a replacement-character defect.

## Independent acceptance evidence

| Gate | Evidence and disposition |
|---|---|
| All32 questions | `invariants.json`: eight gaps/eight corrections per level, permanent EBP IDs, full canonical answers reviewed against retained OCR Version3.1 May2026 2.2.2(a/b/c/f) and selected atlas source/mark-scheme records. Chemistry sound; no charge-transport requirement in questions/answers/feedback. |
| Chemical details | Alternating Ca²⁺/O²⁻ labels A=O²⁻, B=Ca²⁺; eight-ion diagram4/4; ions rather than NaCl molecules; strong electrostatic attractions/energy; fixed solid versus mobile molten/aqueous ions; correct water orientation; qualified solubility;400>250kJmol⁻¹ gives X–Z stronger. Full canonical sentence grammar checked. |
| Marking | Reviewed exact curated alternatives and typography-only normalization; one per gap; correction selection/replacement with replacement conditional on correct selection; malformed/incomplete inputs unassessed; complete wrong responses assessed. No substring/fuzzy matcher. |
| Source/diff integrity |32 implementation current/retained-baseline hashes plus5 unchanged timing/attempt/repository/revision domain hashes;236 frozen source fingerprints independently checked. Root's contract amendment is explicit. Existing correction branches after the new activity-specific branch are byte-identical. |
| Current regression tests | `current-tests.txt`:46/46 PASS independently rerun. Reviewed changed gate assertions: current counts14/43 and8/6 replace historic counts; substantive conditions remain. Historical S5 failures remain retained and are not relabelled. |
| Protected originals |1317 exact paths;794 original known hashes independently match;36 newly readable hashes match retained current report with exact frozen size/mtime;487 metadata-only records match frozen size/mtime. Historical unavailable bytes cannot be proven by hash. Frozen baseline/generic guard/raw failure remain unchanged; current supplement is explicitly limited. |
| Live independent browser | `browser-sample.json`:8 checks PASS, zero page errors. Four representative questions cover both levels/formats,1440px desktop/390px mobile, keyboard Tab/Space, complete wrong first score and immutable evidence after corrected retry. Four teacher samples cover water/bond data with no history evidence.12 actual captures retained. |
| Actual visual review | Inspected mobile gap and lattice, desktop correction and full CaO diagram, teacher water and bond tables. Charge labels/alternation and touch/focus controls are legible; no horizontal body overflow. Image sizing/disclosure/formula findings above remain. `teacher-dom.json` confirms teacher inline canonical words exist and are visible; no teacher missing-word defect. |
| Author evidence reused | Current author16 browser checks,5 actual prefix/runtime-closure checks, both builds/typecheck, real180000ms idle plateau, actual8s event-loop-stall guard, pause/reload/revision Next/statistics transfer. Hashes and meaningful tests inspected; no redundant full idle/build rerun. |
| Gem identity | `l6-t2-1-properties`, Levels1/2, fourth display position; historic `l6-t2-1-4` remains Dot-and-Cross only. Mastery tuning unchanged; no old history alias for the new gem. Shared attempts/timing/persistence/revision are reused, with teacher isolation. |

## Native browser investigation: unresolved

The ordinary Playwright author route reports every tab visible/focused. A review-owned raw installed Chrome route with `connectOverCDP({noDefaults:true})` produces genuine trusted native hidden/foreground events. The first sandbox launch failed through GPU process access denial; automatic approval allowed bounded outside-sandbox runs. CUA inventory contained no browser/native surfaces.

The deep review-owned persistent profile could not open IndexedDB. An isolated private context used the actual app and repository, but Playwright explicitly enables focus emulation for newly created contexts even when `noDefaults` is set. Removing that override still did not establish native hidden-tab state. Root authorised a final short project-owned persistent profile at `.browser/ebp-review`; it resolved the storage failure and the retained snapshot shows the actual `EBP-Y7H3M8` attempt launched. The native Start practice action timed out during its actionability wait, so the foreground-to-hidden plateau and trusted same-document freeze/resume checks did not run to acceptance. Investigation stopped as instructed.

`native-timing.json`, `native-*-failure.json`/`native-*-no-attempt.json`, `native-private-*.json`, `native-stderr.log` and `native-failure.png` retain actual observations and limitations. No command acknowledgement, private-context focus state, thread-stall result or trusted setup event is labelled a native timing PASS. Only owned Chrome processes/windows were closed; the isolated profile is retained.

## Handoff

After fixes, require current source/delta fingerprints, catalogue regeneration, targeted32-bank marking/identity regressions, both builds/closures and actual desktop/mobile CaO rendering. Native acceptance must receive real proof or the explicit user timing-exception decision required by project instructions; root determines that boundary. Author active-time review should consume any genuine later native evidence while preserving failed probes. Requested reviewer model/effort:gpt-6.1-sol/high; effective runtime settings and actual usage are not exposed and are not invented. No nested agents or implementation writes.
