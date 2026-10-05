import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createActiveClock } from '../../../src/domain/timing/active-clock.ts';
import { assessmentToEvidence, createAttemptController } from '../../../src/domain/attempt/attempt.ts';
import { checkEditorSubmission, parseScientificNumber } from '../../../src/domain/attempt/input-checks.ts';
import { answeringState, createNumericScenario, numericPolicy, numericQuestion } from './scenarios.ts';

const sample = (ms, visible=true, focused=true, suspended=false) => ({ monotonicMs: ms, wallMs: 100000+ms, visible, focused, suspended });
const answer = (raw='2.00') => ({ kind: 'respond', partId: 'ph', response: { kind: 'numeric', raw, unit: '' } });
function numeric() {
  let time = sample(0);
  const scenario = createNumericScenario(() => time);
  return { ...scenario, set(ms,visible=true,focused=true,suspended=false) { time=sample(ms,visible,focused,suspended); }, now: () => time,
    submit() { return scenario.controller.dispatch({ kind: 'submit', at: time.wallMs }); } };
}

test('clock matches pure source algorithm with wrapper suspension flags', () => {
  const context=vm.createContext({});
  vm.runInContext(readFileSync(new URL('../../../../Masters-of-A-Level-Chemistry/src/assets/active-question-time.js',import.meta.url),'utf8'),context);
  let time=0;
  const source=context.ActiveQuestionTime.create({ id:'a',idleLimitMs:60000,now:()=>time });
  const clock=createActiveClock({ attemptId:'a',idleLimitMs:60000,now:()=>sample(0) });
  const events=[[1000,true,false,false],[3000,true,false,true],[4000,true,false,false],[4500,false,false,false],
    [5000,true,false,true],[11000,true,true,false],[12000,true,false,true],[13000,true,false,false]];
  for (const [ms,visible,suspended,interact] of events) {
    time=ms;
    if(interact) { source.interact(visible); clock.interact(sample(ms,visible,true,suspended)); }
    else { source.tick(visible,suspended); clock.sample(sample(ms,visible,true,suspended)); }
    assert.equal(clock.checkpoint().activeMs,source.snapshot().activeMs);
  }
  assert.equal(clock.finish(sample(time)).activeMs,source.finish().activeMs);
});
test('idle deadline uses regular samples; trusted interaction restarts only after idle', () => {
  const clock=createActiveClock({ attemptId:'a',idleLimitMs:60000,now:()=>sample(0) });
  for(let ms=1000;ms<=70000;ms+=1000) clock.sample(sample(ms));
  assert.equal(clock.checkpoint().activeMs,60000);
  clock.interact(sample(70000)); clock.sample(sample(71000));
  assert.equal(clock.finish(sample(71000)).activeMs,61000);
  clock.interact(sample(72000)); assert.equal(clock.finish(sample(73000)).activeMs,61000);
});
test('hidden/focus/suspension intervals do not accrue; pauses require fresh interaction', () => {
  const clock=createActiveClock({attemptId:'a',idleLimitMs:60000,now:()=>sample(0)});
  clock.sample(sample(1000)); clock.sample(sample(2000,false)); clock.sample(sample(3000));
  assert.equal(clock.checkpoint().activeMs,1000);
  clock.interact(sample(3000)); clock.sample(sample(4000,true,false)); clock.interact(sample(5000));
  clock.sample(sample(11000)); clock.sample(sample(12000));
  assert.equal(clock.checkpoint().activeMs,1000);
  clock.interact(sample(12000)); clock.pause(sample(13000)); clock.sample(sample(14000));
  assert.equal(clock.checkpoint().activeMs,2000);
});
test('wall clock suspension/backwards time and initial hidden state are excluded', () => {
  const clock=createActiveClock({attemptId:'a',idleLimitMs:60000,now:()=>sample(0,false)});
  clock.sample(sample(1000)); assert.equal(clock.checkpoint().activeMs,0);
  clock.interact(sample(1000)); clock.sample({...sample(2000),wallMs:1});
  assert.equal(clock.checkpoint().activeMs,0);
});
test('same attempt restores saved time; mismatched ID/allowance reset, historical untimed stays absent', () => {
  const saved={attemptId:'a',idleLimitMs:60000,activeMs:1234,finished:false};
  assert.equal(createActiveClock({attemptId:'a',idleLimitMs:60000,saved,now:()=>sample(0)}).checkpoint().activeMs,1234);
  assert.equal(createActiveClock({attemptId:'b',idleLimitMs:60000,saved,now:()=>sample(0)}).checkpoint().activeMs,0);
  assert.equal(createActiveClock({attemptId:'a',idleLimitMs:180000,saved,now:()=>sample(0)}).checkpoint().activeMs,0);
  const untimed=createActiveClock({attemptId:'a',idleLimitMs:60000,completed:true,now:()=>sample(0)});
  assert.equal(untimed.checkpoint(),undefined); assert.equal(untimed.finish(sample(1000)),undefined);
});
test('incomplete/invalid numeric submission remains answering; accepted wrong input freezes score/time', () => {
  const scenario=numeric(); scenario.set(1000);
  assert.equal(scenario.submit().accepted,false); assert.equal(scenario.clock.checkpoint().finished,false);
  scenario.controller.dispatch(answer('2x')); assert.equal(scenario.submit().accepted,false);
  scenario.controller.dispatch(answer('3.00')); const transition=scenario.submit();
  assert.equal(transition.accepted,true); assert.equal(transition.state.firstAssessment.score,0);
  assert.equal(transition.state.firstResponse.timing.activeMs,1000);
  assert.equal(scenario.clock.checkpoint().finished,true);
});
test('first result and response survive corrections, duplicate Check, reload and new view assistance', () => {
  const scenario=numeric(); scenario.set(1000); scenario.controller.dispatch(answer('3')); scenario.submit();
  const first=assessmentToEvidence(scenario.controller.state());
  scenario.set(2000); scenario.controller.dispatch(answer('2'));
  scenario.controller.dispatch({kind:'assist',assistance:{kind:'worked-answer',supportId:'working',at:scenario.now().wallMs}});
  assert.equal(scenario.submit().accepted,false);
  assert.deepEqual(assessmentToEvidence(scenario.controller.state()),first);
  assert.throws(()=>{scenario.controller.state().firstAssessment.score=1;},TypeError);
  scenario.set(3000);
  const restored=createNumericScenario(scenario.now,scenario.controller.state());
  restored.controller.interact(sample(4000));
  assert.deepEqual(assessmentToEvidence(restored.controller.state()),first);
});
test('hints suppress independent evidence; reveal completes without meaningless guessed input', () => {
  const hinted=numeric(); hinted.set(1000);
  hinted.controller.dispatch({kind:'assist',assistance:{kind:'hint',supportId:'equation',at:hinted.now().wallMs}});
  hinted.controller.dispatch(answer()); hinted.submit();
  assert.equal(assessmentToEvidence(hinted.controller.state()),null);
  const revealed=numeric(); revealed.set(1000);
  const result=revealed.controller.dispatch({kind:'assist',assistance:{kind:'reveal',supportId:'answer',at:revealed.now().wallMs}});
  assert.equal(result.state.firstAssessment.kind,'revealed'); assert.deepEqual(result.state.firstResponse.responses,{});
  assert.equal(assessmentToEvidence(result.state),null); assert.equal(revealed.clock.checkpoint().finished,true);
});
test('teacher/review snapshots never create curriculum evidence', () => {
  assert.equal(assessmentToEvidence({mode:'teacher',ref:numericQuestion.ref,currentResponses:{}}),null);
  assert.equal(assessmentToEvidence({mode:'review',ref:numericQuestion.ref,currentResponses:{}}),null);
});
test('controller identity mismatch is rejected; fresh host-created attempt starts fresh timing', () => {
  assert.throws(()=>createAttemptController({question:numericQuestion,state:answeringState(),policy:numericPolicy,
    clock:createActiveClock({attemptId:'different',idleLimitMs:60000,now:()=>sample(0)}),sample:()=>sample(0)}),/identity/);
  const next=createNumericScenario(()=>sample(0),answeringState(numericQuestion,'new-id'));
  assert.equal(next.controller.state().attemptId,'new-id'); assert.equal(next.clock.checkpoint().activeMs,0);
});
test('excess molecular valence is assessable wrong; dangling graph is malformed; empty graph incomplete', () => {
  const graph={atoms:[{id:1,element:'O',x:0,y:0},...Array.from({length:5},(_,i)=>({id:i+2,element:'C',x:i+1,y:0}))],
    bonds:Array.from({length:5},(_,i)=>({a:1,b:i+2,order:1}))};
  assert.equal(checkEditorSubmission({kind:'molecule',graph,history:[]}).status,'ready');
  assert.equal(checkEditorSubmission({kind:'molecule',graph:{...graph,bonds:[{a:1,b:99,order:1}]},history:[]}).status,'malformed');
  assert.equal(checkEditorSubmission({kind:'molecule',graph:{atoms:[],bonds:[]},history:[]}).status,'incomplete');
  const question={...numericQuestion,parts:[{id:'mol',kind:'molecule',initial:{kind:'molecule',graph:{atoms:[],bonds:[]},history:[]},markingPolicyId:'valence',prompt:[],marks:1,required:true,dependsOn:[]}]};
  const policy={id:'valence',mark:()=>({accepted:true,marks:{earned:0,available:1,points:[{partId:'mol',pointId:'valence',earned:0,available:1,message:'Excess valence.'}]}}),masteryScore:()=>0};
  let time=sample(0); const state=answeringState(question); const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy,clock,sample:()=>time});
  controller.dispatch({kind:'respond',partId:'mol',response:{kind:'molecule',graph,history:[]}}); time=sample(1000);
  const result=controller.dispatch({kind:'submit',at:time.wallMs});
  assert.equal(result.accepted,true); assert.equal(result.state.firstAssessment.score,0);
});
test('unrecognized wording is rejected by activity policy rather than assessed as wrong', () => {
  let time=sample(0); const state=answeringState(); const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const policy={...numericPolicy,mark:()=>({accepted:false,issues:[{partId:'ph',textClassification:'unrecognized',message:'Ask your teacher.'}]})};
  const controller=createAttemptController({question:numericQuestion,state,policy,clock,sample:()=>time});
  controller.dispatch(answer()); time=sample(1000);
  assert.equal(controller.dispatch({kind:'submit',at:time.wallMs}).accepted,false); assert.equal(clock.checkpoint().finished,false);
});
test('automatic multiline text is independent of self-rubric presentation', () => {
  const question={...numericQuestion,parts:[{id:'explain',kind:'text',presentation:'multiline',accepted:['model'],normalization:'chemical-text',prompt:[],marks:1,required:true,dependsOn:[]}]};
  const policy={id:'auto-long',mark:()=>({accepted:true,marks:{earned:1,available:1,points:[{partId:'explain',pointId:'reason',earned:1,available:1,message:'Automatically marked.'}]}}),masteryScore:()=>1};
  let time=sample(0); const state=answeringState(question); const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy,clock,sample:()=>time});
  controller.dispatch({kind:'respond',partId:'explain',response:{kind:'text',value:'A long explanation with several sentences.'}});time=sample(1000);
  const result=controller.dispatch({kind:'submit',at:time.wallMs});
  assert.equal(result.state.phase,'assessed'); assert.equal(result.state.firstAssessment.selfAssessed,false);
});
test('self rubric freezes text/time then requires sequential exact evidence; finish never restarts timing', () => {
  const question={...numericQuestion,parts:[{id:'explain',kind:'explanation',sections:[{id:'answer',label:'Answer'}],assessment:'self-rubric',
    rubric:[{id:'a',text:'Strong bonds.',marks:1},{id:'b',text:'Compare energy.',marks:1}],prompt:[],marks:2,required:true,dependsOn:[]}]};
  let time=sample(0); const state=answeringState(question); const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy:numericPolicy,clock,sample:()=>time});
  controller.dispatch({kind:'respond',partId:'explain',response:{kind:'explanation',sections:[{id:'answer',text:'strong bonds'}]}});time=sample(1000);
  const locked=controller.dispatch({kind:'submit',at:time.wallMs}).state;
  assert.equal(locked.phase,'rubric-review'); assert.equal(clock.checkpoint().finished,true); assert.equal(assessmentToEvidence(locked),null);
  assert.equal(controller.dispatch({kind:'respond',partId:'explain',response:{kind:'explanation',sections:[{id:'answer',text:'changed'}]}}).accepted,false);
  assert.equal(controller.dispatch({kind:'judge-rubric',partId:'explain',judgement:{pointId:'b',status:'not-met'}}).accepted,false);
  assert.equal(controller.dispatch({kind:'judge-rubric',partId:'explain',judgement:{pointId:'a',status:'met',evidence:{start:0,end:12,text:'strong bonds'}}}).accepted,false);
  controller.dispatch({kind:'judge-rubric',partId:'explain',judgement:{pointId:'a',status:'awaiting-evidence'}});
  assert.equal(controller.dispatch({kind:'judge-rubric',partId:'explain',judgement:{pointId:'a',status:'met',evidence:{start:0,end:12,text:'wrong quote'}}}).accepted,false);
  controller.dispatch({kind:'judge-rubric',partId:'explain',judgement:{pointId:'a',status:'met',evidence:{start:0,end:12,text:'strong bonds'}}});
  controller.dispatch({kind:'judge-rubric',partId:'explain',judgement:{pointId:'b',status:'not-met'}});
  time=sample(30000); const assessed=controller.dispatch({kind:'finish-rubric',at:time.wallMs}).state;
  assert.equal(assessed.firstAssessment.score,.5); assert.equal(assessed.firstResponse.timing.activeMs,1000);
  assert.equal(assessmentToEvidence(assessed).selfAssessed,true);
});
test('post-assessment valid alternative alters learning marks only, rejects noneligible points', () => {
  const eligibility={kind:'valid-alternative',eligible:true,modelAnswer:'Model',rubric:[{kind:'text',text:'Equivalent wording'}]};
  const policy={id:'auto-text',mark:()=>({accepted:true,marks:{earned:0,available:1,points:[{partId:'ph',pointId:'p',earned:0,available:1,message:'Review',learningReview:eligibility}]}}),masteryScore:()=>0};
  const learningReviewPolicy={review:(_q,_response,first,_current,decisions)=>({kind:'post-assessment-learning',decisions,
    reviewedMarks:{...first.marks,earned:decisions.some(d=>d.judgement==='equivalent')?1:0,points:first.marks.points.map(p=>({...p,earned:decisions.some(d=>d.judgement==='equivalent')?1:0}))}})};
  let time=sample(0); const state=answeringState(); const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question:numericQuestion,state,policy,learningReviewPolicy,clock,sample:()=>time});
  const command={kind:'review-valid-alternative',decision:{partId:'ph',pointId:'p',judgement:'equivalent',reviewer:'student'}};
  assert.equal(controller.dispatch(command).accepted,false);controller.dispatch(answer());time=sample(1000);controller.dispatch({kind:'submit',at:time.wallMs});
  const first=assessmentToEvidence(controller.state());time=sample(2000);
  assert.equal(controller.dispatch(command).accepted,true);assert.equal(controller.state().learningReview.reviewedMarks.earned,1);
  assert.deepEqual(assessmentToEvidence(controller.state()),first);assert.equal(clock.checkpoint().activeMs,1000);
  assert.equal(controller.dispatch({...command,decision:{...command.decision,pointId:'invented'}}).accepted,false);
});
test('actual grade 3 bond source freezes first numeric marks then adds original drawing self-check mark', () => {
  const source=vm.createContext({});
  for (const file of ['activities/bond-enthalpy/data.js','activities/bond-enthalpy/core.js','assets/numeric-mastery.js','activities/bond-enthalpy/mastery-core.js']) {
    vm.runInContext(readFileSync(new URL('../../../../Masters-of-IGCSE-Chemistry/src/'+file,import.meta.url),'utf8'),source);
  }
  for (const matches of [true,false]) {
    const session=source.BondEnthalpyMastery.create(['enthalpy-change'],123,{practice:'grade',grade:3});
    const generated=source.BondEnthalpyMastery.generate(session);
    const question={...numericQuestion,ref:{activityId:'igcse/bond-enthalpy',questionId:generated.reviewId,seed:session.current.seed,level:3},
      parts:[...Array.from(generated.responses,r=>({id:r.key,kind:'numeric',prompt:[],marks:1,required:true,dependsOn:[],unit:r.unit??'',
        acceptance:{kind:'absolute',expected:r.expected,tolerance:r.expected===0?1e-9:.500001*10**(Math.floor(Math.log10(Math.abs(r.expected)))-2)}})),
        {id:'draw',kind:'drawing-self-check',prompt:[{kind:'text',text:'Draw the displayed equation before calculating.'}],model:[{kind:'image',src:'source-model.svg',alt:'Source displayed reaction.'}],
          criteria:['Every atom and bond','Balancing coefficients'],marks:1,required:true,dependsOn:[]}]};
    const state={mode:'student',namespace:{course:'igcse',profileId:'synthetic'},attemptId:'source-draw-'+matches,ref:question.ref,
      target:{course:'igcse',activityId:'igcse/bond-enthalpy',gemId:'lower-10-4',level:3},phase:'answering',currentResponses:{},assistance:[],
      timing:{attemptId:'source-draw-'+matches,activeMs:0,idleLimitMs:180000,finished:false}};
    let time=sample(0);const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:180000,now:()=>time});
    const controller=createAttemptController({question,state,policy:numericPolicy,clock,sample:()=>time});
    const values=Array.from(generated.responses,r=>String(r.expected));
    for(const [index,response] of Array.from(generated.responses).entries()) controller.dispatch({kind:'respond',partId:response.key,response:{kind:'numeric',raw:values[index],unit:response.unit??''}});
    assert.equal(source.BondEnthalpyMastery.submit(session,values).awaitingSelfCheck,true);
    time=sample(1000);const pending=controller.dispatch({kind:'submit',at:time.wallMs});
    assert.equal(pending.state.phase,'drawing-review');assert.equal(clock.checkpoint().finished,true);
    assert.equal(assessmentToEvidence(pending.state),null);
    // Source retries cannot alter the original correctness vector before confirmation.
    source.BondEnthalpyMastery.submit(session,values.map(()=> '987654321'));
    time=sample(2000);for(const response of Array.from(generated.responses)) controller.dispatch({kind:'respond',partId:response.key,response:{kind:'numeric',raw:'987654321',unit:response.unit??''}});
    assert.equal(source.BondEnthalpyMastery.confirm(session,matches),true);
    const final=controller.dispatch({kind:'confirm-drawing',partId:'draw',matches,at:time.wallMs});
    const originalPoints=[...Array.from(session.current.correct),matches];
    const expected=originalPoints.every(Boolean)?1:originalPoints.some(Boolean)?.5:0;
    assert.equal(final.state.firstAssessment.score,expected);
    assert.equal(final.state.firstAssessment.marks.available,originalPoints.length);
    assert.equal(final.state.firstResponse.timing.activeMs,1000);
    assert.equal(assessmentToEvidence(final.state).grade,3);
    assert.equal(controller.dispatch({kind:'confirm-drawing',partId:'draw',matches:!matches,at:time.wallMs}).accepted,false);
  }
});
test('scientific numeric precheck preserves actual acid input notation and rejects trailing garbage', () => {
  const source=vm.createContext({});
  for(const file of ['data.js','core.js','levels.js']) vm.runInContext(readFileSync(new URL('../../../../Masters-of-A-Level-Chemistry/src/activities/acid-base-calculations/'+file,import.meta.url),'utf8'),source);
  for(const raw of ['2.60','2.6e0','2.6 × 10⁰','2.6 x 10^0','2.6*10^0','−2.6','1,200','2x','Infinity','']) {
    const parsed=parseScientificNumber(raw);
    const result=source.AcidBaseLevels.score([raw],[{expected:2.6,tolerance:.0051}]);
    assert.equal(Number.isFinite(parsed),result.accepted,raw);
    if(result.accepted) assert.equal(parsed,result.results[0].entered,raw);
  }
});
test('mixed automatic and self-rubric parts preserve original numeric marks across the locked review', () => {
  const question={...numericQuestion,parts:[...numericQuestion.parts,{id:'reason',kind:'explanation',assessment:'self-rubric',sections:[{id:'answer',label:'Answer'}],
    rubric:[{id:'explain',text:'Reasoning point',marks:1}],prompt:[],marks:1,required:true,dependsOn:[]}]};
  let time=sample(0);const state=answeringState(question);const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy:numericPolicy,clock,sample:()=>time});
  controller.dispatch(answer('3'));controller.dispatch({kind:'respond',partId:'reason',response:{kind:'explanation',sections:[{id:'answer',text:'because'}]}});time=sample(1000);
  assert.equal(controller.dispatch({kind:'submit',at:time.wallMs}).state.automaticMarks.earned,0);
  controller.dispatch({kind:'judge-rubric',partId:'reason',judgement:{pointId:'explain',status:'awaiting-evidence'}});
  controller.dispatch({kind:'judge-rubric',partId:'reason',judgement:{pointId:'explain',status:'met',evidence:{start:0,end:7,text:'because'}}});
  time=sample(2000);const result=controller.dispatch({kind:'finish-rubric',at:time.wallMs});
  assert.equal(result.state.firstAssessment.marks.earned,1);assert.equal(result.state.firstAssessment.marks.available,2);
  assert.equal(result.state.firstAssessment.score,.5);assert.equal(result.state.firstResponse.timing.activeMs,1000);
});
test('inconsistent marking output cannot freeze an attempt or finish the clock', () => {
  const state=answeringState();let time=sample(0);const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const badPolicy={...numericPolicy,mark:()=>({accepted:true,marks:{earned:1,available:1,points:[]}})};
  const controller=createAttemptController({question:numericQuestion,state,policy:badPolicy,clock,sample:()=>time});
  controller.dispatch(answer());time=sample(1000);
  assert.equal(controller.dispatch({kind:'submit',at:time.wallMs}).accepted,false);assert.equal(clock.checkpoint().finished,false);
});

