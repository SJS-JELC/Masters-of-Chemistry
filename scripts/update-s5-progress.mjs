import fs from 'node:fs';
import path from 'node:path';
const project = path.resolve(import.meta.dirname, '..');
const file = path.join(project, 'progress.json');
const progress = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const rows = [
  ['A08', 'S5-FIX-ACID-FORMAT', 'worker_complete', 'validation/s5/fixes/acid-format/completion.json'],
  ['A12', 'S5-FIX-ELECTRONS-WORDING', 'worker_complete', 'validation/s5/fixes/electrons-wording/completion.json'],
  ['A17', 'S5-FIX-STARTUP-ERROR', 'worker_complete', 'validation/s5/fixes/startup-error/completion.json'],
  ['A14', 'S5-FIX-TITRATION-TYPING', 'worker_complete', 'validation/s5/fixes/titration-typing/completion.json'],
  ['A13', 'S5-FIX-ENERGY-TYPING', 'running', 'validation/s5/fixes/energy-typing/completion.json'],
  ['A15', 'S5-FIX-DOT-CHARGE-TYPING', 'running', 'validation/s5/fixes/dot-charge-typing/completion.json'],
  ['A16', 'S5-FIX-C3-K-ERRATUM', 'running', 'validation/s5/fixes/c3-k-erratum/completion.json'],
  ['A06', 'S5-REVIEW-BEHAVIOUR-HARNESS', 'validated', 'validation/s5/review-behaviour-harness/completion.json'],
  ['A06', 'S5-REVIEW-BEHAVIOUR-HARNESS-HISTORICAL-FOLLOWUP', 'validated', 'validation/s5/review-behaviour-harness/historical-followup/completion.json'],
];
for (const [agentId, jobId, status, evidence] of rows) {
  const prior = progress.jobs.find(row => row.jobId === jobId);
  const row = { agentId, jobId, status, requestedModel: 'gpt-6.1-sol', requestedEffort: 'high', effectiveModelEffort: null, usage: null, evidence };
  if (prior) Object.assign(prior, row); else progress.jobs.push(row);
}
progress.unresolved = progress.unresolved.filter(row => row.id !== 'S5-GATE');
progress.nextAction = 'Complete independent verification of final current builds and bounded fixes, then hand S5 to root for acceptance. No deployment.';
progress.updatedAt = new Date().toISOString();
fs.writeFileSync(file, JSON.stringify(progress, null, 2) + '\n');
