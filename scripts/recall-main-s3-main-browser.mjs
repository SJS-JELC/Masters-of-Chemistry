import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const app = path.resolve(import.meta.dirname, '..'),
  out = path.join(app, '.artifacts/recall-main/s3/integration');
fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const run = 's3-main-' + Date.now(),
  errors = [],
  checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', (e) => errors.push(e.message));
  const url = (course, gem) =>
    'http://127.0.0.1:5203/?course=' +
    course +
    '&view=recall&run=' +
    run +
    (gem ? '&recallGem=' + gem : '');
  await page.goto(url('igcse'), { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Choose your recall topics' }).waitFor();
  await page.screenshot({ path: path.join(out, 'main-igcse-topics.png'), fullPage: true });
  checks.push('Actual ProductionFoundation global IGCSE topics route');
  const singularTopic = page
    .locator('.recall-topics label')
    .filter({ has: page.locator('small', { hasText: /^1 fact$/ }) })
    .first();
  await singularTopic.waitFor();
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await singularTopic.getByRole('checkbox').check();
  await page
    .getByRole('status')
    .filter({ hasText: /^1 fact ·/ })
    .waitFor();
  assert.equal(
    await page
      .locator('.recall-selection')
      .innerText()
      .then((t) => /\b1 facts\b/.test(t)),
    false,
  );
  await page.screenshot({ path: path.join(out, 'main-single-fact-count.png'), fullPage: true });
  assert.match(
    await page
      .getByRole('status')
      .filter({ hasText: /^1 fact ·/ })
      .innerText(),
    /1 topic selected/,
  );
  checks.push('Actual global single-fact topic and selected counts use singular fact/topic');
  await page.goto(url('igcse', 'fourth-1-1'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, 'main-igcse-flashcards.png'), fullPage: true });
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  await page.waitForTimeout(500);
  checks.push('Actual main gem launch and flashcard flip/sort');
  await page.goto(url('igcse', 'fourth-1-1'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await page.locator('[data-recall-question-id="igcse-recall-012"]').waitFor();
  assert.match(
    await page.locator('[data-recall-question-id]').innerText(),
    /Question ID: igcse-recall-012/,
  );
  checks.push('Main IGCSE Test displays its canonical issue-reporting ID');
  await page.getByRole('textbox').fill('(aq)');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('region', { name: 'Model answer', exact: true }).waitFor();
  await page.screenshot({ path: path.join(out, 'main-igcse-test.png'), fullPage: true });
  checks.push('Actual main gem Test, shared controller check and immediate model');
  const observed = await page.evaluate(async () => {
    const { createChemistryRepository } = await import('/src/persistence/repository.ts');
    const { alphaDatabaseName } = await import('/src/persistence/alpha-namespace.ts');
    const r = createChemistryRepository(
      alphaDatabaseName('igcse', new URL(location.href).searchParams.get('run')),
    );
    const h = await r.recallHistory({ course: 'igcse', profileId: 'local' });
    r.close();
    return {
      count: h.value.length,
      outcome: h.value[0]?.outcome,
      firstAssistance: h.value[0]?.firstResponse.assistance,
    };
  });
  assert.equal(observed.count, 1);
  assert.equal(observed.outcome, 'correct');
  assert.deepEqual(observed.firstAssistance, []);
  checks.push('Main flashcard creates no evidence; one independent Test save only');
  await page.goto(url('alevel'), { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Choose your recall topics' }).waitFor();
  await page.screenshot({ path: path.join(out, 'main-alevel-topics.png'), fullPage: true });
  checks.push('Actual ProductionFoundation A Level four batch route');
  await page.goto(url('alevel', 'l6-t2-1-1'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, 'main-alevel-flashcards.png'), fullPage: true });
  checks.push('Actual main A Level live flashcard route');
  await page.goto(url('alevel', 'l6-t2-1-1'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  const aLevelCode = page.locator('[data-recall-question-id]');
  await aLevelCode.waitFor();
  const aLevelId = await aLevelCode.getAttribute('data-recall-question-id');
  assert.equal(aLevelId, 'electron-shell-capacities');
  assert.equal((await aLevelCode.innerText()).trim(), 'Question ID: ' + aLevelId);
  await page.screenshot({ path: path.join(out, 'main-alevel-test-id.png'), fullPage: true });
  checks.push('Main A Level Test displays its canonical ID through the existing marking player');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'main-alevel-test-id-mobile.png'), fullPage: true });
  await page.goto(url('igcse', 'fourth-1-1'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await page.locator('[data-recall-question-id="igcse-recall-012"]').waitFor();
  await page.screenshot({ path: path.join(out, 'main-igcse-test-id-mobile.png'), fullPage: true });
  checks.push('Both course Test IDs remain visible at 390px width');
  assert.deepEqual(errors, []);
  const report = {
    status: 'PASS',
    checkedAt: new Date().toISOString(),
    method:
      'Actual main ProductionFoundation routes and components in headless Edge, real repository; no native visibility/timing claim',
    run,
    checks,
    observed,
    errors,
  };
  fs.writeFileSync(path.join(out, 'main-browser.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
