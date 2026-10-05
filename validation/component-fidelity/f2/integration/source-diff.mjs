import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'../../../..'),baseline=JSON.parse(fs.readFileSync(new URL('../baseline.json',import.meta.url),'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const owner=file=>file==='src/ui/teacher-catalogue.ts'?'external-or-unassigned':file.startsWith('src/ui/')?'F03':file.startsWith('src/editors/electron-configuration/')?'F04':file.startsWith('src/editors/energy-profile/')||file==='src/chemistry/energy-profile/svg.ts'?'F05':file.startsWith('src/editors/titration-curve/')?'F06':['src/contracts/question.ts','src/persistence/validation.ts','src/activities/igcse/energy-enthalpy/provider.ts'].includes(file)?'F01':'external-or-unassigned';
const rows=[],patches={};
for(const full of walk(path.join(project,'src'))) {
 const file=path.relative(project,full).replaceAll('\\','/'),before=baseline.snapshots.find(row=>row.path===file),bytes=fs.readFileSync(full),sha256=hash(bytes);
 if(before?.sha256===sha256)continue;
 const assigned=owner(file),result=spawnSync('git',['diff','--no-index','--',before?path.join(project,before.snapshot):'NUL',full],{encoding:'utf8',maxBuffer:20_000_000});
 if(result.status!==0&&result.status!==1)throw Error(result.stderr);
 rows.push({path:file,owner:assigned,bytes:bytes.length,sha256,beforeSha256:before?.sha256??null,snapshot:before?.snapshot??null,hasConcurrentExternalHunk:file==='src/persistence/validation.ts'});
 patches[assigned]=(patches[assigned]??'')+result.stdout+'\n';
}
for(const before of baseline.snapshots)if(!fs.existsSync(path.join(project,before.path)))throw Error('Frozen source removed: '+before.path);
for(const [assigned,patch]of Object.entries(patches))fs.writeFileSync(new URL(`./${assigned}-before-current.patch`,import.meta.url),patch);
fs.writeFileSync(new URL('./source-changes.json',import.meta.url),JSON.stringify({capturedAt:new Date().toISOString(),files:rows,externalAcceptance:false,notes:['validation.ts contains additive numeric hunk plus separately verified untouched external Isomer changes.','external-or-unassigned paths reflect concurrent inputs and are not accepted by component stage.']},null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.keys(patches).map(assigned=>[assigned,rows.filter(row=>row.owner===assigned).length]))));
