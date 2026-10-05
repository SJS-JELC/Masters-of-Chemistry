/** Current executable guards. Historical report aggregation retired. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'..'),directory=path.join(project,'.artifacts/checks/landing');
fs.mkdirSync(directory,{recursive:true});
const jobs=[['originals',['scripts/protect-originals.mjs','check','--output','.artifacts/checks/landing/original-app-check.json']],['source-controls',['scripts/validate-s0.mjs']]];
const results=jobs.map(([id,args])=>{const run=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(directory,id+'.log'),(run.stdout||'')+'\n'+(run.stderr||''));return{id,status:run.status===0?'PASS':'FAIL',exitCode:run.status,evidence:'.artifacts/checks/landing/'+id+'.log'};});
const report={status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',checkedAt:new Date().toISOString(),results};fs.writeFileSync(path.join(directory,'legacy-gates.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
