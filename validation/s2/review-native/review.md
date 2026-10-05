# S2 native launcher and active timing exception review

Job `S2-REVIEW-NATIVE`, A07, `MASTERS-REACT-20261002`. **ESCALATE: retained checks pass, but dot-cross three/five-minute native idle tests remain unrun and the explicit CDP freeze/thaw probe has an unresolved boundary observation.** Root owns stage acceptance. Requested model/effort: gpt-6.1-sol/high; effective settings and usage are not exposed.

## Launcher correction

The acid owner's two failures occurred before the host loaded: Chrome GPU subprocesses exited `-1073741790`, followed by `FATAL ... GPU isn't usable` and CDP disconnect1006. Those are process/setup failures, not runtime failures. The A07 launcher succeeded using installed Chrome154.0.8037.93, a short owned `.browser/a07s2-*` profile, `--disable-gpu`, and approved native process-launch escalation. It retained the accepted S1 setup: pinned root Playwright1.62.1, direct Chrome process, `connectOverCDP({noDefaults:true})`, existing default context, and `--disable-backgrounding-occluded-windows`. No synthetic visibility/focus properties, fake event trust, injected clocks, or time acceleration were used. No approval rejection occurred.

## Retained results

| Real activity | Actual wall idle | Active idle delta | Native tab/minimise | Assessment/restore/Next |
| --- | ---: | ---: | --- | --- |
| Acid, one-minute source template |61727ms|60000ms|PASS|PASS; first time67909ms, one record |
| Structure, open explanation, three minutes |181764ms|180014ms|PASS|PASS in authorised saved-attempt tail; first time217240ms, one record |
| Dot-cross Level1, three-minute allowance |Not run|Not run|PASS|Not reached by this review |
| Dot-cross Level3, five-minute allowance |Not run|Not run|Not run|Not reached by this review |

For acid/structure, genuine visible/focused documents ran through at least the complete source idle allowance, then active time remained fixed without input. Native other-tab selection and actual minimized window bounds yielded hidden=true/focused=false with trusted visibility/blur events. Neither return-focus-only nor window-restore-only restarted timing; trusted keyboard/input did. Pause/reload preserved attempt ID, source question/ref, response and measured time. First submission froze timing, saved evidence matched it, reload retained one immutable first result, and scheduler Next created a fresh attempt with fresh timing.

Structure used an honestly uncertain explanation and negative rubric decisions. Its0/6 result is deliberate; this review tests timing/persistence, not independent correctness of every source answer. The freeze happened before sequential rubric review. I inspected the saved screenshot: the0/6 feedback, one saved practice result, measured3:37 time and217240ms development readout agree and are legible. The acid assessed screenshot has readable1/1 feedback, one evidence record and67909ms. The final dot failure screenshot shows a saved answering diagram, matching4263ms; it establishes no correct sodium-iodide structure or assessment PASS.

## Preserved failures and continuation

1. `a07s2-murncnj4-results.json` and `native-check-initial-thaw-sequence.mjs`: native lifecycle thaw kept the target hidden; trusted input correctly did not resume. One clarified sequence restored actual tab foreground after thaw.
2. `a07s2-murneguj-results.json` and `native-check-selector-failure.mjs`: acid completed; structure's native/idle checks completed. A post-idle exact-label selector failed after textarea reload despite the saved field/ref/answer being present. Parent explicitly authorised a scoped-textarea continuation and preservation of passed long intervals.
3. `a07s2-tail-murnsp64-results.json` and `native-tail-check.mjs`: structure resumed from the same owned profile/database/attempt and completed first-freeze, rubric, reload and Next. Dot-cross Level1 passed native tab/minimise behavior, then stopped at the explicit lifecycle assertion. No further retry was self-dispatched.

The dot lifecycle probe recorded3267ms before `Page.setWebLifecycleState(frozen)`,6500ms frozen plus1100ms after `active`, and4263ms afterward:996ms more than the strict pre-freeze snapshot. Native state then was hidden=true/focused=true. All three activity probes lost the diagnostic `window.__A07Events` global after CDP lifecycle thaw (eight native events before, zero after); ordinary tab/minimise phases retained those events. **Inference:** the explicit lifecycle/DEV environment may reinitialize the document, making the delta restored-host startup time rather than time accrued while suspended. A navigation/reinitialization cause was not conclusively captured, so this is not a proved clock defect or suspension PASS. The previously accepted pure/shared suspension semantics are not being rewritten.

Parent's final instruction required a concrete escalation after any substantive tail failure, with no further self-retry. The browser is closed and native foreground ownership is released. A separately authorised remaining-idle test can preserve valid acid/structure intervals and run the dot3/5-minute gates without placing the unresolved optional CDP lifecycle experiment ahead of them. The strict lifecycle failure must remain explicit unless independently resolved.

## Source integrity and evidence

Each native segment compared all runtime-source fingerprints before/after and recorded no changes during its own execution. An explicitly authorised UI mutation window occurred between the initial and tail segments. `partial-verification.json` records its six changed paths and verifies that the shared attempt/timing sources and carried acid/structure activity sources remained identical. Dot-cross observations used final sources entirely; none were carried across that mutation window. The failed full `verify-results.mjs` design was never run because full success was not reached. `verify-partial.mjs` passes only the retained checks and keeps overall ESCALATE.

Commands from the new project root, with the Vite host running:

```powershell
node validation/s2/review-native/native-check.mjs chrome
node validation/s2/review-native/native-tail-check.mjs chrome a07s2-murneguj-results.json
node validation/s2/review-native/verify-partial.mjs
```

The first command reproduces the failed broad probe; the second is the exact authorised tail against its retained profile/database and must not be mistaken for a clean fresh run. Detailed results contain exact launch flags, profile, source fingerprints, native window/focus states, wall times and script hashes. Stderr logs and failure screenshots are retained. All writes belong to the owned review folder or owned isolated project profiles. No runtime source, original app/store, root dependency/configuration, deployment, swarm log or progress file was edited. No children were used. These native samples do not establish complete chemistry-bank, revision, accessibility, build or statistics-chart acceptance; the activity owners and stage gates retain those responsibilities.
