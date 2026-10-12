export const maxwellChallenge = { activityId: 'alevel/maxwells-demon' } as const;
export const categories = [
  {
    id: 'bond',
    name: 'Average bond enthalpy',
    definition:
      'Energy required to break one mole of a specified covalent bond in gaseous molecules, averaged across different molecular environments. Bond breaking is endothermic.',
    example: 'F₂(g) → 2F(g)',
    note: 'This example is the exact F–F dissociation enthalpy for one mole of bonds, not an average across different compounds. For a polyatomic molecule, an individual dissociation need not equal a tabulated mean.',
  },
  {
    id: 'formation',
    name: 'Formation',
    definition:
      'Enthalpy change when one mole of a compound forms from its constituent elements in their reference states under standard conditions.',
    example: 'H₂(g) + ½O₂(g) → H₂O(l)',
    note: 'Only elements in their reference forms have standard formation enthalpy zero. H(g), O₂(aq) and diamond do not have zero values by that convention.',
  },
  {
    id: 'combustion',
    name: 'Combustion',
    definition:
      'Enthalpy change when one mole of a substance is completely burned in oxygen under standard conditions.',
    example: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',
    note: 'State symbols matter: forming water vapour gives a different value.',
  },
  {
    id: 'atomisation',
    name: 'Atomisation',
    definition:
      'Enthalpy change to form one mole of gaseous atoms from an element in its standard reference state.',
    example: '½F₂(g) → F(g)',
    note: 'F₂(g) → 2F(g) produces two moles of atoms: its enthalpy is twice the molar atomisation enthalpy.',
  },
  {
    id: 'vaporisation',
    name: 'Vaporisation',
    definition:
      'Enthalpy change when one mole of liquid becomes gas at the stated temperature and pressure.',
    example: 'H₂O(l) → H₂O(g)',
    note: 'No bonds within water molecules are broken by this phase change. Specify conditions when quoting a value.',
  },
  {
    id: 'solvation',
    name: 'Solvation',
    definition:
      'Enthalpy change when one mole of gaseous solute species becomes solvated in a specified solvent.',
    example: 'HF(g) → HF(aq)',
    note: 'The Level 3 HF value refers to the aqueous species as defined by the supplied thermochemical data; do not silently change its chemical form.',
  },
  {
    id: 'hydration',
    name: 'Hydration',
    definition:
      'For OCR ionic cycles: enthalpy change when one mole of gaseous ions becomes hydrated in water.',
    example: 'Na⁺(g) → Na⁺(aq)',
    note: 'Hydration is water-specific solvation. Both names apply to this ionic example.',
  },
  {
    id: 'solution',
    name: 'Solution',
    definition:
      'Enthalpy change when one mole of solute in its stated condensed state dissolves in solvent to form a solution under the specified conditions.',
    example: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)',
    note: 'Starts with the solid solute, not separated gaseous ions. The aqueous standard-state convention matters.',
  },
  {
    id: 'reaction',
    name: 'Reaction',
    definition:
      'Enthalpy change for a reaction as written, including its stoichiometric amounts and state symbols. ΔᵣH° denotes standard conditions; ΔᵣH need not.',
    example: '2H₂(g) + O₂(g) → 2H₂O(l)',
    note: 'The general reaction label also covers named enthalpy changes. Doubling an equation doubles its enthalpy change.',
  },
] as const;
export const classifications = [
  {
    id: 'l1-carbon',
    equation: 'C(s, graphite) + O₂(g) → CO₂(g)',
    answers: ['formation', 'combustion'],
    why: 'One mole of CO₂ forms from reference elements, and one mole of carbon burns completely.',
  },
  {
    id: 'l1-water',
    equation: 'H₂(g) + ½O₂(g) → H₂O(l)',
    answers: ['formation', 'combustion'],
    why: 'One mole of water forms from elements and one mole of hydrogen burns completely.',
  },
  {
    id: 'l1-hydration',
    equation: 'Mg²⁺(g) → Mg²⁺(aq)',
    answers: ['hydration', 'solvation'],
    why: 'One mole of gaseous ions becomes hydrated: a special case of solvation.',
  },
  {
    id: 'l1-solvent',
    equation: 'Na⁺(g) → Na⁺(solvated in ethanol)',
    answers: ['solvation'],
    why: 'The solvent is ethanol, so this is solvation but not hydration.',
  },
  {
    id: 'l1-solution',
    equation: 'KCl(s) → K⁺(aq) + Cl⁻(aq)',
    answers: ['solution'],
    why: 'One mole of solid dissolves; it does not start with gaseous ions.',
  },
  {
    id: 'l1-vapour',
    equation: 'Br₂(l) → Br₂(g)',
    answers: ['vaporisation'],
    why: 'A liquid becomes a gas without splitting its molecules.',
  },
  {
    id: 'l1-atoms',
    equation: '½F₂(g) → F(g)',
    answers: ['atomisation'],
    why: 'Exactly one mole of gaseous atoms forms from fluorine in its reference state.',
  },
  {
    id: 'l1-bond',
    equation: 'F₂(g) → 2F(g)',
    answers: ['bond'],
    why: 'One mole of F–F bonds is broken. Select the bond category; this is an exact diatomic dissociation, not a cross-compound mean. It is twice the molar atomisation equation.',
  },
  {
    id: 'l1-mean',
    equation:
      'A table gives the mean energy to break one mole of C–H bonds across gaseous compounds.',
    answers: ['bond'],
    why: 'Averaging across molecular environments is what makes this an average bond enthalpy.',
  },
  {
    id: 'l1-scaled',
    equation: '2H₂(g) + O₂(g) → 2H₂O(l)',
    answers: [],
    why: 'As written it is a reaction enthalpy: it forms two moles of compound and burns two moles of hydrogen. Divide by two for the named molar formation/combustion values.',
  },
  {
    id: 'l1-state',
    equation: 'C(s, diamond) + O₂(g) → CO₂(g)',
    answers: ['combustion'],
    why: 'One mole of diamond burns completely, but diamond is not the carbon reference state, so this is not standard formation of CO₂.',
  },
  {
    id: 'l1-reaction',
    equation: 'N₂(g) + 3H₂(g) → 2NH₃(g)',
    answers: [],
    why: 'A general reaction enthalpy as written. Half this equation is the molar formation equation.',
  },
] as const;
export const formationData = [
  ['CO₂(aq)', -121.0],
  ['H₂(aq)', -4.187],
  ['CH₄(aq)', -89.1],
  ['H₂O(l)', -286.0],
  ['O₂(aq)', -11.72],
] as const;
export const networkData = [
  ['A → B', -120],
  ['B → C', 40],
  ['A → D', -208],
  ['D → F', -3],
  ['F → E', 408],
  ['2G → 2E', 68],
  ['A → I', -101],
] as const;
export const networkEdges = [
  ['A', 'B'],
  ['B', 'E'],
  ['A', 'D'],
  ['B', 'C'],
  ['C', 'D'],
  ['C', 'F'],
  ['D', 'F'],
  ['E', 'F'],
  ['E', 'G'],
  ['F', 'G'],
  ['F', 'I'],
  ['I', 'G'],
] as const;
export const relativeEnthalpy = {
  A: 0,
  B: -120,
  C: -80,
  D: -208,
  F: -211,
  E: 197,
  G: 163,
  I: -101,
} as const;
export const parameters = [
  ['a', 'Reaction of liquid perfluorodecalin shown', -3467],
  ['b', 'Vaporisation: C₁₀F₁₈(l) → C₁₀F₁₈(g)', 43.3],
  ['c', 'Formation of H₂O(l)', -285.8],
  ['d', 'Formation of CO₂(g)', -393.5],
  ['e', 'Formation of HF(g)', -273.3],
  ['f', 'Solvation: HF(g) → HF(aq)', -61.6],
  ['g', 'Atomisation: C(s, graphite) → C(g)', 716.7],
  ['h', 'F–F dissociation: F₂(g) → 2F(g)', 157.0],
  ['j', 'Mean C–C bond dissociation', 325],
] as const;
export const coefficients = {
  a: 1 / 18,
  b: -1 / 18,
  c: 1 / 2,
  d: -5 / 9,
  e: -1,
  f: -1,
  g: 5 / 9,
  h: 1 / 2,
  j: -11 / 18,
} as const;
export interface NumericTask {
  id: string;
  label: string;
  answer: number | string;
  tolerance?: number;
  why: string;
  model?: string;
}
export const level2Tasks: readonly NumericTask[] = [
  {
    id: 'l2-hydrogenation',
    label: 'ΔH°: CO₂(aq) + 4H₂(aq) → CH₄(aq) + 2H₂O(l)',
    answer: -523.352,
    tolerance: 0.6,
    why: 'Products − reactants = [−89.10 + 2(−286.0)] − [−121.0 + 4(−4.187)] = −523.352 kJ mol⁻¹, using the hypothetical supplied data.',
  },
  {
    id: 'l2-oxygen',
    label: 'Complete oxidation: coefficient of O₂',
    answer: 2,
    why: 'CH₄(aq) + 2O₂(aq) → CO₂(aq) + 2H₂O(l). Carbon, hydrogen and oxygen balance.',
  },
  {
    id: 'l2-co2',
    label: 'Complete oxidation: coefficient of CO₂',
    answer: 1,
    why: 'There is one carbon atom in one CH₄.',
  },
  {
    id: 'l2-water',
    label: 'Complete oxidation: coefficient of H₂O',
    answer: 2,
    why: 'Four hydrogen atoms form two water molecules.',
  },
  {
    id: 'l2-oxygen-state',
    label: 'State of O₂ in the supplied aqueous oxidation',
    answer: 'aq',
    why: 'Use the supplied O₂(aq) formation value, not gaseous O₂ with zero formation enthalpy.',
  },
  {
    id: 'l2-oxidation',
    label: 'ΔH° for complete aqueous oxidation of one mole of methane',
    answer: -580.46,
    tolerance: 0.6,
    why: '[−121.0 + 2(−286.0)] − [−89.10 + 2(−11.72)] = −580.46 kJ mol⁻¹, using the hypothetical supplied data.',
  },
  {
    id: 'l2-CD',
    label: 'C → D',
    answer: -128,
    why: 'With H(A)=0: H(C)=−120+40=−80 and H(D)=−208; −208−(−80)=−128.',
  },
  {
    id: 'l2-BE',
    label: 'B → E',
    answer: 317,
    why: 'H(F)=−211; H(E)=−211+408=197. H(E)−H(B)=197−(−120)=317.',
  },
  {
    id: 'l2-GF',
    label: 'G → F',
    answer: -374,
    why: '2G → 2E is +68, so G → E is +34. G → F is +34−408=−374.',
  },
  {
    id: 'l2-low',
    label: 'Lowest energy level',
    answer: 'F',
    why: 'F lies below I, which lies below G.',
  },
  { id: 'l2-middle', label: 'Middle energy level', answer: 'I', why: 'I is 110 kJ mol⁻¹ above F.' },
  { id: 'l2-high', label: 'Highest energy level', answer: 'G', why: 'G is 374 kJ mol⁻¹ above F.' },
  { id: 'l2-FI', label: 'Arrow F → I: signed ΔH', answer: 110, why: 'H(I)−H(F)=−101−(−211)=+110.' },
  { id: 'l2-IG', label: 'Arrow I → G: signed ΔH', answer: 264, why: 'H(G)−H(I)=163−(−101)=+264.' },
  {
    id: 'l2-FG',
    label: 'Arrow F → G: signed ΔH',
    answer: 374,
    why: '+110 + 264 = +374, independent of the route.',
  },
];
export const level3Tasks: readonly NumericTask[] = [
  ...parameters.map(([symbol], index) => ({
    id: 'l3-' + symbol,
    label: 'Coefficient of ' + symbol,
    answer: coefficients[symbol],
    model: ['+1/18', '−1/18', '+1/2', '−5/9', '−1', '−1', '+5/9', '+1/2', '−11/18'][index]!,
    tolerance: 0.000001,
    why:
      [
        'The reaction contributes +a to the atomisation numerator.',
        'Vaporising the liquid raises its formation enthalpy by b, so the atomisation numerator contains −b.',
        'Nine water molecules contribute +9c to the numerator.',
        'The ten carbon dioxide products contribute −10d to the numerator.',
        'The eighteen HF gas formation terms contribute −18e to the numerator.',
        'The eighteen HF solvation terms contribute −18f to the numerator.',
        'Ten carbon atoms require +10g in the numerator.',
        'Nine fluorine molecules require +9h to produce eighteen fluorine atoms.',
        'Subtract the eleven C–C bond contributions: −11j in the numerator.',
      ][index]! + ' Divide the numerator by 18 C–F bonds.',
  })),
  {
    id: 'l3-z',
    label: 'Estimated mean C–F bond enthalpy / kJ mol⁻¹',
    answer: 493.65,
    tolerance: 0.6,
    why: 'The numerator is 8885.7 kJ mol⁻¹; dividing by 18 gives 493.65 ≈ 494 kJ mol⁻¹.',
  },
];
export const levelIds = (level: number): readonly string[] =>
  level === 1
    ? classifications.map((t) => t.id)
    : level === 2
      ? level2Tasks.map((t) => t.id)
      : level3Tasks.map((t) => t.id);
