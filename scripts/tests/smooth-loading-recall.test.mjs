import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as recallValidation from '../../src/persistence/recall-validation.ts';
import { initialRecallPreferences } from '../../src/recall/recall-hub.ts';
import { createFlashcardDeck, checkpointForDeck } from '../../src/recall/flashcard-checkpoint.ts';
import { prepareRecall, recallResult } from '../../src/recall/prepare.ts';
import { isModuleLoadFailure } from '../../src/loading/module-errors.ts';
import { createLoadingCoordinator } from '../../src/loading/coordinator.ts';
import { factsFor } from '../../src/recall/facts.ts';
import { createRecallSession } from '../../src/recall/scheduler.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../../src/contracts/recall.ts';
import {
  validateRecallAttempt,
  validateRecallSession,
} from '../../src/persistence/recall-validation.ts';

const ok = (value) => ({ ok: true, value });
const denied = {
  ok: false,
  error: { code: 'quota', message: 'Denied fixture write', retryable: true },
};
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((r, failure) => {
    resolve = r;
    reject = failure;
  });
  return { promise, resolve, reject };
};
function fixture(course = 'igcse') {
  const namespace = { course, profileId: 'local' },
    fact = factsFor(course)[0];
  const writes = [],
    attempts = new Map(),
    sessions = new Map();
  let fail = false,
    checkpoint = null;
  const repository = {
    loadRecallPreferences: async () => ok(null),
    recallProgress: async () => ok([]),
    loadRecallSession: async (_namespace, id) => ok(sessions.get(id) ?? null),
    loadRecallAttempt: async (_namespace, id) => ok(attempts.get(id) ?? null),
    saveRecall: async (write) => {
      validateRecallAttempt(write.attempt);
      validateRecallSession(write.session);
      writes.push(structuredClone(write));
      if (fail) {
        fail = false;
        return denied;
      }
      attempts.set(write.attempt.attemptId, structuredClone(write.attempt));
      sessions.set(write.session.id, structuredClone(write.session));
      return ok({ attemptId: write.attempt.attemptId, evidence: 'none' });
    },
    saveRecallSession: async (session) => {
      sessions.set(session.id, session);
      return ok(session.id);
    },
    loadRecallFlashcards: async () => ok(checkpoint),
    saveRecallFlashcards: async (value) => {
      checkpoint = value;
      writes.push({ flashcards: value });
      return ok('saved');
    },
    close() {},
  };
  return {
    repository,
    writes,
    attempts,
    sessions,
    namespace,
    fact,
    fail() {
      fail = true;
    },
    input: {
      course,
      databaseName: 'recall-unit-' + course,
      repository,
      gemIds: [fact.gemIds[0]],
      launchMode: 'test',
    },
  };
}
test('deferred Recall reads retain outgoing content and produce no attempt before preparation', async () => {
  const f = fixture(),
    coordinator = createLoadingCoordinator(),
    read = deferred();
  f.repository.loadRecallPreferences = () => read.promise;
  let visible = 'chooser';
  const operation = coordinator.run(
    'question',
    (ticket) => prepareRecall({ ...f.input, ticket }),
    (value) => {
      visible = value.destination.kind;
    },
  );
  assert.equal(coordinator.snapshot().pending, true);
  assert.equal(visible, 'chooser');
  assert.equal(f.writes.length, 0);
  read.resolve(ok(null));
  assert.equal(await operation, true);
  assert.equal(visible, 'test');
  assert.equal(f.writes.length, 1);
  assert.equal(f.writes[0].attempt.timing.activeMs, 0);
  assert.equal(f.writes[0].attempt.definitionId, CURRENT_RECALL_DEFINITION_ID);
});
test('superseded Recall read never saves or commits its stale destination', async () => {
  const f = fixture(),
    coordinator = createLoadingCoordinator(),
    read = deferred();
  f.repository.loadRecallPreferences = () => read.promise;
  let visible = 'chooser';
  const old = coordinator.run(
    'screen',
    (ticket) => prepareRecall({ ...f.input, ticket }),
    () => {
      visible = 'stale';
    },
  );
  assert.equal(
    await coordinator.run(
      'screen',
      async () => 'home',
      (value) => {
        visible = value;
      },
    ),
    true,
  );
  read.resolve(ok(null));
  assert.equal(await old, false);
  assert.equal(visible, 'home');
  assert.equal(f.writes.length, 0);
});
test('failed Recall initial write retries the same identity with no premature commit', async () => {
  const f = fixture('alevel'),
    coordinator = createLoadingCoordinator();
  f.fail();
  let commits = 0;
  assert.equal(
    await coordinator.run(
      'question',
      (ticket) => prepareRecall({ ...f.input, ticket }),
      () => commits++,
    ),
    false,
  );
  assert.equal(commits, 0);
  assert.equal(f.writes.length, 1);
  assert.equal(await coordinator.retry(), true);
  assert.equal(commits, 1);
  assert.equal(f.writes[0].attempt.attemptId, f.writes[1].attempt.attemptId);
  assert.deepEqual(f.writes[0].session.factIds, f.writes[1].session.factIds);
  assert.deepEqual(f.writes[0].attempt.ref, f.writes[1].attempt.ref);
});
test('durable saved attempt restoration retains identity, answers and active time', async () => {
  const f = fixture(),
    coordinator = createLoadingCoordinator();
  let prepared;
  await coordinator.run(
    'question',
    (ticket) => prepareRecall({ ...f.input, ticket }),
    (value) => {
      prepared = value;
    },
  );
  const id = prepared.destination.attempt.attemptId,
    saved = f.attempts.get(id);
  saved.timing.activeMs = 1729;
  saved.currentResponses = { answer: { kind: 'text', value: 'draft' } };
  f.attempts.set(id, saved);
  await coordinator.run(
    'question',
    (ticket) => prepareRecall({ ...f.input, ticket }),
    (value) => {
      prepared = value;
    },
  );
  assert.equal(prepared.destination.attempt.attemptId, id);
  assert.equal(prepared.destination.attempt.timing.activeMs, 1729);
  assert.deepEqual(prepared.destination.attempt.currentResponses, saved.currentResponses);
});
test('both-course teacher preparations and exact historical review create no writes', async () => {
  for (const course of ['igcse', 'alevel']) {
    const f = fixture(course),
      coordinator = createLoadingCoordinator();
    let prepared;
    await coordinator.run(
      'screen',
      (ticket) => prepareRecall({ ...f.input, ticket, mode: 'teacher' }),
      (value) => {
        prepared = value;
      },
    );
    assert.equal(prepared.destination.kind, 'teacher');
    assert.equal(f.writes.length, 0);
    await coordinator.run(
      'screen',
      (ticket) =>
        prepareRecall({
          ...f.input,
          ticket,
          mode: 'teacher',
          reviewFact: { factId: f.fact.id, historical: false },
        }),
      (value) => {
        prepared = value;
      },
    );
    assert.equal(prepared.destination.fact.id, f.fact.id);
    assert.equal(f.writes.length, 0);
  }
});
test('fresh Flashcards deck and its ordering are durable before chooser commit', async () => {
  const f = fixture(),
    coordinator = createLoadingCoordinator(),
    held = deferred();
  let visible = 'chooser';
  f.repository.saveRecallFlashcards = async (checkpoint) => {
    f.writes.push({ flashcards: checkpoint });
    return held.promise;
  };
  const operation = coordinator.run(
    'question',
    (ticket) => prepareRecall({ ...f.input, ticket, launchMode: 'flashcards' }),
    (value) => {
      visible = value.destination.kind;
    },
  );
  while (!f.writes.length) await new Promise((resolve) => setImmediate(resolve));
  assert.equal(visible, 'chooser');
  assert.equal(coordinator.snapshot().pending, true);
  held.resolve(ok('saved'));
  assert.equal(await operation, true);
  assert.equal(visible, 'flashcards');
  assert.equal(f.writes[0].flashcards.namespace.course, 'igcse');
});
test('whole-set Next completion saves the session without another attempt or clock', async () => {
  const f = fixture(),
    coordinator = createLoadingCoordinator();
  const currentSession = {
    ...createRecallSession(
      f.namespace,
      'completed-unit',
      'recall-practice',
      [f.fact.id],
      [f.fact.gemIds[0]],
    ),
    visitedFactIds: [f.fact.id],
  };
  let prepared;
  await coordinator.run(
    'question',
    (ticket) => prepareRecall({ ...f.input, ticket, currentSession }),
    (value) => {
      prepared = value;
    },
  );
  assert.equal(prepared.destination.kind, 'completed');
  assert.equal(f.writes.length, 0);
  assert.equal(f.sessions.get('completed-unit').status, 'complete');
});
test('common persistence validation has no eager Recall content imports', () => {
  const common = fs.readFileSync(
    new URL('../../src/persistence/validation.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(common, /from ['"]\.\.\/recall\//);
  const repository = fs.readFileSync(
    new URL('../../src/persistence/repository.ts', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(repository, /^import (?!type).*from ['"]\.\.\/recall\//m);
  assert.match(repository, /import\('\.\/recall-validation.ts'\)/);
});

function recallRepositoryHarnessSource() {
  const file = new URL('../../src/persistence/repository.ts', import.meta.url);
  let source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  const dexieImport = "import Dexie from 'dexie';";
  const lazyImport = "const loadRecallValidation = () => import('./recall-validation.ts');";
  assert(source.includes(dexieImport));
  assert(source.includes(lazyImport));
  source = source
    .replace(dexieImport, 'const Dexie = globalThis.__recallSnapshotHarness.Dexie;')
    .replace(
      lazyImport,
      'const loadRecallValidation = () => globalThis.__recallSnapshotHarness.gate.promise;',
    )
    .replace(
      /from (['"])(\.{1,2}\/[^'"]+)\1/g,
      (_match, _quote, specifier) => `from ${JSON.stringify(new URL(specifier, file).href)}`,
    );
  return source;
}
test('all four lazy Recall saves capture call-time payload before the validator loader yields', async () => {
  const source = recallRepositoryHarnessSource();
  const f = fixture(),
    ref = { activityId: 'igcse/recall', questionId: f.fact.id, seed: 0, level: 1 };
  const attempt = {
    mode: 'student',
    definitionId: CURRENT_RECALL_DEFINITION_ID,
    namespace: f.namespace,
    attemptId: 'snapshot-attempt',
    ref,
    target: {
      kind: 'recall',
      course: 'igcse',
      activityId: 'igcse/recall',
      factId: f.fact.id,
      level: 1,
    },
    phase: 'answering',
    currentResponses: { answer: { kind: 'text', value: 'original' } },
    assistance: [],
    timing: { attemptId: 'snapshot-attempt', activeMs: 0, idleLimitMs: 60000, finished: false },
  };
  const gem = f.fact.gemIds[0],
    scope = { kind: 'gem', gemId: gem };
  const session = createRecallSession(
    f.namespace,
    'snapshot-session',
    'recall-practice',
    factsFor('igcse', [gem]).map((f) => f.id),
    [gem],
  );
  const checkpoint = checkpointForDeck(createFlashcardDeck(session.factIds), f.namespace, scope);
  const cases = [
    {
      method: 'saveRecall',
      table: 'recallAttempts',
      payload: { attempt, session: undefined },
      mutate: (value) => {
        value.attempt.currentResponses.answer.value = 'mutated during chunk';
      },
      expected: attempt,
    },
    {
      method: 'saveRecallPreferences',
      table: 'recallPreferences',
      payload: initialRecallPreferences(f.namespace),
      mutate: (value) => {
        value.mode = value.mode === 'test' ? 'flashcards' : 'test';
      },
    },
    {
      method: 'saveRecallFlashcards',
      table: 'recallFlashcards',
      payload: checkpoint,
      mutate: (value) => {
        value.revealed = true;
      },
    },
    {
      method: 'saveRecallSession',
      table: 'recallSessions',
      payload: session,
      mutate: (value) => {
        value.status = 'paused';
      },
    },
  ];
  try {
    for (const [index, scenario] of cases.entries()) {
      const gate = deferred(),
        rows = new Map();
      let transactions = 0;
      class MemoryTable {
        constructor(name) {
          this.name = name;
        }
        async get() {
          return undefined;
        }
        async put(row) {
          rows.set(this.name, structuredClone(row));
        }
        async add(row) {
          rows.set(this.name, structuredClone(row));
        }
      }
      class MemoryDexie {
        version() {
          return { stores() {} };
        }
        table(name) {
          return new MemoryTable(name);
        }
        async transaction(...args) {
          transactions++;
          return args.at(-1)();
        }
        close() {}
      }
      globalThis.__recallSnapshotHarness = { Dexie: MemoryDexie, gate };
      const module = await import(
        'data:text/javascript;base64,' +
          Buffer.from(source + '\n// snapshot case ' + index).toString('base64')
      );
      const repository = module.createRepository(
        'masters-of-chemistry-alpha-v2-recall-snapshot-memory',
      );
      const payload = structuredClone(scenario.payload),
        original = structuredClone(scenario.expected ?? payload);
      const pending = repository[scenario.method](payload);
      scenario.mutate(payload);
      assert.equal(rows.size, 0, 'No persistence before validator readiness');
      assert.equal(transactions, 0, 'No transaction before validator readiness');
      gate.resolve(recallValidation);
      const result = await pending;
      assert.equal(result.ok, true, JSON.stringify(result));
      assert.deepEqual(
        rows.get(scenario.table).value,
        original,
        scenario.method + ' must persist its call-time snapshot',
      );
      if (scenario.method === 'saveRecall') assert.equal(transactions, 1);
    }
  } finally {
    delete globalThis.__recallSnapshotHarness;
  }
});

test('all six lazy Recall reads preserve call-time namespace and Flashcard scope including topic arrays', async () => {
  const source = recallRepositoryHarnessSource();
  const originalNamespace = { course: 'igcse', profileId: 'local' };
  const topics = initialRecallPreferences(originalNamespace).globalTopicIds;
  const scope = { kind: 'global', topicIds: [...topics] };
  const expectedScope = recallValidation.recallScopeKey(originalNamespace, scope);
  const cases = [
    ['loadRecallPreferences', 'selection'],
    ['loadRecallFlashcards', expectedScope],
    ['loadRecallAttempt', 'attempt-id'],
    ['loadRecallSession', 'session-id'],
    ['recallHistory', null],
    ['recallProgress', null],
  ];
  try {
    for (const [index, [method, identity]] of cases.entries()) {
      const gate = deferred(),
        reads = [];
      class MemoryTable {
        async get(key) {
          reads.push(structuredClone(key));
          return undefined;
        }
        where() {
          return {
            equals(key) {
              reads.push(structuredClone(key));
              return { toArray: async () => [] };
            },
          };
        }
      }
      class MemoryDexie {
        version() {
          return { stores() {} };
        }
        table() {
          return new MemoryTable();
        }
        close() {}
      }
      globalThis.__recallSnapshotHarness = { Dexie: MemoryDexie, gate };
      const module = await import(
        'data:text/javascript;base64,' +
          Buffer.from(source + '\n// namespace case ' + index).toString('base64')
      );
      const repository = module.createRepository(
        'masters-of-chemistry-alpha-v2-recall-read-memory',
      );
      const namespace = { ...originalNamespace },
        selection = { kind: 'global', topicIds: [...topics] };
      const argument = method === 'loadRecallFlashcards' ? selection : identity;
      const pending = repository[method](namespace, argument);
      namespace.course = 'alevel';
      namespace.profileId = 'mutated-profile';
      selection.topicIds.splice(0);
      assert.equal(reads.length, 0, 'Read must await validator readiness');
      gate.resolve(recallValidation);
      const result = await pending;
      assert.equal(result.ok, true, JSON.stringify(result));
      assert.deepEqual(
        reads,
        [identity === null ? ['igcse', 'local'] : ['igcse', 'local', identity]],
        method + ' uses original call-time selector',
      );
    }
  } finally {
    delete globalThis.__recallSnapshotHarness;
  }
});

test('validator chunk failures survive repository and Recall conversion as Reload recovery; ordinary quota stays Retry', async () => {
  const source = recallRepositoryHarnessSource(),
    namespace = { course: 'igcse', profileId: 'local' };
  try {
    for (const [index, kind] of ['read-module', 'write-css', 'ordinary-quota'].entries()) {
      const gate = deferred();
      let writes = 0;
      class MemoryTable {
        async put() {
          writes++;
          throw new DOMException('Fixture storage quota', 'QuotaExceededError');
        }
      }
      class MemoryDexie {
        version() {
          return { stores() {} };
        }
        table() {
          return new MemoryTable();
        }
        close() {}
      }
      globalThis.__recallSnapshotHarness = { Dexie: MemoryDexie, gate };
      const module = await import(
        'data:text/javascript;base64,' +
          Buffer.from(source + '\n// module recovery case ' + index).toString('base64')
      );
      const repository = module.createRepository(
        'masters-of-chemistry-alpha-v2-recall-module-memory',
      );
      const pending =
        kind === 'read-module'
          ? repository.recallProgress(namespace)
          : repository.saveRecallPreferences(initialRecallPreferences(namespace));
      if (kind === 'ordinary-quota') gate.resolve(recallValidation);
      else
        gate.reject(
          new Error(
            kind === 'read-module'
              ? 'Failed to fetch dynamically imported module: fixture'
              : 'Unable to preload CSS for fixture',
          ),
        );
      const result = await pending;
      assert.equal(result.ok, false);
      assert.equal(result.error.code, kind === 'ordinary-quota' ? 'quota' : 'unavailable');
      assert.equal(result.error.retryable, kind === 'ordinary-quota');
      assert.equal(result.error.recovery, kind === 'ordinary-quota' ? undefined : 'reload');
      assert.equal(writes, kind === 'ordinary-quota' ? 1 : 0, 'Module failure starts no write');
      const coordinator = createLoadingCoordinator();
      let committed = false;
      assert.equal(
        await coordinator.run(
          'screen',
          async () => recallResult(result),
          () => {
            committed = true;
          },
        ),
        false,
      );
      assert.equal(committed, false);
      assert.equal(isModuleLoadFailure(coordinator.snapshot().error), kind !== 'ordinary-quota');
    }
  } finally {
    delete globalThis.__recallSnapshotHarness;
  }
});
