// Shared typed-clock port. These deterministic fixtures are explicitly separate
// from actual trusted/native/idle/browser acceptance retained by S5-BEHAVIOUR.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createActiveClock, IDLE_LIMITS } from '../src/domain/timing/active-clock.ts';
import { createAttemptController, assessmentToEvidence } from '../src/domain/attempt/attempt.ts';
import { productionRegistry } from '../src/foundation/registry.ts';
import { selectCurriculumTargets } from '../src/domain/session/selection.ts';
import { countEvidence } from '../src/statistics/model.ts';
const sample = (ms,extra={})=>({monotonicMs:ms,wallMs:1000000+ms,visible:true,focused:true,suspended:false,...extra});

test('all four allowances cap AFK, resume interaction, restore same attempt and freeze the result',()=>{
  for(const idleLimitMs of IDLE_LIMITS){
    const clock=createActiveClock({attemptId:'idle',idleLimitMs,now:()=>sample(0)});
    for(let ms=1000;ms<=idleLimitMs+2000;ms+=1000)clock.sample(sample(ms));
    assert.equal(clock.checkpoint().activeMs,idleLimitMs);
    clock.interact(sample(idleLimitMs+2000));clock.sample(sample(idleLimitMs+3000));
    const saved=clock.checkpoint();
    const resumed=createActiveClock({attemptId:'idle',idleLimitMs,saved,now:()=>sample(86400000)});
    assert.equal(resumed.finish(sample(86401000)).activeMs,idleLimitMs+2000);
    assert.equal(resumed.finish(sample(99999999)).activeMs,idleLimitMs+2000);
    assert.equal(createActiveClock({attemptId:'other',idleLimitMs,saved,now:()=>sample(0)}).checkpoint().activeMs,0);
  }
});

test('background, pause and suspension exclude gaps; untimed historical completion stays absent',()=>{
  const clock=createActiveClock({attemptId:'boundary',idleLimitMs:600000,now:()=>sample(0)});
  clock.sample(sample(1000));clock.pause(sample(2000));clock.sample(sample(3000));
  assert.equal(clock.checkpoint().activeMs,2000);
  clock.interact(sample(4000));clock.sample(sample(5000));clock.sample(sample(6000,{visible:false}));
  clock.sample(sample(7000));clock.interact(sample(8000));clock.sample(sample(9000));clock.sample(sample(900000));
  assert.equal(clock.checkpoint().activeMs,4000);
  assert.equal(createActiveClock({attemptId:'historical',idleLimitMs:60000,completed:true,now:()=>sample(0)}).finish(sample(1000)),undefined);
});

test('every curriculum target rejects incomplete assessment without finishing timing; reveal freezes and creates no evidence',async()=>{
  let checked=0;
  for(const course of ['alevel','igcse']){
    const registrations=productionRegistry.curriculumFor(course);
    const targets=selectCurriculumTargets(registrations,course,registrations.flatMap(item=>item.gems.map(gem=>gem.id)));
    for(const target of targets){
      const registration=productionRegistry.get(target.activityId),provider=await registration.provider(),policy=await registration.marking();
      const ref=provider.select({...target,seed:42,previousQuestionIds:[]}),question=provider.restore(ref),idleLimitMs=registration.idleAllowance(question),attemptId='timing-'+checked;
      let now=0;
      const clock=createActiveClock({attemptId,idleLimitMs,now:()=>sample(now)});
      const state={mode:'student',namespace:{course,profileId:'timing-gate'},attemptId,target,ref,phase:'answering',currentResponses:{},assistance:[],timing:clock.checkpoint()};
      const controller=createAttemptController({question,state,policy,clock,sample:()=>sample(now)});
      now=1000;
      assert.equal(controller.dispatch({kind:'submit',at:1000000+now}).accepted,false);
      assert.equal(clock.checkpoint().finished,false);
      now=2000;
      assert.equal(controller.dispatch({kind:'assist',assistance:{kind:'reveal',supportId:'worked-answer',at:1000000+now}}).accepted,true);
      const first=controller.state().firstResponse;
      assert.equal(first.timing.activeMs,2000);
      assert.equal(assessmentToEvidence(controller.state()),null);
      now=3000;controller.interact(sample(now));
      assert.deepEqual(controller.state().firstResponse,first);
      assert.equal(clock.checkpoint().activeMs,2000);
      checked++;
    }
  }
  assert.equal(checked,43);
});

test('stats count measured zero and immutable durations but never fabricate historical time',()=>{
  const records=[{score:0,completedAt:1,timing:{activeMs:0,idleLimitMs:60000}},{score:1,completedAt:2,timing:{activeMs:2000,idleLimitMs:60000}},{score:1,completedAt:3}];
  const counts=countEvidence(records);
  assert.equal(counts.total,3);assert.equal(counts.timed,2);assert.equal(counts.activeMs,2000);assert.equal(counts.medianActiveMs,1000);
});
