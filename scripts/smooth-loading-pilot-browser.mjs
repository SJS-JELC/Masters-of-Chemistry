import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, projectRoot } from './browser/paths.mjs';
import { restoreRateExample } from '../src/activities/alevel/rate-equations/provider.ts';

const base = process.env.SMOOTH_LOADING_APP_URL || 'http://127.0.0.1:5261';
const out = path.join(projectRoot, '.artifacts/smooth-loading/pilot-browser');
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = path.join(out, '.tmp');
process.env.TMP = process.env.TEMP;
const report = {
  jobId: 'SL-PILOT-VERIFY', agentId: 'A03', startedAt: new Date().toISOString(),
  checks: [], failures: [], pageErrors: [], navigationEvents: [],
  limits: ['Headless Edge foreground behavior is tested; no claim of native hidden-tab or suspension acceptance.',
    'Browser-only repository response instrumentation delays real operations and injects the retained transaction fault point; production source is not modified.',
    'This pilot does not constitute the full both-course/all-view final acceptance gate.'],
};
const browser = await chromium.launch({ channel: 'msedge', headless: true });
report.browser = await browser.version();
let page;

function repositoryInstrumentation(source) {
  const original = 'return createRepository(databaseName);';
  assert(source.includes(original), 'Repository production factory moved; update the browser-only fault instrumentation explicitly.');
  return source.replace(original, `
    const actual = createRepository(databaseName, point => {
      const pilot = window.__smoothPilot;
      if (pilot?.failSave && point === 'after-attempt') {
        pilot.faultPoints.push(point);
        throw new DOMException('Smooth loading pilot transaction fault', 'QuotaExceededError');
      }
    });
    return new Proxy(actual, { get(target, key) {
      const operation = target[key];
      if (typeof operation !== 'function' || key === 'close') return operation;
      return async (...args) => {
        const pilot = window.__smoothPilot;
        if (pilot && ['curriculumHistory','loadSession','loadAttempt'].includes(key) && pilot.readDelayMs) {
          const ms = pilot.readDelayMs; pilot.readDelayMs = 0;
          pilot.reads.push({key, startedAt: performance.now(), ms});
          await new Promise(resolve => setTimeout(resolve, ms));
        }
        if (pilot && key === 'saveCurriculum') {
          pilot.attemptWrites.push(args[0].attempt.attemptId);
          if (pilot.holdSave) {
            pilot.saveHeld = true;
            await new Promise(resolve => { pilot.releaseSave = resolve; });
            pilot.saveHeld = false;
          }
        }
        return operation.apply(target, args);
      };
    }});
  `);
}

async function fixture(name, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    window.__smoothPilot = { readDelayMs: 0, failSave: false, holdSave: false, saveHeld: false,
      reads: [], attemptWrites: [], faultPoints: [], seenParagraphs: [], barEvents: [] };
    const boot = () => {
      new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          const bars = [...(node.matches('[data-testid="loading-bar"]') ? [node] : []), ...node.querySelectorAll('[data-testid="loading-bar"]')];
          for (const bar of bars) window.__smoothPilot.barEvents.push({at: performance.now(), text: bar.textContent});
          for (const p of [...(node.matches('p') ? [node] : []), ...node.querySelectorAll('p')]) {
            if (/^(Loading|Reading saved|Opening (saved |selected )?question)/.test(p.textContent.trim())) window.__smoothPilot.seenParagraphs.push(p.textContent);
          }
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    };
    if (document.documentElement) boot(); else document.addEventListener('DOMContentLoaded', boot, {once: true});
  });
  await context.route('**/src/persistence/repository.ts*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: repositoryInstrumentation(await response.text()) });
  });
  const delayedRequests = [];
  if (options.module) await context.route(options.module, async route => {
    delayedRequests.push({ url: route.request().url(), at: Date.now() });
    await new Promise(resolve => setTimeout(resolve, 900));
    await route.continue();
  });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => report.pageErrors.push({name, error: error.message}));
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) report.navigationEvents.push({name, url: frame.url(), at: Date.now()}); });
  await page.goto(`${base}/?course=alevel&run=smooth-${name}-${Date.now()}`);
  await page.locator('.original-landing.alevel').waitFor();
  await page.waitForFunction(() => window.__mastersLoading && !window.__mastersLoading.snapshot().pending);
  await page.evaluate(() => { window.__smoothPilot.barEvents = []; window.__smoothPilot.seenParagraphs = []; });
  return { context, page, delayedRequests };
}

