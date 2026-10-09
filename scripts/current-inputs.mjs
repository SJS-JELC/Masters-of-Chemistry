import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project = path.resolve(import.meta.dirname, '..');
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
/** Complete production source/config/build closure for retained final acceptance. */
export function currentInputs() {
  const roots = ['src', 'public', 'dist/app', 'release'];
  const files = roots.flatMap(root => walk(path.join(project, root)));
  for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'alevel.html', 'igcse.html', '.prettierrc.json']) files.push(path.join(project, file));
  for (const file of ['scripts/build.mjs', 'scripts/runtime-aliases.mjs', 'scripts/preview-server.mjs', 'scripts/release-s4.mjs', 'scripts/validate-s4-release.mjs', 'scripts/preview.mjs', 'scripts/verify-s5.mjs', 'scripts/current-inputs.mjs', 'scripts/check-release.mjs', 'scripts/test-s5.mjs']) files.push(path.join(project, file));
  return [...new Set(files)].sort().map(file => ({ path: path.relative(project, file).replaceAll('\\', '/'), bytes: fs.statSync(file).size, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }));
}
