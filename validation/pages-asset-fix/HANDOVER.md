# PAGES-ASSET-01

Result: PASS for the bounded missing-asset repair; root acceptance pending.

Restored `src/activities/olympiad/isomers2011/assets/compound-3.svg` unchanged
from the workspace's canonical approved NMR reference. The SHA-256 is
`07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d`,
matching the app contract, catalogue provenance and 3 October user approval.
The restored SVG parses as XML, contains 55 vector paths and no raster images.
An adjacent README records provenance and why the asset belongs in this app.
No chemistry, activity logic, dependency versions, workflow permissions or
publication settings changed.

All local Pages workflow gates passed: clean locked dependency installation,
typecheck, both course builds, both release inventories and release validation.
The workflow's manifest-driven copy loop packaged 134 approved A Level runtime
files. The spectrum is `assets/compound-3-DdOWRYfB.svg` in that package, with the
same approved SHA-256 and 80,083 bytes. Both build graphs resolved all imported
inputs. Current inventories/checks are retained here; historical release and
integration evidence was restored byte-for-byte after verification.

Microsoft Edge 154.0.4258.53 loaded the packaged challenge under the
`/Masters-of-Chemistry/` prefix. The image decoded at 1152 x 624, its served bytes
matched the approved hash, and desktop/mobile/zoom/direct-reload checks passed
with no page errors. A01 visually inspected `spectrum-zoom.png` and
`spectrum-mobile.png`: the complete approved spectrum renders, including all
expansion frames, descending axes and integral values. Mobile inline labels are
small at the existing card size; the existing zoom control provides enlargement.

Sibling integrity: the historical `protect-originals.mjs` check failed against
its old 2026 baseline before substantive validation. Its result is retained in
`original-app-check.json`; it was not relabelled or repaired. A separate complete
repair-local before/after comparison passed across 1,320 sibling-app files,
including Git metadata. No sibling build or mutation occurred.

Environment limits: local Node was 24.19.0; the Pages workflow pins 24.13.1 on
Ubuntu. This is a local reproduction of its build/release/package steps, not an
executed GitHub Actions run. Canonical npm-registry TLS requests reset. After
retained caches proved incomplete, 27 applicable tarballs from
`registry.npmmirror.com` passed their exact package-lock integrity checks and
populated only the app-local cache; `npm ci --offline` then passed. Earlier
permission/network/cache failures remain in the logs. No versions or lockfile
were changed; dependencies were restored before completion.

Reproduce from this app root:

```powershell
npm ci
node validation/pages-asset-fix/workflow-checks.mjs
node validation/pages-asset-fix/browser.mjs
node validation/pages-asset-fix/protected-apps.mjs
```

The browser check uses the pinned parent-workspace Playwright dependency read
only. Runtime builds and release generation are self-contained within this app.
Generated package files remain under the already ignored `.browser/` directory.
For this environment's registry outage, the retained recovery script verifies
the exact lockfile tarballs before `npm ci --offline --cache .npm-cache`.

Changed paths are limited to the restored spectrum and its README, this evidence
directory, and the authorized append-only workspace swarm log. No commit, push,
deployment or publication occurred. The SVG and adjacent README are currently
untracked and must be included in the eventual repair commit.
