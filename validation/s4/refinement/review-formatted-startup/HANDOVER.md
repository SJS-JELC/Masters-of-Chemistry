# A06 — formatted scaffold startup exception

## Disposition

**PASS for exactly one unchanged full-suite continuation on the existing warm server5195.** No fixture, timeout, assertion, generation manifest, source or server configuration modification is approved or needed. Do not regenerate, restart the server or clear its cache before that continuation. Full behavioral PASS remains pending.

From `apps/Masters-of-Chemistry`:

```powershell
node development/authoring/families/dev-formatted-starter/browser.mjs
```

## Diagnosed startup class

The current manifest-bound launcher already waits for DOMContentLoaded. Its retained failure has no substantive checks/page errors and times out at30000ms. A06 preserved this failure, manifest and exact launcher before probing.

A private fresh-cache Vite server5200 uses the actual project and same config pattern (`configFile:false`, automatic optimization, actual public directory), with only port/cache changed. Installed Edge154.0.4258.48, pinned root Playwright1.62.1,1440×1000 context, imported actual fixture family and matching-length Node/browser temp mechanism reproduce the timeout. Request chronology identifies the delay:

- HTML200 arrives9989ms after navigation starts.
- Actual mount.tsx200 arrives22109ms after navigation starts.
- Optimized React DOM200 arrives39483ms after navigation starts, beyond the fixture budget.
- CSS and actual ActivityHost/module requests remain pending at the retained renderer observation. The document is interactive but has no host seam. There is one navigation and no JavaScript page error.

The server reports dependency scanning then bundling. This reproduces **cold development dependency/transform startup exceeding the navigation budget**, rather than a need for another DOM condition or an assumed profile-path fix. The original failed run has no detailed request chronology, so individual missing events in that run are not invented.

The same formatted fixture on existing5195, with the same browser/context and matching-length parent Node temp root, reaches DOM in514ms and actual host in580ms. Requests finish and the document is complete; no attempt exists and history is empty. A single resource404 console message is preserved without attribution; no JavaScript page error occurs. Nine source/fixture/configuration/manifest/host hashes are identical before and after the diagnostic.

`TEMP`, `TMP` and `TMPDIR` are set in the Node parent before browser launch, and `os.tmpdir()` is checked against each owned root. No long-path cause is presumed. The cold and warm tests differ by server/cache state, not application source or assertion code. This is a development startup limitation; production acceptance remains separate.

## Immutable proof and boundaries

`original-browser.mjs.txt` SHA matches `original-generation-manifest.json.txt` and the diagnostic's source hash. Every substantive assertion remains unchanged because the proposed continuation uses that exact executable. `verify-disposition.mjs` validates the retained failure, cold/warm chronology, same-temp mechanism, stable nine hashes and manifest binding, and records the entire assertion-tail SHA in `disposition.json`.

```powershell
node apps/Masters-of-Chemistry/validation/s4/refinement/review-formatted-startup/verify-disposition.mjs
```

A06 performed startup only; it did not repeat chemistry, fixed/seeded scoring, first timing, revision, reload or teacher behavior. The accepted earlier seven groups do not replace this instance's required unchanged full suite. Further substantive failures must be retained and diagnosed; no blind full retry is authorized by this review.

The private5200 server and owned browsers are closed. A01's existing5195 server remains untouched. No source/configuration/worker/log/progress/old-store writes occurred. Requested runtime: GPT-6.1 Sol High; effective runtime and usage remain unknown. Prior scaffold review evidence is untouched.
