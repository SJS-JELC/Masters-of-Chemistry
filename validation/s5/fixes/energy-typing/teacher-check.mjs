import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const { chromium } = require('playwright');
const out = path.resolve('validation/s5/fixes/energy-typing');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
let result;
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(
    'http://127.0.0.1:5210/igcse.html?run=a13-s5-teacher-' +
      Date.now() +
      '&view=teacher&activity=igcse%2Fenergy-enthalpy&review=D01&level=2&seed=26',
  );
  await page.getByRole('heading', { name: 'Checked answer and diagrams', exact: true }).waitFor();
  const model = page.locator('.teacher-answer');
  assert.equal(await model.locator('img').count(), 1);
  assert.equal(await page.locator('.energy-profile-editor input').count(), 0);
  const before = await page.evaluate(() => window.__mastersActivity.snapshot());
  assert.equal(before.history.length, 0);
  assert.equal(before.attempt, null);
  await page.getByRole('button', { name: 'Zoom for detail', exact: true }).click();
  await page.getByRole('button', { name: 'Fit whole diagram', exact: true }).click();
  const after = await page.evaluate(() => window.__mastersActivity.snapshot());
  assert.deepEqual(after.history, before.history);
  assert.equal(after.attempt, null);
  assert.deepEqual(errors, []);
  await page.screenshot({ path: path.join(out, 'teacher-readonly.png'), fullPage: true });
  result = {
    status: 'PASS',
    browser: browser.version(),
    playwright: '1.62.1',
    headless: true,
    checkedModelImages: 1,
    editableProfileInputs: 0,
    attempt: null,
    evidence: 0,
    afterZoomEvidence: 0,
    pageErrors: errors,
  };
} catch (e) {
  result = { status: 'FAIL', error: String(e.stack || e) };
} finally {
  await browser.close();
  fs.writeFileSync(path.join(out, 'teacher-results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  if (result.status !== 'PASS') process.exitCode = 1;
}
