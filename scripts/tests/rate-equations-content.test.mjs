import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { makeOrders } from '../../src/activities/alevel/rate-equations/orders.ts';
import { makeGraphs, makeArrhenius, concentrationAt, gradientAt, curveTimeAt, GAS_CONSTANT } from '../../src/activities/alevel/rate-equations/graphs.ts';
import { makeMechanisms } from '../../src/activities/alevel/rate-equations/mechanisms.ts';
import { rateMarking } from '../../src/activities/alevel/rate-equations/marking.ts';
import { rateProvider, restoreRateExample } from '../../src/activities/alevel/rate-equations/provider.ts';
import { rateActivityId, rateGemIds, rateQuestionSources, allRateQuestionSources } from '../../src/activities/alevel/rate-equations/identity.ts';
import { parseRateLaw, parseRateUnits, equivalentRateLaw, equivalentRateUnits, formatRateInput } from '../../src/activities/alevel/rate-equations/input-syntax.ts';
import { isCanonicalQuestionId, validatePreviousQuestionIds } from '../../src/content/canonical-identity.ts';
import { questionDisplayCode, questionLookupInput } from '../../src/content/question-display-identity.ts';
import { productionRegistry } from '../../src/foundation/registry.ts';
import { teacherCatalogue } from '../../src/ui/teacher-catalogue.ts';
import fixtures from './fixtures/rate-equations-preservation.json' with { type: 'json' };

const factories = { orders: makeOrders, graphs: makeGraphs, mechanisms: makeMechanisms, arrhenius: makeArrhenius };
const seeds = [0, 1, 7, 42, 2026, 0xffffffff];
const near = (actual, expected, tolerance = 1e-12) => assert(Math.abs(actual - expected) <= Math.max(tolerance, Math.abs(expected) * 1e-12), `${actual} != ${expected}`);
const workspace = path.resolve(import.meta.dirname, '../../../..');

test('all12 checked source questions, answers and72 seeded examples are preserved exactly', () => {
  for (const item of fixtures.cases) {
    const source = rateQuestionSources.find(source => source.questionId === item.questionId);
    assert(source);
    const example = factories[source.gem](source.level, item.seed);
    assert.deepEqual(factories[source.gem](source.level, item.seed), example);
    assert.equal(crypto.createHash('sha256').update(JSON.stringify(example)).digest('hex'), item.sha256);
    const result = rateMarking.mark(example.question, example.correctResponses);
    assert(result.accepted && result.marks.available > 0 && result.marks.earned === result.marks.available);
    assert.equal(rateMarking.masteryScore(result.marks), 1);
    assert.equal(rateMarking.mark(example.question, {}).accepted, false);
  }
  assert.equal(fixtures.cases.length, 72);
  for (const item of fixtures.startingAnswers) {
    const source = rateQuestionSources.find(source => source.questionId === item.questionId);
    assert.deepEqual(factories[source.gem](source.level, 0).correctResponses, item.correctResponses);
  }
  assert.equal(fixtures.startingAnswers.length, 12);
});

test('source provenance is readable and all three retained hashes match', () => {
  const sources = new Map(Object.values(factories).flatMap(factory => factory(1, 0).question.sources).map(source => [source.path, source]));
  assert.equal(sources.size, 3);
  for (const source of sources.values())
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(workspace, source.path))).digest('hex'), source.sha256);
});

test('orders and units follow concentration factors independently of the answer model', () => {
  const unitByOrder = ['mol dm-3 s-1', 's-1', 'dm3 mol-1 s-1', 'dm6 mol-2 s-1', 'dm9 mol-3 s-1'];
  for (const level of [1, 2, 3]) for (const seed of seeds) {
    const example = makeOrders(level, seed), { m, n, k, a, b, rate } = example.validation;
    const rows = example.question.context.find(block => block.kind === 'table').rows;
    const rateColumn = level === 1 ? 2 : 3;
    near(Number(rows[1][rateColumn]) / Number(rows[0][rateColumn]), 2 ** m, 1e-7);
    near(rate, k * a ** m * b ** n);
    if (level > 1) {
      const ratio = level === 2 ? 2 ** n : 3 ** m * 2 ** n;
      near(Number(rows[2][rateColumn]) / Number(rows[0][rateColumn]), ratio, 1e-6);
      assert(equivalentRateLaw(example.correctResponses['rate-equation'].value, `k[A]^${m}[B]^${n}`, ['A', 'B']));
    }
    if (level === 2) {
      near(Number(example.correctResponses.k.raw), rate / (a ** m * b ** n));
      assert(equivalentRateUnits(example.correctResponses['k-units'].value, unitByOrder[m + n]));
    }
    if (level === 3) near(Number(example.correctResponses['predicted-rate'].raw), rate * 3 ** m * 0.5 ** n);
  }
});

