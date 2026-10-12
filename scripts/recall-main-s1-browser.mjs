import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const app = path.resolve(import.meta.dirname, '..'),
  out = path.join(app, '.artifacts/recall-main/s1/integration'),
  { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext(),
    page = await context.newPage();
  await page.goto('http://127.0.0.1:5203/?course=igcse&run=recall-main-s1', {
    waitUntil: 'networkidle',
  });
  const observed = await page.evaluate(async () => {
    const { createRepository } = await import('/src/persistence/repository.ts'),
      { historicalRecallFacts } = await import('/src/recall/compatibility.ts'),
      { historicalRecallFields, createHistoricalRecallMarkingPolicy } = await import(
        '/src/recall/historical-marking.ts'
      ),
      { recallFacts } = await import('/src/recall/facts.ts'),
      { factsForRecallScope } = await import('/src/recall/session-contract.ts');
    const name = 'masters-of-chemistry-alpha-v2-recall-main-s1-' + Date.now(),
      r = createRepository(name),
      policy = createHistoricalRecallMarkingPolicy(historicalRecallFacts),
      at = Date.now(),
      checks = [];
    let first;
    for (const f of historicalRecallFacts) {
      const ref = { activityId: f.course + '/recall', questionId: f.id, seed: 0, level: 1 },
        responses = Object.fromEntries(
          historicalRecallFields(f).map((x) => [x.id, { kind: 'text', value: x.answer }]),
        ),
        marks = policy.mark({ ref }, responses).marks,
        a = {
          mode: 'student',
          namespace: { course: f.course, profileId: 'legacy' },
          attemptId: 'old-' + f.id,
          ref,
          target: {
            kind: 'recall',
            course: f.course,
            activityId: ref.activityId,
            factId: f.id,
            level: 1,
          },
          phase: 'assessed',
          currentResponses: responses,
          assistance: [],
          firstResponse: {
            responses,
            submittedAt: at,
            timing: { activeMs: 2400, idleLimitMs: 60000 },
            assistance: [],
          },
          firstAssessment: { kind: 'marked', assessedAt: at, marks, score: 1, selfAssessed: false },
        };
      const saved = await r.saveRecall({ attempt: a });
      checks.push(saved.ok && saved.value.evidence === 'inserted');
      first ??= a;
    }
    const historyI = await r.recallHistory({ course: 'igcse', profileId: 'legacy' }),
      historyA = await r.recallHistory({ course: 'alevel', profileId: 'legacy' }),
      dup = await r.saveRecall({ attempt: first });
    const bad = structuredClone(first);
    bad.firstAssessment.score = 0;
    const rejected = await r.saveRecall({ attempt: bad });
    const namespace = { course: 'igcse', profileId: 'deck' },
      scope = { kind: 'gem', gemId: 'fourth-16-1' },
      ids = factsForRecallScope(recallFacts, 'igcse', scope).map((f) => f.id),
      preferences = {
        namespace,
        globalTopicIds: ['fourth-16'],
        mode: 'flashcards',
        lastScope: scope,
      },
      deck = {
        namespace,
        scope,
        factIds: ids,
        round: 1,
        roundFactIds: ids,
        currentFactId: ids[0],
        classifications: {},
        revealed: false,
        undoStack: [],
      };
    const ps = await r.saveRecallPreferences(preferences),
      ds = await r.saveRecallFlashcards(deck),
      pl = await r.loadRecallPreferences(namespace),
      dl = await r.loadRecallFlashcards(namespace, scope),
      foreign = await r.loadRecallFlashcards({ ...namespace, profileId: 'other' }, scope),
      injected = await r.saveRecallFlashcards({ ...deck, score: 1 });
    r.close();
    const restored = createRepository(name),
      after = await restored.loadRecallFlashcards(namespace, scope),
      afterHistory = await restored.recallHistory({ course: 'igcse', profileId: 'legacy' });
    restored.close();
    return {
      database: name,
      all150Saved: checks.length === 150 && checks.every(Boolean),
      igcseHistorical: historyI.ok ? historyI.value.length : null,
      alevelHistorical: historyA.ok ? historyA.value.length : null,
      retired061Preserved:
        historyI.ok && historyI.value.some((e) => e.factId === 'igcse-recall-061'),
      generatedHistoricalPreserved:
        historyI.ok && historyI.value.filter((e) => !/^igcse-recall-/.test(e.factId)).length === 29,
      deduped: dup.ok && dup.value.evidence === 'already-present',
      tamperedFirstRejected: !rejected.ok && rejected.error.code === 'invalid-data',
      preferences: ps.ok && pl.ok && JSON.stringify(pl.value) === JSON.stringify(preferences),
      flashcards: ds.ok && dl.ok && JSON.stringify(dl.value) === JSON.stringify(deck),
      namespaceIsolation: foreign.ok && foreign.value === null,
      injectionRejected: !injected.ok && injected.error.code === 'invalid-data',
      connectionRestore:
        after.ok &&
        JSON.stringify(after.value) === JSON.stringify(deck) &&
        afterHistory.ok &&
        afterHistory.value.length === 144,
    };
  });
  for (const [key, value] of Object.entries(observed)) {
    if (!['database', 'igcseHistorical', 'alevelHistorical'].includes(key))
      assert.equal(value, true, key);
  }
  assert.equal(observed.igcseHistorical, 144);
  assert.equal(observed.alevelHistorical, 6);
  const result = {
    status: 'PASS',
    checkedAt: new Date().toISOString(),
    method:
      'Actual headless Edge IndexedDB transactions and close/reopen; no native visibility claim',
    observed,
  };
  fs.writeFileSync(
    path.join(out, 'indexeddb-browser.json'),
    JSON.stringify(result, null, 2) + '\n',
  );
  console.log(JSON.stringify(result));
  await context.close();
} catch (error) {
  fs.writeFileSync(
    path.join(out, 'indexeddb-browser.json'),
    JSON.stringify({ status: 'FAIL', message: String(error) }, null, 2) + '\n',
  );
  throw error;
} finally {
  await browser.close();
}
