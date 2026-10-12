import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import { equationBank, selectableEquationBank } from '../../src/activities/igcse/equations/bank.ts';
import {
  equationsQuestion,
  equationsRef,
  equationsProvider,
} from '../../src/activities/igcse/equations/provider.ts';
import { equationsMarking } from '../../src/activities/igcse/equations/marking.ts';
import { formulaeQuestion, formulaeRef } from '../../src/activities/igcse/formulae/provider.ts';
import {
  equationAtomCounts,
  parseChemicalEquation,
} from '../../src/chemistry/formulae-equations/notation.ts';
import {
  parsePositiveCoefficient as parse,
  parseParenthesizedState as state,
  rationalEquals,
  proportionalCoefficientVectors,
} from '../../src/chemistry/formulae-equations/answer-syntax.ts';
import { parseResponseEquation } from '../../src/chemistry/formulae-equations/response-equation.ts';
const outcome = (id, responses) =>
  equationsMarking.mark(equationsQuestion(equationsRef(id)), responses);
const earned = (result) => {
  assert.equal(result.accepted, true);
  return result.marks.earned;
};
const numeric = (raw) => ({ kind: 'numeric', raw, unit: '' });
const choice = (value) => ({ kind: 'choice', selected: [value] });
const text = (value) => ({ equation: { kind: 'text', value } });
function boxResponses(id, values) {
  const q = equationsQuestion(equationsRef(id));
  return Object.fromEntries(
    q.parts.filter((p) => p.kind === 'numeric').map((p, i) => [p.id, numeric(values[i])]),
  );
}
test('strict reduced positive rational syntax and bounds', () => {
  for (const [value, n, d] of [
    ['2', 2n, 1n],
    ['0.5', 1n, 2n],
    ['.5', 1n, 2n],
    ['1/2', 1n, 2n],
    [' 2 / 4 ', 1n, 2n],
    ['½', 1n, 2n],
    ['⅓', 1n, 3n],
    ['1/3', 1n, 3n],
    ['⅚', 5n, 6n],
    ['0002', 2n, 1n],
  ])
    assert.deepEqual(parse(value), { numerator: n, denominator: d }, value);
  for (const value of [
    '',
    '0',
    '0.0',
    '0/1',
    '-1',
    '+1',
    '−1',
    '1/0',
    '1/-2',
    'NaN',
    'Infinity',
    '1e2',
    '2.',
    '1..2',
    '1/2/3',
    '1+1',
    '2*3',
    '2½',
    '(1/2)',
    '1 2',
    '1'.repeat(65),
    ' '.repeat(129),
  ])
    assert.equal(parse(value), null, value);
  assert.deepEqual(parse('', { blankIsOne: true }), { numerator: 1n, denominator: 1n });
  assert.equal(parse('0', { blankIsOne: true }), null);
  assert.equal(rationalEquals(parse('0.333'), parse('1/3')), false);
  assert.equal(
    proportionalCoefficientVectors(
      [parse('⅓'), parse('1'), parse('⅓')],
      [parse('1'), parse('3'), parse('1')],
    ),
    true,
  );
});
test('complete bracket state syntax; old bare payload is not silently normalized', () => {
  for (const [raw, expected] of [
    ['(aq)', 'aq'],
    [' ( AQ ) ', 'aq'],
    ['(s)', 's'],
    ['(L)', 'l'],
    ['(g)', 'g'],
  ])
    assert.equal(state(raw), expected);
  for (const raw of [
    'aq',
    's',
    '[aq]',
    '(aq',
    'aq)',
    '((s))',
    '(a q)',
    '(water)',
    '(aq) extra',
    '',
  ])
    assert.equal(state(raw), null);
  assert.equal(
    earned(
      outcome('EQ-000005', {
        'r0-state': choice('aq'),
        'r1-state': choice('aq'),
        'p0-state': choice('aq'),
        'p1-state': choice('l'),
      }),
    ),
    0,
  );
  assert.equal(
    earned(
      outcome('EQ-000005', {
        'r0-state': choice(' ( AQ ) '),
        'r1-state': choice('(aq)'),
        'p0-state': choice('(aq)'),
        'p1-state': choice('(l)'),
      }),
    ),
    4,
  );
});
test('common scale earns full box balancing; nonbalanced valid vectors retain canonical partial policy', () => {
  for (const values of [
    ['1', '0.5', '1'],
    ['1', '1/2', '1'],
    ['1', '½', '1'],
    ['4', '2', '4'],
    ['⅔', '⅓', '⅔'],
  ])
    assert.equal(earned(outcome('EQ-000001', boxResponses('EQ-000001', values))), 3);
  assert.equal(earned(outcome('EQ-000001', boxResponses('EQ-000001', ['2', '2', '2']))), 2);
  assert.equal(earned(outcome('EQ-000001', boxResponses('EQ-000001', ['1', '1', '1']))), 1);
  assert.equal(earned(outcome('EQ-000001', {})), 1);
  assert.equal(earned(outcome('EQ-000001', boxResponses('EQ-000001', ['', '', '']))), 1);
  assert.equal(earned(outcome('EQ-000001', boxResponses('EQ-000001', ['1', '.333', '1']))), 0);
  for (const raw of ['0', '-1', '1/0', 'NaN', '1e2', '1+1', '2.', '1..2']) {
    const result = outcome('EQ-000001', boxResponses('EQ-000001', ['2', raw, '2']));
    assert.equal(result.accepted, false, raw);
    assert.equal(result.issues[0].partId, 'r1-coefficient');
  }
});
test('Grade9 formula/balance/states independent, exact, case-sensitive and side-sensitive', () => {
  const model = 'C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(g)';
  assert.equal(earned(outcome('EQ-00000P', text(model))), 3);
  for (const value of [
    '½C2H5OH(l) + 1.5O2(g) -> CO2(g) + 1.5H2O(g)',
    '1/3C2H5OH(l) + O2(g) -> 2/3CO2(g) + H2O(g)',
  ])
    assert.equal(earned(outcome('EQ-00000P', text(value))), 3, value);
  for (const prefix of ['0', '-1', '1/0', '1..2', '1e2']) {
    const result = outcome('EQ-00000P', text(prefix + 'C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(g)'));
    assert.equal(earned(result), 2, prefix);
    assert.deepEqual(
      result.marks.points.map((p) => p.earned),
      [1, 0, 1],
    );
  }
  assert.equal(earned(outcome('EQ-00000P', text('C2H5OH(s) + 3O2(g) -> 2CO2(g) + 3H2O(g)'))), 2);
  assert.equal(earned(outcome('EQ-00000P', text('C2H5OH + 3O2 -> 2CO2 + 3H2O'))), 2);
  assert.equal(earned(outcome('EQ-00000P', text('c2h5oh(l) + 3O2(g) -> 2CO2(g) + 3H2O(g)'))), 0);
  assert.equal(earned(outcome('EQ-00000P', text('2CO2(g) + 3H2O(g) -> C2H5OH(l) + 3O2(g)'))), 0);
  assert.equal(parseResponseEquation('H2 + H2 -> H2'), null);
  assert.equal(parseResponseEquation('2*3H2 + O2 -> H2O'), null);
  assert.equal(earned(outcome('EQ-00000H', text(model))), 2);
});
test('untouched coefficient boxes mean1 in an already-balanced fixed skeleton', () => {
  // Focused fixture uses an authored fixed model with a unit coefficient for each substance.
  const model = parseChemicalEquation('NaOH + HCl -> NaCl + H2O');
  assert.equal(
    proportionalCoefficientVectors(
      Array(4).fill(parse('', { blankIsOne: true })),
      [...model.reactants, ...model.products].map((s) => parse(String(s.coefficient))),
    ),
    true,
  );
  assert.equal(
    earned(
      outcome('EQ-000001', { 'r0-coefficient': numeric('2'), 'p0-coefficient': numeric('2') }),
    ),
    3,
  );
});
test('separate T/U atom models, legacy8 rows/marks and stable selection counts', () => {
  assert.equal(equationBank.length, 30);
  assert.equal(selectableEquationBank.length, 25);
  assert.equal(
    selectableEquationBank.some((r) => r.id === 'EQ-states-04'),
    false,
  );
  for (const id of ['EQ-00000T', 'EQ-00000U']) {
    const q = equationsQuestion(equationsRef(id));
    assert.equal(q.parts.length, 4);
    assert.equal(
      q.parts.reduce((s, p) => s + p.marks, 0),
      4,
    );
    const table = equationAtomCounts(q.workedAnswer[0].text);
    assert.deepEqual(
      table.map((r) => [r.element, r.reactants, r.products]),
      [
        ['Al', 2, 2],
        ['H', 6, 6],
        ['Cl', 6, 6],
      ],
    );
    assert.equal(
      q.parts.every((p) =>
        id === 'EQ-00000T'
          ? p.kind === 'numeric' && !!p.coefficientEntry
          : p.kind === 'choice' && !!p.stateEntry,
      ),
      true,
    );
  }
  const old = equationsQuestion(equationsRef('EQ-000008'));
  assert.equal(old.parts.length, 8);
  assert.equal(old.chemicalPresentation.kind, 'equation-rows');
  assert.deepEqual(
    old.chemicalPresentation.rows.map((r) => r.task),
    ['balance', 'states'],
  );
  const [balance, states] = old.chemicalPresentation.rows;
  for (const s of [...balance.reactants, ...balance.products])
    assert.equal(s.statePartId, undefined);
  for (const s of [...states.reactants, ...states.products]) {
    assert.equal(s.coefficient.kind, 'response');
    assert.equal(s.coefficient.readOnly, true);
    assert.ok(s.statePartId);
  }
  const full = {
    ...boxResponses('EQ-000008', ['1', '3', '1', '1.5']),
    'r0-state': choice('(s)'),
    'r1-state': choice('(aq)'),
    'p0-state': choice('(aq)'),
    'p1-state': choice('(g)'),
  };
  assert.equal(earned(outcome('EQ-000008', full)), 8);
  for (const id of ['EQ-00000H', 'EQ-00000I', 'EQ-00000J', 'EQ-00000K'])
    assert.equal(equationsQuestion(equationsRef(id)).parts[0].marks, 2);
  for (const id of [
    'EQ-00000L',
    'EQ-00000M',
    'EQ-00000N',
    'EQ-00000O',
    'EQ-00000P',
    'EQ-00000Q',
    'EQ-00000R',
    'EQ-00000S',
  ])
    assert.equal(equationsQuestion(equationsRef(id)).parts[0].marks, 3);
  for (let seed = 0; seed < 70; seed++)
    assert.notEqual(
      equationsProvider.select({
        activityId: 'igcse/equations',
        level: 1,
        seed,
        previousQuestionIds: [],
      }).questionId,
      'EQ-000008',
    );
});
test('formula models contain exactly4 checked explanation lines and no duplicate formula suffix', () => {
  const q = formulaeQuestion(formulaeRef('FO-00000T', 123));
  assert.deepEqual(q.workedAnswer[0], { kind: 'formula', text: 'Cu(NO3)2' });
  assert.equal(q.workedAnswer.length, 5);
  assert.equal(
    q.workedAnswer.slice(1).every((b) => b.kind === 'text'),
    true,
  );
  assert.deepEqual(
    q.workedAnswer.slice(1).map((b) => b.text),
    [
      'Copper(II) is Cu^2+ and nitrate is NO3^-.',
      'The lowest whole-number ion ratio is 1:2.',
      'Total positive and negative charge cancel.',
      'Put brackets around each repeated polyatomic ion.',
    ],
  );
  assert.equal(
    q.workedAnswer.some((b) => b.text?.includes('Formula:')),
    false,
  );
  const simple = formulaeQuestion(formulaeRef('FO-000001', 0));
  assert.equal(
    simple.workedAnswer[4].text,
    'No polyatomic ion is repeated, so no brackets are needed.',
  );
});
test('original28 records, original1-S mappings and original36 review pins deep-identical', async () => {
  const before = await import(
    './fixtures/formulae-equations-followup/equations-bank-before.ts'
  );
  assert.deepEqual(equationBank.slice(0, 28), before.equationBank);
  const read = async (p) =>
    JSON.parse(await fs.readFile(new URL('../../' + p, import.meta.url), 'utf8'));
  const baseline = await read(
    'scripts/tests/fixtures/formulae-equations-followup/canonical-fixed-ids-before.json',
  );
  const current = await read('src/content/canonical-fixed-ids.json');
  assert.deepEqual(Object.entries(current.EQ).slice(0, 28), Object.entries(baseline.EQ));
  const oldReview = await read(
    'scripts/tests/fixtures/formulae-equations-followup/review-index-before.json',
  );
  const newReview = await read('resources/recall-formulae/content/review-index.json');
  assert.equal(newReview.entries.length, 38);
  assert.deepEqual(newReview.entries.slice(0, 36), oldReview.entries);
  assert.deepEqual(
    newReview.entries.slice(-2).map((e) => e.id),
    ['EQ-00000T', 'EQ-00000U'],
  );
});
