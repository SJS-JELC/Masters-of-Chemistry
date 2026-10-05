# EBP-FEEDBACK-IMPLEMENT — author handover

Status: author implementation PASS, awaiting separate independent review and root acceptance. No commit, push, deployment, dependency installation, sibling-app edit, contract edit or swarm-log write was performed.

## Result

EBP questions retain their complete chemistry context, sentences, stable IDs, marked parts, accepted answers and provenance. The provider now supplies the chemistry context directly, removes the boilerplate title/instruction content and exposes no new hint controls. The original bank and marking policy are unchanged. Historical hint assistance remains in restored attempts and their immutable first responses; hiding its old presentation does not erase it or make the response independent.

The EBP question pane fills its available width. Question/gap mark counts, “Your response”, repeated phrase-selection legend and selected-range duplication are removed. Inline gaps have independently checked borders and accessible status descriptions. Correction selection and replacement statuses follow the existing selection-gated marking points; unselected phrases remain neutral. Editing clears checked presentation; subsequent Check refreshes it. Focus indicators remain visible.

The generic QuestionPlayer no longer renders the old assessment/correction panes or repeated score/bookkeeping prose. Other generic formats show one brief result; required input errors, compact equivalent-answer review controls and frozen self-assessment controls remain. There is one Ideal answer immediately after the question pane after Give Up or a fully correct check, including a successful retry. Incomplete/partial responses do not reveal it. A correct automatic retry cannot bypass a failed required self-review. Specialist SourceQuestionPlayer and DotCrossPlayer keep their existing feedback presentation.

Checked restoration reuses the existing `currentResponseChanged` field: accepted correction checks clear it and the host idempotently saves the resulting presentation state without calling the revision scheduler. The new pure `restoreCheckedFeedback` helper re-evaluates checked generic automatic responses for display only. It does not dispatch, create evidence, mutate first assessment/response/assistance, change timing or run specialist marking. No persisted schema was added. Preview/teacher views cannot produce evidence.

## Changed production files

- `src/activities/alevel/explaining-properties/provider.ts`: removes presentation boilerplate and hints; checked chemistry parts remain identical.
- `src/ui/QuestionPlayer.tsx`: compact generic feedback, guarded Ideal answer, retained review controls and EBP presentation.
- `src/ui/ResponseControl.tsx`, `src/ui/CorrectionSegments.tsx`: accessible gap/selection/replacement presentation statuses.
- `src/ui/current-feedback.ts`: pure checked-display restoration, with specialist families excluded.
- `src/domain/attempt/attempt.ts`, `src/foundation/ActivityHost.tsx`: persistence of the existing checked-presentation marker; immutable evidence and scheduler boundaries preserved.
- `src/styles/platform.css`: EBP full width, neutral selection, checked borders and focus styling.
- `release/alevel.runtime.json`, `release/igcse.runtime.json`: regenerated current local-build runtime inventories. Previous manifests are retained here as `before-*.runtime.json`.

The source/release patch is retained in `implementation.patch`, with the new helper separately in `current-feedback.patch`; `changed-files.json` and `app-git-status.txt` record the final app-only Git changes. Rebuilt dist files are generated outputs, not app masters. Validation fixtures are excluded from production runtime closure.

## Passed verification

- `typecheck-final.txt`: project TypeScript check passes.
- `tests-final.txt`: 32 tests pass, including all 32 questions' pre-change provider equivalence, all 32 corrected-retry/restoration/frozen-evidence invariants, existing EBP chemistry/identity fixtures, current catalogue boundaries, Olympiad isolation, action-state/numeric-working tests, revision registration and active timing.
- `browser-results.json`: eight actual Edge suites pass: desktop/mobile/keyboard gap and correction interactions in standalone and revision modes, blank/wrong/partial/correct/edit/retry/reveal, correct retry → reload, wrong retry → reload, unchecked edit → reload, immutable first marks/response/time/history, deduplicated revision acceptance, fresh Next timing, historical hints and all 32 teacher questions. Eight final desktop/mobile EBP screenshots were opened and inspected; source lattice diagrams and checked answers agree and the mobile layouts have no horizontal document overflow.
- `generic-browser-results.json`: nine real-browser generic suites pass: text, numeric, single/multiple/dropdown choices, diagram selection, correction, frozen self-rubric and mixed automatic/self-rubric review. These use an explicit synthetic validation fixture with the actual shared player/controller; no synthetic content is registered or built for classroom use.
- `specialist-browser-results.json`: source acid first assessment/corrected retry/save/reload/Next and DotCross reveal/check/reload pass. Original specialist feedback remains present; first evidence/time remains immutable and reveals create no evidence.
- `build-final.txt` and `release-checks.json`: both local course builds and runtime inventories pass; each has 134 explicitly approved runtime files and stays below the 204800-byte initial JS gzip budget.
- `prefix-browser-results.json`: both course production entries load EBP through the shared course interface, restore after refresh and serve all 134 runtime files under local URL prefixes without HTTP or page errors. No development instrumentation appears in the production window.
- `timing-continuity.json`: six retained timing/allowance source hashes and seven retained native-evidence hashes remain unchanged; fresh controller and browser checks validate first-time freezing, retry/reload/Next and scheduler behaviour. No new long-idle, native background or OS-suspension certification is claimed.

