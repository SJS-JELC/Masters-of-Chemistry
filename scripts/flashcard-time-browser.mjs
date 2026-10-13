import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, devOrigin } from './browser/paths.mjs';
const app = path.resolve(import.meta.dirname, '..');
const out = path.join(app, '.artifacts/flashcard-time/browser');
fs.mkdirSync(out, { recursive: true });
process.env.TEMP = path.join(out, '.tmp');
process.env.TMP = process.env.TEMP;
fs.mkdirSync(process.env.TEMP, { recursive: true });
const run = 'flashcard-time-' + Date.now();
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [], errors = [], observations = {};
const url = (course, view = 'recall', extra = '') => `${devOrigin}/?course=${course}&view=${view}&run=${run}${extra}`;
async function data(page, course) {
  return page.evaluate(async ({ course, run }) => {
    const { createChemistryRepository } = await import('/src/persistence/repository.ts');
    const { alphaDatabaseName } = await import('/src/persistence/alpha-namespace.ts');
    const repository = createChemistryRepository(alphaDatabaseName(course, run));
    const namespace = { course, profileId: 'local' };
    const [time, recall, progress, curriculum] = await Promise.all([
      repository.flashcardStudyTimeHistory(namespace), repository.recallHistory(namespace),
      repository.recallProgress(namespace), repository.curriculumHistory(namespace),
    ]);
    repository.close();
    for (const result of [time, recall, progress, curriculum]) if (!result.ok) throw Error(result.error.message);
    return { time: time.value, recall: recall.value, progress: progress.value, curriculum: curriculum.value,
      total: time.value.reduce((sum, record) => sum + record.activeMs, 0) };
  }, { course, run });
}
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const course of ['alevel', 'igcse']) {
    const gem = course === 'alevel' ? 'l6-t2-1-1' : 'fourth-1-1';
    await page.goto(url(course, 'recall', '&recallGem=' + gem), { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
    await page.getByRole('button', { name: 'Reveal answer', exact: true }).waitFor();
    assert.deepEqual(await page.evaluate(() => ({ visible: !document.hidden, focused: document.hasFocus() })), { visible: true, focused: true });
    await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
    await page.waitForTimeout(2300);
    await page.screenshot({ path: path.join(out, course + '-deck.png'), fullPage: true });
    await page.getByRole('button', { name: 'Got it', exact: true }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
    await page.locator('.recall-selection').waitFor();
    const initial = await data(page, course);
    assert.ok(initial.total > 1000 && initial.total < 15000, `${course} expected actual active study time`);
    assert.equal(initial.recall.length + initial.progress.length + initial.curriculum.length, 0);
    checks.push(`${course}: reveal/sort/leave saves capped elapsed study without mastery or assessed evidence`);
    await page.waitForTimeout(1300);
    assert.equal((await data(page, course)).total, initial.total);
    checks.push(`${course}: chooser accrues no time`);
    await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
    await page.locator('.fc-resume, .recall-flashcards').waitFor();
    const resume = page.getByRole('button', { name: 'Resume deck', exact: true });
    if (await resume.isVisible()) await resume.click();
    // IGCSE one-card completion summary stays untimed until a new round is chosen.
    const reveal = page.getByRole('button', { name: 'Reveal answer', exact: true });
    if (!(await reveal.isVisible())) {
      const restart = page.getByRole('button', { name: /Restart|Start again/i }).last();
      await restart.click();
    }
    await reveal.waitFor();
    await page.waitForTimeout(1200);
    await page.reload({ waitUntil: 'networkidle' });
    // Reload returns to chooser; explicit launch resumes the saved deck.
    const afterReload = await data(page, course);
    assert.ok(afterReload.total >= initial.total);
    assert.ok(afterReload.total - initial.total < 5000);
    await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
    await page.locator('.fc-resume, .recall-flashcards').waitFor();
    if (await resume.isVisible()) await resume.click();
    await reveal.waitFor();
    await reveal.click();
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
    await page.locator('.recall-selection').waitFor();
    const resumed = await data(page, course);
    assert.ok(resumed.total > afterReload.total);
    assert.ok(resumed.total - afterReload.total < 5000);
    for (const original of initial.time) {
      assert.ok(resumed.time.find(record => record.id === original.id)?.activeMs >= original.activeMs);
      assert.ok(resumed.time.every(record => record.activeMs <= 15000 && record.cardLimitMs === 15000));
    }
    checks.push(`${course}: reload and resume use fresh intervals and preserve each card allowance`);
    await page.goto(url(course, 'statistics'), { waitUntil: 'networkidle' });
    const metric = page.getByTestId('statistics-time');
    await metric.waitFor();
    assert.equal(Number(await metric.getAttribute('data-active-ms')), resumed.total);
    assert.ok(await page.locator('.stats-chart-bar').evaluateAll(bars => bars.some(bar => bar.getAttribute('aria-label')?.includes('Flashcards:'))));
    await page.locator('.stats-chart-bar').last().click();
    await page.screenshot({ path: path.join(out, course + '-statistics.png'), fullPage: true });
    checks.push(`${course}: actual Statistics metric and daily chart expose Flashcards time`);
    await page.goto(url(course, 'recall', '&mode=teacher&recallGem=' + gem), { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    assert.equal((await data(page, course)).total, resumed.total);
    checks.push(`${course}: teacher preview creates no study-time records`);
    observations[course] = { initial, afterReload, resumed };
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ status: 'PASS', at: new Date().toISOString(), run, checks, observations, errors,
    limitations: ['Per-card cap, revisits and midnight boundaries also checked with a deterministic clock.'] }, null, 2));
  console.log(JSON.stringify({ status: 'PASS', checks, errors }));
} catch (error) {
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ status: 'FAIL', at: new Date().toISOString(), run, checks, observations, errors, failure: String(error.stack ?? error) }, null, 2));
  throw error;
} finally {
  await browser.close();
}
