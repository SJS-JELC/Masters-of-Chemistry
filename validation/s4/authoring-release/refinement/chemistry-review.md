# Runnable scaffold chemical review

A20,2026-10-03; requested Sol6.1 High, effective model/effort/usage not exposed. The CLI starter is explicitly DEV-only, derived from the previously checked teaching template rather than a new migrated source bank.

Final actual generated source: `development/authoring/families/dev-reviewed-starter/`. Earlier `dev-refinement-starter` remains unchanged with its startup probes. `generation-manifest.json` records the CLI template and output hashes; verification rejects hand-edited generated output. The generated data and calculation/marking functions are exact reviewed-template copies, with new `DEV-REVIEWED-STARTER-v1-*` IDs and adjusted imports. Generated provenance hashes the actual new data file and retains explicit OCR source references. It makes no claim that unchanged copied chemistry is newly extracted from OCR.

Consulted retained official OCR H4322016 archive extraction5.1.3(d),(f)(i), departmental OCR3.1May2026 map, and `docs/authoring/chemistry-review.md`. The inherited current full-PDF audit limitation remains. Audience/objectives and assumptions are in the generated authoring plan.

Fixed25cm³ of0.020mol dm⁻³ HCl diluted to250cm³ gives [H⁺]0.00200mol dm⁻³ and pH2.70. Generated concentration0.001–0.025mol dm⁻³ remains safely acid dominated; water autoionisation is negligible. Conservation of moles, consistent cm³ ratios, unitless pH and fully dissociated monobasic acid assumptions are explicit. Level3 inverses the12-significant-figure target pH to a final **total** volume, not water volume. Its error is below1e-7cm³ for every configuration, much smaller than3sf answer tolerance.

Each generated level has36 configurations; all72 were checked for conserved acid moles and inverse logarithms, source/code/seed/level restoration, full/partial marks, wrong predictions, incomplete/malformed values and valid units. The first template copy corrupted the unit fixture's UTF-8 `cm³`; correct marking rejected `cmÂ³`, and the retained failed fixture demonstrated why exact encoding matters. Templates now use explicit Node UTF-8. No marking relaxation was made.

The two distractors diagnose concentration confused with dissociation and conserved moles confused with conserved concentration. Worked answers resolve both misconceptions. Level1 built-in scaffold is independent support; requested hints use shared assistance. Three-minute idle allowance, all three canonical gem levels and source mastery settings remain unchanged. No molecules/mechanisms/RDKit outputs or unsupported extension claims were introduced.

The final real generated-host browser passes all seven substantive groups after the independently reviewed initial DOMContentLoaded wait adjustment; timeout, profile length and all substantive assertions are unchanged. Chemical and typed-source gates pass independently of that startup exception. Unclassified original cold stalls and the warm-cache limitation remain explicit.
