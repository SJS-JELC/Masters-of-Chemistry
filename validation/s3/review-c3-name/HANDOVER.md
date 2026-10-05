# A07 independent review: C3L6 B(iii) name versus structure

## Disposition

**PASS: approve the exact model qualification in [wording-disposition.json](wording-disposition.json).** The displayed chemistry is internally coherent. Its identification as gyromitrin is incorrect. A truthful label and teacher explanation preserve the retained hydrolysis exercise, its answer demand and stable identities. A16 owns implementation after parent acceptance; this reviewer changed no runtime/source file. This PASS is the review disposition, not S3 acceptance or proof that integration has already happened.

## Chemical evidence

The protected SVG depicts an imine carbon attached to **two methyl groups**, an N-N bond, and an N-methyl/N-formyl group. Its metadata explicitly records `CC(C)=NN(C)C=O`. The copied new SVG has identical bytes. Manual inspection of the retained full B(iii) reaction and isolated structure confirms this topology; no hidden hydrogen, charge or clipping explains the mismatch. The mobile review render remains legible.

The independent supplementary RDKit checks give:

| Species | Formula | Nominal Mr | Complete-hydrolysis carbonyl product |
|---|---|---:|---|
| Retained drawn model `CC(C)=NN(C)C=O` | C5H10N2O | 114 | Propanone, C3H6O, 58 |
| Gyromitrin `C/C=N/N(C)C=O` | C4H8N2O | 100 | Ethanal, C2H4O, 44 |

PubChem CID 9548611 directly reports the second structure, formula and molar mass 100.12 g/mol. Its identifier describes an ethylidene rather than isopropylidene group. This independently resolves the naming mismatch. [Primary PubChem record](https://pubchem.ncbi.nlm.nih.gov/compound/Gyromitrin), accessed 3 October 2026.

For the retained model, hydrolysing C=N gives propanone plus the N-methyl/N-formyl hydrazine intermediate. Hydrolysing its formamide group gives methylhydrazine and methanoic acid. Existing D/E/F graphs independently sanitise and agree with their stored SMILES, formulae and masses. E and F retain the source-accepted interchange. Complete hydrolysis conserves each element and zero net charge:

`C5H10N2O + 2 H2O -> C3H6O + CH6N2 + CH2O2`

Nominal mass check: `114 + 36 = 58 + 46 + 46 = 150`. Water in the exercise is a reagent label, not a specified coefficient for the complete hydrolysis. Authentic gyromitrin would instead give `100 + 36 = 44 + 46 + 46 = 136`. Mr is dimensionless; PubChem's reported molecular weight is quoted in g/mol and is not substituted for a nominal Mr.

## Exact wording and preservation rationale

Use **“Hydrazone model compound”** for students and the full context/alt supplied in the JSON. The student label deliberately does not say “propanone-derived”, which would supply the answer to D. Remove the fungal-toxin claim for this drawn model. Qualify any reused “natural products” introduction or original question raster if shown; the current live context alone is not sufficient if another public surface repeats the old claim. The protected historical sources and copied bank provenance may retain the inherited label as explicitly historical material.

The teacher explanation identifies the drawn model and real compound distinctly, links the primary record, and records that the exercise preserves the original drawn model/masses/answers. Preserve the SVG's paths, measured Comfortaa Bold glyphs and geometry; only the copied public title/desc wording needs correction if it remains served. Keep the protected source SVG untouched and record the later public metadata fingerprint separately.

This is a bounded accuracy correction because no atom, bond, answer, mass, marking rule, dependency or saved-completion identity changes. The displayed exercise remains a functional-group and mass reasoning task in the Olympiad strand. Presenting the actual named compound instead would change D and the reagent structure/Mr, introduce E/Z representation considerations, and require parent/root disposition plus a new identity under the project's question-preservation rule. That alternative is recorded, not implemented.

## Provenance limits

The original paper and historical chemical-review artifacts were not recovered. This review establishes a mismatch in the **retained digitised material**, not an error in an inspected official Cambridge paper. It does not establish whether the depicted analogue is naturally occurring or toxic, and makes neither claim. No cloud placeholder was hydrated. The existing Python 3.13.5/RDKit 2025.09.1 environment was used for read-only supplementary invariants; no managed regeneration, package install, asset regeneration or font substitution occurred.

Primary retrieval initially failed through web open and PUG REST, and PowerShell's PUG request could not connect. The web search tool subsequently returned the parsed primary record with the exact descriptors. These failures and the successful retrieval method are retained in `primary-evidence.json`; they did not prevent a primary-backed conclusion.

## Verification and outputs

- `check-invariants.py` / `invariant-results.json`: independent narrow graph/formula/Mr, elemental and charge checks, PASS.
- `render-source.mjs` / `render-results.json`: pinned root Playwright 1.62.1, headless installed Edge 154.0.4258.48; valid XML, source/copied byte match, no page errors, PASS.
- `source-biii-desktop.png`, `source-structure.png`, `proposed-model-mobile.png`: manually inspected. Review-only layout; the proposed mobile wording render is not a live-host integration claim.
- `fingerprints.json`: eight protected/current inputs at review time. Protected SVG SHA256 `bb82e202a8571b0e9b43933a08bad83204e4b9fc9de3afb498fbf1893137cf1b`; current SVG matches exactly. Protected panel SHA256 `ff8e44d740f178a792511df92561645c5c4ec2c249cb058d7fb9702d53f572f7`.
- `accept-review.mjs` / `verification.json`: hashes still equal at completion, JSON parse/required evidence checks, PASS.

Commands from the project root: `python -B validation/s3/review-c3-name/check-invariants.py`, `node validation/s3/review-c3-name/render-source.mjs`, then `node validation/s3/review-c3-name/accept-review.mjs`. All review outputs belong solely to `validation/s3/review-c3-name/`; native foreground ownership stayed with A06. Requested model/effort remains Sol 6.1 High; actual settings/usage are not exposed and are not inferred.
