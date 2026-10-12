import assert from 'node:assert/strict';
import test from 'node:test';
import { createLoadingCoordinator } from '../../src/loading/coordinator.ts';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function fixture(options = {}) {
  let now = 0, sequence = 0;
  const timers = new Map();
  const coordinator = createLoadingCoordinator({
    ...options,
    delayMs: 200,
    setTimer: (callback, delay) => {
      const id = ++sequence;
      timers.set(id, { callback, due: now + delay });
      return id;
    },
    clearTimer: (id) => timers.delete(id),
  });
  function advance(ms) {
    now += ms;
    for (const [id, timer] of [...timers]) {
      if (timer.due <= now && timers.delete(id)) timer.callback();
    }
  }
  return { coordinator, advance, timers };
}

const tick = async () => { await Promise.resolve(); await Promise.resolve(); };

test('fast preparation freezes immediately but never displays the delayed bar', async () => {
  const { coordinator: c, advance, timers } = fixture();
  const prepared = deferred(), commits = [], observed = [];
  let freezes = 0;
  c.onFreeze(() => freezes++);
  c.subscribe(() => observed.push(c.snapshot().visible));
  const result = c.run('screen', () => prepared.promise, value => commits.push(value));
  assert.equal(freezes, 1, 'freeze must happen synchronously before preparation yields');
  assert.equal(c.snapshot().pending, true);
  assert.equal(c.snapshot().visible, false);
  advance(199);
  assert.equal(c.snapshot().visible, false);
  prepared.resolve('destination');
  assert.equal(await result, true);
  assert.deepEqual(commits, ['destination']);
  advance(1000);
  assert.equal(observed.includes(true), false);
  assert.equal(c.snapshot().pending, false);
  assert.equal(timers.size, 0);
});

test('slow module/data preparation shows the bar at 200ms and settles without a forced dwell', async () => {
  const { coordinator: c, advance } = fixture();
  const prepared = deferred();
  const result = c.run('question', () => prepared.promise, () => {});
  advance(199);
  assert.equal(c.snapshot().visible, false);
  advance(1);
  assert.equal(c.snapshot().visible, true);
  prepared.resolve();
  assert.equal(await result, true);
  assert.equal(c.snapshot().pending, false);
  assert.equal(c.snapshot().visible, false);
});

test('supersession aborts old tickets and only the latest destination commits', async () => {
  const { coordinator: c, advance } = fixture();
  const older = deferred(), newer = deferred(), started = deferred(), commits = [];
  let oldTicket;
  const first = c.run('question', ticket => { oldTicket = ticket; started.resolve(); return older.promise; }, value => commits.push(value));
  await started.promise;
  advance(200);
  const second = c.run('screen', () => newer.promise, value => commits.push(value));
  assert.equal(oldTicket.signal.aborted, true);
  assert.equal(oldTicket.isCurrent(), false);
  newer.resolve('new');
  assert.equal(await second, true);
  older.resolve('old');
  assert.equal(await first, false);
  assert.deepEqual(commits, ['new']);
  assert.equal(c.snapshot().error, null);
  assert.equal(c.snapshot().pending, false);
});

test('an obsolete rejection cannot replace the latest success with an error', async () => {
  const { coordinator: c } = fixture();
  const obsolete = deferred(), latest = deferred(), started = deferred();
  const first = c.run('tool', () => { started.resolve(); return obsolete.promise; }, () => assert.fail('obsolete commit'));
  await started.promise;
  const second = c.run('screen', () => latest.promise, () => {});
  latest.resolve();
  assert.equal(await second, true);
  obsolete.reject(new Error('obsolete network error'));
  assert.equal(await first, false);
  assert.equal(c.snapshot().error, null);
});

