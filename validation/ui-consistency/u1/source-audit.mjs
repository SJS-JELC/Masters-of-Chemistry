import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const app = path.resolve(import.meta.dirname, '../../..'), before = path.join(import.meta.dirname, 'before');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const walk = directory => fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry => entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const relative = file => path.relative(app,file).replaceAll('\\','/');
const current = walk(path.join(app,'src')), previous = walk(path.join(before,'src'));
const prior = new Map(previous.map(file => [path.relative(before,file).replaceAll('\\','/'),file]));
const rows = current.map(file => {const p=relative(file),bytes=fs.readFileSync(file),old=prior.get(p); return {path:p,bytes:bytes.length,sha256:hash(bytes),beforeSha256:old?hash(fs.readFileSync(old)):null};});
const changed = rows.filter(row=>row.sha256!==row.beforeSha256), removed = [...prior.keys()].filter(p=>!rows.some(r=>r.path===p));
assert.deepEqual(removed,[]);
const central = ['src/contracts/attempt.ts','src/domain/attempt/attempt.ts','src/persistence/validation.ts','src/foundation/ActivityHost.tsx'];
function allowed(p) { return central.includes(p)||p.endsWith('.css')||p.startsWith('src/ui/')||p==='src/landing/OriginalLanding.tsx'||p==='src/landing/GemPaths.tsx'||p==='src/landing/OlympiadLanding.tsx'||p==='src/landing/olympiad-completion.ts'||p==='src/foundation/OlympiadHost.tsx'||p==='src/editors/electron-configuration/index.tsx'||/^src\/activities\/olympiad\/[^/]+\/(?:view|View)\.tsx$/.test(p); }
for (const row of changed) assert(allowed(row.path),`Unexpected changed source: ${row.path}`);
let patch='';
for (const row of changed) {
  const old=prior.get(row.path),file=path.join(app,row.path);
  if(old) {
    const result=spawnSync('git',['diff','--no-index','--no-ext-diff','--',old,file],{encoding:'utf8'});
    assert([0,1].includes(result.status),result.stderr);patch+=result.stdout+'\n';
  } else patch+=`--- /dev/null\n+++ ${row.path}\n`+fs.readFileSync(file,'utf8').split('\n').map(line=>'+'+line).join('\n')+'\n';
}
fs.writeFileSync(path.join(import.meta.dirname,'source-changes.patch'),patch);
const report={status:'PASS',checkedAt:new Date().toISOString(),sourceFiles:rows.length,unchanged:rows.length-changed.length,changed,removed,sourceHashes:rows,scope:'UI presentation + four centralized action/persistence files only. Providers/marking/policies/content/identity/timing retain exact before bytes. Shared original GemPaths extracted unchanged.'};
fs.writeFileSync(path.join(import.meta.dirname,'source-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,sourceFiles:rows.length,unchanged:report.unchanged,changed:changed.map(r=>r.path)}));
