# Smooth loading — authorised 12 October 2026

Authority: user approved the conversation plan and instructed implementation. Root owns this contract. Current combined app only; no deployment, commits, historical-app writes or saved-data migrations.

## Required behaviour

- All loading transitions in both courses: main navigation, gem menus, Next, teacher previews, Recall, statistics, import, Olympiad and question tools.
- Retain outgoing content/layout/scroll, inactive including keyboard shortcuts, until destination data and required interactive tools are ready. Commit once; no intermediate setup/loading paragraphs or page fades.
- One fixed 3px teal indeterminate top bar after 200ms; no forced minimum duration, fake percentages or duplicate announcements. Static reduced-motion indicator. Initial HTML supplies dark branded background/eagle before React, with seamless coordinator handover.
- Shared request IDs, scopes (screen/question/tool), abort signals/current-request checks, guarded commit, cancellation/resource disposal. Do not hidden-mount another active host. Ignore stale completion; screen requests invalidate subordinate pending work.
- Commit content/header/course/navigation/props/click-created URL together. Latest Back/Forward intent wins without new history entries on successful popstate. Failed checkpoint retains old screen and restores committed route.
- Detach outgoing document timing binding and gate commands synchronously at transition start; flush drafts/queued writes via existing guards. Activate new timing only after durable persistence and visible tool readiness. Serialize writes; cancellation cannot undo a started transaction. Retry retains ID/seed; cancellation resumes original attempt through the durable gate. Preserve immutable first evidence and strand boundaries.
- Visible errors stop loading; accessible Retry/Cancel remain outside inert content. Resettable render/chunk error boundary. Destination focus after commit; prior focus restored on cancellation; tool focus restored appropriately. Ordinary background persistence keeps existing save-status treatment.
- Root implementation clarification: ordinary reads/writes and retryable preparation use Retry. Browser-cached module/CSS failures may require clearly labelled Reload app plus Cancel, after the durable save/resume guard, retaining the committed route and saved attempt. Preserve pending destination only through an already validated identity mechanism; otherwise reload the committed screen. Do not cache-bust arbitrary module/dependency URLs or claim in-place Retry recovers a browser-cached rejection.
- Keep 204800-byte initial JS gzip budget and existing accounting. Cache loaders and keep required-tool preparation lazy. Defer menu Recall availability and extract Recall-specific repository validation behind async Recall operations, loading validation before transactions; retain validation primitives/checks and avoid eager back-imports.

## Delivery stages

1. One gpt-6.1-sol/high foreman defines shared interfaces and leads pilot Home -> rate equations -> Next -> Home, including slow loading and failed saves. Root accepts source and meaningful browser/timing evidence before wider implementation.
2. Sol6.1/high children with explicit non-overlapping ownership adapt curriculum/teacher tools, Recall/persistence, and statistics/Olympiad/import. Foreman owns shared navigation/bootstrap/integration. Maximum six authors/two genuine-exception reviewers; no worker delegation.
3. Integrated verification, fixes and root final acceptance. Foreman owns .codex/swarm-status.md with native lifecycle events and five-minute log summaries. Preserve previous log and existing unrelated edits. Durable scripts/tests and concise handoff; generated evidence under project .artifacts/smooth-loading/.

## Acceptance

- Deterministic deferred module/read/write tests: fast/no bar, slow/one bar, stale completion/rejection, supersession, failure/retry/cancel, serialized commits and no precommit evidence.
- Actual pinned browser tests both courses: cold/warm screens, gem menu, all relevant question/tool families, Next, teacher, Recall/autostart/flashcards, Stats, Olympiad, import/deep links; retained/inert outgoing screen and paused clock under delays; new clock only once usable.
- Repeated clicks/Back/Forward/course switches, save denied/retry/cancel, drafts/drawings, same-attempt reload/resume, teacher zero evidence, independent first marks/time/reveal/retry immutability and Stats transfer.
- Desktop/mobile rendered inspection, bootstrap handover, focus/keyboard, reduced motion and genuine hidden/background timing checks.
- Protected-app check and current-run no-drift fingerprints per stage, typecheck, build, release inventory/budget, relevant registration/attempt/session/persistence/Recall/timing suites. Distinguish existing failures; never weaken tests or reset historical baselines to pass.

## Known starting evidence

Previous rate direct-launch change is accepted: semantic mastery IDs, setup suppression, 16 browser combinations, typecheck/build/release passed. Initial JS gzip204755. Historical protected guard reports529/1320 existing changes. Full mastery-flow tests retain unrelated Recall-count and ordering fixture failures; capture starting results before changing related areas. No timing exceptions authorised.
