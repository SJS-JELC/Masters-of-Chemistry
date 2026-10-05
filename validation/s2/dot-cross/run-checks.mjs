import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const here=import.meta.dirname;
const commands=[['activity.test.mjs','--test'],['test_dot_cross_bank.mjs'],['test_dot_cross_alevel.mjs'],['test_dot_cross_isomers.mjs'],['test_dot_cross_lithium.mjs'],['test_dot_cross_pair_layout.mjs','--test']];
const report=[];for(const [filename,flag] of commands){const args=[...(flag?[flag]:[]),path.join(here,filename)];const result=spawnSync(process.execPath,args,{encoding:'utf8'});fs.writeFileSync(path.join(here,filename+'.log'),result.stdout+(result.stderr??''));report.push({command:[process.execPath,...args],exitCode:result.status,passed:result.status===0});if(result.status!==0)process.exitCode=1;}
fs.writeFileSync(path.join(here,'unit-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),status:report.every(item=>item.passed)?'PASS':'FAIL',suites:report},null,2));console.log(JSON.stringify(report.map(item=>({command:path.basename(item.command.at(-1)),passed:item.passed}))));
