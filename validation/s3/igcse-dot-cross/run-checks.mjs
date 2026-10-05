import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname,s2=path.resolve(here,'../../s2/dot-cross');
const copied=['activity.test.mjs','test_dot_cross_alevel.mjs','test_dot_cross_isomers.mjs','test_dot_cross_lithium.mjs','test_dot_cross_pair_layout.mjs'];
for(const name of copied)fs.writeFileSync(path.join(here,'alevel-'+name),fs.readFileSync(path.join(s2,name),'utf8').replaceAll("'coverage.json'","'alevel-coverage.json'").replaceAll("'reference-review.json'","'alevel-reference-review.json'"));
// Port independent IGCSE inventory tests to the migrated exact bank, retaining actual atlas provenance.
const originalBankTest=fs.readFileSync(path.join(s2,'test_dot_cross_bank.mjs'),'utf8');
fs.writeFileSync(path.join(here,'test_dot_cross_bank.mjs'),originalBankTest.replace("const Data=require(path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/data.js'));","import {bank as questions} from '../../../src/activities/igcse/dot-and-cross/bank.js';\nconst Data={questions,shellRadius:element=>typeof element==='string'?element==='H'?40:64:element.element==='H'?40:64,bondDistance:(a,b)=>createLayout().bondDistance(a,b)};"));
const commands=[['activity.test.mjs',true],['test_dot_cross_bank.mjs',false],...copied.map(name=>['alevel-'+name,name.includes('activity')||name.includes('pair_layout')])];
const suites=[];for(const [file,test] of commands){const args=[...(test?['--test']:[]),path.join(here,file)];const result=spawnSync(process.execPath,args,{encoding:'utf8'});fs.writeFileSync(path.join(here,file+'.log'),result.stdout+(result.stderr??''));suites.push({command:[process.execPath,...args],exitCode:result.status,passed:result.status===0});if(result.status!==0)process.exitCode=1;}
fs.writeFileSync(path.join(here,'unit-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),status:suites.every(s=>s.passed)?'PASS':'FAIL',suites},null,2));console.log(JSON.stringify(suites.map(s=>({file:path.basename(s.command.at(-1)),passed:s.passed}))));
