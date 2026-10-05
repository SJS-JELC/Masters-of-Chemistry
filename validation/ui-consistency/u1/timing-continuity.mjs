import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const app = path.resolve(import.meta.dirname, '../../..');
const read = file => fs.readFileSync(path.join(app, file), 'utf8').replace(/^\uFEFF/, '');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const prior = JSON.parse(read('validation/s5/behaviour/timing-continuity.json'));
assert.equal(prior.status, 'PASS');
const clocks = prior.matches.filter(row => row.path.startsWith('src/domain/timing/'));
for (const row of clocks) { assert(row.semanticEqual); assert.equal(hash(read(row.path)), row.currentSha256, row.path); }
for (const row of prior.evidence) assert.equal(hash(read(row.path)), row.sha256, row.path);
assert.deepEqual(prior.realIdle.map(row => row.limitMs).sort((a, b) => a-b), [60000,180000,300000,600000]);
assert(prior.realIdle.every(row => row.native));
const report = { status: 'PASS', checkedAt: new Date().toISOString(), clocks, retainedNativeEvidence: prior.evidence, idleAllowances: prior.realIdle, limits: prior.preservedLimits, scope: 'Exact unchanged timing algorithm/browser binding and retained native evidence; current UI attempts checked separately. No new native OS suspension proof claimed. Attempt action reducer changed only UI markers/Clear; immutable evidence invariants explicitly tested.' };
fs.writeFileSync(path.join(import.meta.dirname, 'timing-continuity.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({status:report.status,clockPaths:clocks.length,retainedEvidence:prior.evidence.length}));
