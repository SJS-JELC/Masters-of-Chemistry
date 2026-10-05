import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'../../..');
function walk(p){return fs.readdirSync(path.join(project,p),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);}
export function hashCore(){return Object.fromEntries(['src/domain','src/persistence','src/contracts'].flatMap(walk).concat(['src/foundation/registry.ts','src/foundation/ActivityHost.tsx','src/ui/QuestionPlayer.tsx']).sort().map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(project,p))).digest('hex')]));}
if(process.argv[1]===import.meta.filename){const label=process.argv[2]||'before';fs.writeFileSync(path.join(import.meta.dirname,`core-${label}.json`),JSON.stringify({time:new Date().toISOString(),hashes:hashCore()},null,2));}
