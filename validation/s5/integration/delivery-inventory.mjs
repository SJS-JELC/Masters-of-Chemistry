import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project = path.resolve(import.meta.dirname, '../../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const roots = ['src', 'public', 'scripts', 'docs', 'development/authoring'];
const flat = ['README.md', 'HANDOFF.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'alevel.html', 'igcse.html', '.prettierrc.json'];
function walk(relative) {
  return fs.readdirSync(path.join(project, relative), { withFileTypes: true }).flatMap(entry => {
    const file = `${relative}/${entry.name}`;
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = [...roots.flatMap(walk), ...flat].filter(file => fs.existsSync(path.join(project, file))).sort().map(file => {
  const bytes = fs.readFileSync(path.join(project, file));
  return { path: file, bytes: bytes.length, sha256: hash(bytes) };
});
const report = {
  status: 'PASS', checkedAt: new Date().toISOString(),
  scope: 'Current complete authored/content/assets/docs/config delivery inventory; runtime build/release closure is separately frozen. This is not a claim of a baseline diff for documentation lacking a retained initial hash.',
  sourceDiff: 'validation/s5/integration/source-ownership.json',
  currentBuildClosure: 'validation/s5/integration/freeze-current.json',
  declaredForemanDeliveryChanges: ['README.md', 'docs/architecture/platform.md', 'package.json', 'scripts/preview.mjs', 'scripts/test_revision_registration.mjs', 'scripts/test_active_question_time.mjs', 'scripts/review_active_question_time.mjs', 'scripts/test-s5.mjs', 'scripts/current-inputs.mjs', 'scripts/check-release.mjs', 'scripts/verify-s5.mjs', 'scripts/write-s5-report.mjs'],
  excludedGeneratedDirectories: ['node_modules', '.npm-cache', 'validation', 'dist', 'release'],
  dependencyVersionsChanged: false,
  files, treeSha256: hash(JSON.stringify(files)),
};
fs.writeFileSync(path.join(import.meta.dirname, 'delivery-inventory.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, files: files.length, treeSha256: report.treeSha256 }));
