import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..'),
  out = path.join(app, '.artifacts/recall-formulae/s1/recall');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const port = 5198,
  server = spawn(
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
let serverLog = '';
server.stdout.on('data', (x) => (serverLog += x));
server.stderr.on('data', (x) => (serverLog += x));
const base = 'http://127.0.0.1:' + port;
let browser;
const checks = [],
  errors = [];
try {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext(),
    page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  const fixture = base + '/scripts/tests/recall-formulae-recall.browser.html';
  await page.goto(fixture + '?run=db', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.rf);
  const storage = await page.evaluate(async () => {
    const x = window.rf,
      namespace = { course: 'igcse', profileId: 'p1' },
      repository = x.createRepository('masters-of-chemistry-alpha-v2-recall-invariants');
    const ref = x.recallRef('igcse', 'igcse-recall-007'),
      question = x.createRecallProvider(x.recallFacts, 'igcse').restore(ref);
    let sample = {
      monotonicMs: 0,
      wallMs: Date.parse('2026-10-10T09:00:00Z'),
      visible: true,
      focused: true,
      suspended: false,
    };
    const attemptId = 'db-first',
      initial = {
        mode: 'student',
        namespace,
        attemptId,
        ref,
        target: {
          kind: 'recall',
          course: 'igcse',
          activityId: 'igcse/recall',
          factId: ref.questionId,
          level: 1,
        },
        currentResponses: {},
        assistance: [],
        phase: 'answering',
        timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
      };
    const clock = x.createActiveClock({ attemptId, idleLimitMs: 60000, now: () => sample }),
      controller = x.createAttemptController({
        state: initial,
        question,
        clock,
        policy: x.createRecallMarkingPolicy(x.recallFacts),
        sample: () => sample,
      });
    controller.dispatch({
      kind: 'respond',
      partId: 'answer',
      response: { kind: 'text', value: 'melting' },
    });
    sample = { ...sample, monotonicMs: 1000, wallMs: sample.wallMs + 1000 };
    controller.sample(sample);
    const draft = await repository.saveRecall({ attempt: controller.checkpoint() }),
      loadedDraft = await repository.loadRecallAttempt(namespace, attemptId);
    controller.dispatch({ kind: 'submit', at: sample.wallMs });
    const assessed = controller.state();
    const first = await repository.saveRecall({ attempt: assessed }),
      duplicate = await repository.saveRecall({ attempt: assessed });
    const history = await repository.recallHistory(namespace),
      progress = await repository.recallProgress(namespace),
      curriculum = await repository.curriculumHistory(namespace),
      otherProfile = await repository.recallHistory({ ...namespace, profileId: 'p2' }),
      otherCourse = await repository.recallHistory({ course: 'alevel', profileId: 'p1' });
    const changed = structuredClone(assessed);
    changed.firstAssessment.score = 0;
    changed.firstAssessment.marks.earned = 0;
    changed.firstAssessment.marks.points[0].earned = 0;
    const conflict = await repository.saveRecall({ attempt: changed });
    const curry = await repository.saveCurriculum({ attempt: assessed });
    const teacher = await repository.saveRecall({
      attempt: { mode: 'teacher', ref, currentResponses: {} },
    });
    const session = x.createRecallSession(
      namespace,
      'whole',
      'recall-practice',
      x.factsFor('igcse', ['fourth-16-1']).map((f) => f.id),
      ['fourth-16-1'],
    );
    const storedSession = await repository.saveRecallSession(session),
      partial = await repository.saveRecallSession({
        ...session,
        factIds: session.factIds.slice(1),
      });
    repository.close();
    const fault = x.createRepository('masters-of-chemistry-alpha-v2-recall-rollback', (point) => {
      if (point === 'after-evidence') throw Error('rollback-fixture');
    });
    const failed = await fault.saveRecall({ attempt: assessed }),
      rollbackHistory = await fault.recallHistory(namespace),
      rollbackAttempt = await fault.loadRecallAttempt(namespace, attemptId),
      rollbackProgress = await fault.recallProgress(namespace);
    fault.close();
    return {
      draft,
      loadedDraft,
      first,
      duplicate,
      history,
      progress,
      curriculum,
      otherProfile,
      otherCourse,
      conflict,
      curry,
      teacher,
      storedSession,
      partial,
      failed,
      rollbackHistory,
      rollbackAttempt,
      rollbackProgress,
    };
  });
  assert(storage.draft.ok && storage.loadedDraft.ok);
  assert.equal(storage.loadedDraft.value.currentResponses.answer.value, 'melting');
  assert.equal(storage.loadedDraft.value.timing.activeMs, 1000);
  assert.equal(storage.first.value.evidence, 'inserted');
  assert.equal(storage.duplicate.value.evidence, 'already-present');
  assert.equal(storage.history.value.length, 1);
  assert.equal(storage.progress.value[0].stage, 1);
  assert.equal(storage.curriculum.value.length, 0);
  assert.equal(storage.otherProfile.value.length, 0);
  assert.equal(storage.otherCourse.value.length, 0);
  assert.equal(storage.conflict.ok, false);
  assert.equal(storage.curry.ok, false);
  assert.equal(storage.teacher.ok, false);
  assert(storage.storedSession.ok);
  assert.equal(storage.partial.ok, false);
  assert.equal(storage.failed.ok, false);
  assert.equal(storage.rollbackHistory.value.length, 0);
  assert.equal(storage.rollbackAttempt.value, null);
  assert.equal(storage.rollbackProgress.value.length, 0);
  checks.push(
    'actual IndexedDB transaction/dedupe/rollback, namespaces, deterministic result and curriculum/teacher rejection',
  );
  await page.goto(fixture + '?run=ui', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('textbox').first().fill('aq');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Independent recall checked' }).waitFor();
  const before = await page.evaluate(async () => {
    const r = window.rf.createRepository('masters-of-chemistry-alpha-v2-recall-browser-ui');
    const namespace = { course: 'igcse', profileId: 'local' },
      h = await r.recallHistory(namespace),
      s = await r.loadRecallSession(namespace, 'recall:recall-practice:global');
    r.close();
    return { h, s };
  });
  assert.equal(before.h.value.length, 1);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Practise whole set / resume' }).click();
  await page.getByRole('status').filter({ hasText: 'Independent recall checked' }).waitFor();
  const after = await page.evaluate(async () => {
    const r = window.rf.createRepository('masters-of-chemistry-alpha-v2-recall-browser-ui');
    const h = await r.recallHistory({ course: 'igcse', profileId: 'local' });
    r.close();
    return h;
  });
  assert.deepEqual(after.value, before.h.value);
  checks.push(
    'shared player typed Check and reload restores immutable first result without duplicate or extra time',
  );
  await page.screenshot({ path: path.join(out, 'recall-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page
    .getByText('What is the name for the change of state from a solid to a liquid?', {
      exact: true,
    })
    .waitFor();
  await page.getByRole('textbox').first().fill('wrong');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'This fact remains due now.' }).waitFor();
  checks.push('Next creates fresh fact/attempt; incorrect first check remains due');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(out, 'recall-mobile.png'), fullPage: true });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  checks.push('390px mobile controls fit without horizontal overflow');
  await page.goto(fixture + '?run=teacher&mode=teacher', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Teacher preview' }).click();
  await page.getByText('This read-only view creates no assessment or progress evidence.').waitFor();
  assert.equal(await page.getByRole('textbox').count(), 0);
  checks.push('teacher same player model preview produces no response/evidence');
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, 'browser.json'),
    JSON.stringify(
      {
        status: 'PASS',
        checks,
        storage,
        errors,
        inspection:
          'Headless Edge desktop/mobile; exported screenshots inspected separately. Native manual browser timing acceptance remains final integration gate.',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ status: 'PASS', checks }, null, 2));
} catch (e) {
  fs.writeFileSync(
    path.join(out, 'browser-failure.json'),
    JSON.stringify({ status: 'FAIL', message: String(e), checks, errors, serverLog }, null, 2) +
      '\n',
  );
  throw e;
} finally {
  await browser?.close();
  server.kill();
}
