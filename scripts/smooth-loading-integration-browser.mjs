import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { chromium, projectRoot } from './browser/paths.mjs';
import { alphaDatabaseName, ALPHA_COURSE_PREFERENCE_KEY } from '../src/persistence/alpha-namespace.ts';
import { restoreRateExample, rateProvider } from '../src/activities/alevel/rate-equations/provider.ts';
import { formulaeProvider } from '../src/activities/igcse/formulae/provider.ts';
import { questionDisplayCode } from '../src/content/question-display-identity.ts';

const base = process.env.SMOOTH_LOADING_APP_URL || 'http://127.0.0.1:5261';
const nativeMode = process.env.SMOOTH_NATIVE_TIMING === '1';
const systemTemporaryDirectory = os.tmpdir();
const out = path.join(projectRoot, `.artifacts/smooth-loading/${nativeMode ? 's3-native' : 's2-integration'}`);
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = path.join(out, '.tmp'); process.env.TMP = process.env.TEMP;
const selectedCases = new Set((process.env.SMOOTH_LOADING_CASES || '').split(',').filter(Boolean));
if (nativeMode && !selectedCases.size) for (const course of ['alevel','igcse']) selectedCases.add(`${course}-native-lifecycle`);
function sourceFingerprints() {
  const files = [];
  function walk(relative) {
    for (const entry of fs.readdirSync(path.join(projectRoot, relative), { withFileTypes: true })) {
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) files.push(child);
    }
  }
  walk('src'); files.push('index.html');
  return Object.fromEntries(files.sort().map(relative => [relative.replaceAll('\\', '/'),
    crypto.createHash('sha256').update(fs.readFileSync(path.join(projectRoot, relative))).digest('hex')]));
}
const report = {
  jobId: nativeMode ? 'SL-S3-NATIVE-LIFECYCLE' : 'SL-S2-INTEGRATION-TESTS', agentId: 'A03', startedAt: new Date().toISOString(),
  checks: [], failures: [], pageErrors: [], specialistEvidence: [], moduleLoadRequests: [],
  sourceFingerprints: sourceFingerprints(),
  limits: [nativeMode ? 'Owned isolated onscreen Edge via pinned Playwright CDP noDefaults; actual visibility/focus and wall-clock idle, no property or clock replacement. Real event-loop suspension is exercised; native OS sleep is not claimed. Optional same-document CDP freeze/resume capability is separately retained as UNESTABLISHED.'
    : 'Headless foreground Edge only; native hidden/background, idle and suspension gates belong to S3.',
    'DEV request delays exercise real integrated navigation; specialized per-family content/editor coverage is linked separately.',
    'No production budget, release, deployment or protected-original acceptance is inferred from this browser suite.'],
};
let nativeChild;
async function launchNative() {
  const port = 9396, profile = fs.mkdtempSync(path.join(systemTemporaryDirectory,'masters-native-'));
  nativeChild = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1',
    '--disable-sync','--disable-features=msImplicitSignin,msEdgeSync,msEdgeFirstRunExperience',
    '--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking',
    '--disable-gpu','--window-position=80,80','--window-size=1440,1000','about:blank',
  ], { stdio: ['ignore','ignore','pipe'], windowsHide: false });
  let launchError;
  nativeChild.once('error', error => { launchError = error; });
  nativeChild.stderr.on('data', bytes => fs.appendFileSync(path.join(out,'native-stderr.log'),bytes));
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (launchError) throw launchError;
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve,250));
  }
  assert(ready, 'Owned native Edge endpoint did not start');
  const connected = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { noDefaults: true, isLocal: true, artifactsDir: out });
  const foregroundCommand = `
$ownedProcess=Get-Process -Id ${nativeChild.pid} -ErrorAction Stop
$ownedProcess.Refresh()
if ($ownedProcess.ProcessName -ne 'msedge') { throw 'Only owned Edge may be activated' }
$ownedHandle=$ownedProcess.MainWindowHandle
if ($ownedHandle -eq 0) { throw 'Owned Edge has no native main window handle' }
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public static class OwnedSmoothEdgeWindow {
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr handle,int command);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr handle);
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr handle,IntPtr after,int x,int y,int width,int height,uint flags);
}
"@
$restored=[OwnedSmoothEdgeWindow]::ShowWindow($ownedHandle,9)
$raised=[OwnedSmoothEdgeWindow]::SetWindowPos($ownedHandle,[IntPtr](-1),0,0,0,0,3)
$foreground=[OwnedSmoothEdgeWindow]::SetForegroundWindow($ownedHandle)
$lowered=[OwnedSmoothEdgeWindow]::SetWindowPos($ownedHandle,[IntPtr](-2),0,0,0,0,3)
@{pid=$ownedProcess.Id;handle=$ownedHandle.ToInt64();restore=$restored;raise=$raised;foreground=$foreground;releaseTopmost=$lowered}|ConvertTo-Json -Compress
`;
  const foreground = spawnSync('powershell.exe', ['-NoProfile','-ExecutionPolicy','Bypass','-Command',foregroundCommand],
    { encoding: 'utf8', windowsHide: true });
  report.nativeLaunch = { pid: nativeChild.pid, profile, noDefaults: true,
    foreground: { status: foreground.status, stdout: foreground.stdout, stderr: foreground.stderr } };
  assert.equal(foreground.status, 0, 'Owned native window foreground action failed');
  return connected;
}
const browser = await (nativeMode ? launchNative() : chromium.launch({ channel: 'msedge', headless: true })).catch(error => {
  report.status = 'FAIL'; report.failures.push({ name: 'browser-startup', error: error.stack });
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  nativeChild?.kill(); throw error;
});
report.browser = await browser.version();
let page, activeContext, currentRun;

