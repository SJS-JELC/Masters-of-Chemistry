import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),directory=path.join(project,'validation/s3/integration');fs.mkdirSync(directory,{recursive:true});
const jobs=[['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],['s3-unit',['scripts/test-s3.mjs']],['acid-coverage',['validation/s2/acid/adapter-tests.mjs']],['acid-independent-chemistry',['validation/s2/acid/chemistry-reference.mjs']],['catalogue',['scripts/write-catalogue-definitions.mjs','--check']],['source-and-controls',['scripts/validate-s0.mjs']],['protected-originals',['scripts/protect-originals.mjs','check']],...(process.argv.includes('--build')?[['build',['scripts/build.mjs']],['build-check',['scripts/validate-s3-builds.mjs']]]:[])];
const results=[];
for(const [id,args] of jobs){const began=Date.now(),result=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(directory,`foreman-${id}.txt`),(result.stdout||'')+'\n'+(result.stderr||''));results.push({id,command:['node',...args],cwd:'project',status:result.status===0?'PASS':'FAIL',exitCode:result.status,elapsedMs:Date.now()-began,evidence:`validation/s3/integration/foreman-${id}.txt`});}
function files(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):/\.(?:ts|tsx|js)$/.test(entry.name)?[path.join(directory,entry.name)]:[]);}
const source=files(path.join(project,'src'));for(const file of source){const text=fs.readFileSync(file,'utf8');assert(!/localStorage\.(?:setItem|removeItem|clear)\s*\(/.test(text),`Legacy store mutation: ${file}`);assert(!/\b(?:from|import)\s*(?:\(\s*)?['"][^'"]*Masters-of-(?:A-Level|IGCSE)-Chemistry/.test(text),`Original runtime import: ${file}`);assert(!/<iframe\b|rocket-recall/i.test(text),`Excluded runtime: ${file}`);}
results.push({id:'runtime-ownership',status:'PASS',files:source.length,checks:['no original-app runtime imports','no old localStorage mutation','no iframe or Rocket','shared controls/source locks validated']});
const report={status:results.every(row=>row.status==='PASS')?'PASS':'FAIL',checkedAt:new Date().toISOString(),results};fs.writeFileSync(path.join(directory,'foreman-checks.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
