import type { Namespace, Level } from '../contracts/identity.ts';
import type {
  ActivityRegistry,
  CurriculumRegistration,
  GemRegistration,
} from '../contracts/registry.ts';
import type { CurriculumEvidence, MasterySummary } from '../contracts/session.ts';
import { createCourseMastery } from '../domain/mastery/index.ts';
import { validTiming } from '../domain/timing/active-clock.ts';
import type { RecallEvidence, RecallFact } from '../contracts/recall.ts';
import { recallDefinitionFor } from '../recall/compatibility.ts';
import { topicsFor } from '../recall/session-contract.ts';
import type { DisplayGem } from '../landing/catalogue.ts';

export type Outcome = 'correct' | 'partial' | 'incorrect';
export const outcomeOf = (record: CurriculumEvidence): Outcome =>
  record.score === 1 ? 'correct' : record.score === 0.5 ? 'partial' : 'incorrect';
export const levelOf = (record: CurriculumEvidence): Level =>
  record.course === 'alevel' ? record.level : record.grade;
export interface Counts {
  readonly total: number;
  readonly correct: number;
  readonly partial: number;
  readonly incorrect: number;
  readonly timed: number;
  readonly activeMs: number;
  readonly medianActiveMs: number | null;
  readonly timeByOutcome: Readonly<Record<Outcome, number>>;
  readonly assisted: number;
}
export function countEvidence(records: readonly CurriculumEvidence[]): Counts {
  const counts = {
    total: records.length,
    correct: 0,
    partial: 0,
    incorrect: 0,
    timed: 0,
    activeMs: 0,
    medianActiveMs: null as number | null,
    timeByOutcome: { correct: 0, partial: 0, incorrect: 0 },
    assisted: 0,
  };
  const durations: number[] = [];
  for (const record of records) {
    const outcome = outcomeOf(record);
    counts[outcome]++;
    if (record.assisted === true) counts.assisted++;
    if (record.timing && validTiming(record.timing)) {
      counts.timed++;
      counts.activeMs += record.timing.activeMs;
      counts.timeByOutcome[outcome] += record.timing.activeMs;
      durations.push(record.timing.activeMs);
    }
  }
  durations.sort((a, b) => a - b);
  if (durations.length) {
    const middle = Math.floor(durations.length / 2);
    counts.medianActiveMs =
      durations.length % 2 ? durations[middle]! : (durations[middle - 1]! + durations[middle]!) / 2;
  }
  return counts;
}
export interface StatisticsRow {
  readonly activity: CurriculumRegistration;
  readonly gem: GemRegistration;
  readonly records: readonly CurriculumEvidence[];
  readonly counts: Counts;
  readonly levels: readonly MasterySummary[];
}
export interface DayBin {
  readonly start: number;
  readonly end: number;
  readonly counts: Counts;
}
export interface StatisticsOptions {
  readonly days: 0 | 1 | 7 | 30 | 90;
  readonly year?: 'all' | 'l6' | 'u6' | 'fourth' | 'lower' | 'upper';
  readonly catalogue?: readonly DisplayGem[];
  readonly gemId?: string;
  readonly now?: number;
}
export interface StatisticsDisplayGem extends DisplayGem {
  readonly row?: StatisticsRow;
}
export interface StatisticsTopic {
  readonly id: string;
  readonly name: string;
  readonly group: string;
  readonly gems: readonly StatisticsDisplayGem[];
  readonly counts: Counts;
}
export interface StatisticsModel {
  readonly records: readonly CurriculumEvidence[];
  readonly current: readonly CurriculumEvidence[];
  readonly historical: readonly CurriculumEvidence[];
  readonly rows: readonly StatisticsRow[];
  readonly counts: Counts;
  readonly bins: readonly DayBin[];
  readonly excluded: number;
  readonly mastered: number;
  readonly availableLevels: number;
  readonly availableGems: number;
  readonly practised: number;
  readonly topics: readonly StatisticsTopic[];
}
/** Presentation aggregation only. The shared course domain alone calculates mastery. */
export function buildStatistics(
  namespace: Namespace,
  registry: ActivityRegistry,
  input: readonly CurriculumEvidence[],
  options: StatisticsOptions,
): StatisticsModel {
  const now = options.now ?? Date.now(),
    seen = new Set<string>();
  // The repository validates history. This second boundary prevents accidental mixed
  // namespace input and gives deterministic first-record deduplication before sorting.
  const records = input
    .filter((record) => {
      if (
        record.kind !== 'curriculum' ||
        record.course !== namespace.course ||
        record.profileId !== namespace.profileId ||
        !record.id ||
        seen.has(record.id) ||
        !Number.isFinite(record.completedAt) ||
        record.completedAt <= 0 ||
        record.completedAt > now ||
        ![0, 0.5, 1].includes(record.score) ||
        ![1, 2, 3].includes(levelOf(record)) ||
        (record.activityId as string | undefined) === 'alevel/c3l6-organic-reactions' ||
        !record.gemId ||
        /c3l6|rocket|olympiad/i.test(record.gemId) ||
        /^alevel\/(?:c3l6|olympiad)/i.test(record.activityId ?? '')
      )
        return false;
      if (
        record.provenance === 'new-attempt' &&
        (!record.independent || record.assisted || record.firstResponse.assistance.length)
      )
        return false;
      seen.add(record.id);
      return true;
    })
    .sort((a, b) => a.completedAt - b.completedAt || a.id.localeCompare(b.id));
  const registrations = registry.curriculumFor(namespace.course);
  const definitions = registrations.flatMap((activity) =>
    activity.gems.map((gem) => ({ activity, gem })),
  );
  const definitionFor = (record: CurriculumEvidence) =>
    definitions.find(
      ({ gem }) => gem.id === record.gemId || gem.mastery.historicalAliases.includes(record.gemId),
    );
  const isCurrent = (record: CurriculumEvidence) => {
    const definition = definitionFor(record);
    if (!definition || !definition.gem.supportedLevels.includes(levelOf(record))) return false;
    const version = definition.gem.mastery.activeProgressionVersion ?? 1;
    return record.provenance === 'new-attempt' || (record.progressionVersion ?? 1) === version;
  };
  const cutoff = options.days ? now - options.days * 86400000 : 0;
  const inYear = (gemId: string) =>
    !options.year || options.year === 'all' || gemId.startsWith(options.year + '-');
  const displayed = options.catalogue ? new Set(options.catalogue.map((gem) => gem.id)) : null;
  const visible = (record: CurriculumEvidence) =>
    record.completedAt >= cutoff &&
    inYear(definitionFor(record)?.gem.id ?? record.gemId) &&
    (!options.gemId ||
      definitionFor(record)?.gem.id === options.gemId ||
      record.gemId === options.gemId);
  const current = records.filter(
    (record) =>
      isCurrent(record) &&
      visible(record) &&
      (!displayed || displayed.has(definitionFor(record)!.gem.id)),
  );
  const historical = records.filter((record) => !isCurrent(record) && visible(record));
  const mastery = createCourseMastery(namespace.course, () => now);
  const rows = definitions
    .filter(
      ({ gem }) =>
        inYear(gem.id) &&
        (!displayed || displayed.has(gem.id)) &&
        (!options.gemId || gem.id === options.gemId),
    )
    .map(({ activity, gem }): StatisticsRow => {
      const matching = current.filter((record) => definitionFor(record)?.gem.id === gem.id);
      return {
        activity,
        gem,
        records: matching,
        counts: countEvidence(matching),
        levels: gem.supportedLevels.map((level) => mastery.summarize(records, gem.mastery, level)),
      };
    });
  const topics: StatisticsTopic[] = [];
  for (const gem of options.catalogue ?? []) {
    if (!inYear(gem.id)) continue;
    const id = `${gem.group.key}-${gem.topicNumber}`;
    let topic = topics.find((item) => item.id === id);
    if (!topic) {
      topic = {
        id,
        name: gem.topicName,
        group: gem.group.name,
        gems: [],
        counts: countEvidence([]),
      };
      topics.push(topic);
    }
    const row = rows.find((item) => item.gem.id === gem.id);
    (topic.gems as StatisticsDisplayGem[]).push({ ...gem, ...(row ? { row } : {}) });
  }
  for (let index = topics.length - 1; index >= 0; index--) {
    const topic = topics[index]!;
    // Match the original: display unavailable peers inside supported topics.
    if (!topic.gems.some((gem) => gem.row)) {
      topics.splice(index, 1);
      continue;
    }
    topics[index] = {
      ...topic,
      counts: countEvidence(topic.gems.flatMap((gem) => gem.row?.records ?? [])),
    };
  }
  const midnight = (value: number) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const first = current.reduce((value, record) => Math.min(value, record.completedAt), now);
  let start = midnight(options.days ? cutoff : first);
  const end = midnight(now);
  end.setDate(end.getDate() + 1);
  const groups = new Map<number, CurriculumEvidence[]>();
  for (const record of current) {
    const key = +midnight(record.completedAt);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  const bins: DayBin[] = [];
  while (start < end) {
    const next = new Date(start);
    next.setDate(next.getDate() + 1);
    bins.push({ start: +start, end: +next, counts: countEvidence(groups.get(+start) ?? []) });
    start = next;
  }
  return {
    records,
    current,
    historical,
    rows,
    counts: countEvidence(current),
    bins,
    excluded: input.length - records.length,
    mastered: rows.reduce(
      (count, row) => count + row.levels.filter((level) => level.mastered).length,
      0,
    ),
    availableLevels: rows.reduce((count, row) => count + row.levels.length, 0),
    availableGems: rows.length,
    practised: rows.filter((row) => row.counts.total > 0).length,
    topics,
  };
}

export type RecallStatisticsOutcome = 'correct' | 'wrong';
export interface RecallStatisticsCounts {
  readonly total: number;
  readonly correct: number;
  readonly wrong: number;
  readonly timed: number;
  readonly untimed: number;
  readonly activeMs: number;
  readonly timeByOutcome: Readonly<Record<RecallStatisticsOutcome, number>>;
}
export interface RecallStatisticsModel {
  readonly records: readonly RecallEvidence[];
  readonly visible: readonly RecallEvidence[];
  readonly unmapped: readonly RecallEvidence[];
  readonly counts: RecallStatisticsCounts;
  readonly bins: readonly Readonly<{ start: number; counts: RecallStatisticsCounts }>[];
}
function countRecallStatistics(records: readonly RecallEvidence[]): RecallStatisticsCounts {
  const counts = {
    total: records.length,
    correct: 0,
    wrong: 0,
    timed: 0,
    untimed: 0,
    activeMs: 0,
    timeByOutcome: { correct: 0, wrong: 0 },
  };
  for (const record of records) {
    const outcome = record.outcome as RecallStatisticsOutcome;
    counts[outcome]++;
    const timing = record.firstResponse.timing;
    if (timing && validTiming(timing)) {
      counts.timed++;
      counts.activeMs += timing.activeMs;
      counts.timeByOutcome[outcome] += timing.activeMs;
    } else counts.untimed++;
  }
  return counts;
}
/** Separate presentation only: immutable automatic Recall first checks never enter graded mastery. */
export function buildRecallStatistics(
  namespace: Namespace,
  input: readonly RecallEvidence[],
  options: Pick<StatisticsOptions, 'days' | 'year' | 'now'> &
    Readonly<{ facts?: readonly RecallFact[] }>,
): RecallStatisticsModel {
  const now = options.now ?? Date.now(),
    seen = new Set<string>();
  const validNamespace =
    ['alevel', 'igcse'].includes(namespace.course) &&
    typeof namespace.profileId === 'string' &&
    !!namespace.profileId;
  const records = input
    .filter((record) => {
      if (
        !validNamespace ||
        !record ||
        record.kind !== 'recall' ||
        record.namespace?.course !== namespace.course ||
        record.namespace?.profileId !== namespace.profileId ||
        typeof record.id !== 'string' ||
        !record.id ||
        seen.has(record.id) ||
        typeof record.factId !== 'string' ||
        !record.factId ||
        record.ref?.questionId !== record.factId ||
        record.ref?.activityId !== namespace.course + '/recall' ||
        !Number.isFinite(record.completedAt) ||
        record.completedAt <= 0 ||
        record.completedAt > now ||
        !['correct', 'wrong'].includes(record.outcome) ||
        record.firstAssessment?.kind !== 'marked' ||
        record.firstAssessment.selfAssessed !== false ||
        ![0, 0.5, 1].includes(record.firstAssessment.score) ||
        (record.outcome === 'correct') !== (record.firstAssessment.score === 1) ||
        !Array.isArray(record.firstResponse?.assistance) ||
        record.firstResponse.assistance.length
      )
        return false;
      seen.add(record.id);
      return true;
    })
    .sort((a, b) => a.completedAt - b.completedAt || a.id.localeCompare(b.id));
  const years = (record: RecallEvidence): readonly string[] => {
    let fact: RecallFact | null;
    try {
      fact = recallDefinitionFor(
        namespace.course,
        record.factId,
        options.facts ?? [],
        record.definitionId,
      );
    } catch {
      return [];
    }
    if (!fact) return [];
    return [
      ...new Set(
        topicsFor(namespace.course)
          .filter((topic) => topic.gemIds.some((id) => fact.gemIds.includes(id)))
          .map((topic) => topic.year),
      ),
    ];
  };
  const cutoff = options.days ? now - options.days * 86400000 : 0;
  const inPeriod = records.filter((record) => record.completedAt >= cutoff);
  const unmapped = inPeriod.filter((record) => !years(record).length);
  const visible = inPeriod.filter(
    (record) => !options.year || options.year === 'all' || years(record).includes(options.year),
  );
  const groups = new Map<number, RecallEvidence[]>();
  for (const record of visible) {
    const day = new Date(record.completedAt);
    day.setHours(0, 0, 0, 0);
    const start = +day,
      group = groups.get(start) ?? [];
    group.push(record);
    groups.set(start, group);
  }
  return {
    records,
    visible,
    unmapped,
    counts: countRecallStatistics(visible),
    bins: [...groups]
      .sort(([a], [b]) => a - b)
      .map(([start, group]) => ({ start, counts: countRecallStatistics(group) })),
  };
}