test('graph half-lives, gradients,60-second conversion and Arrhenius scaling are consistent', () => {
  for (const level of [1, 2, 3]) for (const seed of seeds) {
    const curve = makeGraphs(level, seed), graph = curve.graph, halfLife = Math.LN2 / graph.k;
    near(concentrationAt(graph, halfLife), graph.initial / 2);
    near(concentrationAt(graph, halfLife * 2), graph.initial / 4);
    near(curveTimeAt(graph, graph.initial / 4) - curveTimeAt(graph, graph.initial / 2), halfLife);
    near(gradientAt(graph, graph.initialMarker), -graph.k * concentrationAt(graph, graph.initialMarker));
    const secondsFactor = level === 3 ? 60 : 1;
    near(curve.validation.ratePerSecond, graph.k * concentrationAt(graph, graph.initialMarker) / secondsFactor);
    near(curve.validation.kPerSecond, graph.k / secondsFactor);
    const arrhenius = makeArrhenius(level, seed), a = arrhenius.graph, v = arrhenius.validation;
    near(v.activationEnergyKJ, -a.gradient * GAS_CONSTANT / 1000);
    near(v.displayedGradient, a.gradient / (level === 2 ? 1000 : 1));
    near(v.A, Math.exp(a.intercept));
    near(v.newK, Math.exp(a.intercept + a.gradient / v.newTemperatureKelvin));
    near(v.leftEdgeLnK, a.intercept + a.gradient * a.minX);
    assert.notEqual(v.leftEdgeLnK, v.trueIntercept);
  }
});

test('mechanism steps conserve atoms and neutral charge; accepted sums and slow-step laws agree', () => {
  const counts = { CO: [1, 0, 1, 0], NO2: [0, 1, 2, 0], NO: [0, 1, 1, 0], CO2: [1, 0, 2, 0], NO3: [0, 1, 3, 0], F2: [0, 0, 0, 2], F: [0, 0, 0, 1], NO2F: [0, 1, 2, 1], O: [0, 0, 1, 0], N2O3: [0, 2, 3, 0] };
  const total = side => side.reduce((sum, [species, coefficient]) => sum.map((n, i) => n + counts[species][i] * coefficient), [0, 0, 0, 0]);
  const steps = [
    [[['NO2', 2]], [['NO', 1], ['NO3', 1]]],
    [[['NO3', 1], ['CO', 1]], [['NO2', 1], ['CO2', 1]]],
    [[['F2', 1]], [['F', 2]]],
    [[['F2', 1], ['NO2', 1]], [['F', 1], ['NO2F', 1]]],
    [[['F', 1], ['NO2', 1]], [['NO2F', 1]]],
    [[['F2', 1], ['NO2', 2]], [['NO2F', 2]]],
    [[['NO2', 1]], [['NO', 1], ['O', 1]]],
    [[['O', 1], ['CO', 1]], [['CO2', 1]]],
    [[['NO2', 1], ['CO', 1]], [['NO', 1], ['CO2', 1]]],
    [[['NO', 1], ['NO2', 1]], [['N2O3', 1]]],
  ];
  for (const [left, right] of steps) assert.deepEqual(total(left), total(right));
  const net = chosen => {
    const stoichiometry = {};
    for (const index of chosen) for (const [sign, side] of [[-1, steps[index][0]], [1, steps[index][1]]])
      for (const [species, coefficient] of side) stoichiometry[species] = (stoichiometry[species] ?? 0) + sign * coefficient;
    return Object.fromEntries(Object.entries(stoichiometry).filter(([, n]) => n));
  };
  assert.deepEqual(net([0, 1]), { NO2: -1, CO: -1, NO: 1, CO2: 1 });
  assert.deepEqual(net([3, 4]), { F2: -1, NO2: -2, NO2F: 2 });
  assert.deepEqual(net([6, 7]), { NO2: -1, NO: 1, CO: -1, CO2: 1 });
  assert.deepEqual(net([8, 9]), { NO2: -2, CO: -1, CO2: 1, N2O3: 1 });
  assert(equivalentRateLaw(makeMechanisms(1, 0).correctResponses['rate-equation'].value, 'k[NO2]^2[CO]^0', ['NO2', 'CO']));
  assert(equivalentRateLaw(makeMechanisms(2, 0).correctResponses['rate-equation'].value, 'k[NO2][F2]', ['F2', 'NO2']));
  assert.deepEqual(makeMechanisms(3, 0).correctResponses.mechanism.selected, ['2']);
});

