# S5-FIX-STARTUP-ERROR / A17

Worker PASS covers the bounded host correction and the named startup checks. A21's final static-build recheck and foreman/root acceptance remain separate.

## Result and exact scope

Only `src/foundation/ActivityHost.tsx` changed. A global **Saved data could not be loaded** alert now precedes setup for unavailable history/session/attempt reads, invalid records, a missing referenced attempt, or a failed provider restore. It distinguishes invalid saved data from storage being unavailable. The alert explains that saved records have not been cleared and offers **Retry reading saved data**. Startup reading has a visible status; Start is disabled and the player, Resume, and practice counts are suppressed until all required reads and restore succeed. Teacher preview remains read-only and creates no evidence.

The former startup effect is now one read/restore callback: read real curriculum history, read current session, read any referenced attempt, restore its real provider question, then adopt validated state/history. Failed intermediate reads cannot be overwritten by a later saved-session status. No reset, deletion, migration, new profile, replacement attempt, or fresh-start override was added.

Retry increments a local repository-instance generation and immediately marks reading busy. `useMemo` constructs a fresh repository with the **identical database name and namespace**; the existing startup effect reruns the same callback. This is necessary because Dexie retained the initially failed IndexedDB opener after the synthetic SecurityError was removed. The previous effect cleanup sets its cancellation flag and mounted flag; the replacement effect reestablishes mounted state. No repository disposal/close API exists in the current contract, so the host does **not** explicitly close previous Dexie database connections. The browser closes them on document/context disposal. Retry does not delete or rewrite any rows.

`source-diff.patch`, `before-ActivityHost.tsx`, and `source-hashes.json` retain the complete before/after scope. SHA-256 after: `324e4b890abbc81f633a7f4e763b65a3dedeccaf799106cfd93cc25c49f1aec4`. Source token checks prove runtime/resolve, state application, history/save wrappers, adoption/fresh attempt creation, command dispatch, Next, Resume, save retry, navigation, and teacher loading functions remain unchanged. The restored-data callback contains no repository save/delete/clear/import call. Timing/session/scheduler/repository algorithms and shared interfaces were not edited.

## Actual browser evidence

`startup-checks.json` contains the passing individual checks from the retained full report:

- Both courses: corrupt current session; missing referenced attempt; corrupt referenced attempt; corrupt evidence history. The visible alert, disabled Start, absent misleading count/Resume/player, and raw-row preservation through repeated Retry are checked.
- After external repair of only the synthetic fault, Retry restores the exact original paused attempt, session, response, ID, timing and raw rows.
- Both courses: injected IndexedDB.open SecurityError is visible; removing the injection and clicking Retry recovers storage, permits a new practice attempt, and saves it through the actual controller/repository.
- Normal practice, recovery, teacher visits and return work on both courses with zero new evidence during teacher viewing.
- A Level assessment after recovery retains first response/time through correction and reload, with exactly one evidence row.

Fault injection and synthetic row repair belong to the browser fixture, not application code. The fixture removes only its own malformed synthetic history row to model external repair. All profiles/cache/screenshots remain in this project; Playwright 1.62.1 is imported read-only from the pinned workspace package. Actual desktop invalid-session, mobile blocked-storage, and recovered paused-state screenshots were visually inspected.

## Retained failures and independent tail

`first-browser-results.json` retains the initial two blocked-storage recovery failures: callback Retry reused Dexie's failed opener. The same-name fresh repository instance corrected this; the next required startup smoke passed all eight original groups.

`expanded-first-browser-results.json` and `expanded-first-igcse-failure.png` retain an optional IGCSE assessment probe that queried section count before Resume had remounted inputs, filled none, and correctly received incomplete-answer feedback. `expanded-readiness-browser-results.json` and its screenshot retain the clarified fixture's explicit `0 !== 7` readiness assertion. A01 instructed A17 to freeze, stop retrying that optional tail, and leave final-build recovery/assessment to independent A21. `browser-results.json` stays **FAIL** for that optional fixture; it is not relabelled. `startup-checks.json` is explicitly scoped to the passing named checks. No complete expanded browser PASS is claimed.

`checks.json` records passing typecheck, pinned Prettier 3.6.2 check of the owned host only, and protected-original guard (1317 files unchanged; 523 metadata-only placeholders retained). No builds, root controls, logs, source chemistry or other owners' files were changed. A01 owns final build refresh.

## Reproduce

Run a project-local Vite server on 5207, then `node validation/s5/fixes/startup-error/browser.mjs`. The extra IGCSE assessment fixture needs a visible-input readiness wait before its count assertion; its failed version is retained deliberately under A01's freeze instruction. Run `node validation/s5/fixes/startup-error/source-check.mjs`, `npm.cmd run typecheck`, and the pinned Prettier check command in `checks.json` for source verification.

Requested model/effort: gpt-6.1-sol/high. Effective model/effort and usage were not exposed. Nothing was published.
