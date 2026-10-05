import test from 'node:test';
import assert from 'node:assert/strict';
import { olympiadCompletion } from '../../../../src/landing/olympiad-completion.ts';
import { c3Fixture, isomerFixture, drawing } from './fixtures.ts';
import { chemicalChallenge as c3Challenge } from '../../../../src/activities/olympiad/c3l6/source-bank.ts';
import { isomerChallenge } from '../../../../src/activities/olympiad/isomers2011/content.ts';
import { blankIsomerProgress, isomerPolicy } from '../../../../src/activities/olympiad/isomers2011/policy.ts';
const c3 = c3Challenge.activityId, iso = isomerChallenge.activityId;
test('both policies produce dim, partial and bright states; selector does not mutate progress', () => {
  for(const state of ['unstarted','partial','complete'] as const) for(const p of [c3Fixture(state),isomerFixture(state)]) {
    const before = structuredClone(p), selected = olympiadCompletion(p,p.activityId);
    assert.equal(selected.state,state); assert.deepEqual(p,before);
    assert.equal(selected.correct,state === 'complete' ? selected.total : state === 'partial' ? 1 : 0);
  }
  assert.equal(olympiadCompletion(null,c3).state,'unstarted');
  assert.equal(olympiadCompletion(c3Fixture('complete'),iso).state,'unstarted');
});
test('C3 stale edited checks, unchecked correct answers and forged completed flags never light a gem', () => {
  const p = c3Fixture('partial');
  assert.equal(olympiadCompletion({...p,aCheck:{...p.aCheck!,drawingFingerprint:'deadbeef'}},c3).state,'unstarted');
  assert.equal(olympiadCompletion({...p,aCheck:null},c3).state,'unstarted');
  assert.equal(olympiadCompletion({...c3Fixture('unstarted'),completed:{a:true,b:true,c:true}},c3).state,'unstarted');
  const full = c3Fixture('complete');
  assert.equal(olympiadCompletion({...full,slotChecks:{...full.slotChecks,Z:{...full.slotChecks.Z!,drawingFingerprint:'deadbeef'}}},c3).state,'partial');
});
test('isomers count exact checked placements only; wrongPlace alone, stale/edited and unchecked drawings remain dim', () => {
  let p = blankIsomerProgress('local');
  p = {...p,drawings:{'1':drawing(isomerChallenge.answers[1]!.graph)}};
  p = isomerPolicy.transition(isomerChallenge,p,{kind:'check'}).progress;
  assert.equal(p.check?.wrongPlace,1); assert.equal(olympiadCompletion(p,iso).state,'unstarted');
  const checked = isomerFixture('partial');
  assert.equal(olympiadCompletion({...checked,check:null},iso).state,'unstarted');
  assert.equal(olympiadCompletion({...checked,check:{...checked.check!,drawingFingerprint:'deadbeef'}},iso).state,'unstarted');
  assert.equal(olympiadCompletion({...checked,drawings:{'1':drawing(isomerChallenge.answers[1]!.graph)}},iso).state,'unstarted');
  assert.equal(olympiadCompletion({...blankIsomerProgress('local'),completed:true},iso).state,'unstarted');
});
test('invalid molecule state is explicitly unvalidated and cannot confer light', () => {
  const full = isomerFixture('complete');
  assert.equal(olympiadCompletion({...full,drawings:{'1':{kind:'molecule',graph:{atoms:[],bonds:[{a:1,b:999,order:1}]},history:[]}}},iso).state,'unstarted');
});
