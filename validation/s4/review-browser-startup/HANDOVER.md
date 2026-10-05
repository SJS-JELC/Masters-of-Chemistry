# A06 — S4 browser startup exception

## Disposition: PASS for one harness continuation

Add **`react/jsx-dev-runtime`** to A18's existing explicit `optimizeDeps.include` in `validation/s4/statistics/browser.mjs`. Keep `noDiscovery:true` and every existing host/statistics assertion. The exact proposed launcher is retained in `proposed-browser.mjs.txt`; A06 has not modified A18's file or application/configuration source.

```js
include:['react','react-dom/client','react/jsx-runtime','react/jsx-dev-runtime','dexie','zustand','zustand/vanilla']
```

This approves one reviewed A18 continuation of the full existing browser suite. It does **not** establish that the statistics behavior has passed. A substantive failure after the host starts must remain explicit and be routed normally; do not relax assertions or repeat environment retries blindly. Production build remains a separate gate.

## Evidence establishing the cause and exact fix

Installed React19.3.0 exports `./jsx-dev-runtime`, whose entry is CommonJS and delegates to a CommonJS implementation with `exports.jsxDEV`. Installed Vite8.3.2 transforms this actual TSX harness in development to use that runtime. Vite's local `index.d.ts` states that `noDiscovery:true` optimizes only included dependencies and CommonJS-only dependencies must be included during development. Existing explicit inclusion of `react/jsx-runtime` does not include the separate development entry.

A18's retained second failure reports raw `/node_modules/react/jsx-dev-runtime.js` lacking named ESM export `jsxDEV`. Its network evidence confirms that URL. The host read seam never appeared, so no application assessment/statistics assertion ran.

Isolated port5198, owned cache, actual unchanged harness and installed dependencies reproduced both transforms:

- Unfixed: `import { jsxDEV as _jsxDEV } from "/node_modules/react/jsx-dev-runtime.js?..."`; served body is raw CommonJS without ESM exports.
- With only the added include: Vite default-imports optimized `react_jsx-dev-runtime.js` and obtains `["jsxDEV"]`. The optimized file exports `default require_jsx_dev_runtime()`. Independent ESM import of that generated artifact succeeds, and `default.jsxDEV` is a function.

Thus the retained import failure is a launcher prebundle omission, not evidence of a production application defect. The first cold-navigation timeout has no sufficient causal data and remains unclassified. Both original worker failures and network records remain unchanged.

## Retained reviewer failures and boundaries

`setup-failure.json` preserves a pre-server fingerprint-enumeration error (nonexistent `src/runtime`); its bounded clarification uses actual `src/domain`.

`execution.json` preserves the optional probe's failed reviewer extraction/assertion: the fixed transform coalesces multiple imports onto one line, so a generic first-URL parser selected React DOM rather than the development JSX module. It also required named-export syntax although Vite uses valid default CommonJS interop. The narrow independent `verify-disposition.mjs` selects the exact JSX import, verifies that interop and imports the generated module. **No browser was launched or host/statistics assertions performed by A06.** Port5198 was closed; no foreground reservation was used.

`source-guard-failure.json` preserves a strict all-fingerprint mismatch for `tsconfig.json`. Exact SHA reconstruction proves its only change adds `validation/s4/**/*.ts` to `include`; compiler options are identical. A01 explicitly confirmed ownership and this scope. All other 39 watched runtime/statistics/foundation/domain/repository/dependency/worker-harness/failure fingerprints are unchanged. No whole-config unchanged claim is made.

## Verification

```powershell
node apps/Masters-of-Chemistry/validation/s4/review-browser-startup/verify-disposition.mjs
```

Result: PASS; 40 fingerprints accounted for, exact single-entry proposed diff, unchanged complete assertions-tail SHA, corrected generated ESM import and function confirmed. Detailed fingerprints are in `disposition.json`; raw transformed modules, generated cache and failures remain separate.

Requested model/effort: GPT-6.1 Sol High. Effective runtime and usage are not exposed and remain unknown. No app-source/configuration/worker-file/log/progress/original-store changes or publication were performed.

## Post-review guard follow-up

A01's 02:33 UTC rerun of the original strict verifier detected `src/foundation/ActivityHost.tsx` changing after the 02:31:49 UTC disposition, in addition to the already classified tsconfig inclusion. That failure is retained in `foreman-guard-failure.json` as a parent-reported event; raw foreman tool output was not available to A06. The original verifier and disposition remain unchanged and correctly do not claim that the current host matches the earlier source hash.

A17 directly confirmed the edits since that disposition: restored sessions open setup when the explicit practice/revision view differs from the persisted mode; selecting a different mode opens suitable setup after pause/flush; Resume collapses setup; paused save errors provide Retry save. A17 reports imports and `__mastersActivity` API unchanged and no timing/controller/persistence algorithm edits. A01 separately confirmed sole A17 ownership and the broader queued save-failure safety work. These are owner reports; the prior full host content was not retained, so A06 cannot independently reconstruct the exact host diff. The earlier hash and a new immutable current-host copy/hash are retained in `followup-disposition.json` and `post-review-current-host.tsx.txt`.

