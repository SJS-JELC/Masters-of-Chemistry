import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..');
const out = path.join(app, '.artifacts/recall-formulae/s2/recall');
fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const port = 5199,
  base = 'http://127.0.0.1:' + port;
const run = 'recall-s2-' + Date.now();
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
let serverLog = '',
  browser,
  nativeBrowser;
server.stdout.on('data', (x) => (serverLog += x));
server.stderr.on('data', (x) => (serverLog += x));
const checks = [],
  samples = {},
  errors = [];
let activeRevision = false;
const route = (course, query = '') =>
  base + '/' + course + '.html?course=' + course + '&run=' + run + '&' + query;
async function snapshot(page, course) {
  return page.evaluate(
    async ({ course, run }) => {
      const { createRepository } = await import('/src/persistence/repository.ts');
      const r = createRepository('masters-of-chemistry-alpha-v2-' + course + '-' + run);
      const n = { course, profileId: 'local' };
      const history = await r.recallHistory(n),
        progress = await r.recallProgress(n),
        curriculum = await r.curriculumHistory(n);
      const db = await new Promise((resolve, reject) => {
        const q = indexedDB.open('masters-of-chemistry-alpha-v2-' + course + '-' + run);
        q.onsuccess = () => resolve(q.result);
        q.onerror = () => reject(q.error);
      });
      const read = (name) =>
        new Promise((resolve, reject) => {
          const q = db.transaction(name).objectStore(name).getAll();
          q.onsuccess = () => resolve(q.result.map((row) => row.value));
          q.onerror = () => reject(q.error);
        });
      const attempts = await read('recallAttempts'),
        sessions = await read('recallSessions');
      db.close();
      r.close();
      return {
        history: history.value,
        progress: progress.value,
        curriculum: curriculum.value,
        attempts,
        sessions,
      };
    },
    { course, run },
  );
}
async function awaitStore(page, course, predicate) {
  for (let i = 0; i < 80; i++) {
    const s = await snapshot(page, course);
    if (predicate(s)) return s;
    await page.waitForTimeout(100);
  }
  throw Error('Saved recall condition timed out for ' + course);
}
async function answerCurrent(page, course) {
  const s = await snapshot(page, course);
  const gem = new URL(page.url()).searchParams.get('recallGem');
  const current = s.sessions.find(
    (x) =>
      x.status === 'active' &&
      x.currentAttemptId &&
      (activeRevision
        ? x.kind === 'recall-revision'
        : x.kind === 'recall-practice' && (gem ? x.gemIds?.includes(gem) : x.gemIds === null)),
  );
  assert(current, 'Displayed recall session must exist');
  const data = await page.evaluate(async (id) => {
    const { recallFacts } = await import('/src/recall/facts.ts');
    const { recallFields } = await import('/src/recall/marking.ts');
    const f = recallFacts.find((f) => f.id === id);
    return { fact: f, fields: recallFields(f) };
  }, current.currentFactId);
  const inputs = page.getByRole('textbox');
  for (const [index, field] of data.fields.entries()) await inputs.nth(index).fill(field.answer);
  return { current, data };
}
async function start(page, revision = false) {
  activeRevision = revision;
  await page
    .getByRole('button', {
      name: revision ? 'Revise due facts / resume' : 'Practise whole set / resume',
      exact: true,
    })
    .click();
  await page.getByRole('textbox').first().waitFor();
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  for (const course of ['igcse', 'alevel']) {
    await page.goto(route(course, 'view=recall'), { waitUntil: 'networkidle' });
    await start(page);
    await page.getByRole('textbox').first().fill('draft to restore');
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: 'Pause and choose set' }).click();
    const paused = await awaitStore(page, course, (s) =>
      s.sessions.some((x) => x.status === 'paused'),
    );
    const pausedSession = paused.sessions.find((x) => x.status === 'paused');
    const draft = paused.attempts.find((x) => x.attemptId === pausedSession.currentAttemptId);
    assert.equal(draft.currentResponses.answer.value, 'draft to restore');
    await page.reload({ waitUntil: 'networkidle' });
    await start(page);
    assert.equal(await page.getByRole('textbox').first().inputValue(), 'draft to restore');
    const resumed = await snapshot(page, course);
    assert.equal(
      resumed.sessions.find((x) => x.status === 'active').currentAttemptId,
      draft.attemptId,
    );
    const { data } = await answerCurrent(page, course);
    await page.waitForTimeout(1100);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    const first = await awaitStore(page, course, (s) => s.history.length === 1);
    assert.equal(first.history[0].outcome, 'correct');
    assert(first.history[0].firstResponse.timing.activeMs >= 1000);
    assert.equal(first.curriculum.length, 0);
    assert.equal(first.progress[0].stage, 1);
    const firstEvidence = structuredClone(first.history[0]);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
    await page.getByRole('status').filter({ hasText: 'Independent recall checked' }).waitFor();
    assert.deepEqual((await snapshot(page, course)).history, first.history);
    await page.screenshot({ path: path.join(out, course + '-recall-desktop.png'), fullPage: true });
    const gem = data.fact.gemIds[0];
    await page.goto(route(course, 'view=recall&recallGem=' + gem), { waitUntil: 'networkidle' });
    await start(page);
    const second = await answerCurrent(page, course);
    assert.equal(second.data.fact.id, data.fact.id);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    const shared = await awaitStore(page, course, (s) => s.history.length === 2);
    assert.equal(shared.progress.length, 1);
    assert.deepEqual(shared.progress[0].dueAt, first.progress[0].dueAt);
    assert.equal(shared.progress[0].stage, 1);
    checks.push(
      course +
        ': global/gem share one fact schedule; Check/dedupe/pause/reload/response/attempt/time restoration; separate curriculum evidence',
    );
    await page.goto(route(course, 'view=recall'), { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'ADD ALL gems with facts' }).click();
    await start(page, true);
    let due = await answerCurrent(page, course);
    assert.notEqual(due.data.fact.id, data.fact.id);
    const preReveal = await snapshot(page, course);
    await page.getByRole('button', { name: 'Give Up', exact: true }).click();
    const revealed = await awaitStore(page, course, (s) => s.history.length === 3);
    assert.equal(
      revealed.history.find((x) => x.id === due.current.currentAttemptId).outcome,
      'revealed',
    );
    assert.equal(revealed.progress.find((x) => x.factId === due.data.fact.id).stage, 0);
    const summary = await page
      .getByRole('region', { name: 'Recall statistics' })
      .innerText()
      .catch(() => page.locator('[aria-label="Recall statistics"]').innerText());
    assert.match(summary, /2 independent successes/);
    await answerCurrent(page, course);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.waitForTimeout(250);
    assert.deepEqual((await snapshot(page, course)).history, revealed.history);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(250);
    const next = await answerCurrent(page, course);
    assert.notEqual(next.current.currentAttemptId, due.current.currentAttemptId);
    assert.notEqual(next.current.currentFactId, due.current.currentFactId);
    for (const input of await page.getByRole('textbox').all()) await input.fill('wrong');
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    const wrong = await awaitStore(page, course, (s) => s.history.length === 4);
    assert.equal(
      wrong.history.find((x) => x.id === next.current.currentAttemptId).outcome,
      'wrong',
    );
    await answerCurrent(page, course);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.waitForTimeout(250);
    assert.deepEqual((await snapshot(page, course)).history, wrong.history);
    const empty = await page.evaluate(async (course) => {
      const { recallCoverage } = await import('/src/recall/facts.ts');
      return recallCoverage(course).find((g) => !g.factIds.length);
    }, course);
    await page.goto(route(course, 'view=recall&recallGem=' + empty.gemId), {
      waitUntil: 'networkidle',
    });
    assert(await page.getByRole('button', { name: 'Practise whole set / resume' }).isDisabled());
    assert.match(await page.locator('.recall-selection').innerText(), /0 approved facts/);
    checks.push(
      course +
        ': ADD ALL/due revision excludes learned fact, scheduler Next fresh attempt, reveal/retry excluded from success, wrong first result frozen, empty coverage explicit',
    );
    samples[course] = {
      firstEvidence,
      shared: shared.progress,
      finalHistory: wrong.history,
      emptyGem: empty.gemId,
      revisionSelection: preReveal.sessions.find((s) => s.kind === 'recall-revision'),
    };
    const teacherGem = await page.evaluate(async (course) => {
      const { recallCoverage } = await import('/src/recall/facts.ts');
      return recallCoverage(course).find((g) => g.factIds.length > 1).gemId;
    }, course);
    await page.goto(route(course, 'view=recall&mode=teacher&recallGem=' + teacherGem), {
      waitUntil: 'networkidle',
    });
    const beforeTeacher = await snapshot(page, course);
    await page.getByRole('button', { name: 'Teacher preview', exact: true }).click();
    assert.equal(await page.getByRole('textbox').count(), 0);
    const prompt = await page.locator('.question-player').innerText();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    assert.notEqual(await page.locator('.question-player').innerText(), prompt);
    assert.deepEqual(await snapshot(page, course), beforeTeacher);
    checks.push(
      course + ': teacher Next traverses models with no attempts/evidence/progress/session writes',
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route('igcse', 'view=recall&recallGem=fourth-16-1'), {
    waitUntil: 'networkidle',
  });
  await start(page);
  await page.screenshot({ path: path.join(out, 'igcse-recall-mobile.png'), fullPage: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  checks.push('390px production recall fits without horizontal overflow');
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, 'production-browser.json'),
    JSON.stringify({ status: 'PASS', run, checks, samples, errors }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ status: 'PASS', checks }, null, 2));
} catch (e) {
  fs.writeFileSync(
    path.join(out, 'production-browser-failure.json'),
    JSON.stringify(
      { status: 'FAIL', message: String(e), checks, samples, errors, serverLog },
      null,
      2,
    ) + '\n',
  );
  throw e;
} finally {
  await nativeBrowser?.close();
  await browser?.close();
  server.kill();
}
