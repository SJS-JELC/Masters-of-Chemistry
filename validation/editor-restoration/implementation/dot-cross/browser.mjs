import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const here = import.meta.dirname,
  project = path.resolve(here, '../../../..'),
  workspace = path.resolve(project, '../..'),
  require = createRequire(path.join(workspace, 'package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const roots = {
    alevel: path.join(workspace, 'apps/Masters-of-A-Level-Chemistry/src'),
    igcse: path.join(workspace, 'apps/Masters-of-IGCSE-Chemistry/src'),
  },
  banks = {};
for (const course of ['alevel', 'igcse']) {
  const context = vm.createContext({});
  vm.runInContext(
    fs.readFileSync(path.join(roots[course], 'activities/dot-and-cross/data.js'), 'utf8'),
    context,
  );
  banks[course] = JSON.parse(JSON.stringify(context.DotCrossData.questions));
}
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
};
const server = http.createServer((req, res) => {
  const [course, ...parts] = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      .slice(1)
      .split('/'),
    root = roots[course];
  if (!root) {
    res.writeHead(404).end();
    return;
  }
  const file = path.resolve(root, parts.join('/') || 'index.html');
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const oldBase = `http://127.0.0.1:${server.address().port}`,
  newBase = 'http://127.0.0.1:5183';
const verify = await fetch(newBase + '/src/editors/dot-and-cross/DotCrossEditor.tsx');
assert.equal(verify.status, 200);
assert((await verify.text()).includes('dc-editor-card'));
fs.mkdirSync(path.join(here, 'screens'), { recursive: true });
fs.mkdirSync(path.join(here, 'tmp'), { recursive: true });
process.env.TEMP = path.join(here, 'tmp');
process.env.TMP = process.env.TEMP;
const report = {
  startedAt: new Date().toISOString(),
  method:
    'Pinned root Playwright1.62.1/headless Edge/fresh isolated contexts; original reference static server readonly on ephemeral port. Matching reference snapshots via isolated bridge stub; new harness mounts real React editor and source-style pane, no attempt engine. Shared host gates foreman-owned.',
  origins: { old: oldBase, new: newBase },
  comparisons: [],
  operations: [],
  pageErrors: [],
  failures: [],
};
const browser = await require('playwright').chromium.launch({ channel: 'msedge', headless: true });
report.browserVersion = browser.version();
async function open(course, width, height, question = 'h2o', empty = false) {
  const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: width === 390,
    }),
    old = await context.newPage(),
    current = await context.newPage(),
    q = banks[course].find((q) => q.id === question),
    level = q.grades[0],
    category = course === 'alevel' ? 'all' : q.category;
  assert(q);
  await old.addInitScript(
    ({ q, level, category, empty, course }) => {
      const state = {
        version: 2,
        questionId: q.id,
        category,
        grade: level,
        diagram: empty ? { atoms: [], electrons: [], groups: [] } : q.reference,
        history: [],
        future: [],
        circles: true,
        remaining: [],
      };
      const api = {
        connect: async () => ({
          level,
          leafId:
            course === 'alevel' ? 'l6-t2-1-3' : category === 'ionic' ? 'fourth-3-1' : 'fourth-3-2',
          attemptId: 'e02-isolated-source',
          state,
        }),
        save: (s) => {
          window.referenceState = structuredClone(s);
        },
        result: async () => {},
        next: () => {},
      };
      Object.defineProperty(window, 'TestModeBridge', {
        configurable: true,
        get: () => api,
        set: () => {},
      });
    },
    { q, level, category, empty, course },
  );
  for (const [kind, page] of [
    ['old', old],
    ['new', current],
  ])
    page.on('pageerror', (e) =>
      report.pageErrors.push({ course, question, kind, error: e.message }),
    );
  await old.goto(
    `${oldBase}/${course}/activities/dot-and-cross/index.html?level=${level}&grade=${level}&category=${category}&question=${question}`,
  );
  await old
    .locator('#canvas .atom-label')
    .first()
    .waitFor({ state: empty ? 'detached' : 'visible' });
  await old.waitForFunction(() => window.referenceState?.questionId);
  await current.goto(
    `${newBase}/validation/editor-restoration/implementation/dot-cross/harness.html?course=${course}&question=${question}&empty=${empty ? '1' : '0'}`,
  );
  await current.locator('.dc-editor-card').waitFor();
  for (const page of [old, current]) await page.evaluate(() => document.fonts.ready);
  return { context, old, current, course, question, width, height };
}
const svg = (pair, kind) =>
  kind === 'old' ? pair.old.locator('#canvas') : pair.current.locator('.dc-canvas');