async function selectRate(gem = 'orders', level = '1') {
  const upper = page.getByRole('switch', { name: 'Upper Sixth', exact: true });
  if (await upper.getAttribute('aria-checked') !== 'true') await upper.click();
  await page.locator('[data-topic="u6-t1-topic-2"] .topic-trigger').click();
  await page.locator(`[data-leaf="u6-t1-2-${gem}"]`).click();
  await page.locator('#gemDetails').waitFor({state: 'visible'});
  return page.locator(`[data-practice="${level}"]`);
}

async function ready() {
  await page.locator('.question-player').waitFor();
  await page.waitForFunction(() => window.__mastersActivity?.snapshot().attempt && !window.__mastersLoading.snapshot().pending);
  await page.evaluate(() => window.__mastersActivity.flush());
  await page.waitForFunction(() => window.__mastersActivity.snapshot().saveStatus.kind === 'saved');
  assert.equal(await page.locator('.practice-setup').count(), 0);
  assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), false);
}

async function snapshot() { return page.evaluate(() => window.__mastersActivity.snapshot()); }

async function rows() {
  return page.evaluate(async () => {
    const name = window.__mastersActivity?.snapshot().databaseName;
    if (!name) throw Error('Activity database is not available for evidence audit');
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const result = {};
      for (const table of ['attempts','evidence','sessions']) result[table] = await new Promise((resolve, reject) => {
        const request = db.transaction(table).objectStore(table).getAll();
        request.onsuccess = () => resolve(request.result.map(row => row.value));
        request.onerror = () => reject(request.error);
      });
      return result;
    } finally { db.close(); }
  });
}

async function retained(selector, oldURL, { checkURL = true } = {}) {
  await page.waitForFunction(() => window.__mastersLoading.snapshot().pending);
  assert.equal(await page.locator(selector).count(), 1, 'outgoing content must remain mounted');
  assert.equal(await page.locator('#loading-surface').evaluate(el => el.inert), true);
  assert.equal(await page.locator('#loading-surface').getAttribute('aria-busy'), 'true');
  if (checkURL) assert.equal(page.url(), oldURL, 'click-created URL changed before destination readiness');
  await page.locator('[data-testid="loading-bar"]').waitFor({state: 'visible'});
  assert.equal(await page.locator('[data-testid="loading-bar"]').count(), 1);
  assert.equal(await page.locator('.practice-setup').count(), 0);
  await page.screenshot({path: path.join(out, `${report.currentCase}-retained.png`)});
}

async function assess() {
  const before = await snapshot();
  const example = restoreRateExample(before.question.ref);
  for (const [partId,response] of Object.entries(example.correctResponses))
    await page.evaluate(({partId,response}) => window.__mastersActivity.respond(partId,response), {partId,response});
  await page.getByRole('button', {name: 'Check', exact: true}).click();
  await page.waitForFunction(() => window.__mastersActivity.snapshot().attempt.phase === 'assessed');
  await ready();
  return snapshot();
}

