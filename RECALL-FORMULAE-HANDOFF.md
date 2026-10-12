# Shared recall and Formulae & Equations

Run: RECALL-FORMULAE-20261010. Combined React app only. Final root acceptance pending user disposition on unestablished native hidden-tab state. Nothing published.

## Result

- One typed recall player for both courses: six A Level and144 IGCSE facts, preserving current starter IDs. Global and gem-linked whole sets share one fact history per course/profile. Recall evidence is separate from graded mastery and never locks activities.
- Same due-based1/3/7/14/30-day schedule for both courses. Early practice retains the existing due date; same-day success cannot advance twice. Incorrect, assisted and revealed responses are immediately due.
- Formulae & Equations is displayed after Bonding and before Chemical Tests. Existing stable IDs remain intact; new gems are fourth-16-1/2 (atlas16.1/16.2).
- Formulae uses19 vetted ions and36 reviewed allowed pairs with reproducible RF1:{pairId}:{uint32Seed} IDs, charge-neutral lowest ratios and strict chemical notation. Levels1/2 only. Eight review pins use seed123.
- Equations has24 original authored questions: four per each of six families, levels1/2/3, checked model answers and conserved atoms. Stable EQ-{family}-01..04 IDs use seed0.
- The local atlas remap conserves all2322 records and4320 primary marks:76 primary changes,15 secondary additions, seven explicit unresolved mappings retaining their original maps. Empirical bands are preserved; teaching bands are separate.

## Review

Local production preview: http://127.0.0.1:5182/?course=igcse.32-example review: http://127.0.0.1:5182/recall-formulae-review/index.html. Remapped atlas: http://127.0.0.1:5182/recall-formulae-atlas/index.html. Final aggregate: validation/recall-formulae/s2/S2-final-aggregate.md.

-32-example index: public/recall-formulae-review/index.html; editable review references: resources/recall-formulae/content/review-index.json.
- Local remapped atlas: public/recall-formulae-atlas/index.html with derived JSON/CSV exports; resources/recall-formulae/atlas/full-overlay.json preserves the separate overlay.
- Typed fact provenance: src/recall/typed-provenance.json; historical starter provenance remains unchanged.

## Regeneration

Run from this app directory:

```powershell
node --experimental-strip-types resources/recall-formulae/content/generate-review.mjs
node scripts/test-recall-formulae-content.mjs
node scripts/test-recall-formulae-recall.mjs
node scripts/recall-formulae-atlas-full-verify.mjs
npm.cmd run typecheck
npm.cmd run build
npm.cmd run release:app
npm.cmd run check:release
node scripts/check-recall-formulae-originals.mjs s2
node scripts/preview.mjs --port 5182
```

## Evidence and limits

- Root scope/acceptance: validation/recall-formulae/s0/root-acceptance.json, s1/root-acceptance.json, s1/recall/root-exception-disposition.json, s2/atlas/root-final-acceptance.json.
- All new models/pairs received explicit chemistry review; the32 examples have teacher links. Accepted recall source coverage is116 source facts with Q087 withheld, plus29 nonduplicate gap facts and preserved current starters. Source receipt and bounded wording errata are retained; amended wording is not described as teacher-approved.
- Q087 (general hydroxide solubility) is quarantined without replacement because its scope/wording mismatch needed an explicit exception. Original source/history remains.
- Seven atlas mappings lack sufficient extracted evidence. No source PDFs, mark schemes or images were reopened. Historical formal-compound caveats do not enter the generator bank.
- Protected-original guard retains529 pre-existing failures separately; the run baseline1320 paths has zero new modifications. Some S0 paths were initially metadata-only due to Node access; subsequently readable hashes do not establish historic byte equality.
- No Rocket runtime or progress was imported. No historical dates or durations were invented; no existing recall history was present to migrate. No deployment.

## Final checks

Type/build/release PASS:16 activities,213 runtime files,204275 initial gzip bytes within204800 limit. Registration/timing6/6 and final content12/12 PASS. Built review-index click and practice smoke2/2 PASS. Native focus-loss and actual6.5s suspension binding PASS; actual60s Formulae shared binding PASS. True hidden-browser state remains unestablished despite bounded native same-window tab switch and unavailable CUA; retained ESCALATE evidence is validation/recall-formulae/s2/recall/native-tab-observation.json. No claim of hidden-tab acceptance or Recall-specific60s plateau. Root user disposition is pending before terminal acceptance.
