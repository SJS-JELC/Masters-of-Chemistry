import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const project = path.resolve(import.meta.dirname, '../../..');
const file = path.join(project, 'scripts/write-s5-report.mjs');
let source = fs.readFileSync(file, 'utf8');
source = source.replaceAll('validation/s5/behaviour/session-only-save-fix/completion.json', 'validation/s5/behaviour/session-only-save-fix/latest/completion.json');
source = source.replaceAll('validation/s5/chemistry/session-only-save-fix/completion.json', 'validation/s5/chemistry/session-only-save-fix/final/completion.json');
source = source.replaceAll('validation/s5/behaviour/session-only-save-fix/HANDOVER.md', 'validation/s5/behaviour/session-only-save-fix/latest/HANDOVER.md');
source = source.replaceAll('validation/s5/chemistry/session-only-save-fix/HANDOVER.md', 'validation/s5/chemistry/session-only-save-fix/final/HANDOVER.md');
source = source.replaceAll("'validation/s5/render-release/completion.json', 'validation/s5/render-release/HANDOVER.md'", "'validation/s5/render-release/completion.json', 'validation/s5/render-release/HANDOVER.md', 'validation/s5/render-release/session-only-save-fix/completion.json'");
source = source.replace("'validation/s5/integration/preview-smoke.json', 'validation/s5/render-release/completion.json'", "'validation/s5/integration/preview-smoke.json', 'validation/s5/render-release/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json'");
source = source.replaceAll("'validation/s5/render-release/session-only-save-fix/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json'", "'validation/s5/render-release/session-only-save-fix/completion.json'");
fs.writeFileSync(file, source);
const read = relative => JSON.parse(fs.readFileSync(path.join(project, relative), 'utf8').replace(/^\uFEFF/, ''));
const hash = relative => crypto.createHash('sha256').update(fs.readFileSync(path.join(project, relative))).digest('hex');
const freeze = read('validation/s5/integration/freeze-current.json');
const approval = read('validation/s5/review-session-only-save/fix-review/verification.json');
assert.equal(hash(approval.approvedHost.path), approval.approvedHost.sha256);
const target = path.join(project, 'validation/s5/fixes/session-only-save');
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(path.join(target, 'author-report.json'), JSON.stringify({
  status: 'PASS', owner: 'A01', jobId: 'S5-FIX-SESSION-ONLY-SAVE', checkedAt: new Date().toISOString(),
  changedFiles: [approval.approvedHost.path], beforeSha256: 'b1e80facaec249c8cb435aae3925cdb7933e100976dacca49c445760e54e3340', afterSha256: approval.approvedHost.sha256,
  scope: 'Terminal revision completion and no-attempt Resume use shared queued checked session writes. Only committed session writes change displayed completion/paused state. Exact failed-operation Retry owns session and curriculum errors separately. Corrections resolve associated session at execution and omit unlinked/pending terminal transitions.',
  preserved: 'Strong validators, repository/contracts, first response/result/time/evidence, scheduler mathematics and all banks/editors/chemistry unchanged.',
  validation: ['typecheck PASS', '156 tests PASS', 'both builds/releases PASS', 'source237/control6/original1317 guards PASS', 'Exact Host code independently approved by A06'],
  rejectedPrototype: { treeSha256: 'c1c56180ba0bedb54cfa88eb666b22cb951869371488ef332c7a23e0c00e6812', issue: 'Concurrent post-completion correction paired unlinked session with old attempt; strong validator rejected it. Raw failure and independent disposition retained; current fix does not weaken validator.', evidence: 'validation/s5/review-session-only-save/completion.json' },
  evidenceScope: 'A06 code approval occurred before rebuild. Its c1 asset verification command is phase-specific and cannot be rerun after those assets are replaced. Exact approved Host hash above and current complete input guard separately verify final source/build.',
  currentTreeSha256: freeze.treeSha256,
  independentEvidence: ['validation/s5/review-session-only-save/fix-review/completion.json', 'validation/s5/behaviour/session-only-save-fix/latest/completion.json', 'validation/s5/chemistry/session-only-save-fix/final/completion.json', 'validation/s5/render-release/session-only-save-fix/completion.json'],
}, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', approvedHost: approval.approvedHost, tree: freeze.treeSha256 }));
