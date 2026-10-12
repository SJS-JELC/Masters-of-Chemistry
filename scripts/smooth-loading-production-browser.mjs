import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, projectRoot } from './browser/paths.mjs';
import { createPreviewServer } from './preview-server.mjs';
const out = path.join(projectRoot, '.artifacts/smooth-loading/production');
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = path.join(out, '.tmp');
process.env.TMP = process.env.TEMP;
const inventory = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'release/app.runtime.json'), 'utf8'),
);
const report = {
  status: 'RUNNING',
  checks: [],
  pageErrors: [],
  requestsFailed: [],
  screenshots: [],
  startedAt: new Date().toISOString(),
};
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const selectedPrefix=process.env.SMOOTH_LOADING_PREFIX;
  const skipCapture=process.argv.includes('--skip-capture');
  if(skipCapture)report.limits=['Image capture omitted in this bounded static-prefix continuation; prior inspected exports and the final screenshot timeout are retained separately.'];
  for (const prefix of ['/', '/school/chemistry/'].filter(value=>!selectedPrefix||value===selectedPrefix)) {
    const server = createPreviewServer({ prefix });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}${prefix}`;
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => report.pageErrors.push(error.message));
    page.on('requestfailed', (request) =>
      report.requestsFailed.push({ url: request.url(), error: request.failure()?.errorText }),
    );
    async function ready(selector) {
      await page.locator(selector).first().waitFor();
      await page.waitForFunction(() => !document.querySelector('#loading-surface')?.inert);
      assert.equal(await page.locator('.loading-error').count(), 0);
    }
    try {
      await page.goto(base);
      await ready('.original-landing.alevel.navigation-ready');
      const resources = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .filter((item) => new URL(item.name).pathname.endsWith('.js'))
          .map((item) => new URL(item.name).pathname),
      );
      assert(
        resources.every((url) => inventory.initialJavascript.includes(url.slice(prefix.length))),
        'Home must not load a deferred provider/facts bank',
      );
      assert.equal(await page.evaluate(() => typeof window.__mastersActivity), 'undefined');
      report.checks.push({
        prefix,
        id: 'cold-home-lazy-closure',
        status: 'PASS',
        javascript: resources.length,
      });
      await page.getByRole('switch', { name: 'A Level Chemistry', exact: true }).click();
      await ready('.original-landing.igcse.navigation-ready');
      await page.reload();
      await ready('.original-landing.igcse.navigation-ready');
      for (const course of ['alevel', 'igcse']) {
        for (const [view, selector] of [
          ['recall', '.recall-view'],
          ['statistics', '[data-testid="statistics-time"]'],
          ['import', '.legacy-import'],
          ['teacher', '.teacher-picker'],
        ]) {
          await page.goto(`${base}?course=${course}&view=${view}`);
          await ready(selector);
          assert.equal(new URL(page.url()).searchParams.get('course'), course);
        }
        const activity = course === 'alevel' ? 'rate-equations' : 'formulae',
          gem = course === 'alevel' ? 'u6-t1-2-orders' : 'fourth-16-1';
        await page.goto(
          `${base}?course=${course}&view=practice&activity=${course}/${activity}&gem=${gem}&level=1&fresh=1`,
        );
        await ready('.question-player');
        await page.waitForFunction(() => !new URL(location.href).searchParams.has('fresh'));
        const code = await page.locator('.header-question-code').innerText();
        await page.reload();
        await ready('.question-player');
        assert.equal(await page.locator('.header-question-code').innerText(), code);
        report.checks.push({
          prefix,
          id: `${course}-production-views-and-saved-question`,
          status: 'PASS',
          code,
        });
      }
      await page.goto(`${base}?course=alevel&view=olympiad&activity=alevel/c3l6-organic-reactions`);
      await ready('.olympiad-question-frame');
      for (const file of inventory.files) {
        const response = await fetch(base + file.path);
        assert.equal(response.status, 200, file.path);
        assert.equal((await response.arrayBuffer()).byteLength, file.bytes, file.path);
      }
      assert.equal((await fetch(base + '.vite/manifest.json')).status, 404);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${base}?course=igcse&view=home`);
      await ready('.original-landing.igcse');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const filename = (prefix === '/' ? 'root' : 'nested') + '-mobile.png';
      if(!skipCapture){await page.screenshot({ path: path.join(out, filename), fullPage: true });report.screenshots.push(filename);}
      report.checks.push({
        prefix,
        id: 'olympiad-static-runtime-prefix-mobile',
        status: 'PASS',
        files: inventory.files.length,
      });
    } finally {
      await context.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }
  assert.equal(report.pageErrors.length, 0);
  assert.equal(report.requestsFailed.length, 0);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error.stack;
  process.exitCode = 1;
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
