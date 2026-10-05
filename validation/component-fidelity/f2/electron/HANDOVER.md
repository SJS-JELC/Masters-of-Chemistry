# Electron configuration source restoration — F2-EC / F04

Implementation belongs only to `src/editors/electron-configuration/`. The checked engines, providers, banks, IDs, assessment, timing and persistence have not been edited. Requested model/effort: GPT-6.1 Sol/high; effective runtime settings and actual usage are not exposed.

## Source authority and mapping

The canonical `apps/Masters-of-A-Level-Chemistry/src/activities/electron-configurations/index.html` loads `levels-app.js`, rather than the historical `app.js`. The levels controller and final CSS are the source of this restoration. `change-map.json` retains fingerprints of the linked page/controller/styles, reference icon/data/styles and shared font/theme/mastery/review cascade.

| Component | Source | Restored presentation |
| --- | --- | --- |
| Full/abbreviated build | `levels-app.js` numericFields/construction | Species card; subshell-entry labels and compact count fields; checked noble-gas core hides occupied core subshells |
| Full/abbreviated identify | displayConfiguration/identity | Flex notation with actual superscript DOM, core token, species charge subtitle and element input |
| Horizontal boxes | diagram/boxMarkup | Connected logical source DOM groups, 4px box gaps, labels underneath; source spin/empty cycle |
| Energy ladder | diagram | Source 14.25px quarter rows; separate s/p/d columns; 4s below 3d, 3d halfway toward 4p; increasing-energy axis |
| Isoelectronic matching | matchingContent | Source three-column/two-column candidate cards, correct symbol/charge superscripts, names and atomic numbers |
| Checked models | feedback answerContent | All four representations, checked explanation and correct candidate match classifications in an exported read-only component |
| Periodic reference | periodic-table.js / periodic-table.css | Exact icon cell geometry, native dialog, all 114 retained OCR reference entries, original key/groups/blank facts and source fonts |

Styles are copied selectively and scoped to `.ec-source`. The reference uses an exclusive `ec-periodic-*` namespace, with source declarations preserved. Shared chrome/actions/feedback are supplied by F03 through `workspaceAside`; the specialist sends only typed editor commands through `onResponse`. The existing explicit down-spin key and select alternative remain available. Shift+Space adds a backwards cycle. The native reference does not create assistance or timing evidence.

## Reproduction and validation

Run from workspace root:

```powershell
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/extract-styles.mjs
node apps/Masters-of-Chemistry/node_modules/prettier/bin/prettier.cjs apps/Masters-of-Chemistry/src/editors/electron-configuration/styles.css --write
node --test apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/chemistry.test.mjs
node apps/Masters-of-Chemistry/node_modules/typescript/bin/tsc --project apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/tsconfig.json --noEmit
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/browser.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/lifecycle.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/contacts.mjs
node apps/Masters-of-Chemistry/validation/component-fidelity/f2/electron/capture-change-map.mjs
```

Use the read-only source GET server on 5197 and current Vite server on 5188. Browser tests use pinned workspace Playwright 1.62.1 and installed Microsoft Edge in fresh, nonpersistent contexts. Original synthetic review contexts are separate from all user stores. Source code review automatically uses source Level 3; the comparable drawing/response uses the same canonical code/species/representation. React uses its actual supported requested level and accepted common pill. Build/check aggregation and original-tree fingerprint verification belong to F01.

Chemistry checks include all 71 source species, all 564 canonical variants with exact source marking, representative matching codes, source periodic facts, engine command immutability and explicit spin states. These are supplemental to actual source/rendered inspection.

## Limits and retained failures

Native OS hiding/minimizing/suspension is not newly tested or claimed. Timing engine code is unchanged and historical native limitations remain. Prior evidence is immutable; raw source-mode/select-label/short-hidden-fixture/concurrent-import harness failures are retained in their labelled JSON files. The source EC page freezes assessed responses and has no correction action: its correction comparison reopens the same source review question with the corrected drawing, while React exercises learning-only corrections and immutable first evidence.

Final browser/visual results and acceptance disposition are recorded separately in `completion.json`, `browser-results.json`, `lifecycle-results.json` and `render-review.md` after shared integration freeze. This handover does not authorize publication or F3.
