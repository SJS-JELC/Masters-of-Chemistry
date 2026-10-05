import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'..'),files=[];
function find(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory()){if(!item.name.startsWith('.')&&!['browser-profile','browser-profiles','p','p-edge','p-ordinary'].includes(item.name))find(file);}else if(/\.test\.(?:mjs|js|ts)$/.test(item.name))files.push(file);}}
for(const stage of ['s1','s2','s3','s4'])find(path.join(project,'validation',stage));
// Original S2 scope assertion remains retained unchanged. Its content/20-target
// fixture is ported here; the new full12/41 scope is asserted independently.
const originalS2Scope=path.join(project,'validation/s2/integration/complete-coverage.test.ts');
const selected=files.filter(file=>file!==originalS2Scope).sort();
if(!selected.some(file=>file.endsWith('s2-content-regression.test.ts')))throw Error('Missing retained S2 content regression');
// S1 source goldens resolve workspace-relative paths; later source suites use
// project-relative paths. Keep each documented fixture working directory.
const groups=[
  {files:selected.filter(file=>file.startsWith(path.join(project,'validation/s1/'))),cwd:path.resolve(project,'../..')},
  {files:selected.filter(file=>!file.startsWith(path.join(project,'validation/s1/'))),cwd:project},
];
for(const group of groups){
  if(!group.files.length)continue;
  const result=spawnSync(process.execPath,['--test',...group.files],{cwd:group.cwd,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exitCode=result.status??1;
}
