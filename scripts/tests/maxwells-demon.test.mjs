import test from 'node:test';
import assert from 'node:assert/strict';
import { olympiadCompletion } from '../../src/landing/olympiad-completion.ts';
import {
  categories,
  classifications,
  relativeEnthalpy,
  networkData,
  networkEdges,
  coefficients,
  parameters,
  parameterRows,
  level2Tasks,
  level3Tasks,
  levelIds,
} from '../../src/activities/olympiad/maxwells-demon/content.ts';
import {
  blankMaxwellProgress,
  maxwellPolicy,
  parseNumber,
  isCorrect,
  assertMaxwellProgress,
  migrateMaxwellProgress,
  toggleCategory,
  fingerprint,
  maxwellPartUnlocked,
  availableMaxwellPart,
  acceptsNumericEdit,
  acceptsNumericDeletion,
} from '../../src/activities/olympiad/maxwells-demon/policy.ts';
import {
  legacyFixture,
  networkFixture,
  cFixture,
} from './fixtures/maxwells-demon-history/part-c-revision/author/legacy-fixtures.mjs';
const challenge = { activityId: 'alevel/maxwells-demon' },
  near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, a + ' != ' + b),
  transition = (p, c) => maxwellPolicy.transition(challenge, p, c).progress;
function completePart(p, level) {
  p = transition(p, { kind: 'maxwell-level', level });
  for (const t of level === 1 ? classifications : level === 2 ? level2Tasks : level3Tasks)
    p = transition(p, { kind: 'maxwell-answer', id: t.id,
      value: level === 1 ? [...t.answers].sort().join('|') : String(t.answer) });
  return transition(p, { kind: 'maxwell-check' });
}
test('eleven classifications retain eight compact reference categories, exact diatomic distinction and overlaps', () => {
  assert.equal(categories.length, 8);
  assert.equal(classifications.length, 11);
  assert.equal(levelIds(1).includes('l1-mean'), false);
  for (const [id, value, correct] of [
    ['l1-carbon', 'formation|combustion', true],
    ['l1-carbon', 'formation', false],
    ['l1-hydration', 'hydration|solvation', true],
    ['l1-state', 'combustion', true],
    ['l1-state', 'formation', false],
    ['l1-carbon-atomisation', 'atomisation', true],
    ['l1-carbon-atomisation', 'bond', false],
    ['l1-sodium-chloride-formation', 'formation', true],
    ['l1-sodium-chloride-formation', 'combustion', false],
    ['l1-scaled', '', false],
    ['l1-reaction', '', false],
    ['l1-bond', 'bond', true],
    ['l1-bond', 'atomisation', false],
    ['l1-atoms', 'atomisation', true],
  ])
    assert.equal(isCorrect(id, value), correct);
});
test('twelve directional targets derive independently from seven unchanged source equations', () => {
  const H = { A: 0 };
  H.B = H.A - 120;
  H.C = H.B + 40;
  H.D = H.A - 208;
  H.F = H.D - 3;
  H.E = H.F + 408;
  H.G = H.E - 68 / 2;
  H.I = H.A - 101;
  assert.deepEqual(H, relativeEnthalpy);
  assert.equal(networkData.length, 7);
  const targets = {
    AB: -120,
    BE: 317,
    AD: -208,
    BC: 40,
    CD: -128,
    CF: -131,
    DF: -3,
    EF: -408,
    EG: -34,
    FG: 374,
    FI: 110,
    IG: 264,
  };
  assert.equal(level2Tasks.length, 12);
  assert.equal(new Set(levelIds(2)).size, 12);
  for (const [from, to] of networkEdges) {
    const id = 'l2-map-' + from + to,
      answer = targets[from + to];
    assert.equal(H[to] - H[from], answer);
    assert.equal(level2Tasks.find((t) => t.id === id).answer, answer);
    assert.equal(isCorrect(id, String(answer)), true);
    assert.equal(isCorrect(id, String(-answer)), false);
    assert.equal(isCorrect(id, ''), false);
  }
  near(targets.AB + targets.BE + targets.EF, H.F - H.A);
  near(targets.AD + targets.DF, H.F - H.A);
  near(targets.FI + targets.IG, targets.FG);
  near(targets.EG + targets.IG * -1, H.I - H.E);
});
test('numeric parser accepts signed decimals/fractions/unicode minus and rejects blank, expressions and zero denominators', () => {
  for (const [text, value] of [
    ['−120', -120],
    ['-240/2', -120],
    ['+317.0', 317],
    [' 40 / 1 ', 40],
  ])
    near(parseNumber(text), value);
  for (const bad of ['', ' ', '1/0', '-1/-0', 'Infinity', 'NaN', '2+2', '1/18xyz', '1//18', '1e2'])
    assert.equal(parseNumber(bad), null);
  assert.equal(isCorrect('l2-map-AB', '−240/2'), true);
  assert.equal(isCorrect('l2-map-AB', '-119.9'), false);
  assert.equal(isCorrect('l3-a', '1/18'), true);
  assert.equal(isCorrect('l3-a', '0.06'), false);
});
test('fluorocarbon Hess coefficients, bond counts and balance retain exact checked result', () => {
  const p = Object.fromEntries(parameters.map(([s, _, v]) => [s, v])),
    Hl = 10 * p.d + 18 * (p.e + p.f) - 9 * p.c - p.a,
    Hgas = Hl + p.b,
    z = (10 * p.g + 9 * p.h - Hgas - 11 * p.i) / 18;
  near(z, 493.65);
  near(
    Object.entries(coefficients).reduce((sum, [s, k]) => sum + k * p[s], 0),
    z,
  );
  assert.equal(6 + 6 - 1, 11);
  assert.equal(10 * 4 - 2 * 11, 18);
  assert.equal(18, 9 * 2);
  const stoichiometry = { C10F18: -1, H2O: -9, O2: -5.5, CO2: 10, HF: 18 };
  const atoms = {
    C10F18: { C: 10, F: 18 },
    H2O: { H: 2, O: 1 },
    O2: { O: 2 },
    CO2: { C: 1, O: 2 },
    HF: { H: 1, F: 1 },
  };
  for (const element of ['C', 'F', 'H', 'O'])
    assert.equal(
      Object.entries(stoichiometry).reduce(
        (sum, [species, n]) => sum + n * (atoms[species][element] ?? 0),
        0,
      ),
      0,
      element + ' atom balance',
    );
  assert.equal(isCorrect('l3-estimate-j', '494'), true);
  assert.equal(isCorrect('l3-estimate-j', '-494'), false);
});
test('blank, partial and all33 completion; edits clear whole-part check and check produces no duplicate score status', () => {
  let p = blankMaxwellProgress('local');
  assert.equal(Object.keys(p.responses).length, 12);
  assertMaxwellProgress(p);
  for (const l of [1]) {
    p = transition(p, { kind: 'maxwell-level', level: l });
    var result = maxwellPolicy.transition(challenge, p, { kind: 'maxwell-check' });
    assert.equal(result.message, '');
    p = result.progress;
    assert.deepEqual(p.checks[l].correct, []);
  }
  p = completePart(p, 1);
  p = transition(p, { kind: 'maxwell-level', level: 2 });
  p = transition(p, { kind: 'maxwell-answer', id: 'l2-map-AB', value: '-120' });
  p = transition(p, { kind: 'maxwell-check' });
  assert.deepEqual(p.checks[2].correct, ['l2-map-AB']);
  p = transition(p, { kind: 'maxwell-answer', id: 'l2-map-BE', value: '317' });
  assert.equal(p.checks[2], undefined);
  for (const l of [1, 2, 3]) {
    p = transition(p, { kind: 'maxwell-level', level: l });
    for (const t of l === 1 ? classifications : l === 2 ? level2Tasks : level3Tasks)
      p = transition(p, {
        kind: 'maxwell-answer',
        id: t.id,
        value: l === 1 ? [...t.answers].sort().join('|') : String(t.answer),
      });
    p = transition(p, { kind: 'maxwell-check' });
    assert.equal(p.checks[l].correct.length, levelIds(l).length);
  }
  assertMaxwellProgress(p);
  assert.deepEqual(migrateMaxwellProgress(JSON.parse(JSON.stringify(p))), p);
  assert.deepEqual(olympiadCompletion(p, 'alevel/maxwells-demon'), {
    state: 'complete',
    correct: 33,
    total: 33,
  });
  assert.equal(olympiadCompletion(null, 'alevel/maxwells-demon').total, 33);
  assert.equal(Object.hasOwn(p, 'timing'), false);
});
test('original15 and UI9 saves generated by retained policies authenticate then narrowly migrate', () => {
  for (const format of ['original', 'ui'])
    for (const wrong of [false, true])
      for (const checked of [false, true]) {
        const old = legacyFixture(format, wrong, checked),
          snapshot = structuredClone(old);
        assertMaxwellProgress(old);
        const p = migrateMaxwellProgress(old);
        assert.deepEqual(old, snapshot);
        assertMaxwellProgress(p);
        assert.equal(p.level, Math.min(old.level, availableMaxwellPart(p)));
        assert.equal(p.introduction, old.introduction);
        assert.equal(p.responses['l1-mean'], undefined);
        assert.equal(p.checks[1].correct.length, 9);
        assert.equal(p.checks[1].fingerprint, fingerprint(p, 1));
        assert.equal(p.checks[3]?.correct.length, old.checks[3]?.correct.length);
        if (p.checks[3]) assert.equal(p.checks[3].fingerprint, fingerprint(p, 3));
        assert.deepEqual(p.revealed, []);
        assert.equal(p.checks[2], undefined);
        for (const id of levelIds(1).filter(
          (id) => !['l1-carbon-atomisation', 'l1-sodium-chloride-formation'].includes(id),
        ))
          assert.equal(p.responses[id], old.responses[id]);
        for (const id of [
          'l1-scaled',
          'l1-reaction',
          'l1-carbon-atomisation',
          'l1-sodium-chloride-formation',
        ])
          assert.equal(p.responses[id], undefined);
        for (const id of levelIds(3))
          assert.equal(
            p.responses[id],
            old.responses[
              id === 'l3-coefficient-i' ? 'l3-j' : id === 'l3-estimate-j' ? 'l3-z' : id
            ],
          );
        assert.equal(p.responses['l2-map-CD'], wrong ? '128' : '-128');
        assert.equal(p.responses['l2-map-BE'], '317');
        for (const id of levelIds(2).filter((id) => !['l2-map-CD', 'l2-map-BE'].includes(id)))
          assert.equal(p.responses[id], '');
        assert.equal(
          Object.keys(p.responses).some((id) => id.startsWith('l2-') && !id.startsWith('l2-map-')),
          false,
        );
        assert.deepEqual(olympiadCompletion(old, 'alevel/maxwells-demon'), {
          state: 'partial',
          correct: 19,
          total: 33,
        });
      }
});
test('legacy untouched/drafts preserve selected part, intro and responses while clearing every reveal flag', () => {
  const old = legacyFixture('ui', false, false);
  old.checks = {};
  old.responses = { 'l1-carbon': 'formation', 'l3-a': '1/18', 'l2-CD': '128', 'l2-GF': '-374' };
  old.revealed = [1, 2, 3];
  delete old.introduction;
  const p = migrateMaxwellProgress(old);
  assert.equal(p.introduction, undefined);
  assert.deepEqual(p.checks, {});
  assert.deepEqual(p.revealed, []);
  assert.equal(p.responses['l1-carbon'], 'formation');
  assert.equal(p.responses['l3-a'], '1/18');
  assert.equal(p.responses['l2-map-CD'], '128');
  assert.equal(p.responses['l2-map-FG'], '');
  const pristine = { ...old, responses: {}, revealed: [] };
  assertMaxwellProgress(pristine);
  assert.equal(Object.keys(migrateMaxwellProgress(pristine).responses).length, 12);
});
test('migration rejects forged legacy/current checks, unknown keys, partial/hybrid map formats and another challenge', () => {
  for (const base of [legacyFixture('original'), legacyFixture('ui')])
    for (const change of [
      (p) => (p.checks[2].fingerprint = 'fake'),
      (p) => p.checks[2].correct.pop(),
      (p) => (p.responses['l2-invented'] = '1'),
      (p) => (p.responses['l2-map-AB'] = '-120'),
      (p) => (p.activityId = 'alevel/olympiad-2011-q4'),
      (p) => (p.score = 1),
    ]) {
      const p = structuredClone(base);
      change(p);
      assert.throws(() => migrateMaxwellProgress(p));
    }
  const current = migrateMaxwellProgress(legacyFixture('ui'));
  for (const change of [
    (p) => delete p.responses['l2-map-IG'],
    (p) => (p.responses['l2-GF'] = '-374'),
    (p) => (p.responses['l1-mean'] = 'bond'),
    (p) => p.checks[1].correct.pop(),
    (p) => (p.checks[3].fingerprint = 'fake'),
  ]) {
    const p = structuredClone(current);
    change(p);
    assert.throws(() => migrateMaxwellProgress(p));
  }
  assert.equal(
    maxwellPolicy.transition(challenge, current, {
      kind: 'maxwell-answer',
      id: 'l2-GF',
      value: '-374',
    }).accepted,
    false,
  );
});
test('named multi-selection toggles overlaps and never credits untouched/deselected responses', () => {
  let v = toggleCategory(undefined, 'formation');
  v = toggleCategory(v, 'combustion');
  assert.equal(isCorrect('l1-carbon', v), true);
  v = toggleCategory(toggleCategory(v, 'formation'), 'combustion');
  assert.equal(v, 'unselected');
  assert.equal(isCorrect('l1-carbon', v), false);
  for (const t of classifications) assert.equal(isCorrect(t.id, ''), false);
});
test('Introduction/parts/restart retain state locally and only this challenge has normalized blank fields', () => {
  let p = blankMaxwellProgress('local');
  assert.equal(p.introduction, true);
  p = completePart(completePart(p, 1), 2);
  p = transition(p, { kind: 'maxwell-level', level: 3 });
  p = transition(p, { kind: 'maxwell-answer', id: 'l3-a', value: '1/18' });
  p = transition(p, { kind: 'maxwell-introduction' });
  assert.equal(p.level, 3);
  assert.equal(p.introduction, true);
  assert.equal(p.responses['l3-a'], '1/18');
  p = transition(p, { kind: 'restart' });
  assert.deepEqual(p, blankMaxwellProgress('local'));
});

