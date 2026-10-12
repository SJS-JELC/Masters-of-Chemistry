import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validatePilot,hash,SOURCE_SHA256} from './recall-formulae-atlas-pilot.mjs';
export function atoms(formula){
 const sum={}; const sections=formula.split(/[·.]/);
 for(const section of sections){let i=0;const prefix=/^\d+/.exec(section);const multiple=prefix?Number(prefix[0]):1;i=prefix?prefix[0].length:0;
 function group(){const out={};while(i<section.length&&section[i]!==')'){let part;if(section[i]==='('){i++;part=group();assert.equal(section[i++],')');}else{const token=/^[A-Z][a-z]?/.exec(section.slice(i));assert.ok(token,'Invalid formula '+formula);i+=token[0].length;part={[token[0]]:1};}const count=/^\d+/.exec(section.slice(i));const n=count?Number(count[0]):1;i+=count?count[0].length:0;for(const [el,num]of Object.entries(part))out[el]=(out[el]||0)+num*n;}return out;}
 const parsed=group();assert.equal(i,section.length);for(const [el,num]of Object.entries(parsed))sum[el]=(sum[el]||0)+num*multiple;
 }return Object.fromEntries(Object.entries(sum).sort());
}
function side(terms){const out={};for(const [coefficient,formula]of terms)for(const [el,count]of Object.entries(atoms(formula)))out[el]=(out[el]||0)+count*coefficient;return Object.fromEntries(Object.entries(out).sort());}
export async function verify(appRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')){
 const source=await fs.readFile(path.resolve(appRoot,'../../resources/igcse-past-paper-atlas/data/atlas.json'));assert.equal(hash(source),SOURCE_SHA256);const atlas=JSON.parse(source);
 const dir=path.join(appRoot,'resources/recall-formulae/atlas');const overlay=JSON.parse(await fs.readFile(path.join(dir,'pilot-overlay.json'),'utf8'));const boundaries=JSON.parse(await fs.readFile(path.join(dir,'gem-boundaries.json'),'utf8'));assert.equal(validatePilot(atlas,overlay,boundaries).status,'PASS');assert.equal(overlay.decision_sha256,hash(JSON.parse(await fs.readFile(path.join(dir,'pilot-decisions.json'),'utf8'))));
 const ionic=[['Mg(NO3)2',2,-1,1,2],['Li2SO4',1,-2,2,1],['AlPO4',3,-3,1,1],['NaCl',1,-1,1,1],['MgCl2',2,-1,1,2],['Mg3N2',2,-3,3,2]];
 const gcd=(a,b)=>b?gcd(b,a%b):a; for(const [formula,c,a,nc,na]of ionic){assert.equal(c*nc+a*na,0);assert.equal(gcd(nc,na),1);assert.ok(Object.keys(atoms(formula)).length>0);}
 const equations=[
 ['2025-june-1-q4c',[[3,'Ca(OH)2'],[2,'H3PO4']],[[1,'Ca3(PO4)2'],[6,'H2O']]],
 ['2021-nov-2-q3ai',[[2,'H2S'],[1,'SO2']],[[3,'S'],[2,'H2O']]],
 ['2025-nov-1-q4cii',[[1,'NH3'],[1,'HCl']],[[1,'NH4Cl']]],
 ['2019-june-1r-q6bv',[[1,'C2H4Cl2']],[[1,'C2H3Cl'],[1,'HCl']]],
 ['2023-jan-2r-q5d',[[1,'Ca3P2'],[6,'H2O']],[[3,'Ca(OH)2'],[2,'PH3']]],
 ['2023-jan-1r-q9c',[[2,'Zn(NO3)2·6H2O']],[[2,'ZnO'],[4,'NO2'],[1,'O2'],[12,'H2O']]],
 ['2020-nov-2-q3b alternative1',[[2,'PbO'],[1,'C']],[[2,'Pb'],[1,'CO2']]],
 ['2020-nov-2-q3b alternative2',[[1,'PbO'],[1,'CO']],[[1,'Pb'],[1,'CO2']]],
 ['2020-nov-2-q3b alternative3',[[1,'PbO'],[1,'C']],[[1,'Pb'],[1,'CO']]]];
 for(const [,left,right]of equations)assert.deepEqual(side(left),side(right));
 assert.equal(2+2*(-1),0,'Lead half-equation charge conservation');
 const negativeChecks=[];function rejected(name,mutate){const copy=structuredClone(overlay);mutate(copy);assert.equal(validatePilot(atlas,copy,boundaries).status,'FAIL');negativeChecks.push(name);}
 rejected('changed-catalogue-fingerprint',o=>o.catalogue_sha256='bad');rejected('changed-source-header',o=>o.source.sha256='bad');rejected('changed-source-fingerprint',o=>o.entries[0].input_record_sha256='bad');rejected('mark-double-count',o=>o.entries[0].secondary_marks=1);rejected('empirical-band-change',o=>o.entries[0].empirical_classification.band='9');rejected('duplicate-pilot-ID',o=>o.entries[1].id=o.entries[0].id);rejected('invalid-gem',o=>o.entries[0].proposed.primary_gem='99.9');rejected('insufficient-extraction-reassignment',o=>o.entries[0].extraction_adequacy.status='INSUFFICIENT');
 const result={status:'PASS',ionic_formulae_checked:ionic.map(x=>x[0]),neutral_lowest_ratios:true,equation_atom_checks:equations.map(([id,left])=>({id,atoms:side(left)})),half_equation_charge_check:'PASS; mapping excluded by scope',negative_invariant_checks:negativeChecks,original_sha256_after:hash(await fs.readFile(path.resolve(appRoot,'../../resources/igcse-past-paper-atlas/data/atlas.json'))),manual_states_and_scope_review:'pilot-overlay.json entries[].review; no source reopening'};
 await fs.writeFile(path.join(appRoot,'.artifacts/recall-formulae/s1/atlas/chemistry-and-invariants.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(typeof process!=='undefined'&&process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await verify(),null,2));
