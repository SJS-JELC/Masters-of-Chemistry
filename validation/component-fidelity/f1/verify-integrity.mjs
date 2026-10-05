import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from '../../../scripts/current-inputs.mjs';
const here = import.meta.dirname, project = path.resolve(here, '../../..'), workspace = path.resolve(project, '../..');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json = file => JSON.parse(fs.readFileSync(path.join(project,file),'utf8').replace(/^\uFEFF/,''));
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const baseline = json('validation/original-app-baseline.json');
const found = baseline.roots.flatMap(root=>walk(path.join(workspace,root))).map(file=>path.relative(workspace,file).replaceAll('\\','/')).sort();
assert.deepEqual(found,Object.keys(baseline.files).sort(),'Original file set changed');
let readable=0,metadataOnly=0;
for(const [relative,old] of Object.entries(baseline.files)) {
 const full=path.join(workspace,relative);
 if(old.contentHashUnavailable){metadataOnly++; const stat=fs.statSync(full);assert.equal(stat.size,old.bytes,relative);assert.equal(stat.mtimeMs,old.mtimeMs,relative);}
 else {readable++;assert.equal(hash(full),old.sha256,relative);}
}
const historical=json('validation/component-fidelity/f1/prior-evidence-freeze.json').files;
for(const item of historical) assert.equal(hash(path.join(project,item.path)),item.sha256,'Historical evidence changed '+item.path);
const prior=json('validation/component-fidelity/f1/baseline.json').inputs;
const current=currentInputs();
const changes=current.filter(item=>prior.find(old=>old.path===item.path)?.sha256!==item.sha256);
const removed=prior.filter(item=>!current.some(now=>now.path===item.path));
const report={status:'PASS',checkedAt:new Date().toISOString(),originals:{readable,metadataOnly,placeholderContentReads:0},priorEvidenceUnchanged:historical.length,changes,removed,currentInputHashes:current};
fs.writeFileSync(path.join(here,'integrity.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,changes:changes.map(x=>x.path),currentInputHashes:current.length}));
