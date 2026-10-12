import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const app=path.resolve(import.meta.dirname,'..');
const evidence=path.join(app,'.artifacts/formulae-equations-followup');
// Historical snapshots are disposable. This report writer requires a fresh,
// explicitly captured scoped baseline/before tree for the run being reviewed.
if(!fs.existsSync(path.join(evidence,'s0/shared-file-baseline.json')))
 throw Error('Capture a fresh scoped baseline and before tree under .artifacts/formulae-equations-followup/s0 before generating a diff. Historical run snapshots were cleaned.');
const baseline=JSON.parse(fs.readFileSync(path.join(evidence,'s0/shared-file-baseline.json'),'utf8'));
const additional=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):[];
const output=path.join(evidence,'s2');fs.mkdirSync(output,{recursive:true});
const after=path.join(output,'after');const before=path.join(evidence,'s0/before');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const records=[];
for(const relative of [...new Set([...baseline.files.map(x=>x.path),...additional])]){
 if(typeof relative!=='string'||path.isAbsolute(relative)||relative.split(/[\\/]/).includes('..'))throw Error('Unsafe scoped path');
 const file=path.join(app,relative),old=baseline.files.find(x=>x.path===relative);
 if(!fs.existsSync(file)){records.push({path:relative,status:'deleted',before:old?.sha256});continue;}
 const bytes=fs.readFileSync(file),digest=hash(bytes),copy=path.join(after,relative);fs.mkdirSync(path.dirname(copy),{recursive:true});fs.writeFileSync(copy,bytes);
 records.push({path:relative,status:old?(digest===old.sha256?'unchanged':'modified'):'added',before:old?.sha256,after:digest,bytes:bytes.length});
}
const diff=spawnSync('git',['-c','core.autocrlf=false','diff','--no-index','--',before,after],{encoding:'utf8',maxBuffer:8*1024*1024});
if(diff.status!==0&&diff.status!==1)throw Error(diff.stderr||'Diff failed');
fs.writeFileSync(path.join(output,'source-diff.patch'),diff.stdout);
const report={recordedAt:new Date().toISOString(),baselineCount:baseline.files.length,changed:records.filter(x=>x.status!=='unchanged'),records,diff:'source-diff.patch',scope:'Exact scoped master source/review before-to-after diff; runtime build outputs separately inventoried.'};
fs.writeFileSync(path.join(output,'source-diff.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({changed:report.changed.map(x=>({path:x.path,status:x.status})),baselineCount:baseline.files.length}));