test('learning Check reports corrected automatic response repeatedly without changing first evidence or state', () => {
  const scenario=numeric();scenario.controller.dispatch(answer('3'));scenario.set(1000);scenario.submit();
  const original=scenario.controller.state(),first=assessmentToEvidence(original);
  const wrong=scenario.controller.dispatch({kind:'check-correction'});
  assert.equal(wrong.correctionFeedback.status,'wrong');assert.equal(wrong.state,original);
  const edit=scenario.controller.dispatch(answer('2'));
  assert.equal(edit.correctionFeedback,undefined,'No stored feedback can survive a response edit');
  const corrected=scenario.controller.state();scenario.set(30000);
  for(let count=0;count<3;count++) {
    const checked=scenario.controller.dispatch({kind:'check-correction'});
    assert.equal(checked.accepted,true);assert.equal(checked.state,corrected);
    assert.equal(checked.correctionFeedback.status,'correct');assert.equal(checked.correctionFeedback.marks.earned,1);
    assert.equal('score' in checked.correctionFeedback,false);assert.equal('timing' in checked.correctionFeedback,false);
    assert.deepEqual(assessmentToEvidence(checked.state),first);
    assert.deepEqual(checked.state.firstAssessment,original.firstAssessment);assert.equal(checked.state.firstAssessment.score,0);
    assert.deepEqual(checked.state.firstResponse,original.firstResponse);assert.equal(checked.state.firstResponse.timing.activeMs,1000);
  }
  assert.equal(scenario.clock.checkpoint().activeMs,1000);
  scenario.controller.dispatch(answer('2x'));
  const invalidState=scenario.controller.state(),invalid=scenario.controller.dispatch({kind:'check-correction'});
  assert.equal(invalid.state,invalidState);assert.equal(invalid.correctionFeedback.status,'incomplete');
  assert.equal('marks' in invalid.correctionFeedback,false);assert.deepEqual(assessmentToEvidence(invalid.state),first);
  assert.throws(()=>{wrong.correctionFeedback.marks.earned=1;},TypeError);
});