`verify-retained-artifacts.mjs` independently checks the immutable earlier transformed harness/generated JSX module, imports that ESM module, and checks the untouched original/proposed launcher, complete assertion tail, installed dependencies, Vite config and original failed records. It reports the two live changed paths explicitly and makes no current-host unchanged claim. Result **PASS for the same single-entry harness continuation**. Current host/UI behavior remains pending the full A18 suite. The known raw CommonJS missing-export cause and exact prebundle fix are independent of those host UX edits; no additional browser/source test or retry was performed.

Follow-up reproduction:

```powershell
node apps/Masters-of-Chemistry/validation/s4/review-browser-startup/verify-retained-artifacts.mjs
```

Final follow-up manifest: `followup-completion.json`. The earlier `completion.json` records the earlier point-in-time review.

## Pause/reload readiness exception

The reviewed prebundle continuation starts the actual host and reaches pause/reload after the earlier correct/partial, correction, reveal and assessed-reload assertions. Its next retained failure at `browser.mjs:57` is `TypeError` reading `currentResponses` from a null restored attempt; `errors` is empty. This sequential progress is not a completed scenario PASS.

Actual retained host source applies the loaded session to `sessionRef`, then awaits `repository.loadAttempt` and `resolve` before applying the attempt to `stateRef`. The DEV `flush` waits pending commands and the save queue, not that initialization task. Therefore the fixture's session-paused-only wait may finish during legitimate asynchronous restoration with `attempt:null`.

Approve adding the restored **same attempt ID** to the readiness predicate:

```js
await page.waitForFunction(id => {
  const snapshot = window.__mastersActivity?.snapshot();
  return snapshot?.session?.paused === true && snapshot.attempt?.attemptId === id;
}, paused.attempt.attemptId);
```

Keep every following response, identity and exact active-time assertion unchanged. Missing or wrong restored identity still causes the readiness wait to fail; wrong restored response/time still fails the original assertions. This is a readiness condition, not weaker restoration acceptance. No application restore failure is established by the earlier null access, and restored correctness remains pending A18's full assertions.

Immutable copies of the failure JSON/network/screenshot and host source are retained under `pause-readiness-*`. The screenshot taken after the exception displays restored paused UI; it is not the exact failing snapshot. A18's source changed to this condition during capture; that current script copy is retained separately. Comparison uses the earlier immutable approved launcher as the baseline and accounts for this wait plus the parent's separately tracked elapsed-metadata correction (measure after the scenario finishes); assertions are identical. The capture's resulting pre-edit-needle guard failure is preserved in `pause-readiness-capture-failure.json`. A separate strict full-script diff initially detected the elapsed correction, retained in `pause-readiness-metadata-guard-failure.json`.

`verify-pause-readiness.mjs` PASS verifies immutable copies, actual host ordering, exact readiness-only proposal and captured worker edit with separately accounted metadata correction, and identical entire assertion tail. No browser/source actions or broad review were performed. Final manifest: `pause-readiness-completion.json`.

## Saved-history publication readiness exception

The next retained A18 execution passes the pause/reload response, same-ID and exact-time assertions, then reads `snapshot.history.length === 2` immediately after the third first assessment when it expects 3. It reports no page errors. The subsequently captured and inspected screenshot shows the real zero-mark third assessment, “Saved on this device” and three saved results. This is later UI evidence; exact repository contents at the failing assertion were not independently inspected.

Actual immutable host source awaits `repository.saveCurriculum` and then `loadHistory`, but `loadHistory` schedules `setHistory(result.value)`. The DEV snapshot closes over React's history/saveStatus state in an effect. Its `flush()` waits commands and the save queue, not React's next render/effect publication. That ordering permits a stale snapshot history after a completed save. These observations establish a fixture-publication race as a valid explanation; they do not establish a repository integrity failure or prove every stored value correct.

Approve this exact `assess` helper addition after existing phase readiness and `flush`:

1. Read expected frozen attempt ID and independent-evidence eligibility using the actual exported `assessmentToEvidence(snapshot.attempt)`.
2. Wait for the same current ID and `saveStatus.kind === 'saved'` in the published snapshot.
3. For independent first assessments, require that ID in history. For assisted/revealed assessments, require its absence.
4. Return the snapshot, then run **all unchanged** count/identity/time/duplicate/chart assertions.

Using the actual evidence policy handles score-zero independent attempts correctly and does not treat score as a proxy for eligibility. No fixed sleep, fabricated evidence or relaxed count is proposed. Save failures or missing independent evidence still time out; subsequent exact response/time/count failures remain substantive.

The complete proposal is `history-readiness-proposed-browser.mjs.txt`. Immutable third-failure JSON/network/screenshot, host and evidence-policy source are retained in `history-readiness-*`. `verify-history-readiness.mjs` PASS verifies their hashes, source ordering and exact helper-only diff; every later scenario/assertion byte is unchanged. Behavioral acceptance and repository/chart correctness remain pending A18's unchanged suite. No new browser/source actions or broad review occurred. Final manifest: `history-readiness-completion.json`.
