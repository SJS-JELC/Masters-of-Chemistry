# S1 native background timing exception review

Job `S1-REVIEW-BACKGROUND`, agent A07, run `MASTERS-REACT-20261002`. Independent genuine-exception review only. Requested model/effort: gpt-6.1-sol/high. Effective model, effort and usage are not exposed by this worker runtime and remain unreported.

## Result

PASS: Chrome 154.0.8037.93, pinned workspace Playwright 1.62.1, fresh isolated project profile, actual Vite development harness at `127.0.0.1:5181`. Real native tab background and real Windows browser minimisation both stopped the integrated attempt's active time. Returning foreground alone did not restart it; trusted input did. No runtime source changes were made. The script compared every runtime-source SHA256 before and after its successful run and recorded no change. This closes the A03 native-background observation exception for the S1 shared foundation; it is not complete activity migration or whole-stage acceptance.

## Environment correction

Pinned Playwright's local primary source (`node_modules/playwright-core/lib/coreBundle.js`) sends `Emulation.setFocusEmulationEnabled({enabled:true})` on its internal page session. Its supported `connectOverCDP({noDefaults:true})` option skips that override for the existing default context; the installed type documentation explicitly describes this behavior. A03's external CDP-session disable command did not produce usable native state. The successful test used the supported no-default-overrides path, without issuing any focus emulation command or overriding `document.hidden`, `visibilityState`, `hasFocus`, or event trust.

An ordinary native Chrome launch attached without overrides initially remained hidden despite normal 1440×1000 bounds and tab bring-to-front; Start fixture could not pass Playwright's initialization/stability wait. Edge reproduced that condition. This hosted desktop required the standard Playwright flag `--disable-backgrounding-occluded-windows` to initialize the normal foreground window. It does not substitute a hidden property: in the successful run real inactive-tab selection and real window minimisation still produced `document.hidden=true`, `document.hasFocus()=false`, and trusted native visibility/blur events. The script also uses Playwright's normal timer/renderer background-throttling flags so its observation interval can run without changing the visibility state.

Sandboxed native Chrome launch first failed in GPU subprocess startup. The isolated process-launch escalation was approved and the successful run used that permission. No automatic approval rejection occurred. The earlier sandbox, ordinary Chrome initialization, and Edge initialization failures remain retained separately rather than presented as successful tests.

## Observed behavior

| State | Native hidden/focus | Active time |
| --- | --- | --- |
| Foreground after trusted input | false / true | 2010 ms |
| Real other tab foreground | true / false | 2010 ms |
| After 3200 ms background | true / false | 2010 ms |
| Return to tab; no interaction | false / true | 2010 ms |
| Trusted input resumes | false / true | 2995 ms |
| Actual minimized window | true / false | 2995 ms |
| After 2500 ms minimized | true / false | 2995 ms |
| Restore window; no interaction | false / true | 2995 ms |

Final assessment froze 4567 ms with a 60000 ms idle allowance. The actual shared repository/history returned one independent evidence record with exactly matching timing. Native event records are in `chrome-results.json`; all visibility/blur/focus events in that record are trusted. No synthetic visibility/focus events or overridden browser properties were used. The numeric development fixture tests the actual shared controller, timing binding, persistence and session layers; its subject content is explicitly a development fixture.

## Retained evidence and reproduction

Run from the new project root with the development server already running:

```powershell
node validation/s1/review-background/background-check.mjs chrome
node validation/s1/review-background/verify-results.mjs
```

`background-check.mjs` launches installed Chrome directly with a fresh profile under `.browser/A07/`, attaches pinned root Playwright with `noDefaults:true`, uses only the isolated existing default context, and closes its owned browser. All profile/artifact writes are inside the new project. `verify-results.mjs` deterministically checks retained native state, time conservation, evidence timing and provenance hashes. `verification.json` records exact script/result/screenshot fingerprints.

I inspected `chrome-background-restored-assessment.png`: the saved assessed numeric response, 1/1 result, one history record and 4567 ms time are readable; controls and feedback are not clipped. I also inspected the retained Chrome initialization-failure screenshot; it accurately shows the setup without an attempt. Screenshot inspection does not establish all activity layouts or chemistry bank correctness.

Retained failed diagnostics: `chrome-sandbox-launch-failure.json`, `chrome-initial-host-load-failure.json`, `chrome-hidden-launch-host-load-failure.json`, `chrome-visible-launch-host-load-failure.json`, `edge-results.json`, and corresponding initialization screenshots. Edge was a diagnostic alternative only; no Edge integrated PASS is claimed. No old app file, old browser store, root dependency/configuration, deployment, or runtime source was modified. The worker used no children.
