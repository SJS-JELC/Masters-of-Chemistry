'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const out='apps/Masters-of-Chemistry/validation/s1/session';
const jobs=[
  {name:'tests',args:['--test',out+'/session.test.mjs']},
  {name:'typecheck',args:['apps/Masters-of-Chemistry/node_modules/typescript/bin/tsc','-p',out+'/tsconfig.json','--noEmit']}
];
const results=jobs.map(job=>{const beganAt=new Date().toISOString();const result=spawnSync(process.execPath,job.args,{encoding:'utf8',timeout:120000});const log=out+'/'+job.name+'.log';fs.writeFileSync(log,result.stdout+'\n'+result.stderr);return {name:job.name,command:['node',...job.args],beganAt,exitCode:result.status,status:result.status===0?'PASS':'FAIL',log,error:result.error?.message||null};});
const status=results.every(result=>result.status==='PASS')?'PASS':'FAIL';
fs.writeFileSync(out+'/verification.json',JSON.stringify({status,scope:'Owned React-free session/mastery modules only; real-browser composition and full-project gates remain foreman owned',results},null,2)+'\n');console.log(JSON.stringify({status,results}));process.exitCode=status==='PASS'?0:1;
