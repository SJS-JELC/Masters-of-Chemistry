import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const here = import.meta.dirname, workspace = path.resolve(here, '../../../../..');
const snapshot = {};
for (const root of ['apps/Masters-of-A-Level-Chemistry', 'apps/Masters-of-IGCSE-Chemistry']) {
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name), key = path.relative(workspace, full).replaceAll('\\', '/');
      if (entry.isSymbolicLink()) snapshot[key] = { symlink: fs.readlinkSync(full) };
      else if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        try { const bytes = fs.readFileSync(full); snapshot[key] = { bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }; }
        catch (error) { const stat = fs.statSync(full); snapshot[key] = { bytes: stat.size, mtimeMs: stat.mtimeMs, error: error.code }; }
      }
    }
  };
  walk(path.join(workspace, root));
}
for (const file of ['package.json', 'package-lock.json', 'node_modules/playwright/package.json', 'node_modules/playwright-core/package.json']) {
  const full = path.join(workspace, file);
  if (fs.existsSync(full)) { const bytes = fs.readFileSync(full); snapshot[file] = { bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }; }
}
const mode = process.argv[2];
if (mode === 'before') {
  assert(!fs.existsSync(path.join(here, 'repair-local-before.json')));
  fs.writeFileSync(path.join(here, 'repair-local-before.json'), JSON.stringify(snapshot, null, 2));
  console.log(JSON.stringify({ status: 'CAPTURED', count: Object.keys(snapshot).length }));
} else {
  const before = JSON.parse(fs.readFileSync(path.join(here, 'repair-local-before.json')));
  const changed = [...new Set([...Object.keys(before), ...Object.keys(snapshot)])].filter(key => JSON.stringify(before[key]) !== JSON.stringify(snapshot[key]));
  fs.writeFileSync(path.join(here, 'repair-local-after.json'), JSON.stringify({ status: changed.length ? 'FAIL' : 'PASS', checkedAt: new Date().toISOString(), count: Object.keys(snapshot).length, changed, snapshot }, null, 2));
  assert.equal(changed.length, 0); console.log(JSON.stringify({ status: 'PASS', count: Object.keys(snapshot).length }));
}
