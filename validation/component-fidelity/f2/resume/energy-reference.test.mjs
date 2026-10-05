import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {energyReference,energyProvider,bank,reviewCode} from '../../../../src/activities/igcse/energy-enthalpy/provider.ts';
import {profileSVG} from '../../../../src/chemistry/energy-profile/svg.ts';
const original=new URL('../../../../../Masters-of-IGCSE-Chemistry/src/activities/energy-enthalpy/',import.meta.url);
const source=vm.createContext({});
for(const file of ['core.js','editor.js']) vm.runInContext(fs.readFileSync(new URL(file,original),'utf8'),source);
const normalize=svg=>svg.replace(/^<div class="diagram-card">|<\/div>$/g,'').replace(/ xmlns="http:\/\/www.w3.org\/2000\/svg"/g,'').replace(/<style>[\s\S]*?<\/style>/g,'').replace(/energy-arrow-[A-Za-z0-9_]+/g,'energy-arrow-N');
const codes=[...new Set([...bank.questions.map(q=>q.diagram).filter(Boolean),'X','Y','Y-arrows','X-wrong','Y-axes','Z'])];
for(const code of codes) test(`reference ${code} has exact final original SVG geometry/text/semantics`,()=>{
 const {model,options}=energyReference(code);
 assert.equal(normalize(profileSVG(model,options)),normalize(source.EnergyEditor.reference(code)));
});
test('all active reference questions use their source metadata and accurate accessible descriptions',()=>{
 for(const q of bank.questions.filter(q=>q.diagram)) {
  const ref=energyProvider.resolveLink(reviewCode(q.id)),question=energyProvider.restore(ref),image=question.context.find(block=>block.kind==='image');
  assert(image);const {model,options,alt}=energyReference(q.diagram);
  assert.equal(normalize(decodeURIComponent(image.src.split(',')[1])),normalize(profileSVG(model,options)));
  assert.equal(image.alt,alt);
  if(q.diagram==='Z') assert.match(alt,/solid P.*dashed Q/);
  else assert.match(alt,new RegExp(model.p<model.r?'higher':'lower'));
 }
});
