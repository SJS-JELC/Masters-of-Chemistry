import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { newOrderFactories } from '../../src/activities/alevel/rate-equations/new-orders.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { parseRateUnits, equivalentRateLaw, equivalentRateUnits } from '../../src/activities/alevel/rate-equations/input-syntax.ts';

const make = (id, seed = 0) => newOrderFactories[`RATE-NEW-orders-${id}`](Number(id.at(-1)), seed);
const near = (actual, expected, tolerance = 2e-8) => assert(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * tolerance), `${actual} != ${expected}`);
const table = example => example.question.context.find(block => block.kind === 'table');
const answer = (example, id) => Number(example.correctResponses[id].raw);
const correctChoice = (example, id) => {
  const part = example.question.parts.find(part => part.id === id);
  return part.options.find(option => option.id === example.correctResponses[id].selected[0]).content.map(block => block.text).join('');
};
const expectedNumeric = (example, id, expected) => {
  near(answer(example, id), expected);
  const part = example.question.parts.find(part => part.id === id);
  near(part.acceptance.expected, expected);
};
const unitsByOverall = ['mol dm-3 s-1', 's-1', 'dm3 mol-1 s-1', 'dm6 mol-2 s-1', 'dm9 mol-3 s-1'];

// The solver knows neither generator orders nor validation metadata. It enumerates
// the allowed integer orders, using only concentrations and rates visible to pupils.
function solveVisibleOrders(rows) {
  const columns = rows[0].length - 2;
  const initial = rows[0].slice(1, -1).map(Number), rate = Number(rows[0].at(-1));
  const solutions = [];
  for (let encoded = 0; encoded < 3 ** columns; encoded++) {
    const orders = Array.from({ length: columns }, (_, column) => Math.floor(encoded / 3 ** column) % 3);
    const matches = rows.every(row => {
      const predictedRatio = initial.reduce((ratio, value, column) => ratio * (Number(row[column + 1]) / value) ** orders[column], 1);
      const visibleRatio = Number(row.at(-1)) / rate;
      return Math.abs(visibleRatio - predictedRatio) <= Math.abs(visibleRatio) * 2e-8;
    });
    if (matches) solutions.push(orders);
  }
  assert.equal(solutions.length, 1, 'Visible initial-rate data must determine exactly one set of orders.');
  const orders = solutions[0];
  return { orders, k: rate / initial.reduce((product, value, column) => product * value ** orders[column], 1) };
}

test('representative: five formats have checked concrete answers before scaling', () => {
  assert.equal(correctChoice(make('units-L1'), 'overall-order'), '0');
  const excess = make('excess-L2');
  assert.match(correctChoice(excess, 'excess-reason'), /negligible proportion/);
  assert.match(correctChoice(excess, 'excess-conclusion'), /cannot establish/);
  const three = make('three-L3');
  assert.deepEqual(solveVisibleOrders(table(three).rows).orders, [1, 1, 2]);
  expectedNumeric(three, 'k', 0.5);
  assert(equivalentRateUnits(three.correctResponses['k-units'].value, 'dm9 mol-3 s-1'));
  const ph = make('ph-L3');
  expectedNumeric(ph, 'initial-h', 0.1);
  expectedNumeric(ph, 'final-h', Math.sqrt(0.001));
  expectedNumeric(ph, 'predicted-rate', 0.00024 * Math.sqrt(0.1));
  const dilution = make('dilution-L3');
  expectedNumeric(dilution, 'diluted-concentration', 10 ** -1.2);
  expectedNumeric(dilution, 'predicted-rate', 0.00024 * 10 ** -1.2 / 0.2);
});

test('source provenance: reviewed atlas records, specification and hashes exist', () => {
  const workspace = path.resolve(import.meta.dirname, '../../../..');
  const atlas = JSON.parse(fs.readFileSync(path.join(workspace, 'resources/a-level-past-paper-atlas/data/aggregate.json'), 'utf8'));
  const recordedIds = new Set(atlas.units.map(unit => unit.unit_id));
  for (const [id, factory] of Object.entries(newOrderFactories)) {
    const example = factory(Number(id.at(-1)), 0);
    assert(recordedIds.has(example.validation.sourceId));
    for (const source of example.question.sources)
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
  }
});

