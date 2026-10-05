# A06 — S5 behaviour harness exception

## Disposition

**PASS: approve exactly one deep and one import continuation using the exact proposals below.** This is approval of the repaired harness. The worker must still pass the actual substantive suite before behaviour acceptance. No application, worker script, configuration, original app, root control or log was edited by A06.

| Artifact | Approved SHA256 |
| --- | --- |
| `validation/s5/behaviour/proposed-deep-browser-v3.mjs` | `0d4b3be1e3ce929485dbffddbaf46d8073e256a6cab08c9d255fe4d826124263` |
| `validation/s5/behaviour/proposed-import-browser.mjs` | `9ca375bd374dc6dbedfb5a65aef36f07699fd48c0c3fee47952be02b31d9db8b` |
| Current `validation/s5/behaviour/server.mjs` | `747cb5f6f51c610a5769fcd6780a94b4e2bfed4dd51b7ad295a9abcbc90ef385` |

The v1 deep proposal is not approved: its partial scenario depends on random Next selection being multipart. The v2 setup is retained separately; v3 unloads the old host before saving the replacement fixture, avoiding outstanding cleanup saves from that host. This review covers the listed deep/import artifacts only; a separately prepared revision script is not included in this approval.

## Confirmed causes and exact repairs

- The typed numeric contract uses `raw` and `unit`. The two injected responses used `value`, so actual input checks reached `.trim()` on undefined. The acid marking policy also requires the exact question part unit. The repairs supply `raw:String(p.acceptance.expected),unit:p.unit` and `raw:'999',unit:q.parts[0].unit`.
- Next performs queued persistence, history loading, selection/restoration and adoption asynchronously. The previous saved player remains visible during this work. The added wait requires a durable current session with a different attempt ID, that new attempt present in the real repository, and the displayed `.question-meta code` matching its persisted ref. The original unequal-ID, answering-phase and fresh-time assertions remain unchanged.
- A partial result needs a deliberate multipart question. v3 pauses the current draft, captures the real host URL, navigates to the harness's probe page, then writes a fresh unassessed answering attempt plus paused practice session through `createChemistryRepository`. It restores via the production UI and checks exact ID/ref. It adds no first response, assessment or evidence. Timing begins at zero with the provider's real idle allowance; no clock or visibility is mocked.
- The actual A Level provider restores `AB2-3-1-3`, seed 3, level 1, gem `u6-t1-1-2`; the actual IGCSE provider restores `CAL-0070XS`, seed 327808, level 1, gem `lower-10-3`. Both have three numeric parts. Independently invoking their actual marking policies with the proposed first-correct/remaining-wrong answers yields exactly 1/3 marks. Their source/provenance packet remains retained byte-for-byte.
- The wrapped Source JSON label changes its accessible name when React places the current textarea contents inside it. An isolated DOM-only probe of both actual production course import views observed exact-label count 1 before fill and 0 after fill, while `.legacy-import textarea` remained count 1. The proposed import changes only that locator, preserving the exact source payload, keys, imports and assertions. The probe did not press Preview or Import.
- The first server failure is a harness transform issue: installed TypeScript 5.9.3 interprets the actual `.ts` generic arrow source incorrectly when its filename is omitted (229 diagnostics). Supplying the actual `.ts` filename gives zero diagnostics. The current server explicitly serves `.mjs` as JavaScript and passes `fileName:file`. No immutable complete old server copy exists for a full historical server diff; this limitation is retained rather than claiming one.

## Independent verification and preserved evidence

Run `node apps/Masters-of-Chemistry/validation/s5/review-behaviour-harness/verify-disposition.mjs` from the workspace root. Its eight checks verify retained hashes, the exact approved script bytes, allowed differences and source-backed causes. After removing only the approved setup/readiness additions and reverting the two response repairs, the deep proposal equals the failed original. Reverting the one import locator equals its failed original. Thus all original first-score, partial-score, frozen response/time, correction/reveal/reload, single-evidence, quota rollback/retry, isolation, Next, teacher, statistics and import assertions remain intact.

`inputs.json` contains SHA256 fingerprints and immutable copies of 26 original results/scripts/proposals and relevant source files. `retained-screenshots.json` fingerprints the copied worker failure screenshots. `dom-probe.json` includes actual DOM/accessibility facts and browser version. Transpile outputs and diagnostics are retained. `verification.json` contains exact restored partial marks and current-versus-retained hash results; all 26 captured artifacts still matched at verification time. This is a bounded captured-path guard, not a claim that the whole source tree stayed unchanged.

The unrelated STATE-01 startup error/retry defect remains a real product issue owned by A17. Its fixes and behavioural acceptance are outside this harness disposition. A06 performed no full substantive replay, no timing acceleration and no native foreground actions. Headless DOM probe used root-pinned Playwright 1.62.1 with installed Edge 154.0.4258.48 on its own port 5206/profile; it closed the browser and server. Reviewer verifier imports only the real pure providers/marking for the two purposeful fixture refs.

Requested settings: GPT-6.1 Sol High. Effective settings and usage are not exposed and remain unknown. No delegates.
