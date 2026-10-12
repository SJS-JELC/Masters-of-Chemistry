import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoadingCoordinator } from '../../src/loading/coordinator.ts';
import { prepareStatistics, refreshStatistics } from '../../src/statistics/prepare.ts';
import { prepareOlympiad } from '../../src/foundation/prepare-olympiad.ts';
import { prepareImport } from '../../src/compatibility/prepare-import.ts';
import { createViewRepositoryLifetime } from '../../src/foundation/view-repository-lifetime.ts';
import { executeLegacyImport } from '../../src/compatibility/import.ts';
import { CURRENT_IMPORT_KEY } from '../../src/persistence/legacy/plan.ts';
import { chemicalChallenge as c3Challenge } from '../../src/activities/olympiad/c3l6/source-bank.ts';
import { c3Policy, blankC3Progress } from '../../src/activities/olympiad/c3l6/policy.ts';
import { maxwellChallenge } from '../../src/activities/olympiad/maxwells-demon/content.ts';
import {
  maxwellPolicy,
  blankMaxwellProgress,
} from '../../src/activities/olympiad/maxwells-demon/policy.ts';
import { isomerChallenge } from '../../src/activities/olympiad/isomers2011/content.ts';
import {
  isomerPolicy,
  blankIsomerProgress,
} from '../../src/activities/olympiad/isomers2011/policy.ts';

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};
const ok = (value) => ({ ok: true, value });
const failed = {
  ok: false,
  error: { code: 'unavailable', message: 'Storage denied', retryable: true },
};
const base = (course) => ({
  course,
  namespace: { course, profileId: 'local' },
  databaseName: `views-${course}`,
  registry: {},
});
const modules = {
  'alevel/c3l6-organic-reactions': { c3Challenge, c3Policy, blankC3Progress },
  'alevel/maxwells-demon': { maxwellChallenge, maxwellPolicy, blankMaxwellProgress },
  'alevel/olympiad-2011-q4': { isomerChallenge, isomerPolicy, blankIsomerProgress },
};
const loadRuntime = async (id) => ({ id, module: modules[id] });

test('all view preparation paths retain module-reload recovery through repository results', async () => {
  const denied = {
    ok: false,
    error: {
      code: 'unavailable',
      message: 'Required validator module unavailable',
      retryable: false,
      recovery: 'reload',
    },
  };
  const repository = {
    curriculumHistory: async () => denied,
    recallHistory: async () => denied,
    loadOlympiad: async () => denied,
  };
  const operations = [
    (ticket) => prepareStatistics({ ...base('alevel'), repository, ticket }),
    (ticket) => prepareImport({ ...base('alevel'), repository, ticket }),
    (ticket) =>
      prepareOlympiad({
        activityId: 'alevel/maxwells-demon',
        databaseName: 'module-fault',
        repository,
        ticket,
      }),
  ];
  for (const prepare of operations) {
    const coordinator = createLoadingCoordinator();
    assert.equal(
      await coordinator.run('screen', prepare, () =>
        assert.fail('module-error destination committed'),
      ),
      false,
    );
    assert.equal(coordinator.snapshot().error.recovery, 'reload');
  }
});

test('import keeps reload recovery outside immutable archive/report shapes', async () => {
  const namespace = base('alevel').namespace,
    archives = [];
  const source = JSON.stringify({
    namespace,
    source: { key: CURRENT_IMPORT_KEY, fingerprint: 'fixture' },
    curriculum: [],
    olympiad: [],
  });
  const repository = {
    saveImportArchive: async (value) => {
      archives.push(value);
      return ok(null);
    },
    importBatch: async () => ({
      ok: false,
      error: {
        code: 'unavailable',
        message: 'Import validator module unavailable',
        retryable: false,
        recovery: 'reload',
      },
    }),
  };
  const result = await executeLegacyImport(repository, namespace, { [CURRENT_IMPORT_KEY]: source });
  assert.equal(result.recovery, 'reload');
  assert.equal(result.errors.length, 1);
  assert.equal(archives.length, 2);
  assert.equal(Object.hasOwn(archives[0], 'recovery'), false);
  assert.equal(Object.hasOwn(JSON.parse(archives[1].rawText), 'recovery'), false);
});

