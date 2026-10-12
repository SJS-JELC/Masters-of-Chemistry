export const maxwellChallenge = { activityId: 'alevel/maxwells-demon' } as const;
export const categories = [
  {
    id: 'bond',
    name: 'Bond dissociation enthalpy',
    definition:
      'Energy required to break one mole of a specified covalent bond in gaseous molecules. Bond breaking is endothermic.',
    example: 'F₂(g) → 2F(g)',
  },
  {
    id: 'formation',
    name: 'Standard Enthalpy of Formation',
    definition:
      'Enthalpy change when one mole of a compound forms from its constituent elements in their normal states under standard conditions.',
    example: 'H₂(g) + ½O₂(g) → H₂O(l)',
  },
  {
    id: 'combustion',
    name: 'Standard Enthalpy of Combustion',
    definition:
      'Enthalpy change when one mole of a substance is completely burned in oxygen under standard conditions.',
    example: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',
  },
  {
    id: 'atomisation',
    name: 'Standard Enthalpy of Atomisation',
    definition:
      'Enthalpy change to form one mole of gaseous atoms from an element in its standard reference state.',
    example: '½F₂(g) → F(g)',
  },
  {
    id: 'vaporisation',
    name: 'Standard Enthalpy of Vaporisation',
    definition:
      'Enthalpy change when one mole of liquid becomes gas at the stated temperature and pressure.',
    example: 'H₂O(l) → H₂O(g)',
  },
  {
    id: 'solvation',
    name: 'Standard Enthalpy of Solvation',
    definition:
      'Enthalpy change when one mole of gaseous solute species becomes solvated in a specified solvent.',
    example: 'HF(g) → HF(aq)',
  },
  {
    id: 'hydration',
    name: 'Standard Enthalpy of Hydration',
    definition: 'A water-specific version of the standard enthalpy change of solvation',
    example: 'Na⁺(g) → Na⁺(aq)',
  },
  {
    id: 'solution',
    name: 'Standard Enthalpy of Solution',
    definition:
      'Enthalpy change when one mole of solid dissolves in solvent to form a solution under the specified conditions.',
    example: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)',
  },
] as const;
export const classifications = [
  {
    id: 'l1-carbon',
    equation: 'C(s, graphite) + O₂(g) → CO₂(g)',
    answers: ['formation', 'combustion'],
  },
  {
    id: 'l1-water',
    equation: 'H₂(g) + ½O₂(g) → H₂O(l)',
    answers: ['formation', 'combustion'],
  },
  {
    id: 'l1-hydration',
    equation: 'Mg²⁺(g) → Mg²⁺(aq)',
    answers: ['hydration', 'solvation'],
  },
  {
    id: 'l1-solvent',
    equation: 'Na⁺(g) → Na⁺(solvated in ethanol)',
    answers: ['solvation'],
  },
  {
    id: 'l1-solution',
    equation: 'KCl(s) → K⁺(aq) + Cl⁻(aq)',
    answers: ['solution'],
  },
  {
    id: 'l1-vapour',
    equation: 'Br₂(l) → Br₂(g)',
    answers: ['vaporisation'],
  },
  {
    id: 'l1-atoms',
    equation: '½F₂(g) → F(g)',
    answers: ['atomisation'],
  },
  {
    id: 'l1-bond',
    equation: 'F₂(g) → 2F(g)',
    answers: ['bond'],
  },
  {
    id: 'l1-carbon-atomisation',
    equation: 'C(s, graphite) → C(g)',
    answers: ['atomisation'],
  },
  {
    id: 'l1-state',
    equation: 'C(s, diamond) + O₂(g) → CO₂(g)',
    answers: ['combustion'],
  },
  {
    id: 'l1-sodium-chloride-formation',
    equation: 'Na(s) + ½Cl₂(g) → NaCl(s)',
    answers: ['formation'],
  },
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
  model?: string;
}
export const level2Tasks: readonly NumericTask[] = networkEdges.map(([from, to]) => ({
  id: 'l2-map-' + from + to,
  label: from + ' → ' + to + ': ΔH / kJ mol⁻¹',
  answer: relativeEnthalpy[to] - relativeEnthalpy[from],
}));
export const level3Tasks: readonly NumericTask[] = [
  ...parameters.map(([symbol], index) => ({
    id: 'l3-' + symbol,
    label: 'Coefficient of ' + symbol,
    answer: coefficients[symbol],
    model: ['+1/18', '−1/18', '+1/2', '−5/9', '−1', '−1', '+5/9', '+1/2', '−11/18'][index]!,
    tolerance: 0.000001,
  })),
  {
    id: 'l3-z',
    label: 'Estimated mean C–F bond enthalpy / kJ mol⁻¹',
    answer: 493.65,
    tolerance: 0.6,
  },
];
export const levelIds = (level: number): readonly string[] =>
  level === 1
    ? classifications.map((t) => t.id)
    : level === 2
      ? level2Tasks.map((t) => t.id)
      : level3Tasks.map((t) => t.id);

export const enthalpyLabels = {
  bond: { sub: 'diss', standard: true, name: 'Standard bond dissociation enthalpy' },
  formation: { sub: 'f', standard: true, name: 'Standard enthalpy of formation' },
  combustion: { sub: 'c', standard: true, name: 'Standard enthalpy of combustion' },
  atomisation: { sub: 'at', standard: true, name: 'Standard enthalpy of atomisation' },
  vaporisation: { sub: 'vap', standard: true, name: 'Standard enthalpy of vaporisation' },
  solvation: { sub: 'solv', standard: true, name: 'Standard enthalpy of solvation' },
  hydration: { sub: 'hyd', standard: true, name: 'Standard enthalpy of hydration' },
  solution: { sub: 'sol', standard: true, name: 'Standard enthalpy of solution' },
} as const;
