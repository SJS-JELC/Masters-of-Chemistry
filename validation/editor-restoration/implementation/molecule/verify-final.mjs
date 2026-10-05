import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const here=import.meta.dirname,app='apps/Masters-of-Chemistry',root=process.cwd();
const runtime=[
 'src/editors/molecule/MoleculeEditor.tsx','src/editors/molecule/MoleculeInspector.tsx',
 'src/editors/molecule/Structure.tsx','src/editors/molecule/molecule.css',
 'src/chemistry/molecule/engine.ts','src/chemistry/molecule/layout.ts',
 'src/chemistry/molecule/interaction.ts','src/chemistry/molecule/depiction.ts',
 'src/activities/olympiad/c3l6/C3L6View.tsx','src/activities/olympiad/c3l6/c3l6.css',
].map(p=>`${app}/${p}`);
const fingerprint=async p=>{const b=await fs.readFile(path.join(root,p));return {path:p,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};};
const baseline=JSON.parse(await fs.readFile(path.join(here,'../../audit/molecule/source-fingerprints.json'),'utf8'));
const protectedFiles=baseline.files.filter(f=>f.path.startsWith('apps/Masters-of-A-Level-Chemistry/')||f.path.startsWith(`${app}/src/activities/olympiad/c3l6/`)&&!runtime.includes(f.path)||f.path===`${app}/src/chemistry/molecule/core.js`);
const unchanged=[];
for(const old of protectedFiles){const now=await fingerprint(old.path);assert.equal(now.sha256,old.sha256,old.path);unchanged.push(now);}
const results=[];
for(const [label,cmd,args,cwd] of [
 ['unit-results','node',['--test','validation/editor-restoration/implementation/molecule/molecule.test.ts','validation/s5/fixes/c3-k-erratum/c3-reference.test.ts'],path.join(root,app)],
 ['typecheck','cmd.exe',['/d','/c','npm.cmd run typecheck --prefix apps/Masters-of-Chemistry'],root],
]){
 const result=spawnSync(cmd,args,{cwd,encoding:'utf8'});await fs.writeFile(path.join(here,`${label}.txt`),(result.stdout||'')+(result.stderr||''));assert.equal(result.status,0,label);results.push({check:label,status:'PASS'});
}
for(const p of ['browser-results.json','compare-results.json','compare-clean-results.json','edge-results.json']){
 const result=JSON.parse(await fs.readFile(path.join(here,p),'utf8'));assert.equal(result.status,'PASS',p);results.push({check:p,status:'PASS'});
}
await fs.writeFile(path.join(here,'source-fingerprints.json'),JSON.stringify({recordedAt:new Date().toISOString(),ownedRuntime:await Promise.all(runtime.map(fingerprint)),protectedOriginalAndC3SourceUnchanged:unchanged},null,2));
const report={status:'PASS',recordedAt:new Date().toISOString(),protectedUnchangedCount:unchanged.length,ownedRuntimeFiles:runtime,checks:results,notes:['Crowded comparison raw metadata originally said10-heavy-atom; actual fixture and all comparison counts are12. Cleaned report uses correct12 count.','Headless Edge trusted browser/CDP events; physical touch device and foreground desktop app interaction were not claimed.','Broad build, shared Host/storage failure and root acceptance gates belong to E01/root.']};
await fs.writeFile(path.join(here,'verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
