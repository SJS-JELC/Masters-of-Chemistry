# A06 — exact Host terminal/correction patch

**PASS: approve exact Host SHA256 `bd69aee5a89e1bcdf61ed8f22b134654b18096910b92de7e37040c7a07391d9e` for rebuilding.** This is code approval, not completed browser acceptance. Original c1 concurrent failures remain preserved in the parent review folder.

## Three required states

- **Correction overlapping successful terminal commit:** the session-only queued write commits the terminal session. The later correction resolves `sessionRef.current` when its own queued write executes; terminal `current:null` does not reference the old attempt, so only the attempt/evidence is written. No old session is revived.
- **Correction after completion:** the same compatible-reference check omits the terminal session. Standard correction remains available and its first evidence remains unchanged by existing controller/repository rules.
- **Terminal failure followed by correction:** the pending terminal transition blocks session attachment. A successful correction clears only its curriculum failure slot; the exact terminal write/callback/error remains in the separate session slot. Overall status/saveFailed still shows failure and exact Retry. A successful session retry commits the terminal state only after its checked result. Any curriculum failure remains visible for its own retry.

The session-family success condition clears a remembered session failure only when it is that exact write closure. The curriculum family permits a later successful save for the same attempt owner to supersede a failed older draft. Session-first Retry retains write/callback/kind/owner. Resume is disabled while saving/error, directing the user to Retry rather than creating another session job. The repository validator and result types remain unchanged.

## Removed session arguments and controls

Every save call retains its original attempt argument. Three removed explicit session arguments belong to adopt, command handling and Resume; each applies its intended session before saving. Other checkpoint, retry and timing saves already use the authoritative session ref. The new association is chosen during queued execution, addressing stale captured pre-terminal session state. Curriculum save callbacks only reload history; they do not commit terminal transitions. Session-only callbacks commit after a checked successful result.

The full c1 freeze comparison finds only `src/foundation/ActivityHost.tsx` changed. Source validator, repository and repository contracts match the retained failed-source hashes. Actual source parsing, save-call AST checks and the exact before/after diff are retained in `verification.json` and `ActivityHost.diff`. No source was edited by A06.

Run `node apps/Masters-of-Chemistry/validation/s5/review-session-only-save/fix-review/verify-code.mjs`. After rebuilding, A21 must verify actual successful held-transaction overlap, correction after complete, terminal failure followed by successful correction, and both families failing with ordered retries, plus session-only12/Next16 regressions. This review introduces no browser, fake clock, child, broad chemistry review or acceptance claim based solely on source. Requested GPT-6.1 Sol High; effective settings and usage unknown.
