# A15 — S5-FIX-DOT-CHARGE-TYPING

## Result

PASS. The actual shared editor now keeps the Ion charge field as local raw text until Apply. Clearing the default and typing `-`, then `1`, produces `-1` instead of the diagnosed `01`. Apply accepts a complete signed integer in the existing advertised −9 to +9 domain. An explicit `0` is valid; blank, lone signs, decimal/exponent forms, non-finite values, malformed text and values outside that domain show an actionable status message and leave the graph and its undo history unchanged.

## Exact scope and reasoning

Only runtime change: `src/editors/dot-and-cross/DotCrossEditor.tsx`. `chargeText` replaces numeric setup state; the input becomes text with a bounded width and a text keyboard capable of signs; `applyGroup` parses and validates the whole string at the semantic edit boundary. The existing readOnly guard is preserved at that boundary. No engine, marking, palette, content, timing, persistence or host changes. X/Y controls were inspected but were outside the evidenced signed-charge defect, so were left unchanged.

Local setup text survives atom-selection changes, semantic edits and Undo/Redo. Restoring the saved attempt after a full reload recreates local setup with its existing default `1`; the saved graph and history restore exactly. A readonly editor remains unable to type or Apply, and the accepted S4 teacher host displays checked diagrams without editable controls.

`before.json` and `before.tsx.txt` retain the exact pre-fix file, SHA256 `10bc8bb8b2fde87389519806078963fba062f43e8234e13e10381cca474038f6`. `source.diff` is the reviewable diff against that baseline. `after.json` retains final SHA256 `ba5a3100b01ae8379f4a912ae81b526070572bc75e3c61bb89c3f63f876c6cb3`. Earlier stage evidence was not changed.

## Validation

- `checks.json`: all ten gates PASS, including TypeScript, pinned Prettier, protected originals, both activity suites, all 72 IGCSE source/reference and incorrect fixtures, all 91 A Level reference/incorrect fixtures and isomer/lithium/pair-layout regressions. The copied suites and exact originals are linked in `copied-regression-provenance.json`; their outputs are retained here.
- `browser-results.json`: pinned workspace Playwright with installed Edge, isolated DEV 5211 and actual production host, both courses' `h2` attempt. Every charge keystroke uses real keyboard input; captured input events are trusted. Tests assert raw intermediate values, typing alone causes no graph edit, Apply commits −1/+2/0/±9, invalid inputs cause no graph/history mutation, selection and undo/redo remain sound, reload restores the same attempt and graph/history, and no independent assessment evidence is created. Both 390px production layouts pass signed typing and Apply without horizontal overflow.
- `readonly-browser.json`: actual component with readOnly prop, externally supplied −1 graph, trusted attempts at typing and Apply, no emitted response callback, graph unchanged and 390px bounds PASS.
- Manually inspected final A Level and IGCSE desktop negative-charge screenshots and the IGCSE mobile screenshot: field text, minus-charge glyph and brackets agree; control labels and layout remain readable. The single H− response is an editor mechanics fixture, not an asserted chemical answer to H2. No Check answer was issued.

## Retained failures and environment

The first browser run completed A Level charge checks but used an outdated expectation that teacher mode still mounts the editor. Corrected to the accepted S4 checked-model view. The second run was interrupted by live Vite reloads from concurrent `src/persistence/validation.ts` edits, which cleared transient selection and closed the editor details. Both failed dated reports remain here; their failures are not counted as PASS. The final two complete production runs PASS. The isolated test server disables HMR/watch during bounded interactions to prevent unrelated concurrent edits from reloading the page. This changes only the validation server, not product code.

Owned server PID43820 was stopped after verification, and port5211 returned ECONNREFUSED. CTRL-C was not handled by the tool's pipe session, so only the known owned PID was stopped. `server.json` records the actual closure. No native foreground browser was used. No build/release action was performed; A23 owns independent final build verification.

## Reproduce

From the app root, start `node validation/s5/fixes/dot-charge-typing/serve.mjs`, then run `browser.mjs` and `readonly-browser.mjs` in that folder sequentially. Run `node validation/s5/fixes/dot-charge-typing/checks.mjs` for copied chemistry and static gates. Stop only the PID recorded by this owned server. `prepare.mjs` is initial baseline capture and intentionally refuses to overwrite the original baseline.

Requested role: Sol 6.1 High. Effective model/effort, token usage and costs are not exposed by this runtime and remain unknown. No children.