test('revealed answers can be checked for learning without creating a score or evidence', () => {
  const scenario=numeric();scenario.set(1000);
  scenario.controller.dispatch({kind:'assist',assistance:{kind:'reveal',supportId:'answer',at:scenario.now().wallMs}});
  const revealed=scenario.controller.state();
  const empty=scenario.controller.dispatch({kind:'check-correction'});
  assert.equal(empty.correctionFeedback.status,'incomplete');assert.equal(empty.state,revealed);
  scenario.controller.dispatch(answer('2'));const current=scenario.controller.state();scenario.set(30000);
  for(let count=0;count<3;count++) {
    const checked=scenario.controller.dispatch({kind:'check-correction'});
    assert.equal(checked.state,current);assert.equal(checked.correctionFeedback.status,'correct');
    assert.equal(checked.state.firstAssessment.kind,'revealed');assert.equal('score' in checked.state.firstAssessment,false);
    assert.deepEqual(checked.state.firstResponse,revealed.firstResponse);assert.equal(assessmentToEvidence(checked.state),null);
  }
  assert.equal(scenario.clock.checkpoint().activeMs,1000);
});

test('correction feedback distinguishes incomplete, unrecognized and recognised wrong text using current question', () => {
  const question={...numericQuestion,parts:[{id:'reason',kind:'text',accepted:['model'],normalization:'chemical-text',presentation:'multiline',prompt:[],marks:1,required:true,dependsOn:[]}]};
  let markCalls=0,masteryCalls=0,time=sample(0);
  const policy={id:'correction-text',mark:(_question,responses)=>{
    markCalls++;const value=responses.reason.value;
    if(value==='unknown')return {accepted:false,issues:[{partId:'reason',textClassification:'unrecognized',message:'Clarify your wording.',rubricSupport:[{kind:'text',text:'Review the model.'}]}]};
    const earned=value==='model'?1:0;return {accepted:true,marks:{earned,available:1,points:[{partId:'reason',pointId:'reason',earned,available:1,message:earned?'Correct.':'Wrong.'}]}};
  },masteryScore:marks=>{masteryCalls++;return marks.earned?1:0;}};
  const state=answeringState(question),clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy,clock,sample:()=>time});
  const respond=value=>controller.dispatch({kind:'respond',partId:'reason',response:{kind:'text',value}});
  respond('wrong');time=sample(1000);controller.dispatch({kind:'submit',at:time.wallMs});const first=assessmentToEvidence(controller.state());
  respond('');const calls=markCalls;const blank=controller.dispatch({kind:'check-correction'});
  assert.equal(blank.correctionFeedback.status,'incomplete');assert.equal(markCalls,calls,'Question precheck runs before policy');
  respond('unknown');const unknown=controller.dispatch({kind:'check-correction'});
  assert.equal(unknown.correctionFeedback.status,'unrecognized');assert.equal(unknown.correctionFeedback.issues[0].textClassification,'unrecognized');
  assert.equal(unknown.correctionFeedback.issues[0].rubricSupport[0].text,'Review the model.');
  respond('wrong');assert.equal(controller.dispatch({kind:'check-correction'}).correctionFeedback.status,'wrong');
  respond('model');assert.equal(controller.dispatch({kind:'check-correction'}).correctionFeedback.status,'correct');
  assert.equal(masteryCalls,1,'Learning checks never request a mastery score');assert.deepEqual(assessmentToEvidence(controller.state()),first);
});

