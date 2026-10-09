import { projectRoot, outputDirectory, devOrigin, previewOrigin } from '../../paths.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const project = projectRoot;
const require = createRequire(path.join(project, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const temp = path.join(outputDirectory('landing/aggregate'), '.browser-tmp');
fs.mkdirSync(temp, { recursive: true }); process.env.TEMP = temp; process.env.TMP = temp;
const browser = await require('playwright').chromium.launch({ channel: 'msedge', headless: true });
const report = { startedAt: new Date().toISOString(), browser: await browser.version(), playwright: '1.62.1',
  origin: previewOrigin, checks: [], pageErrors: [], failedResponses: [] };
try {
  for (const entry of ['alevel', 'igcse']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push({ entry, error: error.message }));
    page.on('response', response => { if (response.status() >= 400) report.failedResponses.push({ entry, url: response.url(), status: response.status() }); });
    try {
      await page.goto(`${report.origin}/?course=${entry}`);
      await page.locator(`.original-landing.${entry}`).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const initial = await page.locator('.original-landing h1').innerText();
      await page.getByRole('switch', { name: 'A Level Chemistry', exact: true }).click();
      const switched = entry === 'alevel' ? 'igcse' : 'alevel';
      await page.locator(`.original-landing.${switched}`).waitFor();
      assert.equal(new URL(page.url()).searchParams.get('course'), switched);
      const gemId = switched === 'alevel' ? 'u6-t1-1-2' : 'lower-10-3';
      await page.evaluate(id => { location.hash = id; }, gemId);
      await page.locator('#gemDetails').waitFor({ state: 'visible' });
      await page.locator('a.practice-choice[data-practice="1"]').click();
      await page.locator('.question-player').waitFor();
      await page.waitForFunction(() => !new URL(location.href).searchParams.has('fresh'));
      assert.equal(await page.locator('.save-error').count(), 0);
      const url = new URL(page.url());
      assert.equal(url.searchParams.get('course'), switched);
      assert.equal(url.searchParams.get('gem'), gemId);
      assert.equal(url.searchParams.get('level'), '1');
      assert.equal(url.searchParams.has('fresh'), false);
      const activityTitle = await page.locator('.question-subject').innerText();
      await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
      await page.locator(`.original-landing.${switched}`).waitFor();
      await page.reload();
      await page.locator(`.original-landing.${switched}`).waitFor();
      const keys = await page.evaluate(() => Object.keys(localStorage));
      assert(keys.every(key => key.startsWith('masters-of-chemistry-alpha-v2:landing:')));
      await page.screenshot({ path: path.join(outputDirectory('landing/aggregate'), `${entry}-prefix-switched-home.png`), fullPage: true });
      report.checks.push({ entry, status: 'PASS', initial, switched, gemId, level: 1, activityTitle,
        checks: ['static relative prefix', 'in-place other-course lazy activity', 'exact direct fixed launch', 'save/guarded Home', 'remembered course reload', 'project-only storage keys', 'licensed assets/fonts load'], keys });
    } finally { await context.close(); }
  }
  assert.equal(report.pageErrors.length, 0);
  assert.equal(report.failedResponses.length, 0);
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.error = error.stack; process.exitCode = 1; }
finally {
  await browser.close(); report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outputDirectory('landing/aggregate'), 'prefix-browser.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
