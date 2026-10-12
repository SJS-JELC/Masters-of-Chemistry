import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const app = path.resolve(import.meta.dirname, '../..'),
  out = path.join(app, '.artifacts/recall-formulae/s2/recall');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const run = 'native-tabs-' + Date.now();
let browser;
const samples = {};
try {
  browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    ignoreDefaultArgs: [
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
    args: ['--window-position=20,20', '--window-size=1100,900'],
  });
  const context = await browser.newContext(),
    page = await context.newPage();
  await page.goto('http://127.0.0.1:5199/igcse.html?course=igcse&view=recall&run=' + run, {
    waitUntil: 'networkidle',
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  await page.bringToFront();
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('textbox').fill('(aq)');
  await page.waitForTimeout(1200);
  const window = await cdp.send('Browser.getWindowForTarget');
  const other = await context.newPage();
  await other.goto('about:blank');
  const otherCDP = await context.newCDPSession(other);
  await otherCDP.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  const otherWindow = await otherCDP.send('Browser.getWindowForTarget');
  await other.bringToFront();
  await page.waitForTimeout(300);
  const state = async () => ({
    original: await page.evaluate(() => ({
      hidden: document.hidden,
      visibilityState: document.visibilityState,
      focused: document.hasFocus(),
    })),
    other: await other.evaluate(() => ({
      hidden: document.hidden,
      visibilityState: document.visibilityState,
      focused: document.hasFocus(),
    })),
  });
  samples.sameContext = {
    originalWindowId: window.windowId,
    secondWindowId: otherWindow.windowId,
    sameWindow: window.windowId === otherWindow.windowId,
    afterSwitch: await state(),
  };
  const target = await cdp.send('Target.getTargetInfo');
  const waiting = context.waitForEvent('page');
  const created = await cdp.send('Target.createTarget', {
    url: 'about:blank',
    browserContextId: target.targetInfo.browserContextId,
    newWindow: false,
  });
  const tab = await waiting;
  const tabCDP = await context.newCDPSession(tab);
  await tabCDP.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  const tabWindow = await tabCDP.send('Browser.getWindowForTarget');
  await cdp.send('Target.activateTarget', { targetId: created.targetId });
  await tab.bringToFront();
  await page.waitForTimeout(300);
  samples.explicitTab = {
    originalWindowId: window.windowId,
    tabWindowId: tabWindow.windowId,
    sameWindow: window.windowId === tabWindow.windowId,
    original: await page.evaluate(() => ({
      hidden: document.hidden,
      visibilityState: document.visibilityState,
      focused: document.hasFocus(),
    })),
  };
  const checkpoint = () =>
    page.evaluate(async (run) => {
      const { createRepository } = await import('/src/persistence/repository.ts');
      const r = createRepository('masters-of-chemistry-alpha-v2-igcse-' + run),
        n = { course: 'igcse', profileId: 'local' };
      const s = await r.loadRecallSession(n, 'recall:recall-practice:global');
      const a = await r.loadRecallAttempt(n, s.value.currentAttemptId);
      r.close();
      return a.value;
    }, run);
  samples.backgroundBefore = await checkpoint();
  await page.waitForTimeout(1800);
  samples.backgroundAfter = await checkpoint();
  const hidden = samples.explicitTab.sameWindow && samples.explicitTab.original.hidden;
  const excluded =
    samples.backgroundBefore.timing.activeMs === samples.backgroundAfter.timing.activeMs;
  const result = {
    status: hidden && excluded ? 'PASS' : 'ESCALATE',
    run,
    method:
      'Fresh headed Edge at normal screen position; both default backgrounding flags omitted, focus emulation disabled; real second-page activation and explicit same-window CDP tab activation. No synthetic visibility events.',
    checks: { trueHiddenSameWindow: hidden, backgroundTimeExcluded: excluded },
    samples,
    cuaFallback: {
      status: 'UNAVAILABLE',
      getBrowser: 'No browser is available',
      getState: { apps: [], browsers: [] },
    },
    reason:
      hidden && excluded
        ? null
        : 'True same-window hidden state could not be established; clean CUA browser unavailable.',
  };
  fs.writeFileSync(
    path.join(out, 'native-tab-observation.json'),
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  fs.writeFileSync(
    path.join(out, 'native-tab-observation.json'),
    JSON.stringify({ status: 'FAIL', message: String(e), samples }, null, 2) + '\n',
  );
  throw e;
} finally {
  await browser?.close();
}
