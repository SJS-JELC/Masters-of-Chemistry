# Masters of Chemistry

One React/TypeScript platform with independent A Level and IGCSE static builds.
It contains all 14 approved activities and 43 curriculum revision targets.
C3L6 is a separate Olympiad challenge. Rocket Recall is excluded.

## Install and develop

Enter this folder from the repository root, then run the remaining commands here.
Node 24.13.1 is the validated Node version.
The examples use Windows PowerShell; use `npm` instead of `npm.cmd` on other systems.
Stop a running development server before a clean install; Windows keeps its native
build binding open while the server is running.

```powershell
cd apps/Masters-of-Chemistry
npm.cmd ci --cache .npm-cache
npm.cmd run dev
```

Development URLs:

- A Level: <http://127.0.0.1:5181/alevel.html>
- IGCSE: <http://127.0.0.1:5181/igcse.html>
- DEV component/authoring catalogue: <http://127.0.0.1:5181/development/authoring/index.html>

Development catalogues and test hooks are excluded from production builds.
A cold Vite server may spend about 30–40 seconds preparing dependencies. Open
the preview and wait for its controls before running development browser fixtures.

## Build and preview

```powershell
npm.cmd run build
npm.cmd run preview
```

- A Level build: `dist/alevel/`, <http://127.0.0.1:5182/alevel/>
- IGCSE build: `dist/igcse/`, <http://127.0.0.1:5182/igcse/>

Use an HTTP server, rather than opening `index.html` as a local file. Both builds
support nested URL prefixes and direct refresh. Each enables its six activities;
their physical deferred chunks include the shared registry's complete dependency
graph. Course-exclusive physical bank bundles are not claimed.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run test:s5
npm.cmd run format:check
npm.cmd run check:originals
npm.cmd run check:s5
node scripts/review_active_question_time.mjs
```

`test:s5` runs the retained foundation/content/chemistry/regression tests plus the
React registration and timing ports. Historic fixtures remain available; exact
approved scope, three prompt clarifications and the C3 K erratum have full
regression ports alongside preserved historical fixtures.
`check:s5` runs deterministic source/control/registry/timing/release checks and
checks retained independent acceptance against current fingerprints. It does not
replace fresh browser or chemistry review after a substantive change.
The timing review checks retained native boundaries plus current production
restore/first-score/statistics evidence; it does not rerun the native wall intervals.

The original-app and source-provenance checks require the complete repository
checkout with the two sibling apps available **read-only**. Browser verification
uses the repository-root pinned Playwright 1.62.1 and installed Edge/Chrome;
the app itself has no runtime dependency on the old apps or root browser tools.
Current browser commands and fingerprints are in [the final evidence map](validation/s5/foreman-report.json).

## Local release inventories

After a successful build:

```powershell
npm.cmd run release:alevel
npm.cmd run release:igcse
npm.cmd run check:release
```

These create/check `release/alevel.runtime.json` and `release/igcse.runtime.json`.
Each lists only approved runtime files, hashes, provenance and compatibility
aliases. The complete initial shell budget is 204,800 gzip bytes; banks, editors
and data views load lazily. Release commands do not deploy or change Git remotes.

## Architecture and authoring

- `src/catalogue/`: canonical activity/gem metadata and registration boundaries.
- `src/activities/` and `src/chemistry/`: complete content, generators and pure marking/chemistry.
- `src/domain/`: shared attempts, active timing, mastery and revision scheduling.
- `src/persistence/`: course/profile-scoped IndexedDB and read-only legacy import.
- `src/foundation/`, `src/ui/`, `src/editors/`: course host, composable question player and specialist editors.
- `development/authoring/`: DEV-only runnable scaffold and component examples.

Practice and revision use the same player/controller/repository. First responses,
scores and active time are immutable; learning corrections, hints and worked
answers do not create fresh independent evidence. Teacher views create none.
Olympiad drawings/completion are stored separately from curriculum statistics.

To generate a runnable standard family:

```powershell
node development/authoring/scaffold.mjs dev-my-family
node --test development/authoring/families/dev-my-family/family.test.mjs
node node_modules/typescript/bin/tsc --project development/authoring/families/dev-my-family/tsconfig.json
node development/authoring/serve.mjs --refinement
```

Open <http://127.0.0.1:5195/development/authoring/families/dev-my-family/preview.html>.
The generated README contains its actual shared-host browser fixture command.
The starter provides fixed and seeded dilution examples, typed data/provider/
marking, DEV registration, checked answers, source hashes and tests. It never
promotes production content. New chemistry requires its own source and chemical
review. See [new activity/gem onboarding](docs/authoring/new-activity.md),
[architecture](docs/architecture/platform.md) and [source formatting](docs/architecture/formatting.md).

Current boundaries and revision/mastery scope derive from canonical catalogue
metadata. Adding a standard family does not require storage, timer or scheduler
algorithm changes. A genuinely new activity needs approved identity/catalogue
metadata and a lazy adapter; a new specialist editor is a separately reviewed
interface change.

## Saved data, provenance and limits

Saved work stays on the current device/browser and is separated by course/profile.
Use **Import progress** to inspect/import supported old records or pasted source
JSON; raw input, skipped decisions and outcomes can be exported. Old browser
stores are read only. Repeated imports deduplicate. Untimed historical records
remain untimed, and missing old response details are not invented.

The two original app folders, Git metadata, dependencies and builds remain
unchanged. All readable source code is fingerprinted. Licensed eagle/Comfortaa
assets are retained in `public/assets/`, with the font licence alongside them.

Documented current-app chemistry corrections preserve original sources: acid
precision guidance now matches each answer's format; three electron-bonding
prompts explicitly name subshells or solid ionic compounds. C3 K accepts the
hydrated aldehyde, excluding the source's orthoacid alternative. Its historical
outcome remains distinct from current revalidation; see [the K erratum](docs/inventory/c3-k-erratum.md).

Explicit limits:

- 523 original offline cloud placeholders outside `src` have metadata-only records; no hydration was attempted.
- Retained official OCR extracts and the department's OCR 3.1 May 2026 mapping were consulted; a fresh line-by-line current full-PDF audit is not claimed. IGCSE retains its own curriculum authority.
- The exact managed Python/RDKit regeneration profile was unavailable; supplementary checks are labelled separately. Reviewed original assets/provenance remain retained.
- Earlier ambiguous native timing probes remain documented alongside passing applicable native boundaries. Headless interaction profiling is not an OS foreground/native timing claim.
- Cold development dependency preparation can exceed a browser fixture's 30-second navigation budget. The retained warm-server continuations keep all substantive assertions.
- Accounts/backend, offline downloads and deployment are outside this implementation.

Final acceptance evidence, current hashes, commands and remaining dispositions
are linked from [the final report](validation/s5/foreman-report.json) and [handoff](HANDOFF.md).
## Explaining Properties addition

The current source adds 32 Level 1/2 ionic-property and bond-strength questions.
See [activity sources and marking](src/activities/alevel/explaining-properties/README.md)
and [author validation](validation/explaining-properties/HANDOVER.md).
`node scripts/test-explaining-properties.mjs` runs the current 46-test regression
selection; `node scripts/verify-explaining-properties.mjs` verifies the amended
14-activity/43-target contract, all retained/current source hashes, both runtime
closures and protected originals. Earlier S0–S5 inventories/tests remain frozen
historical evidence. No publication is included.
