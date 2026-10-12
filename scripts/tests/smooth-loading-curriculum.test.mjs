import test from 'node:test';
import assert from 'node:assert/strict';
import {
  prepareCurriculum,
  persistCurriculumResume,
} from '../../src/foundation/prepare-curriculum.ts';
import { createLoadingCoordinator } from '../../src/loading/coordinator.ts';
import { productionRegistry } from '../../src/foundation/registry.ts';
import { validateWrite } from '../../src/persistence/validation.ts';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
let sequence = 0;
function fixture(overrides = {}) {
  const writes = [];
  const repository = {
    curriculumHistory: async () => ({ ok: true, value: [] }),
    loadSession: async () => ({ ok: true, value: null }),
    loadAttempt: async () => ({ ok: true, value: null }),
    saveCurriculum: async (value) => {
      validateWrite(value);
      writes.push(structuredClone(value));
      return { ok: true, value: { attemptId: value.attempt.attemptId, evidence: 'none' } };
    },
    ...overrides,
  };
  const coordinator = createLoadingCoordinator();
  const target = {
    course: 'alevel',
    activityId: 'alevel/rate-equations',
    gemId: 'u6-t1-2-graphs',
    level: 2,
  };
  const input = {
    course: 'alevel',
    databaseName: 'unit-smooth-' + ++sequence,
    view: 'practice',
    repository,
    launchRequest: {
      id: 'launch-' + sequence,
      kind: 'practice',
      target,
      selection: 'fixed-level',
      fresh: true,
    },
    prepareTools: async () => ({}),
  };
  return { coordinator, input, writes };
}

test('preparation waits for data/tools/save, preserves zero timing, and publishes one coherent bundle', async () => {
  const tools = deferred(),
    durable = deferred();
  const f = fixture({
    saveCurriculum: async (value) => {
      validateWrite(value);
      f.writes.push(structuredClone(value));
      return durable.promise;
    },
  });
  const commits = [];
  const running = f.coordinator.run(
    'screen',
    (ticket) => prepareCurriculum({ ...f.input, ticket, prepareTools: () => tools.promise }),
    (value) => commits.push(value),
  );
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(f.writes.length, 0);
  assert.equal(commits.length, 0);
  tools.resolve({});
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(f.writes.length, 1);
  assert.equal(commits.length, 0);
  assert.equal(f.writes[0].attempt.timing.activeMs, 0);
  assert.equal(f.writes[0].evidence, undefined);
  durable.resolve({
    ok: true,
    value: { attemptId: f.writes[0].attempt.attemptId, evidence: 'none' },
  });
  assert.equal(await running, true);
  assert.equal(commits.length, 1);
  assert.equal(commits[0].attempt.attemptId, commits[0].session.currentAttemptId);
  assert.deepEqual(commits[0].attempt.ref, commits[0].question.ref);
  assert.equal(commits[0].setupOpen, false);
});

test('cancelled provider/tools preparation cannot write or commit a destination', async () => {
  const tools = deferred(),
    f = fixture(),
    commits = [];
  const running = f.coordinator.run(
    'screen',
    (ticket) => prepareCurriculum({ ...f.input, ticket, prepareTools: () => tools.promise }),
    (value) => commits.push(value),
  );
  await new Promise((resolve) => setTimeout(resolve, 20));
  f.coordinator.cancel();
  tools.resolve({});
  assert.equal(await running, false);
  assert.equal(f.writes.length, 0);
  assert.equal(commits.length, 0);
});

test('failed first save Retry retains the identical ID, seed, question and session', async () => {
  let fail = true;
  const f = fixture({
    saveCurriculum: async (value) => {
      validateWrite(value);
      f.writes.push(structuredClone(value));
      return fail
        ? { ok: false, error: { code: 'quota', retryable: true, message: 'quota test' } }
        : { ok: true, value: { attemptId: value.attempt.attemptId, evidence: 'none' } };
    },
  });
  const commits = [];
  assert.equal(
    await f.coordinator.run(
      'screen',
      (ticket) => prepareCurriculum({ ...f.input, ticket }),
      (value) => commits.push(value),
    ),
    false,
  );
  assert.equal(commits.length, 0);
  assert.match(f.coordinator.snapshot().error.message, /quota test/);
  fail = false;
  assert.equal(await f.coordinator.retry(), true);
  assert.deepEqual(f.writes[0], f.writes[1]);
  assert.equal(commits.length, 1);
});

