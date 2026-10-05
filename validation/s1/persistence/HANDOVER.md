# A05 / S1-PERSISTENCE

Implemented the real Dexie repository behind `createChemistryRepository(databaseName)` and pure `parseLegacyImport({namespace,sourceKey,rawText})`. Production callers import `src/persistence/index.ts`. Names must start `masters-of-chemistry-`; the factory cannot select old stores. `createRepository(name, fault)` in the implementation module is a development-only injection seam and is not exported from the production entry.

## Behaviour and evidence

Compound keys separate course/profile/attempt, course/profile/session and the separate A Level Olympiad activity. A transaction stores draft, immutable first evidence and optional scheduler state together. Identical first evidence deduplicates; conflicting first responses/assessments, changed question references or erased assistance return `conflict`. Pending self-rubric/self-drawing saves preserve the first automatic marks; the aggregate assessment cannot replace those marks. Corrections and post-assessment assistance can change current learning state while frozen evidence remains unchanged. Failed operations leave caller objects untouched and return explicit unavailable/quota/conflict/invalid-data results.

Imports support exactly the three inventory-confirmed curriculum result stores. They retain original attempt ID, date, score, A Level `level` versus IGCSE `grade`, optional source question/family/strand and assistance/self-assessment facts, optional valid timing, historical acid progression and the original covalent diagram alias. Missing historic timing/ref/responses stay absent. Source fingerprints identify receipts; canonical payload comparison guards fingerprint collisions. Original attempt identity deduplicates imports even with different source whitespace. Imported evidence is not converted into a fabricated editable student attempt.

Source references and SHA-256 fingerprints are in `source-evidence.json`. The parser does not read browser storage, mutate supplied text, silently clean corrupt rows, accept arbitrary object-shaped formats or import Rocket Recall. Unknown keys/shapes fail explicitly.

Serialization validators accept empty draft graphs and chemically wrong but assessable excessive valence. They reject corrupt graph references, duplicate bonds/IDs, invalid numeric serialization, out-of-bounds text evidence, inconsistent first marks/timing and snapshots. Rubric ranges are checked against locked text. Correction ranges are checked for serialized lengths/bounds here; the question-aware input checker owns comparison to source text. Chemical marking, supported provider question IDs and substantive answer correctness remain activity responsibilities.

Typed Olympiad saves are isolated and validate source IDs, drawings/history, stage dependencies, totals and passed-check drawing fingerprints. These checks establish serialization/current-drawing consistency, not chemical correctness. **C3L6 legacy import explicitly returns invalid-data until the S3/S4 challenge adapter can revalidate the source answer bank and saved graphs.** This deferral was explicitly approved by the foreman. No completion is demoted, invented or silently discarded, and the original input remains untouched. The later challenge owner must supply substantive completion revalidation before writes are accepted as chemically checked.

## Reproduce

From the new project directory:

```powershell
npm.cmd run typecheck
node node_modules/typescript/bin/tsc -p validation/s1/persistence/tsconfig.json
node --test validation/s1/persistence/persistence.test.ts
node validation/s1/persistence/source-evidence.mjs
```

Actual browser checks use the pinned workspace Playwright via an explicit read-only import. The runners create fresh synthetic persistent Edge/Chromium profiles inside the owned validation directory and never access old browser keys or user profiles. Keep profile directory names short on Windows; long profile paths initially caused startup/storage failure, resolved by short owned paths and normal no-first-run launch flags. Successful reruns supersede that startup failure; no persistence implementation was weakened.

```powershell
# Independent repository fixture server; start in a separate terminal:
npm.cmd run dev -- --port 5183
node validation/s1/persistence/run-browser.mjs http://127.0.0.1:5183

# Foreman-owned integrated development host at port 5181:
node validation/s1/persistence/run-integrated-browser.mjs http://127.0.0.1:5181
```

`browser-results.json` records 14 actual IndexedDB scenarios and fresh-document restore. `integrated-browser-results.json` records the same suite through the integrated harness plus numeric freeze → drawing review → reload → quota rollback → retry → one self-assessed aggregate result → reload, preserved attempt/session/time and a second-connection conflict. Faults run within real Dexie transactions; they are simulated disk/quota errors, not a claim that the browser's physical disk quota was exhausted. Screenshots `browser-result.png` and `integrated-browser.png` were visually inspected. The integrated first attempt records a real small nonzero active duration; no duration is added to historical records.

Pure Node tests and full strict typecheck pass. Parent owns stage-wide build, production fixture exclusion, protected-app validation, integration review and root acceptance. S1 synthetic fixtures are not migrated question banks. No S2 work, deployment, original-app builds or legacy store access occurred. Requested model was gpt-6.1-sol/high; effective model/usage was not exposed.
