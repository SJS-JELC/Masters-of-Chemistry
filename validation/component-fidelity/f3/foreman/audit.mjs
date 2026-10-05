import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { currentInputs } from '../../../../scripts/current-inputs.mjs';
const project=path.resolve(import.meta.dirname,'../../../..'),workspace=path.resolve(project,'../..');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const json=file=>JSON.parse(fs.readFileSync(path.join(project,file),'utf8').replace(/^\uFEFF/,''));
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const baseline=json('validation/original-app-baseline.json');
const names=baseline.roots.flatMap(root=>walk(path.join(workspace,root))).map(file=>path.relative(workspace,file).replaceAll('\\','/')).sort();
assert.deepEqual(names,Object.keys(baseline.files).sort());
let readable=0,metadataOnly=0;
for(const [name,old]of Object.entries(baseline.files)){
 const full=path.join(workspace,name);
 if(old.contentHashUnavailable){metadataOnly++;const st=fs.statSync(full);assert.equal(st.size,old.bytes,name);assert.equal(st.mtimeMs,old.mtimeMs,name);}
 else{readable++;assert.equal(hash(full),old.sha256,name);}
}
const mismatch=(rows)=>rows.flatMap(row=>{const actual=hash(path.join(project,row.path));return actual===row.sha256?[]:[{path:row.path,expected:row.sha256,actual}];});
const history=json('validation/component-fidelity/f1/prior-evidence-freeze.json').files;
const historyChanges=mismatch(history),allowed='validation/original-app-check.json';
assert.deepEqual(historyChanges.filter(row=>row.path!==allowed),[]);
const oldSummary=json(allowed);
assert.equal(oldSummary.status,'PASS');assert.equal(oldSummary.fileCount,1317);assert.deepEqual(oldSummary.changed,[]);
assert.deepEqual([...oldSummary.metadataOnly].sort(),Object.entries(baseline.files).filter(([,row])=>row.contentHashUnavailable).map(([name])=>name).sort());
const f1=json('validation/component-fidelity/f2/baseline.json').priorEvidence;
const f1Changes=mismatch(f1);assert.deepEqual(f1Changes,[]);
const priorReportPath=path.join(import.meta.dirname,'external-original-summary-before.json');
if(!fs.existsSync(priorReportPath))fs.copyFileSync(path.join(project,allowed),priorReportPath);
const report={status:'PASS',checkedAt:new Date().toISOString(),originals:{readable,metadataOnly,placeholderContentReads:0},historicalEvidence:{checked:history.length,unchanged:history.length-historyChanges.length,changes:historyChanges,disposition:'Original-app-check summary regenerated externally during authorized concurrent OLY work. Its PASS/fileCount/changed/metadataOnly semantics independently match protected baseline; checkedAt is mutable. Preserve current summary bytes, do not fabricate unchanged history.'},priorF1Evidence:{checked:f1.length,changes:f1Changes},currentInputs:currentInputs()};
fs.writeFileSync(path.join(import.meta.dirname,process.argv[2]??'audit-before.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,currentInputs:report.currentInputs.length}));
