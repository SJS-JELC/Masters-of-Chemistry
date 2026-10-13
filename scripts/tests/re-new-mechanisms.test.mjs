import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { makeTypedMechanism, markTypedMechanismSteps, reviewedMechanismPairs } from '../../src/activities/alevel/rate-equations/new-mechanisms.ts';
import { parseMechanismEquation, mechanismNet, sameMechanismCounts, mechanismSideCounts, mechanismSpecies } from '../../src/activities/alevel/rate-equations/mechanism-equation.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';

// Independently transcribed from original OCR scheme images (retained in A04 artefacts).
const fixtures = {
  'no2-co': [
    ['2NO2 -> NO + NO3', 'NO3 + CO -> NO2 + CO2'],
    ['2NO2 -> N2O4', 'N2O4 + CO -> NO + NO2 + CO2'],
    ['2NO2 -> N2 + 2O2', 'N2 + 2O2 + CO -> NO + NO2 + CO2'],
    ['2NO2 -> 2NO + O2', 'NO + O2 + CO -> NO2 + CO2'],
  ],
  'f2-no2': [['F2 + NO2 -> F + NO2F', 'F + NO2 -> NO2F']],
  'iron-iodide': [
    ['Fe3+ + 2I- -> [FeI2]+', 'Fe3+ + [FeI2]+ -> 2Fe2+ + I2'],
    ['Fe3+ + 2I- -> Fe2+ + I2-', 'Fe3+ + I2- -> Fe2+ + I2'],
    ['Fe3+ + 2I- -> Fe+ + I2', 'Fe3+ + Fe+ -> 2Fe2+'],
  ],
  thiosulfate: [
    ['S2O3^2- -> S + SO3^2-', 'SO3^2- + 2H+ -> SO2 + H2O'],
    ['S2O3^2- -> SO2 + SO^2-', 'SO^2- + 2H+ -> S + H2O'],
  ],
};
const laws = { 'no2-co': { NO2: 2 }, 'f2-no2': { F2: 1, NO2: 1 }, 'iron-iodide': { 'Fe3+': 1, 'I-': 2 }, thiosulfate: { 'S2O3^2-': 1 } };
const nets = { 'no2-co': { CO: -1, NO2: -1, NO: 1, CO2: 1 }, 'f2-no2': { F2: -1, NO2: -2, NO2F: 2 }, 'iron-iodide': { 'Fe3+': -2, 'I-': -2, 'Fe2+': 2, I2: 1 }, thiosulfate: { 'S2O3^2-': -1, 'H+': -2, S: 1, SO2: 1, H2O: 1 } };
const responses = (slow, fast) => ({ 'mechanism-step-1': { kind: 'text', value: slow }, 'mechanism-step-2': { kind: 'text', value: fast } });
const assess = (context, slow, fast) => markTypedMechanismSteps(makeTypedMechanism(context).question, responses(slow, fast));
const result = (slow, fast) => ({ 'mechanism-step-1': slow, 'mechanism-step-2': fast });

test('four permanent fixed L3 questions have two typed parts and explicit submitted-response dependency', () => {
  const ids = new Set();
  for (const context of Object.keys(fixtures)) {
    const e = makeTypedMechanism(context), q = e.question;
    assert.deepEqual(makeTypedMechanism(context), e);
    assert.deepEqual(q.ref, { activityId: 'alevel/rate-equations', questionId: `RATE-NEW-mechanisms-${context}-L3`, seed: 0, level: 3 });
    assert.equal(e.gem, 'mechanisms');
    assert.equal(q.parts.length, 2);
    assert.deepEqual(q.parts.map(p => p.kind), ['text', 'text']);
    assert.deepEqual(q.parts.map(p => p.prompt[0].text), ['Step 1 (slow)', 'Step 2 (fast)']);
    assert.deepEqual(q.parts[1].dependsOn, [{ partId: 'mechanism-step-1', condition: 'response-reference' }]);
    assert.equal(q.parts.reduce((n, p) => n + p.marks, 0), 2);
    assert(q.context.some(b => b.kind === 'formula' && b.text.startsWith('Overall:')));
    assert(q.context.some(b => b.kind === 'formula' && b.text.startsWith('Measured:')));
    assert.equal(e.validation.acceptedPairCount, fixtures[context].length);
    ids.add(q.ref.questionId);
  }
  assert.equal(ids.size, 4);
  for (const bad of ['unknown', '__proto__', 'toString']) assert.throws(() => makeTypedMechanism(bad));
});

