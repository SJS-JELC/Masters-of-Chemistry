import test from 'node:test';
import assert from 'node:assert/strict';
import {validateResponse} from '../../../../src/persistence/validation.ts';
const old={kind:'dot-and-cross',atoms:[],electrons:[],groups:[]};
test('historic dot drafts and explicit boolean circle view round-trip without added chemical fields',()=>{
  for(const state of [old,{...old,circles:true},{...old,circles:false}]) {
    assert.doesNotThrow(()=>validateResponse(JSON.parse(JSON.stringify(state))));
    assert.deepEqual(JSON.parse(JSON.stringify(state)),state);
  }
  assert(!('circles' in old),'Historic draft must not be rewritten');
});
test('circle preference is strict and forbidden inside chemical history and future snapshots',()=>{
  for(const circles of ['false',0,1,null,[],{}])assert.throws(()=>validateResponse({...old,circles}));
  for(const field of ['history','future']) {
    assert.doesNotThrow(()=>validateResponse({...old,circles:false,[field]:[old]}));
    assert.throws(()=>validateResponse({...old,[field]:[{...old,circles:false}]}));
  }
  assert.throws(()=>validateResponse({...old,displayMode:'circles'}));
});
