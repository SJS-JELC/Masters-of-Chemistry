# A06 — terminal session and learning correction race

## Initial genuine defect

**ESCALATE: current c1c561 Host pairs the old assessed attempt with a terminal revision session that has no current attempt.** The repository validator correctly rejects the write. Do not weaken that validator.

Both independently assigned A21 held-transaction browser captures show a successful terminal session commit (`status: complete`, `current: null`) while the corrected raw value912.5 fails to persist. Visible status says **Work has not been saved. Session does not reference attempt**. Original first response, first assessment and exact evidence remain unchanged. A06 independently invokes the actual `validateWrite` on each captured attempt: attaching the completed session throws that precise error; saving the corrected attempt without that session validates successfully. This establishes a Host association defect, not a false fixture assertion.

The same source association fails for correction after already committed completion. A pending terminal transition must not be committed by an attempt-save callback, and a correction must not restore its captured old revision session over the completed session.

## Bounded proposed design

A01 proposes separate curriculum/session failure ownership with exact write/callback/error retained for each family. This design is approved for implementation review within Host only, with the following requirements:

- A queued curriculum correction decides its association using the committed current session when its write executes. Include a session only if it references that exact attempt; omit it while a terminal transition is pending or after completion. Do not pair `current:null` with the old attempt or replay a captured old pre-terminal session.
- Only the checked successful session-only write commits its session transition in memory. Curriculum callbacks never commit terminal transitions.
- Successful curriculum save does not clear an unresolved session-family failure or its exact Retry operation. Overall error and authoritative `saveFailed` remain derived from both families. A successful latest draft may supersede an earlier failed draft for the same current attempt, retaining normal correction behaviour.
- Retry handles the failed session operation first. Any separately failed curriculum operation remains visible afterward until successfully retried or superseded by the latest successful draft. No failed family silently disappears.

The source implementation and three actual browser states still require acceptance: correction overlapping successful terminal commit; correction after completion; failed terminal save followed by correction with honest error/Retry/durable state. The new two-family bookkeeping should also cover both families failing, with ordered retries preserving both pending operations. Standard learning-only corrections remain available; first response, score, time and evidence remain immutable.

## Retained evidence

`initial-review.json` contains fourteen captured source/raw/screenshot/freeze fingerprints, exact course-specific validator results and the minimum recommendation. The failing source was retained at06:14:24.484 UTC before A01 edits. The preserved worker freeze is `c1c56180ba0bedb54cfa88eb666b22cb951869371488ef332c7a23e0c00e6812`. Source and raw failures are retained in `retained/`; earlier session-only12 and Next16 PASS do not override these actual concurrent failures.

No A06 app/worker/configuration writes, browser replay, broad review, children or validator edits. Requested GPT-6.1 Sol High; effective settings and usage unknown. Exact final Host diff review and A21 browser proof remain pending.
