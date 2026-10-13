import type { Namespace } from './identity.ts';

/** Cumulative elapsed time for one card in one deck run on a local calendar day.
 * Both sides, reloads and revisits share the 15-second cap. Restarting starts a new run.
 * Max-duration upserts prevent duplicate writes. This never supplies mastery evidence.
 */
export interface FlashcardStudyTime {
  readonly kind: 'flashcards';
  readonly id: string;
  readonly namespace: Namespace;
  readonly sessionId: string;
  readonly scopeKey: string;
  readonly dayStart: number;
  readonly activeMs: number;
  readonly cardLimitMs: 15000;
  readonly updatedAt: number;
}
