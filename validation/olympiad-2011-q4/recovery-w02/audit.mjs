import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {validateRelease} from '../../../scripts/validate-s4-release.mjs';
const project=path.resolve(import.meta.dirname,'../../..'),here=import.meta.dirname;
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=file=>fs.readFileSync(path.resolve(project,file));
const write=(file,value)=>fs.writeFileSync(path.join(here,file),JSON.stringify(value,null,2)+'\n');
write('release-checks.json',['alevel','igcse'].map(validateRelease));
const sourceFile='../../development/shared/nmr/olympiad-2011-q4/olympiad-2011-q4-compound-3.svg';
const runtimeFile='src/activities/olympiad/isomers2011/assets/compound-3.svg';
const source=read(sourceFile),runtime=read(runtimeFile);
const strip=text=>text.replace(/<metadata\b[\s\S]*?<\/metadata>/g,'').replace(/<title\b[^>]*>[\s\S]*?<\/title>/g,'').replace(/<desc\b[^>]*>[\s\S]*?<\/desc>/g,'');
assert.equal(sha(source),'07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d');
assert.equal(strip(source.toString('utf8')),strip(runtime.toString('utf8')));
const generated=strip(source.toString('utf8')).replace(/(<svg\b[^>]*>)/,'$1<title id="spectrum-title">Compound 3 proton NMR spectrum</title><desc id="spectrum-description">Proton NMR spectrum with signal labels, relative integrals, chemical shifts in ppm and expanded multiplets.</desc>');
assert.equal(runtime.toString('utf8'),generated);
write('spectrum-validation.json',{status:'PASS',checkedAt:new Date().toISOString(),sourceSha256:sha(source),runtimeSha256:sha(runtime),geometryContentSha256:sha(strip(runtime.toString('utf8'))),drawingContentByteIdentical:true,generatorOutputExact:true,xmlAndAccessibleIdCheck:'browser-results.json: spectrum-keyboard-zoom-neutral-metadata'});
const baseline=JSON.parse(read('validation/olympiad-2011-q4/root-baseline/source-hashes.json'));
const task=[
  'src/catalogue/definitions.ts','src/catalogue/registry.ts','src/catalogue/scope.ts','src/catalogue/olympiad-2011-definition.ts',
  'src/contracts/identity.ts','src/contracts/olympiad.ts','src/contracts/registry.ts','src/contracts/repository.ts',
  'src/foundation/ActivityHost.tsx','src/foundation/OlympiadHost.tsx','src/foundation/ProductionFoundation.tsx','src/foundation/registry.ts',
  'src/persistence/repository.ts','src/persistence/validation.ts','src/shell/navigation-view.ts','src/compatibility/LegacyImportView.tsx','src/ui/teacher-catalogue.ts',
  'scripts/prepare-olympiad-2011.mjs','scripts/prepare-olympiad-regression.mjs','scripts/test-olympiad-2011.mjs','scripts/tests/olympiad-2011.test.ts','scripts/tests/c3-regression.test.ts',
  'scripts/protect-originals.mjs','scripts/release-s4.mjs','scripts/test_revision_registration.mjs','scripts/validate-s4-release.mjs','scripts/write-catalogue-definitions.mjs',
  'release/alevel.runtime.json','release/igcse.runtime.json',
];
const walk=folder=>fs.readdirSync(path.resolve(project,folder),{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(folder+'/'+entry.name):[folder+'/'+entry.name]);
task.push(...walk('src/activities/olympiad/isomers2011'));
const currentTask=Object.fromEntries(task.sort().map(file=>[file,{sha256:sha(read(file)),beforeSha256:baseline[file]||null,status:baseline[file]?'modified-existing':'new',scope:'Task-related current state; some shared files also contain unrelated concurrent edits'}]));
write('task-files.json',{capturedAt:new Date().toISOString(),files:currentTask,w02Edits:['scripts/prepare-olympiad-2011.mjs',runtimeFile,'scripts/prepare-olympiad-regression.mjs','scripts/tests/c3-regression.test.ts'],note:'W02 changes only neutral description markup and configurable evidence paths; W01 implemented the task. Root baseline remains authoritative. Shared diffs include concurrent component work and do not imply its acceptance.'});
const differences=Object.keys(baseline).filter(file=>!fs.existsSync(path.resolve(project,file))||sha(read(file))!==baseline[file]).map(file=>({path:file,beforeSha256:baseline[file],currentSha256:fs.existsSync(path.resolve(project,file))?sha(read(file)):null,taskRelated:task.includes(file)}));
write('baseline-comparison.json',{capturedAt:new Date().toISOString(),differences,taskRelatedNewFiles:task.filter(file=>!Object.hasOwn(baseline,file))});
let diff='Current task-related files compared with immutable root-baseline. Shared file diffs may include concurrent component work.\n';
for(const file of task) {
  const before=path.resolve(project,'validation/olympiad-2011-q4/root-baseline/files',file);
  if(fs.existsSync(before)&&sha(fs.readFileSync(before))!==sha(read(file))) {
    const result=spawnSync('git',['diff','--no-index','--no-ext-diff','--',before,path.resolve(project,file)],{encoding:'utf8',windowsHide:true,maxBuffer:10*1024*1024});
    assert([0,1].includes(result.status),result.stderr);diff+=result.stdout;
  }
}
fs.writeFileSync(path.join(here,'task-baseline.diff'),diff);
const fixtures=['native-correct.json','native-historical-wrong-k.json','legacy-v3-historical-wrong-k.json','native-revalidated.json'];
write('fixture-reconciliation.json',{status:'PASS',note:'W02 first rerun rewrote deterministic W01 fixtures before discovering their output path. No prior pre-rerun hashes available; do not claim pre-rerun immutability. Separately regenerated recovery fixtures compare byte-identically to current W01 fixtures.',files:fixtures.map(file=>{const old=read('validation/olympiad-2011-q4/implementation/'+file),now=fs.readFileSync(path.join(here,file));assert.deepEqual(now,old);return {path:file,sha256:sha(now),currentImplementationByteEqual:true};})});
console.log(JSON.stringify({status:'PASS',taskFileCount:task.length,baselineDifferenceCount:differences.length,spectrumSha256:sha(runtime)}));
