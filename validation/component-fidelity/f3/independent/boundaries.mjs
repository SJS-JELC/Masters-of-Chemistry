import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {acidCode,decodeAcidCode,createAcidCodec,acidTemplateSlots,acidTemplateSlotCount,acidConfigurationRadix,acidMaximumSeed,acidSeedCount,boundedAcidSeed} from '../../../../src/activities/alevel/acid-base-calculations/identity.ts';
import fixedIds from '../../../../src/content/canonical-fixed-ids.json' with {type:'json'};
import {productionRegistry} from '../../../../src/foundation/registry.ts';
import {sourcePresentation} from '../../../../src/ui/source-presentation.ts';
import {canonical} from '../../../../src/persistence/validation.ts';
const here=import.meta.dirname,app=path.resolve(here,'../../../..');
assert.equal(acidTemplateSlotCount,64);assert.equal(acidConfigurationRadix,192);assert.equal(acidMaximumSeed,11337407);
const current=createAcidCodec(acidTemplateSlots), future=createAcidCodec({...acidTemplateSlots,'independent-future-slot':63});
let stable=0,reserved=0,tail=0;
for(const template of Object.keys(acidTemplateSlots))for(const level of [1,2,3])for(const seed of [0,1,35,36,123456,acidMaximumSeed]){
 const code=acidCode(template,level,seed);assert.equal(future.encode(template,level,seed),code);assert.deepEqual(future.decode(code),current.decode(code));stable++;
}
for(const seed of [0,1,acidMaximumSeed])for(const level of [1,2,3])for(let slot=38;slot<64;slot++){
 const code='AB-'+(seed*192+(level-1)*64+slot).toString(36).toUpperCase().padStart(6,'0');assert.throws(()=>decodeAcidCode(code));reserved++;
 if(slot===63)assert.deepEqual(future.decode(code),{templateId:'independent-future-slot',level,seed});
}
for(let value=acidSeedCount*192;value<36**6;value++){assert.throws(()=>decodeAcidCode('AB-'+value.toString(36).toUpperCase()));tail++;}
for(const bad of [{a:0,b:0},{a:-1},{a:64},{a:0.5},{'':1}])assert.throws(()=>createAcidCodec(bad));
for(const entropy of [0,1,0x7fffffff,0x80000000,0xffffffff]){const seed=boundedAcidSeed(entropy);assert(seed>=0&&seed<=acidMaximumSeed)}
for(const entropy of [-1,2**32,0.5,NaN])assert.throws(()=>boundedAcidSeed(entropy));
const all=new Set();for(const [prefix,map]of Object.entries(fixedIds))for(const code of Object.values(map)){assert(code.startsWith(prefix+'-'));assert(/^[A-Z]{2,3}-[A-Z0-9]{6}$/.test(code));assert(!all.has(code));all.add(code)}
const accepted=JSON.parse(fs.readFileSync(path.join(app,'validation/component-fidelity/f2/shared/resume-f08/fixtures.json')));
let compared=0;for(const f of accepted){const activity=productionRegistry.get(f.activity),p=await activity.provider(),q=p.restore(f.ref),s=await sourcePresentation(q);assert.equal(canonical(q),canonical(f.question),f.ref.questionId+' question');assert.equal(canonical(s),canonical(f.source),f.ref.questionId+' source');compared++;}
assert.equal(productionRegistry.activities.filter(a=>a.strand==='curriculum').length,11);assert.equal(productionRegistry.activities.length,13);
const files=['src/content/canonical-identity.ts','src/content/canonical-fixed-ids.json','src/activities/alevel/acid-base-calculations/identity.ts','src/persistence/alpha-namespace.ts','src/landing/StatsIcon.tsx','src/ui/source-components.css','src/ui/source-presentation.ts','src/ui/SourceResponseControl.tsx','src/ui/NumericWorkingControl.tsx','src/domain/timing/active-clock.ts','src/domain/timing/browser-binding.ts','src/domain/attempt/attempt.ts'];
const hashes=files.map(p=>({path:p,sha256:createHash('sha256').update(fs.readFileSync(path.join(app,p))).digest('hex')}));
const report={status:'PASS',checkedAt:new Date().toISOString(),permanentSlots:64,radix:192,maxSeed:11337407,futureStableCodes:stable,reservedRejections:reserved,exhaustiveTailRejections:tail,fixedMappings:all.size,acceptedRepresentativeCorpusExact:compared,curriculumActivities:11,totalRegistrations:13,hashes,limitations:['13th foreign OLY registry presence checked only for integration scope; chemistry excluded.']};
fs.writeFileSync(path.join(here,'boundary-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