async function fixture(name, course = 'alevel', options = {}) {
  currentRun = `smooth-s2-${name}-${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  activeContext = nativeMode ? browser.contexts()[0] : await browser.newContext({
    viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 1050 },
    reducedMotion: options.motion ? 'no-preference' : 'reduce',
    ...(options.mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 1 } : {}),
  });
  await activeContext.addInitScript(() => {
    window.__smoothIntegration = { paragraphs: [], maxBars: 0, maxPlayers: 0, samples: [], observer: null };
    const start = () => {
      const audit = () => {
        const state = window.__smoothIntegration;
        for (const p of document.querySelectorAll('#loading-surface p')) {
          const text = p.textContent.trim();
          if (/^(?:Loading|Reading saved|Opening (?:saved |selected )?question)/.test(text) && !state.paragraphs.includes(text)) state.paragraphs.push(text);
        }
        state.maxPlayers = Math.max(state.maxPlayers, document.querySelectorAll('#loading-surface .question-player').length);
      };
      const observer = new MutationObserver(audit);
      observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
      window.__smoothIntegration.observer = observer;
      const frame = () => {
        const state = window.__smoothIntegration;
        const bars = [...document.querySelectorAll('#loading-bootstrap,[data-testid="loading-bar"]')].filter(el => {
          const style = getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && el.getBoundingClientRect().height > 0;
        }).length;
        state.maxBars = Math.max(state.maxBars, bars);
        if (state.samples.length < 2500) state.samples.push({ at: performance.now(), bars,
          pending: window.__mastersLoading?.snapshot().pending ?? null });
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
  });
  if (options.bootstrapDelay) await activeContext.route('**/src/main.tsx*', async route => {
    await new Promise(resolve => setTimeout(resolve, 900)); await route.continue();
  });
  page = nativeMode && activeContext.pages().length ? activeContext.pages()[0] : await activeContext.newPage(); page.setDefaultTimeout(20000);
  if (nativeMode) await page.addInitScript(() => {
    window.__smoothNative = { token: crypto.randomUUID(), events: [] };
    const record = event => window.__smoothNative.events.push({ type: event.type, trusted: event.isTrusted,
      wall: Date.now(), mono: performance.now(), hidden: document.hidden, focused: document.hasFocus(),
      token: window.__smoothNative.token, origin: performance.timeOrigin,
      attempt: window.__mastersActivity?.snapshot().attempt });
    for (const type of ['keydown','input','pointerdown','visibilitychange','freeze','resume']) document.addEventListener(type,record,{capture:true,passive:true});
    for (const type of ['focus','blur','pagehide','pageshow']) window.addEventListener(type,record,{capture:true,passive:true});
  });
  page.on('pageerror', error => report.pageErrors.push({ name, error: error.message }));
  const url = new URL(options.url || '/', base);
  url.searchParams.set('course', course); url.searchParams.set('run', currentRun);
  if (nativeMode) await page.bringToFront();
  await page.goto(url.href, { waitUntil: options.bootstrapDelay ? 'commit' : 'load' });
  if (!options.bootstrapDelay) await settled();
  return { course, run: currentRun, url: url.href };
}

async function settled(selector) {
  await page.waitForFunction(() => window.__mastersLoading && !window.__mastersLoading.snapshot().pending && !window.__mastersLoading.snapshot().error,
    undefined,{polling:nativeMode ? 250 : 'raf'});
  if (selector) await page.locator(selector).waitFor({ state: 'visible' });
  assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), false);
}
async function home(course) { await settled(`.original-landing.${course}.navigation-ready`); }
async function focusOnDestination() {
  await page.waitForFunction(() => {
    const active = document.activeElement, surface = document.getElementById('loading-surface');
    return surface?.contains(active) && ['H1','H2'].includes(active?.tagName);
  });
}
async function noFlashes() {
  const state = await page.evaluate(() => ({ paragraphs: window.__smoothIntegration.paragraphs,
    maxBars: window.__smoothIntegration.maxBars, maxPlayers: window.__smoothIntegration.maxPlayers }));
  assert.deepEqual(state.paragraphs, [], 'an intermediate loading paragraph was rendered');
  assert(state.maxBars <= 1, `duplicate visible loading bars: ${state.maxBars}`);
  assert(state.maxPlayers <= 1, `multiple question players mounted: ${state.maxPlayers}`);
  return state;
}
async function delay(scope = 'screen', ms = 650) { await page.evaluate(({ scope, ms }) => window.__mastersLoading.delay(scope, ms), { scope, ms }); }
async function retained(selector, oldURL, options = {}) {
  await page.waitForFunction(() => window.__mastersLoading.snapshot().pending);
  assert.equal(await page.locator(selector).count(), 1);
  assert.equal(await page.locator(selector).evaluate(el => Number(getComputedStyle(el).opacity)), 1, 'outgoing screen faded during preparation');
  assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), true);
  assert.equal(await page.locator('#loading-surface').getAttribute('aria-busy'), 'true');
  if (!options.popstate) assert.equal(page.url(), oldURL, 'click-created URL committed before readiness');
  const scroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
  await page.locator('[data-testid="loading-bar"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-testid="loading-bar"]').count(), 1);
  assert.equal(await page.locator('[data-testid="loading-bar"]').evaluate(el => Math.round(el.getBoundingClientRect().height)), 3);
  assert.deepEqual(await page.evaluate(() => ({ x: scrollX, y: scrollY })), scroll, 'outgoing scroll moved during preparation');
  if (options.dialog) assert.equal(await page.locator('#gemDetails').evaluate(el => el.inert), true, 'top-layer outgoing dialog escaped inert');
}
async function backHome(course) {
  if (await page.locator('button.question-back[aria-label="Back to course map"]').count()) {
    await page.locator('button.question-back[aria-label="Back to course map"]').click();
  } else if (await page.getByRole('button', { name: 'Back to A Level landing', exact: true }).count()) {
    await page.getByRole('button', { name: 'Back to A Level landing', exact: true }).click();
  } else await page.getByRole('button', { name: 'Home', exact: true }).click();
  await home(course);
}
async function openGem(course, options = {}) {
  if (course === 'alevel') {
    const upper = page.getByRole('switch', { name: 'Upper Sixth', exact: true });
    if (await upper.getAttribute('aria-checked') !== 'true') await upper.click();
  }
  const topicId = course === 'alevel' ? 'u6-t1-topic-2' : 'fourth-topic-16';
  const topic = page.locator(`[data-topic="${topicId}"] .topic-trigger`);
  if (await topic.getAttribute('aria-expanded') !== 'true') await topic.click();
  const gemId = course === 'alevel' ? 'u6-t1-2-orders' : 'fourth-16-1';
  if (options.delay) await delay('tool');
  const oldURL = page.url();
  await page.locator(`[data-leaf="${gemId}"]`).click();
  if (options.delay) await retained(`.original-landing.${course}`, oldURL, { popstate: true }); // gem hash is established by the map interaction
  await settled('#gemDetails[open]');
  return gemId;
}
async function practice(course, options = {}) {
  await openGem(course, options);
  if (options.screenDelay) await delay();
  const oldURL = page.url();
  await page.locator('[data-practice="1"]').click();
  if (options.screenDelay) await retained(`.original-landing.${course}`, oldURL, { dialog: true });
  await activityReady();
}
async function activityReady() {
  await settled('.question-player');
  await page.waitForFunction(() => window.__mastersActivity?.snapshot().attempt);
  await page.evaluate(() => window.__mastersActivity.flush());
  assert.equal(await page.locator('.practice-setup').count(), 0);
}
async function snapshot() { return page.evaluate(() => window.__mastersActivity.snapshot()); }
async function rows(course, run = currentRun) {
  return page.evaluate(async name => {
    const db = await new Promise((resolve, reject) => { const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try {
      const result = {};
      for (const table of ['attempts','evidence','sessions','recallAttempts','recallEvidence','olympiad']) {
        result[table] = db.objectStoreNames.contains(table) ? await new Promise((resolve, reject) => {
          const request = db.transaction(table).objectStore(table).getAll();
          request.onsuccess = () => resolve(request.result.map(row => row.value)); request.onerror = () => reject(request.error);
        }) : [];
      }
      return result;
    } finally { db.close(); }
  }, alphaDatabaseName(course, run));
}
async function assertTeacherZero(course) {
  const state = await rows(course);
  for (const table of ['attempts','evidence','sessions','recallAttempts','recallEvidence']) assert.equal(state[table].length, 0, `teacher created ${table}`);
}
async function run(name, body) {
  if (selectedCases.size && !selectedCases.has(name)) return;
  try {
    const details = await body();
    const audit = await noFlashes();
    report.checks.push({ name, status: 'PASS', ...details, audit }); console.log(`PASS ${name}`);
  } catch (error) {
    const state = await page?.evaluate(() => {
      const loading = window.__mastersLoading?.snapshot(), active = document.activeElement;
      return { url: location.href, loading: loading ? { pending: loading.pending, visible: loading.visible,
        error: loading.error ? { name: loading.error.name, message: loading.error.message } : null,
        ticket: loading.ticket ? { id: loading.ticket.id, scope: loading.ticket.scope } : null } : null,
        paragraphs: window.__smoothIntegration?.paragraphs,
        active: active ? { tag: active.tagName, id: active.id, class: active.className, label: active.getAttribute('aria-label') } : null };
    }).catch(() => null);
    report.failures.push({ name, error: error.stack, state }); console.error(`FAIL ${name}: ${error.message}`);
    await page?.screenshot({ path: path.join(out, `${name}-failure.png`), fullPage: true }).catch(() => {});
  } finally {
    if (!nativeMode) await activeContext?.close(); activeContext = null;
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
}

try {
  for (const course of ['alevel','igcse']) {
    await run(`${course}-main-views`, async () => {
      await fixture(`${course}-views`, course); await home(course);
      const destinations = [
        { trigger: '#recallTile', selector: '.recall-view', view: 'recall' },
        { trigger: '#statsTile', selector: '.statistics-screen', view: 'statistics' },
        { button: 'Import progress', selector: '.legacy-import', view: 'import' },
        { button: 'Teacher', selector: '.teacher-picker', view: 'teacher' },
        ...(course === 'alevel' ? [{ trigger: '#olympiadTile', selector: '.olympiad-landing', view: 'olympiad' }] : []),
      ];
      const visits = [];
      for (const destination of destinations) {
        await delay(); const before = page.url();
        if (destination.trigger) await page.locator(destination.trigger).click();
        else await page.getByRole('button', { name: destination.button, exact: true }).click();
        await retained(`.original-landing.${course}`, before);
        await settled(destination.selector); await focusOnDestination();
        assert.equal(new URL(page.url()).searchParams.get('view'), destination.view);
        assert.equal(new URL(page.url()).searchParams.get('course'), course);
        if (destination.view === 'teacher') { await page.locator('.teacher-answer').waitFor(); await assertTeacherZero(course); }
        await page.screenshot({ path: path.join(out, `${course}-${destination.view}-desktop.png`), fullPage: true });
        visits.push(destination.view); await backHome(course);
      }
      await page.locator('#testModeTile').click();
      await page.locator('#testSelection').waitFor();
      assert.match(await page.locator('#testSelectionCount').textContent(), /0 gems selected/);
      await page.locator('#testCancel').click();
      await delay('screen', 0);
      await page.getByRole('button', { name: 'Import progress', exact: true }).click(); await settled('.legacy-import');
      await page.getByRole('navigation', { name: 'Course views' }).getByRole('button', { name: /^practice$/i }).click();
      await settled('.practice-setup');
      const outgoingSetupTitle = await page.locator('.practice-setup h2').textContent();
      await delay(); const setupURL = page.url();
      await page.getByRole('navigation', { name: 'Course views' }).getByRole('button', { name: /^revision$/i }).click();
      await retained('.course-shell', setupURL);
      assert.equal(await page.locator('.practice-setup h2').textContent(), outgoingSetupTitle,
        'platform navigation changed outgoing setup metadata before readiness');
      await settled('.practice-setup');
      assert.match(await page.locator('.practice-setup h2').textContent(), /revision/i);
      await page.getByRole('navigation', { name: 'Course views' }).getByRole('button', { name: /^recall$/i }).click();
      await settled('.recall-view'); await backHome(course);
      await delay('screen', 0);
      await page.evaluate(() => {
        window.__smoothIntegration.warmEvents = [];
        window.__smoothIntegration.stopWarm = window.__mastersLoading.subscribe(() => {
          const state = window.__mastersLoading.snapshot();
          window.__smoothIntegration.warmEvents.push({ at: performance.now(), pending: state.pending, visible: state.visible });
        });
      });
      await page.locator('#statsTile').click(); await settled('.statistics-screen');
      const warm = await page.evaluate(() => { window.__smoothIntegration.stopWarm(); return window.__smoothIntegration.warmEvents; });
      const warmDurationMs = warm.at(-1).at - warm[0].at;
      const warmVisible = warm.find(event => event.visible);
      if (warmDurationMs < 200) assert.equal(!!warmVisible, false, 'fast warm statistics flashed a loading bar');
      if (warmVisible) assert(warmVisible.at - warm[0].at >= 199, 'warm statistics showed the bar before its 200ms delay');
      await backHome(course);
      return { course, visits, revisionChooser: true, platformNavigation: ['practice','revision','recall'],
        warmStatistics: { durationMs: warmDurationMs, barSeen: !!warmVisible, delayPolicyValid: true } };
    });

    await run(`${course}-gem-menu-native-dialog`, async () => {
      await fixture(`${course}-menu`, course); await home(course);
      const gemId = await openGem(course, { delay: true });
      await page.evaluate(() => window.__mastersLoading.failNext('screen'));
      await page.locator('[data-practice="1"]').click();
      await page.locator('[data-testid="loading-cancel"]').waitFor();
      assert.equal(await page.locator('#gemDetails').evaluate(el => el.open && el.inert), true);
      assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), true);
      await page.locator('[data-testid="loading-cancel"]').click();
      await settled('#gemDetails[open]');
      assert.equal(await page.locator('#gemDetails').evaluate(el => el.inert), false);
      await page.evaluate(() => window.__mastersLoading.failNext('screen'));
      await page.locator('[data-practice="1"]').click();
      await page.locator('[data-testid="loading-cancel"]').waitFor();
      await page.keyboard.press('Escape');
      await settled('#gemDetails[open]');
      assert.equal(await page.locator('#gemDetails').evaluate(el => el.inert), false);
      await delay(); const before = page.url();
      await page.locator('[data-practice="1"]').click();
      await retained(`.original-landing.${course}`, before, { dialog: true });
      await activityReady(); await focusOnDestination();
      const current = await snapshot(); assert.equal(current.attempt.target.gemId, gemId);
      const saved = await rows(course); assert.equal(saved.attempts.length, 1); assert.equal(saved.evidence.length, 0);
      return { gemId, nativeDialogCancelAccessible: true, nativeDialogEscapeCancelRetained: true, attempts: 1, evidence: 0 };
    });

    await run(`${course}-revision-add-all-launch`, async () => {
      await fixture(`${course}-revision`, course); await home(course);
      if (course === 'alevel') {
        const upper = page.getByRole('switch', { name: 'Upper Sixth', exact: true });
        if (await upper.getAttribute('aria-checked') !== 'true') await upper.click();
      }
      await page.locator('#testModeTile').click();
      const topicId = course === 'alevel' ? 'u6-t1-topic-2' : 'fourth-topic-16';
      await page.locator(`[data-topic="${topicId}"] .test-topic-all`).click();
      assert.match(await page.locator('#testSelectionCount').textContent(), course === 'alevel' ? /4 gems selected/ : /2 gems selected/);
      await delay(); const before = page.url(); await page.locator('#testStart').click();
      await retained(`.original-landing.${course}`, before);
      await activityReady(); const current = await snapshot();
      assert.equal(current.session.kind, 'revision');
      assert.equal(current.attempt.target.course, course);
      assert.equal((await rows(course)).evidence.length, 0);
      const id = current.attempt.attemptId; await page.reload(); await activityReady();
      assert.equal((await snapshot()).attempt.attemptId, id);
      return { course, sameAttemptReload: id, targetCount: current.session.levels.length };
    });

    await run(`${course}-teacher-deep-link-zero-evidence`, async () => {
      const ref = course === 'alevel'
        ? rateProvider.select({ activityId: 'alevel/rate-equations', gemId: 'u6-t1-2-orders', level: 1, seed: 123, previousQuestionIds: [] })
        : formulaeProvider.select({ activityId: 'igcse/formulae', gemId: 'fourth-16-1', level: 1, seed: 123, previousQuestionIds: [] });
      const url = new URL('/', base);
      for (const [key,value] of Object.entries({ view: 'teacher', mode: 'teacher', activity: ref.activityId,
        review: questionDisplayCode({course,...ref}), seed: String(ref.seed), level: String(ref.level) })) url.searchParams.set(key, value);
      await fixture(`${course}-teacher`, course, { url: url.href });
      await settled('.teacher-answer'); await focusOnDestination();
      await assertTeacherZero(course); await page.reload(); await settled('.teacher-answer'); await assertTeacherZero(course);
      return { course, ref, stableTeacherReload: true, independentEvidence: 0 };
    });

    await run(`${course}-mobile-layout-focus`, async () => {
      await fixture(`${course}-mobile`, course, { mobile: true }); await home(course);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'landing overflowed the mobile viewport');
      await page.screenshot({ path: path.join(out, `${course}-home-mobile.png`), fullPage: true });
      await practice(course, { delay: true, screenDelay: true }); await focusOnDestination();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), 'question overflowed the mobile viewport');
      await page.screenshot({ path: path.join(out, `${course}-question-mobile.png`), fullPage: true });
      return { course, viewport: { width: 390, height: 844 }, horizontalOverflow: false };
    });
  }

  await run('rapid-back-forward-course-latest-wins', async () => {
    await fixture('history'); await home('alevel');
    await page.locator('#recallTile').click(); await settled('.recall-view');
    const recallURL = page.url(); await backHome('alevel'); const homeURL = page.url();
    await page.locator('#statsTile').click(); await settled('.statistics-screen');
    const length = await page.evaluate(() => history.length);
    await delay('screen', 1000);
    await page.evaluate(() => history.back());
    await page.waitForFunction(() => window.__mastersLoading.snapshot().pending);
    const firstId = await page.evaluate(() => window.__mastersLoading.snapshot().ticket.id);
    await page.evaluate(() => history.back());
    await page.waitForFunction(id => window.__mastersLoading.snapshot().ticket?.id > id, firstId);
    const secondId = await page.evaluate(() => window.__mastersLoading.snapshot().ticket.id);
    await page.evaluate(() => history.forward());
    await page.waitForFunction(id => window.__mastersLoading.snapshot().ticket?.id > id, secondId);
    await home('alevel'); assert.equal(page.url(), homeURL);
    assert.equal(await page.evaluate(() => history.length), length, 'successful popstate added a history entry');
    await page.evaluate(() => history.back()); await settled('.recall-view'); assert.equal(page.url(), recallURL);
    await page.evaluate(() => history.forward()); await home('alevel');
    await delay('screen', 1000); const before = page.url();
    await page.getByRole('switch', { name: 'A Level Chemistry', exact: true }).click();
    await retained('.original-landing.alevel', before);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), ALPHA_COURSE_PREFERENCE_KEY), 'alevel');
    await page.evaluate(() => history.back()); await settled('.recall-view');
    assert.equal(new URL(page.url()).searchParams.get('course'), 'alevel');
    await page.evaluate(() => history.forward()); await home('alevel');
    await delay('screen', 0); await page.getByRole('switch', { name: 'A Level Chemistry', exact: true }).click(); await home('igcse');
    assert.equal(new URL(page.url()).searchParams.get('course'), 'igcse');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), ALPHA_COURSE_PREFERENCE_KEY), 'igcse');
    return { repeatedPopstate: true, latestCourse: 'igcse', unchangedHistoryLengthOnPop: true };
  });

  await run('initial-bootstrap-handover-reduced-motion', async () => {
    await fixture('bootstrap', 'alevel', { bootstrapDelay: true });
    await page.locator('.loading-initial img').waitFor();
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(8, 19, 28)');
    assert.equal(await page.locator('#loading-bootstrap').evaluate(el => getComputedStyle(el).animationDelay), '0.2s');
    await page.waitForFunction(() => Number(getComputedStyle(document.getElementById('loading-bootstrap')).opacity) === 1);
    await page.screenshot({ path: path.join(out, 'initial-bootstrap.png') });
    await home('alevel'); await focusOnDestination();
    assert.equal(await page.locator('#loading-bootstrap').count(), 0);
    await delay(); const before = page.url(); await page.locator('#statsTile').click();
    await retained('.original-landing.alevel', before);
    const animation = await page.locator('[data-testid="loading-bar"]').evaluate(el => getComputedStyle(el, '::after').animationName);
    assert.equal(animation, 'none'); await settled('.statistics-screen');
    return { initialDelayCSS: '0.2s', reducedMotionAnimation: animation, brandedInitialScreen: true };
  });

  await run('animated-bar-preference', async () => {
    await fixture('motion', 'igcse', { motion: true }); await home('igcse'); await delay();
    const before = page.url(); await page.locator('#statsTile').click(); await retained('.original-landing.igcse', before);
    assert.equal(await page.locator('[data-testid="loading-bar"]').evaluate(el => getComputedStyle(el, '::after').animationName), 'loading-sweep');
    await settled('.statistics-screen'); return { animation: 'loading-sweep' };
  });

  await run('real-module-failure-retained-screen-recovery', async () => {
    await fixture('module-failure'); await home('alevel');
    let requests = 0;
    await activeContext.route('**/src/recall/RecallView.tsx*', async route => {
      requests++;
      report.moduleLoadRequests.push({ url: route.request().url(), ordinal: requests });
      if (requests === 1) await route.abort('failed'); else await route.continue();
    });
    const before = page.url(); await page.locator('#recallTile').click();
    await page.getByRole('button', { name: 'Reload app', exact: true }).waitFor();
    assert.equal(page.url(), before);
    assert.equal(await page.locator('.original-landing.alevel').count(), 1);
    assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), true);
    assert.equal(await page.locator('[data-testid="loading-bar"]').count(), 0);
    assert.equal(await page.locator('.recall-view').count(), 0);
    assert.equal(await page.locator('[data-testid="loading-retry"]').count(), 0,
      'A browser-cached module failure must not offer an ineffective in-place Retry');
    await page.locator('[data-testid="loading-cancel"]').click();
    await home('alevel'); assert.equal(page.url(), before);
    await page.locator('#recallTile').click();
    await page.getByRole('button', { name: 'Reload app', exact: true }).waitFor();
    assert.equal(page.url(), before);
    await Promise.all([
      page.waitForEvent('load'),
      page.getByRole('button', { name: 'Reload app', exact: true }).click(),
    ]);
    await home('alevel'); assert.equal(page.url(), before,
      'Reload without a validated pending identity must restore the committed route');
    const afterReload = await rows('alevel');
    assert.equal(afterReload.attempts.length, 0); assert.equal(afterReload.evidence.length, 0);
    await page.locator('#recallTile').click();
    await settled('.recall-view'); await focusOnDestination();
    assert(requests >= 2, 'Reload did not permit a fresh request for the failed module');
    return { failedRealModuleRequest: true, requests, retainedScreen: true,
      cancelRestoredCommittedRoute: true, labelledReloadRecovered: true, attemptsAfterReload: 0, evidenceAfterReload: 0 };
  });

  await run('restore-next-first-evidence-and-stats-time', async () => {
    await fixture('evidence'); await home('alevel'); await practice('alevel');
    const initial = await snapshot(); await page.locator('.question-player').click({ position: {x: 5,y: 5} }); await page.waitForTimeout(1100);
    const example = restoreRateExample(initial.question.ref);
    for (const [partId,response] of Object.entries(example.correctResponses))
      await page.evaluate(({partId,response}) => window.__mastersActivity.respond(partId,response), {partId,response});
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.waitForFunction(() => window.__mastersActivity.snapshot().attempt.phase === 'assessed');
    await page.evaluate(() => window.__mastersActivity.flush());
    const first = await snapshot(), firstTime = first.attempt.firstResponse.timing.activeMs;
    assert(firstTime > 0, 'foreground first assessment must retain actual measured active time');
    assert.equal((await rows('alevel')).evidence.length, 1);
    await page.reload(); await activityReady();
    assert.equal((await snapshot()).attempt.attemptId, initial.attempt.attemptId);
    assert.deepEqual((await snapshot()).attempt.firstResponse.timing, first.attempt.firstResponse.timing);
    await delay('question'); const previousId = initial.attempt.attemptId;
    await page.getByRole('button', { name: 'Next', exact: true }).click(); await retained('.question-player', page.url());
    assert.equal((await snapshot()).attempt.attemptId, previousId); await activityReady();
    assert.notEqual((await snapshot()).attempt.attemptId, previousId);
    assert.equal((await rows('alevel')).attempts.length, 2); assert.equal((await rows('alevel')).evidence.length, 1);
    await backHome('alevel'); await page.locator('#statsTile').click(); await settled('.statistics-screen');
    await page.getByTestId('statistics-time').waitFor();
    assert.equal(Number(await page.getByTestId('statistics-time').getAttribute('data-active-ms')), firstTime);
    assert.equal(await page.getByTestId('statistics-total').textContent(), '1');
    await page.screenshot({ path: path.join(out, 'first-evidence-stats.png'), fullPage: true });
    return { firstAttempt: previousId, activeMs: firstTime, exactStatsTransfer: true, independentEvidence: 1, attemptsAfterNext: 2 };
  });

  await run('real-module-failure-durable-reload', async () => {
    await fixture('durable-reload'); await home('alevel'); await practice('alevel');
    const original = await snapshot();
    const example = restoreRateExample(original.question.ref);
    const [partId, response] = Object.entries(example.correctResponses)[0];
    await page.evaluate(({partId,response}) => window.__mastersActivity.respond(partId,response), {partId,response});
    await page.evaluate(() => window.__mastersActivity.flush());
    const draft = (await snapshot()).attempt.currentResponses, committedURL = page.url();
    const focusedSelector = '.question-player button:not([disabled])';
    await page.locator(focusedSelector).first().focus();
    assert.equal(await page.locator(focusedSelector).first().evaluate(el => el === document.activeElement),true);
    await delay('screen',650);
    await activeContext.route('**/src/recall/RecallView.tsx*', route => route.abort('failed'));
    // Prime a previous SPA entry without mounting Recall, then use real browser history.
    await page.evaluate(() => {
      const committed = location.href, recall = new URL(location.href);
      recall.search = ''; recall.searchParams.set('course','alevel');
      recall.searchParams.set('run',new URL(committed).searchParams.get('run'));
      recall.searchParams.set('view','recall');
      history.replaceState(null,'',recall); history.pushState(null,'',committed); history.back();
    });
    await page.waitForFunction(() => window.__mastersLoading.snapshot().pending);
    const firstIntent = await page.evaluate(() => window.__mastersLoading.snapshot().ticket.id);
    await page.evaluate(() => history.forward());
    await page.waitForFunction(id => window.__mastersLoading.snapshot().ticket?.id > id,firstIntent);
    const secondIntent = await page.evaluate(() => window.__mastersLoading.snapshot().ticket.id);
    await page.evaluate(() => history.back());
    await page.waitForFunction(id => window.__mastersLoading.snapshot().ticket?.id > id,secondIntent);
    await page.getByRole('button', { name: 'Reload app', exact: true }).waitFor();
    assert.equal((await snapshot()).attempt.attemptId, original.attempt.attemptId);
    await page.locator('[data-testid="loading-cancel"]').click(); await activityReady();
    assert.equal(page.url(),committedURL,'Cancel after failed Back preparation must restore the committed activity URL');
    assert.equal((await snapshot()).attempt.attemptId,original.attempt.attemptId);
    assert.deepEqual((await snapshot()).attempt.currentResponses,draft);
    await page.waitForFunction(selector => document.querySelector(selector) === document.activeElement,
      focusedSelector,{timeout:1500,polling:50});
    await page.evaluate(() => {
      const committed = location.href, recall = new URL(location.href);
      recall.search = ''; recall.searchParams.set('course','alevel');
      recall.searchParams.set('run',new URL(committed).searchParams.get('run'));
      recall.searchParams.set('view','recall');
      history.replaceState(null,'',recall); history.pushState(null,'',committed); history.back();
    });
    await page.getByRole('button', { name: 'Reload app', exact: true }).waitFor();
    await page.evaluate(() => {
      const put = IDBObjectStore.prototype.put;
      window.__smoothIntegration.reloadDocument = crypto.randomUUID();
      window.__smoothIntegration.failSession = true; window.__smoothIntegration.sessionFaults = 0;
      IDBObjectStore.prototype.put = function(...args) {
        if (this.name === 'sessions' && window.__smoothIntegration.failSession) {
          window.__smoothIntegration.sessionFaults++;
          throw new DOMException('Actual sessions put denied for Reload gate', 'QuotaExceededError');
        }
        return put.apply(this,args);
      };
    });
    const documentMarker = await page.evaluate(() => window.__smoothIntegration.reloadDocument);
    await page.getByRole('button', { name: 'Reload app', exact: true }).click();
    await page.locator('[data-testid="loading-retry"]').waitFor();
    assert.equal(await page.evaluate(() => window.__smoothIntegration.reloadDocument), documentMarker,
      'Failed durable resume incorrectly navigated the document');
    const faultCount = await page.evaluate(() => window.__smoothIntegration.sessionFaults);
    assert(faultCount > 0, 'The real sessions object-store put was not reached');
    assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), true);
    assert.equal((await snapshot()).attempt.attemptId, original.attempt.attemptId);
    await page.evaluate(() => { window.__smoothIntegration.failSession = false; });
    await Promise.all([page.waitForEvent('load'), page.locator('[data-testid="loading-retry"]').click()]);
    await activityReady(); assert.equal(page.url(), committedURL);
    const restored = await snapshot(); assert.equal(restored.attempt.attemptId, original.attempt.attemptId);
    assert.deepEqual(restored.attempt.currentResponses, draft);
    assert.equal(restored.attempt.phase, 'answering');
    const saved = await rows('alevel'); assert.equal(saved.attempts.length, 1); assert.equal(saved.evidence.length, 0);
    return { actualFailedModuleFetch: true, supersededBackForwardCancelRestoredOriginalControl: true,
      backFailureCancelRestoredCommittedActivityRoute: true,
      actualSessionPutFaults: faultCount, rejectedReloadRetainedInert: true,
      sameAttemptAfterGuardedRetryAndReload: true, draftRestored: true, committedActivityRouteRestored: true, independentEvidence: 0 };
  });

  if (nativeMode) for (const course of ['alevel','igcse']) await run(`${course}-native-lifecycle`, async () => {
    await fixture(`${course}-native`,course); await home(course); await practice(course);
    await page.bringToFront();
    const cdp = await activeContext.newCDPSession(page), observations = [], phases = [];
    async function observe(label) {
      await page.evaluate(async () => { await window.__mastersActivity.checkpoint(); await window.__mastersActivity.flush(); });
      const observation = await page.evaluate(label => ({ label, wall: Date.now(), hidden: document.hidden,
        focused: document.hasFocus(), token: window.__smoothNative.token, origin: performance.timeOrigin,
        attempt: window.__mastersActivity.snapshot().attempt, events: window.__smoothNative.events }), label);
      observations.push(observation);
      fs.writeFileSync(path.join(out,`${course}-observations.json`),JSON.stringify(observations,null,2)+'\n');
      return observation;
    }
    async function trustedRestart() {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => ({ hidden: document.hidden, focused: document.hasFocus(),
        trusted: window.__smoothNative.events.some(event => event.type === 'keydown' && event.trusted) }));
      assert.equal(state.hidden,false); assert.equal(state.focused,true); assert.equal(state.trusted,true);
    }
    await trustedRestart(); await page.waitForTimeout(1300);
    const foreground = await observe('foreground after trusted interaction');
    assert(foreground.attempt.timing.activeMs > 0);
    const other = await activeContext.newPage(); await other.goto('about:blank'); await other.bringToFront();
    await page.waitForFunction(() => document.hidden && !document.hasFocus(),undefined,{polling:250});
    await page.waitForTimeout(400); const hidden = await observe('actual native hidden background tab');
    assert(hidden.events.some(event => event.type === 'visibilitychange' && event.trusted && event.hidden && event.wall >= foreground.wall));
    await page.waitForTimeout(2600); const hiddenPlateau = await observe('native hidden plateau');
    assert.equal(hiddenPlateau.attempt.attemptId,foreground.attempt.attemptId);
    assert.equal(hiddenPlateau.attempt.timing.activeMs,hidden.attempt.timing.activeMs);
    await page.bringToFront(); await page.waitForTimeout(1200);
    assert.equal((await observe('foreground alone does not resume timing')).attempt.timing.activeMs,hidden.attempt.timing.activeMs);
    await trustedRestart(); await page.waitForTimeout(1300);
    const restarted = await observe('trusted interaction restarts the same attempt');
    assert(restarted.attempt.timing.activeMs > hidden.attempt.timing.activeMs);
    assert.equal(restarted.attempt.attemptId,foreground.attempt.attemptId); await other.close();
    phases.push({ phase: 'native-hidden-background', hidden: true, trustedVisibility: true, plateauMs: 2600,
      sameAttempt: true, focusAloneDoesNotRestart: true });

    if (process.env.SMOOTH_NATIVE_FREEZE === '1') {
    const freezeBefore = await observe('before native browser freeze');
    await cdp.send('Page.setWebLifecycleState',{state:'frozen'});
    await new Promise(resolve => setTimeout(resolve,6600));
    await cdp.send('Page.setWebLifecycleState',{state:'active'});
    await page.waitForTimeout(1200); const thawed = await observe('after native browser resume');
    const freeze = thawed.events.find(event => event.type === 'freeze' && event.wall >= freezeBefore.wall);
    const resume = thawed.events.find(event => event.type === 'resume' && event.wall >= freezeBefore.wall);
    assert(freeze?.trusted && resume?.trusted,'Browser must emit actual trusted freeze/resume events');
    assert.equal(freeze.token,resume.token); assert.equal(freeze.origin,resume.origin);
    assert(resume.wall - freeze.wall >= 6500);
    assert.equal(thawed.attempt.attemptId,freezeBefore.attempt.attemptId);
    assert.equal(thawed.attempt.timing.activeMs,freezeBefore.attempt.timing.activeMs);
    phases.push({ phase: 'native-browser-freeze-resume', trusted: true, sameDocument: true,
      elapsedMs: resume.wall-freeze.wall, excludedActiveMs: true });
    } else phases.push({ phase: 'native-browser-freeze-resume', status:'UNESTABLISHED',
      evidence:'report-native-attempt-3.json', reason:'Installed Edge did not expose trusted same-document freeze/resume; strict original assertion and observations retained. No native OS sleep claim.' });

    await trustedRestart(); await page.waitForTimeout(1100);
    const stalledBefore = await observe('before real main-thread suspension gap'), wall = Date.now();
    await page.evaluate(() => { const end = performance.now() + 8000; while (performance.now() < end) {} });
    const stallElapsed = Date.now()-wall; await page.waitForTimeout(1200);
    const stalledAfter = await observe('after real main-thread suspension gap');
    assert(stallElapsed >= 7900);
    assert.equal(stalledAfter.attempt.timing.activeMs,stalledBefore.attempt.timing.activeMs);
    phases.push({ phase: 'actual-main-thread-suspension', elapsedMs: stallElapsed, excludedActiveMs: true, nativeOSSleep: false });

    await trustedRestart(); const idleStart = await observe('real idle allowance begins');
    const idleLimitMs = idleStart.attempt.timing.idleLimitMs;
    assert.equal(idleLimitMs,course === 'alevel' ? 300000 : 60000);
    for (let elapsed = 0; elapsed < idleLimitMs + 3000; elapsed += 10000) {
      await page.waitForTimeout(Math.min(10000,idleLimitMs+3000-elapsed));
      if ((elapsed + 10000) % 30000 === 0) console.log(`NATIVE ${course} real idle ${Math.min(elapsed+10000,idleLimitMs+3000)}/${idleLimitMs}ms`);
    }
    const idle = await observe('actual idle cutoff');
    assert.equal(idle.hidden,false); assert.equal(idle.focused,true);
    const idleDelta = idle.attempt.timing.activeMs-idleStart.attempt.timing.activeMs;
    assert(idleDelta >= idleLimitMs-2000 && idleDelta <= idleLimitMs+1000,
      `Real idle cutoff accrued ${idleDelta}ms for ${idleLimitMs}ms allowance`);
    await page.waitForTimeout(2500); const idlePlateau = await observe('actual idle plateau');
    assert.equal(idlePlateau.attempt.timing.activeMs,idle.attempt.timing.activeMs);
    phases.push({ phase: 'real-idle-cutoff', idleLimitMs, measuredDeltaMs: idleDelta, plateauMs: 2500 });

    await trustedRestart(); await page.waitForTimeout(1100); const saved = await observe('before pause and reload');
    const originalURL = page.url(); await backHome(course); await page.waitForTimeout(1700); await page.reload(); await home(course);
    await page.goto(originalURL); await activityReady(); await page.bringToFront();
    const restored = await snapshot(); assert.equal(restored.attempt.attemptId,saved.attempt.attemptId);
    assert(restored.attempt.timing.activeMs >= saved.attempt.timing.activeMs);
    assert(restored.attempt.timing.activeMs <= saved.attempt.timing.activeMs+1500);
    await trustedRestart();
    if (course === 'alevel') {
      const example = restoreRateExample(restored.question.ref);
      for (const [partId,response] of Object.entries(example.correctResponses))
        await page.evaluate(({partId,response}) => window.__mastersActivity.respond(partId,response),{partId,response});
    } else {
      await page.locator('input[data-answer-input]').fill(restored.question.parts[0].accepted[0]);
    }
    await page.getByRole('button',{name:'Check',exact:true}).click();
    await page.waitForFunction(() => window.__mastersActivity.snapshot().attempt.phase === 'assessed');
    await page.evaluate(() => window.__mastersActivity.flush());
    const assessed = await snapshot(), firstTime = assessed.attempt.firstResponse.timing.activeMs;
    assert(firstTime > 0); await page.waitForTimeout(1500);
    assert.deepEqual((await snapshot()).attempt.firstResponse,assessed.attempt.firstResponse);
    await page.reload(); await activityReady(); await page.bringToFront();
    assert.deepEqual((await snapshot()).attempt.firstResponse,assessed.attempt.firstResponse);
    await delay('question',650); await page.getByRole('button',{name:'Next',exact:true}).click();
    await retained('.question-player',page.url());
    assert.equal((await snapshot()).attempt.attemptId,saved.attempt.attemptId);
    await activityReady(); const next = await snapshot();
    assert.notEqual(next.attempt.attemptId,saved.attempt.attemptId);
    assert(next.attempt.timing.activeMs < 1500,'Next must start a fresh clock after readiness');
    const evidence = await rows(course); assert.equal(evidence.evidence.length,1);
    await backHome(course); await page.locator('#statsTile').click(); await settled('.statistics-screen');
    assert.equal(Number(await page.getByTestId('statistics-time').getAttribute('data-active-ms')),firstTime);
    await page.screenshot({path:path.join(out,`${course}-native-stats.png`),fullPage:true});
    phases.push({ phase: 'pause-reload-assess-next-stats', sameAttemptRestored: true,
      immutableFirstEvidence: true, independentEvidence: 1, activeMs: firstTime, freshNextAttempt: next.attempt.attemptId, exactStatsTransfer: true });
    fs.writeFileSync(path.join(out,`${course}-observations.json`),JSON.stringify(observations,null,2)+'\n');
    return { course, phases, observationPath: `${course}-observations.json`, noFocusOrVisibilityReplacement: true };
  });

  assert.deepEqual(report.pageErrors, []);
} catch (error) { report.failures.push({ name: 'suite', error: error.stack }); }
finally {
  const finishedFingerprints = sourceFingerprints();
  const sourceChanges = [...new Set([...Object.keys(report.sourceFingerprints), ...Object.keys(finishedFingerprints)])]
    .filter(file => report.sourceFingerprints[file] !== finishedFingerprints[file]);
  report.sourceStability = { status: sourceChanges.length ? 'FAIL' : 'PASS', files: Object.keys(finishedFingerprints).length, changed: sourceChanges };
  if (sourceChanges.length) report.failures.push({ name: 'source-stability', error: `Source changed during the browser run: ${sourceChanges.join(', ')}` });
  for (const relative of JSON.parse(process.env.SMOOTH_SPECIALIST_MANIFESTS || '[]')) {
    const resolved = path.resolve(projectRoot, relative);
    assert(resolved.startsWith(projectRoot + path.sep), 'Specialist evidence must remain inside the project');
    try {
      const bytes = fs.readFileSync(resolved), evidence = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
      report.specialistEvidence.push({ path: relative, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        status: evidence.status, checks: evidence.checks?.length, failures: evidence.failures?.length });
    } catch (error) { report.specialistEvidence.push({ path: relative, status: 'UNAVAILABLE', reason: error.message }); }
  }
  report.finishedAt = new Date().toISOString(); report.status = report.failures.length ? 'FAIL' : 'PASS';
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  if (!nativeMode) await activeContext?.close();
  if (nativeMode) await browser.newBrowserCDPSession().then(session => session.send('Browser.close')).catch(() => {});
  await browser.close().catch(() => {}); nativeChild?.kill();
  console.log(JSON.stringify({ status: report.status, passed: report.checks.length, failed: report.failures.length, report: path.join(out, 'report.json') }));
  if (report.status !== 'PASS') process.exitCode = 1;
}