test('all three bounded numerical banks have100 distinct visible contexts, deterministic modulo100 and full seeds', () => {
  for (const id of ['three-L3', 'ph-L3', 'dilution-L3']) {
    const contexts = new Set();
    for (let seed = 0; seed < 100; seed++) {
      const example = make(id, seed), repeat = make(id, seed + 100);
      contexts.add(JSON.stringify(example.question.context));
      assert.deepEqual(make(id, seed), example);
      assert.deepEqual(repeat.question.context, example.question.context);
      assert.deepEqual(repeat.correctResponses, example.correctResponses);
      assert.equal(repeat.question.ref.seed, seed + 100);
      assert.equal(example.validation.variantIndex, seed);
      assert.equal(example.validation.variantCount, 100);
    }
    assert.equal(contexts.size, 100, id);
    assert.equal(make(id, 0xffffffff).question.ref.seed, 0xffffffff);
    assert.deepEqual(make(id, 0xffffffff).question.context, make(id, 95).question.context);
  }
});

test('three reactants: independent visible-table enumeration validates all orders, law, k and dimensions across100', () => {
  for (let seed = 0; seed < 100; seed++) {
    const example = make('three-L3', seed), rows = table(example).rows;
    const solved = solveVisibleOrders(rows);
    const species = ['A', 'B', 'C'];
    solved.orders.forEach((order, index) => assert.equal(Number(correctChoice(example, `order-${species[index].toLowerCase()}`)), order));
    assert(equivalentRateLaw(example.correctResponses['rate-equation'].value, `k${species.map((name, index) => `[${name}]^${solved.orders[index]}`).join('')}`, species));
    expectedNumeric(example, 'k', solved.k);
    assert(equivalentRateUnits(example.correctResponses['k-units'].value, unitsByOverall[solved.orders.reduce((sum, order) => sum + order, 0)]));
    for (const changed of [rows[2], rows[3]])
      assert.equal(changed.slice(1, -1).filter((value, column) => Number(value) !== Number(rows[0][column + 1])).length, 2);
  }
});

test('pH first-order application: visible pH and rate independently predict every numerical answer across100', () => {
  for (let seed = 0; seed < 100; seed++) {
    const example = make('ph-L3', seed), rows = table(example).rows;
    const initialH = 10 ** -Number(rows[0][1]), finalH = 10 ** -Number(rows[1][1]);
    expectedNumeric(example, 'initial-h', initialH);
    expectedNumeric(example, 'final-h', finalH);
    expectedNumeric(example, 'concentration-factor', finalH / initialH);
    expectedNumeric(example, 'predicted-rate', Number(rows[0][2]) * finalH / initialH);
  }
});

test('strong-acid dilution: visible original concentration, diluted pH and rate independently checked across100', () => {
  for (let seed = 0; seed < 100; seed++) {
    const example = make('dilution-L3', seed), rows = table(example).rows;
    const original = Number(rows[0][1]), diluted = 10 ** -Number(rows[1][2]);
    assert(diluted < original);
    assert.match(example.question.context[0].text, /fully dissociated monoprotic strong acid/);
    expectedNumeric(example, 'diluted-concentration', diluted);
    expectedNumeric(example, 'concentration-factor', diluted / original);
    expectedNumeric(example, 'predicted-rate', Number(rows[0][3]) * diluted / original);
  }
});

test('fixed concept pools: dimensions match order, all options are unique, and excess never claims true zero order', () => {
  const unitContexts = new Set(), excessContexts = new Set(), unitAnswerPositions = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const example = make('units-L1', seed), caption = example.question.context.find(block => block.kind === 'formula').text;
    const powers = parseRateUnits(caption.slice('Units of k: '.length));
    const n = Number(correctChoice(example, 'overall-order'));
    assert.equal(powers.mol, 1 - n);
    assert.equal(powers.dm, 3 * (n - 1));
    assert.equal(powers.s, -1);
    unitContexts.add(JSON.stringify(example.question.context));
    unitAnswerPositions.add(example.correctResponses['overall-order'].selected[0]);
    const excess = make('excess-L2', seed);
    excessContexts.add(JSON.stringify(excess.question.context));
    assert.match(correctChoice(excess, 'excess-reason'), /negligible proportion|effective rate constant/);
    assert.match(correctChoice(excess, 'excess-conclusion'), /cannot establish|varied separately/);
    for (const item of [example, excess]) for (const part of item.question.parts) {
      assert.equal(new Set(part.options.map(option => JSON.stringify(option.content))).size, part.options.length);
      assert(part.options.some(option => option.id === item.correctResponses[part.id].selected[0]));
    }
  }
  assert.equal(unitContexts.size, 5);
  assert.equal(unitAnswerPositions.size, 5);
  assert.equal(excessContexts.size, 2);
});