async function state(page, old = false) {
  return page.evaluate(
    (old) => (old ? window.referenceState.diagram : window.editorHarness.snapshot()),
    old,
  );
}
async function geometry(page, old = false) {
  await page.locator(old ? '.editor' : '.dc-editor-card').waitFor();
  return page.evaluate((old) => {
    const root = document.querySelector(old ? '.editor' : '.dc-editor-card'),
      s = root.querySelector(old ? '#canvas' : '.dc-canvas'),
      toolbar = root.querySelector('.toolbar'),
      aside = root.querySelector('.marking'),
      box = (e) => {
        const b = e.getBoundingClientRect();
        return { width: b.width, height: b.height };
      };
    return {
      card: box(root),
      canvas: box(s),
      toolbar: box(toolbar),
      aside: box(aside),
      viewBox: s.getAttribute('viewBox'),
      palette: [...root.querySelectorAll('[data-element]')].map((e) => e.dataset.element),
      paletteStyle: [...toolbar.querySelectorAll('button')].map((e) => {
        const c = getComputedStyle(e),
          b = e.getBoundingClientRect(),
          t = toolbar.getBoundingClientRect();
        return {
          text: e.textContent,
          font: c.fontFamily,
          size: c.fontSize,
          weight: c.fontWeight,
          color: c.color,
          opacity: c.opacity,
          padding: c.padding,
          radius: c.borderRadius,
          left: b.left - t.left,
          top: b.top - t.top,
          width: b.width,
          height: b.height,
        };
      }),
      atoms: [...s.querySelectorAll('.atom-label')].map((e) => ({
        text: e.textContent,
        x: e.getAttribute('x'),
        y: e.getAttribute('y'),
        font: getComputedStyle(e).fontFamily,
        size: getComputedStyle(e).fontSize,
        fill: getComputedStyle(e).fill,
      })),
      electrons: [...s.querySelectorAll('.electron-mark')].map((e) => ({
        tag: e.tagName,
        d: e.getAttribute('d'),
        cx: e.getAttribute('cx'),
        cy: e.getAttribute('cy'),
        r: e.getAttribute('r'),
        fill: getComputedStyle(e).fill,
        stroke: getComputedStyle(e).stroke,
        width: getComputedStyle(e).strokeWidth,
      })),
      shells: [...s.querySelectorAll('.shell')].map((e) => ({
        cx: e.getAttribute('cx'),
        cy: e.getAttribute('cy'),
        r: e.getAttribute('r'),
        stroke: getComputedStyle(e).stroke,
        opacity: getComputedStyle(e).opacity,
      })),
      brackets: [...s.querySelectorAll('.bracket-path')].map((e) => e.getAttribute('d')),
    };
  }, old);
}
async function shots(pair, label) {
  for (const [kind, page] of [
    ['original', pair.old],
    ['restored', pair.current],
  ])
    await page
      .locator(kind === 'original' ? '.editor' : '.dc-editor-card')
      .screenshot({ path: path.join(here, 'screens', `${label}-${kind}.png`) });
}
async function compare(pair, label, gesture = false) {
  await pair.current.waitForTimeout(80);
  const original = await geometry(pair.old, true),
    restored = await geometry(pair.current, false);
  await shots(pair, label);
  const rawDifferences = [];
  for (const key of Object.keys(original))
    if (JSON.stringify(original[key]) !== JSON.stringify(restored[key]))
      rawDifferences.push({ key, original: original[key], restored: restored[key] });
  // Native pointer coordinates depend on each page's absolute top and float CTM.
  // Only gesture SVG coordinates get 0.001 source-unit precision; CSS/static refs stay exact.
  const rounded = (data) =>
    JSON.stringify(data).replace(/-?\d+\.\d+/g, (value) =>
      String(Math.round(Number(value) * 1000) / 1000),
    );
  const differences = gesture
    ? rawDifferences.filter(
        (d) =>
          !['atoms', 'electrons', 'shells', 'brackets'].includes(d.key) ||
          rounded(d.original) !== rounded(d.restored),
      )
    : rawDifferences;
  report.comparisons.push({
    label,
    course: pair.course,
    question: pair.question,
    viewport: { width: pair.width, height: pair.height },
    differences,
    coordinatePrecision: gesture ? 0.001 : 0,
    rawNumericalDifferences: gesture ? rawDifferences : [],
  });
  return { original, restored, differences };
}
async function point(page, old, point) {
  return page.locator(old ? '#canvas' : '.dc-canvas').evaluate((svg, p) => {
    const q = new DOMPoint(p.x, p.y).matrixTransform(svg.getScreenCTM());
    return { x: q.x, y: q.y };
  }, point);
}
async function tap(page, old, p) {
  const q = await point(page, old, p);
  await page.mouse.click(q.x, q.y);
}
async function dragTo(page, selector, to, old = false) {
  const b = await page.locator(selector).first().boundingBox(),
    p = await point(page, old, to);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(p.x, p.y, { steps: 8 });
  await page.mouse.up();
}
async function check(name, fn) {
  if (process.env.DC_ONLY && !name.includes(process.env.DC_ONLY)) return;
  try {
    const result = await fn();
    report.operations.push({ name, status: 'PASS', ...result });
    console.log('PASS ' + name);
  } catch (error) {
    report.failures.push({ name, error: error.stack });
    console.log('FAIL ' + name + ' ' + error.message);
    for (const comparison of report.comparisons.filter((c) => c.differences.length))
      console.log(JSON.stringify(comparison));
  }
}
try {
  await check(
    'matching-state source SVG/CSS geometry across both courses desktop/tablet/mobile/breakpoint',
    async () => {
      for (const course of ['alevel', 'igcse'])
        for (const [width, height, label] of [
          [1440, 1000, 'desktop'],
          [820, 1180, 'tablet'],
          [390, 844, 'mobile'],
          [1099, 900, 'below-breakpoint'],
          [1100, 900, 'above-breakpoint'],
        ])
          for (const question of ['h2o', 'mgo']) {
            const pair = await open(course, width, height, question);
            const result = await compare(pair, `${course}-${label}-${question}`);
            assert.equal(
              result.differences.length,
              0,
              `${course}/${label}/${question}: ${result.differences.map((d) => d.key).join(', ')}`,
            );
            for (const page of [pair.old, pair.current])
              await page
                .locator(page === pair.old ? '#check' : '[data-dot-action="check"]')
                .click();
            await shots(pair, `${course}-${label}-${question}-feedback`);
            await pair.context.close();
          }
      for (const question of [
        'ammonium-ion',
        'phosphorus-pentachloride',
        'sulfur-hexafluoride',
        'nitrate-ion',
      ]) {
        const pair = await open('alevel', 1440, 1000, question);
        const result = await compare(pair, `alevel-desktop-${question}`);
        assert.equal(
          result.differences.length,
          0,
          question + ':' + result.differences.map((d) => d.key),
        );
        await pair.context.close();
      }
      return { pairs: 24, matchingReferenceRecords: true };
    },
  );
  await check(
    'checked source answer SVG fit, glyphs, local charges and circles on both courses',
    async () => {
      const cases = [
        ['alevel', 1440, 1000, 'h2o'],
        ['alevel', 1440, 1000, 'nitrate-ion'],
        ['alevel', 390, 844, 'ammonium-ion'],
        ['alevel', 1440, 1000, 'phosphorus-pentachloride'],
        ['igcse', 1440, 1000, 'mgo'],
        ['igcse', 390, 844, 'potassium-iodide'],
      ];
      function read(svg) {
        const shape = (e) => {
          const c = getComputedStyle(e);
          return {
            tag: e.tagName,
            text: e.tagName === 'text' ? e.textContent : null,
            x: e.getAttribute('x'),
            y: e.getAttribute('y'),
            cx: e.getAttribute('cx'),
            cy: e.getAttribute('cy'),
            r: e.getAttribute('r'),
            d: e.getAttribute('d'),
            font: e.tagName === 'text' ? c.fontFamily : null,
            size: e.tagName === 'text' ? c.fontSize : null,
            fill: c.fill,
            stroke: c.stroke,
            strokeWidth: c.strokeWidth,
            opacity: c.opacity,
          };
        };
        return {
          viewBox: svg.getAttribute('viewBox'),
          shapes: [
            ...svg.querySelectorAll(
              '.atom-label,.charge-label,.shell,.electron-mark,.bracket-path',
            ),
          ].map(shape),
        };
      }
      for (const [course, width, height, question] of cases) {
        const pair = await open(course, width, height, question);
        for (const circles of [true, false]) {
          if (!circles) {
            await pair.old.locator('#circles').click();
            await pair.current.locator('.circles-tool').click();
          }
          await pair.old.locator('#check').click();
          await pair.current.locator('[data-dot-action="check"]').click();
          await pair.old.locator('#showAnswer').click();
          await pair.current.getByRole('button', { name: 'Show answer', exact: true }).click();
          const oldSVG = pair.old.locator('#answerCanvas'),
            newSVG = pair.current.locator('.dot-cross-answer-svg');
          await oldSVG.waitFor();
          await newSVG.waitFor();
          assert.deepEqual(
            await oldSVG.evaluate(read),
            await newSVG.evaluate(read),
            `${course}/${question}/circles=${circles}`,
          );
          for (const [label, locator] of [
            ['original', oldSVG],
            ['restored', newSVG],
          ]) {
            await locator.evaluate((e) => {
              e.style.width = '600px';
              e.style.height = '400px';
              e.style.maxHeight = 'none';
              e.style.borderRadius = '10px';
              e.style.background = 'white';
            });
            await locator.screenshot({
              path: path.join(
                here,
                'screens',
                `${course}-${question}-answer-circles-${circles}-${label}.png`,
              ),
            });
          }
          await pair.old.locator('#closeAnswer').click();
          await pair.current.getByRole('button', { name: 'Close', exact: true }).click();
        }
        await pair.context.close();
      }
      return {
        renderedPairs: 12,
        exactSourceDrawingAttributesAndComputedStyles: true,
        normalised600x400AnswerCrops: true,
        sharedNativeDialogResponsiveGate: 'foreman-owned',
      };
    },
  );
  await check(
    'source/new element palette drag, snap, ghost, rollback, touch and semantic commits',
    async () => {
      for (const course of ['alevel', 'igcse']) {
        const pair = await open(course, 1440, 1000, 'h2o', true);
        for (const [page, old] of [
          [pair.old, true],
          [pair.current, false],
        ]) {
          await dragTo(page, '[data-element="O"]', { x: 400, y: 325 }, old);
          await dragTo(page, '[data-element="H"]', { x: 480, y: 327 }, old);
          const s = await state(page, old);
          assert.equal(s.atoms.length, 2);
          assert(Math.abs(s.atoms[0].x - 400) < 0.001);
          assert(Math.abs(s.atoms[1].x - 480) < 0.001);
          assert(Math.abs(s.atoms[1].y - 325) < 0.001);
        }
        assert.deepEqual(
          (await state(pair.old, true)).atoms.map((a) => ({
            ...a,
            x: Math.round(a.x * 1000) / 1000,
            y: Math.round(a.y * 1000) / 1000,
          })),
          (await state(pair.current)).atoms.map((a) => ({
            ...a,
            x: Math.round(a.x * 1000) / 1000,
            y: Math.round(a.y * 1000) / 1000,
          })),
        );
        const before = await state(pair.current),
          commits = await pair.current.evaluate(() => window.commits.length),
          a = await point(pair.current, false, { x: 400, y: 325 });
        await pair.current.mouse.move(a.x, a.y);
        await pair.current.mouse.down();
        await pair.current.mouse.move(a.x + 80, a.y + 80, { steps: 4 });
        assert.equal(
          await pair.current.evaluate(() => window.commits.length),
          commits,
          'Pointermove saved semantic state',
        );
        const originalPoint = await point(pair.old, true, { x: 400, y: 325 });
        await pair.old.mouse.move(originalPoint.x, originalPoint.y);
        await pair.old.mouse.down();
        await pair.old.mouse.move(originalPoint.x + 80, originalPoint.y + 80, { steps: 4 });
        assert.equal((await compare(pair, `${course}-atom-drag-preview`)).differences.length, 0);
        await pair.old.keyboard.press('Escape');
        await pair.old.mouse.up();
        await pair.current.keyboard.press('Escape');
        await pair.current.mouse.up();
        assert.deepEqual(await state(pair.current), before, 'Escape rollback');
        await pair.current.mouse.move(a.x, a.y);
        await pair.current.mouse.down();
        await pair.current.mouse.move(0, 0, { steps: 5 });
        await pair.current.mouse.up();
        assert.deepEqual(await state(pair.current), before, 'Outside rollback');
        await pair.current.mouse.move(a.x, a.y);
        await pair.current.mouse.down();
        await pair.current.mouse.move(a.x + 40, a.y + 30);
        await pair.current.locator('.dc-canvas').evaluate((e) => e.releasePointerCapture(1));
        await pair.current.mouse.up();
        assert.deepEqual(await state(pair.current), before, 'Lost capture rollback');
        await pair.current.mouse.move(a.x, a.y);
        await pair.current.mouse.down();
        await pair.current.mouse.move(a.x + 40, a.y + 30);
        await pair.current.locator('.dc-canvas').dispatchEvent('pointercancel', { pointerId: 1 });
        await pair.current.mouse.up();
        assert.deepEqual(await state(pair.current), before, 'Pointer cancellation rollback');
        await pair.context.close();
      }
      return {
        sourcePlacementParity: true,
        gesturePreviewUnpersisted: true,
        escapeOutsideLostCapture: true,
      };
    },
  );
  await check(
    'electron repeated regions, existing-mark tap/cycle, relocation and palette symbol drag',
    async () => {
      for (const course of ['alevel', 'igcse']) {
        const pair = await open(course, 1440, 1000, 'h2o', true);
        const stages = [];
        const electronState = (s) =>
          s.electrons.map((e) => ({ symbol: e.symbol, anchor: e.anchor }));
        for (const [page, old] of [
          [pair.old, true],
          [pair.current, false],
        ]) {
          await dragTo(page, '[data-element="O"]', { x: 450, y: 325 }, old);
          await dragTo(page, '[data-element="H"]', { x: 530, y: 325 }, old);
          await page.locator('[data-tool="dot"]').click();
          await tap(page, old, { x: 505, y: 325 });
          await tap(page, old, { x: 505, y: 325 });
          await page.locator('[data-tool="cross"]').click();
          await dragTo(page, '[data-tool="cross"]', { x: 505, y: 325 }, old);
          const intermediate = [electronState(await state(page, old))];
          await page.locator('[data-element="H"]').click();
          const e = page
            .locator(old ? '#canvas [data-electron]' : '.dc-canvas [data-electron]')
            .first();
          await e.click();
          assert.equal(
            (await state(page, old)).electrons.find((x) => x.id === (old ? 'e3' : 'e1')).symbol,
            'cross',
          );
          intermediate.push(electronState(await state(page, old)));
          await dragTo(
            page,
            old ? '#canvas [data-electron]' : '.dc-canvas [data-electron]',
            { x: 450, y: 275 },
            old,
          );
          assert.equal((await state(page, old)).electrons[0].anchor.kind, 'atom');
          intermediate.push(electronState(await state(page, old)));
          await e.focus();
          await page.keyboard.press('Delete');
          intermediate.push(electronState(await state(page, old)));
          stages.push(intermediate);
        }
        assert.deepEqual(stages[0], stages[1], course + ' intermediate organiser parity');
        const oldState = await state(pair.old, true),
          current = await state(pair.current);
        assert.deepEqual(
          oldState.electrons.map((e) => ({ symbol: e.symbol, anchor: e.anchor })),
          current.electrons.map((e) => ({ symbol: e.symbol, anchor: e.anchor })),
        );
        await compare(pair, `${course}-electron-relocation`);
        await pair.context.close();
      }
      return { repeatedTap: true, symbolCycle: true, relocation: true, paletteSymbolDrag: true };
    },
  );
  await check(
    'charge palette local/whole-ion/group drag, circle toggle/history, keyboard and readonly',
    async () => {
      const pair = await open('alevel', 1440, 1000, 'h2o');
      for (const [page, old] of [
        [pair.old, true],
        [pair.current, false],
      ]) {
        await page.locator('[data-charge="1"]').click();
        await tap(page, old, { x: 500, y: 325 });
        let s = await state(page, old);
        assert(s.groups.some((g) => g.bracket === false));
        await dragTo(page, '[data-charge="-1"]', { x: 500, y: 265 }, old);
        s = await state(page, old);
        assert.equal(s.groups.length, 1);
        assert.equal(s.groups[0].bracket, true);
        const edge = await page
            .locator(
              old ? '#canvas [data-group] .bracket-path' : '.dc-canvas [data-group] .bracket-path',
            )
            .evaluate((e) => {
              const b = e.getBBox();
              return { x: b.x, y: b.y + b.height / 2 };
            }),
          from = await point(page, old, edge),
          to = await point(page, old, { x: edge.x + 50, y: edge.y + 20 });
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(to.x, to.y, { steps: 8 });
        await page.mouse.up();
        const moved = await state(page, old);
        for (let i = 0; i < s.atoms.length; i++) {
          assert(Math.abs(moved.atoms[i].x - s.atoms[i].x - 50) < 0.001);
          assert(Math.abs(moved.atoms[i].y - s.atoms[i].y - 20) < 0.001);
        }
      }
      assert.equal((await compare(pair, 'alevel-charge-group-drag', true)).differences.length, 0);
      await pair.current.getByRole('button', { name: 'Hide circles', exact: true }).click();
      assert.equal((await state(pair.current)).circles, false);
      await pair.current.getByRole('button', { name: 'Undo', exact: true }).click();
      assert.equal((await state(pair.current)).circles, false);
      await pair.current.getByRole('button', { name: 'Redo', exact: true }).click();
      assert.equal((await state(pair.current)).circles, false);
      const before = await state(pair.current);
      await pair.current.evaluate(() => window.editorHarness.setReadOnly(true));
      await pair.current.locator('.dc-canvas').focus();
      await pair.current.keyboard.press('Space');
      await pair.current.keyboard.press('Backspace');
      await pair.current.keyboard.press('Control+z');
      assert.deepEqual(await state(pair.current), before);
      await pair.current.evaluate(() => window.editorHarness.setReadOnly(false));
      await pair.current.locator('.dc-canvas [data-atom]').first().focus();
      const previous = (await state(pair.current)).atoms[0];
      await pair.current.keyboard.press('ArrowRight');
      assert.equal((await state(pair.current)).atoms[0].x, previous.x + 10);
      await pair.current.keyboard.press('Backspace');
      assert.equal((await state(pair.current)).atoms.length, before.atoms.length - 1);
      await pair.context.close();
      const mobile = await open('igcse', 390, 844, 'h2o', true),
        cdp = await mobile.current.context().newCDPSession(mobile.current);
      async function touchTap(selector, pointValue) {
        const p = pointValue
          ? await point(mobile.current, false, pointValue)
          : await mobile.current.locator(selector).evaluate((e) => {
              const b = e.getBoundingClientRect();
              return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
            });
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: p.x, y: p.y }],
        });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await touchTap('[data-element="O"]');
      await touchTap(null, { x: 450, y: 325 });
      assert.equal((await state(mobile.current)).atoms.length, 1);
      const b = await mobile.current.locator('[data-element="H"]').boundingBox(),
        to = await point(mobile.current, false, { x: 530, y: 325 });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: to.x, y: to.y }],
      });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.equal((await state(mobile.current)).atoms.length, 2);
      const n = await mobile.current.evaluate(() => window.commits.length);
      await touchTap('.circles-tool');
      assert.equal((await state(mobile.current)).circles, false);
      assert.equal(
        await mobile.current.evaluate(() => window.commits.length),
        n + 1,
        'Duplicate touch click',
      );
      await shots(mobile, 'igcse-mobile-trusted-touch');
      await mobile.context.close();
      return {
        chargeRouting: true,
        groupDrag: true,
        circlesHistory: true,
        focusedKeyboardDeleteMove: true,
        readonly: true,
        trustedCDPTouch: true,
      };
    },
  );
  await check(
    'non-drag controls, body keyboard routing, persisted circle/history restoration and magnified viewport',
    async () => {
      const pair = await open('alevel', 390, 844, 'h2o', true),
        page = pair.current;
      await page.locator('.dc-alternatives>summary').click();
      await page.getByRole('combobox', { name: 'Element', exact: true }).selectOption('O');
      await page.getByRole('button', { name: 'Add atom', exact: true }).click();
      await page.getByRole('combobox', { name: 'Element', exact: true }).selectOption('H');
      await page.getByRole('spinbutton', { name: 'X position', exact: true }).fill('480');
      await page.getByRole('button', { name: 'Add atom', exact: true }).click();
      assert.equal((await state(page)).atoms.length, 2);
      await page.getByRole('combobox', { name: 'First atom', exact: true }).selectOption('a1');
      await page.getByRole('combobox', { name: 'Second atom', exact: true }).selectOption('a2');
      await page
        .getByRole('combobox', { name: 'Electron symbol', exact: true })
        .selectOption('triangle');
      await page.getByRole('button', { name: 'Add electron', exact: true }).click();
      assert.equal((await state(page)).electrons[0].symbol, 'triangle');
      await page
        .getByRole('combobox', { name: 'Electron to move', exact: true })
        .selectOption('e1');
      await page.getByRole('combobox', { name: 'Second atom', exact: true }).selectOption('');
      await page
        .getByRole('button', { name: 'Move to selected electron region', exact: true })
        .click();
      assert.equal((await state(page)).electrons[0].anchor.kind, 'atom');
      await page.getByRole('button', { name: 'O a1', exact: true }).click();
      await page.getByRole('textbox', { name: 'Ion charge', exact: true }).fill('-2');
      await page.getByRole('button', { name: 'Apply bracket and charge', exact: true }).click();
      assert.equal((await state(page)).groups[0].charge, -2);
      await page.locator('.circles-tool').click();
      const restored = await state(page);
      await page.evaluate(
        (value) => window.editorHarness.set(JSON.parse(JSON.stringify(value))),
        restored,
      );
      await page.evaluate(() => document.activeElement.blur());
      await page.keyboard.press('Control+z');
      assert.equal((await state(page)).groups.length, 0);
      assert.equal((await state(page)).circles, false);
      await page.keyboard.press('Control+Shift+z');
      assert.equal((await state(page)).groups.length, 1);
      assert.equal((await state(page)).circles, false);
      await page.keyboard.press('Enter');
      await page.locator('.feedback-title').waitFor();
      await page.getByRole('button', { name: 'Magnify diagram', exact: true }).click();
      assert.equal(
        await page.locator('.dc-canvas').evaluate((e) => e.getBoundingClientRect().width),
        1000,
      );
      assert(await page.locator('.dc-viewport').evaluate((e) => e.scrollWidth > e.clientWidth));
      await page.screenshot({
        path: path.join(here, 'screens', 'alevel-mobile-non-drag-controls.png'),
        fullPage: true,
      });
      await page.getByRole('button', { name: 'Fit diagram', exact: true }).click();
      await page.evaluate(() => window.editorHarness.setReadOnly(true));
      const before = await state(page);
      assert(await page.getByRole('button', { name: 'Add atom', exact: true }).isDisabled());
      await page.evaluate(() => document.activeElement.blur());
      await page.keyboard.press('Control+z');
      assert.deepEqual(await state(page), before);
      await pair.context.close();
      return {
        manualAtomsElectronsChargeRelocation: true,
        bodyKeyboardHistoryAndCheck: true,
        serializedCirclesAndHistoryRestored: true,
        readonlyNonDrag: true,
        magnifiedHorizontalViewport: true,
      };
    },
  );
} finally {
  report.status =
    report.failures.length ||
    report.pageErrors.length ||
    report.comparisons.some((c) => c.differences.length)
      ? 'FAIL'
      : 'PASS';
  report.finishedAt = new Date().toISOString();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  fs.writeFileSync(path.join(here, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(
    JSON.stringify({
      status: report.status,
      operations: report.operations.length,
      comparisons: report.comparisons.length,
      failures: report.failures,
      pageErrors: report.pageErrors,
    }),
  );
  if (report.status !== 'PASS') process.exitCode = 1;
}
