import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, projectRoot } from './browser/paths.mjs';
import { factsFor } from '../src/recall/facts.ts';
import { recallFields } from '../src/recall/marking.ts';
import { rawModelResponses } from '../src/recall/marking-fixtures.mjs';
import { questionDisplayCode } from '../src/content/question-display-identity.ts';

const base = process.env.SMOOTH_LOADING_APP_URL || 'http://127.0.0.1:5261';
const out = path.join(projectRoot, '.artifacts/smooth-loading/s2-recall/browser');
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = path.join(out, '.tmp');
process.env.TMP = process.env.TEMP;
const report = {
  jobId: 'SL-RECALL-PERSISTENCE',
  startedAt: new Date().toISOString(),
  checks: [],
  failures: [],
  pageErrors: [],
  limits: [
    'Headless real Edge foreground, durable IndexedDB and render checks. Native hidden/background acceptance remains the integrated verifier responsibility.',
  ],
};
const browser = await chromium.launch({ channel: 'msedge', headless: true });
report.browser = await browser.version();
let page, context, run, course;
function instrument(source) {
  const needle = 'return createRepository(databaseName);';
  assert(source.includes(needle));
  return source.replace(
    needle,
    `const actual=createRepository(databaseName,point=>{if(window.__smoothRecall?.failSave&&point==='after-attempt')throw new DOMException('Recall validation fault','QuotaExceededError');});
    return new Proxy(actual,{get(target,key){const operation=target[key];if(typeof operation!=='function'||key==='close')return operation;return async(...args)=>{
      const test=window.__smoothRecall;
      if(test&&key===test.delayRead&&test.readDelay){const ms=test.readDelay;test.readDelay=0;test.reads.push(String(key));await new Promise(resolve=>setTimeout(resolve,ms));}
      if(test&&key==='saveRecall'){test.writes.push(args[0].attempt.attemptId);if(test.holdNew&&args[0].attempt.attemptId!==test.oldId){test.held=true;await new Promise(resolve=>{test.release=resolve;});test.held=false;}}
      return operation.apply(target,args);
    };}});`,
  );
}
async function ready() {
  await page.waitForFunction(
    () =>
      window.__mastersLoading &&
      !window.__mastersLoading.snapshot().pending &&
      !window.__mastersLoading.snapshot().error,
  );
}
async function fixture(
  nextCourse,
  name,
  { teacher = false, mobile = false, autoStart = false } = {},
) {
  course = nextCourse;
  run = 'smooth-recall-' + name + '-' + Date.now();
  context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1050 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    window.__smoothRecall = {
      failSave: false,
      holdNew: false,
      held: false,
      oldId: null,
      reads: [],
      writes: [],
      readDelay: 0,
      delayRead: 'loadRecallSession',
      paragraphs: [],
    };
    document.addEventListener(
      'DOMContentLoaded',
      () =>
        new MutationObserver((records) => {
          for (const record of records)
            for (const node of record.addedNodes) {
              if (!(node instanceof Element)) continue;
              for (const p of [...(node.matches('p') ? [node] : []), ...node.querySelectorAll('p')])
                if (
                  /^(Loading|Reading saved|Opening (saved |selected )?question)/.test(
                    p.textContent.trim(),
                  )
                )
                  window.__smoothRecall.paragraphs.push(p.textContent);
            }
        }).observe(document.documentElement, { childList: true, subtree: true }),
      { once: true },
    );
  });
  await context.route('**/src/persistence/repository.ts*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: instrument(await response.text()) });
  });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => report.pageErrors.push({ name, error: error.message }));
  const gem = course === 'alevel' ? 'l6-t2-1-1' : 'fourth-1-2';
  await page.goto(
    `${base}/?course=${course}&view=recall&recallGem=${gem}&run=${run}${teacher ? '&mode=teacher' : ''}${autoStart ? '&masteryRun=auto-' + run + '&masteryGem=' + gem + '&masteryStage=recall' : ''}`,
  );
  await page.locator(autoStart ? '.question-player' : '.recall-selection').waitFor();
  await ready();
}
async function rows() {
  return page.evaluate(
    async ({ course, run }) => {
      const request = indexedDB.open('masters-of-chemistry-alpha-v2-' + course + '-' + run);
      const db = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const values = await Promise.all(
        ['recallAttempts', 'recallSessions', 'recallEvidence', 'recallFlashcards', 'evidence'].map(
          (name) =>
            new Promise((resolve, reject) => {
              const r = db.transaction(name).objectStore(name).getAll();
              r.onsuccess = () => resolve(r.result.map((x) => x.value));
              r.onerror = () => reject(r.error);
            }),
        ),
      );
      db.close();
      return Object.fromEntries(
        ['attempts', 'sessions', 'recallEvidence', 'flashcards', 'curriculumEvidence'].map(
          (name, i) => [name, values[i]],
        ),
      );
    },
    { course, run },
  );
}
async function retained(selector) {
  assert.equal(await page.locator(selector).count(), 1);
  assert.equal(await page.locator('#loading-surface').evaluate((element) => element.inert), true);
  await page.locator('[data-testid=loading-bar]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-testid=loading-bar]').count(), 1);
}
async function currentAttempt() {
  const state = await rows(),
    session = state.sessions.find((s) => s.currentAttemptId);
  return state.attempts.find((a) => a.attemptId === session?.currentAttemptId);
}
async function fillModel() {
  const id = (await currentAttempt()).target.factId;
  assert.equal(
    await page.getByLabel('Question ID', { exact: true }).innerText(),
    questionDisplayCode({ course, activityId: course + '/recall', questionId: id }),
  );
  const fact = factsFor(course).find((f) => f.id === id);
  assert(fact, 'Visible canonical fact is known');
  const model = rawModelResponses(fact),
    fields = recallFields(fact);
  assert(!fact.exceptionCollection, 'Selected browser set must have basic typed fields');
  const textInputs = page.locator(
    '.question-player input:not([type=checkbox]):not([type=radio]),.question-player textarea',
  );
  let textIndex = 0;
  for (const field of fields) {
    const value = model[field.id].value;
    if (field.entry?.kind === 'choice') {
      const option = field.entry.options.find((o) => o.id === value);
      if (field.entry.presentation === 'buttons')
        await page.getByRole('button', { name: option.label, exact: true }).click();
      else await page.getByRole('combobox', { name: field.label, exact: true }).selectOption(value);
    } else await textInputs.nth(textIndex++).fill(value);
  }
  return fact.id;
}
async function check(name, body) {
  try {
    const result = await body();
    report.checks.push({ name, status: 'PASS', ...result });
    console.log('PASS ' + name);
  } catch (error) {
    report.failures.push({
      name,
      error: error.stack,
      state: await page
        ?.evaluate(() => ({
          loading: window.__mastersLoading?.snapshot(),
          test: window.__smoothRecall,
        }))
        .catch(() => null),
    });
    await page
      ?.screenshot({ path: path.join(out, name + '-FAIL.png'), fullPage: true })
      .catch(() => {});
    console.error('FAIL ' + name + ': ' + error.message);
  } finally {
    await context?.close();
    context = null;
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  }
}
try {
  for (const nextCourse of ['igcse', 'alevel']) {
    await check(nextCourse + '-test-restore-cancel-next', async () => {
      await fixture(nextCourse, nextCourse + '-test');
      await page.evaluate(() => {
        window.__smoothRecall.readDelay = 950;
      });
      await page.getByRole('button', { name: 'Mastery Test', exact: true }).click();
      await retained('.recall-selection');
      assert.equal((await rows()).attempts.length, 0);
      await ready();
      await page.locator('.question-player').waitFor();
      let attempt = await currentAttempt();
      assert(attempt);
      assert.equal(attempt.phase, 'answering');
      const firstId = attempt.attemptId;
      await page.getByRole('textbox').first().fill('retained draft');
      await page.waitForTimeout(650);
      await page.evaluate(() => window.__mastersLoading.delay('question', 1000));
      await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
      await retained('.question-player');
      attempt = await currentAttempt();
      const paused = attempt.timing.activeMs;
      await page.keyboard.press('Enter');
      await page.keyboard.type('pending keyboard');
      assert.equal(await page.getByRole('textbox').first().inputValue(), 'retained draft');
      await page.waitForTimeout(350);
      assert.equal((await currentAttempt()).timing.activeMs, paused);
      assert.equal((await currentAttempt()).attemptId, firstId);
      await page.evaluate(() => window.__mastersLoading.delay('question', 0));
      await page.evaluate(() => window.__mastersLoading.cancel());
      await ready();
      assert.equal((await currentAttempt()).attemptId, firstId);
      assert.equal(await page.getByRole('textbox').first().inputValue(), 'retained draft');
      await page.screenshot({
        path: path.join(out, nextCourse + '-test-ready.png'),
        fullPage: true,
      });
      await page.reload();
      await page.locator('.recall-selection').waitFor();
      await ready();
      await page.getByRole('button', { name: 'Mastery Test', exact: true }).click();
      await ready();
      await page.locator('.question-player').waitFor();
      assert.equal((await currentAttempt()).attemptId, firstId);
      assert.equal(await page.getByRole('textbox').first().inputValue(), 'retained draft');
      await fillModel();
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.waitForFunction(
        async ({ course, run }) => {
          const r = indexedDB.open('masters-of-chemistry-alpha-v2-' + course + '-' + run);
          const db = await new Promise((resolve) => {
            r.onsuccess = () => resolve(r.result);
          });
          const value = await new Promise((resolve) => {
            const request = db.transaction('recallEvidence').objectStore('recallEvidence').getAll();
            request.onsuccess = () => resolve(request.result.length);
          });
          db.close();
          return value === 1;
        },
        { course, run },
      );
      const evidence = (await rows()).recallEvidence[0];
      assert.equal(evidence.outcome, 'correct');
      assert(evidence.firstResponse.timing.activeMs >= paused);
      await page.getByRole('textbox').first().fill('later edit');
      await page.waitForTimeout(150);
      assert.deepEqual((await rows()).recallEvidence[0], evidence);
      await page.evaluate(() => {
        window.__smoothRecall.oldId = window.__smoothRecall.writes.at(-1);
        window.__smoothRecall.holdNew = true;
      });
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(() => window.__smoothRecall.held);
      await retained('.question-player');
      assert.equal((await rows()).attempts.length, 1);
      assert.equal((await rows()).recallEvidence.length, 1);
      await page.evaluate(() => {
        window.__smoothRecall.holdNew = false;
        window.__smoothRecall.release();
      });
      await ready();
      const next = await currentAttempt();
      assert.notEqual(next.attemptId, firstId);
      assert.equal(next.phase, 'answering');
      assert.deepEqual((await rows()).recallEvidence[0], evidence);
      assert.equal((await rows()).curriculumEvidence.length, 0);
      assert.deepEqual(await page.evaluate(() => window.__smoothRecall.paragraphs), []);
      return {
        firstId,
        nextId: next.attemptId,
        pausedMs: paused,
        firstMs: evidence.firstResponse.timing.activeMs,
        recallEvidence: 1,
        curriculumEvidence: 0,
      };
    });
    await check(nextCourse + '-flashcards-durable-resume', async () => {
      await fixture(nextCourse, nextCourse + '-flashcards', { mobile: nextCourse === 'igcse' });
      await page.evaluate(() => {
        window.__smoothRecall.delayRead = 'loadRecallFlashcards';
        window.__smoothRecall.readDelay = 850;
      });
      await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
      await retained('.recall-selection');
      await ready();
      await page.locator('.fc-table').waitFor();
      assert.equal((await rows()).flashcards.length, 1);
      assert.equal((await rows()).recallEvidence.length, 0);
      await page.getByRole('button', { name: 'Reveal answer', exact: true }).click();
      await page.getByRole('button', { name: 'Got it', exact: true }).click();
      await page.waitForTimeout(400);
      const checkpoint = (await rows()).flashcards[0];
      await page.screenshot({
        path: path.join(out, nextCourse + '-flashcards-ready.png'),
        fullPage: true,
      });
      await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
      await ready();
      await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
      await ready();
      await page.getByRole('button', { name: 'Resume deck', exact: true }).click();
      await page.locator('.fc-table').waitFor();
      assert.deepEqual((await rows()).flashcards[0].classifications, checkpoint.classifications);
      assert.equal((await rows()).attempts.length, 0);
      assert.equal((await rows()).recallEvidence.length, 0);
      assert.deepEqual(await page.evaluate(() => window.__smoothRecall.paragraphs), []);
      return { durableDeck: true, evidence: 0 };
    });
    await check(nextCourse + '-teacher-zero-evidence', async () => {
      await fixture(nextCourse, nextCourse + '-teacher', { teacher: true });
      await page.getByRole('button', { name: 'Teacher preview', exact: true }).click();
      await ready();
      await page.locator('.question-player').waitFor();
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await ready();
      const state = await rows();
      assert.equal(state.attempts.length, 0);
      assert.equal(state.recallEvidence.length, 0);
      assert.equal(state.curriculumEvidence.length, 0);
      return { attempts: 0, evidence: 0 };
    });
    await check(nextCourse + '-autostart-durable-restore', async () => {
      await fixture(nextCourse, nextCourse + '-autostart', { autoStart: true });
      const first = await currentAttempt();
      assert(first);
      assert.equal(first.phase, 'answering');
      assert.equal((await rows()).attempts.length, 1);
      assert.equal((await rows()).recallEvidence.length, 0);
      assert.equal(await page.locator('.recall-selection').count(), 0);
      assert((await rows()).sessions[0].id.startsWith('mastery-recall:auto-'));
      await page.getByRole('textbox').first().fill('auto-start draft');
      await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
      await ready();
      await page.reload();
      await page.locator('.question-player').waitFor();
      await ready();
      assert.equal((await currentAttempt()).attemptId, first.attemptId);
      assert.equal(await page.getByRole('textbox').first().inputValue(), 'auto-start draft');
      assert.equal((await rows()).attempts.length, 1);
      assert.equal((await rows()).recallEvidence.length, 0);
      assert.deepEqual(await page.evaluate(() => window.__smoothRecall.paragraphs), []);
      return { attemptId: first.attemptId, autostart: true, sameAttemptReload: true, evidence: 0 };
    });
  }
  await check('failed-save-retry-and-cancel-durable', async () => {
    await fixture('igcse', 'fail-save');
    await page.evaluate(() => {
      window.__smoothRecall.failSave = true;
    });
    await page.getByRole('button', { name: 'Mastery Test', exact: true }).click();
    await page.locator('[data-testid=loading-retry]').waitFor();
    assert.equal(await page.locator('.recall-selection').count(), 1);
    assert.equal((await rows()).attempts.length, 0);
    const failedId = await page.evaluate(() => window.__smoothRecall.writes.at(-1));
    await page.evaluate(() => {
      window.__smoothRecall.failSave = false;
    });
    await page.locator('[data-testid=loading-retry]').click();
    await ready();
    assert.equal((await currentAttempt()).attemptId, failedId);
    await page.getByRole('textbox').first().fill('unsaved draft');
    await page.evaluate(() => {
      window.__smoothRecall.failSave = true;
    });
    await page.getByRole('button', { name: 'Back to Recall', exact: true }).click();
    await page.locator('[data-testid=loading-cancel]').waitFor();
    await page.locator('[data-testid=loading-cancel]').click();
    await page.locator('[data-testid=loading-retry]').waitFor();
    assert.equal(await page.locator('#loading-surface').evaluate((el) => el.inert), true);
    await page.evaluate(() => {
      window.__smoothRecall.failSave = false;
    });
    await page.locator('[data-testid=loading-retry]').click();
    await ready();
    const resumed = await currentAttempt();
    assert.equal(resumed.attemptId, failedId);
    assert.equal(await page.getByRole('textbox').first().inputValue(), 'unsaved draft');
    assert.equal((await rows()).recallEvidence.length, 0);
    return { sameAttempt: failedId, failedCancelRetainedInert: true, recoveredDraft: true };
  });
} finally {
  report.finishedAt = new Date().toISOString();
  report.status = report.failures.length || report.pageErrors.length ? 'FAIL' : 'PASS';
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
if (report.status !== 'PASS') process.exitCode = 1;
