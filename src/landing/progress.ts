import { ALPHA_LANDING_PREFERENCE_PREFIX } from '../persistence/alpha-namespace.ts';
import type { Course } from '../contracts/identity';
import type { GemRegistration } from '../contracts/registry';
import type { CurriculumEvidence } from '../contracts/session';
import { createCourseMastery } from '../domain/mastery/course-mastery.ts';
export function landingProgress(
  course: Course,
  history: readonly CurriculumEvidence[],
  gem: GemRegistration | undefined,
  now = Date.now(),
) {
  if (!gem) return { grade: 0, score: null, freshness: 'unstarted', days: null, states: [] };
  const mastery = createCourseMastery(course, () => now);
  const states = gem.supportedLevels.map((level) => {
    const summary = mastery.summarize(history, gem.mastery, level);
    const days =
      summary.lastCompletedAt === null
        ? null
        : Math.max(0, Math.floor((now - summary.lastCompletedAt) / 86400000));
    return {
      ...summary,
      days,
      freshness: days === null ? 'unstarted' : days <= 7 ? 'fresh' : days <= 21 ? 'steady' : 'due',
    };
  });
  let grade = 0;
  for (const state of states) {
    if (!state.mastered) break;
    grade = state.level;
  }
  // Preserve the source map's display lookup separately from correct summaries.
  // A Level app.js indexes the states by award level minus one. With pH curves'
  // [2,3] support, its level-2/3 map award may therefore look unstarted. This is
  // source UI behaviour only; choice meters and the mastery engine use states.
  const state =
    course === 'alevel'
      ? grade
        ? states[grade - 1]
        : states.find((state) => state.score !== null)
      : states.find((state) => state.level === grade) ||
        states.find((state) => state.score !== null) ||
        states[0];
  return {
    grade,
    score: state?.score ?? null,
    freshness: state?.freshness ?? 'unstarted',
    days: state?.days ?? null,
    states,
  };
}
export const landingPreferencePrefix = ALPHA_LANDING_PREFERENCE_PREFIX;
export function readPreference<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(landingPreferencePrefix + key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
export function savePreference(key: string, value: unknown) {
  try {
    localStorage.setItem(landingPreferencePrefix + key, JSON.stringify(value));
  } catch {
    /* Preference loss does not affect persisted assessment evidence. */
  }
}
