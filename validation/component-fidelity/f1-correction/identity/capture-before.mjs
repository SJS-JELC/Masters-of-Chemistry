import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {acidEngine} from '../../../../src/activities/alevel/acid-base-calculations/engine.js';
const project=path.resolve(import.meta.dirname,'../../../..'),here=import.meta.dirname,before=path.join(here,'before');
if(fs.existsSync(before))throw Error('Before snapshots already captured; do not overwrite');
const files=['src/activities/alevel/acid-base-calculations/identity.ts','src/development/fixtures.ts','src/development/FoundationApp.tsx','src/development/catalogue/index.tsx','scripts/test-component-identity.mjs'];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.name.startsWith('.'))continue;const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else files.push(path.relative(project,p).replaceAll('\\','/'));}}
walk(path.join(project,'development/authoring'));
for(const f of files){const dest=path.join(before,f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(project,f),dest);}
const hashes=files.map(f=>({path:f,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(project,f))).digest('hex')}));
fs.writeFileSync(path.join(here,'before-manifest.json'),JSON.stringify({capturedAt:new Date().toISOString(),files:hashes},null,2));
const fixtures=[],max=Math.floor(36**6/192)-1;
for(const t of acidEngine.templates)for(const l of [1,2,3])if(acidEngine.scopes.some(s=>s.levels[l].includes(t.id)))for(const seed of [0,1,712345,max]){const {reviewId,...content}=acidEngine.generate(t.id,l,seed);fixtures.push(content);}
fs.writeFileSync(path.join(here,'acid-pre-correction-fixtures.json'),JSON.stringify(fixtures,null,2));
const golden=[];
for(const file of ['development/authoring/family.ts',...fs.readdirSync(path.join(project,'development/authoring/families')).filter(f=>fs.existsSync(path.join(project,'development/authoring/families',f,'family.ts'))).map(f=>'development/authoring/families/'+f+'/family.ts')]){
const {proofRef,proofQuestion,dilutionValues,proofMarking}=await import(new URL('../../../../'+file,import.meta.url));
for(const l of [1,2,3])for(const seed of l===1?[0]:[0,1,24,35,0x123456]){const ref=proofRef(l,seed),q=proofQuestion(ref);delete q.ref;const v=dilutionValues(ref),responses={ph:{kind:'numeric',raw:String(l===3?v.finalVolume:Number(v.pH.toFixed(2))),unit:l===3?'cm³':''},change:{kind:'choice',selected:['increase']}};
golden.push({file,level:l,seed,question:q,values:v,marks:proofMarking.mark(proofQuestion(ref),responses)});}}
fs.writeFileSync(path.join(here,'authoring-pre-correction-fixtures.json'),JSON.stringify(golden,null,2));
