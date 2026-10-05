import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {currentInputs} from '../../../scripts/current-inputs.mjs';

const project = path.resolve(import.meta.dirname, '../../..');
const workspace = path.resolve(project, '../..');
const here = import.meta.dirname;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(here, name), JSON.stringify(value, null, 2) + '\n');
const baseline = JSON.parse(fs.readFileSync(path.join(project, 'validation/original-app-baseline.json'), 'utf8'));
const found = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else found.push(path.relative(workspace, full).replaceAll('\\', '/'));
  }
}
for (const root of baseline.roots) walk(path.join(workspace, root));
const changed = [];
const readable = [];
const metadataOnly = [];
for (const key of new Set([...found, ...Object.keys(baseline.files)])) {
  const expected = baseline.files[key];
  const full = path.join(workspace, key);
  if (!expected || !fs.existsSync(full)) { changed.push({path:key,reason:'file-set changed'}); continue; }
  if (expected.type === 'symlink') {
    if (fs.readlinkSync(full) !== expected.target) changed.push({path:key,reason:'symlink changed'});
  } else if (expected.contentHashUnavailable) {
    // Do not open known offline files. Metadata-only historical limits stay explicit.
    const stat = fs.statSync(full);
    metadataOnly.push({path:key,bytes:stat.size,mtimeMs:stat.mtimeMs,contentHashUnavailable:true});
    if (stat.size !== expected.bytes || stat.mtimeMs !== expected.mtimeMs) changed.push({path:key,reason:'metadata changed'});
  } else {
    const item = {path:key,bytes:fs.statSync(full).size,sha256:hash(full)};
    readable.push(item);
    if (item.bytes !== expected.bytes || item.sha256 !== expected.sha256) changed.push({path:key,reason:'bytes changed'});
  }
}
write('protected-originals.json', {status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),method:'Historical readable files hashed; known offline placeholders checked only by metadata and never opened.',changed,readable,metadataOnly});
assert.equal(changed.length, 0, 'Protected original changed');
const inputs = currentInputs();
write('accepted-current-inputs.json', {capturedAt:new Date().toISOString(),status:'PASS',meaning:'Current accepted landing source/build closure before E1; preserved independently of historical stage fingerprints.',inputs});
const landing = JSON.parse(fs.readFileSync(path.join(project,'validation/landing-restoration/foreman-report.json'),'utf8'));
for (const item of landing.currentInputHashes) assert.equal(hash(path.join(project,item.path)),item.sha256,'Current landing closure mismatch: '+item.path);
for (const item of landing.evidenceHashes) assert.equal(hash(path.join(project,item.path)),item.sha256,'Historical landing evidence mismatch: '+item.path);
write('historical-landing-freeze.json', {status:'PASS',checkedAt:new Date().toISOString(),inputs:landing.currentInputHashes.length,evidence:landing.evidenceHashes.length,meaning:'Read-only pre-E1 acceptance snapshot; future editor changes require new evidence, historical landing report stays unchanged.'});
console.log(JSON.stringify({status:'PASS',readableOriginalFiles:readable.length,metadataOnlyOriginalFiles:metadataOnly.length,currentInputs:inputs.length}));
