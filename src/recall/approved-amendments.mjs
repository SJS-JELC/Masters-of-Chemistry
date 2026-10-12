/** User-authorized 10 October 2026 amendments. Original teacher inputs remain immutable. */
export const amendmentAuthority = {
  id: 'recall-main-20261010',
  path: 'resources/recall/authority/recall-main-authorized-plan.md',
  section: 'Complete IGCSE amendments (AMEND-01–24)',
};
/** Generated disposition is separate from immutable accepted stage evidence. */
export function contentEvidenceDirectory() {
  const directory =
    process.env.RECALL_CONTENT_EVIDENCE_DIR ?? '.artifacts/recall-main/generated-content';
  if (!/^\.artifacts\/(?:recall-main|recall-codes)\/[a-z0-9/-]+$/.test(directory))
    throw Error('Invalid recall content evidence directory');
  return directory;
}
const alternative = {
  kind: 'valid-alternative',
  guidance:
    'Use only for a chemically equivalent ordinary-text answer not recognized automatically. Contradictions, wrong participants, duplicate claims and mismatched pairs are excluded.',
};
const text = { kind: 'text' };
const molecular = { kind: 'chemical-formula', notation: 'molecular' };
const field = (id, label, answer, accepted = [], extra = {}) => ({
  id,
  label,
  answer,
  accepted: [...new Set([answer, ...accepted])],
  entry: text,
  ...extra,
});
const options = (pairs) => ({
  kind: 'choice',
  options: pairs.map(([id, label]) => ({ id, label })),
});
const elements = options([
  ['two-metals', '2 metals'],
  ['two-non-metals', '2 non-metals'],
  ['metal-non-metal', 'a metal and a non-metal'],
]);
const solubility = options([
  ['soluble', 'Soluble'],
  ['insoluble', 'Insoluble'],
]);
const attraction =
  '(?:electrostatic attraction|electrostatic force of attraction|electrostatic forces of attraction|electrostatic forces|electrostatic force|strong electrostatic attraction)';
const covalentNuclei =
  '(?:(?:two|2)(?: positive| positively charged)? nuclei|(?:the )?nuclei of (?:two|2) atoms)';
const covalentElectrons =
  '(?:(?:a |the )?shared pair of (?:negative |negatively charged )?electrons|(?:a |the )?pair of shared (?:negative |negatively charged )?electrons|(?:two|2) shared electrons)';
const metalIons = '(?:positive metal ions|positively charged metal ions|metal cations)';
const metalElectrons =
  '(?:(?:a |the )?sea of delocali[sz]ed electrons|delocali[sz]ed (?:negative |negatively charged )?electrons)';
