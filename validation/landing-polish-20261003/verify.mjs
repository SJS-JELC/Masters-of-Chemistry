import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from '../../scripts/current-inputs.mjs';
import { validateRelease } from '../../scripts/validate-s4-release.mjs';
const here = import.meta.dirname, project = path.resolve(here, '../..'), workspace = path.resolve(project, '../..');
const json = relative => JSON.parse(fs.readFileSync(path.join(project, relative), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const prior = json('validation/question-chrome/implementation/integration/current-inputs.json').inputs;
const inputs = currentInputs();
const allowed = ['src/landing/OriginalLanding.tsx', 'src/landing/standardisation.css', 'src/shell/CourseShell.tsx'];
const changes = inputs.filter(x => x.path.startsWith('src/') && prior.find(p => p.path === x.path)?.sha256 !== x.sha256);
for (const item of changes) assert(allowed.includes(item.path), 'Unrelated source changed: ' + item.path);
for (const item of prior.filter(x => x.path.startsWith('src/'))) assert(inputs.some(x => x.path === item.path), 'Removed source: ' + item.path);
const baseline = json('validation/original-app-baseline.json');
let readable = 0, metadataOnly = 0;
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const originalFiles = baseline.roots.flatMap(root => walk(path.join(workspace, root))).map(f => path.relative(workspace, f).replaceAll('\\', '/')).sort();
assert.deepEqual(originalFiles, Object.keys(baseline.files).sort());
for (const [relative, old] of Object.entries(baseline.files)) {
  const full = path.join(workspace, relative);
  if (old.contentHashUnavailable) {
    metadataOnly++;
    const stat = fs.statSync(full);
    assert.equal(stat.size, old.bytes, relative); assert.equal(stat.mtimeMs, old.mtimeMs, relative);
  } else { readable++; assert.equal(hash(full), old.sha256, relative); }
}
const historical = json('validation/question-chrome/implementation/integration/evidence-freeze.json').files;
for (const item of historical) assert.equal(hash(path.join(project, item.path)), item.sha256, item.path);
const releases = ['alevel', 'igcse'].map(validateRelease);
const browser = json('validation/landing-polish-20261003/browser-results.json');
assert.equal(browser.status, 'PASS');
const result = { status: 'PASS', checkedAt: new Date().toISOString(), sourceChanges: changes, originals: { readable, metadataOnly }, priorEvidenceUnchanged: historical.length, browserCases: browser.checks.length, releases, currentInputHashes: inputs };
fs.writeFileSync(path.join(here, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, currentInputHashes: inputs.length }));
