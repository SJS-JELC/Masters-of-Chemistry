import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium, projectRoot } from './browser/paths.mjs';
const out = path.join(projectRoot, '.artifacts/recall-formulae/s2/content');
fs.mkdirSync(out, { recursive: true });
const temp = path.join(out, '.tmp');
fs.mkdirSync(temp, { recursive: true });
process.env.TEMP = temp;
process.env.TMP = temp;
if (process.argv.includes('--production')) {
  const productionReport = {
    startedAt: new Date().toISOString(),
    base: 'http://127.0.0.1:5182',
    method:
      'Built production app, pinned Playwright1.62.1 actual headless Microsoft Edge, no DEV hooks.',
    checks: [],
    pageErrors: [],
    failures: [],
  };
  const productionBrowser = await chromium.launch({ channel: 'msedge', headless: true });
  const productionContext = await productionBrowser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const productionPage = await productionContext.newPage();
  productionPage.on('pageerror', (e) => productionReport.pageErrors.push(e.message));
  try {
    await productionPage.goto(productionReport.base + '/recall-formulae-review/index.html');
    assert.equal(await productionPage.locator('a[href^="../?course=igcse"]').count(), 32);
    await productionPage.getByRole('link', { name: 'Review sodium chloride', exact: true }).click();
    await productionPage.locator('.teacher-answer').waitFor();
    assert((await productionPage.locator('.teacher-answer').innerText()).includes('NaCl'));
    assert.equal(
      await productionPage
        .locator('.question-parts input,.question-parts textarea,.question-parts select')
        .count(),
      0,
    );
    assert.equal(await productionPage.evaluate(() => typeof window.__mastersActivity), 'undefined');
    await productionPage.screenshot({
      path: path.join(out, 'production-teacher-pin.png'),
      fullPage: true,
    });
    productionReport.checks.push({
      id: 'built-public-index-first-pin',
      status: 'PASS',
      teacherModel: 'NaCl',
      noLearnerControls: true,
      noDevHarness: true,
    });
    await productionPage.goto(
      productionReport.base +
        '/?course=igcse&view=practice&activity=igcse/formulae&gem=fourth-16-1&level=2&fresh=1',
    );
    await productionPage.locator('.question-player').waitFor();
    await productionPage.locator('.question-parts input').fill('NaCl');
    assert.equal(
      await productionPage.getByRole('button', { name: 'Check', exact: true }).count(),
      1,
    );
    assert(
      (await productionPage.locator('.question-player').innerText()).includes('Compound formula'),
    );
    assert(
      await productionPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    );
    await productionPage.screenshot({
      path: path.join(out, 'production-formulae-practice.png'),
      fullPage: true,
    });
    productionReport.checks.push({
      id: 'built-formulae-practice-closure',
      status: 'PASS',
      grade: '7–8',
      compiledProviderAndPlayer: true,
    });
  } catch (error) {
    productionReport.failures.push({ error: error.stack });
  } finally {
    productionReport.finishedAt = new Date().toISOString();
    productionReport.status =
      productionReport.failures.length || productionReport.pageErrors.length ? 'FAIL' : 'PASS';
    fs.writeFileSync(
      path.join(out, 'production-smoke.json'),
      JSON.stringify(productionReport, null, 2),
    );
    await productionBrowser.close();
    console.log(JSON.stringify(productionReport));
    process.exit(productionReport.status === 'PASS' ? 0 : 1);
  }
}
const diagnostic = process.argv.includes('--diagnostic');
const idle = process.argv.includes('--idle'),
  only = process.argv.find((a) => a.startsWith('--only='))?.slice(7),
  port = 5196;
const run = 'rf-activities-' + Date.now(),
  base = 'http://127.0.0.1:' + port;
const server = spawn(
  process.execPath,
  [
    path.join(projectRoot, 'node_modules/vite/bin/vite.js'),
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
    '--strictPort',
  ],
  { cwd: projectRoot, windowsHide: true, stdio: 'pipe' },
);
let serverLog = '';
server.stdout.on('data', (v) => (serverLog += v));
server.stderr.on('data', (v) => (serverLog += v));
const report = {
  run,
  startedAt: new Date().toISOString(),
  method:
    'Pinned workspace Playwright1.62.1, actual headless Microsoft Edge. UI inputs/check/navigation; immutable evidence read through existing DEV harness. No synthetic clock.',
  checks: [],
  failures: [],
  pageErrors: [],
  screenshots: [],
};
let browser;
const index = JSON.parse(
  fs.readFileSync(
    path.join(projectRoot, 'resources/recall-formulae/content/review-index.json'),
    'utf8',
  ),
);
const snap = (page) => page.evaluate(() => window.__mastersActivity.snapshot()),
  history = (page) => page.evaluate(() => window.__mastersActivity.history());
