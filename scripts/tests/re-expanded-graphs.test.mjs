import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { makeExpandedGraphs, makeExpandedArrhenius } from '../../src/activities/alevel/rate-equations/expanded-graphs.ts';
import { tangentGeometry } from '../../src/activities/alevel/rate-equations/tangent-geometry.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';

const factories = { graphs: makeExpandedGraphs, arrhenius: makeExpandedArrhenius };
const close = (actual, expected, relative = 1e-12) =>
  assert(Math.abs(actual - expected) <= Math.abs(expected) * relative + 1e-20, `${actual} != ${expected}`);
const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function parseDisplayed(value) {
  return Number(value.replace(/ × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, power) =>
    `e${[...power].map(char => char === '⁻' ? '-' : superscripts.indexOf(char)).join('')}`));
}
const part = (example, id) => example.question.parts.find(item => item.id === id);
const answer = (example, id) => Number(example.correctResponses[id].raw);
const displayed = example => JSON.stringify({
  title: example.question.title, context: example.question.context,
  parts: example.question.parts.map(({ acceptance, acceptedOptionSets, ...visible }) => visible), graph: example.graph,
});

test('600 distinct displayed variants retain full seeds and have complete, checked answers', () => {
  let total = 0;
  for (const [gem, factory] of Object.entries(factories)) for (const level of [1, 2, 3]) {
    const signatures = new Set();
    for (let seed = 0; seed < 100; seed++) {
      const example = factory(level, seed);
      assert.deepEqual(factory(level, seed), example);
      assert.deepEqual(example.question.ref, { activityId: 'alevel/rate-equations', questionId: `RATE-EXP-${gem}-L${level}`, level, seed });
      assert.equal(example.validation.variantIndex, seed);
      assert.equal(example.validation.variantCount, 100);
      signatures.add(displayed(example));
      assert.equal(new Set(example.question.parts.map(p => p.id)).size, example.question.parts.length);
      assert.equal(Object.keys(example.correctResponses).length, example.question.parts.length);
      assert.equal(example.question.scaffolds.length, 0);
      assert.equal(example.question.hints.length, 0);
      assert(example.question.parts.every(p => p.required && p.marks > 0));
      const result = rateMarking.mark(example.question, example.correctResponses);
      assert(result.accepted);
      assert.equal(result.marks.earned, result.marks.available);
      assert.equal(rateMarking.mark(example.question, {}).accepted, false);
      for (const p of example.question.parts.filter(p => p.kind === 'numeric')) {
        const response = example.correctResponses[p.id];
        assert(Number.isFinite(Number(response.raw)));
        assert.equal(response.unit, p.unit);
        const rounded = { ...example.correctResponses, [p.id]: { ...response, raw: Number(response.raw).toPrecision(3) } };
        assert.equal(rateMarking.mark(example.question, rounded).marks.earned, result.marks.available);
        const wrong = { ...example.correctResponses, [p.id]: { ...response, raw: String(Number(response.raw) * 1.04) } };
        assert(rateMarking.mark(example.question, wrong).marks.earned < result.marks.available);
      }
      total++;
    }
    assert.equal(signatures.size, 100, `${gem} L${level} displayed coverage`);
    for (const seed of [100, 101, 999, 2026, 0x7fffffff, 0xffffffff]) {
      const example = factory(level, seed);
      assert.equal(example.question.ref.seed, seed);
      assert.equal(displayed(example), displayed(factory(level, seed % 100)));
    }
  }
  assert.equal(total, 600);
  for (const factory of Object.values(factories)) {
    for (const seed of [-1, 0x100000000, 1.5, Infinity, NaN]) assert.throws(() => factory(1, seed), RangeError);
    assert.throws(() => factory(0, 0), RangeError);
  }
});

