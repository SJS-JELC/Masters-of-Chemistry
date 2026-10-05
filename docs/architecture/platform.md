# Platform architecture

Both course entry pages load the same React platform. The canonical catalogue
selects the six enabled activities for each course. Each course produces its own
static build; deferred chunks currently share the full registry dependency graph.

## Question lifecycle

1. A typed provider selects or restores a question from its immutable ID and seed.
2. The host creates one attempt controller and active clock. The shared player
   renders standard fields or a registered specialist editor.
3. The controller checks completeness before assessment. The activity's pure
   marking policy checks chemistry; corrupt serialization and chemically wrong
   answers have different outcomes.
4. The first assessment freezes responses, score, assistance and active time.
   The repository saves this state, independent evidence and revision scheduler
   changes in one IndexedDB transaction.
5. Correction checks produce temporary learning feedback. They do not replace
   the first assessment, extend its time, create another evidence row or advance
   revision. Self-rubric work retains its locked text and evidence selections.
6. Pause/reload restores the same attempt and ID/seed. Next creates a new attempt;
   the revision scheduler controls its target. Teacher review creates no evidence.

Next remains available while leaving a field saves a correction draft. Its click
waits for that save to finish, checks its actual outcome and prevents a second
concurrent transition. Failed saves block progression until Retry succeeds.
Corrections remain attached to the old attempt and cannot alter its first result.

## Module boundaries

| Folder | Owns |
| --- | --- |
| `src/contracts` | Typed question, response, editor, attempt, session, repository and Olympiad interfaces |
| `src/catalogue` | Canonical activity/gem metadata, genuine levels and generated validation boundaries |
| `src/activities`, `src/chemistry` | Complete banks, deterministic generators, source provenance and pure marking |
| `src/domain` | First-assessment rules, active clock, legacy-equivalent mastery and revision scheduling |
| `src/persistence` | Validated transactional saves, deduplication, archives and course/profile isolation |
| `src/foundation` | Runtime composition and direct practice/revision/Olympiad mounting |
| `src/ui`, `src/shell`, `src/editors` | Shared presentation, focused navigation, accessible specialist interactions |
| `src/compatibility` | Old supported code/link decoding and user-supplied read-only legacy import |

The app does not import original app pages or wrap them in iframes. Original
sources are retained read-only as provenance and independent reference fixtures.
Production runtime has no dependency on their folders.

## Storage and failure handling

New course/profile databases use the `masters-of-chemistry-` name prefix. Immutable
evidence and import receipts detect duplicates and conflicting repeats. Failed
transactions retain in-memory work and offer Retry; failed startup reads block
practice/revision until the stored session and history can be validated. Retry
releases the obsolete connection and reads the same database again. It does not
clear records or select a new identity.

Session-only completion and resume use the same write queue and checked results.
The host changes their visible session state after a successful commit. Retry
repeats the failed session operation before any remaining failed answer save.
Saving a learning correction cannot clear a failed session transition or attach
the old attempt to a completed session; these failures remain distinct.

Legacy imports preview recognized records, skips and conflicts before saving in
the new database. Exact raw source is archived separately. Old browser-store keys
are never written. Untimed historical evidence stays untimed.

C3L6 stores drawings and challenge completion separately from curriculum attempts,
timing, mastery, revision and statistics. Historical source outcomes and current
chemical revalidation remain distinguishable when a documented marking erratum
changes an accepted graph.

## Adding content

Standard families supply data, provider and marking modules plus DEV registration.
They reuse the existing player, storage, timing and scheduler. New activity/gem
metadata belongs in the canonical catalogue; specialist editors are optional.
See [the authoring guide](../authoring/new-activity.md) for exact files and commands.

Generated source data, source hashes and provenance are kept separate from
readable authored TypeScript. A pinned local formatter preserves extracted source
bytes. See [formatting](formatting.md) and the [project README](../../README.md).
