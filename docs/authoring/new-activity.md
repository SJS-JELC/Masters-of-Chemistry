# New activity and gem onboarding

The runnable CLI starter is DEV-only and uses the existing acid activity/gem. It does **not** add a new curriculum activity or automatically promote content. Start it with:

```powershell
node development/authoring/scaffold.mjs dev-my-family
node --test development/authoring/families/dev-my-family/family.test.mjs
node node_modules/typescript/bin/tsc --project development/authoring/families/dev-my-family/tsconfig.json
node development/authoring/serve.mjs --refinement
# Open http://127.0.0.1:5181/development/authoring/families/dev-my-family/preview.html
# In another shell:
node development/authoring/families/dev-my-family/browser.mjs
```

The generated plan has actual stable IDs, all three canonical levels, source hashes, measurable objectives and reviewed teacher answers. Its typed data/provider/marking/registry and local catalogue mount are usable immediately. The fixed, generated and inverse-application fixtures include incorrect/incomplete answers and exact ID/seed restoration. Changing teaching content requires refreshed provenance, chemistry review and appropriate tests; the reviewed default template is not a blanket approval for edits.

## Metadata authority

For an authorised genuinely new activity, use A01's canonical authored-metadata pathway. Preserve immutable migrated inventory and existing IDs. The metadata input is `src/catalogue/authored-metadata.json`:

```typescript
{
  activities: readonly ActivityDefinition[],
  gems: readonly { activityId: CurriculumActivityId; gem: GemRegistration }[]
}
```

`ActivityDefinition` is defined in `src/catalogue/registry.ts`. A curriculum entry has `id`, `course`, `strand: "curriculum"`, `title`, `source` and `gems`. Each source reference has `path`, the actual `sha256`, and `symbolOrSection`. Each `GemRegistration` has `id`, `topicId`, `label`, `supportedLevels` and `mastery`. Mastery contains `gemId`, `supportedLevels` rows (`level`, positive `halfLife`, `label`), `threshold`, `comparison: "strictly-greater"`, `historicalAliases`, `legacySourceKeys`, and optional `activeProgressionVersion`. Gem/mastery IDs and supported levels must agree. Keep genuinely supported levels only and never derive stable identity from display order.

This **illustrative metadata shape is not approved content**; replace source placeholders with checked actual fingerprints and explicitly agree curriculum, IDs and mastery settings before enabling it:

```json
{
  "activities": [
    {
      "id": "alevel/strong-acid-dilution",
      "course": "alevel",
      "strand": "curriculum",
      "title": "Strong-acid dilution",
      "source": [{
        "path": "resources/authoring/strong-acid-dilution/checked-data.json",
        "sha256": "<actual 64 hexadecimal SHA-256 characters>",
        "symbolOrSection": "Checked strong monobasic acid dilution data and answers"
      }],
      "gems": [{
        "id": "u6-authored-strong-acid-dilution",
        "topicId": "u6-t1-1",
        "label": "Strong-acid dilution",
        "supportedLevels": [1, 2, 3],
        "mastery": {
          "gemId": "u6-authored-strong-acid-dilution",
          "supportedLevels": [
            {"level": 1, "halfLife": 2, "label": "Structured"},
            {"level": 2, "halfLife": 2, "label": "Unstructured"},
            {"level": 3, "halfLife": 2, "label": "Applications"}
          ],
          "threshold": 0.8,
          "comparison": "strictly-greater",
          "historicalAliases": [],
          "legacySourceKeys": []
        }
      }]
    }
  ],
  "gems": []
}
```

To add a gem to an **existing** activity, put the same complete `GemRegistration` under `gems` as `{ "activityId": "alevel/acid-base-calculations", "gem": { ... } }`; leave `activities` empty. The existing provider must genuinely implement selection/restoration/marking for the new gem and all its supported levels. A new gem must not merely expose old questions under a new title.

## Exact integration points