test('failure stops the bar; retry preserves the captured destination and commits once', async () => {
  const { coordinator: c, advance } = fixture();
  const firstRead = deferred(), commits = [];
  const destination = { attemptId: 'retained-attempt', seed: 17 };
  let reads = 0;
  const result = c.run('question', async () => {
    if (++reads === 1) await firstRead.promise;
    return destination;
  }, value => commits.push(value));
  advance(200);
  firstRead.reject(new Error('saved data unavailable'));
  assert.equal(await result, false);
  assert.match(c.snapshot().error.message, /saved data unavailable/);
  assert.equal(c.snapshot().pending, false);
  assert.equal(c.snapshot().visible, false);
  assert.deepEqual(commits, []);
  assert.equal(await c.retry(), true);
  assert.deepEqual(commits, [destination]);
  assert.equal(c.snapshot().error, null);
});

test('cancel aborts pending work and a late completion cannot commit or resurrect the bar', async () => {
  const { coordinator: c, advance, timers } = fixture();
  const prepared = deferred(), started = deferred();
  let ticket;
  const result = c.run('screen', value => { ticket = value; started.resolve(); return prepared.promise; }, () => assert.fail('cancelled commit'));
  await started.promise;
  const cancelled = c.cancel();
  assert.equal(ticket.signal.aborted, true);
  assert.equal(ticket.isCurrent(), false);
  assert.equal(c.snapshot().pending, true, 'cancel must retain blocking until resume has settled');
  assert.equal(await cancelled, true);
  assert.equal(c.snapshot().pending, false);
  advance(1000);
  prepared.resolve();
  assert.equal(await result, false);
  assert.equal(c.snapshot().visible, false);
  assert.equal(timers.size, 0);
});

test('started durable writes finish and serialize before a competing ticket writes', async () => {
  const { coordinator: c } = fixture();
  const writeStarted = deferred(), releaseWrite = deferred(), events = [], commits = [];
  const first = c.run('question', async ticket => {
    await ticket.persist(async () => {
      events.push('first-write-start');
      writeStarted.resolve();
      await releaseWrite.promise;
      events.push('first-write-end');
    });
    return 'old';
  }, value => commits.push(value));
  await writeStarted.promise;
  const second = c.run('screen', async ticket => {
    await ticket.persist(async () => events.push('second-write'));
    return 'new';
  }, value => commits.push(value));
  await tick();
  assert.deepEqual(events, ['first-write-start']);
  releaseWrite.resolve();
  assert.equal(await first, false);
  assert.equal(await second, true);
  assert.deepEqual(events, ['first-write-start', 'first-write-end', 'second-write']);
  assert.deepEqual(commits, ['new']);
});

test('obsolete tickets cannot start a fresh durable write after cancellation', async () => {
  const { coordinator: c } = fixture();
  const release = deferred();
  let writes = 0;
  const result = c.run('question', async ticket => {
    await release.promise;
    await ticket.persist(async () => { writes++; });
  }, () => assert.fail('cancelled commit'));
  const cancelled = c.cancel();
  release.resolve();
  assert.equal(await result, false);
  assert.equal(await cancelled, true);
  assert.equal(writes, 0);
});

test('failed durable write prevents destination commit and remains explicitly retryable', async () => {
  const { coordinator: c } = fixture();
  let fail = true, writes = 0, commits = 0;
  const result = await c.run('question', async ticket => {
    await ticket.persist(async () => {
      writes++;
      if (fail) throw new Error('transaction aborted');
    });
  }, () => commits++);
  assert.equal(result, false);
  assert.equal(commits, 0);
  assert.match(c.snapshot().error.message, /transaction aborted/);
  fail = false;
  assert.equal(await c.retry(), true);
  assert.equal(writes, 2);
  assert.equal(commits, 1);
});

