import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, devOrigin } from './browser/paths.mjs';
const app = path.resolve(import.meta.dirname, '..');
const out = path.join(app, '.artifacts/flashcard-time/browser');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const run = 'flashcard-focus-' + Date.now();
const events = [];
try {
  const page = await browser.newPage();
  await page.goto(`${devOrigin}/?course=alevel&view=recall&recallGem=l6-t2-1-1&run=${run}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal answer', exact: true }).waitFor();
  await page.waitForTimeout(1100);
  await page.evaluate(() => {
    window.__studyFocusEvents = [];
    for (const name of ['blur', 'focus', 'visibilitychange']) {
      (name === 'visibilitychange' ? document : window).addEventListener(name, event =>
        window.__studyFocusEvents.push({ name, trusted: event.isTrusted, visible: !document.hidden, focused: document.hasFocus() }));
    }
  });
  const other = await browser.newPage();
  await other.goto(devOrigin, { waitUntil: 'networkidle' });
  await other.bringToFront();
  const state = await page.evaluate(() => ({ visible: !document.hidden, focused: document.hasFocus() }));
  if (state.visible && state.focused) {
    fs.writeFileSync(path.join(out, 'native-focus.json'), JSON.stringify({ status: 'CAPABILITY_UNESTABLISHED', state,
      reason: 'Headless tab activation did not produce hidden or unfocused document state; deterministic visibility/focus boundary tests retain coverage.' }, null, 2));
    console.log(JSON.stringify({ status: 'CAPABILITY_UNESTABLISHED', state }));
  } else {
    const read = () => page.evaluate(async run => {
      const { createChemistryRepository } = await import('/src/persistence/repository.ts');
      const { alphaDatabaseName } = await import('/src/persistence/alpha-namespace.ts');
      const repository = createChemistryRepository(alphaDatabaseName('alevel', run));
      const result = await repository.flashcardStudyTimeHistory({ course: 'alevel', profileId: 'local' });
      repository.close();
      if (!result.ok) throw Error(result.error.message);
      return result.value.reduce((total, item) => total + item.activeMs, 0);
    }, run);
    await page.waitForTimeout(250);
    const before = await read();
    await page.waitForTimeout(1800);
    const after = await read();
    assert.equal(after, before);
    await page.bringToFront();
    await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
    await page.locator('.recall-selection').waitFor();
    const resumed = await read();
    assert.ok(resumed > after && resumed - after < 5000);
    events.push(...await page.evaluate(() => window.__studyFocusEvents));
    assert.ok(events.some(event => event.trusted && (!event.visible || !event.focused)));
    const result = { status: 'PASS', state, before, after, resumed, events };
    fs.writeFileSync(path.join(out, 'native-focus.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
  }
} finally {
  await browser.close();
}