test('all ten independently sourced pairs, Unicode, reordering and compatible states earn both marks', () => {
  for (const [context, pairs] of Object.entries(fixtures)) for (const [index, pair] of pairs.entries()) {
    const q = makeTypedMechanism(context).question;
    assert.deepEqual(assess(context, ...pair), result(true, true), `${context} pair ${index}`);
    assert.deepEqual(assess(context, ...reviewedMechanismPairs[context][index]), result(true, true));
    const variant = pair.map(value => {
      const e = parseMechanismEquation(value);
      const side = terms => [...terms].reverse().map(t => `${t.coefficient === 1 ? '' : t.coefficient}${t.species}(${mechanismSpecies[t.species].states[0]})`).join(' + ');
      return `${side(e.reactants)} => ${side(e.products)}`;
    });
    assert.deepEqual(assess(context, ...variant), result(true, true));
    for (const values of [pair, reviewedMechanismPairs[context][index], variant]) {
      const marked = rateMarking.mark(q, responses(...values));
      assert(marked.accepted);
      assert.equal(marked.marks.earned, 2, values.join(';'));
    }
  }
});

test('source pathways conserve atoms and charge independently, slow molecularity and exact net stoichiometry', () => {
  // A separate formula reader checks displayed original Unicode without using the production catalogue.
  const term = raw => {
    const c = /^(\d+)?(.*)$/.exec(raw.trim());
    const charge = /([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/.exec(c[2]);
    const magnitude = Number([...charge?.[1] || '¹'].map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d)).join(''));
    const form = c[2].slice(0, charge?.index ?? c[2].length).replace(/[\[\]]/g, '').replace(/[₀-₉]/g, d => '₀₁₂₃₄₅₆₇₈₉'.indexOf(d));
    assert.match(form, /^(?:[A-Z][a-z]?\d*)+$/);
    const totals = { charge: charge ? magnitude * (charge[2] === '⁺' ? 1 : -1) : 0 };
    for (const [, element, n] of form.matchAll(/([A-Z][a-z]?)(\d*)/g)) totals[element] = (totals[element] ?? 0) + Number(n || 1);
    return Object.fromEntries(Object.entries(totals).map(([key, n]) => [key, n * Number(c[1] || 1)]));
  };
  const sum = side => {
    const total = {};
    for (const raw of side.split(' + ')) for (const [key, n] of Object.entries(term(raw))) total[key] = (total[key] ?? 0) + n;
    return Object.fromEntries(Object.entries(total).filter(([, n]) => n).sort());
  };
  for (const [context, pairs] of Object.entries(reviewedMechanismPairs)) for (const pair of pairs) {
    for (const step of pair) {
      const [left, right] = step.split(' → ');
      assert.deepEqual(sum(left), sum(right), step);
    }
    const parsed = pair.map(parseMechanismEquation);
    assert(sameMechanismCounts(mechanismSideCounts(parsed[0].reactants), laws[context]));
    assert(sameMechanismCounts(mechanismNet(parsed), nets[context]));
  }
});

test('charge-safe lexer accepts compact ionic separators, explicit caret charges and repeated equivalent terms', () => {
  assert.deepEqual(assess('iron-iodide', 'Fe3++2I-→[FeI2]+', '[FeI2]++Fe^3+→2Fe^2++I2'), result(true, true));
  assert.deepEqual(assess('iron-iodide', 'I- + Fe³⁺ + I- -> Fe²⁺ + I₂⁻', 'I₂⁻ + Fe³⁺ -> I₂ + Fe²⁺'), result(true, true));
  assert.deepEqual(assess('no2-co', 'NO2 + NO2 ⟶ NO3 + NO', 'CO + NO3 ⇒ CO2 + NO2'), result(true, true));
  assert.deepEqual(assess('thiosulfate', 'S₂O₃^2− → SO3^2− + S', 'H+ + SO₃²⁻ + H+ → H2O + SO2'), result(true, true));
});

