import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from '../../../../scripts/current-inputs.mjs';

const project = path.resolve(import.meta.dirname, '../../../..');
const workspace = path.resolve(project, '../..');
const here = import.meta.dirname;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (name, value) => fs.writeFileSync(path.join(here, name), JSON.stringify(value, null, 2) + '\n');
const json = name => JSON.parse(fs.readFileSync(path.join(project, name), 'utf8'));
function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const baseline = json('validation/original-app-baseline.json');
const found = baseline.roots.flatMap(root => walk(path.join(workspace, root))).map(file => path.relative(workspace, file).replaceAll('\\', '/'));
const changed = [], counts = {readable:0,metadataOnly:0,symlinks:0};
for (const key of new Set([...found, ...Object.keys(baseline.files)])) {
  const expected = baseline.files[key], full = path.join(workspace, key);
  if (!expected || !fs.existsSync(full)) { changed.push({path:key,reason:'file-set'}); continue; }
  if (expected.type === 'symlink') {
    counts.symlinks++;
    if (fs.readlinkSync(full) !== expected.target) changed.push({path:key,reason:'symlink'});
  } else if (expected.contentHashUnavailable) {
    counts.metadataOnly++;
    const stat = fs.statSync(full);
    if (stat.size !== expected.bytes || stat.mtimeMs !== expected.mtimeMs) changed.push({path:key,reason:'metadata'});
  } else {
    counts.readable++;
    if (fs.statSync(full).size !== expected.bytes || hash(full) !== expected.sha256) changed.push({path:key,reason:'bytes'});
  }
}
write('protected-originals.json', {status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),method:'Known offline placeholders metadata-only, never opened. Readable baseline files hashed, including Git and dependency state.',counts,changed});
assert.equal(changed.length, 0);
const current = currentInputs();
const accepted = json('validation/editor-restoration/implementation/foreman-report.json');
for (const file of accepted.currentInputHashes) assert.equal(hash(path.join(project, file.path)), file.sha256, 'Accepted current input: '+file.path);
for (const file of accepted.evidenceHashes) assert.equal(hash(path.join(project, file.path)), file.sha256, 'Accepted editor evidence: '+file.path);
write('accepted-current-inputs.json', {status:'PASS',capturedAt:new Date().toISOString(),meaning:'Pre-H1 current accepted editor source/build closure; historical stage closures remain historical after H1.',inputs:current});
const historical = ['s0','s1','s2','s3','s4','s5','landing-restoration','editor-restoration'].flatMap(stage => walk(path.join(project, 'validation', stage))).sort().map(file => ({path:path.relative(project,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:hash(file)}));
write('historical-evidence-fingerprints.json', {capturedAt:new Date().toISOString(),scope:'All historical S0-S5, landing and editor audit/implementation evidence; no historical writers rerun.',files:historical});
const inspected = ['src/foundation/ActivityHost.tsx','src/foundation/ProductionFoundation.tsx','src/foundation/OlympiadHost.tsx','src/shell/CourseShell.tsx','src/shell/navigation-view.ts','src/domain/timing/active-clock.ts','src/domain/timing/browser-binding.ts','src/domain/attempt/attempt.ts','src/domain/session/revision.ts','src/persistence/repository.ts','src/contracts/identity.ts','src/contracts/landing.ts','src/contracts/integration.ts','src/contracts/question.ts','src/contracts/olympiad.ts','src/contracts/registry.ts','src/ui/QuestionPlayer.tsx','src/ui/DotCrossPlayer.tsx','src/ui/TeacherPicker.tsx','src/ui/teacher-catalogue.ts','src/activities/alevel/acid-base-calculations/provider.ts','src/activities/alevel/acid-base-calculations/engine.js','src/activities/alevel/dot-and-cross/provider.ts','src/activities/igcse/dot-and-cross/provider.ts','src/catalogue/definitions.ts'];
write('source-inventory.json', {checkedAt:new Date().toISOString(),files:inspected.map(name=>({path:name,sha256:hash(path.join(project,name))})),acceptedEditorEvidenceVerified:accepted.evidenceHashes.length});
const ports=[];
for(const port of [5182,5183]) for(const page of ['alevel.html','alevel/alevel.html']) {
  try {const response=await fetch(`http://127.0.0.1:${port}/${page}`);const body=await response.text();ports.push({port,page,status:response.status,vite:body.includes('/@vite/client')});}
  catch(error) {ports.push({port,page,error:error.cause?.code||error.message});}
}
write('ports.json',{checkedAt:new Date().toISOString(),ports,disposition:'5183 source Vite responds. 5182 paths return404; verify prefix/path before reuse, do not stop others.'});
console.log(JSON.stringify({status:'PASS',protectedOriginals:counts,currentInputs:current.length,historicalEvidenceFiles:historical.length,inspectedSources:inspected.length,ports}));
