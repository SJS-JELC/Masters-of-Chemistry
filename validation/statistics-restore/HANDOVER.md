# STATS-RESTORE-01 — A01

## Change

Restored the original statistics presentation in React for A Level and IGCSE:
1180 px layout, course-specific Your Stats header and shared eagle/back arrow,
original five overview cards, year filter and All time/Day/Week/Month controls,
daily stacked active-time chart with axis/date labels and accessible selected-day
breakdown, expandable landing-order topics/gems, level-coloured mastery bars and
threshold marker, unavailable levels/gems, outcome count squares and the latest
20 results in chronological order per gem. Result focus/click shows question code,
level or configured grade band, date, outcome and recorded time. Earlier practice
is a simple collapsed summary. Detailed/raw answer and technical history UI is
removed. The default period is All time; Day is the rolling last 24 hours.

Period counts/time remain separate from all-time mastery. Existing namespace,
deduplication, alias and progression boundaries are retained. Olympiad evidence
is explicitly excluded. No schema, importer, mastery algorithm, dependency or
publication change was made. The statistics read has its own repository lifetime
and stale-read guard; React StrictMode no longer closes a reused repository before
its next read.

## Changed source / generated outputs

- `src/statistics/StatisticsView.tsx`
- `src/statistics/model.ts`
- `src/statistics/statistics.css`
- `src/foundation/ProductionFoundation.tsx` — statistics has its own header/shell;
  import keeps the original generic shell.
- `release/alevel.runtime.json`, `release/igcse.runtime.json` — freshly generated
  runtime manifests after both builds.
- `validation/statistics-restore/` — retained source-before copies,
  `source-diff.patch`, exact before/after hashes, source provenance, tests,
  browser screenshots/results and correction/environment evidence.

`source-diff.patch` is relative to the task-start source snapshots, preserving
the earlier Olympiad/topic/editor changes. The original siblings are read-only.
`provenance.json` fingerprints both original stats.html/CSS/UI/core sources.
The shared original CSS is fully scoped; no global outcome class is introduced.

## Checks completed

- `npm.cmd run typecheck` — pass (`typecheck.txt`).
- `node --test validation/statistics-restore/model.test.mjs validation/s4/statistics/model.test.mjs scripts/test_active_question_time.mjs`
  — 16 tests pass, including all 273 retained mastery equivalence cases; year and
  period/topic counts; correctness percentage; supported denominators;
  unavailable grades; latest-20 ordering; aliases/deduplication; untimed records;
  historical progression; source timeline equivalence; 23/25-hour DST days.
- `npm.cmd run build` — both course builds pass (`build.txt`).
- `node scripts/release-s4.mjs alevel` / `igcse`, then task-owned calls to
  `validateRelease` — pass (`release-checks.json`). Initial gzip sums are
  181280 / 181280 bytes after root's wording polish. Historical S4 check reports
  were not overwritten.
- Original preservation — 794 readable hashes unchanged; all 523 existing offline
  placeholders checked by stat only, never opened/hydrated. `original-preservation.json`.
- Headless pinned Playwright 1.62.1 / Microsoft Edge, Europe/London:
  `browser-results.json` retains seven final post-polish successful scenarios for populated
  and empty desktop/tablet/mobile views, original layouts, filters, keyboard
  chart/result/back interactions and Retry. Screenshots are retained at this level.
- `timing-browser-results.json` — actual A Level acid and IGCSE calorimetry first
  assessment, immutable save/reload, timing conservation into card/chart and
  question-code result detail pass. Existing DEV hooks issue answers to the real
  controller; trusted browser interaction and the real clock supply timing.
- `release-browser-results.json` — fresh production builds pass nested-prefix
  statistics/header/back and import-shell checks for both courses; DEV hooks absent.

The final post-polish source hashes used in build/release validation are in
`changed-files.json`; no source was changed after that build. The previous IGCSE
browser checks also explicitly compare all five Month card values with the
original source and confirm that reading/filtering/navigation leaves saved evidence
unchanged. Final browser checks after wording polish pass for both courses; source fingerprints remain identical to the successful build.

## Rendered inspection

Inspected original/current desktop layouts, both course topic/level rows, tablet
wrapping, mobile overview/chart, and the final production A Level empty screen.
Cards, palette, outcome order, threshold geometry, unavailable cards, chronological
result squares and month-fit/long-scroll behaviour match the original design.
The shared current eagle button, arrow and body star background replace the
original header/back-link treatment. Original CSS mobile date-label density is
preserved; each chart bar has the full accessible date/time breakdown.

## Retained corrections and environment limit

Task-owned `attempt1`–`attempt6` and `timing-attempt1` preserve failed attempts.
Corrections: the dev entry is `/alevel.html`, not `/`; populated historical fixtures
are schema-validated and inserted into isolated test databases because the current
alpha importer intentionally accepts only canonical new attempts; the current
assessment button is `Check`; the CSS selector check strips comments. The genuine
StrictMode repository-close issue was fixed and Retry subsequently passed.

Root's bounded review correction added singular `1 attempt` wording and IGCSE
`Fourth Form`. Pre-polish source/check fingerprints are archived in
`pre-root-polish/`; fresh post-polish type/model/build/release gates all pass.

A concurrent cleanup removed app dependencies/runtime and root-pinned Playwright
while checks were running. A01 did not delete those paths or stop unrelated
servers. User confirmed cleanup paused; root restored the exact app dependencies
and pinned root Playwright/core 1.62.1 without manifest changes. Final source
browser checks (7 scenarios), real-clock transfer checks (2 courses) and fresh
production prefix checks (2 courses) all pass after restoration. Safe original
preservation and build/source fingerprint checks also pass. No source changed
after the successful build. Earlier failures are superseded environmental
attempts; the provisional escalation is retained separately.

`rendered-review.json` records the final inspected screenshots and source hashes.
Inspected both courses' populated and empty desktop/tablet/mobile screens, mobile
overview/chart captures, both original desktop references, both real timing
transfer screens, both production screens and the storage error state. Browser
evidence uses headless Microsoft Edge, not a claim of testing every browser.
No unresolved implementation failures, schema/mastery/storage changes or deployment.

Delegation: one authorized Sol 6.1 High direct worker, no children. Root owns
independent final review and acceptance; worker PASS is not final acceptance.

## Reproduce

Run from the app, with exact lockfile dependencies restored:

```powershell
$env:TEMP = Join-Path (Get-Location) 'btmp-popup'
$env:TMP = $env:TEMP
node validation/statistics-restore/browser.mjs
node validation/statistics-restore/timing-browser.mjs
node validation/statistics-restore/release-browser.mjs
node validation/statistics-restore/check-originals.mjs
```

`browser.mjs` owns transient Vite5203 and read-only original-source5202;
`release-browser.mjs` owns transient nested-prefix static5204. They close their own
servers/contexts. `timing-browser.mjs` now owns transient Vite5205 and reuses the
bounded task cache. All three final browser scripts passed after environment restoration.
Do not run `scripts/protect-originals.mjs check`.
