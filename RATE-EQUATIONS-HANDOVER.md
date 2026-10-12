> Historical development POC handover. The12 October integration request superseded the earlier development-only boundary for these four prototypes. Current production scope, preserved identities and accepted integration are described in [the integration handoff](RATE-EQUATIONS-INTEGRATION-HANDOFF.md).

# U6 Rate Equations — next-session handover

Updated 9 October 2026, Europe/London. **Work in progress: development proof of concept, not a finished or production-approved activity.**

The user's latest assessment was: “still work in progress but getting there”. They asked for this handover, not further implementation. Resume by opening the preview and taking their next feedback; do not interpret the previous technical acceptance as final user approval of the design.

## Start here

- Active project: `apps/Masters-of-Chemistry/`, the combined React/TypeScript app. Historical A Level and IGCSE sibling apps are read-only.
- Read the workspace/app `AGENTS.md`, `project-contract.json`, `IMPLEMENTATION.md` and `progress.json`, then [the POC contract](rate-equations-poc-contract.md) and [authoring notes](docs/authoring/rate-equations-poc.md).
- All paths below are relative to this app unless stated otherwise.
- Preview: **http://127.0.0.1:5184/?harness=rate-equations**. Vite was left running in the previous session; check availability rather than assume the process survives a new session.
- Existing unrelated edits and historical check failures must be preserved. Do not reset the working tree or regenerate broad project baselines.

From the app directory, start the preview if necessary:

```powershell
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5184 --strictPort
```

This is the Vite development route, not the production preview. The POC is excluded from the production build.

## User decisions to preserve

The initial task was to inspect atlas questions and propose rate-equation gems, difficulty levels and procedural/static question types. The user chose four merged gems and interactive graphs, then explicitly narrowed the first delivery to a few questions and minimal validation.

1. Four gems numbered **1–4**, rather than retaining seven visible gems or gaps in numbering.
2. Development preview first. **Atlas migration happens after POC review**, not now.
3. Three starting questions per gem, one per level: Structured, Unstructured, Applications. Numerical variants are procedural; mechanism examples are fixed.
4. **No longer written answers, freeze-and-check/self-rubric tasks or practical-method questions for now.** Earlier proposals for those are superseded.
5. **Do not label generated datasets “illustrative”.** Preserve provenance in authoring data without adding that user-facing label.
6. Tangents align automatically at every level; do not make pupils rotate or fit them.
7. MCQs use side-by-side/wrapping answer buttons **without circular radio indicators**. Maintain keyboard access and selection semantics.
8. Rate equations and rate-constant units are **typed and automatically formatted**, including rate equations in mechanism questions. Exponents become superscripts; chemical formula digits stay subscripts: `[NO2]2` → `[NO₂]²`.
9. **Triangle size is not user-editable.** Drag the tangent or curve marker; triangle geometry follows automatically. Display signed Δt and Δ[A], values and units on the graph. Do not reveal the gradient quotient until assessment.
10. A **label box beside the marker** displays its current x/y coordinates with appropriate quantities and units. Keep it readable at plot edges and on mobile.
11. The user particularly liked the mechanism questions (“these mechanism questions are lovely”). Preserve their chemistry and character when refining controls.

## What exists

The preview uses the real shared `QuestionPlayer`, attempt controller and active clock, with a DEV-only host and memory-only state. It does not write pupil evidence to IndexedDB/localStorage. Attempts and graph positions reset on reload or leaving the host. The internal acid activity literal is an existing authoring-context workaround; this does not register or replace acid questions.