test('authentic network saves retain map/c, remove old generic answers and all reveal flags without completing replacement items', () => {
  for (const wrong of [false, true])
    for (const checked of [false, true]) {
      const old = networkFixture(wrong, checked),
        snapshot = structuredClone(old);
      assertMaxwellProgress(old);
      const p = migrateMaxwellProgress(old);
      assert.deepEqual(old, snapshot);
      assertMaxwellProgress(p);
      assert.deepEqual(p.revealed, []);
      assert.equal(p.level, Math.min(old.level, availableMaxwellPart(p)));
      assert.equal(p.introduction, old.introduction);
      for (const id of [...levelIds(2), ...levelIds(3)])
        assert.equal(
          p.responses[id],
          old.responses[id === 'l3-coefficient-i' ? 'l3-j' : id === 'l3-estimate-j' ? 'l3-z' : id],
        );
      assert.deepEqual(p.checks[2], old.checks[2]);
      assert.equal(p.checks[3]?.correct.length, old.checks[3]?.correct.length);
      if (p.checks[3]) assert.equal(p.checks[3].fingerprint, fingerprint(p, 3));
      assert.equal(p.checks[1]?.correct.length, checked ? (wrong ? 8 : 9) : undefined);
      for (const id of [
        'l1-scaled',
        'l1-reaction',
        'l1-carbon-atomisation',
        'l1-sodium-chloride-formation',
      ])
        assert.equal(p.responses[id], undefined);
      assert.deepEqual(migrateMaxwellProgress(p), p);
    }
});
test('old generic empty answers authenticate before removal; forged/hybrid checks and obsolete reveal commands reject', () => {
  for (const old of [legacyFixture('original'), legacyFixture('ui'), networkFixture()]) {
    const forged = structuredClone(old);
    forged.responses['l1-scaled'] = 'unselected';
    assert.throws(() => migrateMaxwellProgress(forged));
    const hybrid = structuredClone(old);
    hybrid.responses['l1-carbon-atomisation'] = 'atomisation';
    assert.throws(() => migrateMaxwellProgress(hybrid));
  }
  const p = blankMaxwellProgress('local');
  assert.equal(maxwellPolicy.transition(challenge, p, { kind: 'maxwell-reveal' }).accepted, false);
});
test('compact definitions preserve exact processes and states with no runtime worked prose', () => {
  assert.deepEqual(
    categories.map((c) => c.id),
    [
      'bond',
      'formation',
      'combustion',
      'atomisation',
      'vaporisation',
      'solvation',
      'hydration',
      'solution',
    ],
  );
  assert.equal(
    categories[0].definition,
    'Energy required to break one mole of a specified covalent bond in gaseous molecules. Bond breaking is endothermic.',
  );
  assert.equal(categories[0].example, 'F₂(g) → 2F(g)');
  assert.equal(
    categories.find((c) => c.id === 'solution').definition,
    'Enthalpy change when one mole of solid dissolves in solvent to form a solution under the specified conditions.',
  );
  for (const c of categories) {
    assert.equal(Object.hasOwn(c, 'note'), false);
    assert.match(c.example, /\((?:g|s|l|aq)\)/);
  }
  for (const t of [...classifications, ...level2Tasks, ...level3Tasks])
    assert.equal(Object.hasOwn(t, 'why'), false);
});

