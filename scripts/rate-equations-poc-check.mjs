import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { makeOrders } from '../src/development/rate-equations/orders.ts';
import { makeMechanisms } from '../src/development/rate-equations/mechanisms.ts';
import { makeGraphs, makeArrhenius } from '../src/development/rate-equations/graphs.ts';
import { rateMarking } from '../src/development/rate-equations/marking.ts';

const output = path.resolve(import.meta.dirname, '../.artifacts/rate-equations-poc/ui-refinement');
fs.mkdirSync(output, { recursive: true });
const starts = [], checks = [], ids = new Set();
for (const [gem, factory] of Object.entries({ orders: makeOrders, graphs: makeGraphs, mechanisms: makeMechanisms, arrhenius: makeArrhenius })) {
  for (const level of [1,2,3]) {
    for (const seed of [0,1,7,42,2026]) {
      const example = factory(level, seed), q = example.question;
      assert.deepEqual(factory(level, seed), example, 'Deterministic generation');
      assert.equal(example.gem, gem);
      assert.equal(q.ref.level, level);
      assert(q.parts.every(p => ['numeric','choice','text'].includes(p.kind)), 'Automatically marked response controls');
      assert.equal(new Set(q.parts.map(p => p.id)).size, q.parts.length);
      assert(q.parts.every(p => p.marks > 0 && p.required));
      assert(q.sources.length > 0 && q.sources.every(s => /^[a-f0-9]{64}$/.test(s.sha256)), 'Source hashes');
      const full = rateMarking.mark(q, example.correctResponses);
      assert(full.accepted && full.marks.earned === full.marks.available && full.marks.available > 0, `Model answers ${gem}/${level}/${seed}`);
      assert.equal(rateMarking.mark(q, {}).accepted, false, 'Incomplete responses blocked');
      if (seed === 0) { assert(!ids.has(q.ref.questionId)); ids.add(q.ref.questionId); starts.push(example); }
      checks.push({ gem, level, seed, marks: full.marks.available, status: 'PASS' });
    }
  }
}
assert.equal(starts.length, 12);
fs.writeFileSync(path.join(output, 'starting-examples.json'), JSON.stringify(starts, null, 2)+'\n');
const report = { status:'PASS', checkedAt:new Date().toISOString(), startingQuestions:12, seeds:[0,1,7,42,2026], cases:checks.length, checks };
fs.writeFileSync(path.join(output, 'content-validation.json'), JSON.stringify(report, null, 2)+'\n');
console.log(JSON.stringify({ status:report.status, startingQuestions:12, cases:checks.length }));
