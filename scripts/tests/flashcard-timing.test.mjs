import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlashcardTiming } from '../../src/recall/flashcard-timing.ts';
async function fixture(records = [], start = +new Date(2026, 9, 13, 12)) {
  let time = { monotonicMs: 0, wallMs: start }, reject = false;
  const stored = new Map(records.map(r => [r.id, r]));
  const timer = createFlashcardTiming({ namespace: { course: 'alevel', profileId: 'local' }, scopeKey: 'scope',
    now: () => time, load: async () => ({ ok: true, value: [...stored.values()] }),
    save: async r => {
      if (reject) return { ok: false, error: { code: 'quota', retryable: true, message: 'Full' } };
      stored.set(r.id, r); return { ok: true, value: 'saved' };
    },
  });
  await timer.ready(); timer.setCard('run', 'a'); timer.setEligible(true);
  return { timer, stored, advance(ms) { time = { monotonicMs: time.monotonicMs + ms, wallMs: time.wallMs + ms }; },
    reject(value) { reject = value; }, total() { return timer.records().reduce((sum, r) => sum + r.activeMs, 0); } };
}
test('actual elapsed time on both sides shares one 15 second cap', async () => {
  const f = await fixture(); f.advance(4000); f.timer.setCard('run', 'a');
  f.advance(20000); await f.timer.flush(); assert.equal(f.total(), 15000);
});
test('each card has its own cap; undo/revisit cannot reset it', async () => {
  const f = await fixture(); f.advance(6000); f.timer.setCard('run', 'b');
  f.advance(3000); f.timer.setCard('run', 'a'); f.advance(20000); await f.timer.flush();
  assert.equal(f.total(), 18000);
});
test('reload restores the remaining allowance and does not add away time', async () => {
  const first = await fixture(); first.advance(12000); await first.timer.flush();
  const second = await fixture([...first.stored.values()]); second.advance(8000); await second.timer.flush();
  assert.equal(second.total(), 15000);
});
test('restart starts a new allowance; pause and frozen navigation add no time', async () => {
  const f = await fixture(); f.advance(2000); f.timer.freeze(); f.advance(30000); f.timer.setEligible(true);
  f.advance(30000); f.timer.sample(); assert.equal(f.total(), 2000);
  f.timer.resume(); f.timer.setCard('restart', 'a'); f.timer.setEligible(true); f.advance(5000);
  await f.timer.flush(); assert.equal(f.total(), 7000);
});
test('midnight splits the same 15 second allowance across dates', async () => {
  const f = await fixture([], +new Date(2026, 9, 13, 23, 59, 55));
  f.advance(30000); await f.timer.flush();
  assert.deepEqual(f.timer.records().map(r => r.activeMs), [5000, 10000]);
});
test('failed saves remain retryable and repeated writes cannot duplicate time', async () => {
  const f = await fixture(); f.advance(4000); f.reject(true);
  assert.equal(await f.timer.flush(), false); assert.equal(f.stored.size, 0);
  f.reject(false); assert.equal(await f.timer.persist(), true); await f.timer.persist();
  assert.equal([...f.stored.values()].reduce((sum,r) => sum + r.activeMs, 0), 4000);
});
