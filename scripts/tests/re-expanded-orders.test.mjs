import test from 'node:test';
import assert from 'node:assert/strict';
import { makeExpandedOrders } from '../../src/activities/alevel/rate-equations/expanded-orders.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { equivalentRateLaw, parseRateUnits } from '../../src/activities/alevel/rate-equations/input-syntax.ts';

const near = (actual, expected) => assert(Math.abs(actual - expected) <= Math.max(1e-12, Math.abs(expected) * 1e-7), `${actual} != ${expected}`);
const inferOrder = (concentrationRatio, rateRatio) => {
  const matches = [0, 1, 2].filter(order => Math.abs(concentrationRatio ** order - rateRatio) <= Math.max(1e-9, Math.abs(rateRatio) * 1e-7));
  assert.equal(matches.length, 1, 'The displayed ratios must determine one bounded order.');
  return matches[0];
};

// This oracle reads student-visible rows and prediction prompts only. It does
// not reuse the factory's parameter arrays or its validation/answer values.
function derive(question) {
  const rows = question.context.find(block => block.kind === 'table').rows.map(row => row.map(Number));
  const single = rows[0].length === 3;
  const rateColumn = single ? 2 : 3;
  const m = inferOrder(rows[1][1] / rows[0][1], rows[1][rateColumn] / rows[0][rateColumn]);
  const responses = { 'order-a': { kind: 'choice', selected: [String(m)] } };
  if (single) return { m, n: 0, responses, rows };
  const n = inferOrder(rows[2][2] / rows[0][2], (rows[2][3] / rows[0][3]) / (rows[2][1] / rows[0][1]) ** m);
  const k = rows[0][3] / (rows[0][1] ** m * rows[0][2] ** n);
  for (const row of rows) near(row[3] / (row[1] ** m * row[2] ** n), k);
  responses['order-b'] = { kind: 'choice', selected: [String(n)] };
  responses['rate-equation'] = { kind: 'text', value: `rate = k[B]^${n}[A]^${m}` };
  if (question.parts.some(part => part.id === 'k')) {
    responses.k = { kind: 'numeric', raw: String(k), unit: '' };
    // Rate units divided by (mol dm^-3)^(m+n).
    responses['k-units'] = { kind: 'text', value: `s-1 mol^${1 - m - n} dm^${3 * (m + n - 1)}` };
  } else {
    const part = question.parts.find(part => part.id === 'predicted-rate');
    const prompt = part.prompt.map(block => block.text).join(' ');
    const concentrations = /\[A\] = ([\d.e+-]+) mol dm⁻³ and \[B\] = ([\d.e+-]+) mol dm⁻³/.exec(prompt);
    assert(concentrations, 'Prediction concentrations must be readable from the displayed prompt.');
    responses['predicted-rate'] = { kind: 'numeric', raw: String(k * Number(concentrations[1]) ** m * Number(concentrations[2]) ** n), unit: 'mol dm⁻³ s⁻¹' };
  }
  return { m, n, k, responses, rows };
}

function studentSignature(question) {
  return JSON.stringify({
    title: question.title, context: question.context,
    parts: question.parts.map(({ id, kind, prompt, options, unit }) => ({ id, kind, prompt, options, unit })),
  });
}

test('expanded orders provide 100 distinct displayed contexts per level and reproducible uint32 seeds', () => {
  for (const level of [1, 2, 3]) {
    const signatures = new Set();
    for (let seed = 0; seed < 100; seed++) {
      const example = makeExpandedOrders(level, seed);
      assert.deepEqual(makeExpandedOrders(level, seed), example);
      assert.equal(example.question.ref.activityId, 'alevel/rate-equations');
      assert.equal(example.question.ref.questionId, `RATE-EXP-orders-L${level}`);
      assert.equal(example.question.ref.seed, seed);
      assert.equal(example.validation.variantIndex, seed);
      assert.equal(example.validation.variantCount, 100);
      assert.equal(example.question.parts.length, [0, 1, 5, 4][level]);
      assert.equal(signatures.has(studentSignature(example.question)), false, `Duplicate displayed L${level} seed ${seed}`);
      signatures.add(studentSignature(example.question));
      const repeated = makeExpandedOrders(level, seed + 100);
      assert.equal(studentSignature(repeated.question), studentSignature(example.question));
      assert.deepEqual(repeated.correctResponses, example.correctResponses);
      assert.equal(repeated.question.ref.seed, seed + 100);
    }
    assert.equal(signatures.size, 100);
    for (const seed of [0, 99, 100, 101, 65535, 0xfffffffe, 0xffffffff]) {
      const example = makeExpandedOrders(level, seed);
      assert.equal(example.validation.variantIndex, seed % 100);
      assert.equal(example.question.ref.seed, seed);
      assert.deepEqual(example, makeExpandedOrders(level, seed));
    }
  }
  for (const seed of [-1, 1.5, NaN, Infinity, 0x100000000]) assert.throws(() => makeExpandedOrders(1, seed));
  for (const level of [0, 4, '1']) assert.throws(() => makeExpandedOrders(level, 0));
});

