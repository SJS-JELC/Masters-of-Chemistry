import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {validateRelease} from '../../scripts/validate-s4-release.mjs';
const app=path.resolve(import.meta.dirname,'../..'),dir=import.meta.dirname;
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const changed=['src/statistics/StatisticsView.tsx','src/statistics/model.ts','src/statistics/statistics.css','src/foundation/ProductionFoundation.tsx'];
const changes=changed.map(file=>{const before=path.join(dir,'source-before',path.basename(file)),after=path.join(app,file),diff=spawnSync('git',['diff','--no-index','--',before,after],{cwd:app,encoding:'utf8'});assert([0,1].includes(diff.status),diff.stderr);return{file,beforeSha256:sha(before),afterSha256:sha(after),diff:diff.stdout};});
fs.writeFileSync(path.join(dir,'source-diff.patch'),changes.map(item=>item.diff).join('\n'));
fs.writeFileSync(path.join(dir,'changed-files.json'),JSON.stringify(changes.map(({diff,...rest})=>rest),null,2)+'\n');
const sources=[];for(const course of ['alevel','igcse']){const root=path.resolve(app,`../Masters-of-${course==='alevel'?'A-Level':'IGCSE'}-Chemistry/src`);for(const name of ['stats.html',`assets/${course}-stats.css`,`assets/${course}-stats.js`,`assets/${course}-stats-core.js`])sources.push({course,path:path.relative(path.resolve(app,'../..'),path.join(root,name)).replaceAll('\\','/'),sha256:sha(path.join(root,name))});}
fs.writeFileSync(path.join(dir,'provenance.json'),JSON.stringify({checkedAt:new Date().toISOString(),sources,reuse:'Original stats markup, shared A Level/IGCSE CSS geometry/palette, timeline aggregation and interaction conventions adapted to React. All selectors scoped. Current landing catalogue defines visible order/aliases; existing course domain supplies unchanged mastery. Original live apps remain read-only.',generator:'node validation/statistics-restore/scope-css.mjs, then node node_modules/prettier/bin/prettier.cjs --write src/statistics/statistics.css'},null,2)+'\n');
const css=fs.readFileSync(path.join(app,'src/statistics/statistics.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
for(const match of css.matchAll(/([^{}]+)\{/g)){const selectors=match[1].trim();if(selectors.startsWith('@'))continue;for(const selector of selectors.split(','))assert(selector.trim().startsWith('.statistics'),`Global statistics selector ${selector}`);}
const checks=['alevel','igcse'].map(validateRelease);fs.writeFileSync(path.join(dir,'release-checks.json'),JSON.stringify({status:'PASS',checks,cssSelectorsScoped:true},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',checks,changed:changes.map(item=>item.file),cssSelectorsScoped:true}));