test('mixed automatic and rubric corrections do not re-self-mark or require edited explanation input', () => {
  const question={...numericQuestion,parts:[...numericQuestion.parts,{id:'reason',kind:'explanation',assessment:'self-rubric',sections:[{id:'answer',label:'Answer'}],
    rubric:[{id:'explain',text:'Reasoning point',marks:1}],prompt:[],marks:1,required:true,dependsOn:[]}]};
  let time=sample(0),masteryCalls=0;const calls=[];
  const policy={...numericPolicy,mark:(q,responses)=>{calls.push({q,responses});return numericPolicy.mark(q,responses);},masteryScore:marks=>{masteryCalls++;return numericPolicy.masteryScore(marks);}};
  const state=answeringState(question),clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy,clock,sample:()=>time});
  controller.dispatch(answer('3'));controller.dispatch({kind:'respond',partId:'reason',response:{kind:'explanation',sections:[{id:'answer',text:'because'}]}});
  time=sample(1000);controller.dispatch({kind:'submit',at:time.wallMs});
  assert.equal(controller.dispatch({kind:'check-correction'}).accepted,false,'No learning Check during pending rubric review');
  controller.dispatch({kind:'judge-rubric',partId:'reason',judgement:{pointId:'explain',status:'not-met'}});
  time=sample(2000);controller.dispatch({kind:'finish-rubric',at:time.wallMs});const first=assessmentToEvidence(controller.state());
  controller.dispatch(answer('2'));controller.dispatch({kind:'respond',partId:'reason',response:{kind:'explanation',sections:[]}});
  const original=controller.state(),checked=controller.dispatch({kind:'check-correction'});
  assert.equal(checked.state,original);assert.equal(checked.correctionFeedback.status,'correct');assert.equal(checked.correctionFeedback.marks.available,1);
  assert.deepEqual(calls.at(-1).q.parts.map(part=>part.id),['ph']);assert.deepEqual(Object.keys(calls.at(-1).responses),['ph']);
  assert.deepEqual(assessmentToEvidence(checked.state),first);assert.equal(checked.state.firstAssessment.reviews[0].judgements[0].status,'not-met');
  assert.equal(masteryCalls,1);assert.equal(checked.state.firstResponse.timing.activeMs,1000);
});

