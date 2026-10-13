import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { makeExpandedMechanism } from '../../src/activities/alevel/rate-equations/expanded-mechanisms.ts';
import { makeMechanisms } from '../../src/activities/alevel/rate-equations/mechanisms.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { equivalentRateLaw } from '../../src/activities/alevel/rate-equations/input-syntax.ts';
import preservation from './fixtures/rate-equations-preservation.json' with { type: 'json' };

const contexts = ['iron-iodide', 'thiosulfate'];
const species = { 'iron-iodide': ['Fe3+', 'I-'], thiosulfate: ['S2O3^2-', 'H+'] };
const laws = { 'iron-iodide': 'k[Fe3+][I-]^2', thiosulfate: 'k[S2O3^2-][H+]^0' };
const expectedOrders = { 'iron-iodide': { 'Fe3+': 1, 'I-': 2 }, thiosulfate: { 'S2O3^2-': 1 } };
const overallNets = {
  'iron-iodide': { 'Fe3+': -2, 'I-': -2, 'Fe2+': 2, I2: 1 },
  thiosulfate: { 'S2O3^2-': -1, 'H+': -2, S: 1, SO2: 1, H2O: 1 },
};
const sorted = obj => Object.fromEntries(Object.entries(obj).filter(([, n]) => n).sort(([a], [b]) => a.localeCompare(b)));
const add = (target, key, n) => { target[key] = (target[key] ?? 0) + n; };

// Independent equation reader: operates on the actual offered formula blocks,
// not copied step lists or the factory's self-reported validation metadata.
function term(display) {
  const prefix = /^(\d+)?(.+)$/.exec(display.trim());
  const coefficient = Number(prefix[1] ?? 1);
  const chargeMatch = /([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/.exec(prefix[2]);
  const magnitude = chargeMatch?.[1] ? Number([...chargeMatch[1]].map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')) : 1;
  const charge = chargeMatch ? magnitude * (chargeMatch[2] === '⁺' ? 1 : -1) : 0;
  const formula = prefix[2].slice(0, chargeMatch?.index ?? prefix[2].length).replace(/[\[\]]/g, '').replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)));
  assert.match(formula, /^(?:[A-Z][a-z]?\d*)+$/);
  const atoms = {};
  for (const [, element, count] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) add(atoms, element, Number(count || 1));
  const suffix = charge ? `${magnitude > 1 ? (/^[A-Z][a-z]?$/.test(formula) ? '' : '^') + magnitude : ''}${charge > 0 ? '+' : '-'}` : '';
  return { coefficient, species: formula + suffix, atoms, charge };
}
function equation(display) {
  const sides = display.replace(/^(?:Overall|Step \d+ \((?:slow|fast)\)):\s*/, '').split(' → ');
  assert.equal(sides.length, 2, display);
  return sides.map(side => side.split(/\s+\+\s+/).map(term));
}
function conserved(step) {
  const totals = step.map(side => {
    const result = { charge: 0 };
    for (const t of side) {
      add(result, 'charge', t.charge * t.coefficient);
      for (const [element, count] of Object.entries(t.atoms)) add(result, element, count * t.coefficient);
    }
    return sorted(result);
  });
  assert.deepEqual(totals[0], totals[1]);
}
function net(steps) {
  const result = {};
  for (const step of steps) for (const [index, side] of step.entries())
    for (const t of side) add(result, t.species, (index ? 1 : -1) * t.coefficient);
  return sorted(result);
}
const slowOrders = step => sorted(Object.fromEntries(step[0].map(t => [t.species, t.coefficient])));
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const stepBlocks = blocks => blocks.filter(b => b.kind === 'formula' && b.text.includes(' → '));

test('six fixed source questions preserve identities, zero seed, question types and original mechanism answers', () => {
  const ids = new Set();
  for (const context of contexts) for (const level of [1, 2, 3]) {
    const example = makeExpandedMechanism(context, level);
    assert.deepEqual(makeExpandedMechanism(context, level), example);
    const q = example.question;
    assert.equal(q.ref.questionId, `RATE-EXP-mechanisms-${context}-L${level}`);
    assert.equal(q.ref.seed, 0);
    assert.equal(q.ref.level, level);
    assert.equal(q.ref.activityId, 'alevel/rate-equations');
    assert.equal(example.validation.seeded, false);
    assert.deepEqual(q.parts.map(p => p.kind), level === 1 ? ['text'] : level === 2 ? ['choice', 'text'] : ['choice']);
    assert.equal(q.layout, 'multipart');
    for (const p of q.parts.filter(p => p.id === 'rate-equation')) assert.equal(p.prompt[0].text, 'Write the rate equation.');
    ids.add(q.ref.questionId);
  }
  assert.equal(ids.size, 6);
  for (const old of preservation.startingAnswers.filter(c => c.questionId.startsWith('RATE-POC-mechanisms-'))) {
    const level = Number(old.questionId.at(-1));
    assert.deepEqual(makeMechanisms(level, 0).correctResponses, old.correctResponses);
  }
  for (const invalid of ['unknown', '__proto__', 'toString']) assert.throws(() => makeExpandedMechanism(invalid, 1));
  for (const invalid of [0, 4, '1', NaN]) assert.throws(() => makeExpandedMechanism('iron-iodide', invalid));
});