const relationshipPatterns = (left, right) => [
  `^(?:a |the )?${attraction} between ${left} and ${right}$`,
  `^(?:a |the )?${attraction} between ${right} and ${left}$`,
  `^${left} and ${right} (?:have |experience |are held together by )(?:a |the )?${attraction}$`,
  `^${right} and ${left} (?:have |experience |are held together by )(?:a |the )?${attraction}$`,
];
const bondReject = [
  'repulsion',
  'repel',
  'neutrons',
  'protons and electrons',
  'same charge',
  'same charges',
  'same charged',
  'not',
  'no',
  'never',
  'only nuclei',
  'only electrons',
];
export function applyApprovedAmendments(inputFacts, sourceReference) {
  let facts = structuredClone(inputFacts).filter((f) => f.id !== 'igcse-recall-061');
  const by = (n) => {
    const f = facts.find((x) => x.id === 'igcse-recall-' + n);
    if (!f) throw Error('Missing amendment target ' + n);
    return f;
  };
  const changed = new Set();
  const edit = (n, patch) => {
    Object.assign(by(n), patch);
    changed.add(n);
  };
  const sync = (f) => {
    if (f.fields) f.answer = f.fields.map((x) => x.label + ': ' + x.answer).join('\n');
    if (f.fields && f.fieldOrder !== 'pairs') f.answerGroups = structuredClone(f.fields);
  };
  // Explicit control type; all normal prose fields are single-line by contract.
  facts.forEach((f) => {
    if (f.fields) {
      f.fields.forEach((x) => {
        x.entry ??= text;
      });
      f.answerGroups?.forEach((x) => {
        x.entry ??= text;
      });
    } else f.entry = text;
    if (f.matching?.kind === 'numeric') f.entry = { kind: 'numeric', unit: f.matching.unit ?? '' };
  });
  edit('014', {
    prompt: 'What is the name for the solid that dissolves in a liquid?',
    answer: 'Solute',
    accepted: ['solute'],
    matching: { kind: 'text' },
    responseFormat: 'name-solute',
  });
  edit('015', {
    prompt: 'What is the name for a solute dissolved in a solvent?',
    answer: 'Solution',
    accepted: ['solution'],
    matching: { kind: 'text' },
    responseFormat: 'name-solution',
  });
  edit('016', {
    prompt: 'Complete the definition of a saturated solution.',
    fields: [
      field('amount', 'Amount of solute', 'maximum', ['the maximum', 'maximum possible']),
      field('temperature', 'Temperature', 'a given temperature', [
        'given temperature',
        'a particular temperature',
        'a fixed temperature',
        'a specific temperature',
      ]),
    ],
    fieldOrder: 'labelled',
    sentenceTokens: [
      'A solution with the ',
      { fieldId: 'amount' },
      ' amount of solute dissolved in it at ',
      { fieldId: 'temperature' },
      '.',
    ],
    responseFormat: 'saturated-sentence-gaps',
  });
  sync(by('016'));
  edit('004', {
    prompt: 'What is the relative charge on a proton? Include its sign.',
    entry: { kind: 'signed-charge', requireSign: true },
    matching: { kind: 'text' },
    accepted: ['+1', '1+'],
    responseFormat: 'explicit-signed-proton-charge',
  });
  by('005').entry = { kind: 'signed-charge', requireSign: true };
  for (const n of ['001', '002'])
    edit(n, { entry: { kind: 'numeric', unit: '' }, matching: { kind: 'numeric', values: [1] } });
  edit('017', {
    matching: {
      kind: 'concepts',
      all: [
        ['electrostatic attraction', 'electrostatic force', 'electrostatic forces'],
        [
          'two nuclei',
          '2 nuclei',
          'two positive nuclei',
          '2 positive nuclei',
          'nuclei of two atoms',
          'nuclei of 2 atoms',
        ],
        ['shared pair', 'pair of shared', 'two shared electrons', '2 shared electrons'],
      ],
      reject: [...bondReject, 'delocalised', 'delocalized', 'ions'],
      patterns: relationshipPatterns(covalentNuclei, covalentElectrons),
    },
    alternative,
  });
  edit('021', {
    matching: {
      kind: 'concepts',
      all: [
        ['electrostatic attraction', 'electrostatic force', 'electrostatic forces'],
        [
          'oppositely charged ions',
          'positive ions and negative ions',
          'negative ions and positive ions',
          'positive ion and a negative ion',
          'negative ion and a positive ion',
          'positive ion and negative ion',
          'negative ion and positive ion',
          'cations and anions',
          'anions and cations',
        ],
      ],
      reject: [...bondReject, 'nuclei', 'shared', 'delocalised', 'delocalized', 'electrons'],
      patterns: [
        `^(?:a |the )?${attraction} between (?:(?:two |2 )?oppositely charged ions|(?:a |the )?positive ion and (?:a |the )?negative ion|(?:a |the )?negative ion and (?:a |the )?positive ion|positive ions and negative ions|negative ions and positive ions|cations and anions|anions and cations)$`,
        `^(?:(?:two |2 )?oppositely charged ions|positive ions and negative ions|negative ions and positive ions|cations and anions|anions and cations) (?:have |experience |are held together by )(?:a |the )?${attraction}$`,
      ],
    },
    alternative,
  });
  edit('023', {
    matching: {
      kind: 'concepts',
      all: [
        ['electrostatic attraction', 'electrostatic force', 'electrostatic forces'],
        ['positive metal ions', 'positively charged metal ions', 'metal cations'],
        [
          'delocalised electrons',
          'delocalized electrons',
          'delocalised negative electrons',
          'delocalized negative electrons',
          'delocalised negatively charged electrons',
          'delocalized negatively charged electrons',
        ],
      ],
      reject: [...bondReject, 'shared pair', 'negative metal ions', 'negative ions', 'nuclei'],
      patterns: relationshipPatterns(metalIons, metalElectrons),
    },
    alternative,
  });
  edit('018', {
    prompt: 'What types of elements do covalent bonds usually form between?',
    answer: '2 non-metals',
    accepted: ['2 non-metals'],
    matching: { kind: 'text' },
    entry: elements,
    responseFormat: 'element-types-choice',
  });
  edit('022', {
    prompt: 'What types of elements do ionic bonds usually form between?',
    answer: 'a metal and a non-metal',
    accepted: ['a metal and a non-metal'],
    matching: { kind: 'text' },
    entry: elements,
    responseFormat: 'element-types-choice',
  });
  edit('026', { entry: molecular });
  for (const [n, digits] of [
    ['027', 1],
    ['028', 1],
    ['029', 1],
    ['030', 0],
    ['031', 0],
    ['032', 0],
    ['033', 1],
  ]) {
    edit(n, { entry: { kind: 'chemical-formula', notation: 'ion', atomCountDigits: digits } });
    delete by(n).context;
  }
  // A charge of magnitude1 may be written explicitly; it remains a charge,
  // not an extra atom count. The declared ion boundary never repairs chemistry.
  for (const [n, aliases] of [
    ['027', ['NO3^1-', 'NO31-', 'NO₃¹⁻']],
    ['029', ['NH4^1+', 'NH41+', 'NH₄¹⁺']],
    ['031', ['Ag^1+', 'Ag1+', 'Ag¹⁺']],
    ['032', ['OH^1-', 'OH1-', 'OH¹⁻']],
  ])
    by(n).accepted.push(...aliases);
  edit('019', { entry: text, alternative });
  edit('024', {
    entry: text,
    alternative,
    accepted: [
      ...by('024').accepted,
      'Intermolecular forces',
      'Intermolecular attraction',
      'Intermolecular forces of attraction',
    ],
  });
  const old025 = by('025');
  const replacements = [
    [
      '025a',
      'ionic substances',
      'Giant ionic lattice',
      ['Giant lattice', 'Giant ionic lattice structure', 'Giant ionic structure'],
      'lower-6-3',
    ],
    [
      '025b',
      'metals',
      'Giant metallic lattice',
      ['Giant lattice', 'Giant metallic lattice structure', 'Giant metallic structure'],
      'lower-6-4',
    ],
  ].map(([n, subject, answer, accepted, gem]) => ({
    id: 'igcse-recall-' + n,
    course: 'igcse',
    prompt: 'What type of structure do solid ' + subject + ' have?',
    answer,
    accepted,
    gemIds: [gem, 'lower-6-5'],
    sources: [...old025.sources, sourceReference('025 split: ' + n)],
    entry: text,
    alternative,
    responseFormat: n + '-single-structure',
  }));
  facts = facts.flatMap((f) => (f.id === old025.id ? replacements : [f]));
  edit('037', { prompt: 'What percentage of air is carbon dioxide?' });
  edit('039', {
    entry: { ...options([
      ['acidic', 'Acidic'],
      ['basic', 'Basic'],
    ]), presentation: 'buttons' },
    responseFormat: 'oxide-acidity-choice',
  });
  const co2 = by('043');
  co2.fields = [
    field(
      'part-1',
      'Test',
      'Bubble the gas through limewater',
      [
        'Bubble through limewater',
        'Bubble carbon dioxide through limewater',
        'Pass the gas through limewater',
        'Pass through limewater',
        'Pass the gas through calcium hydroxide solution',
        'Bubble through calcium hydroxide solution',
      ],
      { alternative },
    ),
    field(
      'part-2',
      'Result',
      'Limewater turns cloudy',
      [
        'Goes cloudy',
        'Turns cloudy',
        'Goes milky',
        'Turns milky',
        'Limewater goes cloudy',
        'Limewater goes milky',
        'White precipitate forms in the limewater',
      ],
      { alternative },
    ),
  ];
  changed.add('043');
  sync(co2);
  co2.fields[0].matching = {
    kind: 'concepts',
    all: [
      ['bubble', 'pass'],
      ['limewater', 'calcium hydroxide solution'],
    ],
    reject: ['not', 'no', 'never', 'acid', 'litmus'],
    patterns: [
      '^(?:bubble|pass) (?:(?:the |a )?gas |(?:the )?carbon dioxide |it )?through (?:the |some )?(?:limewater|calcium hydroxide solution)$',
    ],
  };
  sync(co2);
  const h2 = by('048');
  h2.fields = [
    field(
      'part-1',
      'Test',
      'Hold a lit splint at the mouth of the test tube',
      [
        'Lit splint',
        'Lighted splint',
        'Burning splint',
        'Use a lit splint',
        'Use a lighted splint',
        'Bring a lit splint to the gas',
        'Put a lit splint at the mouth of the test tube',
        'Hold a lighted splint at the mouth of the test tube',
      ],
      { alternative },
    ),
    field(
      'part-2',
      'Result',
      'Squeaky pop',
      ['A squeaky pop', 'Pops with a squeaky pop', 'A pop', 'Pop', 'Popping sound'],
      { alternative },
    ),
  ];
  changed.add('048');
  sync(h2);
  h2.fields[0].matching = {
    kind: 'concepts',
    all: [['lit splint', 'lighted splint', 'burning splint']],
    reject: ['glowing', 'unlit', 'not', 'no', 'never', 'damp'],
    patterns: [
      '^(?:(?:use|hold|bring|put|place|insert) (?:a |the )?)?(?:lit|lighted|burning) splint(?: (?:at|to|into) (?:(?:the |a )?mouth of (?:the |a )?test tube|(?:the |a )?gas|(?:the |a )?test tube))?$',
    ],
  };
  sync(h2);
  by('059').fields[1] = field(
    'part-2',
    'Result',
    'Turns red then bleaches white',
    ['Bleaches white', 'Turns white', 'Bleached white', 'Litmus bleaches white'],
    { alternative },
  );
  changed.add('059');
  sync(by('059'));
  by('049').fields[1] = field(
    'part-2',
    'Result',
    'Orange-red flame',
    ['Orange red flame', 'Brick red flame', 'Brick-red flame', 'Orange red', 'Brick red'],
    { alternative },
  );
  changed.add('049');
  sync(by('049'));
  const copper = by('062');
  copper.responsePairs = [
    { id: 'test-result-1', fieldIds: ['part-1', 'part-2'] },
    { id: 'test-result-2', fieldIds: ['part-3', 'part-4'] },
  ];
  copper.answerPairs = [
    { id: 'flame', fields: structuredClone(copper.fields.slice(0, 2)) },
    { id: 'hydroxide', fields: structuredClone(copper.fields.slice(2, 4)) },
  ];
  copper.pairCoverage = 'all';
  copper.responseFormat = 'two-copper-test-result-tuples';
  changed.add('062');
  edit('064', {
    fields: [
      field(
        'part-1',
        'Observation 1',
        'Fizzing',
        ['Bubbles', 'Bubbling', 'Fizzes', 'Effervescence', 'Bubbles form', 'Gas bubbles form'],
        { alternative },
      ),
      field(
        'part-2',
        'Observation 2',
        'Moves around on the water surface',
        [
          'Moving on the water surface',
          'Moves on the surface',
          'Moves around on water',
          'Moves around on the water',
          'Solid moves around on the water',
          'Lithium moves around on the water',
          'Moving on water surface',
        ],
        { alternative },
      ),
      field(
        'part-3',
        'Observation 3',
        'Shrinks and disappears',
        [
          'Shrinking',
          'Shrinks',
          'Disappears',
          'Disappearing',
          'Solid disappears',
          'Solid appears to disappear',
          'Lithium appears to disappear',
          'Gets smaller',
          'Shrinks/disappears',
        ],
        { alternative },
      ),
    ],
    fieldOrder: 'any',
  });
  sync(by('064'));
  edit('065', {
    accepted: [
      ...by('065').accepted,
      'Solid melts to form a ball',
      'Solid melts to form ball',
      'Melts to form a ball',
      'Melts into a ball',
      'Forms a molten ball',
    ],
    alternative,
  });
  by('065').matching = {
    kind: 'concepts',
    all: [['melts', 'molten']],
    reject: ['not', 'no', 'never', 'does not', 'solid ball'],
    patterns: [
      '^(?:(?:the )?(?:solid|sodium|metal) )?(?:melts (?:into (?:a )?ball|to form (?:a )?ball)|forms (?:a )?molten ball)$',
    ],
  };
  edit('066', {
    answer: 'Lilac flame',
    accepted: ['Lilac', 'Purple', 'Purple flame', 'Lilac flame'],
    matching: { kind: 'text' },
    alternative,
  });
  for (const n of ['082', '083', '084', '085', '086']) {
    const f = by(n),
      oldGroups = f.answerGroups ?? [];
    const soluble = n !== '086';
    f.fields = [
      field('rule', 'Solubility', soluble ? 'Soluble' : 'Insoluble', [], { entry: solubility }),
    ];
    f.fieldOrder = 'labelled';
    delete f.answerGroups;
    delete f.accepted;
    delete f.matching;
    delete f.entry;
    f.exceptionCollection = {
      id: 'exceptions',
      label: 'State any exceptions',
      responsePrefix: 'exception-',
      entry: text,
      groups: oldGroups
        .slice(1)
        .map((g) => ({ ...g, id: g.id, entry: text, alternative: { kind: 'none' } })),
    };
    // Explicit ion-name/full-compound equivalences; unrelated compounds are not aliases.
    for (const g of f.exceptionCollection.groups)
      g.accepted = [...new Set([...g.accepted, g.answer + ' ions', g.answer + ' ion'])];
    if (n === '086') {
      f.prompt = 'State the solubility rule for carbonates in water.';
      f.exceptionCollection.groups[0].accepted.push(
        'Group 1 ions',
        'Group 1 metal ions',
        'Alkali metal ions',
        'Sodium',
        'Sodium ions',
        'Potassium',
        'Potassium ions',
        'Sodium carbonate',
        'Potassium carbonate',
        'Na2CO3',
        'K2CO3',
      );
      f.exceptionCollection.groups[1].accepted.push(
        'Ammonium carbonate',
        '(NH4)2CO3',
        'NH4+',
        'NH₄⁺',
      );
    }
    f.answer =
      'Rule: ' +
      f.fields[0].answer +
      '\nExceptions: ' +
      (f.exceptionCollection.groups.map((g) => g.answer).join('; ') ||
        'None in this classroom rule');
    if (n === '085') {
      f.context = ['Use the classroom solubility rules.'];
      f.answer +=
        '\nCalcium sulphate is sparingly soluble; barium and lead sulphates are insoluble in this classroom rule.';
    }
    f.responseFormat = 'solubility-choice-dynamic-exceptions';
    changed.add(n);
  }
  edit('091', {
    prompt: 'Name the crude-oil fractions in order from smallest to largest hydrocarbon molecules.',
    responseFormat: 'six-fractions-smallest-first',
  });
  by('091').fields = [...by('091').fields]
    .reverse()
    .map((x, i) => ({ ...x, id: 'part-' + (i + 1), label: 'Fraction ' + (i + 1) }));
  sync(by('091'));
  // Both ordered decks use compact vertical inputs; UI reads labelled order and six fields.
  by('100').responseFormat = 'six-alkanes-increasing-carbon-count';
  changed.add('100');
  edit('101', {
    prompt: 'Give the general formula for alkanes.',
    entry: { kind: 'general-formula' },
  });
  delete by('101').context;
  edit('105', { entry: { kind: 'general-formula' } });
  edit('102', {
    answer: 'Contains only single C-C bonds',
    accepted: [
      'A molecule containing only single C-C bonds',
      'Contains only single C-C bonds',
      'Only single C-C bonds',
      'Contains only single carbon-carbon bonds',
      'Only single carbon-carbon bonds',
      'A molecule containing only single carbon-carbon bonds',
      'Has only single C-C bonds',
    ],
    alternative,
  });
  by('102').matching = {
    kind: 'concepts',
    all: [['only single c-c bonds', 'only single carbon-carbon bonds']],
    reject: [
      'double bond',
      'double bonds',
      'triple bond',
      'triple bonds',
      'c=c',
      'not',
      'no',
      'never',
    ],
  };
  edit('107', {
    prompt: 'Define the term unsaturated when talking about organic molecules.',
    answer: 'Contains one or more C=C double bonds',
    accepted: [
      ...by('107').accepted,
      'Contains one or more C=C double bonds',
      'Contains at least one C=C double bond',
      'Contains a C=C double bond',
      'Contains one or more carbon-carbon double bonds',
      'Contains at least one carbon-carbon double bond',
      'Contains at least one carbon-carbon triple bond',
      'Contains carbon-carbon double or triple bonds',
    ],
    alternative,
  });
  by('107').matching = {
    kind: 'concepts',
    all: [['c=c', 'c≡c', 'carbon-carbon double', 'carbon-carbon triple']],
    reject: ['only single', 'saturated', 'not', 'no', 'never'],
  };
  delete by('107').context;
  by('107').answer +=
    '. Carbon–carbon triple bonds also give unsaturation; the IGCSE examples here are alkenes.';
  by('104').fieldOrder = 'any';
  by('104').fields = by('104').fields.map((x, i) => ({
    ...x,
    label: 'Product ' + (i + 1),
    answer: x.answer === 'CO' ? 'Carbon monoxide' : x.answer,
  }));
  changed.add('104');
  sync(by('104'));
  const bromine = by('106');
  bromine.fields[1] = field(
    'part-2',
    'Result',
    'Orange to colourless',
    [
      'Changes from orange to colourless',
      'Bromine water changes from orange to colourless',
      'Bromine water turns from orange to colourless',
      'It goes from orange to colourless',
      'Orange to colorless',
      'The colour changes from orange to colourless',
    ],
    {
      alternative,
      matching: {
        kind: 'concepts',
        all: [['orange to colourless', 'orange to colorless']],
        reject: [
          'not',
          'no',
          'never',
          'green',
          'blue',
          'red',
          'colourless to orange',
          'colorless to orange',
        ],
        patterns: [
          '^(?:(?:the )?(?:bromine water|solution|colour|color|it) )?(?:(?:changes|turns|goes)(?: colour)? (?:from )?)?orange to colou?rless$',
          '^the colou?r changes from orange to colou?rless$',
        ],
      },
    },
  );
  sync(bromine);
  changed.add('106');
  edit('093', {
    accepted: [
      ...by('093').accepted,
      'Fuel for cars',
      'Fuel in cars',
      'Car fuel',
      'Fuel for motor cars',
    ],
    alternative,
  });
  for (const n of ['111', '112', '113'])
    edit(n, {
      entry: { kind: 'numeric', unit: by(n).matching.unit },
      responseFormat: 'number-external-unit',
    });
  const oxidise = by('114');
  oxidise.fields[0].accepted.push('Potassium dichromate(VI)', 'K2Cr2O7', 'K₂Cr₂O₇');
  oxidise.fields[0].entry = molecular;
  oxidise.fields[1].entry = molecular;
  changed.add('114');
  sync(oxidise);
  edit('116', {
    prompt: 'What naturally converts ethanol into ethanoic acid?',
    answer: 'Microbes in the air',
    accepted: [
      'Microbes in air',
      'Microbes in the air',
      'Bacteria',
      'Bacteria in the air',
      'Bacteria in air',
      'Microorganisms',
      'Micro-organisms',
      'Microorganisms in the air',
      'Micro-organisms in air',
      'Microorganisms in air',
      'Ethanol is oxidised by bacteria using oxygen from the air',
    ],
    matching: { kind: 'text' },
    alternative,
    responseFormat: 'name-natural-ethanol-oxidiser',
  });
  by('117').fields[0].accepted.push('H2SO4', 'H₂SO₄', 'Concentrated H2SO4', 'Concentrated H₂SO₄');
  by('117').fields[0].entry = molecular;
  changed.add('117');
  sync(by('117'));
  const water = by('046');
  water.prompt = 'How could you check if water is pure?';
  water.fields = [
    field(
      'part-1',
      'Test',
      'Heat it until boiling',
      [
        'Measure the boiling point',
        'Heat it until boiling',
        'Measure boiling point',
        'Heat',
        'Heat and measure the boiling point',
        'Measure the boiling temperature',
      ],
      { alternative },
    ),
    field(
      'part-2',
      'Result',
      'Boils at exactly 100°C',
      [
        'A sharp boiling point of 100 °C',
        'Boils at exactly 100°C',
        'Boils at 100 °C',
        'Boils at 100 degrees Celsius',
        'Boils at 100C',
        '100 °C',
        '100C',
        '100',
        'Boils at exactly 100 °C',
        'A sharp boiling point of 100 °C at standard atmospheric pressure',
      ],
      { alternative },
    ),
  ];
  water.fieldOrder = 'pairs';
  delete water.answerGroups;
  water.responsePairs = [{ id: 'water-method-result', fieldIds: ['part-1', 'part-2'] }];
  water.answerPairs = [
    { id: 'boiling', fields: structuredClone(water.fields) },
    {
      id: 'melting-freezing',
      fields: [
        field(
          'part-1',
          'Test',
          'Measure the melting or freezing point',
          [
            'Measure melting point',
            'Measure the melting point',
            'Measure freezing point',
            'Measure the freezing point',
            'Freeze the water and measure its temperature',
            'Measure melting or freezing point',
          ],
          { alternative },
        ),
        field(
          'part-2',
          'Result',
          'Melts or freezes sharply at 0 °C',
          [
            'Melts at 0 °C',
            'Freezes at 0 °C',
            'Melts at 0 degrees Celsius',
            'Freezes at 0 degrees Celsius',
            'Melting point is 0 °C',
            'Freezing point is 0 °C',
            '0 °C',
            '0C',
            '0',
            'Freezes at 0C',
            'Melts at 0C',
          ],
          { alternative },
        ),
      ],
    },
  ];
  water.pairCoverage = 'one';
  water.modelAnswerPairId = 'boiling';
  water.responseFormat = 'one-water-purity-tuple';
  delete water.context; // Standard atmospheric pressure remains an authoring assumption only.
  water.answer = 'Test: Heat it until boiling\nResult: Boils at exactly 100°C';
  changed.add('046');
  // 11 October 2026: acid recall belongs to acid prerequisites, not Fourth Form Formulae/Equations.
  const acidGems = ['lower-8-1', 'lower-8-3', 'lower-8-5'];
  const acidDefinitions = [
    [
      '119',
      'What is the formula of sulphuric acid?',
      'H2SO4',
      ['H₂SO₄'],
      true,
      ['upper-14-1', 'upper-14-2', 'upper-14-3'],
    ],
    [
      '120',
      'What is the name of the acid with formula H2SO4?',
      'Sulphuric acid',
      ['Sulfuric acid'],
      false,
      ['upper-14-1', 'upper-14-2', 'upper-14-3'],
    ],
    ['121', 'What is the formula of nitric acid?', 'HNO3', ['HNO₃'], true, ['fourth-4-3']],
    [
      '122',
      'What is the name of the acid with formula HNO3?',
      'Nitric acid',
      [],
      false,
      ['fourth-4-3'],
    ],
    [
      '123',
      'What is the formula of hydrochloric acid?',
      'HCl',
      ['HCl(aq)', 'HCl (aq)'],
      true,
      ['fourth-4-3'],
    ],
    [
      '124',
      'What is the name of the acid with formula HCl(aq)?',
      'Hydrochloric acid',
      [],
      false,
      ['fourth-4-3'],
    ],
  ];
  for (const [n, prompt, answer, accepted, formula, extraGems] of acidDefinitions)
    facts.push({
      id: 'igcse-recall-' + n,
      course: 'igcse',
      prompt,
      answer,
      accepted,
      entry: formula ? molecular : text,
      matching: { kind: formula ? 'chemical' : 'text' },
      gemIds: [...acidGems, ...extraGems],
      sources: [sourceReference('New authorized acid name/formula pair ' + n)],
      ...(['123', '124'].includes(n)
        ? {
            context: ['The question concerns an aqueous acid solution, rather than a gas.'],
          }
        : {}),
    });
  // Existing facts are linked only where their recalled chemistry is a direct prerequisite.
  const links = {
    '017': ['lower-6-1', 'lower-6-2', 'lower-6-5'],
    '019': ['fourth-3-2', 'lower-6-5'],
    '021': ['lower-6-3', 'lower-6-5'],
    '023': ['lower-6-5'],
    '024': ['lower-6-5'],
    '026': ['fourth-16-1', 'fourth-16-2', 'fourth-4-1'],
    '027': ['fourth-4-3', 'lower-8-3', 'lower-8-4', 'lower-8-5'],
    '028': ['fourth-4-3', 'lower-8-3', 'lower-8-4', 'lower-8-5'],
    '029': ['fourth-4-2', 'lower-8-4', 'lower-8-5'],
    '030': ['fourth-4-2'],
    '031': ['fourth-4-3', 'lower-8-4'],
    '032': ['fourth-4-2', 'lower-8-1', 'lower-8-3', 'lower-8-5'],
    '033': ['fourth-4-3', 'lower-8-3', 'lower-8-4', 'lower-8-5'],
    '043': ['fourth-4-3', 'lower-8-3', 'upper-11-4'],
    '046': ['fourth-1-2', 'upper-11-5'],
    '048': ['lower-8-3', 'upper-11-5'],
    '082': ['lower-8-5'],
    '083': ['lower-8-5'],
    '084': ['lower-8-5'],
    '085': ['lower-8-5'],
    '086': ['lower-8-5'],
  };
  for (const f of facts) {
    const n = f.id.replace('igcse-recall-', '');
    if (links[n]) f.gemIds = [...new Set([...f.gemIds, ...links[n]])];
    if (changed.has(n)) f.sources.push(sourceReference('Authorized amendment ' + n));
  }
  if (facts.length !== 121 || new Set(facts.map((f) => f.id)).size !== 121)
    throw Error('Amended IGCSE bank must have 121 unique facts');
  return facts;
}
