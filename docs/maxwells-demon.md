# Maxwell’s Demon
Original three-part Olympiad extension in the combined React app, id `alevel/maxwells-demon`. No deployment or official past-paper claim. Introduction, C3 question-pane palette, unrestricted part navigation and confirmed Restart are retained. Challenge completion is saved separately from curriculum mastery, revision and timing evidence.

## Current classroom activity
Introduction is **Standard Enthalpies**, the authorised one-sentence opening and eight compact definitions with state-labelled equations: bond dissociation, formation, combustion, atomisation, vaporisation, solvation, hydration and solution. F₂(g)→2F(g) breaks one mole of F–F bonds; its specific dissociation is not an average across molecular environments. Half that equation is molar atomisation. Developer standard-state context: standard pressure100kPa, specified temperature298K here; elemental reference forms define zero formation enthalpy, not all phases/species of an element. Aqueous thermochemical values use the stated species and conventional standard-state activity. This context is retained here rather than added to the compact pupil reference. Developer curriculum context: OCR core links3.2.1(d),(f),(g–h),5.2.1cycle context; non-water solvation, vaporisation terminology and advanced fluorocarbon algebra are extension. The local OCR map was reviewed10September2026 againstv3.1May2026; no fresh direct official PDF verification is claimed.

Part(a), **Classify the Standard Enthalpy**, has eleven equations and eight named options, with no reaction catch-all. Select every applicable category with native pressed buttons; deselecting all is unanswered. Checked teacher key:

| Equation | Accepted categories and rationale |
|---|---|
| C(s, graphite)+O₂(g)→CO₂(g) | Formation + combustion: one mole of compound forms from reference elements and one mole of carbon burns. |
| H₂(g)+½O₂(g)→H₂O(l) | Formation + combustion: one mole of water forms and one mole of hydrogen burns. |
| Mg²⁺(g)→Mg²⁺(aq) | Hydration + solvation: aqueous hydration is water-specific solvation. |
| Na⁺(g)→Na⁺(solvated in ethanol) | Solvation: ethanol is not water. |
| KCl(s)→K⁺(aq)+Cl⁻(aq) | Solution: starts with solid, not gaseous ions. |
| Br₂(l)→Br₂(g) | Vaporisation: molecular phase change. |
| ½F₂(g)→F(g) | Atomisation: exactly one mole of gaseous atoms. |
| F₂(g)→2F(g) | Bond dissociation: one mole of F–F bonds, two moles of atoms. |
| C(s, graphite)→C(g) | Atomisation: one mole of gaseous atoms from the reference element. |
| C(s, diamond)+O₂(g)→CO₂(g) | Combustion: diamond burns, but is not the reference state for formation. |
| Na(s)+½Cl₂(g)→NaCl(s) | Formation: one mole of compound from reference elements. |

Check gives one aggregate count without individual correctness or worked answers. The two replacement questions have new IDs and inherit no old responses.

Part(b), **Hess’ hypothetical network**, assesses all twelve directed arrows with native text boxes placed on the map. Seven supplied data rows sit to the right when the pane has enough room, and below at intermediate/mobile widths. Narrower tinted translucent inputs lie directly over continuous arrows, with no visible direction labels; their accessible labels still give direction and ΔH units. The map retains a readable minimum width and horizontal focus scrolling. All values are hypothetical kJ mol⁻¹ per equation as written.

| Supplied conversion | ΔH |
|---|---:|
| A→B |−120|
| B→C |+40|
| A→D |−208|
| D→F |−3|
| F→E |+408|
| 2G→2E |+68|
| A→I |−101|

With H(A)=0: B−120,C−80,D−208,F−211,E197,G163,I−101. Every arrow equals destination minus origin.

| Arrow | Answer / kJ mol⁻¹ |
|---|---:|
| A→B |−120|
| B→E |+317|
| A→D |−208|
| B→C |+40|
| C→D |−128|
| C→F |−131|
| D→F |−3|
| E→F |−408|
| E→G |−34|
| F→G |+374|
| F→I |+110|
| I→G |+264|

Accept signed integers/decimals/fractions and Unicode minus. Reject empty, invalid expressions and zero denominators. Check colours correct borders green and wrong/blank borders red, with nonvisual correctness descriptions. It does not fill answers or show per-field prose. Any edit removes the whole part assessment and colours.

Part(c) begins with the authorised perfluorodecalin paragraph, without a part/formula heading. Its centred enlarged reaction wraps between whole species on mobile:
C₁₀F₁₈(l)+9H₂O(l)+5½O₂(g)→10CO₂(g)+18HF(aq).
Ten table rows a–j show proper standard Δ/subscript/H° notation. Supplied a−3467,b43.3,c−285.8,d−393.5,e−273.3,f−61.6,g716.7,h157,i325 are unchanged; j is a separate unknown display row marked ?, never0. Nine compact native coefficient inputs sit immediately before symbols a–i and wrap only with their whole term. The final j input is followed by kJ mol⁻¹. Signed numbers/fractions including Unicode minus are accepted. Local c input/paste syntax admits temporary minus, decimal point and incomplete fraction while editing, preserves deletion/caret/selection; letters and arbitrary expressions are rejected at entry. Complete assessment uses the strict parser, so incomplete values/zero denominators receive no credit. Map inputs remain unchanged.