1. **Identity:** for a new activity, add its approved literal to the appropriate `ALevelActivityId` or `IGCSEActivityId` union in `src/contracts/identity.ts`. The existing aliases/unions propagate to typed refs/targets. A new gem does not require a new activity literal. Assign stable versioned question IDs and seeds in the provider, with exact restore/link validation.
2. **Canonical metadata:** add the approved `ActivityDefinition` or attached gem in `src/catalogue/authored-metadata.json`. Run `node scripts/write-catalogue-definitions.mjs`, then `node scripts/write-catalogue-definitions.mjs --check`. The generated `definitions.ts` uses `satisfies readonly ActivityDefinition[]`, so normal typechecking checks its shape. Current activity/leaf validation boundaries and revision/mastery scope derive directly from this catalogue; do **not** maintain another boundary/scope list, alter storage/scheduling algorithms or edit the migrated S0 inventory. `write-s0-scope.mjs` verifies accepted source evidence; it is not an onboarding generation step.
3. **Content and marking:** create the activity's own data/provider/marking modules under the corresponding `src/activities/<course>/<slug>/`. Expose complete fixed IDs and generator families; `select` accepts the registered gem/level/seed, `restore` reproduces content using IDs/seeds, and `resolveLink` rejects malformed identities. `MarkingPolicy` is React/DOM/storage/timer-free and rejects incomplete input before assessment. Include checked answers, scaffolds, requested assistance and exact provenance.
4. **Registration:** export a `CurriculumAdapter` from the activity's `index.ts`: approved `id`, lazy `provider`/`marking`, documented `idleAllowance`/`idleRationale`, and optional `learningReview`. Add that adapter once to `src/foundation/registry.ts`'s `createRegistry` aggregation. Metadata alone never enables an activity. Reuse the direct shared `ActivityHost`, player, controller, repository, timer and revision scheduler. For an added gem, update the existing activity provider/adapter rather than duplicate its registration.
5. **Optional editor:** standard numeric/choice/text/explanation/correction/diagram-selection parts already use the shared player. Existing editor kinds use their typed initial state and chemistry policy with the current shared renderer. A genuinely new specialist editor needs a separately reviewed typed response/state contract in `src/contracts/editors.ts`, a surface under `src/editors/`, pure chemistry validation/marking, and one authorised lazy renderer dispatch in `ActivityHost`. Verify keyboard/touch/non-drag use and save/restore serialization. This is a distinct interface change, not something the CLI invents or silently performs.
6. **Acceptance/release metadata:** ask the responsible owner to update approved scope/release activity inventories and runtime asset closure if a new activity is authorised. Run registration/timing/source/provenance/coverage gates plus activity tests, real practice/revision/teacher browser verification, stats transfer, responsive rendered inspection and release budget/DEV-exclusion checks. Source edits/local acceptance do not authorise deployment.

| Content or metadata change | Shared algorithm that stays shared |
| --- | --- |
| Stable activity/gem IDs and canonical catalogue rows | Repository namespace, transactions and deduplication |
| Provider IDs, seeded inputs, questions/scaffolds | Attempt creation, immutable first assessment/correction |
| Pure chemistry-specific marking and response acceptance | Shared active clock and pause/idle/background behavior |
| Genuine supported levels and reviewed mastery parameters | Weighted mastery recurrence and scheduler progression |
| Lazy adapter registration and question idle allowance | Revision selection/Next/checkpoint machinery |

The onboarding rule is one canonical content catalogue feeding boundaries, not repeated edits to storage or scheduling lists. New standard question families need only content/marking/registration. Canonical identity/schema additions for a genuinely new activity are metadata/interface work; they do not justify rewriting the algorithms.

`src/persistence/catalogue-boundary.ts` derives current activity IDs, gem levels and aliases from canonical definitions; retired source-only leaves remain separately in `src/catalogue/historical-leaves.ts`. The original-store import parser `src/persistence/legacy.ts` intentionally keeps historical leaf allowlists, aliases and source progression versions. Those describe old records, not current registration. A genuinely new activity has no old-store records and must not be added to that legacy parser merely to onboard it. Preserve its historical compatibility semantics.
