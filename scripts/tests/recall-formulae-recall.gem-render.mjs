import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..'),
  out = path.join(app, '.artifacts/recall-formulae/s2/recall');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const base = 'http://127.0.0.1:5199';
const server = spawn(
  process.execPath,
  [
    path.join(app, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    '5199',
    '--strictPort',
  ],
  { cwd: app, windowsHide: true, stdio: 'pipe' },
);
let browser,
  log = '';
server.stdout.on('data', (x) => (log += x));
server.stderr.on('data', (x) => (log += x));
const observations = {};
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(
    base + '/igcse.html?course=igcse&run=recall-settled-render&view=home#fourth-16-2',
    { waitUntil: 'networkidle' },
  );
  await page.locator('.detail-panel').waitFor({ state: 'visible' });
  const computed = () =>
    page.locator('.detail-panel').evaluate((panel) => {
      const style = getComputedStyle(panel);
      return {
        selector: '.original-landing.igcse .detail-panel',
        opacity: style.opacity,
        backgroundColor: style.backgroundColor,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        animations: panel
          .getAnimations()
          .map((a) => ({ playState: a.playState, currentTime: a.currentTime })),
        box: {
          width: panel.getBoundingClientRect().width,
          height: panel.getBoundingClientRect().height,
        },
      };
    });
  await page.waitForTimeout(350);
  observations.desktop = await computed();
  await page.screenshot({
    path: path.join(out, 'igcse-gem-choices-settled-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  observations.mobile = await computed();
  await page.screenshot({
    path: path.join(out, 'igcse-gem-choices-settled-mobile.png'),
    fullPage: true,
  });
  observations.mobileOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  fs.writeFileSync(
    path.join(out, 'settled-gem-render.json'),
    JSON.stringify(
      {
        status: 'PENDING_RENDER_INSPECTION',
        method:
          'Actual current production IGCSE selected gem after350ms opening/resize settle; computed opacity/background/animation state retained.',
        observations,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify(observations, null, 2));
} catch (e) {
  fs.writeFileSync(
    path.join(out, 'settled-gem-render.json'),
    JSON.stringify({ status: 'FAIL', message: String(e), observations, log }, null, 2) + '\n',
  );
  throw e;
} finally {
  await browser?.close();
  server.kill();
}