test('actual offered equations conserve every element and charge, including all distractors', () => {
  for (const context of contexts) for (const level of [1, 2, 3]) {
    const q = makeExpandedMechanism(context, level).question;
    const blocks = [...q.context, ...q.workedAnswer, ...q.parts.flatMap(p => p.kind === 'choice' ? p.options.flatMap(o => o.content) : [])];
    for (const block of stepBlocks(blocks)) conserved(equation(block.text));
  }
});

test('accepted intermediate cancellation and first slow-step orders give the exact overall equation', () => {
  for (const context of contexts) {
    const q = makeExpandedMechanism(context, 1).question;
    const steps = stepBlocks(q.context).filter(b => b.text.startsWith('Step')).map(b => equation(b.text));
    assert.deepEqual(net(steps), sorted(overallNets[context]));
    assert.deepEqual(slowOrders(steps[0]), sorted(expectedOrders[context]));
    assert.deepEqual(net([equation(q.context.find(b => b.kind === 'formula' && b.text.startsWith('Overall')).text)]), sorted(overallNets[context]));
  }
});

test('each missing-step and complete-mechanism choice has exactly one independently consistent option', () => {
  for (const context of contexts) {
    const q2 = makeExpandedMechanism(context, 2).question;
    const fast = equation(q2.context.find(b => b.kind === 'formula' && b.text.startsWith('Step 2')).text);
    const validMissing = q2.parts[0].options.filter(o => same(net([equation(o.content[0].text), fast]), overallNets[context]));
    assert.deepEqual(validMissing.map(o => o.id), ['1']);
    assert.deepEqual(q2.parts[0].acceptedOptionSets, [['1']]);
    const q3 = makeExpandedMechanism(context, 3).question;
    const validMechanisms = q3.parts[0].options.filter(o => {
      const steps = o.content.map(b => equation(b.text));
      return same(net(steps), overallNets[context]) && same(slowOrders(steps[0]), expectedOrders[context]);
    });
    assert.deepEqual(validMechanisms.map(o => o.id), ['2']);
    assert.deepEqual(q3.parts[0].acceptedOptionSets, [['2']]);
  }
});

test('individual packet, accepted record and specification fingerprints remain current', () => {
  const workspace = path.resolve(import.meta.dirname, '../../../..');
  for (const context of contexts) for (const source of makeExpandedMechanism(context, 1).question.sources)
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
});

test('shared marking accepts all correct responses, equivalent ionic rate laws and zero acid order', () => {
  for (const context of contexts) for (const level of [1, 2, 3]) {
    const e = makeExpandedMechanism(context, level);
    const marked = rateMarking.mark(e.question, e.correctResponses);
    assert(marked.accepted);
    assert.equal(marked.marks.earned, marked.marks.available, `${context} L${level}`);
    if (level < 3) {
      const expected = e.correctResponses['rate-equation'].value;
      assert(equivalentRateLaw(expected, laws[context], species[context]));
      const equivalent = context === 'iron-iodide' ? 'k[I-][Fe3+][I-]' : 'k[H+]^0[S2O3^2-]';
      const result = rateMarking.mark(e.question, { ...e.correctResponses, 'rate-equation': { kind: 'text', value: equivalent } });
      assert.equal(result.marks.earned, result.marks.available);
    }
  }
});

test('wrong ionic charge, species, orders and every unaccepted option lose the relevant mark', () => {
  const wrongLaws = {
    'iron-iodide': ['k[Fe3+][I-]', 'k[Fe2+][I-]^2', 'k[Fe3+][I]^2', 'k[Fe3+]^2[I-]^2'],
    thiosulfate: ['k[S2O3^2-][H+]', 'k[S2O3-]', 'k[S2O3^2-]^2', 'k[SO3^2-]'],
  };
  for (const context of contexts) for (const level of [1, 2, 3]) {
    const e = makeExpandedMechanism(context, level);
    if (level < 3) for (const value of wrongLaws[context]) {
      const result = rateMarking.mark(e.question, { ...e.correctResponses, 'rate-equation': { kind: 'text', value } });
      assert(result.accepted);
      assert.equal(result.marks.points.find(p => p.partId === 'rate-equation').earned, 0, value);
    }
    for (const part of e.question.parts.filter(p => p.kind === 'choice')) for (const option of part.options) {
      if (part.acceptedOptionSets[0].includes(option.id)) continue;
      const result = rateMarking.mark(e.question, { ...e.correctResponses, [part.id]: { kind: 'choice', selected: [option.id] } });
      assert(result.accepted);
      assert.equal(result.marks.points.find(p => p.partId === part.id).earned, 0);
    }
  }
});
