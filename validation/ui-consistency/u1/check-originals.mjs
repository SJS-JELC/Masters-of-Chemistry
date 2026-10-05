import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const app = path.resolve(import.meta.dirname, '../../..'), workspace = path.resolve(app, '../..');
const baseline = JSON.parse(fs.readFileSync(path.join(app, 'validation/original-app-baseline.json'), 'utf8'));
const changed = [], observed = [], metadata = [];
function walk(directory) { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
  const file = path.join(directory, entry.name);
  if (entry.isDirectory()) walk(file); else observed.push(path.relative(workspace, file).replaceAll('\\', '/'));
} }
for (const root of baseline.roots) walk(path.resolve(workspace, root));
assert.deepEqual(observed.sort(), Object.keys(baseline.files).sort(), 'Original file inventory changed');
let readable = 0;
for (const [relative, prior] of Object.entries(baseline.files)) {
  const file = path.join(workspace, relative);
  if (prior.contentHashUnavailable) {
    // Do not open pre-existing offline placeholders or request hydration.
    const stat = fs.statSync(file); metadata.push(relative);
    if (stat.size !== prior.bytes || stat.mtimeMs !== prior.mtimeMs) changed.push(relative);
  } else if (prior.type === 'symlink') {
    if (fs.readlinkSync(file) !== prior.target) changed.push(relative);
  } else {
    const bytes = fs.readFileSync(file); readable++;
    if (bytes.length !== prior.bytes || crypto.createHash('sha256').update(bytes).digest('hex') !== prior.sha256) changed.push(relative);
  }
}
const report = { status: changed.length ? 'FAIL' : 'PASS', checkedAt: new Date().toISOString(), records: observed.length, readable, metadataOnly: metadata.length, changed, offlinePolicy: 'All523 baseline offline placeholders stat-only; never opened/hydrated. Historical original-app-check.json left untouched.' };
fs.writeFileSync(path.join(import.meta.dirname, 'original-preservation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report)); assert.equal(changed.length, 0);
