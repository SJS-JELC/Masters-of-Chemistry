import { chromium } from '../../../../../node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const origin = process.argv[2] ?? 'http://127.0.0.1:5183';
const profilePath = fileURLToPath(new URL(`./.r-${Date.now()}/`, import.meta.url));
await mkdir(profilePath, { recursive: true });
const context = await chromium.launchPersistentContext(profilePath, { channel: 'msedge', headless: true, args: ['--no-first-run', '--no-default-browser-check'] });
try {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/validation/s1/persistence/browser.html`);
  await page.waitForFunction(() => window.persistenceResult || window.persistenceFailure, { timeout: 30000 });
  const result = await page.evaluate(() => ({ result: window.persistenceResult ?? null, failure: window.persistenceFailure ?? null }));
  const priorDatabase = result.result?.databaseNames[0];
  let restored = null;
  if (priorDatabase && !result.failure) {
    await page.goto(`${origin}/validation/s1/persistence/browser.html?restore`);
    restored = await page.evaluate(async name => {
      const { createChemistryRepository } = await import('/src/persistence/index.ts');
      const repo = createChemistryRepository(name);
      const namespace = { course: 'alevel', profileId: 'synthetic-persistence' };
      const attempt = await repo.loadAttempt(namespace, 'attempt-1');
      const session = await repo.loadSession(namespace, 'practice-1');
      const history = await repo.curriculumHistory(namespace);
      return { attempt, session, history };
    }, priorDatabase);
    if (!restored.attempt.ok || restored.attempt.value?.attemptId !== 'attempt-1' || !restored.session.ok || restored.session.value?.currentAttemptId !== 'attempt-1' || !restored.history.ok || restored.history.value.length !== 1 || restored.history.value[0].timing.activeMs !== 5000) throw new Error('Fresh document could not restore same attempt/session/evidence/timing');
    await page.evaluate(value => document.getElementById('result').textContent = JSON.stringify(value, null, 2), { ...result.result, freshDocumentRestore: 'PASS' });
  }
  const report = { checkedAt: new Date().toISOString(), engine: 'Playwright pinned workspace 1.62.1 Chromium actual IndexedDB', origin, profilePath, ...result, freshDocumentRestore: restored ? 'PASS' : 'not-run', errors };
  await writeFile(new URL('./browser-results.json', import.meta.url), JSON.stringify(report, null, 2));
  await page.screenshot({ path: fileURLToPath(new URL('./browser-result.png', import.meta.url)), fullPage: true });
  console.log(JSON.stringify(report, null, 2));
  if (result.failure || errors.length) process.exitCode = 1;
} finally { await context.close(); }
