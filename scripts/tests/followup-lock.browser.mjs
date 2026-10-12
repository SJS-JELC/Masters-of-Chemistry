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
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5213', '--strictPort'],
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
      if ((await fetch('http://127.0.0.1:5213')).ok) break;
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
      'http://127.0.0.1:5213/scripts/tests/followup-lock.browser.html?run=' +
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
  for (const course of ['igcse', 'alevel']) {
    await go('recall', course);
    await page.getByRole('button', { name: 'Model answer', exact: true }).click();
    await locked();
    const first = await frozen();
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await page.evaluate(() => window.lock.correct());
    await locked();
    assert.deepEqual(await frozen(), first);
    await page.screenshot({
      path: path.join(out, 'recall-' + course + '-locked.png'),
      fullPage: true,
    });
    await page.evaluate(() => window.lock.flush());
    const session = await page.evaluate(() => window.lock.savedSession());
    assert(session.ok);
    assert.equal(
      session.value.currentAttemptId,
      await page.evaluate(() => window.lock.state().attemptId),
    );
    await page.reload();
    await page.waitForFunction(() => !!window.lock);
    await locked();
    assert.deepEqual(await frozen(), first);
    const old = await page.evaluate(() => window.lock.state().attemptId);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    assert.notEqual(await page.evaluate(() => window.lock.state().attemptId), old);
    assert(await check().isEnabled());
    await page.evaluate(() => window.lock.correct());
    await check().click();
    await locked();
    const erase = await page.evaluate(() => window.lock.eraseLatch());
    assert.equal(erase.ok, false);
    report.checks.push({
      id: 'recall-' + course,
      status: 'PASS',
      cases: [
        'reveal',
        'clear/copy',
        'reload',
        'saved-session',
        'Next',
        'correct-auto',
        'persistence-erasure',
      ],
    });
  }
  await go('formula');
  const input = page.locator('input').first();
  await input.fill('H');
  await check().click();
  assert(await check().isEnabled());
  const first = await frozen();
  await page.evaluate(() => window.lock.correct());
  await check().click();
  await locked();
  assert.deepEqual(await frozen(), first);
  const erase = await page.evaluate(() => window.lock.eraseLatch());
  assert.equal(erase.ok, false);
  await page.reload();
  await page.waitForFunction(() => !!window.lock);
  await locked();
  await page.locator('.chemical-worked-answer').waitFor();
  await page.screenshot({ path: path.join(out, 'formula-correction-locked.png'), fullPage: true });
  report.checks.push({
    id: 'formula-correct-correction',
    status: 'PASS',
    cases: [
      'wrong-first',
      'correct-correction',
      'frozen-score/time',
      'reload',
      'curriculum-erasure',
    ],
  });
  for (const kind of ['practical', 'pilot']) {
    await go(kind);
    await page.locator('input,textarea').first().fill('wrong');
    await page.locator('input,textarea').nth(1).fill('wrong');
    await check().click();
    await locked();
    assert.equal(await page.evaluate(() => window.lock.state().firstAssessment.marks.earned), 0);
    assert(await page.locator('.field-results em').first().isVisible());
    const first = await frozen();
    await page.screenshot({
      path: path.join(out, kind + '-wrong-auto-locked.png'),
      fullPage: true,
    });
    await page.reload();
    await page.waitForFunction(() => !!window.lock);
    await locked();
    const oldId = await page.evaluate(() => window.lock.state().attemptId),
      beforeChecks = await page.evaluate(
        () => window.lock.commands.filter((x) => x === 'check-correction' || x === 'submit').length,
      );
    await page.locator('input,textarea').nth(1).fill('heat loss to the surroundings');
    await page.locator('input,textarea').nth(1).press('Enter');
    assert.equal(
      await page.evaluate(
        () => window.lock.commands.filter((x) => x === 'check-correction' || x === 'submit').length,
      ),
      beforeChecks,
    );
    const saved = await page.evaluate((id) => window.lock.savedAttempt(id), oldId);
    assert(saved.ok);
    assert.deepEqual(
      { first: saved.value.firstResponse, assessment: saved.value.firstAssessment },
      first,
    );
    report.checks.push({
      id: kind + '-wrong-auto-model',
      status: 'PASS',
      cases: ['0-earned-auto-model', 'direct-check-guard', 'keyboard', 'reload'],
    });
  }
  await go('balance');
  const balanceInputs = page.locator('input');
  await balanceInputs.first().waitFor();
  assert.equal(await balanceInputs.count(), 4);
  await balanceInputs.nth(1).fill('3');
  await balanceInputs.nth(3).fill('3/2');
  await check().click();
  await locked();
  assert.equal(await page.evaluate(() => window.lock.state().firstAssessment.marks.earned), 4);
  report.checks.push({ id: 'new-T-rational-and-blank-one', status: 'PASS' });
  await go('states');
  await page.locator('input').first().waitFor();
  for (const [i, raw] of ['s', 'aq', 'aq', 'g'].entries())
    await page.locator('input').nth(i).fill(raw);
  await check().click();
  assert.equal(await page.evaluate(() => window.lock.state().phase), 'answering');
  await page.evaluate(() => window.lock.flush());
  await page.reload();
  await page.waitForFunction(() => !!window.lock);
  assert.equal(await page.locator('input').first().inputValue(), 's');
  for (const [i, raw] of ['(s)', '(aq)', '(aq)', '(g)'].entries())
    await page.locator('input').nth(i).fill(raw);
  await check().click();
  await locked();
  assert.equal(await page.evaluate(() => window.lock.state().firstAssessment.marks.earned), 4);
  report.checks.push({ id: 'new-U-bare-rejected-restored-full-required', status: 'PASS' });
  await go('dot', 'alevel');
  await page.getByRole('button', { name: 'Model answer', exact: true }).click();
  await page.locator('dialog[open]').waitFor();
  await locked();
  await page.locator('.dot-answer-graphic').first().waitFor();
  await page.screenshot({ path: path.join(out, 'dot-reveal-locked.png'), fullPage: true });
  await page.reload();
  await page.waitForFunction(() => !!window.lock);
  await page.locator('dialog[open]').waitFor();
  await locked();
  await page.getByRole('button', { name: 'Close answer', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.evaluate(() => window.lock.correct());
  await check().click();
  await page.locator('dialog[open]').waitFor();
  await locked();
  assert.equal(await page.evaluate(() => window.lock.state().firstAssessment.score), 1);
  report.checks.push({ id: 'dot-reveal-restore-and-correct-auto', status: 'PASS' });
  await go('formula', 'igcse', '&mode=teacher');
  assert.equal(await page.getByRole('button', { name: 'Check', exact: true }).count(), 0);
  assert.equal(await page.evaluate(() => window.lock.commands.length), 0);
  report.checks.push({ id: 'teacher', status: 'PASS' });
  assert.equal(report.pageErrors.length, 0);
  report.status = 'PASS';
  await context.close();
} catch (error) {
  report.status = 'FAIL';
  report.error = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'browser-server.txt'), serverText);
  await browser?.close();
  server.kill();
}
console.log(JSON.stringify(report));
