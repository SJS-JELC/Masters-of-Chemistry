import type { Level } from '../../../contracts/identity.ts';
import type { RateGem } from './types.ts';

export const rateActivityId = 'alevel/rate-equations' as const;
/** Explicit semantic IDs; historic numeric leaves never identify new evidence. */
export const rateGemIds = {
  orders: 'u6-t1-2-orders',
  graphs: 'u6-t1-2-graphs',
  mechanisms: 'u6-t1-2-mechanisms',
  arrhenius: 'u6-t1-2-arrhenius',
} as const satisfies Readonly<Record<RateGem, string>>;
export const rateQuestionSources = [
  { questionId: 'RATE-POC-orders-L1', gem: 'orders', level: 1 },
  { questionId: 'RATE-POC-orders-L2', gem: 'orders', level: 2 },
  { questionId: 'RATE-POC-orders-L3', gem: 'orders', level: 3 },
  { questionId: 'RATE-POC-graphs-L1', gem: 'graphs', level: 1 },
  { questionId: 'RATE-POC-graphs-L2', gem: 'graphs', level: 2 },
  { questionId: 'RATE-POC-graphs-L3', gem: 'graphs', level: 3 },
  { questionId: 'RATE-POC-mechanisms-L1', gem: 'mechanisms', level: 1 },
  { questionId: 'RATE-POC-mechanisms-L2', gem: 'mechanisms', level: 2 },
  { questionId: 'RATE-POC-mechanisms-L3', gem: 'mechanisms', level: 3 },
  { questionId: 'RATE-POC-arrhenius-L1', gem: 'arrhenius', level: 1 },
  { questionId: 'RATE-POC-arrhenius-L2', gem: 'arrhenius', level: 2 },
  { questionId: 'RATE-POC-arrhenius-L3', gem: 'arrhenius', level: 3 },
] as const satisfies readonly Readonly<{ questionId: string; gem: RateGem; level: Level }>[];

export function rateSource(id: unknown) {
  return rateQuestionSources.find(source => source.questionId === id);
}
export function rateSeedCheck(seed: number): void {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Rate seed must be an unsigned 32-bit integer.');
}
