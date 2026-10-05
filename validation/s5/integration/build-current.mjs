import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const project = path.resolve(import.meta.dirname, '../../..');
function sourceHashes(root = path.join(project, 'src')) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(root, entry.name);
    return entry.isDirectory() ? sourceHashes(file) : [{ path: path.relative(project, file).replaceAll('\\', '/'), sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }];
  }).sort((a, b) => a.path.localeCompare(b.path));
}
const before = sourceHashes();
const checks = [];
for (const [id, args] of [
  ['build', ['scripts/build.mjs']],
  ['alevel-release', ['scripts/release-s4.mjs', 'alevel']],
  ['igcse-release', ['scripts/release-s4.mjs', 'igcse']],
  ['release-check', ['scripts/check-release.mjs']],
]) {
  const start = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: project, encoding: 'utf8' });
  fs.writeFileSync(path.join(import.meta.dirname, `${id}.log`), (result.stdout || '') + '\n' + (result.stderr || ''));
  checks.push({ id, command: ['node', ...args], status: result.status === 0 ? 'PASS' : 'FAIL', elapsedMs: Date.now() - start });
  assert.equal(result.status, 0, `${id} failed; retained log`);
}
assert.deepEqual(sourceHashes(), before, 'Runtime source changed during final build');
const report = { status: 'PASS', checkedAt: new Date().toISOString(), sourceUnchangedDuringBuild: true, sourceHashes: before, checks };
fs.writeFileSync(path.join(import.meta.dirname, 'build-current.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, checkedAt: report.checkedAt, sourceFiles: before.length, checks }));
