# E03 · MOLECULE-RESTORE

## Result and integration

The original SVG molecule editor and C3L6 teaching sequence are restored within the existing controlled React activity. The original engine remains the chemistry authority; source layout and depiction arithmetic are reused. No legacy page wrapper, persistence system, standalone prototype, dependency, copied asset or challenge policy was introduced or changed.

`MoleculeEditor({value,onChange,readOnly,label})`, `.molecule-editor`, `.molecule-workspace`, MoleculeState, ChallengeCommands and Olympiad storage schemas remain compatible with the shared Host. The local engine adds `commit-graph` and `clean`; both validate the complete graph and create one bounded history entry. Graph corruption is rejected; student valence mistakes remain assessable. Palette, preview, selection and viewport are transient. Read-only blocks every drawing mutation. Slot changes, pointer cancellation/capture loss, Escape, outside release and unmount discard pending gestures.

## Exact owned runtime files

- `src/editors/molecule/MoleculeEditor.tsx`: source palette, atom-growth/ring snapping, atomic carbon-chain drag, erase/bond cycle, source automatic fitting, keyboard growth, focus and cancellation. Existing accessible inspector and view controls are secondary collapsed controls.
- `src/editors/molecule/MoleculeInspector.tsx`: non-drag placement/growth/connection/deletion and charge/hydrogen overrides.
- `src/editors/molecule/Structure.tsx`: measured source SVG labels, true subscripts, direction-aware heteroatom hydrogens, label-clipped single/double/triple bonds and validity feedback.
- `src/editors/molecule/molecule.css`: scoped source surfaces, palette, bonds, labels and touch geometry.
- `src/chemistry/molecule/engine.ts`: atomic checked commit and clean-up, unchanged strict graph/history boundary.
- `src/chemistry/molecule/{layout,interaction,depiction}.ts`: source clean-up,74px/30° growth, snapping/chain construction and measured depiction/fit geometry.
- `src/activities/olympiad/c3l6/C3L6View.tsx` and `c3l6.css`: explanation/example/rule introduction order; A reaction rows; B connected embedded answer schemas, molar masses, coefficients, equilibria, repeated H/J drawings and seven unit Checks; C nine node-adjacent Checks and stage progression.

The editor barrel `index.ts`, chemistry `core.js`, source bank, all content/qualification/policy/dependency/legacy files and copied assets remain unchanged. `source-fingerprints.json` retains current runtime hashes and verified unchanged inspected originals/protected C3 inputs. Shared Host, landing, other activities, contracts and E0 evidence were not written.

## Source reuse and chemical review

`layout.ts` preserves the original molecule-builder/layout.js algorithm body verbatim, with a typed exported boundary. It retains `@ts-nocheck` for the original untyped internal arithmetic; strict graph validation is applied before and after every engine call. The focused test compares all22 current accepted alternatives against the actual original clean function, including exact coordinates, atom/bond connectivity, formula and chemical equivalence. Undo restores the entire original graph.

The earlier exact original/current core reuse remains intact. Depiction uses the original label chunks/measurement, hydrogen side choice, clipping and multiple-bond offsets. No RDKit depiction asset was generated. The current hydrazone model qualification, E/F interchange, G alternatives, K aldehyde hydrate correction and excluded orthoacid teacher erratum are retained. All22 current permitted alternatives and historical original/rejected structures remain separately covered by current policy tests. No mastery, revision or curriculum evidence is created.

## Meaningful verification

Run from workspace root:

```text
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/molecule/browser.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/molecule/edge-browser.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/molecule/compare.mjs
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/molecule/compare.mjs --clean
node apps/Masters-of-Chemistry/validation/editor-restoration/implementation/molecule/verify-final.mjs
```

`verify-final.mjs` runs the14 focused engine/current C3 reference tests and project typecheck, verifies protected fingerprints and requires all browser result records to pass. Actual shared production build and shared storage-failure tests are E01 gates.

