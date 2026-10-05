# A06 — S3 timing exception review

## Disposition

**PASS**, independently verified by `verify-results.mjs`, with the original failed executions preserved. This is a source-specific timing review, not a new chemistry/editor review. Requested runtime: GPT-6.1 Sol High; effective model, effort and usage are not exposed and remain unknown.

Native installed Chrome 154.0.8037.93 used root-pinned Playwright 1.62.1, an isolated new-project profile, `noDefaults` CDP connection and GPU-safe launch. All browser processes and the reviewer-owned 5188 server are closed; foreground ownership is released. No application source/configuration, old app/store, publication, progress or log writes were performed by A06.

## Main observable results

- Actual calorimetry `lower-10-3:1`: trusted native freeze/resume boundaries span 6598 ms with **zero active-time delta**, stable document token, timeOrigin and attempt ID, and no navigation. Focus-only remains stopped; trusted input restarts timing.
- Actual titration `u6-t1-1-9:2`: native background and minimized windows exclude time; restoring focus alone does not restart timing. Trusted input restarts it. Trusted freeze/resume spans 6601 ms with zero delta and stable document/attempt identity.
- Titration pause/reload restores the exact attempt ID, question reference, semantic curve response and timing. Trusted interaction resumes it.
- **Real wall idle 602244 ms produced exactly 600000 ms of active accrual**, matching the actual source allowance. Same document, visible/focused native state and trusted last-input evidence are retained. Overrun remains excluded, then trusted input restarts accrual. No mocked time/visibility or accelerated wait was used.
- The checked bank answer travelled through the actual provider/controller response command and UI assessment. First assessment scored 6/6 and froze **610428 ms**. Wait, input, correction and reload preserved it. Exactly one history entry retains the identical timing. Next creates a fresh attempt with zero time and the same 600000 ms allowance, without another history entry.
- No page errors. `titration-assessed.png` was visually inspected: actual rendered curve, 6/6 result, one saved result and first timing are visible.

Raw data: `results.json`; independent PASS: `disposition.json`.

## Preserve and distinguish failed probes

1. A12's `validation/s3/thermochemistry/timing-browser-results-ordinary-freeze.json` remains unchanged (SHA retained and checked). Its 9005-vs1001 observation lacks trusted same-document freeze/resume boundaries. The missing interval remains **unclassified**. Independent native boundary evidence establishes correct source behavior without inventing attribution for the earlier interval.
2. A06's first 5187 probe proves equal time at trusted freeze/resume boundaries, then fails a strict post-thaw document guard after Vite reports a lost server connection and reloads. `first-vite-replacement.json` and script remain unchanged. The later replacement is distinct from the clean suspension boundary proof.
3. The final main raw execution is still **ESCALATE** because its conservative broad source-prefix guard detects unrelated worker changes. Independent source review preserves that failure and verifies all 18 critical selected runtime/clock/controller/provider/core paths unchanged. `source-boundary-proof.json` records the exact 11 unrelated changed paths. The bond provider change is an unselected lazy module; the olympiad contract emits only `export {};`. Parent confirmed their respective announced owners and scope. The whole source tree is not claimed unchanged.

The reviewer-owned `serve.mjs` runs the actual application with an isolated Vite cache. It removes the injected lifecycle client and supplies a CSS-only `/@vite/client` helper, because `hmr:false` alone still loads a reconnecting client. This development-host adjustment avoids reload interference; application timing, lifecycle bindings, provider, controller and repository remain unchanged. The first isolated launcher briefly initiated normal new-project Vite dependency-cache optimization before its cache was isolated; no source/dependency/config edits were made. This is development-host native proof, not a production-prefix claim.

## Additional energy/practical native tail

Actual energy `lower-10-1:2` and practical `lower-10-2:2` use source allowance 180000 ms. Both pass native background/focus-only exclusion, trusted restart and same-document suspension: 6601 ms and 6598 ms respectively, with zero frozen accrual. Energy pause/reload restores response/time/reference/ID, and trusted input resumes it.

`energy-results.json` retains its **ESCALATE**: the generic practical Tab restart produced a trusted keydown followed immediately by trusted window blur. Focus returned without another trusted input, so the clock correctly stayed stopped. A bounded continuation in `practical-continuation.json` reopened the same saved practical attempt `9a61c3ee-2e67-4254-914e-888328f18a0c`. Focused-control trusted ArrowLeft without window blur restarted time; pause/reload preserved exact response/time/reference/ID; trusted resume advanced it. No independent assessment/history evidence was created. Seven selected practical runtime hashes remained unchanged and matched the preceding execution. `energy-disposition.json` independently verifies both raw evidence and the same-ID continuation as PASS.

`energy-native-tail.png` and `practical-native-tail.png` were visually inspected: full actual activity response controls, zero saved independent results, restored practical response and matching practical attempt ID are visible. No additional long idle was repeated.

## Carried evidence and limits

A11's `validation/s3/electrons/timing-browser-results.json` supplies actual headless source-specific 60000/180000 ms idle cutoff, restart, first timing/reload and exact repository transfer. Its SHA and reported checks are verified. Its headless requested freezes still ran renderer timers, and native background was unobservable; those are not reclassified as native passes. Unchanged shared host/clock binding and accepted S1/S2 native references are explicitly carried alongside A06's new native proof, as authorized by the parent. No A11-specific native session or further long wait is claimed.

Real titration long idle was level 2; both supported levels share the same source 600000 ms allowance. Full stats chart remains S4; this gate verifies exact repository transfer. A14 chemistry/editor proof remains separate. Original S1/S2 accepted evidence, including the unclassified A07 996 ms probe, is not rewritten.

## Verification and reproduction

Final independent verification command from repository root:

```powershell
node apps/Masters-of-Chemistry/validation/s3/review-timing/verify-results.mjs
```

Output: main PASS, seven checks, realWallMs 602244, activeDeltaMs 600000; energy/practical tail PASS, freeze intervals 6601/6598 ms, two A11 carried results. The verifier retains raw failures rather than editing them into passes.

Owned evidence scripts: `serve.mjs`, `native-check.mjs`, `energy-sample.mjs`, `practical-continuation.mjs`, `first-vite-replacement.mjs`. Their isolated run IDs/profiles and precise interaction/assertion sequences remain in the scripts. Repeating the ten-minute run is unnecessary for acceptance of this retained proof. Review the explicit raw-probe failures before rerunning their scripts.
