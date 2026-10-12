> Historical development POC handover. The12 October integration request superseded the earlier development-only boundary for these four prototypes. Current production scope, preserved identities and accepted integration are described in [the integration handoff](../../RATE-EQUATIONS-INTEGRATION-HANDOFF.md).

# Rate Equations development preview

For a fresh Codex session, start with the [next-session handover](../../RATE-EQUATIONS-HANDOVER.md), which records the user's latest decisions and deferred work.

User-authorised 9 October 2026. Exact scope: [POC contract](../../rate-equations-poc-contract.md).

From this app directory:

```powershell
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5184 --strictPort
# http://127.0.0.1:5184/?harness=rate-equations
node scripts/rate-equations-poc-check.mjs
npm.cmd run typecheck
npm.cmd run build
node scripts/rate-equations-poc-browser.mjs
```

The DEV entry lazily mounts four gems and twelve starting questions in the shared React QuestionPlayer. Each gem has Structured, Unstructured and Applications levels. Orders, graphs and Arrhenius have deterministic seed variants; named mechanisms remain fixed, and their Next button cycles the three levels. Pure content factories supply automatically marked parts, checked answers and source references. The POC's optional response-control component presents wrapping answer buttons and typed rate laws/units while the original shared player/controller still handles attempts and commands.

Typed chemical input automatically formats exponent digits as superscripts and digits within bracketed species as subscripts: `[NO2]2` becomes `[NO₂]²`. A bounded semantic parser accepts supported equivalent factor orders and explicit powers one/zero, with ASCII, caret and Unicode entry conventions. Unit marking compares factor powers. It rejects malformed expressions, wrong case, unknown species and incorrect orders/units; it does not use fuzzy matching. All such formatting/marking remains local to the DEV POC.

The graph workspace uses analytical curves and lines, so dragging either the marker or tangent keeps them aligned. Its deterministic triangle stays within the plot, with signed coordinate changes and units labelled directly on the graph; endpoints have no resize controls. A label box next to the current marker shows its coordinates using the graph's quantities and units. Mobile plots scroll locally to keep labels legible; keyboard/direct marker controls and half-life pins remain available. The gradient quotient is shown only after assessment.

The host uses the existing attempt controller, first-assessment/correction rules and active clock. Its five-minute idle allowance supports multistep table and graphical calculations. All attempts and graph tool state stay in memory; reload and leaving the host reset them. Teacher views create no assessment. Nothing is registered in the production catalogue, revision scheduler or evidence repository. The internal acid activity literal is a DEV family context, following the existing authoring proof; no production acid questions are replaced. POC IDs are distinct `RATE-POC-*` IDs.

This bounded preview intentionally defers revision integration, persisted pause/reload/graph-state restoration, production catalogue renumbering and full activity acceptance. No production release or publication is authorised. Adding a marked graph editor later needs a separate typed state/serialization contract; this POC's graph tools support calculation and standard responses supply the marks.

Future gem numbering, for authoring notes only:

| Old catalogue gem suffix | Future suffix |
| --- | --- |
| 1 / 2 | 1: Orders & Rate Calculations |
| 3 / 4 | 2: Rate Graphs & Half-life |
| 6 | 3: Rate Equations & Mechanisms |
| 7 | 4: Arrhenius & Temperature |
| 5 | Route each part by content to 1 or 2 |

IDs overlap across catalogue versions. A future migration must resolve them using catalogue-version context, preserve historical marks/evidence and update current app and atlas outputs together. The atlas is unchanged here.

Initial POC evidence is retained under `.artifacts/rate-equations-poc/`. Current interaction-refinement fixtures, checks and screenshots are under `.artifacts/rate-equations-poc/ui-refinement/`; the current check/browser scripts write there. Historical worker fixtures retain the original choice/adjustable-triangle schema and describe the initial accepted implementation. No broad regression certification is claimed; this is the contract's lightweight POC check.
