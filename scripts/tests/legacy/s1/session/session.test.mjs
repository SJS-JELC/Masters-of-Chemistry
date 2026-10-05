import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { activityScope } from '../../../../../src/catalogue/scope.ts';
import { createCourseMastery, weightedScore, exceedsMasteryThreshold } from '../../../../../src/domain/mastery/index.ts';
import { createRevisionSession, revisionScheduler, pauseRevisionSession, resumeRevisionSession, bindRevisionQuestion, selectPracticeQuestion, topicTargets, selectCurriculumTargets, validCurriculumTarget, REVISION_WEEK_MS } from '../../../../../src/domain/session/index.ts';

const golden = JSON.parse(fs.readFileSync(new URL('../../../fixtures/legacy/s1/session/source-golden.json', import.meta.url), 'utf8'));
const NOW = golden.now;
const namespace = { course: 'alevel', profileId: 'golden' };
const settingFor = id => golden.settings.alevel.find(s => s.gemId === id);
const target = (gemId, level = 1) => ({ course: 'alevel', activityId: gemId === 'l6-t2-1-1' ? 'alevel/electrons-bonding' : 'alevel/electron-configurations', gemId, level });
const summary = (gemId, level, score = null, mastered = false, lastCompletedAt = null) => ({ gemId, level, score, mastered, count: score === null ? 0 : 20, lastCompletedAt });
const EB = 'l6-t2-1-1', EC = 'l6-t2-1-2';
const selected = [target(EC, 1), target(EC, 2), target(EC, 3), target(EB)];
const settings = [settingFor(EC), settingFor(EB)];
const empty = selected.map(t => summary(t.gemId, t.level));
const create = summaries => createRevisionSession({ namespace, id: 'session', selected, settings, summaries, now: NOW });
const outcome = (attemptId, score = 1, independent = true, completedAt = NOW) => ({ attemptId, score, independent, completedAt });

test('source fixture hashes remain applicable and 273 per-setting equivalence cases pass', () => {
  for (const source of golden.sources) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(source.path)).digest('hex'), source.sha256);
  const schedulers = golden.sources.filter(source => source.path.endsWith('/test-mode-core.js'));
  assert.equal(schedulers.length, 2); assert.equal(schedulers[0].sha256, schedulers[1].sha256);
  for (const row of golden.cases) {
    const evidence = row.records.map(r => ({ kind: 'curriculum', provenance: 'legacy-import', id: r.id, profileId: 'golden', course: row.course, gemId: r.leafId, score: r.score, completedAt: r.completedAt,
      ...(row.course === 'alevel' ? { level: r.level, ...(r.progressionVersion === undefined ? {} : { progressionVersion: r.progressionVersion }) } : { grade: r.grade }) }));
    assert.deepEqual(createCourseMastery(row.course, () => NOW).summarize(evidence, row.setting, row.level), row.expected, `${row.course}/${row.setting.gemId}/${row.level}/${row.name}`);
  }
});

test('zero prior, strict threshold, ordering and malformed numerical inputs', () => {
  assert.equal(weightedScore([], 2), null);
  assert.equal(weightedScore([1], 2), 1 - 2 ** (-0.5));
  assert(weightedScore([0, 1], 2) > weightedScore([1, 0], 2));
  assert.equal(exceedsMasteryThreshold(0.8, 0.8), false);
  assert.equal(exceedsMasteryThreshold(0.8 + Number.EPSILON, 0.8), true);
  assert.equal(exceedsMasteryThreshold(null, 0.8), false);
  assert.throws(() => weightedScore([0.25], 2)); assert.throws(() => weightedScore([1], 0));
  const m = createCourseMastery('alevel', () => NOW);
  const row = golden.cases.find(r => r.course === 'alevel' && r.name === 'correct');
  const records = row.records.map(r => ({ kind: 'curriculum', provenance: 'legacy-import', id: r.id, profileId: 'a', course: 'alevel', gemId: r.leafId, score: r.score, completedAt: r.completedAt, level: r.level, progressionVersion: 2 }));
  assert.throws(() => m.summarize([...records, { ...records[0], id: 'other-profile', profileId: 'b' }], row.setting, row.level));
  assert.throws(() => m.summarize([], { ...row.setting, gemId: 'c3l6' }, row.level));
  assert.equal(m.nextLevel([summary(EC, 3, 1, true), summary(EC, 1, 0.9, true), summary(EC, 2, null, false)]), 2);
  const energySetting = golden.settings.igcse.find(s => s.gemId === 'lower-10-1');
  const energyRecord = { kind: 'curriculum', provenance: 'legacy-import', id: 'energy-band', profileId: 'a', course: 'igcse', gemId: 'lower-10-1', grade: 1, score: 1, completedAt: NOW };
  assert.equal(createCourseMastery('igcse', () => NOW).summarize([{ ...energyRecord, grade: 3 }, energyRecord], energySetting, 1).count, 1);
});

