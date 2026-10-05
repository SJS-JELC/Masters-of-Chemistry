import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateRelease } from '../../../scripts/validate-s4-release.mjs';
import { currentInputs } from '../../../scripts/current-inputs.mjs';
import assert from 'node:assert/strict';
const app=path.resolve(import.meta.dirname,'../../..'),report={status:'RUNNING',startedAt:new Date().toISOString(),checks:[]};
const sourceClosure=()=>currentInputs().filter(row=>!row.path.startsWith('dist/')&&!row.path.startsWith('release/'));
report.sourceInputsBefore=sourceClosure();
for(const [name,args] of [['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],['build',['scripts/build.mjs']],['alevel-release',['scripts/release-s4.mjs','alevel']],['igcse-release',['scripts/release-s4.mjs','igcse']]]){
 const result=spawnSync(process.execPath,args,{cwd:app,encoding:'utf8'});
 fs.writeFileSync(path.join(import.meta.dirname,name+'.txt'),(result.stdout??'')+(result.stderr??''));
 report.checks.push({name,status:result.status===0?'PASS':'FAIL',exitCode:result.status});
 if(result.status!==0){report.status='FAIL';break;}
}
if(report.status!=='FAIL'){
 try {report.sourceInputsAfter=sourceClosure();assert.deepEqual(report.sourceInputsAfter,report.sourceInputsBefore,'Source changed during integration build');report.releases=['alevel','igcse'].map(validateRelease); report.status='PASS';}
 catch(error){report.status='FAIL';report.error=error.stack;}
}
report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(import.meta.dirname,'build-and-release.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,sourceInputsBefore:report.sourceInputsBefore.length,sourceInputsAfter:report.sourceInputsAfter?.length}));if(report.status!=='PASS')process.exitCode=1;
