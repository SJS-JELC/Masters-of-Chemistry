'use strict';
// Existing model-only checks. Both originals are reference inputs; never build them.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const out='apps/Masters-of-Chemistry/validation/s0/inventory';
const preflight=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',out+'/preflight-local-inputs.ps1'],{encoding:'utf8'});
if(preflight.status!==0)throw Error('Locality preflight failed; do not hydrate placeholders: '+preflight.stderr);
const tests=['test_basics_full_answers.js','test_acid_progression_chemistry.js','test_acid_progression_model.js','test_acid_levels.js','test_electron_configurations.js','test_electron_levels.js','test_dot_cross_alevel.js','test_dot_cross_isomers.js','test_dot_cross_lithium.js','test_dot_cross_pair_layout.js','test_ph_titration_curves.js','test_calorimetry_question_generator.js','test_calorimetry_mastery.js','test_bond_enthalpy_question_generator.js','test_structure_bonding_comparison_generator.js','test_energy_enthalpy.js'];
const env={...process.env,MASTERS_ALEVEL_PREVIEW:path.resolve('apps/Masters-of-A-Level-Chemistry/src'),MASTERS_IGCSE_PREVIEW:path.resolve('apps/Masters-of-IGCSE-Chemistry/src')};
const results=[];for(const name of tests){const file='scripts/'+name;const startedAt=new Date().toISOString();const r=spawnSync(process.execPath,['--test',file],{env,encoding:'utf8',timeout:120000});const log=out+'/'+name.replace('.js','.log');fs.writeFileSync(log,r.stdout+'\n'+r.stderr);results.push({file,command:['node','--test',file],startedAt,exitCode:r.status,status:r.status===0?'PASS':'FAIL',log,error:r.error?.message||null});}
fs.writeFileSync(out+'/reference-check-results.json',JSON.stringify({schemaVersion:1,scope:'existing reference regression checks, not a new chemistry audit, browser review or rebuild acceptance',previewEnvironment:{MASTERS_ALEVEL_PREVIEW:env.MASTERS_ALEVEL_PREVIEW,MASTERS_IGCSE_PREVIEW:env.MASTERS_IGCSE_PREVIEW},results},null,2)+'\n');
console.log(JSON.stringify({status:results.every(r=>r.status==='PASS')?'PASS':'FAIL',passed:results.filter(r=>r.status==='PASS').length,total:results.length,failures:results.filter(r=>r.status!=='PASS')}));
process.exitCode=results.every(r=>r.status==='PASS')?0:1;
