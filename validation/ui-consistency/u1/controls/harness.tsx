import { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QuestionPlayer } from '../../../../src/ui/QuestionPlayer.tsx';
import { createAttemptController } from '../../../../src/domain/attempt/attempt.ts';
import { createActiveClock } from '../../../../src/domain/timing/active-clock.ts';
import { productionRegistry } from '../../../../src/foundation/registry.ts';
import '../../../../src/styles/platform.css';

const sample = () => ({monotonicMs:performance.now(),wallMs:Date.now(),visible:true,focused:true,suspended:false});
const generic = {
  ref:{activityId:'igcse/dot-and-cross',questionId:'U1-keyboard-fixture',seed:1,level:1},title:'Shared control test fixture',layout:'compact',submission:'all-required-parts',context:[],scaffolds:[],hints:[],sources:[],
  parts:[{id:'number',kind:'numeric',required:true,marks:1,prompt:[{kind:'text',text:'Type 2'}],unit:'',dependsOn:[],acceptance:{kind:'absolute',expected:2,tolerance:0.01}},
  {id:'text',kind:'text',presentation:'multiline',required:true,marks:1,prompt:[{kind:'text',text:'Type correct'}],dependsOn:[],acceptance:{kind:'normalized-text',accepted:['correct']}}],workedAnswer:[{kind:'text',text:'2; correct'}],
};
const policy = {id:'ui-controls-fixture',masteryScore:m=>m.earned===m.available?1:0,mark:(_q,r)=>{
  const points=[{partId:'number',pointId:'number',available:1,earned:r.number?.raw==='2'?1:0,message:'Numeric fixture'},
  {partId:'text',pointId:'text',available:1,earned:r.text?.value==='correct'?1:0,message:'Text fixture'}];
  return {accepted:true,marks:{available:2,earned:points.reduce((n,p)=>n+p.earned,0),points}};
}};
let serial=0;
function makeState(question, mode='student') {
  if(mode!=='student')return {mode,ref:question.ref,currentResponses:{}};
  const course=question.ref.activityId.split('/')[0],attemptId=`U1-${++serial}`;
  return {mode,attemptId,ref:question.ref,namespace:{course,profileId:'ui-controls-harness'},
    target:{course,activityId:question.ref.activityId,gemId:'u1-fixture',level:question.ref.level},
    phase:'answering',currentResponses:{},assistance:[],timing:{attemptId,activeMs:0,idleLimitMs:180000,finished:false}};
}
function Harness(){
  const [packet,setPacket]=useState({question:generic,policy,mode:'student',editor:undefined});
  const [state,setState]=useState(makeState(generic));
  const [correction,setCorrection]=useState(undefined);
  const [feedback,setFeedback]=useState(undefined);
  const [canNext,setCanNext]=useState(true);
  const [nextCount,setNextCount]=useState(0);
  window.u1={state,commands:window.u1?.commands??[],nextCount,question:packet.question};
  window.loadFixture=async (activity,level=1,mode='student',fixedId)=>{
    let question=generic,marking=policy,editor;
    if(activity){
      const reg=productionRegistry.get(activity),provider=await reg.provider();
      const ref=fixedId?{activityId:activity,questionId:fixedId,level,seed:0}:provider.select({activityId:activity,gemId:reg.gems.find(g=>g.supportedLevels.includes(level)).id,level,seed:11,previousQuestionIds:[]});
      question=provider.restore(ref);marking=await reg.marking();
      const kind=question.parts[0]?.kind;
      if(kind==='electron-configuration')editor=(await import('../../../../src/editors/electron-configuration/index.tsx')).ElectronConfigurationEditor;
      if(kind==='dot-and-cross')editor=(await import('../../../../src/editors/dot-and-cross/DotCrossEditor.tsx')).DotCrossEditor;
      if(kind==='energy-profile')editor=(await import('../../../../src/editors/energy-profile/index.tsx')).EnergyProfileEditor;
      if(kind==='titration-curve')editor=(await import('../../../../src/editors/titration-curve/TitrationCurveEditor.tsx')).TitrationCurveEditor;
    }
    setPacket({question,policy:marking,mode,editor});setState(makeState(question,mode));
    setCorrection(undefined);setFeedback(undefined);setCanNext(true);
    window.u1.commands=[];
  };
  window.setCanNext=setCanNext;
  const command = cmd => {
    window.u1.commands.push(cmd.kind);
    if(state.mode!=='student')return;
    const clock=createActiveClock({attemptId:state.attemptId,idleLimitMs:180000,now:sample,
      ...(state.phase==='answering'?{saved:state.timing}:{completed:true,saved:{...state.firstResponse.timing,attemptId:state.attemptId,finished:true}})});
    const ctl=createAttemptController({question:packet.question,state,policy:packet.policy,clock,sample});
    const result=ctl.dispatch(cmd);
    if(result.accepted){setState(result.state);setFeedback(undefined);
      if(cmd.kind==='clear'||cmd.kind==='respond')setCorrection(undefined);
      else if(result.correctionFeedback)setCorrection(result.correctionFeedback);
    }else setFeedback({message:result.message});
  };
  const Editor=packet.editor;
  return <main style={{maxWidth:1000,margin:'20px auto',padding:12}}>
    <label>Unrelated select <select aria-label="Unrelated select"><option>one</option><option>two</option></select></label>
    <Suspense fallback={<p role="status">Loading question</p>}>
      <QuestionPlayer question={packet.question} attempt={state} onCommand={command} onNext={()=>setNextCount(n=>n+1)} saveStatus={{kind:'idle'}} canNext={canNext}
        correctionFeedback={correction} feedback={feedback} renderEditor={Editor?p=><Editor {...p}/>:undefined}/>
    </Suspense>
  </main>;
}
createRoot(document.getElementById('root')).render(<Harness/>);
