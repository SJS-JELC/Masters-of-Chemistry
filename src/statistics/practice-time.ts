import type { RecallStatisticsModel, StatisticsModel } from './model.ts';
import { validTiming } from '../domain/timing/active-clock.ts';
import type { FlashcardStudyTime } from '../contracts/flashcard-time.ts';
import type { Namespace } from '../contracts/identity.ts';
import { validateFlashcardStudyTime } from '../persistence/flashcard-time-validation.ts';

const localDay = (timestamp: number): number => {
  const day = new Date(timestamp);
  day.setHours(0, 0, 0, 0);
  return +day;
};

/** Date filtering uses whole saved local days: there is no event history to split a day. */
export function flashcardTimeInPeriod(
  namespace: Namespace,
  input: readonly FlashcardStudyTime[],
  options: Readonly<{ days: number; now: number }>,
): readonly FlashcardStudyTime[] {
  const cutoff = new Date(options.days ? options.now - options.days * 86400000 : 0);
  if (options.days) cutoff.setHours(0, 0, 0, 0);
  const records = new Map<string, FlashcardStudyTime>();
  for (const record of input) {
    try { validateFlashcardStudyTime(record); } catch { continue; }
    if (record.namespace.course !== namespace.course || record.namespace.profileId !== namespace.profileId || record.dayStart > options.now || localDay(record.dayStart) < +cutoff || record.updatedAt > options.now) continue;
    const old = records.get(record.id);
    // A duplicate checkpoint is cumulative rather than another visit.
    if (!old || (old.scopeKey === record.scopeKey && record.activeMs > old.activeMs)) records.set(record.id, record);
  }
  return [...records.values()].sort((a, b) => a.dayStart - b.dayStart || a.id.localeCompare(b.id));
}

/** One daily chart; study time never enters assessed counts or outcomes. */
export function practiceTimeBins(model: StatisticsModel, recall: RecallStatisticsModel, flashcards: readonly FlashcardStudyTime[] = []) {
  const curriculumDays = new Map(model.bins.map(bin => [bin.start, bin]));
  const recallDays = new Map(recall.bins.map(bin => [bin.start, bin]));
  const topicDays = new Map<number, Map<string, number>>();
  const studyDays = new Map<number, number>();
  for (const record of flashcards) {
    const start = localDay(record.dayStart);
    studyDays.set(start, (studyDays.get(start) ?? 0) + record.activeMs);
  }
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
  const starts = [...curriculumDays.keys(), ...recallDays.keys(), ...studyDays.keys()];
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
    const studyMs = studyDays.get(start) ?? 0;
    if (studyMs) topics.set('Flashcards', studyMs);
    bins.push({
      start,
      topics: [...topics].sort(([a], [b]) => a.localeCompare(b)),
      counts: {
        activeMs: (curriculum?.activeMs ?? 0) + (factual?.activeMs ?? 0) + studyMs,
        timeByOutcome: {
          correct: (curriculum?.timeByOutcome.correct ?? 0) + (factual?.timeByOutcome.correct ?? 0),
          partial: curriculum?.timeByOutcome.partial ?? 0,
          incorrect: (curriculum?.timeByOutcome.incorrect ?? 0) + (factual?.timeByOutcome.wrong ?? 0),
          flashcards: studyMs,
        },
      },
    });
    day.setDate(day.getDate() + 1);
  }
  return bins;
}
