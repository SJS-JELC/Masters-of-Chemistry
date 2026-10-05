# F3-SHARED-FINAL-FIX / F08 handover

Worker PASS; F12 independent review, F07 final build/protected closure and ROOT final acceptance remain required. No publication.

## Scope and source authority

Local execution under F3 PLAN.md and F2 root-acceptance.json; no children. Exactly three owned runtime files changed: SourceQuestionPlayer.tsx, SourceRubricReview.tsx and source-adapters.css. Exact accepted-F2 starting bytes are in before/. f3-only.patch and freeze.json record baseline/current hashes. F2 evidence and manifests were preserved.

Requested GPT-6.1 Sol/high unchanged; effective settings and usage are not exposed. Source siblings were read-only; no originals built, cloud placeholders hydrated, real browser stores used or OLY files/hunks edited. Tests use root-pinned Playwright1.62.1, Edge, isolated nonpersistent contexts and short app-owned .f08-tmp.

## Changes

- EE shared actions use natural content widths and source14.4px font, 46px minimum height, 10px16px padding. Flex wrapping overrides the inherited mobile equal-width rule. The assessed mobile row now places Check correction on its own row and the worked-answer/Next actions beside each other, with single-line labels. Family metadata scopes this; no ID allowlist.
- Actual firstAssessment.kind=self-rubric supplies completed state to both rubric views. Completed views retain disabled judgements and saved evidence, show completion text, omit Finish marking and the evidence picker, and stop inviting a new finish or evidence selection. Unfinished review retains all controls and commands.
- Numeric responses with existing inline feedback and completed rubrics show a compact labelled immutable first score. Their original first mark points remain in native details/summary, closed by default and keyboard accessible. The detail body reads the original firstAssessment, never correctionFeedback. Nonduplicated substantive feedback remains expanded for other families. Eligible learning-alternative actions prevent compaction, so those controls remain visible. Models, correction score and first-score distinction are preserved.

No domain, marking, timer, store, provider, persistence or scheduling code changed.

## Actual validation

| Evidence | Result | Substance |
| --- | --- | --- |
| typecheck.json | PASS | npm.cmd run typecheck / tsc --noEmit; same frozen source hashes |
| energy-actions-results.json | PASS3 /12 PNGs | Actual EE-6US2V7 desktop/tablet/mobile incorrect, correction, model and restored first result; one-line button label rectangles, native font/min-height, no clipping/document overflow, mobile two rows. Its necessary substantive feedback stays visible. |
| numeric-browser-results.json | PASS9 /72 PNGs | CAL, BE and BE drawing at all3 sizes: incorrect/correct/correction/model, original-details keyboard open/close, inline feedback retained, initial hidden expanded list, immutable first result/timing, correction3/3 versus original2/3, working restore and deduplication/Next. |
| acid-results.json | PASS3 /21 PNGs | AB at all3 sizes, same numeric score/details/correction/model/restore invariants. |
| rubric-browser-results.json | PASS6 /42 PNGs | Both comparison levels at all3 sizes, real locked text/range evidence, self-review then completed correct/incorrect/model; no Finish marking, enabled judgement or evidence picker after assessment; keyboard original-details, immutable first result/timing, restored score/history1. |
| revision-results.json | PASS1 /1 PNG | Actual topic selection/launch, awaiting-evidence reload with same attempt, keyboard range persistence, score1, firstResponse fixed, history1 after reload, scheduler Next fresh timer/sessionrevision. No question fixture replacement in revision. |
| contacts.json |21 contacts | Inspection summaries; full-resolution raw PNGs retained. |

Inspected actual EE mobile assessed actions; desktop CAL incorrect compact score; completed SBC desktop and mobile; BE mobile correction and original-score distinction; AB mobile model. These confirm readable controls, collapsed original marking, completion message and visible models/feedback. The all-Met rubric stress fixture selects the whole locked answer for each point, intentionally producing repeated evidence quotations and overlapping saved ranges; the completed Not-met fixture provides a concise full-size rubric view. Original evidence quotations themselves remain read-only.

Fixture startup failure is retained in fixture-startup-failure.json: a copied app-root path had five parents in the new four-level evidence directory. No browser ran. The same bounded correction resolved all probes; root pinned Playwright remained unchanged. No substantive runtime failure occurred.

## Freeze and remaining gates

Source frozen 2026-10-03T20:22:19.516Z. All exact three current/baseline hashes are in freeze.json; final manifest rechecks current bytes against them. F07 was notified before final capture completion. No outstanding owned defect identified. F12 independently verifies source/runtime; F07 owns final current static build and wider protected/engine regression; ROOT owns final acceptance.
