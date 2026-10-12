# IGCSE extracted atlas remap — full local review

Stage RF-S2-ATLAS-FULL. A03, Sol 6.1 High. Root accepted the 12-record pilot on 10 October 2026; its dispositions are carried forward unchanged. Full remapping and verification are complete, awaiting root final acceptance. Original atlas inputs are read-only. Only accepted extracted JSON, summaries, context, mark points, recall tags and pattern briefs were read; no source PDFs, mark schemes or images were opened.

## Full results and working view

2,322 records and 4,320 marks preserved. All 1,001 candidate flags received evidence-based dispositions using reviewed source-pattern rules, context/supplied tags and explicit exceptions. 76 primary reassignments, 15 secondary additions, 2,224 retained originals and seven unresolved records with exact original maps. Formulae (16.1): 11 primary records / 23 marks, three secondary records. Equations (16.2): 65 / 89, fourteen secondary records. Secondary marks remain zero.

Open [the local review view](view/index.html), or use the app’s local preview route `/recall-formulae-atlas/`. The public view sources live under `public/recall-formulae-atlas/`; they are author-owned HTML/CSS/JS. The generator supplies their data/exports and the relative local-view wrapper. No deployment was performed. Filters cover primary/secondary gems, empirical bands, separate teaching bands, dispositions, candidate flags and text; records expand to retained answers, qualifications, page references and fingerprints.

Derived outputs: `full-overlay.json`; reviewed deterministic configuration `full-rule-review.json`; `derived/{atlas,gems,patterns,briefs,view-data}.json`; `derived/records.csv`. Complete JSON/CSV downloads are linked from the view. Source pattern IDs and brief text/examples stay unchanged; effective gem membership/counts are regenerated. Each derived record’s historical `classification` remains verbatim, including its original primary ID; effective mapping is in the record’s `primary_gem` and `remap`.

Full evidence: `validation/recall-formulae/s2/atlas/full-validation.json`, `full-invariants-and-chemistry.json`, `stratified-sample.json` (25 substantively reviewed records, including all seven source limits), `browser-view.json` and desktop/mobile PNGs. The retained browser failure caught mobile select-width overflow; final checks and rendered inspection pass after the fix.

```powershell
node scripts/recall-formulae-atlas-full.mjs
node scripts/recall-formulae-atlas-full-verify.mjs
node scripts/recall-formulae-atlas-browser.mjs
```

Source file links keep recorded paths and point to the known original atlas root with page anchors. They require locally available original files; sources were not copied/opened or availability-tested. Historical nitric-acid and formal-salt qualifications remain visible. The source proposals in regrouped briefs are not new activity model answers.

## Retained pilot methodology

## Pilot outputs and review

- `candidate-inventory.json`: every one of 2,322 stable records scanned, 4,320 marks. 1,001 broad candidate flags; 293 have a direct summary signal. Context/metadata/brief-only flags deliberately include supporting skills and excluded formula/structure/half-equation cases. Counts are triage, never mapping decisions. Different scan rules explain the difference from S0’s 298 preflight.
- `gem-boundaries.json`: fixed 16.1 Formulae and 16.2 Equations boundaries and separate teaching bands. It is an overlay catalogue; it makes no production catalogue change.
- `pilot-decisions.json`: editable 12-record substantive decisions and chemistry reviews.
- `pilot-overlay.json`: fingerprinted decisions, full original records/fields and source page links, proposed primary/secondary, extraction adequacy, original empirical classification, separate teaching applicability and intact mark ownership. 8 primary reassignments, 1 secondary addition, 3 retained originals; 23 marks counted once.
- `overlay.schema.json`: overlay data shape. The deterministic validator additionally checks corpus/record fingerprints, valid gem IDs, duplicates, original fields, marks and empirical-classification preservation.
- Validation in `../../../validation/recall-formulae/s1/atlas/`: generated conservation, source hashes, chemistry and negative invariant checks.