test('restore/resume retains responses, drawing, seed, timing and exact attempt identity', async () => {
  const f = fixture();
  let first;
  await f.coordinator.run(
    'screen',
    (ticket) => prepareCurriculum({ ...f.input, ticket }),
    (value) => {
      first = value;
    },
  );
  const state = {
    ...first.attempt,
    currentResponses: { p1: { kind: 'numeric', raw: '2', unit: '' } },
    timing: { ...first.attempt.timing, activeMs: 1370 },
    workspace: { kind: 'rate-graph-tools', marker: 25, extended: false, readings: [null, null] },
  };
  const resumed = fixture({
    loadSession: async () => ({ ok: true, value: { ...first.session, paused: true } }),
    loadAttempt: async () => ({ ok: true, value: state }),
  });
  let committed;
  assert.equal(
    await resumed.coordinator.run(
      'screen',
      (ticket) => prepareCurriculum({ ...resumed.input, launchRequest: undefined, ticket }),
      (value) => {
        committed = value;
      },
    ),
    true,
  );
  assert.deepEqual(committed.attempt, state);
  assert.equal(committed.session.paused, false);
  assert.equal(committed.attempt.attemptId, first.attempt.attemptId);
  assert.equal(resumed.writes.length, 1);
});

test('failed reads and missing persisted attempts remain explicit without creating identities', async () => {
  for (const repository of [
    {
      curriculumHistory: async () => ({
        ok: false,
        error: { code: 'unavailable', message: 'read denied', retryable: true },
      }),
    },
    {
      loadSession: async () => ({
        ok: true,
        value: { kind: 'practice', currentAttemptId: 'missing' },
      }),
    },
  ]) {
    const f = fixture(repository);
    let commit = false;
    assert.equal(
      await f.coordinator.run(
        'screen',
        (ticket) => prepareCurriculum({ ...f.input, ticket }),
        () => {
          commit = true;
        },
      ),
      false,
    );
    assert.equal(commit, false);
    assert.equal(f.writes.length, 0);
    assert(f.coordinator.snapshot().error);
  }
});

test('teacher preparation never writes a pupil attempt or evidence', async () => {
  const f = fixture();
  let prepared;
  assert.equal(
    await f.coordinator.run(
      'screen',
      (ticket) => prepareCurriculum({ ...f.input, view: 'teacher', ticket }),
      (value) => {
        prepared = value;
      },
    ),
    true,
  );
  assert.equal(prepared.attempt, null);
  assert.equal(f.writes.length, 0);
});

test('transient provider failure remains retryable before any durable identity exists', async () => {
  const actual = productionRegistry.get('alevel/rate-equations');
  let fails = true;
  const registry = {
    ...productionRegistry,
    get: (id) =>
      id === actual.id
        ? {
            ...actual,
            provider: async () => {
              if (fails) throw Error('provider test');
              return actual.provider();
            },
          }
        : productionRegistry.get(id),
    curriculumFor: (course) => productionRegistry.curriculumFor(course),
  };
  const f = fixture();
  let commits = 0;
  assert.equal(
    await f.coordinator.run(
      'screen',
      (ticket) => prepareCurriculum({ ...f.input, registry, ticket }),
      () => {
        commits++;
      },
    ),
    false,
  );
  assert.equal(f.writes.length, 0);
  fails = false;
  assert.equal(await f.coordinator.retry(), true);
  assert.equal(commits, 1);
  assert.equal(f.writes.length, 1);
});

