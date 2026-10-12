import { createChemistryRepository } from '../../../src/persistence/repository.ts';
import { formulaeProvider } from '../../../src/activities/igcse/formulae/provider.ts';
import { equationsProvider } from '../../../src/activities/igcse/equations/provider.ts';
import { equationsMarking } from '../../../src/activities/igcse/equations/marking.ts';
import { transitionAttempt, assessmentToEvidence } from '../../../src/domain/attempt/attempt.ts';
import type { StudentAttempt } from '../../../src/contracts/attempt.ts';
import type { PracticeSession } from '../../../src/contracts/session.ts';
const namespace = {course:'igcse' as const,profileId:'ux-identity-test'};
const database = 'masters-of-chemistry-alpha-v2-ux-identity-fixture';
const repo=createChemistryRepository(database);
const eqref=equationsProvider.resolveLink('EQ-paragraph-01')!;
const formulaRef=formulaeProvider.resolveLink('RF1:magnesium-hydroxide:123')!;
const target={course:'igcse' as const,activityId:'igcse/formulae' as const,gemId:'fourth-16-1',level:2 as const};
const response={formula:{kind:'text' as const,value:'Mg(OH)₂'}};
const formula:StudentAttempt={mode:'student',namespace,attemptId:'old-rf1-practice-attempt',ref:formulaRef,target,
  currentResponses:response,assistance:[],phase:'answering',timing:{attemptId:'old-rf1-practice-attempt',activeMs:4321,idleLimitMs:180000,finished:false}};
const session:PracticeSession={kind:'practice',namespace,id:'old-rf1-practice-session',target,selection:'fixed-level',
  currentAttemptId:formula.attemptId,previousQuestionIds:['RF1:sodium-hydroxide:456','FO-00000J'],paused:true};
const historicalResponse={equation:{kind:'text' as const,value:'Pb(NO3)2(aq) + KI(aq) -> PbI2(s) + KNO3(aq)'}};
const historicalMarks={earned:1,available:3,points:[
  {partId:'equation',pointId:'formulae',earned:1,available:1,message:'Substance formulae and reactant/product sides are correct.'},
  {partId:'equation',pointId:'coefficients',earned:0,available:1,message:'Lowest whole-number balancing coefficients need correction.'},
  {partId:'equation',pointId:'states',earned:0,available:1,message:'State symbols from the paragraph need correction.'},
]};
const assessed:StudentAttempt={mode:'student',namespace,attemptId:'old-eq-assessed-attempt',ref:eqref,
  target:{course:'igcse',activityId:'igcse/equations',gemId:'fourth-16-2',level:3},
  currentResponses:historicalResponse,assistance:[],phase:'assessed',
  firstResponse:{responses:historicalResponse,submittedAt:10000,timing:{activeMs:8765,idleLimitMs:180000},assistance:[]},
  firstAssessment:{kind:'marked',assessedAt:10000,marks:historicalMarks,score:0.5,selfAssessed:false}};
const expectedEvidence=assessmentToEvidence(assessed)!;
function check(value:unknown,message:string):asserts value {if(!value)throw Error(message);}
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
(async()=>{
  const isReload=new URL(location.href).searchParams.has('reload');
  if(!isReload){
    const a=await repo.saveCurriculum({attempt:formula,session});check(a.ok,'Old RF1 attempt/session save failed: '+JSON.stringify(a));
    const e=await repo.saveCurriculum({attempt:assessed,evidence:expectedEvidence});check(e.ok,'Old EQ first evidence save failed: '+JSON.stringify(e));
  }
  const restored=await repo.loadAttempt(namespace,formula.attemptId);check(restored.ok&&restored.value,'RF1 restore failed');
  check(same(restored.value,formula),'RF1 attempt changed');
  check(same(formulaeProvider.restore(restored.value.ref).ref,formulaRef),'Provider rewrote saved RF1 ref');
  const savedSession=await repo.loadSession(namespace,session.id);check(savedSession.ok&&same(savedSession.value,session),'Old mixed-ID session changed');
  const oldEq=await repo.loadAttempt(namespace,assessed.attemptId);check(oldEq.ok&&oldEq.value,'EQ restore failed');
  check(same(oldEq.value,assessed),'Old first assessment changed');
  const q=equationsProvider.restore(oldEq.value.ref);
  const correction=transitionAttempt({question:q,state:oldEq.value,policy:equationsMarking,command:{kind:'check-correction'},
    sample:{monotonicMs:20000,wallMs:20000,visible:true,focused:true,suspended:false}});
  check(correction.accepted,'Current correction rejected');
  check(correction.correctionFeedback?.kind==='correction-learning'&&'marks' in correction.correctionFeedback&&correction.correctionFeedback.marks.earned===2,'Current state credit missing');
  check(same(correction.state.firstAssessment,assessed.firstAssessment),'Correction rewrote historical marks');
  const save=await repo.saveCurriculum({attempt:correction.state,evidence:assessmentToEvidence(correction.state)!});
  check(save.ok&&save.value.evidence==='already-present','Correction duplicated first evidence');
  const history=await repo.curriculumHistory(namespace);check(history.ok&&history.value.length===1&&same(history.value[0],expectedEvidence),'Immutable evidence changed');
  (window as any).__identityReport={status:'PASS',isReload,formulaRef:restored.value.ref,formulaAttemptId:restored.value.attemptId,
    formulaAnswer:restored.value.currentResponses,savedSession:savedSession.value,oldEqRef:oldEq.value.ref,
    historicalEarned:assessed.firstAssessment.marks.earned,currentCorrectionEarned:2,evidenceCount:history.value.length,
    historicalFirstEvidencePreserved:true};
  document.querySelector('#status')!.textContent='PASS: old saved references, attempts and first evidence preserved.';
  repo.close();
})().catch(error=>{(window as any).__identityReport={status:'FAIL',message:String(error),stack:error.stack};document.querySelector('#status')!.textContent=String(error);repo.close();});
