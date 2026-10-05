import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QuestionPlayer } from '../../../src/ui/QuestionPlayer.tsx';
import { createAttemptController } from '../../../src/domain/attempt/attempt.ts';
import { createActiveClock } from '../../../src/domain/timing/active-clock.ts';
import { restoreCheckedFeedback } from '../../../src/ui/current-feedback.ts';
import type { Question, QuestionPart, MarkingPolicy, StudentAttempt, CorrectionFeedback, MarkPointResult } from '../../../src/contracts/index.ts';
import '../../../src/styles/platform.css';
const kind = new URL(location.href).searchParams.get('kind') ?? 'text';
const base = { id: 'answer', marks: 1, required: true, dependsOn: [], prompt: [{ kind: 'text' as const, text: 'Validation fixture response' }] };
const options = [{ id: 'yes', content: [{ kind: 'text' as const, text: 'Yes' }] }, { id: 'no', content: [{ kind: 'text' as const, text: 'No' }] }];
const parts: Record<string, QuestionPart> = {
 text: { ...base, kind: 'text', accepted: ['ions'], normalization: 'exact' },
 numeric: { ...base, kind: 'numeric', unit: 'mol', acceptance: { kind: 'absolute', expected: 2, tolerance: .01 } },
 choice: { ...base, kind: 'choice', presentation: 'single', options, acceptedOptionSets: [['yes']] },
 dropdown: { ...base, kind: 'choice', presentation: 'dropdown', options, acceptedOptionSets: [['yes']] },
 multiple: { ...base, kind: 'choice', presentation: 'multiple', options, acceptedOptionSets: [['yes']] },
 correction: { ...base, marks: 2, kind: 'correction', sourceText: 'ions molecules', markingPolicyId: 'fixture', segmentSelection: 'single', segments: [{ id: 'ions', start: 0, end: 4, text: 'ions' }, { id: 'molecules', start: 5, end: 14, text: 'molecules' }] },
 diagram: { ...base, kind: 'diagram-selection', diagram: [{ kind: 'text', text: 'Label A' }], objectIds: ['A', 'B'], acceptedObjectSets: [['A']] },
 explanation: { ...base, kind: 'explanation', sections: [{ id: 'section', label: 'Explanation', minLength: 2 }], rubric: [{ id: 'ions', text: 'Mentions ions', marks: 1 }], assessment: 'self-rubric' },
};
const part = parts[kind] ?? parts.numeric!;
const question: Question = { ref: { activityId: 'alevel/feedback-fixture', questionId: 'fixture', seed: 0, level: 1 }, title: 'Generic fixture', context: [], layout: 'compact', submission: 'all-required-parts', parts: kind === 'mixed' ? [part, { ...parts.explanation!, id: 'reason' }] : [part], scaffolds: [], hints: [], workedAnswer: [{ kind: 'text', text: 'Fixture model response' }], sources: [] };
const policy: MarkingPolicy = { id: 'fixture', masteryScore: marks => marks.earned === marks.available ? 1 : 0,
 mark(q, responses) {
  const points: MarkPointResult[] = [];
  for (const p of q.parts) {
   const r=responses[p.id];
   if (p.kind === 'explanation') continue;
   const correct = r?.kind === 'text' ? r.value === 'ions' : r?.kind === 'numeric' ? Number(r.raw) === 2 : r?.kind === 'choice' ? r.selected.length===1&&r.selected[0]==='yes' : r?.kind==='diagram-selection' ? r.selectedObjectIds.length===1&&r.selectedObjectIds[0]==='A' : false;
   if(r?.kind==='correction') { const selection=r.selections[0]?.text==='molecules';points.push({ partId:p.id,pointId:'selection',earned:selection?1:0,available:1,message:'Verbose selection bookkeeping fixture' },{partId:p.id,pointId:'replacement',earned:selection&&r.replacement==='ions'?1:0,available:1,message:'Verbose model answer fixture'}); }
   else points.push({partId:p.id,pointId:'answer',earned:correct?1:0,available:1,message:'Verbose fixture answer and repeated score',...(p.kind==='text'?{learningReview:{eligible:true,modelAnswer:'ions',rubric:[{kind:'text',text:'Meaning must match ions.'}]}}:{})});
  }
  return {accepted:true,marks:{points,earned:points.reduce((n,p)=>n+p.earned,0),available:points.reduce((n,p)=>n+p.available,0)}};
 }};
const clock=createActiveClock({attemptId:'fixture',idleLimitMs:180000});
const initial: StudentAttempt={mode:'student',namespace:{course:'alevel',profileId:'fixture'},attemptId:'fixture',ref:question.ref,target:{course:'alevel',activityId:question.ref.activityId,gemId:'fixture',level:1},currentResponses:{},assistance:[],phase:'answering',timing:clock.checkpoint()!};
const controller=createAttemptController({question,state:initial,policy,clock});
function App(){const [attempt,setAttempt]=useState(controller.state());const [correction,setCorrection]=useState<CorrectionFeedback>();const [message,setMessage]=useState<string>();return <QuestionPlayer question={question} attempt={attempt} saveStatus={{kind:'saved'}} learningReviewEnabled={kind==='text'} correctionFeedback={correction} restoredFeedback={restoreCheckedFeedback(question,attempt,policy)} feedback={message?{message}:undefined} onNext={()=>{}} onCommand={command=>{const result=controller.dispatch(command);if(result.accepted){setMessage(undefined);setAttempt(controller.state());setCorrection(result.correctionFeedback);}else setMessage(result.message);}}/>;}
createRoot(document.getElementById('root')!).render(<App/>);
