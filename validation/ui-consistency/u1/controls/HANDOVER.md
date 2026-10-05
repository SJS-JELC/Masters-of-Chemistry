# UI-CONTROLS-U1 handover

Job: UI-CONTROLS-U1. Agent: U02 (`/root/ui_consistency_foreman/controls`). Direct parent: UI consistency foreman. Status: PASS pending foreman/root acceptance. No delegates.

## Result

The generic, source and dot-and-cross curriculum players share `QuestionActions`, `questionActionState` and `useQuestionKeyboard`. Each has one question-end footer containing exactly **Check, Clear, Give Up, Next**, in that order. The row stays right aligned and unwrapped; each button is 44px tall. Comfortaa and shared platform colours apply despite retained source-family button selectors.

Check dispatches the existing first submission or learning correction command. Clear dispatches one central `clear` command and remounts response surfaces to discard transient editor drafts, undo history and working feedback. Give Up dispatches existing reveal/worked-answer assistance; dot-and-cross opens its checked-answer dialog. Next obeys the host's `canNext` gate. Existing rubric judgement, finish-marking, drawing confirmation, hints and specialist editor controls remain.

The foreman owns the central reducer, persisted `currentResponseChanged`/`currentGiveUp` UI markers and host correction-feedback invalidation. This worker uses those interfaces and preserves the attempt engine as the sole evidence owner.

## Action state table

| Current state | Primary | Next | Behaviour |
|---|---|---|---|
| New/unaccepted response | Check | Disabled | Source readiness can disable Check; invalid submission never unlocks Next. |
| First accepted wrong result | Check | Enabled subject to host | Check evaluates corrections for learning. |
| First accepted correct result, unchanged | Next | Enabled subject to host | Frozen-response comparison plus UI marker protects current correctness. |
| Current correct automatic correction | Next | Enabled subject to host | Original score/response/time remain fixed. |
| Edited/reverted/Cleared after correctness | Check | Earned access retained | Stale correction feedback/highlight is removed by host; Clear blanks controls. |
| Give Up | Next | Enabled after accepted reveal | Existing assistance semantics; no independent credit for initial reveal. |
| Edited/Cleared after Give Up, including reload | Check | Earned access retained | Persisted UI markers prevent a blank reveal/Clear from restoring stale Next emphasis. |
| Rubric/drawing review pending | Check, disabled | Disabled | All four footer actions disabled; required staged controls must finish. |
| Teacher/review mode | No action row | No action row | Read-only controls; no command/evidence flow. |

## Keyboard

Typed answer fields opt in with `data-answer-input`. The first enabled visible typed answer focuses on a new question/attempt, including a deferred lazy editor. Rerenders and Clear do not refocus. A new multipart attempt focuses its first field even if its predecessor's last field was focused.

Enter advances enabled typed fields in DOM order, then uses Check. If Next is primary, Enter uses Next. Shift+Enter retains a newline. IME/composition, keyCode229, repeats and modifier shortcuts do not submit. Native buttons/selects, unmarked editor coordinates, dialogs and specialist diagram shortcuts retain their own behaviour. Electron orbital cycling and 0/1/2/D/Space keyboard input remain; the “Set spins without cycling” panel is removed.

## Changed source paths

- `src/ui/QuestionPlayer.tsx`
- `src/ui/SourceQuestionPlayer.tsx`
- `src/ui/DotCrossPlayer.tsx`
- `src/ui/QuestionActions.tsx` (new)
- `src/ui/action-state.ts` (new)
- `src/ui/use-question-keyboard.ts` (new)
- `src/ui/shared-actions.css` (new; only CSS owned/edited here)
- `src/ui/ResponseControl.tsx`
- `src/ui/SourceResponseControl.tsx`
- `src/ui/NumericWorkingControl.tsx`
- `src/ui/EnergeticsResponseControl.tsx`
- `src/editors/electron-configuration/index.tsx`

The dormant `EnergeticsPracticalPilot.tsx` has no runtime import and was left unchanged. Existing specialist editor-local Clear/Reset controls remain within their editing tools; the shared footer is the sole main question-action row. No chemistry, IDs, bank data, Olympiad controls, protected siblings, release outputs or deployment were modified by this worker.

## Validation

- `unit-final-log.txt`: 5 focused pure state/controller tests PASS. Covers initial/incomplete/wrong/correct/current corrections, editing/reverting, Clear, Give Up before/after marking, reload, canNext, staged/preview guards, immutable first response/score/timing and no revealed independent evidence.
- `typecheck-final-log.txt`: `npm.cmd run typecheck` PASS for the whole current app.
- `browser-results.json`: current real headless Edge PASS, no page errors. Generic keyboard/state table; all 11 curriculum activity families at 1280/768/390; exact footer labels, one row, viewport fit, right alignment and Comfortaa; Give Up/Clear. Source rubric and level3 bond-enthalpy drawing stages cannot be bypassed. Energy editor Enter commits locally, Clear resets uncommitted draft and undo; electron cycling/keyboard retained.
- `app-browser-results.json`: actual production entry running in DEV at port5188 PASS. Uses an isolated alpha-v2 run namespace and real IndexedDB readback, reload and Next. Wrong first result/correction/Clear/Give Up preserve frozen first response, marks and timing. Clear removes stale correction display. Reveal/Clear reload restores Check even when initially blank. Next creates a fresh attempt ID and focuses its first typed response.
- `screens/`: 33 current family screenshots, generic desktop and actual application reload. Manual rendered inspection performed on mobile dot-and-cross, practical, structure-and-bonding and electron configuration plus desktop actual acid marking. Geometry/font checks run on every family/viewport. Remaining course-wide background/width/transition/Olympiad and independent final visual acceptance belong to U03/U04/U2/root.
- `source-fingerprints.json` and `owned-changes.patch`: 12 owned source fingerprints and reviewable differences against the U1 before copy.

Reproduce from project root:

```powershell
node --test validation/ui-consistency/u1/controls/action-state.test.mjs
npm.cmd run typecheck
node validation/ui-consistency/u1/controls/browser.mjs
node validation/ui-consistency/u1/controls/app-browser.mjs
```

Browser scripts import the pinned workspace Playwright via its explicit root dependency path; they use the existing app DEV server on 5188. The bounded test harness is under this validation folder and is not a runtime registration/build entry. It mounts current players and the real attempt controller with separately labelled synthetic keyboard fixtures and actual source-owned family questions.

## Retained failed probes and limits

Raw failed probe JSONs remain in this folder. First geometry failure exposed a legacy acid primary-button selector; shared row specificity/geometry fixed it. Subsequent setup failures used obsolete TC01 code, unsupported practical level1, and historical inaccessible save/Undo labels; current canonical provider selection, supported level2, IndexedDB transaction readback and current Undo label resolved them. The latest full browser run is PASS. Typecheck's temporary concurrent Olympiad errors and later local union-narrowing issue were resolved before the final PASS/build freeze.

Browser evidence is real headless Edge, not a native foreground-device or screen-reader certification. Focus/autofocus is exercised in fixtures and actual app Next/reload; lazy-input handling is implemented, but no separate cold-network lazy-electron autofocus measurement is claimed. Full release, protected-original checks and cross-course integration are foreman-owned; no new timing or chemistry algorithm was introduced. Actual usage/token accounting was not exposed.
