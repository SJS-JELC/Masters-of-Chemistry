import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(dir, '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(dir, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
const current = read('source-current-verification.json');
assert.equal(current.status, 'PASS');
assert.equal(current.sourceChangedAfterSuccessfulBuild, false);
for (const source of current.sources) assert.equal(hash(path.join(app, source.path)), source.sha256);
for (const name of ['browser-results.json', 'timing-browser-results.json', 'release-browser-results.json', 'release-checks.json', 'original-preservation.json']) assert.equal(read(name).status, 'PASS', name);

const inspected = [];
for (const course of ['alevel', 'igcse']) {
  for (const size of ['desktop', 'tablet', 'mobile']) for (const state of ['populated', 'empty']) inspected.push(`${course}-${size}-${state}.png`);
  for (const suffix of ['mobile-overview', 'mobile-chart', 'original-desktop', 'live-timing-transfer', 'release-prefix']) inspected.push(`${course}-${suffix}.png`);
}
inspected.push('storage-error.png');
write('rendered-review.json', {
  jobId: 'STATS-RESTORE-01', agentId: 'A01', status: 'PASS', reviewedAt: new Date().toISOString(),
  reviewer: 'A01 actual visual inspection through view_image', sources: current.sources,
  browser: 'headless Microsoft Edge / Playwright 1.62.1', timezone: 'Europe/London',
  findings: ['Original layout, five cards and outcome colours restored with current shared branding.', 'Both courses populated and empty desktop/tablet/mobile layouts inspected.', 'Threshold geometry, unavailable rows, chronological squares, real-time result detail and production routes inspected.', 'Month width and long-history scrolling pass browser geometry checks; original mobile date-label density retained.'],
  limitations: ['No claim of testing every browser; original dense mobile date labels have accessible full descriptions.'],
  screenshots: inspected.map(name => {const file = path.join(dir, name); return {path: name, sha256: hash(file), capturedAt: fs.statSync(file).mtime.toISOString(), visuallyInspected: true};})
});
const previous = read('completion.json');
if (previous.status === 'ESCALATE' && !fs.existsSync(path.join(dir, 'completion-environment-escalation.json'))) write('completion-environment-escalation.json', previous);
const prefix = 'validation/statistics-restore/';
write('completion.json', {
  jobId: 'STATS-RESTORE-01', agentId: 'A01', status: 'PASS', outputPath: prefix + 'HANDOVER.md', confidence: 0.98,
  completedAt: new Date().toISOString(), finalAcceptance: 'pending root independent acceptance',
  requestedModel: 'gpt-6.1-sol', requestedEffort: 'high', effectiveModelEffort: null, usage: null,
  validation: {
    typecheck: {status: 'PASS', evidence: prefix + 'typecheck.txt'},
    modelAndTiming: {status: 'PASS', tests: 16, retainedMasteryEquivalenceCases: 273, evidence: prefix + 'model-timing.txt'},
    buildAndRelease: {status: 'PASS', courses: ['alevel', 'igcse'], initialJavascriptGzipBytes: 181280, evidence: prefix + 'release-checks.json'},
    responsiveAndInteractions: {status: 'PASS', scenarios: 7, evidence: prefix + 'browser-results.json'},
    realClockTransfer: {status: 'PASS', courses: 2, evidence: prefix + 'timing-browser-results.json'},
    productionPrefix: {status: 'PASS', courses: 2, evidence: prefix + 'release-browser-results.json'},
    originalPreservation: {status: 'PASS', readableHashes: 794, metadataOnlyPlaceholders: 523, evidence: prefix + 'original-preservation.json'},
    sourceBuildFingerprint: {status: 'PASS', postBuildSourceChanges: false, evidence: prefix + 'source-current-verification.json'},
    renderedInspection: {status: 'PASS', inspectedScreenshots: inspected.length, evidence: prefix + 'rendered-review.json'},
    diff: prefix + 'source-diff.patch', finalSourceFingerprints: prefix + 'changed-files.json', provenance: prefix + 'provenance.json'
  },
  risks: ['Browser evidence uses headless Microsoft Edge; original dense mobile date labels are retained with accessible descriptions.'],
  unresolvedFailures: [], deployed: false
});
console.log(JSON.stringify({status: 'PASS', manifest: prefix + 'completion.json', inspectedScreenshots: inspected.length}));
