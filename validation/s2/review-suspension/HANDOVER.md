# A06 — S2 suspension exception disposition

**Independent disposition: PASS.** Both outstanding real dot-and-cross idle gates pass. Trusted same-document native freeze/resume boundaries prove zero active-time accrual across a 6,707 ms frozen interval. No timing source fix is indicated.

## Native evidence

| Gate | Real wall interval | Active delta | Result |
| --- | ---: | ---: | --- |
| Dot-and-cross level 1 idle | 182,233 ms | 180,000 ms | PASS |
| Dot-and-cross level 3 idle | 302,231 ms | 300,000 ms | PASS |
| Trusted native freeze → resume | 6,707 ms | 0 ms | PASS |

The idle tests use the full real A Level host, real bank questions, actual controller, Dexie repository and practice session. The preceding trusted key event and both visible/focused browser observations are retained. The documented idle allowance is exhausted exactly, then remains stopped; trusted input resumes timing. Both assessed first responses/timing/marks survive reload with exactly one saved evidence record. Next creates a different attempt ID, fresh time under 1,200 ms, and the level-appropriate 180,000/300,000 ms allowance.

For suspension, the same document token, time origin and attempt ID are present at trusted `freeze` and `resume` events after application event handlers. Both show active time **1,011 ms** and hidden browser state. Wall and monotonic timestamps show more than 6.5 seconds between those events, with no intervening trusted key or navigation. This is direct boundary evidence for the frozen interval, independent of one-second UI sampling.

## Later DEV replacement is separate

Immediately after the clean native resume, Vite logs “server connection lost. Polling for restart...” and reloads the page. Navigation is recorded after the resume event. The later snapshot has a new document token and time origin. The strict post-thaw same-document assertion correctly fired; `results.json` retains its native execution status **ESCALATE** and guard failure unchanged.

`verify-results.mjs` independently checks the trustworthy same-document freeze/resume boundaries, both completed idle/persistence/Next cases, and the subsequent replacement evidence. It writes `disposition.json` with **PASS**. This does not relax or remove the failed guard: the frozen interval and later replacement are assessed separately using explicit timestamps, trusted events and document identities.

## Original A07 996 ms remains unclassified

The original failure is retained unchanged at `validation/s2/review-native/tail-results.json`, linked by its SHA-256 in this review. A07's performance.now falls from 14,494.8 ms to 1,132.5 ms and its diagnostic event list resets. That supports a replaced-document concern, but A07 did not retain the needed time-origin, navigation and native boundary records. The 996 ms cannot be assigned conclusively to legitimate pre-freeze elapsed time or actual frozen accrual. Do not label that interval as either. The independent evidence above resolves the source-behaviour gate without inventing A07 measurements.

## Reproducibility and retained limits

- From workspace root: `node apps/Masters-of-Chemistry/validation/s2/review-suspension/native-check.mjs`; then `node apps/Masters-of-Chemistry/validation/s2/review-suspension/verify-results.mjs`.
- Installed Chrome 154.0.8037.93 via pinned workspace Playwright 1.62.1, GPU-safe launch and `connectOverCDP({noDefaults:true})`; isolated new-project `.browser/a06s2-*` profile and unique database run IDs.
- The first sandbox launch failed before opening an activity: GPU subprocesses exited with access denial and Chrome terminated. `first-setup-failure.json` and `first-setup-browser-stderr.log` retain that evidence. The one bounded launch retry used tool-approved escalation; it completed both idle gates.
- All source fingerprints remain unchanged during this review. The timing files also match A07's original source hashes. No source, contracts, originals, original stores, logs, progress or configuration were modified.
- Runtime model/effort and usage are not exposed; requested Sol 6.1 High is recorded, actual measurements remain unknown.
- `dot-180000-assessed.png` and `dot-300000-assessed.png` were visually inspected for assessed score, saved result and timing presentation. They were captured just after reload and include the lazy-editor loading placeholder; they are timing evidence, not a full workspace-render acceptance claim.
- The later DEV replacement prevented a sustained same-document post-thaw foreground check in this optional probe. The trusted native freeze/resume boundary check is complete. Both long idle cases independently verify trusted-input restart; earlier accepted acid/structure/background/minimized/pause checks were not repeated.
- No broader chemistry, all-browser, publication or complete activity acceptance is claimed by this exception review.
