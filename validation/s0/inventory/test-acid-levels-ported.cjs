// Read-only reference port from scripts/test_acid_levels.js. Only workspace root resolution and the outdated all-U6 acid-only assertion differ; titration inclusion is checked explicitly. Original remains unchanged.
'use strict';
// Integration between the five-topic model, shared mastery and historical reviews.
// Chemistry reconstruction is covered separately by test_acid_progression_model.js.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = process.cwd();
const base = path.resolve(process.env.MASTERS_ALEVEL_PREVIEW || path.join(root, 'apps/Masters-of-A-Level-Chemistry/src'));
const activity = path.join(base, 'activities/acid-base-calculations');
const stored = new Map();
const context = { localStorage: {getItem:key => stored.get(key) ?? null, setItem:(key,value) => stored.set(key,value)} };
vm.createContext(context);
for (const file of [path.join(activity,'data.js'),path.join(activity,'core.js'),path.join(activity,'levels.js'),path.join(base,'assets/alevel-mastery.js')]) vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const model = context.AcidBaseLevels, mastery = context.ALevelMastery;
const plain = value => JSON.parse(JSON.stringify(value));
const expectedLeaves = ['u6-t1-1-2','u6-t1-1-3','u6-t1-1-5','u6-t1-1-7','u6-t1-1-8'];
assert.deepEqual(plain(model.scopes.map(scope=>scope.id)),expectedLeaves);
assert.deepEqual(Object.keys(mastery.config).filter(id=>id.startsWith('u6-')), [...expectedLeaves, 'u6-t1-1-9']);
assert.deepEqual(plain(mastery.config['u6-t1-1-9'].availableGrades), [2,3]);
assert.equal(model.scopeFor('u6-t1-1-4'),null);
let checkedRoutes = 0;
for(const scope of model.scopes){
  assert.deepEqual(plain(model.templatesFor(scope.id,1)),plain(model.templatesFor(scope.id,2)),`${scope.id}: core content must be the same at L1 and L2`);
  for(const level of [1,2,3]){
    const templates=model.templatesFor(scope.id,level);
    assert(templates.length>0);
    let used=[];
    const chosen=[];
    for(let index=0;index<templates.length;index++){
      const next=model.chooseTemplate(scope.id,level,used,.43);used=next.used;chosen.push(next.templateId);
    }
    assert.equal(new Set(chosen).size,templates.length,'Cycle repeats before exhausting available families');
    const q=model.generate(templates[0],level,1731+level);
    assert.equal(q.level,level);
    assert(level===1 || q.responses.length===1);
    assert.equal(model.nextLevel('level',level,mastery,scope.id),level);
    const responses=q.responses.map(item=>context.AcidBaseCore.display(item.expected,item.format));
    const score=model.score(responses,q.responses);
    assert.equal(score.accepted,true);
    assert.equal(score.score,1);
    for(let attempt=0;attempt<5;attempt++){
      const result={id:`${scope.id}-${level}-${attempt}`,leafId:scope.id,level,score:score.score,completedAt:Date.now()};
      assert(mastery.record(result));
      assert(mastery.record({...result,score:0}));
    }
    assert.equal(mastery.summary(scope.id,level).count,5,'Repeated checks must not replace first-attempt evidence');
    assert.equal(mastery.summary(scope.id,level).mastered,true);
    assert.equal(model.nextLevel('mastery',null,mastery,scope.id),level===3?null:level+1);
    checkedRoutes++;
  }
  assert.equal(mastery.achievement(scope.id).level,3);
}
const fixtureFile=path.join(root,'development/tests/fixtures/acid-legacy-reviews.json');
const fixtures=JSON.parse(fs.readFileSync(fixtureFile,'utf8')).questions;
for(const fixture of fixtures){
  const restored=plain(model.generateFromReview(fixture.reviewId));
  assert.equal(restored.legacy,true);
  delete restored.legacy;
  assert.deepEqual(restored,fixture.question,`${fixture.reviewId}: historical question changed`);
}
console.log(`Acid progression integration passed: ${checkedRoutes} routes, ${fixtures.length} unchanged historical review questions.`);
