# F1 typed-answer and written-correction pilot

Job `F1-UI-PILOT`, agent `F03`, run `COMPONENT-FIDELITY-20261003`. Worker PASS requires foreman validation and root F1 acceptance.

## Implemented scope

The player now lazily mounts a scoped React component for the five diagram-free Energetics Practical correction questions: EP-CXMNAV, EP-CNN1LW, EP-DHLUOT, EP-6O192J and EP-6E1NDK. Native typed replacement fields, handwritten phrase buttons, selection/focus behaviour, the content/marking frame, original per-point model feedback and model panels use the final canonical source component DOM and CSS. The original appended overrides and exact Playwrite England Joined font are preserved. The font licence is retained beside the copied font.

EP-780GGH includes a graph and keeps its existing player until F2. Other activities, numeric controls, reaction profiles, pH curves, orbital editors, specialist dot-cross/molecule editors and general self-review remain unchanged. Their references are preparation for F2, not rendered acceptance.

The common masthead, one pink canonical question code at top, grade pill and footer remain host-owned. No original page wrapper, iframe, source page import, source storage, scheduler, timing or assessment implementation was brought into the player. Source siblings were read only and served through GET/HEAD routes; all original browser comparisons used fresh nonpersistent contexts with synthetic ephemeral responses.

## Precise shared-code change map

No pre-change text snapshot was captured. `../baseline.json` retains exact pre-change hashes. This is an honest function-level change map, not a claimed complete textual diff.

| File | Change | Boundary |
|---|---|---|
| `src/ui/QuestionPlayer.tsx` | Added one lazy component import and an early route for EP + correction part + no image context. | Existing generic player and dot-cross branch are retained; no provider/identity/host edits. |
| `src/ui/ResponseControl.tsx` | Added optional local `appearance`, `fieldLabel`, `multiline` presentation props; early delegate only for text/correction/choice when explicitly requested. | Existing default controls/response schema remain unchanged; NumericWorkingControl is untouched. |
| `src/ui/CorrectionSegments.tsx` | Added scoped native inline phrase-button presentation, `aria-pressed`, punctuation and post-selection focus callback. | Default native radio/checkbox presentation remains unchanged; stored selections remain existing start/end/text ranges. |
| `src/ui/EnergeticsResponseControl.tsx` | New original component DOM for native text input/textarea, choice labels and correction phrase plus typed replacement. | Presentation only; sends existing response contracts. |
| `src/ui/EnergeticsPracticalPilot.tsx` | New source-labelled fields, original workspace/marking feedback/model panels, source-ready gates and Enter field progression. | Existing commands own first score, assistance, correction, learning equivalence and Next. Reads source record by canonical ref; does not mark/save/time. |
| `src/ui/energetics-practical-pilot.css` | Final original component CSS scoped under `.ep-pilot`, explicit resets against generic panels, source responsive breakpoints and exact font face. | No original global/page/landing styles imported. |
| `src/ui/fonts/` | Exact font and OFL copy. | Source SHA-256 verified; no system font installation/dependency changes. |

The original equivalence button toggles. Both states are retained through the existing learning-review command, with explicit learning marks. The original source locks checked input and changes displayed retry marks; this platform deliberately permits learning edits, keeps the first result/timing immutable, and shows correction marks separately. Teacher controls are read only and model answers visible, producing no evidence. Those are required shared-engine adaptations.

## Source/reference matrix

[REFERENCE-MATRIX.md](REFERENCE-MATRIX.md) and [reference-matrix.json](reference-matrix.json) cover all twelve activities. The machine matrix contains source file/hash evidence, active HTML-linked styles/scripts, exact DOM/interaction construction locators, CSS declaration rules in source cascade order, responsive condition locators, font hashes, inline SVG construction lines and external source SVG geometry. It maps the six states (unanswered, partial, incorrect, correct, correction, model) to source locators. All F2-only state entries are explicitly reference-only.

## Verification and rendered inspection

[verification.json](verification.json): typecheck PASS; focused unchanged source-practical chemistry/marking, complete-set and correction gates PASS; shared-controller first-evidence/timing/equivalence/correction regression PASS; source provenance/equation conservation PASS; matrix source/hash coverage and exact font fingerprint PASS.

[browser-results.json](browser-results.json): Microsoft Edge headless using pinned root Playwright 1.62.1, isolated contexts, 42 screenshots. All six equivalent states captured for original and React at 1440×1000, 820×1180 and 390×844. Exact computed final phrase and input font family/size/weight/line-height agree with the canonical source. No horizontal document overflow. Keyboard Space selects the phrase and focuses the replacement, Enter submits, native pointer/mobile tap works. Reload preserves selected phrase, response and attempt; corrections, equivalence toggles, reveal and reload retain immutable first score and timing and exactly one history record. Teacher creates no evidence. Revision restores the response and same attempt, scores once and advances through scheduler-controlled Next to a fresh attempt. Full-chrome images verify one top code and no repeated code in the pilot component.

Inspected all six state pairs in the three contact sheets, then detailed desktop incorrect, mobile model, all teacher model shots and all full-chrome viewport shots. The handwriting is legible; boxed segments wrap at mobile width; field labels/input borders and model panels remain clear; the marking panel moves below content at the source breakpoint. No clipped field, collision or horizontal scroll was found. The extra grade pill, wrapper width, correction score and immutable first-result note are deliberate platform adaptations; screenshots do not claim whole-page pixel equality.

Exact paired review paths:

- [contact-desktop.png](contact-desktop.png)
- [contact-tablet.png](contact-tablet.png)
- [contact-mobile.png](contact-mobile.png)
- Full wrapper: `react-desktop-full-chrome.png`, `react-tablet-full-chrome.png`, `react-mobile-full-chrome.png`.
- Detailed states: `original-{desktop,tablet,mobile}-{unanswered,partial,incorrect,correct,correction,model}.png` and matching `react-*` files.
- Teacher: `react-{desktop,tablet,mobile}-teacher-model.png`.

Prior accepted landing evidence and historical source tests remain untouched. Earlier pilot harness failures are retained separately: incorrect ARIA role locator, timing fixture expecting an answering-only field in assessed state, obsolete revision selection locator, and an asynchronous Next observation before transition completed. These were harness errors; final runs pass the production host without controller changes.

## Commands and ownership

From this project:

```powershell
node validation/component-fidelity/f1/ui-pilot/reference-server.mjs
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5188 --strictPort
node validation/component-fidelity/f1/ui-pilot/reference-matrix.mjs
node validation/component-fidelity/f1/ui-pilot/verify.mjs
node validation/component-fidelity/f1/ui-pilot/browser.mjs
node validation/component-fidelity/f1/ui-pilot/contact-sheets.mjs
```

Original read-only server: 127.0.0.1:5197, tool session 27739. New app Vite: 127.0.0.1:5188, session 99905. Left running for parent/root review; parent owns final shutdown. Both production builds, budget and protected-app stage checks belong to F01 integration and are not claimed as worker-executed.

## Limitations

Native OS hidden/minimised/suspended browser behaviour is not tested or claimed here; the timing implementation is unchanged. The complete unchanged historical S3 energy suite has two obsolete C01-style identity assertions that now fail under canonical-only identity; focused practical/source/controller checks pass, and F02 owns canonical identity coverage. No F1 implementation blocker remains. No F2 restoration or acceptance is claimed. No usage measurements were exposed.
