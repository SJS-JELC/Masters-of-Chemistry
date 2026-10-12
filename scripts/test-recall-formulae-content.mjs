import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(
  process.execPath,
  [
    '--experimental-strip-types',
    '--test',
    path.join(project, 'scripts/tests/recall-formulae-content.test.mjs'),
  ],
  { cwd: project, stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