test('scheduler matches source sequence, deficit ordering and no repeated consecutive gem', () => {
  const names = { A: EC, B: EB };
  const summaries = Object.entries(golden.scheduler.initialSummary).flatMap(([key, levels]) => Object.entries(levels).map(([level, s]) => summary(names[key], Number(level), s.score, s.mastered, NOW - s.days * 86400000)));
  let session = create(summaries);
  const responses = [[1, true], [0.5, true], [1, false], [1, true], [1, true], [1, true]];
  responses.forEach(([score, independent], index) => {
    session = revisionScheduler.next(session, summaries, NOW + index, `attempt-${index}`);
    session = revisionScheduler.accept(session, outcome(`attempt-${index}`, score, independent, NOW + index), summaries, NOW + index);
    const expected = golden.scheduler.transitions[index];
    assert.equal(session.current.target.gemId, names[expected.target]); assert.equal(session.current.target.level, expected.level);
    assert.deepEqual(session.round, expected.round.map(key => names[key])); assert.equal(session.lastGemId, expected.last === null ? null : names[expected.last]);
    for (const [key, levels] of Object.entries(expected.gems)) for (const [level, state] of Object.entries(levels)) {
      const actual = session.levels.find(s => s.target.gemId === names[key] && s.target.level === Number(level));
      assert.deepEqual({ mode: actual.mode, required: actual.required, streak: actual.streak, confirmedAt: actual.confirmedAt, initialScore: actual.initialScore }, state);
    }
  });
});

test('initial recency uses whole days; one or two confirmations and exact confirmation expiry', () => {
  const oneTarget = [target(EB)], oneSetting = [settingFor(EB)];
  const build = age => createRevisionSession({ namespace, id: 'one', selected: oneTarget, settings: oneSetting, summaries: [summary(EB, 1, 0.95, true, NOW - age)], now: NOW });
  assert.equal(build(REVISION_WEEK_MS + 86399999).levels[0].required, 1);
  assert.equal(build(REVISION_WEEK_MS + 86400000).levels[0].required, 2);
  const mastered = [summary(EB, 1, 0.95, true, NOW)];
  let session = revisionScheduler.next(build(0), mastered, NOW, 'first');
  session = revisionScheduler.accept(session, outcome('first'), mastered, NOW);
  assert.equal(session.levels[0].confirmedAt, NOW);
  const complete = revisionScheduler.next(session, mastered, NOW, 'unused'); assert.equal(complete.status, 'complete');
  assert.equal(revisionScheduler.next(complete, mastered, NOW + REVISION_WEEK_MS, 'boundary').status, 'complete');
  const expired = revisionScheduler.next(complete, mastered, NOW + REVISION_WEEK_MS + 1, 'expired'); assert.equal(expired.current.attemptId, 'expired'); assert.equal(expired.levels[0].confirmedAt, null);
  let old = revisionScheduler.next(build(9 * 86400000), mastered, NOW, 'old-first'); old = revisionScheduler.accept(old, outcome('old-first'), mastered, NOW); assert.equal(old.levels[0].confirmedAt, null);
  old = revisionScheduler.next(old, mastered, NOW, 'old-second'); old = revisionScheduler.accept(old, outcome('old-second'), mastered, NOW); assert.equal(old.levels[0].confirmedAt, NOW);
  const lost = revisionScheduler.next(complete, [summary(EB, 1, 0.7, false, NOW)], NOW + 1, 'lost'); assert.equal(lost.current.attemptId, 'lost');
});

test('first result deduplication, failure-to-practice, hint/reveal exclusion and fresh attempt IDs', () => {
  const secure = empty.map(s => ({ ...s, score: 0.95, mastered: true, lastCompletedAt: NOW }));
  let session = revisionScheduler.next(create(secure), secure, NOW, 'first');
  const initial = session;
  assert.equal(revisionScheduler.next(session, secure, NOW, 'ignored'), session);
  assert.equal(revisionScheduler.accept(session, outcome('wrong-id'), secure, NOW), session);
  assert.equal(revisionScheduler.accept(session, outcome('first', 1, true, NOW + 1), secure, NOW), session);
  session = revisionScheduler.accept(session, outcome('first', 1, false), secure, NOW);
  assert.equal(initial.current.completed, false);
  const level = session.levels.find(s => s.target.gemId === session.current.target.gemId && s.target.level === session.current.target.level);
  assert.equal(level.mode, 'practice'); assert.equal(level.required, 2); assert.equal(level.streak, 0); assert.equal(level.confirmedAt, null);
  assert.equal(revisionScheduler.accept(session, outcome('first'), secure, NOW), session);
  assert.throws(() => revisionScheduler.next(session, secure, NOW, 'first'));
  assert.deepEqual(session.submittedAttemptIds, ['first']);
});

