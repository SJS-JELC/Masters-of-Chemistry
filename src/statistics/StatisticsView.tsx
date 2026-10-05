import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { CourseDataViewProps } from '../contracts/integration.ts';
import type { Course, Level } from '../contracts/identity.ts';
import type { CurriculumEvidence } from '../contracts/session.ts';
import { createChemistryRepository } from '../persistence/repository.ts';
import { displayGems } from '../landing/catalogue.ts';
import { validTiming } from '../domain/timing/active-clock.ts';
import {
  buildStatistics,
  countEvidence,
  levelOf,
  outcomeOf,
  type Counts,
  type StatisticsDisplayGem,
  type StatisticsOptions,
} from './model.ts';
import './statistics.css';

const outcomes = ['correct', 'partial', 'incorrect'] as const;
const labels = { correct: 'Correct', partial: 'Partly correct', incorrect: 'Incorrect' };
const symbols = { correct: '✓', partial: '◐', incorrect: '×' };
const attemptWord = (count: number) => (count === 1 ? 'attempt' : 'attempts');
const date = (value: number) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const style = (values: Record<string, string | number>) => values as CSSProperties;
export function duration(ms: number | null): string {
  if (ms === null) return 'Time not recorded';
  const seconds = Math.floor(ms / 1000),
    minutes = Math.floor(seconds / 60);
  if (seconds < 1) return '<1 s';
  if (minutes >= 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  return minutes ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}
const time = (ms: number) => (ms === 0 ? '0 s' : duration(ms));
const levelLabel = (course: Course, level: Level) =>
  course === 'alevel' ? `Level ${level}` : { 1: 'Grade 5–6', 2: 'Grade 7–8', 3: 'Grade 9' }[level];
function OutcomeSummary({ counts }: { readonly counts: Counts }) {
  return (
    <div className="stats-topic-results">
      <div className="stats-stack" aria-hidden="true">
        {outcomes.map((outcome) => (
          <span
            key={outcome}
            className={outcome}
            style={{ width: `${counts.total ? (counts[outcome] / counts.total) * 100 : 0}%` }}
          />
        ))}
      </div>
      <p className="stats-outcome-text">
        {counts.total
          ? `${counts.correct} correct · ${counts.partial} partly correct · ${counts.incorrect} incorrect`
          : 'No recorded responses in this period'}
      </p>
    </div>
  );
}
function Legend() {
  return (
    <div className="stats-legend" aria-label="Answer outcomes">
      {outcomes.map((outcome) => (
        <span className={outcome} key={outcome}>
          {symbols[outcome]} {labels[outcome]}
        </span>
      ))}
    </div>
  );
}
function Metric({
  title,
  value,
  note,
  testId,
  activeMs,
}: {
  readonly title: string;
  readonly value: string | number;
  readonly note: string;
  readonly testId?: string;
  readonly activeMs?: number;
}) {
  return (
    <article className="stats-metric">
      <h2>{title}</h2>
      <p className="stats-number" data-testid={testId} data-active-ms={activeMs}>
        {value}
      </p>
      <p>{note}</p>
    </article>
  );
}
function GemRow({
  gem,
  course,
  limited,
}: {
  readonly gem: StatisticsDisplayGem;
  readonly course: Course;
  readonly limited: boolean;
}) {
  const [selected, setSelected] = useState<CurriculumEvidence | null>(null);
  const row = gem.row,
    recent = row?.records.slice(-20) ?? [];
  const description = (record: CurriculumEvidence) => {
    const code =
      record.ref?.questionId ??
      (record.provenance === 'legacy-import' ? record.sourceQuestionId : undefined) ??
      'Not recorded';
    const label =
      row?.gem.mastery.supportedLevels.find((item) => item.level === levelOf(record))?.label ??
      levelLabel(course, levelOf(record));
    return `Question ${code} · ${label} · ${new Date(record.completedAt).toLocaleString('en-GB')} · ${labels[outcomeOf(record)]} · ${record.timing && validTiming(record.timing) ? duration(record.timing.activeMs) : 'Time not recorded'}`;
  };
  return (
    <section className="stats-gem" data-gem={gem.id}>
      <h3>{gem.name}</h3>
      {!row ? (
        <p className="stats-outcome-text">Not available · no tracked assessment</p>
      ) : (
        <>
          <p className="stats-outcome-text">
            {row.counts.total} recorded {attemptWord(row.counts.total)}
            {row.records.length
              ? ` · Last in period: ${date(row.records.at(-1)!.completedAt)}`
              : ''}
          </p>
          <p className="stats-outcome-text">
            {row.counts.timed
              ? `Active practice time: ${duration(row.counts.activeMs)} · ${row.counts.timed} of ${row.counts.total} ${attemptWord(row.counts.total)} timed`
              : 'Time not recorded'}
          </p>
          <div className="stats-levels">
            {([1, 2, 3] as const).map((level) => {
              const summary = row.levels.find((item) => item.level === level),
                setting = row.gem.mastery.supportedLevels.find((item) => item.level === level);
              const counts = countEvidence(
                row.records.filter((record) => levelOf(record) === level),
              );
              return (
                <div
                  key={level}
                  data-level={level}
                  className={`stats-level${summary ? '' : ' unavailable'}`}
                >
                  <h4>{setting?.label ?? levelLabel(course, level)}</h4>
                  {!summary ? (
                    <p>Not available</p>
                  ) : (
                    <>
                      <div
                        role="meter"
                        data-level={level}
                        aria-label={`${gem.name}, ${setting!.label}, current mastery`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={(summary.score ?? 0) * 100}
                        aria-valuetext={
                          summary.score === null
                            ? 'Not assessed'
                            : `${(summary.score * 100).toFixed(1)} percent; ${summary.mastered ? 'mastered' : 'in progress'}`
                        }
                        className={`stats-meter${summary.mastered ? ' mastered' : ''}`}
                        style={style({
                          '--score': `${(summary.score ?? 0) * 100}%`,
                          '--threshold': `${row.gem.mastery.threshold * 100}%`,
                        })}
                      >
                        <span />
                        <i />
                      </div>
                      <p>
                        {summary.score === null
                          ? 'Not assessed'
                          : `${(summary.score * 100).toFixed(1)}% · ${summary.mastered ? 'Mastered' : 'In progress'}`}
                      </p>
                      <div
                        className="stats-level-counts"
                        role="group"
                        aria-label="Question outcomes in the selected period"
                      >
                        {outcomes.map((outcome) => (
                          <span
                            key={outcome}
                            className={`stats-count-square ${outcome}`}
                            role="img"
                            aria-label={`${labels[outcome]}: ${counts[outcome]} questions in the selected period`}
                          >
                            <span className="stats-count-icon" aria-hidden="true">
                              {symbols[outcome]}
                            </span>
                            <span className="stats-count-number" aria-hidden="true">
                              {counts[outcome]}
                            </span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {recent.length > 0 && (
            <>
              <p className="stats-recent-note">
                Latest {recent.length} results{limited ? ' in this period' : ''} · oldest → newest
              </p>
              <ol className="stats-recent" aria-label="Recent recorded results, oldest first">
                {recent.map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      className={outcomeOf(record)}
                      aria-label={description(record)}
                      title={description(record)}
                      onFocus={() => setSelected(record)}
                      onClick={() => setSelected(record)}
                    >
                      {symbols[outcomeOf(record)]}
                    </button>
                  </li>
                ))}
              </ol>
              <p className="stats-result-detail" role="status">
                {selected && recent.some((record) => record.id === selected.id)
                  ? description(selected)
                  : 'Select a result for its question code, level and date.'}
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}

/** Original statistics presentation; persistence and mastery remain in shared domains. */
export function StatisticsView({
  course,
  namespace,
  databaseName,
  registry,
  onBack,
}: CourseDataViewProps & { readonly onBack?: () => void }) {
  const [history, setHistory] = useState<readonly CurriculumEvidence[]>([]),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(true);
  const [days, setDays] = useState<StatisticsOptions['days']>(0),
    [year, setYear] = useState<NonNullable<StatisticsOptions['year']>>('all'),
    [selectedDay, setSelectedDay] = useState<number | null>(null),
    [snapshotAt, setSnapshotAt] = useState(Date.now());
  const [openTopics, setOpenTopics] = useState<ReadonlySet<string>>(new Set());
  const readGeneration = useRef(0);
  const refresh = useCallback(async () => {
    const generation = ++readGeneration.current;
    setLoading(true);
    setError(null);
    if (namespace.course !== course) {
      setError('Statistics course and profile do not match.');
      setHistory([]);
      setLoading(false);
      return;
    }
    const repository = createChemistryRepository(databaseName);
    const result = await repository.curriculumHistory(namespace);
    repository.close?.();
    if (generation !== readGeneration.current) return;
    if (result.ok) {
      setHistory(result.value);
      setSnapshotAt(Date.now());
    } else {
      setHistory([]);
      setError('Saved statistics could not be read.');
    }
    setLoading(false);
  }, [databaseName, course, namespace.course, namespace.profileId]);
  useEffect(() => {
    void refresh();
    const reread = () => void refresh();
    window.addEventListener('focus', reread);
    window.addEventListener('pageshow', reread);
    return () => {
      readGeneration.current++;
      window.removeEventListener('focus', reread);
      window.removeEventListener('pageshow', reread);
    };
  }, [refresh]);
  useEffect(() => {
    setDays(0);
    setYear('all');
    setSelectedDay(null);
    setOpenTopics(new Set());
  }, [course, namespace.profileId]);
  const model = useMemo(
    () =>
      buildStatistics(namespace, registry, history, {
        days,
        year,
        catalogue: displayGems(course),
        now: snapshotAt,
      }),
    [namespace.course, namespace.profileId, registry, history, days, year, course, snapshotAt],
  );
  const tick = Math.max(
      60000,
      Math.ceil(Math.max(0, ...model.bins.map((bin) => bin.counts.activeMs)) / 4 / 60000) * 60000,
    ),
    maximum = tick * 4;
  const dayDetail = (bin: (typeof model.bins)[number]) =>
    `${date(bin.start)}: ${time(bin.counts.activeMs)} recorded active time — ${time(bin.counts.timeByOutcome.correct)} correct, ${time(bin.counts.timeByOutcome.partial)} partly correct, ${time(bin.counts.timeByOutcome.incorrect)} incorrect. ${bin.counts.total - bin.counts.timed} ${attemptWord(bin.counts.total - bin.counts.timed)} without recorded time.`;
  const selected = model.bins.find((bin) => bin.start === selectedDay);
  const period =
    days === 1
      ? 'In the last 24 hours'
      : days
        ? `In the last ${days} days`
        : 'Across all current practice';
  const earlier = new Map<string, CurriculumEvidence[]>();
  for (const record of model.historical) {
    const key = `${record.gemId}:${levelOf(record)}:${(record.provenance === 'legacy-import' ? record.progressionVersion : undefined) ?? 1}`;
    const group = earlier.get(key) ?? [];
    group.push(record);
    earlier.set(key, group);
  }
  return (
    <div className="statistics-screen">
      <a className="skip-link" href="#statsTopics">
        Skip to topic breakdown
      </a>
      <main className="statistics stats-shell">
        <header className="stats-brand">
          <button
            type="button"
            className="question-brand-mark"
            aria-label="Back to course map"
            onClick={onBack}
            disabled={!onBack}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/SJS-Eagle.svg`}
              alt="St John's School eagle"
            />
          </button>
          <div className="stats-brand-title">
            <p className="eyebrow">
              MASTERS OF {course === 'alevel' ? 'A LEVEL' : 'IGCSE'} CHEMISTRY
            </p>
            <h1>
              Your <span>Stats</span>
            </h1>
          </div>
          <button
            type="button"
            className="question-back"
            aria-label="Back to course map"
            title="Back to course map"
            onClick={onBack}
            disabled={!onBack}
          >
            <span aria-hidden="true">←</span>
          </button>
        </header>
        <div className="stats-intro">
          <div>
            <h2>See your progress.</h2>
            <p>Explore your recorded results, one topic and gem at a time.</p>
          </div>
          <p className="stats-local">Stored in this browser</p>
        </div>
        {loading && (
          <p className="stats-notice" role="status">
            Loading saved statistics…
          </p>
        )}
        {error && (
          <div className="stats-notice" role="alert">
            {error}{' '}
            <button type="button" onClick={() => void refresh()}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            <form
              className="stats-filters"
              aria-label="Filter response statistics"
              onSubmit={(event) => event.preventDefault()}
            >
              <label>
                Course
                <select
                  aria-label="Course year"
                  value={year}
                  onChange={(event) => {
                    setYear(event.target.value as typeof year);
                    setSelectedDay(null);
                  }}
                >
                  <option value="all">
                    {course === 'alevel' ? 'All years' : 'All year groups'}
                  </option>
                  {(course === 'alevel'
                    ? [
                        ['l6', 'Lower Sixth'],
                        ['u6', 'Upper Sixth'],
                      ]
                    : [
                        ['fourth', 'Fourth Form'],
                        ['lower', 'Lower Fifth'],
                        ['upper', 'Upper Fifth'],
                      ]
                  ).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="stats-period">
                <legend>Responses from</legend>
                <div>
                  {(
                    [
                      [0, 'All time'],
                      [1, 'Day'],
                      [7, 'Week'],
                      [30, 'Month'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={days === value}
                      onClick={() => {
                        setDays(value);
                        setSelectedDay(null);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </form>
            <section className="stats-overview" aria-label="Your overview">
              <Metric
                title="Recorded attempts"
                value={model.counts.total}
                note={period}
                testId="statistics-total"
              />
              <Metric
                title="Fully correct"
                value={
                  model.counts.total
                    ? `${Math.round((model.counts.correct / model.counts.total) * 100)}%`
                    : '—'
                }
                note={`${model.counts.correct} of ${model.counts.total} recorded ${attemptWord(model.counts.total)}`}
              />
              <Metric
                title="Gems practised"
                value={model.practised}
                note={`Of ${model.availableGems} supported gems · selected period`}
              />
              <Metric
                title="Levels mastered"
                value={`${model.mastered} / ${model.availableLevels}`}
                note="Current mastery · all current-progression attempts"
              />
              <Metric
                title="Active practice time"
                value={model.counts.timed ? duration(model.counts.activeMs) : '—'}
                note={`${model.counts.timed} of ${model.counts.total} ${attemptWord(model.counts.total)} timed · selected period`}
                testId="statistics-time"
                activeMs={model.counts.activeMs}
              />
            </section>
            <p className="stats-explanation">
              Response accuracy counts fully correct recorded attempts. Current mastery uses all
              current-progression attempts, weighted towards recent results; the white marker shows
              the mastery threshold.
            </p>
            <section className="stats-chart-card" aria-labelledby="statsChartHeading">
              <div className="stats-section-heading">
                <div>
                  <p className="eyebrow">YOUR PRACTICE OVER TIME</p>
                  <h2 id="statsChartHeading">Daily practice time</h2>
                </div>
                <p>
                  {model.counts.timed ? duration(model.counts.activeMs) : 'No time recorded'} ·{' '}
                  {model.counts.timed} of {model.counts.total} {attemptWord(model.counts.total)}{' '}
                  timed
                </p>
              </div>
              <p className="stats-outcome-text">
                {days
                  ? `${days === 1 ? 'Last 24 hours' : `Last ${days} days`} · daily totals (edge days may be partial)`
                  : 'All time · daily totals'}
              </p>
              <Legend />
              {!model.counts.timed && (
                <p className="stats-outcome-text">
                  No recorded timing data in this period. Attempts without timing data are not
                  included in the bars.
                </p>
              )}
              <div className="stats-chart-layout">
                <div className="stats-chart-axis" aria-hidden="true">
                  {[4, 3, 2, 1, 0].map((value) => (
                    <span key={value} style={{ bottom: `${value * 45 + 30}px` }}>
                      {value ? duration(value * tick) : '0 min'}
                    </span>
                  ))}
                </div>
                <div
                  className="stats-chart-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label="Daily active practice time by answer outcome; scroll horizontally to explore all days"
                >
                  <div
                    className={`stats-chart-bars${days === 30 ? ' stats-chart-month' : ''}`}
                    style={style({ '--chart-columns': model.bins.length })}
                  >
                    {model.bins.map((bin) => (
                      <div className="stats-chart-column" key={bin.start}>
                        <button
                          type="button"
                          className="stats-chart-bar"
                          data-active-ms={bin.counts.activeMs}
                          aria-label={dayDetail(bin)}
                          title={dayDetail(bin)}
                          aria-pressed={selectedDay === bin.start}
                          onClick={() => setSelectedDay(bin.start)}
                          onFocus={() => setSelectedDay(bin.start)}
                          onPointerEnter={() => setSelectedDay(bin.start)}
                        >
                          {days !== 30 && (
                            <span
                              className="stats-chart-value"
                              aria-hidden="true"
                              style={{ bottom: `${(bin.counts.activeMs / maximum) * 180 + 4}px` }}
                            >
                              {bin.counts.activeMs ? duration(bin.counts.activeMs) : ''}
                            </span>
                          )}
                          <span
                            className="stats-chart-stack"
                            aria-hidden="true"
                            style={{ height: `${(bin.counts.activeMs / maximum) * 180}px` }}
                          >
                            {outcomes.map((outcome) => (
                              <span
                                key={outcome}
                                className={outcome}
                                style={{
                                  height: `${bin.counts.activeMs ? (bin.counts.timeByOutcome[outcome] / bin.counts.activeMs) * 100 : 0}%`,
                                }}
                              />
                            ))}
                          </span>
                        </button>
                        <span className="stats-chart-label">
                          {days === 30
                            ? `${new Date(bin.start).getDate()}/${new Date(bin.start).getMonth() + 1}`
                            : new Date(bin.start).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="stats-chart-detail" role="status">
                {selected ? dayDetail(selected) : 'Select a bar for the full breakdown.'}
              </p>
              <p className="stats-outcome-text">
                Each bar shows recorded active time, coloured by answer outcome. Untimed attempts
                add no time. Time follows the answer’s completion date in this device’s local time.
              </p>
            </section>
            <section id="statsTopics" tabIndex={-1} aria-labelledby="statsTopicsHeading">
              <div className="stats-section-heading">
                <div>
                  <p className="eyebrow">FROM TOPIC TO GEM</p>
                  <h2 id="statsTopicsHeading">Your topic breakdown</h2>
                </div>
                <p>Open a topic to explore its gems ↓</p>
              </div>
              <Legend />
              {!model.counts.total && (
                <p className="stats-empty">
                  {days
                    ? 'No recorded responses in this period. Try All time or practise a supported gem.'
                    : 'Your stats start with your first recorded attempt. Practise a supported gem, then return here to see your progress.'}
                </p>
              )}
              {model.topics.map((topic) => (
                <details
                  key={topic.id}
                  className="stats-topic"
                  data-topic={topic.id}
                  open={openTopics.has(topic.id)}
                  onToggle={(event) => {
                    const open = event.currentTarget.open;
                    setOpenTopics((previous) => {
                      if (previous.has(topic.id) === open) return previous;
                      const next = new Set(previous);
                      if (open) next.add(topic.id);
                      else next.delete(topic.id);
                      return next;
                    });
                  }}
                >
                  <summary>
                    <div>
                      <span className="stats-topic-meta">{topic.group}</span>
                      <strong className="stats-topic-name">{topic.name}</strong>
                      <span className="stats-topic-meta">
                        {topic.counts.total} {attemptWord(topic.counts.total)}
                      </span>
                    </div>
                    <OutcomeSummary counts={topic.counts} />
                  </summary>
                  <div className="stats-gems">
                    {topic.gems.map((gem) => (
                      <GemRow key={gem.id} gem={gem} course={course} limited={!!days} />
                    ))}
                  </div>
                </details>
              ))}
            </section>
            <details className="stats-history">
              <summary>
                Earlier practice history ({model.historical.length}{' '}
                {attemptWord(model.historical.length)})
              </summary>
              <p>
                Previous progression versions and retired levels. These results are excluded from
                the overview and current mastery. Course and date filters also apply here.
              </p>
              {[...earlier.values()].map((records) => {
                const first = records[0]!;
                const gem =
                  displayGems(course).find((item) => item.id === first.gemId) ??
                  model.rows.find((row) => row.gem.mastery.historicalAliases.includes(first.gemId));
                const name = gem && ('name' in gem ? gem.name : gem.gem.label);
                return (
                  <div
                    className="stats-history-row"
                    key={`${first.gemId}:${levelOf(first)}:${(first.provenance === 'legacy-import' ? first.progressionVersion : undefined) ?? 1}`}
                  >
                    <strong>
                      {name ?? 'Earlier gem'} · {levelLabel(course, levelOf(first))} · earlier
                      progression
                    </strong>
                    <OutcomeSummary counts={countEvidence(records)} />
                  </div>
                );
              })}
              {!earlier.size && <p>No earlier practice history in this selection.</p>}
            </details>
            <footer className="stats-footer">
              Includes recorded standalone practice and revision. Olympiad challenges are excluded.
              Full written answers are not shown in this history.
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
export default StatisticsView;
