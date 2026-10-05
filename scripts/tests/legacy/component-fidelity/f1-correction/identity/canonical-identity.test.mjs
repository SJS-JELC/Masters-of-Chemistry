import {suiteEvidenceFile} from '../../../test-evidence.mjs';
const _migrationEvidence=(name)=>suiteEvidenceFile(import.meta.url,name);
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {canonicalQuestionPattern,isCanonicalQuestionId,fixedIdentity} from '../../../../../../src/content/canonical-identity.ts';
import {acidEngine} from '../../../../../../src/activities/alevel/acid-base-calculations/engine.js';
import {acidProvider,acidRef} from '../../../../../../src/activities/alevel/acid-base-calculations/provider.ts';
import {acidMarking} from '../../../../../../src/activities/alevel/acid-base-calculations/marking.ts';
import {acidAdapter} from '../../../../../../src/activities/alevel/acid-base-calculations/index.ts';
import {acidCode,decodeAcidCode,acidTemplateIds,acidMaximumSeed,acidSeedCount,acidConfigurationRadix,acidCodeCapacity} from '../../../../../../src/activities/alevel/acid-base-calculations/identity.ts';
import {electronsBondingProvider as eb,bondingCode} from '../../../../../../src/activities/alevel/electrons-bonding/provider.ts';
import {electronsBondingMarking} from '../../../../../../src/activities/alevel/electrons-bonding/marking.ts';
import {data as ebData} from '../../../../../../src/activities/alevel/electrons-bonding/data.js';
import {mark as sourceBondingMark} from '../../../../../../src/activities/alevel/electrons-bonding/core.js';
import {titrationProvider as tc,bank as tcBank,reviewCode as tcCode} from '../../../../../../src/activities/alevel/ph-titration-curves/provider.ts';
import {titrationMarking} from '../../../../../../src/activities/alevel/ph-titration-curves/marking.ts';
import {answer as tcAnswer,grade as tcGrade} from '../../../../../../src/chemistry/titration-curve/core.js';
import {dotCrossProvider as dac,reviewCode as dacCode} from '../../../../../../src/activities/alevel/dot-and-cross/provider.ts';
import {bank as dacBank} from '../../../../../../src/activities/alevel/dot-and-cross/bank.js';
import {dotCrossMarking} from '../../../../../../src/activities/alevel/dot-and-cross/marking.ts';
import {igcseDotCrossProvider as dc,reviewCode as dcCode} from '../../../../../../src/activities/igcse/dot-and-cross/provider.ts';
import {bank as dcBank} from '../../../../../../src/activities/igcse/dot-and-cross/bank.js';
import {igcseDotCrossMarking} from '../../../../../../src/activities/igcse/dot-and-cross/marking.ts';
import {energyProvider as ee,reviewCode as eeCode,bank as eeBank} from '../../../../../../src/activities/igcse/energy-enthalpy/provider.ts';
import {energyMarking} from '../../../../../../src/activities/igcse/energy-enthalpy/marking.ts';
import {check as energySourceCheck,markField as energySourceField} from '../../../../../../src/activities/igcse/energy-enthalpy/source-core.js';
import {modelProfile} from '../../../../../../src/chemistry/energy-profile/index.ts';
import {practicalProvider as ep} from '../../../../../../src/activities/igcse/energetics-practical/provider.ts';
import {structureProvider as sbc} from '../../../../../../src/activities/igcse/structure-and-bonding/provider.ts';
import {electronConfigurationsProvider as ec} from '../../../../../../src/activities/alevel/electron-configurations/provider.ts';
import {electronConfigurationsMarking} from '../../../../../../src/activities/alevel/electron-configurations/marking.ts';
import {variants,matchingFromId,capacity as ecCapacity} from '../../../../../../src/chemistry/electron-configuration/identity.ts';
import {referenceState,blankState} from '../../../../../../src/chemistry/electron-configuration/engine.ts';
import {same as sameConfiguration,species} from '../../../../../../src/chemistry/electron-configuration/core.js';
import {calorimetryProvider as cal} from '../../../../../../src/activities/igcse/calorimetry/provider.ts';
import {bondProvider as be} from '../../../../../../src/activities/igcse/bond-enthalpy/provider.ts';
import {resolveCompatibilityLink} from '../../../../../../src/compatibility/links.ts';
import {teacherCatalogue} from '../../../../../../src/ui/teacher-catalogue.ts';
import {canonical} from '../../../../../../src/persistence/validation.ts';
const out=import.meta.dirname,summary={};
const providers=[['alevel/electrons-bonding',eb,[1]],['alevel/ph-titration-curves',tc,[2,3]],['alevel/dot-and-cross',dac,[1,2,3]],['igcse/dot-and-cross',dc,[1,2,3]],['igcse/energy-enthalpy',ee,[1,2]],['igcse/energetics-practical',ep,[2,3]],['igcse/structure-and-bonding',sbc,[2,3]],['alevel/electron-configurations',ec,[1,2,3]]];
const copy=x=>JSON.parse(JSON.stringify(x));
test('all fixed banks canonical, unique, exhaustive, reproducible; source IDs rejected and links canonical',async()=>{
 const globalIds=new Set();
 for(const [activityId,provider]of providers){const ids=provider.coverage.flatMap(c=>c.kind==='fixed'?c.questionIds:[]);assert.equal(new Set(ids).size,ids.length);for(const id of ids){assert(canonicalQuestionPattern.test(id),id);assert(isCanonicalQuestionId(activityId,id));assert(!globalIds.has(id),id);globalIds.add(id);const ref=provider.resolveLink(id);assert(ref,id);assert.equal(ref.questionId,id);const q=provider.restore(ref);assert.deepEqual(q.ref,ref);assert.equal(canonical(provider.restore(copy(ref))),canonical(q));const resolved=await resolveCompatibilityLink(activityId.split('/')[0],`?activity=${encodeURIComponent(activityId)}&code=${id}&level=${ref.level}&seed=${ref.seed}`);assert.equal(resolved.kind,'curriculum',id);assert.deepEqual(resolved.ref,ref);}
 summary[activityId]={fixedCount:ids.length,unique:true,restoreAndCanonicalLinks:true};}
 for(const [provider,sourceBank,code]of [[eb,ebData.questions,bondingCode],[tc,tcBank,tcCode],[dac,dacBank,dacCode],[dc,dcBank,dcCode],[ee,eeBank.questions,eeCode]])for(const q of sourceBank){assert.equal(provider.resolveLink(q.id),null);const ref=provider.resolveLink(code(q.id));assert.throws(()=>provider.restore({...ref,questionId:q.id}));}
 assert.equal(sbc.resolveLink('water-sodium-chloride-melting:2'),null);assert.equal(acidProvider.resolveLink('AB2-0-1-1'),null);
 summary.fixedTotal=globalIds.size;
});
test('acid exhaustive configuration and generated boundary roundtrip without collisions, unsupported space rejected',()=>{
 const codes=new Set();let configs=0;
 for(const templateId of acidTemplateIds)for(const level of [1,2,3]){
  const supported=acidEngine.scopes.some(s=>s.levels[level].includes(templateId));
  if(!supported){assert.throws(()=>acidEngine.generate(templateId,level,0));continue;}configs++;
  const seeds=new Set([0,1,35,36,712345,acidMaximumSeed-1,acidMaximumSeed]);
  for(let i=0;i<80;i++)seeds.add((Math.imul(i+1,2654435761)>>>0)%acidSeedCount);
  for(const seed of seeds){const code=acidCode(templateId,level,seed);assert(!codes.has(code),code);codes.add(code);assert.deepEqual(decodeAcidCode(code),{templateId,level,seed});assert.deepEqual(acidEngine.decodeCanonical(code),{templateId,level,seed});const q=acidEngine.generate(templateId,level,seed);const ref=acidRef(q);assert.equal(ref.questionId,code);assert.deepEqual(acidProvider.resolveLink(code),ref);assert.deepEqual(acidProvider.restore(ref).ref,ref);assert.throws(()=>acidProvider.restore({...ref,seed:seed+1}));assert.throws(()=>acidProvider.restore({...ref,level:level===1?2:1}));}
  for(const seed of [-1,acidSeedCount,0xffffffff,0.5,NaN])assert.throws(()=>acidEngine.generate(templateId,level,seed));
 }
 for(const invalid of ['AB-00000','AB-0000000','ab-000000','AB2-0-1-1','ABL-000000'])assert.throws(()=>decodeAcidCode(invalid));
 const firstUnused=(acidSeedCount*acidConfigurationRadix).toString(36).toUpperCase().padStart(6,'0');assert.throws(()=>decodeAcidCode('AB-'+firstUnused));assert(acidSeedCount*acidConfigurationRadix<=acidCodeCapacity);
 summary.acid={configurations:configs,testedDistinctCodes:codes.size,seedCount:acidSeedCount,maximumSeed:acidMaximumSeed,reversible:true};
});
test('252 pre-change acid content fixtures and all rounding/marking preserved; timing derived canonical',()=>{
 const fixtures=JSON.parse(fs.readFileSync(path.join(out,'../../../../fixtures/legacy/component-fidelity/f1-correction/identity/acid-pre-correction-fixtures.json'),'utf8'));
 for(const fixture of fixtures){const q=acidEngine.generate(fixture.templateId,fixture.level,fixture.seed),{reviewId,...content}=q;assert.deepEqual(copy(content),fixture);const question=acidProvider.restore(acidRef(q));const responses=Object.fromEntries(q.responses.map(p=>[p.key,{kind:'numeric',raw:String(p.expected),unit:p.unit}]));const marked=acidMarking.mark(question,responses);assert(marked.accepted);assert.equal(marked.marks.earned,q.responses.length);assert([60000,180000,300000,600000].includes(acidAdapter.idleAllowance(question)));}
 summary.acidSourceFixtures=fixtures.length;
});
test('canonical histories select supported questions without leaking raw refs; seeded generators restore',()=>{
 for(const [activityId,provider,levels]of [...providers,['alevel/acid-base-calculations',acidProvider,[1,2,3]],['igcse/calorimetry',cal,[1,2,3]],['igcse/bond-enthalpy',be,[1,2,3]]])for(const level of levels){const previous=[];for(const seed of [0,1,0xffffffff,0x80000000,123,999]){const gemId=activityId==='alevel/acid-base-calculations'?'u6-t1-1-2':activityId==='igcse/dot-and-cross'?'fourth-3-2':undefined;const selection={activityId,level,seed,previousQuestionIds:previous,...(gemId?{gemId}:{})};const ref=provider.select(selection);assert(isCanonicalQuestionId(activityId,ref.questionId));assert.deepEqual(provider.select(selection),ref);assert.deepEqual(provider.restore(ref).ref,ref);previous.push(ref.questionId);if(/^AB-|^CAL-|^BE-|^ECB-/.test(ref.questionId))assert.deepEqual(provider.resolveLink(ref.questionId),ref);}}
});
test('promoted fixed codes preserve complete substantive markings for EB/TC/DAC/DC/EE',()=>{
 let checked=0;
 for(const q of ebData.questions){const question=eb.restore(eb.resolveLink(bondingCode(q.id)));for(const values of [q.fields.map(f=>f.accept[0]),q.fields.map(()=>''),q.fields.map(()=> 'gibberishxyz')]){const responses=Object.fromEntries(values.map((value,i)=>['answer-'+i,{kind:'text',value}]));const got=electronsBondingMarking.mark(question,responses),expected=sourceBondingMark(q,values,ebData);assert.equal(got.accepted,expected.ready);if(got.accepted)assert.deepEqual(got.marks.points.map(p=>!!p.earned),expected.marks);}checked++;}
 for(const q of tcBank){const question=tc.restore(tc.resolveLink(tcCode(q.id))),model=tcAnswer(q);for(const state of [model,{...model,initialPH:0,finalPH:0}]){const got=titrationMarking.mark(question,{curve:{kind:'titration-curve',...state}}),expected=tcGrade(q,state);assert(got.accepted);assert.deepEqual(got.marks.points.map(p=>!!p.earned),expected.items.map(p=>p.correct));}checked++;}
 for(const [bank,provider,code,policy]of [[dacBank,dac,dacCode,dotCrossMarking],[dcBank,dc,dcCode,igcseDotCrossMarking]])for(const q of bank){const question=provider.restore(provider.resolveLink(code(q.id))),diagram={kind:'dot-and-cross',...copy(q.reference)};const got=policy.mark(question,{diagram});assert(got.accepted);assert.equal(got.marks.earned,1,q.id);const missing=copy(diagram);missing.electrons.pop();const wrong=policy.mark(question,{diagram:missing});assert(wrong.accepted);assert(wrong.marks.earned<1,q.id);checked++;}
 for(const q of eeBank.questions){const question=ee.restore(ee.resolveLink(eeCode(q.id)));if(q.fields){const responses=Object.fromEntries(q.fields.map((f,i)=>['field-'+i,f.options?{kind:'choice',selected:[f.options.find(o=>f.accept.includes(o))]}:{kind:'text',value:f.accept[0]}]));const got=energyMarking.mark(question,responses);assert(got.accepted);assert.equal(got.marks.earned,q.points.length);for(const [i,f]of q.fields.entries())for(const value of [...(f.options??f.accept),'gibberishxyz','']){const state=energySourceField(f,value,eeBank),marked=energyMarking.mark(question,{...responses,['field-'+i]:f.options?{kind:'choice',selected:value?[value]:[]}:{kind:'text',value}});assert.equal(marked.accepted,!['empty','unknown'].includes(state));}}else{for(const profile of [modelProfile(q),{...modelProfile(q),left:'wrong'}]){const got=energyMarking.mark(question,{profile}),expected=energySourceCheck(q,profile,eeBank);assert(got.accepted);assert.deepEqual(got.marks.points.map(p=>!!p.earned),expected);}}checked++;}
 summary.fixedMarkingRecords=checked;
});
test('all564 EC and generated matching seed boundaries preserve editor and marking, canonical ref seed',()=>{
 for(const q of variants){const question=ec.restore(ec.resolveLink(q.questionId)),answer=referenceState(q.speciesId,q.representation);const result=electronConfigurationsMarking.mark(question,{configuration:answer});assert(result.accepted);assert.equal(result.marks.earned,1);}
 for(const seed of [0,1,15,31,123456,ecCapacity-1]){const id='ECB-'+seed.toString(36).toUpperCase().padStart(6,'0');let matching;try{matching=matchingFromId(id);}catch{assert.equal(ec.resolveLink(id),null);continue;}const ref=ec.resolveLink(id);assert.equal(ref.seed,seed);const answer={...blankState(),selectedSpeciesIds:matching.options.filter(id=>sameConfiguration(species(id).counts,matching.counts))};const result=electronConfigurationsMarking.mark(ec.restore(ref),{configuration:answer});assert(result.accepted);assert.equal(result.marks.earned,1);assert.throws(()=>ec.restore({...ref,seed:seed+1}));}
});
test('teacher catalogue all current canonical ref entries and full fixed banks',async()=>{
 for(const [activityId,provider]of [...providers,['alevel/acid-base-calculations',acidProvider],['igcse/calorimetry',cal],['igcse/bond-enthalpy',be]]){const entries=await teacherCatalogue(activityId);assert(entries.length,activityId);for(const e of entries){assert(isCanonicalQuestionId(activityId,e.ref.questionId),e.label);provider.restore(e.ref);}summary[activityId]={...summary[activityId],teacherEntries:entries.length};}
 fs.writeFileSync(_migrationEvidence('coverage-results.json'),JSON.stringify(summary,null,2));
});