test('bounded semantic parser accepts supported equivalent powers and rejects chemical mistakes', () => {
  for (const value of ['rate=k[A]²[B]', 'k[B]^1[A]^2', '[A][B][A]k', 'rate = k × [B] · [A]^(2)', 'k[A]2[B]1'])
    assert(equivalentRateLaw(value, 'rate = k[A]²[B]', ['A', 'B']), value);
  for (const value of ['k[A]^1[B]', 'k[a]^2[B]', 'K[A]^2[B]', 'k[A]^2[B][C]^0', 'k[A]^-1[B]', 'k[A]^3[B]', 'k[A]^2[B]+3', 'k**[A]^2[B]', 'k[A]^2[B]*', 'kk[A]^2[B]', 'rate k[A]^2[B]', 'k[A]^2[B]^0'])
    assert.equal(equivalentRateLaw(value, 'k[A]^2[B]', ['A', 'B']), false, value);
  assert(equivalentRateLaw('k[CO]^0[NO₂]^2', 'k[NO2]²', ['NO2', 'CO']));
  assert.equal(parseRateLaw('k[X]^0', ['A']), null);
  for (const value of ['dm³ mol⁻¹ s⁻¹', 's-1 mol^(-1) dm^{3}', 'dm3*mol-1*s-1'])
    assert(equivalentRateUnits(value, 'dm3 mol-1 s-1'), value);
  for (const value of ['dm-3 mol-1 s-1', 'dm3 mol-1 min-1', 'DM3 mol-1 s-1', 'dm3 mol-1 s-1 kg0', 'dm3 mol-1 s-1*'])
    assert.equal(equivalentRateUnits(value, 'dm3 mol-1 s-1'), false, value);
  assert.equal(parseRateUnits(''), null);
  assert.equal(formatRateInput('[NO2]^2', 'rate-law').value, '[NO₂]²');
  assert.equal(formatRateInput('dm3 mol-1 s-1', 'units').value, 'dm³ mol⁻¹ s⁻¹');
});

test('historical provider refs restore every semantic gem/level without numeric history remapping', () => {
  for (const source of rateQuestionSources) for (const seed of seeds) {
    const ref = { activityId: rateActivityId, questionId: source.questionId, level: source.level, seed: source.gem === 'mechanisms' ? 0 : seed };
    assert.equal(ref.questionId, source.questionId);
    assert.equal(ref.level, source.level);
    assert.equal(ref.seed, source.gem === 'mechanisms' ? 0 : seed);
    const restored = restoreRateExample(ref);
    assert.equal(restored.gem, source.gem);
    assert.deepEqual(restored.question.ref, ref);
    assert.deepEqual(rateProvider.restore(ref), restored.question);
    const display = questionDisplayCode({ course: 'alevel', activityId: rateActivityId, questionId: source.questionId });
    assert.match(display, /^RE-[A-Z0-9]{6}$/);
    assert.equal(questionLookupInput('alevel', rateActivityId, display), source.questionId);
    assert.equal(rateProvider.resolveLink(display.toLowerCase()).questionId, source.questionId);
    assert.equal(rateProvider.resolveLink(source.questionId).level, source.level);
    assert(isCanonicalQuestionId(rateActivityId, source.questionId));
    assert(!isCanonicalQuestionId('alevel/acid-base-calculations', source.questionId));
  }
  const ref = rateProvider.resolveLink('RE-000001');
  for (const patch of [{ seed: -1 }, { seed: 0x100000000 }, { seed: NaN }, { seed: 1.5 }, { level: 2 }, { level: 0 }, { activityId: 'alevel/acid-base-calculations' }, { questionId: 'RATE-POC-fake-L1' }, { questionId: 'RE-000001' }])
    assert.throws(() => rateProvider.restore({ ...ref, ...patch }));
  assert.throws(() => rateProvider.restore({ ...rateProvider.resolveLink('RE-000007'), seed: 1 }));
  for (const gemId of [undefined, 'u6-t1-2-1', 'u6-t1-2-7', 'u6-t1-2-fake'])
    assert.throws(() => rateProvider.select({ activityId: rateActivityId, gemId, level: 1, seed: 0, previousQuestionIds: [] }));
  const selection = { activityId: rateActivityId, gemId: rateGemIds.orders, level: 1, seed: 0, previousQuestionIds: [] };
  for (const patch of [{ activityId: 'alevel/acid-base-calculations' }, { level: 0 }, { level: 4 }, { seed: -1 }, { seed: 1.5 }, { seed: 0x100000000 }, { previousQuestionIds: ['RE-000001'] }])
    assert.throws(() => rateProvider.select({ ...selection, ...patch }));
  for (const bad of ['RATE-POC-orders-L4', 'RATE-POC-unknown-L1', 'u6-t1-2-1', 'RE-000001', 'AB-000001'])
    assert.throws(() => validatePreviousQuestionIds(rateActivityId, [bad]));
  for (const gem of ['orders', 'graphs', 'mechanisms', 'arrhenius', 'unknown', 'Orders', ''])
    for (const level of [-1, 0, 1, 2, 3, 4, '01', '']) {
      const id = `RATE-POC-${gem}-L${level}`;
      assert.equal(isCanonicalQuestionId(rateActivityId, id), rateQuestionSources.some(source => source.questionId === id));
    }
  for (const id of ['RATE-POC-orders-L1\n', 'RATE-POC-orders-L1 ', ' RATE-POC-orders-L1', 'RATE-POC-orders-L1-extra', null, 1])
    assert.equal(isCanonicalQuestionId(rateActivityId, id), false);
  assert.equal(rateProvider.resolveLink('u6-t1-2-1'), null);
  assert.equal(rateProvider.resolveLink('RATE-POC-orders-L4'), null);
  assert.equal(rateProvider.coverage.flatMap(c => c.kind === 'fixed' ? c.questionIds : c.families.map(f => f.templateId)).length, allRateQuestionSources.length);
});

