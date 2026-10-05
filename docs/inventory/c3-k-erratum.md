# C3L6 K hydration source erratum

> Evidence retirement (5 October 2026): historical validation reports, screenshots and acceptance records were deleted by user request after executable dependencies were migrated. Remaining `validation/` path names and past test counts describe historical records, not present files or fresh acceptance. See [validation cleanup](../maintenance/validation-cleanup.md).

Decision: S5-FIX-C3-K-ERRATUM, authorised by root through A01, 2026-10-03.

The inherited bank contains two K graphs with the same formula C₂H₄O₄ and nominal Mr 92. H is glyoxylic acid, O=CC(=O)O. The current task asks for H + H₂O ⇌ K. The accepted product is the aldehyde hydrate, O=C(O)C(O)O (2,2-dihydroxyacetic acid). The second source graph, O=CC(O)(O)O, retains the aldehyde and converts the carboxyl group into C(OH)₃. It depicts a hypothetical orthoacid, rather than the conventional aqueous aldehyde hydrate for this reaction. Formula, mass, valence and source-isomorphism checks pass for both graphs and cannot establish the intended chemistry.

The historical independent primary-source evidence and substantive review were recorded in CHEM-03 (retired historical evidence; former path `../../validation/s5/chemistry/chem-03.json`). That evidence cites the [IUPAC orthoacid definition](https://goldbook.iupac.org/terms/view/O04331) and [primary aqueous glyoxylic-acid research](https://pubs.acs.org/jpcafh/article/120/21/3817/1332886/Aqueous-Photochemistry-of-Glyoxylic-Acid). The historical exam paper and draft report were not recovered; no claim is made that the exam itself supplied the erroneous alternative.

## Retention and current policy

The extracted bank JSON, original source JavaScript, assets and provenance are unchanged. Stable IDs, seeded graph coordinates, formulas, masses, E/F interchangeability, both G alternatives and dependencies are preserved. The original 23 graph alternatives remain inspectable as source evidence. An authored TypeScript projection supplies 22 current accepted alternatives; K has only the aldehyde hydrate. The policy also refuses the orthoacid when a caller supplies a challenge built from the raw source bank. Teacher review shows the rejected graph only in a clearly labelled source erratum, separately from accepted reference structures.

## Saved completion and import

A structurally valid native saved record that previously passed K with the orthoacid keeps its exact original answers, drawings, histories, checks and completion inside `historicalOutcome.raw`. Its current K result becomes zero; B and dependent C completion revalidate to false. The view distinguishes the historical outcome from current validation. Navigation, subsequent saves, correction and confirmed Restart preserve the historical snapshot. Restart clears current challenge drawings and completion. There is still one separate Olympiad row and no curriculum evidence.

The optional snapshot has a closed source-policy identifier and erratum reason. Its type forbids nested history; repository validation rejects nested snapshots, another profile/course/activity, unknown identifiers, corrupted graphs, stale fingerprints and invalid dependencies. It applies every existing structural check to the raw snapshot. Existing historical snapshots are retained without rewriting them.

The historical v1/v2/v3 parser still recognises the original source-bank signature. It rejects any claimed completion inconsistent with the current chemistry, including wrong K. The existing import planner retains the exact rejected raw input and reason. Missing historical fields remain reported; no historical evidence is invented.

## Verification

Historical evidence was recorded under the bounded fix folder (retired historical evidence; former path `../../validation/s5/fixes/c3-k-erratum/HANDOVER.md`): a full port of all seven original S3 test groups, three additional chemistry/history groups, positive and negative type fixtures, source fingerprints, exact diffs, desktop/mobile browser results and screenshots. Retained executable S3 fixtures preserve source behaviour; their old report files were retired. the S5 record explicitly supersedes their unqualified acceptance of K alternative 2. A22 historically provided chemistry acceptance; A21/A23 provided storage/import/view acceptance. Their retired reports do not establish fresh acceptance. Run `node scripts/test-s5.mjs` for retained regressions and conduct fresh chemistry/browser review after substantive changes.
