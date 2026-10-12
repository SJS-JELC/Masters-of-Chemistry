# Rate Equations

One curriculum activity, `alevel/rate-equations`, with four semantic gems at Levels 1, 2 and 3. Production practice/revision and the DEV preview import the same checked factories, marking and response controls. Twelve POC source question IDs remain authoritative; `RE-xxxxxx` codes are permanent display aliases only.

## Content and curriculum

| Gem | Learning objectives | OCR Chemistry A |
| --- | --- | --- |
| Orders & Rate Calculations | Deduce orders from controlled initial-rate comparisons; write the rate equation; calculate k, its units and changed rates. | 5.1.1(a–c) |
| Rate Graphs & Half-life | Calculate disappearance rates from tangent gradients; measure successive half-lives; calculate k and convert minutes to seconds. | 5.1.1(c–f) |
| Rate Equations & Mechanisms | Predict a rate law from a supplied elementary slow first step; select atom-balanced steps that sum to the overall equation and match measured orders. | 5.1.1(a,i) |
| Arrhenius & Temperature | Determine activation energy from a gradient; handle a scaled reciprocal-temperature axis; find the true intercept and predict k at a new temperature. | 5.1.1(k) |

These are the twelve checked POC questions, with seeded numerical variants, rather than complete coverage of 5.1.1. Practical-method questions, written explanations, rate–concentration graphs and a larger bank remain outside this integration.

Retained OCR evidence: departmental specification map version 3.1 (May 2026) and the official archival 5.1.1 extraction in `resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json`, consulted 12 October 2026. Integrated rate laws generate curves internally; recalling or deriving them is not a pupil requirement. The first-order half-life relationship and Arrhenius equations are supplied where appropriate. Complete source paths/hashes remain on every lazy question factory; the eager catalogue retains the OCR section reference.

## Identity and assessment

`identity.ts` lists the twelve allowed source IDs and four semantic gem IDs explicitly. Historical numeric rate gem IDs are not imported or redirected. Generated families restore from source ID, level and uint32 seed. Mechanisms are fixed: selection canonicalises the seed to 0, restoration requires 0, and the shared scheduler controls the level.

`rateMarking` accepts only complete valid shared responses. It checks numerical units/tolerances, exact choice sets and bounded semantic factor powers for typed laws/units. Allowed concentration species are declared by the source question; unknown species, including unknown zero-power factors, are rejected. Numeric answers with a supplied unit use the standard numeric response control. Mastery follows the shared 0 / 0.5 / 1 mapping, half-life 2 at each level, and a strictly-greater-than-0.8 threshold.

The five-minute idle allowance is retained for multipart tables, graph measurement, unit conversions and Arrhenius calculations. Shared attempt/timing/persistence owns evidence; factories, marking and controls do not write it. Analytical graph checkpoints are unmarked workspace support.

## Verification

From this app directory:

```powershell
node --test scripts/tests/rate-equations-content.test.mjs
node scripts/write-catalogue-definitions.mjs --check
npm.cmd run typecheck
```

The compact preservation fixture retains original answer models and exact fingerprints of 72 original examples, including both uint32 bounds. Focused tests independently check calculation relationships, unit conversion, all offered mechanism step balances and net equations, parser mistakes, identity/seed rejection, teacher coverage, semantic landing mapping and registry/mastery invariants. Browser/rendered, timing, persistence and final independent review are separate integration gates.
