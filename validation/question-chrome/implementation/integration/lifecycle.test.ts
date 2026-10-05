import test from 'node:test';
import assert from 'node:assert/strict';
import { canContinueStoredSession } from '../../../../src/foundation/session-continuation.ts';
import { targetSubtopic, teacherSubtopic } from '../../../../src/foundation/question-heading.ts';
import { productionRegistry } from '../../../../src/foundation/registry.ts';
import type { CurriculumSession, StudentAttempt } from '../../../../src/contracts/index.ts';

const target = {course:'alevel',activityId:'alevel/acid-base-calculations',gemId:'u6-t1-1-7',level:1} as const;
const attempt = {attemptId:'preserved-attempt',target} as StudentAttempt;
const session = {kind:'practice',currentAttemptId:attempt.attemptId,target,paused:true} as CurriculumSession;
test('stored continuation requires exact session identity and matching ready student view', () => {
  const input={session,attempt,view:'practice' as const,launchRequest:undefined,ready:true,setupOpen:false};
  assert.equal(canContinueStoredSession(input),true);
  assert.equal(canContinueStoredSession({...input,session:null}),false);
  assert.equal(canContinueStoredSession({...input,attempt:null}),false);
  assert.equal(canContinueStoredSession({...input,ready:false}),false);
  assert.equal(canContinueStoredSession({...input,setupOpen:true}),false);
  assert.equal(canContinueStoredSession({...input,departing:true}),false);
  for(const view of ['teacher','home','revision'] as const) assert.equal(canContinueStoredSession({...input,view}),false);
  assert.equal(canContinueStoredSession({...input,attempt:{...attempt,attemptId:'another'}}),false);
});
test('every explicit launch suppresses automatic old-session continuation', () => {
  const input={session,attempt,view:'practice' as const,ready:true,setupOpen:false};
  assert.equal(canContinueStoredSession({...input,launchRequest:{id:'fresh',kind:'practice',target,selection:'fixed-level',fresh:true}}),false);
  assert.equal(canContinueStoredSession({...input,launchRequest:{id:'changed',kind:'revision',course:'alevel',targets:[target],gemIds:[target.gemId]}}),false);
});
test('revision continuation checks current attempt rather than previous completed entries', () => {
  const revision={kind:'revision',current:{attemptId:attempt.attemptId},status:'paused'} as CurriculumSession;
  const input={session:revision,attempt,view:'revision' as const,launchRequest:undefined,ready:true,setupOpen:false};
  assert.equal(canContinueStoredSession(input),true);
  assert.equal(canContinueStoredSession({...input,session:{...revision,current:null} as CurriculumSession}),false);
});
test('all enabled target headings match explicit gems, including Making Buffers', async () => {
  for(const course of ['alevel','igcse'] as const) for(const registration of productionRegistry.curriculumFor(course)) {
    for(const gem of registration.gems) for(const level of gem.supportedLevels) {
      const value={course:registration.course,activityId:registration.id,gemId:gem.id,level};
      assert.equal(targetSubtopic(productionRegistry,value),gem.label);
    }
  }
  assert.equal(targetSubtopic(productionRegistry,target),'Making Buffers');
});
test('teacher headings follow provider identity across acid scopes and IGCSE source categories', async () => {
  for(const activityId of ['alevel/acid-base-calculations','igcse/dot-and-cross'] as const) {
    const registration=productionRegistry.get(activityId)!;
    if(registration.strand!=='curriculum') throw Error('Expected curriculum');
    const provider=await registration.provider();
    for(const gem of registration.gems) for(const level of gem.supportedLevels) {
      const ref=provider.select({activityId,gemId:gem.id,level,seed:19,previousQuestionIds:[]});
      assert.equal(await teacherSubtopic(productionRegistry,provider.restore(ref)),gem.label,`${gem.id}/${level}`);
    }
  }
});
