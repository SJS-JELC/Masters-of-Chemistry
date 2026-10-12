# IGCSE recall review

This development page uses the current **121** canonical IGCSE facts, production `RecallTestPlayer`, provider, attempt controller, marking policy, learning-review policy and response controls. It is outside the production entry and saves no pupil database, evidence, mastery or recall stage.

## Open and review

Use the existing main Vite server:

http://127.0.0.1:5203/scripts/tests/igcse-recall-review/index.html

The preserved port 5197 also serves this source path when available. For a new server, run `npm run dev -- --port 5203` from `apps/Masters-of-Chemistry`; preserve other tasks’ running services. A direct question link can include `?id=igcse-recall-062`.

Search by wording or canonical ID. The ID appears beside Copy ID and inside the production player. Enter responses using the actual choice, single-line, sentence-gap, formula, numeric and dynamic exception controls. Check displays independent field feedback and the full model. Exception rows begin at zero; Add/Remove does not pre-reveal the expected count. Formula display preserves supplied raw text, including mistakes.

Selective **Mark as correct** appears only where the production policy permits equivalent wording. It records a separate learning decision. Original automatic marks, raw responses and first assessment remain fixed. Changed responses have their own export fields. Production Check stays disabled after the immediate model is shown; edits are learning-only. Optional correction-event recording is unused by this UI. Reset answer starts a fresh trial and retains prior assessed trials, notes and status. Navigate away/reload to resume the current review trial. Read-only teacher preview uses the production teacher renderer and creates no trial or assessment.

Mark Reviewed or Issue, record a note and **Export review JSON** before sharing. Export schema 2 includes **all current IDs**, including unreviewed or unentered questions, with status/notes, current raw responses, review-local attempt, every assessed trial’s frozen first response/assessment, original automatic field outcomes, separate learning decisions and any correction checks. It includes source provenance and a SHA-256 fingerprint of `JSON.stringify(factsFor('igcse'))`. A changed bank uses a separate `igcse-recall-review-v2:<fingerprint>` localStorage namespace; previous review data is retained. Original teacher source, retired/replaced IDs, Q087 quarantine and Q088 exclusion remain documented as source/history, outside the active list.

The controller’s monotonic review clock is fixed at zero; wall time only validates production command timestamps. Every export is explicitly review-only with synthetic zero timing and `independentEvidence:false`. There is no pupil repository, browser active-time binding or scheduler in this page. This interactive review trial must not be treated as a main-app student test launch.

## Validate

With the server running, from the app:

```powershell
node --experimental-strip-types --test scripts/tests/igcse-recall-review/review-state.test.mjs
node node_modules/typescript/bin/tsc --noEmit -p scripts/tests/igcse-recall-review/tsconfig.json
node scripts/tests/igcse-recall-review/verify.mjs
```

Set `RECALL_REVIEW_URL` to the full harness URL to use another running port. The verifier uses pinned workspace Playwright and installed headless Edge, traverses all 121 model fixtures through native production controls, and checks representative negatives, independent feedback/models, review immutability, notes/reload, all-ID export, direct links/search/reset, teacher preview and isolated storage. New reports, exports and screenshots go to `validation/recall-main/s3/harness/`. Native foreground/hidden-tab/idle/suspension timing is outside this review-only clock and is a main-app integration gate.

## Historical evidence

The existing `desktop.png`, `mobile.png` and `verification.json` beside this README describe the previous 144-fact harness and are retained unchanged. Current acceptance evidence belongs to the S3 directory above. Historical model-answer semantics must not be applied to the current bank or used to reinterpret pupil evidence.
