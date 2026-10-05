import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {productionRegistry} from '../../../src/foundation/registry.ts';import {teacherCatalogue} from '../../../src/ui/teacher-catalogue.ts';
import {acidEngine} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
import {bank as dotA} from '../../../src/activities/alevel/dot-and-cross/bank.js';import {bank as dotI} from '../../../src/activities/igcse/dot-and-cross/bank.js';
import {variants} from '../../../src/chemistry/electron-configuration/identity.ts';
import {bank as tit} from '../../../src/activities/alevel/ph-titration-curves/bank.ts';
import {calorimetrySource} from '../../../src/activities/igcse/calorimetry/provider.ts';import {bondSource} from '../../../src/activities/igcse/bond-enthalpy/provider.ts';
import {bank as energy} from '../../../src/activities/igcse/energy-enthalpy/provider.ts';
const root=path.resolve(import.meta.dirname,'../../..'),out=import.meta.dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'validation/s0/inventory/coverage-manifest.json'),'utf8'));
const sourceChecks=manifest.sources.map(s=>{const b=fs.readFileSync(path.resolve(root,'../..',s.path));return {...s,actualSha256:sha(b),actualBytes:b.length,pass:sha(b)===s.sha256&&b.length===s.bytes};});assert(sourceChecks.every(s=>s.pass));
fs.writeFileSync(path.join(out,'source-fingerprints.json'),JSON.stringify({at:new Date().toISOString(),count:sourceChecks.length,sources:sourceChecks},null,2));
const samples=[],coverage=[];
for(const a of productionRegistry.activities){
 if(a.strand!=='curriculum')continue;
 const p=await a.provider(),rows=await teacherCatalogue(a.id),seen=new Set(),selected=[];
 for(const r of rows){const q=p.restore(r.ref);let tags=['level:'+q.ref.level];
  if(a.id.endsWith('acid-base-calculations')){const s=acidEngine.generateFromReview(r.ref.questionId);tags.push('template:'+s.templateId,'legacy:'+!!s.legacy,'parts:'+s.responses.length,...s.responses.map(x=>'format:'+x.format+':'+x.unit));}
  else if(a.id.endsWith('electron-configurations')){const v=variants.find(v=>v.questionId===r.ref.questionId);if(v){tags.push('direction:'+v.direction+':'+v.representation,'group:'+v.group);if(['Cr','Cu','Cr:3','Cu:1','Cu:2','Fe:2','Fe:3'].includes(v.speciesId))tags.push('exception:'+v.speciesId);}else tags.push(r.key.split(':').slice(0,2).join(':'));}
  else if(a.id.endsWith('dot-and-cross')){const s=(a.course==='alevel'?dotA:dotI).find(s=>s.id===r.ref.questionId);tags.push('category:'+s.category);if(/^(h2|h2o|n2|co2|nacl|mgo|mgcl2|ethanol|dimethylether|sf6|bf3|co|nh4|h3o|carbonate|ammonium|magnesium-peroxide|lithium-oxide|lithium-chloride)/.test(s.id))tags.push('selected:'+s.id);}
  else if(a.id.endsWith('ph-titration-curves')){const s=tit.find(s=>s.id===r.ref.questionId);tags.push('chemistry:'+s.family+':'+s.reverse,'factor:'+s.initialFactor+':'+s.titrantFactor);}
  else if(a.id.endsWith('calorimetry')){const s=calorimetrySource(r.ref.questionId);tags.push('example:'+s.example.id,'family:'+s.config.setup+':'+s.config.target,'mass:'+s.config.massRoute,'amount:'+s.config.amountRoute,'temp:'+s.config.temperatureRoute,'structure:'+s.structure);}
  else if(a.id.endsWith('bond-enthalpy')){const s=bondSource(r.ref.questionId);tags.push('reaction:'+s.reaction.id,'family:'+s.questionType);}
  else if(a.id.endsWith('energy-enthalpy')){const s=energy.questions.find(s=>s.id===r.ref.questionId);tags.push('strand:'+s.strand,'polarity:'+s.polarity,'editor:'+JSON.stringify(s.editor??null),'diagram:'+s.diagram);}
  else if(a.id.endsWith('energetics-practical')||a.id.endsWith('electrons-bonding'))tags.push('fixed:'+r.ref.questionId);
  else tags.push('structure-focus:'+q.title);
  tags.push('marking:'+q.parts.map(x=>x.kind+':'+(x.assessment??'')).join(','));
  const added=tags.filter(t=>!seen.has(t));if(added.length){tags.forEach(t=>seen.add(t));selected.push(r.ref);samples.push({activity:a.id,ref:r.ref,rationale:added,question:q});}
 }
 coverage.push({activity:a.id,totalDescriptors:rows.length,samples:selected.length,refs:selected,tags:[...seen].sort()});
}
const htmlEsc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const block=b=>b.kind==='image'?`<figure><img src="${htmlEsc(b.src)}"/><figcaption>${htmlEsc(b.alt)}</figcaption></figure>`:b.kind==='table'?`<table>${b.rows.map(row=>'<tr>'+row.map(s=>'<td>'+htmlEsc(s)+'</td>').join('')+'</tr>').join('')}</table>`:`<p>${htmlEsc(b.text??JSON.stringify(b))}</p>`;
fs.writeFileSync(path.join(out,'stratified-sample.json'),JSON.stringify(coverage,null,2));
fs.writeFileSync(path.join(out,'sample-content.json'),JSON.stringify(samples.map(s=>({...s,question:{...s.question,context:s.question.context.map(b=>b.kind==='image'?{...b,src:'[current diagram rendered]'}:b),workedAnswer:s.question.workedAnswer.map(b=>b.kind==='image'?{...b,src:'[current diagram rendered]'}:b)}})),null,2));
const diagrams=[];for(const s of samples){for(const [where,bs] of [['context',s.question.context],['answer',s.question.workedAnswer]])for(const b of bs)if(b.kind==='image')diagrams.push({id:s.ref.questionId,level:s.ref.level,activity:s.activity,where,b});}
const unique=[...new Map(diagrams.map(d=>[d.b.src,d])).values()];
for(let i=0;i<unique.length;i+=4)fs.writeFileSync(path.join(out,`diagrams-${String(i/4).padStart(2,'0')}.html`),`<!doctype html><meta charset="utf-8"><style>body{font:18px Arial;color:#142844;margin:24px}section{border-bottom:2px solid #ddd;margin:16px 0;padding:12px}img{display:block;max-width:100%;max-height:440px}figcaption{font-size:16px}h2{font-size:20px}figure{margin:12px 0}</style>`+unique.slice(i,i+4).map(d=>`<section><h2>${htmlEsc(d.activity+' '+d.id+' L'+d.level+' '+d.where)}</h2>${block(d.b)}</section>`).join(''));
fs.writeFileSync(path.join(out,'diagram-index.json'),JSON.stringify({uniqueDiagrams:unique.length,pages:Math.ceil(unique.length/4),entries:unique.map((d,i)=>({activity:d.activity,id:d.id,level:d.level,where:d.where,alt:d.b.alt,sha256:sha(d.b.src),page:Math.floor(i/4)}))},null,2));
console.log(JSON.stringify({sourceFiles:sourceChecks.length,samples:coverage.map(s=>({activity:s.activity,count:s.samples})),diagrams:unique.length}));
