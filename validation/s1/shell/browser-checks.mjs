import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('./', import.meta.url));
await mkdir(output, { recursive: true });
const run = `shell-${Date.now()}`;
const focusRemaining = process.env.SHELL_FOCUS === 'remaining';
const focusNative = process.env.SHELL_FOCUS === 'native';
const resultFile = `${output}${focusNative ? 'browser-results-native.json' : 'browser-results.json'}`;
const skipNative = process.env.SHELL_SKIP_NATIVE === 'true';
const checks = [], errors = [];
const contexts = [], profiles = [];
let browserVersion = 'unknown';
async function open(course, fixture, extra = '', mobile = false) {
  const profile = resolve(output, 'browser-profile', `${run}-${profiles.length}`);
  if (!profile.startsWith(resolve(output, 'browser-profile') + sep)) throw Error('Unsafe browser profile path');
  const context = await chromium.launchPersistentContext(profile, { channel: 'msedge', headless: true, viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, hasTouch: mobile });
  profiles.push(profile); contexts.push(context); browserVersion = context.browser().version();
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(`${course}/${fixture}: ${error.message}`));
  await page.goto(`http://127.0.0.1:5181/${course}.html?run=${run}-${course}-${fixture}${mobile ? '-mobile' : ''}&fixture=${fixture}${extra}`);
  await page.waitForFunction(() => window.__mastersFoundation !== undefined);
  await page.getByRole('button', { name: 'Start fixture', exact: true }).waitFor();
  return { context, page };
}
async function snapshot(page) { await page.evaluate(() => window.__mastersFoundation.flush()); return page.evaluate(() => window.__mastersFoundation.snapshot()); }
async function start(page) { await page.getByRole('button', { name: 'Start fixture', exact: true }).click(); await page.getByTestId('attempt-phase').filter({ hasText: 'answering' }).waitFor(); }
function record(name, detail) { checks.push({ name, status: 'PASS', detail }); }
try {
  for (const course of focusRemaining || focusNative ? [] : ['alevel', 'igcse']) {
    const { context, page } = await open(course, 'numeric');
    await start(page);
    const input = page.getByLabel('Your answer');
    await input.focus(); await page.keyboard.type('42');
    await page.keyboard.press('Tab');
    assert.equal((await snapshot(page)).attempt.currentResponses.answer.raw, '42');
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    const first = (await snapshot(page)).attempt;
    assert.equal(first.firstAssessment.marks.earned, 1);
    await input.fill('24');
    const corrected = (await snapshot(page)).attempt;
    assert.equal(corrected.firstResponse.responses.answer.raw, '42');
    assert.equal(corrected.firstAssessment.marks.earned, 1);
    assert.equal(corrected.firstResponse.timing.activeMs, first.firstResponse.timing.activeMs);
    await page.screenshot({ path: `${output}${course}-desktop.png`, fullPage: true });
    await page.reload(); await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    assert.equal(await page.getByLabel('Your answer').inputValue(), '24');
    assert.equal((await snapshot(page)).attempt.attemptId, first.attemptId);
    record(`${course} keyboard / first-evidence / reload`, 'Keyboard-entered numeric response assessed; correction and reload preserve immutable first response/marks/time and current answer.');
    await context.close();
  }
  if (!focusRemaining && !focusNative) {
    const { context, page } = await open('alevel', 'numeric', '', true);
    await start(page);
    await page.getByLabel('Your answer').tap(); await page.getByLabel('Your answer').fill('42');
    await page.getByRole('button', { name: 'Simulate save failure' }).tap();
    await page.getByLabel('Your answer').fill('41');
    await page.getByText('Work has not been saved.', { exact: true }).waitFor();
    await page.evaluate(() => window.__mastersFoundation.flush());
    await page.getByRole('button', { name: 'Retry save', exact: true }).first().tap();
    await page.getByText('Saved on this device', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: `${output}alevel-mobile.png`, fullPage: true });
    record('touch / save failure / 390px', 'Touch controls and retry save work; answer remains visible; no document horizontal overflow.');
    await context.close();
  }
  if (!focusRemaining && !focusNative) {
    const { context, page } = await open('igcse', 'automatic-text'); await start(page);
    assert.equal(await page.getByLabel('Your answer').evaluate(element => element.tagName), 'TEXTAREA');
    await page.getByLabel('Your answer').fill('This is a long automatic response.');
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    assert.equal((await snapshot(page)).attempt.firstAssessment.kind, 'marked');
    record('automatic multiline', 'Textarea is automatically marked without rubric/self-assessment.'); await context.close();
  }
  {
    const { context, page } = await open('igcse', 'self-rubric'); await start(page);
    const sections = page.locator('.explanation-sections textarea');
    const sectionCount = await sections.count();
    for (let index = 0; index < sectionCount; index++) await sections.nth(index).fill(index === 0 ? 'A precise explanation.' : 'A second explanation.');
    await page.getByRole('button', { name: 'Submit and freeze response' }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'rubric-review' }).waitFor();
    assert.equal(await sections.evaluateAll(elements => elements.every(element => element.readOnly)), true);
    const frozen = (await snapshot(page)).attempt;
    await page.getByRole('button', { name: 'My answer meets this point', exact: true }).click();
    const locked = page.getByLabel('Select evidence from your submitted answer');
    if (skipNative) { await page.getByLabel('Start', { exact: true }).fill('0'); await page.getByLabel('End (exclusive)', { exact: true }).fill('22'); }
    else {
      await locked.focus(); await page.keyboard.press('Control+a');
      const nativeSelection = await locked.evaluate(element => ({ start: element.selectionStart, end: element.selectionEnd, text: element.value, focused: document.activeElement === element }));
      await writeFile(`${output}native-selection-reviewed.json`, JSON.stringify({ nativeSelection, start: await page.getByLabel('Start', { exact: true }).inputValue(), end: await page.getByLabel('End (exclusive)', { exact: true }).inputValue() }, null, 2));
      assert.equal(await page.getByRole('button', { name: 'Use selected text', exact: true }).isEnabled(), true, 'Native keyboard selection must enable exact-evidence confirmation');
    }
    await page.getByRole('button', { name: 'Use selected text', exact: true }).click();
    let reviewing = (await snapshot(page)).attempt;
    assert.equal(reviewing.reviews[0].judgements[0].status, 'met');
    assert.equal(reviewing.reviews[0].judgements[0].evidence.text, skipNative ? 'A precise explanation.' : 'A precise explanation.\n\nA second explanation.');
    if (reviewing.reviews[0].activePointId !== null) {
      await page.getByRole('button', { name: 'My answer meets this point', exact: true }).click();
      await page.getByLabel('Start', { exact: true }).fill('2');
      await page.getByLabel('End (exclusive)', { exact: true }).fill('9');
      await page.getByRole('button', { name: 'Use selected text', exact: true }).click();
      reviewing = (await snapshot(page)).attempt;
      assert.equal(reviewing.reviews[0].judgements[1].evidence.text, 'precise');
    }
    await page.screenshot({ path: `${output}igcse-rubric.png`, fullPage: true });
    await page.getByRole('button', { name: 'Finish self-review' }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    const final = (await snapshot(page)).attempt;
    assert.equal(final.firstAssessment.kind, 'self-rubric'); assert.equal(final.firstResponse.timing.activeMs, frozen.firstResponse.timing.activeMs);
    record('rubric freeze / ordered offset evidence', `${sectionCount} sections freeze; two marking points require exact selected evidence and ordered review via explicit offsets. ${skipNative ? 'Native keyboard selection has separate unresolved diagnostic; no native PASS claimed.' : 'Native keyboard selection also passed.'}`);
    await context.close();
  }
  if (!focusNative) {
    const { context, page } = await open('igcse', 'self-drawing'); await start(page);
    assert.equal(await page.getByText('Compare every atom and bond with the displayed model.', { exact: true }).count(), 0);
    await page.getByLabel('Your answer').fill('42'); await page.getByRole('button', { name: 'Submit and freeze response' }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'drawing-review' }).waitFor();
    assert.equal(await page.getByLabel('Your answer').evaluate(element => element.readOnly), true);
    const frozen = (await snapshot(page)).attempt; assert.equal(frozen.checks[0].judgement, 'pending');
    await page.getByText('Compare every atom and bond with the displayed model.', { exact: true }).waitFor();
    assert.equal((await snapshot(page)).history.length, 0);
    await page.screenshot({ path: `${output}igcse-drawing-review.png`, fullPage: true });
    await page.getByRole('button', { name: 'Yes, my drawing meets every criterion', exact: true }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor();
    await page.getByTestId('evidence-count').filter({ hasText: '1 independent' }).waitFor();
    const final = await snapshot(page); assert.equal(final.attempt.firstAssessment.kind, 'self-drawing'); assert.equal(final.attempt.firstAssessment.marks.earned, 2); assert.equal(final.history.length, 1);
    assert.equal(final.attempt.firstResponse.timing.activeMs, frozen.firstResponse.timing.activeMs);
    record('postnumeric drawing review', 'Model hidden during independent calculation; numeric response/time freezes before explicit model/criteria yes-no confirmation; aggregate first evidence only after confirmation.'); await context.close();
  }
  if (!focusNative) {
    const { context, page } = await open('igcse', 'correction'); await start(page);
    const correctionSource = await page.getByLabel('Select the text to correct').inputValue();
    const errorStart = correctionSource.indexOf('error'); assert.ok(errorStart >= 0);
    await page.getByLabel('Start', { exact: true }).fill(String(errorStart)); await page.getByLabel('End (exclusive)', { exact: true }).fill(String(errorStart + 'error'.length));
    await page.getByRole('button', { name: 'Use selected text', exact: true }).click(); await page.getByLabel('Replacement / correction').fill('correct');
    const state = await snapshot(page); assert.equal(state.attempt.currentResponses.answer.selections[0].text, 'error');
    await page.reload(); await page.getByLabel('Replacement / correction').waitFor(); assert.equal(await page.getByLabel('Replacement / correction').inputValue(), 'correct');
    assert.equal((await snapshot(page)).attempt.currentResponses.answer.selections[0].text, 'error');
    record('correction non-drag / restoration', 'Explicit offsets select exact source range; range and correction survive reload.'); await context.close();
  }
  for (const fixture of focusNative ? [] : ['choice', 'choice-dropdown', 'choice-multiple', 'diagram']) {
    const { context, page } = await open('igcse', fixture); await start(page);
    if (fixture === 'choice-dropdown') { await page.getByLabel('Answer', { exact: true }).selectOption('A'); }
    else { const option = fixture === 'choice' ? page.getByRole('radio', { name: 'Fixture option A' }) : page.getByRole('checkbox', { name: fixture === 'choice-multiple' ? 'Fixture option A' : 'object-A' }); await option.focus(); await page.keyboard.press('Space'); }
    if (fixture === 'choice-multiple') { await page.getByRole('checkbox', { name: 'Fixture option B' }).focus(); await page.keyboard.press('Space'); }
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.getByTestId('attempt-phase').filter({ hasText: 'assessed' }).waitFor(); assert.equal((await snapshot(page)).attempt.firstAssessment.marks.earned, 1);
    record(`${fixture} keyboard selection`, 'Native labelled selection provides keyboard/non-drag alternative.'); await context.close();
  }
  if (!focusNative) {
    const { context, page } = await open('alevel', 'editor', '', true); await start(page);
    await page.getByRole('button', { name: 'Add carbon atom', exact: true }).tap(); await page.getByTestId('editor-atoms').filter({ hasText: '1 atoms' }).waitFor();
    const state = await snapshot(page); await page.reload(); await page.getByTestId('editor-atoms').filter({ hasText: '1 atoms' }).waitFor(); assert.deepEqual((await snapshot(page)).attempt.currentResponses.answer, state.attempt.currentResponses.answer);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `${output}alevel-workspace-mobile.png`, fullPage: true });
    record('injected workspace touch / restoration', 'Accessible button surface emits semantic editor state, restores exact data, and fits 390px viewport. Full chemistry editor remains activity-stage work.'); await context.close();
  }
  for (const course of focusNative ? [] : ['alevel', 'igcse']) {
    const { context, page } = await open(course, 'editor', '&mode=teacher', true);
    await page.getByText('Teacher preview · read only', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Add carbon atom', exact: true }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: 'Check answer', exact: true }).count(), 0);
    const state = await snapshot(page); assert.equal(state.attempt, null); assert.equal(state.history.length, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `${output}${course}-teacher-mobile.png`, fullPage: true });
    record(`${course} teacher exclusion`, 'Read-only injected editor, no assessment action, no attempt and no evidence; responsive view.'); await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(resultFile, JSON.stringify({ status: 'PASS', run, focus: focusNative ? 'Reviewed native readonly Ctrl+A selection plus precise offsets' : focusRemaining ? 'Remaining scenarios after foreman HMR/async-save disposition; earlier successful checks retained in browser-results-first.json' : 'all', testedAt: new Date().toISOString(), browser: browserVersion, browserLaunch: 'Pinned workspace Playwright with installed msedge and project-isolated persistent profiles', viewport: [1440, 1000, 390, 844], checks, pageErrors: errors }, null, 2));
  console.log(JSON.stringify({ status: 'PASS', checks: checks.length, run }));
} catch (error) {
  await writeFile(resultFile, JSON.stringify({ status: 'FAIL', run, testedAt: new Date().toISOString(), checks, pageErrors: errors, error: String(error), stack: error.stack }, null, 2));
  throw error;
} finally { for (const context of contexts) await context.close(); for (const profile of profiles) { if (!profile.startsWith(resolve(output, 'browser-profile') + sep)) throw Error('Unsafe profile cleanup'); await rm(profile, { recursive: true, force: true }); } }
