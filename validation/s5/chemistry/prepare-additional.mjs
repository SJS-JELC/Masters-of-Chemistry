import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../..'),o=import.meta.dirname;
for(const [a,b] of [['validation/s3/c3l6/c3l6.test.ts','c3-reference.retained.ts'],['validation/s3/electrons/electrons.test.mjs','electrons-reference.retained.mjs'],['validation/s3/titration/source-chemistry.test.mjs','titration-reference.test.mjs']]){
 let s=fs.readFileSync(path.join(root,a),'utf8');
 if(b.startsWith('electrons'))for(const [x,y] of [['source-fingerprints.json','../../s3/electrons/source-fingerprints.json'],['coverage.json','electron-coverage.json'],['matching.json','electron-matching.json'],['chemistry-reference.json','electron-chemistry-reference.json'],['model-fingerprints.json','electron-model-fingerprints.json']])s=s.replaceAll("'"+x+"'","'"+y+"'");
 fs.writeFileSync(path.join(o,b),s);
}
for(const [a,b] of [['validation/s2/structure/structure.test.mjs','structure-reference.test.mjs'],['validation/s3/igcse-dot-cross/activity.test.mjs','igcse-dot-reference.test.mjs'],['validation/s3/igcse-dot-cross/alevel-activity.test.mjs','alevel-dot-reference.test.mjs'],['validation/s3/energy/energy.test.mjs','energy-reference.test.mjs']]){
 let s=fs.readFileSync(path.join(root,a),'utf8');
 if(b==='energy-reference.test.mjs')s=s.replace("new URL('./source-fingerprints.json',import.meta.url)","new URL('../../s3/energy/source-fingerprints.json',import.meta.url)");
 for(const x of ['coverage.json','reference-review.json'])s=s.replaceAll("'"+x+"'","'"+b.split('-reference')[0]+'-'+x+"'");
 fs.writeFileSync(path.join(o,b),s);
}

