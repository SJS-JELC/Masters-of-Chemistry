# S2 acid chemistry and pedagogy review

Owner: A08 / S2-ACID, run MASTERS-REACT-20261002. Reviewed 3 October 2026. Requested runtime: GPT-6.1 Sol High; effective model, effort and usage are not exposed.

## Authority and limits

Consulted `resources/curriculum/ocr-a-level/a-level-specification-map.md` (department review 10 September 2026, records OCR H432 Version 3.1, May 2026) and the actual retained 5.1.3 learning-outcome text in `resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json`. The latter explicitly contains an older OCR 2016 archive, not a line-for-line current-version copy. The original acid data's Version 3.0 / 2025 metadata is retained as source provenance, not promoted to a claim of the current specification.

The official OCR PDF URL was checked on 3 October 2026; the web reader could not open its 21 MB response. No current-version verbatim comparison is claimed. The current department map and retained OCR outcome text agree on the applicable numerical scope: 5.1.3(c) Ka/pKa; (d–f) pH, Kw and strong acid/base quantities; (g–h) weak monobasic acid approximations and their limitations; (j,l) buffer preparation and calculations. Titration graphs/indicators belong to a separate adapter, and this numerical resource does not claim complete coverage of all qualitative 5.1.3 outcomes or practical endorsement.

## Substantive review

Read the active V2 strong-acid, strong-base, weak-acid, buffer-making and buffer-calculation builders, their numerical response construction and every worked-answer branch. Reviewed all four acid/conjugate/sodium-salt records and strong-acid/base formulae and molar-mass data. The extracted functions retain the source chemistry unchanged; output equality is separately tested against the original source.

- Strong acid questions select monobasic HCl/HNO3, use [H+] = c and negative base-10 logarithms. Dilution conserves amount and converts cm3 to dm3. Target-pH preparations invert pH before calculating amount/volume. Excess-acid mixtures subtract 1:1 HCl/NaOH amounts and divide by total volume; their sampled recipes always leave positive acid.
- Strong bases use the supplied Kw and the correct OH− factor for fully dissociated mono-/dihydroxides. Pure water uses [H+] = [OH−] = sqrt(Kw), including non-25 °C questions. No blanket pH + pOH = 14 is imposed at 40 °C. Mass/dilution and inert-impurity purity calculations use the stated molar mass and final solution volume. Excess-base mixtures subtract reacting amounts and divide by total volume before Kw.
- Weak acids use [H+] = sqrt(Ka c), c = [H+]²/Ka, Ka = [H+]²/c and pKa = −log10 Ka. Reverse questions intentionally reconstruct from the **shown rounded pH/pKa**, preserving the pupil's data rather than an undisclosed higher-precision value. Amount/volume, target mass, purity and preparation variants preserve the same approximation. Percentage dissociation uses initial concentration as denominator. Audits check less than 5% dissociation and less than 3% difference from exact equilibrium; an independent exact-equilibrium comparison also validates the sampled stems.
- Buffer making uses n(A−)/n(HA) = Ka/[H+], converts salt amounts to mass or stock volume, and preserves both positive components. Partial neutralisation solves x/(n0−x) for alkali amount; the final dilution does not change the amount ratio. Two-stock preparations enforce additive final volumes. Working includes an explicit recipe.
- Buffer calculations use concentration ratios or common-volume cancelling amount ratios. Partial neutralisation subtracts OH− from HA and produces equal A−. Strong acid addition increases HA and decreases A−; strong alkali does the reverse. Recipe-deviation asks for an **absolute** pH difference and explicitly rounds the final answer to 2 d.p. Partial-buffer Ka reconstructs the buffer amounts from visible volumes/concentrations and shown pH.
- Dissociation equations and HCl + NaOH → NaCl + H2O conserve atoms and charge. Buffer equations A− + H+ → HA and HA + OH− → A− + H2O conserve charge and the represented acid/base components. Ionic charges, two hydroxides, conjugate ions, and water are retained. These are calculation equations with source notation; state symbols are not newly inferred.
- Ka has mol dm−3, Kw has mol² dm−6, concentration/amount/mass/volume/percentage units are retained. pH/pKa are dimensionless. All required source values are finite and non-negative. pH uses 2 d.p.; other responses use 3 s.f. unless exact. Numerical acceptance preserves the source tolerance windows (0.0051 for 2 d.p.; 0.51 of the final retained significant-place unit), without requiring a textual count of significant figures that the original did not require.

## Learning support and assessment

Audience: OCR A Level Chemistry A U6 pupils who know amount/concentration, stoichiometry, logarithms and acid–base equilibria. Measurable objectives: calculate pH or concentration using the appropriate strong/weak/buffer expression; reconstruct amount/concentration after dilution or neutralisation; calculate a preparation quantity or purity from stated data; show the intermediate reasoning independently before progressing to final-answer/application levels.

Level 1 exposes the complete source sequence of intermediate quantities as independently marked required response parts. Level 2 uses the same core families but asks for only the final quantity. Level 3 retains the thirteen application templates with preparation, purity, excess-reagent or buffer-composition reasoning inside one final response. These differences are preserved; the level-1 guide is built-in support, never recorded as a requested hint.

Every required answer and complete source worked line is retained. Marks count source numerical fields equally: all correct maps to 1, any correct to 0.5, none to 0. Wrong finite numbers are assessable; empty/malformed numerical input is incomplete and creates no assessment. Standard form is accepted as e notation, ×10 notation or superscript exponent notation. Corrections pass through the shared automatic correction check and cannot replace first evidence.

Historical AB/ABL questions reproduce all 33 frozen source fixtures and are explicitly described as review. Historical identities are rejected in current selection. The provider exposes only the five current gems; hidden Ka/pKa and titration are not active acid targets. The shared catalogue/import owner remains responsible for excluding old progression from current mastery.

## Evidence

- `adapter-results.json`: 38 templates, 63 routes, 378 six-seed identity/source roundtrips, 660 numerical parts, all33 historical fixture matches, exact original38 idle allowances, correct/wrong/partial/incomplete/notation/tolerance cases.
- `chemistry-reference.mjs`: independently reconstructs every template from pupil-visible data (retains original independent assertions unchanged, changes only the module loader). Passed 38 templates / 228 questions / 2936 assertions.
- `source-extraction.json`: original hashes and exact transformation boundaries; no old page/app controller, DOM, storage or saving code.
- `ordinary-browser-results.json`, `render-bank-results.json`, `RENDER-REVIEW.md`: actual production interactions, all63 desktop/mobile route layouts and manually inspected chemistry screenshots. Genuine native timing is a separate A07/foreman gate after retained Chrome GPU launcher failures; headless checks do not substitute for it.