test('all300 concentration curves independently conserve half-life, rate, unit conversion and snapping', () => {
  for (const level of [1, 2, 3]) {
    const concentrations = new Set(), halfLives = new Set(), markers = new Set(), curves = new Set();
    for (let seed = 0; seed < 100; seed++) {
      const example = makeExpandedGraphs(level, seed), g = example.graph;
      assert.equal(g.kind, 'concentration');
      assert.equal(g.order, 1);
      const halfLife = Math.log(2) / g.k;
      const y = time => g.initial * 2 ** (-time / halfLife);
      const secondsPerUnit = level === 3 ? 60 : 1;
      const concentration = y(g.initialMarker);
      const rate = Math.log(2) * concentration / halfLife / secondsPerUnit;
      concentrations.add(g.initial); halfLives.add(halfLife.toFixed(8));
      curves.add(JSON.stringify({ initial: g.initial, k: g.k, maxTime: g.maxTime }));
      markers.add(level === 2 ? (concentration / g.initial).toFixed(8) : g.initialMarker);
      close(y(halfLife), g.initial / 2);
      close(y(2 * halfLife), g.initial / 4);
      close(example.validation.concentration, concentration);
      close(example.validation.ratePerSecond, rate);
      close(example.validation.kPerSecond, rate / concentration);
      // A symmetric numerical derivative validates the analytic tangent independently.
      const h = halfLife * 1e-5;
      close(-(y(g.initialMarker + h) - y(g.initialMarker - h)) / (2 * h) / secondsPerUnit, rate, 1e-8);
      assert(g.initialMarker > 0 && g.initialMarker < g.maxTime);
      close(g.maxTime / halfLife, 3.2);
      const triangle = tangentGeometry(0, g.maxTime, 0, g.initial * 1.1, g.initialMarker, concentration, -rate * secondsPerUnit, true);
      assert(triangle.firstX >= 0 && triangle.secondX <= g.maxTime);
      assert(triangle.firstY <= g.initial * 1.1 && triangle.secondY >= 0);
      assert(triangle.dx > halfLife * 0.1 && triangle.dy < 0);
      close(-triangle.dy / (triangle.dx * secondsPerUnit), rate);
      // The UI and worked model round triangle measurements to five significant figures.
      close(-Number(triangle.dy.toPrecision(5)) / (Number(triangle.dx.toPrecision(5)) * secondsPerUnit), rate, 0.0001);
      if (level === 1) {
        close(answer(example, 'rate'), rate);
        assert.equal(example.question.title, 'Calculating rate');
        assert(part(example, 'rate').prompt[0].text.includes('positive value to 3 significant figures'));
        assert.equal(g.initialMarker * 2, Math.round(g.initialMarker * 2));
        assert.equal(part(example, 'rate').unit, 'mol dm⁻³ s⁻¹');
        const modelRate = example.question.workedAnswer[0].text.match(/disappearance is (.*?) mol/)[1];
        close(parseDisplayed(modelRate), rate, 0.005);
      } else if (level === 2) {
        close(answer(example, 'half-life-1'), halfLife);
        close(answer(example, 'half-life-2'), halfLife);
        close(answer(example, 'k'), Math.log(2) / halfLife);
        assert.deepEqual(example.correctResponses.order.selected, ['first']);
        for (const value of [g.initial, g.initial / 2, g.initial / 4, concentration]) close(value * 1000, Math.round(value * 1000));
        assert.equal(part(example, 'k').unit, 's⁻¹');
      } else {
        close(answer(example, 'concentration'), concentration);
        close(answer(example, 'rate'), rate);
        close(answer(example, 'k'), rate / concentration);
        assert.equal(g.timeUnit, 'min');
        assert.equal(g.initialMarker * 10, Math.round(g.initialMarker * 10));
        const model = example.question.workedAnswer[0].text;
        assert(model.includes(`t = ${g.initialMarker.toFixed(2)} min`));
        assert(model.indexOf('min × 60 =') < model.indexOf('Rate ='));
        assert(model.includes('(a)') && model.includes('(b)') && model.includes('(c)'));
        assert.equal(part(example, 'rate').unit, 'mol dm⁻³ s⁻¹');
        assert.equal(part(example, 'k').unit, 's⁻¹');
        const modelConcentration = model.match(/\[A\] = (.*?) mol/)[1];
        const modelRate = model.match(/\n       = (.*?) mol dm⁻³ s⁻¹/)[1];
        const modelK = model.match(/\n   = (.*?) s⁻¹/)[1];
        for (const value of [modelConcentration, modelRate, modelK]) assert(value.includes(' × 10'));
        close(parseDisplayed(modelConcentration), concentration, 0.005);
        close(parseDisplayed(modelRate), rate, 0.005);
        close(parseDisplayed(modelK), rate / concentration, 0.005);
      }
    }
    assert.equal(concentrations.size, 10);
    assert.equal(halfLives.size, 10);
    assert.equal(curves.size, 100);
    assert.equal(markers.size, 4);
  }
});

