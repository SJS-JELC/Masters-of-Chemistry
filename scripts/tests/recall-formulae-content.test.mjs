import { resolveCompatibilityLink } from '../../src/compatibility/links.ts';
import { isCanonicalQuestionId, fixedIdentity } from '../../src/content/canonical-identity.ts';
import { formulaeRef } from '../../src/activities/igcse/formulae/provider.ts';
import { equationIdentity } from '../../src/chemistry/formulae-equations/identity.ts';
import fs from 'node:fs';
import crypto from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { ionBank, allowedPairs } from '../../src/chemistry/formulae-equations/ions.ts';
import {
  compound,
  gcd,
  formulaCode,
  decodeFormulaCode,
  selectFormula,
} from '../../src/chemistry/formulae-equations/generator.ts';
import {
  normalizeChemicalFormula,
  parseChemicalFormula,
  normalizeChemicalEquation,
  parseChemicalEquation,
  equationBalance,
} from '../../src/chemistry/formulae-equations/notation.ts';
import { equationBank } from '../../src/activities/igcse/equations/bank.ts';
import { formulaeProvider } from '../../src/activities/igcse/formulae/provider.ts';
import { formulaeMarking } from '../../src/activities/igcse/formulae/marking.ts';
import { equationsProvider } from '../../src/activities/igcse/equations/provider.ts';
import { equationsMarking } from '../../src/activities/igcse/equations/marking.ts';
import {
  formulaeRecallFacts,
  existingRecallGemLinks,
} from '../../src/activities/igcse/formulae/recall-facts.ts';
test('all 19 ions and 36 explicitly vetted pairs satisfy composition, neutrality and reduced ratio', () => {
  assert.equal(ionBank.length, 19);
  assert.equal(allowedPairs.length, 36);
  assert.equal(new Set(ionBank.map((i) => i.id)).size, 19);
  assert.equal(new Set(allowedPairs.map((i) => i.id)).size, 36);
  for (const ion of ionBank) {
    assert.deepEqual(parseChemicalFormula(ion.formula).composition, ion.composition);
    assert.equal(Object.values(ion.composition).reduce((n, v) => n + v, 0) > 1, ion.polyatomic);
    assert.ok(Number.isInteger(ion.charge) && ion.charge !== 0);
    assert.ok(ion.recallFactIds.length === 1 || ion.recallFactIds.length === 2);
  }
  for (const pair of allowedPairs) {
    const d = compound(pair);
    assert.equal(d.cationCount * d.cation.charge + d.anionCount * d.anion.charge, 0);
    assert.equal(gcd(d.cationCount, d.anionCount), 1);
    assert.deepEqual(parseChemicalFormula(d.formula).composition, d.composition);
    assert.equal(pair.level === 2, d.cation.polyatomic || d.anion.polyatomic);
    assert.equal(d.explanationLines.length, 4);
    assert.ok(d.explanationLines.every(line => !line.includes('Formula:')));
    assert.equal(d.explanationLines[1], 'The lowest whole-number ion ratio is ' + d.cationCount + ':' + d.anionCount + '.');
  }
});
test('eight pinned examples cover equal/unequal charges, simplification and repeated groups', () => {
  const pins = {
    'sodium-chloride': 'NaCl',
    'magnesium-oxide': 'MgO',
    'magnesium-chloride': 'MgCl2',
    'aluminium-oxide': 'Al2O3',
    'ammonium-chloride': 'NH4Cl',
    'calcium-carbonate': 'CaCO3',
    'magnesium-hydroxide': 'Mg(OH)2',
    'aluminium-sulfate': 'Al2(SO4)3',
  };
  for (const [id, expected] of Object.entries(pins)) {
    const d = decodeFormulaCode(formulaCode(id, 123));
    assert.equal(d.formula, expected);
    const q = formulaeProvider.restore(formulaeProvider.resolveLink(formulaCode(id, 123)));
    const result = formulaeMarking.mark(q, { formula: { kind: 'text', value: expected } });
    assert.equal(result.marks.earned, 1);
  }
});
test('notation accepts ordinary digits/subscripts and ionic charges while enforcing case/grouping/ratio', () => {
  assert.equal(normalizeChemicalFormula('Ca(OH)₂'), 'Ca(OH)2');
  assert.equal(normalizeChemicalFormula('SO₄²⁻'), 'SO4^2-');
  assert.equal(normalizeChemicalFormula('Na+'), 'Na^+');
  for (const bad of ['caCl2', 'Na1Cl', 'Ca(OH)0', 'Cl)', '(NaCl', 'Ca((OH)2)', 'Xx2', 'Ca(OH)01'])
    assert.equal(normalizeChemicalFormula(bad), null, bad);
  const q = formulaeProvider.restore(formulaeProvider.resolveLink('RF1:magnesium-hydroxide:123'));
  for (const bad of ['MgOH2', 'Mg(OH)4', 'Mg2(OH)4', 'mg(OH)2', 'Mg(OH)2+'])
    assert.equal(
      formulaeMarking.mark(q, { formula: { kind: 'text', value: bad } }).marks.earned,
      0,
      bad,
    );
  assert.equal(
    formulaeMarking.mark(q, { formula: { kind: 'text', value: 'Mg(OH)₂' } }).marks.earned,
    1,
  );
  assert.equal(formulaeMarking.mark(q, {}).accepted, false);
});
test('canonical generation is reproducible, restores same seed and avoids the immediately prior compound', () => {
  for (const level of [1, 2])
    for (const seed of [0, 1, 42, 0xffffffff]) {
      const a = selectFormula(level, seed, []);
      assert.equal(a, selectFormula(level, seed, []));
      const b = selectFormula(level, seed, [a]);
      assert.notEqual(decodeFormulaCode(a).pair.id, decodeFormulaCode(b).pair.id);
      const ref = formulaeProvider.select({activityId: 'igcse/formulae',level,seed,previousQuestionIds:[]});
      assert.equal(ref.questionId,a);
      assert.equal(ref.seed, seed);
      assert.equal(formulaeProvider.resolveLink(a).seed,0);
      assert.deepEqual(formulaeProvider.restore(ref), formulaeProvider.restore(ref));
    }
  assert.throws(() => selectFormula(3, 1, []));
  assert.throws(() => formulaCode('sodium-chloride', -1));
  assert.equal(formulaeProvider.resolveLink('RF1:sodium-chloride:01'), null);
});
test('30 restorable equations preserve six original families and append separate balance/state models', () => {
  assert.equal(equationBank.length, 30);
  assert.equal(new Set(equationBank.map((r) => r.id)).size, 30);
  const count = {};
  for (const r of equationBank) {
    count[r.family] = (count[r.family] ?? 0) + 1;
    assert.ok(equationBalance(r.answer), r.id);
    const parsed = parseChemicalEquation(r.answer);
    const coefficients = [...parsed.reactants, ...parsed.products].map((s) => s.coefficient);
    assert.equal(coefficients.reduce(gcd), 1, r.id);
    assert.ok(r.prompt && r.markPoints.length && r.provenance);
  }
  assert.deepEqual(Object.values(count), [5, 5, 4, 4, 8, 4]);
  assert.equal(equationBank.filter((r) => r.task === 'balance-and-states').length, 1);
});
test('all authored provider model responses earn full marks; conservation and partial marking checked', () => {
  for (const record of equationBank) {
    const q = equationsProvider.restore(equationsProvider.resolveLink(record.id));
    const responses = {};
    for (const p of q.parts) {
      responses[p.id] =
        p.kind === 'numeric'
          ? { kind: 'numeric', raw: String(p.acceptance.expected), unit: '' }
          : p.kind === 'choice'
            ? { kind: 'choice', selected: p.acceptedOptionSets[0].map(state => '(' + state + ')') }
            : { kind: 'text', value: p.accepted[0] };
    }
    const result = equationsMarking.mark(q, responses);
    assert.equal(result.accepted, true, record.id);
    assert.equal(result.marks.earned, result.marks.available, record.id);
    assert.equal(
      result.marks.available,
      q.parts.reduce((n, p) => n + p.marks, 0),
      record.id,
    );
    assert.equal(equationsMarking.mark(q, {}).accepted, q.parts.every(p => p.kind === 'numeric' && p.coefficientEntry === 'positive-rational-blank-one'));
  }
  const q = equationsProvider.restore(equationsProvider.resolveLink('EQ-simple-words-01'));
  assert.equal(
    equationsMarking.mark(q, { equation: { kind: 'text', value: 'Mg + HCl -> MgCl2 + H2' } }).marks
      .earned,
    1,
  );
  assert.equal(
    equationsMarking.mark(q, { equation: { kind: 'text', value: '2Mg + 4HCl -> 2MgCl2 + 2H2' } })
      .marks.earned,
    2,
  );
  assert.equal(
    normalizeChemicalEquation('2 H₂ + O₂ → 2 H₂O'),
    normalizeChemicalEquation('O2 + 2H2 -> 2H2O'),
  );
  assert.equal(normalizeChemicalEquation('2h2 + O2 -> 2H2O'), null);
  assert.equal(equationBalance('H2 + O2 -> H2O'), false);
});
test('fixed selection honours level, avoids immediate repeats and rejects invalid refs', () => {
  for (const level of [1, 2, 3]) {
    const a = equationsProvider.select({
      activityId: 'igcse/equations',
      level,
      seed: 0,
      previousQuestionIds: [],
    });
    const b = equationsProvider.select({
      activityId: 'igcse/equations',
      level,
      seed: 0,
      previousQuestionIds: [a.questionId],
    });
    assert.equal(a.level, level);
    assert.notEqual(a.questionId, b.questionId);
    assert.equal(a.seed, 0);
    assert.throws(() => equationsProvider.restore({ ...a, seed: 1 }));
  }
});
test('recall gaps have unique IDs, correct linked ion charge/formula and no duplicate aqueous fact', () => {
  assert.equal(formulaeRecallFacts.length, 41);
  assert.equal(new Set(formulaeRecallFacts.map((f) => f.id)).size, 41);
  assert.ok(!formulaeRecallFacts.some((f) => f.id === 'igcse-recall-012'));
  assert.deepEqual(existingRecallGemLinks['igcse-recall-012'], ['fourth-16-2']);
  for (const ion of ionBank) {
    const f = formulaeRecallFacts.find((f) => f.id === 'igcse-ion-' + ion.id + '-formula');
    assert.equal(parseChemicalFormula(f.answer).charge, ion.charge);
    assert.deepEqual(parseChemicalFormula(f.answer).composition, ion.composition);
    const charge = formulaeRecallFacts.find((f) => f.id === 'igcse-ion-' + ion.id + '-charge');
    assert.ok(/[+-]/.test(charge.answer));
    assert.ok(charge.accepted.every((a) => /[+-]/.test(a)));
  }
});

