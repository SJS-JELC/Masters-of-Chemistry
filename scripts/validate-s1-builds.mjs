import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Historical stage-specific assertions are retained verbatim. They are not current release gates.
if(JSON.parse(fs.readFileSync(path.join(project,'project-contract.json'),'utf8')).productionBuild==='app') throw Error('Historical S1 per-course build check; use npm run check:release for the current combined build.');
const courses=['alevel','igcse'].map(course=>{
 const root=path.join(project,'dist',course),manifest=JSON.parse(fs.readFileSync(path.join(root,'.vite/manifest.json'),'utf8'));
 const javascript=Object.values(manifest).filter(row=>row.file.endsWith('.js')).map(row=>row.file);
 const chunks=[...new Set(javascript)].map(file=>{const bytes=fs.readFileSync(path.join(root,file));
  const text=bytes.toString();assert(!/S1 foundation development harness|development-fixture|__mastersFoundation|Set excessive-valence drawing|rocket-recall/i.test(text),`Excluded runtime marker in ${course}/${file}`);
  return {file,bytes:bytes.length,gzipBytes:gzipSync(bytes).length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 });
 const shellJavascriptGzipBytes=chunks.reduce((sum,file)=>sum+file.gzipBytes,0);assert(shellJavascriptGzipBytes<=204800);
 assert(fs.existsSync(path.join(root,'index.html')));assert(!fs.existsSync(path.join(root,`${course}.html`)));
 for(const entry of Object.values(manifest)){assert(fs.existsSync(path.join(root,entry.file)));for(const file of entry.css||[])assert(fs.existsSync(path.join(root,file)));}
 return {course,status:'PASS',chunks,shellJavascriptGzipBytes,budgetBytes:204800,scope:'S1 course shell with zero enabled production activity adapters. Complete content, editors and stats remain later-stage gates.'};
});
const result={status:'PASS',checkedAt:new Date().toISOString(),courses,checks:['both independent static index files and manifest assets exist','DEV harness and synthetic providers absent from emitted JS','Rocket absent','initial shell plus lazy production foundation total gzip fits204800 bytes']};
fs.mkdirSync(path.join(project,'.artifacts/s1/integration'),{recursive:true});fs.writeFileSync(path.join(project,'.artifacts/s1/integration/build-check.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