| Gem ID | Name | L1 | L2 | L3 |
| --- | --- | --- | --- | --- |
| `u6-t1-2-1` | Orders & Rate Calculations | Infer order from concentration/rate factors | Two-reactant orders, typed rate law, k and typed units | Simultaneous concentration changes, typed law and rate prediction |
| `u6-t1-2-2` | Rate Graphs & Half-life | Instantaneous rate from tangent deltas | Two half-lives, first order and k | Concentration and instantaneous rate to k; minutes/seconds conversion |
| `u6-t1-2-3` | Rate Equations & Mechanisms | Typed law from supplied slow first step | Choose missing step and type its rate law | Choose mechanism matching measured orders and overall equation |
| `u6-t1-2-4` | Arrhenius & Temperature | Ea from supplied gradient | Scaled-axis graph gradient to Ea | True intercept to A, then k at a new temperature |

Seed 0 gives the twelve starting examples. Orders, graphs and Arrhenius have numerical variants; mechanism Next cycles through the fixed levels. The preview has a level selector, variant seed field and Teacher answer view.

Graph tools include keyboard/direct marker inputs, two pinned readings for half-life, scaled Arrhenius axes and extension to the true intercept at 1/T = 0. Mobile plots scroll within their own container. Best-fit editing of scattered data was deferred.

## Source map and implementation details

All POC implementation lives in `src/development/rate-equations/`:

| File | Responsibility |
| --- | --- |
| `RateEquationsPreview.tsx` | DEV host, four gems, level/seed selection and shared attempt/player wiring |
| `orders.ts`, `mechanisms.ts`, `graphs.ts` | Pure question factories, checked answers, source references and graph models |
| `RateGraphTools.tsx`, `graph-tools.css` | Marker/tangent interaction, fixed triangle, delta labels and coordinate boxes |
| `RateResponseControl.tsx`, `response-controls.css` | MCQ answer buttons and formatted typed input |
| `input-syntax.ts`, `marking.ts` | Bounded semantic parsing, formatting and automatic marking |
| `types.ts`, `preview.css` | POC types and layout |

Shared changes are deliberately small:

- `src/main.tsx`: lazy route guarded by `import.meta.env.DEV` and `?harness=rate-equations`.
- `src/ui/QuestionPlayer.tsx`: optional `workspace`, `presentation: 'standard'` and `responseControl` props. Existing production callers keep their default controls and presentation.

Current input syntax accepts supported equivalent concentration-factor ordering, explicit powers 0/1, ASCII/caret/Unicode powers and reordered unit factors. It rejects wrong species/case/orders, unknown species even to power zero, malformed input and incorrect units. It is **not** a general algebra parser: rate laws use declared bracketed species with integer powers 0–2 and exactly one k; unit products use lowercase dm/mol/s and integral powers. Unit fractions are not supported. Keep chemistry semantics distinct from visual formatting and avoid fuzzy matching.

Current unit typing is the separately assessed k-unit part in Orders L2; numerical questions with a supplied unit retain the shared numeric controls.

## Atlas and chemistry context

Research found 29 marked parts across 19 questions directly mapped to the original rate-equations gems, plus relevant items mapped elsewhere. This is evidence for question patterns, not a claim about all past-paper frequency or complete curriculum coverage.

Workspace sources:

- `resources/a-level-past-paper-atlas/data/aggregate.json` and `review-bundle.json`.
- `resources/curriculum/ocr-a-level/a-level-specification-map.md` and atlas `run2/specification-evidence/sections.json` for OCR 5.1.1.
- Examples: 2022 H432/01 Q16 and 2023 H432/01 Q17 (rate tables); 2024 H432/01 Q17 (crystal-violet graph); 2018/2021 H432/01 (Arrhenius); 2024 H432/01 Q20(b) (mechanism, despite its historical L6 atlas mapping).

Use abstract reactants for variable-order generators; preserve reviewed chemistry for named mechanisms. Keeping a species in excess does not establish its true order as zero. Integrated kinetics equations may generate curves internally, but are not required pupil recall. Preserve original atlas extraction/evidence records.

The future numbering migration is documented but **not performed**:

