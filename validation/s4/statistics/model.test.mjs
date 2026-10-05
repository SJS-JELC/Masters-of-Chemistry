import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {buildStatistics,countEvidence} from '../../../src/statistics/model.ts';
import {activityDefinitions} from '../../../src/catalogue/definitions.ts';
import {createCourseMastery} from '../../../src/domain/mastery/index.ts';
const project=new URL('../../../',import.meta.url),workspace=new URL('../../',project);
const golden=JSON.parse(fs.readFileSync(new URL('../../s1/session/source-golden.json',import.meta.url),'utf8'));
const registry={curriculumFor:course=>activityDefinitions.filter(a=>a.course===course&&a.strand==='curriculum')};
const NOW=golden.now,namespace={course:'alevel',profileId:'statistics-fixture'};
const record=(id,score=1,extra={})=>({kind:'curriculum',provenance:'legacy-import',id,profileId:namespace.profileId,course:'alevel',gemId:'l6-t2-1-1',level:1,score,completedAt:NOW-1000,...extra});

test('all 273 retained source mastery equivalence cases are unchanged through statistics',()=>{
  for(const source of golden.sources){const bytes=fs.readFileSync(new URL(source.path,workspace));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),source.sha256);}
  for(const row of golden.cases){
    const ns={course:row.course,profileId:namespace.profileId};
    const records=row.records.map(r=>({kind:'curriculum',provenance:'legacy-import',id:r.id,profileId:ns.profileId,course:row.course,gemId:r.leafId,score:r.score,completedAt:r.completedAt,
      ...(row.course==='alevel'?{level:r.level,...(r.progressionVersion===undefined?{}:{progressionVersion:r.progressionVersion})}:{grade:r.grade})}));
    const model=buildStatistics(ns,registry,records,{days:0,now:NOW});
    assert.deepEqual(model.rows.find(item=>item.gem.id===row.setting.gemId).levels.find(item=>item.level===row.level),row.expected,`${row.course}/${row.setting.gemId}/${row.level}/${row.name}`);
  }
});
test('actual legacy statistics count and duration semantics agree for both courses',()=>{
  const records=[record('c',1,{timing:{activeMs:180001,idleLimitMs:60000}}),record('p',.5,{timing:{activeMs:90000,idleLimitMs:180000}}),record('w',0),record('zero',0,{timing:{activeMs:0,idleLimitMs:60000}}),record('bad',1,{timing:{activeMs:-1,idleLimitMs:60000}})];
  for(const course of ['A-Level','IGCSE']){
    const context={};vm.runInNewContext(fs.readFileSync(new URL(`apps/Masters-of-${course}-Chemistry/src/assets/${course==='A-Level'?'alevel':'igcse'}-stats-core.js`,workspace),'utf8'),context);
    const source=(context.ALevelStats??context.IGCSEStats).counts(records.map(r=>({...r,timing:r.timing?{version:1,...r.timing}:undefined})));
    const current=countEvidence(records);
    for(const field of ['total','correct','partial','incorrect','timed','activeMs','medianActiveMs'])assert.equal(current[field],source[field]);
    assert.equal(JSON.stringify(current.timeByOutcome),JSON.stringify(source.activeMsByOutcome));
  }
});
test('period counts do not change all-time mastery; old acid progression is archived',()=>{
  const history=[record('old',1,{gemId:'u6-t1-1-2',progressionVersion:1}),record('current',.5,{gemId:'u6-t1-1-2',progressionVersion:2,completedAt:NOW-60*86400000}),record('recent',1,{gemId:'u6-t1-1-2',progressionVersion:2})];
  const all=buildStatistics(namespace,registry,history,{days:0,now:NOW}),week=buildStatistics(namespace,registry,history,{days:7,now:NOW});
  assert.equal(all.counts.total,2);assert.equal(week.counts.total,1);assert.equal(all.historical.length,1);
  assert.deepEqual(all.rows.map(row=>row.levels),week.rows.map(row=>row.levels));
  assert.equal(all.rows.find(row=>row.gem.id==='u6-t1-1-2').levels[0].count,2);
});
test('first-record deduplication, namespace and Olympiad/Rocket exclusion conserve chart totals',()=>{
  const history=[record('first',0,{timing:{activeMs:4000,idleLimitMs:60000}}),record('first',1,{timing:{activeMs:9000,idleLimitMs:60000}}),record('p',.5,{timing:{activeMs:2000,idleLimitMs:60000}}),record('other-profile',1,{profileId:'other'}),record('c3',1,{activityId:'alevel/c3l6-organic-reactions'}),record('rocket',1,{gemId:'rocket-recall'}),record('future',1,{completedAt:NOW+1}),record('other-course',1,{course:'igcse',grade:1})];
  const model=buildStatistics(namespace,registry,history,{days:0,now:NOW});
  assert.equal(model.counts.total,2);assert.equal(model.counts.activeMs,6000);assert.equal(model.counts.incorrect,1);assert.equal(model.counts.partial,1);
  assert.equal(model.bins.reduce((n,bin)=>n+bin.counts.total,0),2);assert.equal(model.bins.reduce((n,bin)=>n+bin.counts.activeMs,0),6000);
});
test('untimed history stays absent; IGCSE assisted saved score follows source mathematics',()=>{
  const ns={course:'igcse',profileId:namespace.profileId},history=[record('assist',0,{course:'igcse',gemId:'lower-10-3',grade:1,assisted:true}),record('ordinary',1,{course:'igcse',gemId:'lower-10-3',grade:1})];
  const before=JSON.stringify(history),model=buildStatistics(ns,registry,history,{days:0,now:NOW}),row=model.rows.find(row=>row.gem.id==='lower-10-3');
  assert.equal(model.counts.total,2);assert.equal(model.counts.assisted,1);assert.equal(model.counts.timed,0);assert.equal(model.counts.medianActiveMs,null);
  assert.deepEqual(row.levels[0],createCourseMastery('igcse',()=>NOW).summarize(history,row.gem.mastery,1));
  assert.equal(JSON.stringify(history),before);assert.equal(history[0].timing,undefined);
});
test('daily bins follow calendar dates across London daylight-saving boundary',()=>{
  process.env.TZ='Europe/London';
  const start=new Date(2026,9,24,12).getTime(),end=new Date(2026,9,26,12).getTime();
  const model=buildStatistics(namespace,registry,[record('first',1,{completedAt:start}),record('last',1,{completedAt:end})],{days:0,now:end});
  assert.equal(model.bins.length,3);assert.equal(model.bins[1].end-model.bins[1].start,25*60*60*1000);assert.equal(model.bins.reduce((n,bin)=>n+bin.counts.total,0),2);
});
