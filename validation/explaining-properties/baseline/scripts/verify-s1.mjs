import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(project,'validation/s1/integration');fs.mkdirSync(directory,{recursive:true});
const jobs=[
 ['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],
 ['unit',['scripts/test-s1.mjs']],
 ['catalogue',['scripts/write-catalogue-definitions.mjs','--check']],
 ['source-and-controls',['scripts/validate-s0.mjs']],
 ['protected-originals',['scripts/protect-originals.mjs','check']],
 ...(process.argv.includes('--build')?[['build',['scripts/build.mjs']],['build-check',['scripts/validate-s1-builds.mjs']]]:[])
];
const results=[];for(const [id,args] of jobs){const began=Date.now();const result=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(directory,`foreman-${id}.txt`),(result.stdout||'')+'\n'+(result.stderr||''));results.push({id,command:['node',...args],cwd:'project',status:result.status===0?'PASS':'FAIL',exitCode:result.status,elapsedMs:Date.now()-began,evidence:`validation/s1/integration/foreman-${id}.txt`});}
function sourceFiles(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?sourceFiles(path.join(directory,entry.name)):/\.(?:ts|tsx)$/.test(entry.name)?[path.join(directory,entry.name)]:[]);}
const source=sourceFiles(path.join(project,'src'));for(const file of source){const text=fs.readFileSync(file,'utf8');assert(!/localStorage\.(?:setItem|removeItem|clear)\s*\(/.test(text),`Legacy localStorage write in ${file}`);assert(!/\b(?:from|import)\s*(?:\(\s*)?['"][^'"]*Masters-of-(?:A-Level|IGCSE)-Chemistry/.test(text),`Original app module import in ${file}`);assert(!/<iframe\b|rocket-recall/i.test(text),`Excluded runtime in ${file}`);}
results.push({id:'runtime-ownership',status:'PASS',files:source.length,checks:['no direct original-app module imports','no localStorage mutations','no iframe or Rocket runtime','S0 control/source hash validation included']});
const report={status:results.every(result=>result.status==='PASS')?'PASS':'FAIL',checkedAt:new Date().toISOString(),results};fs.writeFileSync(path.join(directory,'foreman-checks.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
