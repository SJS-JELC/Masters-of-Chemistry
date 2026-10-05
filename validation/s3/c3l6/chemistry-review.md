# C3L6 substantive content and chemistry review

Owner: A16, S3-OLYMPIAD-C3L6. Source: promoted C3L6 content/assessment, four digitised panels, and the pure molecule core identified in the accepted S0 inventory. All protected original bytes and all glyph geometry of the 42 digitised SVGs are preserved; the one public hydrazone SVG has exactly reviewed title/description qualification, with recoverable original bytes. See source-fingerprints.json and output-fingerprints.json. This is Cambridge Chemistry Challenge Lower Sixth 2012 Q2, **Olympiad extension**. It is not claimed as a complete OCR specification activity. S0's OCR reference/version boundary was consulted; no invented specification-point assignment is attached to these extension tasks.

Learning objectives: classify reaction changes using carbon–heteroatom bond counts; infer hydrolysis products from structure and nominal mass; combine functional groups, stoichiometry and network relationships to identify unknown compounds. Prerequisites: skeletal formulae, neutral C/O/N valence, alcohol/carbonyl/carboxylic-acid/ester recognition. Acetal, hydrazone, ureido and ether-ring reasoning deliberately extends ordinary early A Level content.

## Part (a): all ten schemes

| Source ID | Classification | Chemical reasoning checked against the depicted scheme |
|---|---|---|
| (1) | oxidation | Secondary alcohol carbon has one C–O bond; ketone carbon has two. |
| (2) | hydrolysis | Cyclic anhydride becomes two carboxylic-acid groups; each acyl carbon retains three bonds to O. The C=C bond and carbon skeleton remain. |
| (3) | reduction | Cyclopentanone carbonyl becomes secondary alcohol; two C–O bonds become one, with added C–H. |
| (4) | hydrolysis | Ketal breaks into ketone and ethane-1,2-diol; functional-group levels remain, without C–C cleavage. |
| (5) | hydrolysis | Epoxide opens into a vicinal diol. Each involved carbon retains one bond to O. Original trans stereochemical depiction is unchanged. |
| (6) | reduction | Diphenylmethanimine C=N becomes C–NH2; C–N bond count decreases two to one. |
| (7) | hydrolysis | Nitrile carbon has three bonds to N; carboxylic-acid carbon has three to O. This is hydrolysis, not oxidation under the provided bond-level definition. |
| (8) | reduction | Ester acyl carbon at level three becomes aldehyde at level two; the ethoxy fragment becomes ethanol. The question's shown aldehyde is retained rather than silently substituted by an alcohol. |
| (9) | oxidation | Primary-alcohol carbon at level one becomes carboxylic-acid carbon at level three. Carbon skeleton is preserved. |
| (10) | hydrolysis | Cyclic imine opens into amino ketone; imine carbon's two C–N bonds become two C–O bonds. No carbon–carbon bond changes. |

## Part (b): every target and all alternatives

Neutral hydrogen counts, atom identities, formal charge, connectivity and literal bond orders were checked manually and independently by the retained source-compatible graph engine. The supplementary existing Python 3.13.5 / RDKit 2025.09.1 cross-check independently builds each graph and compares canonical SMILES and formula with the source representation. Nominal masses use C=12, H=1, N=14, O=16, not high-precision molecular weights.

| Target | Formula / nominal mass | Checked interpretation |
|---|---|---|
| A | CH2O2 / 46 | Methanoic acid from the bee alarm-pheromone methanoate ester. |
| B | C4H10O / 74 | 2-Methylpropan-1-ol; branched connectivity is essential. A straight-chain isomer must not match. |
| C | C9H18O3 / 174 | 1,9-Dihydroxynonan-5-one from spiroketal hydrolysis; both four-carbon hydroxyalkyl arms are retained. |
| D | C3H6O / 58 | Propanone from the **drawn source compound**. Naming issue below is an explicit source exception. |
| E | CH6N2 / 46 | Methylhydrazine, with C–N–N connectivity and neutral NH/NH2 counts. |
| F | CH2O2 / 46 | Methanoic acid. E and F may swap; duplicating one product cannot pass. |
| G, alternative 1 | C4H8N4O4 / 176 | Open-chain acid from one allantoin ring amide cleavage; two ureido groups are retained. |
| G, alternative 2 | C4H8N4O4 / 176 | Other source-accepted ring-opening connectivity, containing an OH-bearing carbon and retained carbonyl/ureido groups. It is not treated as the same graph as alternative 1. |
| H | C2H2O3 / 74 | Glyoxylic acid: aldehyde plus carboxylic acid. |
| J | CH4N2O / 60 | Urea; two J per H in this hydrolysis step. |
| K, alternative 1 | C2H4O4 / 92 | Aldehyde hydrate of glyoxylic acid, giving CH(OH)2 with retained carboxylic acid. |
| K, alternative 2 | C2H4O4 / 92 | Source accepts hydration at the carboxylic carbon to C(OH)3 with retained aldehyde. This is a source-bounded alternative, not a general claim that an orthoacid is the stable predominant aqueous form. |
| L | CO2 / 44 | Carbon dioxide, with two C=O bonds. |
| M | H3N / 17 | Ammonia, rendered NH3; H3N is the source/RDKit formula ordering. Two M per L. |

