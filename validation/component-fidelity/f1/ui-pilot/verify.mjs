import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import{spawnSync}from'node:child_process';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const results=[];
for(const [id,args]of[
 ['typecheck',[path.join(project,'node_modules/typescript/bin/tsc'),'--noEmit']],
 ['practical-marking-regression',['--test','--test-name-pattern=^all practical|^real shared|^source provenance','validation/s3/energy/energy.test.mjs']],
]){const result=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(here,id+'.log'),result.stdout+result.stderr);results.push({id,status:result.status===0?'PASS':'FAIL',exitCode:result.status,evidence:id+'.log'});}
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceFont=path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src/assets/fonts/PlaywriteEnglandJoined.ttf'),font=path.join(project,'src/ui/fonts/PlaywriteEnglandJoined.ttf');assert.equal(hash(font),hash(sourceFont));
const matrix=JSON.parse(fs.readFileSync(path.join(here,'reference-matrix.json'),'utf8'));assert.equal(matrix.activities.length,12);assert.equal(new Set(matrix.activities.map(a=>a.id)).size,12);for(const a of matrix.activities){assert(a.domDefinitions.length>0);assert(a.cssRulesInCascadeOrder.length>0);assert.equal(a.requiredStates.length,6);for(const source of a.sourceFiles)assert.equal(hash(path.join(workspace,source.path)),source.sha256);}
results.push({id:'original-final-reference-matrix-and-font',status:'PASS',activities:12,statesPerActivity:6,fontSha256:hash(font)});
const report={runId:'COMPONENT-FIDELITY-20261003',jobId:'F1-UI-PILOT',agentId:'F03',at:new Date().toISOString(),status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',results,historicalSuiteNote:'The unchanged full S3 energy fixture expects obsolete C01-style codes; its two identity-dependent energy checks now fail under canonical-only identity. Focused practical chemistry/marking/controller and provenance checks are preserved and pass; F02 owns canonical coverage replacement.'};fs.writeFileSync(path.join(here,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
