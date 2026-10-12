import { questionDisplayCode } from '../../../src/content/question-display-identity.ts';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { factsFor } from '../../../src/recall/facts.ts';
import { createRecallProvider, recallRef } from '../../../src/recall/provider.ts';
import { createRecallMarkingPolicy, createRecallLearningReviewPolicy, markRecallFactFields } from '../../../src/recall/marking.ts';
import { createAttemptController } from '../../../src/domain/attempt/attempt.ts';
import { createActiveClock } from '../../../src/domain/timing/active-clock.ts';
import { RecallTestPlayer, RecallModelAnswer } from '../../../src/recall/RecallTestPlayer.tsx';
import { CURRENT_RECALL_DEFINITION_ID } from '../../../src/contracts/recall.ts';
import type { RecallAttempt } from '../../../src/contracts/recall.ts';
import type { AttemptCommand, CorrectionFeedback } from '../../../src/contracts/attempt.ts';
import provenance from '../../../src/recall/typed-provenance.json';
import { emptyReview, updateTrial, reviewPayload } from './review-state.ts';
import type { Review } from './review-state.ts';
import '../../../src/styles/platform.css';
import './review.css';

const bank = factsFor('igcse');
const codeFor = (id: string) => questionDisplayCode({course:'igcse', activityId:'igcse/recall', questionId:id}) ?? 'Unsupported question';
const provider = createRecallProvider(bank, 'igcse');
const policy = createRecallMarkingPolicy(bank);
const learningReviewPolicy = createRecallLearningReviewPolicy(bank);
const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(bank)))), b => b.toString(16).padStart(2, '0')).join('');
const storageKey = 'igcse-recall-review-v2:' + fingerprint;
// Review-only synthetic zero time: no browser binding, repository, evidence or scheduling.
const syntheticSample = () => ({ monotonicMs: 0, wallMs: Date.now(), visible: true, focused: true, suspended: false });
function load(): Record<string, Review> {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return Object.fromEntries(bank.flatMap(f => {
      const r = data[f.id];
      return r && ['unreviewed','reviewed','issue'].includes(r.status) && typeof r.note === 'string' && Array.isArray(r.trials) ? [[f.id, r]] : [];
    }));
  } catch { return {}; }
}
function TrialPlayer({ id, saved, onSave, onNext, canNext }: { id: string; saved: RecallAttempt | null; onSave: (state: RecallAttempt, command: AttemptCommand, correction?: CorrectionFeedback) => void; onNext: () => void; canNext: boolean }) {
  const fact = bank.find(f => f.id === id)!;
  const question = provider.restore(recallRef('igcse', id));
  const [controller] = useState(() => {
    const attemptId = crypto.randomUUID();
    const fresh: RecallAttempt = { mode: 'student', definitionId: CURRENT_RECALL_DEFINITION_ID, namespace: { course: 'igcse', profileId: 'review-only' }, attemptId, ref: recallRef('igcse', id),
      target: { kind: 'recall', course: 'igcse', activityId: 'igcse/recall', factId: id, level: 1 }, currentResponses: {}, assistance: [], phase: 'answering',
      timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false } };
    const create = (state: RecallAttempt) => createAttemptController<RecallAttempt>({ state, question, policy, learningReviewPolicy,
      clock: createActiveClock({ attemptId: state.attemptId, idleLimitMs: 60000, now: syntheticSample,
        ...(state.phase === 'answering' ? { saved: state.timing } : { completed: true }) }), sample: syntheticSample });
    try { return create(saved ?? fresh); } catch { return create(fresh); }
  });
  const [attempt, setAttempt] = useState(controller.state());
  const [correction, setCorrection] = useState<CorrectionFeedback>();
  const [feedback, setFeedback] = useState<{ message: string }>();
  const [teacher, setTeacher] = useState(false);
  const command = (command: AttemptCommand) => {
    const result = controller.dispatch(command);
    setAttempt(controller.state());
    setFeedback(result.accepted ? undefined : { message: result.message });
    setCorrection(result.accepted ? result.correctionFeedback : undefined);
    if (result.accepted) onSave(structuredClone(controller.checkpoint()), command, result.correctionFeedback);
  };
  return <>
    <label className="review-preview"><input type="checkbox" checked={teacher} onChange={e => setTeacher(e.target.checked)} />Read-only teacher preview</label>
    <RecallTestPlayer fact={fact} question={question} attempt={teacher ? { mode: 'teacher', ref: question.ref, currentResponses: {} } : attempt}
      onCommand={command} onNext={onNext} canNext={canNext} saveStatus={{ kind: 'idle' }}
      {...(feedback ? { feedback } : {})} {...(correction ? { correctionFeedback: correction } : {})} />
    <details className="review-model"><summary>Inspect model and accepted-answer metadata</summary><RecallModelAnswer fact={fact} />
      <pre>{JSON.stringify({ accepted: fact.accepted, matching: fact.matching, fieldOrder: fact.fieldOrder, fields: fact.fields, answerGroups: fact.answerGroups, exceptionCollection: fact.exceptionCollection, answerPairs: fact.answerPairs }, null, 2)}</pre>
    </details>
  </>;
}
function App() {
  const [reviews, setReviews] = useState(load);
  const requestedCode = new URLSearchParams(location.search).get('id');
  const requestedFact = bank.find(f => codeFor(f.id) === requestedCode);
  const [id, setId] = useState(() => requestedFact?.id ?? bank[0]!.id);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(requestedCode && !requestedFact ? 'Question code not recognized. Use a standard question code.' : '');
  const [storageMessage, setStorageMessage] = useState('');
  const [reset, setReset] = useState(0);
  const index = bank.findIndex(f => f.id === id);
  const fact = bank[index]!;
  const review = reviews[id] ?? emptyReview();
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(reviews)); setStorageMessage('Review notes and trials saved on this browser.'); }
    catch { setStorageMessage('Browser storage unavailable. Export your review before closing.'); }
  }, [reviews]);
  const patch = (patch: Partial<Review>) => setReviews(previous => ({ ...previous, [id]: { ...(previous[id] ?? emptyReview()), ...patch } }));
  const navigate = (next: string) => {
    setId(next); setMessage(''); const url = new URL(location.href); url.searchParams.set('id', codeFor(next)); history.replaceState(null, '', url);
  };
  function saveTrial(state: RecallAttempt, command: AttemptCommand, correction?: CorrectionFeedback) {
    setReviews(previous => ({ ...previous, [id]: updateTrial(previous[id] ?? emptyReview(), state, command,
      state.phase === 'assessed' && state.firstAssessment.kind === 'marked' ? markRecallFactFields(fact, state.firstResponse.responses) : null, correction) }));
  }
  function exportReview() {
    const payload = reviewPayload(bank, reviews, fingerprint, provenance);
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'igcse-recall-review-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const filtered = bank.filter(f => (codeFor(f.id) + ' ' + f.prompt).toLowerCase().includes(search.toLowerCase()));
  return <main className="recall-review">
    <header className="site-header"><div><p className="eyebrow">Masters of Chemistry · IGCSE</p><h1>Factual recall review</h1><p className="review-subtitle">Try production controls and marking. Record issues by the visible question ID.</p></div><button onClick={exportReview}>Export review JSON</button></header>
    <p className="review-notice">Development review only. Trials use synthetic zero timing and save no pupil evidence, recall stage or mastery progress.</p>
    <section className="review-toolbar" aria-label="Question navigation">
      <label>Find a question<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search question or ID" type="search" /></label>
      <label>Question<select aria-label="Question" value={id} onChange={e => navigate(e.target.value)}>
        {!filtered.some(f => f.id === id) && <option value={id}>{codeFor(id)} — current question</option>}
        {filtered.map(f => <option key={f.id} value={f.id}>{codeFor(f.id)} — {f.prompt}</option>)}
      </select></label>
      <p>{filtered.length} matching · {Object.values(reviews).filter(r => r.status === 'reviewed').length} reviewed · {Object.values(reviews).filter(r => r.status === 'issue').length} flagged</p>
      <div className="review-navigation"><button disabled={index === 0} onClick={() => navigate(bank[index - 1]!.id)}>Previous</button><strong>Question {index + 1} of {bank.length}</strong><button disabled={index === bank.length - 1} onClick={() => navigate(bank[index + 1]!.id)}>Next question</button></div>
    </section>
    <section className="review-identity" aria-label="Issue reference"><code data-testid="question-id">{codeFor(id)}</code><button onClick={() => { void navigator.clipboard.writeText(codeFor(id)).then(() => setMessage('ID copied.'), () => setMessage('Copy the displayed ID manually.')); }}>Copy ID</button><button onClick={() => { patch({ activeAttempt: null }); setReset(n => n + 1); }}>Reset answer</button></section>
    <TrialPlayer key={id + ':' + reset} id={id} saved={review.activeAttempt} onSave={saveTrial} onNext={() => { if (index < bank.length - 1) navigate(bank[index + 1]!.id); }} canNext={index < bank.length - 1} />
    <p role="status">{message}</p>
    <section className="review-notes"><h2>Record an issue</h2><p>Feedback checks fields independently. Learning review and corrected edits remain separate from the first automatic result.</p>
      <label>Review status<select aria-label="Review status" value={review.status} onChange={e => patch({ status: e.target.value as Review['status'] })}><option value="unreviewed">Not reviewed</option><option value="reviewed">Reviewed</option><option value="issue">Issue</option></select></label>
      <label>Notes for {codeFor(id)}<textarea rows={4} value={review.note} onChange={e => patch({ note: e.target.value })} placeholder="Describe the wording, layout or marking issue…" /></label>
      <p role="status">{storageMessage} {review.trials.length} assessed trials recorded for this question. Reset starts a fresh trial and retains previous trials.</p>
    </section>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App />);
