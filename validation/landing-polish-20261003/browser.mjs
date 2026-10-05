import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const here = import.meta.dirname, project = path.resolve(here, '../..');
const require = createRequire(path.resolve(project, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
process.env.TEMP = process.env.TMP = path.join(project, '.qhc-tmp');
fs.mkdirSync(process.env.TEMP, { recursive: true });
const browser = await require('playwright').chromium.launch({ channel: 'msedge', headless: true });
const report = { checks: [], errors: [], startedAt: new Date().toISOString() };
const base = 'http://127.0.0.1:5182';
const motto = "Legends aren't born, they're forged";
async function ready(page, course) {
  await page.locator(`.original-landing.${course}`).waitFor();
  await page.waitForFunction(() => document.querySelector('.landing-course-surface')?.getAttribute('aria-busy') === 'false');
  await page.evaluate(() => document.fonts.ready);
}
async function geometry(page) {
  return page.evaluate(() => {
    const box = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    const css = selector => { const s = getComputedStyle(document.querySelector(selector)); return { font: s.font, colour: s.color }; };
    return { shell: box('.landing-shell'), toggle: box('#flipCourse'), eagle: box('.landing-eagle'), title: css('.landing-header h1'), eyebrow: css('.landing-header .eyebrow'), toggleStyle: css('#flipCourse'), overflow: document.documentElement.scrollWidth > innerWidth };
  });
}
try {
  for (const width of [1440, 820, 390, 2200]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(`${base}/alevel/?course=alevel&view=home`);
    await ready(page, 'alevel');
    assert.equal(await page.locator('.landing-header .eyebrow').innerText(), 'SJS - OCR CHEMISTRY A - H432');
    const a = await geometry(page);
    await page.locator('#flipYear').click();
    await page.locator('#flipYear[aria-checked="true"]').waitFor();
    await page.locator('#flipCourse').click();
    assert.equal(await page.locator('.landing-course-surface').getAttribute('inert'), '');
    const outgoing = await page.locator('.landing-course-surface').evaluate(el => el.getAnimations().map(a => ({ duration: a.effect.getTiming().duration, frames: a.effect.getKeyframes().map(f => f.transform) })));
    assert.equal(outgoing[0].duration, 325);
    assert(outgoing[0].frames[1].includes('90deg'));
    await ready(page, 'igcse');
    assert.equal(new URL(page.url()).searchParams.get('course'), 'igcse');
    assert.equal(await page.locator('.landing-header .eyebrow').innerText(), 'SJS - PEARSON IGCSE CHEMISTRY - 4CH1');
    const b = await geometry(page);
    assert.deepEqual(b.shell.x, a.shell.x); assert.equal(b.shell.width, a.shell.width);
    assert.deepEqual(b.toggle, a.toggle); assert.deepEqual(b.eagle, a.eagle);
    assert.deepEqual(b.title, a.title); assert.deepEqual(b.eyebrow, a.eyebrow); assert.deepEqual(b.toggleStyle, a.toggleStyle);
    assert(!a.overflow && !b.overflow);
    assert.equal(await page.locator('.closing-line').innerText(), motto);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'flipCourse');
    await page.screenshot({ path: path.join(here, `igcse-${width}.png`), fullPage: true });
    await page.locator('.mode-eagle').click();
    await page.locator('[data-learning-mode="teacher"]').waitFor();
    await page.locator('#flipCourse').click(); await ready(page, 'alevel');
    assert.equal(await page.locator('#flipYear').getAttribute('aria-checked'), 'true');
    assert.equal(await page.locator('.closing-line').innerText(), motto);
    await page.screenshot({ path: path.join(here, `alevel-${width}.png`), fullPage: true });
    await page.locator('#flipCourse').click(); await ready(page, 'igcse');
    assert.equal(await page.locator('.original-landing').getAttribute('data-learning-mode'), 'teacher');
    await page.reload(); await ready(page, 'igcse');
    assert.equal(await page.locator('.original-landing').getAttribute('data-learning-mode'), 'teacher');
    assert.equal(await page.locator('.original-landing').count(), 1);
    report.checks.push({ width, status: 'PASS', geometry: { alevel: a, igcse: b }, animation: outgoing, yearAndTeacherRestored: true });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.on('pageerror', e => report.errors.push(e.message));
  await page.goto(`${base}/igcse/?course=igcse&view=home`); await ready(page, 'igcse');
  await page.locator('#flipCourse').focus(); await page.keyboard.press('Space'); await ready(page, 'alevel');
  assert.equal(await page.locator('.landing-course-surface').evaluate(el => el.getAnimations().length), 0);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'flipCourse');
  await page.goBack(); await ready(page, 'igcse');
  for (const [course, query, readySelector] of [
    ['alevel', 'view=practice&activity=alevel/acid-base-calculations&gem=u6-t1-1-7&level=2&fresh=1', '.question-player'],
    ['igcse', 'view=statistics', '.site-footer'],
    ['alevel', 'view=olympiad', '.c3l6'],
  ]) {
    await page.goto(`${base}/${course}/?course=${course}&${query}`);
    await page.locator(readySelector).waitFor();
    assert.equal(await page.locator('.site-footer').innerText(), motto);
  }
  report.checks.push({ status: 'PASS', reducedMotionKeyboardAndBack: true, questionStatisticsOlympiadFooters: true });
  await context.close();
  assert.deepEqual(report.errors, []);
  report.status = 'PASS';
} catch (error) { report.status = 'FAIL'; report.error = error.stack; process.exitCode = 1; }
finally {
  await browser.close();
  fs.writeFileSync(path.join(here, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
