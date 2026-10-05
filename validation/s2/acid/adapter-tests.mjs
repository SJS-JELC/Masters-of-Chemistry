import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {acidEngine} from '../../../src/activities/alevel/acid-base-calculations/engine.js';
import {acidProvider,acidSourceQuestion,acidNotation} from '../../../src/activities/alevel/acid-base-calculations/provider.ts';
import {acidMarking} from '../../../src/activities/alevel/acid-base-calculations/marking.ts';
import {acidAdapter} from '../../../src/activities/alevel/acid-base-calculations/index.ts';
import {acidSources} from '../../../src/activities/alevel/acid-base-calculations/sources.ts';
import {parseScientificNumber} from '../../../src/domain/attempt/input-checks.ts';
import {acidPersistedTemplateCodes} from '../../../src/activities/alevel/acid-base-calculations/persisted-codes.ts';
import {activityDefinitions} from '../../../src/catalogue/definitions.ts';
import {createCourseMastery} from '../../../src/domain/mastery/course-mastery.ts';
const workspace=resolve(import.meta.dirname,'../../../../..');
const manifest=JSON.parse(readFileSync(resolve(workspace,'apps/Masters-of-Chemistry/validation/s0/inventory/coverage-manifest.json'),'utf8'));
const inventory=manifest.activities.find(activity=>activity.id==='alevel/acid-base-calculations');assert(inventory);
assert.deepEqual(acidEngine.scopes,inventory.generatorCoverage.find(entry=>entry.path==='AcidBaseLevels.scopes').entries);
assert.deepEqual(acidEngine.templates.map(template=>template.id),inventory.generatorCoverage.find(entry=>entry.path==='AcidBaseLevels.templates').ids);
assert.deepEqual(acidPersistedTemplateCodes,Object.fromEntries(inventory.historicalCodecMappings.templates.map(item=>[item.indexBase36,item.templateId])));
for(const level of [1,2,3])for(const scope of acidEngine.scopes)assert.deepEqual(scope.levels[level],inventory.levelMapping[level].leaves[scope.id].templateIds);
const context={};vm.createContext(context);
for(const file of ['data.js','core.js','levels.js'])vm.runInContext(readFileSync(resolve(workspace,'apps/Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations',file),'utf8'),context);
const original=context.AcidBaseLevels;
vm.runInContext(readFileSync(resolve(workspace,'apps/Masters-of-A-Level-Chemistry/src/assets/alevel-mastery.js'),'utf8'),context);
const definition=activityDefinitions.find(item=>item.id==='alevel/acid-base-calculations');
const titration=activityDefinitions.find(item=>item.id==='alevel/ph-titration-curves');
assert.deepEqual(definition.gems.map(gem=>gem.id),['u6-t1-1-2','u6-t1-1-3','u6-t1-1-5','u6-t1-1-7','u6-t1-1-8']);
assert.deepEqual(titration.gems.map(gem=>({id:gem.id,levels:gem.supportedLevels})),[{id:'u6-t1-1-9',levels:[2,3]}]);
for(const gem of definition.gems){const source=context.ALevelMastery.config[gem.id];assert.equal(gem.mastery.activeProgressionVersion,source.progressionVersion);assert.deepEqual(gem.supportedLevels,JSON.parse(JSON.stringify(source.availableGrades)));for(const level of gem.mastery.supportedLevels)assert.equal(level.halfLife,source.halfLives[level.level]);assert.equal(gem.mastery.threshold,0.8);assert.equal(gem.mastery.comparison,'strictly-greater');
 const historyRecord={kind:'curriculum',id:'historical-one',profileId:'synthetic',gemId:gem.id,score:1,completedAt:Date.now(),course:'alevel',level:1,provenance:'legacy-import',sourceKey:'masters-alevel-results-v1',progressionVersion:1};assert.equal(createCourseMastery('alevel').summarize([historyRecord],gem.mastery,1).count,0);
}
assert.deepEqual(acidEngine.templates,JSON.parse(JSON.stringify(original.templates)));
assert.deepEqual(acidEngine.scopes,JSON.parse(JSON.stringify(original.scopes)));
for(const source of acidSources)assert.equal(createHash('sha256').update(readFileSync(resolve(workspace,source.path))).digest('hex'),source.sha256);
let routes=0,roundtrips=0,marks=0;
const familyIds=new Set();
const seeds=[0,1,7,19,2718,4294967295];
for(const scope of acidEngine.scopes)for(const level of [1,2,3])for(const template of scope.levels[level]){
 routes++;familyIds.add(template);
 for(const seed of seeds){
  const source=acidEngine.generate(template,level,seed);
  assert.deepEqual(source,JSON.parse(JSON.stringify(original.generate(template,level,seed))));
  const ref=acidProvider.resolveLink(source.reviewId);assert(ref);assert.equal(ref.seed,seed);assert.equal(ref.level,level);
  const question=acidProvider.restore(ref);assert.deepEqual(acidSourceQuestion(ref),source);
  assert.equal(question.parts.length,source.responses.length);assert.equal(question.workedAnswer.length,source.working.flatMap(line=>line.split(';')).length);
  assert(question.parts.every(part=>part.inputMode==='text'));
  assert.deepEqual(question.parts.map(part=>part.id),source.responses.map(part=>part.key));
  const expectedAllowance=context.ActiveQuestionTime;
  assert.equal(typeof expectedAllowance,'undefined'); // timer runtime deliberately not loaded into source test.
  const allowance=acidAdapter.idleAllowance(question);assert([60000,180000,300000,600000].includes(allowance));
  const response=Object.fromEntries(source.responses.map(part=>[part.key,{kind:'numeric',raw:String(part.expected),unit:part.unit}]));
  const correct=acidMarking.mark(question,response);assert(correct.accepted);assert.equal(acidMarking.masteryScore(correct.marks),1);
  const wrong=Object.fromEntries(source.responses.map(part=>[part.key,{kind:'numeric',raw:String(part.expected+Math.max(1,part.tolerance*100)),unit:part.unit}]));
  const incorrect=acidMarking.mark(question,wrong);assert(incorrect.accepted);assert.equal(acidMarking.masteryScore(incorrect.marks),0);
  assert.equal(acidMarking.mark(question,{}).accepted,false);
  const incomplete={...response};delete incomplete[source.responses[0].key];assert.equal(acidMarking.mark(question,incomplete).accepted,false);
  const bad={...response,[source.responses[0].key]:{kind:'numeric',raw:'1+2',unit:source.responses[0].unit}};assert.equal(acidMarking.mark(question,bad).accepted,false);
  if(source.responses.length>1){const partial={...wrong,[source.responses[0].key]:response[source.responses[0].key]};const outcome=acidMarking.mark(question,partial);assert(outcome.accepted);assert.equal(acidMarking.masteryScore(outcome.marks),0.5);}
  for(const part of source.responses){
   const rounded=part.format==='dp2'?part.expected.toFixed(2):part.expected.toPrecision(3);
   assert.equal(acidEngine.score([rounded],[part]).score,1);
   assert.equal(acidEngine.score([String(part.expected+part.tolerance*1.01)],[part]).score,0);
   assert.equal(acidEngine.score([String(part.expected+part.tolerance*0.99)],[part]).score,1);
   marks++;
  }
  assert.throws(()=>acidProvider.restore({...ref,seed:seed===0?1:0}));roundtrips++;
 }
}
assert.equal(routes,63);assert.equal(familyIds.size,38);assert.equal(acidProvider.coverage[0].families.length,38);
// Verify exact original per-template time, never field-count-derived.
vm.runInContext(readFileSync(resolve(workspace,'apps/Masters-of-A-Level-Chemistry/src/assets/active-question-time.js'),'utf8'),context);
for(const family of acidProvider.coverage[0].families)for(const level of family.levels){const source=acidEngine.generate(family.templateId,level,1);assert.equal(acidAdapter.idleAllowance(acidProvider.restore(acidProvider.resolveLink(source.reviewId))),context.ActiveQuestionTime.allowance('acid',source));}
// Roundtrip all33 historical fixtures separately; these never enter selection/current progression.
const history=JSON.parse(readFileSync(resolve(workspace,'development/tests/fixtures/acid-legacy-reviews.json'),'utf8')).questions;
for(const fixture of history){const source=acidEngine.generateFromReview(fixture.reviewId);assert.equal(source.legacy,true);const plain={...source};delete plain.legacy;assert.deepEqual(plain,fixture.question);const ref=acidProvider.resolveLink(fixture.reviewId);assert(ref);const question=acidProvider.restore(ref);assert.equal(question.ref.questionId,fixture.reviewId);assert.throws(()=>acidProvider.select({activityId:ref.activityId,gemId:'u6-t1-1-2',level:1,seed:1,previousQuestionIds:[fixture.reviewId]}));}
for(const scope of acidEngine.scopes)for(const level of [1,2,3]){let previous=[];const seen=new Set();for(let i=0;i<scope.levels[level].length;i++){const ref=acidProvider.select({activityId:'alevel/acid-base-calculations',gemId:scope.id,level,seed:i,previousQuestionIds:previous});const item=acidSourceQuestion(ref);assert(!seen.has(item.templateId));seen.add(item.templateId);previous.push(ref.questionId);}assert.equal(seen.size,scope.levels[level].length);}
for(const invalid of [{gemId:'u6-t1-1-4'},{gemId:'u6-t1-1-9'},{level:4},{seed:-1},{seed:1.5},{seed:4294967296},{previousQuestionIds:['AB2-00-1-0']}])assert.throws(()=>acidProvider.select({activityId:'alevel/acid-base-calculations',gemId:'u6-t1-1-2',level:1,seed:1,previousQuestionIds:[],...invalid}));
for(const raw of ['1.23e-4','1.23 × 10^-4','1.23 × 10⁻⁴','1.23x10-4','0.000123']){assert.equal(acidEngine.score([raw],[{expected:0.000123,tolerance:1e-10}]).score,1);assert.equal(parseScientificNumber(raw),0.000123);}
for(const raw of ['','1+2','1.23e-4 rubbish','Infinity','NaN'])assert.equal(acidEngine.score([raw],[{expected:1,tolerance:1}]).accepted,false);
assert.equal(acidNotation('K_a = 1.00 × 10^-4; M_r = 60.0'),'Kₐ = 1.00 × 10⁻⁴; Mᵣ = 60.0');
const report={status:'PASS',checkedAt:new Date().toISOString(),templates:familyIds.size,routes,seededRoundtrips:roundtrips,numericalParts:marks,historicalFixtures:history.length,checks:['Original engine output equality','Original source fingerprints','Every family/level/seed roundtrip and explicit source review codec','Correct/wrong/partial/incomplete/malformed numerical marking','Original rounding boundaries and standard-form notation','Exact original38 idle allowances','Template cycle exhaustion','Historical33 frozen fixture equality and current-selection rejection'],browser:'Pending actual production host; no browser PASS claimed'};
writeFileSync(resolve(import.meta.dirname,'adapter-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
