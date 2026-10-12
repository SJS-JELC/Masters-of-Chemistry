import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium, projectRoot } from './browser/paths.mjs';

const origin = process.env.SMOOTH_LOADING_APP_URL || 'http://127.0.0.1:5261';
const out = path.join(projectRoot, '.artifacts/smooth-loading/s2-views');
const affectedOnly = process.argv.includes('--affected-only');
fs.mkdirSync(path.join(out, '.tmp'), { recursive: true });
process.env.TEMP = path.join(out, '.tmp');
process.env.TMP = process.env.TEMP;
const report = {
  jobId: 'SL-DATA-CHALLENGES',
  agentId: 'A05',
  startedAt: new Date().toISOString(),
  selection: affectedOnly ? 'import-and-olympiad' : 'all-views',
  ...(affectedOnly
    ? { statisticsEvidence: 'attempt-4.json: both-course Stats PASS; unaffected source preserved' }
    : {}),
  checks: [],
  failures: [],
  pageErrors: [],
  limits: [
    'Headless pinned Edge; native visibility/timing and wider navigation acceptance belong to the integration reviewer.',
    'Fault/delay wrappers affect this fresh browser context only. Real repository methods and chemical policies still execute.',
  ],
};

const sourceFiles = [
  'src/statistics/StatisticsView.tsx',
  'src/statistics/prepare.ts',
  'src/foundation/OlympiadHost.tsx',
  'src/foundation/prepare-olympiad.ts',
  'src/foundation/view-repository-lifetime.ts',
  'src/compatibility/LegacyImportView.tsx',
  'src/compatibility/prepare-import.ts',
  'src/compatibility/index.ts',
  'src/foundation/ProductionFoundation.tsx',
  'src/loading/coordinator.ts',
  'src/loading/LoadingProvider.tsx',
];
const sourceHashes = () =>
  Object.fromEntries(
    sourceFiles.map((file) => [
      file,
      crypto
        .createHash('sha256')
        .update(fs.readFileSync(path.join(projectRoot, file)))
        .digest('hex'),
    ]),
  );
report.sourceHashes = sourceHashes();

function instrumentation(source) {
  const factory = 'return createRepository(databaseName);';
  assert(
    source.includes(factory),
    'Repository factory moved; revise test instrumentation explicitly.',
  );
  return source.replace(
    factory,
    `
    const repository = createRepository(databaseName);
    return new Proxy(repository, {get(target, key) {
      const method = target[key];
      if (typeof method !== 'function' || key === 'close') return method;
      return async (...args) => {
        const test = window.__views;
        if (test) {
          test.operations.push({key, at:performance.now()});
          if (test.readDelay && ['curriculumHistory','recallHistory','loadOlympiad'].includes(key)) await new Promise(resolve => setTimeout(resolve,test.readDelay));
          if (key === 'recallHistory' && test.failRecall) return {ok:false,error:{code:'unavailable',message:'Injected unavailable Recall storage',retryable:true}};
          if (key === 'saveOlympiad') {
            if (test.holdChallenge) {test.challengeHeld=true;await new Promise(resolve=>{test.releaseChallenge=resolve;});test.challengeHeld=false;}
            if (test.failChallenge) return {ok:false,error:{code:'quota',message:'Injected challenge save denial',retryable:true}};
          }
          if (key === 'importBatch') {
            if (test.holdImport) {test.importHeld=true;await new Promise(resolve=>{test.releaseImport=resolve;});test.importHeld=false;}
            if (test.failImport) return {ok:false,error:{code:'quota',message:'Injected import denial',retryable:true}};
          }
        }
        return method.apply(target,args);
      };
    }});
  `,
  );
}