test('cancel resumes the outgoing screen only after a started durable write drains', async () => {
  const { coordinator: c } = fixture();
  const started = deferred(), release = deferred(), resumed = deferred();
  let resumes = 0;
  c.onCancel(() => { resumes++; resumed.resolve(); });
  const result = c.run('question', async ticket => {
    await ticket.persist(async () => { started.resolve(); await release.promise; });
  }, () => assert.fail('cancelled commit'));
  await started.promise;
  const cancelled = c.cancel();
  await tick();
  assert.equal(resumes, 0, 'the original attempt cannot resume over an unfinished write');
  assert.equal(c.snapshot().pending, true, 'outgoing controls must remain blocked while a write drains');
  release.resolve();
  await resumed.promise;
  assert.equal(await cancelled, true);
  assert.equal(await result, false);
  assert.equal(resumes, 1);
});

test('a late prepared value disposes abandoned resources without committing', async () => {
  const { coordinator: c } = fixture();
  const prepared = deferred(), started = deferred();
  let disposed = 0;
  const result = c.run('tool', () => { started.resolve(); return prepared.promise; }, () => assert.fail('cancelled tool commit'));
  await started.promise;
  const cancelled = c.cancel();
  prepared.resolve({dispose: () => {disposed++;}});
  assert.equal(await result, false);
  assert.equal(await cancelled, true);
  assert.equal(disposed, 1);
});

test('cancel keeps the outgoing screen blocked until asynchronous resume finishes', async () => {
  const { coordinator: c } = fixture();
  const pending = deferred(), started = deferred(), resumeStarted = deferred(), resumeDone = deferred();
  const outgoing = c.run('screen', () => { started.resolve(); return pending.promise; }, () => assert.fail('abandoned navigation'));
  await started.promise;
  c.onCancel(async ticket => {
    assert.equal(ticket.isCurrent(), true);
    resumeStarted.resolve();
    await resumeDone.promise;
    return true;
  });
  const cancelled = c.cancel();
  await resumeStarted.promise;
  assert.equal(c.snapshot().pending, true, 'lifting inert before durable resume permits interactions');
  assert.equal(c.snapshot().error, null);
  resumeDone.resolve();
  assert.equal(await cancelled, true);
  assert.equal(c.snapshot().pending, false);
  pending.resolve();
  assert.equal(await outgoing, false);
});

test('new intent before a write drains skips obsolete cancellation resume and cannot be unblocked by it', async () => {
  const { coordinator: c } = fixture();
  const writeStarted = deferred(), writeDone = deferred(), latestReady = deferred(), latestStarted = deferred();
  const events = [], visibleStates = [];
  const outgoing = c.run('question', ticket => ticket.persist(async () => {
    writeStarted.resolve();
    await writeDone.promise;
  }), () => assert.fail('abandoned question commit'));
  await writeStarted.promise;
  c.onCancel(() => { events.push('obsolete-resume'); });
  c.onCancelComplete(() => events.push('obsolete-focus'));
  const cancelled = c.cancel();
  const cancellationTicket = c.snapshot().ticket;
  const latest = c.run('screen', () => { latestStarted.resolve(); return latestReady.promise; }, () => events.push('latest-commit'));
  const latestTicket = c.snapshot().ticket;
  c.subscribe(() => visibleStates.push({pending: c.snapshot().pending, id: c.snapshot().ticket?.id}));
  writeDone.resolve();
  await latestStarted.promise;
  assert.equal(await cancelled, false);
  assert.equal(cancellationTicket.isCurrent(), false);
  assert.equal(c.snapshot().pending, true);
  assert.equal(c.snapshot().ticket.id, latestTicket.id);
  assert.deepEqual(events, []);
  assert.equal(visibleStates.some(state => !state.pending), false, 'stale cancellation lifted inert during latest preparation');
  latestReady.resolve();
  assert.equal(await latest, true);
  assert.equal(await outgoing, false);
  assert.deepEqual(events, ['latest-commit']);
});

