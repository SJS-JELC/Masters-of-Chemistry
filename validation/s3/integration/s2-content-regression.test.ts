import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRegistry} from '../../../src/catalogue/registry.ts';
import {acidAdapter} from '../../../src/activities/alevel/acid-base-calculations/index.ts';
import {structureAdapter} from '../../../src/activities/igcse/structure-and-bonding/index.ts';
import {dotCrossAdapter} from '../../../src/activities/alevel/dot-and-cross/index.ts';
const productionRegistry=createRegistry([acidAdapter,structureAdapter,dotCrossAdapter]);
import {pupilPool} from '../../../src/activities/alevel/dot-and-cross/provider.ts';
import {comparisonRef} from '../../../src/activities/igcse/structure-and-bonding/provider.ts';

const manifest=JSON.parse(fs.readFileSync(new URL('../../s0/inventory/coverage-manifest.json',import.meta.url),'utf8'));
test('retained S2 adapter fixture enables its three complete activities and20 genuine targets',async()=>{
 assert.deepEqual(productionRegistry.activities.map(item=>item.id).sort(),['alevel/acid-base-calculations','alevel/dot-and-cross','igcse/structure-and-bonding']);
 let targetLevels=0;
 for(const registration of productionRegistry.activities){
  assert.equal(registration.strand,'curriculum');if(registration.strand!=='curriculum')throw Error('Unexpected Olympiad');
  const source=manifest.activities.find((item:{id:string})=>item.id===registration.id);
  assert.deepEqual(registration.gems.map(gem=>gem.id),source.leafIds);
  const provider=await registration.provider();
  for(const gem of registration.gems)for(const level of gem.supportedLevels){
   targetLevels++;
   assert(source.supportedLevels.includes(level));
   const ref=provider.select({activityId:registration.id,gemId:gem.id,level,seed:0xffffffff,previousQuestionIds:[]}),question=provider.restore(ref);
   assert.deepEqual(question.ref,ref);assert.equal(question.parts.length>0,true);assert.equal(question.workedAnswer.length>0,true);
   assert([60000,180000,300000,600000].includes(registration.idleAllowance(question)));
  }
 }
 assert.equal(targetLevels,20);
});

test('acid generated coverage equals every accepted template and level route',async()=>{
 const registration=productionRegistry.get('alevel/acid-base-calculations');if(registration?.strand!=='curriculum')throw Error('Acid missing');
 const provider=await registration.provider(),source=manifest.activities.find((item:{id:string})=>item.id===registration.id),families=provider.coverage.flatMap(coverage=>coverage.kind==='generated'?coverage.families:[]);
 assert.equal(families.length,38);assert.equal(families.reduce((sum,item)=>sum+item.levels.length,0),63);
 for(const level of [1,2,3])assert.deepEqual(families.filter(item=>item.levels.includes(level as 1|2|3)).map(item=>item.templateId).sort(),[...source.levelMapping[level].sourceIds].sort());
});

test('dotcross91 teacher IDs and every deduplicated pupil pool equal immutable actual source',async()=>{
 const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../../../../Masters-of-A-Level-Chemistry/src/activities/dot-and-cross/data.js',import.meta.url),'utf8'),context);
 const source=JSON.parse(JSON.stringify(context.DotCrossData.questions)) as {id:string;category:string;practiceCategory?:string;namedSpecies?:boolean;formula:string;grades:number[]}[];
 const registration=productionRegistry.get('alevel/dot-and-cross');if(registration?.strand!=='curriculum')throw Error('Dotcross missing');
 const provider=await registration.provider();assert.equal(source.length,91);
 assert.deepEqual(provider.coverage.flatMap(coverage=>coverage.kind==='fixed'?coverage.questionIds:[]),source.map(item=>item.id));
 for(const level of [1,2,3] as const){
  const seen=new Set<string>();const expected=source.filter(item=>{const category=item.practiceCategory||item.category,key=category==='covalent'&&!item.namedSpecies?`covalent:${item.formula}`:item.id;if(!item.grades.includes(level)||seen.has(key))return false;seen.add(key);return true;});
  assert.deepEqual(pupilPool(level).map(item=>item.id),expected.map(item=>item.id));
 }
});

test('structure all9 comparisons/44 rubric points and L2 seven/L3 one sections remain source owned',async()=>{
 const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../../../../Masters-of-IGCSE-Chemistry/src/activities/structure-and-bonding/data.js',import.meta.url),'utf8'),context);
 const source=JSON.parse(JSON.stringify(context.StructureBondingComparisonData.questions)) as {id:string;points:{text:string;reject?:string}[]}[];
 const registration=productionRegistry.get('igcse/structure-and-bonding');if(registration?.strand!=='curriculum')throw Error('Structure missing');
 const provider=await registration.provider();assert.equal(source.length,9);assert.equal(source.reduce((sum,item)=>sum+item.points.length,0),44);
 assert.equal(provider.coverage.flatMap(coverage=>coverage.kind==='fixed'?coverage.questionIds:[]).length,18);
 for(const original of source)for(const level of [2,3] as const){const question=provider.restore(comparisonRef(original.id,level,0)),part=question.parts[0];assert.equal(part?.kind,'explanation');if(part?.kind!=='explanation')throw Error('Missing explanation');assert.equal(part.sections.length,level===2?7:1);assert.deepEqual(part.rubric.map(({text,reject})=>({text,...(reject?{reject}:{})})),original.points);}
});
