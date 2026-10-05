# A22 · bounded Next/save chemistry follow-up

**PASS for the new current freeze.** The prior substantive chemistry review remains intact. This follow-up verifies its applicability after A01's separately owned shared-host fix.

- Previous accepted freeze: `75a6c5c275efc120705e199e9527f8241721d41ab24d7a85284ec9f00aa07b88`.
- New freeze: `35e6c969f6b9f5fefff7577922dd6703b6a645dc2308a460d44d19d3ce790eb1`; all 517 current input bytes and their aggregate independently match before and after the production browser check.
- Only changed source: `src/foundation/ActivityHost.tsx`. Every other source, including all chemistry content, marking, editor and C3 files, is byte-exact. Configuration and other build inputs are unchanged. Rebuilt dist assets and the two runtime release manifests are retained as the expected build differences.
- All 237 original source fingerprints independently reread and unchanged. The original A22 completion is byte-identical to the foreman's pre-fix archive. Original chemistry outputs were read only.

## Scope and evidence

I read the complete retained `ActivityHost.diff` against exact previously accepted host bytes. The fix adds Next pending/loading guards, waits for the current save, stops on save/read failure or paused/teacher/unmounted state, and then uses the existing source provider and scheduler. It changes no chemical question, answer, seed convention, marking policy, response editor or C3 validation. Actual Next/save lifecycle behavior remains the assigned A21/A06/A23 gate.

The bounded actual production sample passed three checks on root Playwright 1.62.1 and Edge 154.0.4258.48: historical AB-0000SN teacher precision (moles 3 significant figures, volume 2 decimal places); EB09 solid ionic compound wording with the giant ionic lattice answer; current AB2-3-1-1 pupil dilution response, accepted and persisted at 3/3. All three new screenshots were actually inspected for quantities, units, precision, prompt/answer and marking agreement. No runtime errors occurred. Browser/context and the owned port 5202 server closed in awaited cleanup.

Detailed guards and changed/removed build paths are in `source-guard.json`; post-browser hash/source/diff/inspection evidence is in `verification.json`. The prior review at `../HANDOVER.md`, its 6,227-descriptor coverage, 245 sampled references plus supplements, 157 reviewed diagrams, 24 original production checks and C3 current22/source23/history evidence remains applicable by exact content/marking/editor/C3 equality. This follow-up does not claim those were manually repeated. Current full OCR PDF/canonical managed Python and formal-model/seed/offline boundaries remain exactly as previously disclosed.

One preflight harness assertion initially omitted the two expected rebuilt release manifests from allowed output changes. Its original script is retained; the corrected assertion allows exactly those two files and dist outputs, still rejecting any other non-host input change. No source or chemistry assertion was relaxed. An attempted browser run before its helper had been generated is also retained as a harness failure, not a product result.

Requested model/effort: gpt-6.1-sol/high; effective unknown; usage null. No source edits or delegation. All new outputs are inside this follow-up directory.
