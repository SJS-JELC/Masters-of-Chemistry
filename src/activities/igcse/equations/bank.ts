export type EquationFamily =
  | 'simple-balance'
  | 'states'
  | 'complex-balance'
  | 'simple-words'
  | 'complex-words'
  | 'paragraph';
export interface EquationRecord {
  readonly id: string;
  readonly family: EquationFamily;
  readonly level: 1 | 2 | 3;
  readonly prompt: string;
  readonly skeleton: string;
  readonly answer: string;
  readonly task: string;
  readonly provenance: string;
  readonly markPoints: readonly string[];
}
export const equationBank: readonly EquationRecord[] = [
  {
    id: 'EQ-simple-balance-01',
    family: 'simple-balance',
    level: 1,
    prompt: 'Hydrogen reacts with oxygen to form water.',
    skeleton: 'H2 + O2 -> H2O',
    answer: '2H2 + O2 -> 2H2O',
    task: 'simple-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-simple-balance-02',
    family: 'simple-balance',
    level: 1,
    prompt: 'Magnesium reacts with oxygen to form magnesium oxide.',
    skeleton: 'Mg + O2 -> MgO',
    answer: '2Mg + O2 -> 2MgO',
    task: 'simple-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-simple-balance-03',
    family: 'simple-balance',
    level: 1,
    prompt: 'Sodium reacts with chlorine to form sodium chloride.',
    skeleton: 'Na + Cl2 -> NaCl',
    answer: '2Na + Cl2 -> 2NaCl',
    task: 'simple-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-simple-balance-04',
    family: 'simple-balance',
    level: 1,
    prompt: 'Zinc reacts with hydrochloric acid to form zinc chloride and hydrogen.',
    skeleton: 'Zn + HCl -> ZnCl2 + H2',
    answer: 'Zn + 2HCl -> ZnCl2 + H2',
    task: 'simple-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-states-01',
    family: 'states',
    level: 1,
    prompt:
      'Sodium hydroxide solution reacts with hydrochloric acid solution. Sodium chloride remains dissolved and liquid water forms. Add state symbols to the balanced equation.',
    skeleton: 'NaOH + HCl -> NaCl + H2O',
    answer: 'NaOH(aq) + HCl(aq) -> NaCl(aq) + H2O(l)',
    task: 'states',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: ['Match each state symbol to the explicitly supplied physical context.'],
  },
  {
    id: 'EQ-states-02',
    family: 'states',
    level: 1,
    prompt:
      'Solid calcium carbonate reacts with hydrochloric acid solution, forming calcium chloride solution, liquid water and carbon dioxide gas. Add state symbols to the balanced equation.',
    skeleton: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2',
    answer: 'CaCO3(s) + 2HCl(aq) -> CaCl2(aq) + H2O(l) + CO2(g)',
    task: 'states',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: ['Match each state symbol to the explicitly supplied physical context.'],
  },
  {
    id: 'EQ-states-03',
    family: 'states',
    level: 1,
    prompt:
      'Solid magnesium oxide reacts with sulfuric acid solution. Magnesium sulfate solution and liquid water form. Add state symbols to the balanced equation.',
    skeleton: 'MgO + H2SO4 -> MgSO4 + H2O',
    answer: 'MgO(s) + H2SO4(aq) -> MgSO4(aq) + H2O(l)',
    task: 'states',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: ['Match each state symbol to the explicitly supplied physical context.'],
  },
  {
    id: 'EQ-states-04',
    family: 'states',
    level: 1,
    prompt:
      'Solid aluminium reacts with hydrochloric acid solution to form aluminium chloride solution and hydrogen gas. Balance the equation AND add state symbols.',
    skeleton: 'Al + HCl -> AlCl3 + H2',
    answer: '2Al(s) + 6HCl(aq) -> 2AlCl3(aq) + 3H2(g)',
    task: 'balance-and-states',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Match each state symbol to the explicitly supplied physical context.',
      'Balance using the lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-complex-balance-01',
    family: 'complex-balance',
    level: 2,
    prompt: 'Methane burns completely in oxygen to give carbon dioxide and water.',
    skeleton: 'CH4 + O2 -> CO2 + H2O',
    answer: 'CH4 + 2O2 -> CO2 + 2H2O',
    task: 'complex-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-complex-balance-02',
    family: 'complex-balance',
    level: 2,
    prompt: 'Ethane burns completely in oxygen to give carbon dioxide and water.',
    skeleton: 'C2H6 + O2 -> CO2 + H2O',
    answer: '2C2H6 + 7O2 -> 4CO2 + 6H2O',
    task: 'complex-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-complex-balance-03',
    family: 'complex-balance',
    level: 2,
    prompt: 'Iron(III) oxide reacts with carbon monoxide to form iron and carbon dioxide.',
    skeleton: 'Fe2O3 + CO -> Fe + CO2',
    answer: 'Fe2O3 + 3CO -> 2Fe + 3CO2',
    task: 'complex-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-complex-balance-04',
    family: 'complex-balance',
    level: 2,
    prompt: 'Aluminium reacts with oxygen to form aluminium oxide.',
    skeleton: 'Al + O2 -> Al2O3',
    answer: '4Al + 3O2 -> 2Al2O3',
    task: 'complex-balancing',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Every coefficient is the lowest positive whole number that conserves atoms; formulae stay fixed.',
    ],
  },
  {
    id: 'EQ-simple-words-01',
    family: 'simple-words',
    level: 2,
    prompt:
      'Write a balanced symbol equation: magnesium + hydrochloric acid -> magnesium chloride + hydrogen.',
    skeleton: '',
    answer: 'Mg + 2HCl -> MgCl2 + H2',
    task: 'simple-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-simple-words-02',
    family: 'simple-words',
    level: 2,
    prompt: 'Write a balanced symbol equation: calcium + water -> calcium hydroxide + hydrogen.',
    skeleton: '',
    answer: 'Ca + 2H2O -> Ca(OH)2 + H2',
    task: 'simple-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-simple-words-03',
    family: 'simple-words',
    level: 2,
    prompt:
      'Write a balanced symbol equation: copper(II) oxide + sulfuric acid -> copper(II) sulfate + water.',
    skeleton: '',
    answer: 'CuO + H2SO4 -> CuSO4 + H2O',
    task: 'simple-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-simple-words-04',
    family: 'simple-words',
    level: 2,
    prompt:
      'Write a balanced symbol equation: sodium carbonate + hydrochloric acid -> sodium chloride + water + carbon dioxide.',
    skeleton: '',
    answer: 'Na2CO3 + 2HCl -> 2NaCl + H2O + CO2',
    task: 'simple-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-complex-words-01',
    family: 'complex-words',
    level: 3,
    prompt:
      'Write a balanced symbol equation: ethanol (C2H5OH) + oxygen -> carbon dioxide + water. This is complete combustion.',
    skeleton: '',
    answer: 'C2H5OH + 3O2 -> 2CO2 + 3H2O',
    task: 'complex-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-complex-words-02',
    family: 'complex-words',
    level: 3,
    prompt:
      'Write a balanced symbol equation: iron(III) oxide + carbon monoxide -> iron + carbon dioxide.',
    skeleton: '',
    answer: 'Fe2O3 + 3CO -> 2Fe + 3CO2',
    task: 'complex-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-complex-words-03',
    family: 'complex-words',
    level: 3,
    prompt:
      'Write a balanced symbol equation: aluminium + dilute sulfuric acid -> aluminium sulfate + hydrogen.',
    skeleton: '',
    answer: '2Al + 3H2SO4 -> Al2(SO4)3 + 3H2',
    task: 'complex-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-complex-words-04',
    family: 'complex-words',
    level: 3,
    prompt:
      'Write a balanced symbol equation: ammonium sulfate + sodium hydroxide -> sodium sulfate + ammonia + water.',
    skeleton: '',
    answer: '(NH4)2SO4 + 2NaOH -> Na2SO4 + 2NH3 + 2H2O',
    task: 'complex-words',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
    ],
  },
  {
    id: 'EQ-paragraph-01',
    family: 'paragraph',
    level: 3,
    prompt:
      'A student mixes aqueous lead(II) nitrate and aqueous potassium iodide. A yellow solid of lead(II) iodide forms, while potassium nitrate stays dissolved. Write the balanced symbol equation, including state symbols.',
    skeleton: '',
    answer: 'Pb(NO3)2(aq) + 2KI(aq) -> PbI2(s) + 2KNO3(aq)',
    task: 'paragraph',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
      'Correct states from the paragraph.',
    ],
  },
  {
    id: 'EQ-paragraph-02',
    family: 'paragraph',
    level: 3,
    prompt:
      'Strong heating decomposes solid copper(II) nitrate. The identified products are solid copper(II) oxide, nitrogen dioxide gas and oxygen gas. Write the balanced symbol equation, including state symbols.',
    skeleton: '',
    answer: '2Cu(NO3)2(s) -> 2CuO(s) + 4NO2(g) + O2(g)',
    task: 'paragraph',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
      'Correct states from the paragraph.',
    ],
  },
  {
    id: 'EQ-paragraph-03',
    family: 'paragraph',
    level: 3,
    prompt:
      'Heating solid sodium hydrogencarbonate (NaHCO3) produces solid sodium carbonate, water vapour and carbon dioxide gas. Write the balanced symbol equation, including state symbols.',
    skeleton: '',
    answer: '2NaHCO3(s) -> Na2CO3(s) + H2O(g) + CO2(g)',
    task: 'paragraph',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
      'Correct states from the paragraph.',
    ],
  },
  {
    id: 'EQ-paragraph-04',
    family: 'paragraph',
    level: 3,
    prompt:
      'Propane (C3H8) burns completely in oxygen gas. The products leave the hot flame as carbon dioxide gas and water vapour. Write the balanced symbol equation, including state symbols.',
    skeleton: '',
    answer: 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)',
    task: 'paragraph',
    provenance:
      'Original author-created question, RF-S1-CONTENT 2026-10-10; no examination wording or source image used.',
    markPoints: [
      'Correct formula for each named substance.',
      'Correct reactant/product sides and lowest positive whole-number coefficients.',
      'Correct states from the paragraph.',
    ],
  },
{
  "id": "EQ-complex-words-states-01",
  "family": "complex-words",
  "level": 3,
  "prompt": "Liquid ethanol (C2H5OH) burns completely in oxygen gas. The products leave the flame as carbon dioxide gas and water vapour. Write the balanced symbol equation, including state symbols.",
  "skeleton": "",
  "answer": "C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(g)",
  "task": "complex-words-states",
  "provenance": "Original author-created state-explicit replacement, RF-FORMAT-20261010 CONTENT-02; chemistry reviewed 10 October 2026. Historical two-point record retained; no source PDFs/images opened.",
  "markPoints": [
    "Correct formula for each named substance.",
    "Correct reactant/product sides and lowest positive whole-number coefficients.",
    "Correct states from the explicit physical context."
  ]
},
{
  "id": "EQ-complex-words-states-02",
  "family": "complex-words",
  "level": 3,
  "prompt": "Solid iron(III) oxide reacts with carbon monoxide gas to form solid iron and carbon dioxide gas. Write the balanced symbol equation, including state symbols.",
  "skeleton": "",
  "answer": "Fe2O3(s) + 3CO(g) -> 2Fe(s) + 3CO2(g)",
  "task": "complex-words-states",
  "provenance": "Original author-created state-explicit replacement, RF-FORMAT-20261010 CONTENT-02; chemistry reviewed 10 October 2026. Historical two-point record retained; no source PDFs/images opened.",
  "markPoints": [
    "Correct formula for each named substance.",
    "Correct reactant/product sides and lowest positive whole-number coefficients.",
    "Correct states from the explicit physical context."
  ]
},
{
  "id": "EQ-complex-words-states-03",
  "family": "complex-words",
  "level": 3,
  "prompt": "Solid aluminium reacts with dilute sulfuric acid solution to form dissolved aluminium sulfate and hydrogen gas. Write the balanced symbol equation, including state symbols.",
  "skeleton": "",
  "answer": "2Al(s) + 3H2SO4(aq) -> Al2(SO4)3(aq) + 3H2(g)",
  "task": "complex-words-states",
  "provenance": "Original author-created state-explicit replacement, RF-FORMAT-20261010 CONTENT-02; chemistry reviewed 10 October 2026. Historical two-point record retained; no source PDFs/images opened.",
  "markPoints": [
    "Correct formula for each named substance.",
    "Correct reactant/product sides and lowest positive whole-number coefficients.",
    "Correct states from the explicit physical context."
  ]
},
{
  "id": "EQ-complex-words-states-04",
  "family": "complex-words",
  "level": 3,
  "prompt": "Ammonium sulfate solution is warmed with sodium hydroxide solution. Dissolved sodium sulfate, ammonia gas and liquid water form. Write the balanced symbol equation, including state symbols.",
  "skeleton": "",
  "answer": "(NH4)2SO4(aq) + 2NaOH(aq) -> Na2SO4(aq) + 2NH3(g) + 2H2O(l)",
  "task": "complex-words-states",
  "provenance": "Original author-created state-explicit replacement, RF-FORMAT-20261010 CONTENT-02; chemistry reviewed 10 October 2026. Historical two-point record retained; no source PDFs/images opened.",
  "markPoints": [
    "Correct formula for each named substance.",
    "Correct reactant/product sides and lowest positive whole-number coefficients.",
    "Correct states from the explicit physical context."
  ]
},
{
  "id": "EQ-aluminium-acid-balance",
  "family": "simple-balance",
  "level": 1,
  "prompt": "Solid aluminium reacts with hydrochloric acid solution to form aluminium chloride solution and hydrogen gas. Balance the equation.",
  "skeleton": "Al + HCl -> AlCl3 + H2",
  "answer": "2Al + 6HCl -> 2AlCl3 + 3H2",
  "task": "simple-balancing",
  "provenance": "Split balance-only exercise, RF-FOLLOWUP-20261010; checked aluminium/hydrochloric-acid chemistry from retained EQ-states-04. No source PDFs/images opened.",
  "markPoints": [
    "Positive coefficients conserve every atom; substance formulae stay fixed."
  ]
},
{
  "id": "EQ-aluminium-acid-states",
  "family": "states",
  "level": 1,
  "prompt": "Solid aluminium reacts with hydrochloric acid solution to form aluminium chloride solution and hydrogen gas. Add state symbols to the balanced equation.",
  "skeleton": "2Al + 6HCl -> 2AlCl3 + 3H2",
  "answer": "2Al(s) + 6HCl(aq) -> 2AlCl3(aq) + 3H2(g)",
  "task": "states",
  "provenance": "Split state-only exercise, RF-FOLLOWUP-20261010; checked aluminium/hydrochloric-acid chemistry from retained EQ-states-04. No source PDFs/images opened.",
  "markPoints": [
    "Match each complete bracketed state symbol to the explicitly supplied physical context."
  ]
}
];

/** Historical records restore normally; new selection omits the combined exercise and original two-point writing tasks. */
export const supersededEquationSourceIds: ReadonlySet<string> = new Set([
  'EQ-states-04', 'EQ-complex-words-01', 'EQ-complex-words-02', 'EQ-complex-words-03', 'EQ-complex-words-04',
]);
export const selectableEquationBank = equationBank.filter((record) => !supersededEquationSourceIds.has(record.id));
