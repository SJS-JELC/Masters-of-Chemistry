# S5-FIX-ENERGY-TYPING handover

A13 owns only `src/editors/energy-profile/index.tsx` and this evidence directory. Source is frozen. DEV port 5210 was closed and confirmed without a listener. No children, shared contracts, host, persistence, timing, marking, source records, release outputs or original activities were edited by A13.

## Change and policy

Every energy numeric non-drag control now uses a local string draft: left/right/peak energy y, free arrow endpoint y, and arrow x. Deletion and intermediate keystrokes leave semantic profile state unchanged. A finite complete number in y55-340 or x85-590 commits on blur or Enter. Decimal coordinates are accepted because pointer geometry already uses decimals. Invalid/empty/incomplete/out-of-range completion restores the previous semantic text, announces the kept value and sets aria-invalid. Escape cancels. External numeric value/readOnly updates synchronize the draft; field keys include the source marking identity for Next. Undo/reset explicitly clear draft state. Semantic commits use existing save/history/onResponse; pointer and graph key handling remain unchanged.

Policy coordinated with A14 titration: local draft, commit on blur/Enter, invalid restores previous state with an accessible message, Escape cancels. Energy does not add integer step constraints to pointer coordinates.

Before SHA256: d444f4193cda413fd925de632264bcef79dcb7e7d1e99ca0ec719f99b16d4bc8.
After SHA256: b58d2fd9285e96cb9902705034ec038387339dc3b53ace45e3d18526ce3ee407.
Exact before source and source.diff are retained.

## Verified scope

- Actual DEV production IGCSE host, isolated run database, D01 L2 source-seeded, root pinned Playwright1.62.1, headless Edge154.0.4258.48, unthrottled CPU/network.
- Four completed browser scenarios PASS, 70 recorded input events all trusted. Ctrl+A/Backspace produces empty text while profile remains220. Sequential2,20,200 leaves semantic220 until Enter200. Blur commits300; decimal155.5 commits. Invalid empty/400/Infinity/wrong/2e retains155.5; valid recovery and Escape work.
- Actual profile arrow endpoint and x drafting/commit/out-of-range preservation, undo/reset, external changed response, trusted graph keyboard/pointer edits; zero new editing evidence.
- Separate current teacher-policy check PASS: checked model image, no editable energy input, null attempt, zero evidence before/after zoom; no page errors.
- TypeScript PASS; pinned project Prettier3.6.2 source check PASS.
- Existing substantive source/chemistry regression 5/5 PASS: all54+14 original records, phrase/correction gates, unknown/wrong distinction, profile perturbations, first evidence/timing immutability, provenance/equation balancing.
- Manual rendered inspection of trusted-typing-fixed.png: diagram, coordinate text, instructions and kept-value error readable. Current teacher screenshot retained. Existing adjacent Remove button sits closely beside the x validation message; no shared layout edit was authorized.

## Explicit limitations and retained failures

browser-results.json is intentionally FAIL for its final combined tail; do not report the whole suite PASS. First score1, first response/history immutability through correction, and pause/reload restoration assertions ran before the teacher locator failure, but that scenario never completed a separate PASS record. Next/peak tail was not executed and remains for A23 independent final build acceptance.

Earlier attempts retained: initial import-path error; obsolete hidden Teacher preview locator; teacher URL view/activity/level adjustments; old disabled-editor assumption. Current teacher view renders a checked SVG rather than an editor. The final broad script failed because a PowerShell replacement corrupted the exact middle-dot text selector. A small current-policy teacher-check.mjs completed PASS using current headings/model/control policy. Parent instructed source freeze and scoped handoff rather than further full-suite harness retries. No runtime defect was inferred from those obsolete selector failures.

Original A23 failing JSON/PNG copied unchanged into independent-before-failure.*. All own failure results/screenshots remain. No genuine native background/suspension/timing claim is made by these headless checks.

## Reproduction

Run from app root, using the repository's pinned dependencies:

- `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5210 --strictPort`
- `node validation/s5/fixes/energy-typing/browser-checks.mjs` (retained broad script has the documented final stale/corrupted selector; use raw core PASS records, not its full status)
- `node validation/s5/fixes/energy-typing/teacher-check.mjs`
- `npm.cmd run typecheck`
- `node node_modules/prettier/bin/prettier.cjs --check src/editors/energy-profile/index.tsx`
- `node --test validation/s3/energy/energy.test.mjs`

A23 owns final static-build browser acceptance. Requested model/effort: GPT-6.1 Sol High; effective runtime model/effort and usage are not exposed and remain null in the manifest.
