import fs from 'node:fs/promises';
import path from 'node:path';
/** Raw response fixtures for the amended S2 marker; no old-marker PASS claim. */
export function rawModelResponses(fact) {
  const fields = fact.fields ?? [
    { id: 'answer', answer: fact.answer, entry: fact.entry, matching: fact.matching },
  ];
  const responses = Object.fromEntries(
    fields.map((f) => {
      let value = f.answer;
      if (fact.id === 'igcse-recall-107') value = 'Contains one or more C=C double bonds';
      if (f.entry?.kind === 'choice') {
        const option = f.entry.options.find((x) => x.label === f.answer);
        if (!option) throw Error('No model choice option ' + fact.id);
        value = option.id;
      } else if (f.entry?.kind === 'numeric') {
        const matching = f.matching;
        if (matching?.kind !== 'numeric')
          throw Error('Numeric entry lacks numeric matching ' + fact.id);
        value = String(matching.values[0] ?? matching.minimum);
      }
      return [f.id, { kind: 'text', value }];
    }),
  );
  if (fact.exceptionCollection)
    responses[fact.exceptionCollection.id] = {
      kind: 'text',
      value: JSON.stringify(
        fact.exceptionCollection.groups.map((g, i) => ({
          id: fact.exceptionCollection.responsePrefix + (i + 1),
          value: g.answer,
        })),
      ),
    };
  return responses;
}
export function buildMarkingFixtures(facts) {
  const fixtures = [];
  const byId = new Map(facts.map((f) => [f.id, f]));
  const add = (n, name, correct, changes, rationale, extra = {}) => {
    const factId = 'igcse-recall-' + n,
      fact = byId.get(factId);
    if (!fact) throw Error('Missing fixture fact ' + factId);
    const responses = rawModelResponses(fact);
    for (const [id, value] of Object.entries(changes))
      responses[id] = {
        kind: 'text',
        value: typeof value === 'string' ? value : JSON.stringify(value),
      };
    fixtures.push({
      id: factId + ':' + name,
      factId,
      category: correct ? 'approved-equivalent' : 'chemical-negative',
      correct,
      responses,
      rationale,
      ...extra,
    });
  };
  for (const f of facts) {
    fixtures.push({
      id: f.id + ':model',
      factId: f.id,
      category: 'model',
      correct: true,
      responses: rawModelResponses(f),
      rationale:
        'All explicitly required model groups, raw choice IDs and complete exception entries.',
    });
    const model = rawModelResponses(f),
      first = Object.keys(model)[0];
    fixtures.push({
      id: f.id + ':wrong',
      factId: f.id,
      category: 'negative-control',
      correct: false,
      responses: { ...model, [first]: { kind: 'text', value: 'incorrect' } },
      rationale: 'An unrecognized answer must never pass automatically.',
    });
    const fields = f.fields ?? [
      {
        id: 'answer',
        answer: f.answer,
        accepted: f.accepted ?? [],
        entry: f.entry,
        matching: f.matching,
      },
    ];
    for (const field of fields) {
      if (['choice', 'numeric'].includes(field.entry?.kind)) continue;
      for (const [i, accepted] of field.accepted.entries()) {
        if (accepted === field.answer || accepted === model[field.id].value) continue;
        fixtures.push({
          id: f.id + ':alias-' + field.id + '-' + i,
          factId: f.id,
          category: 'approved-alias',
          correct: true,
          responses: { ...model, [field.id]: { kind: 'text', value: accepted } },
          rationale: 'Explicitly retained or user-authorized equivalent for this field.',
        });
      }
    }
    if (f.exceptionCollection)
      for (const [groupIndex, g] of f.exceptionCollection.groups.entries())
        for (const [aliasIndex, alias] of g.accepted.entries()) {
          if (alias === g.answer) continue;
          const entries = f.exceptionCollection.groups.map((x, i) => ({
            id: f.exceptionCollection.responsePrefix + (i + 1),
            value: i === groupIndex ? alias : x.answer,
          }));
          fixtures.push({
            id: f.id + ':exception-alias-' + groupIndex + '-' + aliasIndex,
            factId: f.id,
            category: 'exception-alias',
            correct: true,
            responses: {
              ...model,
              [f.exceptionCollection.id]: { kind: 'text', value: JSON.stringify(entries) },
            },
            rationale:
              'Ion name or correctly named/formulated full compound denotes one distinct exception group.',
          });
        }
  }
  add(
    '004',
    'bare-number',
    false,
    { answer: '1' },
    'Proton charge must include an explicit positive sign.',
    { alternativeEligible: false },
  );
  add('004', 'negative-sign', false, { answer: '-1' }, 'An electron sign is wrong for a proton.', {
    alternativeEligible: false,
  });
  add(
    '003',
    'fraction-1840',
    true,
    { answer: '1/1840' },
    'Retained approved approximation to relative electron mass.',
  );
  add('003', 'decimal-2000', true, { answer: '0.0005' }, 'Equivalent approved numeric notation.');
  add(
    '003',
    'zero-denominator',
    false,
    { answer: '1/0' },
    'Undefined fraction is not a numeric answer.',
    { alternativeEligible: false },
  );
  add('003', 'negative-mass', false, { answer: '-1/2000' }, 'Relative mass is not negative.', {
    alternativeEligible: false,
  });
  for (const [n, positives, negatives] of [
    [
      '017',
      [
        'Electrostatic attraction between 2 nuclei and a shared pair of negative electrons',
        'Electrostatic attraction between a shared pair of electrons and two nuclei',
        'Two nuclei and a shared pair of electrons are held together by electrostatic attraction',
      ],
      [
        'Electrostatic attraction between two ions and a shared pair of electrons',
        'No electrostatic attraction between two nuclei and a shared pair of electrons',
        'Electrostatic repulsion between two nuclei and a shared pair of electrons',
        'Electrostatic attraction between two nuclei and delocalised electrons',
        'Electrostatic attraction between two nuclei and a shared pair of electrons and neutrons',
      ],
    ],
    [
      '021',
      [
        'Electrostatic attraction between two oppositely charged ions',
        'Electrostatic attraction between negative ions and positive ions',
        'Oppositely charged ions are held together by electrostatic forces of attraction',
        'Electrostatic attraction between a positive ion and a negative ion',
      ],
      [
        'Electrostatic attraction between two similarly charged ions',
        'Electrostatic attraction between positive ions and positive ions',
        'Not electrostatic attraction between oppositely charged ions',
        'Electrostatic attraction between two nuclei',
        'Electrostatic attraction between oppositely charged ions and shared electrons',
      ],
    ],
    [
      '023',
      [
        'Electrostatic attraction between delocalised electrons and positive metal ions',
        'Strong electrostatic attraction between positive metal ions and a sea of delocalised electrons',
        'Metal cations and delocalized electrons are held together by electrostatic forces',
      ],
      [
        'Electrostatic attraction between negative metal ions and delocalised electrons',
        'Electrostatic attraction between positive metal ions and a shared pair of electrons',
        'No electrostatic attraction between positive metal ions and delocalised electrons',
        'Electrostatic repulsion between positive metal ions and delocalised electrons',
      ],
    ],
  ]) {
    positives.forEach((v, i) =>
      add(
        n,
        'bond-equivalent-' + i,
        true,
        { answer: v },
        'Approved attraction and chemically correct participants in flexible order.',
      ),
    );
    negatives.forEach((v, i) =>
      add(
        n,
        'bond-contradiction-' + i,
        false,
        { answer: v },
        'Negation, wrong participants/relationship or additional chemical claim.',
        { alternativeEligible: false },
      ),
    );
  }
  for (const n of ['018', '022', '039']) {
    const f = byId.get('igcse-recall-' + n);
    for (const option of f.entry.options)
      if (option.label !== f.answer)
        add(
          n,
          'wrong-choice-' + option.id,
          false,
          { answer: option.id },
          'Incorrect stable option ID.',
          { alternativeEligible: false },
        );
    add(
      n,
      'choice-label-is-not-id',
      false,
      { answer: f.answer },
      'Raw choice response must be its stable ID.',
      { alternativeEligible: false },
    );
  }
  for (const [n, wrong] of [
    ['026', 'NH4'],
    ['027', 'NO3+'],
    ['028', 'CO3-'],
    ['029', 'NH4-'],
    ['030', 'Zn2-'],
    ['031', 'Ag2+'],
    ['032', 'OH+'],
    ['033', 'SO4-'],
  ])
    add(
      n,
      'wrong-formula-or-charge',
      false,
      { answer: wrong },
      'Preserve incorrect atom counts and/or charge; never repair entered chemistry.',
      { alternativeEligible: false },
    );
  add(
    '027',
    'missing-charge',
    false,
    { answer: 'NO3' },
    'Nitrate ion answer includes its negative charge.',
    { alternativeEligible: false },
  );
  add(
    '030',
    'lowercase-element',
    false,
    { answer: 'zn2+' },
    'Element case is chemically meaningful.',
    { alternativeEligible: false },
  );
  add(
    '043',
    'user-limewater',
    true,
    { 'part-1': 'Bubble through limewater', 'part-2': 'Goes cloudy' },
    'Explicit user-requested concise test/result.',
  );
  add(
    '043',
    'wrong-co2-test',
    false,
    { 'part-1': 'Bubble through water' },
    'Water alone is not limewater.',
    { alternativeEligible: false },
  );
  add(
    '043',
    'no-cloudiness',
    false,
    { 'part-2': 'Does not go cloudy' },
    'Negated observation is wrong.',
    { alternativeEligible: false },
  );
  add(
    '048',
    'user-hydrogen',
    true,
    { 'part-1': 'Use a lighted splint', 'part-2': 'A squeaky pop' },
    'Retains ignition and characteristic result.',
  );
  add(
    '048',
    'glowing-splint',
    false,
    { 'part-1': 'Glowing splint' },
    'Oxygen test is wrong for hydrogen.',
    { alternativeEligible: false },
  );
  add(
    '059',
    'user-bleaching',
    true,
    { 'part-2': 'Bleaches white' },
    'Explicit accepted chlorine observation.',
  );
  add(
    '049',
    'user-orange-red',
    true,
    { 'part-2': 'Orange red flame' },
    'Accepted calcium flame description.',
  );
  add(
    '049',
    'user-brick-red',
    true,
    { 'part-2': 'Brick red flame' },
    'Accepted calcium flame description.',
  );
  add(
    '064',
    'user-observations',
    true,
    { 'part-1': 'Moving on water surface', 'part-2': 'Shrinking', 'part-3': 'Bubbles' },
    'Three distinct approved lithium observations in any order.',
  );
  add(
    '064',
    'duplicate-fizzing',
    false,
    { 'part-1': 'Fizzing', 'part-2': 'Bubbles', 'part-3': 'Disappears' },
    'Fizzing and bubbles are one observation group, counted once.',
    { alternativeEligible: false },
  );
  add(
    '064',
    'invents-flame',
    false,
    { 'part-2': 'Lilac flame' },
    'Potassium flame is not an accepted lithium observation.',
    { alternativeEligible: false },
  );
  add(
    '065',
    'user-molten-ball',
    true,
    { answer: 'Solid melts to form ball' },
    'Explicit user wording retains melting and ball formation.',
  );
  add(
    '065',
    'negative-melting',
    false,
    { answer: 'Solid does not melt to form a ball' },
    'Negated observation.',
    { alternativeEligible: false },
  );
  add(
    '066',
    'user-purple',
    true,
    { answer: 'Purple' },
    'Explicit color-only equivalent to lilac flame.',
  );
  for (const n of ['082', '083']) {
    add(n, 'no-exceptions', true, { exceptions: [] }, 'This classroom rule has zero exceptions.');
    add(
      n,
      'invented-exception',
      false,
      { exceptions: [{ id: 'exception-1', value: 'Silver' }] },
      'A nonempty exception is wrong for this rule.',
      { alternativeEligible: false },
    );
  }
  for (const n of ['084', '085', '086']) {
    const f = byId.get('igcse-recall-' + n),
      groups = f.exceptionCollection.groups;
    add(
      n,
      'empty-exceptions',
      false,
      { exceptions: [] },
      'Missing required distinct exception groups.',
      { alternativeEligible: false },
    );
    add(
      n,
      'exceptions-reversed',
      true,
      {
        exceptions: [...groups]
          .reverse()
          .map((g, i) => ({ id: 'exception-' + (i + 1), value: g.answer })),
      },
      'Exception groups are any-order.',
    );
    add(
      n,
      'duplicate-exception',
      false,
      {
        exceptions: groups.map((g, i) => ({
          id: 'exception-' + (i + 1),
          value: i === 1 ? groups[0].answer : g.answer,
        })),
      },
      'Duplicate exception cannot replace a distinct missing group.',
      { alternativeEligible: false },
    );
    add(
      n,
      'extra-exception',
      false,
      {
        exceptions: [
          ...groups.map((g, i) => ({ id: 'exception-' + (i + 1), value: g.answer })),
          { id: 'exception-extra', value: 'Copper' },
        ],
      },
      'Extra unsupported exception fails completeness.',
      { alternativeEligible: false },
    );
  }
  add(
    '084',
    'full-compounds',
    true,
    {
      exceptions: [
        { id: 'silver-entry', value: 'Silver chloride' },
        { id: 'lead-entry', value: 'PbCl2' },
      ],
    },
    'Correct full compound identifies each distinct chloride exception.',
  );
  add(
    '084',
    'wrong-compound',
    false,
    {
      exceptions: [
        { id: 'silver-entry', value: 'Silver nitrate' },
        { id: 'lead-entry', value: 'Lead chloride' },
      ],
    },
    'Correct cation in a wrong full compound is not a chloride exception.',
    { alternativeEligible: false },
  );
  add(
    '084',
    'duplicate-ion-compound',
    false,
    {
      exceptions: [
        { id: 'silver-entry', value: 'Silver' },
        { id: 'silver-compound', value: 'Silver chloride' },
      ],
    },
    'Ion and its compound refer to the same exception, not two groups.',
    { alternativeEligible: false },
  );
  add(
    '084',
    'malformed-collection',
    false,
    { exceptions: 'Silver, Lead' },
    'Collection raw response is JSON array, never inferred from ordinary prose.',
    { alternativeEligible: false },
  );
  add(
    '062',
    'whole-pairs-reversed',
    true,
    {
      'part-1': 'Add NaOH',
      'part-2': 'Blue ppt',
      'part-3': 'Flame test',
      'part-4': 'Blue-green flame',
    },
    'Whole method/result tuples may swap.',
  );
  add(
    '062',
    'crossed-results',
    false,
    { 'part-2': 'Blue precipitate', 'part-4': 'Green flame' },
    'Correct methods with crossed results are chemically mismatched.',
    { alternativeEligible: false },
  );
  add(
    '062',
    'duplicate-pair',
    false,
    { 'part-3': 'Flame test', 'part-4': 'Green flame' },
    'Both distinct copper tests are required.',
    { alternativeEligible: false },
  );
  add(
    '046',
    'melting-tuple',
    true,
    { 'part-1': 'Measure the melting point', 'part-2': 'Melts at 0 °C' },
    'Authorized alternative sharp melting-point check.',
  );
  add(
    '046',
    'freezing-tuple',
    true,
    { 'part-1': 'Measure freezing point', 'part-2': 'Freezes at 0C' },
    'Authorized alternative freezing-point check.',
  );
  add(
    '046',
    'boiling-zero',
    false,
    { 'part-2': '0 °C' },
    'Result must match the selected boiling method.',
    { alternativeEligible: false },
  );
  add(
    '046',
    'freezing-hundred',
    false,
    { 'part-1': 'Measure freezing point', 'part-2': '100 °C' },
    'Result must match the selected freezing method.',
    { alternativeEligible: false },
  );
  add(
    '046',
    'melting-boils',
    false,
    { 'part-1': 'Measure melting point', 'part-2': 'Boils at 0 °C' },
    'A melting method cannot use a boiling claim.',
    { alternativeEligible: false },
  );
  for (const n of ['091', '100']) {
    const f = byId.get('igcse-recall-' + n);
    add(
      n,
      'reverse-order',
      false,
      Object.fromEntries(f.fields.map((x, i) => [x.id, f.fields[f.fields.length - 1 - i].answer])),
      'These six fields are ordered smallest-to-largest, never any-order.',
      { alternativeEligible: false },
    );
  }
  add(
    '104',
    'products-reordered',
    true,
    { 'part-1': 'Soot', 'part-2': 'H2O', 'part-3': 'Carbon monoxide' },
    'Three distinct incomplete-combustion product groups, any order.',
  );
  add(
    '104',
    'duplicate-products',
    false,
    { 'part-1': 'CO', 'part-2': 'Carbon monoxide' },
    'Formula and name denote one product group.',
    { alternativeEligible: false },
  );
  add(
    '102',
    'user-single-bonds',
    true,
    { answer: 'Contains only single C-C bonds' },
    'Explicit saturated equivalent.',
  );
  add(
    '102',
    'double-bond',
    false,
    { answer: 'Contains a C=C double bond' },
    'A carbon-carbon double bond is unsaturation.',
    { alternativeEligible: false },
  );
  add(
    '107',
    'valid-triple',
    true,
    { answer: 'Contains at least one carbon-carbon triple bond' },
    'Scientifically valid unsaturation; retained bounded extension qualification.',
  );
  add(
    '107',
    'only-single',
    false,
    { answer: 'Contains only single C-C bonds' },
    'Saturated definition is wrong here.',
    { alternativeEligible: false },
  );
  add(
    '106',
    'user-orange-colourless',
    true,
    { 'part-2': 'The colour changes from orange to colourless' },
    'Approved phrase with the direction of change preserved.',
  );
  add(
    '106',
    'reverse-colour-change',
    false,
    { 'part-2': 'Colourless to orange' },
    'Direction matters.',
    { alternativeEligible: false },
  );
  add(
    '106',
    'contradictory-extra-colour',
    false,
    { 'part-2': 'Orange to colourless then green' },
    'An additional unsupported colour change is rejected.',
    { alternativeEligible: false },
  );
  add(
    '106',
    'negated-colour-change',
    false,
    { 'part-2': 'Not orange to colourless' },
    'Negation cannot pass a contains match.',
    { alternativeEligible: false },
  );
  add(
    '093',
    'user-car-fuel',
    true,
    { answer: 'Fuel for cars' },
    'Explicit user-requested gasoline/petrol use.',
  );
  for (const [n, positives, negatives] of [
    ['111', ['300', '600/2', '300.0'], ['299', '301', '-300']],
    ['112', ['60', '65', '70', '130/2'], ['59.9', '70.1', '-65']],
    ['113', ['30', '60/2', '30.0'], ['29', '31', '-30']],
  ]) {
    positives.forEach((value, i) =>
      add(
        n,
        'numeric-positive-' + i,
        true,
        { answer: value },
        'Approved value/range expressed without the external unit.',
      ),
    );
    negatives.forEach((value, i) =>
      add(
        n,
        'numeric-negative-' + i,
        false,
        { answer: value },
        'Outside explicitly approved numeric value/range.',
        { alternativeEligible: false },
      ),
    );
  }
  add(
    '114',
    'user-dichromate-formula',
    true,
    { 'part-1': 'K2Cr2O7', 'part-2': 'H2SO4' },
    'Correct molecular formula counts in both reagent fields.',
  );
  add(
    '114',
    'wrong-dichromate-count',
    false,
    { 'part-1': 'K2Cr2O8' },
    'Wrong atom count remains wrong.',
    { alternativeEligible: false },
  );
  add(
    '117',
    'user-acid-formula',
    true,
    { 'part-1': 'H2SO4' },
    'Explicit authorized formula shorthand for the model concentrated acid catalyst.',
  );
  add(
    '117',
    'wrong-acid-count',
    false,
    { 'part-1': 'H2SO3' },
    'Sulphurous acid is not sulphuric acid.',
    { alternativeEligible: false },
  );
  add('116', 'user-microbes', true, { answer: 'Microbes in air' }, 'Explicit authorized wording.');
  add(
    '116',
    'microorganisms',
    true,
    { answer: 'Microorganisms in the air' },
    'Equivalent oxidising microbes.',
  );
  add(
    '116',
    'wrong-yeast',
    false,
    { answer: 'Yeast in the absence of oxygen' },
    'Fermentation is not the natural oxidation asked here.',
    { alternativeEligible: false },
  );
  for (const [n, incorrect] of [
    ['119', 'H2SO3'],
    ['120', 'Sulphurous acid'],
    ['121', 'HNO2'],
    ['122', 'Nitrous acid'],
    ['123', 'HCl(g)'],
    ['124', 'Hydrogen chloride gas'],
  ])
    add(
      n,
      'wrong-acid-or-state',
      false,
      { answer: incorrect },
      'Acid identity/formula/aqueous qualification must agree.',
      { alternativeEligible: false },
    );
  add(
    '120',
    'american-spelling',
    true,
    { answer: 'Sulfuric acid' },
    'Both authorized sulphuric/sulfuric spellings.',
  );
  // Explicit per-field positive expectations; selected negative fixtures retain
  // partial feedback requirements without speculating about ambiguous tie cases.
  for (const fixture of fixtures) {
    if (fixture.correct) {
      const fact = byId.get(fixture.factId);
      fixture.expectedFields = Object.fromEntries(
        (fact.fields ?? [{ id: 'answer' }]).map((f) => [f.id, true]),
      );
      if (fact.exceptionCollection)
        for (const entry of JSON.parse(fixture.responses[fact.exceptionCollection.id].value))
          fixture.expectedFields[entry.id] = true;
    }
  }
  const expected = {
    '043:no-cloudiness': { 'part-1': true, 'part-2': false },
    '048:glowing-splint': { 'part-1': false, 'part-2': true },
    '064:duplicate-fizzing': { 'part-1': true, 'part-2': false, 'part-3': true },
    '062:crossed-results': { 'part-1': true, 'part-2': false, 'part-3': true, 'part-4': false },
    '062:duplicate-pair': { 'part-1': true, 'part-2': true, 'part-3': false, 'part-4': false },
    '046:boiling-zero': { 'part-1': true, 'part-2': false },
    '046:freezing-hundred': { 'part-1': true, 'part-2': false },
    '114:wrong-dichromate-count': { 'part-1': false, 'part-2': true, 'part-3': true },
    '117:wrong-acid-count': { 'part-1': false, 'part-2': true },
  };
  for (const [key, values] of Object.entries(expected))
    fixtures.find((x) => x.id === 'igcse-recall-' + key).expectedFields = values;
  return fixtures;
}
export const notationEditingFixtures = [
  {
    factId: 'igcse-recall-004',
    fieldId: 'answer',
    raw: '+1',
    display: '+1',
    operation: 'type-sign-then-digit',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-026',
    fieldId: 'answer',
    raw: 'NH3',
    display: 'NH₃',
    operation: 'type',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-027',
    fieldId: 'answer',
    raw: 'NO3-',
    display: 'NO₃⁻',
    operation: 'paste',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-028',
    fieldId: 'answer',
    raw: 'CO32-',
    display: 'CO₃²⁻',
    operation: 'type',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-030',
    fieldId: 'answer',
    raw: 'Zn2+',
    display: 'Zn²⁺',
    operation: 'type',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-031',
    fieldId: 'answer',
    raw: 'Ag+',
    display: 'Ag⁺',
    operation: 'paste',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-033',
    fieldId: 'answer',
    raw: 'SO54-',
    display: 'SO₅⁴⁻',
    operation: 'incorrect-input',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-101',
    fieldId: 'answer',
    raw: 'CnH2n+2',
    display: 'CₙH₂ₙ₊₂',
    operation: 'paste',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-105',
    fieldId: 'answer',
    raw: 'CnH2n',
    display: 'CₙH₂ₙ',
    operation: 'type',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-114',
    fieldId: 'part-1',
    raw: 'K2Cr2O7',
    display: 'K₂Cr₂O₇',
    operation: 'paste',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-114',
    fieldId: 'part-1',
    raw: 'K2Cr2O8',
    display: 'K₂Cr₂O₈',
    operation: 'replace-last-digit',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-117',
    fieldId: 'part-1',
    raw: 'H2SO4',
    display: 'H₂SO₄',
    operation: 'type-delete-retype',
    preserveRaw: true,
  },
  {
    factId: 'igcse-recall-119',
    fieldId: 'answer',
    raw: 'H₂SO₄',
    display: 'H₂SO₄',
    operation: 'unicode-paste',
    preserveRaw: true,
  },
];
export async function prepareMarkingFixtures(facts, app) {
  const data = {
    schemaVersion: 1,
    definitionId: 'recall-main-20261010',
    validationStage:
      'Content/schema fixture evidence; S2 must run these against the new marker and controls.',
    marking: buildMarkingFixtures(facts),
    notationEditing: notationEditingFixtures,
  };
  await fs.writeFile(
    path.join(app, 'src/recall/marking-fixtures.json'),
    JSON.stringify(data, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      markingFixtures: data.marking.length,
      modelFixtures: data.marking.filter((x) => x.category === 'model').length,
      notationEditing: data.notationEditing.length,
    }),
  );
}
