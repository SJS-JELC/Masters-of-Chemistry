import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {validateRelease} from '../../../scripts/validate-s4-release.mjs';
const here=import.meta.dirname, project=path.resolve(here,'../../..');
const read=p=>fs.readFileSync(path.resolve(project,p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const w02=JSON.parse(read('validation/olympiad-2011-q4/recovery-w02/task-files.json'));
const baseline=JSON.parse(read('validation/olympiad-2011-q4/root-baseline/source-hashes.json'));
const files=Object.fromEntries(Object.entries(w02.files).map(([p,v])=>{
 const sha256=hash(read(p));if(!p.startsWith('release/'))assert.equal(sha256,v.sha256,'Current source changed after W02: '+p);
 if(v.beforeSha256){assert.equal(v.beforeSha256,baseline[p]);assert.equal(hash(read('validation/olympiad-2011-q4/root-baseline/files/'+p)),v.beforeSha256,'Immutable baseline mismatch '+p);}
 return[p,{sha256,beforeSha256:v.beforeSha256,w02Sha256:v.sha256,unchangedFromW02:sha256===v.sha256}];
}));
const source=read('../../development/shared/nmr/olympiad-2011-q4/olympiad-2011-q4-compound-3.svg');
const runtime=read('src/activities/olympiad/isomers2011/assets/compound-3.svg');
assert.equal(hash(source),'07d75b648f1117fadaa701ecb875e68331f2dc4a8a451cea1f9591a257ea1d7d');
const strip=s=>s.toString('utf8').replace(/<metadata\b[\s\S]*?<\/metadata>/g,'').replace(/<title\b[^>]*>[\s\S]*?<\/title>/g,'').replace(/<desc\b[^>]*>[\s\S]*?<\/desc>/g,'');
assert.equal(strip(source),strip(runtime));
const generated=strip(source).replace(/(<svg\b[^>]*>)/,'$1<title id="spectrum-title">Compound 3 proton NMR spectrum</title><desc id="spectrum-description">Proton NMR spectrum with signal labels, relative integrals, chemical shifts in ppm and expanded multiplets.</desc>');
assert.equal(runtime.toString('utf8'),generated);
const fixtures=['native-correct.json','native-historical-wrong-k.json','legacy-v3-historical-wrong-k.json','native-revalidated.json'].map(p=>{
 const current=fs.readFileSync(path.join(here,p));assert.deepEqual(current,read('validation/olympiad-2011-q4/recovery-w02/'+p));return{path:p,sha256:hash(current),independentlyRegeneratedByteMatchesRecovery:true};
});
const report={status:'PASS',checkedAt:new Date().toISOString(),files,sourceSha256:hash(source),runtimeSha256:hash(runtime),strippedDrawingByteIdentical:true,exactNeutralGeneratorReproduction:true,release:['alevel','igcse'].map(validateRelease),fixtures,limitations:['Does not establish pre-W02 immutability of the four original W01 fixtures.','Shared diffs include unrelated component-fidelity changes; review is limited to the Olympiad addition.']};
fs.writeFileSync(path.join(here,'fingerprint-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,files:Object.keys(files).length,releases:report.release.map(r=>r.status),drawingIdentical:true,fixtures:fixtures.length}));
