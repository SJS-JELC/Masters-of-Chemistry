import type { RecallFact } from '../contracts/recall.ts';
/** The source-owned first gem is the teaching home; later links are supporting knowledge. */
export function isPrimaryRecallGem(fact: RecallFact, gems: readonly string[]): boolean {
  return fact.gemIds[0] !== undefined && gems.includes(fact.gemIds[0]);
}
/** Shuffle once at session creation; persisted queues retain their order on resume. */
export function shuffleRecallIds(ids: readonly string[], random: () => number = Math.random): string[] {
  const shuffled = [...new Set(ids)];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}
