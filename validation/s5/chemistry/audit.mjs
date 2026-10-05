import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {productionRegistry} from '../../../src/foundation/registry.ts';
import {teacherCatalogue} from '../../../src/ui/teacher-catalogue.ts';
const root=path.resolve(import.meta.dirname,'../../..'),out=import.meta.dirname;
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const input= ['src','dist','development/authoring','docs/inventory','docs/authoring'].flatMap(d=>files(path.join(root,d))).sort().map(f=>({path:path.relative(root,f).replaceAll('\\','/'),bytes:fs.statSync(f).size,sha256:sha(fs.readFileSync(f))}));
fs.writeFileSync(path.join(out,'initial-fingerprints.json'),JSON.stringify({at:new Date().toISOString(),files:input,aggregate:sha(JSON.stringify(input))},null,2));
const inventory=JSON.parse(fs.readFileSync(path.join(root,'validation/s0/inventory/coverage-manifest.json'),'utf8').replace(/^\uFEFF/,''));
fs.writeFileSync(path.join(out,'inventory-keys.json'),JSON.stringify({keys:Object.keys(inventory)},null,2));
const result={at:new Date().toISOString(),activities:[],total:0,errors:[]};
const samples=[];
for(const a of productionRegistry.activities){
 if(a.strand==='olympiad'){result.activities.push({id:a.id,strand:a.strand,rows:0,separateBank:'src/activities/olympiad/c3l6/bank.json'});continue;}
 const rows=await teacherCatalogue(a.id), p=await a.provider();
 const families=new Map();
 for(const r of rows){
  const q=p.restore(r.ref);assert.deepEqual(q.ref,r.ref);assert(q.workedAnswer.length);assert(q.sources.length);assert(p.resolveLink(r.ref.questionId));
  const sig=r.ref.level+'|'+q.parts.map(x=>x.kind+':'+(x.assessment??'')+':'+(x.editor??'')).join(',');
  const family= families.get(sig)??{sig,refs:[],count:0};family.count++;family.refs.push(r.ref);families.set(sig,family);
 }
 result.activities.push({id:a.id,strand:a.strand,rows:rows.length,coverage:p.coverage??null,families:[...families.values()].map(f=>({...f,refs:undefined,first:f.refs[0],last:f.refs.at(-1)})),identityDigest:sha(JSON.stringify(rows.map(r=>r.ref)))});result.total+=rows.length;
 // Full route enumeration above is deterministic coverage, not chemistry review.
 for(const f of families.values())for(const ref of [f.refs[0],f.refs.at(-1)].filter((r,i,rs)=>r&&rs.findIndex(x=>JSON.stringify(x)===JSON.stringify(r))===i))samples.push({activity:a.id,family:f.sig,question:p.restore(ref)});
}
fs.writeFileSync(path.join(out,'coverage.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(out,'sample-questions.json'),JSON.stringify(samples,null,2));
console.log(JSON.stringify({activities:result.activities.map(a=>({id:a.id,rows:a.rows,families:a.families.length})),total:result.total,samples:samples.length,inputFiles:input.length}));
