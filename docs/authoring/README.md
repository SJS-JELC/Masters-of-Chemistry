# Author a question family

> Evidence retirement (5 October 2026): historical validation reports, screenshots and acceptance records were deleted by user request after executable dependencies were migrated. Remaining `validation/` path names and past test counts describe historical records, not present files or fresh acceptance. See [validation cleanup](../maintenance/validation-cleanup.md).

This scaffold and catalogue are development tools. New chemistry requires curriculum and chemical acceptance before any student release. No publication is authorised here.

## Working example

`development/authoring/data.ts` contains independently authored hydrochloric-acid dilution inputs. It is not extracted from an old activity and uses only canonical `AB-XXXXXX` question IDs in a separate DEV codec context. `family.ts` supplies pure content, deterministic selection/restoration and marking. `registry.ts` is the only proof registration; `src/development/catalogue/index.tsx` exports `DevelopmentCatalogue` and mounts the actual `FoundationApp` with that registry. A01's main entry imports it only behind `import.meta.env.DEV` and `?harness=authoring`.

The proof reuses the existing acid activity ID and strong-acid gem ID so the actual canonical repository/session boundary can validate it. It preserves all three supported source gem levels. It does not replace or modify the production activity provider.

| Level | Identity and demand | Checked answer |
| --- | --- | --- |
| 1 | `AB-00001C`, seed0; fixed25cm³ of0.020mol dm⁻³ HCl diluted to250cm³; built-in calculation scaffold | pH2.70; concentration decreases so pH increases |
| 2 | `AB-000034` at seed0; bounded seeded code; unscaffolded dilution calculation | Final concentration from conservation of moles, then pH to2dp |
| 3 | `AB-00004W` at seed0; bounded seeded code; inverse dilution application | Infer target concentration from supplied pH, then final total volume to3sf |

Each generated level has36 finite configurations (4 concentrations×3 initial volumes×3 dilution factors). Seeds beyond35 cycle these configurations without changing their stable identities. Restore validates the bounded seed (0–11,337,407), level and exact canonical ID; malformed/mismatched references fail. Stored attempts contain IDs/seeds/responses, not question snapshots.

The mark policy validates both required responses before assessment; a finite wrong calculation is assessable. Two chemically meaningful marks award calculation and concentration reasoning. Rounding/tolerance conventions are explicit in content and policy; malformed numeric/unknown/multiple-choice responses are rejected. Requested hints/reveals use the shared assistance flow. The built-in level1 scaffold remains independent support. The documented idle allowance is180000ms for dilution, logarithm and prediction.

DEV slots38–47 belong to synthetic component controls. `development/authoring/family-slots.json` permanently assigns slots48–63 to independent authoring families; the scaffold takes the next unused slot and refuses exhaustion. Existing assignments never change. Production acid decode rejects these reserved slots. Selection maps unsigned32 entropy to the bounded seed domain, then the exact code reproduces slot, level and seed. DEV registry overrides use fresh alpha databases scoped by permanent family route token and run; synthetic controls use a separate dev-controls namespace. Production names stay unchanged.

## Start and regenerate

Run from `apps/Masters-of-Chemistry`:

```powershell
node development/authoring/scaffold.mjs dev-example
node development/authoring/regenerate.mjs
node scripts/test-component-identity.mjs
node development/authoring/serve.mjs
# Use the browser fixture generated with the new family for fresh host verification.
```

The isolated catalogue is at `http://127.0.0.1:5181/development/authoring/index.html`. `scaffold.mjs` now creates a complete runnable typed DEV starter under `development/authoring/families/`: data, provider/marking, registry, catalogue/mount, preview, provenance, plan, README, typecheck config, unit fixtures and actual-host browser fixtures. It refuses overwrite/invalid slugs. The default is the reviewed HCl dilution template with a permanent reserved DEV slot and isolated fresh alpha database; it is usable immediately, but changing its content requires fresh authority, answer and chemical review. Run the generated commands printed by the CLI and use `serve.mjs --refinement` to keep new validation cache separate. See [new-activity.md](new-activity.md) for the canonical new activity/gem pathway. The component examples exercise actual `Content`/`ResponseControl` numeric, choice, formula and table components without saving evidence. The host exercises the actual shared player and all infrastructure.

## Add another family

1. Define an independently owned data module, stable canonical IDs, source references and checked teacher answers. Specify genuinely supported demand/scaffolds.
2. Implement `QuestionProvider.coverage/select/restore/resolveLink` and pure `MarkingPolicy`. Keep shared context and marked parts together.
3. Add only the family and its registration in an owned DEV registry under an existing activity/gem. Preserve the canonical gem levels; new curriculum IDs require a separate authorised catalogue change. Do not modify attempt, clock, repository or revision modules.
4. Validate all finite configurations or justified generator invariants, malformed references, correct/partial/wrong/incomplete answers and deterministic restore. Perform substantive chemistry review and rendered inspection.
5. Through actual `ActivityHost`, verify response/pause/reload, ID+seed restore, first marks/time, corrected retries, no evidence from teacher/hints/reveal, revision ADD ALL/launch/Next and fresh timing.
6. Check course release manifests/bundles contain no DEV IDs/catalogue/fixtures. Production registration/publication is a separate decision.

The first authoring proof incorrectly narrowed the source gem to levels1/2; the actual scheduler rejected revision. The retired `browser-level-scope-probe.json` recorded that failure. The correction added genuine level3 content and restored all source levels without plumbing changes. Original weighted mastery requires several correct attempts before advancing levels; the browser proof follows that scheduler rather than imposing a new progression.

## Combined app release

After building, regenerate and check the single manifest:

```powershell
npm.cmd run release:app
npm.cmd run check:release
npm.cmd run test:build
node scripts/browser/combined-build.mjs
```

`release/app.runtime.json` lists the complete runtime closure and all fourteen activities, with course metadata and provenance. One neutral entry serves both courses. The manifest includes licensed brand assets, flat historical activity aliases and course-qualified aliases; queries, question codes and hashes survive relative redirects under nested hosting prefixes. The unqualified dot-and-cross alias defaults to A Level; an explicit IGCSE query selects its IGCSE activity. DEV content, missing/stale/unexpected files, source/test/maps/dependencies, Rocket functionality, and missing provenance still fail strict validation. `.vite/manifest.json` remains build evidence outside the runtime manifest.

The 204800-byte gzip gate measures the entry, actual ProductionFoundation, original landing, and all eager imports. Banks, providers, editors and data views remain lazy. The combined browser verifier checks fresh default, course persistence, direct activity launches, compatibility redirects, refresh, root/nested prefixes and all inventoried files. Historical per-course build validators and stage servers remain explicitly historical; use current preview and release commands for this build. See [the combined-build handover](../maintenance/combined-build.md).

Initial S3-dist fingerprints were recorded in the now-retired `validation/s4/authoring-release/initial-*.runtime.json`. Their initial69k measurement described entry imports only, with level9 compression; it is not the complete shell measurement. The corrected S3-dist measurement is142405bytes A Level and142403bytes IGCSE, independently matched by the actual browser. Final S4 builds must regenerate manifests and evidence; earlier fingerprints are not presented as the final build.
