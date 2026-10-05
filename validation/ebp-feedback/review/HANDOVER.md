# A02 EBP-FEEDBACK-REVIEW

Independent review completed 5 October 2026. Current implementation behavior passes; one small root-requested presentation refinement remains before final acceptance. Reviewer did not edit production code, contracts, historical evidence, build products, release inventories, dependencies, sibling apps or the swarm log. No commit, push, install or deployment occurred.

## Sole actionable finding: correction status prose

`src/ui/ResponseControl.tsx` renders a visible `field-result` paragraph for the selected phrase and a visible `field-result` span for replacement status. After selecting the correct erroneous phrase and entering an incorrect replacement in EBP-C6R2Y8 or EBP-I5B9S3, Check displays â€œCorrect phrase selected.â€ and â€œReplacement needs correction.â€ in addition to the independently checked borders. The same result is visible after reload. See `mobile-EBP-C6R2Y8-partial.png`, `mobile-EBP-I5B9S3-partial.png` and their desktop equivalents.

Root requests these two short status elements become screen-reader-only to match the approved minimal border-focused correction presentation. Make this a shared generic correction presentation change, preserving the selection paragraph's `role="status"`, the replacement span's ID and textarea `aria-describedby`, selected button accessible status label, `aria-invalid`, border states and keyboard focus. Keep unselected phrases neutral. Verify desktop/mobile partial/correct/retry/edit/reload and that status descriptions remain accessible after the class change. This is a bounded presentation issue; no chemistry, marks, first evidence, timer or scheduler changes are needed.

Verdict for all remaining reviewed behavior: **PASS, no detected material defect**. Overall completion is **FAIL pending this requested refinement**, so the root can assign the exact author fix and a targeted independent recheck. This finding does not justify rerunning or reconstructing historical freezes.

## Independent evidence

- `tests-unsandboxed.txt`: fresh 32-test PASS, including all 32 pre-change provider equivalence, chemical/marking/identity fixtures, immutable checked retries/restoration, original action-state and numeric-working tests, registration and active-clock checks. The first sandboxed attempt failed to spawn child processes (`tests.txt`, EPERM); the authorized subprocess-capable rerun passed. No test or requirement was weakened.
- `typecheck.txt`: fresh TypeScript PASS.
- `browser-results.json`: fresh Edge execution of the author's eight retained production-host scenarios, with fresh isolated app databases. Standalone/revision gaps and corrections, desktop/mobile/keyboard, incorrect/partial/correct/edit/retry/reload/Clear/Give Up/Next, preserved first response/marks/timing/history, revision deduplication, historical hints and all 32 teacher questions pass.
- `generic-browser-results.json`: fresh execution of nine synthetic generic-player fixtures using the actual shared controller. Text/numeric/single/multiple/dropdown/diagram/correction and self-rubric/mixed automatic-self review pass. Required self-review failure prevents a numerically correct retry revealing Ideal answer. Equivalent-answer controls remain available. These fixtures are development-only, with synthetic marking values rather than classroom chemistry.
- `specialist-browser-results.json`: fresh source acid and DotCross production-host scenarios pass. Existing specialist feedback remains present; retry/reload preserves first evidence, and reveals create no evidence. Neither specialist is routed through restored generic marking.
- `prefix-browser-results.json`: fresh packaged production behavior from both prefixed course entries passes; all 134 approved runtime files per entry serve at expected sizes, refresh restores the actual question, no development instrumentation/window hook is present, and no page or HTTP errors occurred.
- `edge-cases-results.json`: five additional independently designed suites pass. All32 questions were answered incorrectly, corrected, checked and reloaded in the actual host; each correct field retained a 2px border plus accessible name/description, all correction unselected phrases remained neutral, and immutable first response/assessment/history matched. A Check followed immediately by an edit restores neutral presentation rather than stale checked borders. Incomplete correction retries and Clear restore essential errors with no Ideal answer. A temporary isolated IndexedDB `put` QuotaExceededError injection at checked-save time shows the save error, disables Next, and Retry save restores checked presentation after reload without extra evidence. The browser prototype was restored immediately in a `finally` block. Prior-reveal editing/Clear observation is preserved as approved behavior, with zero evidence.
- `integrity-results.json`: all 568 files in the author's final source/config/build/release closure match their retained SHA256 and byte counts. All6 retained timing/allowance source hashes and 7 native-evidence hashes match. Both release validators pass read-only with 134 files, 182322 initial JavaScript gzip bytes, 75 deferred chunks and exact approved registrations. Both release manifest hashes are retained. All1324 entries of the actual repair-local sibling/dependency snapshot remain identical.