const browser = await chromium.launch({ channel: 'msedge', headless: true });
report.browser = await browser.version();
async function fixture(course, label) {
  const run = `views-${label}-${Date.now()}`;
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    window.__views = {
      operations: [],
      readDelay: 0,
      failRecall: false,
      failChallenge: false,
      failImport: false,
      holdChallenge: false,
      holdImport: false,
      paragraphs: [],
      bars: [],
    };
    const text = File.prototype.text;
    File.prototype.text = async function () {
      if (window.__views.holdFile) {
        window.__views.fileHeld = true;
        await new Promise((resolve) => {
          window.__views.releaseFile = resolve;
        });
        window.__views.fileHeld = false;
      }
      if (window.__views.fileDelay)
        await new Promise((resolve) => setTimeout(resolve, window.__views.fileDelay));
      return text.call(this);
    };
    const observe = () =>
      new MutationObserver((records) => {
        for (const record of records)
          for (const node of record.addedNodes) {
            if (!(node instanceof Element)) continue;
            for (const p of [...(node.matches('p') ? [node] : []), ...node.querySelectorAll('p')])
              if (
                /^(Loading saved statistics|Loading challenge content|Reading saved|Opening selected)/.test(
                  p.textContent.trim(),
                )
              )
                window.__views.paragraphs.push(p.textContent);
            if (node.matches('[data-testid="loading-bar"]'))
              window.__views.bars.push(performance.now());
          }
      }).observe(document.documentElement, { childList: true, subtree: true });
    if (document.documentElement) observe();
    else addEventListener('DOMContentLoaded', observe, { once: true });
  });
  await context.route('**/src/persistence/repository.ts*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: instrumentation(await response.text()) });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => report.pageErrors.push({ label, error: error.message }));
  await page.goto(`${origin}/?course=${course}&run=${run}`, { waitUntil: 'domcontentloaded' });
  await page.locator(`.original-landing.${course}`).waitFor();
  await settled(page);
  return { context, page, run, course };
}
const settled = (page) =>
  page.waitForFunction(
    () =>
      window.__mastersLoading &&
      !window.__mastersLoading.snapshot().pending &&
      !window.__mastersLoading.snapshot().error,
  );
const pending = (page) => page.waitForFunction(() => window.__mastersLoading?.snapshot().pending);
async function finish(f, label) {
  try {
    const state = await f.page.evaluate(() => {
      const s = window.__mastersLoading?.snapshot();
      return {
        url: location.href,
        body: document.body.innerText,
        loading: s
          ? {
              pending: s.pending,
              visible: s.visible,
              error: s.error?.message,
              ticket: s.ticket ? { id: s.ticket.id, scope: s.ticket.scope } : null,
            }
          : null,
        views: {
          ...window.__views,
          releaseImport: undefined,
          releaseChallenge: undefined,
          releaseFile: undefined,
        },
        challenge: window.__mastersOlympiad?.snapshot(),
      };
    });
    fs.writeFileSync(path.join(out, `diagnostics-${label}.json`), JSON.stringify(state, null, 2));
    await f.page.screenshot({ path: path.join(out, `final-${label}.png`), fullPage: true });
  } catch (error) {
    fs.writeFileSync(
      path.join(out, `diagnostics-${label}.json`),
      JSON.stringify({ error: error.message }),
    );
  }
  await f.context.close();
}
async function delayed(page, selector) {
  await pending(page);
  await page.getByTestId('loading-bar').waitFor();
  assert.equal(await page.getByTestId('loading-bar').count(), 1);
  assert.equal(await page.locator('#loading-surface').getAttribute('inert'), '');
  assert.equal(await page.locator(selector).count(), 1);
  assert.equal(
    await page
      .locator('p')
      .filter({ hasText: /Loading saved statistics|Loading challenge content/ })
      .count(),
    0,
  );
}
async function pop(page, view, activity, mode) {
  await page.evaluate(
    ({ view, activity, mode }) => {
      const url = new URL(location.href);
      url.searchParams.set('view', view);
      url.searchParams.delete('activity');
      url.searchParams.delete('mode');
      if (activity) url.searchParams.set('activity', activity);
      if (mode) url.searchParams.set('mode', mode);
      history.pushState(null, '', url);
      dispatchEvent(new PopStateEvent('popstate'));
    },
    { view, activity, mode },
  );
}
async function check(name, work) {
  try {
    const detail = await work();
    report.checks.push({ name, status: 'PASS', detail });
  } catch (error) {
    report.failures.push({ name, error: error.stack });
  }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
}

