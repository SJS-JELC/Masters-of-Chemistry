# S1-SHELL — A04

## Ownership and interfaces

Implemented only `src/ui/`, `src/shell/`, `src/styles/`, both course main entries and this evidence directory. The foreman owns composition, assets, packages, catalogue and build tools. No original source was changed; no UI module imports original app code.

- `CourseShell.tsx`: shared course branding and accessible curriculum/Olympiad navigation. Registry and selection are injected. Olympiad uses no gems or mastery labels.
- `navigation-view.ts`: a fresh vanilla Zustand store belongs to each shell instance/course. `useStore` selectors expose only curriculum/Olympiad disclosure booleans. Native `details`/`summary` keyboard and touch toggles update this transient view state; curriculum starts open and Olympiad closed. It has no domain identities, answers, evidence, timing or persistence.
- `QuestionPlayer.tsx`: direct shared practice/revision/preview presentation with immutable attempt props and command callbacks. `SaveStatus` distinguishes idle, saving, saved and visible storage failure. Retry save is a host callback.
- `ResponseControl.tsx`: single/multiple/dropdown choices; single-line/multiline automatic text; raw numeric input; sectioned self-rubric explanations; exact-range correction; diagram-object selection; draw-before-calculate guidance; injected specialist editors.
- `EditorFrame.tsx`: shared frame accepts instructions, tools, an editor surface and non-drag alternatives. It performs no chemical validation and owns no editor data.
- `TextRangePicker.tsx`: immutable text supports native pointer/keyboard selection and start/end offsets. Explicit confirmation returns an exact `TextRange`. Only temporary view selection is local React state.
- Main entries choose a development-only dynamic module when `import.meta.env.DEV`, otherwise the foreman-owned production foundation. Fixture imports are eliminated from production selection.

`QuestionPlayerProps` adds optional `feedback`, `onRetrySave`, `canNext`, `learningReviewEnabled`, and `renderEditor`. `feedback` represents an unaccepted submission; it is separate from recognised incorrect mark feedback. Host must enable learning review only when a typed policy exists. Callback commands cannot create or own an attempt, timing, repository, scheduler or mastery store here.

## Root-requested S1 correction follow-up

`QuestionPlayerProps` now also receives optional typed `CorrectionFeedback`. Once a student attempt is assessed, an explicit **Check correction** action is available for automatic parts, including meaningful practice after reveal. It emits `check-correction` and displays a separate **Learning correction check** panel with current correct/wrong marks or incomplete/unrecognised issues. It never labels these learning marks as a new first assessment or equivalent-wording override. Pure explanation/drawing self-review parts retain their real review sequence. The host owns this ephemeral feedback, clears it on edits/identity changes, and returns from correction checks before persistence or scheduler calls.

`browser-correction.json` passes both-course revision checks: wrong first result stays at zero with one immutable independent evidence record; corrected correct learning feedback awards one learning mark; repeated checks, incomplete input, response edits and reload preserve exact first response, first result, timing, history and session/scheduler snapshots. Next starts a new attempt with no stale correction feedback. Reveal then repeated automatic learning checks stays assisted with no curriculum evidence. Unknown corrected text uses unrecognised issue feedback. Correction and reveal screenshots were visually inspected and clearly distinguish first evidence from learning marks.

The reported visual serif body was investigated through actual computed styles and CDP platform font glyph reporting on both course development pages. `fonts-before.json` and `fonts-after.json`, with matching screenshots, show system-ui inheritance from `html` through `body`, `#root`, shell, player and ordinary paragraphs; actual paragraph glyphs use **SegoeUI**, while headings use licensed custom **Comfortaa-Bold**. No competing root/body reset or specificity defect was reproduced, so no speculative font override was introduced. Formula blocks retain their deliberate Cambria/Georgia serif styling. The foreman performs the final production-prefix CDP font probe after build.

Reproduce the bounded follow-up with `node validation/s1/shell/browser-correction.mjs`; typography probe uses `node validation/s1/shell/browser-fonts.mjs before` or `after`. Integrated strict TypeScript passes after the typed prop/command implementation.

## Preserved behaviour

Read-only teacher/review controls create no commands and show worked answers. Rubric submission freezes all sections, then displays sequential points and requires evidence for awarded marks. Plain automatic long text uses a textarea without invoking self-rubric marking. Drawing/equation self-checks present draw-before-calculate guidance, then freeze numeric responses/time and display the source model with explicit criteria and yes/no confirmation. Final aggregate assessment follows the typed `confirm-drawing` transition. This source-specific check is separate from explanation rubrics. Built-in scaffolds, requested hints and answer reveals have distinct labels/actions. Recognised incorrect/partial/correct marks use assessment feedback; blank/unrecognised/malformed/incomplete submission feedback is visibly unassessed. Equivalent-wording review appears only after an automatic result on eligible unearned points, emits the typed learning-review command, and states that first marks/time remain unchanged.

