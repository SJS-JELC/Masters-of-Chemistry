import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { starterDecks } from '../src/recall/starter-decks.ts';
import { routeView, routeCourse } from '../src/shell/navigation-view.ts';

const project = path.resolve(import.meta.dirname, '..');
const { chromium } = createRequire(path.resolve(project, '../../package.json'))('playwright');
const output = path.join(project, 'validation/recall-hub');
fs.mkdirSync(output, { recursive: true });
const base = process.env.RECALL_PREVIEW || 'http://127.0.0.1:5182';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [], errors = [];
async function stores(page) {
  return page.evaluate(async () => {
    const databases = (await indexedDB.databases()).filter((db) => db.name.startsWith('masters-of-chemistry-alpha-v2'));
    const entries = [];
    for (const item of databases) {
      const db = await new Promise((resolve, reject) => { const request = indexedDB.open(item.name); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      const counts = {};
      for (const name of [...db.objectStoreNames]) counts[name] = await new Promise((resolve, reject) => { const request = db.transaction(name).objectStore(name).count(); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
      entries.push([item.name, counts]); db.close();
    }
    return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
  });
}
async function fit(page) { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow'); }
try {
  for (const course of ['alevel', 'igcse']) {
    assert.equal(routeView(new URL(`https://example.invalid/?view=recall&course=${course}`), course), 'recall');
    assert.equal(routeCourse(new URL(`https://example.invalid/?view=recall&course=${course}`), course === 'alevel' ? 'igcse' : 'alevel', 'igcse'), course);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const requests = []; page.on('request', (request) => requests.push(request.url()));
    await page.goto(`${base}/${course}/?course=${course}&view=home`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#recallTile').waitFor();
    assert.equal(await page.locator('.test-tile-row > button').count(), course === 'alevel' ? 4 : 3);
    assert(await page.getByRole('button', { name: 'Recall', exact: true }).isVisible());
    assert.equal(await page.locator('#recallTile svg').count(), 1);
    assert(!requests.some((url) => /RecallView-/.test(url)), 'Recall eagerly loaded on map');
    const before = await stores(page);
    await page.screenshot({ path: path.join(output, `${course}-hub-desktop.png`), fullPage: true });
    await page.getByRole('button', { name: 'Recall', exact: true }).click();
    await page.locator('.fc-card').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('view'), 'recall');
    assert(requests.some((url) => /RecallView-/.test(url)), 'Recall lazy chunk missing');
    assert.match(await page.getByRole('main').getAttribute('aria-label'), new RegExp(course === 'alevel' ? 'A Level' : 'IGCSE'));
    assert.equal(await page.locator('.fc-demo-details').count(), 0);
    for (const [index, card] of starterDecks[course].entries()) {
      assert.equal((await page.locator('.fc-front .content').innerText()).trim(), card.prompt[0].text);
      await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
      assert.equal((await page.locator('.fc-back .content').innerText()).trim(), card.answer[0].text);
      if (!index) {
        await page.getByRole('button', { name: 'Show question', exact: true }).click();
        assert(await page.getByRole('button', { name: 'Got it', exact: true }).isEnabled());
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(output, `${course}-recall-desktop.png`), fullPage: true });
      }
      await page.getByRole('button', { name: index % 2 ? 'Got it' : 'Practise again', exact: true }).click();
      await page.waitForFunction((n) => document.querySelector('.fc-stack-deck').dataset.count === String(n), 5 - index);
    }
    assert.equal(await page.locator('.fc-stack-got').getAttribute('data-count'), '3');
    assert.deepEqual(await stores(page), before, 'Recall created pupil evidence or timing');
    await page.getByRole('button', { name: 'Practise missed cards', exact: true }).click();
    assert.equal(await page.locator('.fc-stack-deck').getAttribute('data-count'), '3');
    await page.getByRole('button', { name: '← Home', exact: true }).click();
    await page.locator('#recallTile').waitFor();
    await page.goBack(); await page.locator('.fc-card').waitFor();
    assert.equal(await page.locator('.fc-stack-deck').getAttribute('data-count'), '6');
    await page.reload(); await page.locator('.fc-card').waitFor();
    assert.equal(new URL(page.url()).searchParams.get('course'), course);
    await page.goForward(); await page.locator('#recallTile').waitFor();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await fit(page);
      const boxes = await page.locator('.test-tile-row > button').evaluateAll((buttons) => buttons.map((button) => {
        const rect = button.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, width: rect.width, height: rect.height };
      }));
      assert(boxes.every((box) => box.width >= 44 && box.height >= 44 && box.right <= width && box.left >= 0));
      assert(boxes.every((box) => Math.abs(box.top - boxes[0].top) < 1), 'Hub tiles wrapped');
      if (width === 390) await page.screenshot({ path: path.join(output, `${course}-hub-mobile.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Revision', exact: true }).click();
    assert(!await page.locator('#recallTile').isVisible(), 'Recall distracts from revision selection');
    await fit(page);
    await page.getByRole('button', { name: 'Revision', exact: true }).click();
    await page.locator('#recallTile').click(); await page.locator('.fc-card').waitFor();
    await page.waitForTimeout(350); await fit(page);
    await page.screenshot({ path: path.join(output, `${course}-recall-mobile.png`), fullPage: true });
    await page.getByRole('button', { name: '← Home', exact: true }).click();
    await page.locator('#flipCourse').click();
    const other = course === 'alevel' ? 'igcse' : 'alevel';
    await page.waitForFunction((course) => new URL(location.href).searchParams.get('course') === course, other);
    await page.locator('#recallTile').click(); await page.locator('.fc-card').waitFor();
    assert.equal((await page.locator('.fc-front .content').innerText()).trim(), starterDecks[other][0].prompt[0].text);
    checks.push(`${course}: brain tile; lazy load; six checked course cards; reveal-once sorting; repeat pass; no evidence writes; Home/back/forward/reload; 320/390px hubs; revision selection; in-place course switch`);
    await context.close();
  }
  assert.deepEqual(errors, []);
  const report = { status: 'PASS', checkedAt: new Date().toISOString(), browser: await browser.version(), checks, errors };
  fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
