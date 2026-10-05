import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const project=path.resolve(import.meta.dirname,'../../../..');
const baseline=JSON.parse(fs.readFileSync(new URL('../baseline.json',import.meta.url),'utf8'));
const mismatches=[];for(const row of baseline.priorEvidence){const bytes=fs.readFileSync(path.join(project,row.path)),hash=crypto.createHash('sha256').update(bytes).digest('hex');if(hash!==row.sha256)mismatches.push({path:row.path,expected:row.sha256,current:hash});}
fs.writeFileSync(new URL('./prior-evidence-verification.json',import.meta.url),JSON.stringify({status:mismatches.length?'FAIL':'PASS',checked:baseline.priorEvidence.length,mismatches},null,2)+'\n');assert.equal(mismatches.length,0,JSON.stringify(mismatches));console.log(`PASS: ${baseline.priorEvidence.length} prior evidence fingerprints unchanged`);
