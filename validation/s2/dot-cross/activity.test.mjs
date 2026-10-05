import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {bank} from '../../../src/activities/alevel/dot-and-cross/bank.js';
import {dotCrossProvider,pupilPool,reviewCode} from '../../../src/activities/alevel/dot-and-cross/provider.ts';
import {dotCrossMarking,sourceScore} from '../../../src/activities/alevel/dot-and-cross/marking.ts';
import {dotCrossEngine,emptyDiagram} from '../../../src/chemistry/dot-and-cross/engine.ts';
import {createLayout} from '../../../src/chemistry/dot-and-cross/layout.js';
import {modelSVG} from '../../../src/chemistry/dot-and-cross/model.ts';
import * as Core from '../../../src/chemistry/dot-and-cross/core.js';
const workspace=path.resolve(import.meta.dirname,'../../../../..'),require=createRequire(import.meta.url);
const original=require(path.join(workspace,'apps/Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/data.js'));
const ref=(record,level=record.grades[0])=>({activityId:'alevel/dot-and-cross',questionId:record.id,seed:0,level});
const response=record=>({kind:'dot-and-cross',...structuredClone(record.reference)});
test('all91 exact complete records; every level route and historic code is retained',()=>{
 assert.deepEqual(bank,original.questions);assert.equal(bank.length,91);const codes=new Set();const pools={};
 for(const level of [1,2,3]){const seen=new Set();const expected=original.questions.filter(q=>{const key=q.practiceCategory==='covalent'&&!q.namedSpecies?`covalent:${q.formula}`:q.id;if(!q.grades.includes(level)||seen.has(key))return false;seen.add(key);return true;});assert.deepEqual(pupilPool(level).map(q=>q.id),expected.map(q=>q.id));pools[level]=expected.map(q=>q.id);}
 for(const record of bank){codes.add(reviewCode(record.id));assert.equal(dotCrossProvider.resolveLink(reviewCode(record.id)).questionId,record.id);assert.equal(dotCrossProvider.resolveLink(record.id).questionId,record.id);for(const level of record.grades){const identity=ref(record,level);assert.deepEqual(dotCrossProvider.restore(identity).ref,identity);}}
 assert.equal(codes.size,91);fs.writeFileSync(path.join(import.meta.dirname,'coverage.json'),JSON.stringify({teacherIDs:bank.map(q=>q.id),pupilPools:pools,historicalCodes:Object.fromEntries(bank.map(q=>[q.id,reviewCode(q.id)])),historicalGemAliases:{'l6-t2-1-4':'l6-t2-1-3'}},null,2));
});
test('reference/charge/electron conservation and meaningful wrong alternatives for every record',()=>{
 const report=[];const valence={H:1,B:3,C:4,Si:4,N:5,O:6,P:5,S:6,F:7,Cl:7,Br:7,I:7,Li:1,K:1,Na:1,Mg:2,Ca:2,Al:3};
 for(const record of bank){const state=response(record),question=dotCrossProvider.restore(ref(record));assert.deepEqual(Core.validateReference(record),[]);assert.equal(state.electrons.length,state.atoms.reduce((sum,a)=>sum+valence[a.element],0)-record.totalCharge);assert.equal(state.groups.reduce((sum,g)=>sum+g.charge,0),record.totalCharge);assert.equal(Core.check(state,record).correct,true);const correct=dotCrossMarking.mark(question,{diagram:state});assert(correct.accepted);assert.equal(correct.marks.earned,1);assert.equal(correct.marks.points.reduce((n,p)=>n+p.available,0),correct.marks.available);
  const missing=structuredClone(state);missing.electrons.pop();assert.equal(dotCrossEngine.checkSubmission(missing).status,'ready');const wrong=dotCrossMarking.mark(question,{diagram:missing});assert(wrong.accepted);assert(wrong.marks.earned<1);
  const malformed=structuredClone(state);malformed.electrons[0].anchor={kind:'atom',atomId:'missing',slot:0};assert.equal(dotCrossEngine.checkSubmission(malformed).status,'malformed');assert.equal(dotCrossMarking.mark(question,{diagram:malformed}).accepted,false);
  assert.equal(dotCrossMarking.mark(question,{diagram:emptyDiagram()}).accepted,false);
  const layout=createLayout(record.id);for(const electron of state.electrons)assert(layout.point(state,electron.anchor));assert(modelSVG(record).includes('<svg'));
  report.push({id:record.id,reference:true,electronCount:state.electrons.length,totalCharge:record.totalCharge,wrongAssessed:true,malformedBlocked:true,renderable:true});
 }fs.writeFileSync(path.join(import.meta.dirname,'reference-review.json'),JSON.stringify(report,null,2));
});
test('excessive valence is wrong; absence of electrons earns no vacuous partial credit',()=>{
 const water=bank.find(q=>q.id==='h2o'),state=response(water);state.electrons.push({id:'extra',symbol:'dot',anchor:{kind:'atom',atomId:'O1',slot:2}});assert.equal(dotCrossEngine.checkSubmission(state).status,'ready');assert.equal(Core.check(state,water).correct,false);
 const alone={kind:'dot-and-cross',atoms:[{id:'a1',element:'H',x:100,y:100}],electrons:[],groups:[]};assert.equal(sourceScore(alone,'h2o'),0);
});
test('history is semantic, bounded and roundtrips restore/undo/redo',()=>{
 let state=emptyDiagram();state=dotCrossEngine.apply(state,{type:'atom',element:'H',point:{x:400,y:325}});state=dotCrossEngine.apply(state,{type:'atom',element:'H',point:{x:456,y:325}});state=dotCrossEngine.apply(state,{type:'electron',symbol:'dot',anchor:{kind:'bond',a:'a1',b:'a2',slot:0}});
 const saved=JSON.parse(JSON.stringify(state));assert.equal(saved.history.length,3);const undone=dotCrossEngine.apply(saved,{type:'undo'});assert.equal(undone.electrons.length,0);const redone=dotCrossEngine.apply(undone,{type:'redo'});assert.deepEqual(redone.electrons,saved.electrons);assert(redone.history.every(item=>!('history' in item)&&!('future' in item)));
 for(let index=0;index<110;index++)state=dotCrossEngine.apply(state,{type:'move',ids:['a1'],dx:index%2?1:-1,dy:0});assert.equal(state.history.length,100);
});
test('seed selections are deterministic, alternate source categories and support merged historic alias',()=>{
 for(const level of [1,2,3])for(const seed of [0,1,2,0xffffffff]){const input={activityId:'alevel/dot-and-cross',gemId:'l6-t2-1-3',level,seed,previousQuestionIds:[]};const selected=dotCrossProvider.select(input);assert.deepEqual(dotCrossProvider.select(input),selected);assert(pupilPool(level).some(q=>q.id===selected.questionId));assert.deepEqual(dotCrossProvider.restore(selected).ref,selected);assert.deepEqual(dotCrossProvider.select({...input,gemId:'l6-t2-1-4'}),selected);}
 assert.throws(()=>dotCrossProvider.restore({...ref(bank[0]),seed:-1}));assert.equal(dotCrossProvider.resolveLink('DAC-ZZZZZZ'),null);
});
test('formula-only isomer prompts and level1/2 independent category refill match active source',()=>{
 const ethanol=bank.find(q=>q.id==='ethanol'),question=dotCrossProvider.restore(ref(ethanol));assert(!question.title.toLowerCase().includes('ethanol'));assert(!JSON.stringify(question.context).toLowerCase().includes('ethanol'));assert(question.workedAnswer[0].text.startsWith('One valid example: Ethanol'));
 const salt=dotCrossProvider.restore(ref(bank.find(q=>q.id==='nacl')));assert(salt.title.includes('Sodium chloride'));assert(salt.context[0].text.includes('NaCl')||salt.context[0].text.includes('NaCl'));
 for(const level of [1,2]){const pool=pupilPool(level),ionic=pool.filter(q=>q.practiceCategory==='ionic'),covalent=pool.filter(q=>q.practiceCategory==='covalent');const exhausted=[...covalent.map(q=>q.id),ionic[0].id];const selected=dotCrossProvider.select({activityId:'alevel/dot-and-cross',gemId:'l6-t2-1-3',level,seed:0,previousQuestionIds:exhausted});assert.equal(bank.find(q=>q.id===selected.questionId).practiceCategory,'covalent');}
 const pool3=pupilPool(3),previous=pool3[0].id,remaining=pool3.filter(q=>q.id!==previous);const selection=dotCrossProvider.select({activityId:'alevel/dot-and-cross',level:3,seed:0,previousQuestionIds:[previous]});assert.equal(selection.questionId,remaining[0].id);
});