async function flush(page) {
  await page.evaluate(() => window.__mastersActivity.flush());
  await page.waitForFunction(
    () => window.__mastersActivity.snapshot().saveStatus.kind !== 'saving',
  );
}
async function ready(page) {
  await page.waitForFunction(() => window.__mastersActivity);
  await flush(page);
}
async function shot(page, name) {
  const file = name + '.png';
  await page.screenshot({ path: path.join(out, file), fullPage: true });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    'No horizontal page overflow',
  );
  report.screenshots.push(file);
}
async function fresh(page, activity, level, suffix) {
  const gem = activity === 'igcse/formulae' ? 'fourth-16-1' : 'fourth-16-2';
  await page.goto(
    base +
      '/?' +
      new URLSearchParams({
        course: 'igcse',
        run: run + '-' + suffix,
        view: 'practice',
        activity,
        gem,
        level: String(level),
        fresh: '1',
      }),
  );
  await page.locator('.question-player').waitFor();
  await ready(page);
  return snap(page);
}
async function model(page, wrong = false) {
  const s = await snap(page);
  const sections = page.locator('.question-parts > section');
  for (const [i, p] of s.question.parts.entries()) {
    const section = sections.nth(i);
    if (p.kind === 'text')
      await section.locator('input,textarea').fill(wrong ? 'wrong response' : p.accepted[0]);
    else if (p.kind === 'numeric')
      await section
        .locator('input[data-answer-input]')
        .fill(wrong ? '99' : String(p.acceptance.expected));
    else if (p.kind === 'choice')
      await section
        .locator('select')
        .selectOption(
          wrong
            ? ['s', 'l', 'g', 'aq'].find((v) => v !== p.acceptedOptionSets[0][0])
            : p.acceptedOptionSets[0][0],
        );
  }
  await flush(page);
  return s;
}
async function check(page) {
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.waitForFunction(() => !!window.__mastersActivity.snapshot().attempt?.firstAssessment);
  await flush(page);
}
async function fixture(page, activity, code, suffix) {
  await fresh(page, activity, activity === 'igcse/formulae' ? 2 : 1, suffix);
  await page.evaluate(
    async ({ activity, code }) => {
      const { productionRegistry } = await import('/src/foundation/registry.ts');
      const { createChemistryRepository } = await import('/src/persistence/index.ts');
      const registration = productionRegistry.get(activity),
        provider = await registration.provider(),
        ref = provider.resolveLink(code),
        q = provider.restore(ref),
        namespace = { course: 'igcse', profileId: 'local' },
        target = {
          course: 'igcse',
          activityId: activity,
          gemId: registration.gems[0].id,
          level: ref.level,
        },
        id = crypto.randomUUID();
      const attempt = {
          mode: 'student',
          namespace,
          attemptId: id,
          ref,
          target,
          currentResponses: {},
          assistance: [],
          phase: 'answering',
          timing: {
            attemptId: id,
            activeMs: 0,
            idleLimitMs: registration.idleAllowance(q),
            finished: false,
          },
        },
        session = {
          kind: 'practice',
          namespace,
          id: 'current-session',
          target,
          selection: 'fixed-level',
          currentAttemptId: id,
          previousQuestionIds: [],
          paused: false,
        };
      const result = await createChemistryRepository(
        window.__mastersActivity.snapshot().databaseName,
      ).saveCurriculum({ attempt, session });
      if (!result.ok) throw Error(result.error.message);
    },
    { activity, code },
  );
  await page.reload();
  await ready(page);
  await page.locator('.question-player').waitFor();
  assert.equal((await snap(page)).attempt.ref.questionId, code);
}
async function runCheck(id, fn) {
  if (only && id !== only) return;
  const skipped = (process.argv.find((a) => a.startsWith('--skip='))?.slice(7) || '').split(',');
  if (skipped.includes(id)) return;
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      timezoneId: 'Europe/London',
    }),
    page = await context.newPage();
  page.on('pageerror', (e) => report.pageErrors.push({ id, error: e.message }));
  try {
    const detail = await fn(page);
    report.checks.push({ id, status: 'PASS', ...detail });
    console.log('PASS ' + id);
  } catch (error) {
    report.failures.push({ id, error: error.stack });
    await shot(page, 'failure-' + id).catch(() => {});
    console.log('FAIL ' + id + ' ' + error.message);
  } finally {
    fs.writeFileSync(
      path.join(out, 'in-progress-' + run + '.json'),
      JSON.stringify(report, null, 2),
    );
    await context.close();
  }
}
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  report.browser = await browser.version();
  if (diagnostic) {
    await runCheck('direct-launch-diagnostic', async (page) => {
      const rows = [];
      const consoleErrors = [];
      page.on('console', (m) => {
        if (['error', 'warning'].includes(m.type()))
          consoleErrors.push({ type: m.type(), text: m.text() });
      });
      for (const activity of ['igcse/formulae', 'igcse/equations']) {
        const gem = activity === 'igcse/formulae' ? 'fourth-16-1' : 'fourth-16-2';
        await page.goto(
          base +
            '/?' +
            new URLSearchParams({
              course: 'igcse',
              run: run + '-diagnostic-' + activity.split('/')[1],
              view: 'practice',
              activity,
              gem,
              level: '2',
              fresh: '1',
            }),
        );
        await ready(page);
        await page.waitForTimeout(1500);
        rows.push(
          await page.evaluate(async () => {
            const snapshot = window.__mastersActivity.snapshot();
            const db = await new Promise((resolve, reject) => {
              const request = indexedDB.open(snapshot.databaseName);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            const stores = [...db.objectStoreNames].filter((name) => /attempt|session/i.test(name));
            const records = {};
            for (const name of stores) {
              records[name] = await new Promise((resolve, reject) => {
                const request = db.transaction(name).objectStore(name).getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });
            }
            db.close();
            return {
              url: location.href,
              text: document.body.innerText,
              snapshot,
              indexedDB: { name: snapshot.databaseName, records },
            };
          }),
        );
      }
      const detail = { rows, consoleErrors };
      fs.writeFileSync(
        path.join(out, 'direct-launch-diagnostic.json'),
        JSON.stringify(detail, null, 2),
      );
      return detail;
    });
  } else if (!idle) {
    await runCheck('levels-and-free-landing', async (page) => {
      await page.goto(base + '/?course=igcse&run=' + run + '-levels');
      await page.locator('.original-landing.igcse').waitFor();
      const registry = await page.evaluate(async () => {
        const { productionRegistry } = await import('/src/foundation/registry.ts');
        return ['igcse/formulae', 'igcse/equations'].map((id) => {
          const r = productionRegistry.get(id);
          return { id: r.id, gems: r.gems, revision: r.revision, release: r.release };
        });
      });
      assert.deepEqual(
        registry.map((r) => r.gems[0].supportedLevels),
        [
          [1, 2],
          [1, 2, 3],
        ],
      );
      assert(registry.every((r) => r.revision && r.release === 'included'));
      for (const [gem, levels] of [
        ['fourth-16-1', 2],
        ['fourth-16-2', 3],
      ]) {
        await page.evaluate((gem) => (location.hash = gem), gem);
        await page.locator('#gemDetails').waitFor({ state: 'visible' });
        const links = page.locator(
          '#gemDetails a.practice-choice[data-practice="1"],#gemDetails a.practice-choice[data-practice="2"],#gemDetails a.practice-choice[data-practice="3"]',
        );
        assert.equal(await links.count(), levels);
        assert.equal(await links.filter({ hasText: /9/ }).count(), levels === 2 ? 0 : 1);
        await shot(page, 'landing-' + gem);
        await page.getByRole('button', { name: 'Close topic details', exact: true }).click();
      }
      for (const [activity, level] of [
        ['igcse/formulae', 1],
        ['igcse/formulae', 2],
        ['igcse/equations', 1],
        ['igcse/equations', 2],
        ['igcse/equations', 3],
      ]) {
        const s = await fresh(page, activity, level, 'level-' + activity.split('/')[1] + level);
        assert.equal(s.attempt.ref.level, level);
        assert.equal(s.attempt.ref.activityId, activity);
      }
      return {
        supportedLevels: [
          [1, 2],
          [1, 2, 3],
        ],
        allFiveGradeLaunches: true,
      };
    });
    await runCheck('representative-controls-desktop-mobile', async (page) => {
      const cases = [
        ['igcse/formulae', 'RF1:magnesium-chloride:123'],
        ['igcse/formulae', 'RF1:aluminium-sulfate:123'],
        ['igcse/equations', 'EQ-simple-balance-01'],
        ['igcse/equations', 'EQ-states-04'],
        ['igcse/equations', 'EQ-complex-balance-02'],
        ['igcse/equations', 'EQ-simple-words-01'],
        ['igcse/equations', 'EQ-complex-words-04'],
        ['igcse/equations', 'EQ-paragraph-02'],
      ];
      for (const [activity, code] of cases) {
        await fixture(page, activity, code, 'render-' + code);
        const s = await snap(page);
        assert.equal(
          await page
            .locator('.question-parts input,.question-parts textarea,.question-parts select')
            .count(),
          s.question.parts.length,
        );
        await shot(page, 'desktop-' + code.replaceAll(':', '-'));
        await page.setViewportSize({ width: 390, height: 844 });
        await shot(page, 'mobile-' + code.replaceAll(':', '-'));
        await model(page);
        await check(page);
        const assessed = await snap(page);
        assert.equal(
          assessed.attempt.firstAssessment.marks.earned,
          assessed.attempt.firstAssessment.marks.available,
        );
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
      return {
        representativeControls: cases.map((c) => c[1]),
        desktop: [1440, 1000],
        mobile: [390, 844],
        modelAssessments: 8,
      };
    });
    for (const activity of ['igcse/formulae', 'igcse/equations'])
      await runCheck('standalone-immutable-' + activity.split('/')[1], async (page) => {
        const started = await fresh(page, activity, 2, 'immutable-' + activity.split('/')[1]);
        await model(page, true);
        await page.waitForTimeout(1100);
        await check(page);
        const first = await snap(page),
          evidence = await history(page);
        assert.equal(evidence.length, 1);
        assert.equal(first.attempt.firstAssessment.marks.earned, 0);
        assert.deepEqual(evidence[0].timing, first.attempt.firstResponse.timing);
        const frozen = first.attempt.firstResponse.timing;
        assert.equal(frozen.idleLimitMs, activity === 'igcse/formulae' ? 60000 : 180000);
        await model(page);
        await page.getByRole('button', { name: 'Check', exact: true }).click();
        await page.waitForFunction(() => !!window.__mastersActivity.snapshot().correctionFeedback);
        await flush(page);
        assert.deepEqual(await history(page), evidence);
        assert.deepEqual((await snap(page)).attempt.firstAssessment, first.attempt.firstAssessment);
        await page.waitForTimeout(1200);
        assert.deepEqual((await snap(page)).attempt.firstResponse.timing, frozen);
        await page.reload();
        await page.locator('.question-player').waitFor();
        await ready(page);
        assert.equal((await snap(page)).attempt.attemptId, started.attempt.attemptId);
        assert.deepEqual(await history(page), evidence);
        await page.getByRole('button', { name: 'Next', exact: true }).click();
        await page.waitForFunction(
          (id) => window.__mastersActivity.snapshot().attempt?.attemptId !== id,
          first.attempt.attemptId,
        );
        await flush(page);
        const next = await snap(page);
        assert.equal(next.attempt.phase, 'answering');
        assert(next.attempt.timing.activeMs < 2000);
        assert.notEqual(next.attempt.ref.questionId, first.attempt.ref.questionId);
        await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
        await page.getByRole('button', { name: 'Stats', exact: true }).click();
        await page.getByTestId('statistics-time').waitFor();
        assert.equal(
          Number(await page.getByTestId('statistics-time').getAttribute('data-active-ms')),
          frozen.activeMs,
        );
        await shot(page, 'stats-' + activity.split('/')[1]);
        return {
          firstAttemptId: first.attempt.attemptId,
          firstActiveMs: frozen.activeMs,
          immutableEvidence: true,
          freshNext: true,
        };
      });
    for (const activity of ['igcse/formulae', 'igcse/equations'])
      await runCheck('pause-restore-' + activity.split('/')[1], async (page) => {
        const first = await fresh(page, activity, 2, 'restore-' + activity.split('/')[1]);
        await model(page);
        const saved = await snap(page),
          returnURL = page.url();
        await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
        await page.locator('.original-landing').waitFor();
        await page.goto(returnURL);
        await page.locator('.question-player').waitFor();
        await ready(page);
        const resumed = await snap(page);
        assert.equal(resumed.attempt.attemptId, first.attempt.attemptId);
        assert.deepEqual(resumed.attempt.ref, first.attempt.ref);
        assert.deepEqual(resumed.attempt.currentResponses, saved.attempt.currentResponses);
        await page.reload();
        await page.locator('.question-player').waitFor();
        await ready(page);
        assert.deepEqual(
          (await snap(page)).attempt.currentResponses,
          saved.attempt.currentResponses,
        );
        await check(page);
        assert.equal((await history(page)).length, 1);
        return { sameAttemptAndSeed: true, responsesRestored: true, reload: true };
      });
    for (const activity of ['igcse/formulae', 'igcse/equations'])
      await runCheck('reveal-exclusion-' + activity.split('/')[1], async (page) => {
        await fresh(page, activity, 1, 'reveal-' + activity.split('/')[1]);
        await page.getByRole('button', { name: 'Give Up', exact: true }).click();
        await page.locator('.worked-answer').waitFor();
        await flush(page);
        const s = await snap(page);
        assert(s.attempt.assistance.length > 0);
        assert.equal((await history(page)).length, 0);
        assert.equal(s.attempt.phase, 'assessed');
        const revealedTiming = s.attempt.firstResponse.timing;
        await page.waitForTimeout(1100);
        assert.deepEqual((await snap(page)).attempt.firstResponse.timing, revealedTiming);
        await model(page);
        await page.getByRole('button', { name: 'Check', exact: true }).click();
        await flush(page);
        assert.equal((await history(page)).length, 0);
        return { noIndependentEvidence: true, clockFinished: true };
      });
    await runCheck('revision-topic-add-all-and-progression', async (page) => {
      await page.goto(base + '/?course=igcse&run=' + run + '-revision');
      await page.locator('.original-landing').waitFor();
      await page.getByRole('button', { name: 'Revision', exact: true }).click();
      const topic = page.locator('[data-topic="fourth-topic-16"]');
      await topic.locator('.topic-trigger').click();
      await topic.locator('.test-topic-all').click();
      assert.equal(await page.locator('#testSelectionCount').innerText(), '2 gems selected');
      await page.getByRole('button', { name: 'Go: start revision', exact: true }).click();
      await page.locator('.question-player').waitFor();
      await ready(page);
      const first = await snap(page);
      assert.equal(first.session.kind, 'revision');
      assert.equal(first.session.levels.length, 5);
      assert.deepEqual(first.session.selectedGemIds.slice().sort(), ['fourth-16-1', 'fourth-16-2']);
      await model(page);
      await check(page);
      const assessed = await snap(page),
        evidence = await history(page);
      assert.equal(evidence.length, 1);
      assert.equal(
        assessed.attempt.firstAssessment.marks.earned,
        assessed.attempt.firstAssessment.marks.available,
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.waitForFunction(
        (id) => window.__mastersActivity.snapshot().attempt?.attemptId !== id,
        first.attempt.attemptId,
      );
      await flush(page);
      const next = await snap(page);
      assert.equal(
        next.session.submittedAttemptIds.filter((id) => id === first.attempt.attemptId).length,
        1,
      );
      assert.equal(next.attempt.phase, 'answering');
      assert(next.attempt.timing.activeMs < 2000);
      const currentURL = page.url();
      await model(page);
      const responses = (await snap(page)).attempt.currentResponses;
      await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
      await page.goto(currentURL);
      await page.locator('.question-player').waitFor();
      await ready(page);
      assert.equal((await snap(page)).attempt.attemptId, next.attempt.attemptId);
      assert.deepEqual((await snap(page)).attempt.currentResponses, responses);
      await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
      await page.getByRole('button', { name: 'Stats', exact: true }).click();
      await page.getByTestId('statistics-time').waitFor();
      assert.equal(
        Number(await page.getByTestId('statistics-time').getAttribute('data-active-ms')),
        evidence[0].timing.activeMs,
      );
      return {
        selectedGems: 2,
        expandedSupportedLevels: 5,
        firstScore: true,
        deduplicatedProgression: true,
        resume: true,
        statsTimeMs: evidence[0].timing.activeMs,
      };
    });
    await runCheck('display-arrow-and-review-navigation', async (page) => {
      for (const code of ['EQ-simple-balance-01', 'EQ-complex-words-04']) {
        await fixture(page, 'igcse/equations', code, 'arrow-' + code);
        const q = (await snap(page)).question;
        assert(
          q.context.some(
            (b) => (b.kind === 'text' || b.kind === 'formula') && b.text.includes('→'),
          ),
        );
        await shot(page, 'arrow-desktop-' + code);
        await page.setViewportSize({ width: 390, height: 844 });
        await shot(page, 'arrow-mobile-' + code);
        await model(page);
        await check(page);
        const s = await snap(page);
        assert.equal(
          s.attempt.firstAssessment.marks.earned,
          s.attempt.firstAssessment.marks.available,
        );
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
      await page.goto(base + '/recall-formulae-review/index.html');
      assert.equal(await page.locator('a[href^="../?course=igcse"]').count(), 32);
      await page.getByRole('link', { name: 'Review sodium chloride', exact: true }).click();
      await page.locator('.teacher-answer').waitFor();
      await ready(page);
      assert((await page.locator('.teacher-answer').innerText()).includes('NaCl'));
      assert.equal((await history(page)).length, 0);
      return {
        displayOnlyArrowFix: true,
        affectedModelAssessments: 2,
        prefixSafeRelativeLinks: 32,
        actualReviewIndexNavigation: true,
      };
    });
    await runCheck('teacher-all-32-and-review-index', async (page) => {
      for (const e of index.entries) {
        await page.goto(base + e.reviewLink + '&run=' + run + '-teacher');
        await page.locator('.teacher-answer').waitFor();
        await ready(page);
        assert(
          await page
            .locator('.teacher-answer')
            .innerText()
            .then((text) => text.includes(e.answer)),
        );
        assert.equal((await snap(page)).attempt, null);
        assert.equal((await history(page)).length, 0);
        assert.equal(
          await page
            .locator('.question-parts input,.question-parts textarea,.question-parts select')
            .count(),
          0,
        );
      }
      await page.goto(base + '/recall-formulae-review/index.html');
      assert.equal(await page.locator('tbody tr').count(), 32);
      assert.equal(await page.locator('a[href*="view=teacher"]').count(), 32);
      await shot(page, 'teacher-review-index-desktop');
      await page.setViewportSize({ width: 390, height: 844 });
      await shot(page, 'teacher-review-index-mobile');
      return {
        teacherLinks: 32,
        teacherEvidence: 0,
        reviewIndexPath: '/recall-formulae-review/index.html',
      };
    });
  } else
    await runCheck('actual-formulae-60s-idle-first-freeze', async (page) => {
      await fresh(page, 'igcse/formulae', 1, 'real-idle');
      await model(page);
      await page.evaluate(() => window.__mastersActivity.checkpoint());
      const start = await snap(page);
      const visible = await page.evaluate(() => ({
        hidden: document.hidden,
        focused: document.hasFocus(),
      }));
      assert(!visible.hidden && visible.focused);
      console.log('START actual 60s idle ' + new Date().toISOString());
      for (let i = 0; i < 7; i++) await page.waitForTimeout(10000);
      await page.evaluate(() => window.__mastersActivity.checkpoint());
      const plateau = await snap(page);
      await page.waitForTimeout(6500);
      await page.evaluate(() => window.__mastersActivity.checkpoint());
      const still = await snap(page);
      assert.equal(still.attempt.attemptId, start.attempt.attemptId);
      assert.equal(still.attempt.timing.activeMs, plateau.attempt.timing.activeMs);
      assert(plateau.attempt.timing.activeMs >= 59000 && plateau.attempt.timing.activeMs <= 62000);
      await model(page);
      await check(page);
      const first = await snap(page),
        evidence = await history(page);
      assert.equal(evidence.length, 1);
      assert.deepEqual(evidence[0].timing, first.attempt.firstResponse.timing);
      await page.waitForTimeout(1500);
      assert.deepEqual(
        (await snap(page)).attempt.firstResponse.timing,
        first.attempt.firstResponse.timing,
      );
      return {
        idleLimitMs: 60000,
        actualPlateauMs: plateau.attempt.timing.activeMs,
        observedPlateauWallMs: 6500,
        sameAttempt: true,
        frozenTimeTransferred: true,
      };
    });
} catch (error) {
  report.failures.push({ id: 'setup', error: error.stack });
} finally {
  report.status = report.failures.length || report.pageErrors.length ? 'FAIL' : 'PASS';
  report.finishedAt = new Date().toISOString();
  const name = diagnostic
    ? 'diagnostic-browser-results.json'
    : idle
      ? 'idle-browser-results.json'
      : only
        ? 'rerun-' + only + '.json'
        : 'browser-results.json';
  fs.writeFileSync(path.join(out, name), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(out, 'server.log'), serverLog);
  await browser?.close();
  server.kill();
  console.log(
    JSON.stringify({
      status: report.status,
      checks: report.checks.length,
      failures: report.failures,
      pageErrors: report.pageErrors,
    }),
  );
  if (report.status !== 'PASS') process.exitCode = 1;
}