async function run(name, body) {
  report.currentCase = name;
  let context;
  try {
    const result = await body(value => {context = value;});
    report.checks.push({name, status: 'PASS', ...result});
    console.log(`PASS ${name}`);
  } catch (error) {
    const state = await page?.evaluate(() => ({url: location.href, loading: window.__mastersLoading?.snapshot(),
      questionCount: document.querySelectorAll('.question-player').length, pilot: window.__smoothPilot})).catch(() => null);
    report.failures.push({name, error: error.stack, state});
    await page?.screenshot({path: path.join(out, `${name}-failure.png`), fullPage: true}).catch(() => {});
    console.error(`FAIL ${name}: ${error.message}`);
  } finally {
    await context?.close();
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
}

try {
  await run('cold-provider', async setContext => {
    const f = await fixture('provider', {module: '**/src/activities/alevel/rate-equations/provider.ts*'}); setContext(f.context);
    const launch = await selectRate(), oldURL = page.url();
    await launch.click();
    await retained('.original-landing.alevel', oldURL);
    await ready();
    assert(f.delayedRequests.length > 0, 'provider was not actually delayed');
    assert.equal((await rows()).attempts.length, 1);
    assert.equal((await rows()).evidence.length, 0);
    assert.deepEqual(await page.evaluate(() => window.__smoothPilot.seenParagraphs), []);
    return {moduleDelays: f.delayedRequests, initialEvidence: 0};
  });

  await run('cold-tools', async setContext => {
    const f = await fixture('tools', {module: '**/src/activities/alevel/rate-equations/RateGraphWorkspace.tsx*'}); setContext(f.context);
    const launch = await selectRate('graphs', '2'), oldURL = page.url();
    await launch.click();
    await retained('.original-landing.alevel', oldURL);
    await ready();
    await page.locator('.rate-graph-tools').waitFor();
    assert(f.delayedRequests.length > 0, 'graph workspace was not actually delayed');
    assert.deepEqual(await page.evaluate(() => window.__smoothPilot.seenParagraphs), []);
    await page.screenshot({path: path.join(out, 'ready-graph-desktop.png'), fullPage: true});
    return {moduleDelays: f.delayedRequests};
  });

  await run('slow-database-and-next', async setContext => {
    const f = await fixture('database'); setContext(f.context);
    const launch = await selectRate(), oldURL = page.url();
    await page.evaluate(() => {window.__smoothPilot.readDelayMs = 900;});
    await launch.click();
    await retained('.original-landing.alevel', oldURL);
    await ready();
    const first = await snapshot();
    assert.equal((await rows()).attempts.length, 1);
    const assessed = await assess();
    assert.equal((await rows()).evidence.length, 1);
    await page.evaluate(() => {window.__smoothPilot.readDelayMs = 900;});
    const previousText = await page.locator('.question-player').textContent();
    await page.getByRole('button', {name: 'Next', exact: true}).click();
    await retained('.question-player', page.url());
    assert.equal(await page.locator('.question-player').textContent(), previousText);
    assert.equal((await snapshot()).attempt.attemptId, first.attempt.attemptId);
    assert.equal((await rows()).attempts.length, 1);
    await ready();
    const next = await snapshot();
    assert.notEqual(next.attempt.attemptId, first.attempt.attemptId);
    assert.equal((await rows()).attempts.length, 2);
    assert.equal((await rows()).evidence.length, 1);
    assert.deepEqual((await rows()).attempts.find(a => a.attemptId === first.attempt.attemptId).firstResponse.timing, assessed.attempt.firstResponse.timing);
    await page.evaluate(() => {window.__smoothPilot.readDelayMs = 900;});
    const urlBeforeHome = page.url();
    await page.locator('button.question-back[aria-label="Back to course map"]').click();
    await retained('.question-player', urlBeforeHome);
    await page.locator('.original-landing.alevel').waitFor();
    await page.waitForFunction(() => !window.__mastersLoading.snapshot().pending);
    return {sameOutgoingAttempt: first.attempt.attemptId, newAttempt: next.attempt.attemptId,
      reads: await page.evaluate(() => window.__smoothPilot.reads), assessedTimingPreserved: true};
  });

  await run('warm-fast-no-bar', async setContext => {
    const f = await fixture('warm'); setContext(f.context);
    await (await selectRate()).click(); await ready();
    await page.locator('button.question-back[aria-label="Back to course map"]').click();
    await page.locator('.original-landing.alevel').waitFor();
    const launch = await selectRate();
    await page.evaluate(() => {window.__smoothPilot.barEvents = [];});
    await launch.click(); await ready();
    const bars = await page.evaluate(() => window.__smoothPilot.barEvents);
    assert.deepEqual(bars, [], 'warm preparation exceeded delay or flashed an indicator');
    return {barEvents: bars};
  });

  await run('held-new-attempt-save', async setContext => {
    const f = await fixture('held-save'); setContext(f.context);
    const launch = await selectRate(), oldURL = page.url();
    await page.evaluate(() => {window.__smoothPilot.holdSave = true;});
    await launch.click();
    await page.waitForFunction(() => window.__smoothPilot.saveHeld);
    await retained('.original-landing.alevel', oldURL);
    assert.equal(await page.locator('.question-player').count(), 0);
    await page.waitForTimeout(600);
    await page.evaluate(() => {window.__smoothPilot.holdSave = false;window.__smoothPilot.releaseSave();});
    await ready();
    await page.evaluate(() => window.__mastersActivity.checkpoint());
    const activeMs = (await snapshot()).attempt.timing.activeMs;
    assert(activeMs < 600, `new clock included held save (${activeMs}ms)`);
    return {blockedSaveMs: 600, visibleAttemptActiveMs: activeMs};
  });

  await run('failed-new-save-retry-same-identity', async setContext => {
    const f = await fixture('failed-save'); setContext(f.context);
    const launch = await selectRate(), oldURL = page.url();
    await page.evaluate(() => {window.__smoothPilot.failSave = true;});
    await launch.click();
    await page.locator('[data-testid="loading-retry"]').waitFor();
    assert.equal(page.url(), oldURL);
    assert.equal(await page.locator('.original-landing.alevel').count(), 1);
    assert.equal(await page.locator('.question-player').count(), 0);
    assert.equal(await page.locator('[data-testid="loading-bar"]').count(), 0);
    const failedIds = await page.evaluate(() => window.__smoothPilot.attemptWrites);
    assert(failedIds.length > 0);
    await page.evaluate(() => {window.__smoothPilot.failSave = false;});
    await page.locator('[data-testid="loading-retry"]').click();
    await ready();
    const retried = await snapshot();
    assert.equal(retried.attempt.attemptId, failedIds[0]);
    assert.equal((await rows()).attempts.length, 1);
    assert.equal((await rows()).evidence.length, 0);
    return {attemptId: retried.attempt.attemptId, actualTransactionFaults: await page.evaluate(() => window.__smoothPilot.faultPoints)};
  });

  await run('pending-keyboard-clock-cancel', async setContext => {
    const f = await fixture('cancel'); setContext(f.context);
    await (await selectRate()).click(); await ready();
    await page.bringToFront();
    await page.locator('.question-player').click({position: {x: 5, y: 5}});
    await page.waitForTimeout(1100);
    await page.evaluate(() => window.__mastersActivity.checkpoint());
    const before = await snapshot(), oldURL = page.url();
    await page.evaluate(() => window.__mastersLoading.delay('screen', 1200));
    await page.locator('button.question-back[aria-label="Back to course map"]').click();
    await retained('.question-player', oldURL);
    const frozen = await snapshot();
    await page.keyboard.press('Enter');
    await page.keyboard.press('n');
    await page.waitForTimeout(450);
    await page.evaluate(() => window.__mastersActivity.checkpoint());
    const after = await snapshot();
    assert.equal(after.attempt.attemptId, before.attempt.attemptId);
    assert.equal(after.attempt.phase, 'answering');
    assert.equal(after.attempt.timing.activeMs, frozen.attempt.timing.activeMs, 'inactive retained screen accrued timing');
    assert.equal((await rows()).evidence.length, 0);
    await page.evaluate(() => window.__mastersLoading.cancel());
    await ready();
    assert.equal((await snapshot()).attempt.attemptId, before.attempt.attemptId);
    assert.equal(page.url(), oldURL);
    return {beforeMs: before.attempt.timing.activeMs, frozenMs: frozen.attempt.timing.activeMs,
      afterMs: after.attempt.timing.activeMs, sameAttemptCancel: true};
  });

  assert.deepEqual(report.pageErrors, []);
} catch (error) {
  report.failures.push({name: 'suite', error: error.stack});
} finally {
  delete report.currentCase;
  report.finishedAt = new Date().toISOString();
  report.status = report.failures.length ? 'FAIL' : 'PASS';
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(JSON.stringify({status: report.status, passed: report.checks.length, failed: report.failures.length, report: path.join(out, 'report.json')}));
  if (report.status !== 'PASS') process.exitCode = 1;
}
