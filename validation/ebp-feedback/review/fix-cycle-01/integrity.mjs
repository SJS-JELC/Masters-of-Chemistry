import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {validateRelease} from '../../../../scripts/validate-s4-release.mjs';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const read=file=>fs.readFileSync(path.join(project,file),'utf8').replace(/^\uFEFF/,'');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const closure=JSON.parse(read('validation/ebp-feedback/implementation/fix-cycle-01/current-inputs.json'));
const previousClosure=JSON.parse(read('validation/ebp-feedback/implementation/current-inputs.json'));
const sourceChanges=closure.files.filter(file=>file.path.startsWith('src/')).filter(file=>previousClosure.files.find(old=>old.path===file.path)?.sha256!==file.sha256).map(file=>file.path);
assert.deepEqual(sourceChanges,['src/ui/ResponseControl.tsx']);
const currentResponseSource=read('src/ui/ResponseControl.tsx');
assert.equal(currentResponseSource.split('className="field-result sr-only"').length-1,2);
const reconstructedPriorSource=currentResponseSource.replaceAll('className="field-result sr-only"','className="field-result"');
assert.equal(sha(reconstructedPriorSource),previousClosure.files.find(file=>file.path==='src/ui/ResponseControl.tsx').sha256,'Reverse exactly two added classes must reproduce reviewed source bytes');
const packagedClasses=['alevel','igcse'].map(course=>{
 const files=closure.files.filter(file=>file.path.startsWith(`dist/${course}/assets/`)&&file.path.endsWith('.js')&&read(file.path).includes('field-result sr-only'));
 assert.equal(files.length,1);const occurrences=read(files[0].path).split('field-result sr-only').length-1;assert.equal(occurrences,2);return {course,path:files[0].path,occurrences};
});
const files=closure.files.map(file=>{
 const bytes=fs.readFileSync(path.join(project,file.path));
 return {...file,currentBytes:bytes.length,currentSha256:sha(bytes),status:bytes.length===file.bytes&&sha(bytes)===file.sha256?'PASS':'FAIL'};
});
const continuity=JSON.parse(read('validation/ebp-feedback/implementation/timing-continuity.json'));
const timing=[...continuity.matches,...continuity.retainedEvidence].map(file=>({path:file.path,sha256:sha(read(file.path)),expectedSha256:file.sha256,status:sha(read(file.path))===file.sha256?'PASS':'FAIL'}));
const releases=['alevel','igcse'].map(validateRelease);
const localBefore=JSON.parse(read('validation/ebp-feedback/implementation/repair-local-before.json'));
const protectedFiles=Object.entries(localBefore).map(([file,before])=>{
 const full=path.join(workspace,file);let current;
 try {
  if(before.symlink)current={symlink:fs.readlinkSync(full)};
  else {const bytes=fs.readFileSync(full);current={bytes:bytes.length,sha256:sha(bytes)};}
 } catch(error) {const stat=fs.statSync(full);current={bytes:stat.size,mtimeMs:stat.mtimeMs,error:error.code};}
 return {path:file,status:JSON.stringify(current)===JSON.stringify(before)?'PASS':'FAIL',before,current};
});
const report={status:[...files,...timing,...releases,...protectedFiles].every(x=>x.status==='PASS')?'PASS':'FAIL',checkedAt:new Date().toISOString(),authorClosureCapturedAt:closure.capturedAt,authorClosureTreeSha256:closure.treeSha256,sourceChanges,reverseClassChange:'Reproduces exact previously reviewed ResponseControl source SHA256',packagedClasses,files,timing,releases,protectedFiles,protectionScope:'Independent current comparison against actual 10:36 BST repair-local snapshot. Snapshot postdates initial edits and cannot prove whole-task-start integrity. Historical 529-path drift remains separate.'};
fs.writeFileSync(path.join(here,'integrity-results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,closureFiles:files.length,closureFailures:files.filter(x=>x.status!=='PASS'),timing:timing.length,protectedFiles:protectedFiles.length,protectedFailures:protectedFiles.filter(x=>x.status!=='PASS'),releases},null,2));
assert.equal(report.status,'PASS');

