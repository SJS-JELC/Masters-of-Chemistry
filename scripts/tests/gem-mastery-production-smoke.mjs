import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const app = path.resolve(import.meta.dirname, '../..');
const out = path.join(app, '.artifacts/recall-formulae-ux/s2/mastery');
fs.mkdirSync(out, { recursive: true });
const require = createRequire(path.resolve(app, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const { chromium } = require('playwright');
const base = process.env.MASTERY_PRODUCTION_ORIGIN || 'http://127.0.0.1:5182';
const report = { agentId: 'A06', jobId: 'UX-MASTERY-PRODUCTION-SMOKE', startedAt: new Date().toISOString(), origin: base, interaction: 'Built production UI only; isolated nonpersistent context; no DEV hooks, imports, seeded evidence or storage inspection.', checks: [], screenshots: [], pageErrors: [], failures: [] };
let browser, page;
const check = async (name, run) => { await run(); report.checks.push({ name, status: 'PASS' }); };
async function menu(gem) {
  await page.goto(`${base}/?course=igcse#${gem}`);
  await page.locator('#gemDetails').waitFor({ state: 'visible' });
}
async function screenshot(name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, name), fullPage: true });
  report.screenshots.push(name);
}
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  report.browser = await browser.version();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  await check('built menu direct grade remains freely accessible and canonical Formulae code is visible', async () => {
    await menu('fourth-16-1');
    assert.deepEqual(await page.locator('#gemDetails .practice-choice').evaluateAll(elements => elements.map(element => element.dataset.practice)), ['mastery', 'recall', '1', '2']);
    assert.equal(await page.locator('#gemDetails [data-practice="1"]').isEnabled(), true);
    await page.locator('#gemDetails [data-practice="1"]').click();
    await page.locator('.header-question-code').waitFor();
    const code = (await page.locator('.header-question-code').innerText()).trim();
    assert.match(code, /^FO-[0-9A-Z]{6}$/);
    assert.equal(new URL(page.url()).searchParams.has('masteryRun'), false);
    await page.getByRole('button', { name: 'Check', exact: true }).waitFor();
    await page.getByRole('textbox').first().waitFor();
    report.directGradeCode = code;
    await screenshot('production-direct-formulae.png');
  });
  let token, gradeCode, gradePrompt;
  await check('built Mastery auto-starts linked whole-set Recall; wrong first check survives reload and remains due', async () => {
    await page.locator('.question-back').click();
    await page.locator('.original-landing').waitFor();
    await menu('lower-6-5');
    assert.deepEqual(await page.locator('#gemDetails .practice-choice').evaluateAll(elements => elements.map(element => element.dataset.practice)), ['mastery', 'recall', '2', '3']);
    await page.locator('#gemDetails [data-practice="mastery"]').click();
    await page.getByRole('heading', { name: 'Mastery · Key Factual Recall' }).waitFor();
    await page.getByRole('textbox').first().waitFor();
    assert.equal(await page.getByRole('textbox').count(), 2);
    token = new URL(page.url()).searchParams.get('masteryRun');
    assert.ok(token);
    assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'recall');
    for (const textbox of await page.getByRole('textbox').all()) await textbox.fill('deliberately wrong');
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.getByText('This fact remains due now.', { exact: true }).waitFor();
    await page.getByText(/1 first checks needing work/).waitFor();
    await page.reload();
    await page.getByText('This fact remains due now.', { exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('masteryRun'), token);
    assert.deepEqual(await page.getByRole('textbox').evaluateAll(elements => elements.map(element => element.value)), ['deliberately wrong', 'deliberately wrong']);
    await page.getByText(/0 independent successes.*1 first checks needing work/).waitFor();
    await screenshot('production-mastery-recall-restored.png');
  });
  await check('built whole-set Next launches supported graded Mastery and reload preserves visible question code/prompt', async () => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.locator('.header-question-code').waitFor();
    await page.locator('.question-player').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'grades');
    assert.equal(new URL(page.url()).searchParams.get('masteryRun'), token);
    gradeCode = (await page.locator('.header-question-code').innerText()).trim();
    assert.ok(gradeCode.length > 0);
    gradePrompt = await page.locator('.question-player').innerText();
    report.gradedQuestionCode = gradeCode;
    await page.reload();
    await page.locator('.header-question-code').waitFor();
    await page.getByRole('button', { name: 'Check', exact: true }).waitFor();
    assert.equal((await page.locator('.header-question-code').innerText()).trim(), gradeCode);
    assert.equal(await page.locator('.question-player').innerText(), gradePrompt);
    assert.equal(new URL(page.url()).searchParams.get('masteryRun'), token);
    assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'grades');
    await screenshot('production-mastery-graded-restored.png');
  });
  assert.deepEqual(report.pageErrors, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL'; report.failures.push({ message: error.message, stack: error.stack });
  if (page) await page.screenshot({ path: path.join(out, 'production-smoke-failure.png'), fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'production-smoke.json'), JSON.stringify(report, null, 2));
  await browser?.close();
}
console.log(JSON.stringify({ status: report.status, checks: report.checks.length, failures: report.failures.map(item => item.message), evidence: '.artifacts/recall-formulae-ux/s2/mastery/production-smoke.json' }));
