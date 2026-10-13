import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const app = path.resolve(import.meta.dirname, '..');
const { chromium } = createRequire(path.resolve(app, '../../package.json'))('playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5181/?course=igcse&run=flashcard-store-' + Date.now());
  const observed = await page.evaluate(async () => {
    const { createChemistryRepository, createRepository, DATABASE_SCHEMA_V4 } = await import('/src/persistence/repository.ts');
    const { default: Dexie } = await import('/node_modules/dexie/dist/dexie.mjs');
    const namespace = { course: 'igcse', profileId: 'fixture' };
    const now = Date.now(), day = new Date(now);
    day.setHours(0, 0, 0, 0);
    const dayStart = +day;
    const record = (sessionId, extra = {}) => ({ kind: 'flashcards', id: `${sessionId}:${dayStart}`, namespace,
      sessionId, scopeKey: 'fixture', dayStart, activeMs: 1000, cardLimitMs: 15000, updatedAt: now, ...extra });
    const ok = result => { if (!result.ok) throw Error(JSON.stringify(result)); return result.value; };
    const check = (value, message) => { if (!value) throw Error(message); };
    const database = 'masters-of-chemistry-alpha-v2-flashcard-fixture-' + now;
    const old = new Dexie(database);
    old.version(4).stores(DATABASE_SCHEMA_V4);
    const selection = { namespace, mode: 'flashcards', globalTopicIds: ['fourth-16'], lastScope: { kind: 'global', topicIds: ['fourth-16'] } };
    await old.table('recallPreferences').put({ ...namespace, id: 'selection', value: selection });
    old.close();
    let repository = createChemistryRepository(database);
    check(JSON.stringify(ok(await repository.loadRecallPreferences(namespace))) === JSON.stringify(selection), 'V4 selection lost on upgrade');
    check(ok(await repository.flashcardStudyTimeHistory(namespace)).length === 0, 'Deck state inferred historical study time');
    ok(await repository.saveFlashcardStudyTime(record('visit-one')));
    ok(await repository.saveFlashcardStudyTime(record('visit-one', { activeMs: 5000 })));
    ok(await repository.saveFlashcardStudyTime(record('visit-one', { activeMs: 500, updatedAt: now - 1 })));
    check(ok(await repository.flashcardStudyTimeHistory(namespace))[0].activeMs === 5000, 'Stale retry decreased cumulative time');
    const second = createChemistryRepository(database);
    await Promise.all([repository.saveFlashcardStudyTime(record('visit-one', { activeMs: 7200 })), second.saveFlashcardStudyTime(record('visit-one', { activeMs: 12000 })), repository.saveFlashcardStudyTime(record('visit-one', { activeMs: 6500 }))]).then(results => results.forEach(ok));
    const conflict = await second.saveFlashcardStudyTime(record('visit-one', { scopeKey: 'different' }));
    check(!conflict.ok && conflict.error.code === 'conflict', 'Stable visit identity conflict accepted');
    ok(await second.saveFlashcardStudyTime(record('visit-two', { activeMs: 2100 })));
    check(ok(await repository.flashcardStudyTimeHistory(namespace)).reduce((sum, saved) => sum + saved.activeMs, 0) === 14100, 'Concurrent visits were merged or retries doubled time');
    const mutable = record('captured', { activeMs: 900 });
    const saving = repository.saveFlashcardStudyTime(mutable);
    mutable.activeMs = 99999;
    mutable.namespace = { course: 'igcse', profileId: 'foreign' };
    ok(await saving);
    check(ok(await repository.flashcardStudyTimeHistory(namespace)).find(saved => saved.sessionId === 'captured').activeMs === 900, 'Caller mutation escaped synchronous capture');
    check(ok(await repository.flashcardStudyTimeHistory({ course: 'igcse', profileId: 'other' })).length === 0, 'Profile leak');
    check(ok(await repository.flashcardStudyTimeHistory({ course: 'alevel', profileId: 'fixture' })).length === 0, 'Course leak');
    for (const extra of [{ id: 'bad' }, { activeMs: -1 }, { score: 1 }, { dayStart: 9e15 }, { updatedAt: NaN }, { cardLimitMs: 1 }]) {
      const invalid = await repository.saveFlashcardStudyTime(record('invalid', extra));
      check(!invalid.ok && invalid.error.code === 'invalid-data', 'Malformed study record accepted');
    }
    const study = ok(await repository.flashcardStudyTimeHistory(namespace));
    check(study.length === 3, 'Unexpected study record count');
    check(ok(await repository.curriculumHistory(namespace)).length === 0 && ok(await repository.recallHistory(namespace)).length === 0 && ok(await repository.recallProgress(namespace)).length === 0, 'Study entered assessed evidence/mastery');
    const importedDatabase = database + '-import';
    const imported = createChemistryRepository(importedDatabase);
    const batch = { namespace, source: { key: 'current-fixture', fingerprint: 'with-study' }, curriculum: [], olympiad: [], flashcardStudyTime: study };
    check(ok(await imported.importBatch(batch)).inserted === 3, 'Study import failed');
    check(ok(await imported.importBatch(batch)).duplicates === 3, 'Repeated import duplicated study');
    check(ok(await imported.importBatch({ ...batch, source: { key: 'current-fixture', fingerprint: 'stale' }, flashcardStudyTime: study.map(saved => ({ ...saved, activeMs: 1 })) })).duplicates === 3, 'Stale import should preserve existing records');
    check(ok(await imported.flashcardStudyTimeHistory(namespace)).reduce((sum, saved) => sum + saved.activeMs, 0) === 15000, 'Stale import decreased saved time');
    check(ok(await imported.importBatch({ namespace, source: { key: 'current-fixture', fingerprint: 'older-export' }, curriculum: [], olympiad: [] })).inserted === 0, 'Older export compatibility lost');
    const rollbackDatabase = database + '-rollback';
    const broken = createRepository(rollbackDatabase, point => { if (point === 'after-import-row') throw new DOMException('Fixture quota fault', 'QuotaExceededError'); });
    const failed = await broken.importBatch(batch);
    check(!failed.ok && failed.error.code === 'quota', 'Import fault was not surfaced');
    const healthy = createChemistryRepository(rollbackDatabase);
    check(ok(await healthy.flashcardStudyTimeHistory(namespace)).length === 0, 'Study escaped rollback');
    check(ok(await healthy.importBatch(batch)).inserted === 3, 'Rolled back receipt prevented retry');
    repository.close(); second.close(); imported.close(); broken.close(); healthy.close();
    repository = createChemistryRepository(database);
    check(ok(await repository.flashcardStudyTimeHistory(namespace)).reduce((sum, saved) => sum + saved.activeMs, 0) === 15000, 'Connection reopen lost study');
    repository.close();
    return { schemaUpgradePreservedDeck: true, historicalTimeNotInferred: true, maxUpsertRetry: true,
      concurrentConnections: true, distinctVisits: true, immutableIdentity: true, synchronousCapture: true,
      namespaces: true, strictValidation: true, gradedEvidenceUntouched: true, currentImportRetry: true,
      olderExports: true, transactionalRollback: true, reopenPersistence: true, totalActiveMs: 15000 };
  });
  assert.equal(observed.totalActiveMs, 15000);
  const output = path.join(app, '.artifacts/flashcard-time/A02-browser.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ at: new Date().toISOString(), browser: 'headless Microsoft Edge', observed }, null, 2));
  console.log(JSON.stringify(observed));
} finally {
  await browser.close();
}
