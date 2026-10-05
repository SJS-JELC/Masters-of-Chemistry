import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {currentInputs} from '../../../../scripts/current-inputs.mjs';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),root=path.resolve(here,'..');
const destination=path.join(here,'evidence-freeze.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read=file=>JSON.parse(fs.readFileSync(path.join(project,file),'utf8'));
assert.deepEqual(currentInputs(),read('validation/question-chrome/implementation/integration/current-inputs.json').inputs);
const aggregate=read('validation/question-chrome/implementation/foreman-report.json');
for(const row of aggregate.evidenceFiles)assert.equal(hash(path.join(project,row.path)),row.sha256);
function walk(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())return /^(?:temp|tmp|profile|cache|\.production-browser-tmp|\.browser-tmp|\.timing-browser-tmp|p|p-edge|p-ordinary)$/.test(entry.name)?[]:walk(file);
  return file===destination||! /\.(?:json|mjs|md|txt|log|png|ts|css)$/.test(entry.name)?[]:[file];
});}
const files=walk(root).sort().map(file=>({path:path.relative(project,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:hash(file)}));
const result={status:'PASS',capturedAt:new Date().toISOString(),meaning:'Current H1 aggregate and retained evidence freeze after root-authorised CSS-only hierarchy correction; transient browser profiles excluded. Production source/build closure separately complete.',files};
fs.writeFileSync(destination,JSON.stringify(result,null,2)+'\n');
for(const row of result.files)assert.equal(hash(path.join(project,row.path)),row.sha256);
console.log(JSON.stringify({status:result.status,evidenceFiles:files.length,sourceBuildFiles:currentInputs().length,aggregateSha256:hash(path.join(project,'validation/question-chrome/implementation/foreman-report.json'))}));
