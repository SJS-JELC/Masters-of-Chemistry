# L03 LANDING-INTEGRATION handover

## Outcome

The shared React platform starts on the original map and switches courses in place. Explicit course/activity/old-source URLs and unique bare stable question codes take precedence over the project-owned remembered course; otherwise the entry course is the default. OriginalLanding receives current-course repository history, the fixed registry and typed callbacks. Its map is mounted alone, outside CourseShell.

Map practice requests resolve only exact canonical registered gems and genuinely supported levels. Mastery uses the existing domain selector and the chosen session target, including advancement to the next unmastered level. An explicit request waits for startup reads and the existing durable leave gate. Its stable token is protected from StrictMode/effect reruns, retained on load/save failure and removed only after the selected attempt/session saves. An opened attempt that fails its initial save retries the same attempt ID. Rejected runtime promises are removed from the runtime cache so an explicit retry can recover.

A matching, non-complete revision selection resumes its saved question, response, timing and attempt ID. Changed selections pause/checkpoint prior work before creating a new session, expanding selected gems to every genuinely supported target level. A complete prior revision starts again. Previously persisted attempts and independent assessments remain in the repository.

Home is always visible in the existing activity/challenge header, including focused questions. Curriculum Home and browser Back use the existing leaveAttempt command/save queue. A failed write blocks departure; Retry then Home succeeds. Olympiad Home and Back wait for its existing save queue and remain separate from curriculum evidence. No queue/session-only persistence algorithm was replaced.

Teacher routes remain evidence-free. The IGCSE eagle/dialog callback selects the chosen activity (verified calorimetry and energy rather than the default). Old teacher fresh links do not queue student launch requests. Hidden aliases remain landing-only redirects; they cannot enable extra registered targets.

## Changed files

- src/foundation/ProductionFoundation.tsx: shared home/course routing, optional preference, repository history refresh, typed launch/handoff, compatibility/code handling, guarded browser history.
- src/foundation/ActivityHost.tsx: exact direct launch, mastery target, matching revision resume, completion restart, stable token, explicit retry and navigation guard.
- src/foundation/OlympiadHost.tsx: existing save queue exposed as browser-navigation guard.
- src/shell/CourseShell.tsx: persistent Home button only; existing player/editor/statistics layouts preserved.
- src/shell/navigation-view.ts: deterministic course/view and launch/selection helpers; existing transient shell store retained.
- src/contracts/integration.ts: home view and optional host launch/guard props; existing integrations remain valid.
- validation/landing-restoration/integration/**: new focused tests, browser fixtures/results, screenshots, handover/completion.

No main entry, chemistry, bank, editor, statistics, compatibility source, package, release or original-app file changed by L03. No deployment/build performed. Runtime dependency added: lazy import of L02's source-owned OriginalLanding; no package dependency.

## Verification

- Local pinned TypeScript: PASS, retained typecheck.txt (empty output means no diagnostics).
- Unit/provider tests: 4 PASS; all 41 supported target levels across 16 canonical gems restore through their exact providers; unavailable levels/aliases/cross-course/Olympiad reject; course/default/deep-link/old teacher routing and selection comparisons pass. unit-results.txt.
- browser-results.json: both courses fixed Level 2, mastery advances to Level 2 using synthetic current-namespace history, no duplicate StrictMode attempts, fresh preserves attempts/independent result, actual first assessment followed by Home refreshes gem freshness, exact reload, Home/Back quota block and Retry recovery, teacher evidence unchanged, only project-owned landing storage keys written.
- revision-browser-results.json: both courses matching resume with exact response/question/attempt, changed selection fresh attempt and all supported levels, course preference/explicit precedence, both source hidden aliases, exact old question teacher link, separate course databases and Olympiad Home.
- failure-browser-results.json: initial direct-save quota retains fresh token and saves same attempt on Retry, transient runtime recovery, completed revision restart, selected calorimetry/energy teacher routes, old teacher fresh route, unique bare CAL and AB2 code precedence in both directions plus explicit wrong-course rejection, all evidence-free teacher checks.
- Browser: actual React source on L02's Vite 5183, headless Microsoft Edge 154.0.4258.48 through workspace-pinned read-only Playwright 1.62.1. No original origin opened or its storage mutated by these tests. Fresh isolated contexts contain synthetic current-project data only.
- Manual code inspection: startup cancellation/load gate, stable request token and consumption timing, exact target validation, revision matching/completion boundary, original queue unchanged, Home/Back guard, separate namespace/database, teacher previews, dynamic source imports and explicit preference keys.
- Visually inspected alevel-focused-home.png and igcse-focused-home.png: Home is visible in the existing header without obscuring content or changing editor/player layout. Full home screenshots retained for the landing owner's/root's rendered comparison.

## Retained failures and limits

Initial browser failures are preserved alongside corrected PASS runs. They identified the necessary focused Home hookup and fixture defects (wrong import API/provenance, insufficient mastery history, Back-restored modal, numeric response serialization, collapsed topic control, accessible Olympiad name and intentionally reinjected quota after reload). No assertion was weakened; corrected fixtures exercise actual supported contracts. Final substantive browser results have no failures or page errors.

Root/foreman still own aggregate builds/releases, protected-original checks and full landing rendered comparison/acceptance. No native foreground timing certification or activity/editor/stats redesign is claimed. Existing historical validation and documented resource limits are unchanged. Usage/effective model settings are not exposed and remain null.
