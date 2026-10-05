import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const project = path.resolve(import.meta.dirname, '..');
const directory = path.join(project, '.artifacts/checks/s5');
fs.mkdirSync(directory, { recursive: true });
const jobs = [
  ['typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']],
  ['unit', ['scripts/test-s5.mjs']],
  ['format', ['scripts/format-authored.mjs', '--check']],
  ['catalogue', ['scripts/write-catalogue-definitions.mjs', '--check']],
  ['source-and-controls', ['scripts/validate-s0.mjs']],
  ['protected-originals', ['scripts/protect-originals.mjs', 'check']],
  ['release', ['scripts/check-release.mjs']],
];
const results = [];
for (const [id, args] of jobs) {
  const start = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: project, encoding: 'utf8' });
  const evidence = `.artifacts/checks/s5/foreman-${id}.txt`;
  fs.writeFileSync(path.join(project, evidence), (result.stdout || '') + '\n' + (result.stderr || ''));
  results.push({ id, command: ['node', ...args], status: result.status === 0 ? 'PASS' : 'FAIL', exitCode: result.status, elapsedMs: Date.now() - start, evidence });
}
function files(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(root, entry.name)) : [path.join(root, entry.name)]);
}
const source = files(path.join(project, 'src')).filter(file => /\.(?:ts|tsx|js)$/.test(file));
for (const file of source) {
  const text = fs.readFileSync(file, 'utf8');
  assert(!/localStorage\.(?:setItem|removeItem|clear)\s*\(/.test(text), `Original store mutation: ${file}`);
  assert(!/\b(?:from|import)\s*(?:\(\s*)?['"][^'"]*Masters-of-(?:A-Level|IGCSE)-Chemistry/.test(text), `Original runtime import: ${file}`);
  const permitted = path.relative(project, file).replaceAll('\\', '/') === 'src/compatibility/links.ts';
  const guarded = permitted ? text.replace(/if\s*\(\s*activity\s*===\s*'rocket-recall'\s*\)\s*return\s+unrecognized\s*\(\s*raw\s*,\s*'Rocket Recall is excluded from this application\.'\s*\)\s*;/g, '') : text;
  assert(!/<iframe\b|rocket-recall/i.test(guarded), `Excluded runtime: ${file}`);
}
results.push({ id: 'runtime-ownership', status: 'PASS', sourceFiles: source.length });
// Historical final-review evidence was deliberately deleted by the user.
// This command reports current deterministic checks only; it does not establish
// independent chemistry/browser acceptance or recreate the retired frozen audit.
const report = { status: results.every(row => row.status === 'PASS') ? 'PASS' : 'FAIL', checkedAt: new Date().toISOString(), results, scope: 'current deterministic checks; historical acceptance evidence retired' };
fs.writeFileSync(path.join(directory, 'foreman-checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
