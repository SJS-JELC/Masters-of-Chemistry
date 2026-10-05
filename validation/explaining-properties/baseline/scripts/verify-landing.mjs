import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { validateRelease } from './validate-s4-release.mjs';

const project = path.resolve(import.meta.dirname, '..');
const directory = path.join(project, 'validation/landing-restoration/aggregate');
fs.mkdirSync(directory, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const walk = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(root, entry.name)) : [path.join(root, entry.name)]);
const tests = walk(path.join(project, 'validation/landing-restoration')).filter(file => /\.test\.(?:mjs|js|ts)$/.test(file));
const priorChecksPath = path.join(directory, 'checks.json');
const retainedChecks = fs.existsSync(priorChecksPath) ? JSON.parse(fs.readFileSync(priorChecksPath, 'utf8')) : null;
const reuseHistorical = process.argv.includes('--reuse-historical');
const jobs = [
  ['typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']],
  ...(!reuseHistorical ? [['historical-regressions', ['scripts/test-s5.mjs']]] : []),
  ['landing-tests', ['--test', ...tests]],
  ['source-catalogue', ['scripts/write-catalogue-definitions.mjs', '--check']],
  ['historical-guards', ['scripts/landing-legacy-gates.mjs']],
];
const results = [];
if (reuseHistorical) {
  const retained = retainedChecks?.results.find(item => item.id === 'historical-regressions');
  assert.equal(retained?.status, 'PASS', 'No retained historical regression PASS');
  assert(fs.existsSync(path.join(project, retained.evidence)), 'Retained regression log missing');
  results.push({ ...retained, reused: true,
    reason: 'No shared chemistry, bank, marking, editor, mastery, timing or persistence change; source ownership gate below requires byte preservation.' });
}
for (const [id, args] of jobs) {
  assert(id !== 'landing-tests' || tests.length > 0, 'Missing landing-specific tests');
  const began = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: project, encoding: 'utf8' });
  fs.writeFileSync(path.join(directory, `${id}.log`), `${result.stdout || ''}\n${result.stderr || ''}`);
  results.push({ id, status: result.status === 0 ? 'PASS' : 'FAIL', exitCode: result.status,
    elapsedMs: Date.now() - began, command: ['node', ...args.map(value => path.isAbsolute(value) ? path.relative(project, value).replaceAll('\\', '/') : value)],
    evidence: `validation/landing-restoration/aggregate/${id}.log` });
}

const prior = JSON.parse(fs.readFileSync(path.join(project, 'validation/s5/foreman-report.json'), 'utf8').replace(/^\uFEFF/, ''));
const previous = prior.currentInputHashes.filter(item => item.path.startsWith('src/'));
const allowed = new Set([
  'src/foundation/ProductionFoundation.tsx', 'src/foundation/ActivityHost.tsx', 'src/foundation/OlympiadHost.tsx',
  'src/shell/CourseShell.tsx', 'src/shell/navigation-view.ts', 'src/contracts/integration.ts',
  'src/main-alevel.tsx', 'src/main-igcse.tsx', 'src/compatibility/routes.ts',
  'src/ui/TeacherPicker.tsx',
]);
const changed = previous.filter(item => hash(fs.readFileSync(path.join(project, item.path))) !== item.sha256);
for (const item of changed) assert(allowed.has(item.path), `Out-of-scope source change: ${item.path}`);
const source = walk(path.join(project, 'src'));
const added = source.map(file => path.relative(project, file).replaceAll('\\', '/')).filter(file => !previous.some(item => item.path === file));
for (const file of added) assert(file.startsWith('src/landing/') || file === 'src/contracts/landing.ts', `Unassigned new source: ${file}`);
for (const file of source.filter(file => /\.(?:js|ts|tsx)$/.test(file))) {
  const text = fs.readFileSync(file, 'utf8');
  assert(!/\b(?:from|import)\s*(?:\(\s*)?['"][^'"]*Masters-of-(?:A-Level|IGCSE)-Chemistry/.test(text), `Original runtime import: ${file}`);
  const guarded = path.relative(project, file).replaceAll('\\', '/') === 'src/compatibility/links.ts'
    ? text.replace(/if\s*\(\s*activity\s*===\s*'rocket-recall'\s*\)\s*return\s+unrecognized\s*\(\s*raw\s*,\s*'Rocket Recall is excluded from this application\.'\s*\)\s*;/g, '') : text;
  assert(!/<iframe\b|rocket-recall/i.test(guarded), `Excluded runtime: ${file}`);
}
const ownership = { status: 'PASS', priorEvidence: 'validation/s5/foreman-report.json',
  priorSourceFiles: previous.length, changed: changed.map(item => ({ path: item.path, beforeSha256: item.sha256,
    afterSha256: hash(fs.readFileSync(path.join(project, item.path))) })), added,
  checks: ['accepted chemistry, banks, marking, editors, timing, persistence and mastery source preserved',
    'changed sources limited to authorised landing integration', 'no old app runtime imports or iframe wrappers', 'Rocket excluded'] };
fs.writeFileSync(path.join(directory, 'source-ownership.json'), JSON.stringify(ownership, null, 2) + '\n');
results.push({ id: 'source-ownership', status: 'PASS', evidence: 'validation/landing-restoration/aggregate/source-ownership.json' });
if (!process.argv.includes('--no-release')) {
  const releases = ['alevel', 'igcse'].map(validateRelease);
  fs.writeFileSync(path.join(directory, 'release-checks.json'), JSON.stringify(releases, null, 2) + '\n');
  results.push({ id: 'releases', status: 'PASS', evidence: 'validation/landing-restoration/aggregate/release-checks.json' });
}
const report = { status: results.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', checkedAt: new Date().toISOString(), results,
  limits: ['Historical check:s5 final freeze remains intentionally historical; this current landing gate retains new evidence separately.',
    'Deterministic checks supplement required original/new rendered comparison and real browser state verification.'] };
fs.writeFileSync(path.join(directory, 'checks.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
