import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFlashcardStudyTime, validateImportedFlashcardStudyTime } from '../../src/persistence/flashcard-time-validation.ts';
import { flashcardTimeInPeriod, practiceTimeBins } from '../../src/statistics/practice-time.ts';
import { buildStatistics, buildRecallStatistics } from '../../src/statistics/model.ts';
import { prepareStatistics } from '../../src/statistics/prepare.ts';
import { planLegacyImport, CURRENT_IMPORT_KEY } from '../../src/persistence/legacy/plan.ts';

const namespace = { course: 'igcse', profileId: 'local' };
const now = +new Date(2026, 9, 13, 12);
const midnight = value => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return +date;
};
const record = (sessionId, dayStart = midnight(now), extra = {}) => ({
  kind: 'flashcards', id: `${sessionId}:${dayStart}`, namespace, sessionId,
  scopeKey: 'test-scope', dayStart, activeMs: 1200, cardLimitMs: 15000,
  updatedAt: dayStart + 60000, ...extra,
});
const models = (options = {}) => [
  buildStatistics(namespace, { curriculumFor: () => [] }, [], { days: 0, now, ...options }),
  buildRecallStatistics(namespace, [], { days: 0, now, ...options }),
];

test('strict study validator rejects invalid dates, durations, namespace, identity and evidence injection', () => {
  validateFlashcardStudyTime(record('okay'));
  for (const extra of [
    { dayStart: NaN }, { dayStart: 9e15 }, { dayStart: 'today' },
    { updatedAt: 9e15 }, { updatedAt: 0 }, { activeMs: -1 },
    { activeMs: 0.5 }, { activeMs: 25 * 3600000 + 1 }, { activeMs: Infinity },
    { id: 'wrong' }, { sessionId: '' }, { scopeKey: '' },
    { namespace: { course: 'igcse', profileId: '' } }, { cardLimitMs: 30000 },
    { score: 1 }, { firstAssessment: {} },
  ]) assert.throws(() => validateFlashcardStudyTime(record('bad', midnight(now), extra)));
});

test('valid saved midnight from another timezone stays readable and groups in current local date', () => {
  // Tokyo midnight; it is not midnight on the UK/UTC test device.
  const start = Date.parse('2026-10-13T00:00:00+09:00');
  const saved = record('travelling', start);
  validateFlashcardStudyTime(saved);
  const visible = flashcardTimeInPeriod(namespace, [saved], { days: 7, now });
  assert.equal(visible[0].dayStart, start);
  const bins = practiceTimeBins(...models(), visible);
  assert.equal(bins.find(bin => bin.start === midnight(start)).counts.timeByOutcome.flashcards, 1200);
});

test('period and namespace isolation retain max duplicate checkpoint without merging separate visits', () => {
  const day = midnight(now), old = day - 20 * 86400000;
  const input = [record('one'), record('one', day, { activeMs: 800 }), record('one', day, { activeMs: 2500 }),
    record('two'), record('old', old),
    record('foreign', day, { namespace: { course: 'alevel', profileId: 'local' } }),
    record('profile', day, { namespace: { course: 'igcse', profileId: 'other' } }),
    record('future', day, { updatedAt: now + 1 })];
  const visible = flashcardTimeInPeriod(namespace, input, { days: 7, now });
  assert.equal(visible.length, 2);
  assert.equal(visible.reduce((sum, saved) => sum + saved.activeMs, 0), 3700);
  assert.equal(flashcardTimeInPeriod(namespace, input, { days: 0, now }).length, 3);
});

test('flashcard-only history extends chart dates, adds neutral Flashcards topic, and leaves mastery/accuracy unchanged', () => {
  const [curriculum, recall] = models({ year: 'fourth' });
  const before = structuredClone({ curriculum, recall });
  const visible = flashcardTimeInPeriod(namespace, [record('first', midnight(now) - 3 * 86400000), record('today')], { days: 0, now });
  const bins = practiceTimeBins(curriculum, recall, visible);
  assert.equal(bins.length, 4);
  assert.deepEqual(bins[0].topics, [['Flashcards', 1200]]);
  assert.deepEqual(bins[0].counts.timeByOutcome, { correct: 0, partial: 0, incorrect: 0, flashcards: 1200 });
  assert.equal(bins[0].counts.activeMs, 1200);
  assert.deepEqual({ curriculum, recall }, before);
  assert.equal(curriculum.counts.total, 0);
  assert.equal(curriculum.mastered, 0);
  assert.equal(recall.counts.total, 0);
});

test('mixed chart conserves assessed outcome time and gives study its own topic and segment', () => {
  const [curriculum, recall] = models();
  const start = midnight(now);
  const assessed = {
    ...curriculum,
    topics: [{ name: 'Acids', gems: [{ row: { records: [{ id: 'assessment', completedAt: now - 1000, timing: { activeMs: 2400, idleLimitMs: 60000 } }] } }] }],
    bins: [{ start, counts: { activeMs: 2400, timeByOutcome: { correct: 1200, partial: 400, incorrect: 800 } } }],
  };
  const factual = { ...recall, bins: [{ start, counts: { activeMs: 2400, timeByOutcome: { correct: 1400, wrong: 1000 } } }] };
  const bin = practiceTimeBins(assessed, factual, [record('study')])[0];
  assert.equal(bin.counts.activeMs, 6000);
  assert.deepEqual(bin.counts.timeByOutcome, { correct: 2600, partial: 400, incorrect: 1800, flashcards: 1200 });
  assert.deepEqual(bin.topics, [['Acids', 2400], ['Factual Recall', 2400], ['Flashcards', 1200]]);
  assert.equal(Object.values(bin.counts.timeByOutcome).reduce((sum, ms) => sum + ms, 0), bin.counts.activeMs);
});

test('statistics preparation loads study records and exposes read failures without an empty-success chart', async () => {
  const saved = record('read');
  const ok = value => ({ ok: true, value });
  const repository = { curriculumHistory: async () => ok([]), recallHistory: async () => ok([]),
    recallProgress: async () => ok([]), flashcardStudyTimeHistory: async () => ok([saved]) };
  const input = { course: 'igcse', namespace, databaseName: 'fixture', registry: {}, repository,
    ticket: { isCurrent: () => true } };
  assert.deepEqual((await prepareStatistics(input)).flashcardStudyTime, [saved]);
  repository.flashcardStudyTimeHistory = async () => ({ ok: false, error: { code: 'unavailable', message: 'Denied read', retryable: true } });
  await assert.rejects(() => prepareStatistics(input), /Flashcards study time/);
});

test('current import accepts old exports and validates optional study records without deck migration', async () => {
  const batch = { namespace, source: { key: CURRENT_IMPORT_KEY, fingerprint: 'fixture' }, curriculum: [], olympiad: [] };
  validateImportedFlashcardStudyTime(batch);
  const plan = payload => planLegacyImport(namespace, { [CURRENT_IMPORT_KEY]: JSON.stringify(payload) });
  assert.equal((await plan(batch)).batches.length, 1);
  const saved = record('import');
  assert.equal((await plan({ ...batch, flashcardStudyTime: [saved] })).batches.length, 1);
  assert.equal((await plan({ ...batch, flashcardStudyTime: [saved, saved] })).rejected.length, 1);
  assert.equal((await plan({ ...batch, flashcardStudyTime: [{ ...saved, namespace: { ...namespace, profileId: 'other' } }] })).rejected.length, 1);
});