## Historical/unavailable gates and protection provenance

The required historical `node scripts/review_active_question_time.mjs` was attempted. It cannot complete because its required old `validation/explaining-properties/current-inputs.json` is absent. The exact ENOENT transcript is retained in `historical-active-time-review.txt`. No historical fingerprint or evidence was invented, recreated or updated to make this gate pass. `timing-continuity.json` is separately scoped current evidence, not a relabelling of that unavailable gate.

`scripts/test-explaining-properties.mjs` also references missing historical `central-attempt.test.mjs`, `canonical-identity.test.mjs` and `current-persistence.test.mjs` files under `validation/ui-consistency/u2/independent/`. The present relevant leaves were run explicitly; their exact invocation and result are retained in `tests-final.txt` and below. The missing wrapper leaves are not claimed as passed.

Historical protected-original checks remain FAIL with the same 529 changed paths before and after this work. Retained cloud-placeholder hydration/older sibling drift was not repaired or relabelled. `protected-before.json`, `protected-after.json` and the final historical transcript retain the exact result.

An actual repair-local snapshot was captured at **2026-10-05 09:36:12.835852 UTC (10:36:12 BST)**, after the initial app source edits and before the remaining verification/build/browser phase. It is **not a reconstructed snapshot or full task-start preservation proof**. No sibling or workspace dependency writes preceded that capture. Its actual later comparison passes across 1324 sibling/dependency fingerprint entries, with zero changes; see `repair-local-before.json`, `repair-local-after.json` and `protection-summary.json`. All writable implementation/evidence paths stay inside this app. Root must retain this timing qualification in final acceptance.

Early test-loader quoting/controller-option and browser-fixture selector/modal mistakes are retained in the first/second transcripts and failure records. Corrected final runs pass; no application requirement or substantive assertion was relaxed. The prefix fixture now supplies explicit `course`/`view=home` routes so remembered course preference cannot invert its test switch.

## Reproduction

Run from `apps/Masters-of-Chemistry` using the existing dependencies:

```powershell
npm run typecheck
node --test validation/ebp-feedback/implementation/feedback.test.ts scripts/tests/explaining-properties.test.ts scripts/tests/current-catalogue-boundary.test.ts scripts/tests/olympiad-2011.test.ts validation/ui-consistency/u2/independent/action-state.test.mjs validation/ui-consistency/u2/independent/numeric-working.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
npm run build
node scripts/release-s4.mjs alevel
node scripts/release-s4.mjs igcse
node --input-type=module -e "import {validateRelease} from './scripts/validate-s4-release.mjs'; console.log(['alevel','igcse'].map(validateRelease))"
node validation/ebp-feedback/implementation/browser.mjs
node validation/ebp-feedback/implementation/generic-browser.mjs
node validation/ebp-feedback/implementation/specialist-browser.mjs
node validation/ebp-feedback/implementation/prefix-browser.mjs
node validation/ebp-feedback/implementation/timing-continuity.mjs
node validation/ebp-feedback/implementation/protection.mjs after
```

The browser scripts use pinned workspace Playwright read-only and Microsoft Edge. Hidden app-only previews remain available on 5203 (Vite) and 5204 (static); owned PIDs/logs are retained here for the sequential reviewer. Start equivalent previews with `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5203 --strictPort` and `node validation/ebp-feedback/implementation/static-server.mjs` if they have stopped. `current-inputs.json` captures the final production source/config/build/release closure. Actual model usage/cost was not exposed; no measurements are invented.
