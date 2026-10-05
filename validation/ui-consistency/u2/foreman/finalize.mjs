import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {currentInputs} from '../../../../scripts/current-inputs.mjs';
const app = path.resolve(import.meta.dirname, '../../../..');
const here = import.meta.dirname, review = path.join(here, '../independent');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (name, value) => fs.writeFileSync(path.join(here, name), JSON.stringify(value, null, 2) + '\n');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const manifest = read(path.join(review, 'completion.json')), report = read(path.join(review, 'report.json'));
assert.equal(manifest.jobId, 'UI-INDEPENDENT-U2');
assert.equal(manifest.agentId, 'U05');
assert.equal(manifest.status, 'PASS');
assert.equal(report.status, 'PASS');
assert.equal(report.productFixes.length, 0);
assert.equal(report.gates.length, 17);
for (const gate of report.gates) {
  assert.equal(gate.status, 'PASS');
  const file = path.resolve(review, gate.path);
  assert.equal(path.dirname(file), review);
  assert.equal(hash(fs.readFileSync(file)), gate.sha256, gate.path);
  assert.equal(read(file).status, 'PASS', gate.path);
}
assert.equal(report.pureTests.passed, 29); assert.equal(report.pureTests.failed, 0);
assert.equal(report.typecheck.status, 'PASS'); assert.equal(report.typecheck.exitCode, 0);
assert.equal(report.geometry.desktopLargestButton < 160, true);
assert.equal(report.geometry.desktopLargestOccupied < 400, true);
assert.equal(report.geometry.desktopLargestFraction < 0.6, true);
const inputs = currentInputs(), treeSha256 = hash(JSON.stringify(inputs));
const accepted = read(path.join(app, 'validation/ui-consistency/u1-footer-fix/current-inputs.json'));
for (const closure of [accepted, read(path.join(review, 'current-inputs-start.json')), read(path.join(review, 'current-inputs-final.json'))]) {
  assert.deepEqual(inputs, closure.inputs); assert.equal(treeSha256, closure.treeSha256);
}
assert.equal(treeSha256, report.treeSha256); assert.equal(treeSha256, manifest.validation.treeSha256);
const build = read(path.join(app, 'validation/ui-consistency/u1-footer-fix/build-and-release.json'));
const source = inputs.filter(row => !row.path.startsWith('dist/') && !row.path.startsWith('release/'));
assert.deepEqual(source, build.sourceInputsBefore); assert.deepEqual(source, build.sourceInputsAfter);
assert.equal(source.length, 315); assert.equal(inputs.length, 645);
const frozen = read(path.join(here, 'preservation-baseline.json'));
for (const row of frozen.frozenArtifacts) assert.equal(hash(fs.readFileSync(path.join(app, row.path))), row.sha256, row.path);
const originals = read(path.join(review, 'original-preservation-final.json'));
assert.equal(originals.readable, 794); assert.equal(originals.metadataOnly, 523); assert.deepEqual(originals.changed, []);
const releases = read(path.join(review, 'release-validation.json'));
for (const release of releases.releases) assert.equal(hash(fs.readFileSync(path.join(app, 'release', `${release.course}.runtime.json`))), release.manifestSha256);
const renderRefs = read(path.join(review, 'representative-renders.json'));
for (const file of [...Object.values(renderRefs.sets).flat(), ...report.contactSheets]) assert.equal(fs.statSync(path.join(review, file)).size > 0, true);
const immediate = read(path.join(review, 'revision-and-prefix-immediate-reload-probe.json'));
assert.equal(immediate.status, 'FAIL'); // Preserve the failed uncommitted-write probe honestly.
const at = new Date().toISOString();
write('current-inputs.json', {at, count: inputs.length, sourcePublicConfigCount: source.length, treeSha256, inputs});
const final = {
  runId: 'UI-CONSISTENCY-20261003', jobId: 'UI-FOREMAN-U2', owner: 'U01', at,
  status: 'VALIDATED_AWAITING_ROOT_FINAL_ACCEPTANCE',
  delegation: {reviewer: 'U05', requestedModel: 'gpt-6.1-sol', requestedEffort: 'high', effectiveSettings: 'unknown', usage: 'not exposed', children: 0, additionalWorkers: 0},
  rootU1Gate: 'validation/ui-consistency/u1-footer-fix/root-gate.json',
  independentReview: {status: manifest.status, manifest: 'validation/ui-consistency/u2/independent/completion.json', report: 'validation/ui-consistency/u2/independent/report.json', gates: 17, pureCases: 29, responsiveScreens: 68, staticCompactFooterCases: 33, geometry: report.geometry},
  currentClosure: {count: inputs.length, sourcePublicConfigCount: source.length, treeSha256, file: 'current-inputs.json', unchangedSinceRootU1Gate: true, unchangedAcrossReview: true},
  builds: {status: build.status, existingExactSourceBeforeAfter: true, noU2Rebuild: true, freshIndependentTypecheck: report.typecheck, freshIndependentReleaseValidation: releases},
  preservation: {frozenU1AndRootContractArtifactsVerified: frozen.frozenArtifacts.length, originals, protectedSourceAudit: 'validation/ui-consistency/u2/independent/source-gate.json', approvedAssets: 'validation/ui-consistency/u2/independent/assets-config-preservation.json', exactCarriedTiming: 'validation/ui-consistency/u2/independent/timing-continuity.json', historicalU03ProcessException: 'validation/ui-consistency/u1/theme/legacy-original-check-incident.json'},
  renders: {reviewer: 'validation/ui-consistency/u2/independent/render-review.md', references: 'validation/ui-consistency/u2/independent/representative-renders.json', foremanInspected: ['desktop-contact-sheet.png', 'mobile-contact-sheet.png', 'completion-and-evidence-contact-sheet.png', 'igcse-calorimetry-1440.png', 'final-alevel-acid-base-calculations-350.png', 'ordinary-ec-current-correct-390.png']},
  fixesDuringU2: [],
  rootDispositionsRequired: [{id: 'UNCOMMITTED-CLEAR-RELOAD', evidence: 'validation/ui-consistency/u2/independent/revision-and-prefix-immediate-reload-probe.json', observed: 'Immediate forced production hard reload before IndexedDB Clear commit restored prior Next primary state.', verified: 'Both production prefixes restore blank draft/Check primary and retain earned Next access after current Clear marker is committed; first evidence remains unchanged.', reviewerDisposition: 'Retained persistence boundary; independent PASS. No source fix requested.', finalDispositionOwner: 'ROOT'}],
  limitations: report.limits,
  unresolvedProductDefects: [],
  nextAction: 'Root final code/render acceptance and explicit retained persistence-boundary disposition. No publication.'
};
write('foreman-report.json', final);
write('completion.json', {agentId: 'U01', jobId: final.jobId, status: 'PASS', outputPath: 'validation/ui-consistency/u2/foreman/HANDOVER.md', confidence: 0.95, reason: null, validation: {report: 'validation/ui-consistency/u2/foreman/foreman-report.json', currentInputs: inputs.length, treeSha256, reviewStatus: 'PASS', frozenU1Artifacts: frozen.frozenArtifacts.length}, rootFinalAcceptanceRequired: true, rootDispositionsRequired: ['UNCOMMITTED-CLEAR-RELOAD'], publication: false});
const progressFile = path.join(app, 'ui-consistency-progress.json'), progress = read(progressFile);
progress.status = 'awaiting_root_final_acceptance'; progress.currentStage = 'U2'; progress.stages.U2 = 'independently_reviewed_foreman_validated_awaiting_root_final_acceptance';
const job = progress.jobs.find(row => row.agentId === 'U05'); job.status = 'FOREMAN_VALIDATED';
progress.evidence = 'validation/ui-consistency/u2/foreman/foreman-report.json'; progress.currentInputTree = treeSha256; progress.updatedAt = at;
progress.rootDispositionsRequired = final.rootDispositionsRequired; progress.unresolved = [];
progress.nextAction = final.nextAction;
fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2) + '\n');
const evidenceFiles = walk(path.join(here, '..')).filter(file => file !== path.join(here, 'evidence-fingerprints.json'));
write('evidence-fingerprints.json', {at, count: evidenceFiles.length, files: evidenceFiles.sort().map(file => ({path: path.relative(app, file).replaceAll('\\', '/'), bytes: fs.statSync(file).size, sha256: hash(fs.readFileSync(file))}))});
console.log(JSON.stringify({status: final.status, reviewer: 'PASS', currentInputs: inputs.length, treeSha256, frozenArtifacts: frozen.frozenArtifacts.length, evidenceFiles: evidenceFiles.length, rootDispositionsRequired: ['UNCOMMITTED-CLEAR-RELOAD']}));
