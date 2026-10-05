import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, relative } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '../../..');
const channel = process.argv[2] || 'chrome';
const exe = channel === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const run = `A07-background-${channel}-${Date.now()}`;
const profile = resolve(project, '.browser/A07', `${channel[0]}${Date.now().toString().slice(-7)}`);
const port = channel === 'edge' ? 9328 : 9327;
mkdirSync(here, { recursive: true });
mkdirSync(profile, { recursive: true });
function fingerprints(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(root, entry.name);
    return entry.isDirectory() ? fingerprints(path) : [{ path: relative(project, path).replaceAll('\\', '/'), sha256: createHash('sha256').update(readFileSync(path)).digest('hex') }];
  });
}
const before = fingerprints(resolve(project, 'src'));
const args = [`--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--window-size=1440,1000', 'about:blank'];
const results = { jobId: 'S1-REVIEW-BACKGROUND', agentId: 'A07', runId: 'MASTERS-REACT-20261002', run, checkedAt: new Date().toISOString(), status: 'RUNNING', channel, exe, args, playwright: JSON.parse(readFileSync(resolve(project, '../../node_modules/playwright/package.json'))).version, connection: { noDefaults: true, defaultContextOnly: true }, observations: [], checks: [], errors: [], sourceFingerprints: before };
// This is the explicitly requested real headed-browser observation. Hiding the
// application at launch would prevent establishing its initial foreground state.
const child = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: false });
let stderr = '';
child.stderr.on('data', data => { stderr += String(data); });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser, observedPage;
try {
  let ready = false;
  for (let n = 0; n < 80; n++) {
    try { const response = await fetch(`http://127.0.0.1:${port}/json/version`); if (response.ok) { results.endpoint = await response.json(); ready = true; break; } } catch {}
    await delay(250);
  }
  assert.ok(ready, 'Isolated browser exposes debugging endpoint');
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { noDefaults: true, artifactsDir: here, isLocal: true });
  results.browserVersion = browser.version();
  const context = browser.contexts()[0];
  assert.ok(context, 'Use existing isolated default context so noDefaults applies');
  const page = context.pages()[0] || await context.newPage();
  observedPage = page;
  page.on('pageerror', error => results.errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  results.initialWindow = await cdp.send('Browser.getWindowForTarget');
  await cdp.send('Browser.setWindowBounds', { windowId: results.initialWindow.windowId, bounds: { windowState: 'normal' } });
  await page.goto(`http://127.0.0.1:5181/alevel.html?run=${run}&fixture=numeric`);
  await page.bringToFront();
  results.initialDocument = await page.evaluate(() => ({hidden:document.hidden,focused:document.hasFocus()}));
  await page.getByRole('button', { name: 'Start fixture', exact: true }).click();
  await page.waitForFunction(() => window.__mastersFoundation?.snapshot().attempt !== null);
  await page.evaluate(() => {
    window.__A07Events = [];
    for (const name of ['visibilitychange', 'blur', 'focus']) {
      (name === 'visibilitychange' ? document : window).addEventListener(name, event => window.__A07Events.push({ name, trusted: event.isTrusted, at: Date.now(), hidden: document.hidden, focused: document.hasFocus() }));
    }
  });
  const flush = () => page.evaluate(async () => { await window.__mastersFoundation.checkpoint(); await window.__mastersFoundation.flush(); });
  const state = () => page.evaluate(() => window.__mastersFoundation.snapshot());
  const active = snap => snap.attempt.phase === 'answering' ? snap.attempt.timing.activeMs : snap.attempt.firstResponse.timing.activeMs;
  const observe = async label => {
    const window = await cdp.send('Browser.getWindowForTarget');
    const sample = await page.evaluate(() => ({ hidden: document.hidden, visibility: document.visibilityState, focused: document.hasFocus(), events: window.__A07Events, timing: window.__mastersFoundation.snapshot().attempt.timing }));
    const observation = { label, at: new Date().toISOString(), ...sample, window };
    results.observations.push(observation);
    console.log(JSON.stringify({ label, hidden: sample.hidden, focused: sample.focused, activeMs: sample.timing.activeMs, bounds: window.bounds }));
    return observation;
  };
  await page.bringToFront();
  await page.locator('input[inputmode="decimal"]').fill('42');
  await delay(2200); await flush();
  const foreground = await observe('foreground after trusted input');
  assert.equal(foreground.hidden, false); assert.equal(foreground.focused, true); assert.ok(foreground.timing.activeMs > 1000);
  const other = await context.newPage();
  await other.goto('about:blank'); await other.bringToFront(); await delay(600); await flush();
  const hidden = await observe('actual other tab foreground');
  assert.equal(hidden.hidden, true, 'Real background tab reports hidden without focus emulation');
  assert.equal(hidden.focused, false);
  const stopped = await state(); await delay(3200); await flush();
  const stayed = await observe('background after 3200ms');
  assert.equal(active(await state()), active(stopped), 'No active time accrues in genuine background');
  await page.bringToFront(); await delay(1800); await flush();
  const returned = await observe('return focus without interaction');
  assert.equal(returned.hidden, false); assert.equal(returned.focused, true);
  assert.equal(active(await state()), active(stopped), 'Focus alone does not resume time');
  await page.locator('input[inputmode="decimal"]').fill('41'); await delay(1600); await flush();
  const resumed = await observe('trusted input resumes');
  assert.ok(active(await state()) > active(stopped), 'Trusted input resumes active time');
  results.checks.push('Actual same-window tab background sets document.hidden=true and hasFocus=false, native trusted visibility/blur events stop time, focus alone remains stopped, trusted input resumes.');
  const info = await cdp.send('Browser.getWindowForTarget');
  await cdp.send('Browser.setWindowBounds', { windowId: info.windowId, bounds: { windowState: 'minimized' } });
  await delay(700); await flush();
  const minimized = await observe('actual browser window minimized');
  assert.equal(minimized.window.bounds.windowState, 'minimized');
  assert.ok(minimized.hidden || !minimized.focused, 'Actual minimisation makes browser background');
  const minStopped = await state(); await delay(2500); await flush();
  await observe('minimized after 2500ms');
  assert.equal(active(await state()), active(minStopped));
  await cdp.send('Browser.setWindowBounds', { windowId: info.windowId, bounds: { windowState: 'normal' } });
  await page.bringToFront(); await delay(1200); await flush();
  await observe('window restored without interaction');
  assert.equal(active(await state()), active(minStopped));
  await page.locator('input[inputmode="decimal"]').fill('42'); await delay(1500); await flush();
  assert.ok(active(await state()) > active(minStopped));
  results.checks.push('Actual Chrome/Windows window minimisation reports background and excludes time until fresh trusted input after restore.');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click(); await flush();
  const assessed = await state();
  assert.equal(assessed.attempt.phase, 'assessed');
  const records = await page.evaluate(() => window.__mastersFoundation.history());
  assert.equal(records.length, 1);
  results.firstAssessment = { attemptId: assessed.attempt.attemptId, timing: assessed.attempt.firstResponse.timing, evidenceTiming: records[0].timing };
  await page.screenshot({ path: resolve(here, `${channel}-background-restored-assessment.png`), fullPage: true });
  results.nativeVisibilityEvents = await page.evaluate(() => window.__A07Events);
  assert.ok(results.nativeVisibilityEvents.some(event => event.name === 'visibilitychange' && event.trusted && event.hidden));
  results.checks.push('Measured active time survives shared controller/repository/session first assessment and exactly one history record.');
  const after = fingerprints(resolve(project, 'src'));
  assert.deepEqual(after, before, 'Runtime source remains quiescent throughout real-browser test');
  results.sourceUnchanged = true;
  assert.deepEqual(results.errors, []);
  results.status = 'PASS';
} catch (error) {
  results.status = 'ESCALATE'; results.failure = { message: error.message, stack: error.stack };
  if (observedPage) {
    const failureCdp = await observedPage.context().newCDPSession(observedPage);
    results.failureWindow = await failureCdp.send('Browser.getWindowForTarget').catch(error => ({error:error.message}));
    results.failurePage = await observedPage.evaluate(() => ({ hidden: document.hidden, focused: document.hasFocus(), startDisabled: [...document.querySelectorAll('button')].find(button => button.textContent === 'Start fixture')?.disabled, body: document.body.innerText, snapshot: window.__mastersFoundation?.snapshot() })).catch(error => ({ error: error.message }));
    results.indexedDbProbe = await observedPage.evaluate(async () => Promise.race([new Promise(resolve => { const request = indexedDB.open('masters-of-chemistry-A07-native-probe'); request.onsuccess = () => {request.result.close();resolve({status:'OPENED'});}; request.onerror = () => resolve({status:'ERROR',name:request.error?.name,message:request.error?.message}); request.onblocked=()=>resolve({status:'BLOCKED'}); }), new Promise(resolve => setTimeout(()=>resolve({status:'TIMED_OUT'}),2000))])).catch(error => ({error:error.message}));
    await observedPage.screenshot({ path: resolve(here, `${channel}-failure.png`), fullPage: true }).catch(() => {});
  }
  results.sourceUnchanged = JSON.stringify(fingerprints(resolve(project, 'src'))) === JSON.stringify(before);
} finally {
  results.finishedAt = new Date().toISOString();
  results.browserStderr = stderr.slice(-3000);
  writeFileSync(resolve(here, `${channel}-results.json`), JSON.stringify(results, null, 2) + '\n');
  if (browser) { const session = await browser.newBrowserCDPSession().catch(() => null); if (session) await session.send('Browser.close').catch(() => {}); await browser.close().catch(() => {}); }
  if (!child.killed) child.kill();
}
console.log(JSON.stringify({ status: results.status, checks: results.checks.length, failure: results.failure?.message, result: resolve(here, `${channel}-results.json`) }));
process.exitCode = results.status === 'PASS' ? 0 : 1;