The four browser scripts here were copied from the author solely to execute reviewed fixtures independently and redirect fresh evidence into review ownership. `edge-cases.mjs` adds the independent reviewer assertions; `integrity.mjs` performs fresh hashes and release/protection comparison. Author PASS was not used as acceptance in place of execution or code review.

## Code and rendered review

Reviewed the actual app Git diff and new `current-feedback.ts`, plus surrounding action-state/controller/host/persistence logic. EBP provider presentation changes preserve all 32 IDs, semantic parts, accepted answers, context, diagrams, source provenance and marking policy. Removed hints remain in historical assistance data and immutable first response; hiding their controls/panels cannot create independent evidence. Only EBP removes the instructional boilerplate and fills the available question width.

Generic first marks derive from saved first assessment only while the response is unchanged; accepted correction checks remove the existing current-response-changed marker and save the checkpoint. Display restoration derives current automatic marks from current responses/policy without dispatch, reassessment or scheduler acceptance. Correction saves use the existing transactional evidence deduplication. Editing and Clear clear transient feedback and restore the changed marker; the additional race and save-failure tests substantiate these boundaries. The self-review guard prevents automatic-only correct feedback from revealing a full ideal answer where required rubric marks failed. SourceQuestionPlayer/DotCrossPlayer retain their own feedback, and restoration explicitly excludes their families.

Opened actual fresh output screenshots: all eight EBP desktop/mobile gap/correction examples across both levels; the generic mixed self-review mobile result; source acid; DotCross; both prefixed production entries; injected save failure; and prior-reveal Clear. Chemistry context, calcium oxide ion charges/lattice diagrams, selected erroneous text, accepted replacements and Ideal answers agree. Question panes use available width; there is no horizontal document overflow in the checked mobile fixtures. One Ideal answer appears directly after the question pane when correct or explicitly revealed. Checked gap/selected phrase/replacement statuses are distinct; unselected correction segments stay neutral. Focus remains visible. The two visible correction status sentences identified above are the sole requested refinement.

Root explicitly confirmed that a prior reveal keeps Ideal answer available after editing/Clear under â€œhide ... unless explicitly revealedâ€; this observation is **not a defect**. Clearing current Give Up action state does not undo knowledge already revealed. The preserved assistance continues excluding those attempts from independent evidence.

## Retained limitations

The historical active-time review gate is unavailable because `validation/explaining-properties/current-inputs.json` is absent. `scripts/test-explaining-properties.mjs` references absent historical `central-attempt`, `canonical-identity` and `current-persistence` test leaves; they were not claimed as passing. Present relevant leaf tests were executed explicitly. No historical fingerprints were invented or rewritten.

Historical protected-original checks retain their existing 529-path drift. The current 1324-entry repair-local comparison passes, but the actual snapshot was taken at 10:36:12 BST after initial app edits and before remaining verification; it cannot prove full task-start preservation. Reviewer did not attempt hydration, modify siblings, or relabel that historical failure.

Timing continuity is independently checked unchanged source/native-evidence hashes plus fresh current first-assessment/retry/save/reload/Next behavior. No new long-idle, native background, host suspension or whole-device certification is claimed; earlier retained timing ambiguities remain qualified. Both builds were previously generated by the author; this reviewer validated the actual packaged closure and behavior without rerunning builds or mutating their inventories. No usage/cost measurement was exposed.

## Reproduction

From `apps/Masters-of-Chemistry` with existing dependencies and previews on 5203/5204:

```powershell
npm run typecheck
node --test validation/ebp-feedback/implementation/feedback.test.ts scripts/tests/explaining-properties.test.ts scripts/tests/current-catalogue-boundary.test.ts scripts/tests/olympiad-2011.test.ts validation/ui-consistency/u2/independent/action-state.test.mjs validation/ui-consistency/u2/independent/numeric-working.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node validation/ebp-feedback/review/browser.mjs
node validation/ebp-feedback/review/generic-browser.mjs
node validation/ebp-feedback/review/specialist-browser.mjs
node validation/ebp-feedback/review/prefix-browser.mjs
node validation/ebp-feedback/review/edge-cases.mjs
node validation/ebp-feedback/review/integrity.mjs
```

The browser scripts use the pinned read-only workspace Playwright and headless Microsoft Edge. Subsequent code/build changes legitimately invalidate the author's closure hash comparison; retain these results as evidence for this exact reviewed revision and record new final hashes separately.

