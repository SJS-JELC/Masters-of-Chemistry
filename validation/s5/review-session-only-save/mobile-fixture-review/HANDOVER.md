# A06 mobile live-region fixture disposition

**PASS: approve one exact harness continuation**, proposal SHA256 `d0190eb5b0c044eebd8bc45ae0d22e31e771dd74a0a016233e3bd2bc320f9581`. This is approval of the fixture correction, with actual terminal recovery checks still pending.

The retained fa9 run passed four empty paused-session cases and failed the two terminal cases while waiting for `getByRole('alert')`. Both original body-text captures and inspected screenshots show “Work has not been saved.”, the storage-full explanation and Retry save. They show revision in progress rather than completion. QuestionPlayer renders this error in `.save-status.save-error` with `aria-live="polite"`; ActivityHost renders the empty paused-session error with `role="alert"` and the slightly different wording “Work has not saved.”. The fixture incorrectly required the latter markup in both states.

The exact patch changes terminal region selection, adds the explicit polite-live-region attribute assertion, accepts the two actual source wordings while retaining the failure and quota message requirement, and accurately labels report metadata. The verifier reconstructs the entire proposal from those two replacements and requires byte equality. Thus all later durable equality, disabled Next, keyboard Tab/focus-visible/Enter Retry, first response/evidence immutability, restored completion, overflow, reload and 30000 ms awaited-poll assertions remain intact. The paused branch still requires its actual alert role.

The approved bd69 Host, QuestionPlayer and served production files match the fa9 freeze: 262 relevant controls verified. No application or worker files changed. Raw reports, failures, screenshots, baseline/proposal scripts, server, fixture and source are copied byte-exact under `retained/`; originals remain intact. `proposal.diff` and `verification.json` retain the independent verification.

## Limits

No browser was executed by this reviewer. The original terminal failure capture contains prior durable rows and body text, not a post-failure database snapshot; later durable assertions have not passed in those failed terminal executions. The source attribute proves the intended polite-live-region semantics, not actual native screen-reader speech. No new accessibility-tree or native announcement claim is made. A23 must execute the corrected terminal checks; A21 owns the substantive session/concurrency product gates.

Requested model/effort: gpt-6.1-sol/high. Effective settings and actual usage are not exposed.
