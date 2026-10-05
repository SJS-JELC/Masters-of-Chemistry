import {suiteEvidenceFile} from '../../test-evidence.mjs';
const _migrationEvidence=(name)=>suiteEvidenceFile(import.meta.url,name);
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {bank} from '../../../../../src/activities/igcse/dot-and-cross/bank.js';
import {igcseDotCrossProvider as provider,pupilPool,reviewCode} from '../../../../../src/activities/igcse/dot-and-cross/provider.ts';
import {igcseDotCrossMarking as policy,sourceScore} from '../../../../../src/activities/igcse/dot-and-cross/marking.ts';
import {referenceRecord} from '../../../../../src/activities/igcse/dot-and-cross/types.ts';
import {dotCrossEngine,emptyDiagram} from '../../../../../src/chemistry/dot-and-cross/engine.ts';
import {modelSVG} from '../../../../../src/chemistry/dot-and-cross/model.ts';
import {createLayout} from '../../../../../src/chemistry/dot-and-cross/layout.js';
import * as Core from '../../../../../src/chemistry/dot-and-cross/core.js';
const workspace=path.resolve(import.meta.dirname,'../../../../../../..'),require=createRequire(import.meta.url);
const original=require(path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/data.js'));
const originalCore=require(path.join(workspace,'apps/Masters-of-IGCSE-Chemistry/src/activities/dot-and-cross/core.js'));
const ref=(record,level=record.grades[0]??1)=>({activityId:'igcse/dot-and-cross',questionId:record.id,seed:0,level});
const response=record=>({kind:'dot-and-cross',...structuredClone(record.reference)});
test('72 exact original records; five category/level routes;72 stable DC historic codes',()=>{
 assert.deepEqual(bank,original.questions);assert.equal(bank.length,72);const codes=new Set(),pools={};
 for(const [category,levels] of [['ionic',[1,2]],['covalent',[1,2,3]]])for(const level of levels){
  const seen=new Set();const expected=original.questions.filter(q=>{const key=q.category==='covalent'?`covalent:${q.formula}`:q.id;if(q.category!==category||!q.grades.includes(level)||seen.has(key))return false;seen.add(key);return true;});
  assert.deepEqual(pupilPool(level,category),expected);pools[`${category}:${level}`]=expected.map(q=>q.id);
  const gemId=category==='ionic'?'fourth-3-1':'fourth-3-2';
  for(const seed of [0,1,0x80000000,0xffffffff]){const selection={activityId:'igcse/dot-and-cross',gemId,level,seed,previousQuestionIds:[]};const selected=provider.select(selection);assert.deepEqual(provider.select(selection),selected);assert(expected.some(q=>q.id===selected.questionId));assert.deepEqual(provider.restore(selected).ref,selected);}
  const exhausted=expected.map(q=>q.id);assert.notEqual(provider.select({activityId:'igcse/dot-and-cross',gemId,level,seed:0,previousQuestionIds:exhausted}).questionId,exhausted.at(-1));
 }
 for(const record of bank){codes.add(reviewCode(record.id));assert.equal(provider.resolveLink(reviewCode(record.id)).questionId,record.id);assert.equal(provider.resolveLink(record.id).questionId,record.id);for(const level of record.grades.length?record.grades:[1])assert.deepEqual(provider.restore(ref(record,level)).ref,ref(record,level));}
 assert.equal(codes.size,72);assert.throws(()=>provider.select({activityId:'igcse/dot-and-cross',gemId:'fourth-3-1',level:3,seed:0,previousQuestionIds:[]}));assert.equal(provider.resolveLink('DAC-AAAAAA'),null);
 fs.writeFileSync(_migrationEvidence('coverage.json'),JSON.stringify({teacherIDs:bank.map(q=>q.id),pupilPools:pools,historicalCodes:Object.fromEntries(bank.map(q=>[q.id,reviewCode(q.id)])),extensions:bank.filter(q=>q.extension).map(q=>q.id)},null,2));
});
test('all72 references, meaningful missing electrons, malformed graph and origin/charge mistakes match original chemistry',()=>{
 const valence={H:1,C:4,Si:4,N:5,O:6,S:6,F:7,Cl:7,Br:7,I:7,Li:1,K:1,Na:1,Mg:2,Ca:2,Al:3},report=[];
 for(const raw of bank){const record=referenceRecord(raw),state=response(record),question=provider.restore(ref(record));
  assert.deepEqual(Core.validateReference(record),[]);assert.equal(state.electrons.length,state.atoms.reduce((sum,a)=>sum+valence[a.element],0));assert.equal(state.groups.reduce((sum,g)=>sum+g.charge,0),0);
  assert.equal(Core.check(state,record).correct,true);assert.equal(originalCore.check(state,raw).correct,true);assert.equal(policy.mark(question,{diagram:state}).marks.earned,1);assert(!JSON.stringify(policy.mark(question,{diagram:state})).includes('triangle'));
  const missing=structuredClone(state);missing.electrons.pop();assert.equal(dotCrossEngine.checkSubmission(missing).status,'ready');assert.equal(Core.check(missing,record).correct,originalCore.check(missing,raw).correct);assert(policy.mark(question,{diagram:missing}).marks.earned<1);
  const malformed=structuredClone(state);malformed.electrons[0].anchor={kind:'atom',atomId:'missing',slot:0};assert.equal(dotCrossEngine.checkSubmission(malformed).status,'malformed');assert.equal(policy.mark(question,{diagram:malformed}).accepted,false);assert.equal(policy.mark(question,{diagram:emptyDiagram()}).accepted,false);
  const wrongOrigin=structuredClone(state);wrongOrigin.electrons[0].symbol=wrongOrigin.electrons[0].symbol==='dot'?'cross':'dot';assert.equal(Core.check(wrongOrigin,record).correct,originalCore.check(wrongOrigin,raw).correct);assert.equal(Core.check(wrongOrigin,record).correct,false);
  if(state.groups.length){const wrongCharge=structuredClone(state);wrongCharge.groups[0].charge=0;assert.equal(Core.check(wrongCharge,record).correct,false);assert(policy.mark(question,{diagram:wrongCharge}).marks.earned<1);const unbracketed=structuredClone(state);unbracketed.groups[0].bracket=false;assert.equal(Core.check(unbracketed,record).correct,false);}
  for(const electron of state.electrons)assert(createLayout(record.id).point(state,electron.anchor));assert(modelSVG(record).includes('<svg'));
  report.push({id:record.id,reference:true,electrons:state.electrons.length,charge:0,missingElectronAssessed:true,wrongOriginRejected:true,bracketChargeVerified:!!state.groups.length,malformedBlocked:true,originalAgreement:true});
 }fs.writeFileSync(_migrationEvidence('reference-review.json'),JSON.stringify(report,null,2));
});
test('name/formula/inference/scaffolds and extension limits remain IGCSE-specific',()=>{
 const salt=bank.find(q=>q.id==='mgcl2'),level1=provider.restore(ref(salt,1)),level2=provider.restore(ref(salt,2));
 assert(level1.title.includes('Magnesium chloride, MgCl₂'));assert(level2.title.includes('Magnesium chloride'));assert(!level2.title.includes('MgCl'));assert(!JSON.stringify(level2.context).includes('MgCl'));
 for(const raw of bank){const q=provider.restore(ref(raw));assert.equal(q.scaffolds[0].content[0].text,raw.prompt);if(raw.category==='covalent'){assert(!q.title.includes(raw.name));assert(q.workedAnswer[0].text.includes(raw.name));}}
 const ether=bank.find(q=>q.id==='dimethylether'),ethanol=bank.find(q=>q.id==='ethanol');assert.equal(Core.check(response(ether),referenceRecord(ethanol)).correct,true);
 assert(pupilPool(3,'covalent').every(q=>q.category==='covalent'&&!q.extension));assert(!pupilPool(1).some(q=>q.extension));
 for(const id of ['propane','propene'])assert(provider.restore(ref(bank.find(q=>q.id===id))).workedAnswer.some(block=>block.kind==='text'&&block.text.startsWith('Extension: this three-carbon')));
 const alone={kind:'dot-and-cross',atoms:[{id:'a1',element:'H',x:100,y:100}],electrons:[],groups:[]};assert.equal(sourceScore(alone,'h2o'),0);
});
test('saved drawings/history roundtrip through unchanged checked semantic editor',()=>{
 let state=emptyDiagram();state=dotCrossEngine.apply(state,{type:'atom',element:'Na',point:{x:400,y:325}});state=dotCrossEngine.apply(state,{type:'group',atomIds:['a1'],charge:1,bracket:true});
 const saved=JSON.parse(JSON.stringify(state));assert.equal(saved.history.length,2);const undone=dotCrossEngine.apply(saved,{type:'undo'});assert.equal(undone.groups.length,0);assert.deepEqual(dotCrossEngine.apply(undone,{type:'redo'}).groups,saved.groups);
});
test('IGCSE representation domain rejects triangle/B/P; valid wrong inventories remain assessable',()=>{
 const raw=bank.find(q=>q.id==='h2o'),question=provider.restore(ref(raw));
 for(const symbol of ['triangle']){const state=response(raw);state.electrons[0].symbol=symbol;assert(originalCore.validateState(state).length);assert.equal(policy.mark(question,{diagram:state}).accepted,false);}
 for(const element of ['B','P']){const state=response(raw);state.atoms[0].element=element;assert(originalCore.validateState(state).length);assert.equal(policy.mark(question,{diagram:state}).accepted,false);}
 const state=response(raw);state.atoms[0].element='N';assert.deepEqual(originalCore.validateState(state),[]);assert.equal(policy.mark(question,{diagram:state}).accepted,true);assert(policy.mark(question,{diagram:state}).marks.earned<1);
});
