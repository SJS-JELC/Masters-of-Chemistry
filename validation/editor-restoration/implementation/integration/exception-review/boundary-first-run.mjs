import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const here = import.meta.dirname;
const project = path.resolve(here, '../../../../..');
const require = createRequire(path.join(project, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const paths = ['src/domain/timing/active-clock.ts', 'src/domain/timing/browser-binding.ts', 'src/domain/attempt/attempt.ts', 'src/foundation/ActivityHost.tsx'];
const tree = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? tree(file) : [{ path: path.relative(project, file).replaceAll('\\', '/'), sha256: hash(file) }];
});
const report = {
  agentId: 'E04', jobId: 'EDITOR-TIMING-DISPOSITION', startedAt: new Date().toISOString(),
  requestedModel: 'gpt-6.1-sol', requestedEffort: 'high', effectiveModelEffort: null, usage: null,
  method: 'Pinned root Playwright 1.62.1, fresh headless Edge contexts, immutable production static files, actual trusted UI responses and durable IndexedDB reads; passive lifecycle/counter/input observation only. No DEV harness, original app contexts/storage, artificial clock, allowance change or runtime instrumentation of timing APIs.',
  sourceBefore: paths.map(p => ({ path: p, sha256: hash(path.join(project, p)) })),
  buildBefore: [...tree(path.join(project, 'dist/alevel')), ...tree(path.join(project, 'dist/igcse'))],
  cases: [], pageErrors: [], status: 'RUNNING',
};
const save = () => fs.writeFileSync(path.join(here, 'boundary-results.json'), JSON.stringify(report, null, 2) + '\n');
save();
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  try {
    const parts = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).split('/').filter(Boolean);
    const course = parts.shift(); assert(['alevel', 'igcse'].includes(course));
    const root = path.join(project, 'dist', course), file = path.resolve(root, ...(parts.length ? parts : ['index.html']));
    assert(file.startsWith(root + path.sep));
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
report.base = 'http://127.0.0.1:' + server.address().port;
let browser;
async function rows(page, course) {
  return page.evaluate(async course => {
    const db = await new Promise((resolve, reject) => { const r = indexedDB.open('masters-of-chemistry-' + course + '-local'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
    try {
      const get = name => new Promise((resolve, reject) => { const r = db.transaction(name).objectStore(name).getAll(); r.onsuccess = () => resolve(r.result.map(row => row.value)); r.onerror = () => reject(r.error); });
      return { attempts: await get('attempts'), evidence: await get('evidence') };
    } finally { db.close(); }
  }, course);
}
async function observe(page, course, label) {
  const state = await rows(page, course);
  const doc = await page.evaluate(() => ({ ...window.__e04BoundaryIdentity, wallMs: Date.now(), monoMs: performance.now(), hidden: document.hidden, focused: document.hasFocus(), counter: document.querySelector('.practice-progress p:nth-child(2)')?.textContent?.trim() }));
  const attempt = state.attempts[0];
  return { label, ...doc, attemptId: attempt.attemptId, phase: attempt.phase, activeMs: attempt.phase === 'answering' ? attempt.timing.activeMs : attempt.firstResponse.timing.activeMs, idleLimitMs: attempt.phase === 'answering' ? attempt.timing.idleLimitMs : attempt.firstResponse.timing.idleLimitMs, atoms: attempt.currentResponses.diagram?.atoms?.length, evidenceCount: state.evidence.length };
}
try {
  browser = await require('playwright').chromium.launch({ channel: 'msedge', headless: true });
  report.browserVersion = browser.version();
  await Promise.all(['alevel', 'igcse'].map(async course => {
    const c = { course, status: 'RUNNING', observations: [], nativeEvents: [], counterEvents: [], navigations: [], cdpEvents: [], console: [] }; report.cases.push(c); save();
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } }), page = await context.newPage();
    await page.exposeBinding('__e04BoundaryRecord', (_, value) => { (value.kind === 'counter' ? c.counterEvents : c.nativeEvents).push(value); });
    await page.addInitScript(() => {
      const identity = { timeOrigin: performance.timeOrigin, documentToken: crypto.randomUUID() }; window.__e04BoundaryIdentity = identity;
      const emit = (event, stage) => window.__e04BoundaryRecord({ kind: 'event', event: event.type, trusted: event.isTrusted, stage, ...identity, wallMs: Date.now(), monoMs: performance.now(), hidden: document.hidden, focused: document.hasFocus(), buttons: event.buttons, counter: document.querySelector('.practice-progress p:nth-child(2)')?.textContent?.trim() });
      for (const type of ['visibilitychange', 'freeze', 'resume', 'keydown', 'pointerdown', 'input', 'wheel', 'scroll', 'touchmove']) document.addEventListener(type, event => { emit(event, 'capture'); queueMicrotask(() => emit(event, 'after handlers')); }, { capture: true, passive: true });
      for (const type of ['blur', 'focus', 'pagehide', 'pageshow']) window.addEventListener(type, event => { emit(event, 'capture'); queueMicrotask(() => emit(event, 'after handlers')); }, { capture: true, passive: true });
      let counter;
      new MutationObserver(() => {
        const next = document.querySelector('.practice-progress p:nth-child(2)')?.textContent?.trim();
        if (next && next !== counter) { counter = next; window.__e04BoundaryRecord({ kind: 'counter', ...identity, counter, wallMs: Date.now(), monoMs: performance.now(), hidden: document.hidden, focused: document.hasFocus() }); }
      }).observe(document, { childList: true, characterData: true, subtree: true });
    });
    page.on('pageerror', error => report.pageErrors.push({ course, message: error.message }));
    page.on('framenavigated', frame => { if (frame === page.mainFrame()) c.navigations.push({ wallMs: Date.now(), url: frame.url() }); });
    page.on('console', message => { if (/vite|disconnect|reload/i.test(message.text())) c.console.push({ wallMs: Date.now(), text: message.text() }); });
    try {
      const gem = course === 'alevel' ? 'l6-t2-1-3' : 'fourth-3-1';
      await page.goto(`${report.base}/${course}/?course=${course}&activity=${course}/dot-and-cross&gem=${gem}&practice=fixed-level&level=1&fresh=1`);
      await page.locator('.dc-canvas').waitFor();
      assert.equal(await page.evaluate(() => typeof window.__mastersActivity), 'undefined');
      await page.locator('.dc-canvas').click({ position: { x: 70, y: 70 } });
      await page.waitForFunction(async course => { const db = await new Promise(resolve => { const r = indexedDB.open('masters-of-chemistry-' + course + '-local'); r.onsuccess = () => resolve(r.result); }); try { return await new Promise(resolve => { const r = db.transaction('attempts').objectStore('attempts').getAll(); r.onsuccess = () => resolve(r.result[0]?.value.currentResponses.diagram?.atoms?.length === 1); }); } finally { db.close(); } }, course);
      const start = await observe(page, course, 'real idle starts after first saved UI response'); c.observations.push(start);
      assert.equal(start.idleLimitMs, 180000); assert.equal(start.hidden, false); assert.equal(start.focused, true);
      c.idleInput = c.nativeEvents.filter(e => e.event === 'pointerdown' && e.trusted && e.stage === 'capture').at(-1);
      console.log('START E04 180-second idle ' + course); save();
      await page.waitForTimeout(187000);
      const idle = await observe(page, course, 'idle allowance exhausted'); c.observations.push(idle);
      await page.waitForTimeout(6500);
      const later = await observe(page, course, 'idle plateau after further 6.5 seconds'); c.observations.push(later);
      assert.equal(later.activeMs, idle.activeMs); assert.equal(idle.documentToken, start.documentToken); assert.equal(later.timeOrigin, start.timeOrigin); assert.equal(idle.attemptId, start.attemptId);
      assert(idle.activeMs >= 178000 && idle.activeMs <= 182000); assert.equal(idle.hidden, false); assert.equal(idle.focused, true);
      const noNewInput = c.nativeEvents.filter(e => e.stage === 'capture' && e.trusted && ['pointerdown', 'keydown', 'input', 'wheel', 'scroll', 'touchmove'].includes(e.event) && e.monoMs > c.idleInput.monoMs);
      assert.equal(noNewInput.length, 0);
      c.idle = { status: 'PASS', activeMs: idle.activeMs, plateauDeltaMs: later.activeMs - idle.activeMs, wallSinceLastInputMs: idle.wallMs - c.idleInput.wallMs, sameDocument: true, trustedInteractionsAfterStart: noNewInput.length }; save();
      const cdp = await context.newCDPSession(page); await cdp.send('Page.setLifecycleEventsEnabled', { enabled: true });
      cdp.on('Page.lifecycleEvent', event => c.cdpEvents.push({ ...event, nodeWallMs: Date.now() }));
      await page.locator('.dc-canvas').click({ position: { x: 170, y: 70 } });
      await page.waitForFunction(async course => { const db = await new Promise(resolve => { const r = indexedDB.open('masters-of-chemistry-' + course + '-local'); r.onsuccess = () => resolve(r.result); }); try { return await new Promise(resolve => { const r = db.transaction('attempts').objectStore('attempts').getAll(); r.onsuccess = () => resolve(r.result[0]?.value.currentResponses.diagram?.atoms?.length === 2); }); } finally { db.close(); } }, course);
      const before = await observe(page, course, 'fresh UI response/save immediately before freeze'); c.observations.push(before);
      const lastInput = c.nativeEvents.filter(e => e.event === 'pointerdown' && e.trusted && e.stage === 'capture').at(-1);
      const navigationCount = c.navigations.length, eventIndex = c.nativeEvents.length;
      const freezeRequestWall = Date.now(); await cdp.send('Page.setWebLifecycleState', { state: 'frozen' }); const freezeAckWall = Date.now();
      await new Promise(resolve => setTimeout(resolve, 8000));
      const thawRequestWall = Date.now(); await cdp.send('Page.setWebLifecycleState', { state: 'active' }); const thawAckWall = Date.now();
      await page.waitForTimeout(6100);
      const after = await observe(page, course, 'thawed and sampled/saved with no input'); c.observations.push(after);
      await page.waitForTimeout(6100);
      const stable = await observe(page, course, 'post-thaw still stopped after another 6.1 seconds'); c.observations.push(stable);
      const boundaries = c.nativeEvents.slice(eventIndex).filter(e => e.stage === 'after handlers' && ['freeze', 'resume'].includes(e.event));
      const freeze = boundaries.find(e => e.event === 'freeze'), resume = boundaries.find(e => e.event === 'resume'); assert(freeze && resume, 'Actual freeze/resume browser events must exist');
      assert(freeze.trusted && resume.trusted); assert(resume.monoMs - freeze.monoMs >= 7900); assert.equal(freeze.documentToken, resume.documentToken); assert.equal(freeze.timeOrigin, resume.timeOrigin);
      assert.equal(after.documentToken, before.documentToken); assert.equal(after.timeOrigin, before.timeOrigin); assert.equal(c.navigations.length, navigationCount); assert.equal(after.attemptId, before.attemptId);
      assert.equal(freeze.counter, resume.counter, 'Actual lifecycle boundaries must show identical live counter');
      const delta = after.activeMs - before.activeMs, permittedPreBoundaryMs = freeze.monoMs - lastInput.monoMs + 3;
      assert(delta >= 0 && delta <= permittedPreBoundaryMs, `Exact saved delta ${delta} cannot exceed measured trusted-input-to-freeze pre-boundary interval ${permittedPreBoundaryMs}`);
      assert.equal(stable.activeMs, after.activeMs, 'Thaw does not restart timing without trusted interaction'); assert.equal(stable.counter, after.counter);
      assert.equal(after.evidenceCount, 0); assert.equal(stable.evidenceCount, 0);
      c.freeze = { status: 'PASS', freezeRequestWall, freezeAckWall, thawRequestWall, thawAckWall, actualBoundaryWallMs: resume.wallMs - freeze.wallMs, actualBoundaryMonotonicMs: resume.monoMs - freeze.monoMs, before, freeze, resume, after, stable, lastInput, savedDeltaMs: delta, maximumMeasuredLegitimatePreBoundaryMs: permittedPreBoundaryMs, unchangedBoundaryCounter: true, postThawPlateauDeltaMs: stable.activeMs - after.activeMs, sameDocument: true, noNavigation: true };
      await page.screenshot({ path: path.join(here, course + '-post-thaw.png'), fullPage: true });
      await page.locator('[data-dot-action="check"]').click(); await page.locator('.assessment-feedback').waitFor();
      await page.waitForTimeout(250);
      const assessed = await rows(page, course); assert.equal(assessed.evidence.length, 1); assert.equal(assessed.attempts[0].phase, 'assessed'); assert.deepEqual(assessed.evidence[0].timing, assessed.attempts[0].firstResponse.timing);
      c.finalAssessment = { phase: assessed.attempts[0].phase, evidenceCount: assessed.evidence.length, timing: assessed.attempts[0].firstResponse.timing, firstAssessment: assessed.attempts[0].firstAssessment };
      c.status = 'PASS'; console.log('PASS E04 ' + course + ' idle/freeze boundaries');
    } catch (error) { c.status = 'FAIL'; c.failure = { message: error.message, stack: error.stack }; console.error('FAIL E04 ' + course + ': ' + error.message); await page.screenshot({ path: path.join(here, course + '-failure.png'), fullPage: true }).catch(() => {}); }
    finally { save(); await context.close(); }
  }));
  report.sourceAfter = paths.map(p => ({ path: p, sha256: hash(path.join(project, p)) }));
  report.buildAfter = [...tree(path.join(project, 'dist/alevel')), ...tree(path.join(project, 'dist/igcse'))];
  assert.deepEqual(report.sourceAfter, report.sourceBefore); assert.deepEqual(report.buildAfter, report.buildBefore);
  report.sourceUnchanged = true; report.buildUnchanged = true;
  report.status = report.cases.every(c => c.status === 'PASS') && !report.pageErrors.length ? 'PASS' : 'FAIL';
} catch (error) { report.status = 'FAIL'; report.failure = { message: error.message, stack: error.stack }; }
finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); report.finishedAt = new Date().toISOString(); report.scriptSha256 = hash(path.join(here, 'boundary-probe.mjs')); save(); console.log(JSON.stringify({ status: report.status, evidence: path.relative(project, path.join(here, 'boundary-results.json')) })); if (report.status !== 'PASS') process.exitCode = 1; }
