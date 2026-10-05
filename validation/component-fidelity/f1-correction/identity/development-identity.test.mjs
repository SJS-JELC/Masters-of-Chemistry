import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {acidTemplateSlots,acidCode,decodeAcidCode,createAcidCodec,acidMaximumSeed,acidConfigurationRadix,acidTemplateSlotCount,acidSeedCount} from '../../../../src/activities/alevel/acid-base-calculations/identity.ts';
import {acidProvider} from '../../../../src/activities/alevel/acid-base-calculations/provider.ts';
import {developmentCode,decodeDevelopmentCode,developmentSeed,developmentMaximumSeed,fixtureSlots} from '../../../../src/development/identity.ts';
import {fixtureKinds,fixtureRef,fixtureQuestion,createFixtureProvider,fixtureMarking} from '../../../../src/development/fixtures.ts';
import {questionPrefixes,isCanonicalQuestionId} from '../../../../src/content/canonical-identity.ts';
import {activityDatabaseName,alphaDatabaseName} from '../../../../src/persistence/alpha-namespace.ts';
import {validateAttempt,validateSession} from '../../../../src/persistence/validation.ts';
import {leafBoundary} from '../../../../src/persistence/catalogue-boundary.ts';
import {fixtureQuestion as originalFixtureQuestion,fixtureRef as originalFixtureRef,fixtureMarking as originalFixtureMarking} from './before/src/development/fixtures.ts';
const root=path.resolve(import.meta.dirname,'../../../..'),clone=x=>JSON.parse(JSON.stringify(x));
const slots=JSON.parse(fs.readFileSync(path.join(root,'development/authoring/family-slots.json'),'utf8'));
test('permanent template mapping freezes all existing slots; shared codec future registration leaves every current code unchanged',()=>{
 assert.equal(acidTemplateSlotCount,64);assert.equal(acidConfigurationRadix,192);assert.equal(acidMaximumSeed,11337407);assert.equal(acidSeedCount*192,36**6);
 assert.deepEqual(Object.values(acidTemplateSlots),Array.from({length:38},(_,i)=>i));
 const future=createAcidCodec({...acidTemplateSlots,'future-test-only':38});let checked=0;
 for(const template of Object.keys(acidTemplateSlots))for(const level of [1,2,3])for(const seed of [0,1,712345,acidMaximumSeed]){
  assert.equal(future.encode(template,level,seed),acidCode(template,level,seed));assert.deepEqual(future.decode(acidCode(template,level,seed)),{templateId:template,level,seed});checked++;
 }
 for(const level of [1,2,3])for(const seed of [0,acidMaximumSeed]){
  const code=future.encode('future-test-only',level,seed);assert.throws(()=>decodeAcidCode(code));assert.deepEqual(future.decode(code),{templateId:'future-test-only',level,seed});
 }
 for(let slot=38;slot<64;slot++)for(const level of [1,2,3])for(const seed of [0,acidMaximumSeed]){
  const code='AB-'+(seed*192+(level-1)*64+slot).toString(36).toUpperCase().padStart(6,'0');assert.throws(()=>decodeAcidCode(code));assert.equal(acidProvider.resolveLink(code),null);
 }
 assert.throws(()=>createAcidCodec({one:1,two:1}));assert.throws(()=>createAcidCodec({tail:64}));assert.throws(()=>createAcidCodec({negative:-1}));assert.throws(()=>createAcidCodec({fraction:1.5}));
 fs.writeFileSync(path.join(import.meta.dirname,'future-stability-results.json'),JSON.stringify({currentTemplates:38,configurations:114,codesUnchanged:checked,reservedCodesRejected:156,maximumSeed:acidMaximumSeed},null,2));
});
test('canonical synthetic fixtures cover every registered prefix, control, level and seed without collisions; exact restore and schema persistence',()=>{
 const seen=new Set();let count=0;
 for(const activityId of Object.keys(questionPrefixes))for(const kind of fixtureKinds)for(const level of [1,2,3])for(const seed of [0,1,35,712345,developmentMaximumSeed]){
  const leaf=Object.entries(leafBoundary).find(([id,leaf])=>!leaf.historicalOnly&&leaf.activityId===activityId&&leaf.levels.includes(level));
  const target={course:activityId.split('/')[0],activityId,gemId:leaf?.[0]??'unsupported-synthetic-proof',level},provider=createFixtureProvider(activityId,kind,[1,2,3]);
  const ref=fixtureRef(target,kind,seed);assert(isCanonicalQuestionId(activityId,ref.questionId));assert(!seen.has(ref.questionId));seen.add(ref.questionId);
  assert.deepEqual(decodeDevelopmentCode(activityId,ref.questionId),{slot:fixtureSlots[kind],level,seed});assert.deepEqual(provider.resolveLink(ref.questionId),ref);assert.deepEqual(provider.restore(ref),fixtureQuestion(ref));
  const {ref:oldRef,...oldContent}=originalFixtureQuestion(originalFixtureRef(target,kind,seed)),{ref:newRef,...newContent}=fixtureQuestion(ref);assert.deepEqual(newContent,oldContent);
  assert.throws(()=>provider.restore({...ref,seed:seed+1}));assert.throws(()=>provider.restore({...ref,level:level===1?2:1}));
  if(leaf){validateAttempt({mode:'student',namespace:{course:target.course,profileId:'synthetic'},attemptId:'synthetic-attempt',target,ref,phase:'answering',currentResponses:{},assistance:[],timing:{attemptId:'synthetic-attempt',activeMs:0,idleLimitMs:180000,finished:false}});
  validateSession({kind:'practice',namespace:{course:target.course,profileId:'synthetic'},id:'synthetic-session',target,selection:'fixed-level',currentAttemptId:'synthetic-attempt',previousQuestionIds:[ref.questionId],paused:false});}
  assert.deepEqual(provider.select({activityId,level,seed:0xffffffff}),fixtureRef(target,kind,0xffffffff));count++;
 }
 assert.equal(developmentSeed(0xffffffff),0xffffffff%(developmentMaximumSeed+1));
 for(const invalid of [-1,1.5,NaN,2**32])assert.throws(()=>developmentSeed(invalid));
 for(const invalid of [-1,developmentMaximumSeed+1,0xffffffff,NaN])assert.throws(()=>developmentCode('alevel/acid-base-calculations',48,2,invalid));
 assert.throws(()=>decodeDevelopmentCode('alevel/acid-base-calculations','DEV-PH-v1-FIXED'));
 const target={course:'alevel',activityId:'alevel/acid-base-calculations',gemId:'u6-t1-1-2',level:1},ref=fixtureRef(target,'numeric',0);
 const q=fixtureQuestion(ref);assert.equal(fixtureMarking.mark(q,{answer:{kind:'numeric',raw:'42',unit:'kJ'}}).marks.earned,1);
 assert.deepEqual(fixtureMarking.mark(q,{answer:{kind:'numeric',raw:'42',unit:'kJ'}}),originalFixtureMarking.mark(originalFixtureQuestion(originalFixtureRef(target,'numeric',0)),{answer:{kind:'numeric',raw:'42',unit:'kJ'}}));
 assert.throws(()=>validateAttempt({mode:'student',namespace:{course:'alevel',profileId:'local'},attemptId:'bad',target,ref:{...ref,questionId:'development-numeric-0'},phase:'answering',currentResponses:{},assistance:[]}));
 fs.writeFileSync(path.join(import.meta.dirname,'development-fixtures-results.json'),JSON.stringify({canonicalDistinctRefs:count,controls:fixtureKinds.length,activities:Object.keys(questionPrefixes).length,levels:3,seedBound:developmentMaximumSeed},null,2));
});
test('all retained authoring content and marking reproduce exact pre-correction goldens; canonical configuration and seed restore',async()=>{
 const goldens=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'authoring-pre-correction-fixtures.json'),'utf8'));
 for(const g of goldens){const m=await import(new URL('../../../../'+g.file,import.meta.url)),ref=m.proofRef(g.level,g.seed),q=m.proofQuestion(ref),{ref:ignored,...content}=q;assert.deepEqual(clone(content),g.question);assert.deepEqual(m.dilutionValues(ref),g.values);const responses={ph:{kind:'numeric',raw:String(g.level===3?g.values.finalVolume:Number(g.values.pH.toFixed(2))),unit:g.level===3?'cm³':''},change:{kind:'choice',selected:['increase']}};assert.deepEqual(m.proofMarking.mark(q,responses),g.marks);}
 const seen=new Set();let count=0;
 for(const [name,slot]of Object.entries(slots)){
  const file=name==='authoring-proof'?'development/authoring/family.ts':`development/authoring/families/${name}/family.ts`,m=await import(new URL('../../../../'+file,import.meta.url));assert.equal(m.proofSlot,slot);
  for(const level of [1,2,3])for(const seed of level===1?[0]:[0,1,24,35,712345,developmentMaximumSeed]){
   const ref=m.proofRef(level,seed);assert(isCanonicalQuestionId(ref.activityId,ref.questionId));assert(!seen.has(ref.questionId));seen.add(ref.questionId);assert.equal(ref.questionId,developmentCode(ref.activityId,slot,level,seed));assert.deepEqual(m.proofProvider.resolveLink(ref.questionId),ref);assert.deepEqual(m.proofProvider.restore(clone(ref)),m.proofQuestion(ref));assert.equal(acidProvider.resolveLink(ref.questionId),null);
   assert.throws(()=>m.proofProvider.restore({...ref,seed:seed+1}));assert.throws(()=>m.proofProvider.restore({...ref,level:level===1?2:1}));count++;
  }
  assert.equal(m.proofProvider.resolveLink('DEV-PH-v1-GENERATED-O'),null);assert.throws(()=>m.proofRef(2,developmentMaximumSeed+1));
  const entropy=m.proofProvider.select({activityId:m.activityId,gemId:m.gemId,level:2,seed:0xffffffff});assert.equal(entropy.seed,developmentSeed(0xffffffff));
 }
 fs.writeFileSync(path.join(import.meta.dirname,'authoring-codec-results.json'),JSON.stringify({goldenContentAndMarking:goldens.length,families:Object.keys(slots).length,distinctCanonicalRefs:count},null,2));
});
test('DEV authoring databases remain separate by route and from production; canonical runtime validation is unchanged',()=>{
 for(const dev of [false,true])for(const override of [false,true]){
  const name=activityDatabaseName('alevel','local',dev,override,'/development/authoring/families/dev-one/preview.html');assert.equal(name,dev&&override?alphaDatabaseName('alevel','dev-authoring-dev-one-local'):alphaDatabaseName('alevel','local'));
 }
 assert.notEqual(activityDatabaseName('alevel','local',true,true,'/development/authoring/families/dev-one/preview.html'),activityDatabaseName('alevel','local',true,true,'/development/authoring/families/dev-two/preview.html'));
 assert.throws(()=>activityDatabaseName('alevel','local',true,true,'/unknown.html'));
 assert.equal(activityDatabaseName('igcse','run',false,true,'/one.html'),alphaDatabaseName('igcse','run'));
});
