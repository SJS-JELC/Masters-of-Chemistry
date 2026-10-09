import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const project = path.resolve(import.meta.dirname, '..');
const require = createRequire(path.resolve(project, '../../package.json'));
const { chromium } = require('playwright');
const output = path.join(project, '.artifacts/flashcards');
fs.mkdirSync(output, { recursive: true });
const base = process.env.FLASHCARD_URL || 'http://127.0.0.1:5181/development/authoring/index.html?component=flashcards';
const checks = [];
const errors = [];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const button = (name) => page.getByRole('button', { name, exact: true });
const count = async (side) => Number(await page.locator(`.fc-stack-${side}`).getAttribute('data-count'));
async function untilCount(side, expected) {
  await page.waitForFunction(({ side, expected }) => Number(document.querySelector(`.fc-stack-${side}`).dataset.count) === expected, { side, expected });
}
async function choose(value) {
  const details = page.locator('.fc-demo-details');
  if (!await details.evaluate((el) => el.open)) await details.locator('summary').click();
  await page.getByLabel('Preview deck').selectOption(value);
  await details.locator('summary').click();
}
async function sort(side) {
  await button('Reveal answer').click();
  await button(side === 'got' ? 'Got it' : 'Practise again').click();
  await page.waitForFunction(() => !document.querySelector('.fc-flying'));
}
async function noOverflow(target = page) {
  assert(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
}
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.fc-card').waitFor();
  assert.equal(await count('deck'), 6);
  const deckLayers = await page.locator('.fc-stack-deck .fc-layer').evaluateAll((layers) => layers.map((el) => {
    const box = el.getBoundingClientRect(); return { x: box.x, y: box.y };
  }));
  assert.equal(deckLayers.length, 6);
  assert.equal(new Set(deckLayers.map((layer) => layer.x)).size, 6);
  assert.equal(new Set(deckLayers.map((layer) => layer.y)).size, 6);
  assert(await button('Got it').isDisabled());
  assert(!await page.locator('.fc-back').ariaSnapshot().then((text) => text.includes('2, 8, 18, 32')), 'Answer leaked to accessibility tree');
  await page.screenshot({ path: path.join(output, 'desktop-question.png'), fullPage: true });
  await page.locator('.fc-card').focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(350);
  assert(await page.locator('.fc-back').ariaSnapshot().then((text) => text.includes('2, 8, 18, 32')));
  await page.screenshot({ path: path.join(output, 'desktop-answer.png'), fullPage: true });
  await page.keyboard.press('Space');
  assert(await button('Got it').isEnabled(), 'Sorting relocked after flipping back');
  assert(!await page.locator('.fc-back').ariaSnapshot().then((text) => text.includes('2, 8, 18, 32')));
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');
  await untilCount('got', 1);
  assert.equal(await count('again'), 0, 'Repeated input double sorted');
  assert.equal(await count('deck'), 5);
  assert(await button('Got it').isDisabled(), 'New card inherited previous reveal');
  assert(await page.locator('.fc-card').evaluate((el) => el === document.activeElement));
  await button('↶ Undo last card').click();
  assert.equal(await count('got'), 0);
  assert(await page.locator('.fc-card').evaluate((el) => el.classList.contains('fc-revealed')));
  await page.locator('.fc-card').focus();
  await page.keyboard.press('ArrowLeft');
  await untilCount('again', 1);
  await sort('got');
  await sort('again');
  await sort('got');
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(output, 'desktop-piles.png'), fullPage: true });
  await sort('got');
  await sort('got');
  assert.equal(await count('got'), 4);
  assert.equal(await count('again'), 2);
  assert.equal(await count('deck'), 0);
  assert(await page.getByRole('heading', { name: 'A little more remembered.' }).isVisible());
  await button('Practise missed cards').click();
  assert.equal(await count('deck'), 2);
  assert.equal(await count('again'), 0);
  assert.match(await page.locator('.fc-front').innerText(), /first four principal/);
  await sort('got');
  assert.match(await page.locator('.fc-front').innerText(), /rules used to fill/);
  await sort('got');
  await button('Restart deck').click();
  assert.equal(await count('deck'), 6);
  assert(await button('Got it').isDisabled(), 'Restart inherited previous reveal');
  checks.push('Hidden answer; keyboard; duplicate-event lock; undo/focus; both piles; completion; original-order missed pass; full restart');

  // Mouse pointer follows the same captured-pointer path as horizontal touch.
  await button('Reveal answer').click();
  await button('Show question').click();
  await page.waitForTimeout(350);
  const card = await page.locator('.fc-card').boundingBox();
  const x = card.x + card.width / 2, y = card.y + card.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 25, y, { steps: 4 }); await page.mouse.up();
  assert.equal(await count('deck'), 6, 'Short drag sorted');
  assert(await button('Got it').isEnabled(), 'Drag triggered flip');
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 150, y, { steps: 8 }); await page.mouse.up();
  await untilCount('got', 1);
  checks.push('Reveal then flip back: keyboard and pointer sorting stay enabled; new cards/restarts reset; short pointer drag cancels');
  await choose('empty');
  assert(await page.getByRole('heading', { name: 'No cards in this deck' }).isVisible());
  await choose('single'); await sort('got');
  await button('↶ Undo last card').click();
  assert.equal(await count('deck'), 1);
  checks.push('Empty deck; single-card completion and undo');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await choose('large');
  for (let index = 0; index < 26; index++) await sort(index % 2 ? 'got' : 'again');
  assert.equal(await count('got'), 13);
  assert.equal(await page.locator('.fc-stack-got .fc-layer').count(), 10);
  assert.equal(await page.locator('.fc-stack-again .fc-layer').count(), 10);
  assert.equal(await count('deck'), 34);
  assert.equal(await page.locator('.fc-mover').evaluate((el) => getComputedStyle(el).animationName), 'none');
  await noOverflow();
  await page.screenshot({ path: path.join(output, 'desktop-large-piles.png'), fullPage: true });
  checks.push('26 sorts with reduced motion; exact counts; bounded ten layers per pile; no horizontal overflow');
  await choose('long');
  await button('Reveal answer').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.fc-demo-header').scrollIntoViewIfNeeded();
  await noOverflow();
  assert.match(await page.locator('.fc-back').innerText(), /SO₄²⁻/);
  await page.screenshot({ path: path.join(output, 'mobile-long-answer.png'), fullPage: true });
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow();
  assert(await button('Got it').isEnabled());
  checks.push('Long text/notation; 390px and 320px layouts; scrolling content without clipped controls');

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const touch = await touchContext.newPage();
  await touch.goto(base, { waitUntil: 'networkidle' });
  await touch.getByRole('button', { name: 'Reveal answer', exact: true }).tap();
  await touch.getByRole('button', { name: 'Show question', exact: true }).tap();
  await touch.waitForTimeout(350);
  await touch.locator('.fc-card').scrollIntoViewIfNeeded();
  const box = await touch.locator('.fc-card').boundingBox();
  const client = await touchContext.newCDPSession(touch);
  async function swipe(dx, dy) {
    const sx = box.x + box.width / 2, sy = box.y + box.height / 2;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy }] });
    for (let step = 1; step <= 8; step++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + dx * step / 8, y: sy + dy * step / 8 }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  const initialScroll = await touch.evaluate(() => scrollY);
  await swipe(0, -120);
  assert.equal(await touch.locator('.fc-stack-deck').getAttribute('data-count'), '6');
  assert(await touch.evaluate(() => scrollY) > initialScroll, 'Vertical touch did not scroll');
  await touch.locator('.fc-card').scrollIntoViewIfNeeded();
  Object.assign(box, await touch.locator('.fc-card').boundingBox());
  await swipe(-125, 0);
  await touch.waitForFunction(() => document.querySelector('.fc-stack-again').dataset.count === '1');
  await touch.waitForTimeout(350);
  await noOverflow(touch);
  await touch.screenshot({ path: path.join(output, 'mobile-piles.png'), fullPage: true });
  checks.push('Native browser touch on question face after reveal: vertical scroll cancels gesture; left swipe sorts once');
  await touchContext.close();
  assert.deepEqual(errors, []);
  checks.push('No browser exceptions or failed HTTP responses');

  const provenance = JSON.parse(fs.readFileSync(path.join(project, 'src/development/flashcards/provenance.json')));
  const original = fs.readFileSync(path.resolve(project, '../..', provenance.source), 'utf8');
  assert.equal(crypto.createHash('sha256').update(original).digest('hex'), provenance.sha256);
  const originals = JSON.parse(original.slice(original.indexOf('globalThis.FLASHCARDS = ') + 23).trim().replace(/;$/, ''));
  const data = fs.readFileSync(path.join(project, 'src/development/flashcards/data.ts'), 'utf8');
  for (const c of originals) {
    assert(data.includes(c.id));
    // Compare runtime text so JavaScript quote/linebreak escaping cannot hide a change.
  }
  await choose('reviewed');
  for (const c of originals) {
    assert.equal((await page.locator('.fc-front .content').innerText()).trim(), c.prompt);
    await button('Reveal answer').click();
    assert.equal((await page.locator('.fc-back .content').innerText()).trim(), c.answer);
    await button('Got it').click();
    await page.waitForFunction(() => !document.querySelector('.fc-flying'));
  }
  checks.push('All six prompts/answers match approved source verbatim; source SHA-256 unchanged');

  for (const course of ['app']) {
    const assets = path.join(project, 'dist', course, 'assets');
    for (const name of fs.readdirSync(assets).filter((name) => /\.(js|css)$/.test(name))) {
      assert(!/Build your recall|stack-fixture|Layout fixture/.test(fs.readFileSync(path.join(assets, name), 'utf8')), `Prototype leaked into ${course}/${name}`);
    }
  }
  checks.push('Developer demo and fixtures absent from the combined production build; shared table authorised for Recall');

  await build({ configFile: false, root: project, publicDir: false, logLevel: 'error', build: {
    outDir: path.join(output, 'bundle'), emptyOutDir: true, minify: true,
    lib: { entry: path.join(project, 'src/recall/FlashcardTable.tsx'), formats: ['es'], fileName: 'flashcard-table' },
    rolldownOptions: { external: ['react', 'react/jsx-runtime', 'react-dom'] },
  } });
  const bundle = fs.readdirSync(path.join(output, 'bundle')).map((name) => {
    const bytes = fs.readFileSync(path.join(output, 'bundle', name));
    return { name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
  });
  const sourceSizes = ['FlashcardTable.tsx', 'flashcards.css', 'FlashcardDemo.tsx', 'data.ts'].map((name) => {
    const text = fs.readFileSync(path.join(project, ['FlashcardTable.tsx', 'flashcards.css'].includes(name) ? 'src/recall' : 'src/development/flashcards', name), 'utf8');
    return { name, bytes: Buffer.byteLength(text), lines: text.trimEnd().split('\n').length };
  });
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ status: 'PASS', checkedAt: new Date().toISOString(), browser: await browser.version(), checks, errors, sourceSizes, bundle, bundleScope: 'Reusable component + existing Content/DiagramViewport rendering; React external. Demo/deck and shared font excluded.' }, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', checks, sourceSizes, bundle }, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
  fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ checkedAt: new Date().toISOString(), checks, errors, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
