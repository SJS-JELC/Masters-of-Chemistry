import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { newGraphFactories } from '../../src/activities/alevel/rate-equations/new-graphs.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { tangentGeometry } from '../../src/activities/alevel/rate-equations/tangent-geometry.ts';

const make = (format, seed = 0) => newGraphFactories[`RATE-NEW-graphs-${format}-L${['deduce', 'mixed'].includes(format) ? 3 : 1}`](['deduce', 'mixed'].includes(format) ? 3 : 1, seed);
const close = (actual, expected, tolerance = 1e-10) => assert(Math.abs(actual - expected) <= Math.abs(expected) * tolerance + 1e-18, `${actual} != ${expected}`);
const answer = (e, id) => Number(e.correctResponses[id].raw);
const displayedNumber = value => Number(value.replace(/ × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, exponent) =>
  `e${[...exponent].map(c => c === '⁻' ? '-' : '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}`));
const visible = e => JSON.stringify({ context: e.question.context, parts: e.question.parts.map(({ acceptance, acceptedOptionSets, accepted, ...p }) => p), graph: e.graph, staticPlots: e.staticPlots });
function curveReadings(g) {
  // Independent model produces the 161 visible plotting samples. Reverse inference
  // below uses these readings, not factory validation metadata or expected answers.
  return Array.from({ length: 161 }, (_, i) => {
    const t = g.maxTime * i / 160;
    const y = g.order === 0 ? Math.max(0, g.initial - g.k * t) : g.order === 1 ? g.initial / Math.exp(g.k * t) : 1 / (1 / g.initial + g.k * t);
    return { t, y };
  });
}
function timeFor(readings, concentration) {
  const i = readings.findIndex(row => row.y <= concentration);
  if (i === 0) return 0;
  assert(i > 0, 'Required concentration is visible in graph bounds');
  const a = readings[i - 1], b = readings[i];
  return a.t + (a.y - concentration) / (a.y - b.y) * (b.t - a.t);
}

test('checked representative for each graph format before numerical scaling', () => {
  const initial = make('initial');
  close(answer(initial, 'rate'), 0.12 * Math.log(2) / 30);
  assert.equal(initial.graph.initialMarker, 0);
  const half = make('half-concentration');
  assert.equal(answer(half, 'half-life'), 12);
  assert.deepEqual(half.correctResponses.reason.selected, ['independent']);
  const deduce = make('deduce');
  assert.deepEqual(deduce.correctResponses.order.selected, ['zero']);
  close(answer(deduce, 'rate'), 0.0005);
  close(answer(deduce, 'k'), 0.0005);
  const mixed = make('mixed');
  close(answer(mixed, 'k'), 0.0002);
  assert.equal(mixed.correctResponses['rate-equation'].value, 'rate = k[A][C]');
  assert.equal(mixed.correctResponses['k-units'].value, 'dm³ mol⁻¹ s⁻¹');
  assert.deepEqual(mixed.correctResponses.reason.selected, ['mismatch']);
  for (let seed = 0; seed < 4; seed++) {
    const e = make('shapes', seed), p = e.staticPlots[0];
    const ys = p.points.map(r => r.y);
    assert.deepEqual(e.correctResponses.order.selected, [['zero'], ['first'], ['second'], ['zero']][seed]);
    if (seed === 0) assert(ys.every(y => y === ys[0]));
    if (seed === 1) close(p.points[40].y / ys.at(-1), 0.5);
    if (seed === 2) close(p.points[40].y / ys.at(-1), 0.25);
    if (seed === 3) close(ys[40], (ys[0] + ys.at(-1)) / 2);
  }
});

