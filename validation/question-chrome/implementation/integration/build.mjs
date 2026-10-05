import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {validateRelease} from '../../../../scripts/validate-s4-release.mjs';
const project=path.resolve(import.meta.dirname,'../../../..'),here=import.meta.dirname;
const checks=[];
for(const [id,args] of [['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],['lifecycle',['--test','validation/question-chrome/implementation/integration/lifecycle.test.ts']],['build',['scripts/build.mjs']],['release-alevel',['scripts/release-s4.mjs','alevel']],['release-igcse',['scripts/release-s4.mjs','igcse']]]) {
 const result=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(here,id+'.log'),(result.stdout||'')+'\n'+(result.stderr||''));checks.push({id,status:result.status===0?'PASS':'FAIL',exitCode:result.status,evidence:id+'.log'});assert.equal(result.status,0,id);
}
const releases=['alevel','igcse'].map(validateRelease);
fs.writeFileSync(path.join(here,'build-results.json'),JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),checks,releases},null,2)+'\n');console.log(JSON.stringify({status:'PASS',checks,releases}));
