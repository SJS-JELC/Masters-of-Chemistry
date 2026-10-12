import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, projectRoot } from './browser/paths.mjs';
import { productionRegistry } from '../src/foundation/registry.ts';

const base = process.env.SMOOTH_LOADING_APP_URL || 'http://127.0.0.1:5261';
const out = path.join(projectRoot, '.artifacts/smooth-loading/s2-curriculum');
fs.mkdirSync(path.join(out, 'screenshots'), { recursive: true });
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = out + '/.tmp';
process.env.TMP = process.env.TEMP;
const corpus = JSON.parse(
  fs.readFileSync(
    path.join(projectRoot, 'scripts/browser/fixtures/component-fidelity.json'),
    'utf8',
  ),
);
const fixtures = [];
const requested = process.argv
  .find((value) => value.startsWith('--only='))
  ?.slice(7)
  .split(',');
for (const course of ['alevel', 'igcse'])
  for (const registration of productionRegistry.curriculumFor(course)) {
    let fixture = corpus.find((value) => value.activity === registration.id);
    if (!fixture) {
      const gem = registration.gems[0],
        level = gem.supportedLevels[0],
        provider = await registration.provider();
      const ref = provider.select({
        activityId: registration.id,
        gemId: gem.id,
        level,
        seed: 7,
        previousQuestionIds: [],
      });
      fixture = {
        course,
        activity: registration.id,
        gem: gem.id,
        ref,
        question: provider.restore(ref),
      };
    }
    if (registration.id === 'igcse/dot-and-cross') {
      const { getRecord, categoryByGem } = await import(
        '../src/activities/igcse/dot-and-cross/provider.ts'
      );
      const category = getRecord(fixture.ref.questionId).category;
      const matching = Object.entries(categoryByGem).find(([, value]) => value === category)?.[0];
      assert(
        matching &&
          registration.gems.some(
            (gem) => gem.id === matching && gem.supportedLevels.includes(fixture.ref.level),
          ),
        'Canonical dot fixture must use its supported source category',
      );
      fixture = { ...fixture, gem: matching };
    }
    fixtures.push({ ...fixture, name: registration.id.replace('/', '-') });
  }
fixtures.push({
  ...corpus.find(
    (value) =>
      value.activity === 'igcse/energy-enthalpy' &&
      value.question.parts.some((part) => part.kind === 'energy-profile'),
  ),
  name: 'igcse-energy-profile',
});
const report = {
  jobId: 'SL-CURRICULUM-ALL',
  agentId: 'A02',
  startedAt: new Date().toISOString(),
  checks: [],
  failures: [],
  pageErrors: [],
  screenshots: [],
  method:
    'Pinned Playwright 1.62.1 and actual Edge; checked canonical fixtures seeded in fresh synthetic namespaces, native Home/Back/Next, browser-only deferred actual tool-preparer instrumentation.',
  limits: [
    'Headless foreground only; native hidden/background/suspension gates remain separately assigned.',
    'This suite supplements the foreman cross-view browser acceptance; no historical app storage is used.',
  ],
  ...(requested ? { requestedGroups: requested } : {}),
};
if (requested) {
  const names = new Set([
    ...fixtures.map((fixture) => fixture.name),
    'standalone-setup-and-teacher',
  ]);
  assert(
    requested.length && requested.every((name) => names.has(name)),
    'Unknown requested browser group',
  );
}
const browser = await chromium.launch({ channel: 'msedge', headless: true });
report.browser = browser.version();
const saveReport = () =>
  fs.writeFileSync(
    path.join(out, requested ? 'browser-report-focused.json' : 'browser-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );
const snapshot = (page) => page.evaluate(() => window.__mastersActivity.snapshot());
const flush = (page) => page.evaluate(() => window.__mastersActivity.flush());
const settled = (page) =>
  page.waitForFunction(
    () =>
      window.__mastersLoading &&
      !window.__mastersLoading.snapshot().pending &&
      !window.__mastersLoading.snapshot().error,
  );

async function context() {
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    window.__smoothFamilyToolsDelay = 0;
    window.__smoothFamilyTools = [];
    window.__smoothFamilyParagraphs = [];
    window.__smoothFamilyAttemptWrites = [];
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      if (this.name === 'attempts')
        window.__smoothFamilyAttemptWrites.push(args[0]?.value?.attemptId);
      return originalPut.apply(this, args);
    };
    const start = () =>
      new MutationObserver((records) => {
        for (const record of records)
          for (const node of record.addedNodes)
            if (node instanceof Element) {
              for (const element of [
                ...(node.matches('p') ? [node] : []),
                ...node.querySelectorAll('p'),
              ]) {
                const text = element.textContent.trim();
                if (/^(Loading|Reading saved|Opening (saved |selected )?question)/.test(text))
                  window.__smoothFamilyParagraphs.push(text);
              }
            }
      }).observe(document.documentElement, { childList: true, subtree: true });
    if (document.documentElement) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  });
  await context.route('**/src/foundation/question-tools.ts*', async (route) => {
    const response = await route.fetch(),
      source = await response.text();
    const signature = source.match(
      /export async function prepareQuestionTools\(question(?:,\s*options = \{\})?\) \{/,
    )?.[0];
    assert(signature, 'Tool preparer boundary moved: update explicit browser instrumentation.');
    await route.fulfill({
      response,
      body: source.replace(
        signature,
        signature +
          `
      window.__smoothFamilyTools.push({ref:question.ref,startedAt:performance.now()});
      if(window.__smoothFamilyToolsDelay) await new Promise(resolve=>setTimeout(resolve,window.__smoothFamilyToolsDelay));
    `,
      ),
    });
  });
  return context;
}

