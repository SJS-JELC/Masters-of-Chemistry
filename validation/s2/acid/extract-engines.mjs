import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const workspace=resolve(import.meta.dirname,'../../../../..');
const project=resolve(workspace,'apps/Masters-of-Chemistry');
const original=resolve(workspace,'apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations');
const target=resolve(project,'src/activities/alevel/acid-base-calculations');
mkdirSync(target,{recursive:true});
const provenance=[];
function read(file){const content=readFileSync(resolve(original,file),'utf8');provenance.push({path:`apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/${file}`,sha256:createHash('sha256').update(content).digest('hex'),symbolOrSection:'Pure numerical generator extraction; page controller/persistence/DOM excluded'});return content;}
function body(source){return source.replace(/^\(function \(root\) \{\r?\n\s*"use strict";\r?\n/,'').replace(/\}\)\(typeof globalThis !== "undefined" \? globalThis : window\);\s*$/,'');}
function write(name,content){writeFileSync(resolve(target,name),`// Reproducible pure-engine extraction. See validation/s2/acid/extract-engines.mjs.\n${content}`);}
write('data.js',body(read('data.js')).replace('root.AcidBaseData =','export const acidData ='));
write('legacy-core.js',body(read('core.js')).replace('const data = root.AcidBaseData;',"const data = acidData;").replace('root.AcidBaseCore =','export const legacyCore =').replace(/^/,"import {acidData} from './data.js';\n"));
const levels=read('levels.js');
const boundary=levels.indexOf('/* Authoritative revision-2 model.');
const historic=body(levels.slice(0,boundary));
write('historical-levels.js',historic.replace('const core = root.AcidBaseCore;','const core = legacyCore;').replace('const data = root.AcidBaseData;','const data = acidData;').replace('root.AcidBaseLevels =','export const historicalLevels =').replace(/^/,"import {acidData} from './data.js';\nimport {legacyCore} from './legacy-core.js';\n"));
const active=body(levels.slice(levels.indexOf('(function (root)',boundary)));
write('engine.js',active.replace('const compatibilityModel = root.AcidBaseLevels;','const compatibilityModel = historicalLevels;').replace('const data = root.AcidBaseData;','const data = acidData;').replace('root.AcidBaseLevels =','export const acidEngine =').replace(/^/,"import {acidData} from './data.js';\nimport {historicalLevels} from './historical-levels.js';\n"));
const timer=readFileSync(resolve(workspace,'apps/Masters-of-A-Level-Chemistry/src/assets/active-question-time.js'),'utf8');
const minutes=timer.slice(timer.indexOf('  const acidMinutes'),timer.indexOf('  function allowance'));
write('idle-allowances.ts',minutes.replace('const acidMinutes','export const acidMinutes').replace(/\}\);\s*$/,'} as const);\n'));
provenance.push({path:'apps/Masters-of-A-Level-Chemistry/src/assets/active-question-time.js',sha256:createHash('sha256').update(timer).digest('hex'),symbolOrSection:'acidMinutes: exact 38 template-specific allowances'});
const {acidEngine}=await import(pathToFileURL(resolve(target,'engine.js')).href);
write('persisted-codes.ts',`export const acidPersistedTemplateCodes=${JSON.stringify(Object.fromEntries(acidEngine.templates.map((template,index)=>[index.toString(36).toUpperCase(),template.id])),null,2)} as const;\n`);
writeFileSync(resolve(target,'sources.ts'),`import type {SourceReference} from '../../../contracts/index.ts';\nexport const acidSources=${JSON.stringify(provenance,null,2)} as const satisfies readonly SourceReference[];\n`);
writeFileSync(resolve(project,'validation/s2/acid/source-extraction.json'),JSON.stringify({status:'EXTRACTED',sources:provenance,transformations:['Removed IIFE/global exports and added ESM imports/exports','Separated active V2 and historical model','No changes to generator formulas, persisted template order, question-code codecs, data, tolerances or worked answers','No DOM, page controller, storage, mastery or timing runtime extracted']},null,2)+'\n');
