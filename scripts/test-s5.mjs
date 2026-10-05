import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const project = path.resolve(import.meta.dirname, '..');
const files = [];
function find(directory) {
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()) {
      if(!entry.name.startsWith('.')&&!/profile|cache|temp/i.test(entry.name)&&!['p','p-edge','p-ordinary'].includes(entry.name)) find(file);
    } else if(/\.test\.(?:mjs|js|ts)$/.test(entry.name)) files.push(file);
  }
}
for(const stage of ['s1','s2','s3','s4','s5']) find(path.join(project,'scripts/tests/legacy',stage));
// Preserve historical evidence. Complete content/marking fixtures are ported,
// with the exact authorised scope and three qualified-prompt expectations.
const historical = new Set([
  path.join(project,'scripts/tests/legacy/s2/integration/complete-coverage.test.ts'),
  path.join(project,'scripts/tests/legacy/s3/electrons/electrons.test.mjs'),
  path.join(project,'scripts/tests/legacy/s3/c3l6/c3l6.test.ts'),
]);
const selected=files.filter(file=>!historical.has(file)).sort();
for(const required of ['s2-content-regression.test.ts','electrons-source-regression.test.mjs','c3-current-source-regression.test.ts']) assert(selected.some(file=>file.endsWith(required)),`Missing full retained regression port: ${required}`);
selected.push(path.join(project,'scripts/test_revision_registration.mjs'),path.join(project,'scripts/test_active_question_time.mjs'));
const groups=[
  {cwd:path.resolve(project,'../..'),files:selected.filter(file=>file.startsWith(path.join(project,'scripts/tests/legacy/s1/')))},
  {cwd:project,files:selected.filter(file=>!file.startsWith(path.join(project,'scripts/tests/legacy/s1/')))},
];
for(const group of groups) {
  if(!group.files.length)continue;
  const result=spawnSync(process.execPath,['--test',...group.files],{cwd:group.cwd,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exitCode=result.status??1;
}
