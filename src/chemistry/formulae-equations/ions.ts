export interface Ion {
  readonly id: string;
  readonly name: string;
  readonly formula: string;
  readonly charge: number;
  readonly polyatomic: boolean;
  readonly composition: Readonly<Record<string, number>>;
  readonly provenance: string;
  readonly recallFactIds: readonly string[];
}
export interface AllowedPair {
  readonly id: string;
  readonly cationId: string;
  readonly anionId: string;
  readonly level: 1 | 2;
  readonly name: string;
  readonly provenance: string;
}
export const ionBank: readonly Ion[] = [
  {
    id: 'sodium',
    name: 'sodium',
    formula: 'Na',
    charge: 1,
    polyatomic: false,
    composition: {
      Na: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-sodium-formula', 'igcse-ion-sodium-charge'],
  },
  {
    id: 'potassium',
    name: 'potassium',
    formula: 'K',
    charge: 1,
    polyatomic: false,
    composition: {
      K: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-potassium-formula', 'igcse-ion-potassium-charge'],
  },
  {
    id: 'magnesium',
    name: 'magnesium',
    formula: 'Mg',
    charge: 2,
    polyatomic: false,
    composition: {
      Mg: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-magnesium-formula', 'igcse-ion-magnesium-charge'],
  },
  {
    id: 'calcium',
    name: 'calcium',
    formula: 'Ca',
    charge: 2,
    polyatomic: false,
    composition: {
      Ca: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-calcium-formula', 'igcse-ion-calcium-charge'],
  },
  {
    id: 'aluminium',
    name: 'aluminium',
    formula: 'Al',
    charge: 3,
    polyatomic: false,
    composition: {
      Al: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-aluminium-formula', 'igcse-ion-aluminium-charge'],
  },
  {
    id: 'zinc',
    name: 'zinc',
    formula: 'Zn',
    charge: 2,
    polyatomic: false,
    composition: {
      Zn: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-recall-030'],
  },
  {
    id: 'iron-ii',
    name: 'iron(II)',
    formula: 'Fe',
    charge: 2,
    polyatomic: false,
    composition: {
      Fe: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-iron-ii-formula', 'igcse-ion-iron-ii-charge'],
  },
  {
    id: 'iron-iii',
    name: 'iron(III)',
    formula: 'Fe',
    charge: 3,
    polyatomic: false,
    composition: {
      Fe: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-iron-iii-formula', 'igcse-ion-iron-iii-charge'],
  },
  {
    id: 'copper-ii',
    name: 'copper(II)',
    formula: 'Cu',
    charge: 2,
    polyatomic: false,
    composition: {
      Cu: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-copper-ii-formula', 'igcse-ion-copper-ii-charge'],
  },
  {
    id: 'ammonium',
    name: 'ammonium',
    formula: 'NH4',
    charge: 1,
    polyatomic: true,
    composition: {
      N: 1,
      H: 4,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-recall-029'],
  },
  {
    id: 'chloride',
    name: 'chloride',
    formula: 'Cl',
    charge: -1,
    polyatomic: false,
    composition: {
      Cl: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-chloride-formula', 'igcse-ion-chloride-charge'],
  },
  {
    id: 'bromide',
    name: 'bromide',
    formula: 'Br',
    charge: -1,
    polyatomic: false,
    composition: {
      Br: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-bromide-formula', 'igcse-ion-bromide-charge'],
  },
  {
    id: 'iodide',
    name: 'iodide',
    formula: 'I',
    charge: -1,
    polyatomic: false,
    composition: {
      I: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-iodide-formula', 'igcse-ion-iodide-charge'],
  },
  {
    id: 'oxide',
    name: 'oxide',
    formula: 'O',
    charge: -2,
    polyatomic: false,
    composition: {
      O: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-oxide-formula', 'igcse-ion-oxide-charge'],
  },
  {
    id: 'sulfide',
    name: 'sulfide',
    formula: 'S',
    charge: -2,
    polyatomic: false,
    composition: {
      S: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-ion-sulfide-formula', 'igcse-ion-sulfide-charge'],
  },
  {
    id: 'hydroxide',
    name: 'hydroxide',
    formula: 'OH',
    charge: -1,
    polyatomic: true,
    composition: {
      O: 1,
      H: 1,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-recall-032'],
  },
  {
    id: 'nitrate',
    name: 'nitrate',
    formula: 'NO3',
    charge: -1,
    polyatomic: true,
    composition: {
      N: 1,
      O: 3,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-recall-027'],
  },
  {
    id: 'sulfate',
    name: 'sulfate',
    formula: 'SO4',
    charge: -2,
    polyatomic: true,
    composition: {
      S: 1,
      O: 4,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-recall-033'],
  },
  {
    id: 'carbonate',
    name: 'carbonate',
    formula: 'CO3',
    charge: -2,
    polyatomic: true,
    composition: {
      C: 1,
      O: 3,
    },
    provenance:
      'Original vetted bank, RF-S1-CONTENT chemistry review 2026-10-10; conventional IGCSE ions, not a claim of individual specification points.',
    recallFactIds: ['igcse-recall-028'],
  },
];
export const allowedPairs: readonly AllowedPair[] = [
  {
    id: 'sodium-chloride',
    cationId: 'sodium',
    anionId: 'chloride',
    level: 1,
    name: 'sodium chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'potassium-bromide',
    cationId: 'potassium',
    anionId: 'bromide',
    level: 1,
    name: 'potassium bromide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'potassium-iodide',
    cationId: 'potassium',
    anionId: 'iodide',
    level: 1,
    name: 'potassium iodide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'magnesium-oxide',
    cationId: 'magnesium',
    anionId: 'oxide',
    level: 1,
    name: 'magnesium oxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'calcium-oxide',
    cationId: 'calcium',
    anionId: 'oxide',
    level: 1,
    name: 'calcium oxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'zinc-sulfide',
    cationId: 'zinc',
    anionId: 'sulfide',
    level: 1,
    name: 'zinc sulfide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'magnesium-chloride',
    cationId: 'magnesium',
    anionId: 'chloride',
    level: 1,
    name: 'magnesium chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'calcium-chloride',
    cationId: 'calcium',
    anionId: 'chloride',
    level: 1,
    name: 'calcium chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'aluminium-chloride',
    cationId: 'aluminium',
    anionId: 'chloride',
    level: 1,
    name: 'aluminium chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'aluminium-oxide',
    cationId: 'aluminium',
    anionId: 'oxide',
    level: 1,
    name: 'aluminium oxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'sodium-oxide',
    cationId: 'sodium',
    anionId: 'oxide',
    level: 1,
    name: 'sodium oxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'iron-ii-chloride',
    cationId: 'iron-ii',
    anionId: 'chloride',
    level: 1,
    name: 'iron(II) chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'iron-iii-chloride',
    cationId: 'iron-iii',
    anionId: 'chloride',
    level: 1,
    name: 'iron(III) chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'iron-iii-oxide',
    cationId: 'iron-iii',
    anionId: 'oxide',
    level: 1,
    name: 'iron(III) oxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'copper-ii-oxide',
    cationId: 'copper-ii',
    anionId: 'oxide',
    level: 1,
    name: 'copper(II) oxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'zinc-chloride',
    cationId: 'zinc',
    anionId: 'chloride',
    level: 1,
    name: 'zinc chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'ammonium-chloride',
    cationId: 'ammonium',
    anionId: 'chloride',
    level: 2,
    name: 'ammonium chloride',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'ammonium-sulfate',
    cationId: 'ammonium',
    anionId: 'sulfate',
    level: 2,
    name: 'ammonium sulfate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'ammonium-carbonate',
    cationId: 'ammonium',
    anionId: 'carbonate',
    level: 2,
    name: 'ammonium carbonate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'sodium-hydroxide',
    cationId: 'sodium',
    anionId: 'hydroxide',
    level: 2,
    name: 'sodium hydroxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'potassium-hydroxide',
    cationId: 'potassium',
    anionId: 'hydroxide',
    level: 2,
    name: 'potassium hydroxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'magnesium-hydroxide',
    cationId: 'magnesium',
    anionId: 'hydroxide',
    level: 2,
    name: 'magnesium hydroxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'calcium-hydroxide',
    cationId: 'calcium',
    anionId: 'hydroxide',
    level: 2,
    name: 'calcium hydroxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'aluminium-hydroxide',
    cationId: 'aluminium',
    anionId: 'hydroxide',
    level: 2,
    name: 'aluminium hydroxide',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'sodium-nitrate',
    cationId: 'sodium',
    anionId: 'nitrate',
    level: 2,
    name: 'sodium nitrate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'potassium-nitrate',
    cationId: 'potassium',
    anionId: 'nitrate',
    level: 2,
    name: 'potassium nitrate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'magnesium-nitrate',
    cationId: 'magnesium',
    anionId: 'nitrate',
    level: 2,
    name: 'magnesium nitrate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'calcium-nitrate',
    cationId: 'calcium',
    anionId: 'nitrate',
    level: 2,
    name: 'calcium nitrate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'copper-ii-nitrate',
    cationId: 'copper-ii',
    anionId: 'nitrate',
    level: 2,
    name: 'copper(II) nitrate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'aluminium-sulfate',
    cationId: 'aluminium',
    anionId: 'sulfate',
    level: 2,
    name: 'aluminium sulfate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'magnesium-sulfate',
    cationId: 'magnesium',
    anionId: 'sulfate',
    level: 2,
    name: 'magnesium sulfate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'calcium-carbonate',
    cationId: 'calcium',
    anionId: 'carbonate',
    level: 2,
    name: 'calcium carbonate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'sodium-carbonate',
    cationId: 'sodium',
    anionId: 'carbonate',
    level: 2,
    name: 'sodium carbonate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'copper-ii-sulfate',
    cationId: 'copper-ii',
    anionId: 'sulfate',
    level: 2,
    name: 'copper(II) sulfate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'iron-ii-sulfate',
    cationId: 'iron-ii',
    anionId: 'sulfate',
    level: 2,
    name: 'iron(II) sulfate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
  {
    id: 'iron-iii-sulfate',
    cationId: 'iron-iii',
    anionId: 'sulfate',
    level: 2,
    name: 'iron(III) sulfate',
    provenance: 'Explicit author-reviewed compound pair; RF-S1-CONTENT 2026-10-10.',
  },
];
