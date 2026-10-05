# A14 titration chemistry and curriculum review

Source authority: complete generated source `data.js`, `core.js`, `app.js`, `session.js`, original numerical tests and original answer-key version2. Exact SHA256 inputs retained in source-fingerprints.json. Repository OCR A Chemistry specification map identifies 5.1.3(n–o) for titration curves and indicators; inspected 2026-10-03. This is an implementation preservation review, not a new curriculum audit.

## Coverage and manual chemical reasoning

All TC01–TC36 are retained unchanged,18 Level2 and18 Level3. No Level1; source18-question cyclic progression and FNV-1a TC six-base36 teacher codes retained. Source prompts preserve quantities, reagent names, reverse direction, pKa, volume assumptions and explicit extension labels. TC19–TC24 retain the complete two-proton sulfuric-acid model expressly labelled extension, rather than claiming a realistic two-step diprotic curve.

Reviewed each of the36 retained reference rows and source prompt families:

- TC01–04 and TC25–27: ethanoic acid/NaOH rising curves. Initial weak-acid dissociation; acid/ethanoate buffer before equivalence; alkaline equivalence from salt hydrolysis; excess OH⁻ after equivalence. Phenolphthalein range lies within the computed steep interval.
- TC05–08 and TC28–29: strong acid/strong base rising. pH starts below7; equal equivalents gives pH7 at25°C; excess hydroxide concentration uses total mixed volume. Multiple listed indicators accepted when their entire transition ranges fit.
- TC09–12 and TC30–31: reversed strong base/strong acid falling. Initial pH from OH⁻; equivalence neutral; final excess H⁺ accounts for dilution.
- TC13–15 and TC32–34: strong acid/weak-base titrant. Equivalence acidic; final ammonia/ammonium buffer uses the conjugate-acid pKa and remaining ammonia/protonated-ammonia ratio. The curve and lower-pH indicator ranges are retained.
- TC16–18 and TC35–36: strong base/weak-acid titrant falling. Equivalence alkaline; final ethanoic-acid/ethanoate buffer ratio rather than a false strong-acid excess formula.
- TC19–21 and TC22–24: stoichiometric acid-equivalent factor2 on the starting acid or acid titrant respectively, under the stated complete-dissociation extension assumption. Both direction and equivalence-volume factor follow equivalent conservation.

Pure source charge-balance solver remains unchanged: hydrogen + positive counterions/protonated base balances hydroxide + negative counterions/deprotonated acid, with additive volumes and Kw. Weak-base parameter is the conjugate-acid pKa (9.25), not the base pKb. Deterministic80-step bisection gives full equilibrium throughout the curve, including buffer and salt regions. Continuous curve sections use extra near-equivalence samples and preserve a shared join. Deliberately wrong species/direction remains an assessable construction, not rejected as malformed.

## Marking and pedagogical distinctions

Six source criteria stay separate: before shape, after shape, initial pH, equivalence volume, final pH, indicator. Snapped numerical answers and exact source near tolerance retained. Full/some/no source matches map to mastery1/0.5/0. Valid indicator alternatives are accepted; phenolphthalein8.3–10.0, methyl orange3.1–4.4 and methyl red4.4–6.2, with original colours. The full transition range must fall inside the computed ±2% equivalence-volume steep interval, not merely contain the equivalence pH.

Equivalence is explicitly distinguished from an observed indicator end-point. Joining pH is calculated from chosen species; learners set pH anchors and equivalence volume rather than being asked to calculate salt-hydrolysis pH outside the original scaffold. Buffered regions and appropriate total-volume calculations are preserved. The new text names these assumptions without changing question chemistry.

Malformed state (nonfinite/out-of-bounds/off-step anchors or unknown selections) and missing species/indicator selections block an assessment. Valid chemical wrongness earns source partial/zero marks. First responses/timing/evidence are exclusively owned by the shared host; editor correction does not create independent evidence.

## Deterministic verification

Seven meaningful tests pass. All36 exact source objects, codes, answers and sampled rendered curves match the original. All36 have correct/wrong/incomplete/malformed fixtures, allowed-indicator alternatives, source timing600000ms, and response JSON roundtrips. Independently derived initial pH, final excess/buffer pH, equivalent volumes, charge balance at four volumes and monotonic/continuous source curves pass. The original reference tests were ported by changing imports only. An initial zero-score fixture accidentally used a correct weak-base after section; retained failed log and changed that fixture to the opposite direction. No engine or gate was weakened.

Rendered and interaction findings are retained separately in browser-results.json and HANDOVER.md once actual host verification completes.
