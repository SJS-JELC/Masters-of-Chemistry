import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {productionRegistry} from '../../../src/foundation/registry.ts';
const read=(file:string)=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url),'utf8').replace(/^\uFEFF/,''));
const manifest=read('../../s0/inventory/coverage-manifest.json'),contract=read('../../../project-contract.json');
test('all12 exact source activities register, with41 genuine curriculum targets and separate Olympiad',async()=>{
  assert.deepEqual(productionRegistry.activities.map(item=>item.id).sort(),contract.activities.map((item:{id:string})=>item.id).sort());
  const targets:string[]=[];
  for(const registration of productionRegistry.activities){
    const source=manifest.activities.find((item:{id:string})=>item.id===registration.id);assert(source);
    if(registration.strand==='olympiad'){
      assert.equal(registration.revision,false);for(const field of ['gems','mastery','idleAllowance'])assert(!Object.hasOwn(registration,field));
      assert.equal(registration.dependencies.bUnits.length,7);continue;
    }
    assert.equal(registration.revision,true);assert.equal(registration.renderer,'question-player');
    assert.deepEqual(registration.gems.map(gem=>gem.id),source.leafIds);
    const provider=await registration.provider();
    for(const gem of registration.gems)for(const level of gem.supportedLevels){
      const key=`${gem.id}:${level}`;assert(!targets.includes(key));targets.push(key);assert(source.supportedLevels.includes(level));
      for(const seed of [1,0xffffffff]){
        const ref=provider.select({activityId:registration.id,gemId:gem.id,level,seed,previousQuestionIds:[]});
        const question=provider.restore(ref);assert.deepEqual(question.ref,ref);assert(question.parts.length>0);assert(question.workedAnswer.length>0);assert(question.sources.length>0);
        assert([60000,180000,300000,600000].includes(registration.idleAllowance(question)));assert(registration.idleRationale.length>10);
      }
    }
  }
  assert.equal(targets.length,41);assert.equal(new Set(targets).size,41);assert(!productionRegistry.activities.some(item=>String(item.id).includes('rocket')));
});