test('ten a..j table rows retain nine supplied numbers and separate unknown, with correct standard symbols', () => {
  assert.equal(parameterRows.length, 10);
  assert.deepEqual(
    parameterRows.map((r) => r[0]),
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
  );
  assert.deepEqual(
    parameterRows.map((r) => r[3]),
    ['r', 'vap', 'f', 'f', 'f', 'solv', 'at', 'diss', 'diss', 'diss'],
  );
  assert.deepEqual(
    parameters.map((r) => r[2]),
    [-3467, 43.3, -285.8, -393.5, -273.3, -61.6, 716.7, 157, 325],
  );
  assert.equal(parameterRows[9][2], '?');
  assert.equal(levelIds(3).length, 10);
  assert.equal(levelIds(3)[8], 'l3-coefficient-i');
  assert.equal(levelIds(3)[9], 'l3-estimate-j');
  assert.deepEqual(Object.keys(coefficients), ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
});
test('c editing grammar permits temporary minus/fractions, deletion and unicode while complete assessment remains strict', () => {
  for (const value of [
    '',
    '-',
    '−',
    '+',
    '.',
    '1/',
    '1/-',
    '/18',
    '-11/18',
    '−11/18',
    ' 1 / 18 ',
    '1/0',
  ])
    assert.equal(acceptsNumericEdit(value), true, value);
  for (const value of ['x', '1a', '2+2', '1//18', '1.2.3', '--1', '1e2'])
    assert.equal(acceptsNumericEdit(value), false, value);
  for (const value of ['-', '1/', '/18', '1/0', '2+2', 'x'])
    assert.equal(isCorrect('l3-coefficient-i', value), false);
  assert.equal(isCorrect('l3-coefficient-i', '−11/18'), true);
  assert.equal(isCorrect('l3-estimate-j', '494'), true);
});
test('authentic original/UI/network/concise c full, wrong, draft, partial and tail-absent checks remap semantically and reject hybrids', () => {
  for (const format of ['original', 'ui', 'network', 'concise'])
    for (const mode of ['full', 'wrong', 'partial', 'absent', 'blank', 'invalid'])
      for (const checked of [false, true]) {
        const old = cFixture(format, mode, checked),
          before = structuredClone(old);
        assertMaxwellProgress(old);
        const p = migrateMaxwellProgress(old);
        assertMaxwellProgress(p);
        assert.deepEqual(old, before);
        assert.equal(p.responses['l3-coefficient-i'], old.responses['l3-j']);
        assert.equal(p.responses['l3-estimate-j'], old.responses['l3-z']);
        for (const id of levelIds(3).slice(0, 8)) assert.equal(p.responses[id], old.responses[id]);
        assert.equal(p.checks[3]?.correct.length, old.checks[3]?.correct.length);
        if (checked) assert.equal(p.checks[3].fingerprint, fingerprint(p, 3));
        assert.equal(p.level, Math.min(old.level, availableMaxwellPart(p)));
        assert.deepEqual(p.revealed, []);
        if (format === 'network' || format === 'concise')
          assert.deepEqual(p.checks[2], old.checks[2]);
        for (const id of levelIds(2))
          if (format === 'network' || format === 'concise')
            assert.equal(p.responses[id], old.responses[id]);
        assert.deepEqual(migrateMaxwellProgress(p), p);
        if (mode === 'full') {
          const forged = structuredClone(old);
          forged.checks[3] = { fingerprint: 'forged', correct: [] };
          assert.throws(() => migrateMaxwellProgress(forged));
          const hybrid = structuredClone(old);
          hybrid.responses['l3-estimate-j'] = '494';
          assert.throws(() => migrateMaxwellProgress(hybrid));
        }
      }
});
test('current c tail-absent/partial saves and checks remain valid without manufactured completion', () => {
  for (const id of [undefined, 'l3-a', 'l3-coefficient-i', 'l3-estimate-j'])
    for (const checked of [false, true]) {
      let p = blankMaxwellProgress('local');
      p = completePart(completePart(p, 1), 2);
  p = transition(p, { kind: 'maxwell-level', level: 3 });
      if (id)
        p = transition(p, {
          kind: 'maxwell-answer',
          id,
          value: id === 'l3-a' ? '1/18' : id === 'l3-coefficient-i' ? '-11/18' : '494',
        });
      if (checked) p = transition(p, { kind: 'maxwell-check' });
      const migrated = migrateMaxwellProgress(p);
      assert.deepEqual(migrated, p);
      assert.equal(migrated.checks[3]?.correct.length, checked ? (id ? 1 : 0) : undefined);
    }
});

test('deletion exception only removes existing characters from legacy invalid drafts', () => {
  for (const [before, after] of [
    ['alphabet', 'alphabe'],
    ['alphabet', ''],
    ['2+2', '2+'],
    ['2+2', '22'],
    ['alphabet', 'abet'],
  ])
    assert.equal(acceptsNumericDeletion(before, after), true);
  for (const [before, after] of [
    ['abc', 'x'],
    ['2+2', '2+3'],
    ['abc', 'cba'],
    ['abc', 'abc'],
    ['abc', 'abcx'],
  ])
    assert.equal(acceptsNumericDeletion(before, after), false);
  for (const format of ['original', 'ui', 'network', 'concise']) {
    const old = cFixture(format, 'invalid', false),
      p = migrateMaxwellProgress(old);
    assert.equal(p.responses['l3-coefficient-i'], '2+2');
    assert.equal(p.responses['l3-estimate-j'], 'alphabet');
    assert.equal(p.checks[3], undefined);
    assert.equal(isCorrect('l3-coefficient-i', p.responses['l3-coefficient-i']), false);
    assert.equal(isCorrect('l3-estimate-j', p.responses['l3-estimate-j']), false);
  }
});

 test('parts require checked full completion; locked commands reject and restored drafts survive', () => {
  let p = blankMaxwellProgress('local');
  for (const command of [
    {kind: 'maxwell-level', level: 2}, {kind: 'maxwell-level', level: 3},
    {kind: 'maxwell-answer', id: 'l2-map-AB', value: '-120'},
    {kind: 'maxwell-answer', id: 'l3-a', value: '1/18'},
  ]) assert.equal(maxwellPolicy.transition(challenge, p, command).accepted, false);
  for (const t of classifications)
    p = transition(p, {kind: 'maxwell-answer', id: t.id, value: [...t.answers].sort().join('|')});
  assert.equal(maxwellPartUnlocked(p, 2), false, 'unchecked correct answers do not unlock');
  p = transition(p, {kind: 'maxwell-check'});
  assert.equal(maxwellPartUnlocked(p, 2), true);
  assert.equal(maxwellPartUnlocked(p, 3), false);
  p = transition(p, {kind: 'maxwell-level', level: 2});
  p = transition(p, {kind: 'maxwell-answer', id: 'l2-map-AB', value: '-120'});
  p = transition(p, {kind: 'maxwell-check'});
  assert.equal(maxwellPartUnlocked(p, 3), false, 'partial success does not unlock');
  p = completePart(p, 2);
  assert.equal(maxwellPartUnlocked(p, 3), true);
  p = transition(p, {kind: 'maxwell-level', level: 3});
  p = transition(p, {kind: 'maxwell-answer', id: 'l3-a', value: '1/18'});
  p = transition(p, {kind: 'maxwell-level', level: 1});
  p = transition(p, {kind: 'maxwell-answer', id: classifications[0].id, value: 'unselected'});
  assert.equal(maxwellPartUnlocked(p, 2), false);
  assert.equal(maxwellPartUnlocked(p, 3), false);
  assert.equal(p.responses['l3-a'], '1/18');
  const savedOnLockedPart = {...p, level: 3};
  assert.equal(maxwellPolicy.transition(challenge, savedOnLockedPart, {kind:'maxwell-check'}).accepted, false);
  const restored = migrateMaxwellProgress(savedOnLockedPart);
  assert.equal(restored.level, 1);
  assert.equal(restored.responses['l3-a'], '1/18');
  assert.deepEqual(transition(restored, {kind:'restart'}), blankMaxwellProgress('local'));
});
