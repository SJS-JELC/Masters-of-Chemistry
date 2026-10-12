import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'),
  out = path.join(app, '.artifacts/formulae-equations-followup/s1/lock');
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = process.env.TMP = path.join(out, '.tmp');
const require = createRequire(path.join(app, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const { chromium } = require('playwright');
const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5215', '--strictPort'],
  { cwd: app, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] },
);
let serverText = '';
server.stdout.on('data', (x) => (serverText += x));
server.stderr.on('data', (x) => (serverText += x));
const report = {
  status: 'RUNNING',
  checks: [],
  pageErrors: [],
  startedAt: new Date().toISOString(),
};
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch('http://127.0.0.1:5215')).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } }),
    page = await context.newPage();
  page.on('pageerror', (e) => report.pageErrors.push(e.message));
  const run = Date.now();
  async function go(kind, course = 'igcse', extra = '') {
    await page.goto(
      'http://127.0.0.1:5215/scripts/tests/followup-lock.browser.html?run=' +
        run +
        '&kind=' +
        kind +
        '&course=' +
        course +
        extra,
    );
    await page.waitForFunction(() => !!window.lock);
    await page.waitForSelector('.question-player');
  }
  const check = () =>
    page.getByRole('button', { name: /^Check(?: answer| correction)?$/, exact: false }).first();
  async function frozen() {
    return page.evaluate(() => ({
      first: window.lock.state().firstResponse,
      assessment: window.lock.state().firstAssessment,
    }));
  }
  async function locked() {
    assert(await check().isDisabled());
    await page.evaluate(() => window.lock.dispatch({ kind: 'check-correction' }));
    assert.equal(await page.evaluate(() => window.lock.result().accepted), false);
    await page.evaluate(() => window.lock.dispatch({ kind: 'submit', at: Date.now() }));
    assert.equal(await page.evaluate(() => window.lock.result().accepted), false);
    await page.evaluate(() => window.lock.flush());
    assert.equal(await page.evaluate(() => window.lock.error() ?? null), null);
  }
  for (const kind of ['practical', 'pilot']) {
    await go(kind);
    await page.locator('input,textarea').first().fill('wrong');
    await page.locator('input,textarea').nth(1).fill('wrong');
    await check().click();
    await locked();
    assert(await page.locator('.field-results em').first().isVisible());
    assert.equal(await page.locator('.worked-answer').count(), 0);
    const first = await frozen();
    await page.screenshot({
      path: path.join(out, kind + '-partial-reference-locked-no-full-panel.png'),
      fullPage: true,
    });
    await page.reload();
    await page.waitForFunction(() => !!window.lock);
    await locked();
    assert.equal(await page.locator('.worked-answer').count(), 0);
    assert.deepEqual(await frozen(), first);
    await page.getByRole('button', { name: 'Model answer', exact: true }).click();
    await locked();
    await page.locator('.worked-answer').waitFor();
    assert.deepEqual(await frozen(), first);
    report.checks.push({ id: kind + '-partial-reference-boundary', status: 'PASS' });
  }
  for (const course of ['igcse', 'alevel']) {
    await go('recall', course);
    for (const input of await page.locator('input').all()) await input.fill('wrong');
    await check().click();
    const first = await frozen();
    await page.evaluate(() => window.lock.correct());
    await check().click();
    await locked();
    await page.locator('.worked-answer').waitFor();
    assert.equal(await page.evaluate(() => window.lock.state().modelAnswerPanelShown), true);
    const erase = await page.evaluate(() => window.lock.erasePanelLatch());
    assert.equal(erase.ok, false);
    assert.equal(erase.error.code, 'conflict');
    await page.reload();
    await page.waitForFunction(() => !!window.lock);
    await locked();
    await page.locator('.worked-answer').waitFor();
    assert.deepEqual(await frozen(), first);
    report.checks.push({
      id: 'recall-' + course + '-correct-correction-full-panel-restore',
      status: 'PASS',
    });
  }
  await go('formula');
  await page.locator('input').first().fill('H');
  await check().click();
  const first = await frozen();
  await page.evaluate(() => window.lock.correct());
  await check().click();
  await locked();
  await page.locator('.chemical-worked-answer').waitFor();
  const erase = await page.evaluate(() => window.lock.erasePanelLatch());
  assert.equal(erase.ok, false);
  assert.equal(erase.error.code, 'conflict');
  await page.reload();
  await page.waitForFunction(() => !!window.lock);
  await page.locator('.chemical-worked-answer').waitFor();
  await locked();
  assert.deepEqual(await frozen(), first);
  report.checks.push({ id: 'formula-correct-correction-full-panel-restore', status: 'PASS' });
  await go('drawing');
  await page.evaluate(() =>
    window.lock.dispatch({
      kind: 'respond',
      partId: 'dh',
      response: { kind: 'numeric', raw: '0', unit: 'kJ/mol' },
    }),
  );
  await check().click();
  assert.equal(await page.evaluate(() => window.lock.state().phase), 'drawing-review');
  await locked();
  assert.equal(await page.locator('.worked-answer').count(), 0);
  assert(
    await page
      .getByRole('button', { name: 'My drawing needs correction', exact: true })
      .isEnabled(),
  );
  await page.screenshot({
    path: path.join(out, 'drawing-review-no-duplicate-full-panel.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'My drawing needs correction', exact: true }).click();
  assert.equal(await page.evaluate(() => window.lock.state().phase), 'assessed');
  await locked();
  assert.equal(await page.locator('.worked-answer').count(), 0);
  report.checks.push({ id: 'mandatory-drawing-reference-boundary', status: 'PASS' });
  assert.equal(report.pageErrors.length, 0);
  report.status = 'PASS';
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.error = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(out, 'panel-boundary-browser.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
  fs.writeFileSync(path.join(out, 'panel-boundary-browser-server.txt'), serverText);
  await browser?.close();
  server.kill();
}
console.log(JSON.stringify(report));
