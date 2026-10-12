import { spawnSync } from 'node:child_process';
import path from 'node:path';
const project = path.resolve(import.meta.dirname, '..');
const result = spawnSync(
  process.execPath,
  [
    '--experimental-strip-types',
    '--test',
    path.join(project, 'scripts/tests/recall-formulae-recall.test.mjs'),
  ],
  { cwd: project, stdio: 'inherit', windowsHide: true },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
