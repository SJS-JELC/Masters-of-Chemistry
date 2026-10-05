import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const project = path.resolve(import.meta.dirname, '..');
process.chdir(project);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const evidence = 'validation/s4/refinement';
const inputs = {
  integration: `${evidence}/integration/checks.json`, build: `${evidence}/integration/build-checks.json`,
  ownership: `${evidence}/integration/source-ownership.json`, formatting: `${evidence}/formatting/write-report.json`,
  formatCheck: `${evidence}/formatting/check-report.json`, formatterTests: `${evidence}/formatting/semantic-checker-tests.json`,
  production: `${evidence}/integration/production-browser.json`, archive: `${evidence}/integration/archive-browser.json`,
  releases: `${evidence}/integration/release-browser-results.json`, devIsolation: `${evidence}/integration/authoring-release-isolation.json`,
  worker: 'validation/s4/authoring-release/refinement/completion.json',
  generatedHost: 'validation/s4/authoring-release/refinement/dev-formatted-starter/browser-results.json',
  initialReview: `${evidence}/review-scaffold-startup/completion.json`,
  coldReview: `${evidence}/review-formatted-startup/completion.json`, originals: 'validation/original-app-check.json',
};
const reports = Object.fromEntries(Object.entries(inputs).map(([key, file]) => [key, read(file)]));
for (const [key, report] of Object.entries(reports)) assert.equal(report.status, 'PASS', key);
assert.equal(reports.originals.fileCount, 1317);
assert.deepEqual(reports.originals.changed, []);
for (const [file, sha] of Object.entries(read('validation/s0/control-start.json').files)) assert.equal(hash(fs.readFileSync(file)), sha, file);
const totals = [...fs.readFileSync(`${evidence}/integration/unit.txt`, 'utf8').matchAll(/tests (\d+)/g)].map(match => Number(match[1]));
assert.equal(totals.reduce((a,b) => a+b,0), 121);
const prefix = 'development/authoring/families/dev-formatted-starter';
const generation = read(`${prefix}/generation-manifest.json`);
for (const [file, sha] of Object.entries(generation.generatedFingerprints)) assert.equal(hash(fs.readFileSync(`${prefix}/${file}`)), sha, file);
for (const [file, sha] of Object.entries(generation.templateFingerprints)) assert.equal(hash(fs.readFileSync(file)), sha, file);
assert.equal(read('validation/s4/authoring-release/refinement/dev-formatted-starter/configuration-validation.json').length, 72);
for (const course of reports.releases.courses) {
  assert.equal(course.manifestSha256, hash(fs.readFileSync(`release/${course.course}.runtime.json`)));
  assert.equal(reports.production.builds[course.course], course.manifestSha256);
}

