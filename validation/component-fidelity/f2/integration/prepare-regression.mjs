import fs from 'node:fs';
const from=new URL('../../f1-correction/identity/',import.meta.url);
for(const name of ['canonical-identity.test.mjs','current-persistence.test.mjs','development-identity.test.mjs','acid-pre-correction-fixtures.json','authoring-pre-correction-fixtures.json','current-export.json']) {
 let text=fs.readFileSync(new URL(name,from),'utf8');
 if(name==='development-identity.test.mjs')text=text.replace("'./before/src/development/fixtures.ts'","'../../f1-correction/identity/before/src/development/fixtures.ts'");
 fs.writeFileSync(new URL(name,import.meta.url),text);
}
console.log('F2-owned regression copies prepared; prior evidence cannot be outputs');
