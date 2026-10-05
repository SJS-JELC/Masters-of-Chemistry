import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { currentInputs } from '../../../scripts/current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '../../..');
const read = file => JSON.parse(fs.readFileSync(path.join(project, file), 'utf8').replace(/^\uFEFF/, ''));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(project, file))).digest('hex');
const freeze = read('validation/s5/integration/freeze-current.json');
assert.deepEqual(currentInputs(), freeze.currentInputHashes);
const files = [
  'validation/s5/behaviour/session-only-save-fix/latest/completion.json',
  'validation/s5/chemistry/session-only-save-fix/final/completion.json',
  'validation/s5/render-release/session-only-save-fix/completion.json',
  'validation/s5/review-render-harness/energy-next-fix/completion.json',
];
const reports = files.map((file, index) => { const report = read(file); assert.equal(report.status, 'PASS', file); if(index < 3) assert(JSON.stringify(report).includes(freeze.treeSha256), `Latest freeze missing: ${file}`); return { file, sha256: hash(file) }; });
const behaviour = read('validation/s5/behaviour/session-only-save-fix/latest/verification.json');
assert.equal(behaviour.status, 'PASS');
assert.equal(behaviour.actualBrowserCases, 36);
assert.equal(behaviour.currentFreeze.tree, freeze.treeSha256);
let browserCases = 0;
for (const evidence of behaviour.browserEvidence) {
  assert.equal(hash(evidence.path), evidence.sha256);
  const result = read(evidence.path);
  assert.equal(result.status, 'PASS', evidence.path);
  assert.equal(result.checks.length, evidence.checks);
  assert(result.checks.every(check => check.status === 'PASS'));
  assert.equal(result.failures?.length ?? 0, 0);
  assert.equal(result.pageErrors?.length ?? 0, 0);
  browserCases += result.checks.length;
  reports.push({ file: evidence.path, sha256: evidence.sha256, checks: evidence.checks });
}
assert.equal(browserCases, 36);
for (const evidence of behaviour.retainedRawCaptures) assert.equal(hash(evidence.path), evidence.sha256, `Raw capture changed: ${evidence.path}`);
for (const evidence of [behaviour.timingSupplement, behaviour.approvedLauncher, behaviour.independentQuotaMessageReview]) assert.equal(hash(evidence.path), evidence.sha256);
const codeReview = read('validation/s5/review-session-only-save/fix-review/verification.json');
assert.equal(codeReview.status, 'PASS');
assert.equal(hash(codeReview.approvedHost.path), codeReview.approvedHost.sha256);
reports.push({ file: 'validation/s5/review-session-only-save/fix-review/verification.json', sha256: hash('validation/s5/review-session-only-save/fix-review/verification.json'), approvedHost: codeReview.approvedHost });
const mobile = read('validation/s5/render-release/session-only-save-fix/mobile-results.json');
assert.equal(mobile.status, 'PASS');
assert.equal(mobile.checks.length, 6);
assert.equal(mobile.failures.length, 0);
assert.equal(mobile.pageErrors.length, 0);
const currentProfile = read('validation/s5/render-release/session-only-save-fix/performance.json');
assert.equal(currentProfile.status, 'PASS');
assert.equal(currentProfile.freeze, freeze.treeSha256);
assert.equal(currentProfile.shell.length, 2);
assert.equal(currentProfile.editors.length, 2);
assert.equal(currentProfile.errors.length, 0);
for (const editor of currentProfile.editors) {
  assert.equal(editor.checkpointMatchesDurable, true);
  assert.equal(editor.duringAttemptPutCount, editor.beforeAttemptPutCount);
  assert.equal(editor.writes.length, 1);
}
for (const file of ['mobile-results.json', 'performance.json']) reports.push({ file: `validation/s5/render-release/session-only-save-fix/${file}`, sha256: hash(`validation/s5/render-release/session-only-save-fix/${file}`) });
const render = 'validation/s5/render-release/';
for (const [file, count] of [['render-browser.json', 29], ['a11y-detail.json', 4], ['release-browser.json', 23], ['final-energy-tail.json', 4], ['final-titration-next.json', 1]]) {
  const report = read(render + file);
  assert.equal(report.status, 'PASS', file);
  assert.equal(report.checks.length, count, file);
  assert.equal(report.errors?.length ?? 0, 0, file);
  assert.equal(report.failedResponses?.length ?? 0, 0, file);
  reports.push({ file: render + file, checks: count, sha256: hash(render + file) });
}
const fingerprint = read(render + 'final-input-fingerprints.json');
const prior = read('validation/s5/integration/pre-session-only-save-freeze/freeze-current.json');
assert.equal(fingerprint.freezeEvidence.treeSha256, prior.treeSha256);
assert.equal(fingerprint.freezeEvidence.inputCount, 517);
assert.equal(fingerprint.generatedIntegrity, 'PASS');
for (const release of fingerprint.releases) {
  const expected = prior.releases.find(value => value.course === release.validation.course);
  assert.equal(release.validation.manifestSha256, expected.manifestSha256);
  assert.equal(release.validation.initialJavascriptGzipBytes, expected.initialJavascriptGzipBytes);
  assert.equal(release.validation.status, 'PASS');
}
assert.equal(read(render + 'performance.json').errors.length, 0);
assert.equal(read(render + 'cleanup.json').listeners.length, 0);
const report = { status: 'PASS', checkedAt: new Date().toISOString(), scope: 'Foreman deterministic acceptance of latest independent manifests and exact fresh freeze; prior complete diagram/render/profile evidence is retained at its original freeze, with unchanged source proved by current followups and fresh applicable session/error/mobile evidence. Substantive review remains with independent workers.', currentTreeSha256: freeze.treeSha256, priorFullRenderTreeSha256: prior.treeSha256, inputs: freeze.currentInputHashes.length, reports };
fs.writeFileSync(path.join(import.meta.dirname, 'independent-validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, inputs: report.inputs, reports: reports.length }));
