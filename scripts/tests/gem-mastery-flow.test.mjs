import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialGemMasteryStage,
  afterGemRecall,
  gemRecallSessionId,
  gemGradeSessionId,
  readGemMasteryFlow,
  writeGemMasteryFlow,
} from '../../src/foundation/gem-mastery-flow.ts';
import { gemMasteryAvailability } from '../../src/foundation/gem-mastery-availability.ts';
import { productionRegistry } from '../../src/foundation/registry.ts';
import { createRecallSession, selectRecallFact } from '../../src/recall/scheduler.ts';
import { nextMasteryLevel } from '../../src/domain/mastery/course-mastery.ts';
test('available stages skip absent content without fabricating grades', () => {
  assert.equal(initialGemMasteryStage(1, true), 'recall');
  assert.equal(initialGemMasteryStage(1, false), 'recall');
  assert.equal(afterGemRecall(false), 'complete');
  assert.equal(afterGemRecall(true), 'grades');
  assert.equal(initialGemMasteryStage(0, true), 'grades');
  assert.equal(initialGemMasteryStage(0, false), null);
  assert.deepEqual(gemMasteryAvailability('igcse', 'fourth-1-1', productionRegistry).target, null);
  assert.equal(gemMasteryAvailability('igcse', 'lower-6-5', productionRegistry).facts, 1);
});
test('whole set visits wrong or revealed facts once and includes not-due facts', () => {
  const namespace = { course: 'igcse', profileId: 'test' };
  const session = createRecallSession(
    namespace,
    'mastery-recall:run:gem',
    'recall-practice',
    ['wrong', 'not-due', 'revealed'],
    ['gem'],
  );
  const progress = [{ factId: 'not-due', dueAt: 999999 }];
  assert.equal(selectRecallFact(session, progress, 1), 'wrong');
  assert.equal(selectRecallFact({ ...session, visitedFactIds: ['wrong'] }, progress, 1), 'not-due');
  assert.equal(
    selectRecallFact({ ...session, visitedFactIds: ['wrong', 'not-due'] }, progress, 1),
    'revealed',
  );
  assert.equal(
    selectRecallFact({ ...session, visitedFactIds: session.factIds }, progress, 1),
    null,
  );
});
test('run identity and URL retain stages while new runs use separate existing sessions', () => {
  const flow = { course: 'igcse', gemId: 'lower-6-5', token: 'test-token', stage: 'recall' };
  const url = new URL('https://example.test/?course=igcse');
  writeGemMasteryFlow(url, flow);
  assert.deepEqual(readGemMasteryFlow(url, 'igcse', productionRegistry), flow);
  assert.equal(gemRecallSessionId(flow), gemRecallSessionId({ ...flow }));
  assert.notEqual(gemRecallSessionId(flow), gemRecallSessionId({ ...flow, token: 'fresh' }));
  assert.notEqual(gemRecallSessionId(flow), gemGradeSessionId(flow));
  url.searchParams.set('mode', 'teacher');
  assert.equal(readGemMasteryFlow(url, 'igcse', productionRegistry), undefined);
});
test('wrong course, malformed token and unsupported graded target are excluded', () => {
  for (const suffix of [
    'masteryRun=bad%20token&masteryGem=lower-6-5&masteryStage=recall',
    'masteryRun=run&masteryGem=l6-t2-1-1&masteryStage=recall',
    'masteryRun=run&masteryGem=fourth-1-1&masteryStage=grades',
  ]) {
    assert.equal(
      readGemMasteryFlow(new URL('https://example.test/?' + suffix), 'igcse', productionRegistry),
      undefined,
    );
  }
});
test('existing grade mastery keeps lowest-unmastered selection and completion', () => {
  const summaries = [1, 2, 3].map((level) => ({ level, mastered: level === 1 }));
  assert.equal(nextMasteryLevel(summaries), 2);
  assert.equal(nextMasteryLevel(summaries.map((item) => ({ ...item, mastered: true }))), null);
});

test('registered semantic rate gems roundtrip every mastery stage in their own course', () => {
  for (const suffix of ['orders', 'graphs', 'mechanisms', 'arrhenius']) {
    for (const stage of ['recall', 'grades', 'complete']) {
      const flow = { course: 'alevel', gemId: `u6-t1-2-${suffix}`, token: 'rate-launch', stage };
      const url = new URL('https://example.test/?course=alevel');
      writeGemMasteryFlow(url, flow);
      assert.deepEqual(readGemMasteryFlow(url, 'alevel', productionRegistry), flow);
      assert.equal(readGemMasteryFlow(url, 'igcse', productionRegistry), undefined);
    }
  }
  for (const stage of ['recall', 'grades', 'complete']) {
    const url = new URL(`https://example.test/?masteryRun=rate-launch&masteryGem=u6-t1-2-unknown&masteryStage=${stage}`);
    assert.equal(readGemMasteryFlow(url, 'alevel', productionRegistry), undefined);
  }
});