test('all300 Arrhenius tables, plotted bounds and rounded-data reconstruction support Ea,A,new k', () => {
  for (const level of [1, 2, 3]) {
    const gradients = new Set(), intercepts = new Set(), schedules = new Set();
    for (let seed = 0; seed < 100; seed++) {
      const example = makeExpandedArrhenius(level, seed), g = example.graph;
      assert.equal(g.kind, 'arrhenius');
      assert.equal(g.scaledX, level === 2);
      const table = example.question.context.find(block => block.kind === 'table');
      assert.deepEqual(table.headers, ['k / s⁻¹', 'ln(k)', 'T / K', '(1/T) / K⁻¹']);
      assert.equal(table.rows.length, 5);
      gradients.add(g.gradient); intercepts.add(g.intercept); schedules.add(table.rows.map(r => r[2]).join(','));
      const rows = table.rows.map(([k, log, temperature, reciprocal]) => ({
        k: parseDisplayed(k), log: Number(log), temperature: Number(temperature), reciprocal: parseDisplayed(reciprocal),
      }));
      const ea = -g.gradient * 8.314 / 1000;
      const A = Math.exp(g.intercept);
      const Tnew = example.validation.newTemperatureKelvin;
      const newK = A * Math.exp(-ea * 1000 / (8.314 * Tnew));
      close(example.validation.activationEnergyKJ, ea);
      close(example.validation.A, A);
      close(example.validation.newK, newK);
      close(example.validation.displayedGradient, g.gradient / (level === 2 ? 1000 : 1));
      assert(ea >= 40 && ea <= 75 && A < 1e11 && newK > 0 && newK < 3000);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        assert(row.temperature >= 300 && row.temperature <= 395);
        assert(1 / row.temperature > g.minX && 1 / row.temperature < g.maxX);
        close(row.reciprocal, 1 / row.temperature, 0.00005);
        close(row.k, A * Math.exp(-ea * 1000 / (8.314 * row.temperature)), 0.00005);
        assert(Math.abs(row.log - Math.log(row.k)) < 0.00006);
        if (i) assert(row.k > rows[i - 1].k);
        // Every pair of the rounded student table can independently recover the results.
        for (const other of rows.slice(i + 1)) {
          const m = (other.log - row.log) / (other.reciprocal - row.reciprocal);
          const b = row.log - m * row.reciprocal;
          close(-m * 8.314 / 1000, ea, 0.03);
          close(Math.exp(b), A, 0.03);
          close(Math.exp(b + m / Tnew), newK, 0.03);
        }
      }
      const yMin = Math.floor(g.intercept + g.gradient * g.maxX - 1);
      const yMax = Math.ceil(g.intercept + g.gradient * g.minX + 1);
      // Eight-to-nine ln(k) units of line plus the renderer's integer-rounded margins.
      assert(yMax - yMin <= 12);
      const marker = (g.minX + g.maxX) / 2;
      const triangle = tangentGeometry(g.minX, g.maxX, yMin, yMax, marker, g.intercept + g.gradient * marker, g.gradient, false);
      assert(triangle.dx > 0 && triangle.firstX >= g.minX && triangle.secondX <= g.maxX);
      assert(triangle.firstY <= yMax && triangle.secondY >= yMin);
      close(triangle.dy / triangle.dx, g.gradient);
      if (level <= 2) {
        close(answer(example, 'ea'), ea);
        assert.equal(part(example, 'ea').unit, 'kJ mol⁻¹');
        if (level === 2) {
          close(answer(example, 'scaled-gradient'), g.gradient / 1000);
          close(answer(example, 'gradient'), g.gradient);
          assert.equal(part(example, 'scaled-gradient').unit, '10³ K');
          assert.equal(part(example, 'gradient').unit, 'K');
        }
      } else {
        close(answer(example, 'intercept'), g.intercept);
        close(answer(example, 'a'), A);
        close(answer(example, 'k-new'), newK);
        assert.equal(part(example, 'intercept').prompt[0].text, 'Determine the y-intercept, ln(A), at 1/T = 0.');
        assert.equal(part(example, 'a').prompt[0].text, 'Calculate A.');
        assert.notEqual(g.intercept, g.intercept + g.gradient * g.minX);
        for (const id of ['a', 'k-new']) assert.equal(part(example, id).unit, 's⁻¹');
        const model = example.question.workedAnswer[0].text;
        assert(model.includes('(a)') && model.includes('(b)') && model.includes('(c)'));
        close(parseDisplayed(model.match(/\(b\)[\s\S]*?\n       = (.*?) s⁻¹/)[1]), A, 0.005);
        close(parseDisplayed(model.match(/\nk = (.*?) s⁻¹/)[1]), newK, 0.005);
      }
    }
    assert.equal(gradients.size, 5);
    assert.equal(intercepts.size, 5);
    assert.equal(schedules.size, 4);
  }
});

test('expanded factories retain OCR provenance and leave original graph questions reproducible', () => {
  const workspace = path.resolve(import.meta.dirname, '../../../..');
  for (const source of makeExpandedGraphs(1, 0).question.sources)
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
  assert.deepEqual(makeExpandedGraphs(1, 0).question.sources, makeExpandedArrhenius(1, 0).question.sources);
  // Baseline includes the teacher's later reviewed title/prompt/worked-answer edits.
  // The older full-output fixture hashes precede those edits, so freeze current source bytes.
  for (const [file, expected] of Object.entries({
    'graphs.ts': '51381e0eda80841fb3e5a818cfeb368d4f2874bd4955b6dc122d55705d2b80f3',
    'tangent-geometry.ts': '1e450760237a2d716cac2a4f22bea19acf9285be2faae121cc0d18480c6cd963',
  })) {
    const sourcePath = path.resolve(import.meta.dirname, '../../src/activities/alevel/rate-equations', file);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex'), expected);
  }
});
