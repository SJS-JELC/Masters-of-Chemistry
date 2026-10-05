import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {data as D} from '../../../src/chemistry/electron-configuration/data.js';
import * as C from '../../../src/chemistry/electron-configuration/core.js';
import {variants,matchingFamilies,matchingFromId,format,capacity,getVariant} from '../../../src/chemistry/electron-configuration/identity.ts';
import {blankState,referenceState,integrity,sourceResponse,apply} from '../../../src/chemistry/electron-configuration/engine.ts';
import {electronConfigurationsProvider as provider,allowedVariants} from '../../../src/activities/alevel/electron-configurations/provider.ts';
import {electronConfigurationsMarking as policy} from '../../../src/activities/alevel/electron-configurations/marking.ts';
import {electronConfigurationsAdapter as adapter} from '../../../src/activities/alevel/electron-configurations/index.ts';
import {electronsBondingProvider as bondingProvider} from '../../../src/activities/alevel/electrons-bonding/provider.ts';
import {electronsBondingMarking as bondingPolicy} from '../../../src/activities/alevel/electrons-bonding/marking.ts';
import {data as B} from '../../../src/activities/alevel/electrons-bonding/data.js';
import * as BC from '../../../src/activities/alevel/electrons-bonding/core.js';
import {createActiveClock} from '../../../src/domain/timing/index.ts';
import {createAttemptController,assessmentToEvidence} from '../../../src/domain/attempt/index.ts';
import {diagramImage} from '../../../src/chemistry/electron-configuration/display.ts';
import {periodicData} from '../../../src/chemistry/electron-configuration/periodic-data.ts';
const project=path.resolve(import.meta.dirname,'../../..'),original=path.resolve(project,'../Masters-of-A-Level-Chemistry/src');
const source=vm.createContext({});
for(const relative of ['assets/question-review.js','assets/periodic-table-data.js','activities/electron-configurations/data.js','activities/electron-configurations/core.js','activities/electron-configurations/session.js','activities/electron-configurations/levels.js','activities/electrons-bonding/data.js','activities/electrons-bonding/core.js'])vm.runInContext(fs.readFileSync(path.join(original,relative),'utf8'),source);
const plain=value=>JSON.parse(JSON.stringify(value));
const ref=q=>({activityId:'alevel/electron-configurations',questionId:q.questionId,seed:0,level:q.kind==='bonus'?3:q.minimumLevel});
const coverage={};
test('complete exact source species, atom and fixed bonding data + reference source fingerprints',()=>{
 assert.deepEqual(periodicData,plain(source.PeriodicTableData));assert.equal(periodicData.elements.length,114);assert.deepEqual(periodicData.omittedAtomicNumbers,[113,115,117,118]);assert.equal(periodicData.elements.find(e=>e.z===43).mass,null);assert.equal(periodicData.elements.find(e=>e.z===61).mass,'144.9');
 assert.deepEqual(D,plain(source.ElectronData));assert.deepEqual(B,plain(source.BondingData));assert.equal(D.species.length,71);assert.equal(D.atoms.length,36);assert.equal(B.questions.length,14);assert.equal(C.validateBank(),true);
 for(const item of JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'source-fingerprints.json'),'utf8'))){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(project,'../..',item.path))).digest('hex'),item.sha256);}
});
test('every564 stable main ID, complete156/340/564 level routes, exact historic key hash, all correct and wrong fixtures',()=>{
 const sourceBank=source.QuestionReview.bank('EC',source.ElectronData.species.flatMap(item=>source.ElectronData.representations.filter(rep=>rep.id!=='short'||source.ElectronCore.coreOptions(item).length).flatMap(rep=>['build','identify'].map(direction=>({kind:'main',speciesId:item.id,representation:rep.id,direction,skill:`${direction}:${rep.id}`})))),q=>`${q.speciesId}:${q.skill}`);
 assert.equal(variants.length,564);assert.equal(new Set(variants.map(q=>q.questionId)).size,564);assert.equal(matchingFamilies.length,10);
 assert.deepEqual([1,2,3].map(level=>allowedVariants(level).length),[156,340,564]);
 const fixtures=[];
 for(const q of variants){assert.equal(sourceBank.id({...q,skill:`${q.direction}:${q.representation}`}),q.questionId);assert.deepEqual(provider.resolveLink(q.questionId),ref(q));const question=provider.restore(ref(q));assert.deepEqual(provider.restore(plain(ref(q))),question);const answer=referenceState(q.speciesId,q.representation);const expected=source.ElectronCore.mark(q,sourceResponse(answer));assert.equal(expected.correct,true);assert.deepEqual(C.mark(q,sourceResponse(answer)),plain(expected));const marked=policy.mark(question,{configuration:answer});assert(marked.accepted);assert.equal(marked.marks.earned,1);assert.equal(adapter.idleAllowance(question),q.direction==='identify'?60000:180000);
  const wrong=plain(answer);if(q.direction==='identify')wrong.identity='not-an-element';else if(['row','energy'].includes(q.representation))wrong.boxes[0][0]=0;else wrong.counts[0]='99';const incorrect=policy.mark(question,{configuration:wrong});assert(incorrect.accepted);assert.equal(incorrect.marks.earned,0);assert.deepEqual(C.mark(q,sourceResponse(wrong)),plain(source.ElectronCore.mark(q,sourceResponse(wrong))));
  const incomplete=plain(answer);if(q.direction==='identify')incomplete.identity='';else if(q.representation==='short')incomplete.core='';else if(['row','energy'].includes(q.representation))incomplete.boxes[0]=[];else incomplete.counts[0]='a';assert.equal(policy.mark(question,{configuration:incomplete}).accepted,false);
  const malformed=plain(answer);malformed.boxes[0]=[4];assert.equal(integrity(malformed).status,'malformed');assert.equal(policy.mark(question,{configuration:malformed}).accepted,false);
  fixtures.push({id:q.questionId,species:q.speciesId,representation:q.representation,direction:q.direction,minimumLevel:q.minimumLevel,correct:true,wrongAssessed:true,incompleteBlocked:true,malformedBlocked:true,idleMs:adapter.idleAllowance(question)});
 }
 coverage.variants=fixtures;coverage.levels=Object.fromEntries([1,2,3].map(level=>[level,allowedVariants(level).map(q=>q.questionId)]));fs.writeFileSync(path.join(import.meta.dirname,'coverage.json'),JSON.stringify(coverage,null,2));
});
test('all15 ECB masks with exact seeded source ordering; all10 families observed; matching correct/empty/wrong boundaries',()=>{
 const seen=new Set(),masks=[];let valid=0,rejected=0;
 for(let mask=0;mask<16;mask++)for(let base=0;base<180;base++){
  const id=format('ECB',base*16+mask);let expected;try{expected=plain(source.ElectronSession.bonusFromReviewId(id));}catch{assert.throws(()=>matchingFromId(id));assert.equal(provider.resolveLink(id),null);rejected++;continue;}
  const actual=matchingFromId(id);assert.deepEqual(actual.counts,expected.counts);assert.deepEqual(actual.options,expected.options);assert.equal(actual.mask,mask);const question=provider.restore(ref(actual));assert.equal(adapter.idleAllowance(question),180000);
  const answer={...blankState(),selectedSpeciesIds:actual.options.filter(id=>C.same(C.species(id).counts,actual.counts))};const result=policy.mark(question,{configuration:answer});assert(result.accepted&&result.marks.earned===1);const empty=policy.mark(question,{configuration:blankState()});assert(empty.accepted&&empty.marks.earned===0);const invalid={...answer,selectedSpeciesIds:['does-not-exist']};assert.equal(policy.mark(question,{configuration:invalid}).accepted,false);const wrong={...answer,selectedSpeciesIds:actual.options};assert.equal(policy.mark(question,{configuration:wrong}).marks.earned,0);
  if(mask===15)seen.add(actual.counts.join(','));valid++;if(base===0)masks.push({mask,id,counts:actual.counts,options:actual.options});
 }
 assert.equal(seen.size,10);assert.equal(matchingFamilies.length,seen.size);for(const family of matchingFamilies)assert(seen.has(family.counts.join(',')));
 const max=format('ECB',capacity-1);assert.deepEqual(matchingFromId(max).options,plain(source.ElectronSession.bonusFromReviewId(max).options));
 fs.writeFileSync(path.join(import.meta.dirname,'matching.json'),JSON.stringify({validFixtures:valid,rejectedMasksOrImpossibleFamilies:rejected,allFamilies:[...seen],masks},null,2));
});
test('substantive independent orbital chemistry: capacity, signed electron balance, transition removal, Cr/Cu exceptions, Hund/spin failures',()=>{
 const records=[];
 for(const item of D.species){assert.equal(item.counts.reduce((a,b)=>a+b,0),item.z-item.charge);item.counts.forEach((count,i)=>assert(count>=0&&count<=D.capacities[i]));
  if(item.group==='d-ions'){const atom=D.atoms.find(a=>a.symbol===item.symbol);const expected=atom.counts.slice();let remove=item.charge;const fourS=Math.min(expected[6],remove);expected[6]-=fourS;remove-=fourS;expected[5]-=remove;assert.deepEqual(item.counts,expected);}
  const boxed=C.boxes(item.counts);for(let i=0;i<8;i++){assert.equal(boxed[i].filter(n=>n===3).length,Math.max(0,item.counts[i]-D.orbitals[i]));assert.equal(boxed[i].reduce((n,s)=>n+(s===3?2:s?1:0),0),item.counts[i]);}
  records.push({id:item.id,z:item.z,charge:item.charge,electrons:item.z-item.charge,counts:item.counts,conserved:true,dIon4sRemoval:item.group==='d-ions'});
 }
 assert.equal(C.species('Cr').counts[5],5);assert.equal(C.species('Cr').counts[6],1);assert.equal(C.species('Cu').counts[5],10);assert.equal(C.species('Cu').counts[6],1);
 const carbon={kind:'main',speciesId:'C',direction:'build',representation:'row'},answer=referenceState('C','row');const prematurePair={...answer,boxes:answer.boxes.map((row,i)=>i===2?[3,0,0]:row)};assert.equal(C.mark(carbon,sourceResponse(prematurePair)).correct,false);assert(C.mark(carbon,sourceResponse(prematurePair)).issues.some(i=>i.includes('singly')));
 const nonparallel={...answer,boxes:answer.boxes.map((row,i)=>i===2?[1,2,0]:row)};assert.equal(C.mark(carbon,sourceResponse(nonparallel)).correct,false);const allDown={...answer,boxes:answer.boxes.map(row=>row.map(s=>s===1?2:s))};assert.equal(C.mark(carbon,sourceResponse(allDown)).correct,true);
 assert.equal(C.mark({kind:'main',speciesId:'Ne',direction:'build',representation:'short'},sourceResponse({...blankState(),core:'Ne'})).correct,false);assert.equal(C.mark({kind:'main',speciesId:'Na:1',direction:'build',representation:'short'},sourceResponse({...blankState(),core:'Ne'})).correct,true);
 const chromiumWrong=referenceState('Cr','full');const aufbau={...chromiumWrong,counts:chromiumWrong.counts.map((n,i)=>i===5?'4':i===6?'2':n)};assert.equal(C.mark({kind:'main',speciesId:'Cr',direction:'build',representation:'full'},sourceResponse(aufbau)).correct,false);
 assert.deepEqual(C.energyOrder(),[0,1,2,3,4,6,5,7]);fs.writeFileSync(path.join(import.meta.dirname,'chemistry-reference.json'),JSON.stringify(records,null,2));
});
test('all14 bonding concept marks exact, blank blocked, rejected misconception and partial points preserved',()=>{
 for(const record of B.questions){const question=bondingProvider.restore({activityId:'alevel/electrons-bonding',questionId:record.id,seed:0,level:1});assert.equal(question.context[0].text,record.prompt);assert.deepEqual(question.workedAnswer.map(block=>block.text),[record.sourceAnswer.includes(';')?'Accepted alternatives: '+record.sourceAnswer:record.sourceAnswer,...record.points,record.feedback]);assert.equal(bondingProvider.resolveLink(record.id).questionId,record.id);
  const model={kind:'text',value:record.fields[0].accept[0]},correct=bondingPolicy.mark(question,{'answer-0':model});assert(correct.accepted);assert.equal(bondingPolicy.masteryScore(correct.marks),1);assert.equal(bondingPolicy.mark(question,{'answer-0':{kind:'text',value:''}}).accepted,false);
  for(const value of [...record.fields[0].accept,...record.fields[0].reject,'unrelated content','not '+record.sourceAnswer]){assert.deepEqual(BC.mark(record,[value],B),plain(source.BondingCore.mark(record,[value],source.BondingData)));const result=bondingPolicy.mark(question,{'answer-0':{kind:'text',value}});assert.equal(result.accepted,true);assert.equal(bondingPolicy.masteryScore(result.marks),source.BondingCore.score(source.BondingCore.mark(record,[value],source.BondingData).marks));}
 }
 const partial=bondingPolicy.mark(bondingProvider.restore(bondingProvider.resolveLink('EB01')),{'answer-0':{kind:'text',value:'A region of space around the nucleus.'}});assert(partial.accepted);assert.equal(partial.marks.earned,1);assert.equal(bondingPolicy.masteryScore(partial.marks),0.5);
});
test('all-level route scheduling, direction and representation balancing, JSON roundtrip editor, no immediate species repeats',()=>{
 for(const level of [1,2,3]){const previousQuestionIds=[],directions=new Set(),reps=new Set(),groups=new Set();for(let n=0;n<150;n++){const selection={activityId:'alevel/electron-configurations',gemId:'l6-t2-1-2',level,seed:n*7919,previousQuestionIds};const selected=provider.select(selection);assert.deepEqual(selected,provider.select(selection));const q=getVariant(selected.questionId),previous=previousQuestionIds.length?getVariant(previousQuestionIds.at(-1)):null;if(q.kind==='main'){directions.add(q.direction);reps.add(q.representation);groups.add(q.group);if(previous?.kind==='main')assert.notEqual(q.speciesId,previous.speciesId);}else groups.add('matching');assert.deepEqual(provider.restore(selected).ref,selected);previousQuestionIds.push(selected.questionId);}
  assert.equal(directions.size,2);assert.equal(reps.size,level===1?3:4);assert.equal(groups.size,level===1?1:level===2?2:5);
 }
 let state=blankState();state=apply(state,{kind:'spin',index:2,orbital:1,value:2});state=apply(state,{kind:'count',index:3,value:'2'});state=apply(state,{kind:'core',value:'He'});state=apply(state,{kind:'identity',value:'Aluminum'});assert.deepEqual(plain(state),state);assert.equal(integrity(plain(state)).status,'ready');assert.equal(apply(state,{kind:'clear'}).identity,'');assert.throws(()=>apply(state,{kind:'spin',index:2,orbital:3,value:1}));assert.equal(provider.resolveLink('EC-ZZZZZZ'),null);assert.throws(()=>provider.restore({...provider.resolveLink(variants[0].questionId),seed:-1}));
});
test('production controller freezes source wrong first response/time and preserves it through correction/reload, no teacher evidence',()=>{
 const q=variants.find(q=>q.speciesId==='C'&&q.direction==='build'&&q.representation==='row'),question=provider.restore(ref(q)),limit=adapter.idleAllowance(question);let sample={monotonicMs:0,wallMs:1000,visible:true,focused:true};const id='a11-fixture';const clock=createActiveClock({attemptId:id,idleLimitMs:limit,now:()=>sample});const state={mode:'student',namespace:{course:'alevel',profileId:'fixture'},attemptId:id,ref:question.ref,target:{course:'alevel',activityId:'alevel/electron-configurations',gemId:'l6-t2-1-2',level:1},currentResponses:{},assistance:[],phase:'answering',timing:clock.checkpoint(),finished:false};let controller=createAttemptController({question,state,policy,clock,sample:()=>sample});
 assert.equal(controller.dispatch({kind:'submit',at:1000}).accepted,false);assert.equal(controller.state().phase,'answering');controller.dispatch({kind:'respond',partId:'configuration',response:blankState()});sample={...sample,monotonicMs:1800,wallMs:2800};assert.equal(controller.dispatch({kind:'submit',at:2800}).accepted,true);const first=plain(controller.state()),evidence=assessmentToEvidence(first);assert.equal(first.firstAssessment.score,0);assert.equal(first.firstResponse.timing.activeMs,1800);
 controller.dispatch({kind:'respond',partId:'configuration',response:referenceState('C','row')});const correction=controller.dispatch({kind:'check-correction'});assert.equal(correction.correctionFeedback.status,'correct');assert.deepEqual(controller.state().firstResponse,first.firstResponse);assert.deepEqual(assessmentToEvidence(controller.state()),evidence);
 const restored=plain(controller.state());sample={...sample,monotonicMs:10000,wallMs:11000};const restoredClock=createActiveClock({attemptId:id,idleLimitMs:limit,saved:restored.timing,completed:true,now:()=>sample});controller=createAttemptController({question,state:restored,policy,clock:restoredClock,sample:()=>sample});assert.equal(controller.dispatch({kind:'submit',at:11000}).accepted,false);assert.deepEqual(assessmentToEvidence(controller.state()),evidence);assert.equal(assessmentToEvidence({mode:'teacher',ref:question.ref,currentResponses:{}}),null);
});
test('all71 species × both diagrams produce valid escaped SVG model semantics',()=>{
 assert.equal(integrity({...blankState(),core:'Xe'}).status,'malformed');assert.throws(()=>provider.select({activityId:'alevel/electron-configurations',level:4,seed:0,previousQuestionIds:[]}));
 const images=[];for(const species of D.species)for(const layout of ['row','energy']){const image=decodeURIComponent(diagramImage(species.counts,layout).split(',')[1]);assert(image.startsWith('<svg '));assert(image.endsWith('</svg>'));assert.equal((image.match(/<rect /g)||[]).length,18);assert(!image.includes('undefined'));images.push({id:species.id,layout,sha256:crypto.createHash('sha256').update(image).digest('hex')});}fs.writeFileSync(path.join(import.meta.dirname,'model-fingerprints.json'),JSON.stringify(images,null,2));
});
