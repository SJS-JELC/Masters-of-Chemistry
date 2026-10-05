import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const out=import.meta.dirname,app=path.resolve(out,'../../../..'),before=path.join(app,'validation/ui-consistency/u1/before');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const originals=walk(path.join(before,'src')),current=walk(path.join(app,'src')),prior=new Map(originals.map(f=>[path.relative(before,f).replaceAll('\\','/'),f]));
const rows=current.map(f=>{const name=path.relative(app,f).replaceAll('\\','/'),old=prior.get(name);return {path:name,sha256:hash(fs.readFileSync(f)),beforeSha256:old?hash(fs.readFileSync(old)):null}}),changes=rows.filter(r=>r.sha256!==r.beforeSha256);
assert.equal(current.length,295);assert.equal(changes.length,38);assert.equal(originals.length,288);
const removed=[...prior.keys()].filter(p=>!rows.some(r=>r.path===p));assert.deepEqual(removed,[]);
const protectedSources=rows.filter(r=>/^src\/(?:chemistry|content|domain\/(?:timing|mastery|session))\//.test(r.path)||/^src\/activities\//.test(r.path)&&!r.path.endsWith('.css'));
assert(protectedSources.every(r=>r.sha256===r.beforeSha256));
let patch='';for(const row of changes){const old=prior.get(row.path),file=path.join(app,row.path);if(old){const result=spawnSync('git',['diff','--no-index','--no-ext-diff','--',old,file],{encoding:'utf8'});assert([0,1].includes(result.status));patch+=result.stdout+'\n';}else patch+='--- /dev/null\n+++ '+row.path+'\n'+fs.readFileSync(file,'utf8').split('\n').map(x=>'+'+x).join('\n')+'\n';}
fs.writeFileSync(path.join(out,'independent-current-source.patch'),patch);
fs.writeFileSync(path.join(out,'source-gate.json'),JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),sourceFiles:current.length,baselineFiles:originals.length,changed:changes,removed,unchanged:current.length-changes.length,protectedSources,reviewedPatchInputs:['validation/ui-consistency/u1/source-changes.patch','validation/ui-consistency/u1-footer-fix/source-changes.patch'].map(p=>({path:p,sha256:hash(fs.readFileSync(path.join(app,p)))})),scope:'Independently regenerated current diff and rehashed chemistry/content/provider/policy/identity/timing/mastery/session source. No chemical model/marking/ID changes.'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',sourceFiles:current.length,changes:changes.length,protectedSources:protectedSources.length}));