Mass and atom-conservation checks: 102+18=46+74; 156+18=174; the drawn B(iii) compound 114+2×18=58+46+46; 158+18=176; 176+18=74+2×60; 74+18=92; 60+18=44+2×17. The water symbol in the source reaction diagram is a reagent label; it is not incorrectly interpreted as a balanced coefficient of one for complete B(iii) hydrolysis.

### Genuine source naming exception — independently resolved by bounded qualification

The source calls the depicted Mr114 hydrazone “Gyromitrin”. Its drawn imine carbon has two methyl groups, and hydrolysis to propanone is internally consistent with the source answer bank. Actual gyromitrin is the acetaldehyde derivative C4H8N2O, molecular weight 100.12 g/mol, SMILES C/C=N/N(C)C=O. This was verified using [PubChem CID 9548611](https://pubchem.ncbi.nlm.nih.gov/compound/Gyromitrin), accessed 2026-10-03. Independent A07 review in `validation/s3/review-c3-name/wording-disposition.json` approved exact bounded model qualification, accepted by A01. The live student heading/context/alt now describe a hydrazone model compound, preserving the drawn structure, Mr114 and D/E/F answers without revealing D. The live part-B introduction qualifies reaction (iii) as a model. Teacher review separately exposes the exact source note and citation. Public copied SVG title/description alone are qualified; replacing those tags with the inherited text recovers the original SHA256 exactly. Original source title/name/fingerprint and untouched bank metadata remain provenance. No historical raster caption is live; source-bank raster descriptions are retained metadata, not displayed claims. This review did not recover the original paper or historical review and makes no claim about which source introduced the mismatch. No placeholder was hydrated.

## Part (c): all nine targets

| Target | Formula | Checked connectivity and relationship |
|---|---|---|
| R | C6H14O2 | 1,1-Diethoxyethane; one water yields two ethanol S plus ethanal T. |
| S | C2H6O | Ethanol, oxidisable to ethanal T. |
| T | C2H4O | Ethanal, oxidisable to ethanoic acid U. |
| U | C2H4O2 | Ethanoic acid. |
| V | C4H6O3 | Ethanoic anhydride; one water yields two U. |
| W | C6H10O4 | Ethane-1,2-diyl diethanoate; two waters yield two U plus X. |
| X | C2H6O2 | Ethane-1,2-diol. |
| Y | C4H8O2 | 1,4-Dioxane; source hydrolysis gives two X; source model is condition-dependent, not a claim of rapid spontaneous hydrolysis. |
| Z | C2H4O | Oxirane; water gives X, and two Z dimerise to Y. |

All nine structures satisfy the exact source hints: only C/H/O; each carbon has exactly one carbon neighbour; all C–C bonds are single. R118+18=2×S46+T44; S46+[O]16=T44+18; T44+[O]16=U60; V102+18=2×U60; W146+2×18=2×U60+X62; Y88+2×18=2×X62; Z44+18=X62; 2×Z44=Y88. Bonds to O change while all original C–C pairs remain.

## Assessment and stereochemistry limits

Exact graph isomorphism includes cycles, charges, atom types, hydrogen counts and literal bond orders; attached neutral explicit H is normalised equivalently to implicit H. Coordinates, atom-array order and atom IDs do not change chemical correctness. No tautomer/resonance equivalence is invented. The B/C bank does not specify tetrahedral or alkene stereochemical assignments, so the editor does not invent such discrimination. A's source stereochemical images remain byte-identical and visibly inspected. An excessive valence or disconnected but well-formed drawing is an assessable incorrect response. Missing atoms block submission; corrupt references/unknown fields/broken annotations are invalid data.

## Rendering and pedagogy review

All 15 introduction examples, ten A scheme screenshots and 23 B/C alternative depictions were opened and substantively inspected. Initial light-coloured source diagrams were faint on a white background; preserved assets now use their intended dark background. Initial atom masks hid short source bonds; presentation-only coordinate expansion and smaller masks now expose single/double bonds and CH/NH/OH labels. Sticky element screenshots were clipped during automatic scroll; the ordinary editor layout and stable teacher capture sequence corrected this. All reference formulae and terminal groups are visible; G's larger primary editor supports zoom, and C's long chain retains all nine carbons/two alcohols/central carbonyl.

Desktop and 390px mobile screenshots were reviewed. The network scrolls within its own labelled region; the page itself has no horizontal overflow. Every target has an ordinary accessible selector, and fit/zoom/pan controls support non-drag review of long structures. Keyboard selection/movement, pointer gestures, touch controls, meaningful Undo and preserved history were tested in the real production Olympiad host. First complete results lock structures; duplicate checks and reload do not create additional completion rows. Teacher review locally opens every source stage and shows alternatives without saving pupil completion. Browser tables confirm zero curriculum attempts, evidence and sessions for this challenge.
