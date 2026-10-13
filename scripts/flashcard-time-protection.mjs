import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const app = path.resolve(import.meta.dirname, '..');
const workspace = path.resolve(app, '../..');
const out = path.join(app, '.artifacts/flashcard-time');
const baselinePath = path.join(out, 'protected-before.json');
const roots = ['apps/Masters-of-A-Level-Chemistry', 'apps/Masters-of-IGCSE-Chemistry'];
const protectedFiles = [
  'src/content/canonical-identity.ts', 'src/persistence/validation.ts',
  'src/recall/RecallResponseControls.tsx', 'src/recall/recall-test.css',
  'src/styles/platform.css', 'src/styles/graphene-lattice.svg',
];
const hashes = {};
function read(file, key) {
  hashes[key] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile()) read(file, path.relative(workspace, file));
  }
}
for (const root of roots) walk(path.join(workspace, root));
for (const file of protectedFiles) read(path.join(app, file), 'combined/' + file);
for (const folder of ['src/activities/alevel/rate-equations', 'src/activities/olympiad/maxwells-demon']) {
  walk(path.join(app, folder));
}
fs.mkdirSync(out, { recursive: true });
if (process.argv[2] === 'capture') {
  if (fs.existsSync(baselinePath)) throw Error('Refusing to replace protection baseline');
  fs.writeFileSync(baselinePath, JSON.stringify({ at: new Date().toISOString(), hashes }, null, 2));
  console.log(JSON.stringify({ status: 'CAPTURED', count: Object.keys(hashes).length }));
} else {
  const before = JSON.parse(fs.readFileSync(baselinePath, 'utf8')).hashes;
  const changed = [...new Set([...Object.keys(before), ...Object.keys(hashes)])].filter(key => before[key] !== hashes[key]);
  const result = { status: changed.length ? 'FAIL' : 'PASS', at: new Date().toISOString(), count: Object.keys(hashes).length, changed };
  fs.writeFileSync(path.join(out, 'protected-after.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  if (changed.length) process.exitCode = 1;
}