async function seed(page, fixture, run) {
  return page.evaluate(
    async ({ fixture, run }) => {
      const { productionRegistry } = await import('/src/foundation/registry.ts');
      const { createChemistryRepository } = await import('/src/persistence/index.ts');
      const registration = productionRegistry.get(fixture.activity),
        provider = await registration.provider();
      const question = provider.restore(fixture.ref),
        attemptId = crypto.randomUUID();
      const namespace = { course: fixture.course, profileId: 'local' };
      const target = {
        course: fixture.course,
        activityId: fixture.activity,
        gemId: fixture.gem,
        level: fixture.ref.level,
      };
      const attempt = {
        mode: 'student',
        namespace,
        attemptId,
        ref: question.ref,
        target,
        currentResponses: {},
        assistance: [],
        phase: 'answering',
        timing: {
          attemptId,
          activeMs: 0,
          idleLimitMs: registration.idleAllowance(question),
          finished: false,
        },
      };
      const session = {
        kind: 'practice',
        namespace,
        id: 'current-session',
        target,
        selection: 'fixed-level',
        currentAttemptId: attemptId,
        previousQuestionIds: [],
        paused: true,
      };
      const repository = createChemistryRepository(
        'masters-of-chemistry-alpha-v2-' + fixture.course + '-' + run,
      );
      const saved = await repository.saveCurriculum({ attempt, session });
      repository.close();
      if (!saved.ok) throw Error(saved.error.message);
      return attemptId;
    },
    { fixture, run },
  );
}

async function assertReady(page, question) {
  await page.locator('.question-player').waitFor();
  await settled(page);
  for (const kind of new Set(question.parts.map((part) => part.kind))) {
    if (kind === 'dot-and-cross')
      assert((await page.locator('.dot-cross-player svg.dc-canvas').count()) > 0);
    if (kind === 'electron-configuration')
      assert(
        (await page
          .locator('.ec-source.ec-workspace input,.ec-source.ec-workspace .orbital-scroll')
          .count()) > 0,
      );
    if (kind === 'titration-curve') assert((await page.locator('svg.tc-chart').count()) > 0);
    if (kind === 'energy-profile')
      assert((await page.locator('.energy-profile-editor .edit-canvas svg').count()) > 0);
  }
  if (question.chemicalPresentation)
    assert((await page.locator('.chemical-question-body').count()) > 0);
  assert.deepEqual(await page.evaluate(() => window.__smoothFamilyParagraphs), []);
}

