import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = fileURLToPath(new URL('./', import.meta.url));
const profile = resolve(folder, 'browser-profile', `learning-${Date.now()}`);
const contained = () => profile.startsWith(resolve(folder, 'browser-profile') + sep);
if (!contained()) throw Error('Profile containment');
await mkdir(folder, { recursive: true });
const context = await chromium.launchPersistentContext(profile, { channel: 'msedge', headless: true, viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = []; page.on('pageerror', error => errors.push(error.message));
const run = `learning-${Date.now()}`;
const snapshot = async () => { await page.evaluate(() => window.__mastersFoundation.flush()); return page.evaluate(() => window.__mastersFoundation.snapshot()); };
try {
  await page.goto(`http://127.0.0.1:5181/igcse.html?run=${run}&fixture=automatic-text`);
  await page.waitForFunction(() => window.__mastersFoundation !== undefined);
  await page.getByRole('button', { name: 'Start fixture', exact: true }).click();
  await page.getByTestId('attempt-phase').filter({ hasText: 'answering' }).waitFor();
  await page.getByLabel('Your answer').fill('unrecognized fixture');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await page.getByText('Response has not been assessed', { exact: true }).waitFor();
  let state = await snapshot();
  assert.equal(state.attempt.phase, 'answering'); assert.equal(state.history.length, 0); assert.equal(state.attempt.firstAssessment, undefined);
  await page.getByLabel('Your answer').fill('A recognised fixture response.');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
  await page.getByTestId('evidence-count').filter({ hasText: '1 independent' }).waitFor();
  state = await snapshot();
  const first = structuredClone(state.attempt), history = structuredClone(state.history);
  assert.equal(first.firstAssessment.marks.earned, 0); assert.equal(first.firstAssessment.score, 0); assert.equal(history.length, 1);
  await page.getByText('Review equivalent wording for learning', { exact: true }).click();
  await page.getByRole('button', { name: 'My wording is equivalent', exact: true }).click();
  await page.getByText('Learning review: 1 / 1 marks. First marks remain unchanged.', { exact: true }).waitFor();
  state = await snapshot();
  assert.equal(state.attempt.learningReview.reviewedMarks.earned, 1); assert.deepEqual(state.attempt.firstResponse, first.firstResponse); assert.deepEqual(state.attempt.firstAssessment, first.firstAssessment); assert.deepEqual(state.history, history);
  await page.screenshot({ path: resolve(folder, 'igcse-learning-review.png'), fullPage: true });
  await page.reload(); await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
  await page.getByText('Learning review: 1 / 1 marks. First marks remain unchanged.', { exact: true }).waitFor();
  state = await snapshot();
  assert.deepEqual(state.attempt.firstResponse, first.firstResponse); assert.deepEqual(state.attempt.firstAssessment, first.firstAssessment); assert.deepEqual(state.history, history); assert.equal(state.attempt.attemptId, first.attemptId); assert.deepEqual(errors, []);
  await writeFile(resolve(folder, 'browser-learning-review.json'), JSON.stringify({ status: 'PASS', run, browser: context.browser().version(), testedAt: new Date().toISOString(), checks: ['Unknown input remains answering with no first assessment/evidence', 'Recognised incorrect response creates immutable 0-mark first result and one evidence record', 'Typed equivalent-wording review visibly awards learning marks only', 'First response/score/time/evidence unchanged after review and reload'], pageErrors: errors }, null, 2));
  console.log(JSON.stringify({ status: 'PASS', checks: 4, run }));
} catch (error) {
  await writeFile(resolve(folder, 'browser-learning-review.json'), JSON.stringify({ status: 'FAIL', error: String(error), stack: error.stack, pageErrors: errors }, null, 2)); throw error;
} finally {
  await context.close(); if (!contained()) throw Error('Cleanup containment'); await rm(profile, { recursive: true, force: true });
}
