# A18 / S4-STATISTICS

Requested runtime: GPT-6.1 Sol High. Effective model/effort and usage are not exposed by this runtime. No child delegation. Writes are limited to `src/statistics/` and this validation directory.

## Entry and ownership

`src/statistics/index.ts` exports `StatisticsView(CourseDataViewProps)` and its default. The component renders content only; A01 owns the shared shell, navigation and lazy production composition. Its only repository operation is `curriculumHistory(namespace)`. It never reads the Olympiad store, writes an attempt, saves a score, imports history or modifies a shared domain. Fixture-only import/save operations live in the retained browser script.

The panel provides period and subtopic selection; assessment outcome totals; validated recorded time and median; keyboard/touch daily chart selection with complete textual descriptions; all-time mastery for every genuine supported level; question codes, immutable first raw mark points, self-review classification and saved responses where available; explicit untimed/absent details; and a separate old-progression history section. Historical question IDs remain data, not derived labels. The current chart excludes archive evidence and Olympiad/Rocket entirely.

## Source and domain rationale

Read the project contract, IMPLEMENTATION, progress, S4 dispatch/work packages, S3 root acceptance and S0 migration inventory before choosing domain behaviour. Actual reference sources:

- `apps/Masters-of-A-Level-Chemistry/src/assets/alevel-stats-core.js` and `alevel-stats.js`: current/historical progression partition, period filtering, daily calendar bins, outcome/time aggregation, untimed denominator, timed-only median, all-time mastery independent of selected period.
- `apps/Masters-of-A-Level-Chemistry/src/assets/alevel-mastery.js`: strict `> 0.8`, zero prior, question half-life recurrence, acid progression version 2 versus historical version 1, legacy diagram aliases.
- `apps/Masters-of-IGCSE-Chemistry/src/assets/igcse-stats-core.js`, `igcse-stats-progress.js`, `igcse-stats.js`, `igcse-mastery-config.js` and `landing/progress.js`: grade band support and different half-lives; preserved saved score semantics, including historic assisted flag.
- Both original `assets/active-question-time.js`: validated version-1 duration rather than time inferred from timestamps. The accepted importer converts that legacy shape to the shared `TimingResult` without inventing time.
- New accepted `domain/mastery/course-mastery.ts`, `domain/attempt/attempt.ts`, `domain/timing/active-clock.ts`, `persistence/repository.ts`, `persistence/legacy.ts`, catalogue, registry and actual `foundation/ActivityHost.tsx`.

All mastery calculations call unchanged `createCourseMastery(...).summarize`. The statistics model only selects presentation groups and adds counts/durations; it contains no mastery recurrence or threshold substitute. Original half-lives and strict threshold are displayed from the registration, not copied constants. All 273 accepted source-equivalence cases also pass through statistics.

New attempts with assistance before submission and reveals produce no independent evidence through `assessmentToEvidence`. Later corrections, hints or worked answers cannot replace the immutable first assessment. Built-in pedagogical scaffolds are valid independent practice. Original IGCSE historical records can have an assisted flag: their already-saved score still enters unchanged source mathematics, and the panel explicitly labels it rather than inventing independent evidence or reweighting it. Missing historical timing, marks, responses and assistance stay missing. A saved mastery score (0/0.5/1) is explicitly distinguished from raw marks.

Stats use one course/profile namespace; defensive aggregation rejects mixed namespaces, future/malformed dates, duplicate attempt IDs, excluded activity identities and assisted new evidence before sorting. First encountered valid ID wins, matching accepted domain semantics. Current progression is checked from actual registration/version/support. Historic source-only records stay inspectable separately. Daily bins advance by local calendar date, including 25-hour London daylight-saving days. Valid zero-duration records count as timed; an absent duration does not.

## Reproduce

From the workspace root:

```powershell
node --test apps/Masters-of-Chemistry/validation/s4/statistics/model.test.mjs
```

From `apps/Masters-of-Chemistry`:

```powershell
node validation/s4/statistics/browser.mjs
node node_modules/typescript/bin/tsc --noEmit
node scripts/protect-originals.mjs check
```