test('cancellation resume cannot publish a superseded durable session and Retry preserves the original', async () => {
  const original = {
    kind: 'practice',
    namespace: { course: 'alevel', profileId: 'local' },
    id: 'original-session',
    target: {
      course: 'alevel',
      activityId: 'alevel/rate-equations',
      gemId: 'u6-t1-2-graphs',
      level: 2,
    },
    selection: 'fixed-level',
    currentAttemptId: 'original-attempt',
    previousQuestionIds: [],
    paused: true,
  };
  const started = deferred(),
    completion = deferred(),
    abort = new AbortController();
  let current = true;
  const writes = [];
  const ticket = {
    id: 1,
    scope: 'screen',
    signal: abort.signal,
    isCurrent: () => current,
    persist: (write) => write(),
  };
  const repository = {
    saveSession: async (session) => {
      writes.push(structuredClone(session));
      started.resolve();
      return completion.promise;
    },
  };
  const pending = persistCurriculumResume(original, repository, ticket);
  await started.promise;
  current = false;
  abort.abort();
  completion.resolve({ ok: true, value: original.id });
  assert.equal(await pending, null);
  assert.equal(original.paused, true);
  assert.equal(original.currentAttemptId, 'original-attempt');
  assert.equal(writes[0].currentAttemptId, original.currentAttemptId);
  const freshTicket = { ...ticket, signal: new AbortController().signal, isCurrent: () => true };
  const failed = {
    saveSession: async () => ({
      ok: false,
      error: { code: 'quota', message: 'resume denied', retryable: true },
    }),
  };
  await assert.rejects(persistCurriculumResume(original, failed, freshTicket), /resume denied/);
  assert.equal(original.paused, true);
  const resumed = await persistCurriculumResume(
    original,
    { saveSession: async () => ({ ok: true, value: original.id }) },
    freshTicket,
  );
  assert.deepEqual(resumed, { ...original, paused: false });
  assert.equal(original.paused, true);
});

test('Cancel cannot resume while the outgoing response/timing checkpoint is unsaved', async () => {
  const session = {
    kind: 'practice',
    namespace: { course: 'alevel', profileId: 'local' },
    id: 'retained-session',
    target: {
      course: 'alevel',
      activityId: 'alevel/rate-equations',
      gemId: 'u6-t1-2-graphs',
      level: 2,
    },
    selection: 'fixed-level',
    currentAttemptId: 'retained-attempt',
    previousQuestionIds: [],
    paused: true,
  };
  const checkpoint = {
    attemptId: 'retained-attempt',
    currentResponses: { p1: { kind: 'numeric', raw: '7.5', unit: '' } },
    timing: { attemptId: 'retained-attempt', activeMs: 2742, idleLimitMs: 300000, finished: false },
  };
  const persisted = { attempt: null, session: null };
  const order = [];
  let fail = true,
    current = true;
  const ticket = {
    id: 5,
    scope: 'screen',
    signal: new AbortController().signal,
    isCurrent: () => current,
    persist: (write) => write(),
  };
  const retainedWrite = async () => {
    order.push('checkpoint');
    if (fail)
      return {
        ok: false,
        error: { code: 'quota', retryable: true, message: 'checkpoint remains unsaved' },
      };
    persisted.attempt = structuredClone(checkpoint);
    return { ok: true, value: { attemptId: checkpoint.attemptId, evidence: 'none' } };
  };
  const repository = {
    saveSession: async (resumed) => {
      order.push('resume');
      persisted.session = structuredClone(resumed);
      return { ok: true, value: resumed.id };
    },
  };
  await assert.rejects(
    persistCurriculumResume(session, repository, ticket, [retainedWrite]),
    /checkpoint remains unsaved/,
  );
  assert.equal(persisted.session, null);
  assert.equal(persisted.attempt, null);
  assert.equal(session.paused, true);
  fail = false;
  const resumed = await persistCurriculumResume(session, repository, ticket, [retainedWrite]);
  assert.deepEqual(order, ['checkpoint', 'checkpoint', 'resume']);
  assert.deepEqual(persisted.attempt, checkpoint);
  assert.equal(resumed.currentAttemptId, checkpoint.attemptId);
  assert.equal(persisted.session.paused, false);
  assert.equal(session.paused, true);
  const completion = deferred(),
    started = deferred();
  persisted.session = null;
  const superseded = persistCurriculumResume(session, repository, ticket, [
    async () => {
      started.resolve();
      return completion.promise;
    },
  ]);
  await started.promise;
  current = false;
  completion.resolve({ ok: true, value: 'already saved' });
  assert.equal(await superseded, null);
  assert.equal(persisted.session, null);
});