test('new intent during asynchronous resume waits for its drain and discards stale publication', async () => {
  const { coordinator: c } = fixture();
  const pending = deferred(), started = deferred(), resumeStarted = deferred(), resumeDone = deferred();
  const events = [];
  const outgoing = c.run('screen', () => { started.resolve(); return pending.promise; }, () => assert.fail('abandoned navigation'));
  await started.promise;
  c.onCancel(async ticket => {
    resumeStarted.resolve();
    await resumeDone.promise;
    if (ticket.isCurrent()) events.push('old-resume-publish');
    return true;
  });
  c.onCancelComplete(() => events.push('obsolete-focus'));
  const cancelled = c.cancel();
  await resumeStarted.promise;
  const latest = c.run('screen', async () => { events.push('new-prepare'); }, () => events.push('new-commit'));
  await tick();
  assert.deepEqual(events, [], 'destination preparation raced an unfinished resume operation');
  assert.equal(c.snapshot().pending, true);
  resumeDone.resolve();
  assert.equal(await cancelled, false);
  assert.equal(await latest, true);
  assert.deepEqual(events, ['new-prepare', 'new-commit']);
  pending.resolve();
  assert.equal(await outgoing, false);
});

test('failed resume stays blocked with a retryable error and retry resumes without navigating', async () => {
  const { coordinator: c } = fixture();
  const pending = deferred(), started = deferred();
  let fail = true, resumes = 0;
  const outgoing = c.run('screen', () => { started.resolve(); return pending.promise; }, () => assert.fail('retry reopened abandoned navigation'));
  await started.promise;
  c.onCancel(async () => { resumes++; await Promise.resolve(); return !fail; });
  assert.equal(await c.cancel(), false);
  assert.equal(c.snapshot().pending, false);
  assert(c.snapshot().error instanceof Error, 'a false resume result must become a visible error');
  assert.equal(c.snapshot().visible, false);
  fail = false;
  assert.equal(await c.retry(), true);
  assert.equal(resumes, 2);
  assert.equal(c.snapshot().error, null);
  pending.resolve();
  assert.equal(await outgoing, false);
});

test('synchronous freeze failures are contained as blocked retryable loading errors', async () => {
  const { coordinator: c } = fixture();
  let fail = true, prepares = 0, commits = 0;
  c.onFreeze(() => { if (fail) throw new Error('outgoing checkpoint failed'); });
  const result = await c.run('screen', async () => { prepares++; }, () => { commits++; });
  assert.equal(result, false);
  assert.equal(prepares, 0);
  assert.equal(commits, 0);
  assert.equal(c.snapshot().pending, false);
  assert.match(c.snapshot().error.message, /outgoing checkpoint failed/);
  fail = false;
  assert.equal(await c.retry(), true);
  assert.equal(commits, 1);
});

test('an asynchronous resume exception is visible and retryable without unhandled rejection', async () => {
  const { coordinator: c } = fixture();
  const pending = deferred(), started = deferred();
  let fail = true, completed = 0;
  const outgoing = c.run('screen', () => { started.resolve(); return pending.promise; }, () => assert.fail('abandoned navigation'));
  await started.promise;
  c.onCancel(async () => {
    await Promise.resolve();
    if (fail) throw new Error('resume storage denied');
  });
  c.onCancelComplete(() => { completed++; });
  assert.equal(await c.cancel(), false);
  assert.match(c.snapshot().error.message, /resume storage denied/);
  assert.equal(completed, 0, 'focus cannot restore after a failed resume');
  fail = false;
  assert.equal(await c.retry(), true);
  assert.equal(completed, 1);
  pending.resolve();
  assert.equal(await outgoing, false);
});

