import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { landingInputs } from './landing-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
const report = JSON.parse(fs.readFileSync(path.join(project, 'validation/landing-restoration/foreman-report.json'), 'utf8'));
assert.equal(report.status, 'PASS');
assert.deepEqual(landingInputs(), report.currentInputHashes, 'Landing source/build closure changed after retained acceptance');
for (const item of report.evidenceHashes) {
  const file = path.resolve(project, item.path);
  assert(file.startsWith(project + path.sep), 'Evidence path outside project');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), item.sha256, `Landing evidence changed: ${item.path}`);
}
console.log(JSON.stringify({ status: 'PASS', checkedAt: new Date().toISOString(),
  inputFiles: report.currentInputHashes.length, evidenceFiles: report.evidenceHashes.length,
  rootAcceptance: report.rootAcceptance }));
