import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..');
const out = path.join(app, '.artifacts/recall-formulae-ux/s1/mastery');
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.resolve(app, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const { chromium } = require('playwright');
const port = 5193,
  base = `http://127.0.0.1:${port}`;
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
let serverLog = '';
server.stdout.on('data', (value) => (serverLog += value));
server.stderr.on('data', (value) => (serverLog += value));
const report = {
  agentId: 'A06',
  jobId: 'UX-MENU-MASTERY',
  startedAt: new Date().toISOString(),
  checks: [],
  failures: [],
  pageErrors: [],
  screenshots: [],
  limits: [
    'Synthetic isolated browser storage. Existing checked chemistry reused. No native hidden-tab probe or publication.',
  ],
};
let browser, page;
const check = async (name, body) => {
  if (process.env.MASTERY_SMOKE && !name.startsWith('whole linked')) return;
  await body();
  report.checks.push({ name, status: 'PASS' });
};
async function menu(course, gem, run = 'mastery-' + course) {
  await page.goto(`${base}/${course}.html?course=${course}&run=${run}#${gem}`);
  await page.locator('#gemDetails').waitFor({ state: 'visible' });
  await page.locator('[data-practice="mastery"]').waitFor();
}
async function history(course, run) {
  return page.evaluate(
    async ({ course, run }) => {
      const { createChemistryRepository } = await import('/src/persistence/repository.ts');
      const repository = createChemistryRepository(
          `masters-of-chemistry-alpha-v2-${course}-${run}`,
        ),
        ns = { course, profileId: 'local' };
      const recall = await repository.recallHistory(ns),
        progress = await repository.recallProgress(ns),
        curriculum = await repository.curriculumHistory(ns);
      repository.close();
      if (!recall.ok || !progress.ok || !curriculum.ok)
        throw Error('Unable to read synthetic evidence');
      return { recall: recall.value, progress: progress.value, curriculum: curriculum.value };
    },
    { course, run },
  );
}
async function screenshot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator('#gemDetails')
    .evaluate((element) =>
      Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
  await page.screenshot({ path: path.join(out, name), fullPage: true });
  report.screenshots.push(name);
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  report.browser = await browser.version();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  page = await context.newPage();
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  let igcseColours;
  for (const [course, gem] of [
    ['igcse', 'lower-6-5'],
    ['alevel', 'l6-t2-1-3'],
  ]) {
    await check(
      `${course} menu order, supported levels, direct choices and desktop render`,
      async () => {
        await menu(course, gem);
        const choices = page.locator('#gemDetails .practice-choice');
        const options = await choices.evaluateAll((elements) =>
          elements.map((element) => ({
            option: element.dataset.practice,
            colour: getComputedStyle(element).color,
            disabled: element.disabled ?? false,
          })),
        );
        assert.deepEqual(
          options.slice(0, 2).map((x) => x.option),
          ['mastery', 'recall'],
        );
        assert.ok(options.slice(2).length > 0);
        assert.ok(options.every((x) => !x.disabled));
        if (course === 'igcse')
          igcseColours = Object.fromEntries(options.map((x) => [x.option, x.colour]));
        else
          for (const option of options) {
            if (igcseColours[option.option])
              assert.equal(option.colour, igcseColours[option.option]);
            else assert.equal(option.colour, 'rgb(255, 222, 89)');
          }
        await screenshot(`${course}-menu-desktop.png`);
        await choices
          .filter({
            has: page.locator('strong', { hasText: course === 'igcse' ? 'Grade 5' : 'Level 1' }),
          })
          .count();
        await page
          .locator('#gemDetails .practice-choice[data-practice]')
          .filter({ hasNot: page.locator('strong', { hasText: /MASTERY|KEY FACTUAL RECALL/ }) })
          .first()
          .click();
        await page.waitForFunction(
          () => window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
        );
        assert.equal(new URL(page.url()).searchParams.has('masteryRun'), false);
      },
    );
    await check(`${course} settled mobile menu`, async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await menu(course, gem, 'mobile-' + course);
      await screenshot(`${course}-menu-mobile.png`);
      const box = await page.locator('#gemDetails').boundingBox();
      assert.ok(box.width <= 390);
      await page.setViewportSize({ width: 1280, height: 900 });
    });
  }
  await check(
    'whole linked recall once → graded mastery, reload identity, wrong fact remains due',
    async () => {
      await menu('igcse', 'lower-6-5', 'flow');
      await page.locator('[data-practice="mastery"]').click();
      await page.getByRole('textbox').first().waitFor();
      const url = new URL(page.url()),
        token = url.searchParams.get('masteryRun');
      assert.ok(token);
      assert.equal(url.searchParams.get('masteryStage'), 'recall');
      for (const textbox of await page.getByRole('textbox').all())
        await textbox.fill('deliberately wrong');
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.getByText('This fact remains due now.', { exact: true }).waitFor();
      let records = await history('igcse', 'flow');
      assert.equal(records.recall.length, 1);
      const first = records.recall[0];
      assert.equal(first.outcome, 'wrong');
    await page.evaluate(() => {
      const url = new URL(location.href); url.searchParams.delete('recallGem'); history.replaceState(null, '', url);
    });
    await page.reload();
      await page.getByRole('button', { name: 'Next', exact: true }).waitFor();
      records = await history('igcse', 'flow');
      assert.equal(records.recall.length, 1);
      assert.equal(records.recall[0].id, first.id);
      assert.equal(new URL(page.url()).searchParams.get('masteryRun'), token);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(
        () => window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
      );
      assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'grades');
      const before = await page.evaluate(() => window.__mastersActivity.snapshot().attempt);
      assert.equal(before.target.level, 2);
      await page.reload();
      await page.waitForFunction(
        () => window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
      );
      const restored = await page.evaluate(() => window.__mastersActivity.snapshot().attempt);
      assert.equal(restored.attemptId, before.attemptId);
      assert.deepEqual(restored.ref, before.ref);
      await page.getByRole('button', { name: 'Give Up', exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(
        (id) =>
          window.__mastersActivity?.snapshot().attempt?.attemptId !== id &&
          window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
        before.attemptId,
      );
      records = await history('igcse', 'flow');
      assert.equal(records.recall.length, 1);
      assert.equal(records.progress[0].stage, 0);
      assert.equal(records.curriculum.length, 0);
    },
  );
  await check(
    'recall-only gem finishes durably with no invented grades; new run gets a new set',
    async () => {
      await menu('igcse', 'fourth-1-1', 'recall-only');
      assert.equal(await page.locator('#gemDetails [data-practice="1"]').count(), 0);
      await page.locator('[data-practice="mastery"]').click();
      await page.getByRole('textbox').first().waitFor();
      const token = new URL(page.url()).searchParams.get('masteryRun');
      await page.getByRole('button', { name: 'Give Up', exact: true }).click();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('heading', { name: 'Mastery run complete' }).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'complete');
      await page.reload();
      await page.getByRole('heading', { name: 'Mastery run complete' }).waitFor();
      const records = await history('igcse', 'recall-only');
      assert.equal(records.recall.length, 1);
      assert.equal(records.curriculum.length, 0);
      await menu('igcse', 'fourth-1-1', 'recall-only');
      await page.locator('[data-practice="mastery"]').click();
      await page.getByRole('textbox').first().waitFor();
      assert.notEqual(new URL(page.url()).searchParams.get('masteryRun'), token);
    },
  );
  await check(
    'no-fact gem starts existing grade mastery and teacher never starts learner flow',
    async () => {
      await menu('igcse', 'lower-6-1', 'no-fact');
      // Pick a registered gem with zero facts from the current source catalogue.
      const gem = await page.evaluate(async () => {
        const { productionRegistry } = await import('/src/foundation/registry.ts');
        const { factsFor } = await import('/src/recall/facts.ts');
        return productionRegistry
          .curriculumFor('igcse')
          .flatMap((r) => r.gems)
          .find((g) => !factsFor('igcse', [g.id]).length)?.id;
      });
      assert.ok(gem);
      await menu('igcse', gem, 'no-fact');
      assert.equal(await page.locator('[data-practice="recall"]').isDisabled(), true);
      await page.locator('[data-practice="mastery"]').click();
      await page.waitForFunction(
        () => window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
      );
      assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'grades');
      assert.equal((await history('igcse', 'no-fact')).recall.length, 0);
      await menu('igcse', 'lower-6-5', 'teacher');
      await page.locator('#closeDetails').click();
      await page.locator('[data-mode-toggle]').click();
      await menu('igcse', 'lower-6-5', 'teacher');
      await page.locator('[data-practice="mastery"]').click();
      await page.getByRole('button', { name: 'Teacher preview', exact: true }).count();
      await page.waitForFunction(
        () => new URL(location.href).searchParams.get('view') === 'teacher',
      );
      assert.equal(new URL(page.url()).searchParams.has('masteryRun'), false);
      const records = await history('igcse', 'teacher');
      assert.equal(records.recall.length + records.curriculum.length, 0);
    },
  );
  assert.deepEqual(report.pageErrors, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.failures.push({ message: error.message, stack: error.stack });
  if (page)
    await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(
      out,
      process.env.MASTERY_SMOKE ? 'flow-smoke-browser-report.json' : 'browser-report.json',
    ),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(
    path.join(out, process.env.MASTERY_SMOKE ? 'flow-smoke-server.log' : 'server.log'),
    serverLog,
  );
  await browser?.close();
  server.kill();
}
console.log(
  JSON.stringify({
    status: report.status,
    checks: report.checks.length,
    failures: report.failures.map((x) => x.message),
    evidence: '.artifacts/recall-formulae-ux/s1/mastery/browser-report.json',
  }),
);