test('38-example index and source fingerprints are current and model review IDs resolve', () => {
  const index = JSON.parse(
    fs.readFileSync(
      new URL('../../resources/recall-formulae/content/review-index.json', import.meta.url),
    ),
  );
  assert.equal(index.entries.length, 38);
  assert.equal(new Set(index.entries.map((e) => e.id)).size, 38);
  assert.equal(
    index.entries.filter((e) => e.activityId === 'igcse/formulae' && e.level === 1).length,
    4,
  );
  assert.equal(
    index.entries.filter((e) => e.activityId === 'igcse/formulae' && e.level === 2).length,
    4,
  );
  for (const source of index.sources) {
    const actual = crypto
      .createHash('sha256')
      .update(fs.readFileSync(new URL('../../' + source.path, import.meta.url)))
      .digest('hex');
    assert.equal(actual, source.sha256);
  }
  for (const entry of index.entries) {
    const provider = entry.activityId === 'igcse/formulae' ? formulaeProvider : equationsProvider;
    const ref = entry.activityId === 'igcse/formulae'
      ? formulaeRef(entry.id, entry.seed) : provider.resolveLink(entry.id);
    assert.ok(ref);
    assert.equal(ref.level, entry.level);
    assert.equal(ref.seed, entry.seed);
    assert.ok(entry.reviewLink.includes('view=teacher'));
  }
  assert.equal(normalizeChemicalFormula('Fe2+'), 'Fe^2+');
  assert.equal(normalizeChemicalFormula('Al³⁺'), 'Al^3+');
});

