# Rate Equations integration

Status: **ACCEPTED_COMPLETE by root, including independent source/render review and genuine native hidden-tab timing.** App validation and generated artifact trees were removed after independent dependency review; final checks passed. No publication or commit.

The combined app now contains `alevel/rate-equations` with four gems, each at Structured, Unstructured and Applications levels:

| Gem | Stable identity | OCR Chemistry A |
| --- | --- | --- |
|Orders & Rate Calculations|`u6-t1-2-orders`|5.1.1(a–c)|
|Rate Graphs & Half-life|`u6-t1-2-graphs`|5.1.1(d–f)|
|Rate Equations & Mechanisms|`u6-t1-2-mechanisms`|5.1.1(i)|
|Arrhenius & Temperature|`u6-t1-2-arrhenius`|5.1.1(k)|

There are18 total registrations and60 curriculum gem/level targets. Practice and revision share the existing player, scheduler, first-assessment engine, active clock, mastery and IndexedDB repository. Topic ADD ALL includes12 rate targets. Typed semantic rate laws/units, existing choice controls and analytical graph tools are preserved. Answers, marker/two pins/Arrhenius extension restore under the same attempt ID; first independent marks/time remain frozen. Teacher tools write no pupil evidence.

Source: `src/activities/alevel/rate-equations/`; authoring: [rate-equations.md](docs/authoring/rate-equations.md). Twelve accepted POC source IDs/answers and numerical seeds remain stable; display codes are RE-000001–RE-00000C. Old numeric rate IDs retain historical meaning; no redirects, historical import remapping, atlas migration or new banks. Practical methods, scattered-data best fits and broader coverage remain deferred. The DEV preview imports the same engines.

## Verification

Independent reviewer A04 found no chemical/source/shared-state/render defect.21 focused native tests, full typecheck and the18-registration production release passed.19 integrated browser checks cover all12 examples, score/reload/Next, revision, graph state, native pointer checkpoint, teacher/mobile and8 native Dexie cases. Native300-second idle,8-second event-loop suspension gap, pause/reload/same-attempt continuation, immutable first time and stats transfer passed. Desktop/mobile exports were inspected independently and by root.

Production: `dist/app`; inventory: `release/app.runtime.json`. Current initial JavaScript gzip is204753 bytes against204800; rate banks/renderers remain lazy. Historical original-app guard remains FAIL529/1320; current-run hashes show0 new drift. Existing broader fixture failures stay explicit and reproduce before/after cleanup preparation; assertions were not weakened.

**Native hidden/background gate PASS:** the independent reviewer used direct isolated Edge155.0.4283.45 and pinned Playwright1.62.1 CDP `noDefaults:true`, with a short task-owned profile and real IndexedDB write/read probe. A trusted visibilitychange showed hidden/unfocused state;3906ms hidden time added0ms. Foreground restored the same attempt, first score/time stayed fixed after edits/reload, and exactly3539ms reached Stats. The task-owned browser child exited. Earlier default-context/minimize/freeze probes were inconclusive and remain historical; the long-profile storage failure was resolved by the explicitly authorized short-profile retry. No timing exception, property override, synthetic visibility/lifecycle event, fake clock, user browser profile or OS-setting change was used.

## Reproduce

```powershell
npm.cmd run typecheck
node --test scripts/tests/rate-equations-content.test.mjs scripts/tests/rate-equations-workspace.test.mjs scripts/tests/rate-equations-links.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node scripts/review_active_question_time.mjs
npm.cmd run build
node scripts/release-s4.mjs app
node scripts/validate-s4-release.mjs app
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5261 --strictPort
# Another terminal:
node scripts/rate-equations-integration-browser.mjs
node scripts/rate-equations-integration-timing-browser.mjs
node scripts/rate-equations-hidden-window-browser.mjs
node scripts/rate-equations-review-browser.mjs
node scripts/rate-equations-native-browser.mjs
```

Keep source unchanged during real five-minute idle measurement. Durable browser scripts generate ignored `.artifacts/rate-equations-integration/`; those reports/profiles/screenshots are disposable. Preservation fixtures under `scripts/tests/fixtures/` are source inputs. The POC browser regenerates starting examples from factories instead of reading a deleted report. Native OS suspend is not claimed.

## Cleanup preparation

Necessary frozen fixtures, original teacher/source audit inputs, authority records and atlas acceptance/sample data have durable copies under `scripts/tests/fixtures/`, `resources/recall/` and `resources/source-generation/controls/`. The36 necessary copies are byte-identical to the original inputs and were rehashed after deletion. Exact consumers use the durable inputs. Generator/report output paths use `.artifacts`. A minimal76KB Maxwell historical dependency graph preserves original fixture behavior; no whole project snapshot is retained. Browser reference harnesses/reproduction runners are source-owned.

Cleanup removed the entire app `validation/` and `.artifacts/` roots: all8676 files/807330874 bytes in the approved inventory plus small final gate writes. Exact extra-write totals were not retained after a historical preview log interrupted the first pass. No bulky archive was created. Source/runtime/raw/user material and production output remain. Final strict dependency gate610files/0fail, typecheck, rate21tests, Maxwell18tests, atlas and all four1320-path no-drift guards passed; pre-existing Recall failures stayed unchanged. The release inventory hash stayed `b28fb520a5587ce74159a476bfd96b358b33f3f0dd1fb55c27a552100db348a0`. See [the concise cleanup record](docs/maintenance/recent-verification-cleanup.md) and its exact preservation/test receipt.