test('same-instance React effect replay keeps the repository open; real unmount drains started writes', async () => {
  const lifetime = createViewRepositoryLifetime(),
    write = deferred();
  let closes = 0;
  const repository = {
    close: () => {
      closes++;
    },
  };
  const replay = lifetime.retain(repository, () => Promise.resolve());
  replay();
  const unmount = lifetime.retain(repository, () => write.promise);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(closes, 0, 'StrictMode replay closed the still-mounted repository');
  unmount();
  unmount();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(closes, 0, 'real unmount closed a repository with a started write');
  write.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(closes, 1, 'real unmount must dispose exactly once after its write');
});

test('changed repository retires independently after its old write drains', async () => {
  const lifetime = createViewRepositoryLifetime(),
    oldWrite = deferred(),
    events = [];
  const oldRepository = { close: () => events.push('old-close') },
    currentRepository = { close: () => events.push('current-close') };
  const oldUnmount = lifetime.retain(oldRepository, () => oldWrite.promise);
  oldUnmount();
  const currentUnmount = lifetime.retain(currentRepository, () => Promise.resolve());
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, []);
  oldWrite.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, ['old-close']);
  currentUnmount();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, ['old-close', 'current-close']);
});

test('a replay disposal cannot close over a later unmount with a newer unfinished write', async () => {
  const lifetime = createViewRepositoryLifetime(),
    earlier = deferred(),
    later = deferred();
  let closes = 0;
  const repository = {
    close: () => {
      closes++;
    },
  };
  lifetime.retain(repository, () => earlier.promise)();
  lifetime.retain(repository, () => later.promise)();
  earlier.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(closes, 0, 'obsolete disposal raced a newer started write');
  later.resolve();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(closes, 1);
});

for (const course of ['alevel', 'igcse'])
  test(`${course} Stats commits only after curriculum and Recall reads are ready`, async () => {
    const c = createLoadingCoordinator(),
      curriculum = deferred(),
      recall = deferred(),
      commits = [];
    const history = [{ id: 'historical', completedAt: 1 }];
    const repository = {
      curriculumHistory: () => curriculum.promise,
      recallHistory: () => recall.promise,
    };
    const running = c.run(
      'screen',
      (ticket) => prepareStatistics({ ...base(course), repository, ticket }),
      (value) => commits.push(value),
    );
    curriculum.resolve(ok(history));
    await Promise.resolve();
    assert.equal(commits.length, 0);
    recall.resolve(ok([{ id: 'recall-first', timing: undefined }]));
    assert.equal(await running, true);
    assert.equal(commits.length, 1);
    assert.equal(commits[0].history, history);
    assert.equal(
      commits[0].history[0].timing,
      undefined,
      'missing historic timing must remain missing',
    );
    assert.equal(commits[0].recallHistory[0].timing, undefined);
  });

test('optional focus refresh neither supersedes navigation nor retries an existing error', async () => {
  const c = createLoadingCoordinator(),
    ready = deferred(),
    events = [];
  const navigation = c.run(
    'screen',
    () => ready.promise,
    () => events.push('navigation'),
  );
  const id = c.snapshot().ticket.id;
  assert.equal(
    await refreshStatistics(
      c,
      async () => assert.fail('focus read superseded navigation'),
      () => assert.fail('focus commit'),
    ),
    false,
  );
  assert.equal(c.snapshot().ticket.id, id);
  ready.resolve();
  await navigation;
  await c.run(
    'screen',
    async () => {
      throw Error('navigation failed');
    },
    () => {},
  );
  assert.equal(
    await refreshStatistics(
      c,
      async () => assert.fail('focus hid the error'),
      () => {},
    ),
    false,
  );
  assert.equal(c.snapshot().error.message, 'navigation failed');
  assert.deepEqual(events, ['navigation']);
});

test('Stats storage failure preserves the old snapshot and retry rereads both channels', async () => {
  const c = createLoadingCoordinator();
  let deny = true,
    shown = { history: ['old-chart'] },
    reads = 0;
  const repository = {
    curriculumHistory: async () => {
      reads++;
      return ok([]);
    },
    recallHistory: async () => (deny ? failed : ok([])),
  };
  assert.equal(
    await refreshStatistics(
      c,
      (ticket) => prepareStatistics({ ...base('igcse'), repository, ticket }),
      (value) => {
        shown = value;
      },
    ),
    false,
  );
  assert.deepEqual(shown.history, ['old-chart']);
  assert.match(c.snapshot().error.message, /Saved Recall timing.*Storage denied/);
  deny = false;
  assert.equal(await c.retry(), true);
  assert.deepEqual(shown.history, []);
  assert.equal(reads, 2);
});

