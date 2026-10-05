import test from 'node:test';
import type { ActivityDefinition } from '../../../../../src/catalogue/registry.ts';
import { activityScope, deriveActivityScope } from '../../../../../src/catalogue/scope.ts';
import { validCurriculumTarget } from '../../../../../src/domain/session/selection.ts';
import assert from 'node:assert/strict';
import { activityDefinitions } from '../../../../../src/catalogue/definitions.ts';
import { historicalLeaves } from '../../../../../src/catalogue/historical-leaves.ts';
import { deriveCatalogueBoundary, curriculumActivityIds, leafBoundary } from '../../../../../src/persistence/catalogue-boundary.ts';

test('canonical metadata preserves every accepted active leaf, level and retired source identity', () => {
  assert.equal(activityDefinitions.length, 12);
  assert.equal(curriculumActivityIds.length, 11);
  assert.equal(Object.keys(leafBoundary).length, 18);
  const current: readonly ActivityDefinition[] = activityDefinitions.filter(activity => activity.strand === 'curriculum');
  assert.equal(current.flatMap(activity => activity.gems).length, 16);
  assert.equal(current.flatMap(activity => activity.gems).reduce((n,gem) => n + gem.supportedLevels.length,0), 41);
  for (const activity of current) for (const gem of activity.gems) {
    assert.deepEqual(leafBoundary[gem.id], { activityId: activity.id, levels: gem.supportedLevels });
    for (const alias of gem.mastery.historicalAliases) assert.deepEqual(leafBoundary[alias], {activityId: activity.id, levels: gem.supportedLevels, historicalOnly: true});
  }
  assert.deepEqual(leafBoundary['u6-t1-1-4'], {activityId: 'alevel/acid-base-calculations', levels: [1,2,3], historicalOnly: true});
  assert(!curriculumActivityIds.includes('alevel/c3l6-organic-reactions'));
  assert(!Object.keys(leafBoundary).some(id => /rocket|c3l6/i.test(id)));
  assert(Object.isFrozen(leafBoundary));
});

test('a future checked standard activity or gem changes the derived metadata boundary without storage algorithm edits', () => {
  const extra = {
    id: 'alevel/dev-metadata-example', course: 'alevel' as const, strand: 'curriculum' as const,
    gems: [{id: 'dev-metadata-gem',supportedLevels: [2,3],mastery: {historicalAliases: []}}],
  };
  const derived = deriveCatalogueBoundary([...activityDefinitions, extra], historicalLeaves);
  assert(derived.activityIds.includes(extra.id));
  assert.deepEqual(derived.leaves['dev-metadata-gem'],{activityId:extra.id,levels:[2,3]});
  assert(!('historicalOnly' in derived.leaves['dev-metadata-gem']!));
  assert(!curriculumActivityIds.includes(extra.id), 'Fixture must never alter the production catalogue');
  const extension = {...extra,id:'alevel/acid-base-calculations'};
  const original = activityDefinitions.find(activity=>activity.id===extension.id)!;
  const extended = {...original,gems:[...original.gems,...extension.gems]};
  const gemBoundary = deriveCatalogueBoundary(activityDefinitions.map(activity=>activity.id===extended.id?extended:activity),historicalLeaves);
  assert.deepEqual(gemBoundary.leaves['dev-metadata-gem'],{activityId:extended.id,levels:[2,3]});
});

test('duplicate activities, aliases and unattached historical metadata fail closed', () => {
  assert.throws(()=>deriveCatalogueBoundary([...activityDefinitions,activityDefinitions[0]!]));
  assert.throws(()=>deriveCatalogueBoundary(activityDefinitions,[{id:'u6-t1-1-2',activityId:'alevel/acid-base-calculations',levels:[1]}]));
  assert.throws(()=>deriveCatalogueBoundary(activityDefinitions,[{id:'unattached',activityId:'alevel/unknown',levels:[1]}]));
});

test('revision and mastery scope projects canonical levels with no second onboarding list',()=>{
 for(const activity of activityDefinitions){
  const scope=activityScope.find(item=>item.id===activity.id)!;
  assert.deepEqual(scope.gems,activity.gems.map(gem=>({id:gem.id,supportedLevels:gem.supportedLevels})));
  if(activity.strand==='olympiad'){assert.deepEqual(scope.supportedLevels,[]);continue;}
  for(const gem of activity.gems) for(const level of gem.supportedLevels) assert(validCurriculumTarget(activity.course==='alevel'?{course:'alevel',activityId:activity.id,gemId:gem.id,level}:{course:'igcse',activityId:activity.id,gemId:gem.id,level}));
 }
 const original:ActivityDefinition=activityDefinitions[0]!;
 const gem={...original.gems[0]!,id:'dev-new-gem',supportedLevels:[2] as const,mastery:{...original.gems[0]!.mastery,gemId:'dev-new-gem',supportedLevels:original.gems[0]!.mastery.supportedLevels.filter(item=>item.level===2)}};
 const projected=deriveActivityScope([{...original,gems:[...original.gems,gem]}]);
 assert.deepEqual(projected[0]!.gems.at(-1),{id:'dev-new-gem',supportedLevels:[2]});
 assert(!activityScope.some(item=>item.gems.some(value=>value.id==='dev-new-gem')));
});
