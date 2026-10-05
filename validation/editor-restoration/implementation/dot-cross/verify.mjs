import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const runtime=['src/editors/dot-and-cross/DotCrossEditor.tsx','src/editors/dot-and-cross/Diagram.tsx','src/editors/dot-and-cross/editor.css','src/chemistry/dot-and-cross/engine.ts','src/chemistry/dot-and-cross/layout.js','src/chemistry/dot-and-cross/layout.d.ts','src/chemistry/dot-and-cross/interaction.ts','src/chemistry/dot-and-cross/model.ts'];
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const gates=[];
for(const [name,args]of [['unit',['--test',path.join(here,'editor.test.mjs')]],['typecheck',[path.join(project,'node_modules/typescript/bin/tsc'),'--noEmit']],['format',[path.join(project,'node_modules/prettier/bin/prettier.cjs'),'--check',...runtime.map(p=>path.join(project,p))]]]){
 const start=new Date().toISOString(),r=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'}),log=path.join(here,name+'.log');fs.writeFileSync(log,(r.stdout||'')+(r.stderr||'')+(r.error?String(r.error):''));gates.push({name,command:[process.execPath,...args],startedAt:start,finishedAt:new Date().toISOString(),exitCode:r.status,status:r.status===0?'PASS':'FAIL',log:path.relative(project,log).replaceAll('\\','/')});
}
const audit=JSON.parse(fs.readFileSync(path.join(project,'validation/editor-restoration/audit/dot-cross/source-fingerprints.json'),'utf8'));
const originals=audit.files.filter(f=>/apps\/Masters-of-(?:A-Level|IGCSE)-Chemistry\//.test(f.path)).map(f=>({path:f.path,auditSha256:f.sha256,currentSha256:sha(path.join(workspace,f.path))}));
const fingerprints={checkedAt:new Date().toISOString(),originalsUnchanged:originals.every(f=>f.auditSha256===f.currentSha256),originals,runtime:runtime.map(p=>({path:p,bytes:fs.statSync(path.join(project,p)).size,sha256:sha(path.join(project,p))}))};
fs.writeFileSync(path.join(here,'source-fingerprints.json'),JSON.stringify(fingerprints,null,2)+'\n');
const report={agentId:'E02',jobId:'DOT-CROSS-RESTORE',checkedAt:new Date().toISOString(),status:gates.every(g=>g.status==='PASS')&&fingerprints.originalsUnchanged?'PASS':'FAIL',gates,originalFilesChecked:originals.length,originalsUnchanged:fingerprints.originalsUnchanged};fs.writeFileSync(path.join(here,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
