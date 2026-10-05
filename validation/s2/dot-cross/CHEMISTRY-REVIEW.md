# S2 dot-and-cross chemistry and source review

Owner: A10, requested GPT-6.1 Sol / High. Effective model/effort and token usage are not exposed to this worker. Reviewed 3 October 2026. Bank content and chemistry source were read from the protected active A Level app; no original file, dependency, build or browser store was modified.

## Curriculum and objectives

The retained OCR evidence is `resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json`, section 2.2.2. Its archived specification text explicitly covers ionic dot-and-cross diagrams at (a), and molecular/ionic single, multiple and dative covalent bonding at (e). The repository `resources/curriculum/ocr-a-level/a-level-specification-map.md` maps the original gems 3–4 to 2.2.2(a–f). The evidence's current-authority limitations remain unchanged; this migration is not a new formal coverage audit.

Objectives: construct a spatial outer-electron diagram; distinguish original electron sources; account for shared/non-bonding electrons and total charge; represent whole polyatomic ions with brackets; distinguish coordinate pairs from ordinary source pairs; recognise allowed incomplete/expanded central shells. Prerequisites: outer-electron configurations, simple ionic electron transfer, covalent pairs and formula interpretation. Levels are the exact source question routes, not invented new scaffolding.

## Complete bank and chemistry

All 91 records, explanations, reference diagrams, alternate origin diagrams and source metadata are byte-equivalent after JSON serialization to the protected source module. The pupil pool filters each level before deduplicating unnamed covalent examples by molecular formula. Teacher review exposes all 91, including named constitutional isomers. Original review codes are FNV-1a hashes of stable source IDs, not positions. The merged active gem is l6-t2-1-3; l6-t2-1-4 remains an accepted historical alias.

The 72 prerequisite/transfer records cover hydrogen/halogen diatomics, hydrogen halides, water/ammonia/methane and multiple bonds, C1–C3 organics and isomers, alkali/alkaline-earth/aluminium salts and hydroxides. Their inventories were checked against the original independent 72-entry textbook fixture, not against inferred outputs from the bank generator. Isomer tasks ask for the molecular formula alone; the worked diagram is explicitly one valid example, and other connected neutral duet/octet isomers retain the original graph validator. Hydroxide is bracketed as an entire O–H ion, not separate O and H ions. Salt ratios and total neutrality are conserved. Retained metal inner shells remain optional: Li+ has two electrons, other supported metal cations have eight. Empty former outer shells remain accepted.

The 19 A Level named species were reviewed individually:

| Species | Outer electrons | Chemical convention |
|---|---:|---|
| Peroxide ion; sodium and magnesium peroxide | 14 each | O–O single bond; three lone pairs on each O; two gained electrons; peroxide group charge −2; neutral salts contain appropriate metal cations. |
| NCl3; NF3 | 26 each | Three N–halogen pairs; one nitrogen lone pair; three terminal lone pairs. |
| SF2 | 20 | Two bonds; two sulfur lone pairs; terminal F lone pairs. |
| Nitrosyl chloride | 18 | N=O and N–Cl; one N lone pair; source origins remain attached to appropriate atoms. |
| Phosgene | 24 | O=CCl2; oxygen and chlorine lone pairs; carbon octet. |
| Hydrogen cyanide | 10 | H–C≡N and one nitrogen lone pair. |
| BF3 | 24 | Three bonds; boron sextet is deliberate and accepted. |
| Ammonium ion | 8 | Three ordinary origin pairs and a nitrogen-supplied coordinate pair; +1 whole-ion brackets. Bonds are equivalent after formation. |
| Carbonate ion | 24 | Source canonical O=C(O−)2 depiction; −2 charge; oxygen equivalences and retained gained-electron origin variants remain accepted. |
| Nitrate ion | 24 | Source single/double/coordinate-pair depiction; −1 charge; source atom equivalences and gained-electron variants remain accepted. |
| Tetrahydridoaluminate(1−) | 8 | Four Al–H pairs; additional-electron origin distinguished by third symbol; whole-ion −1 charge. |
| Sodium tetrahydridoborate | 8 | Four B–H pairs, third symbol for sodium-transferred electron; Na+ and BH4− groups. Correction/source evidence is retained unchanged. |
| PCl5 (gas) | 40 | Molecular species, five pairs around P: ten central-shell electrons. No assertion of ionic solid structure. |
| SF6 | 48 | Six pairs: twelve central-shell electrons. |
| SF4 | 34 | Four pairs plus one lone pair: ten central-shell electrons. |
| ClF3 | 28 | Three pairs plus two lone pairs: ten central-shell electrons. |

For every record, independently computed Σ outer valence electrons minus overall charge equals the reference count, and summed group charge equals the named total charge. Every reference marks correctly. Missing-electron alternatives are assessed as wrong for every record; dangling atom references are blocked as malformed, and an empty drawing is incomplete. Excessive oxygen valence is structurally valid but chemically wrong. Original substantive partial-credit rules are retained, so empty shared-pair or neutral-bracket criteria cannot create vacuous partial mastery credit.

The original independent A Level fixture additionally checks correct symbol permutations, atom renaming/order invariance, coordinate-pair incorrect alternatives, gained-electron variants, retained metal-shell origins and intentional central-shell exceptions. The pure chemistry engine is extracted unchanged; React, storage, timing and scheduling are absent from it.

## Provenance repair

The original `scripts/test_dot_cross_bank.js` refers to a missing `resources/past-paper-atlas/data/atlas.json`. The layout migration records the historic path from `outputs/igcse-paper-atlas/atlas.json`. The actual current locally readable corpus is `resources/igcse-past-paper-atlas/data/atlas.json`, identified by its accompanying README and full corpus records. The new-project port loads that real file and checks every referenced ID and observed band. It records the actual SHA-256 and corpus size in `atlas-provenance.json`. No classification or missing source was manufactured; the original test is untouched.

## Acceptance evidence

`reference-review.json` records all 91 per-record conservation/wrong/malformed/renderability gates. `coverage.json` retains exact teacher IDs, all pupil level pools, historical review codes and gem aliases. `source-fingerprints.json` retains six original module fingerprints and bank serialization hash. `activity.test.mjs` checks provider, identity/seed, source category cycling, wrong/incomplete distinctions and bounded semantic undo/restore. Ported source regression scripts retain the independent chemistry assertions.

Real-browser interaction and rendered acceptance are retained separately. Native idle/background timing is delegated to A07 by the foreman; it must not be claimed from headless browser focus emulation. Source-specific allowances remain three minutes at levels 1/2 and five at level 3; timing and first-evidence recording belong solely to the shared production controller/repository/scheduler.
