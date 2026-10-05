import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const project=path.resolve(import.meta.dirname,'..'),workspace=path.resolve(project,'../..');
const baseline=JSON.parse(fs.readFileSync(path.join(project,'resources/source-generation/controls/original-app-baseline.json'),'utf8'));
const contract=JSON.parse(fs.readFileSync(path.join(project,'project-contract.json'),'utf8'));
assert.deepEqual(contract.protectedRoots,baseline.roots);
const current={},hydrated=[],metadataOnly=[];
for(const relative of contract.protectedRoots){
  const root=path.resolve(workspace,relative);
  assert.ok(root.startsWith(workspace+path.sep)&&root!==project);
  function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
      const full=path.join(directory,entry.name),key=path.relative(workspace,full).replaceAll('\\','/');
      if(entry.isSymbolicLink()){current[key]={type:'symlink',target:fs.readlinkSync(full)};continue;}
      if(entry.isDirectory()){walk(full);continue;}
      assert.ok(entry.isFile(),key+' must remain an ordinary file');
      const stat=fs.statSync(full),record={bytes:stat.size,mtimeMs:stat.mtimeMs};
      try {record.sha256=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');}
      catch(error){record.contentHashUnavailable=true;record.readError=error.code;}
      current[key]=record;
    }
  }
  walk(root);
}
assert.deepEqual(Object.keys(current).sort(),Object.keys(baseline.files).sort(),'No missing or additional protected paths');
let readableBaselineCount=0;
for(const [key,original] of Object.entries(baseline.files)){
  const observed=current[key];
  if(original.type==='symlink'){assert.deepEqual(observed,original,key);continue;}
  assert.equal(observed.bytes,original.bytes,key+' byte size');
  if(original.contentHashUnavailable){
    assert.equal(observed.mtimeMs,original.mtimeMs,key+' modification time');
    if(observed.sha256)hydrated.push({path:key,baseline:original,current:observed});
    else metadataOnly.push({path:key,baseline:original,current:observed});
  }else{
    assert.equal(observed.sha256,original.sha256,key+' original readable hash');
    readableBaselineCount++;
  }
}
const report={status:'PASS',checkedAt:new Date().toISOString(),authority:'Root approved current-only metadata-preservation supplement; frozen baseline and generic guard are unchanged.',fileCount:Object.keys(current).length,readableBaselineCount,hydrated,metadataOnly,limitations:['Baseline-unreadable bytes cannot be compared with a prior hash. These records establish exact path/size/mtime preservation and retain newly readable hashes; they do not claim prior byte equality. Cloud readability/error-code transitions are recorded, not treated as source edits.']};
fs.mkdirSync(path.join(project,'.artifacts/explaining-properties'),{recursive:true});
fs.writeFileSync(path.join(project,'.artifacts/explaining-properties/protected-current.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,hydrated:hydrated.length,metadataOnly:metadataOnly.length}));
