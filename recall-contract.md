# Recall hub addition — 4 October 2026

Authority: the user approved the standalone self-marked flashcard table, then
requested a brain-icon **Recall** tile beside Revision/Stats/Olympiad for both
GCSE and A Level. This authorises promoting that component into a shared hub
view. It does not authorise publication or the former Rocket game.

## Scope and defaults

- Add `recall` to the typed platform views and both course landing hubs. Preserve
  A-level-only Olympiad visibility, course identity, browser history, Home and
  direct-link behaviour. Lazy-load Recall; keep all developer fixtures excluded.
- Retain the approved standalone behaviour: self-marking, undo, new passes,
  reveal-once sorting and in-memory state. A visit starts fresh. No additional
  curriculum gem, assessed activity, independent score, timing evidence, revision
  registration or storage schema is created by this view. The existing active-gem
  revision/timing gates remain unchanged. Assessed integration is a separate task.
- Use six checked starter facts per course. Existing full banks are not imported.
  Preserve source question IDs except the explicitly qualified solid-state ionic
  question. Retain source excerpts, hashes and the two A-level prompt adaptations.
- The inherited prototype default is standalone practice; the optional questions
  about tracking and full-bank import were unanswered when these defaults were
  recorded. Do not represent them as new explicit answers from the user.

## Implementation and acceptance

Local execution, no delegates: navigation and the shared component are a small
connected change. Root owns content/code/rendered review and final acceptance.
Keep the thirteen existing assessed/challenge registrations and all their gates.
The new release inventory records Recall separately as a non-assessed hub view.

Require course-separated launches, Home/back/forward/direct reload, mobile hub
tiles, reveal/sort/undo/retry, source regeneration, no new assessment/timing
records, lazy release inclusion, developer-fixture exclusion, type/build checks
and protected-original fingerprints. Save evidence in `validation/recall-hub/`.