test('drawing aggregate correction checks only automatic work and preserves original model judgement', () => {
  const question={...numericQuestion,parts:[...numericQuestion.parts,{id:'draw',kind:'drawing-self-check',model:[{kind:'text',text:'Model equation'}],criteria:['Every bond'],prompt:[],marks:1,required:true,dependsOn:[]}]};
  let time=sample(0);const state=answeringState(question),clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy:numericPolicy,clock,sample:()=>time});
  controller.dispatch(answer('3'));time=sample(1000);controller.dispatch({kind:'submit',at:time.wallMs});
  assert.equal(controller.dispatch({kind:'check-correction'}).accepted,false);
  time=sample(2000);controller.dispatch({kind:'confirm-drawing',partId:'draw',matches:false,at:time.wallMs});const first=assessmentToEvidence(controller.state());
  controller.dispatch(answer('2'));const original=controller.state(),checked=controller.dispatch({kind:'check-correction'});
  assert.equal(checked.state,original);assert.equal(checked.correctionFeedback.status,'correct');assert.equal(checked.correctionFeedback.marks.available,1);
  assert.equal(checked.state.firstAssessment.checks[0].judgement,'fail');assert.deepEqual(assessmentToEvidence(checked.state),first);
});

test('first answering and self-only assessed questions reject correction Check rather than inventing marks', () => {
  const scenario=numeric();assert.equal(scenario.controller.dispatch({kind:'check-correction'}).accepted,false);
  const question={...numericQuestion,parts:[{id:'reason',kind:'explanation',assessment:'self-rubric',sections:[{id:'answer',label:'Answer'}],
    rubric:[{id:'explain',text:'Reasoning point',marks:1}],prompt:[],marks:1,required:true,dependsOn:[]}]};
  let time=sample(0);const state=answeringState(question),clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:60000,now:()=>time});
  const controller=createAttemptController({question,state,policy:numericPolicy,clock,sample:()=>time});
  controller.dispatch({kind:'respond',partId:'reason',response:{kind:'explanation',sections:[{id:'answer',text:'because'}]}});
  time=sample(1000);controller.dispatch({kind:'submit',at:time.wallMs});controller.dispatch({kind:'judge-rubric',partId:'reason',judgement:{pointId:'explain',status:'not-met'}});
  time=sample(2000);controller.dispatch({kind:'finish-rubric',at:time.wallMs});const original=controller.state();
  const checked=controller.dispatch({kind:'check-correction'});assert.equal(checked.accepted,false);assert.equal(checked.state,original);
  assert.equal(checked.correctionFeedback,undefined);
});
