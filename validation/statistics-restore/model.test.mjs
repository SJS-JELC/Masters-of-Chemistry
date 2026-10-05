import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildStatistics} from '../../src/statistics/model.ts';
import {activityDefinitions} from '../../src/catalogue/definitions.ts';
const data=JSON.parse(fs.readFileSync(new URL('../../src/landing/catalogue-data.json',import.meta.url),'utf8'));
const catalogue=course=>data[course].groups.flatMap(group=>group.topics.flatMap(([topicNumber,topicName,names])=>names.map((name,index)=>({id:`${group.key}-${topicNumber}-${index+1}`,name,group,topicNumber,topicName})))).filter(gem=>!data[course].display.hiddenGems.includes(gem.id));
const registry={curriculumFor:course=>activityDefinitions.filter(a=>a.course===course&&a.strand==='curriculum')};
const now=new Date('2026-10-04T12:00:00Z').getTime(), ns={course:'alevel',profileId:'stats-restoration'};
const row=(id,gemId='l6-t2-1-1',score=1,extra={})=>({kind:'curriculum',provenance:'legacy-import',id,profileId:ns.profileId,course:'alevel',gemId,level:1,score,completedAt:now-1000,...extra});
const build=(records,options={},namespace=ns)=>buildStatistics(namespace,registry,records,{days:0,now,catalogue:catalogue(namespace.course),...options});

test('year/period/topic counts, full correctness and supported denominators match original semantics',()=>{
  const records=[row('lower'),row('upper','u6-t1-1-2',.5,{progressionVersion:2}),row('old','u6-t1-1-2',1,{progressionVersion:1}),row('yesterday','l6-t2-1-1',0,{completedAt:now-86400000-1})];
  const all=build(records), lower=build(records,{year:'l6'}),upper=build(records,{year:'u6'}),day=build(records,{days:1});
  assert.equal(all.counts.total,3);assert.equal(all.counts.correct/all.counts.total,1/3);assert.equal(all.practised,2);
  assert.equal(lower.counts.total,2);assert.equal(upper.counts.total,1);assert.equal(day.counts.total,2);
  assert.equal(all.topics.reduce((n,t)=>n+t.counts.total,0),3);assert.equal(lower.topics.length,1);assert.equal(upper.topics.length,1);
  assert.deepEqual(all.topics.map(t=>t.id),['l6-t2-1','u6-t1-1']);
  assert(all.topics.flatMap(t=>t.gems).some(g=>!g.row),'Unavailable peers retained');
  assert.equal(all.availableGems,all.rows.length);assert.equal(all.availableLevels,all.rows.reduce((n,r)=>n+r.gem.supportedLevels.length,0));
  assert.equal(lower.availableGems+upper.availableGems,all.availableGems);assert.equal(lower.availableLevels+upper.availableLevels,all.availableLevels);
  assert.deepEqual(day.rows.map(r=>r.levels),all.rows.map(r=>r.levels));assert.equal(all.historical.length,1);assert.equal(lower.historical.length,0);
});
test('both courses retain configured bands and unavailable levels without denominator inflation',()=>{
  const model=build([row('ig','fourth-3-1',1,{course:'igcse',grade:1})],{}, {course:'igcse',profileId:ns.profileId});
  const gem=model.rows.find(r=>r.gem.id==='fourth-3-1');assert.deepEqual(gem.levels.map(l=>l.level),[1,2]);assert.equal(gem.gem.mastery.supportedLevels[0].label,'Grade 5–6');
  assert.equal(build([], {year:'upper'}, {course:'igcse',profileId:ns.profileId}).availableGems,0);
  assert.equal(model.counts.total,1);assert.equal(model.counts.timed,0);assert.equal(model.counts.activeMs,0);
});
test('latest twenty preserve oldest-to-newest ordering, exact dedup and canonical alias grouping',()=>{
  const records=Array.from({length:26},(_,i)=>row(`r${i}`,'l6-t2-1-1',i%3/2,{completedAt:now-(26-i)*1000}));
  records.push({...records[0],score:1});records.push(row('alias','l6-t2-1-4',.5));
  const model=build(records);assert.equal(model.excluded,1);const gem=model.rows.find(r=>r.gem.id==='l6-t2-1-1');
  assert.deepEqual(gem.records.slice(-20).map(r=>r.id),records.slice(6,26).map(r=>r.id));
  assert.equal(model.rows.find(r=>r.gem.id==='l6-t2-1-3').records[0].id,'alias');
  assert.deepEqual(model.bins.reduce((s,b)=>s+b.counts.total,0),model.counts.total);
});
test('all time and rolling periods match both source timelines including untimed and local dates',()=>{
  process.env.TZ='Europe/London';
  for(const course of ['alevel','igcse']) {
    const namespace={course,profileId:ns.profileId},gem=course==='alevel'?'l6-t2-1-1':'lower-10-3';
    const records=[row('a',gem,1,{course,grade:1,completedAt:now-40*86400000,timing:{activeMs:120000,idleLimitMs:60000}}),row('b',gem,.5,{course,grade:1,timing:{activeMs:60000,idleLimitMs:60000}}),row('c',gem,0,{course,grade:1})];
    const context={};vm.runInNewContext(fs.readFileSync(new URL(`../../../Masters-of-${course==='alevel'?'A-Level':'IGCSE'}-Chemistry/src/assets/${course}-stats-core.js`,import.meta.url),'utf8'),context);
    for(const days of [0,1,7,30]) {
      const model=build(records,{days},namespace),filtered=records.filter(r=>!days||r.completedAt>=now-days*86400000);
      const source=(context.ALevelStats??context.IGCSEStats).timeline(filtered.map(r=>({...r,timing:r.timing?{version:1,...r.timing}:undefined})),days,now);
      assert.deepEqual(model.bins.map(b=>[b.start,b.end,b.counts.total,b.counts.activeMs]),JSON.parse(JSON.stringify(source.bins.map(b=>[b.start,b.end,b.counts.total,b.counts.activeMs]))));
      assert.equal(model.counts.total-model.counts.timed,1);
    }
  }
});
test('Olympiad, invalid timing, future, profile/course and assisted new evidence cannot leak',()=>{
  const records=[row('normal'),row('olympiad','u6-t1-1-2',1,{activityId:'alevel/olympiad-2011-q4',progressionVersion:2}),row('future','l6-t2-1-1',1,{completedAt:now+1}),row('profile','l6-t2-1-1',1,{profileId:'other'}),row('assisted','l6-t2-1-1',1,{provenance:'new-attempt',independent:false,assisted:true}),row('invalid-time','l6-t2-1-1',.5,{timing:{activeMs:-1,idleLimitMs:60000}})];
  const model=build(records);assert.equal(model.counts.total,2);assert.equal(model.counts.timed,0);assert.equal(model.excluded,4);
});
test('DST spring and autumn produce contiguous 23/25-hour local bins without shifting totals',()=>{
 process.env.TZ='Europe/London';
 for(const [month,day,hours] of [[2,29,23],[9,25,25]]) {
   const end=new Date(2026,month,day+1,12).getTime();const model=buildStatistics(ns,registry,[row('before','l6-t2-1-1',1,{completedAt:new Date(2026,month,day-1,12).getTime()}),row('after','l6-t2-1-1',1,{completedAt:end})],{days:0,now:end});
   assert.equal(model.bins.length,3);assert.equal(model.bins[1].end-model.bins[1].start,hours*3600000);assert.equal(model.bins[0].end,model.bins[1].start);assert.equal(model.bins[1].end,model.bins[2].start);assert.equal(model.counts.total,2);
 }
});
