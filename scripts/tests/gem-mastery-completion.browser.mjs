import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../..'),
  out = path.join(app, '.artifacts/recall-formulae-ux/s1/mastery');
const require = createRequire(path.resolve(app, '../../package.json'));
assert.equal(require('playwright/package.json').version, '1.62.1');
const { chromium } = require('playwright'),
  port = 5194,
  base = `http://127.0.0.1:${port}`;
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
let log = '';
server.stdout.on('data', (x) => (log += x));
server.stderr.on('data', (x) => (log += x));
const report = {
  agentId: 'A06',
  jobId: 'UX-MENU-MASTERY',
  startedAt: new Date().toISOString(),
  checks: [],
  failures: [],
  pageErrors: [],
  note: 'Targeted new save-gate and existing-mastered-level fixtures only; synthetic isolated IndexedDB, existing mastery maths unchanged.',
};
let browser, page;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  report.browser = await browser.version();
  page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  await page.goto(base + '/scripts/tests/gem-mastery-save.browser.html');
  await page.getByRole('textbox').first().waitFor();
  await page.getByRole('button', { name: 'Give Up', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByText('Synthetic completion save blocked.', { exact: true }).waitFor();
  const failed = await page.evaluate(async () => {
    const state = window.masterySaveGate;
    const saved = await state.repository.loadRecallSession(
      { course: 'igcse', profileId: 'local' },
      'mastery-recall:save-gate:fourth-1-1',
    );
    const evidence = await state.repository.recallHistory({ course: 'igcse', profileId: 'local' });
    return {
      completions: state.completions,
      completionWrites: state.completionWrites,
      session: saved.ok ? saved.value : null,
      evidence: evidence.ok ? evidence.value : [],
    };
  });
  assert.equal(failed.completions, 0);
  assert.equal(failed.completionWrites, 1);
  assert.notEqual(failed.session.status, 'complete');
  assert.equal(failed.evidence.length, 1);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForFunction(() => window.masterySaveGate.completions === 1);
  const saved = await page.evaluate(async () => {
    const state = window.masterySaveGate,
      namespace = { course: 'igcse', profileId: 'local' };
    return {
      session: await state.repository.loadRecallSession(
        namespace,
        'mastery-recall:save-gate:fourth-1-1',
      ),
      evidence: await state.repository.recallHistory(namespace),
      writes: state.completionWrites,
    };
  });
  assert.equal(saved.session.value.status, 'complete');
  assert.equal(saved.evidence.value.length, 1);
  assert.equal(saved.writes, 2);
  report.checks.push({
    name: 'failed completion save blocks callback; retry saves whole-set completion once without duplicate evidence',
    status: 'PASS',
  });
  await page.goto(base + '/alevel.html?course=alevel&run=grade-completion');
  const fixture = await page.evaluate(async () => {
    const { productionRegistry } = await import('/src/foundation/registry.ts');
    const { factsFor } = await import('/src/recall/facts.ts');
    const { createChemistryRepository } = await import('/src/persistence/repository.ts');
    const registration = productionRegistry
      .curriculumFor('alevel')
      .find((r) =>
        r.gems.some((g) => g.supportedLevels.length > 1 && !factsFor('alevel', [g.id]).length),
      );
    const gem = registration.gems.find(
      (g) => g.supportedLevels.length > 1 && !factsFor('alevel', [g.id]).length,
    );
    const namespace = { course: 'alevel', profileId: 'local' },
      repository = createChemistryRepository(
        'masters-of-chemistry-alpha-v2-alevel-grade-completion',
      );
    const levels = [...gem.supportedLevels].sort();
    const now = Date.now();
    const evidence = Array.from({ length: 100 }, (_, index) => ({
      kind: 'curriculum',
      id: 'synthetic-level1-' + index,
      profileId: 'local',
      course: 'alevel',
      activityId: registration.id,
      gemId: gem.id,
      level: levels[0],
      score: 1,
      completedAt: now - 100 + index,
      provenance: 'legacy-import',
      sourceKey: 'mastery-browser-first',
      progressionVersion: gem.mastery.activeProgressionVersion ?? 1,
    }));
    const { validateEvidence } = await import('/src/persistence/validation.ts');
    evidence.forEach(validateEvidence);
    const existing = await repository.curriculumHistory(namespace);
    repository.close();
    if (!existing.ok) throw Error(existing.error.message);
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('masters-of-chemistry-alpha-v2-alevel-grade-completion');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result,
          transaction = db.transaction('evidence', 'readwrite');
        for (const value of evidence)
          transaction
            .objectStore('evidence')
            .put({ course: 'alevel', profileId: 'local', id: value.id, value });
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
    return {
      gemId: gem.id,
      levels,
      activityId: registration.id,
      progressionVersion: gem.mastery.activeProgressionVersion ?? 1,
    };
  });
  await page.goto(`${base}/alevel.html?course=alevel&run=grade-completion#${fixture.gemId}`);
  await page.locator('#gemDetails').waitFor({ state: 'visible' });
  await page.locator('[data-practice="mastery"]').click();
  await page.waitForFunction(
    () => window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
  );
  const first = await page.evaluate(() => window.__mastersActivity.snapshot());
  assert.equal(first.attempt.target.level, fixture.levels[1]);
  assert.equal(first.session.selection, 'mastery');
  await page.getByRole('button', { name: 'Give Up', exact: true }).click();
  await page.evaluate(async (fixture) => {
    const { createChemistryRepository } = await import('/src/persistence/repository.ts');
    const repository = createChemistryRepository(
        'masters-of-chemistry-alpha-v2-alevel-grade-completion',
      ),
      namespace = { course: 'alevel', profileId: 'local' },
      now = Date.now();
    const evidence = fixture.levels
      .slice(1)
      .flatMap((level) =>
        Array.from({ length: 100 }, (_, index) => ({
          kind: 'curriculum',
          id: `synthetic-finish-${level}-${index}`,
          profileId: 'local',
          course: 'alevel',
          activityId: fixture.activityId,
          gemId: fixture.gemId,
          level,
          score: 1,
          completedAt: now - 100 + index,
          provenance: 'legacy-import',
          sourceKey: 'mastery-browser-finish',
          progressionVersion: fixture.progressionVersion,
        })),
      );
    const { validateEvidence } = await import('/src/persistence/validation.ts');
    evidence.forEach(validateEvidence);
    await repository.curriculumHistory(namespace);
    repository.close();
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('masters-of-chemistry-alpha-v2-alevel-grade-completion');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result,
          transaction = db.transaction('evidence', 'readwrite');
        for (const value of evidence)
          transaction
            .objectStore('evidence')
            .put({ course: 'alevel', profileId: 'local', id: value.id, value });
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, fixture);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('heading', { name: 'Mastery run complete' }).waitFor();
  assert.equal(new URL(page.url()).searchParams.get('masteryStage'), 'complete');
  const token = new URL(page.url()).searchParams.get('masteryRun');
  const durable = await page.evaluate(
    async ({ token, fixture }) => {
      const { createChemistryRepository } = await import('/src/persistence/repository.ts');
      const repository = createChemistryRepository(
          'masters-of-chemistry-alpha-v2-alevel-grade-completion',
        ),
        namespace = { course: 'alevel', profileId: 'local' };
      const session = await repository.loadSession(
          namespace,
          `mastery-grades:${token}:${fixture.gemId}`,
        ),
        history = await repository.curriculumHistory(namespace);
      repository.close();
      return { session, history };
    },
    { token, fixture },
  );
  assert.equal(durable.session.value.currentAttemptId, null);
  assert.equal(durable.history.value.length, fixture.levels.length * 100);
  await page.reload();
  await page.getByRole('heading', { name: 'Mastery run complete' }).waitFor();
  report.checks.push({
    name: 'A Level grade-only starts lowest unmastered existing level and null scheduler choice durably completes; reload preserves final stage',
    status: 'PASS',
  });
  await page.goto(base + '/igcse.html?course=igcse&run=independent-grade#lower-10-3');
  await page.locator('#gemDetails').waitFor({ state: 'visible' });
  await page.locator('[data-practice="mastery"]').click();
  await page.waitForFunction(
    () => window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
  );
  const independentId = await page.evaluate(async () => {
    const host = window.__mastersActivity,
      snapshot = host.snapshot();
    for (const part of snapshot.question.parts) {
      if (part.kind !== 'numeric') throw Error('Expected source calorimetry numeric part');
      await host.respond(part.id, {
        kind: 'numeric',
        raw: Number(part.acceptance.expected).toPrecision(3),
        unit: part.unit,
      });
    }
    return snapshot.attempt.attemptId;
  });
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.waitForFunction(
    () => window.__mastersActivity?.snapshot().attempt?.phase === 'assessed',
  );
  await page.evaluate(() => window.__mastersActivity.flush());
  const independent = await page.evaluate(() => window.__mastersActivity.history());
  assert.equal(independent.length, 1);
  assert.equal(independent[0].id, independentId);
  assert.equal(independent[0].provenance, 'new-attempt');
  assert.equal(independent[0].independent, true);
  await page.reload();
  await page.waitForFunction(
    () => window.__mastersActivity?.snapshot().attempt?.phase === 'assessed',
  );
  const repeated = await page.evaluate(() => window.__mastersActivity.history());
  assert.equal(repeated.length, 1);
  assert.deepEqual(repeated[0], independent[0]);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForFunction(
    (id) =>
      window.__mastersActivity?.snapshot().attempt?.attemptId !== id &&
      window.__mastersActivity?.snapshot().attempt?.phase === 'answering',
    independentId,
  );
  assert.equal((await page.evaluate(() => window.__mastersActivity.history())).length, 1);
  report.checks.push({
    name: 'grade-only independent first check persists immutable existing evidence; reload and Next do not duplicate it',
    status: 'PASS',
  });
  const unavailableGem = await page.evaluate(async () => {
    const { productionRegistry } = await import('/src/foundation/registry.ts');
    const { factsFor } = await import('/src/recall/facts.ts');
    const { displayGems } = await import('/src/landing/catalogue.ts');
    const graded = new Set(
      productionRegistry.curriculumFor('igcse').flatMap((r) => r.gems.map((g) => g.id)),
    );
    return displayGems('igcse').find((g) => !graded.has(g.id) && !factsFor('igcse', [g.id]).length)
      ?.id;
  });
  assert.ok(unavailableGem);
  await page.goto(`${base}/igcse.html?course=igcse&run=unavailable#${unavailableGem}`);
  await page.locator('#gemDetails').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-practice="mastery"]').isDisabled(), true);
  assert.equal(await page.locator('[data-practice="recall"]').isDisabled(), true);
  assert.equal(await page.locator('#gemDetails .practice-choice').count(), 2);
  await page
    .getByText('No factual recall or graded activity available yet', { exact: true })
    .waitFor();
  report.checks.push({
    name: 'gem with neither stage explicitly unavailable and no levels invented',
    status: 'PASS',
  });
  assert.deepEqual(report.pageErrors, []);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.failures.push({ message: error.message, stack: error.stack });
  if (page)
    await page
      .screenshot({ path: path.join(out, 'completion-failure.png'), fullPage: true })
      .catch(() => {});
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(out, 'completion-browser-report.json'),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(path.join(out, 'completion-server.log'), log);
  await browser?.close();
  server.kill();
}
console.log(
  JSON.stringify({
    status: report.status,
    checks: report.checks.length,
    failures: report.failures.map((x) => x.message),
  }),
);