async function family(fixture) {
  const c = await context(),
    page = await c.newPage(),
    name = fixture.name;
  page.setDefaultTimeout(20000);
  page.on('pageerror', (error) => report.pageErrors.push({ name, error: error.message }));
  const run = 'smooth-family-' + name.slice(0, 30) + '-' + Date.now();
  try {
    await page.goto(`${base}/?course=${fixture.course}&run=${run}`);
    await page.locator('.original-landing').waitFor();
    await settled(page);
    const attemptId = await seed(page, fixture, run);
    const targetURL = `${base}/?course=${fixture.course}&run=${run}&view=practice&activity=${encodeURIComponent(fixture.activity)}`;
    await page.goto(targetURL);
    await assertReady(page, fixture.question);
    await flush(page);
    const expectedHeader = productionRegistry
      .get(fixture.activity)
      .gems.find((gem) => gem.id === fixture.gem).label;
    assert(
      (await page.locator('#loading-surface h1').first().textContent()).includes(expectedHeader),
    );
    assert.equal((await snapshot(page)).attempt.attemptId, attemptId);
    assert.deepEqual((await snapshot(page)).question.ref, fixture.ref);
    const image = 'screenshots/' + name + '.png';
    await page.screenshot({ path: path.join(out, image), fullPage: true });
    report.screenshots.push(image);
    if (
      fixture.question.parts.some((part) =>
        ['dot-and-cross', 'titration-curve'].includes(part.kind),
      )
    ) {
      await page.setViewportSize({ width: 390, height: 900 });
      const mobileImage = 'screenshots/' + name + '-mobile.png';
      await page.screenshot({ path: path.join(out, mobileImage), fullPage: true });
      report.screenshots.push(mobileImage);
      await page.setViewportSize({ width: 1400, height: 1000 });
    }
    await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
    await page.locator('.original-landing').waitFor();
    await settled(page);
    const durable = await page.evaluate(
      async ({ course, run, attemptId }) => {
        const { createChemistryRepository } = await import('/src/persistence/index.ts');
        const repository = createChemistryRepository(
          'masters-of-chemistry-alpha-v2-' + course + '-' + run,
        );
        const saved = await repository.loadAttempt({ course, profileId: 'local' }, attemptId);
        repository.close();
        if (!saved.ok) throw Error(saved.error.message);
        return saved.value;
      },
      { course: fixture.course, run, attemptId },
    );
    await page.evaluate(() => {
      window.__smoothFamilyToolsDelay = 900;
    });
    await page.goBack();
    await page.waitForFunction(() => window.__mastersLoading.snapshot().pending);
    assert(await page.locator('.original-landing').isVisible());
    assert.equal(await page.locator('#loading-surface').getAttribute('inert'), '');
    await page.getByTestId('loading-bar').waitFor();
    assert.equal(
      await page.locator('.question-player').count(),
      0,
      'Destination must not mount before tools settle',
    );
    await assertReady(page, fixture.question);
    await flush(page);
    const resumed = await snapshot(page);
    assert.equal(resumed.attempt.attemptId, attemptId);
    assert.deepEqual(resumed.attempt.currentResponses, durable.currentResponses);
    assert.deepEqual(resumed.attempt.ref, durable.ref);
    assert(
      resumed.attempt.timing.activeMs - durable.timing.activeMs < 350,
      'Prepared wait must not charge incoming attempt',
    );
    await page.evaluate(() => {
      window.__smoothFamilyToolsDelay = 0;
    });
    await page.locator('[data-question-action="give-up"]').click();
    await page.waitForFunction(
      () => window.__mastersActivity.snapshot().attempt.phase === 'assessed',
    );
    await flush(page);
    if (await page.locator('dialog[open]').count())
      await page.getByRole('button', { name: 'Close answer', exact: true }).click();
    const first = await snapshot(page);
    assert.equal(
      (await page.evaluate(() => window.__mastersActivity.history())).length,
      0,
      'Model answer must not create independent evidence',
    );
    await page.evaluate(() => {
      window.__smoothFamilyToolsDelay = 900;
    });
    await page.locator('[data-question-action="next"]').click();
    await page.getByTestId('loading-bar').waitFor();
    const retained = await snapshot(page);
    assert.equal(retained.attempt.attemptId, first.attempt.attemptId);
    assert.deepEqual(retained.question.ref, first.question.ref);
    assert.deepEqual(retained.attempt.firstResponse, first.attempt.firstResponse);
    assert.equal(await page.locator('#loading-surface').getAttribute('inert'), '');
    await settled(page);
    await flush(page);
    const next = await snapshot(page);
    assert.notEqual(next.attempt.attemptId, first.attempt.attemptId);
    assert(next.attempt.timing.activeMs < 350);
    assert.equal(next.attempt.phase, 'answering');
    assert.deepEqual(await page.evaluate(() => window.__smoothFamilyParagraphs), []);
    report.checks.push({
      name,
      status: 'PASS',
      ref: fixture.ref,
      gemId: fixture.gem,
      kinds: fixture.question.parts.map((part) => part.kind),
      attemptId,
      nextAttemptId: next.attempt.attemptId,
      retainedNativeBack: true,
      readyBeforeClock: true,
      modelAnswerUngraded: true,
      retainedNext: true,
      screenshot: image,
    });
    console.log('PASS ' + name);
  } catch (error) {
    report.failures.push({ name, error: error.stack });
    await page
      .screenshot({ path: path.join(out, 'screenshots', name + '-failure.png'), fullPage: true })
      .catch(() => {});
    console.log('FAIL ' + name + ': ' + error.message);
  } finally {
    await c.close();
    saveReport();
  }
}

