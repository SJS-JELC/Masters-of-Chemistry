import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const here=import.meta.dirname;
const cleanup={checkedAt:new Date().toISOString(),ports:[]};
for(const port of [5187,5204]) {
  let active=false;
  try {await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(2000)});active=true;}catch {}
  cleanup.ports.push({port,responding:active});assert.equal(active,false,'W02 server still responds');
}
fs.writeFileSync(path.join(here,'process-cleanup.json'),JSON.stringify(cleanup,null,2)+'\n');
const task=JSON.parse(fs.readFileSync(path.join(here,'task-files.json'),'utf8'));
const completion={
  job_id:'OLY2011-IMPLEMENT',agent_id:'W02',replaces:'W01',status:'PASS',
  output_path:'apps/Masters-of-Chemistry/validation/olympiad-2011-q4/recovery-w02/HANDOFF.md',
  confidence:0.96,reason:'Recovered implementation passes applicable chemistry, current tests, actual browser/render, build, release and protection gates; ready for independent R01 review and root acceptance.',
  completed_at:new Date().toISOString(),
  validation:{typecheck:'PASS',current_tests:'55/55 PASS',permutations:5040,seeded_mixtures:1500,dev_browser_groups:'10/10 PASS',async_navigation:'PASS',production_smoke_groups:'3/3 PASS',builds:'alevel + igcse PASS',release:'Both PASS, exact 13 registrations',protected_originals:'PASS, zero changes',spectrum:'Approved source hash unchanged; stripped drawing byte-identical; valid neutral XML/accessibility IDs',process_cleanup:'Own preview/Vite ports no longer responding; browsers closed by finally'},
  validation_refs:['typecheck-final.txt','unit-tests-final.txt','browser-results.json','async-navigation.json','production-smoke.json','build.txt','release-checks.json','protected-originals-final.json','spectrum-validation.json','fixture-reconciliation.json','process-cleanup.json'].map(file=>'apps/Masters-of-Chemistry/validation/olympiad-2011-q4/recovery-w02/'+file),
  changed_hashes_ref:'apps/Masters-of-Chemistry/validation/olympiad-2011-q4/recovery-w02/task-files.json',
  diff_ref:'apps/Masters-of-Chemistry/validation/olympiad-2011-q4/recovery-w02/task-baseline.diff',
  w02_changed_files:task.w02Edits,
  limitations:['Independent review/root acceptance pending; no publication.','Headless installed Edge actual UI, emulated touch; no physical-device or screen-reader session.','Four deterministic W01 C3 fixtures were inadvertently rewritten by initial current-test rerun; no prior fixture hashes available, current recovery outputs byte-match them. Future reruns support explicit evidence directory.','Raw cold-load, harness synchronization and smoke-selector failures retained; final applicable checks PASS. Historical broad fixture failures remain failed, not relabelled.','Shared task-file baseline diffs include unrelated concurrent component changes; W02 does not accept that work.','523 original cloud placeholders retain historical metadata-only evidence.'],
  actual_token_usage:null,
};
fs.writeFileSync(path.join(here,'completion.json'),JSON.stringify(completion,null,2)+'\n');
console.log(JSON.stringify({job_id:completion.job_id,agent_id:completion.agent_id,status:completion.status,output_path:completion.output_path,confidence:completion.confidence,changed_hashes_ref:completion.changed_hashes_ref,validation:'55 tests; 10 dev browser + async + 3 production groups; both builds/releases; protection/spectrum PASS'}));
