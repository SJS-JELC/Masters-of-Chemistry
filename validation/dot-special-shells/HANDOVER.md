# DOT-SPECIAL-SHELLS-01

A01 implemented the authorized dot-and-cross repair and inline checked status. Requested model/effort: gpt-6.1-sol/high; effective runtime and usage are unexposed. Root code/render acceptance is pending. No commit, push or publication.

## Cause and change

`DotCrossEditor.tsx` stripped the marking-policy prefix but passed a canonical DAC code to `createLayout`. The original layout exceptions match source species IDs. `layout-identity.ts` resolves DAC codes using the existing permanent identity table at the editor boundary; original source-policy IDs remain usable by the editor, and IGCSE policies retain their original ordinary geometry. Public question IDs, provider acceptance, marking policies, stored response coordinates, first assessments and timing are unchanged. Unknown canonical codes fail explicitly.

The original source has exactly two enlarged shell rules: P in phosphorus pentachloride and S in sulfur hexafluoride, radius 100 rather than 64. Hydrogen remains 40. Original references already preserve the special radial reflows for SF4, ClF3, PCl5 and SF6. All 91 records match the original bank byte-equivalent structured data. No new chemical resizing, bank regeneration or saved-coordinate migration was introduced. Existing canonical saved attempts reload with the same IDs/responses; legacy source-policy IDs are tested at the layout boundary, while public providers continue to reject noncanonical IDs as their existing contract requires. The bank contains no other phosphorus molecule; ordinary phosphorus radius is tested in nonspecial layout contexts without adding a chemical question.

`DotCrossPlayer.tsx` now presents accessible live Correct/Incorrect text at the left of the existing action row. Full marks are green; accepted partial/wrong results are red. Editing, Clear, incomplete input, Next and Give Up remove stale status. A subsequent explicit correction check can display its newly checked result after Give Up, without reusing a stale result or mutating first evidence. Buttons stay right aligned, outside and above the editor, at 36 px. The row stays on one line at 390 px and wraps only when necessary. Existing detailed feedback remains.

## Owned changes

- `src/chemistry/dot-and-cross/layout-identity.ts` (new narrow identity adapter).
- `src/editors/dot-and-cross/DotCrossEditor.tsx` (import and identity call only).
- `src/ui/DotCrossPlayer.tsx` and `src/ui/dot-cross-player.css` (checked status).
- `release/alevel.runtime.json`, `release/igcse.runtime.json` (regenerated local manifests), normal ignored `dist/` builds.
- `validation/dot-special-shells/` (before capture, runnable validation, retained results/screenshots and this handover).
- Sole authorized workspace log `.codex/swarm-status.md`.

Existing full-width editor, removed sidebar, two palette rows with narrow-screen scrolling, compact external action row, EBP exact wording/strike-through/compact feedback were retained. Captured `editor.css` and `SourceQuestionPlayer.tsx` match after fingerprints. Existing dev-server stdout/stderr were appended by the running server; they were not manually edited. Additional unrelated modified/untracked files appeared in app Git status during the run, including historical validation artifacts and Wisteria copies. These were neither authored nor deleted; no unrelated edits were reverted.

## Validation

`check.json` is the reconciled aggregate with current source fingerprints and references to retained individual evidence. Ten live browser cases pass across the full run and two focused retries; three production prefix/teacher/refresh/mobile cases pass. Edge used the pinned read-only workspace Playwright. The last status change was retested in the targeted first-partial/retry/reveal/recheck case; geometry/production checks precede that presentation-only adjustment. Final typecheck, all eight focused/registration/timing tests, both builds and exact release checks pass on the final source.

Source/geometry review compares every reference electron coordinate against the original renderer, validates reference marks and all special/ordinary shell rules, and checks shared-region/snapping behavior. Real browser pointer gestures confirm central drag ghosts at radius 100, terminal radius 64, snapped distance 140, shared-electron previews/placement, and exact saved-response reload. Browser checks confirm circles shown/hidden in both editor and model, first/learning scores, Clear/incomplete/reveal/Next behavior, unchanged first response/assessment/history and responsive action placement. Production has no development harness and no student action row in teacher mode.

Explicit chemistry/render review: inspected desktop/mobile SF6 and PCl5 editors and exported model SVGs, pointer ghosts, electron previews and green/red action statuses. SF6 shows six S–F shared pairs (12 electrons around S) and six lone electrons on each F, 48 total outer electrons. PCl5 shows five P–Cl shared pairs (10 around P) and six lone electrons per Cl, 40 total. Both are neutral. Schematic layouts retain the original statement that molecular shape is not assessed. Central shells are visibly larger, shared electrons lie in the correct overlapping regions, lone pairs/labels remain legible, and the model agrees with the editor. SF4/ClF3 remain the original 64-radius layouts with their original reflowed references. No curriculum scope or chemical marking changed.

## Reproduce from the project directory

```powershell
node node_modules/typescript/bin/tsc --noEmit
node --test --test-isolation=none validation/dot-special-shells/geometry.test.mjs scripts/test_revision_registration.mjs scripts/test_active_question_time.mjs
node scripts/build.mjs
node scripts/release-s4.mjs alevel
node scripts/release-s4.mjs igcse
node validation/dot-special-shells/release.mjs
# Local dev on 5203; production on 5204 /feedback/{course}/; Edge launch may need elevation:
node validation/dot-special-shells/browser.mjs
node validation/dot-special-shells/browser.mjs fresh-reveal-no-checked-status
node validation/dot-special-shells/browser.mjs first-partial-incorrect-correct-retry
node validation/dot-special-shells/production-browser.mjs
node validation/dot-special-shells/preservation.mjs after
node validation/dot-special-shells/finalize.mjs
```

`--test-isolation=none` avoids a sandbox EPERM on Node test-runner child spawning. It does not bypass test assertions. The release checker calls the unchanged `validateRelease` gates while writing evidence into this owned directory, because the historical wrapper's attempt to overwrite old `validation/s5/integration/release-checks.json` received EPERM. All assertions were applied unchanged.

Before evidence was captured at 2026-10-05T11:16:53.465Z before runtime-source edits. After evidence confirms all 2307 sibling/dependency/config files unchanged, with actual byte hashes and no metadata-only gaps. No before browser screenshot was captured; retained before source and hashes establish the defect without backfilling visual evidence. Retained failed browser attempts document selector/tool preconditions, subpixel tolerance, asynchronous Next, isolated database setup and one transient blank development-page timeout; each required case has passing retained evidence.

The old protected-original baseline still reports known pre-existing drift; it was not replaced. The historical active-time audit still lacks `validation/explaining-properties/current-inputs.json`; its failure is retained and no historical freeze was invented. Three previously missing historical wrapper leaves were outside this bounded repair. These limit broad historical-project certification, not the scoped geometry/status evidence. Actual task preservation passes.
