import { useEffect, useMemo, useState } from 'react';
import type { AttemptCommand, CorrectionFeedback, StudentAttempt } from '../../contracts/attempt.ts';
import type { Level } from '../../contracts/identity.ts';
import { createAttemptController } from '../../domain/attempt/index.ts';
import { createActiveClock, bindBrowserAttemptTiming } from '../../domain/timing/index.ts';
import { QuestionPlayer } from '../../ui/QuestionPlayer.tsx';
import type { PlayerFeedback } from '../../ui/QuestionPlayer.tsx';
import { restoreRateExample } from '../../activities/alevel/rate-equations/provider.ts';
import { RateGraphTools } from '../../activities/alevel/rate-equations/RateGraphTools.tsx';
import { rateMarking } from '../../activities/alevel/rate-equations/marking.ts';
import { RateResponseControl } from '../../activities/alevel/rate-equations/RateResponseControl.tsx';
import type { RateExample, RateGem } from '../../activities/alevel/rate-equations/types.ts';
import '../../styles/platform.css';
import './preview.css';

const gems: readonly { id: RateGem; title: string; gemId: string }[] = [
  { id: 'orders', title: 'Orders & Rate Calculations', gemId: 'u6-t1-2-orders' },
  { id: 'graphs', title: 'Rate Graphs & Half-life', gemId: 'u6-t1-2-graphs' },
  { id: 'mechanisms', title: 'Rate Equations & Mechanisms', gemId: 'u6-t1-2-mechanisms' },
  { id: 'arrhenius', title: 'Arrhenius & Temperature', gemId: 'u6-t1-2-arrhenius' },
];
function Practice({ example, onNext }: { readonly example: RateExample; readonly onNext: () => void }) {
  const question = example.question;
  const controller = useMemo(() => {
    const attemptId = 'rate-preview-' + crypto.randomUUID();
    const clock = createActiveClock({ attemptId, idleLimitMs: 300000 });
    const state: StudentAttempt = {
      mode: 'student', namespace: { course: 'alevel', profileId: 'rate-poc-memory' },
      attemptId, ref: { ...question.ref, activityId: 'alevel/rate-equations' },
      target: { course: 'alevel', activityId: 'alevel/rate-equations', gemId: gems.find(g => g.id === example.gem)!.gemId, level: question.ref.level },
      phase: 'answering', currentResponses: {}, assistance: [], timing: clock.checkpoint()!,
    };
    return createAttemptController({ question, state, policy: rateMarking, clock });
  }, [question, example.gem]);
  const [attempt, setAttempt] = useState(controller.state());
  const [feedback, setFeedback] = useState<PlayerFeedback>();
  const [correction, setCorrection] = useState<CorrectionFeedback>();
  useEffect(() => bindBrowserAttemptTiming({ controller, onCheckpoint: setAttempt }), [controller]);
  const command = (value: AttemptCommand) => {
    const result = controller.dispatch(value);
    if (!result.accepted) { setFeedback({ message: result.message }); return; }
    setAttempt(result.state);
    setFeedback(undefined);
    setCorrection(result.correctionFeedback);
  };
  return <QuestionPlayer responseControl={RateResponseControl} presentation="standard" question={question} attempt={attempt} onCommand={command} onNext={onNext}
    saveStatus={{ kind: 'idle' }} {...(feedback ? { feedback } : {})} {...(correction ? { correctionFeedback: correction } : {})}
    {...(example.graph ? { workspace: <RateGraphTools graph={example.graph} assessed={attempt.phase === 'assessed'} {...(attempt.workspace ? { state: attempt.workspace } : {})} onStateChange={workspace => command({ kind: 'workspace', workspace })} /> } : {})} />;
}

/** DEV-only, memory-only preview: the real player/controller with no repository/catalogue. */
export function RateEquationsPreview() {
  const [gem, setGem] = useState<RateGem>('orders');
  const [level, setLevel] = useState<Level>(1);
  const [seed, setSeed] = useState(0);
  const [teacher, setTeacher] = useState(false);
  const example = useMemo(() => restoreRateExample({ activityId: 'alevel/rate-equations', questionId: `RATE-POC-${gem}-L${level}`, level, seed: gem === 'mechanisms' ? 0 : seed }), [gem, level, seed]);
  if (!import.meta.env.DEV) return null;
  const reset = () => { setSeed(0); setTeacher(false); };
  return <main className="rate-preview">
    <header className="rate-preview-header">
      <img src="/assets/SJS-Eagle.svg" alt="St John's School" />
      <div><h1>Rate Equations</h1><p>Development preview · OCR A Level Chemistry A, 5.1.1</p></div>
    </header>
    <p className="rate-preview-notice">Twelve starting questions across four gems. Preview attempts stay in memory and reset when you leave or reload.</p>
    <nav className="rate-preview-gems" aria-label="Rate equation gems">
      {gems.map(item => <button type="button" key={item.id} aria-pressed={gem === item.id} onClick={() => { setGem(item.id); reset(); }}><small>{item.gemId}</small>{item.title}</button>)}
    </nav>
    <div className="rate-preview-controls">
      <label>Level <select aria-label="Level" value={level} onChange={event => { setLevel(Number(event.target.value) as Level); reset(); }}>
        <option value="1">Structured</option><option value="2">Unstructured</option><option value="3">Applications</option>
      </select></label>
      <label>Variant seed <input aria-label="Variant seed" type="number" min="0" max="4294967295" value={seed} disabled={gem === 'mechanisms'} onChange={event => { const n = Number(event.target.value); if (Number.isInteger(n) && n >= 0 && n <= 0xffffffff) setSeed(n); }} /></label>
      <button type="button" aria-pressed={teacher} onClick={() => setTeacher(!teacher)}>{teacher ? 'Return to practice' : 'Teacher answer'}</button>
    </div>
    {teacher ? <QuestionPlayer responseControl={RateResponseControl} presentation="standard" key={`teacher-${gem}-${level}-${seed}`} question={example.question}
      attempt={{ mode: 'teacher', ref: example.question.ref, currentResponses: example.correctResponses }}
      onCommand={() => undefined} onNext={() => setTeacher(false)} saveStatus={{ kind: 'idle' }}
      {...(example.graph ? { workspace: <RateGraphTools graph={example.graph} assessed /> } : {})} />
      : <Practice key={`${gem}-${level}-${seed}`} example={example} onNext={() => {
        if (gem === 'mechanisms') setLevel(value => (value % 3 + 1) as Level);
        else setSeed(value => (value + 1) >>> 0);
      }} />}
  </main>;
}
