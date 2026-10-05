import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
const project=path.resolve(import.meta.dirname,'../../../..'),here=import.meta.dirname;
function tests(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(/profile|cache|^\.|^(?:tmp|temp|p|p-edge|p-ordinary|retained-ports)$/.test(e.name)?[]:tests(path.join(dir,e.name))):/\.test\.(?:mjs|js|ts)$/.test(e.name)?[path.join(dir,e.name)]:[]);}
const historical=new Set(['s2/integration/complete-coverage.test.ts','s3/electrons/electrons.test.mjs','s3/c3l6/c3l6.test.ts'].map(p=>path.join(project,'validation',p)));
const selected=['s1','s2','s3','s4','s5','landing-restoration'].flatMap(stage=>tests(path.join(project,'validation',stage))).filter(file=>!historical.has(file)).sort();
selected.push(path.join(project,'scripts/test_revision_registration.mjs'),path.join(project,'scripts/test_active_question_time.mjs'));
const groups=[{id:'shared-source-fixtures',cwd:path.resolve(project,'../..'),files:selected.filter(file=>file.startsWith(path.join(project,'validation/s1/')))},{id:'activity-landing-regressions',cwd:project,files:selected.filter(file=>!file.startsWith(path.join(project,'validation/s1/')))}];
const results=[];
for(const group of groups){const args=['--import',pathToFileURL(path.join(here,'retained-preload.mjs')).href,'--test',...group.files];const run=spawnSync(process.execPath,args,{cwd:group.cwd,encoding:'utf8'});fs.writeFileSync(path.join(here,group.id+'.log'),`${run.stdout||''}\n${run.stderr||''}`);results.push({id:group.id,status:run.status===0?'PASS':'FAIL',exitCode:run.status,files:group.files.map(file=>({path:path.relative(project,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')})),evidence:group.id+'.log'});}
const report={status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',checkedAt:new Date().toISOString(),method:'Retained test-s5 suites plus shared attempt tests and unchanged landing tests; same historical exceptions and separate current equivalents. Exact-name cache/temp exclusions ensure attempt owner is included. Preload redirects generated report writes only; no assertion changes.',historicalExceptions:[...historical].map(file=>path.relative(project,file).replaceAll('\\','/')),results};
fs.writeFileSync(path.join(here,'retained-tests.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
