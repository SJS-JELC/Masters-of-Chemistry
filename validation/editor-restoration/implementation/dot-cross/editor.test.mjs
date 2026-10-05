import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {
  dotCrossEngine as engine,
  emptyDiagram,
  snapshot,
} from '../../../../src/chemistry/dot-and-cross/engine.ts';
import { createLayout } from '../../../../src/chemistry/dot-and-cross/layout.js';
import {
  adaptiveView,
  snapPoint,
  dragDelta,
  chargeDestination,
} from '../../../../src/chemistry/dot-and-cross/interaction.ts';
import { modelSVG, modelViewBox } from '../../../../src/chemistry/dot-and-cross/model.ts';
import { validateResponse } from '../../../../src/persistence/validation.ts';
import { check, validateReference } from '../../../../src/chemistry/dot-and-cross/core.js';
import { bank as aBank } from '../../../../src/activities/alevel/dot-and-cross/bank.js';
import { bank as iBank } from '../../../../src/activities/igcse/dot-and-cross/bank.js';
const workspace = path.resolve(import.meta.dirname, '../../../../../..');
const source = {};
for (const course of ['alevel', 'igcse']) {
  const root = course === 'alevel' ? 'Masters-of-A-Level-Chemistry' : 'Masters-of-IGCSE-Chemistry',
    context = vm.createContext({});
  for (const name of ['data.js', 'core.js', 'renderer.js'])
    vm.runInContext(
      fs.readFileSync(
        path.join(workspace, 'apps', root, 'src/activities/dot-and-cross', name),
        'utf8',
      ),
      context,
    );
  source[course] = context;
}
const json = (value) => JSON.parse(JSON.stringify(value)),
  bounds = { left: 0, right: 1000, top: 0, bottom: 650 };