async function standaloneAndTeacher() {
  const c = await context(),
    page = await c.newPage(),
    name = 'standalone-setup-and-teacher';
  page.setDefaultTimeout(20000);
  page.on('pageerror', (error) => report.pageErrors.push({ name, error: error.message }));
  try {
    await page.goto(
      `${base}/development/authoring/families/dev-reviewed-starter/preview.html?run=smooth-standalone-${Date.now()}`,
    );
    await page.getByRole('heading', { name: 'Choose your practice', exact: true }).waitFor();
    await settled(page);
    await page.evaluate(() => window.__mastersLoading.delay('question', 800));
    await page.getByRole('button', { name: 'Start practice', exact: true }).click();
    await page.getByTestId('loading-bar').waitFor();
    assert(
      await page.getByRole('heading', { name: 'Choose your practice', exact: true }).isVisible(),
    );
    assert.equal((await snapshot(page)).attempt, null);
    await page.locator('.question-player').waitFor();
    await settled(page);
    await flush(page);
    const student = await snapshot(page);
    assert(student.attempt);
    assert.match(student.databaseName, /dev-authoring-dev-reviewed-starter/);
    assert.equal(
      await page.locator('.source-player').count(),
      0,
      'Authoring override must use its own standard presentation',
    );
    await page.evaluate(() => window.__mastersLoading.delay('question', 0));
    await page.getByRole('button', { name: 'Back to course map', exact: true }).first().click();
    await settled(page);
    // The direct activity fixture owns practice/teacher setup rather than the main course map.
    await page.getByRole('button', { name: 'Teacher', exact: true }).click();
    await page.getByRole('region', { name: 'Teacher question catalogue' }).waitFor();
    await settled(page);
    await flush(page);
    assert.equal((await snapshot(page)).attempt, null);
    const teacherWrites = await page.evaluate(() => window.__smoothFamilyAttemptWrites.length);
    const picker = page.getByLabel('Teacher question', { exact: true });
    const beforeKey = await picker.inputValue(),
      oldText = await page.locator('.question-player').textContent();
    const options = await picker
      .locator('option')
      .evaluateAll((values) => values.map((value) => value.value).filter(Boolean));
    const nextKey = options.find((value) => value !== beforeKey);
    assert(nextKey);
    await page.evaluate(() => window.__mastersLoading.delay('question', 850));
    await picker.selectOption(nextKey);
    await page.getByTestId('loading-bar').waitFor();
    assert.equal(await picker.inputValue(), beforeKey);
    assert.equal(await page.locator('.question-player').textContent(), oldText);
    await settled(page);
    assert.equal(await picker.inputValue(), nextKey);
    const code = await page.evaluate(async () => {
      const { proofRegistry } = await import(
        '/development/authoring/families/dev-reviewed-starter/registry.ts'
      );
      const registration = proofRegistry.curriculumFor('alevel')[0];
      return (await registration.provider()).select({
        activityId: registration.id,
        gemId: registration.gems[0].id,
        level: 2,
        seed: 14,
        previousQuestionIds: [],
      }).questionId;
    });
    await page.getByLabel('Search teacher catalogue').fill('no-match');
    await page.getByLabel('Question code', { exact: true }).fill(code);
    await page.getByRole('button', { name: 'Open question code', exact: true }).click();
    await settled(page);
    assert.equal(await page.getByLabel('Search teacher catalogue').inputValue(), '');
    assert.equal((await snapshot(page)).attempt, null);
    assert.equal((await page.evaluate(() => window.__mastersActivity.history())).length, 0);
    assert.equal(
      await page.evaluate(() => window.__smoothFamilyAttemptWrites.length),
      teacherWrites,
    );
    assert.deepEqual(await page.evaluate(() => window.__smoothFamilyParagraphs), []);
    await page.screenshot({ path: path.join(out, 'screenshots', name + '.png'), fullPage: true });
    report.screenshots.push('screenshots/' + name + '.png');
    report.checks.push({
      name,
      status: 'PASS',
      isolatedDatabase: student.databaseName,
      localStartRetainedSetup: true,
      nextTeacherSelectionRetained: true,
      explicitCodeClearsFilterAtCommit: true,
      teacherNewWrites: 0,
    });
    console.log('PASS ' + name);
  } catch (error) {
    report.failures.push({ name, error: error.stack });
    await page
      .screenshot({ path: path.join(out, 'screenshots', name + '-failure.png'), fullPage: true })
      .catch(() => {});
    console.log('FAIL ' + name + ': ' + error.message);
  } finally {
    await c.close();
    saveReport();
  }
}

try {
  for (const fixture of fixtures)
    if (!requested || requested.includes(fixture.name)) await family(fixture);
  if (!requested || requested.includes('standalone-setup-and-teacher'))
    await standaloneAndTeacher();
} finally {
  report.finishedAt = new Date().toISOString();
  report.status = report.failures.length || report.pageErrors.length ? 'FAIL' : 'PASS';
  saveReport();
  await browser.close();
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
