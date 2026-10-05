// React-platform port of the original registration gate: direct shared hosting
// replaces page bridges. Structural checks supplement independent S5 browsers.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { productionRegistry } from '../src/foundation/registry.ts';
import { activityDefinitions } from '../src/catalogue/definitions.ts';
import { selectCurriculumTargets, validCurriculumTarget } from '../src/domain/session/selection.ts';
import { selectPracticeQuestion } from '../src/domain/session/practice.ts';
import { createRevisionSession, revisionScheduler, bindRevisionQuestion } from '../src/domain/session/revision.ts';
import { IDLE_LIMITS } from '../src/domain/timing/active-clock.ts';

test('every complete registered gem has genuine practice/revision targets, source tuning and reproducible providers', async () => {
  const contract = JSON.parse(fs.readFileSync(new URL('../project-contract.json', import.meta.url), 'utf8'));
  assert.deepEqual(productionRegistry.activities.map(item=>item.id).sort(), contract.activities.map(item=>item.id).sort());
  assert.equal(productionRegistry.activities.length,13);
  let total = 0;
  for (const course of ['alevel','igcse']) {
    const registrations = productionRegistry.curriculumFor(course);
    const gems = registrations.flatMap(item=>item.gems);
    const targets = selectCurriculumTargets(registrations,course,gems.map(gem=>gem.id));
    assert.equal(new Set(targets.map(target=>`${target.gemId}:${target.level}`)).size,targets.length);
    for (const target of targets) {
      assert(validCurriculumTarget(target));
      const registration = productionRegistry.get(target.activityId);
      assert.equal(registration.strand,'curriculum');
      assert.equal(registration.revision,true);
      assert.equal(registration.renderer,'question-player');
      const definition = activityDefinitions.find(item=>item.id===registration.id);
      assert.deepEqual(registration.gems,definition.gems);
      const gem = registration.gems.find(item=>item.id===target.gemId);
      const tuning = gem.mastery.supportedLevels.find(item=>item.level===target.level);
      assert(tuning.halfLife>0);
      const provider = await registration.provider();
      assert(provider.coverage.length>0);
      const session = {kind:'practice',namespace:{course,profileId:'registration-gate'},id:`practice-${total}`,target,selection:'fixed-level',previousQuestionIds:[],paused:false};
      const selected = selectPracticeQuestion({session,provider,seed:42,summaries:[]});
      assert(selected);
      assert.deepEqual(provider.restore(selected.ref),selected.question);
      assert.equal(selected.ref.level,target.level);
      assert(selected.question.parts.length>0);
      assert(IDLE_LIMITS.includes(registration.idleAllowance(selected.question)));
      assert(registration.idleRationale.trim());
      const marking = await registration.marking();
      assert.equal(typeof marking.mark,'function');
      assert.equal(typeof marking.masteryScore,'function');
      total++;
    }
    const summaries = targets.map(target=>({gemId:target.gemId,level:target.level,score:null,count:0,mastered:false,lastCompletedAt:null}));
    const revision = createRevisionSession({namespace:{course,profileId:'registration-gate'},id:'revision-'+course,selected:targets,settings:gems.map(gem=>gem.mastery),summaries,now:1000000});
    assert.equal(revision.levels.length,targets.length);
    const next = revisionScheduler.next(revision,summaries,1000000,'first-'+course);
    const provider = await productionRegistry.get(next.current.target.activityId).provider();
    const ref = provider.select({...next.current.target,seed:42,previousQuestionIds:[]});
    assert.deepEqual(bindRevisionQuestion(next,ref).current.ref,ref);
  }
  assert.equal(total,41);
});

test('Olympiad and excluded functionality cannot enter curriculum registrations or evidence channels', () => {
  const olympiad = productionRegistry.get('alevel/c3l6-organic-reactions');
  assert.equal(olympiad.strand,'olympiad');
  assert.equal(olympiad.revision,false);
  for(const key of ['gems','mastery','idleAllowance']) assert(!Object.hasOwn(olympiad,key));
  assert(!productionRegistry.activities.some(item=>/rocket/i.test(item.id)));
  assert.throws(()=>selectCurriculumTargets(productionRegistry.curriculumFor('alevel'),'alevel',['c3l6']));
});
