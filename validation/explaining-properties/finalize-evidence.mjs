import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'../..'),here=import.meta.dirname,sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
// The README amendment was appended without altering the first7,789 baseline bytes.
// Capture those exact bytes before the final current-scope edit; retain this method.
const readme=path.join(project,'README.md'),bytes=fs.readFileSync(readme),marker=bytes.indexOf(Buffer.from('# Explaining Properties addition'));
const readmeBaseline=path.join(here,'baseline/README.md');
if(!fs.existsSync(readmeBaseline)){
 if(marker!==7789)throw Error('Unexpected README baseline boundary; do not guess.');
 const original=bytes.subarray(0,marker),addition=bytes.subarray(marker).toString('utf8');fs.writeFileSync(readme,original);fs.copyFileSync(readme,readmeBaseline);
 fs.writeFileSync(readme,original.toString('utf8').replace('It contains all 12 approved activities and 41 curriculum revision targets.','It contains all 14 approved activities and 43 curriculum revision targets.')+addition.replace('# Explaining Properties addition','## Explaining Properties addition'));
}
function files(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const targets=[...['src','scripts','docs','release'].flatMap(root=>files(path.join(project,root))),readme].sort();
const changes=targets.flatMap(file=>{const relative=path.relative(project,file).replaceAll('\\','/'),before=path.join(here,'baseline',relative),afterSha256=sha(file),beforeSha256=fs.existsSync(before)?sha(before):null;if(beforeSha256===afterSha256)return [];return [{path:relative,status:beforeSha256?'changed':'added',beforeSha256,afterSha256,beforeSnapshot:beforeSha256?'validation/explaining-properties/baseline/'+relative:null,bytes:fs.statSync(file).size}];});
const manifest={jobId:'EBP-IMPLEMENT',agentId:'A01-EBP',capturedAt:new Date().toISOString(),changes,baselineNote:'Source/scripts/docs/release copied before edits. README exact pre-amendment bytes restored/captured from its unchanged7,789-byte prefix before the final current-count edit. Dist is regenerated output, fingerprinted in current-inputs/runtime manifests.',unchangedSharedTiming:['src/domain/timing/active-clock.ts','src/domain/timing/browser-binding.ts','src/domain/attempt/attempt.ts','src/persistence/repository.ts','src/domain/session/revision.ts'].map(relative=>({path:relative,sha256:sha(path.join(project,relative)),beforeSha256:sha(path.join(here,'baseline',relative))}))};
if(manifest.unchangedSharedTiming.some(item=>item.sha256!==item.beforeSha256))throw Error('Unexpected timing/attempt/repository/scheduler edit.');
fs.writeFileSync(path.join(here,'changed-files.json'),JSON.stringify(manifest,null,2)+'\n');
// Retain a complete text delta document alongside exact before snapshots.
const deltas=changes.filter(change=>/\.(?:ts|tsx|mjs|css|md|json)$/.test(change.path)&&!change.path.startsWith('release/')).map(change=>({path:change.path,before:change.beforeSnapshot?fs.readFileSync(path.join(project,change.beforeSnapshot),'utf8'):null,after:fs.readFileSync(path.join(project,change.path),'utf8')}));
fs.writeFileSync(path.join(here,'review-deltas.json'),JSON.stringify(deltas,null,2)+'\n');console.log(JSON.stringify({changedFiles:changes.length,hashes:'validation/explaining-properties/changed-files.json',unchangedTiming:true}));
