import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSession } from '../../src/persistence/validation.ts';
import { isCanonicalQuestionId } from '../../src/content/canonical-identity.ts';
import { rateProvider } from '../../src/activities/alevel/rate-equations/provider.ts';

test('retired comparison history loads and selects without restoring removed questions', () => {
  const activityId = 'alevel/rate-equations';
  const previousQuestionIds = ['RATE-NEW-orders-comparison-L1', 'RATE-NEW-orders-comparison-L2'];
  const session = { kind: 'practice', namespace: { course: 'alevel', profileId: 'local' },
    id: 'retired-history', target: { course: 'alevel', activityId, gemId: 'u6-t1-2-orders', level: 1 },
    selection: 'fixed-level', currentAttemptId: null, previousQuestionIds };
  assert.doesNotThrow(() => validateSession(session));
  const selected = rateProvider.select({ ...session.target, previousQuestionIds, seed: 10 });
  assert(!previousQuestionIds.includes(selected.questionId));
  for (const id of previousQuestionIds) {
    assert.equal(isCanonicalQuestionId(activityId, id), false);
    assert.equal(rateProvider.resolveLink(id), null);
  }
  assert.throws(() => validateSession({ ...session, previousQuestionIds: ['RATE-NEW-unknown'] }));
  assert.throws(() => rateProvider.select({ ...session.target, seed: 10, previousQuestionIds: ['AB-000001'] }));
});
