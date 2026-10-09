import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {writeRuntimeAliases} from './runtime-aliases.mjs';
const project = path.resolve(import.meta.dirname, '..');
const result = spawnSync(process.execPath, [path.join(project,'node_modules/vite/bin/vite.js'),'build'], {cwd:project,stdio:'inherit',env:process.env});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
writeRuntimeAliases();
// Retire only inventoried generated files. Preserve unknown or linked material.
for (const course of ['alevel','igcse']) {
  const directory=path.resolve(project,'dist',course);
  if(!fs.existsSync(directory)) continue;
  if(directory!==path.join(project,'dist',course)||fs.lstatSync(directory).isSymbolicLink()) throw Error('Unsafe historical output');
  const manifestPath=path.join(project,'release',course+'.runtime.json');
  if(!fs.existsSync(manifestPath)) throw Error('Missing historical inventory; preserve output for review');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(manifest.buildRoot!=='dist/'+course) throw Error('Historical build root mismatch');
  const approved=new Map(manifest.files.map(f=>[f.path,f]));
  approved.set('.vite/manifest.json',null);
  function inspect(root,prefix='') {for(const entry of fs.readdirSync(root,{withFileTypes:true})) {
    const name=prefix+entry.name,full=path.join(root,entry.name);
    if(entry.isSymbolicLink()) throw Error('Preserving linked historical output: '+name);
    if(entry.isDirectory()) inspect(full,name+'/');
    else if(!approved.has(name)) throw Error('Preserving unlisted historical output: '+course+'/'+name);
    else if(approved.get(name)) {
      const expected=approved.get(name),bytes=fs.readFileSync(full);
      if(bytes.length!==expected.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==expected.sha256) throw Error('Preserving modified historical output: '+course+'/'+name);
    }
  }}
  inspect(directory);
  fs.rmSync(directory,{recursive:true});
}