- `unit-results.txt`:14/14 PASS. Source74px/30° growth/ring closure, bond cycle/deletion, atomic chain/history/limits, all22 exact source clean outcomes and chemistry/formula/topology, explicit-H equivalence, malformed graph rejection, assessable valence mistakes, complete sequential dependencies, first-completion deduplication, source qualification, K erratum and legacy/history preservation.
- `typecheck.txt`: project TypeScript PASS.
- `browser-results.json`: fresh nonpersistent pinned Playwright/Edge contexts at1440×1000,1024×900 and390×844. Actual Start, A Check/Continue, seven B Checks, nine C Checks and teacher controls; mouse/keyboard/touch growth, Chain, clean/undo, structural labels, lossless Escape/outside/touchCancel, graph/history reload, connected repeated structures, locks, zero teacher mutation, no page errors/overflow and zero curriculum rows. Native arrow-key scrolling of connected B schemes passes all three widths.
- `edge-results.json`: actual trusted ring-closing mouse gesture, target preview, erase/undo, lost-capture/slot-change/unmount cancellation, representation continuity, inspector O growth at90° and non-mutating supplementary zoom/pan/fit.
- `compare-results.json`: retained crowded source graph comparison in both representations at all three widths. Raw wording originally said10 heavy atoms; actual fixture and comparison records correctly contain12 atoms/11 bonds.
- `compare-clean-results.json`: same12-atom graph cleaned by the actual original source function, identically rendered in source/current skeletal and structural views at all three widths; exact measured SVG label chunks, true subscripts and bond endpoint arrays equal. Final original stored graph and final controlled React graph each equal the fixture. Source card widths556/976/366px are natural; browser-only current card widths are constrained for scoped comparison. Natural app layouts have separate screenshots.

## Actual rendered inspection and intentional adaptations

Inspected source/current matched cleaned desktop and mobile structural renders, matching skeletal/tablet geometry, natural introduction/A/B/C editor states, ring-target preview and teacher K erratum. The cleaned dihydroxyketone clearly shows its terminal HO/OH groups, carbonyl, carbon hydrogens and clipped bonds. Original crowded source coordinates are retained as evidence; clean-up provides the legible layout.

Source fine-pointer tool widths32px now let Clear share row1 at556px as in source. Tools keep44px vertical targets; coarse pointers/mobile use44px widths. Representation controls use44px height. These accessible target adaptations add toolbar height but preserve source order, chemistry and canvas geometry. Source/current whole cards are consequently not claimed pixel-identical.

The accepted shell sidebar narrows the desktop question/editor area. Source fixed connected scheme coordinates are preserved using local horizontal scrolling; source mobile uses the same pattern (`source-mobile-b.png`). New visible scroll/arrow-key guidance, focused accessible regions and cyan scrollbars make this discoverable. Original assets are unchanged. Natural app screenshots show the shell and local overflow; the shell itself was outside E03 ownership.

Browser evidence is headless Edge with trusted browser events and CDP touch input. It does not claim physical touchscreen or foreground native-app testing. Original reference contexts were isolated and ephemeral; original source files, real stores and builds were untouched.

## Failures retained and resolved

- `compare-initial-failure.json` and `compare-wait-retry-failure.json`: source pagehide saved the old state over a naïve isolated localStorage fixture. After one clarified bounded retry, E01 explicitly approved `addInitScript` seeding after pagehide and before source controller reload. The fix affects only the ephemeral context; both source/current final graphs are asserted exactly.
- `compare-runtime-ready-failure.json` / `edge-runtime-ready-failure.json`: the dev harness can exist before the React challenge finishes loading. Fixtures now wait for actual `.c3-intro` before issuing commands.
- `edge-horizontal-svg-hit-failure.json`: Playwright locator click on an SVG group with a horizontal path excludes the transparent stroke and computes zero-height bounds. Trusted mouse clicking the actual transformed bond midpoint tests the genuine hit target successfully.
- `unit-initial-failure.txt`: cross-vm equality differs for signed zero. The source result is structured-cloned before exact comparison; chemistry/runtime arithmetic was not altered.
- `initial-render/` preserves initial natural renders. `inspect-a-results.json` diagnoses pending vector-image loads and inherited white surfaces; final screenshots await decode and use original transparent scheme surfaces.

No unresolved worker exception remains. Root/foreman code review, combined production build and final acceptance remain required. Requested worker settings were Sol6.1/high; effective runtime settings and token usage were not exposed and are not invented.