| Old gem suffix | New suffix |
| --- | --- |
| 1, 2 | 1 — Orders & Rate Calculations |
| 3, 4 | 2 — Rate Graphs & Half-life |
| 6 | 3 — Rate Equations & Mechanisms |
| 7 | 4 — Arrhenius & Temperature |
| 5 | Route each existing atlas part by assessed content to 1 or 2; practical app questions remain deferred |

Old/new IDs collide semantically: old `...-3` is graphs, new `...-3` is mechanisms. Do not use unversioned global replacements or redirects. A later explicit migration must update the current app/curriculum/atlas catalogue, mappings, filters, briefs and workbook together, preserve historical provenance, deduplicate merged secondary mappings and conserve marks.

## Verification already performed

Current evidence: `.artifacts/rate-equations-poc/ui-refinement/`. Start with `HANDOVER.md`, `completion.json`, `root-acceptance.json`, `shared-source-diff.patch` and `source-diff.patch`.

Recorded checks passed at the previous checkpoint:

- Twelve starting answers and 60 deterministic gem/level/seed cases.
- 68 formatting/semantic cases, 42 additional model cases and nine typed-control browser checks.
- Eight graph browser checks covering 63 marker states, including graph ends, Arrhenius zero extension, dragging, keys and mobile scrolling.
- Integrated browser marking/navigation/teacher checks, with no page errors or storage writes.
- Full TypeScript/build and production-exclusion checks; production retains fourteen activities.
- Actual exported screenshots reviewed by workers/foreman and root. Root accepted the implementation **as a POC**, not final product approval.

The protected-original gate remains **FAIL with the same historical 529 difference paths across 1320 checked paths**. Before/after comparison showed no additional drift. Do not claim this gate passed, overwrite its baseline or repair unrelated historical differences as part of the POC.

The earlier `.artifacts/rate-equations-poc/` evidence describes the first version, including MCQ rate laws and draggable triangle endpoints. Its historical worker fixtures are not the current response schema. Use `ui-refinement/` for current evidence. Evidence describes previous runs; rerun affected checks after substantive edits.

Useful commands, from the app directory:

```powershell
node scripts/rate-equations-poc-check.mjs
npm.cmd run typecheck
# With the DEV server running; run content check first to refresh starting-examples.json:
node scripts/rate-equations-poc-browser.mjs
# When shared integration or build exclusion changes:
npm.cmd run build
```

The current scripts write to `ui-refinement/`; preserve a checkpoint if later comparison is needed. Browser verification uses the workspace-pinned Playwright and Edge via `scripts/browser/paths.mjs`. `RATE_POC_URL` can override the browser script's default URL. Native OS IME and a physical touchscreen were not tested; mobile touch checks used browser emulation/CDP.

## Delegation and next steps

The user approved **one Sol 6.1 High foreman plus two Sol 6.1 High implementation workers**, with root final review. Existing handles were `/root/rates_poc_foreman` and its direct children, but do not assume handles are reusable in a new session.

- Foreman owns interfaces, integration, worker results and the swarm log.
- Graph worker owns graph/Arrhenius content and interaction.
- Content/input worker owns orders/mechanisms and typed controls/marking.
- No routine reviewer agent; use a separate reviewer only for genuine unresolved issues. Small local edits need not recreate a team.
- Read workspace `development/shared/agent-config/.agents/skills/delegate-work/SKILL.md` and its references before further delegation. Archive completed `.codex/swarm-status.md` before a new run; never overwrite an active run. Root waits on the foreman without routine polling when it has no independent work.

Next task is user-led refinement of this preview. There is no known unresolved implementation blocker at handoff. Keep validation proportionate to changed behaviour and inspect actual rendering.

Still deferred: larger question banks, fuller curriculum coverage, practical/written questions, production IDs/registration, revision selection, persisted graph/attempt restoration, full timing/revision acceptance, atlas migration and publication. Do not advance those merely because the prototype builds successfully. No deployment, commit or dependency changes were requested or performed.