test('a superseded Stats read cannot publish after a later screen', async () => {
  const c = createLoadingCoordinator(),
    recall = deferred(),
    events = [];
  const first = refreshStatistics(
    c,
    (ticket) =>
      prepareStatistics({
        ...base('alevel'),
        ticket,
        repository: { curriculumHistory: async () => ok([]), recallHistory: () => recall.promise },
      }),
    () => events.push('stale-chart'),
  );
  const latest = c.run(
    'screen',
    async () => 'home',
    (value) => events.push(value),
  );
  assert.equal(await latest, true);
  recall.resolve(ok([]));
  assert.equal(await first, false);
  assert.deepEqual(events, ['home']);
});

for (const [id, module] of Object.entries(modules))
  test(`${id} loads intended module/progress before commit and derives preview from intended URL`, async () => {
    const c = createLoadingCoordinator(),
      available = deferred(),
      commits = [];
    const blank =
      module.blankC3Progress ?? module.blankMaxwellProgress ?? module.blankIsomerProgress;
    const saved = blank('teacher-profile');
    const repository = { loadOlympiad: () => available.promise };
    const running = c.run(
      'screen',
      (ticket) =>
        prepareOlympiad({
          url: `https://school.test/?activity=${encodeURIComponent(id)}&mode=teacher`,
          profileId: 'teacher-profile',
          databaseName: 'intended-db',
          repository,
          loadRuntime,
          ticket,
        }),
      (value) => commits.push(value),
    );
    assert.equal(commits.length, 0);
    available.resolve(ok(saved));
    assert.equal(await running, true);
    assert.equal(commits[0].runtime.id, id);
    assert.equal(commits[0].readOnly, true);
    assert.equal(commits[0].profileId, 'teacher-profile');
    assert.equal(commits[0].databaseName, 'intended-db');
    assert.equal(commits[0].progress.activityId, id);
    assert.equal(commits[0].progress.kind, 'olympiad-completion');
    const policy = module.c3Policy ?? module.maxwellPolicy ?? module.isomerPolicy;
    const challenge = module.c3Challenge ?? module.maxwellChallenge ?? module.isomerChallenge;
    assert.deepEqual(commits[0].progress, policy.validateCompletion(challenge, saved));
  });

test('Olympiad landing waits for all three saved completion reads and propagates unavailable storage', async () => {
  const c = createLoadingCoordinator(),
    third = deferred(),
    reads = [];
  const repository = {
    loadOlympiad: async (_profile, id = 'alevel/c3l6-organic-reactions') => {
      reads.push(id);
      return id === 'alevel/maxwells-demon' ? third.promise : ok(null);
    },
  };
  let shown = null;
  const running = c.run(
    'screen',
    (ticket) => prepareOlympiad({ repository, ticket, databaseName: 'landing-db' }),
    (value) => {
      shown = value;
    },
  );
  await Promise.resolve();
  assert.equal(shown, null);
  assert.equal(reads.length, 3);
  third.resolve(failed);
  assert.equal(await running, false);
  assert.equal(shown, null);
  assert.match(c.snapshot().error.message, /Saved challenge progress.*Storage denied/);
});

test('import startup waits for storage and rejects course/profile mismatches without a read', async () => {
  const c = createLoadingCoordinator(),
    available = deferred();
  let shown = null;
  const repository = { curriculumHistory: () => available.promise };
  const running = c.run(
    'screen',
    (ticket) => prepareImport({ ...base('igcse'), repository, ticket }),
    (value) => {
      shown = value;
    },
  );
  assert.equal(shown, null);
  available.resolve(ok([]));
  assert.equal(await running, true);
  assert.deepEqual(shown, { course: 'igcse', profileId: 'local', databaseName: 'views-igcse' });
  const bad = {
    ...base('igcse'),
    course: 'alevel',
    repository: { curriculumHistory: () => assert.fail('mismatched profile read') },
  };
  assert.equal(
    await c.run(
      'screen',
      (ticket) => prepareImport({ ...bad, ticket }),
      () => assert.fail('mismatched import committed'),
    ),
    false,
  );
  assert.match(c.snapshot().error.message, /course and profile do not match/);
});
