import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const project = path.resolve(import.meta.dirname, '../../..');
const priorFiles = ['install-current.log', 'install-current.json'];
const stamp = new Date().toISOString().replaceAll(':', '-');
for (const file of priorFiles) {
  const previous = path.join(import.meta.dirname, file);
  if (fs.existsSync(previous)) fs.copyFileSync(previous, path.join(import.meta.dirname, `${stamp}-${file}`));
}
const temporary = path.join(import.meta.dirname, '.install-temp');
fs.mkdirSync(temporary, { recursive: true });
const start = Date.now();
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--cache', '.npm-cache'], { cwd: project, shell: process.platform === 'win32', encoding: 'utf8', env: { ...process.env, TEMP: temporary, TMP: temporary } });
fs.writeFileSync(path.join(import.meta.dirname, 'install-current.log'), (result.stdout || '') + '\n' + (result.stderr || ''));
const report = { status: result.status === 0 ? 'PASS' : 'FAIL', command: 'npm.cmd ci --cache .npm-cache', elapsedMs: Date.now() - start, exitCode: result.status, error: result.error?.message ?? null, cache: '.npm-cache', temporary: 'validation/s5/integration/.install-temp' };
fs.writeFileSync(path.join(import.meta.dirname, 'install-current.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.status !== 'PASS') process.exitCode = 1;