test('balanced individual cross-pairs lose step 2 while retaining the correct submitted first step', () => {
  for (const [context, pairs] of Object.entries(fixtures)) for (let i = 0; i < pairs.length; i++) for (let j = 0; j < pairs.length; j++) {
    assert.deepEqual(assess(context, pairs[i][0], pairs[j][1]), result(true, i === j), `${context} ${i}/${j}`);
    const marked = rateMarking.mark(makeTypedMechanism(context).question, responses(pairs[i][0], pairs[j][1]));
    assert.equal(marked.marks.earned, i === j ? 2 : 1);
  }
});

test('invalid charges, atoms, states, syntax and unknown species are rejected', () => {
  for (const equation of [
    'Fe2+ + 2I- -> [FeI2]+', 'Fe3+ + I- -> [FeI2]+', 'Fe3+ + 2I -> [FeI2]+',
    'S2O3- -> S + SO3^2-', 'S2O3^2- -> S + SO3-', 'SO^2- + 2H+ -> S + H2',
    'F2 + NO2 -> F- + NO2F', '2NO2 -> NO + NO2', '2NO2 -> NaNO4',
    '2NO2(aq) -> NO(g) + NO3(g)', 'Fe3+(s) + 2I-(aq) -> [FeI2]+(aq)',
    'S2O3^2-(aq) -> S(l) + SO3^2-(aq)', 'SO3^2-(aq) + 2H+(aq) -> SO2(aq) + H2O(l)',
    '2NO2 <-> NO + NO3', '2NO2 = NO + NO3', '2NO2 -> NO + NO3 -> N2O4',
    '0NO2 -> NO2', '0.5NO2 -> 0.5NO2', '-2NO2 -> -2NO2', '2NO2 -> NO + NO3 +',
    'Fe3+I- -> Fe2+ + I', 'S2O3^2-- -> S + SO3^2-', 'NO2'.repeat(200),
  ]) assert.equal(parseMechanismEquation(equation), null, equation);
});

test('wrong molecularity, multiple scaling, reversed reactions and balanced invented pathways never earn either dependent mark', () => {
  const rejected = [
    ['no2-co', 'NO2 -> NO + O', 'O + CO -> CO2'],
    ['no2-co', '4NO2 -> 2NO + 2NO3', '2NO3 + 2CO -> 2NO2 + 2CO2'],
    ['no2-co', '2NO2 -> 2NO2', 'NO2 + CO -> NO + CO2'],
    ['no2-co', 'NO + NO3 -> 2NO2', 'NO3 + CO -> NO2 + CO2'],
    ['f2-no2', 'F2 -> 2F', '2F + 2NO2 -> 2NO2F'],
    ['iron-iodide', '2Fe3+ + 4I- -> 2[FeI2]+', '2Fe3+ + 2[FeI2]+ -> 4Fe2+ + 2I2'],
    ['iron-iodide', 'Fe3+ + 2I- -> Fe3+ + 2I-', '2Fe3+ + 2I- -> 2Fe2+ + I2'],
    ['thiosulfate', '2S2O3^2- -> 2S + 2SO3^2-', '2SO3^2- + 4H+ -> 2SO2 + 2H2O'],
    ['thiosulfate', 'S2O3^2- -> S2O3^2-', 'S2O3^2- + 2H+ -> S + SO2 + H2O'],
  ];
  for (const [context, slow, fast] of rejected) assert.deepEqual(assess(context, slow, fast), result(false, false));
  assert.deepEqual(assess('no2-co', fixtures['no2-co'][0][0], 'NO3 + CO + NO2 -> 2NO2 + CO2'), result(true, false));
  assert.deepEqual(assess('no2-co', fixtures['no2-co'][0][0], '2NO3 + 2CO -> 2NO2 + 2CO2'), result(true, false));
  assert.deepEqual(assess('no2-co', '', fixtures['no2-co'][0][1]), result(false, false));
  assert.equal(markTypedMechanismSteps({ ...makeTypedMechanism('no2-co').question, ref: { questionId: 'RATE-POC-mechanisms-L3' } }, {}), null);
});

test('all retained source packet, aggregate and specification fingerprints remain current', () => {
  const workspace = path.resolve(import.meta.dirname, '../../../..');
  for (const context of Object.keys(fixtures)) for (const source of makeTypedMechanism(context).question.sources)
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
});
