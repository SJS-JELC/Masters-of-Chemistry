import test from 'node:test';
import assert from 'node:assert/strict';
import {structureProvider} from '../../../src/activities/igcse/structure-and-bonding/provider.ts';
import {structureMarking} from '../../../src/activities/igcse/structure-and-bonding/marking.ts';
import {createAttemptController} from '../../../src/domain/attempt/index.ts';
import {createActiveClock} from '../../../src/domain/timing/index.ts';
import {validateResponse,validateSession} from '../../../src/persistence/validation.ts';
import type {DotCrossSnapshot,StudentAttempt} from '../../../src/contracts/index.ts';

test('real source explanation minimums reject before response/time freeze',()=>{
 for(const level of [2,3] as const){
  const ref=structureProvider.select({activityId:'igcse/structure-and-bonding',level,seed:0,previousQuestionIds:[]});
  const question=structureProvider.restore(ref),part=question.parts[0];assert.equal(part?.kind,'explanation');
  if(part?.kind!=='explanation')throw Error('Missing source explanation');
  const state:StudentAttempt={mode:'student',namespace:{course:'igcse',profileId:'test'},attemptId:`min-${level}`,
   ref:{...ref,activityId:'igcse/structure-and-bonding'},target:{course:'igcse',activityId:'igcse/structure-and-bonding',gemId:'lower-6-5',level},
   phase:'answering',currentResponses:{},assistance:[],timing:{attemptId:`min-${level}`,activeMs:0,idleLimitMs:180000,finished:false}};
  const sample={monotonicMs:0,wallMs:1000,visible:true,focused:true,suspended:false};
  const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:180000,now:()=>sample});
  const controller=createAttemptController({question,state,policy:structureMarking,clock,sample:()=>sample});
  assert.equal(controller.dispatch({kind:'respond',partId:part.id,response:{kind:'explanation',sections:part.sections.map(section=>({id:section.id,text:'tiny'}))}}).accepted,true);
  assert.equal(controller.dispatch({kind:'submit',at:1000}).accepted,false);
  assert.equal(controller.state().phase,'answering');assert.equal(clock.checkpoint()?.finished,false);
  assert.equal(controller.dispatch({kind:'respond',partId:part.id,response:{kind:'explanation',sections:part.sections.map(section=>({id:section.id,text:'A sufficient length response for source review.'}))}}).accepted,true);
  assert.equal(controller.dispatch({kind:'submit',at:1000}).accepted,true);
  assert.equal(controller.state().phase,'rubric-review');assert.equal(clock.checkpoint()?.finished,true);
 }
});

test('dotcross undo snapshots retain chemical wrongness and reject structural corruption, recursion and overflow',()=>{
 const wrong:DotCrossSnapshot={kind:'dot-and-cross',atoms:[{id:'c',element:'C',x:0,y:0}],electrons:[],groups:[{id:'wrong-charge',atomIds:['c'],charge:7,bracket:true}]};
 assert.doesNotThrow(()=>validateResponse({...wrong,history:[wrong],future:[]}));
 assert.throws(()=>validateResponse({...wrong,history:[{...wrong,history:[]}]}),/Unexpected persisted field/);
 assert.throws(()=>validateResponse({...wrong,history:Array.from({length:101},()=>wrong)}),/bounded array/);
 assert.throws(()=>validateResponse({...wrong,future:[{...wrong,groups:[{id:'dangling',atomIds:['missing'],charge:1,bracket:true}]}]}),/Dangling group atom/);
});

test('practice pause marker is optional for history and strict for persisted restoration',()=>{
 const session={kind:'practice',namespace:{course:'igcse',profileId:'test'},id:'current-session',target:{course:'igcse',activityId:'igcse/structure-and-bonding',gemId:'lower-6-5',level:2},selection:'fixed-level',currentAttemptId:null,previousQuestionIds:[]};
 for(const value of [session,{...session,paused:true},{...session,paused:false}])assert.doesNotThrow(()=>validateSession(value));
 assert.throws(()=>validateSession({...session,paused:'true'}),/Invalid practice pause state/);
});