Compact, multipart and workspace layouts share brand tokens, responsive controls, focus rings, native controls and print styling. The licensed font and eagle are copied by the foreman. Gem path geometry is preserved from source `landing/app.js`. Source hashes are in `source-provenance.json`.

## Validation plan and integration limits

Actual browser checks must use the foreman foundation host and new synthetic profiles: ordinary keyboard input/check; automatic multiline text; unknown feedback vs recognised incorrect; self-rubric freeze and ordered evidence with native selection plus offset confirmation; correction range restoration; dropdown/multiple/diagram alternatives; editor keyboard alternatives and restored data; teacher read-only exclusion; visible save failure/retry; 390 px viewport and desktop screenshots on both courses. The domain/repository owners verify immutable first evidence and IndexedDB writes; the shell checks visible interaction and restoration.

Integrated strict TypeScript now passes (`typecheck.json`). Real browser uses the pinned workspace Playwright package with installed Microsoft Edge, new isolated project-owned persistent profiles and synthetic namespaces. Profiles are deleted after closing; screenshots/results remain. No original user browser store is opened.

`browser-results-first.json` retains four successful numeric/immutable-evidence/reload, mobile save-failure/retry and automatic-text checks before a native-selection timeout. Foreman Vite logs confirmed concurrent full reloads during early runs. `browser-results.json` retains ten successful remaining checks on the stable host: two-section freeze and ordered offset evidence, postnumeric drawing review and final aggregate evidence, exact correction-range reload, single/dropdown/multiple choice, diagram keyboard selection, injected editor touch/restoration and both teacher read-only surfaces. Dropdown label was fixed after browser testing found option text leaking into its label; the explicit separate label now passes exact accessible-name selection. Intermediate failures remain in the evidence directory. Test synchronization now waits for visible saved evidence after asynchronous final assessment; correction offsets are derived from the source text rather than magic values.

Screenshots were visually inspected: desktop/mobile brand, numeric input, rubric sections and evidence, source model/criteria review, workspace and teacher preview are legible and unclipped. Tested mobile views have no document horizontal overflow. This is synthetic foundation UI inspection; complete activity chemistry and source-level layout remain the corresponding migration gates.

The native keyboard diagnostic was independently reviewed by A06. The same Shift navigation failed on a plain readonly textarea baseline, while Ctrl+A selected all and explicit offsets remained accurate. Support copy now documents pointer selection, Ctrl+A select-all and exact offsets for precise keyboard ranges; it no longer promises Shift navigation. Reviewer-guided focused browser verification passes (`browser-results-native.json`, `native-selection-reviewed.json`): native Ctrl+A selects the complete immutable text, the next ordered point selects an exact partial range using offsets, and first timing remains fixed. Earlier diagnostic failures are preserved unchanged.

The foreman added the missing DEV-only typed text policy and learning review. `browser-learning-review.json` passes the visible sequence: unrecognised input is unassessed with no evidence; recognised incorrect text freezes first marks/score at zero with one evidence record; equivalent-wording review visibly awards learning marks while first response, assessment, score, time and history remain identical; reload restores the same attempt and learning decision. The reviewed screenshot clearly separates the zero first result from the one-mark learning review. No fake chemistry checker or runtime curriculum bank is claimed.

## Reproduce verification

With the foreman Vite development server running at port 5181 and source quiescent:

```powershell
cd apps/Masters-of-Chemistry
npm.cmd run typecheck
node validation/s1/shell/browser-checks.mjs
node validation/s1/shell/browser-learning-review.mjs
```

Focused reviewer-guided native/offset check: set `$env:SHELL_FOCUS='native'` before the first browser command. Earlier accepted checks were retained and reused while focused fixes were verified; no successful corpus was rerun merely to manufacture timings. Browser launch uses pinned root Playwright with installed Edge and only project-isolated profiles. Effective model/effort and token usage were not exposed; none is invented.

The early submission/dependency interface concern was resolved by A03's substantive source trace. Active acid/calorimetry scaffolds have simultaneously available responses and aggregate first checks; `submission` is now only `all-required-parts`, and `response-reference` dependencies never disable draft inputs. The genuine source bond-enthalpy numeric-then-drawing review is represented explicitly by `drawing-self-check`, `drawing-review` and `confirm-drawing`; no speculative part-assessment API remains.

Final bounded stack refinement adds the per-instance Zustand navigation view store above. Strict compilation passes after this change. The foreman owns final two-course builds and prefix browser collapse/expand verification; no broad successful suite was rerun for this small reversible view change. Current owned implementation hashes are retained in `implementation-fingerprints.json`.

No activity bank migration, specialist chemical editor implementation or fresh chemistry acceptance is claimed at S1. No deployment occurred. Build/hydration/original browser storage operations are outside this worker's ownership.
