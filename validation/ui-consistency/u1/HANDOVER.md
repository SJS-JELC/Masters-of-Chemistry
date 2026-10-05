# U1 implemented and validated — root gate pending

Three bounded Sol6.1/high worker packages are integrated. U2 has not been dispatched. No publication.

## Review

- [Aggregate and evidence map](foreman-report.json)
- [Exact source patch](source-changes.patch) and [before/current hashes](source-audit.json)
- [Current645-input closure](current-inputs.json) and [retained evidence fingerprints](evidence-fingerprints.json)
- [Desktop final contact](theme/contact-final-1440.png), [mobile final contact](theme/contact-final-390.png), [full mobile dot/cross](theme/static-alevel-dot-and-cross-390.png), [corrected EC energy labels](theme/ec-axis-detail-static-390.png)
- [Real saved assessment/reload frame](controls/screens/actual-app-reload.png)
- Olympiad map: [dim](olympiad/map-unstarted-1440.png), [partial](olympiad/map-partial-1440.png), [complete](olympiad/map-complete-1440.png); [both challenge frame contact](olympiad/contact-sheet.png)

The shared question-end footer is exactly Check, Clear, Give Up, Next. One central Clear transition preserves the attempt, assistance and frozen first score/response/time. Two optional current-action markers distinguish edited/Cleared responses and current Give Up through reload; they never enter first evidence. Required rubric/drawing review stays gated. Enter/autofocus uses opted-in answer fields and preserves editor/dialog/native keyboard behavior.

The default question pane is1120px. Comfortaa and the exact landing gradient/star backdrop apply across the app. Course change is110ms out plus110ms in, with opacity and16px directional slide; reduced motion is immediate and the650ms year flip stays unchanged. The final scoped EC spacing fix makes its energy-axis label fully visible at350/390px while preserving internal scrolling.

Both existing Olympiad challenges have genuine shared completion gems derived from current validated fingerprints/contributions, with refreshed saved status on map return/reload. Staged controls/progression remain. No curriculum evidence is created. Chemistry, policies, IDs, answer banks, scientific assets and approved NMR bytes are preserved.

## Validation

53 retained test cases pass across central timing/action invariants, canonical content/persistence/working, pure control state and Olympiad chemistry/selector suites. Real Edge checks cover all11 curriculum families, actual IndexedDB first evidence/reload/Next, required staged reviews and editor Clear;66 main theme measurements,23 static frames plus3 final EC frames;24 Olympiad responsive checks/26 captures with teacher/store isolation. Fullsize exports are retained. All three worker handovers describe failed exploratory probes and their resolved causes.

Both builds/typecheck/release validators pass against315 exact before/after source/public/config inputs. Releases each have163 runtime files; initial gzip shell is180442bytes A Level and180441bytes IGCSE, below204800. Current production closure:645 inputs, tree `46a60b549b07e48ac21eb8779239f8b8424c4f0a1f32e0bafb7c0c405e7ad525`.

Protected originals:794 readable byte hashes plus523 stat-only offline placeholders, zero changes and no hydration in the authoritative current guard. U03 once ran the legacy guard: it overwrote the mutable historical generated summary and attempted523 offline reads, all failed. Root explicitly accepted this evidence-process exception; it is retained separately and no reconstruction/unchanged-history claim is made. All other historical evidence is preserved.

No new native OS suspension/physical-device/screen-reader certification is claimed. The clock/binding and retained native evidence remain unchanged; current ordinary browser behavior passes. Existing editor-local tools remain supporting UI; the footer is the sole main question-action row. Root code/render gate and one independent U2 review remain.

## Reproduce

From the app directory:

```powershell
node --test validation/ui-consistency/u1/central-attempt.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node validation/ui-consistency/u1/run-regressions.mjs
node --test validation/ui-consistency/u1/controls/action-state.test.mjs
$env:OLYMPIAD_EVIDENCE_DIR = 'validation/ui-consistency/u1/olympiad'
node --test validation/ui-consistency/u1/olympiad/completion.test.ts scripts/tests/c3-regression.test.ts scripts/tests/olympiad-2011.test.ts
node validation/ui-consistency/u1/build-and-release.mjs
node validation/ui-consistency/u1/check-originals.mjs
node validation/ui-consistency/u1/check-assets-config.mjs
node validation/ui-consistency/u1/timing-continuity.mjs
node validation/ui-consistency/u1/source-audit.mjs
node validation/ui-consistency/u1/finalize.mjs
```

Worker handovers give browser regeneration commands using pinned workspace Playwright, source5188 and static5192. Commands write current U1 evidence only; do not use legacy default-output guards or historical runners. Rebuilding changes manifest generation timestamps, so rerun finalization after an intentional rebuild.