test('all 300 displayed datasets independently determine the answer model, units and prediction', () => {
  for (const level of [1, 2, 3]) {
    const orders = new Set(), constants = new Set(), aRatios = new Set(), bRatios = new Set();
    for (let seed = 0; seed < 100; seed++) {
      const example = makeExpandedOrders(level, seed);
      const derived = derive(example.question);
      const { m, n, k, rows } = derived;
      const answers = example.correctResponses;
      assert.deepEqual(Object.keys(answers).sort(), example.question.parts.map(part => part.id).sort());
      assert.deepEqual(answers['order-a'], derived.responses['order-a']);
      assert.equal(example.validation.m, m);
      assert.equal(example.validation.n, n);
      aRatios.add(Number((rows[1][1] / rows[0][1]).toFixed(8)));
      orders.add(`${m}/${n}`);
      for (const row of rows) assert(row.slice(1).every(value => Number.isFinite(value) && value > 0));
      if (level === 1) {
        near(rows[1][2] / rows[0][2], (rows[1][1] / rows[0][1]) ** m);
      } else {
        assert.deepEqual(answers['order-b'], derived.responses['order-b']);
        assert(equivalentRateLaw(answers['rate-equation'].value, derived.responses['rate-equation'].value, ['A', 'B']));
        near(example.validation.k, k);
        constants.add(Number(k.toFixed(8)));
        bRatios.add(Number((rows[2][2] / rows[0][2]).toFixed(8)));
        if (level === 2) {
          near(Number(answers.k.raw), k);
          assert.deepEqual(parseRateUnits(answers['k-units'].value), { dm: 3 * (m + n - 1), mol: 1 - m - n, s: -1 });
          near(example.question.parts.find(part => part.id === 'k').acceptance.expected, k);
        } else {
          const predicted = Number(derived.responses['predicted-rate'].raw);
          near(Number(answers['predicted-rate'].raw), predicted);
          near(example.question.parts.find(part => part.id === 'predicted-rate').acceptance.expected, predicted);
          near(example.validation.predictedRate, predicted);
        }
      }
    }
    assert.equal(orders.size, level === 1 ? 3 : 6);
    assert.equal(aRatios.size, 3);
    if (level > 1) { assert.equal(constants.size, 7); assert.equal(bRatios.size, 3); }
  }
});

test('all 300 independently derived responses earn full marks and each representative wrong part loses marks', () => {
  for (const level of [1, 2, 3]) for (let seed = 0; seed < 100; seed++) {
    const example = makeExpandedOrders(level, seed);
    const derived = derive(example.question);
    for (const responses of [derived.responses, example.correctResponses]) {
      const result = rateMarking.mark(example.question, responses);
      assert(result.accepted, `L${level}/${seed} must accept complete input.`);
      assert.equal(result.marks.earned, result.marks.available, `L${level}/${seed} must award full marks.`);
    }
    for (const part of example.question.parts) {
      const responses = structuredClone(derived.responses);
      if (part.kind === 'choice') responses[part.id].selected = [String((Number(responses[part.id].selected[0]) + 1) % 3)];
      else if (part.kind === 'numeric') responses[part.id].raw = String(Number(responses[part.id].raw) * 1.1);
      else if (part.id === 'rate-equation') responses[part.id].value = `k[A]^${derived.m === 1 ? 2 : 1}[B]^${derived.n}`;
      else responses[part.id].value = 's-1 mol-1 dm-3';
      const result = rateMarking.mark(example.question, responses);
      assert(result.accepted);
      assert.equal(result.marks.earned, result.marks.available - part.marks, `L${level}/${seed}/${part.id} must reject the wrong answer.`);
      assert.equal(result.marks.points.find(point => point.partId === part.id).earned, 0);
    }
  }
});
