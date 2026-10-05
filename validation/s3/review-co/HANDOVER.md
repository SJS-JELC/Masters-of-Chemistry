# S3 independent CO depiction review

**PASS — one missing carbon formal-minus vector is corrected.** Import `reviewedMethanolSynthesisSVG` from `src/chemistry/thermochemistry/reviewed-co-svg.ts` only for the methanol-synthesis reaction image. A12 owns provider integration and its activity checks; root owns stage acceptance.

## Finding

The inherited full reaction screenshot displays O-positive triple-bonded to an uncharged carbon. Its first molecule group contains three triple-bond paths, one carbon glyph path, one oxygen glyph path and one oxygen-positive path; it contains no carbon-minus path. It is a genuine absent mark, not clipping. The project SVG matches the protected original byte-for-byte. The original data file fingerprint is `7d12bd91a5565e6bb42ef9c3b297e4b64e76889c6a86315ea686051202b49c59`; its methanol SVG fingerprint is `8290640db0821f819075df57ea3d85f2828fdb9139aa8721ef3e85a0802d4da7`.

The source generator's methanol reaction explicitly uses `[C-]#[O+]` for neutralCO (`scripts/build_bond_enthalpy_generator.py`, reaction at110–112; charge conservation at215 and324–327). Manual chemical review confirms that a triple bond with one lone pair on each atom gives formalC− andO+, netzero. CO+2H₂→CH₄O conserves C/O/H and charge. This correction restores the existing intended species, so it changes no question identity, equation, answer, marks or bond-energy calculation.

## Correction

The corrected SVG adds exactly one `path` inside the original CO group, classified `atom-0` and `data-reviewed-charge='carbon-minus'`. The path copies the rounded horizontal bar from the existingO+ glyph, omits its vertical arm and shifts it127.2 SVG units to maintain the same4.3-unit atom-to-charge gap beside carbon. It occupies localx191.3–201.9/y73.2–75.5 within the220×165 molecule box. Every existing path, font reference, glyph outline, viewBox, transform, atom, bond, hydrogen, coefficient and arrow is preserved. Removing that exact new element recovers the original SVG byte-for-byte.

Corrected SVG SHA256: `02de76dd4029588cd04a591c7bb514fb2b6103f5ce96239e24543ec5babae2eb`. The exported string and retained `reviewed-reaction.svg` agree exactly. Original/copied data remains untouched.

This is a reviewed deterministic vector correction. It is **not** full molecular regeneration with the unavailable exact managed chemistry profile. Historical existing glyphs retain their RDKit2026.03.5 provenance. Python3.13.5/user-site RDKit2025.09.1 was used only for supplementary read-only molecular invariants and XML parsing, with `-B`; no installations, global asset writes or new depictions occurred.

## Checks and rendered inspection

`chemistry-check.json` confirms sanitizedCO formula, explicitC−/O+, netzero and triple bond; H₂ andCH₄O formulae/atoms/bonds; balanced reaction; valid original/corrected XML. Source bond totals1944−2063 remain−119kJmol⁻¹. `render-results.json` confirms no XML/browser errors, one new charge vector and the original883×190 viewBox.

I inspected `desktop-before-after.png`, `reviewed-full-reaction.png`, `mobile-full-reaction.png` and `mobile-co-charge-detail.png`. Both formal charges are distinct, correctly placed and unclipped; the triple bond and all product/reactant geometry remain legible. The mobile test is390 CSS pixels with a358-pixel reaction image and DPR2; the new minus occupies about4.3×0.93 CSS pixels and remains visibly a separate superscript minus beside carbon. The path uses the existing charge stroke thickness, with no font substitution. Headless Edge154.0.4258.48/pinned Playwright1.62.1 performed the render and did not take A06's native foreground.

Exact old/new SVGs, script and screenshot hashes, manual inspection notes and original/copy fingerprints are in `provenance.json`. This bounded review does not reopen the other15 diagrams or claim their acceptance.

## Reproduction

From the new project root:

```powershell
node validation/s3/review-co/create-reviewed-svg.mjs
python -B validation/s3/review-co/check_chemistry.py
node validation/s3/review-co/render-review.mjs
node validation/s3/review-co/accept-review.mjs
```

The first command writes only the explicitly assigned new runtime SVG export plus this review's artefacts. It never replaces the original copied data. The last command gates the exact reviewedSVG fingerprint and existing retained validation; new or materially different render outputs require fresh visual inspection. Requested model/effort: gpt-6.1-sol/high. Effective settings and usage are not exposed. No children, deployment, original stores, root-control changes or unrelated runtime changes were used.
