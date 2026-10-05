import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project = path.resolve(import.meta.dirname, '../../../..');
const owned = 'src/activities/olympiad/c3l6';
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const files = walk(path.join(project,owned));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const entries = Object.fromEntries(files.map(f=>[path.relative(project,f).replaceAll('\\','/'),hash(fs.readFileSync(f))]));
const mode = process.argv[2] || 'before';
if(mode==='before') {
 fs.mkdirSync(path.join(import.meta.dirname,'before'),{recursive:true});
 for(const f of files.filter(f=>/\.tsx?$/.test(f))) fs.copyFileSync(f,path.join(import.meta.dirname,'before',path.basename(f)));
}
fs.writeFileSync(path.join(import.meta.dirname,`${mode}-fingerprints.json`),JSON.stringify(entries,null,2)+'\n');
if(mode!=='before') {
 const before=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'before-fingerprints.json'),'utf8'));
 const forbidden=Object.keys(before).filter(f=>!/\.tsx?$/.test(f)&&before[f]!==entries[f]);
 if(forbidden.length) throw Error('Immutable source changed: '+forbidden.join(', '));
 console.log(JSON.stringify({immutableFiles:Object.keys(before).filter(f=>!/\.tsx?$/.test(f)).length,changed:Object.keys(entries).filter(f=>before[f]!==entries[f]),sourceFreeze:'PASS'}));
}
