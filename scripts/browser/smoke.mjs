import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devOrigin, outputDirectory } from './paths.mjs';
const output = outputDirectory('smoke');
const report = { status: 'RUNNING', startedAt: new Date().toISOString(), origin: devOrigin, checks: [], pageErrors: [], failedResponses: [] };
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('response', response => { if (response.status() >= 400) report.failedResponses.push({ url: response.url(), status: response.status() }); });
try {
  report.browser = browser.version();
  for (const [course, gems] of [['alevel', 152], ['igcse', 64]]) {
    await page.goto(`${devOrigin}/scripts/browser/fixtures/landing/harness.html?course=${course}`);
    await page.locator('#yearGrid .gem').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#yearGrid .gem').count(), gems);
    assert.equal(await page.locator(`.original-landing.${course}`).count(), 1);
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(output, `${course}-landing-mobile.png`), fullPage: true });
    report.checks.push({ id: `${course}-migrated-landing-fixture`, status: 'PASS', gems, mobileOverflow: false });
    await page.goto(`${devOrigin}/${course}.html?course=${course}&view=home&run=tool-migration-home-${Date.now()}`);
    await page.locator(`.original-landing.${course}`).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#yearGrid .gem').count(), gems);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: path.join(output, `${course}-current-home-mobile.png`) });
    report.checks.push({ id: `${course}-current-home-mobile`, status: 'PASS', gems, viewport: { width: 390, height: 844 } });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await page.goto(`${devOrigin}/alevel.html?view=olympiad&activity=alevel/olympiad-2011-q4&run=tool-migration-${Date.now()}`);
  await page.locator('[data-isomer-box]').first().waitFor();
  assert.equal(await page.locator('[data-isomer-box]').count(), 7);
  await page.getByRole('button', { name: 'Enlarge compound 3 NMR spectrum', exact: true }).click();
  await page.getByRole('dialog', { name: 'Enlarged compound 3 NMR spectrum', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Close spectrum', exact: true }).click();
  assert.equal(await page.locator('.gem-status, .mastery-status').count(), 0);
  await page.screenshot({ path: path.join(output, 'olympiad-seven-boxes.png'), fullPage: true });
  report.checks.push({ id: 'current-olympiad-render-and-spectrum-dialog', status: 'PASS', boxes: 7 });
  assert.deepEqual(report.pageErrors, []);
  assert.deepEqual(report.failedResponses, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.failure = error.stack; process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(JSON.stringify(report));
}
