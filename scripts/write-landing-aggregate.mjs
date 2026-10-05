import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { landingInputs } from './landing-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
const base = 'validation/landing-restoration/';
const read = relative => JSON.parse(fs.readFileSync(path.join(project, relative), 'utf8').replace(/^\uFEFF/, ''));
const checks = read(base + 'aggregate/checks.json');
assert.equal(checks.status, 'PASS');
const design = read(base + 'design/completion.json');
const integration = read(base + 'integration/completion.json');
const category = read(base + 'integration/teacher-category/completion.json');
for (const item of [design, integration, category]) assert.equal(item.status, 'PASS');
const matrix = read(base + 'design/state-matrix.json');
assert.equal(matrix.status, 'PASS'); assert.equal(matrix.count, 75);
assert.equal(matrix.ownedSourceFingerprint, matrix.finishedOwnedSourceFingerprint);
assert.equal(new Set(matrix.pairs.map(item => item.name)).size, 75);
for (const item of read(base + 'design/output-fingerprints.json'))
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(project, item.path))).digest('hex'), item.sha256);
const protectedApps = read(base + 'aggregate/original-app-check.json');
assert.equal(protectedApps.status, 'PASS');
const browserPaths = [
  'design/browser-comparison.json', 'design/browser-interactions.json',
  'integration/browser-results.json', 'integration/revision-browser-results.json',
  'integration/failure-browser-results.json', 'integration/teacher-category/browser-results.json',
  'aggregate/prefix-browser.json',
];
for (const file of browserPaths) assert.equal(read(base + file).status, 'PASS', file);
const beforeHost = fs.readFileSync(path.join(project, 'validation/s5/behaviour/session-only-save-fix/latest/ActivityHost.tsx.txt'), 'utf8');
const afterHost = fs.readFileSync(path.join(project, 'src/foundation/ActivityHost.tsx'), 'utf8');
const queueBlock = source => source.slice(source.indexOf('  const queueSave ='), source.indexOf('  const readSavedData ='));
assert.equal(queueBlock(beforeHost), queueBlock(afterHost), 'Recent robust save/session queue changed');
const evidence = [
  'design/completion.json', 'design/HANDOVER.md', 'design/source-fingerprints.json',
  'design/output-fingerprints.json', 'design/state-matrix.json', 'design/visual-inspection.json',
  'design/alevel-contact-sheet.html', 'design/alevel-contact-sheet.png',
  'design/igcse-contact-sheet.html', 'design/igcse-contact-sheet.png',
  'design/invariants-final.log', 'design/typecheck-final.log',
  'integration/completion.json', 'integration/HANDOVER.md',
  'integration/teacher-category/completion.json', 'integration/teacher-category/HANDOVER.md',
  'integration/alevel-focused-home.png', 'integration/igcse-focused-home.png',
  'integration/teacher-category/ionic-teacher.png', 'integration/teacher-category/covalent-teacher.png',
  'aggregate/checks.json', 'aggregate/source-ownership.json', 'aggregate/release-checks.json',
  'aggregate/legacy-gates.json', 'aggregate/original-app-check.json', 'aggregate/source-controls.json',
  'aggregate/build.log', 'aggregate/historical-regressions.log', 'aggregate/landing-tests.log',
  'aggregate/typecheck.log', 'aggregate/activity-host.diff', ...browserPaths,
  ...matrix.pairs.flatMap(item => ['design/' + item.original, 'design/' + item.restored]),
].map(relative => base + relative);
const evidenceHashes = [...new Set(evidence)].sort().map(relative => {
  const bytes = fs.readFileSync(path.join(project, relative));
  return { path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
});
const report = {
  schemaVersion: 1, runId: 'LANDING-RESTORE-20261003', status: 'PASS', stageStatus: 'awaiting_root_acceptance', rootAcceptance: 'pending',
  checkedAt: new Date().toISOString(),
  jobs: [design, integration, category].map(item => ({ agentId: item.agentId, jobId: item.jobId, status: 'ACCEPTED', outputPath: item.outputPath })),
  summary: { alevelRawGems: 154, alevelVisibleGems: 152, alevelHiddenRedirects: 2, igcseGems: 64,
    curriculumLeaves: 16, genuinelySupportedTargets: 41, activities: 12, independentHistoricalRegressions: 156,
    focusedLandingTests: 7, originalNewScreenshotPairs: matrix.count, protectedFiles: protectedApps.fileCount,
    metadataOnlyFiles: protectedApps.metadataOnly.length },
  checks: checks.results,
  releases: read(base + 'aggregate/release-checks.json'),
  browserEvidence: browserPaths.map(file => ({ status: 'PASS', evidence: base + file })),
  substantiveReview: { owner: 'L01', evidence: base + 'design/visual-inspection.json',
    code: ['typed launch/StrictMode/read guard', 'exact target/mastery and revision matching/completion boundaries',
      'Home/Back save gate', 'recent robust save queue byte preserved', 'course/code/old-link authority',
      'teacher category/evidence isolation', 'original catalogue/style/animation reuse', 'project-only preference write sites'],
    rendered: ['both original/new contact sheets', 'full-resolution original/new A Level mobile', 'focused Home hook'],
    rootReview: 'pending' },
  preservedSources: read(base + 'aggregate/source-ownership.json'),
  ownedSourceFingerprint: matrix.ownedSourceFingerprint,
  requestedModels: [{ agentId: 'L01', model: 'gpt-6.1-sol', effort: 'high', effective: null, usage: null },
    { agentId: 'L02', model: 'gpt-6.1-sol', effort: 'high', effective: null, usage: null },
    { agentId: 'L03', model: 'gpt-6.1-sol', effort: 'high', effective: null, usage: null }],
  unresolved: [], noPublication: true,
  limits: ['Root final code/render acceptance remains required.',
    'Original A Level pH levels [2,3] award-index brightness quirk deliberately retained; correct summaries/meters unchanged.',
    '523 pre-existing cloud files have metadata-only guard evidence; no invented byte hashes.',
    'Screenshot shine animation phase frozen equally; actual interaction tests unfrozen and fresh isolated synthetic contexts.',
    'Historical S0-S5 acceptance retained; historical check:s5 freeze intentionally superseded for this landing stage.',
    'Activity/editor/statistics visual restoration and publication are outside Part 1.'],
  previews: { alevel: 'http://127.0.0.1:5182/alevel/?course=alevel&view=home',
    igcse: 'http://127.0.0.1:5182/igcse/?course=igcse&view=home', liveSource: 'http://127.0.0.1:5183' },
  currentInputHashes: landingInputs(), evidenceHashes,
};
fs.writeFileSync(path.join(project, base + 'foreman-report.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(project, 'landing-progress.json'), JSON.stringify({ runId: report.runId,
  status: 'awaiting_root_acceptance', stage: 'Part 1 original landing restoration', jobs: report.jobs,
  evidence: [base + 'foreman-report.json', 'LANDING-HANDOFF.md'], rootAcceptance: null }, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, stageStatus: report.stageStatus, inputFiles: report.currentInputHashes.length,
  evidenceFiles: report.evidenceHashes.length, summary: report.summary }));
