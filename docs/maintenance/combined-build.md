# Combined app build — 9 October 2026

The app now has one neutral `index.html` / `src/main.tsx` production entry, one Vite build at `dist/app`, and one explicit `release/app.runtime.json` inventory. A fresh browser opens A Level; the existing runtime course switch, preference storage and explicit course queries select IGCSE. Existing activity/question IDs, chemistry, course-scoped state, mastery, revision and timing implementations are unchanged. Historical `alevel.html` and `igcse.html` remain development entrypoints for retained fixtures.

Run these commands from `apps/Masters-of-Chemistry`:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run release:app
npm.cmd run check:release
npm.cmd run test:build
node --test scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node scripts/browser/combined-build.mjs
npm.cmd run preview
# Optional static hosting prefix:
npm.cmd run preview -- --port 5183 --prefix /school/chemistry/
```

The root preview is `http://127.0.0.1:5182/`. Explicit IGCSE selection uses `?course=igcse`. The existing Pages workflow builds and validates this same app inventory, then copies only its approved runtime files from `dist/app` into `_site`. No publication was performed.

## Runtime and link guarantees

The combined manifest retains all fourteen authorised activities: eight A Level (including the two Olympiad challenges) and six IGCSE. Course metadata, provenance, licensed assets, Recall isolation, Olympiad isolation, exact physical file closure, stale hashes, development/source/test exclusion, lazy boundaries and the 204800-byte complete initial shell gate remain enforced. The final build has 189 runtime files, 75 lazy JavaScript chunks and 182319 gzip bytes in its initial shell.

The old flat activity links now share one output directory. Eleven distinct flat aliases preserve all original twelve course routes; the dot-and-cross route is shared. The unqualified `activities/dot-and-cross/index.html` defaults to A Level even after an IGCSE session. Adding `?course=igcse` selects its IGCSE activity. Twelve additional aliases under `alevel/activities/` and `igcse/activities/` have explicit course ownership, which takes precedence over a conflicting query. All twenty-three aliases redirect relatively to the same root `index.html`, preserving unrelated queries, question codes and hashes under static hosting prefixes. Existing practice restore behaviour remains: a course's saved session can resume unless a supported fresh launch is explicitly requested.

The preview serves actual inventoried files and directory index pages, redirects directory URLs to a trailing slash, and returns 404 for unknown/private/outside-prefix paths. It does not use an SPA fallback that masks missing assets. Vite's `.vite/manifest.json` is retained build evidence and is excluded from the runtime package.

Old generated `dist/alevel` and `dist/igcse` directories were retired after verifying exact app-contained roots, no links, and no unlisted files against their explicit manifests. Their generated runtime manifests were removed; original bytes are retained in the worker's initial snapshot. The build's retirement guard also rejects byte/hash changes in future historical outputs, preserving unexpected or modified material for review. Unknown teacher files are never swept into this retirement.

## Verification and evidence

Evidence is under ignored `.artifacts/app-build/worker/`. `initial-git-status.txt` and `initial-source-hashes.json`, with exact initial bytes in `initial/`, distinguish this work from the broad pre-existing validation deletions and other edits. `changed-files.json` lists worker-owned changes and hashes; `source-diff.patch` compares modified files to those initial bytes. `validation.json` records the final results, and `completion.json` is the worker manifest pending foreman/root acceptance. No commit, push, deployment, sibling-app edit or dependency change was performed.

Typecheck, fresh production build, strict combined inventory, four combined build/link/preview regression tests, six revision/timing tests and the current catalogue check pass. Actual pinned Playwright 1.62.1 with Edge 154.0.4258.62 passes twelve production browser checks at both `/` and `/school/chemistry/`: neutral title/fresh A Level default, lazy initial load, course switching and persistence, acid/calorimetry launch and exact question refresh, all twenty-three aliases, explicit IGCSE dot-and-cross, question/query/hash transfer into teacher review and refresh, and the entire 189-file static HTTP closure. There are zero page errors, failed HTTP responses or failed requests. Desktop homes for both courses and IGCSE mobile homes were captured at both prefixes; the actual exported images were visually inspected for legible branding, course controls, navigation, layout and overflow. Earlier fixture-assumption failures are retained alongside the final PASS; they did not require product behaviour changes.

The existing current-input fingerprint helper now includes `dist/app`, the neutral entry, aliases and preview server. Current release, landing and Explaining Properties verifiers read the combined inventory. Retained S1/S2/S3 per-course build validators and S2/S4 stage servers explicitly identify their historical scope and direct users to current commands; their stage-specific assertions remain intact. Existing current prefix browser recipes point at the combined physical output.

Both migrated prefix recipes were also executed successfully: landing course-switch/gem-launch/save/reload and the five Explaining Properties production prefix/canonical question/runtime-closure checks. Their results are retained in `prefix-recipes.json`, `landing-prefix.txt` and `properties-prefix.txt`. `current-inputs-final.json` fingerprints the final production source/config/build closure.

## Unchanged historical failures

Root final acceptance on 9 October 2026 reviewed the shared-code diff and actual desktop/mobile screenshots, reran the strict combined release gate, and accepted the build change. Root removed one configuration-string test that mirrored implementation; the remaining three behavioural alias/preview tests pass. Earlier four-test results above remain the worker's original evidence. The root rerun used `node --test --test-isolation=none scripts/tests/combined-build.test.mjs` because sandbox process isolation blocked Node's child spawn. Current Azure build values are recorded in the app README. Final evidence: `.artifacts/app-build/root-acceptance.json`.

These results remain explicit, rather than being refreshed or labelled PASS:

| Gate | Current result |
| --- | --- |
| Broad `test-s5` | 156 tests: 99 pass, 57 fail, matching the documented baseline |
| Frozen protected originals | FAIL: the same complete set of 529 historical differences across 1320 paths before and after; metadata-only list also identical |
| Source/control baseline | FAIL: frozen twelve-activity scope and historical contract/control hashes differ from authorised current scope |
| Authored formatting | FAIL: 33 existing candidates; new `src/main.tsx` already matches the formatter |
| Retired validation dependency gate | FAIL: 17 pre-existing October 3 screenshot/cache files remain under `validation/`, also present in the initial Git status; preserved |
| Historical timing-report reader | Explicitly retired; current timing tests pass, and no fresh native suspend/idle certification is claimed for this build-only change |

The full protected difference set equality is retained in `protected-comparison.json`; the frozen baseline has not been replaced. Broad chemical and native timing baseline failures are outside this bounded build/link change. Historical reports and scope fixtures remain unchanged. Actual effective model/effort and usage were not exposed and are recorded as null.
