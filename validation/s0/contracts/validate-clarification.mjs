import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, '../../../../..');
const paths = [
  'apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/core.js',
  'apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/app.js',
  'apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical/data.js',
  'apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/core.js',
  'apps/Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/app.js',
];
const sources = paths.map(path => ({ path, sha256: createHash('sha256').update(readFileSync(resolve(workspace, path))).digest('hex') }));
const evidencePath = resolve(here, 'clarification-source-evidence.json');
if (existsSync(evidencePath)) assert.deepEqual(JSON.parse(readFileSync(evidencePath, 'utf8')).sources, sources);
const practical = vm.createContext({});
for (const file of ['core.js', 'data.js']) vm.runInContext(readFileSync(resolve(workspace, 'apps/Masters-of-IGCSE-Chemistry/src/activities/energetics-practical', file), 'utf8'), practical);
const q = practical.PRACTICAL_BANK.questions.find(q => q.id === 'EP-BJLHC1');
assert.ok(q);
const response = { fields: Object.fromEntries(q.fields.map(f => [f.id, f.answers[0]])), overrides: [] };
response.fields.property = 'polystyrene impedes thermal energy conduction';
const first = practical.PracticalCore.gradeQuestion(q, response);
const firstPoint = first.points.find(p => p.id === 'property');
assert.equal(firstPoint.automaticCorrect, false);
assert.equal(firstPoint.overrideable, true);
assert.equal(firstPoint.correct, false);
const reviewed = practical.PracticalCore.gradeQuestion(q, { ...response, overrides: ['property'] });
const reviewedPoint = reviewed.points.find(p => p.id === 'property');
assert.equal(reviewedPoint.automaticCorrect, false);
assert.equal(reviewedPoint.correct, true);
assert.equal(firstPoint.correct, false);
const energy = vm.createContext({});
vm.runInContext(readFileSync(resolve(workspace, paths[3]), 'utf8'), energy);
const field = { accept: ['Energy'], options: ['Energy', 'Heat'] }, data = { questions: [{ fields: [field] }] };
assert.deepEqual(['Energy', 'Heat', '', 'unfamiliar wording'].map(v => energy.EnergyCore.markField(field, v, data)), ['correct', 'incorrect', 'empty', 'unknown']);
if (!existsSync(evidencePath)) writeFileSync(evidencePath, JSON.stringify({ jobId: 'S0-CONTRACTS-CLARIFICATION', sources }, null, 2) + '\n');
writeFileSync(resolve(here, 'clarification-checks.json'), JSON.stringify({ status: 'PASS', checkedAt: new Date().toISOString(),
  checks: ['Five read-only source hashes retained', 'Source EP-BJLHC1 valid-alternative review changes displayed correctness but not automaticCorrect or prior result',
    'Energy text source classifications distinguish correct/incorrect/empty/unknown'],
  limitations: ['No migrated runtime/chemistry/browser acceptance claimed', 'Immutable first score/timing and post-review evidence isolation require S1 runtime tests'],
}, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', sources: sources.length, questionId: q.id }));
