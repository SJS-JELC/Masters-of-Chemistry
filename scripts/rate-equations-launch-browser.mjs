import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, outputDirectory } from './browser/paths.mjs';
import { restoreRateExample } from '../src/activities/alevel/rate-equations/provider.ts';

const base = process.env.RATE_APP_URL || 'http://127.0.0.1:5261';
const out = outputDirectory('rate-equations-launch');
const report = { checks: [], pageErrors: [] };
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.on('pageerror', error => report.pageErrors.push(error.message));
const snapshot = () => page.evaluate(() => window.__mastersActivity.snapshot());
async function ready() {
  await page.locator('.question-player').waitFor();
  await page.evaluate(() => window.__mastersActivity.flush());
  await page.waitForFunction(() => window.__mastersActivity?.snapshot().saveStatus.kind === 'saved');
  assert.equal(await page.locator('.practice-setup').count(), 0);
}
async function rows() {
  return page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(window.__mastersActivity.snapshot().databaseName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const result = {};
      for (const table of ['attempts', 'evidence']) result[table] = await new Promise((resolve, reject) => {
        const request = db.transaction(table).objectStore(table).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return result;
    } finally { db.close(); }
  });
}
try {
  for (const gem of ['orders', 'graphs', 'mechanisms', 'arrhenius']) {
    for (const mode of ['1', '2', '3', 'mastery']) {
      const gemId = `u6-t1-2-${gem}`;
      await page.goto(`${base}/?course=alevel&run=rate-launch-${gem}-${mode}-${Date.now()}`);
      await page.locator('.original-landing.alevel').waitFor();
      const upper = page.getByRole('switch', { name: 'Upper Sixth', exact: true });
      if (await upper.getAttribute('aria-checked') !== 'true') await upper.click();
      await page.locator(`[data-topic="u6-t1-topic-2"] .topic-trigger`).click();
      await page.locator(`[data-leaf="${gemId}"]`).click();
      await page.locator('#gemDetails').waitFor({ state: 'visible' });
      // Observe every DOM commit during launch, including a transient setup flash.
      await page.evaluate(() => {
        window.launchSetupSeen = false;
        window.launchObserver = new MutationObserver(records => {
          if (document.querySelector('.practice-setup') || records.some(record =>
            [...record.addedNodes].some(node => node instanceof Element &&
              (node.matches('.practice-setup') || node.querySelector('.practice-setup'))))) window.launchSetupSeen = true;
        });
        window.launchObserver.observe(document.body, { subtree: true, childList: true });
      });
      await page.locator(`[data-practice="${mode}"]`).click();
      await ready();
      const first = await snapshot();
      assert.equal(first.attempt.target.gemId, gemId);
      assert.equal(first.attempt.ref.level, mode === 'mastery' ? 1 : Number(mode));
      assert.equal(first.session.selection, mode === 'mastery' ? 'mastery' : 'fixed-level');
      assert.equal(await page.evaluate(() => window.launchSetupSeen), false);
      await page.evaluate(() => window.launchObserver.disconnect());
      assert.equal((await rows()).attempts.length, 1);
      assert.equal((await rows()).evidence.length, 0);
      await page.reload();
      await ready();
      assert.equal((await snapshot()).attempt.attemptId, first.attempt.attemptId);
      assert.equal((await rows()).attempts.length, 1);
      const example = restoreRateExample(first.question.ref);
      for (const [partId, response] of Object.entries(example.correctResponses)) {
        await page.evaluate(({ partId, response }) => window.__mastersActivity.respond(partId, response), { partId, response });
      }
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.waitForFunction(() => window.__mastersActivity.snapshot().attempt.phase === 'assessed');
      await ready();
      const assessed = await snapshot();
      assert.equal((await rows()).evidence.length, 1);
      await page.reload();
      await ready();
      assert.deepEqual((await snapshot()).attempt.firstResponse.timing, assessed.attempt.firstResponse.timing);
      assert.equal((await rows()).evidence.length, 1);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(id => window.__mastersActivity.snapshot().attempt.attemptId !== id, first.attempt.attemptId);
      await ready();
      assert.equal((await rows()).attempts.length, 2);
      assert.equal((await rows()).evidence.length, 1);
      assert.equal((await snapshot()).attempt.target.gemId, gemId);
      if (mode === 'mastery') await page.screenshot({ path: path.join(out, `${gem}-mastery.png`), fullPage: true });
      report.checks.push({ gem, mode, status: 'PASS', sameAttemptReload: true, noSetupFlash: true, nextAndDeduplication: true });
      console.log(`PASS ${gem} ${mode}`);
    }
  }
  assert.deepEqual(report.pageErrors, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error.stack;
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(JSON.stringify(report));
}
