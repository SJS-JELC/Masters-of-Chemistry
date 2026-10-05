import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from '../../../../scripts/current-inputs.mjs';

const here=import.meta.dirname,project=path.resolve(here,'../../../..');
const base='validation/question-chrome/implementation/';
const read=p=>JSON.parse(fs.readFileSync(path.join(project,p),'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(project,p))).digest('hex');
const write=(p,value)=>fs.writeFileSync(path.join(project,p),JSON.stringify(value,null,2)+'\n');
const integration=p=>read(base+'integration/'+p);
const presentation=read(base+'presentation/verification.json');
const worker=read(base+'presentation/handover.json');
const reviewer=integration('exception-review/disposition.json');
const reviewVerification=integration('exception-review/verification.json');
const source=integration('browser-results.json'),production=integration('production-browser-results.json');
const timing=integration('timing-browser-results.json'),build=integration('build-results.json');
const retained=integration('retained-tests.json'),ownership=integration('source-ownership.json');
const historical=integration('historical-evidence-check.json'),originals=integration('protected-originals.json');
const closure=integration('current-inputs.json'),release=integration('release-check.json');
const hierarchy=integration('root-hierarchy-correction/browser-results.json');
const checkedAt=new Date().toISOString();

for(const report of [presentation,worker,reviewer,reviewVerification,source,production,build,retained,ownership,historical,originals,closure,release])assert.equal(report.status,'PASS');
for(const [report,count] of [[presentation,16],[source,15],[production,9]]){
  assert.equal(report.checks.length,count);assert(report.checks.every(row=>row.status==='PASS'));
  assert.equal(report.failures.length,0);assert.equal(report.pageErrors.length,0);
}
assert.equal(timing.status,'PASS_WITH_NATIVE_CAPABILITY_LIMIT');
assert.equal(timing.failures.length,0);assert.equal(timing.pageErrors.length,0);
assert.deepEqual(timing.sourceBefore,timing.sourceAfter);
for(const row of timing.sourceAfter)assert.equal(hash(row.path),row.sha256);
for(const row of worker.changedFiles)if(row.path!=='src/styles/platform.css')assert.equal(hash(row.path),row.sha256);
assert.equal(hierarchy.status,'PASS');assert.deepEqual(hierarchy.sourceChanges,['src/styles/platform.css']);
assert.equal(hierarchy.checks.length,6);assert.equal(hierarchy.failures.length,0);assert.equal(hierarchy.pageErrors.length,0);
assert.equal(hierarchy.currentCssSha256,hash('src/styles/platform.css'));assert.equal(hierarchy.currentHostSha256,hash('src/foundation/ActivityHost.tsx'));
assert(hierarchy.urls.every(row=>row.status===200));
for(const row of reviewVerification.currentSources)assert.equal(hash(row.path),row.sha256);
for(const row of reviewVerification.retainedEvidence)assert.equal(hash(row.path),row.sha256);
assert.equal(reviewer.currentHostSha256,hash('src/foundation/ActivityHost.tsx'));
assert.equal(reviewer.wholeHostNativeEquivalenceClaimed,false);
assert(Object.values(reviewer.nativeBoundaries).every(value=>value==='UNESTABLISHED'));
assert(reviewer.productDefects.every(row=>row.status.startsWith('CLOSED')));
assert.equal(reviewVerification.popstateRegression.length,3);
assert.equal(historical.files,23709);assert.equal(originals.changed.length,0);
assert.deepEqual(originals.counts,{readable:794,metadataOnly:523,symlinks:0});
assert.equal(ownership.ownedRuntimeFiles.length,12);
assert(ownership.landingEditorsChemistryDomainPersistenceStatisticsContractsBanksExact);
assert.deepEqual(currentInputs(),closure.inputs,'Current source/build closure changed');
assert.equal(closure.inputs.length,570);
assert(build.checks.every(row=>row.status==='PASS'));
assert.deepEqual(build.releases.map(row=>row.initialJavascriptGzipBytes),[168116,168115]);
assert(build.releases.every(row=>row.initialJavascriptGzipBytes<204800));

function countTests(file){const log=fs.readFileSync(path.join(here,file),'utf8');const count=log.match(/tests (\d+)/),passed=log.match(/pass (\d+)/),failed=log.match(/fail (\d+)/);assert(count&&passed&&failed);assert.equal(count[1],passed[1]);assert.equal(failed[1],'0');return Number(count[1]);}
const retainedTests=countTests('shared-source-fixtures.log')+countTests('activity-landing-regressions.log');
assert.equal(retainedTests,188);assert.equal(countTests('lifecycle.log'),5);
const idle=timing.checks.map(row=>{
  assert.equal(row.status,'PASS');assert.equal(row.plateauDeltaMs,0);assert(row.noTrustedInputsAfterStart);
  assert.equal(row.idle.activeMs,row.later.activeMs);assert(row.restarted.activeMs>row.later.activeMs);
  assert.equal(row.before.documentToken,row.later.documentToken);assert.equal(row.before.timeOrigin,row.later.timeOrigin);
  assert.equal(row.before.attemptId,row.later.attemptId);assert(row.realWallSinceLastInputMs>row.before.idleLimitMs);
  return {id:row.id,idleLimitMs:row.before.idleLimitMs,activeMs:row.idle.activeMs,plateauDeltaMs:row.plateauDeltaMs,trustedInputRestart:true};
});
assert.deepEqual(idle.map(row=>row.idleLimitMs),[60000,180000]);

const activeTime={status:'PASS_WITH_NATIVE_CAPABILITY_LIMIT',checkedAt,meaning:'Fresh final Host idle/restore/first-assessment/statistics proof plus unchanged authoritative timing; historical native limits preserved without whole-Host equivalence.',sourceHashes:timing.sourceAfter,realCurrentIdle:idle,currentSourceBrowserChecks:source.checks.length,currentProductionBrowserChecks:production.checks.length,currentIndependentPopstateChecks:reviewVerification.popstateRegression,nativeBoundaries:reviewer.nativeBoundaries,wholeHostNativeEquivalenceClaimed:false,evidence:['timing-browser-results.json','browser-results.json','production-browser-results.json','exception-review/verification.json'],historicalEvidence:'validation/editor-restoration/implementation/integration/exception-review/disposition.json'};
write(base+'integration/active-time-review.json',activeTime);
const visualReview={status:'PASS',checkedAt,reviewer:'H01',method:'Actual retained images opened with view_image; source and production actual content/layout inspected, beyond automated overflow.',finalRegeneratedCaptures:hierarchy.checks.map(row=>'root-hierarchy-correction/'+row.screen),priorInspectedCaptures:['production-igcse-numeric-mobile.png','production-igcse-rubric-desktop.png','production-alevel-titration-teacher-mobile.png','production-alevel-olympiad-mobile.png','c3-teacher-stage-b.png'],findings:['Small mint uppercase brand eyebrow above main Comfortaa course/subtopic heading:11px/24px desktop,10px/21px mobile; exact text/order, eagle/pink ID/arrow/divider preserved.','Desktop numeric scaffolding, table, multipart responses, first-assessment feedback and Next preserved.','Mobile masthead wraps within pane; preserved drawing geometry/palette/controls and meaningful scientific prompt.','Rubric scientific heading/instructions and teacher curve/working remain; C3 functional-group diagrams and stages retain context.'],physicalDeviceOrScreenReaderClaimed:false};
write(base+'integration/visual-review.json',visualReview);

const evidenceFiles=['presentation/completion.json','presentation/handover.json','presentation/verification.json','integration/HANDOVER.md','integration/retained-tests.json','integration/shared-source-fixtures.log','integration/activity-landing-regressions.log','integration/lifecycle.log','integration/build-results.json','integration/browser-results.json','integration/production-browser-results.json','integration/timing-browser-results.json','integration/active-time-review.json','integration/visual-review.json','integration/exception-review/completion.json','integration/exception-review/disposition.json','integration/exception-review/source-review.md','integration/exception-review/verification.json','integration/source-ownership.json','integration/protected-originals.json','integration/historical-evidence-check.json','integration/release-check.json','integration/current-inputs.json','integration/closure.mjs','integration/final-report.mjs','integration/hierarchy-browser.mjs','integration/root-hierarchy-correction/browser-results.json','integration/root-hierarchy-correction/initial-launch-limitation.json'].map(p=>({path:base+p,sha256:hash(base+p)}));
const report={schemaVersion:1,runId:'QUESTION-CHROME-20261003',stableId:'H1-QUESTION-CHROME',stage:'H1',agentId:'H01',status:'PASS_WITH_EXPLICIT_NATIVE_LIMITS',completedAt:checkedAt,rootAcceptance:'PENDING',authority:'validation/question-chrome/audit/root-acceptance.json',implementation:{runtimeFiles:ownership.ownedRuntimeFiles,currentHostSha256:hash('src/foundation/ActivityHost.tsx'),headingIdentity:'Exact selected gem/provider identity; existing C3 display identity; no invented IDs.',continuation:'Durable exact-attempt automatic continuation; synchronous departure intent; Retry readiness from committed session; fresh/changed-selection isolation.',timing:'Display-only interval/state removed; authoritative timing/attempt/persistence bytes exact.',scope:'Shared question chrome only; specialist content/editor, domain, chemistry, landing, banks/providers exact.'},rootHierarchyCorrection:{status:'VALIDATED',owner:'H01',scope:'CSS only:brand eyebrow and main course/subtopic hierarchy',priorEvidence:'validation/question-chrome/implementation/integration/before-root-hierarchy-correction/',sourceChanges:hierarchy.sourceChanges,browserCases:6,reviewUrls:hierarchy.urls.map(row=>row.url),longIdleRerun:false,reason:'Host/domain/timing raw identity exact;root instructed no long idle rerun for CSS-only correction.'},acceptedJobs:[{stableId:'H1-PRESENTATION',agentId:'H02',status:'ACCEPTED',evidence:base+'presentation/handover.json',deterministicChecks:'Eight worker runtime hashes current;worker CSS superseded by root-authorised CSS-only hierarchy correction;16 retained browser checks,71 immutable runtime plus5 original references,title/heading fixtures;6 fresh hierarchy renders and9 fresh production checks supplement.'},{stableId:'H1-INTEGRATION',agentId:'H01',status:'VALIDATED',evidence:base+'integration/HANDOVER.md'},{stableId:'H1-TIMING-EXCEPTION',agentId:'H03',status:'ACCEPTED_BOUNDED_DISPOSITION',evidence:base+'integration/exception-review/disposition.json',deterministicChecks:'Current source/evidence hashes; final Host idle raw identity;3 independently passing actual popstate/Retry cases; native UNESTABLISHED retained.'}],verification:{retainedTests,focusedTests:5,workerSourceBrowserCases:16,finalSourceBrowserCases:15,finalProductionBrowserCases:9,independentExceptionBrowserCases:3,currentHierarchyBrowserCases:6,sourceBrowserLineage:'15 prior passing checks carried for byte-exact Host;current CSS-only change separately verified',realCurrentIdle:idle,sourceAndBrowserFailures:0,pageErrors:0,typecheck:'PASS',builds:build.releases,currentInputFiles:closure.inputs.length,changedInputEntries:ownership.changes.length,historicalEvidenceFilesExact:historical.files,protectedOriginals:originals.counts,immutableProductionBoundariesExact:true,actualRenderReview:base+'integration/visual-review.json'},closedDefects:reviewer.productDefects,retainedFailures:['integration/initial-browser-failure/','integration/initial-production-fixture-failure/','integration/pre-popstate-fix/','integration/exception-review/popstate-results.json','presentation/verification-unsupported-fixtures.json','integration/root-hierarchy-correction/initial-launch-limitation.json'],limitations:{nativeBoundaries:reviewer.nativeBoundaries,wholeHostNativeEquivalenceClaimed:false,physicalDeviceScreenReader:'Not tested',originalOfflineFiles:'523 metadata-only; not opened or hydrated',gitDiff:'Workspace root not a Git repository; explicit source ownership and hashes used',effectiveModelsEfforts:null,usage:null},unresolvedProductDefects:[],publication:false,evidenceFiles};
write(base+'foreman-report.json',report);
const completion={stableId:report.stableId,agentId:'H01',status:report.status,outputPath:base+'foreman-report.json',confidence:0.96,reason:'All current gates pass; native background/freeze/suspension limitations remain explicit for root acceptance.',validation:{status:'PASS',currentInputFiles:570,retainedTests,focusedTests:5,finalSourceBrowserCases:15,finalProductionBrowserCases:9,independentExceptionCases:3,currentHierarchyBrowserCases:6,evidence:base+'integration/current-inputs.json'},usage:null};
write(base+'completion.json',completion);
console.log(JSON.stringify(completion));