test('pause/reload/resume retain exact current attempt and question; previous stores identities only', () => {
  let session = revisionScheduler.next(create(empty), empty, NOW, 'attempt');
  const ref = { activityId: session.current.target.activityId, level: session.current.target.level, seed: 123, questionId: 'fixture-identity' };
  session = bindRevisionQuestion(session, ref);
  assert.throws(() => bindRevisionQuestion(session, { ...ref, questionId: 'replacement' }));
  session = pauseRevisionSession(session); const reloaded = JSON.parse(JSON.stringify(session));
  assert.equal(revisionScheduler.next(reloaded, empty, NOW, 'must-not-start'), reloaded);
  session = resumeRevisionSession(reloaded); assert.equal(session.current.attemptId, 'attempt'); assert.deepEqual(session.current.ref, ref);
  session = revisionScheduler.accept(session, outcome('attempt'), empty, NOW); session = revisionScheduler.next(session, empty, NOW, 'fresh');
  assert.equal(session.current.attemptId, 'fresh'); assert.deepEqual(Object.keys(session.previous[0]).sort(), ['ref', 'target']);
});

test('ADD ALL enumerates registered genuine levels; no Olympiad or reserved energy grade', () => {
  const registrations = activityScope.filter(a => a.strand === 'curriculum').map(a => ({ course: a.course, id: a.id, gems: a.gems.map(gem => ({ id: gem.id, topicId: 'all', supportedLevels: gem.supportedLevels })) }));
  assert.equal(topicTargets(registrations, 'alevel', 'all').length, 24); assert.equal(topicTargets(registrations, 'igcse', 'all').length, 17);
  assert.equal(topicTargets(registrations, 'igcse', 'missing').length, 0);
  const energy = selectCurriculumTargets(registrations, 'igcse', ['lower-10-1']); assert.deepEqual(energy.map(t => t.level), [1, 2]);
  assert.throws(() => selectCurriculumTargets(registrations, 'alevel', ['c3l6']));
  assert.equal(validCurriculumTarget({ course: 'alevel', activityId: 'alevel/c3l6-organic-reactions', gemId: 'c3l6', level: 1 }), false);
  assert.throws(() => createRevisionSession({ namespace, id: 'invalid', selected: [target(EC)], settings: [settingFor(EC)], summaries: empty, now: NOW }));
});

test('practice uses same provider identity/seed and supported mastery level; no full snapshots in session', () => {
  const calls = [];
  const provider = { select(selection) { calls.push(selection); return { activityId: selection.activityId, level: selection.level, seed: selection.seed, questionId: `id-${selection.seed}` }; }, restore(ref) { return { ref, title: 'Source-restored fixture title' }; } };
  const practice = { kind: 'practice', namespace, id: 'practice', target: target(EC), selection: 'mastery', currentAttemptId: null, previousQuestionIds: [] };
  const selected = selectPracticeQuestion({ session: practice, provider, seed: 123, summaries: [summary(EC, 1, 0.99, true), summary(EC, 2)] });
  assert.equal(selected.ref.level, 2); assert.equal(selected.question.title, 'Source-restored fixture title'); assert.equal(selected.ref.seed, 123); assert.deepEqual(selected.session.previousQuestionIds, ['id-123']);
  assert.equal('question' in selected.session, false); assert.deepEqual(calls[0].previousQuestionIds, []);
  const noEvidence = selectPracticeQuestion({ session: practice, provider, seed: 124, summaries: [] }); assert.equal(noEvidence.ref.level, 1);
  assert.equal(selectPracticeQuestion({ session: practice, provider, seed: 125, summaries: [1,2,3].map(level => summary(EC, level, 0.99, true)) }), null);
  const fixed = selectPracticeQuestion({ session: { ...practice, selection: 'fixed-level', target: target(EC, 3) }, provider, seed: 126, summaries: [] }); assert.equal(fixed.ref.level, 3);
  assert.throws(() => selectPracticeQuestion({ session: practice, provider, seed: -1, summaries: [] }));
  assert.throws(() => selectPracticeQuestion({ session: practice, provider: { ...provider, restore(ref) { return { ref: { ...ref, seed: 4 } }; } }, seed: 123, summaries: [] }));
});
