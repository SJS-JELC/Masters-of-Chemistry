import fs from 'node:fs';
import crypto from 'node:crypto';
const base=new URL('../../../',import.meta.url),entries=[];
function walk(relative){const directory=new URL(relative,base);for(const item of fs.readdirSync(directory,{withFileTypes:true})){const path=relative+'/'+item.name;if(item.isDirectory())walk(path);else{const bytes=fs.readFileSync(new URL(path,base));entries.push({path,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});}}}
for(const path of ['src/activities/igcse/calorimetry','src/activities/igcse/bond-enthalpy','src/chemistry/thermochemistry'])walk(path);
fs.writeFileSync(new URL('./output-fingerprints.json',import.meta.url),JSON.stringify({generatedAt:new Date().toISOString(),files:entries.sort((a,b)=>a.path.localeCompare(b.path))},null,2));
