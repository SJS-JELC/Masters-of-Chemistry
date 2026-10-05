import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { currentInputs } from './current-inputs.mjs';
const project = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(project, file), 'utf8').replace(/^\uFEFF/, '');
const json = file => JSON.parse(read(file));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const continuity = json('validation/s5/behaviour/timing-continuity.json');
assert.equal(continuity.status, 'PASS');
for (const match of continuity.matches) {
  assert(match.semanticEqual, `Timing semantics changed: ${match.path}`);
  assert.equal(hash(read(match.path)), match.currentSha256, `Timing source stale: ${match.path}`);
}
for (const item of continuity.evidence) assert.equal(hash(read(item.path)), item.sha256, `Retained native evidence changed: ${item.path}`);
assert.deepEqual(continuity.realIdle.map(item => item.limitMs).sort((a, b) => a - b), [60000, 180000, 300000, 600000]);
assert(continuity.realIdle.every(item => item.native));
const addition = json('project-contract.json').activities.some(activity=>activity.id==='alevel/explaining-properties');
const current = json(addition?'validation/explaining-properties/current-inputs.json':'validation/s5/integration/freeze-current.json');
assert.deepEqual(currentInputs(), addition?current.files:current.currentInputHashes, 'Current source/build freeze changed');
const currentNextEvidence = 'validation/s5/behaviour/session-only-save-fix/latest/completion.json';
const next = json(currentNextEvidence);
assert.equal(next.status, 'PASS', 'Current rebuilt Host Next/first-time evidence is incomplete');
const reports = ['deep-browser-results.json', 'revision-browser-results.json', 'recovery-browser-results.json'];
for (const file of reports) {
  const browser = json(`validation/s5/behaviour/${file}`);
  assert(browser.checks.length > 0 && browser.checks.every(check => check.status === 'PASS'), `Actual browser checks incomplete: ${file}`);
  assert.equal(browser.failures?.length ?? 0, 0, `Browser failures: ${file}`);
  assert.equal(browser.pageErrors?.length ?? 0, 0, `Runtime errors: ${file}`);
}
const report = {
  status: 'PASS', checkedAt: new Date().toISOString(),
  scope: 'Review retained native clock/binding continuity and current actual production restore/first-assessment/statistics evidence. This command does not rerun native wall-clock intervals.',
  hashMethod: 'Native reports and timing source use UTF8 text with optional BOM removed, matching the independent continuity verifier.',
  idleAllowances: continuity.realIdle, currentFreezeTree: current.treeSha256,
  retainedProductionBrowserEvidence: reports.map(file => `validation/s5/behaviour/${file}`),
  currentNextEvidence,
  continuityScope: 'Detailed restore/statistics suites are retained from prior static freezes. Only shared Host Next/save/status routing changed; fresh current-build Next and session-only/concurrency checks supplement unchanged engine/repository semantics. Native wall-clock intervals are carried explicitly.',
  preservedLimits: continuity.preservedLimits,
};
if(addition){
  const browser=json('validation/explaining-properties/browser-results.json'),idle=json('validation/explaining-properties/timing-browser-results.json'),tail=json('validation/explaining-properties/timing-tail-results.json'),background=json('validation/explaining-properties/background-probe.json');
  assert.equal(browser.status,'PASS');assert(idle.checks.some(check=>check.id==='actual-180000ms-idle'&&check.status==='PASS'));
  assert.equal(tail.failures.length,0);assert(tail.checks.some(check=>check.id==='reload-first-freeze-statistics-transfer'&&check.status==='PASS'));assert(tail.checks.some(check=>check.id==='actual-event-loop-suspension-gap'&&check.status==='PASS'));
  report.status=background.status==='ESTABLISHED'&&tail.checks.some(check=>check.id==='actual-native-suspension'&&check.status==='PASS')?'PASS':'PARTIAL';
  report.scope='Current explaining-properties integration: valid real180s idle, actual first evidence/reload/Next/statistics checks and actual8s event-loop suspension gap. Shared native engine continuity remains separately retained; this does not relabel unobserved native background/page-freeze as passing.';
  report.currentAdditionEvidence=['browser-results.json','timing-browser-results.json','timing-tail-results.json','background-probe.json'].map(file=>'validation/explaining-properties/'+file);
  report.currentNativeCapability={background:background.status,pageLifecycle:tail.checks.find(check=>/native-suspension/.test(check.id))};
  const fixNative='validation/explaining-properties/fix-cycle-01/native-timing.json';
  if(fs.existsSync(path.join(project,fixNative))){const probe=json(fixNative);report.currentNativeCapability.authorFixProbe={status:probe.status,evidence:fixNative,failure:probe.failure?.message,ownedNativeForegroundAction:probe.ownedNativeForegroundAction,checks:probe.checks};}
}
fs.writeFileSync(path.join(project, addition?'validation/explaining-properties/active-time-review.json':'validation/s5/integration/active-time-review.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
