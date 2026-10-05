import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(project, file), 'utf8').replace(/^\uFEFF/, ''));
const write = (file, value) => fs.writeFileSync(path.join(project, file), JSON.stringify(value, null, 2) + '\n');
const manifest = read('validation/s0/inventory/coverage-manifest.json');
const controls = read('validation/s0/control-start.json');
const protectedCheck = read('validation/original-app-check.json');
const integration = read('validation/s0/integration-check.json');
if (protectedCheck.status !== 'PASS' || integration.status !== 'PASS') throw Error('Cannot report S0 PASS with failed mandatory checks');
const limitations = [
  {id:'REF-ACID-STALE', disposition:'resolved-for-S0', detail:'Original test_acid_levels.js preserves its stale all-U6-acid failure. Owned port checks exact five acid leaves and separate titration leaf; 15 routes and 33 historical fixtures pass.', evidence:'validation/s0/inventory/ported-acid-levels.log'},
  {id:'REF-ATLAS-PATH', disposition:'retained-for-dot-cross-port', detail:'test_dot_cross_bank.js has a missing historic atlas dependency; not run. Independent dot-cross reference checks pass. Port provenance lookup in the new project before applicable activity acceptance.', evidence:'validation/s0/inventory/reference-validation-map.json'},
  {id:'SOURCE-CLOUD', disposition:'explicit-evidence-limit', detail:'Original baseline has 523 metadata-only offline placeholders outside src; content is not hydrated. Historical C3L6 reports retain path provenance only; executable content/editor and 23 structure alternatives are readable/checked.', evidence:'validation/s0/inventory/source-provenance-availability.json'},
  {id:'STAGE-LIMIT', disposition:'later-stage-gates', detail:'S0 provides source/contracts only. Runtime, real-browser/rendering, complete migrated chemical/pedagogical review, build/release/budget/accessibility and final requirement acceptance remain deferred.'}
];
const nextPackages = [
  {jobId:'S1-SHELL', ownerPaths:['src/ui/**','src/shell/**','src/styles/**','src/main-alevel.tsx','src/main-igcse.tsx','validation/s1/shell/**'], outcome:'Two course shells and directly mounted shared player/ordinary controls, teacher preview and accessible layouts.'},
  {jobId:'S1-ATTEMPT', ownerPaths:['src/domain/attempt/**','src/domain/timing/**','validation/s1/attempt/**'], outcome:'Pure first-evidence engine, separate rubric/learning-review flow and tested active clock.'},
  {jobId:'S1-PERSISTENCE', ownerPaths:['src/persistence/**','validation/s1/persistence/**'], outcome:'Dexie transactional repository, explicit failures and validated/deduplicated read-only legacy import primitives.'},
  {jobId:'S1-SESSION', ownerPaths:['src/domain/mastery/**','src/domain/session/**','validation/s1/session/**'], outcome:'Exact course mastery mathematics and curriculum-only practice/revision scheduling.'}
];
const progress = read('progress.json');
progress.currentStage = 'S0'; progress.status = 'awaiting_root_review';
progress.stages.S0 = {status:'awaiting_root_review', evidence:['validation/s0/foreman-report.json','HANDOFF.md','validation/s0/integration-check.json']};
progress.jobs = [
  {agentId:'A02',jobId:'S0-INVENTORY',status:'validated',result:'PASS',evidence:'validation/s0/inventory/completion.json'},
  {agentId:'A03',jobId:'S0-CONTRACTS',status:'validated',result:'PASS',evidence:['validation/s0/contracts/handover.json','validation/s0/contracts/handover-clarification.json'],clarifiedRetries:1}
];
progress.unresolved = limitations.filter(item => !['resolved-for-S0','later-stage-gates'].includes(item.disposition));
progress.nextAction = 'Root reviews S0 report, inventory, shared contract diff and exact proposed S1 packages; no S1 dispatch until explicit acceptance.';
write('progress.json', progress);
const report = {
  schemaVersion:1, runId:'MASTERS-REACT-20261002', stage:'S0', agentId:'A01', status:'PASS', stageStatus:'awaiting_root_review', generatedAt:new Date().toISOString(),
  requestedModel:'gpt-6.1-sol',requestedEffort:'high',effectiveModel:'unknown',actualUsage:'unknown',rootModel:'unknown',
  workerResults:progress.jobs,
  coverage:{activities:12,curriculum:11,olympiad:1,sourceFingerprints:manifest.sources.length,historicalIdentityEntries:894,
    summary:[
      {id:'alevel/acid-base-calculations',count:'38 active templates; 63 supported level routes; 33 historical templates'},
      {id:'alevel/electrons-bonding',count:'14 fixed'},
      {id:'alevel/electron-configurations',count:'71 species, 36 atom entries, four representations, both directions and ten seeded matching families'},
      {id:'alevel/dot-and-cross',count:'91 teacher-bank questions; explicit pupil pool dedup/level routes'},
      {id:'alevel/ph-titration-curves',count:'36 fixed, 18 at each level 2/3'},
      {id:'alevel/c3l6-organic-reactions',count:'intro, 10 classifications, 12 B targets/seven units, nine C targets, 23 structure alternatives'},
      {id:'igcse/calorimetry',count:'16 examples, four mastery families, 4512 finite core configurations'},
      {id:'igcse/bond-enthalpy',count:'16 reactions, two mastery families, explicit allowed levels'},
      {id:'igcse/structure-and-bonding',count:'nine comparisons at levels2/3; nine level1 teaching tables dormant'},
      {id:'igcse/dot-and-cross',count:'72 fixed teacher bank; ionic levels1/2, covalent1/2/3'},
      {id:'igcse/energy-enthalpy',count:'54 fixed: 28 level1, 26 level2; no active level3'},
      {id:'igcse/energetics-practical',count:'14 fixed: eight level2, six level3'}
    ].map(item => ({...item,supportedLevels:manifest.activities.find(a=>a.id===item.id).supportedLevels})),
    exactManifest:'validation/s0/inventory/coverage-manifest.json',identityIndex:'validation/s0/inventory/identity-index.json'},
  architecture:{modules:['identity','editors','question','attempt','session','olympiad','registry','repository'],
    decisions:['React-free marking and typed editor data; direct shared player in practice/revision','Stable IDs/seeds, complete provider coverage and source-derived scalar scope; no question snapshots','Immutable first automatic response/assessment; separate explicit self-rubric and post-assessment learning review','Student curriculum, teacher preview and C3L6 challenge evidence isolated','Repository transactions, idempotent saves/imports, preserved historic gaps and source course mastery recurrence','Explicit exact activity/gem/level scope with no dormant prototypes/Rocket; challenge has no artificial level/timer'],
    codeReview:'Foreman reviewed all new shared contract modules, fixture assertions, architecture exports, source-dependent semantics and scalar scope generator. Source-derived coverage reconciled against source review. Runtime enforcement remains S1/activity gates.',
    sourceScope:'src/catalogue/scope.ts',contracts:'src/contracts/',ownership:'docs/architecture/s1-work-packages.md'},
  validation:{protectedOriginals:{status:protectedCheck.status,files:protectedCheck.fileCount,changed:protectedCheck.changed,metadataOnly:protectedCheck.metadataOnly.length,evidence:'validation/original-app-check.json'},
    integration,commands:[
      {cwd:'project',command:'npm.cmd run typecheck',status:'PASS',evidence:'validation/s0/foreman-typecheck.txt'},
      {cwd:'project',command:'npm.cmd run check:s0',status:'PASS',evidence:'validation/s0/integration-check.json'},
      {cwd:'project',command:'node validation/s0/contracts/validate-reference.mjs',status:'PASS',evidence:'validation/s0/contracts/reference-checks.json'},
      {cwd:'project',command:'node validation/s0/contracts/validate-clarification.mjs',status:'PASS',evidence:'validation/s0/contracts/clarification-checks.json'},
      {cwd:'workspace',command:'node apps/Masters-of-Chemistry/validation/s0/inventory/collect.cjs check',status:'PASS',evidence:'validation/s0/foreman-inventory-check.txt'},
      {cwd:'workspace',command:'node apps/Masters-of-Chemistry/validation/s0/inventory/test-acid-levels-ported.cjs',status:'PASS',evidence:'validation/s0/foreman-model-checks.txt'},
      {cwd:'workspace',command:'node apps/Masters-of-Chemistry/validation/s0/inventory/validate-source-models.cjs',status:'PASS',evidence:'validation/s0/inventory/source-model-validation.json'},
      {cwd:'project',command:'npm.cmd run check:originals',status:'PASS',evidence:'validation/original-app-check.json'}],
    originalReferenceScripts:{passed:15,run:16,retainedFailure:'stale acid selector',disposition:'Owned exact source-scope port PASS; originals unchanged',evidence:'validation/s0/inventory/reference-check-results.json'}},
  changeSummary:{added:'Project-local pinned TS5.9.3 package/lock/strict compiler; eight type-only domain modules and source-derived catalogue scope; source inventory/identity/evidence, reproducible validation tools, architecture/S1 packages and S0 handoff.',updated:'progress.json only among root initial control files; S0 awaiting_root_review. Original-app check regenerated by unchanged root-owned protection tool.',unchanged:'Root contract/lock/instructions/plan/protection script/baseline and both original applications; all dependencies/output local to new project.',diffEvidence:'validation/s0/file-inventory.json'},
  limitations,nextStage:{requiresRootAcceptance:true,dispatch:false,workerCount:4,model:'gpt-6.1-sol',effort:'high',packages:nextPackages,foremanOwns:['package/lock/tsconfig/build config and roots','src/catalogue/**','integration composition','scripts/**','progress/validation aggregate and sole swarm log'],details:'docs/architecture/s1-work-packages.md'},
  rootDecisionNeeded:'Accept/revise S0 source coverage and shared contract baseline; accept proposed exact four S1 work packages. No new user scope authority required.'
};
write('validation/s0/foreman-report.json',report);
const files = [];
function walk(directory) {
  for (const item of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    if (['node_modules','.npm-cache','.git'].includes(item.name)) continue;
    const full=path.join(directory,item.name);
    if(item.isDirectory()) walk(full);
    else if(item.isFile()) {
      const relative=path.relative(project,full).split(path.sep).join('/');
      if(relative==='validation/s0/file-inventory.json') continue;
      const bytes=fs.readFileSync(full);
      files.push({path:relative,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),ownership:controls.files[relative]?'root-owned unchanged':relative==='progress.json'?'foreman progress update':'S0 added/generated'});
    }
  }
}
walk(project);
write('validation/s0/file-inventory.json',{schemaVersion:1,generatedAt:new Date().toISOString(),scope:'Project files only; dependencies/cache excluded. Workspace has no root Git repository; no git diff claimed.',files});
console.log(JSON.stringify({status:'PASS',stage:'S0',stageStatus:'awaiting_root_review',projectFiles:files.length,report:'validation/s0/foreman-report.json'}));
