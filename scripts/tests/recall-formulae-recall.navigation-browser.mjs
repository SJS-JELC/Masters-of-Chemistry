import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..'),
  out = path.join(app, '.artifacts/recall-formulae/s2/recall');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const port = 5199,
  base = 'http://127.0.0.1:' + port,
  run = 'recall-navigation-' + Date.now();
const server = spawn(
  process.execPath,
  [
    path.join(app, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { cwd: app, windowsHide: true, stdio: 'pipe' },
);
let browser,
  log = '';
server.stdout.on('data', (x) => (log += x));
server.stderr.on('data', (x) => (log += x));
const checks = [],
  samples = {},
  errors = [];
const url = (course, view = 'home') =>
  base + '/' + course + '.html?course=' + course + '&run=' + run + '&view=' + view;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  for (const course of ['igcse', 'alevel']) {
    await page.goto(url(course), { waitUntil: 'networkidle' });
    const gradeGem = await page.evaluate(async (course) => {
      const { productionRegistry } = await import('/src/foundation/registry.ts');
      return productionRegistry
        .curriculumFor(course)
        .flatMap((x) => x.gems)
        .find((g) => g.supportedLevels.includes(3)).id;
    }, course);
    await page.goto(url(course) + '#' + gradeGem, { waitUntil: 'networkidle' });
    const recall = page.locator('[data-practice="recall"]');
    await recall.waitFor({ state: 'visible' });
    const grade = page.locator('[data-practice="3"]');
    assert(await grade.isVisible());
    assert.equal(await grade.getAttribute('aria-disabled'), null);
    assert(
      await recall.evaluate((node) =>
        Boolean(
          node.compareDocumentPosition(document.querySelector('[data-practice="3"]')) &
            Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
    );
    await page.screenshot({ path: path.join(out, course + '-gem-choices.png'), fullPage: true });
    await grade.click();
    await page.locator('.question-player').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('level'), '3');
    checks.push(
      course +
        ': Key Factual Recall precedes grades; Grade/Level3 launches freely with zero prior recall evidence',
    );
    const gem = await page.evaluate(async (course) => {
      const { recallCoverage } = await import('/src/recall/facts.ts');
      return recallCoverage(course).find((g) => g.factIds.length).gemId;
    }, course);
    await page.goto(url(course) + '#' + gem, { waitUntil: 'networkidle' });
    await page.locator('[data-practice="recall"]').click();
    assert.equal(new URL(page.url()).searchParams.get('recallGem'), gem);
    await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
    await page.getByRole('textbox').first().fill('navigation draft');
    await page.getByRole('button', { name: 'Home', exact: false }).click();
    await page.locator('.original-landing').waitFor();
    const stored = await page.evaluate(
      async ({ course, run, gem }) => {
        const { createRepository } = await import('/src/persistence/repository.ts');
        const r = createRepository('masters-of-chemistry-alpha-v2-' + course + '-' + run),
          n = { course, profileId: 'local' };
        const s = await r.loadRecallSession(n, 'recall:recall-practice:' + gem);
        const a = await r.loadRecallAttempt(n, s.value.currentAttemptId);
        const h = await r.recallHistory(n);
        r.close();
        return { s: s.value, a: a.value, h: h.value };
      },
      { course, run, gem },
    );
    assert.equal(stored.s.status, 'paused');
    assert.equal(Object.values(stored.a.currentResponses)[0].value, 'navigation draft');
    assert.equal(stored.h.length, 0);
    await page.goBack({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
    assert.equal(await page.getByRole('textbox').first().inputValue(), 'navigation draft');
    checks.push(
      course +
        ': gem Recall anchor launches correct query; Home leave guard saves paused draft; browser Back restores gem and same response',
    );
    samples[course] = {
      gradeGem,
      gem,
      attemptId: stored.a.attemptId,
      pausedStatus: stored.s.status,
    };
    await page.getByRole('button', { name: 'Home', exact: false }).click();
    await page.locator('.original-landing').waitFor();
    if (course === 'igcse') {
      await page.getByRole('button', { name: 'Switch to teacher question selection' }).click();
      await page.locator('#recallTile').click();
      await page.getByRole('button', { name: 'Teacher preview' }).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('mode'), 'teacher');
      checks.push(course + ': global Recall tile honors teacher toggle');
    } else {
      await page.locator('#recallTile').click();
      await page.getByRole('button', { name: 'Practise whole set / resume' }).waitFor();
      checks.push(
        course +
          ': global Recall tile opens global set; this landing has no teacher toggle (direct teacher route tested separately)',
      );
    }
    assert.equal(new URL(page.url()).searchParams.has('recallGem'), false);
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, 'navigation-browser.json'),
    JSON.stringify({ status: 'PASS', run, checks, samples, errors }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ status: 'PASS', checks }, null, 2));
} catch (e) {
  fs.writeFileSync(
    path.join(out, 'navigation-browser-failure.json'),
    JSON.stringify({ status: 'FAIL', message: String(e), checks, samples, errors, log }, null, 2) +
      '\n',
  );
  throw e;
} finally {
  await browser?.close();
  server.kill();
}
