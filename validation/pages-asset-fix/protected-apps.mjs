import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const app = path.resolve(import.meta.dirname, '../..');
const workspace = path.resolve(app, '../..');
const roots = JSON.parse(fs.readFileSync(path.join(app, 'project-contract.json'), 'utf8')).protectedRoots;
const baselinePath = path.join(import.meta.dirname, 'protected-apps-before.json');
const files = {};
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    const relative = path.relative(workspace, file).replaceAll('\\', '/');
    if (entry.isSymbolicLink()) files[relative] = { type: 'symlink', target: fs.readlinkSync(file) };
    else if (entry.isDirectory()) walk(file);
    else {
      const bytes = fs.readFileSync(file);
      files[relative] = { bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
    }
  }
}
for (const root of roots) walk(path.join(workspace, root));
if (process.argv[2] === 'capture') {
  assert(!fs.existsSync(baselinePath), 'Refuse to overwrite this repair baseline');
  fs.writeFileSync(baselinePath, JSON.stringify({ capturedAt: new Date().toISOString(), roots, files }, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'CAPTURED', fileCount: Object.keys(files).length }));
} else {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const changed = [...new Set([...Object.keys(files), ...Object.keys(baseline.files)])].filter(key => JSON.stringify(files[key]) !== JSON.stringify(baseline.files[key]));
  const result = { status: changed.length ? 'FAIL' : 'PASS', checkedAt: new Date().toISOString(), fileCount: Object.keys(files).length, changed };
  fs.writeFileSync(path.join(import.meta.dirname, 'protected-apps-after.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  assert.equal(changed.length, 0, 'Sibling apps changed during repair');
}
