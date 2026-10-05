import type { ContentBlock } from '../../../contracts/question.ts';
export interface PropertiesRecord {
  readonly code: string;
  readonly level: 1 | 2;
  readonly format: 'gaps' | 'correction';
  readonly sentence: string;
  readonly answers: readonly (readonly string[])[];
  readonly errorIndex?: number;
  readonly context: readonly ContentBlock[];
  readonly hint: string;
  readonly spec: string;
  readonly provenance: string;
}
const text = (text: string): ContentBlock => ({ kind: 'text', text });
const water = [
  text(
    'Water molecules have a partially negative oxygen end and partially positive hydrogen ends.',
  ),
];
const bonds: readonly ContentBlock[] = [
  text('Hypothetical average bond enthalpies:'),
  {
    kind: 'table',
    headers: ['Bond', 'Average bond enthalpy / kJ mol⁻¹'],
    rows: [
      ['X–Y', '250'],
      ['X–Z', '400'],
    ],
  },
];
const lattice = (missing: boolean): readonly ContentBlock[] => {
  const rows = missing
    ? [
        ['Ca²⁺', 'A', 'Ca²⁺'],
        ['O²⁻', 'B', 'O²⁻'],
      ]
    : [
        ['Ca²⁺', 'O²⁻', 'Ca²⁺', 'O²⁻'],
        ['O²⁻', 'Ca²⁺', 'O²⁻', 'Ca²⁺'],
      ];
  const labels = rows
    .flat()
    .map(
      (label, i) =>
        `<text x="${45 + (i % rows[0]!.length) * 76}" y="${48 + Math.floor(i / rows[0]!.length) * 70}" text-anchor="middle" fill="${label === 'A' || label === 'B' ? '#04756f' : '#111'}" font-family="sans-serif" font-size="22">${label}</text>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0]!.length * 76 + 14} 150"><rect x="4" y="4" width="${rows[0]!.length * 76 + 6}" height="142" rx="10" fill="white" stroke="#777" stroke-dasharray="4 4"/>${labels}</svg>`;
  return [
    text(
      missing
        ? 'A small section through a calcium oxide lattice. The lattice continues beyond this fragment; the two-dimensional picture represents part of a three-dimensional structure.'
        : 'Calcium oxide diagram:',
    ),
    {
      kind: 'image',
      src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
      alt:
        'Calcium oxide diagram, top row: ' +
        rows[0]!.join(', ') +
        '. Bottom row: ' +
        rows[1]!.join(', ') +
        '.',
    },
  ];
};
const fixed = [
  'fixed in position',
  'held in fixed positions',
  'fixed in positions',
  'fixed',
  'are fixed in position',
  'are held in fixed positions',
  'cannot move',
  'are unable to move',
  'are not free to move',
  'are immobile',
  'immobile',
];
const mobile = [
  'free to move',
  'are free to move',
  'can move',
  'are able to move',
  'mobile',
  'are mobile',
];
const giant = ['giant ionic', 'giant ionic lattice', 'giant ionic structure'];
const attractions = [
  'electrostatic attractions',
  'electrostatic attraction',
  'strong electrostatic attractions',
  'strong electrostatic attraction',
];
function gap(
  code: string,
  level: 1 | 2,
  sentence: string,
  answers: readonly (readonly string[])[],
  spec: string,
  provenance = 'Specification-authored',
  context: readonly ContentBlock[] = [],
  hint = 'Connect the observation to the particles and their arrangement.',
): PropertiesRecord {
  return { code, level, format: 'gaps', sentence, answers, spec, provenance, context, hint };
}
function error(
  code: string,
  level: 1 | 2,
  sentence: string,
  errorIndex: number,
  answers: readonly string[],
  spec: string,
  provenance = 'Specification-authored',
  context: readonly ContentBlock[] = [],
  hint = 'Select the one incorrect phrase, then replace it with a chemically correct phrase.',
): PropertiesRecord {
  return {
    code,
    level,
    format: 'correction',
    sentence,
    errorIndex,
    answers: [answers],
    spec,
    provenance,
    context,
    hint,
  };
}
// Permanent explicit codes: bank order is presentation only, never persisted identity.
export const propertiesBank: readonly PropertiesRecord[] = [
  gap(
    'EBP-K7M2Q9',
    1,
    'Solid sodium chloride has a [] lattice containing positive and negative [].',
    [giant, ['ions']],
    '2.2.2(b)',
  ),
  gap(
    'EBP-P4N8V2',
    1,
    'Ionic bonding is the electrostatic [] between [] charged ions.',
    [['attraction'], ['oppositely', 'opposite']],
    '2.2.2(a)',
  ),
  gap(
    'EBP-R6T3W8',
    1,
    'Sodium chloride has a high melting point because the electrostatic attractions between its ions are []. A large amount of [] is needed to overcome these attractions.',
    [['strong'], ['energy']],
    '2.2.2(c)',
    'Adapted ionic-property demand: OCR_2018_JUN_H432-03_Q01_P_B',
  ),
  gap(
    'EBP-H9C4F7',
    1,
    'Solid potassium chloride does not conduct electricity. Its ions are held in [] positions and cannot [] through the lattice.',
    [['fixed'], ['move']],
    '2.2.2(c)',
    'Adapted conductivity demand: OCR_2017_JUN_H032-02_Q01_P_B_I',
  ),
  gap(
    'EBP-D2J8S5',
    1,
    'Molten sodium chloride conducts electricity because its [] are free to [].',
    [['ions', 'Na+ and Cl- ions', 'sodium and chloride ions'], ['move']],
    '2.2.2(c)',
    'Adapted conductivity demand: OCR_2020_OCT_H032-01_Q22_P_B',
  ),
  gap(
    'EBP-W3B6L9',
    1,
    'Sodium chloride solution conducts electricity because its [] are free to [].',
    [['ions', 'Na+ and Cl- ions', 'sodium and chloride ions'], ['move']],
    '2.2.2(c)',
  ),
  gap(
    'EBP-F8Q2D6',
    1,
    'When sodium chloride dissolves, its ions separate from the [] and become surrounded by [] molecules.',
    [
      ['lattice', 'ionic lattice', 'giant ionic lattice'],
      ['water', 'H2O'],
    ],
    '2.2.2(c)',
  ),
  gap(
    'EBP-M5V9A3',
    1,
    'Average bond enthalpy is a measure of covalent bond []. The larger its value, the [] the bond.',
    [['strength'], ['stronger']],
    '2.2.2(f)',
  ),
  error(
    'EBP-C6R2Y8',
    1,
    '[Solid sodium chloride] contains [NaCl molecules] arranged in [a giant ionic lattice].',
    1,
    [
      'Na+ and Cl- ions',
      'Na+ ions and Cl- ions',
      'sodium and chloride ions',
      'sodium ions and chloride ions',
    ],
    '2.2.2(b)',
  ),
  error(
    'EBP-A8S4K6',
    1,
    '[Positive and negative ions] are held together by [electrostatic repulsion] in [an ionic lattice].',
    1,
    ['electrostatic attraction', 'electrostatic attractions'],
    '2.2.2(a)',
  ),
  error(
    'EBP-T2F7N4',
    1,
    '[Sodium chloride has a high melting point] because [weak electrostatic attractions between its ions] require [a large amount of energy to overcome].',
    1,
    [
      'strong electrostatic attractions between its ions',
      'strong electrostatic attractions between oppositely charged ions',
    ],
    '2.2.2(c)',
    'Adapted ionic-property demand: OCR_2018_JUN_H432-03_Q01_P_B',
  ),
  error(
    'EBP-L4D9P2',
    1,
    '[Solid potassium chloride] does not conduct electricity because [its ions have no charge] in [the solid lattice].',
    1,
    [
      'its ions are fixed in position and cannot move',
      'its ions are held in fixed positions and cannot move',
      'its ions are immobile',
      'its ions are fixed in position',
      'its ions cannot move',
    ],
    '2.2.2(c)',
    'Adapted conductivity demand: OCR_2017_JUN_H032-02_Q01_P_B_I',
  ),
  error(
    'EBP-Y7H3M8',
    1,
    '[Molten sodium chloride conducts electricity] because [electrons] are [free to move].',
    1,
    ['ions', 'Na+ and Cl- ions', 'sodium and chloride ions'],
    '2.2.2(c)',
  ),
  error(
    'EBP-N9W5C2',
    1,
    '[When sodium chloride dissolves in water], it forms [mobile sodium and chloride atoms] which [are free to move through the solution].',
    1,
    [
      'mobile sodium and chloride ions',
      'sodium and chloride ions',
      'sodium ions and chloride ions',
      'mobile Na+ and Cl- ions',
    ],
    '2.2.2(c)',
  ),
  error(
    'EBP-B3K8R6',
    1,
    '[All ionic compounds] dissolve readily in water, producing [aqueous solutions] containing [mobile ions].',
    0,
    ['Some ionic compounds', 'Some but not all ionic compounds'],
    '2.2.2(c)',
  ),
  error(
    'EBP-Q5A2T9',
    1,
    '[A larger average bond enthalpy] indicates [a weaker covalent bond] which requires [more energy to break].',
    1,
    ['a stronger covalent bond', 'a stronger bond'],
    '2.2.2(f)',
  ),
  gap(
    'EBP-S8L4J2',
    2,
    'Complete the missing labels, including charges: A = [], B = [].',
    [
      ['O2-', 'O-2', 'oxide ion O2-'],
      ['Ca2+', 'Ca+2', 'calcium ion Ca2+'],
    ],
    '2.2.2(b)',
    'Adapted lattice demand: OCR_2019_JUN_H032-01_Q21_P_D_III; corroborating OCR_2022_JUN_H032-01_Q23_P_A_II',
    lattice(true),
    'Each ion needs the correct element and charge. Adjacent labels alternate.',
  ),
  gap(
    'EBP-V6P3H9',
    2,
    'A compound conducts poorly as a solid but conducts well when molten. These observations suggest a [] lattice. Its ions are [] in the solid but [] in the liquid.',
    [giant, fixed, mobile],
    '2.2.2(c)',
    'Adapted evidence demand: OCR_2020_OCT_H032-01_Q22_P_B',
  ),
  gap(
    'EBP-J2Y7B4',
    2,
    'Solid barium chloride does not conduct electricity because its ions []. An aqueous solution conducts because its ions [].',
    [
      ['are fixed in position', ...fixed],
      ['are free to move', ...mobile],
    ],
    '2.2.2(c)',
    'Adapted conductivity demand: OCR_2017_JUN_H032-02_Q01_P_B_I',
  ),
  gap(
    'EBP-G9M5W3',
    2,
    'Sodium chloride has a high boiling point. A large amount of energy is needed to overcome the strong [] between [] charged ions.',
    [attractions, ['oppositely', 'opposite']],
    '2.2.2(c)',
  ),
  gap(
    'EBP-U4C8Q6',
    2,
    'When potassium chloride dissolves, the [] end of water molecules is attracted to K+ ions. The [] ends are attracted to Cl- ions.',
    [
      ['oxygen', 'partially negative', 'oxygen partially negative', 'partially negative oxygen'],
      [
        'hydrogen',
        'partially positive',
        'hydrogen partially positive',
        'partially positive hydrogen',
      ],
    ],
    '2.2.2(c)',
    'Specification-authored, supplied water partial charges',
    water,
  ),
  gap(
    'EBP-E7N2L5',
    2,
    'When sodium chloride dissolves, attractions form between water molecules and the []. These help overcome attractions holding the ions in the []. The separated ions become surrounded by [].',
    [
      ['ions', 'Na+ and Cl- ions', 'sodium and chloride ions'],
      ['lattice', 'ionic lattice', 'giant ionic lattice'],
      ['water molecules', 'H2O molecules', 'water'],
    ],
    '2.2.2(c)',
    'Specification-authored, supplied water partial charges',
    water,
  ),
  gap(
    'EBP-Z3R6F8',
    2,
    'The stronger bond is []. On average, [] energy is needed to break one mole of these bonds than one mole of the other bond.',
    [['X-Z'], ['more', 'a greater amount of']],
    '2.2.2(f)',
    'Specification-authored; hypothetical data',
    bonds,
  ),
  gap(
    'EBP-O8T4D2',
    2,
    'A sodium chloride solution conducts electricity. Water is evaporated and the resulting crystals are dried. In solution, ions []. In the dry crystals, the ions are [], so the crystals [] electricity.',
    [
      ['are free to move', ...mobile],
      fixed,
      ['do not conduct', 'cannot conduct', 'don’t conduct', 'dont conduct'],
    ],
    '2.2.2(c)',
  ),
  error(
    'EBP-I5B9S3',
    2,
    '[The diagram represents] [a complete Ca₄O₄ molecule] containing [oppositely charged ions].',
    1,
    [
      'part of a giant ionic lattice',
      'a fragment of a giant ionic lattice',
      'a small section of a giant ionic lattice',
    ],
    '2.2.2(b)',
    'Adapted lattice demand: OCR_2019_JUN_H032-01_Q21_P_D_III',
    lattice(false),
    'The lattice continues beyond this fragment; the two-dimensional picture represents part of a three-dimensional structure.',
  ),
  error(
    'EBP-X2G7V4',
    2,
    '[These observations support a giant ionic structure]: when the compound melts, [its ions become neutral atoms] which [can move through the liquid].',
    1,
    [
      'its ions become mobile',
      'its ions are no longer fixed in position',
      'its ions become free to move',
      'its ions are free to move',
    ],
    '2.2.2(c)',
    'Adapted evidence demand: OCR_2020_OCT_H032-01_Q22_P_B',
    [text('The compound conducts poorly as a solid and well when molten.')],
  ),
  error(
    'EBP-K9U3A6',
    2,
    '[Both samples contain charged ions], but [only the solid contains mobile ions], so [only the solution conducts electricity].',
    1,
    [
      'only the solution contains mobile ions',
      'only the aqueous solution contains mobile ions',
      'only the solution contains ions that are free to move',
    ],
    '2.2.2(c)',
    'Adapted conductivity demand: OCR_2017_JUN_H032-02_Q01_P_B_I',
    [text('Compare solid barium chloride with an aqueous solution of barium chloride.')],
  ),
  error(
    'EBP-P6E2M8',
    2,
    '[The high boiling point of sodium chloride] is explained by the large amount of energy needed to overcome [intermolecular forces] between [oppositely charged ions].',
    1,
    [
      'strong electrostatic attractions',
      'electrostatic attractions',
      'strong electrostatic forces of attraction',
    ],
    '2.2.2(c)',
  ),
  error(
    'EBP-R3I8C5',
    2,
    '[Its low solubility] [rules out a giant ionic structure] because [ionic compounds have a range of solubilities in water].',
    1,
    [
      'does not rule out a giant ionic structure',
      'does not exclude a giant ionic structure',
      'is consistent with a giant ionic structure',
    ],
    '2.2.2(c)',
    'Specification-authored',
    [text('Compound Q is only sparingly soluble in water.')],
  ),
  error(
    'EBP-H6Z4N9',
    2,
    '[When water surrounds a chloride ion], its [partially negative oxygen ends] are attracted towards [the negatively charged ion].',
    1,
    ['partially positive hydrogen ends', 'partially positive H ends'],
    '2.2.2(c)',
    'Specification-authored, supplied water partial charges',
    water,
  ),
  error(
    'EBP-D8O2Y7',
    2,
    '[The X–Z bond is stronger] because, on average, [less energy] is needed to break [one mole of X–Z bonds than one mole of X–Y bonds].',
    1,
    ['more energy', 'a greater amount of energy'],
    '2.2.2(f)',
    'Specification-authored; hypothetical data',
    bonds,
  ),
  error(
    'EBP-W5X9G2',
    2,
    '[In a giant ionic lattice], electrostatic attractions between oppositely charged ions act [only within separate pairs of ions], helping to hold together [the extended structure].',
    1,
    [
      'in all directions throughout the lattice',
      'in all directions',
      'throughout the lattice in all directions',
    ],
    '2.2.2(b)',
  ),
];