test('new activity registers four three-level gems with no old aliases and standard mastery mapping', async () => {
  const activity = productionRegistry.get(rateActivityId);
  assert.equal(productionRegistry.activities.length, 18);
  assert.equal(activity.revision, true);
  assert.equal(activity.idleAllowance(rateProvider.restore(rateProvider.resolveLink('RE-000001'))), 300000);
  assert.equal(activity.gems.length, 4);
  assert.equal(productionRegistry.activities.filter(a => a.strand === 'curriculum').flatMap(a => a.gems.flatMap(g => g.supportedLevels)).length, 60);
  for (const gem of activity.gems) {
    assert.deepEqual(gem.supportedLevels, [1, 2, 3]);
    assert.equal(gem.mastery.threshold, 0.8);
    assert.equal(gem.mastery.comparison, 'strictly-greater');
    assert.deepEqual(gem.mastery.historicalAliases, []);
    assert.deepEqual(gem.mastery.legacySourceKeys, []);
    assert(gem.mastery.supportedLevels.every(level => level.halfLife === 2));
  }
  assert.equal(await activity.provider(), rateProvider);
  assert.equal(await activity.marking(), rateMarking);
  assert.equal(rateMarking.masteryScore({ earned: 0, available: 4, points: [] }), 0);
  assert.equal(rateMarking.masteryScore({ earned: 2, available: 4, points: [] }), 0.5);
  assert.equal(rateMarking.masteryScore({ earned: 4, available: 4, points: [] }), 1);
  const catalogue = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../../src/landing/catalogue-data.json'), 'utf8'));
  const topic = catalogue.alevel.groups.flatMap(g => g.topics).find(t => t[1] === 'Rate Equations');
  assert.deepEqual(topic[2], activity.gems.map(gem => gem.label));
  for (const [index, gem] of activity.gems.entries()) {
    assert.equal(catalogue.alevel.display.identities['u6-t1-2-' + (index + 1)], gem.id);
    assert.deepEqual(catalogue.alevel.activities[gem.id].availableGrades, [1, 2, 3]);
  }
  const teacherRows = await teacherCatalogue(rateActivityId);
  assert.equal(teacherRows.length, allRateQuestionSources.length);
  assert.equal(new Set(teacherRows.map(row => row.ref.questionId)).size, allRateQuestionSources.length);
  for (const row of teacherRows) {
    const source = allRateQuestionSources.find(source => source.questionId === row.ref.questionId);
    assert(source);
    assert.equal(row.ref.level, source.level);
    assert.equal(row.ref.seed, 0);
    assert.match(questionDisplayCode({ course: 'alevel', ...row.ref }), /^RE-[A-Z0-9]{6,8}$/);
  }
});
