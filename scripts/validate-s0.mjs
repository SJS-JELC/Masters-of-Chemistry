import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(project, '../..');
const read = relative => JSON.parse(fs.readFileSync(path.join(project, relative), 'utf8').replace(/^\uFEFF/, ''));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const contract = read('project-contract.json');
const control = read('validation/s0/control-start.json');
for (const [relative, expected] of Object.entries(control.files)) {
  assert.equal(digest(fs.readFileSync(path.join(project, relative))), expected, `Root-owned control changed: ${relative}`);
}
assert.equal(digest(fs.readFileSync(path.join(project, 'project-contract.json'))), read('validation/root-contract-lock.json').sha256);
const manifest = read('validation/s0/inventory/coverage-manifest.json');
assert.deepEqual(manifest.activities.map(a => a.id).sort(), contract.activities.map(a => a.id).sort());
assert.equal(new Set(manifest.sources.map(s => s.path)).size, manifest.sources.length);
for (const source of manifest.sources) {
  const bytes = fs.readFileSync(path.resolve(workspace, source.path));
  assert.equal(bytes.length, source.bytes, `Source bytes changed: ${source.path}`);
  assert.equal(digest(bytes), source.sha256, `Source changed: ${source.path}`);
}
const identityText = fs.readFileSync(path.join(project, 'src/contracts/identity.ts'), 'utf8');
const typedIds = [...new Set(identityText.match(/(?:alevel|igcse)\/[a-z0-9-]+/g))].sort();
assert.deepEqual(typedIds, contract.activities.map(a => a.id).sort());
const challenge = manifest.activities.find(a => a.strand === 'olympiad');
assert.equal(challenge.id, 'alevel/c3l6-organic-reactions');
assert.deepEqual(challenge.leafIds, []);
assert.deepEqual(challenge.supportedLevels, []);
assert.deepEqual(Object.keys(challenge.masteryRegistrations), []);
for (const activity of manifest.activities) {
  assert(activity.entrypoint.endsWith('/index.html'));
  assert(activity.sourceHashes.length > 0);
  assert(activity.sourceEvidence);
}
const result = spawnSync(process.execPath, [path.join(project, 'scripts/write-s0-scope.mjs'), '--check'], {cwd: project, encoding: 'utf8'});
assert.equal(result.status, 0, result.stderr);
for (const handoverPath of ['validation/s0/contracts/handover.json', 'validation/s0/contracts/handover-clarification.json', 'validation/s0/inventory/completion.json']) {
  const handover = read(handoverPath);
  assert.equal(handover.status, 'PASS');
  for (const output of handover.outputPaths) {
    const absolute = output.startsWith('apps/') ? path.resolve(workspace, output) : path.resolve(project, output);
    assert(absolute.startsWith(project + path.sep));
    assert(fs.existsSync(absolute), `Missing worker output: ${output}`);
  }
}
const report = {status:'PASS', checkedAt:new Date().toISOString(), activities:manifest.activities.length, sources:manifest.sources.length,
  checks:['root control and contract lock preserved', 'exact twelve typed and inventoried IDs', 'source byte/hash validity', 'Olympiad level/gem isolation', 'entrypoints/evidence retained', 'source-derived catalogue scope current', 'worker output paths exist'],
  limitations:['This deterministic S0 gate does not claim runtime, rendered or fresh chemical acceptance.']};
fs.writeFileSync(path.join(project, 'validation/s0/integration-check.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
