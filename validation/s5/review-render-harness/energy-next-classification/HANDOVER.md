# A06 — actual Energy Next product defect

**ESCALATE: the actual Next click is lost when a pending valid coordinate draft commits on blur.** The independent clean control works. This is a source-backed product defect, not another harness retry approval. A01 owns the fix; A21 owns broader shared behaviour revalidation.

## Observable reproduction

Two fresh isolated headless Edge contexts used the current frozen production host on port 5203, root-pinned Playwright 1.62.1, mobile 390×844, 4× CPU and the worker's 150 ms/200000 B/s down/93750 B/s up network settings. The source-faithful D03 session contained launch history `[D03]`. Actual UI operations supplied a complete profile, assessed it and retained one real repository evidence record. The reviewer ran only targeted Next cases, not the full bank/performance suite.

For the unfinished-draft case, actual trusted keyboard input set local Peak level screen y text to 270 without Enter. The event timeline records:

1. Trusted Next pointerdown/mousedown sees the enabled button and Saved state.
2. Trusted input blur/focusout occurs.
3. The DOM changes to Saving and Next disabled.
4. Trusted Next pointerup sees the disabled button; no Next mouseup/click is dispatched.
5. Saving completes, but the real session remains on D03 and the same attempt ID. Current persisted peak is 270; frozen first peak remains 150, with identical first response, first assessment, first timing and single evidence.

A second trusted click after saving creates a new durable attempt and different question code. The independent clean control dispatches the complete trusted pointer/mouse/click sequence on its first gesture and advances to a fresh attempt/code. Actual event logs, before/after attempts/sessions/evidence and screenshots are retained in `execution.json`, `unfinished-draft.png` and `clean-control.png`.

## Cause and minimum recommended fix

The energy coordinate input commits its local valid draft on blur. Host response dispatch immediately sets saving and queues repository work. Host `canNext` excludes saving, and QuestionPlayer uses native `disabled={!canNext}`. This disables the button between native mouse-down and mouse-up, suppressing its click event before `nextQuestion` can run.

Keep Next enabled during an ordinary save while retaining paused/error protection. The existing Next handler should await the queue and then check authoritative `saveFailed.current`, rather than only a captured React save-status value, before advancing. Add a synchronous `nextPending` guard plus visible busy state while Next itself runs, so two clicks cannot start duplicate transitions. Do not change the first response/time/evidence or scheduler semantics. Independently verify single-click draft blur, clean control, failure-after-blur/save blocking and rapid double-click behaviour on the rebuilt static host.

## Evidence boundaries

The original A23 failed v2 has no post-click snapshot. Its individual cause remains unknown; this new independent source-faithful reproduction proves the actual defect and does not invent missing old state. Its exact script and raw failure, plus A23's unexecuted instrumented proposal, remain retained. The reviewer used its own independent targeted probe; it did not execute the worker's instrumented proposal.

`fingerprints.json` contains fourteen retained source/evidence hashes and 120 current static asset hashes captured after the probe while source/build were explicitly held quiescent. These are post-run capture fingerprints, not invented pre-run hashes. The failing source includes the saving-disable condition. A01 was told capture was complete before author changes. `verification.json` separately reports later current-vs-retained source changes if present. No whole-tree unchanged claim is made.

Run `node apps/Masters-of-Chemistry/validation/s5/review-render-harness/energy-next-classification/verify-disposition.mjs`. Eight checks verify the trusted event ordering, actual durable identities, frozen evidence, clean control and source path. All writes belong to this review folder. Browser closed. No application/worker edits, children, mock clock, native foreground or broad performance replay. Requested GPT-6.1 Sol High; effective settings and usage unknown.
