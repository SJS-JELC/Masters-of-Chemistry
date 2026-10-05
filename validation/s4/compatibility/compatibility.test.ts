import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {resolveCompatibilityLink} from '../../../src/compatibility/links.ts';
import {planLegacyImport,C3_LEGACY_KEY} from '../../../src/persistence/legacy/plan.ts';
import {acidEngine} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
import {bondCode,bondRef} from '../../../src/activities/igcse/bond-enthalpy/provider.ts';
import {calorimetryCode,calorimetryConfigurations,calorimetryRef} from '../../../src/activities/igcse/calorimetry/provider.ts';
import {reviewCode as igcseDiagramCode} from '../../../src/activities/igcse/dot-and-cross/provider.ts';
import {c3AnswerSignature} from '../../../src/activities/olympiad/c3l6/legacy.ts';
import {matchingFromId,format} from '../../../src/chemistry/electron-configuration/identity.ts';
const namespace={course:'alevel' as const,profileId:'synthetic-s4'};
const akey='masters-alevel-results-v1';
const row=(id:string,leafId='l6-t2-1-4')=>({id,leafId,level:1,score:1,completedAt:500});
test('every inventoried fixed review ID and original activity URL restores exact identity',async()=>{
 const inventory=JSON.parse(fs.readFileSync(new URL('../../s0/inventory/identity-index.json',import.meta.url),'utf8'));
 let checked=0;
 for(const activity of inventory.activities){if(activity.id.includes('c3l6'))continue;
  const [course,slug]=activity.id.split('/');
  for(const entry of activity.entries){
   // Actual released IGCSE source uses DC. S0's generic hash inventory used DAC incorrectly.
   const code=activity.id==='igcse/dot-and-cross'?igcseDiagramCode(entry.sourceKey):entry.questionId;
   const resolved=await resolveCompatibilityLink(course,code);
   assert.equal(resolved.kind,'curriculum',`${activity.id}: ${code}: ${JSON.stringify(resolved)}`);
   if(resolved.kind!=='curriculum')continue;assert.equal(resolved.ref.activityId,activity.id);
   const url=`https://example.org/Masters-of-${course==='alevel'?'A-Level':'IGCSE'}-Chemistry/activities/${slug}/index.html?review=${code}`;
   const linked=await resolveCompatibilityLink(course,url);assert.deepEqual(linked.kind==='curriculum'?linked.ref:null,resolved.ref);checked++;
  }
 }
 assert.equal(checked,863);
});
test('all acid V2 routes and 33 source legacy fixtures keep source seeds; generated CAL/BE decode',async()=>{
 let routes=0;
 for(const scope of acidEngine.scopes)for(const level of [1,2,3] as const)for(const id of scope.levels[level]){
  for(const seed of [0,0xffffffff]){const code=acidEngine.reviewId(id,level,seed),r=await resolveCompatibilityLink('alevel',code);assert.equal(r.kind,'curriculum');if(r.kind==='curriculum'){assert.equal(r.ref.questionId,code);assert.equal(r.ref.seed,seed);assert.equal(r.ref.level,level);}}routes++;
 }
 assert.equal(routes,63);
 const legacy=JSON.parse(fs.readFileSync(new URL('../../../../../development/tests/fixtures/acid-legacy-reviews.json',import.meta.url),'utf8'));
 assert.equal(legacy.questions.length,33);
 for(const q of legacy.questions){const r=await resolveCompatibilityLink('alevel',q.reviewId);assert.equal(r.kind,'curriculum');if(r.kind==='curriculum'){assert.equal(r.ref.seed,q.question.seed);assert.equal(r.ref.questionId,q.reviewId);}}
 for(const [code,ref] of [[bondCode('methane-combustion',1,123),bondRef],[calorimetryCode(calorimetryConfigurations()[0]!,123),calorimetryRef]] as const){const r=await resolveCompatibilityLink('igcse',code);assert.equal(r.kind,'curriculum');if(r.kind==='curriculum')assert.deepEqual(r.ref,ref(code));}
});
test('all 4512 finite calorimetry configurations resolve their exact source-canonical code and seed',async()=>{
 const configs=calorimetryConfigurations();assert.equal(configs.length,4512);
 for(const c of configs){const code=calorimetryCode(c,0xffffffff),r=await resolveCompatibilityLink('igcse',`/igcse/activities/calorimetry/index.html?review=${code}`);assert.equal(r.kind,'curriculum',code);if(r.kind==='curriculum')assert.deepEqual(r.ref,calorimetryRef(code));}
});
test('historical ECB masks/seeded matching and all permitted BE routes agree with actual source decoders',async()=>{
 const root=new URL('../../../../Masters-of-A-Level-Chemistry/src/',import.meta.url),context:any={};
 for(const path of ['assets/question-review.js','activities/electron-configurations/data.js','activities/electron-configurations/core.js','activities/electron-configurations/session.js'])vm.runInNewContext(fs.readFileSync(new URL(path,root),'utf8'),context);
 for(const mask of Array.from({length:16},(_,i)=>i))for(const base of [0,123456]){
  const code=format('ECB',base*16+mask);let old:any;try{old=context.ElectronSession.bonusFromReviewId(code);}catch{}
  const r=await resolveCompatibilityLink('alevel',code);
  if(!old){assert.equal(r.kind,'unrecognized',code);continue;}
  assert.equal(r.kind,'curriculum',code);if(r.kind==='curriculum')assert.equal(r.ref.seed,base*16+mask);
  const current=matchingFromId(code);assert.deepEqual(current.counts,Array.from(old.counts));assert.deepEqual(current.options,Array.from(old.options));
 }
 const source=JSON.parse(fs.readFileSync(new URL('../../s0/inventory/coverage-manifest.json',import.meta.url),'utf8')).activities.find((a:any)=>a.id==='igcse/bond-enthalpy');
 assert(source);
 const {core}=await import('../../../src/chemistry/thermochemistry/bond-enthalpy-core.js');
 for(const reaction of core.reactions)for(const level of reaction.allowedLevels){const code=bondCode(reaction.id,level,0xffffffff),r=await resolveCompatibilityLink('igcse',code);assert.equal(r.kind,'curriculum');if(r.kind==='curriculum')assert.deepEqual(r.ref,bondRef(code));}
});
test('canonical metadata preserves fixed-question level/seed on refresh, validates contradictions and source-mounted paired codes',async()=>{
 const input='/alevel.html?review=n2&activity=alevel%2Fdot-and-cross&level=3&seed=4294967295';
 const r=await resolveCompatibilityLink('alevel',input);assert.equal(r.kind,'curriculum');if(r.kind==='curriculum'){assert.equal(r.ref.level,3);assert.equal(r.ref.seed,4294967295);assert.equal(r.ref.questionId,'n2');}
 const paired=await resolveCompatibilityLink('alevel','/activities/dot-and-cross/index.html?question=h2&review=DAC-3QP3I7');assert.equal(paired.kind,'curriculum');
 for(const input of ['/alevel.html?review=EB01&level=2','/alevel.html?review=EB01&seed=-1','/alevel.html?review=EB01&activity=igcse/dot-and-cross','/alevel.html?review=AB2-0-1-0&level=3','/alevel.html?review=EB01&review=EB01','/alevel.html?review=EB01&course=igcse'])assert.equal((await resolveCompatibilityLink('alevel',input)).kind,'unrecognized',input);
});
test('malformed/ambiguous/cross-course/excluded URLs reject; Olympiad stays isolated',async()=>{
 for(const input of ['AB2-0-1-INVALID','https://x/activities/electrons-bonding/index.html?review=EB01&question=EB02','https://x/activities/rocket-recall/index.html?review=EB01','https://x/activities/electrons-bonding/index.html','https://x/%ZZ?review=EB01','https://x/igcse/?review=EB01'])assert.equal((await resolveCompatibilityLink('alevel',input)).kind,'unrecognized',input);
 assert.equal((await resolveCompatibilityLink('alevel','https://x/activities/c3l6-organic-reactions/index.html')).kind,'olympiad');
 assert.equal((await resolveCompatibilityLink('igcse','EB01')).kind,'unrecognized');
});
test('mixed source imports preserve supported leaves, aliases, flags, timing and exact raw exclusions',async()=>{
 const snapshots={
  [akey]:JSON.stringify([row('alias'),{...row('v1','u6-t1-1-4'),progressionVersion:1},row('excluded','rocket-recall'),{...row('bad'),score:.2},row('alias'),{...row('alias'),score:0}]),
  'masters-alevel-results-acid-v2':JSON.stringify([{...row('v2','u6-t1-1-2'),progressionVersion:2,timing:{version:1,activeMs:987,idleLimitMs:180000}}]),
  'alevel-acid-levels-session-v2':'{"current":{"questionId":"AB2-0-1-0"}}',
 };
 const before=JSON.stringify(snapshots),p=await planLegacyImport(namespace,snapshots);
 assert.equal(JSON.stringify(snapshots),before);assert.equal(p.batches.flatMap(b=>b.curriculum).length,3);assert.equal(p.rejected.length,4);
 const alias=p.batches[0]!.curriculum[0]!;assert.equal(alias.gemId,'l6-t2-1-3');assert.equal('timing' in alias,false);assert.equal('firstResponse' in alias,false);
 assert(p.rejected.some(r=>r.sourceId==='excluded'&&JSON.stringify(r.raw).includes('rocket-recall')));
 const ig=await planLegacyImport({course:'igcse',profileId:'ig'}, {'masters-igcse-results-v2':JSON.stringify([{id:'ig',leafId:'lower-6-5',grade:2,score:.5,completedAt:5,selfAssessed:true,assisted:false,question:'SB01',family:'f',strand:'s'}])});
 assert.equal(ig.rejected.length,0);assert.equal(ig.batches[0]?.curriculum[0]?.selfAssessed,true);assert.equal(ig.batches[0]?.curriculum[0]?.assisted,false);
 const other=await planLegacyImport(namespace,{'masters-igcse-results-v2':'[{"id":"ig","leafId":"lower-6-5","grade":2,"score":1,"completedAt":1}]'});assert.equal(other.rejected.length,1);
});
test('C3 accepted only through substantive adapter, malformed/unsupported input retains raw',async()=>{
 const p=await planLegacyImport(namespace,{[C3_LEGACY_KEY]:JSON.stringify({version:3,signature:c3AnswerSignature})});assert.equal(p.batches[0]?.curriculum.length,0);assert.equal(p.batches[0]?.olympiad.length,1);assert.equal(p.batches[0]?.olympiad[0]?.completed.a,false);
 const bad=await planLegacyImport(namespace,{[C3_LEGACY_KEY]:'{"version":3,"signature":"forged","complete":{"a":true}}',[akey]:'broken','unsupported':'{"raw":"retained"}'});assert.equal(bad.rejected.length,3);assert.equal(bad.rejected.find(r=>r.sourceKey===akey)?.raw,'broken');
});
test('equal multi-store rows keep stable batches; genuinely conflicting projections get explicit distinct receipt identities',async()=>{
 const acid={...row('shared','u6-t1-1-2'),progressionVersion:2},v2='masters-alevel-results-acid-v2';
 const original=JSON.stringify([acid]),both=await planLegacyImport(namespace,{[akey]:original,[v2]:original}),alone=await planLegacyImport(namespace,{[v2]:original});
 assert.equal(both.batches.flatMap(b=>b.curriculum).length,2);assert.deepEqual(both.batches.find(b=>b.source.key===v2),alone.batches[0]);
 const conflict=await planLegacyImport(namespace,{[akey]:JSON.stringify([{...acid,score:0}]),[v2]:original});
 assert.equal(conflict.rejected.length,1);assert.match(conflict.rejected[0]!.reason,/across source stores/);
 assert.equal(conflict.batches.find(b=>b.source.key===v2)?.curriculum.length,0);assert.notEqual(conflict.batches.find(b=>b.source.key===v2)?.source.fingerprint,alone.batches[0]?.source.fingerprint);
});
