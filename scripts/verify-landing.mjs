/** Current landing checks; deleted historical fingerprints are not reconstructed. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {validateRelease} from './validate-s4-release.mjs';
const project=path.resolve(import.meta.dirname,'..'),directory=path.join(project,'.artifacts/checks/landing');
fs.mkdirSync(directory,{recursive:true});
const tests=fs.readdirSync(path.join(project,'scripts/tests/landing')).filter(name=>/\.test\.(mjs|js|ts)$/.test(name)).map(name=>'scripts/tests/landing/'+name);
if(!tests.length)throw Error('Missing landing-specific tests');
if(process.argv.includes('--reuse-historical'))throw Error('Historical reuse was retired when its evidence was deleted; run current tests.');
const jobs=[['typecheck',['node_modules/typescript/bin/tsc','--noEmit']],['current-regressions',['scripts/test-s5.mjs']],['landing-tests',['--test',...tests]],['source-catalogue',['scripts/write-catalogue-definitions.mjs','--check']],['historical-guards',['scripts/landing-legacy-gates.mjs']]];
const results=[];
for(const [id,args]of jobs){const began=Date.now(),run=spawnSync(process.execPath,args,{cwd:project,encoding:'utf8'});fs.writeFileSync(path.join(directory,id+'.log'),(run.stdout||'')+'\n'+(run.stderr||''));results.push({id,status:run.status===0?'PASS':'FAIL',exitCode:run.status,elapsedMs:Date.now()-began,evidence:'.artifacts/checks/landing/'+id+'.log'});}
const walk=root=>fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(root,entry.name)):[path.join(root,entry.name)]);
const source=walk(path.join(project,'src')).filter(file=>/\.(?:js|ts|tsx)$/.test(file));
for(const file of source){
 const text=fs.readFileSync(file,'utf8');
 assert(!/\b(?:from|import)\s*(?:\(\s*)?['"][^'"]*Masters-of-(?:A-Level|IGCSE)-Chemistry/.test(text),`Original runtime import: ${file}`);
 const guarded=path.relative(project,file).replaceAll('\\','/')==='src/compatibility/links.ts'?text.replace(/if\s*\(\s*activity\s*===\s*'rocket-recall'\s*\)\s*return\s+unrecognized\s*\(\s*raw\s*,\s*'Rocket Recall is excluded from this application\.'\s*\)\s*;/g,''):text;
 assert(!/<iframe\b|rocket-recall/i.test(guarded),`Excluded runtime: ${file}`);
}
results.push({id:'runtime-ownership',status:'PASS',sourceFiles:source.length,checks:['no original-app runtime imports','no iframe wrappers or Rocket runtime; exact excluded-link rejection permitted']});
if(!process.argv.includes('--no-release'))results.push({id:'releases',status:'PASS',releases:['alevel','igcse'].map(validateRelease)});
const report={status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',checkedAt:new Date().toISOString(),results,scope:'Current executable checks only. Historical landing source-ownership and acceptance evidence deliberately deleted; browser and chemistry review remain separate requirements.'};fs.writeFileSync(path.join(directory,'checks.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
