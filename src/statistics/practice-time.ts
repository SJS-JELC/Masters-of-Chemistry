import type { RecallStatisticsModel, StatisticsModel } from './model.ts';
import { validTiming } from '../domain/timing/active-clock.ts';

/** One combined daily chart; each timed attempt belongs to one topic only. */
export function practiceTimeBins(model: StatisticsModel, recall: RecallStatisticsModel) {
  const curriculumDays = new Map(model.bins.map(bin => [bin.start, bin]));
  const recallDays = new Map(recall.bins.map(bin => [bin.start, bin]));
  const topicDays = new Map<number, Map<string, number>>();
  const seen = new Set<string>();
  for (const topic of model.topics) {
    for (const gem of topic.gems) {
      for (const record of gem.row?.records ?? []) {
        if (seen.has(record.id) || !record.timing || !validTiming(record.timing)) continue;
        seen.add(record.id);
        const day = new Date(record.completedAt);
        day.setHours(0, 0, 0, 0);
        const totals = topicDays.get(+day) ?? new Map<string, number>();
        totals.set(topic.name, (totals.get(topic.name) ?? 0) + record.timing.activeMs);
        topicDays.set(+day, totals);
      }
    }
  }
  const starts = [...curriculumDays.keys(), ...recallDays.keys()];
  if (!starts.length) return [];
  const bins = [];
  const end = Math.max(...starts);
  const day = new Date(Math.min(...starts));
  while (+day <= end) {
    const start = +day;
    const curriculum = curriculumDays.get(start)?.counts;
    const factual = recallDays.get(start)?.counts;
    const topics = new Map(topicDays.get(start));
    if (factual?.activeMs) topics.set('Factual Recall', factual.activeMs);
    bins.push({
      start,
      topics: [...topics].sort(([a], [b]) => a.localeCompare(b)),
      counts: {
        activeMs: (curriculum?.activeMs ?? 0) + (factual?.activeMs ?? 0),
        timeByOutcome: {
          correct: (curriculum?.timeByOutcome.correct ?? 0) + (factual?.timeByOutcome.correct ?? 0),
          partial: curriculum?.timeByOutcome.partial ?? 0,
          incorrect: (curriculum?.timeByOutcome.incorrect ?? 0) + (factual?.timeByOutcome.wrong ?? 0),
        },
      },
    });
    day.setDate(day.getDate() + 1);
  }
  return bins;
}
