import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import prettier from 'prettier';
import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'../../../..');
const config=JSON.parse(fs.readFileSync(path.join(project,'.prettierrc.json'),'utf8'));
const formatReport=JSON.parse(fs.readFileSync(path.join(project,'validation/s4/refinement/formatting/write-report.json'),'utf8'));
const activity=['C3L6View.tsx','content.ts','legacy.ts','policy.ts','source-bank.ts'].map(f=>'src/activities/olympiad/c3l6/'+f);
const shared=['src/contracts/olympiad.ts','src/persistence/validation.ts'];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
// Reconstitute the exact accepted S4 formatted shared baseline from its immutable
// retained pre-format source, checking it against the accepted after fingerprint.
for(const file of shared){
 const retained=fs.readFileSync(path.join(project,'validation/s4/refinement/formatting/before',file+'.txt'),'utf8');
 const before=await prettier.format(retained,{...config,filepath:file});
 const entry=formatReport.changedFiles?.find(e=>e.path===file) ?? Object.values(formatReport).find(v=>Array.isArray(v)&&v.some(e=>e.path===file))?.find(e=>e.path===file);
 if(!entry||hash(before)!==entry.afterSha256)throw Error('Shared baseline does not reproduce accepted S4 fingerprint: '+file);
 fs.writeFileSync(path.join(import.meta.dirname,'before',path.basename(file)),before);
}
const files=[...activity,...shared],report=[];
for(const file of files){
 const current=fs.readFileSync(path.join(project,file),'utf8');
 const formatted=await prettier.format(current,{...config,filepath:file});
 fs.writeFileSync(path.join(project,file),formatted);
 const beforeFile=path.join(import.meta.dirname,'before',path.basename(file));
 const before=fs.readFileSync(beforeFile);
 const diff=spawnSync('git',['diff','--no-index','--',beforeFile,path.join(project,file)],{encoding:'utf8'});
 if(diff.error||![0,1].includes(diff.status))throw diff.error||Error(diff.stderr);
 fs.writeFileSync(path.join(import.meta.dirname,path.basename(file)+'.diff'),diff.stdout);
 report.push({file,beforeSha256:hash(before),afterSha256:hash(formatted),prettierCheck:await prettier.check(formatted,{...config,filepath:file})});
}
fs.writeFileSync(path.join(import.meta.dirname,'authored-diff-fingerprints.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
