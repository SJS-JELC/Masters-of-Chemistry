import test from 'node:test';
import assert from 'node:assert/strict';
import {factsFor,recallCoverage} from '../../src/recall/facts.ts';
import {factsForRecallScope,topicsFor} from '../../src/recall/session-contract.ts';
import {shuffleRecallIds} from '../../src/recall/selection.ts';
import {createRecallSession,selectRecallFact} from '../../src/recall/scheduler.ts';
import {reconcileRecallTestSession} from '../../src/recall/recall-hub.ts';
test('primary selection excludes supporting links and covers each fact once across topic batches',()=>{
 for(const course of ['igcse','alevel']){
 const bank=factsFor(course),covered=topicsFor(course).flatMap(t=>factsForRecallScope(bank,course,{kind:'global',topicIds:[t.id]}).map(f=>f.id));
 assert.deepEqual([...covered].sort(),bank.map(f=>f.id).sort());
 for(const gem of recallCoverage(course)){
 const expected=bank.filter(f=>f.gemIds[0]===gem.gemId).map(f=>f.id);
 assert.deepEqual(gem.factIds,expected);
 assert.deepEqual(factsForRecallScope(bank,course,{kind:'gem',gemId:gem.gemId}).map(f=>f.id),expected);
 }
 }
 assert(!factsFor('igcse',['lower-8-3']).some(f=>f.id==='igcse-recall-048'));
 assert(factsFor('igcse',['fourth-4-1']).some(f=>f.id==='igcse-recall-048'));
});
test('shuffle is a deduplicated permutation; due selection respects queue order and resume preserves it',()=>{
 const input=['a','b','c','a'];assert.deepEqual(shuffleRecallIds(input,()=>0),['b','c','a']);assert.deepEqual(input,['a','b','c','a']);
 const ns={course:'igcse',profileId:'test'}, scope={kind:'gem',gemId:'fourth-4-1'},bank=factsFor('igcse'),selected=factsFor('igcse',[scope.gemId]);
 const session=createRecallSession(ns,'random','recall-revision',selected.map(f=>f.id));
 assert.deepEqual([...session.factIds].sort(),selected.map(f=>f.id).sort());
 assert.deepEqual(reconcileRecallTestSession(session,'igcse',bank,selected,scope).factIds,session.factIds);
 const reversed={...session,factIds:['c','b','a']};assert.equal(selectRecallFact(reversed,[],100),'c');
 assert.equal(selectRecallFact(reversed,[{factId:'c',dueAt:200}],100),'b');
 assert.equal(selectRecallFact({...reversed,visitedFactIds:['c','b']},[],100),'a');
});

test('formula and ion recall belong primarily to Formulae & Equations',()=>{
 const ids=Array.from({length:8},(_,i)=>'igcse-recall-'+String(i+26).padStart(3,'0'));
 assert.deepEqual(factsFor('igcse',['fourth-16-1']).map(f=>f.id).sort(),ids);
 assert.deepEqual(factsForRecallScope(factsFor('igcse'),'igcse',{kind:'global',topicIds:['fourth-16']}).map(f=>f.id).sort(),ids);
 assert(!factsFor('igcse',['fourth-3-1','fourth-3-2']).some(f=>ids.includes(f.id)));
 assert(factsFor('igcse',['lower-8-1']).some(f=>f.id==='igcse-recall-119'));
});
