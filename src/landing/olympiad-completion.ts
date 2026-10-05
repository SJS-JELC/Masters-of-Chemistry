import type { C3L6Progress, OlympiadProgress } from '../contracts/index.ts';
import { chemicalChallenge as c3Challenge } from '../activities/olympiad/c3l6/source-bank.ts';
import { bFingerprint, c3Fingerprint, cFingerprint, c3Policy } from '../activities/olympiad/c3l6/policy.ts';
import { isomerChallenge } from '../activities/olympiad/isomers2011/content.ts';
import { isomerPolicy } from '../activities/olympiad/isomers2011/policy.ts';

export interface ChallengeCompletion {
  readonly state: 'unstarted' | 'partial' | 'complete';
  readonly correct: number;
  readonly total: number;
}
const result = (correct: number, total: number, complete = false): ChallengeCompletion => ({
  state: complete ? 'complete' : correct > 0 ? 'partial' : 'unstarted', correct, total,
});

/** Counts current checked answers only. Wrong-place isomers, stale checks, unchecked
 * drawings and contributions in locked C3 stages never illuminate the gem. Policy
 * validation supplies chemical correctness; this selector does not award evidence. */
export function olympiadCompletion(progress: OlympiadProgress | null | undefined, activityId: string): ChallengeCompletion {
  const total = activityId === c3Challenge.activityId ? c3Challenge.classifications.length + c3Challenge.dependencies.bUnits.reduce((n, u) => n + u.slots.length, 0) + c3Challenge.network.slots.length : 7;
  if (!progress || progress.activityId !== activityId) return result(0, total);
  try {
    if (progress.activityId === c3Challenge.activityId) {
      const p = c3Policy.validateCompletion(c3Challenge, progress as C3L6Progress);
      let correct = p.aCheck?.drawingFingerprint === c3Fingerprint(p.classifications) ? p.aCheck.correct : 0;
      if (p.completed.a) for (const u of c3Challenge.dependencies.bUnits) {
        const check = p.unitChecks[u.id];
        if (check?.drawingFingerprint === bFingerprint(c3Challenge, p, u.id)) correct += check.correct;
      }
      if (p.completed.b) for (const s of c3Challenge.network.slots) {
        const check = p.slotChecks[s.id];
        if (check?.drawingFingerprint === cFingerprint(p, s.id)) correct += check.correct;
      }
      return result(correct, total, p.completed.a && p.completed.b && p.completed.c);
    }
    if (progress.activityId === isomerChallenge.activityId) {
      const p = isomerPolicy.validateCompletion(isomerChallenge, progress);
      return result(p.check?.fullyCorrect ?? 0, total, p.completed);
    }
  } catch { /* Invalid saved drawings are unvalidated, never completion. */ }
  return result(0, total);
}
