import fs from 'node:fs';
const file = 'scripts/write-s5-report.mjs';
let source = fs.readFileSync(file, 'utf8');
source = source.replace('chunks,-byte initial', 'chunks,${shellBytes}-byte initial');
source = source.replace('reliable real-keystroke numeric/editor setup.', 'reliable real-keystroke numeric/editor setup; trusted Next after blur-save with duplicate and failure guards.');
for (const [before, after] of [
  ['all15 requirements', 'all 15 requirements'],
  ['All12 activities,41 genuine curriculum targets and6227', 'All 12 activities, 41 genuine curriculum targets and 6,227'],
  ['Original1317 records unchanged:794 byte hashes and523', 'Original 1,317 records unchanged: 794 byte hashes and 523'],
  ['Both releases:129 runtime files,59', 'Both releases: 129 runtime files, 59'],
  ['Current517-input tree', 'Current 517-input tree'],
  ['lists15 scoped authored changes and222', 'lists 15 scoped authored changes and 222'],
  ['59 lazy chunks,${shellBytes}', '59 lazy chunks, ${shellBytes}'],
  ['raw23/current22 and separately preserved historical outcomes', '23 source alternatives, 22 current alternatives and separately preserved historical outcomes'],
  ['[Behaviour/timing/restore/import](validation/s5/behaviour/HANDOVER.md)', '[Behaviour/timing/restore/import](validation/s5/behaviour/HANDOVER.md) and [current Next/save verification](validation/s5/behaviour/next-save-fix/HANDOVER.md)'],
  ['[Complete chemistry/source/render sample](validation/s5/chemistry/HANDOVER.md)', '[Complete chemistry/source/render sample](validation/s5/chemistry/HANDOVER.md) and [current source continuity](validation/s5/chemistry/next-save-fix/HANDOVER.md)'],
]) source = source.replaceAll(before, after);
fs.writeFileSync(file, source);
const fileProgress = 'progress.json';
const progress = JSON.parse(fs.readFileSync(fileProgress, 'utf8').replace(/^\uFEFF/, ''));
if (!progress.jobs.some(job => job.jobId === 'S5-FIX-NEXT-SAVE')) {
  progress.jobs.push({ jobId: 'S5-FIX-NEXT-SAVE', owner: 'A01', status: 'awaiting_independent_verification', evidence: ['validation/s5/fixes/next-save-transition/author-report.json', 'validation/s5/review-render-harness/energy-next-classification/completion.json'] });
}
fs.writeFileSync(fileProgress, JSON.stringify(progress, null, 2) + '\n');