Checked teacher answer (documentation only): eleven C–C and eighteen C–F bonds give
j=(a−b+9c−10d−18e−18f+10g+9h−11i)/18.
Coefficients a+1/18,b−1/18,c+1/2,d−5/9,e−1,f−1,g+5/9,h+1/2,i−11/18.
j493.65≈494kJmol⁻¹; existing0.6 result tolerance is retained. Liquid formation is10d+18(e+f)−9c−a; add b to obtain gas formation, then subtract it and11i from10g+9h before dividing by18. The supplied i is a mean C–C approximation, not a claim that every C–F bond is identical or that thermochemistry establishes kinetic inertness. Check gives aggregate count only; teacher preview displays canonical fractions/numbers without worked prose. The non-solution Hess route/count hint remains. No runtime worked answer or reveal action exists.

The current total is33 questions:11+12+10. One checked count reads, for example, “8 / 11 questions correct”. No duplicated command count or completion slogan. Bottom Next part appears on(a)/(b) only after all current answers are checked correct, focuses/scrolls to the next heading. Top navigation stays unrestricted; Part(c) has no Next.

## Saved progress and teacher preview
Current blank saves include all12 `l2-map-XY` response keys with blank strings; legacy saves have none. Partial/hybrid sets and unknown response IDs are rejected. Pure migration authenticates original15-question and UI9-question Part(b) checks, old12-question Part(a) checks, previous11-question network Part(a) checks and unchanged Part(c) checks before changing anything. Old explicit empty general-category responses are checked against their historical answers, then retired IDs l1-scaled/l1-reaction (and earlier l1-mean) are removed. New l1-carbon-atomisation and l1-sodium-chloride-formation start unanswered. Other(a) answers are preserved and an existing authentic(a) check is recalculated from retained responses, at most9/11 until the new items are answered and checked. Existing network(b) and(c) answers/checks, selected part and Introduction remain. For original/UI saves only, old C→D and B→E transfer without sign change; G→F is never inverted, other map fields are blank and old(b) checks clear. Part(c) historical l3-j is the C–C coefficient and l3-z the final estimate. They authenticate against their old ten-item fingerprints before remapping to distinct l3-coefficient-i and l3-estimate-j. Common l3-a…l3-h stay stable. Old/new tail mixtures reject; authentic c checks recalculate new ID fingerprints with exactly the same semantic correct items, preserving full/wrong/partial/draft/tail-absent states without fabricated credit. Current c partial/untouched rows also remain valid. Every historical revealed flag normalizes to[]; the obsolete reveal command is rejected and cannot restore worked output. The next pupil command queues normalization through the existing asynchronous Olympiad host. Production reload verification waits until the expected responses/check appear in the actual IndexedDB row; it does not guarantee persistence across an immediate hard reload before a pending save commits. No schema/version, host change or new storage system.

Teacher navigation and canonical answers are local and create no pupil progress/evidence or IndexedDB writes. Existing shell landing/course localStorage preferences may still update. Restart confirms and clears only Maxwell, preserving other challenges. No mastery/revision/timing evidence is created.

## Sources and retired content
Supplied raw files under `tmp/maxwell's demon/` are unchanged:
- Level2.png SHA256 f354fd16aa6455cccb16d04933ac61cc45c7dc9d5765bd7637e3090bee0bbda5.
- Hess' Hypothetical Problems.docx SHA256 8aeeb7b6333051f43dcaa914e340da4a01c70155b421c8cd21a9811f40edb2c5; embedded image supplies network directions/data.
- level3.png SHA256 3ef9de718ca94c08163fa81e06c5a2665aef84a282866236921b07a88f130acf.

The methane table/calculations and former final energy construction are retired from pupil tasks and scoring. Earlier user disposition kept supplied CO₂(aq)−121.0 as hypothetical; its anomaly investigation remains historical teacher/dev provenance in co2-source-anomaly.md (historical report retired12 October2026). Earlier accepted stage reports/duplicate builds were retired after preserving the necessary historical fixture dependency graph; current source remains. No source number was silently corrected. Supplied-source external origin/licensing remains unknown.

## Reproduction and validation
See current Part(c) revision handover (historical report retired12 October2026), prior concise revision evidence (historical report retired12 October2026), prior presentation evidence (historical report retired12 October2026) and network chemistry/migration evidence (historical report retired12 October2026) for exact diffs, hashes, checks, actual desktop/mobile rendering, persistence isolation and reproduction commands. Existing exact pinned recovered dependencies are reused without package/lock/node_modules changes. Ordinary EPERM dependency and historical protected-baseline limits remain explicit. Historical task-local production previews and duplicate inventories were retired; current dist/app and release/app.runtime.json are preserved. Root acceptance and subsequent dependency-preserving cleanup are recorded in maintenance/recent-verification-cleanup.md.
