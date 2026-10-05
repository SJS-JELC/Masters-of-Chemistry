import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const folder = fileURLToPath(new URL('./', import.meta.url));
const profile = resolve(folder, 'browser-profile', `correction-${Date.now()}`);
const contained = () => profile.startsWith(resolve(folder, 'browser-profile') + sep);
if (!contained()) throw Error('Profile containment');
await mkdir(folder, { recursive: true });
const context = await chromium.launchPersistentContext(profile, { channel: 'msedge', headless: true, viewport: { width: 1440, height: 1000 } });
const checks = [], errors = [];
const snapshot = async page => { await page.evaluate(() => window.__mastersFoundation.flush()); return page.evaluate(() => window.__mastersFoundation.snapshot()); };
const record = (name, detail) => checks.push({ name, status: 'PASS', detail });
async function open(course, fixture, revision = false) {
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:5181/${course}.html?run=correction-${course}-${fixture}-${Date.now()}&fixture=${fixture}${revision ? '&session=revision' : ''}`);
  if (revision) await page.getByRole('button', { name: /^ADD ALL / }).first().click();
  await page.getByRole('button', { name: 'Start fixture', exact: true }).click();
  await page.getByTestId('attempt-phase').filter({ hasText: 'answering' }).waitFor(); return page;
}
function immutable(actual, original) {
  assert.deepEqual(actual.attempt.firstResponse, original.attempt.firstResponse);
  assert.deepEqual(actual.attempt.firstAssessment, original.attempt.firstAssessment);
  assert.deepEqual(actual.history, original.history);
  assert.deepEqual(actual.session, original.session);
  assert.equal(actual.attempt.attemptId, original.attempt.attemptId);
}
try {
  for (const course of ['alevel', 'igcse']) {
    const page = await open(course, 'numeric', true);
    await page.getByLabel('Your answer').fill('41'); await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    await page.getByTestId('evidence-count').filter({ hasText: '1 independent' }).waitFor();
    const original = await snapshot(page); assert.equal(original.attempt.firstAssessment.score, 0); assert.equal(original.attempt.firstAssessment.marks.earned, 0);
    await page.getByRole('button', { name: 'Check correction', exact: true }).click();
    await page.getByText('Correction needs more work', { exact: true }).waitFor();
    let state = await snapshot(page); assert.equal(state.correctionFeedback.status, 'wrong'); immutable(state, original);
    await page.getByLabel('Your answer').fill('42'); state = await snapshot(page); assert.equal(state.correctionFeedback, undefined);
    assert.equal(await page.getByRole('region', { name: 'Learning correction check' }).count(), 0);
    for (let index = 0; index < 3; index++) {
      await page.getByRole('button', { name: 'Check correction', exact: true }).click();
      await page.getByText('Correction is correct', { exact: true }).waitFor();
      state = await snapshot(page); assert.equal(state.correctionFeedback.status, 'correct'); assert.equal(state.correctionFeedback.marks.earned, 1); immutable(state, original);
    }
    await page.screenshot({ path: resolve(folder, `correction-${course}.png`), fullPage: true });
    await page.reload(); await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    state = await snapshot(page); immutable(state, original); assert.equal(state.correctionFeedback, undefined); assert.equal(await page.getByLabel('Your answer').inputValue(), '42');
    await page.getByLabel('Your answer').fill(''); await page.getByRole('button', { name: 'Check correction', exact: true }).click();
    await page.getByText('Correction incomplete', { exact: true }).waitFor(); state = await snapshot(page); assert.equal(state.correctionFeedback.status, 'incomplete'); immutable(state, original);
    await page.getByLabel('Your answer').fill('42'); await snapshot(page);
    await page.getByRole('button', { name: 'Next question', exact: true }).click(); await page.getByTestId('attempt-phase').filter({ hasText: 'answering' }).waitFor();
    state = await snapshot(page); assert.notEqual(state.attempt.attemptId, original.attempt.attemptId); assert.equal(state.correctionFeedback, undefined);
    record(`${course} wrong first / repeated correction / revision`, 'Wrong first marks0 and one record remain immutable through wrong/correct/incomplete learning checks, repeated correct checks, edits and reload; exact session/scheduler snapshot unchanged. Next starts a fresh ID with no learning feedback.');
    await page.close();
  }
  {
    const page = await open('igcse', 'numeric');
    await page.getByRole('button', { name: 'Reveal answer (assisted)', exact: true }).click(); await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    const original = await snapshot(page); assert.equal(original.attempt.firstAssessment.kind, 'revealed'); assert.equal(original.history.length, 0);
    await page.getByLabel('Your answer').fill('42');
    for (let index = 0; index < 2; index++) { await page.getByRole('button', { name: 'Check correction', exact: true }).click(); await page.getByText('Correction is correct', { exact: true }).waitFor(); const state = await snapshot(page); assert.equal(state.correctionFeedback.marks.earned, 1); immutable(state, original); }
    await page.screenshot({ path: resolve(folder, 'correction-after-reveal.png'), fullPage: true });
    record('reveal / learning correction', 'Reveal stays assisted/nonindependent with zero curriculum evidence; repeated meaningful automatic learning checks preserve frozen first response/time and session.'); await page.close();
  }
  {
    const page = await open('igcse', 'automatic-text'); await page.getByLabel('Your answer').fill('A recognised wrong response.'); await page.getByRole('button', { name: 'Check answer', exact: true }).click(); await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor(); await page.getByTestId('evidence-count').filter({ hasText: '1 independent' }).waitFor();
    const original = await snapshot(page); await page.getByLabel('Your answer').fill('unrecognized fixture'); await page.getByRole('button', { name: 'Check correction', exact: true }).click(); await page.getByText('Correction not recognised', { exact: true }).waitFor();
    const state = await snapshot(page); assert.equal(state.correctionFeedback.status, 'unrecognized'); immutable(state, original);
    record('unrecognised correction', 'Unrecognised corrected text uses typed issue feedback, distinct from recognised wrong marks and first assessment.'); await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(resolve(folder, 'browser-correction.json'), JSON.stringify({ status: 'PASS', browser: context.browser().version(), testedAt: new Date().toISOString(), checks, pageErrors: errors }, null, 2));
  console.log(JSON.stringify({ status: 'PASS', checks: checks.length }));
} catch (error) { await writeFile(resolve(folder, 'browser-correction.json'), JSON.stringify({ status: 'FAIL', checks, pageErrors: errors, error: String(error), stack: error.stack }, null, 2)); throw error; }
finally { await context.close(); if (!contained()) throw Error('Cleanup containment'); await rm(profile, { recursive: true, force: true }); }
