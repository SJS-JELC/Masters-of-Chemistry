import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'../../../..'),base=path.join(project,'validation/component-fidelity/f2/electron/resume-f09/context-final/inputs');
const files=['src/ui/SourceQuestionPlayer.tsx','src/ui/source-adapters.css','src/ui/source-presentation.ts','src/ui/SourceResponseControl.tsx','src/ui/NumericWorkingControl.tsx'];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let patch='';const rows=[];
for(const file of files){const original=path.join(base,file),current=path.join(project,file);rows.push({path:file,captureSha256:fs.existsSync(original)?hash(original):null,currentSha256:hash(current)});if(fs.existsSync(original)){const r=spawnSync('git',['diff','--no-index','--',original,current],{encoding:'utf8'});if(r.status>1)throw Error(r.stderr);patch+=r.stdout;}}
fs.writeFileSync(new URL('./late-shared-specialist.patch',import.meta.url),patch);fs.writeFileSync(new URL('./late-shared-specialist-hashes.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),files:rows},null,2)+'\n');
