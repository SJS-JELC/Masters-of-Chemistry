# A06 independent native-selection review

- Agent: A06; job: S1-REVIEW-NATIVE; parent: A01.
- Stage: S1 only. Source/UI/contracts/domain/host unchanged by this reviewer.
- Runtime model/effort and usage measurements are not exposed.
- Command: `node apps/Masters-of-Chemistry/validation/s1/review-native/native-review.mjs` from the workspace root.
- Browser: installed Edge 154.0.4258.48 through pinned workspace Playwright 1.62.1, headless real browser engine, isolated new-project `.browser/A06` profile. No original-app stores accessed.

## Disposition

The original native test assumes that a read-only textarea supports Ctrl+Home then Shift+End in this browser. That assumption is false: the same sequence remains at 0..0 in a plain browser read-only textarea, while an editable baseline selects 0..22. Focus and correct keydown/up events are present; no unexpected navigation occurs during selection. There is no evidence that React state changes or HMR caused this failure.

Ctrl+A selects 0..45 in both plain and React read-only controls. The React picker updates the displayed offsets and enables confirmation; confirmation records precisely `A precise explanation.\n\nA second explanation.` from the frozen response. Explicit offsets 2..9 independently record `precise` on the next ordered rubric point. This provides a working keyboard/non-drag route to precise evidence without unlocking the response.

The current support note promises `Shift + arrow keys`. That promise is unsupported by the browser actually checked. Recommend A04 make the minimal instruction/test correction:

1. Keep the textarea read-only and preserve the exact frozen text/range validation.
2. Describe pointer selection, Ctrl+A to select all, and explicit character positions for precise keyboard selection. For example: “Select text with a pointer. Press Ctrl+A while the text box is focused to select all. For a precise range using the keyboard, enter character positions below; the first character is position 0.”
3. Replace the failed Shift+End assertion with Ctrl+A and an exact full-text range assertion, retaining the existing offset partial-range check.

No domain, contract, persistence or timing fix is indicated by this exception.

## Verification retained

`native-review.json` contains SHA-256 fingerprints, browser/version, correct selection/key/focus/value diagnostics, baseline comparisons, actual controller/session snapshots, page errors, navigation evidence and four passed checks. `original-sequence.png`, `pointer-focused-sequence.png`, and `review-complete.png` were rendered and visually inspected. The first two show the failed advertised keyboard route and selected-all state; the final shows completed assessment and one independent evidence record. The retained snapshots contain both exact recorded snippets.

First response, submitted timestamp, assistance and active timing remained deeply equal before/after both ranges and after reload. No evidence existed during rubric selection; finishing created one record, and reload retained exactly one with the same attempt ID.

`first-execution.json` retains the initial review harness failure: an immediate history snapshot ran before the React history render committed. The completed rerun waits for the observable “1 independent” UI state after assessment before asserting; it does not weaken or skip the evidence assertion.

Limits: this review is bounded to the genuine selection exception. Headless Edge was checked, not every browser/platform or a full suite. The support-note correction requires the source owner and remains open at review completion.