test('a started cancellation resume write drains before a newer destination prepares', async () => {
  const { coordinator: c } = fixture();
  const pending = deferred(), started = deferred(), resumeWriteStarted = deferred(), resumeWriteDone = deferred();
  const events = [];
  const outgoing = c.run('screen', () => { started.resolve(); return pending.promise; }, () => assert.fail('abandoned navigation'));
  await started.promise;
  c.onCancel(async ticket => {
    await ticket.persist(async () => {
      events.push('resume-write-start');
      resumeWriteStarted.resolve();
      await resumeWriteDone.promise;
      events.push('resume-write-end');
    });
    if (ticket.isCurrent()) events.push('resume-publish');
  });
  c.onCancelComplete(() => events.push('resume-focus'));
  const cancelled = c.cancel();
  await resumeWriteStarted.promise;
  const latest = c.run('screen', async () => { events.push('new-prepare'); }, () => events.push('new-commit'));
  await tick();
  assert.deepEqual(events, ['resume-write-start']);
  resumeWriteDone.resolve();
  assert.equal(await cancelled, false);
  assert.equal(await latest, true);
  assert.deepEqual(events, ['resume-write-start','resume-write-end','new-prepare','new-commit']);
  pending.resolve();
  assert.equal(await outgoing, false);
});

test('a newer destination cannot read before an already-started ticket write drains', async () => {
  const { coordinator: c } = fixture();
  const writeStarted = deferred(), writeDone = deferred(), events = [];
  const old = c.run('question', ticket => ticket.persist(async () => {
    events.push('old-write-start');
    writeStarted.resolve();
    await writeDone.promise;
    events.push('old-write-end');
  }), () => assert.fail('obsolete destination committed'));
  await writeStarted.promise;
  const latest = c.run('screen', async () => { events.push('destination-read'); }, () => events.push('destination-commit'));
  await tick();
  assert.deepEqual(events, ['old-write-start'], 'fresh destination reads raced an unfinished previous transaction');
  assert.equal(c.snapshot().pending, true);
  writeDone.resolve();
  assert.equal(await old, false);
  assert.equal(await latest, true);
  assert.deepEqual(events, ['old-write-start','old-write-end','destination-read','destination-commit']);
});

test('freeze observes pending state before subscriber emission can apply inert and lose focus', async () => {
  const { coordinator: c } = fixture();
  const prepared = deferred(), events = [];
  c.subscribe(() => events.push('notify'));
  c.onFreeze(() => {
    assert.equal(c.snapshot().pending, true);
    events.push('capture-focus-and-freeze');
  });
  const result = c.run('screen', () => prepared.promise, () => {});
  assert.deepEqual(events.slice(0,2), ['capture-focus-and-freeze','notify']);
  prepared.resolve();
  assert.equal(await result, true);
});

test('Reload waits for started writes and awaited durable resume while keeping controls and focus blocked', async () => {
  const writeStarted = deferred(), writeDone = deferred(), resumeStarted = deferred(), resumeDone = deferred();
  const events = [];
  const { coordinator: c } = fixture({ reload: ticket => {
    assert.equal(ticket.operation, 'reload');
    assert.equal(ticket.isCurrent(), true);
    assert.equal(c.snapshot().pending, true);
    assert.equal(c.snapshot().error, null);
    events.push('reload');
  } });
  c.onCancel(async ticket => {
    assert.equal(ticket.operation, 'reload');
    events.push('resume-start'); resumeStarted.resolve();
    await resumeDone.promise;
    await ticket.persist(async () => events.push('resume-write'));
    events.push('resume-end');
    return true;
  });
  c.onCancelComplete(() => events.push('restored-focus'));
  const outgoing = c.run('question', ticket => ticket.persist(async () => {
    events.push('outgoing-write-start'); writeStarted.resolve();
    await writeDone.promise; events.push('outgoing-write-end');
  }), () => assert.fail('abandoned destination committed'));
  await writeStarted.promise;
  const reloaded = c.reload();
  await tick();
  assert.deepEqual(events, ['outgoing-write-start']);
  assert.equal(c.snapshot().pending, true);
  writeDone.resolve(); await resumeStarted.promise;
  assert.deepEqual(events, ['outgoing-write-start','outgoing-write-end','resume-start']);
  assert.equal(c.snapshot().pending, true);
  resumeDone.resolve();
  assert.equal(await reloaded, true); assert.equal(await outgoing, false);
  assert.deepEqual(events, ['outgoing-write-start','outgoing-write-end','resume-start','resume-write','resume-end','reload']);
  assert.equal(c.snapshot().pending, true, 'Reload must not reopen outgoing interactions before document navigation');
});