for (const course of affectedOnly ? [] : ['alevel', 'igcse'])
  await check(
    `${course}: full Stats preparation, refresh retention, stale refresh and storage recovery`,
    async () => {
      const f = await fixture(course, `stats-${course}`),
        { page } = f;
      try {
        const oldURL = page.url();
        await page.evaluate(() => {
          window.__views.readDelay = 700;
          window.scrollTo(0, 240);
        });
        const oldScroll = await page.evaluate(() => scrollY);
        await page.locator('#statsTile').click();
        await delayed(page, `.original-landing.${course}`);
        assert.equal(page.url(), oldURL);
        assert.equal(await page.evaluate(() => scrollY), oldScroll);
        await page.locator('.statistics-screen').waitFor();
        await settled(page);
        assert.equal(await page.locator('[data-testid="recall-statistics-counts"]').count(), 1);
        const html = await page.locator('.statistics').innerHTML();
        await page.evaluate(() => dispatchEvent(new Event('pageshow')));
        await delayed(page, '.statistics-screen');
        assert.equal(
          await page.locator('.statistics').innerHTML(),
          html,
          'refresh replaced the old chart before reads finished',
        );
        await settled(page);
        await page.screenshot({ path: path.join(out, `stats-${course}.png`), fullPage: true });
        await page.evaluate(() => {
          window.__views.failRecall = true;
          window.__views.readDelay = 0;
          dispatchEvent(new Event('focus'));
        });
        await page.getByTestId('loading-retry').waitFor();
        assert.equal(await page.locator('.statistics-screen').count(), 1);
        assert.match(await page.locator('.loading-error').innerText(), /Recall storage/);
        await page.evaluate(() => {
          window.__views.failRecall = false;
        });
        await page.getByTestId('loading-retry').click();
        await settled(page);
        await page.evaluate(() => {
          window.__views.readDelay = 650;
          dispatchEvent(new Event('focus'));
        });
        await pending(page);
        await pop(page, 'home');
        const navigationId = await page.evaluate(
          () => window.__mastersLoading.snapshot().ticket.id,
        );
        await page.evaluate(() => {
          dispatchEvent(new Event('focus'));
          dispatchEvent(new Event('pageshow'));
        });
        assert.equal(
          await page.evaluate(() => window.__mastersLoading.snapshot().ticket.id),
          navigationId,
          'optional refresh superseded navigation',
        );
        await page.locator(`.original-landing.${course}`).waitFor();
        await settled(page);
        await page.waitForTimeout(750);
        assert.equal(
          await page.locator('.statistics-screen').count(),
          0,
          'stale refresh remounted Stats',
        );
        assert.deepEqual(await page.evaluate(() => window.__views.paragraphs), []);
        return {
          bothHistoryReads: await page.evaluate(() =>
            window.__views.operations
              .filter((row) => ['curriculumHistory', 'recallHistory'].includes(row.key))
              .map((row) => row.key),
          ),
          retainedScroll: oldScroll,
          optionalRefreshNavigationId: navigationId,
        };
      } finally {
        await finish(f, `stats-${course}`);
      }
    },
  );

