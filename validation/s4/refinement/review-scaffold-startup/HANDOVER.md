# A06 — scaffold browser startup exception

## Disposition

**PASS for one narrowly reviewed harness continuation**, not a completed scaffold behavioral PASS. A20 still must run the full fixed/seeded/first assessment/timing/revision/reload/Next/teacher suite. No chemistry, generated provider, shared runtime or configuration change is proposed.

The exact initial-navigation change in the generated starter's `browser.mjs` is:

```js
await page.goto(url('fixed'), {waitUntil:'domcontentloaded'});
await ready();
```

`ready()` remains the existing actual `window.__mastersActivity` wait. All subsequent interactions and substantive assertions are byte-identical. No timeout increase or shortened browser temp path is required by the current evidence. Generate the fixture/configuration before testing and hold the preview server stable during the continuation.

## Retained failures and uncertainty

The original initial and restarted navigation failures have empty checks/page-error lists and time out after 30000 ms waiting for global `load`. They remain failures, copied unchanged with hashes. HTTP200 and no page error alone do not establish a working application. The earlier generated-tsconfig/cache reload explanation is reported by A20; the retained failure JSON has insufficient navigation/request chronology to assign an exact cause independently. These old stalls remain **unclassified**.

A20's short-temp diagnostic successfully loads the real host, but simultaneously changes navigation from `load` to `domcontentloaded`. It therefore does not isolate path length as the cause. No unsupported Windows path-limit diagnosis is made.

## Independent controlled startup evidence

Root-pinned Playwright1.62.1, installed headless Edge154.0.4258.48, the same1440×1000 browser context and actual existing preview5195 were used. Two reviewer-owned temporary roots have length200 (matching the failed worker root) and172. Parent Node `TEMP`, `TMP` and `TMPDIR` are set before launch; `os.tmpdir()` is asserted and recorded as the corresponding root, matching the worker's mechanism. Disk cache also stays under each owned root.

Corrected diagnostic results:

| Root | DOM ready | Actual host ready | Global load | Navigations | Page errors |
| --- | ---: | ---: | ---: | ---: | --- |
| Long200 | 1134 ms | 1172 ms | 1173 ms | 1 | none |
| Short172 | 1041 ms | 1110 ms | 1110 ms | 1 | none |

Seven watched generated fixture/manifest/configuration/mount/server/host hashes are unchanged throughout. Both actual snapshots have no attempt and zero history; no practice or chemistry interaction was performed and no timing/mastery evidence was created. The corrected screenshots were inspected and display the actual development catalogue/host setup. Both owned browsers are closed; the A20 server was neither changed nor stopped. No native foreground was used.

The long profile-root length is **not reproduced as a sufficient cause** in this stable-server comparison. Cache is warm, so this is not a reconstruction of the original cold optimizer state. Both global load and host readiness succeed now; that does not retroactively classify the earlier missing events.

The initial reviewer probe set browser-process environment/cache paths but not Node's temp root, so it could not isolate Playwright's generated user-data path. It remains unchanged as `diagnostic-browser-env-only.json`, with its script and preliminary disposition retained. `setup-clarification.json` records the one bounded correction. Final inference uses only `diagnostic-corrected.json` and explicitly verifies Node's temp root.

## Validation and ownership

`proposed-browser.mjs.txt` differs from the immutable retained launcher only by the initial DOM lifecycle condition. `retain-and-verify.mjs` verifies that exact change, identical full substantive assertion tail, original failure records, corrected diagnostic identities/limits and stable source hashes. It reports PASS. Detailed fingerprints are in `disposition.json`.

```powershell
node apps/Masters-of-Chemistry/validation/s4/refinement/review-scaffold-startup/retain-and-verify.mjs
```

All reviewer outputs are in this owned review directory. No worker file, source/configuration, log/progress, old app/store or publication write occurred. Requested model/effort: GPT-6.1 Sol High; effective runtime and usage remain unknown. Subsequent substantive fixture failures require a concrete disposition, not blind retries or relaxed assertions.
