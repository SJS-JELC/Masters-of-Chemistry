import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,project=path.resolve(here,'../../../..'),workspace=path.resolve(project,'../..');
const {createLayout}=await import(pathToFileURL(path.join(project,'src/chemistry/dot-and-cross/layout.js')));
const {validateReference,check}=await import(pathToFileURL(path.join(project,'src/chemistry/dot-and-cross/core.js')));
const json=x=>JSON.parse(JSON.stringify(x));const fingerprints=[];const results=[];
for(const course of ['alevel','igcse']){
 const app=course==='alevel'?'Masters-of-A-Level-Chemistry':'Masters-of-IGCSE-Chemistry',source=path.join(workspace,'apps',app,'src/activities/dot-and-cross'),context=vm.createContext({});
 for(const filename of ['data.js','core.js','renderer.js'])vm.runInContext(fs.readFileSync(path.join(source,filename),'utf8'),context,{filename});
 const original=json(context.DotCrossData.questions),{bank}=await import(pathToFileURL(path.join(project,`src/activities/${course}/dot-and-cross/bank.js`)));
 assert.deepEqual(bank,original,course+' complete unchanged source bank');
 const levels={};for(const q of bank)for(const level of q.grades){const category=q.practiceCategory||q.category;levels[level]??={};levels[level][category]=(levels[level][category]||0)+1;}
 const palette=['H','C','N','O','F','Cl','Na','Mg','Ca',...new Set(original.flatMap(q=>q.reference.atoms.map(a=>a.element)).filter(e=>!['H','C','N','O','F','Cl','Na','Mg','Ca'].includes(e)))];
 let points=0;const failures=[];
 for(const q of bank){const record=course==='alevel'?q:{...q,displayFormula:q.formula,totalCharge:0,namedSpecies:false,practiceCategory:q.category==='ionic'?'ionic':'covalent'};
 const errors=validateReference(record);if(errors.length)failures.push({id:q.id,errors});const result=check(q.reference,record);if(!result.correct)failures.push({id:q.id,referenceCheck:result});
 context.DotCrossRenderer.setQuestion?.(q);const layout=createLayout(q.id);
 for(const atom of q.reference.atoms)assert.equal(layout.shellRadius(atom),context.DotCrossRenderer.shellRadius(atom),q.id+' shell radius');
 for(const electron of q.reference.electrons){assert.deepEqual(json(layout.point(q.reference,electron.anchor)),json(context.DotCrossRenderer.point(q.reference,electron.anchor)),q.id+' electron geometry');points++;}
 }
 assert.deepEqual(failures,[]);
 results.push({course,records:bank.length,bankExactEquality:true,ids:bank.map(q=>q.id),levels,palette,symbols:course==='alevel'?['dot','cross','triangle']:['dot','cross'],referenceChemicalChecks:'All references validate and self-mark correct against accepted shared core',electronPointGeometryComparisons:points,shellRadiusParity:true,extensionIds:bank.filter(q=>q.scope==='extension').map(q=>q.id),namedSpecies:bank.filter(q=>q.namedSpecies).map(q=>q.id),requiresThirdSymbol:bank.filter(q=>q.requiresThirdSymbol).map(q=>q.id)});
 for(const filename of fs.readdirSync(source)){const file=path.join(source,filename);fingerprints.push({path:path.relative(workspace,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}
 const html=fs.readFileSync(path.join(source,'index.html'),'utf8');
 const assetNames=new Set(['shared-theme.css','question-review.js','SJS-Eagle.svg','fonts/Comfortaa-Bold.ttf',...[...html.matchAll(/(?:src|href)="\.\.\/\.\.\/assets\/([^"]+)"/g)].map(m=>m[1])]);
 if(course==='igcse')assetNames.add('../landing/progress.js');
 for(const filename of assetNames){const file=path.join(source,'../../assets',filename);fingerprints.push({path:path.relative(workspace,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}
}
for(const filename of ['src/editors/dot-and-cross/DotCrossEditor.tsx','src/editors/dot-and-cross/editor.css','src/chemistry/dot-and-cross/engine.ts','src/chemistry/dot-and-cross/layout.js','src/chemistry/dot-and-cross/core.js','src/chemistry/dot-and-cross/model.ts','src/activities/alevel/dot-and-cross/provider.ts','src/activities/igcse/dot-and-cross/provider.ts','src/activities/alevel/dot-and-cross/marking.ts','src/activities/igcse/dot-and-cross/marking.ts','src/ui/QuestionPlayer.tsx','src/foundation/ActivityHost.tsx','src/ui/EditorFrame.tsx','src/ui/ResponseControl.tsx','src/ui/Content.tsx','src/ui/DiagramViewport.tsx','src/styles/platform.css']){const file=path.join(project,filename);fingerprints.push({path:path.relative(workspace,file).replaceAll('\\','/'),bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')});}
fs.writeFileSync(path.join(here,'source-fingerprints.json'),JSON.stringify({capturedAt:new Date().toISOString(),files:fingerprints},null,2)+'\n');fs.writeFileSync(path.join(here,'inventory-verification.json'),JSON.stringify({status:'PASS',capturedAt:new Date().toISOString(),method:'Read-only VM source data/core/renderer; exact bank equality; every reference self-check and every electron point compared with accepted shared pure layout. Technical/chemistry invariants supplement substantive source review.',courses:results},null,2)+'\n');console.log(JSON.stringify(results.map(({course,records,palette,electronPointGeometryComparisons})=>({course,records,palette,electronPointGeometryComparisons}))));
