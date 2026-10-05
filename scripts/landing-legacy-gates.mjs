/** Run unchanged historical guards with their report destinations redirected.
 * Only path/argv bindings change; retained historical evidence stays byte exact.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const project = path.resolve(import.meta.dirname, '..');
const directory = path.join(project, 'validation/landing-restoration/aggregate');
fs.mkdirSync(directory, { recursive: true });
const jobs = [
  ['originals', 'scripts/protect-originals.mjs', "path.join(project,'validation','original-app-check.json')", "path.join(project,'validation/landing-restoration/aggregate/original-app-check.json')"],
  ['source-controls', 'scripts/validate-s0.mjs', "path.join(project, 'validation/s0/integration-check.json')", "path.join(project,'validation/landing-restoration/aggregate/source-controls.json')"],
];
const results = [];
for (const [id, file, before, after] of jobs) {
  const source = fs.readFileSync(path.join(project, file), 'utf8');
  const binding = "const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');";
  if (!source.includes(binding) || !source.includes(before)) throw Error(`Unexpected historical guard ${file}`);
  const executable = source.replace(binding, `const project = ${JSON.stringify(project)};`).replace(before, after);
  const run = spawnSync(process.execPath, ['--input-type=module'], { cwd: project, input: executable, encoding: 'utf8' });
  fs.writeFileSync(path.join(directory, `${id}.log`), `${run.stdout || ''}\n${run.stderr || ''}`);
  results.push({ id, status: run.status === 0 ? 'PASS' : 'FAIL', source: file,
    sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
    substitutions: ['project path binding for stdin execution', 'report destination only'], exitCode: run.status,
    evidence: `validation/landing-restoration/aggregate/${id}.log` });
}
const report = { status: results.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL', checkedAt: new Date().toISOString(), results };
fs.writeFileSync(path.join(directory, 'legacy-gates.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