test('new activities retain exact canonical identity boundaries for persistence', () => {
  assert.equal(isCanonicalQuestionId('igcse/formulae', 'RF1:sodium-chloride:0'), true);
  assert.equal(isCanonicalQuestionId('igcse/equations', 'EQ-simple-balance-01'), true);
  for (const [activity, id] of [
    ['igcse/equations', 'RF1:sodium-chloride:0'],
    ['igcse/formulae', 'EQ-simple-balance-01'],
    ['igcse/formulae', 'RF1:unknown-pair:0'],
    ['igcse/formulae', 'RF1:sodium-chloride:01'],
    ['igcse/formulae', 'RF1:sodium-chloride:4294967296'],
    ['igcse/equations', 'EQ-simple-balance-05'],
  ])
    assert.equal(isCanonicalQuestionId(activity, id), false, id);
});

test('new teacher routes validate exact course, seed and level without overriding identity', async () => {
  const link =
    'https://local.test/?course=igcse&activity=igcse/formulae&review=RF1:sodium-chloride:123&seed=123&level=1';
  assert.equal((await resolveCompatibilityLink('igcse', link)).kind, 'curriculum');
  assert.equal(
    (await resolveCompatibilityLink('igcse', link.replace('seed=123', 'seed=124'))).kind,
    'unrecognized',
  );
  assert.equal(
    (await resolveCompatibilityLink('igcse', link.replace('level=1', 'level=2'))).kind,
    'unrecognized',
  );
  assert.equal((await resolveCompatibilityLink('alevel', link)).kind, 'unrecognized');
  assert.equal(
    (
      await resolveCompatibilityLink(
        'igcse',
        'https://local.test/?course=igcse&activity=igcse/equations&review=EQ-simple-balance-01&seed=0&level=1',
      )
    ).kind,
    'curriculum',
  );
});

test('compact canonical equation membership is derived exactly from the authored bank', () => {
  const ids = JSON.parse(
    fs.readFileSync(
      new URL(
        '../../src/chemistry/formulae-equations/canonical-equation-ids.json',
        import.meta.url,
      ),
    ),
  );
  assert.deepEqual(
    ids,
    equationBank.map((r) => fixedIdentity('EQ').code(r.id)),
  );
  assert.deepEqual(ids.map(id=>equationIdentity(id).sourceId),equationBank.map(r=>r.id));
  assert.equal(new Set(ids).size, 30);
});
