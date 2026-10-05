# Explaining Properties

Approved addition, 4 October 2026. `bank.ts` is the source for exactly 32 questions:
eight gaps and eight select-and-correct explanations at each of Levels 1 and 2.
Permanent explicit `EBP-XXXXXX` codes reproduce fixed content. Bank order is never
an identity. No temporary review code is stored or resolved.

## Curriculum and learning

OCR Chemistry A specification Version 3.1, May 2026, retrieved in the retained
departmental audit on 4 October 2026. Scope: 2.2.2(a), (b), (c), (f).
Audience: Lower Sixth, after ionic bonding/ions and before quantitative lattice
or hydration energetics. Supplied water partial charges support introductory
dissolution without assuming a separate polarity lesson.

Learners should describe/complete an alternating ionic lattice, explain high
melting and boiling points using strong electrostatic attractions and energy,
explain solid/molten/aqueous conductivity using fixed/mobile ions, describe
dissolution and qualify ionic solubility, infer a giant ionic structure from
supplied evidence, and compare covalent bond strengths from supplied average
bond enthalpies. The two supplied bond enthalpies are hypothetical teaching data.
There are no reaction-enthalpy calculations, metallic/molecular comparisons,
quantitative hydration/lattice cycles or extension learning outcomes.

## Sources and chemistry review

Primary reference is
`development/alevel/validation/electrons-bonding-audit-20261004/official-specification-scope.json`
(SHA-256 `df0c62e0dcb1f189546464b48abb8ac2a1a73ec5d660d135d994865ab5e52a97`).
Retained accepted atlas records are in the workspace
`resources/a-level-past-paper-atlas/data/aggregate.json` and copied narrowly to
`validation/explaining-properties/atlas-source-review.json` for review.

| Demand | Reviewed atlas evidence | Adaptation boundary |
| --- | --- | --- |
| Fixed/mobile ions in solid/aqueous BaCl₂ | OCR_2017_JUN_H032-02_Q01_P_B_I | Only ionic conductivity; no qualitative-analysis/hydrate question |
| Infer giant ionic lattice from solid/liquid conductivity | OCR_2020_OCT_H032-01_Q22_P_B | Supplied unfamiliar compound, no bromine synthesis |
| Alternating Ca²⁺/O²⁻ lattice fragment | OCR_2019_JUN_H032-01_Q21_P_D_III | New deterministic accessible diagram, complete element and charge for each blank |
| Alternating 2+/2− species in a lattice | OCR_2022_JUN_H032-01_Q23_P_A_II | Corroborates lattice demand; CaO replaces supplied MgS |
| Ionic properties/strong attractions/energy | OCR_2018_JUN_H432-03_Q01_P_B | Ionic portion only; molecular comparison omitted |

These are original teaching adaptations, not reproduced full OCR questions or
OCR mark allocations. Solubility and qualitative bond ranking are
specification-authored because the audit did not select clean direct atlas items
for those demands. Each record retains that distinction. Historical audit
recommendations for a three-level bank do not override the approved two levels.

Author review checked every full corrected sentence: ions rather than discrete
NaCl/Ca₄O₄ molecules; attractions rather than repulsions; strong attractions and
energy for melting/boiling; fixed ions in solids and mobile ions in molten/aqueous
samples; correct K⁺/Cl⁻ water orientation; separated ions surrounded by water;
some ionic compounds soluble, sparingly soluble does not exclude ionic structure;
larger average bond enthalpy means stronger covalent bond/more energy per mole;
ionic attractions act throughout the lattice in all directions. CaO labels and
the eight-ion fragment were visually checked. Independent review/final acceptance
is a separate root-owned gate.

## Marking and platform

One mark per gap. Corrections award one mark for the single correct segment and
one for an accepted replacement **conditional on correct selection**. Complete
wrong answers receive zero or partial marks, freeze the first response and end
independent timing. Incomplete or malformed input is not assessed. Equivalent
phrases are explicitly curated; typography/case/whitespace/charge superscripts
normalize, with no keyword, substring or fuzzy matcher. Missing charges, negated
answers, electrons for ionic conduction, and vague “free ions” are rejected.
`workedAnswer` and first-assessment feedback give the full corrected explanation.

The shared QuestionPlayer renders ordinary text parts as optional inline sentence
tokens; the correction control reuses CorrectionSegments and shared actions.
No attempt, storage, scheduler or timer implementation is added. Three-minute
idle allowance (180000 ms), first evidence and A-Level score mapping (0, 0.5, 1)
use existing algorithms. Requested support and teacher preview create no new
independent evidence. Teacher catalogue exposes all 32 questions.

Gem `l6-t2-1-properties` is the fourth displayed position, Levels 1 and 2,
half-life 3/3 and strictly-greater 0.8 mastery threshold. Historical
`l6-t2-1-4` remains an alias of Dot-and-Cross `l6-t2-1-3`; no legacy history seeds
the new gem. Both standalone and revision use the same registration/player.

## Regeneration and evidence

From the project directory:

```powershell
node validation/explaining-properties/register.mjs
node scripts/write-catalogue-definitions.mjs
node scripts/test-explaining-properties.mjs
node node_modules/typescript/bin/tsc --noEmit
node scripts/build.mjs
node scripts/release-s4.mjs alevel
node scripts/release-s4.mjs igcse
node scripts/verify-explaining-properties.mjs
```

Browser harnesses, before snapshots, chemistry review, current checks, failures
and superseding results live under `validation/explaining-properties/`. No
publication is authorised. Native background/lifecycle capability must be judged
from observed browser events; command success alone never establishes it.