test('Both original course organisers match each intermediate addition, cycle, deletion and relocation', () => {
  for (const course of ['alevel', 'igcse']) {
    const root =
      course === 'alevel' ? 'Masters-of-A-Level-Chemistry' : 'Masters-of-IGCSE-Chemistry';
    const text = fs.readFileSync(
      path.join(workspace, 'apps', root, 'src/activities/dot-and-cross/app.js'),
      'utf8',
    );
    const start = text.indexOf('  function organise()'),
      end = text.indexOf('  function commit(', start);
    assert(start >= 0 && end > start);
    const legacy = vm.createContext({ state: null });
    vm.runInContext(text.slice(start, end), legacy);
    let s = {
      kind: 'dot-and-cross',
      atoms: [
        { id: 'a1', element: 'O', x: 450, y: 325 },
        { id: 'a2', element: 'H', x: 530, y: 325 },
      ],
      electrons: [],
      groups: [],
      circles: false,
    };
    const anchor = (slot) => ({ kind: 'bond', a: 'a1', b: 'a2', slot });
    const commands = [
      { type: 'electron', symbol: 'cross', anchor: anchor(0) },
      { type: 'electron', symbol: 'dot', anchor: anchor(1) },
      { type: 'electron', symbol: 'cross', anchor: anchor(2) },
      { type: 'electron-symbol', id: 'e1', symbol: 'dot' },
      { type: 'delete', ids: ['e2'] },
      { type: 'relocate-electron', id: 'e1', anchor: { kind: 'atom', atomId: 'a1', slot: 0 } },
    ];
    for (const command of commands) {
      const expected = json(snapshot(s));
      if (command.type === 'electron') {
        const used = new Set(expected.electrons.map((e) => e.id));
        let i = 1;
        while (used.has('e' + i)) i++;
        expected.electrons.push({
          id: 'e' + i,
          symbol: command.symbol,
          anchor: json(command.anchor),
        });
      } else if (command.type === 'electron-symbol')
        expected.electrons.find((e) => e.id === command.id).symbol = command.symbol;
      else if (command.type === 'delete')
        expected.electrons = expected.electrons.filter((e) => !command.ids.includes(e.id));
      else expected.electrons.find((e) => e.id === command.id).anchor = json(command.anchor);
      legacy.state = expected;
      vm.runInContext('organise()', legacy);
      s = engine.apply(s, { ...command, organisation: course });
      assert.deepEqual(snapshot(s), json(legacy.state), course + '/' + command.type);
      assert.equal(s.circles, false);
      assert.equal('organisation' in s, false);
      assert(s.history.every((h) => !('organisation' in h) && !('circles' in h)));
    }
    const before = snapshot(s);
    s = engine.apply(s, { type: 'undo', organisation: course });
    assert.equal(s.circles, false);
    s = engine.apply(s, { type: 'redo', organisation: course });
    assert.equal(s.circles, false);
    assert.deepEqual(snapshot(s), before);
  }
});
test('All163 source records and2380 electron positions retained; references chemically valid and self-mark correct', () => {
  let points = 0;
  for (const [course, bank] of [
    ['alevel', aBank],
    ['igcse', iBank],
  ]) {
    assert.deepEqual(bank, json(source[course].DotCrossData.questions));
    for (const q of bank) {
      const record =
        course === 'alevel'
          ? q
          : {
              ...q,
              displayFormula: q.formula,
              totalCharge: 0,
              namedSpecies: false,
              practiceCategory: q.category,
            };
      assert.deepEqual(validateReference(record), []);
      assert.equal(check(q.reference, record).correct, true, q.id);
      source[course].DotCrossRenderer.setQuestion?.(q);
      const layout = createLayout(q.id);
      for (const e of q.reference.electrons) {
        assert.deepEqual(
          layout.point(q.reference, e.anchor),
          json(source[course].DotCrossRenderer.point(q.reference, e.anchor)),
          q.id,
        );
        points++;
      }
      for (const a of q.reference.atoms)
        assert.equal(layout.shellRadius(a), source[course].DotCrossRenderer.shellRadius(a));
    }
  }
  assert.equal(points, 2380);
});
test('Circles stay outside chemical snapshots and history through every edit, clear, undo, redo', () => {
  let s = engine.apply(emptyDiagram(), { type: 'atom', element: 'O', point: { x: 400, y: 325 } });
  const chemical = snapshot(s),
    n = s.history.length;
  s = engine.apply(s, { type: 'circles', visible: false });
  assert.equal(s.circles, false);
  assert.equal(s.history.length, n);
  assert.deepEqual(snapshot(s), chemical);
  assert.equal('circles' in s.history[0], false);
  s = engine.apply(s, {
    type: 'electron',
    symbol: 'dot',
    anchor: { kind: 'atom', atomId: 'a1', slot: 0 },
  });
  assert.equal(s.circles, false);
  s = engine.apply(s, { type: 'move', ids: ['a1'], dx: 10, dy: 0, bounds });
  assert.equal(s.circles, false);
  s = engine.apply(s, { type: 'group', atomIds: ['a1'], charge: -2, bracket: true });
  assert.equal(s.circles, false);
  s = engine.apply(s, { type: 'clear' });
  assert.equal(s.circles, false);
  assert.equal(s.atoms.length, 0);
  s = engine.apply(s, { type: 'undo' });
  assert.equal(s.circles, false);
  assert.equal(s.atoms.length, 1);
  s = engine.apply(s, { type: 'redo' });
  assert.equal(s.circles, false);
  assert.equal(s.atoms.length, 0);
  assert.equal(engine.apply(s, { type: 'circles', visible: false }), s);
  for (const h of [...s.history, ...s.future]) assert.equal('circles' in h, false);
});
test('Source placement30atom/45spacing cap,30degree snap, adaptive view and group bounds preserve shape', () => {
  const layout = createLayout(''),
    s = { ...emptyDiagram(), atoms: [{ id: 'a1', element: 'O', x: 500, y: 325 }] };
  assert.deepEqual(snapPoint(s, { x: 604, y: 327 }, [], 'O', layout, bounds), { x: 604, y: 325 });
  assert.deepEqual(snapPoint(s, { x: 569, y: 390 }, [], 'H', layout, bounds), {
    x: 500 + 80 * Math.cos(Math.PI / 6),
    y: 325 + 80 * Math.sin(Math.PI / 6),
  });
  assert.equal(engine.apply(s, { type: 'atom', element: 'H', point: { x: 510, y: 330 } }), s);
  const many = {
    ...emptyDiagram(),
    atoms: Array.from({ length: 30 }, (_, i) => ({
      id: `a${i + 1}`,
      element: 'H',
      x: i * 50,
      y: 100,
    })),
  };
  assert.equal(engine.apply(many, { type: 'atom', element: 'O', point: { x: 800, y: 500 } }), many);
  assert.deepEqual(adaptiveView(1060, 520), { x: -3.5, y: 78, width: 1007, height: 494 });
  const group = {
    ...s,
    atoms: [...s.atoms, { id: 'a2', element: 'O', x: 604, y: 325 }],
    groups: [{ id: 'g1', atomIds: ['a1', 'a2'], charge: -1, bracket: true }],
  };
  const delta = dragDelta(group, ['a1', 'a2'], 'a1', { x: 1000, y: 800 }, true, layout, bounds);
  assert.deepEqual(delta, { x: 396, y: 325 });
  const moved = engine.apply(group, {
    type: 'move',
    ids: ['a1', 'a2'],
    dx: delta.x,
    dy: delta.y,
    bounds,
  });
  assert.equal(moved.atoms[1].x - moved.atoms[0].x, 104);
});
test('Shared-region taps, packing/symbol alternation, relocation, invalid duplicate rejection and cascade', () => {
  const layout = createLayout('');
  let s = {
    ...emptyDiagram(),
    atoms: [
      { id: 'a1', element: 'O', x: 450, y: 325 },
      { id: 'a2', element: 'O', x: 554, y: 325 },
    ],
  };
  for (const symbol of ['dot', 'dot', 'cross', 'cross'])
    s = engine.apply(s, {
      type: 'electron',
      symbol,
      anchor: layout.regionAt(s, { x: 502, y: 325 }),
    });
  assert.deepEqual(
    [...s.electrons].sort((a, b) => a.anchor.slot - b.anchor.slot).map((e) => e.symbol),
    ['dot', 'cross', 'dot', 'cross'],
  );
  const e = s.electrons.find((e) => e.symbol === 'cross');
  s = engine.apply(s, {
    type: 'relocate-electron',
    id: e.id,
    anchor: layout.freeAnchor(s, { kind: 'atom', atomId: 'a1' }, e.id),
  });
  assert.equal(s.electrons.find((x) => x.id === e.id).anchor.kind, 'atom');
  assert.deepEqual(
    s.electrons
      .filter((e) => e.anchor.kind === 'bond')
      .map((e) => e.anchor.slot)
      .sort(),
    [0, 1, 2],
  );
  s = engine.apply(s, { type: 'electron-symbol', id: e.id, symbol: 'triangle' });
  assert.equal(s.electrons.find((x) => x.id === e.id).symbol, 'triangle');
  const anchor = s.electrons.find((x) => x.id === e.id).anchor;
  assert.equal(engine.apply(s, { type: 'electron', symbol: 'dot', anchor }), s);
  s = engine.apply(s, { type: 'group', atomIds: ['a1', 'a2'], charge: -1, bracket: true });
  s = engine.apply(s, { type: 'delete', ids: ['a1'] });
  assert.equal(s.electrons.length, 0);
  assert.equal(s.groups.length, 0);
});
test('Source charge routing distinguishes covalent local symbol and whole connected ion; charge update preserves group ID', () => {
  const layout = createLayout('');
  let s = {
    ...emptyDiagram(),
    atoms: [
      { id: 'a1', element: 'N', x: 450, y: 325 },
      { id: 'a2', element: 'H', x: 530, y: 325 },
    ],
    electrons: [
      { id: 'e1', symbol: 'dot', anchor: { kind: 'bond', a: 'a1', b: 'a2', slot: 0 } },
      { id: 'e2', symbol: 'dot', anchor: { kind: 'bond', a: 'a1', b: 'a2', slot: 1 } },
    ],
  };
  assert.deepEqual(chargeDestination(s, { x: 450, y: 325 }, layout), {
    atomIds: ['a1'],
    bracket: false,
  });
  assert.deepEqual(chargeDestination(s, { x: 400, y: 325 }, layout), {
    atomIds: ['a1', 'a2'],
    bracket: true,
  });
  s = engine.apply(s, { type: 'group', atomIds: ['a1'], charge: 1, bracket: false });
  const id = s.groups[0].id;
  s = engine.apply(s, { type: 'group', atomIds: ['a1'], charge: 2, bracket: false });
  assert.equal(s.groups[0].id, id);
  s = engine.apply(s, { type: 'group', atomIds: ['a1', 'a2'], charge: 1, bracket: true });
  assert.equal(s.groups.length, 1);
  assert.equal(s.groups[0].bracket, true);
});
test('Source checked answer fit/glyphs/Comfortaa/local charge and hidden-circle model stay complete', () => {
  for (const q of [...aBank, ...iBank]) {
    const record = q.displayFormula
      ? q
      : {
          ...q,
          displayFormula: q.formula,
          totalCharge: 0,
          namedSpecies: false,
          practiceCategory: q.category,
        };
    const box = modelViewBox(record);
    assert.equal(box.length, 4);
    assert(box.every(Number.isFinite));
    const svg = modelSVG(record);
    assert.equal((svg.match(/class="atom-label /g) || []).length, q.reference.atoms.length);
    assert.equal((svg.match(/class="electron-mark/g) || []).length, q.reference.electrons.length);
    assert(svg.includes('font-family:Comfortaa'));
    assert.equal((modelSVG(record, { circles: false }).match(/class="shell"/g) || []).length, 0);
  }
  const q = {
    ...aBank[0],
    reference: {
      atoms: [{ id: 'a1', element: 'C', x: 400, y: 325 }],
      electrons: [],
      groups: [{ id: 'g1', atomIds: ['a1'], charge: 1, bracket: false }],
    },
  };
  assert(modelSVG(q).includes('x="420" y="310" font-size="22"'));
});
test('Persisted optional circle preference and chemical history restore without accepting malformed history', () => {
  let s = engine.apply(emptyDiagram(), { type: 'atom', element: 'O', point: { x: 400, y: 325 } });
  s = engine.apply(s, { type: 'circles', visible: false });
  s = engine.apply(s, {
    type: 'electron',
    symbol: 'dot',
    anchor: { kind: 'atom', atomId: 'a1', slot: 0 },
  });
  const restored = json(s);
  assert.doesNotThrow(() => validateResponse(restored));
  assert.equal(engine.apply(restored, { type: 'undo' }).circles, false);
  assert.equal(
    engine.apply(engine.apply(restored, { type: 'undo' }), { type: 'redo' }).circles,
    false,
  );
  const absent = { ...restored };
  delete absent.circles;
  assert.doesNotThrow(() => validateResponse(absent));
  assert.equal(engine.apply(absent, { type: 'circles', visible: true }), absent);
  assert.throws(() => validateResponse({ ...restored, circles: 'false' }), /circles/);
  assert.throws(
    () => validateResponse({ ...restored, history: [{ ...snapshot(restored), circles: false }] }),
    /Unexpected persisted field/,
  );
  assert.throws(() =>
    validateResponse({
      ...restored,
      history: [{ ...snapshot(restored), atoms: [...restored.atoms, ...restored.atoms] }],
    }),
  );
});
test('Chemical history100 is bounded without snapshot nesting and circles preference survives long edit series', () => {
  let s = engine.apply(emptyDiagram(), { type: 'atom', element: 'H', point: { x: 400, y: 325 } });
  s = engine.apply(s, { type: 'circles', visible: false });
  for (let i = 0; i < 120; i++)
    s = engine.apply(s, { type: 'move', ids: ['a1'], dx: i % 2 ? 1 : -1, dy: 0, bounds });
  assert.equal(s.history.length, 100);
  assert.equal(s.circles, false);
  assert(s.history.every((h) => !('history' in h) && !('circles' in h)));
});
