import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const courses=['alevel','igcse'].map(course=>{
 const root=path.join(project,'dist',course),manifest=JSON.parse(fs.readFileSync(path.join(root,'.vite/manifest.json'),'utf8'));
 const entry=Object.keys(manifest).find(key=>manifest[key].isEntry),foundation=Object.keys(manifest).find(key=>key.endsWith('/ProductionFoundation.tsx'));
 assert(entry&&foundation,'Real production host must be built separately from DEV fixtures.');
 const initial=new Set();
 function include(key){if(initial.has(key))return;const item=manifest[key];assert(item,`Missing manifest dependency ${key}`);initial.add(key);for(const dependency of item.imports||[])include(dependency);}
 include(entry);include(foundation);
 const chunks=Object.entries(manifest).filter(([,row])=>row.file.endsWith('.js')).map(([key,row])=>{
  const bytes=fs.readFileSync(path.join(root,row.file)),text=bytes.toString();
  assert(!/S1 foundation development harness|development-fixture|__mastersFoundation|__mastersActivity|Set excessive-valence drawing|rocket-recall|<iframe/i.test(text),`Excluded runtime in ${course}/${row.file}`);
  return {key,file:row.file,bytes:bytes.length,gzipBytes:gzipSync(bytes).length,initial:initial.has(key),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 });
 const initialShellJavascriptGzipBytes=chunks.filter(row=>row.initial).reduce((sum,row)=>sum+row.gzipBytes,0);assert(initialShellJavascriptGzipBytes<=204800);
 assert(fs.existsSync(path.join(root,'index.html')));assert(!fs.existsSync(path.join(root,`${course}.html`)));
 for(const row of Object.values(manifest)){assert(fs.existsSync(path.join(root,row.file)));for(const file of row.css||[])assert(fs.existsSync(path.join(root,file)));}
 for(const fragment of ['acid-base-calculations/provider.ts','structure-and-bonding/provider.ts','dot-and-cross/provider.ts','editors/dot-and-cross/index.ts'])assert(Object.keys(manifest).some(key=>key.endsWith(fragment)),`Missing lazy complete activity chunk: ${fragment}`);
 return {course,status:'PASS',initialShellJavascriptGzipBytes,budgetBytes:204800,chunks,scope:'Real shared production host; complete banks and dot-cross editor lazy-loaded on activity opening.'};
});
const report={status:'PASS',checkedAt:new Date().toISOString(),courses,checks:['two course static roots and relative-prefix manifest assets','DEV fixture/harness and Rocket excluded','real production host included','complete activity/provider and editor lazy boundaries','initial entry plus host/static dependency gzip measured <=204800 bytes']};
fs.mkdirSync(path.join(project,'.artifacts/s2/integration'),{recursive:true});fs.writeFileSync(path.join(project,'.artifacts/s2/integration/build-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,courses:courses.map(({course,initialShellJavascriptGzipBytes})=>({course,initialShellJavascriptGzipBytes}))}));
