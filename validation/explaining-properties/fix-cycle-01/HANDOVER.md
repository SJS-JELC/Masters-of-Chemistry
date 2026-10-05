# EBP-FIX-01 · A01-EBP

**Four reviewed fixes complete; native timing remains ESCALATE.** Independent
bounded re-review and final acceptance belong to root. No publication.

## Fixed

1. The catalogue generator now explicitly preserves **A Class of their Own**.
   Generated definitions reproduce that original C3L6 title; regeneration check
   passes. This fixes the accepted generator source rather than patching output.
2. CaO correction `EBP-I5B9S3` initially supplies only “Calcium oxide diagram:”
   and neutral accessible row/ion labels. It no longer supplies fragment,
   continuation or three-dimensional replacement wording. That explanation is
   available as a requested hint; assessed feedback still gives the full correct
   replacement. The gap diagram keeps its approved lattice context.
3. Lattice images have a scoped520px maximum, with mobile scaling. Actual desktop
   correction image is520×245px; mobile336×158px. Gap image520×322px/336×208px.
   The selector applies only inside Explaining Properties QuestionPlayer.
4. The erroneous phrase now reads **a complete Ca₄O₄ molecule**, with real U+2084
   subscripts. Existing deterministic segment offsets recalculate; selection and
   conditional replacement marking remain unchanged.

## Checks and evidence

| Gate | Result |
| --- | --- |
| Targeted bank/marking | `bank-tests.txt`:3 substantive tests PASS, exercising all32 records and all curated alternatives/negations, first evidence freeze, bounds and legacy alias; added neutral-context, hint, subscript and original-title assertions |
| Typecheck/current gates | `typecheck.txt`, `current-gate.txt`:PASS;46 current tests,14activities/43targets/32questions, generated catalogue and every source fingerprint |
| Both builds/releases | `build.txt`:PASS; manifests regenerated with current source hashes;8 A-Level/6 IGCSE activities,172files each; gzip182353/182352 bytes under204800 |
| Actual targeted browser | `visual-browser.json`:6PASS, zero page errors; both diagrams desktop/mobile, neutral text/alt, visible subscripts, conditional selection feedback, frozen wrong-first retry, requested hint and original C3L6 title |
| Actual current production prefix | `prefix-browser-results.json`:5PASS, zero runtime/HTTP failures; both entry courses, practice/refresh/switch, canonical EBP refresh and all172files per course served with exact bytes |
| Protection | Current supplement PASS for1317paths;794 original readable hashes unchanged,36 hydrated exact size/mtime records and487 remaining metadata-only. Frozen baseline/generic guard unchanged; unavailable original bytes remain explicitly uncomparable. |
| Chemistry/render | `chemistry-render-review.json`:narrow substantive follow-up and current bank fingerprint; inspected all four actual captures. Original32-item author and independent reviews are preserved. |
| Timing continuity | Shared timing/attempt/repository/revision source hashes remain identical; current active-time review is honestly PARTIAL. Earlier real180s idle and8s gap evidence remain preserved. |

The first visual harness failure is retained in `visual-browser-failed-first.json`
and its raw log. Shell command encoding converted literal Unicode subscripts in
the harness expectation to ordinary digits; the browser correctly rendered real
subscripts. A Unicode-escaped expectation fixes that fixture; no app change was
made for this failure.

## Native capability boundary

Copied the review-owned raw Chrome script into this cycle and preserved the
original. Used only short isolated `.browser/ebp-author2`, default Chrome context
with `connectOverCDP(noDefaults:true)` and interval DOM/state readiness. Explicit
untrusted DOM change/click is used for navigation; timing inputs use CDP Input
and require trusted native events. No focus emulation or visibility/clock
property replacement was introduced.

The actual EBP attempt now launches, fixing the review harness's actionability
wait. However, the raw normal window reports hidden=true/focused=true and its
real timer remains0. The initial hidden launch and normal-window retry are
retained in `native-first-hidden-launch.json` and
`native-second-occluded-launch.json`. One bounded real native restore/raise of
only the owned Chrome main window succeeds; Windows SetForegroundWindow returns
false. Final `native-timing.json` records this denied foreground activation and
the real attempt, document token and time origin. It therefore does not establish
a foreground-to-hidden transition or timing plateau. Native freeze/resume is
not claimed or exercised after the foreground prerequisite failed. All owned
Chrome processes/windows were closed. Vite remains available for the reviewer.

No genuine native hidden/background/page-freeze timing PASS is claimed. Root
must resolve that acceptance gap through further genuine evidence or the
explicit user timing-exception decision required by the project contract.

## Review snapshots and commands

`before/` retains exact pre-fix files. This cycle's `changed-files.json` has11
before/after hashes. The full addition's refreshed `../changed-files.json` has33
changed files and `../review-deltas.json` retains complete text. Pre-fix manifests,
handover, freeze and prefix evidence are preserved here. Independent-review files
were not edited. One verifier snapshot was recovered from retained exact delta
text after verifying its recorded pre-fix SHA-256.

From the app directory:

```powershell
node validation/explaining-properties/register.mjs
node scripts/write-catalogue-definitions.mjs
node --test scripts/tests/explaining-properties.test.ts
node node_modules/typescript/bin/tsc --noEmit
node scripts/build.mjs
node scripts/release-s4.mjs alevel
node scripts/release-s4.mjs igcse
node validation/explaining-properties/fix-cycle-01/visual-browser.mjs
node validation/explaining-properties/fix-cycle-01/prefix-browser.mjs
node scripts/verify-explaining-properties.mjs
node scripts/review_active_question_time.mjs
```

Native script requires the already-authorised temporary onscreen Chrome action;
it closes only its own isolated browser and retains capability evidence.
