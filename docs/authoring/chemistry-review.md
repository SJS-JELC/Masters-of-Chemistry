# Independent authoring chemistry review

Reviewer: A20, requested Sol6.1 High; actual model/effort/token usage are not exposed. Review date2026-10-03. This is a new DEV proof, not migrated content or a comprehensive curriculum audit.

## Authority and objectives

Consulted retained official OCR H4322016 archive extraction `resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json`, section5.1.3(d) (pH and inverse expression) and5.1.3(f)(i) (strong monobasic acid calculations). Consulted the departmental specification map, reviewed2026-09-10 against OCR3.1 May2026, which places strong-acid pH/dilution within5.1.3. The current large official PDF was not independently reread in full; the inherited S2 limitation remains explicit. No invented assessment-objective identifier is supplied.

Audience: U6 pupils who know concentration, conservation of moles, logarithms and strong/weak acid meaning. Measurable objectives: calculate diluted hydrogen ion concentration and pH; explain dilution's concentration effect; invert target pH to design a final total volume. Level1 scaffolds dilution/logarithm, level2 removes built-in support, level3 reverses the calculation in a technician application.

## Chemical review

- Aqueous HCl is a strong monobasic acid. The illustrative ionic equation `HCl(aq) → H⁺(aq) + Cl⁻(aq)` balances H, Cl and net charge; it uses the conventional aqueous H⁺ shorthand at this level.
- The generation range gives final hydrogen ion concentration0.001–0.025mol dm⁻³, pH about1.60–3.00. Water autoionisation is negligible in this range. Concentrations, not activities, follow the explicit A-level ideal-solution convention.
- Dilution conserves acid moles. Both volumes usecm³ consistently in a ratio; no missing1000 conversion remains. Final volume is a total volume, not water added. This distinction is explicit in the level3 prompt.
- pH is unitless. The logarithm's argument uses numerical concentration relative to1mol dm⁻³. A dilute acid remains strong because strong refers to dissociation, not concentration.
- Level3 supplies12-significant-figure target pH; independent numerical checks show inverse calculation differs from the intended volume by less than1e-7cm³. The given precision is far beyond the required3sf answer, and its treatment as exact is explicit.
- Fixed answer:0.020×25/250=0.00200mol dm⁻³, pH2.698970…→2.70. Both generated levels have36 distinct input configurations, all programmatically checked for conserved moles and inverse logarithm consistency.
- Distractors diagnose dilution mistaken for reduced acid strength and conserved moles mistaken for conserved concentration. Each is unambiguously wrong under the stated assumptions. The teacher answer addresses both misconceptions.
- No molecules, RDKit structures, mechanisms, stereochemistry or unsupported extension claims are introduced.

Tests check all72 generated level/configuration cases plus the fixed question, meaningful wrong/partial answers, malformed input, duplicate choice, seed limits and restore/code identity. Screenshots of the actual catalogue/player, fixed correction, teacher and level3 revision models were visually inspected for readable formulae, coherent feedback and390px rendering. First marks and timing are tested through actual controller/repository; shared code hashes and source ownership attribution are retained separately.
