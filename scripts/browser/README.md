# Retained browser verification

Run from this app directory with the pinned workspace Playwright 1.62.1 and installed Microsoft Edge. Start the app-local Vite server (`npm run dev`) for source suites. `BROWSER_BASE_URL` overrides its default `http://127.0.0.1:5181`; `BROWSER_PREVIEW_URL` overrides the default production preview origin `http://127.0.0.1:5182`.

- `node scripts/browser/smoke.mjs`: current migration smoke covering the relocated landing harnesses in both courses, mobile overflow, and the current Olympiad/NMR dialog.
- `node scripts/browser/landing/design/interaction-browser.mjs`: keyboard, selection and preferences assertions for the landing fixture.
- `node scripts/browser/landing/design/compare-browser.mjs`: read-only original-app comparison against the migrated fixture. Uses a fresh isolated origin for original assets; never changes original-app storage.
- `node scripts/browser/landing/integration/browser.mjs`, `revision-browser.mjs`, `failure-browser.mjs`, or `teacher-category/browser.mjs`: retained substantive host, revision, failure and teacher scenarios.
- `node scripts/browser/landing/aggregate/prefix-browser.mjs`: production prefix checks with an app preview server.
- `node scripts/browser/olympiad/browser.mjs`, `async-navigation.mjs`, or `production-smoke.mjs`: retained challenge, asynchronous loading and independent static build scenarios. The production smoke owns its own temporary preview server.
- `node scripts/browser/explaining-properties/browser.mjs`, `visual-browser.mjs`, or `prefix-browser.mjs`: content, interaction and independent production-prefix suites.
- `node scripts/browser/explaining-properties/timing-browser.mjs`: actual 180-second idle and timing checks. `--tail` requires a successful fresh idle report produced by that command under `.artifacts/browser/explaining-properties`; historical reports are not bundled as substitute evidence.
- `node scripts/browser/explaining-properties/native-timing.mjs`: retained Windows/Chrome native foreground, background and suspension suite. It visibly launches and foregrounds its own isolated Chrome process/profile, with a local CDP endpoint; close it through the script. This suite was not run during tool migration.
- `node scripts/browser/component-fidelity/{acid,numeric,rubric,revision,energy-actions}-browser.mjs`: real player/editor, first-evidence, correction, reload and Next assertions over the checked fixture corpus.
- `node --test scripts/tests/landing/invariants.test.mjs scripts/tests/landing/launch-routing.test.ts`: preserved original-subset mathematical/catalogue equivalence plus current 17-gem/43-level launch coverage.

Generated reports, screenshots, temporary profiles, caches and reference candidates belong under ignored `.artifacts/`. `landing/design/reuse-originals.mjs` generates original-derived reference candidates under `.artifacts/browser/landing/design/reference`; it deliberately does not overwrite current source additions.

Retained suites are executable regression tools, not carried historical PASS results. Their original selectors and behavioral assertions may identify changes in the current application. The migration smoke passed; the retained async suite currently reports the removed `All Olympiad challenges` control, and the landing route test reports current lack of `?legacy=` unwrapping. These findings are preserved in the migration handover rather than weakening checks or changing app behavior.