for (const course of ['alevel', 'igcse'])
  await check(
    `${course}: import startup, real file read, reviewed import cancellation, duplicates and errors`,
    async () => {
      const f = await fixture(course, `import-${course}`),
        { page } = f;
      try {
        await page.evaluate(() => {
          window.__views.readDelay = 650;
        });
        await page.getByRole('button', { name: 'Import progress', exact: true }).click();
        await delayed(page, `.original-landing.${course}`);
        await page.locator('.legacy-import').waitFor();
        await settled(page);
        await page.evaluate(() => {
          window.__views.readDelay = 0;
        });
        const batch = await page.evaluate(async (course) => {
          const registry = (await import('/src/foundation/registry.ts')).productionRegistry;
          const registration = registry.get(
            course === 'alevel' ? 'alevel/rate-equations' : 'igcse/calorimetry',
          );
          const provider = await registration.provider();
          const gem = registration.gems[0];
          const ref = await provider.select({
            activityId: registration.id,
            gemId: gem.id,
            level: 1,
            seed: 3,
            previousQuestionIds: [],
          });
          const completedAt = Date.now() - 1000;
          const record = {
            kind: 'curriculum',
            provenance: 'new-attempt',
            id: `views-import-${course}`,
            profileId: 'local',
            course,
            activityId: registration.id,
            gemId: gem.id,
            score: 1,
            completedAt,
            independent: true,
            timing: { activeMs: 1250, idleLimitMs: 180000 },
            firstResponse: {
              responses: { a: { kind: 'numeric', raw: '1', unit: '' } },
              submittedAt: completedAt,
              timing: { activeMs: 1250, idleLimitMs: 180000 },
              assistance: [],
            },
            firstAssessment: {
              kind: 'marked',
              assessedAt: completedAt,
              marks: {
                earned: 1,
                available: 1,
                points: [
                  {
                    partId: 'a',
                    pointId: 'fixture',
                    earned: 1,
                    available: 1,
                    message: 'Synthetic import immutability fixture',
                  },
                ],
              },
              score: 1,
              selfAssessed: false,
            },
            ref,
            ...(course === 'alevel' ? { level: 1 } : { grade: 1 }),
          };
          return {
            namespace: { course, profileId: 'local' },
            source: { key: 'views-export', fingerprint: 'views-fingerprint' },
            curriculum: [record],
            olympiad: [],
          };
        }, course);
        const text = JSON.stringify(batch);
        await page.getByLabel('Current export JSON').fill('retained input');
        await page.evaluate(() => {
          window.__views.holdFile = true;
        });
        await page.getByLabel('Upload current export').setInputFiles({
          name: 'current.json',
          mimeType: 'application/json',
          buffer: Buffer.from(text),
        });
        await delayed(page, '.legacy-import');
        assert.equal(await page.getByLabel('Current export JSON').inputValue(), 'retained input');
        await page.evaluate(() => {
          window.__views.holdFile = false;
          window.__views.releaseFile();
        });
        await settled(page);
        assert.equal(await page.getByLabel('Current export JSON').inputValue(), text);
        await page.getByRole('button', { name: 'Preview import', exact: true }).click();
        await settled(page);
        assert.match(
          await page.locator('.legacy-import [role="status"]').innerText(),
          /1 current records ready/,
        );
        await page.evaluate(() => {
          window.__views.holdImport = true;
        });
        await page.getByRole('button', { name: 'Import reviewed progress', exact: true }).click();
        await page.waitForFunction(() => window.__views.importHeld);
        await page.evaluate(() => {
          window.__views.cancelFinished = false;
          void window.__mastersLoading.cancel().then((value) => {
            window.__views.cancelFinished = value;
          });
        });
        await page.waitForTimeout(250);
        assert.equal(await page.evaluate(() => window.__views.cancelFinished), false);
        assert.equal(await page.locator('#loading-surface').getAttribute('inert'), '');
        await page.evaluate(() => {
          window.__views.holdImport = false;
          window.__views.releaseImport();
        });
        await settled(page);
        const history = await page.evaluate(async (course) => {
          const repository = (
            await import('/src/persistence/repository.ts')
          ).createChemistryRepository(
            `masters-of-chemistry-alpha-v2-${course}-${new URL(location.href).searchParams.get('run')}`,
          );
          try {
            return await repository.curriculumHistory({ course, profileId: 'local' });
          } finally {
            repository.close();
          }
        }, course);
        assert.equal(history.ok, true);
        assert.equal(history.value.length, 1);
        assert.deepEqual(history.value[0], batch.curriculum[0]);
        assert.deepEqual(history.value[0].timing, { activeMs: 1250, idleLimitMs: 180000 });
        await page.getByRole('button', { name: 'Import reviewed progress', exact: true }).click();
        await settled(page);
        assert.match(
          await page.locator('.legacy-import [role="status"]').innerText(),
          /0 imported; 1 already present/,
        );
        await page.getByLabel('Current export JSON').fill('{invalid');
        await page.getByRole('button', { name: 'Preview import', exact: true }).click();
        await settled(page);
        assert.equal(
          await page
            .getByRole('button', { name: 'Import reviewed progress', exact: true })
            .isDisabled(),
          true,
        );
        await page.getByLabel('Current export JSON').fill(text);
        await page.getByRole('button', { name: 'Preview import', exact: true }).click();
        await settled(page);
        await page.evaluate(() => {
          window.__views.failImport = true;
        });
        await page.getByRole('button', { name: 'Import reviewed progress', exact: true }).click();
        await page.getByTestId('loading-retry').waitFor();
        assert.equal(await page.getByLabel('Current export JSON').inputValue(), text);
        await page.evaluate(() => {
          window.__views.failImport = false;
        });
        await page.getByTestId('loading-retry').click();
        await settled(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({
          path: path.join(out, `import-${course}-mobile.png`),
          fullPage: true,
        });
        return {
          record: batch.curriculum[0],
          startedTransactionDrained: true,
          duplicates: 1,
          invalidJSONDisabled: true,
          failedImportRetried: true,
        };
      } finally {
        await finish(f, `import-${course}`);
      }
    },
  );

await check(
  'Olympiad: landing and all three challenge preparation, drawings, frozen commands, save gates and teacher isolation',
  async () => {
    const f = await fixture('alevel', 'olympiad'),
      { page } = f;
    const ids = [
      'alevel/c3l6-organic-reactions',
      'alevel/olympiad-2011-q4',
      'alevel/maxwells-demon',
    ];
    const details = [];
    try {
      await page.evaluate(() => {
        window.__views.readDelay = 600;
      });
      await page.locator('#olympiadTile').click();
      await delayed(page, '.original-landing.alevel');
      await page.locator('.olympiad-landing').waitFor();
      await settled(page);
      assert.equal(await page.locator('.olympiad-gem-card').count(), 3);
      assert.equal(await page.getByText('Loading saved completion', { exact: true }).count(), 0);
      await page.evaluate(() => {
        window.__views.readDelay = 0;
        window.__mastersLoading.delay('screen', 700);
      });
      for (const id of ids) {
        await page.locator(`[data-challenge-id="${id}"]`).click();
        await delayed(page, '.olympiad-landing');
        assert.equal(
          await page.evaluate(() => window.__mastersOlympiad?.snapshot().progress),
          null,
          'destination host mounted before readiness',
        );
        await page.locator('.olympiad-question-frame').waitFor();
        await settled(page);
        await page.waitForFunction(
          (id) => window.__mastersOlympiad?.snapshot().progress?.activityId === id,
          id,
        );
        await page.evaluate(async (id) => {
          const h = window.__mastersOlympiad;
          if (id === 'alevel/c3l6-organic-reactions') {
            const { c3Challenge } = await import('/src/activities/olympiad/c3l6/index.ts');
            for (const row of c3Challenge.classifications)
              await h.command({ kind: 'classify', id: row.id, value: row.answer });
            await h.command({ kind: 'check-a' });
            await h.command({ kind: 'navigate', stage: 'b' });
            const slot = c3Challenge.hydrolysis[0].slots[0];
            await h.command({
              kind: 'draw-b',
              slotId: slot.id,
              drawing: { kind: 'molecule', graph: slot.alternatives[0].graph, history: [] },
            });
          } else if (id === 'alevel/olympiad-2011-q4') {
            const { isomerChallenge } = await import(
              '/src/activities/olympiad/isomers2011/index.ts'
            );
            await h.command({
              kind: 'draw',
              box: '1',
              drawing: { kind: 'molecule', graph: isomerChallenge.answers[0].graph, history: [] },
            });
            await h.command({ kind: 'select-box', box: '2' });
          } else {
            await h.command({ kind: 'maxwell-level', level: 1 });
            const { classifications } = await import(
              '/src/activities/olympiad/maxwells-demon/content.ts'
            );
            await h.command({
              kind: 'maxwell-answer',
              id: classifications[0].id,
              value: classifications[0].answers.join('|'),
            });
          }
          await h.flush();
        }, id);
        const saved = await page.evaluate(() => window.__mastersOlympiad.snapshot().progress);
        await page.screenshot({
          path: path.join(out, `challenge-${id.split('/')[1]}.png`),
          fullPage: true,
        });
        await page.evaluate(() => {
          window.__views.holdChallenge = true;
          void window.__mastersOlympiad.command(
            window.__mastersOlympiad.snapshot().progress.activityId ===
              'alevel/c3l6-organic-reactions'
              ? { kind: 'navigate', stage: 'b' }
              : window.__mastersOlympiad.snapshot().progress.activityId ===
                  'alevel/olympiad-2011-q4'
                ? { kind: 'select-box', box: '2' }
                : { kind: 'maxwell-level', level: 1 },
          );
        });
        await page.waitForFunction(() => window.__views.challengeHeld);
        await page.locator('button.question-back[aria-label="Back to Olympiad landing"]').click();
        await pending(page);
        const held = await page.evaluate(() => window.__mastersOlympiad.snapshot().progress);
        await page.evaluate(async () => {
          await window.__mastersOlympiad.command({ kind: 'restart' });
        });
        assert.deepEqual(
          await page.evaluate(() => window.__mastersOlympiad.snapshot().progress),
          held,
          'frozen harness command changed saved progress',
        );
        await page.evaluate(() => {
          void window.__mastersLoading.cancel();
        });
        await page.waitForTimeout(250);
        assert.equal(await page.evaluate(() => window.__mastersLoading.snapshot().pending), true);
        await page.evaluate(() => {
          window.__views.holdChallenge = false;
          window.__views.releaseChallenge();
        });
        await settled(page);
        assert.equal(await page.locator('.olympiad-question-frame').count(), 1);
        await page.locator('button.question-back[aria-label="Back to Olympiad landing"]').click();
        await page.locator('.olympiad-landing').waitFor();
        await settled(page);
        await page.locator(`[data-challenge-id="${id}"]`).click();
        await page.locator('.olympiad-question-frame').waitFor();
        await settled(page);
        const restored = await page.evaluate(() => window.__mastersOlympiad.snapshot().progress);
        assert.deepEqual(restored, saved, 'saved challenge/drawings changed across remount');
        await page.evaluate(() => {
          window.__views.failChallenge = true;
          void window.__mastersOlympiad.command(
            window.__mastersOlympiad.snapshot().progress.activityId ===
              'alevel/c3l6-organic-reactions'
              ? { kind: 'navigate', stage: 'b' }
              : window.__mastersOlympiad.snapshot().progress.activityId ===
                  'alevel/olympiad-2011-q4'
                ? { kind: 'select-box', box: '2' }
                : { kind: 'maxwell-level', level: 1 },
          );
        });
        await page.waitForFunction(
          () => window.__mastersOlympiad.snapshot().saveStatus.kind === 'error',
        );
        await page.locator('button.question-back[aria-label="Back to Olympiad landing"]').click();
        await page.getByTestId('loading-retry').waitFor();
        assert.equal(await page.locator('.olympiad-question-frame').count(), 1);
        await page.evaluate(() => {
          window.__views.failChallenge = false;
        });
        await page.getByTestId('loading-retry').click();
        await page.locator('.olympiad-landing').waitFor();
        await settled(page);
        const beforeWrites = await page.evaluate(
          () => window.__views.operations.filter((row) => row.key === 'saveOlympiad').length,
        );
        await pop(page, 'olympiad', id, 'teacher');
        await page.locator('.olympiad-question-frame').waitFor();
        await settled(page);
        assert.match(await page.locator('.olympiad-question-frame').innerText(), /Teacher preview/);
        await page.evaluate(async () => {
          await window.__mastersOlympiad.command({ kind: 'restart' });
        });
        assert.equal(
          await page.evaluate(
            () => window.__views.operations.filter((row) => row.key === 'saveOlympiad').length,
          ),
          beforeWrites,
        );
        details.push({
          id,
          savedDrawings: !!saved.drawingsB || !!saved.drawings,
          restored: true,
          frozenCommandsBlocked: true,
          saveFailureRetry: true,
          teacherWrites: 0,
        });
        await page.locator('button.question-back[aria-label="Back to Olympiad landing"]').click();
        await page.locator('.olympiad-landing').waitFor();
        await settled(page);
      }
      const evidence = await page.evaluate(async () => {
        const databaseName = window.__mastersOlympiad.snapshot().databaseName;
        const repository = (
          await import('/src/persistence/repository.ts')
        ).createChemistryRepository(databaseName);
        try {
          return await repository.curriculumHistory({ course: 'alevel', profileId: 'local' });
        } finally {
          repository.close();
        }
      });
      assert.equal(evidence.ok, true);
      assert.deepEqual(evidence.value, []);
      assert.deepEqual(await page.evaluate(() => window.__views.paragraphs), []);
      return { challenges: details, curriculumEvidence: 0 };
    } finally {
      await finish(f, 'olympiad');
    }
  },
);

await browser.close();
report.finalSourceHashes = sourceHashes();
if (JSON.stringify(report.sourceHashes) !== JSON.stringify(report.finalSourceHashes))
  report.failures.push({
    name: 'stable source during browser suite',
    error: 'Application source changed while this suite ran.',
  });
report.finishedAt = new Date().toISOString();
report.status = report.failures.length || report.pageErrors.length ? 'FAIL' : 'PASS';
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      status: report.status,
      checks: report.checks.length,
      failures: report.failures,
      pageErrors: report.pageErrors,
      report: path.join(out, 'report.json'),
    },
    null,
    2,
  ),
);
if (report.status !== 'PASS') process.exitCode = 1;