test('400 numerical variants plus four fixed shapes have valid complete automatic marking and distinct visible evidence', () => {
  for (const [id, factory] of Object.entries(newGraphFactories)) {
    const level = Number(id.at(-1)), count = id.includes('shapes') ? 4 : 100, signatures = new Set();
    for (let seed = 0; seed < count; seed++) {
      const e = factory(level, seed);
      signatures.add(visible(e));
      assert.equal(e.question.ref.questionId, id);
      assert.equal(e.question.ref.seed, seed);
      assert.equal(e.gem, 'graphs');
      assert.deepEqual(e, factory(level, seed));
      assert.equal(Object.keys(e.correctResponses).length, e.question.parts.length);
      assert.equal(new Set(e.question.parts.map(p => p.id)).size, e.question.parts.length);
      assert(e.question.parts.every(p => ['choice', 'numeric', 'text'].includes(p.kind)));
      const result = rateMarking.mark(e.question, e.correctResponses);
      assert.equal(result.accepted, true);
      assert.equal(result.marks.earned, result.marks.available, id);
      for (const p of e.question.parts) {
        const bad = p.kind === 'numeric' ? { kind: 'numeric', raw: String(answer(e, p.id) * 1.1), unit: p.unit }
          : p.kind === 'choice' ? { kind: 'choice', selected: [p.options.find(o => !p.acceptedOptionSets[0].includes(o.id)).id] }
          : { kind: 'text', value: p.id === 'rate-equation' ? 'rate = k[A][B][C]' : 'mol⁻⁵ s⁻²' };
        assert(rateMarking.mark(e.question, { ...e.correctResponses, [p.id]: bad }).marks.earned < result.marks.available);
        if (p.kind === 'numeric') assert.equal(rateMarking.mark(e.question, { ...e.correctResponses, [p.id]: { kind: 'numeric', raw: answer(e, p.id).toPrecision(3), unit: p.unit } }).marks.earned, result.marks.available);
      }
    }
    assert.equal(signatures.size, count, id);
    for (const seed of [100, 2026, 0x7fffffff, 0xffffffff]) {
      const e = factory(level, seed);
      assert.equal(e.question.ref.seed, seed);
      assert.equal(visible(e), visible(factory(level, seed % count)));
    }
    for (const seed of [-1, 1.1, 0x100000000, NaN]) assert.throws(() => factory(level, seed), RangeError);
    assert.throws(() => factory(level === 1 ? 3 : 1, 0), RangeError);
  }
});

test('visible concentration curves independently support initial tangent and100 distinct zero/first deduced orders, rates and k units', () => {
  const orders = new Set(), signatures = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const initial = make('initial', seed), g0 = initial.graph;
    const dt = g0.maxTime / 100000;
    const numericalInitialRate = (g0.initial - g0.initial / Math.exp(g0.k * dt)) / dt;
    close(answer(initial, 'rate'), numericalInitialRate, 0.00003);
    const tangent = tangentGeometry(0, g0.maxTime, 0, g0.initial * 1.1, 0, g0.initial, -numericalInitialRate, true);
    assert(tangent.firstX >= 0 && tangent.secondX <= g0.maxTime && tangent.dx > 0 && tangent.dy < 0);
    close(-tangent.dy / tangent.dx, answer(initial, 'rate'), 0.00003);
    const e = make('deduce', seed), g = e.graph, readings = curveReadings(g);
    signatures.add(visible(e));
    assert([0, 1].includes(g.order));
    assert.equal(e.validation.variantCount, 100);
    const half = timeFor(readings, g.initial / 2), quarter = timeFor(readings, g.initial / 4);
    const ratio = (quarter - half) / half;
    const inferred = ratio < 0.75 ? 0 : ratio > 1.5 ? 2 : 1;
    orders.add(inferred);
    close(answer(e, 'half-life-1'), half, 0.0004);
    close(answer(e, 'half-life-2'), quarter - half, 0.0008);
    assert.deepEqual(e.correctResponses.order.selected, [[ 'zero' ], [ 'first' ], [ 'second' ]][inferred]);
    assert.deepEqual(e.correctResponses.reason.selected, [[ 'halving' ], [ 'constant' ], [ 'doubling' ]][inferred]);
    const at = g.initialMarker, h = 1e-5;
    const y = t => g.order === 0 ? g.initial - g.k * t : g.order === 1 ? g.initial / Math.exp(g.k * t) : 1 / (1 / g.initial + g.k * t);
    const concentration = y(at), rate = (y(at - h) - y(at + h)) / (2 * h * 60), k = rate / concentration ** inferred;
    close(answer(e, 'concentration'), concentration);
    close(answer(e, 'rate'), rate, 1e-8);
    close(answer(e, 'k'), k, 1e-8);
    assert.equal(e.question.parts.find(p => p.id === 'k').unit, '');
    assert.equal(e.correctResponses['k-units'].value, ['mol dm⁻³ s⁻¹', 's⁻¹', 'dm³ mol⁻¹ s⁻¹'][inferred]);
    close(at * 10, Math.round(at * 10));
    const context = e.question.context.map(b => b.text).join(' ');
    assert(!/reaction is (zero|first|second) order/.test(context));
    assert(!context.includes('second order'));
    assert(!context.includes('Extension'));
    assert(!Object.hasOwn(e.validation, 'extension'));
    assert.equal(e.question.parts.find(p => p.id === 'order').options.length, 3);
    const model = e.question.workedAnswer[0].text;
    assert(model.indexOf('min × 60 =') < model.indexOf('Rate ='));
  }
  assert.deepEqual([...orders].sort(), [0, 1]);
  assert.equal(signatures.size, 100);
});

