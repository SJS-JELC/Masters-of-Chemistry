import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import test from 'node:test';
import { landingProgress } from '../../../src/landing/progress.ts';
import { activityDefinitions } from '../../../src/catalogue/definitions.ts';
const project=path.resolve(import.meta.dirname,'../../..'),workspace=path.resolve(project,'../..');
const catalogue=JSON.parse(fs.readFileSync(path.join(project,'src/landing/catalogue-data.json')));
const originals={alevel:'Masters-of-A-Level-Chemistry',igcse:'Masters-of-IGCSE-Chemistry'};
const now=1791028800000;
function reference(course,records){const stores=new Map();stores.set('masters-alevel-results-v1',JSON.stringify(records.filter(r=>!r.leafId.startsWith('u6')||r.leafId==='u6-t1-1-9')));stores.set('masters-alevel-results-acid-v2',JSON.stringify(records.filter(r=>r.leafId.startsWith('u6')&&r.leafId!=='u6-t1-1-9')));const context={Date:class extends Date{static now(){return now;}},localStorage:{getItem:key=>stores.get(key)||null}};for(const rel of course==='alevel'?['assets/alevel-mastery.js']:['assets/igcse-mastery-config.js','landing/progress.js'])vm.runInNewContext(fs.readFileSync(path.join(workspace,'apps',originals[course],'src',rel),'utf8'),context);return course==='alevel'?context.ALevelMastery:context.MastersProgress;}
test('Actual full catalogue and hidden redirect inventory match original catalogues',()=>{for(const course of ['alevel','igcse']){const ctx={};vm.runInNewContext(fs.readFileSync(path.join(workspace,'apps',originals[course],'src/landing/catalog.js'),'utf8'),ctx);assert.deepEqual(catalogue[course].groups,JSON.parse(JSON.stringify(ctx.MASTERS_HIERARCHY)));const { ['l6-t2-1-properties']: addition, ...originalActivities } = catalogue[course].activities;assert.deepEqual(originalActivities,JSON.parse(JSON.stringify(ctx.MASTERS_ACTIVITIES)));if(course==='alevel'){assert.equal(addition.label,'Explaining Properties');assert.deepEqual(addition.availableGrades,[1,2]);assert.equal(addition.mastery,true);}const total=catalogue[course].groups.flatMap(g=>g.topics.flatMap(t=>t[2])).length;assert.equal(total,course==='alevel'?154:64);assert.equal(total-catalogue[course].display.hiddenGems.length,course==='alevel'?152:64);}assert.deepEqual(catalogue.alevel.display.hiddenGems,['u6-t2-7-1','u6-t1-1-4']);assert.deepEqual(catalogue.alevel.display.redirects,{'u6-t2-7-1':'l6-t2-1-2','u6-t1-1-4':'u6-t1-1-5'});assert.deepEqual(catalogue.alevel.display.identities,{'l6-t2-1-4':'l6-t2-1-properties'});});
test('Landing progress agrees with source recurrence, awards, supported levels and freshness boundaries',()=>{
 let compared=0;
 for(const course of ['alevel','igcse'])for(const activity of activityDefinitions.filter(a=>a.course===course&&a.strand==='curriculum'&&a.id!=='alevel/explaining-properties'))for(const gem of activity.gems)for(const grade of [0,1,2,3])for(const days of [0,7,8,21,22]){
  const originalRows=[];const history=[];
  for(const level of gem.supportedLevels){if(level>grade)continue;for(let index=0;index<16;index++){
    const row={id:`${gem.id}-${level}-${index}`,leafId:gem.id,level,grade:level,score:1,completedAt:now-days*86400000-(15-index)*1000,progressionVersion:gem.mastery.activeProgressionVersion??1};originalRows.push(row);
    history.push({kind:'curriculum',id:row.id,profileId:'local',course,gemId:gem.id,score:row.score,completedAt:row.completedAt,provenance:'legacy-import',progressionVersion:row.progressionVersion,...(course==='alevel'?{level}:{grade:level})});
  }}
  const ref=reference(course,originalRows),result=landingProgress(course,history,gem,now);
  const expected=course==='alevel'?ref.achievement(gem.id):ref.achievement(originalRows,gem.id,now);
  assert.equal(result.grade,course==='alevel'?expected.level:expected.achievedGrade,gem.id);
  const sourceDisplay=course==='alevel'?(expected.level?expected.states[expected.level-1]:expected.states.find(state=>state.score!==null)):expected;
  assert.equal(result.score,sourceDisplay?.score??null);
  assert.equal(result.days,sourceDisplay?.days??null);
  assert.equal(result.freshness,(sourceDisplay?.freshness==='unreviewed'?'unstarted':sourceDisplay?.freshness)||'unstarted');
  for(const state of result.states){const src=course==='alevel'?ref.summary(gem.id,state.level):ref.summarise(originalRows,gem.id,state.level,now);assert.equal(state.score,src.score);assert.equal(state.count,src.count);assert.equal(state.mastered,src.mastered);assert.equal(state.days,src.days);assert.equal(state.freshness,src.freshness==='unreviewed'?'unstarted':src.freshness);compared++;}
 }
 assert(compared>600);assert.equal(activityDefinitions.filter(a=>a.strand==='curriculum').flatMap(a=>a.gems).length,17);
});
test('Source CSS scoping does not rewrite gem-body class tokens',()=>{for(const course of ['alevel','igcse']){const css=fs.readFileSync(path.join(project,`src/landing/${course}.css`),'utf8');assert(css.includes(`.original-landing.${course} .gem-body`));assert(!css.includes('.gem-.original-landing'));assert(css.includes('prefers-reduced-motion'));}});
