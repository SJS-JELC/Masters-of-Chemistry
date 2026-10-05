import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {currentInputs} from '../../../scripts/current-inputs.mjs';
const project=path.resolve(import.meta.dirname,'../../..');
const workspace=path.resolve(project,'../..');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const results=[];
for(const name of process.argv.slice(2)) {
  assert(['molecule','dot-cross'].includes(name));
  const folder=path.join(import.meta.dirname,name);
  const completion=read(path.join(folder,'completion.json'));
  assert.equal(completion.status,'PASS');
  for(const item of [completion.outputPath,...(completion.evidencePaths??[])]) assert(fs.existsSync(path.resolve(item.startsWith('apps/')?workspace:project,item)),item);
  const fingerprints=read(path.join(folder,'source-fingerprints.json'));
  const files=Array.isArray(fingerprints)?fingerprints:fingerprints.files;
  assert(Array.isArray(files)&&files.length>0,'Fingerprint inventory missing');
  for(const item of files) {
    assert(item.sha256&&!item.error,'Unreadable claimed source');
    const full=path.resolve(workspace,item.path);
    assert.equal(hash(full),item.sha256,item.path+' changed since audit');
    if(item.bytes!==undefined)assert.equal(fs.statSync(full).size,item.bytes);
  }
  function pngs(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pngs(path.join(dir,e.name)):e.name.endsWith('.png')?[path.join(dir,e.name)]:[]);}
  const pictures=pngs(folder);
  assert(pictures.length>=4,'Insufficient actual source/current screenshots');
  for(const file of pictures) {
    const bytes=fs.readFileSync(file);
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert(bytes.readUInt32BE(16)>100&&bytes.readUInt32BE(20)>100,'Screenshot invalid dimensions');
  }
  results.push({name,status:'PASS',fingerprintedFiles:files.length,screenshots:pictures.length,manifest:completion.jobId});
}
assert.deepEqual(currentInputs(),read(path.join(import.meta.dirname,'accepted-current-inputs.json')).inputs,'E0 unexpectedly changed accepted production source/build');
const protectedBefore=read(path.join(import.meta.dirname,'protected-originals.json'));
for(const item of protectedBefore.readable)assert.equal(hash(path.resolve(workspace,item.path)),item.sha256,'Protected original changed: '+item.path);
for(const item of protectedBefore.metadataOnly){const stat=fs.statSync(path.resolve(workspace,item.path));assert.equal(stat.size,item.bytes,item.path);assert.equal(stat.mtimeMs,item.mtimeMs,item.path);}
const baseline=read(path.join(project,'validation/original-app-baseline.json'));
const originalPaths=[];
function list(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const full=path.join(directory,entry.name);if(entry.isDirectory())list(full);else originalPaths.push(path.relative(workspace,full).replaceAll('\\','/'));}}
for(const root of baseline.roots)list(path.join(workspace,root));
assert.deepEqual(originalPaths.sort(),Object.keys(baseline.files).sort(),'Protected original file set changed');
const report={status:'PASS',checkedAt:new Date().toISOString(),workers:results,currentAcceptedInputFiles:currentInputs().length,runtimeUnchanged:true,protectedOriginals:{status:'PASS',readableHashed:protectedBefore.readable.length,metadataOnly:protectedBefore.metadataOnly.length,knownOfflineFilesOpened:false}};
fs.writeFileSync(path.join(import.meta.dirname,'foreman-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