Browser uses pinned root Playwright 1.62.1 read-only, headless Edge, port 5193 and project-only cache/profile/output. It mounts the real ActivityHost/providers/marking/controller/clock/repository and the owned stats view. It does not substitute clocks or save fabricated new-attempt evidence. The DEV seam reads/checkpoints actual runtime, while responses are dispatched through the real host controller. Legacy data is synthetic and passed through the actual source-owned parser/importer and actual repository. Idle/background algorithm/native binding correctness remains the accepted S2/S3 evidence; this work verifies transfer of its actual first duration into charts.

## Retained startup failures

The initial cold Vite navigation timed out before any activity assertion, with blank document and no page errors. A bounded harness retry explicitly prebundled dependencies and disabled discovery; it exposed the missing `react/jsx-dev-runtime` prebundle and failed before host actions with a `jsxDEV` export error. Both failures are retained; the correction was escalated to A01 per the retry contract. No passing activity result is inferred from these failures. Final browser disposition and screenshots are recorded separately in `browser-results.json`.

A06 independently confirmed the exact JSX prebundle entry; A01 authorised the continuation. The exact original/proposed launcher and assertion-tail hashes are in `reviewed-continuation.json`, with independent review in `../review-browser-startup/followup-completion.json`. Later distinct fixture readiness failures are retained separately: observing the paused session before async attempt restoration; observing the assessed state before the React history publication; and a strict-mode caption selector resolving closed sibling history details. A06 reviewed the first two source ordering boundaries. Authorised fixture fixes wait for the exact restored attempt ID, then use actual exported `assessmentToEvidence` to wait for the same saved ID's expected presence/absence in history; they retain all raw score/response/time/dedup/chart assertions. The caption is now scoped to the opened row's exact evidence ID. Scenario elapsed metadata is measured after the awaited scenario finishes.

The full suite also found an owned accessibility defect: wrapping Period/Subtopic labels included option text in the computed label. Explicit stable `aria-label` values fix the controls while retaining the exact browser locator assertion. Before/after fingerprints and the failed render are in `accessible-label-fix.json` and `browser-period-label-failure.*`. No mastery, timer, repository or host source changed during these corrections.

## Final validation and rendered inspection

`browser-results.json`: **PASS**, five scenarios, pinned Playwright 1.62.1 / headless Edge 154.0.4258.48, no page errors. The actual acid host saved correct/partial/wrong records once (three timed records, exactly 2565 ms). The chart's raw time attribute and summed daily bars match those saved durations. An imported untimed record raises the current assessment count to four without changing the 2565 ms; a fifth record belongs to old acid progression and remains archive-only. Repeated import reports duplicates, and a separately saved C3 challenge adds no chart evidence. Hint/reveal/repeated-correction flows add no independent records. IGCSE verifies one timed correct result plus an explicitly labelled untimed assisted historical result, and separate course/profile rows in the same database. Three statistics refreshes preserve history byte-for-byte; localStorage remains empty and all databases use the new namespace.

`verification.json`: six meaningful model tests **PASS**, including all 273 accepted source mastery equivalence cases; full project typecheck **PASS**; protected-original guard **PASS** (1317 fingerprints, 523 metadata-only placeholders). Earlier transient global type errors in other owners' files are not accepted as passing evidence; the final rerun is retained.

Inspected actual final images at original resolution:

- `desktop-question-marks.png`: outcome totals, all-time source mastery, supported levels, raw first mark points and frozen question identity are readable and consistent.
- `desktop-untimed-and-archive.png`: historic missing fields remain explicit, with no fabricated raw mark or time.
- `mobile-chart.png` and `mobile-day-detail.png` at 390 × 844: usable native filter controls, two-column metrics, clearly indicated internal chart scroll/day selection, single-column mastery levels/history, readable labels and no body overflow. Selected-day totals are shown as text.
- `igcse-assisted-history.png`: original grade bands/half-lives, historic assistance flag and missing response/time are clear.

These are synthetic validation responses with actual short recorded clock intervals, so their chart bars are deliberately small; they are not real pupil records or representative classroom durations. The parent supplies the production shell and independently rebuilds/inspects the final lazy static mount. No A18-specific native idle/background run or production bundle acceptance is claimed.

## Acceptance boundary

Worker completion is not root stage acceptance. A01 owns final production composition and lazy bundle proof. No old source files/builds/stores/dependencies/Git, root config, public deployment, backend, chemistry/marking, shared maths or accepted stage evidence were changed. Exact fingerprints and final test/browser results accompany the completion manifest.
