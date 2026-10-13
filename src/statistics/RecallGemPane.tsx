import { useState, type CSSProperties } from 'react';
import type { Namespace } from '../contracts/identity.ts';
import type { RecallEvidence, RecallProgress } from '../contracts/recall.ts';
import { recallFacts } from '../recall/facts.ts';
import { factsForRecallScope, topicsFor } from '../recall/session-contract.ts';
import { questionDisplayCode } from '../content/question-display-identity.ts';
import { GemPaths } from '../landing/GemPaths.tsx';
import { weightedScore } from '../domain/mastery/course-mastery.ts';

const masteryHalfLife = 3;
const decay = 2 ** (-1 / masteryHalfLife);
const masteryThresholds = [1 - decay, 1 - decay ** 2, 1 - decay ** 3];

export function recallFactMastery(history: readonly RecallEvidence[], factId: string) {
  const records = history.filter(record => record.factId === factId);
  const score = weightedScore(records.map(record => record.outcome === 'correct' ? 1 : 0), masteryHalfLife);
  const grade = masteryThresholds.filter(threshold => score !== null && score + 1e-12 >= threshold).length;
  return { records, score, grade };
}

export function RecallGemPane({ namespace, progress, history, year, now }: {
  readonly namespace: Namespace;
  readonly progress: readonly RecallProgress[];
  readonly history: readonly RecallEvidence[];
  readonly year: string;
  readonly now: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const facts = factsForRecallScope(recallFacts, namespace.course, {
    kind: 'global',
    topicIds: topicsFor(namespace.course)
      .filter(topic => year === 'all' || topic.year === year)
      .map(topic => topic.id),
  });
  const byId = new Map(progress.filter(p =>
    p.namespace.course === namespace.course && p.namespace.profileId === namespace.profileId,
  ).map(p => [p.factId, p]));
  const gems = facts.map(fact => {
    const p = byId.get(fact.id);
    const { records, score, grade } = recallFactMastery(history, fact.id);
    const started = score !== null;
    // Inclusive thresholds reproduce one, two and three correct first checks from zero.
    const freshness = p && p.stage > 0 && p.dueAt > p.lastCompletedAt
      ? Math.max(0, Math.min(1, (p.dueAt - now) / (p.dueAt - p.lastCompletedAt))) : 0;
    const colour = !started ? '#68708a' : grade === 0 ? '#ee8585'
      : grade === 1 ? '#ffde59' : grade === 2 ? '#54f5b5' : '#a884ff';
    const code = questionDisplayCode({ course: namespace.course,
      activityId: namespace.course + '/recall', questionId: fact.id }) ?? fact.id;
    const status = score !== null ? `Recall mastery ${Math.round(score * 100)}% · ${['Building', 'Yellow', 'Green', 'Purple'][grade]}` : 'Not started';
    const shine = freshness > 0.66 ? 'Bright freshness' : freshness > 0 ? 'Fading freshness' : 'No freshness gleam';
    const mastery = Math.round((score ?? 0) * 100);
    const lastReviewedAt = Math.max(p?.lastCompletedAt ?? 0, ...records.map(record => record.completedAt));
    const lastReviewed = lastReviewedAt
      ? new Date(lastReviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      : 'Not yet reviewed';
    return { fact, freshness, colour, code, status, shine, mastery, lastReviewed, timesAnswered: records.length };
  });
  const selected = gems.find(gem => gem.fact.id === selectedId);
  return (
    <section className="stats-chart-card stats-recall-gems" aria-label="Factual Recall">
      <div className="stats-section-heading">
        <h2 className="eyebrow">FACTUAL RECALL</h2>
        <p>{gems.length} facts</p>
      </div>
      <div className="stats-fact-grid">
        {gems.map(gem => (
          <button key={gem.fact.id} type="button" className="stats-fact-gem"
            aria-pressed={selectedId === gem.fact.id}
            aria-label={`${gem.code}: ${gem.fact.prompt} ${gem.status}. ${gem.shine}.`}
            title={`${gem.code} · ${gem.status} · ${gem.fact.prompt}`}
            style={{ '--fact-colour': gem.colour, '--fact-freshness': gem.freshness } as CSSProperties}
            onClick={() => setSelectedId(gem.fact.id)}
            onPointerEnter={() => setSelectedId(gem.fact.id)}
            onFocus={() => setSelectedId(gem.fact.id)}>
            <svg viewBox="-14 -16 28 34" aria-hidden="true">
              <GemPaths igcse />
            </svg>
          </button>
        ))}
      </div>
      {!gems.length && <p className="stats-empty">No factual recall facts for this course year.</p>}
      <div className="stats-chart-detail stats-fact-detail" role="status">
        {selected ? <>
          <p>{selected.fact.prompt}</p>
          <div className="stats-fact-detail-row">
            <span className="stats-fact-mastery" role="meter" aria-label="Mastery"
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={selected.mastery}
              aria-valuetext={`${selected.mastery}%`}>
              <span style={{ width: `${selected.mastery}%`, background: selected.colour }} />
            </span>
            <span>Last reviewed: {selected.lastReviewed}</span>
            <span>Number of times answered: {selected.timesAnswered}</span>
          </div>
        </>
          : 'Select a gem for its question and mastery.'}
      </div>
    </section>
  );
}
