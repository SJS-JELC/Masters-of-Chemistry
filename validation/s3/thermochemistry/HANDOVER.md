# A12 / S3-THERMOCHEMISTRY handover

S3 implementation in the new project only. Effective model/effort/usage are not exposed; requested parent settings are Sol 6.1 High. No children, package/config/registry/shared source edits, original builds/stores or publication.

## Modules

`src/activities/igcse/calorimetry/index.ts` exports `calorimetryAdapter`; `src/activities/igcse/bond-enthalpy/index.ts` exports `bondEnthalpyAdapter`. A01 registered both in the real shared host.

Pure generator/data extraction lives in `src/chemistry/thermochemistry/`. It removes DOM/global installation, preserving original calculation algorithms/data, seeded canonical CAL/BE mixed-radix codecs, original equations, part routes, units, significant figures and worked answers. Calorimetry exports all 4512 finite configurations, all sixteen examples and four families. Bond retains all sixteen reactions, both families and exact exclusions. Original IDs plus canonical seed restore exact questions. No full question snapshots.

Framework metadata retains original equation/fraction rows, numeric blank positions and exact displayed-precision tolerances; the last numeric token binds to the assessed response. A01 owns the new shared React control. Intermediate drafts are transient, final responses/requested assistance persist, Check working has no independent marks. Existing shared post-numeric drawing review performs Level 3 bond aggregation while numeric first response and time stay fixed. Both source idle allowances are 180000ms.

Existing RDKit2026.03.5 displayed SVG data is preserved. Embedding substitutes a fixed black colour for original currentColor, and adds an explicit XML namespace only to the inline thermometer SVG. No original/teacher export or checked geometry is regenerated.

## Validation

Run from this project:

```powershell
node validation/s3/thermochemistry/extract.mjs
node validation/s3/thermochemistry/coverage.test.mjs
npm.cmd run typecheck
node validation/s3/thermochemistry/serve.mjs
node validation/s3/thermochemistry/browser.mjs
node validation/s3/thermochemistry/render-contact.mjs
node validation/s3/thermochemistry/co-browser.mjs
node validation/s3/thermochemistry/fingerprint.mjs
```

`extract.mjs` is explicit regeneration, not a routine validation command: it replaces only the extracted generator/data intermediates. Do not run it over an independently reviewed correction without reconciling the correction's separate provenance first. The stable HMR-disabled port5187 server was left running for A06's native timing review. A01 owns its eventual shutdown.

`coverage-results.json`: PASS all4512 ×4 seeds =18048 canonical source/calculation outputs;10416 independent reacting amounts;39000 working frameworks;5248 bond outputs; balanced atom counts/energy totals/unknown rearrangement; exact exclusions; selection/link/restore routes.

`browser-results.json`: PASS six production practice targets, incomplete/wrong/correction/reload and first-evidence immutability, framework binding/checking/transient restore/assistance, L3 self-drawing aggregation, actual topic ADD ALL/revision traversal/pause/reload/Next, all sixteen source diagrams and thermometer teacher rendering, mobile/desktop checks. Actual IndexedDB first timing transfer is checked; final statistics chart remains S4.

`CHEMISTRY-REVIEW.md` and `RENDER-REVIEW.md` retain manual reasoning, consulted curriculum/provenance, inspected screenshots and limitations. `source-fingerprints.json` retains original read-only inputs; `output-fingerprints.json` retains current modules. Previous browser/type/harness failures remain retained with fixes explained.

## Acceptance dependencies and handoff

1. **Inherited CO charge depiction resolved:** original `source-co-diagram.svg` and `diagram-methanol-synthesis.png` show the issue. A07 `S3-REVIEW-CO` independently approved the missing carbon-minus vector in new `reviewed-co-svg.ts`; A12 integrated only methanol model rendering. Original data/calculation outputs are unchanged. The source gate binds original SVG8290640d… and reviewed SVG02de76dd… plus exact runtime/source file hashes to independent `validation/s3/review-co/provenance.json`; deleting exactly the approved insertion must recover every inherited SVG byte. `co-browser-results.json` passes actual host desktop/mobile renders at both supported levels and both Level2 families. Full managed canonical RDKit regeneration was unavailable; this is a separately reviewed vector correction, not invented regeneration evidence.
2. **Native timing:** ordinary Playwright headless freeze did not establish genuine frozen accrual; raw headless/noDefaults startup failed. Both failures are retained. A01 assigned A06 independent native same-document review. A12 claims ordinary first-submit/self-review timing immutability and transfer, not native idle/suspension PASS.
3. **S4 teacher UX:** every finite route is exposed/reproducible/renderable through CAL review URLs; the common teacher selector currently chooses practice routes. The original detailed teacher route picker is A01's explicitly accepted S4 integration item. No data/routes truncated. Disabled teacher-editor polish and final chart are later shared gates.

Worker completion is not stage acceptance. A01 must attach the resolved CO evidence and final native disposition, run protected-original/build/integration gates and seek root S3 acceptance.
