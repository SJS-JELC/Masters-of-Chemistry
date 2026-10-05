import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const project=path.resolve(import.meta.dirname,'../../../..'),json=f=>JSON.parse(fs.readFileSync(path.join(project,f),'utf8'));
const read=f=>fs.readFileSync(path.join(project,f),'utf8').replace(/^\uFEFF/,'');const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const continuity=json('validation/s5/behaviour/timing-continuity.json');assert.equal(continuity.status,'PASS');
const engineMatches=continuity.matches.filter(row=>row.path.startsWith('src/domain/timing/'));
for(const row of engineMatches){assert(row.semanticEqual);assert.equal(hash(read(row.path)),row.currentSha256,row.path);}
for(const row of continuity.evidence)assert.equal(hash(read(row.path)),row.sha256,row.path);
assert.deepEqual(continuity.realIdle.map(row=>row.limitMs).sort((a,b)=>a-b),[60000,180000,300000,600000]);assert(continuity.realIdle.every(row=>row.native));
const baseline=json('validation/component-fidelity/f2/baseline.json');const paths=baseline.snapshots.filter(row=>row.path.startsWith('src/domain/attempt/')||row.path.startsWith('src/domain/timing/'));
for(const row of paths)assert.equal(hash(fs.readFileSync(path.join(project,row.path))),row.sha256,row.path);
const report={status:'PASS',checkedAt:new Date().toISOString(),scope:'Unchanged accepted timing/attempt engines and retained native idle/background/suspension evidence continuity; does not claim new native OS intervals. Current F2 per-family browser suites separately verify presentation-triggered assessment, restore, Next and evidence.',engineMatches,unchangedF2EnginePaths:paths.map(row=>row.path),retainedNativeEvidence:continuity.evidence,realIdle:continuity.realIdle,preservedLimits:continuity.preservedLimits};
fs.writeFileSync(path.join(import.meta.dirname,'timing-continuity.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,enginePaths:paths.length,retainedNativeEvidence:continuity.evidence.length}));
