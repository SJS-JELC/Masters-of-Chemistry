import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { currentInputs } from './current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
const directory = path.join(project, 'validation/s5/integration');
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
  const evidence = `validation/s5/integration/foreman-${id}.txt`;
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
// Independent evidence is valid only for the exact current source/build/release inputs.
// This checks retained facts; it does not run or substitute for browser/chemistry review.
if (!process.argv.includes('--checks-only')) {
  const report = JSON.parse(fs.readFileSync(path.join(project, 'validation/s5/foreman-report.json'), 'utf8').replace(/^\uFEFF/, ''));
  assert.equal(report.status, 'PASS', 'Final independent review is not complete');
  assert.deepEqual(report.currentInputHashes, currentInputs(), 'Current source/config/build inventory differs from final independent acceptance');
  for (const input of report.currentInputHashes) {
    const file = path.resolve(project, input.path);
    assert(file.startsWith(project + path.sep), `Evidence input outside project: ${input.path}`);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), input.sha256, `Independent evidence stale: ${input.path}`);
  }
  for (const review of report.independentReviews) {
    assert.equal(review.status, 'PASS', `Review incomplete: ${review.id}`);
    assert(fs.existsSync(path.join(project, review.evidence)), `Review evidence missing: ${review.id}`);
  }
  results.push({ id: 'independent-current-evidence', status: 'PASS', inputs: report.currentInputHashes.length, reviews: report.independentReviews.length });
}
const report = { status: results.every(row => row.status === 'PASS') ? 'PASS' : 'FAIL', checkedAt: new Date().toISOString(), results };
fs.writeFileSync(path.join(directory, 'foreman-checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