All selected pilot extractions were sufficient for their dispositions; mixed and borderline/excluded cases provide the required scope checks. No inadequate source was manufactured to fill a quota. An inadequate future case must use UNRESOLVED and retain both original mappings. Half-equations/ionic equations remain excluded from 16.2 even when they include state symbols. Ion charge recall/inference alone remains outside compound formula construction. Supplied-equation calculations receive no 16.2 secondary merely for using a ratio.

## Regeneration

From the app project root:

```powershell
node scripts/recall-formulae-atlas-pilot.mjs
node scripts/recall-formulae-atlas-verify.mjs
```

Scripts own only this project’s atlas outputs and validation. Generation rejects an unexpected source fingerprint. Pilot regeneration does not perform a full remap. Verification includes six ionic lowest-charge ratios, nine equation atom balances (including hydrate water multiplicity), the excluded lead half-equation charge check, and invalid fingerprint/duplicate/gem/mark/band/inadequate-evidence cases. State choices, assessed operation, mixed-subpart interpretation and historical allowances were reviewed substantively and recorded per pilot entry.

## Fingerprint and preservation policy

The byte SHA256 of `resources/igcse-past-paper-atlas/data/atlas.json` is 9dec13f39318df5d0fe3b2053d391f438db47001ff7e6b6ad354925a6eb2ae4b. Record, boundary catalogue and decisions fingerprints use canonical recursive JSON: sorted object keys, ordered arrays, UTF-8 SHA256. Record arrays and original source fields are never rewritten. Each record fingerprint includes the complete accepted extraction and original classification. Input, catalogue or decision changes invalidate the affected overlay’s validation; regenerate and review affected dispositions. No model confidence substitutes for validation.

Existing classification.band, calculated_band, facilities, score bounds, source rows, flags, method and caveats are preserved verbatim in the overlay. Teaching band is a separate annotation; it does not change empirical difficulty. In particular the ammonia/HCl state item remains empirically Grade 9 while state-symbol teaching applicability is 5–6. Whole marked records stay intact; secondary marks are always zero.

## Derived generator architecture after the root gate

1. Root acceptance must identify this pilot source, catalogue and overlay fingerprints. The full generator refuses missing/stale acceptance. The full generator verifies the acceptance, source, pilot overlay and catalogue fingerprints before writing.
2. Triage direct-operation patterns first, then broad flags for meaningful exceptions or missed candidates; assess the accepted extracted evidence. Deterministic pattern rules can group identical operations, but product-supplied status and mixed marks govern individual disposition. Retain inadequate/ambiguous records explicitly; never infer unavailable evidence or reopen sources.
3. Store full decisions separately in a stable `full-overlay.json`, linked by record ID/input hash. Do not replace original atlas files. Apply only primary_gem, secondary_gems and mapping rationale to a project-owned working record projection; keep original mapping/pattern/classification provenance. Maintain the empirical band exactly.
4. Rebuild derived gem/paper/band counts and marks from effective primary assignments across all 2,322 records. Keep source patterns stable; attach effective primary groups and source pattern IDs rather than inventing chemistry briefs. Regroup brief index by effective gem, retaining source brief text/examples and provenance and flagging mixed families. Secondary membership must never add to primary mark totals.
5. Export a compact project-owned remapped `derived/atlas.json`, gem summaries, regrouped brief index and CSV records (ID, paper/pages, marks, source/effective mappings, empirical band, separate teaching band, disposition and rationale). Working view `view/index.html` consumes only this derived data: gem filters, counts, original/proposed comparison, unresolved filter and source links. It is local review content, outside the app runtime registration/release. The foreman owns any app integration.
6. Final deterministic gates require complete stable-ID coverage, no duplicates, 4,320 primary marks, valid IDs/current fingerprints, unchanged extraction/provenance and empirical bands, no fabricated splits, explicit unresolved cases, rebuilt summary agreement and unchanged original source hash. Review a documented stratified final sample substantively and inspect the local working view before acceptance.

The accepted pilot gate was satisfied before full derived outputs were generated. Root final acceptance remains separate.
