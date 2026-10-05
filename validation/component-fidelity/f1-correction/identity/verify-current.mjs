import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'../../../..'),slots=JSON.parse(fs.readFileSync(path.join(project,'development/authoring/family-slots.json'),'utf8')),steps=[];
function run(name,args){const r=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(import.meta.dirname,name+'.log'),r.stdout+r.stderr);steps.push({name,args,status:r.status===0?'PASS':'FAIL',exitCode:r.status});if(r.error)throw r.error;if(r.status!==0)process.exitCode=1;return r.status;}
run('typecheck',['node_modules/typescript/bin/tsc','--noEmit']);
const names=Object.keys(slots).filter(n=>n!=='authoring-proof');run('all-authoring-tests',['--test',...names.map(n=>`development/authoring/families/${n}/family.test.mjs`)]);
for(const name of names)run('typecheck-'+name,['node_modules/typescript/bin/tsc','--project',`development/authoring/families/${name}/tsconfig.json`]);
// Existing folder and invalid slug must fail before any writes or slot reassignment.
const source=fs.readFileSync(path.join(project,'development/authoring/family-slots.json'));
for(const slug of ['dev-canonical-correction','unsafe','dev-'+ 'a'.repeat(49)]){const r=spawnSync(process.execPath,['development/authoring/scaffold.mjs',slug],{cwd:project,encoding:'utf8'});if(r.status===0)throw Error('Scaffold accepted invalid/owned folder');}
if(!source.equals(fs.readFileSync(path.join(project,'development/authoring/family-slots.json'))))throw Error('Rejected scaffold changed permanent slots');
steps.push({name:'scaffold-rejected-inputs-no-write',status:'PASS'});
fs.writeFileSync(path.join(import.meta.dirname,'verification-results.json'),JSON.stringify({jobId:'F1-CODEC-DEV',finishedAt:new Date().toISOString(),status:steps.every(s=>s.status==='PASS')?'PASS':'FAIL',steps},null,2));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),templatePaths=['src/development/identity.ts','development/authoring/family-slots.json','development/authoring/data.ts','development/authoring/family.ts','development/authoring/registry.ts','src/development/catalogue/index.tsx','development/authoring/templates/family.test.mjs','development/authoring/templates/browser.mjs'];
const currentInputs=Object.fromEntries(templatePaths.map(p=>[p,sha(fs.readFileSync(path.join(project,p)))]));
for(const name of names){const folder=path.join(project,'development/authoring/families',name),plan=JSON.parse(fs.readFileSync(path.join(folder,'authoring-plan.json'),'utf8')),manifestPath=path.join(folder,'generation-manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 // Original input hashes are retained as provenance; current correction hashes describe the inspected source.
 plan.currentCanonicalInputs=currentInputs;fs.writeFileSync(path.join(folder,'authoring-plan.json'),JSON.stringify(plan,null,2)+'\n');
 manifest.prefix='AB';manifest.permanentDevelopmentSlot=slots[name];manifest.seedDomain=[0,11337407];manifest.canonicalCorrectionAt=new Date().toISOString();manifest.currentCanonicalInputs=currentInputs;manifest.preview=plan.preview;manifest.evidence=plan.evidence;
 manifest.currentFingerprints=Object.fromEntries(fs.readdirSync(folder).filter(f=>f!=='generation-manifest.json').sort().map(f=>[f,sha(fs.readFileSync(path.join(folder,f)))]));fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}
