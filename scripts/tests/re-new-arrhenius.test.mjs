import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { newArrheniusFactories } from '../../src/activities/alevel/rate-equations/new-arrhenius.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';

const id = 'RATE-NEW-arrhenius-temperature-L3';
const factory = newArrheniusFactories[id];
const powers = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const parseDisplayed = value => Number(value.replace(/ × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, power) =>
  `e${[...power].map(char => char === '⁻' ? '-' : powers.indexOf(char)).join('')}`));
const close = (actual, expected, tolerance = 1e-10) =>
  assert(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}, tolerance ${tolerance}`);
const visible = example => JSON.stringify({
  title: example.question.title, context: example.question.context,
  parts: example.question.parts.map(({ acceptance, ...rest }) => rest), graph: example.graph,
});
function givenK(example) {
  return parseDisplayed(example.question.parts[0].prompt[0].text.match(/k = (.*?) s⁻¹/)[1]);
}

test('representative OCR Q21(b)(iii) operation recovers Celsius rather than k or Ea', () => {
  // Independent source-style chain, reviewed against packet pages 3, 4 and 7.
  close(Math.log(0.075), -2.5902671654458267);
  const reciprocalFromSourceGraph = 3.10e-3;
  const sourceStyleCelsius = 1 / reciprocalFromSourceGraph - 273.15;
  close(sourceStyleCelsius, 49.43064516129033);
  assert(sourceStyleCelsius >= 48.5 && sourceStyleCelsius <= 50.6);
  const example = factory(3, 0);
  const rows = example.question.context.find(block => block.kind === 'table').rows;
  const x1 = 1 / Number(rows[0][2]), x2 = 1 / Number(rows.at(-1)[2]);
  const y1 = Number(rows[0][1]), y2 = Number(rows.at(-1)[1]);
  const gradient = (y2 - y1) / (x2 - x1), intercept = y1 - gradient * x1;
  const answer = 1 / ((Math.log(givenK(example)) - intercept) / gradient) - 273.15;
  close(answer, Number(example.correctResponses.temperature.raw), 0.01);
  assert.equal(example.question.parts.length, 1);
  assert.equal(example.question.parts[0].id, 'temperature');
  assert.equal(example.question.parts[0].marks, 2);
  assert.equal(example.question.parts[0].unit, '°C');
});

test('100 distinct variants conserve visible k, Arrhenius tables, graph bounds and temperatures', () => {
  const signatures = new Set(), curves = new Set(), answers = new Set(), scaled = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const example = factory(3, seed), graph = example.graph;
    assert.deepEqual(factory(3, seed), example);
    assert.deepEqual(example.question.ref, { activityId: 'alevel/rate-equations', questionId: id, level: 3, seed });
    assert.equal(example.gem, 'arrhenius');
    assert.equal(example.validation.variantIndex, seed);
    assert.equal(example.validation.variantCount, 100);
    signatures.add(visible(example));
    curves.add(JSON.stringify([graph.gradient, graph.intercept]));
    scaled.add(graph.scaledX);
    assert.equal(graph.kind, 'arrhenius');
    const k = givenK(example);
    const reciprocal = (Math.log(k) - graph.intercept) / graph.gradient;
    const kelvin = 1 / reciprocal, celsius = kelvin - 273.15;
    answers.add(celsius);
    assert(k > 0 && Number.isFinite(k));
    assert(kelvin > 0 && kelvin >= 300 && kelvin <= 380);
    assert(reciprocal > graph.minX && reciprocal < graph.maxX);
    close(Number(example.correctResponses.temperature.raw), celsius);
    close(example.validation.givenK, k);
    close(example.validation.temperatureKelvin, kelvin);
    close(example.validation.temperatureCelsius, celsius);
    close(example.validation.displayedGradient, graph.gradient / (graph.scaledX ? 1000 : 1));
    assert(-graph.gradient * 8.314 / 1000 > 0);
    const table = example.question.context.find(block => block.kind === 'table');
    assert.deepEqual(table.headers, ['k / s⁻¹', 'ln(k)', 'T / K', '(1/T) / K⁻¹']);
    assert.equal(table.rows.length, 5);
    const rows = table.rows.map(([rate, log, T, x]) => ({ k: parseDisplayed(rate), log: Number(log), T: Number(T), x: parseDisplayed(x) }));
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      close(row.x, 1 / row.T, 5e-8);
      close(Math.log(row.k), graph.intercept + graph.gradient / row.T, 5e-5);
      close(row.log, Math.log(row.k), 5e-5);
      assert(row.x > graph.minX && row.x < graph.maxX);
      if (i) assert(row.k > rows[i - 1].k);
      // Every pair of rounded visible coordinates independently supports the marking tolerance.
      for (const other of rows.slice(i + 1)) {
        const slope = (other.log - row.log) / (other.x - row.x);
        const offset = row.log - slope * row.x;
        const reconstructedC = 1 / ((Math.log(k) - offset) / slope) - 273.15;
        close(reconstructedC, celsius, 0.1);
      }
    }
  }
  assert.equal(signatures.size, 100);
  assert.equal(curves.size, 100);
  assert.equal(answers.size, 100);
  assert.deepEqual([...scaled].sort(), [false, true]);
});

test('all 100 model answers show the checked ln k → 1/T → K → Celsius chain', () => {
  for (let seed = 0; seed < 100; seed++) {
    const example = factory(3, seed), answer = example.question.workedAnswer[0].text;
    const log = Number(answer.match(/ln k = [\s\S]*?\n     = ([-.\d]+)/)[1]);
    const reciprocal = parseDisplayed(answer.match(/\n1\/T = (.*?) K⁻¹/)[1]);
    const kelvin = Number(answer.match(/\n  = ([.\d]+) K/)[1]);
    const celsius = Number(answer.match(/\n                  = ([-.\d]+) °C/)[1]);
    close(log, Math.log(givenK(example)), 1e-5);
    close(1 / reciprocal, kelvin, 0.01);
    close(kelvin - 273.15, Number(example.correctResponses.temperature.raw), 0.01);
    close(celsius, Number(example.correctResponses.temperature.raw), 0.1);
    assert(answer.includes('T − 273.15'));
    assert(answer.includes('(3 s.f.)'));
    assert(answer.indexOf('ln k =') < answer.indexOf('1/T ='));
    assert(answer.indexOf('1/T =') < answer.indexOf('T = 1 /'));
    assert(answer.indexOf('T = 1 /') < answer.indexOf('Temperature in °C'));
    assert.equal(example.question.scaffolds.length, 0);
    assert.equal(example.question.hints.length, 0);
  }
});

test('standard marking accepts exact and 3sf answers and rejects wrong units, Kelvin and bad inversions', () => {
  for (let seed = 0; seed < 100; seed++) {
    const example = factory(3, seed), question = example.question;
    const expected = Number(example.correctResponses.temperature.raw);
    const mark = (raw, unit = '°C') => rateMarking.mark(question, { temperature: { kind: 'numeric', raw: String(raw), unit } });
    const result = rateMarking.mark(question, example.correctResponses);
    assert.equal(result.accepted, true);
    assert.deepEqual([result.marks.earned, result.marks.available], [2, 2]);
    assert.equal(mark(expected.toPrecision(3)).marks.earned, 2);
    assert.equal(mark(expected + 1).marks.earned, 2);
    assert.equal(mark(expected - 1).marks.earned, 2);
    assert.equal(mark(expected + 1.2).marks.earned, 0);
    assert.equal(mark(expected - 1.2).marks.earned, 0);
    assert.equal(mark(expected, 'K').marks.earned, 0);
    assert.equal(mark(expected + 273.15).marks.earned, 0);
    assert.equal(mark((Math.log(givenK(example)) - example.graph.intercept) / example.graph.gradient - 273.15).marks.earned, 0);
    assert.equal(rateMarking.mark(question, {}).accepted, false);
  }
});

test('only parameter selection reduces the seed and unsupported levels/seeds are rejected', () => {
  assert.deepEqual(Object.keys(newArrheniusFactories), [id]);
  for (const seed of [100, 101, 999, 2026, 0x7fffffff, 0xffffffff]) {
    const example = factory(3, seed);
    assert.equal(example.question.ref.seed, seed);
    assert.equal(visible(example), visible(factory(3, seed % 100)));
    assert.deepEqual(example.correctResponses, factory(3, seed % 100).correctResponses);
  }
  for (const seed of [-1, 0x100000000, 1.5, Infinity, NaN]) assert.throws(() => factory(3, seed), RangeError);
  for (const level of [0, 1, 2, 4]) assert.throws(() => factory(level, 0), RangeError);
});

test('provenance hashes match the retained specification, assigned aggregate unit and packet', () => {
  const workspace = path.resolve(import.meta.dirname, '../../../..');
  const sources = factory(3, 0).question.sources;
  assert.equal(sources.length, 3);
  for (const source of sources)
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
  assert(sources[1].symbolOrSection.includes('Q21_P_B_III only'));
  assert(sources[0].symbolOrSection.includes('5.1.1(k)'));
  const spec = fs.readFileSync(path.join(workspace, sources[0].path), 'utf8');
  assert(spec.includes('(k) the Arrhenius equation:'));
  const aggregate = fs.readFileSync(path.join(workspace, sources[1].path), 'utf8');
  assert(aggregate.includes('OCR_2021_OCT_H432-01_Q21_P_B_III'));
});