test('visible half-life data and mixed representations reconstruct every numerical answer without hidden validation metadata', () => {
  for (let seed = 0; seed < 100; seed++) {
    const half = make('half-concentration', seed), halfTable = half.question.context.find(b => b.kind === 'table');
    assert.notEqual(halfTable.rows[0][1], halfTable.rows[1][1]);
    assert.equal(answer(half, 'half-life'), Number(halfTable.rows[0][2]));
    assert.deepEqual(half.correctResponses.reason.selected, ['independent']);
    const e = make('mixed', seed), table = e.question.context.find(b => b.kind === 'table');
    const [[, A, B, C, r], [, A2, B2, C2, r2]] = table.rows.map(row => row.map(displayedNumber));
    close(B, B2); close(C, C2);
    close(Math.log(r2 / r) / Math.log(A2 / A), 1, 0.00004);
    close(answer(e, 'k'), r / (A * C), 0.00002);
    const [bPlot, cPlot] = e.staticPlots;
    const segments = bPlot.points.slice(1).map((row, i) => (row.y - bPlot.points[i].y) / (row.x - bPlot.points[i].x));
    assert(segments.every(s => s < 0));
    for (const slope of segments) close(slope, segments[0], 1e-10);
    close(-segments[0], answer(e, 'k') * 0.5 * 0.5);
    assert.equal(cPlot.points[0].x, 0); assert.equal(cPlot.points[0].y, 0);
    const cSlopes = cPlot.points.slice(1).map(row => row.y / row.x);
    for (const slope of cSlopes) close(slope, r / C, 0.00002);
    assert.deepEqual(['order-a', 'order-b', 'order-c'].map(id => e.correctResponses[id].selected), [['first'], ['zero'], ['first']]);
    assert.equal(e.correctResponses['rate-equation'].value, 'rate = k[A][C]');
    assert.equal(e.correctResponses['k-units'].value, 'dm³ mol⁻¹ s⁻¹');
    assert.deepEqual(e.correctResponses.reason.selected, ['mismatch']);
    for (const plot of e.staticPlots) {
      assert(plot.maxX > 0 && plot.maxY > 0);
      assert(plot.points.every(p => p.x >= 0 && p.x <= plot.maxX && p.y >= 0 && p.y <= plot.maxY));
    }
  }
});

test('reviewed source packet and specification fingerprints are current', () => {
  const workspace = path.resolve(import.meta.dirname, '../../../..'), seen = new Set();
  for (const factory of Object.values(newGraphFactories)) {
    const level = factory === newGraphFactories['RATE-NEW-graphs-deduce-L3'] || factory === newGraphFactories['RATE-NEW-graphs-mixed-L3'] ? 3 : 1;
    for (const source of factory(level, 0).question.sources) {
      if (seen.has(source.path)) continue;
      seen.add(source.path);
      assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
    }
  }
  assert.equal([...seen].filter(p => p.endsWith('.pdf')).length, 6);
});
