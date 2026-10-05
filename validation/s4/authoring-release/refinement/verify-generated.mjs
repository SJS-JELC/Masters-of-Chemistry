import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const project=path.resolve(import.meta.dirname,'../../../..'),slug=process.argv[2]||'dev-refinement-starter';
assert(/^dev-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
const family=path.join(project,'development/authoring/families',slug),output=path.join(import.meta.dirname,slug);fs.mkdirSync(output,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(family,'generation-manifest.json'),'utf8')),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [f,digest]of Object.entries(manifest.generatedFingerprints))assert.equal(sha(fs.readFileSync(path.join(family,f))),digest,`CLI output manually changed: ${f}`);
const validations=[];
for(const [label,args]of [['fixtures',['--test',`development/authoring/families/${slug}/family.test.mjs`]],['typecheck',['node_modules/typescript/bin/tsc','--project',`development/authoring/families/${slug}/tsconfig.json`]]]){const result=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(output,`${label}.log`),result.stdout+result.stderr);assert.equal(result.status,0,label);validations.push({label,status:'PASS'});}
const invalid=spawnSync(process.execPath,['development/authoring/scaffold.mjs','../escape'],{cwd:project,encoding:'utf8'}),duplicate=spawnSync(process.execPath,['development/authoring/scaffold.mjs',slug],{cwd:project,encoding:'utf8'});
assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Usage/);assert.notEqual(duplicate.status,0);assert.match(duplicate.stderr,/new owned DEV folder/);
fs.writeFileSync(path.join(output,'cli-refusal-fixtures.log'),invalid.stderr+'\n'+duplicate.stderr);
const base=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'baseline.json'),'utf8')),current=Object.fromEntries(Object.keys(base.files).map(p=>[p,sha(fs.readFileSync(path.join(project,p)))])),changed=Object.keys(base.files).filter(p=>base.files[p]!==current[p]);
for(const p of Object.keys(base.files).filter(p=>p.startsWith('scripts/release-')||p.startsWith('scripts/validate-s4-release')||p.startsWith('release/')||p==='validation/s4/authoring-release/completion.json'))assert.equal(current[p],base.files[p],`Previous release/evidence changed: ${p}`);
const report={status:'PASS',slug,generatedByCLI:true,noManualGeneratedEdits:true,generatedFiles:Object.keys(manifest.generatedFingerprints),validations,malformedSlugRejected:true,overwriteRejected:true,oldReleaseAndCompletionPreserved:true,baselineChanged:changed,baselineCurrentFingerprints:current,checkedAt:new Date().toISOString()};
fs.writeFileSync(path.join(output,'source-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,slug,validations,changed}));
