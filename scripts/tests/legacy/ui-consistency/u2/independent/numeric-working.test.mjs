import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateResponse, validateImport, safeJson} from '../../../../../../src/persistence/validation.ts';
import {createNumericScenario} from '../../../../fixtures/legacy/s1/attempt/scenarios.ts';
import {assessmentToEvidence} from '../../../../../../src/domain/attempt/attempt.ts';

const response = (working) => ({kind:'numeric',raw:'3',unit:'',...(working === undefined ? {} : {working})});
test('numeric working accepts bounded drafts and prior numeric responses', () => {
  for (const value of [response(),response({}),response({'working-enthalpy:2':'25.0','step_1':'−5e3'}),response(Object.fromEntries(Array.from({length:64},(_,i)=>[`field-${i}`,'x'.repeat(4096)])))]) {
    safeJson(value);validateResponse(value);validateResponse(JSON.parse(JSON.stringify(value)));
  }
});
test('numeric working rejects arbitrary invalid keys, bounds and non-string values', () => {
  for (const working of [[],null,42,{'':'x'},{['x'.repeat(101)]:'x'}, {'white space':'x'}, {constructor:'x'}, {prototype:'x'}, JSON.parse('{"__proto__":"x"}'), {a:42}, {a:null}, {a:'x'.repeat(4097)},Object.fromEntries(Array.from({length:65},(_,i)=>[`f${i}`,'x'])),Object.assign(Object.create({inherited:'x'}),{a:'x'})]) assert.throws(()=>validateResponse(response(working)));
});
test('current canonical import preserves working drafts exactly', () => {
  const batch=JSON.parse(fs.readFileSync(new URL('../../../../fixtures/legacy/ui-consistency/u2/independent/current-export.json',import.meta.url),'utf8'));
  const numeric=Object.values(batch.curriculum[0].firstResponse.responses).find(value=>value.kind==='numeric');
  assert(numeric);numeric.working={'same-run-draft':'23.75'};validateImport(batch);
  const restored=JSON.parse(JSON.stringify(batch));validateImport(restored);assert.deepEqual(restored,batch);
});
test('working survives controller restore without changing marking or first frozen input', () => {
  let milliseconds=0;
  const now=()=>({monotonicMs:milliseconds,wallMs:100000+milliseconds,visible:true,focused:true,suspended:false});
  const scenario=createNumericScenario(now);
  const draft=response({'working-1':'12.5'});
  scenario.controller.dispatch({kind:'respond',partId:'ph',response:draft});
  milliseconds=1000;scenario.controller.dispatch({kind:'submit',at:now().wallMs});
  const first=assessmentToEvidence(scenario.controller.state());
  assert.equal(scenario.controller.state().firstAssessment.score,0);
  assert.deepEqual(scenario.controller.state().firstResponse.responses.ph.working,draft.working);
  const restored=createNumericScenario(now,scenario.controller.state());
  assert.deepEqual(restored.controller.state().currentResponses.ph.working,draft.working);
  restored.controller.dispatch({kind:'respond',partId:'ph',response:{...draft,raw:'2',working:{'working-1':'999'}}});
  restored.controller.dispatch({kind:'check-correction',at:now().wallMs});
  assert.deepEqual(assessmentToEvidence(restored.controller.state()),first);
  assert.equal(assessmentToEvidence({mode:'teacher',ref:scenario.controller.state().ref,currentResponses:{ph:draft}}),null);
});