test('a failed Reload resume cannot reload or unblock and retries the same guarded recovery', async () => {
  for (const failure of ['false-result','exception']) {
    let fail = true, reloads = 0, restored = 0;
    const { coordinator: c } = fixture({ reload: () => { reloads++; } });
    c.onCancel(async () => {
      await Promise.resolve();
      if (fail && failure === 'exception') throw new Error('resume write rejected');
      return !fail;
    });
    c.onCancelComplete(() => { restored++; });
    assert.equal(await c.run('screen', async () => { throw new Error('module fetch rejected'); },
      () => assert.fail('failed destination committed')), false);
    assert.equal(await c.reload(), false);
    assert.equal(reloads, 0); assert.equal(restored, 0);
    assert(c.snapshot().error instanceof Error, 'Resume failure must retain an error that keeps the surface blocked');
    assert.equal(c.snapshot().ticket.operation, 'reload');
    assert.equal(c.snapshot().visible, false);
    fail = false;
    assert.equal(await c.retry(), true);
    assert.equal(reloads, 1); assert.equal(restored, 0);
    assert.equal(c.snapshot().pending, true);
  }
});

test('a newer intent supersedes asynchronous Reload recovery without stale reload, thaw or focus', async () => {
  const resumeStarted = deferred(), resumeDone = deferred(), latestStarted = deferred(), latestDone = deferred();
  const events = [];
  const { coordinator: c } = fixture({ reload: () => events.push('obsolete-reload') });
  c.onCancel(async ticket => {
    resumeStarted.resolve(); await resumeDone.promise;
    if (ticket.isCurrent()) events.push('obsolete-resume-publish');
    return true;
  });
  c.onCancelComplete(() => events.push('obsolete-focus'));
  await c.run('screen', async () => { throw new Error('failed destination'); }, () => assert.fail('failed commit'));
  const reloaded = c.reload(); await resumeStarted.promise;
  const reloadTicket = c.snapshot().ticket;
  const latest = c.run('screen', async () => {
    events.push('latest-prepare'); latestStarted.resolve(); await latestDone.promise;
  }, () => events.push('latest-commit'));
  const latestTicket = c.snapshot().ticket;
  await tick();
  assert.deepEqual(events, [], 'A newer preparation raced a started recovery');
  assert.equal(reloadTicket.isCurrent(), false);
  resumeDone.resolve(); await latestStarted.promise;
  assert.equal(await reloaded, false);
  assert.equal(c.snapshot().pending, true); assert.equal(c.snapshot().ticket, latestTicket);
  assert.deepEqual(events, ['latest-prepare']);
  latestDone.resolve(); assert.equal(await latest, true);
  assert.deepEqual(events, ['latest-prepare','latest-commit']);
});

test('focus capture runs before earlier-registered host blur and before inert publication', async () => {
  const { coordinator: c } = fixture(), prepared = deferred(), events = [];
  let activeControl = 'original-response-control', capturedControl;
  c.onFreeze(() => { events.push('host-blur-and-draft-flush'); activeControl = 'body'; });
  c.subscribe(() => { if (c.snapshot().pending) events.push('publish-inert'); });
  c.onFreezeStart(() => {
    assert.equal(c.snapshot().pending,true);
    capturedControl = activeControl; events.push('capture-original-focus');
  });
  const result = c.run('screen', () => prepared.promise, () => {});
  assert.equal(capturedControl,'original-response-control',
    'Earlier host registration must not erase the focus target before provider capture');
  assert.deepEqual(events,['capture-original-focus','host-blur-and-draft-flush','publish-inert']);
  prepared.resolve(); assert.equal(await result,true);
});