const prior = new Map(read('validation/s4/file-inventory.json').files.map(row => [row.path, row]));
const excludeDirectory = name => name.startsWith('.') || ['node_modules','dist','browser-temp','p','p-edge','p-ordinary','Default','BrowserMetrics'].includes(name) || /(?:profile|cache|^temp[-_]|[-_]temp$|^a17-|^edge-a17-)/i.test(name);
function inventory(directory = '') {
  return fs.readdirSync(directory || '.', {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) return excludeDirectory(entry.name) ? [] : inventory(file);
    if (file === `${evidence}/file-inventory.json` || file === `${evidence}/foreman-report.json`) return [];
    const bytes = fs.readFileSync(file), sha256 = hash(bytes), old = prior.get(file);
    return [{path:file,bytes:bytes.length,sha256,status:old?(old.sha256===sha256?'unchanged':'modified'):'added',priorSha256:old?.sha256??null}];
  });
}
const files = inventory();
const changed = files.filter(row => row.status !== 'unchanged');
write(`${evidence}/file-inventory.json`, {status:'PASS',checkedAt:new Date().toISOString(),comparison:'Original S4 file inventory; caches, profiles and build outputs excluded. Runtime manifests carry current build hashes.',files:changed});
const progress = read('progress.json');
assert.equal(progress.currentStage, 'S4');
assert.equal(progress.stages.S5.status, 'pending');
for (const stage of ['S0','S1','S2','S3']) assert.equal(progress.stages[stage].status, 'accepted');
const report = {
  schemaVersion:1,runId:progress.runId,stage:'S4',scope:'Root-requested refinement only',status:'PASS',stageStatus:'awaiting_root_review',rootAccepted:false,completedAt:new Date().toISOString(),
  originalStageReport:'validation/s4/foreman-report.json',
  changes:{inventory:`${evidence}/file-inventory.json`,added:changed.filter(row=>row.status==='added').length,modified:changed.filter(row=>row.status==='modified').length,
    summary:['Runnable typed CLI starter with data, provider/marking, DEV registry, real shared-host preview and fixtures; no production promotion',
      'Canonical authored metadata generation feeds revision/mastery scope and persistence identity boundaries; retired source-only leaves stay explicit',
      'Pinned project-local Prettier3.6.2 and semantic auditing;133 authored TS/TSX formatted, generated/provenance sources byte-preserved',
      'Concise new activity/gem onboarding and exact shared editor/registry integration points documented']},
  coverage:{activities:12,curriculumActivities:11,olympiadActivities:1,currentGems:16,revisionTargets:41,validationLeaves:18,teacherDescriptors:6227,sourceFingerprints:237,originalRecords:1317,sourceCoverageChanged:false,
    generatedDevStarter:{path:prefix,fixed:1,seededConfigurations:72,levels:[1,2,3],generatedByCLI:true,noManualGeneratedEdits:true,productionEnabled:false}},
  architecture:{authority:'src/catalogue/authored-metadata.json augments frozen migration inventory; generated definitions.ts is canonical runtime metadata',
    projections:['src/catalogue/scope.ts for revision/mastery','src/persistence/catalogue-boundary.ts for current identity validation'],
    historical:'src/catalogue/historical-leaves.ts retains retired Ka/pKa; source-only legacy parser remains deliberate import compatibility',
    algorithms:'Storage/timer/attempt/scheduler/marking algorithms preserve reviewed S4 semantics; three metadata projection modules intentionally refined',
    onboarding:'docs/authoring/new-activity.md',formatting:'docs/architecture/formatting.md'},
  validation:{evidence:inputs,tests:121,generatedFixtureTests:2,formatterEquivalentCases:2,formatterChangeCasesRejected:5,
    formatter:{version:'3.6.2',checked:136,changed:133,semanticComparison:'source/type/executable JSX; equivalent adjacent React text normalized; ordinary arrays exact'},
    ownership:{priorSourceFiles:235,semanticOnly:127,bytePreserved:105,functionalMetadataProjections:3},
    generatedCommands:[`node development/authoring/scaffold.mjs dev-formatted-starter`,`node --test ${prefix}/family.test.mjs`,`node node_modules/typescript/bin/tsc --project ${prefix}/tsconfig.json`,`node development/authoring/serve.mjs --refinement`,`node ${prefix}/browser.mjs`],
    generatedBrowserGroups:7,productionBrowserGroups:5,archiveBrowserGroups:4,oldStoreWrites:0,
    productionFirstEvidence:{score:0,correctionChecks:3,activeMs:1151,chartMs:1151,evidenceRows:1},
    releases:reports.releases.courses.map(row=>({course:row.course,runtimeFiles:row.runtimeFileCount,initialShellGzipBytes:row.actualInitialGzipBytes,budget:204800,sha256:row.manifestSha256})),
    rendered:['Post-format starter mobile correction: correct2.70 model; first1/2 and correction2/2','Whole mobile orbital and energy teacher diagrams','Body system UI/Segoe; Comfortaa branding'],
    servers:'All foreman and worker validation servers closed'},
  reviews:[{agentId:'A06',jobId:'S4-REVIEW-SCAFFOLD-STARTUP',disposition:'Initial DOM-ready navigation plus unchanged actual host/assertions'},
    {agentId:'A06',jobId:'S4-REVIEW-FORMATTED-STARTUP',disposition:'Cold dependency initialization reproduced; one unchanged warm continuation passed seven groups'}],
  limitations:['Cold Vite optimizer/transform startup can exceed30s fixture navigation: ReactDOM response39483ms; warm host580ms. Failure/diagnostics retained; no timeout/config/assertion inflation.',
    'Earlier initial development startup stalls remain unclassified individually; current reproduced cause does not retroactively prove every historical event.',
    'DEV starter reuses reviewed strong-monobasic-acid dilution chemistry; new content requires fresh provenance/chemistry review. It adds no production activity/gem.',
    'Original S4 report/raw hashes remain historical snapshots; refinement source audit distinguishes deliberate metadata changes from semantic formatting.',
    'Inherited cloud523/current-PDF/exact-managed-Python/native-interval/untimed-history/shared physical lazy-graph limits remain explicit in original S4 report.'],
  modelEvidence:{workersRequested:'gpt-6.1-sol/high',effectiveModelEffort:null,usage:null,rootRuntimeModel:null},
  nextStage:{proposal:'docs/architecture/s5-work-packages.md',packages:['S5-BEHAVIOUR','S5-CHEMISTRY-SOURCES','S5-RENDER-ACCESSIBILITY-RELEASE'],decision:'Root S4 acceptance and explicit S5 authorization required; no S5 dispatch'},
};
write(`${evidence}/foreman-report.json`, report);
progress.status = 'awaiting_root_review';
progress.stages.S4.status = 'awaiting_root_review';
progress.stages.S4.evidence = [...new Set([...progress.stages.S4.evidence, `${evidence}/foreman-report.json`, `${evidence}/file-inventory.json`])];
for (const job of progress.jobs) if (job.jobId === 'S4-AUTHORING-REFINEMENT') Object.assign(job,{status:'validated',result:'PASS',evidence:inputs.worker});
for (const [jobId, file] of [['S4-REVIEW-SCAFFOLD-STARTUP',inputs.initialReview],['S4-REVIEW-FORMATTED-STARTUP',inputs.coldReview]]) {
  if (!progress.jobs.some(job=>job.jobId===jobId)) progress.jobs.push({agentId:'A06',jobId,status:'validated',result:'PASS',evidence:file,requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModelEffort:null,usage:null});
}
progress.nextAction = 'Root acceptance of S4 refinement; then explicit S5 authorization. No S5 work dispatched.';
write('progress.json',progress);
const originalHandoff = `${evidence}/prior-handoff.md`;
if (!fs.existsSync(originalHandoff)) fs.copyFileSync('HANDOFF.md',originalHandoff);
fs.writeFileSync('HANDOFF.md', `# S4 refinement handoff\n\nS4 refinement PASS, awaiting root review. S0-S3 remain accepted; S5 is pending and has not been dispatched.\n\nThe CLI now emits a runnable typed DEV starter with data/provider/marking/registry, shared-host preview, fixed and72 seeded fixtures, and source-bound generation evidence. A fresh instance generated after formatting typechecks and passes all seven real-host browser groups without plumbing edits. It never enables production content.\n\nRevision/mastery/persistence identities derive from canonical metadata. Historical-only leaves remain explicit; old import parsing and storage/timer/scheduler algorithms retain their reviewed semantics. See [new activity/gem onboarding](docs/authoring/new-activity.md).\n\nPrettier3.6.2 is pinned locally;133 authored TS/TSX files formatted with136 source/type/executable semantic comparisons. Extracted chemistry/provenance and retained generated instances stay byte-exact.\n\nTypecheck,121 tests, source237/control6/original1317 checks, both builds/releases and production/archive/alias/mobile browsers pass. Complete initial shell gzip:150983 Alevel and150982 IGCSE bytes, budget204800. Three corrections preserve one first score/time/evidence and exact1151ms statistics transfer. C3 remains isolated.\n\nCold Vite startup exceeded the fixture30s navigation budget; independent request traces reproduce ReactDOM response39483ms, whereas the warm host is ready580ms. One unchanged continuation passed; failed evidence is retained. Earlier individual cold stalls and inherited historical/environment limits remain explicit.\n\nSee [refinement report](validation/s4/refinement/foreman-report.json), [changed files](validation/s4/refinement/file-inventory.json), [original S4 report](validation/s4/foreman-report.json), and [exact S5 proposal](docs/architecture/s5-work-packages.md). No original-app writes/builds, root dependency changes, publication or S5 dispatch occurred.\n`);
console.log(JSON.stringify({status:'PASS',stage:'S4',stageStatus:'awaiting_root_review',report:`${evidence}/foreman-report.json`,tests:121,added:report.changes.added,modified:report.changes.modified}));
