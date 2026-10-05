# A08 / S2-ACID handover

Scope: S2 only, MASTERS-REACT-20261002. Owned paths: `src/activities/alevel/acid-base-calculations/**`, `validation/s2/acid/**`. Sibling apps remained read-only. No old builds, publication, root dependency/config changes or child delegation.

## Integration API

- `src/activities/alevel/acid-base-calculations/index.ts`: named typed `acidAdapter: CurriculumAdapter`; lazy provider and marking closures.
- `provider.ts`: `acidProvider: QuestionProvider`; coverage includes all38 source V2 families and every genuinely supported level. `select` validates activity/gem/level, uint32 seeds and previous codes, avoids previously used template families until the scope cycle exhausts, and returns the original canonical AB2 identity. `restore` cross-checks code/seed/level and returns common numeric parts, source context/data table/rounding note, built-in stage guide, complete worked answer and provenance. `resolveLink` supports original AB2 and historical AB/ABL codes.
- `marking.ts`: `acidMarking: MarkingPolicy`, React-free source numerical rules and original 0/0.5/1 mastery mapping.
- Numeric parts explicitly use the shared `inputMode:'text'` contract (foreman-approved refinement) to preserve the original mobile e-notation keyboard; numerical semantics remain unchanged.
- `engine.js` plus `engine.d.ts`: typed source-owned pure generator boundary. `data.js`, `legacy-core.js`, `historical-levels.js` preserve checked source numerical data/generators and historical codec compatibility. No page/DOM/storage/timing runtime.
- `idle-allowances.ts`: exact source38 per-template idle allowances. `persisted-codes.ts` is the explicit retained source codec map; these codes are not derived from catalogue/display order. Historical reviews have no idle allowance, since host review must be read-only.

## Reproduction and checks

From the new project directory:

```powershell
node validation/s2/acid/extract-engines.mjs
node validation/s2/acid/port-reference.mjs
node validation/s2/acid/adapter-tests.mjs
node validation/s2/acid/chemistry-reference.mjs
npm.cmd run typecheck
node validation/s2/acid/browser-tests.mjs --ordinary
node validation/s2/acid/render-bank.mjs
```

Extraction removes IIFE/global bindings, adds ESM imports/exports and separates current/historical modules. It deliberately preserves original formulae, answer code, data and persisted template order. The independent reference port retains all substantive assertions; originals are not edited.

Coverage checks compare the accepted S0 manifest's exact scope/route/family/code sets, then compare generated results to the actual original source. Six seeds include 0 and uint32 maximum. Checks separately verify all33 historical frozen fixtures, notation/parser compatibility with shared prechecks, tolerance inside/outside boundaries, partial/full/zero scoring, incomplete input, template cycling, and original per-template timing allowances. Strict project typecheck passed.

`CHEMISTRY-REVIEW.md` records substantive source/formula/worked-answer/OCR/pedagogical review and limitations. Original source metadata Version 3.0 is retained as provenance; current department map records Version 3.1, and direct current PDF retrieval failed due web reader size limit. No current-version line-for-line audit is claimed.

## Production verification and remaining independent gate

Host integration belongs to A01. Actual ordinary production flows PASS in `ordinary-browser-results.json`: all15 current target launches, correct/partial/incomplete scoring, correction and fixed first evidence/time, revision ADD ALL/pause/reload/resume/Next, teacher and original review codes. All63 actual source routes pass desktop/mobile read-only rendering in `render-bank-results.json`. `RENDER-REVIEW.md` records manual screenshot inspection and retained failures/fixes.

Native Chrome/CDP failed before host interaction with GPU process startup errors; one clarified native retry is retained. A01 assigned the genuine native timing exception to independent A07 (`validation/s2/review-native`), sole headed foreground owner. Headless Edge passing flows do not establish genuine idle/background timing. Worker handover remains ESCALATE until A01 attaches/disposes that explicit independent gate; all owned content and ordinary browser checks are complete and source files quiescent. No further native retry is authorised to A08. S2 acceptance still belongs to root after foreman integration.

Runtime requested model/effort is GPT-6.1 Sol High; effective model/effort and usage are unknown unless exposed. No publication, source move, old app/build/store edit or child delegation occurred.
