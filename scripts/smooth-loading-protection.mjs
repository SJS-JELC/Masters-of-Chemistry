import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const project=path.resolve(import.meta.dirname,'..');
const workspace=path.resolve(project,'../..');
const baseline=JSON.parse(fs.readFileSync(path.join(project,'.artifacts/smooth-loading/baseline/current-originals.json'),'utf8').replace(/^\uFEFF/,''));
const actual={};
for(const root of ['apps/Masters-of-A-Level-Chemistry','apps/Masters-of-IGCSE-Chemistry']) {
  function walk(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())walk(file);
    else if(entry.isFile())actual[path.relative(workspace,file)]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
  }}
  walk(path.join(workspace,root));
}
const changed=[...new Set([...Object.keys(baseline.files),...Object.keys(actual)])].filter(key=>baseline.files[key]!==actual[key]);
const result={status:changed.length?'FAIL':'PASS',checkedAt:new Date().toISOString(),checked:Object.keys(actual).length,changed};
const stage=process.argv[2]??'current';
if(!/^[a-z0-9-]+$/.test(stage))throw Error('Invalid protection stage');
fs.writeFileSync(path.join(project,'.artifacts/smooth-loading',stage+'-protection.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
if(changed.length)process.exitCode=1;
