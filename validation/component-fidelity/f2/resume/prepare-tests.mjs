import fs from 'node:fs';
import path from 'node:path';
const names=['canonical-identity.test.mjs','current-persistence.test.mjs','development-identity.test.mjs','energy-reference.test.mjs','numeric-working.test.mjs','acid-pre-correction-fixtures.json','authoring-pre-correction-fixtures.json','current-export.json'];
for(const name of names){
 let text=fs.readFileSync(new URL('../integration/'+name,import.meta.url),'utf8');
 // Resume is a sibling of integration; these references retain their original depths.
 fs.writeFileSync(path.join(import.meta.dirname,name),text);
}
console.log('Resume-owned tests/fixture copies prepared; previous results untouched.');
