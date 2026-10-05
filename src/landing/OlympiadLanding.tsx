import { useId, type CSSProperties } from 'react';
import type { OlympiadActivityId } from '../contracts/index.ts';
import { olympiadTopics } from '../catalogue/olympiad-topics.ts';
import type { ChallengeCompletion } from './olympiad-completion.ts';
import { GemPaths } from './GemPaths.tsx';
import eagle from '../../public/assets/landing/SJS-Eagle.svg?url';

export function OlympiadLanding({ challenges, completion, loading, message, onLaunch, onBack }: {
  readonly challenges: readonly { id: string; title: string }[];
  readonly completion: Partial<Record<OlympiadActivityId, ChallengeCompletion>>;
  readonly loading: boolean;
  readonly message?: string;
  readonly onLaunch: (id: OlympiadActivityId) => void;
  readonly onBack: () => void;
}) {
  const prefix = useId();
  return <div className="olympiad-landing">
    <a className="skip-link" href="#olympiad-challenges">Skip to Olympiad challenges</a>
    <main className="olympiad-landing-shell">
      <header className="olympiad-landing-header">
        <span className="olympiad-eagle"><img src={eagle} alt="St John's School eagle" /></span>
        <div><p className="eyebrow">SJS - OCR CHEMISTRY A - H432</p><h1>Masters of <span>A Level Chemistry</span></h1></div>
        <button type="button" className="question-back" aria-label="Back to A Level landing" title="Back to A Level landing" onClick={onBack}><span aria-hidden="true">←</span></button>
      </header>
      <section id="olympiad-challenges" aria-labelledby="olympiad-heading" aria-busy={loading}>
        <h2 id="olympiad-heading">Olympiad challenges</h2>
        <p className="olympiad-map-introduction">Explore chemistry beyond the course. Your drawings and challenge completion save on this device.</p>
        {message && <p role="status">{message}</p>}
        <div className="olympiad-gem-grid">{challenges.map((challenge, index) => {
          const status = completion[challenge.id as OlympiadActivityId];
          const state = status?.state ?? 'unstarted', label = loading ? 'Loading saved completion' : state === 'complete' ? 'Challenge complete' : state === 'partial' ? 'Partially complete' : 'No validated completion';
          const clip = `${prefix}-gem-${index}`;
          const topics = olympiadTopics[challenge.id as OlympiadActivityId];
          const topicsId = `${prefix}-topics-${index}`;
          const fraction = state === 'complete' ? 1 : state === 'partial' ? Math.max(.15, Math.min(.85, (status?.correct ?? 0) / (status?.total || 1))) : 0;
          return <button key={challenge.id} type="button" className="olympiad-gem-card" data-challenge-id={challenge.id} data-completion={state}
            style={{'--gem-colour': index % 2 ? '#c59aff' : '#54f5b5'} as CSSProperties} onClick={() => onLaunch(challenge.id as OlympiadActivityId)} aria-label={`${challenge.title}: ${label}`} aria-describedby={topicsId}>
            <svg className="olympiad-completion-gem" viewBox="-14 -16 28 34" aria-hidden="true">
              <defs><clipPath id={clip}><rect x="-14" y={16 - 32 * fraction} width="28" height={32 * fraction} /></clipPath></defs>
              <g className="olympiad-gem-dim"><GemPaths /></g>
              <g className="olympiad-gem-lit" clipPath={`url(#${clip})`}><GemPaths /></g>
            </svg>
            <strong>{challenge.title}</strong>
            <span className="olympiad-topic-tags" id={topicsId}>
              {topics.map(topic => <span className="olympiad-topic-pill" key={topic}>{topic}</span>)}
            </span>
            <span className="olympiad-completion-label">{label}</span>
            <span className="olympiad-launch-label">Open challenge <span aria-hidden="true">→</span></span>
          </button>;
        })}</div>
      </section>
      <p className="olympiad-closing-line">Legends aren't born, they're forged</p>
    </main>
  </div>;
}
