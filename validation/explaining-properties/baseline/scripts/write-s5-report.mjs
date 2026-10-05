import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from './current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(project, file), 'utf8').replace(/^\uFEFF/, '');
const json = file => JSON.parse(read(file));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const freeze = json('validation/s5/integration/freeze-current.json');
assert.deepEqual(currentInputs(), freeze.currentInputHashes, 'Final runtime/config/build inputs changed');
const shellBytesByCourse = Object.fromEntries(freeze.releases.map(release => [release.course, release.initialJavascriptGzipBytes]));
const shellSummary = freeze.releases.map(release => `${release.course} ${release.initialJavascriptGzipBytes}`).join('; ');
const nextFixReview = json('validation/s5/review-render-harness/energy-next-fix/completion.json');
assert.equal(nextFixReview.status, 'PASS', 'Genuine Next/save defect has not passed independent regression');
const sessionFixReview = json('validation/s5/review-session-only-save/fix-review/verification.json');
assert.equal(sessionFixReview.status, 'PASS');
assert.equal(hash(fs.readFileSync(path.join(project, sessionFixReview.approvedHost.path))), sessionFixReview.approvedHost.sha256, 'Current Host differs from independently approved exact code');
const reviews = [
  ['A21', 'S5-BEHAVIOUR', 'validation/s5/behaviour/session-only-save-fix/latest/completion.json'],
  ['A22', 'S5-CHEMISTRY-SOURCES', 'validation/s5/chemistry/session-only-save-fix/final/completion.json'],
  ['A23', 'S5-RENDER-ACCESSIBILITY-RELEASE', 'validation/s5/render-release/session-only-save-fix/completion.json'],
].map(([agentId, id, evidence]) => {
  const review = json(evidence);
  assert.equal(review.status, 'PASS', `Independent review incomplete: ${id}`);
  return { agentId, id, status: 'PASS', evidence, evidenceSha256: hash(fs.readFileSync(path.join(project, evidence))), validation: review.validation ?? null };
});
const checks = json('validation/s5/integration/foreman-checks.json');
assert.equal(checks.status, 'PASS');
const source = json('validation/s5/integration/source-ownership.json');
assert.equal(source.status, 'PASS');
const contract = json('project-contract.json');
const unitLog = read('validation/s5/integration/foreman-unit.txt');
const tests = [...unitLog.matchAll(/^ℹ tests (\d+)\s*$/gm)].reduce((sum, match) => sum + Number(match[1]), 0);
assert.equal(tests, 156, 'Unexpected complete regression count');
const mapping = {
  'SCOPE-01': ['Protected originals and six root controls unchanged; source ownership/diffs scoped inside new project.', ['validation/s5/integration/foreman-protected-originals.txt', 'validation/s5/integration/foreman-source-and-controls.txt', 'validation/s5/integration/source-ownership.json']],
  'SCOPE-02': ['Exact12 enabled activities, all41 genuine targets; no Rocket functionality/assets, with explicit rejected old links.', ['validation/s5/integration/foreman-catalogue.txt', 'validation/s5/integration/foreman-checks.json', 'validation/s5/behaviour/browser-results.json', 'validation/s5/integration/release-checks.json']],
  'SCOPE-03': ['Olympiad current/historical drawings, completion, imports and restart isolated from curriculum rows, gems, revision, time and statistics.', ['validation/s5/behaviour/c3-erratum-browser-results.json', 'validation/s5/chemistry/c3-final-source-review.json']],
  'ARCH-01': ['Direct shared React host/player, actual controller/repository/session composition, focused practice/revision/teacher/Olympiad navigation and no iframe/legacy wrappers.', ['validation/s5/integration/foreman-checks.json', 'validation/s5/behaviour/HANDOVER.md', 'validation/s5/render-release/HANDOVER.md', 'docs/architecture/platform.md']],
  'ARCH-02': ['Typed independent contracts/module boundaries, canonical catalogue-derived validation and actual integrated runtime.', ['validation/s5/integration/foreman-typecheck.txt', 'validation/s5/integration/foreman-unit.txt', 'validation/s5/integration/foreman-catalogue.txt']],
  'CONTENT-01': ['Complete banks/configurations/levels/IDs and source ownership, substantive chemistry and checked diagrams; three documented corrections including raw23/current22 K erratum.', ['validation/s5/chemistry/current-coverage.json', 'validation/s5/chemistry/stratified-sample.json', 'validation/s5/chemistry/manual-review.json', 'validation/s5/chemistry/c3-transformation-review.json', 'validation/s5/chemistry/final-production-browser-results.json', 'docs/inventory/c3-k-erratum.md']],
  'ASSESS-01': ['Wrong/correct/partial first results, learning-only correction/reveal, immutable score/time/response and one evidence; self-rubric locks text and precise evidence; teacher zero evidence.', ['validation/s5/behaviour/deep-browser-results.json', 'validation/s5/behaviour/revision-browser-results.json', 'validation/s5/integration/foreman-unit.txt']],
  'ASSESS-02': ['273 original mastery equivalence cases and source statistics; historical evidence, untimed gaps and raw import conflicts preserved.', ['validation/s5/integration/foreman-unit.txt', 'validation/s5/behaviour/import-browser-results.json', 'validation/s5/behaviour/HANDOVER.md']],
  'TIME-01': ['All four idle allowances and native boundary continuity, current first-freeze/restore/fresh-Next/statistics; historical ambiguities explicitly retained.', ['validation/s5/integration/active-time-review.json', 'validation/s5/behaviour/timing-continuity.json', 'validation/s5/behaviour/deep-browser-results.json', 'validation/s5/behaviour/revision-browser-results.json']],
  'STATE-01': ['Ten startup failure/recovery cases, real transactions/dedup/quota/conflict, exact drawing/ID/seed/draft restore, repeated Retry connection disposal, raw archives/exports and no old-store writes; trusted Next waits for blur-save result and prevents duplicate progression; terminal completion and no-attempt resume show only after committed session writes and Retry repeats the failed operation.', ['validation/s5/behaviour/recovery-browser-results.json', 'validation/s5/behaviour/deep-browser-results.json', 'validation/s5/behaviour/import-browser-results.json', 'validation/s5/behaviour/c3-erratum-browser-results.json', 'validation/s5/review-render-harness/energy-next-fix/completion.json', 'validation/s5/behaviour/session-only-save-fix/latest/completion.json']],
  'UX-01': ['Current desktop/mobile whole/detail diagrams, focused setup/navigation, checked teacher previews, fonts/contrast/keyboard/touch/non-drag controls, real sequential numeric typing.', ['validation/s5/render-release/completion.json', 'validation/s5/render-release/HANDOVER.md', 'validation/s5/render-release/session-only-save-fix/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json']],
  'AUTHOR-01': ['Fresh CLI-generated typed fixed+72 seeded starter runs through real shared host without plumbing edits; canonical metadata/new activity-gem onboarding documented; DEV only.', ['validation/s5/render-release/completion.json', 'validation/s5/render-release/HANDOVER.md', 'validation/s5/render-release/session-only-save-fix/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json', 'validation/s5/chemistry/independent-checks.json', 'development/authoring/families/dev-s5-independent/README.md', 'docs/authoring/new-activity.md']],
  'PERF-01': [`Explicit lazy release graph and eager shells (${shellSummary} gzip bytes); documented current throttled startup/gesture/typing measurements, not native foreground claims.`, ['validation/s5/integration/release-checks.json', 'validation/s5/render-release/completion.json', 'validation/s5/render-release/HANDOVER.md', 'validation/s5/render-release/session-only-save-fix/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json']],
  'RELEASE-01': ['Both current independent static builds, nested prefix/direct refresh and supported old aliases; runtime-only inventories, licensed branding and no deployment.', ['validation/s5/integration/build-current.json', 'validation/s5/integration/release-checks.json', 'validation/s5/integration/preview-smoke.json', 'validation/s5/render-release/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json']],
  'DELIVERY-01': ['Reproducible install/dev/build/preview/check/release/authoring commands, requirement evidence/current hashes and retained limits; root final acceptance remains pending.', ['README.md', 'HANDOFF.md', 'validation/s5/foreman-report.json', 'validation/s5/integration/install-current.json']],
};
assert.deepEqual(Object.keys(mapping).sort(), contract.requirements.map(row => row.id).sort());
for (const value of Object.values(mapping)) value[1] = [...new Set(value[1])];
for (const [id, [, evidence]] of Object.entries(mapping)) for (const file of evidence) if (!['HANDOFF.md', 'validation/s5/foreman-report.json'].includes(file)) assert(fs.existsSync(path.join(project, file)), `Missing ${id} evidence: ${file}`);
const existingProgress = json('progress.json');
const limits = existingProgress.unresolved.filter(item => !['S5-GATE', 'DEV-COLD-START', 'PERFORMANCE-METHOD', 'S5-AUTHOR-TAILS'].includes(item.id)).map(item => item.id === 'CANONICAL-PYTHON' ? { ...item, detail: 'Managed exact Python3.14.2/RDKit2026.03.6 profile unavailable. Supplementary readonly Python3.13.5/RDKit2025.09.1 invariants are explicitly separate; no full canonical glyph regeneration claimed. CO one-vector correction is independently reviewed. Root-approved C3 K connectivity marking erratum changes current policy/revalidation while preserving original graph/diagram bytes and historical outcomes.' } : item);
limits.push({ id: 'DEV-COLD-START', disposition: 'documented-development-limit', detail: 'Cold dependency preparation can exceed30-second fixture navigation; failures/warm continuations retained, no timeout or substantive assertion inflation.' });
limits.push({ id: 'PERFORMANCE-METHOD', disposition: 'measurement-limit', detail: 'Headless Edge/CDP throttle and trusted page events are documented browser measurements; no OS foreground/host CPU isolation or production field-device certification claimed.' });
limits.push({ id: 'S5-AUTHOR-TAILS', disposition: 'independently-resolved', detail: 'Author energy tail and historical titration output-write limitations retained; final independent static gates and applicable chemistry fixtures supersede author scope without relabelling raw failures.' });
const report = {
  schemaVersion: 1, runId: contract.runId, stage: 'S5', status: 'PASS', stageStatus: 'awaiting_root_review', rootAcceptance: 'pending', checkedAt: new Date().toISOString(),
  summary: { activities: 12, curriculumActivities: 11, olympiadActivities: 1, gems: 16, genuineTargets: 41, teacherDescriptors: 6227, originalIdentityEntries: 894, originalSourceFingerprints: 237, protectedOriginalRecords: 1317, protectedReadableHashes: 794, protectedMetadataOnly: 523, unitTests: tests, changedAuthoredSourceFiles: 15, bytePreservedSourceFiles: 222, runtimeFilesPerCourse: 129, fullShellGzipBytesPerCourse: shellBytesByCourse },
  currentInputTreeSha256: freeze.treeSha256, currentInputHashes: freeze.currentInputHashes, releases: freeze.releases, independentReviews: reviews,
  requirementToEvidence: contract.requirements.map(row => ({ id: row.id, requirement: row.text, status: 'validated_awaiting_root_acceptance', outcome: mapping[row.id][0], evidence: mapping[row.id][1] })),
  deterministicChecks: checks.results,
  independentEvidenceValidation: 'validation/s5/integration/independent-validation.json',
  changedFileInventory: 'validation/s5/integration/source-ownership.json',
  fullDeliveryInventory: 'validation/s5/integration/delivery-inventory.json',
  currentChemistryContinuity: 'validation/s5/chemistry/session-only-save-fix/final/completion.json',
  currentNextBehaviour: 'validation/s5/behaviour/session-only-save-fix/latest/completion.json',
  sourceDiffSummary: source.changed,
  finalPersistenceCorrection: {
    changedRuntimeFile: sessionFixReview.approvedHost,
    scope: 'Only the shared Host changed since the prior accepted broad review. Terminal revision completion and no-attempt Resume now check queued session write Results; exact Retry and separate write-family failures preserve durable state and first evidence.',
    currentActualBehaviourCases: 36,
    currentMobileCases: 6,
    currentChemistryContinuityProductionSamples: 3,
    currentColdStartSamples: 2,
    currentSemanticCheckpointSamples: 2,
    exactCodeReview: 'validation/s5/review-session-only-save/fix-review/completion.json',
    retainedFailedPrototype: 'validation/s5/integration/failed-c1-session-freeze/freeze-current.json',
    timingScope: 'Original native evidence is retained; current clock/binding/attempt sources and BOM-normalized adapter semantics verified. No new native wall-clock interval claimed.',
    timingSupplement: 'validation/s5/behaviour/session-only-save-fix/latest/timing-supplement.json',
  },
  decisions: [
    'Root final storage gate: session-only completion/resume now share queued Result/status handling and exact failed-operation Retry; session UI state changes after successful commit, paused sessions without an attempt restore Resume, and concurrent corrections retain the pending session transition.',
    'Acid precision prompts follow exact answer formats; three electron-bonding prompts qualified without answer/mark/ID changes.',
    'Root-approved K hydrate marking erratum preserves original23 alternatives/provenance, projects22 current accepted alternatives and separately retains exact historical outcome; current wrong graph/revalidated import rejected.',
    'Startup read errors block misleading practice/progress until Retry succeeds; same-database replacement disposes obsolete connection without clearing data.',
    'Titration/energy numeric text and signed dot charge remain local while incomplete; blur/Enter or Apply performs meaningful semantic commit through existing engines.',
    'A genuine trusted Next gesture failure during editor blur was independently reproduced and fixed: keep ordinary-save Next clickable, await its authoritative outcome, and prevent concurrent transitions without changing first evidence or scheduler mathematics.',
    'Authoring canonical metadata derives validation boundaries; standard family needs no timing/storage/scheduler algorithm changes; production promotion remains explicit.',
  ],
  exceptions: [
    { id: 'SESSION-ONLY-RESULT', authority: 'root-final-review', originalFailure: 'validation/s5/behaviour/session-only-save-fix/before-results.json', evidence: 'validation/s5/behaviour/session-only-save-fix/latest/completion.json', author: 'validation/s5/fixes/session-only-save/author-report.json', outcome: 'Both unchecked session-only branches corrected and independently verified on latest static builds.' },
    { id: 'CHEM-03', authority: 'root', evidence: 'validation/s5/integration/root-c3-disposition.json' },
    { id: 'BEHAVIOUR-HARNESS', evidence: 'validation/s5/review-behaviour-harness/HANDOVER.md', outcome: 'Exact independently reviewed corrected fixtures passed current final browser suites; original failures retained.' },
    { id: 'RENDER-HARNESS', evidence: 'validation/s5/review-render-harness/HANDOVER.md', outcome: 'Independent source/DOM/fixture dispositions retain original failed probes; final independent continuation evidence in render handover.' },
    { id: 'INSTALL-LOCK', evidence: 'validation/s5/integration/retained-dev-process-stop.json', outcome: 'Exact root-approved retained new-project Vite PID closed; clean install passed; originals/parent process untouched.' },
    { id: 'RUNTIME-NEXT', evidence: 'validation/s5/review-render-harness/energy-next-fix/completion.json', originalFailure: 'validation/s5/review-render-harness/energy-next-classification/completion.json', author: 'validation/s5/fixes/next-save-transition/author-report.json', outcome: 'Independently resolved against current rebuilt static inputs; original failure remains retained.' },
  ],
  limitations: limits,
  models: { rootRuntime: 'not exposed', foremanRequested: 'gpt-6.1-sol/high', workerRequested: 'gpt-6.1-sol/high', effectiveSettings: 'not exposed', usage: null },
  nextDecision: 'Root accepts or identifies a bounded final correction; local implementation remains idle. No deployment/publication authorised.',
  deployment: false,
};
fs.writeFileSync(path.join(project, 'validation/s5/foreman-report.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(project, 'HANDOFF.md'), `# Final local implementation — S5 awaiting root acceptance\n\nBoth course builds and all three independent reviews pass against frozen inputs. Root alone accepts the finished app. No deployment occurred.\n\n## Start here\n\n[README](README.md) gives install/dev/build/preview/check/release and authoring commands. [Final evidence map](validation/s5/foreman-report.json) maps all 15 requirements, current hashes, detailed reviews and limitations.\n\n## Validation\n\n- ${tests} tests; type, build, format, catalogue, source/control and original guards pass.\n- All 12 activities, 41 genuine curriculum targets and 6,227 teacher descriptors retained; current chemistry reviewed independently.\n- Original 1,317 records unchanged: 794 byte hashes and 523 metadata-only placeholders.\n- Both releases: 129 runtime files, 59 lazy chunks, ${shellSummary} gzip bytes for the initial shells.\n- Current 517-input tree: \`${freeze.treeSha256}\`.\n\n## Bounded final corrections\n\nAnswer-specific acid precision; three qualified bonding prompts; C3 hydrated-aldehyde erratum with 23 source alternatives, 22 current alternatives and separately preserved historical outcomes; visible saved-data recovery/connection Retry; reliable real-keystroke numeric/editor setup; trusted Next after blur-save with duplicate and failure guards; checked session-only completion/resume and coherent Retry/reload. [Source changes](validation/s5/integration/source-ownership.json) lists 15 scoped authored changes and 222 byte-preserved source files.\n\n## Independent review\n\n- [Behaviour/timing/restore/import](validation/s5/behaviour/HANDOVER.md) and [current Next/save verification](validation/s5/behaviour/next-save-fix/HANDOVER.md) and [final session write verification](validation/s5/behaviour/session-only-save-fix/latest/HANDOVER.md)\n- [Complete chemistry/source/render sample](validation/s5/chemistry/HANDOVER.md) and [current source continuity](validation/s5/chemistry/next-save-fix/HANDOVER.md) and [final chemistry continuity](validation/s5/chemistry/session-only-save-fix/final/HANDOVER.md)\n- [Current render/accessibility/typing/performance/release/authoring](validation/s5/render-release/HANDOVER.md) and [final host/release follow-up](validation/s5/render-release/session-only-save-fix/HANDOVER.md)\n\n## Retained limits\n\nOffline non-source placeholders, exact-current full OCR PDF/canonical managed Python availability, ambiguous prior native intervals and explicitly carried shared-native timing evidence remain documented. Headless/CDP profiling does not certify OS foreground timing or host isolation. Both course builds share the deferred registry graph physically. Historical missing responses/durations remain gaps. DEV cold startup and failed author/harness probes are preserved explicitly.\n\n## Next action\n\nRoot final acceptance only. No further stage or deployment dispatched.\n`);
existingProgress.currentStage = 'S5';
existingProgress.status = 'awaiting_root_review';
existingProgress.stages.S5.status = 'awaiting_root_review';
existingProgress.stages.S5.evidence = ['validation/s5/foreman-report.json', 'HANDOFF.md', 'README.md', 'validation/s5/integration/foreman-checks.json', ...reviews.map(row => row.evidence)];
for (const review of reviews) {
  const job = existingProgress.jobs.find(row => row.jobId === review.id);
  assert(job, `Missing review progress job: ${review.id}`);
  job.status = 'validated';
}
for (const job of existingProgress.jobs.filter(row => row.jobId.startsWith('S5-FIX-'))) job.status = 'validated';
existingProgress.requirements = Object.fromEntries(report.requirementToEvidence.map(row => [row.id, { status: row.status, evidence: row.evidence }]));
existingProgress.unresolved = limits;
existingProgress.nextAction = report.nextDecision;
existingProgress.updatedAt = report.checkedAt;
fs.writeFileSync(path.join(project, 'progress.json'), JSON.stringify(existingProgress, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, stageStatus: report.stageStatus, tests, requirements: report.requirementToEvidence.length, reviews: reviews.length, report: 'validation/s5/foreman-report.json' }));