test('all factories reject wrong level and invalid seeds and expose only automatically marked standard parts', () => {
  for (const [id, factory] of Object.entries(newOrderFactories)) {
    const level = Number(id.at(-1));
    for (const bad of [NaN, -1, 0.5, 0x100000000, Infinity]) assert.throws(() => factory(level, bad));
    for (const wrong of [0, 1, 2, 3, 4].filter(value => value !== level)) assert.throws(() => factory(wrong, 0));
    for (let seed = 0; seed < 100; seed++) {
      const example = factory(level, seed);
      assert.equal(example.question.ref.questionId, id);
      assert.equal(example.question.ref.activityId, 'alevel/rate-equations');
      assert.equal(example.question.parts.length, Object.keys(example.correctResponses).length);
      assert.equal(new Set(example.question.parts.map(part => part.id)).size, example.question.parts.length);
      assert(example.question.parts.every(part => ['choice', 'numeric', 'text'].includes(part.kind) && part.required && part.marks === 1));
      for (const part of example.question.parts.filter(part => part.kind === 'choice')) {
        assert.equal(new Set(part.options.map(option => option.id)).size, part.options.length);
        assert.equal(new Set(part.options.map(option => JSON.stringify(option.content))).size, part.options.length);
      }
    }
  }
});

test('integration marking: complete correct responses, incomplete input and wrong answers independently exercised for every variant', () => {
  for (const [id, factory] of Object.entries(newOrderFactories)) for (let seed = 0; seed < 100; seed++) {
    const example = factory(Number(id.at(-1)), seed), correct = rateMarking.mark(example.question, example.correctResponses);
    assert(correct.accepted, id);
    assert.equal(correct.marks.earned, example.question.parts.length, `${id}:${seed}`);
    assert.equal(correct.marks.available, example.question.parts.length);
    assert.equal(rateMarking.mark(example.question, {}).accepted, false);
    for (const part of example.question.parts) {
      const original = example.correctResponses[part.id];
      const wrong = part.kind === 'choice'
        ? { kind: 'choice', selected: [part.options.find(option => !original.selected.includes(option.id)).id] }
        : part.kind === 'numeric' ? { ...original, raw: String(Number(original.raw) * 2 + 1) }
          : { kind: 'text', value: part.id === 'rate-equation' ? 'k[A][D]' : 'mol dm-3 s-1' };
      const result = rateMarking.mark(example.question, { ...example.correctResponses, [part.id]: wrong });
      assert(result.accepted);
      assert.equal(result.marks.earned, correct.marks.earned - 1, `${id}:${seed}:${part.id}`);
      if (part.kind === 'numeric' && part.unit) {
        const badUnit = rateMarking.mark(example.question, { ...example.correctResponses, [part.id]: { ...original, unit: 's' } });
        assert(badUnit.accepted);
        assert.equal(badUnit.marks.earned, correct.marks.earned - 1);
      }
    }
  }
});

test('integration marking: reordered typed three-species laws and equivalent unit notation are accepted, wrong species/order rejected', () => {
  for (let seed = 0; seed < 100; seed++) {
    const example = make('three-L3', seed), solved = solveVisibleOrders(table(example).rows);
    const value = `k[C]^${solved.orders[2]}[A]^${solved.orders[0]}[B]^${solved.orders[1]}`;
    const unit = unitsByOverall[solved.orders.reduce((sum, order) => sum + order, 0)];
    const alternative = rateMarking.mark(example.question, { ...example.correctResponses, 'rate-equation': { kind: 'text', value }, 'k-units': { kind: 'text', value: unit.split(' ').reverse().join(' ') } });
    assert(alternative.accepted);
    assert.equal(alternative.marks.earned, 6);
    for (const badLaw of ['k[A][B][D]', 'k[A]^3[B][C]', 'k[A]^-1[B][C]', 'K[A][B][C]']) {
      const wrong = rateMarking.mark(example.question, { ...example.correctResponses, 'rate-equation': { kind: 'text', value: badLaw } });
      assert(wrong.accepted);
      assert.equal(wrong.marks.earned, 5);
    }
  }
});
