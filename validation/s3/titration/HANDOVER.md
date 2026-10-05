# S3-TITRATION / A14 handover

## Outcome

Complete36-source titration bank (TC01–TC36,18 Level2 +18 Level3) implemented as a React curve workspace with source equilibrium/species/indicator semantics and shared player evidence ownership. Curriculum OCR A5.1.3(n–o), with source-labelled diprotic model extensions preserved. Export `titrationAdapter` from src/activities/alevel/ph-titration-curves/index.ts and `TitrationCurveEditor` from src/editors/titration-curve/index.ts. A01 has integrated both in the real production registry/host.

Only assigned activity/editor/chemistry and validation directories were written. No children. S3 only; publication and S4 not authorised. Source runtime model/effort/usage unknown unless externally exposed; requested worker profile was gpt-6.1-sol/high.

## Implementation

- Typed complete source bank and historical source IDs + FNV-1a TC review codes, original fixed sequential pool at each level; unsigned32-bit seed retained in refs. Wrong level/unknown ID/invalid seed rejected. No content snapshots.
- React-free numerical core extracted from original checked solver as ordinary ESM functions, removing only global/CommonJS wrapper. Independent buffer, equivalent-volume and charge-balance tests retained.
- Editor independently selects all eight real species/direction sections; source calculated join pH; meaningful pH/volume sliders; keyboard arrows and numeric non-drag controls; source indicator ranges/colours; local drag preview committed on release, bounded session Undo. Same saved semantic response restores; source does not persist undo history.
- Six separately marked criteria, valid indicator alternatives, source mastery1/0.5/0; missing selections block first scoring, valid chemically wrong constructions assess normally. Nonfinite/out-of-range/off-step/unknown graph values block malformed submission.
- Shared controller/clock/repository/scheduler exclusively owns timing, evidence, first response, pause, restore and Next; correction operates as learning. Original600000ms allowance for both levels. Actual U6 revision ADD ALL includes15 acid routes plus exactly2 titration levels.
- Checked equilibrium model SVG available in worked answer with labelled axes and anchors. Desktop plots and mobile controls/graphs inspected. The teacher blank disabled editor follows the explicitly deferred S4 policy; full checked curve/model answer is available.

## Reproduce

From apps/Masters-of-Chemistry:

```
node validation/s3/titration/extract.mjs
node validation/s3/titration/make-bank.mjs
node validation/s3/titration/port-reference-test.mjs
node --test validation/s3/titration/activity.test.mjs validation/s3/titration/source-chemistry.test.mjs
npm.cmd run typecheck
npm.cmd run check:originals
```

Browser tests require A01-owned actual Vite host on127.0.0.1:5181 and use installed Edge plus read-only pinned workspace Playwright:

```
node validation/s3/titration/browser.mjs
node validation/s3/titration/final-browser.mjs
python validation/s3/titration/contact-sheets.py
```

Python/Pillow contact sheets are QA-only and do not alter resource assets. All browser namespaces are isolated new-project `a14-*` run IDs. Regeneration does not build/write original applications.

## Evidence and limitations

Seven tests, global typecheck, protected1317-file originals check and actual production browser runs pass. See tests.log, typecheck.log, protected-originals.log, reference-review.json, source-fingerprints.json, browser-results.json, final-browser-results.json, chemistry-review.md, render-review.md and saved PNGs. Initial fixture/host failures are retained and resolved as described in render-review.md.

Accelerated production-browser idle/trusted-resume/suspension tests passed at600000ms. Genuine native foreground hidden/background/focus and aggregate stats transfer are stage-integration checks owned by A01; this worker has not claimed those as independently run. Shared timing algorithm, first-time freeze and actual persisted attempt time were exercised here. Blank disabled teacher editor polish is deferred toS4 by accepted dispatch.

Worker completion is not S3 acceptance. A01 performs shared integration/native checks and root owns stage acceptance. Preserve original application and source fingerprints; no release/deployment performed.
