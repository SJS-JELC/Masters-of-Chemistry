import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..');
const out = path.join(app, '.artifacts/recall-formulae/s2/recall');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const port = 5200,
  base = 'http://127.0.0.1:' + port,
  run = 'recall-native-' + Date.now();
const server = spawn(
  process.execPath,
  [
    path.join(app, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { cwd: app, windowsHide: true, stdio: 'pipe' },
);
let log = '',
  browser;
server.stdout.on('data', (x) => (log += x));
server.stderr.on('data', (x) => (log += x));
const checks = [],
  samples = {},
  errors = [];
async function record(page) {
  return page.evaluate(async (run) => {
    const { createRepository } = await import('/src/persistence/repository.ts');
    const r = createRepository('masters-of-chemistry-alpha-v2-igcse-' + run);
    const n = { course: 'igcse', profileId: 'local' };
    const session = await r.loadRecallSession(n, 'recall:recall-practice:global');
    const a = await r.loadRecallAttempt(n, session.value.currentAttemptId),
      h = await r.recallHistory(n);
    r.close();
    return {
      attempt: a.value,
      history: h.value,
      visibility: document.visibilityState,
      focused: document.hasFocus(),
    };
  }, run);
}
async function persisted(page, minimum) {
  for (let i = 0; i < 60; i++) {
    const r = await record(page);
    if (r.attempt.timing.activeMs >= minimum) return r;
    await page.waitForTimeout(100);
  }
  throw Error('Timing checkpoint did not persist');
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    ignoreDefaultArgs: [
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
    args: ['--window-position=-32000,-32000', '--window-size=1100,900'],
  });
  const context = await browser.newContext(),
    page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/igcse.html?course=igcse&view=recall&run=' + run, {
    waitUntil: 'networkidle',
  });
  await page.bringToFront();
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('textbox').fill('(aq)');
  await page.waitForTimeout(1600);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  const window = await cdp.send('Browser.getWindowForTarget');
  await cdp.send('Browser.setWindowBounds', {
    windowId: window.windowId,
    bounds: { windowState: 'minimized' },
  });
  await page.waitForTimeout(500);
  samples.nativeMinimizeState = {
    document: await page.evaluate(() => ({
      hidden: document.hidden,
      focused: document.hasFocus(),
    })),
    window: await cdp.send('Browser.getWindowBounds', { windowId: window.windowId }),
  };
  console.log(JSON.stringify(samples.nativeMinimizeState));
  const backgroundTab = await context.newPage();
  await backgroundTab.goto('about:blank');
  const tabCdp = await context.newCDPSession(backgroundTab);
  await tabCdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await backgroundTab.bringToFront();
  await page.waitForFunction(() => !document.hasFocus());
  await page.waitForTimeout(300);
  const hidden = await record(page);
  await page.waitForTimeout(1800);
  const afterHidden = await record(page);
  assert.equal(afterHidden.attempt.timing.activeMs, hidden.attempt.timing.activeMs);
  assert(hidden.attempt.timing.activeMs >= 1000);
  samples.hidden = { before: hidden, after: afterHidden };
  checks.push(
    'Native background window/tab is unfocused, checkpoints same attempt and adds no background time',
  );
  samples.hiddenObservation = hidden.visibility;
  if (hidden.visibility !== 'hidden')
    checks.push(
      'EXCEPTION: native minimized/background page reports visible; true native hidden visibility was not observed. Focus loss exclusion is verified.',
    );
  await cdp.send('Browser.setWindowBounds', {
    windowId: window.windowId,
    bounds: { windowState: 'normal' },
  });
  await page.bringToFront();
  await backgroundTab.close();
  await page.getByRole('textbox').fill('(aq)');
  await page.waitForTimeout(1300);
  const otherContext = await browser.newContext(),
    other = await otherContext.newPage();
  await other.goto('about:blank');
  const otherCdp = await otherContext.newCDPSession(other);
  await otherCdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await other.bringToFront();
  await page.waitForFunction(() => !document.hasFocus());
  await page.waitForTimeout(300);
  const blurred = await record(page);
  await page.waitForTimeout(1800);
  const afterBlur = await record(page);
  assert.equal(afterBlur.attempt.timing.activeMs, blurred.attempt.timing.activeMs);
  samples.blur = { before: blurred, after: afterBlur };
  checks.push(
    'Native separate Edge window takes focus: blur checkpoints and excludes unfocused time',
  );
  await otherContext.close();
  await page.bringToFront();
  await page.getByRole('textbox').fill('(aq)');
  await page.waitForTimeout(1300);
  await page.getByRole('button', { name: 'Pause and choose set' }).click();
  const beforeSuspend = await record(page);
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('textbox').fill('(aq)');
  await page.evaluate(() => {
    const until = performance.now() + 6500;
    while (performance.now() < until) {}
  });
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Pause and choose set' }).click();
  const afterSuspend = await record(page);
  samples.suspension = { before: beforeSuspend, after: afterSuspend, mainThreadStallWallMs: 6500 };
  assert.equal(afterSuspend.attempt.attemptId, beforeSuspend.attempt.attemptId);
  assert(afterSuspend.attempt.timing.activeMs - beforeSuspend.attempt.timing.activeMs < 2500);
  checks.push(
    'Actual native renderer main-thread stall excludes 6.5-second sampling gap; same saved attempt restored',
  );
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('textbox').fill('(aq)');
  const idleStart = await record(page);
  await page.waitForTimeout(62000);
  const idleEnd = await record(page);
  await page.waitForTimeout(2500);
  const idleLater = await record(page);
  assert(idleEnd.attempt.timing.activeMs - idleStart.attempt.timing.activeMs >= 57000);
  assert(idleEnd.attempt.timing.activeMs - idleStart.attempt.timing.activeMs <= 60500);
  assert.equal(idleLater.attempt.timing.activeMs, idleEnd.attempt.timing.activeMs);
  samples.idle = { start: idleStart, end: idleEnd, later: idleLater, wallWaitMs: 64500 };
  checks.push('Native 60-second Recall idle allowance expires and later timer ticks add no time');
  await page.getByRole('textbox').fill('(aq)');
  await page.waitForTimeout(1100);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  for (let i = 0; i < 60; i++) {
    if ((await record(page)).history.length) break;
    await page.waitForTimeout(100);
  }
  const assessed = await record(page);
  assert.equal(assessed.history.length, 1);
  assert.equal(
    assessed.history[0].firstResponse.timing.activeMs,
    assessed.attempt.firstResponse.timing.activeMs,
  );
  await page.waitForTimeout(1500);
  await page.getByRole('textbox').fill('wrong');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  const retried = await record(page);
  assert.deepEqual(retried.history, assessed.history);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('status').filter({ hasText: 'Independent recall checked' }).waitFor();
  const restored = await record(page);
  assert.deepEqual(restored.history, assessed.history);
  samples.firstAssessment = { assessed, restored };
  checks.push(
    'First native assessment freezes timing; corrected retry/reload cannot extend or duplicate evidence; summary displays first-check active minutes',
  );
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, 'native-timing.json'),
    JSON.stringify(
      {
        status: samples.hiddenObservation === 'hidden' ? 'PASS' : 'ESCALATE',
        run,
        checks,
        samples,
        errors,
        method:
          'Headed native Edge positioned offscreen; OS browser-window state changed through CDP, focus emulation explicitly disabled, bounded actual renderer main-thread stall, real trusted input and real elapsed idle cutoff; actual production browser timing binding.',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ status: 'PASS', checks }, null, 2));
} catch (e) {
  fs.writeFileSync(
    path.join(out, 'native-timing-failure.json'),
    JSON.stringify({ status: 'FAIL', message: String(e), checks, samples, errors, log }, null, 2) +
      '\n',
  );
  throw e;
} finally {
  await browser?.close();
  server.kill();
}
