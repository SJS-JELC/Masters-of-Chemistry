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

export interface RateSource {
  readonly questionId: string;
  readonly gem: RateGem;
  readonly level: Level;
  readonly bank: 'legacy' | 'expanded' | 'new-types';
  readonly mechanismContext?: 'iron-iodide' | 'thiosulfate';
  readonly typedMechanismContext?: 'no2-co' | 'f2-no2' | 'iron-iodide' | 'thiosulfate';
  readonly family?: string;
  readonly style?: 'numerical' | 'conceptual' | 'typed-mechanism';
  readonly species: readonly string[];
}
/** Closed membership and explicit semantics; historical sources remain available for restore. */
export const allRateQuestionSources: readonly RateSource[] = [
  ...rateQuestionSources.map(source => ({ ...source, bank: 'legacy' as const,
    species: source.gem === 'orders' ? ['A', 'B'] : source.gem === 'mechanisms'
      ? source.level === 2 ? ['F2', 'NO2'] : ['NO2', 'CO'] : [] })),
  ...(['orders', 'graphs', 'arrhenius'] as const).flatMap(gem => ([1, 2, 3] as const).map(level => ({
    questionId: `RATE-EXP-${gem}-L${level}`, gem, level, bank: 'expanded' as const, species: gem === 'orders' ? ['A', 'B'] : [],
  }))),
  ...(['iron-iodide', 'thiosulfate'] as const).flatMap(mechanismContext => ([1, 2, 3] as const).map(level => ({
    questionId: `RATE-EXP-mechanisms-${mechanismContext}-L${level}`, gem: 'mechanisms' as const, level, bank: 'expanded' as const, mechanismContext,
    species: mechanismContext === 'iron-iodide' ? ['Fe3+', 'I-'] : ['S2O3^2-', 'H+'],
  }))),
  { questionId: 'RATE-NEW-orders-units-L1', gem: 'orders', level: 1, bank: 'new-types', family: 'units', style: 'conceptual', species: [] },
  { questionId: 'RATE-NEW-orders-excess-L2', gem: 'orders', level: 2, bank: 'new-types', family: 'excess', style: 'conceptual', species: [] },
  { questionId: 'RATE-NEW-orders-three-L3', gem: 'orders', level: 3, bank: 'new-types', family: 'three-reactant', style: 'numerical', species: ['A', 'B', 'C'] },
  { questionId: 'RATE-NEW-orders-ph-L3', gem: 'orders', level: 3, bank: 'new-types', family: 'pH', style: 'numerical', species: ['H+'] },
  { questionId: 'RATE-NEW-orders-dilution-L3', gem: 'orders', level: 3, bank: 'new-types', family: 'dilution', style: 'numerical', species: ['A', 'B'] },
  { questionId: 'RATE-NEW-graphs-shapes-L1', gem: 'graphs', level: 1, bank: 'new-types', family: 'shapes', style: 'conceptual', species: [] },
  { questionId: 'RATE-NEW-graphs-initial-L1', gem: 'graphs', level: 1, bank: 'new-types', family: 'initial-tangent', style: 'numerical', species: [] },
  { questionId: 'RATE-NEW-graphs-half-concentration-L1', gem: 'graphs', level: 1, bank: 'new-types', family: 'half-life-concentration', style: 'numerical', species: [] },
  { questionId: 'RATE-NEW-graphs-deduce-L3', gem: 'graphs', level: 3, bank: 'new-types', family: 'half-life-inference', style: 'numerical', species: [] },
  { questionId: 'RATE-NEW-graphs-mixed-L3', gem: 'graphs', level: 3, bank: 'new-types', family: 'mixed-evidence', style: 'numerical', species: ['A', 'B', 'C'] },
  { questionId: 'RATE-NEW-arrhenius-temperature-L3', gem: 'arrhenius', level: 3, bank: 'new-types', family: 'reverse-temperature', style: 'numerical', species: [] },
  ...(['no2-co', 'f2-no2', 'iron-iodide', 'thiosulfate'] as const).map(typedMechanismContext => ({
    questionId: `RATE-NEW-mechanisms-${typedMechanismContext}-L3`, gem: 'mechanisms' as const, level: 3 as const,
    bank: 'new-types' as const, typedMechanismContext, family: typedMechanismContext, style: 'typed-mechanism' as const, species: [],
  })),
];
export function rateSource(id: unknown): RateSource | undefined {
  return allRateQuestionSources.find(source => source.questionId === id);
}
export function rateSeedCheck(seed: number): void {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw Error('Rate seed must be an unsigned 32-bit integer.');
}

// Permanent slots, independent of catalogue order. Never renumber or reuse.
const rateCodeSlots: Readonly<Record<string, number>> = {
  'RATE-POC-orders-L1': 1, 'RATE-POC-orders-L2': 2, 'RATE-POC-orders-L3': 3,
  'RATE-POC-graphs-L1': 4, 'RATE-POC-graphs-L2': 5, 'RATE-POC-graphs-L3': 6,
  'RATE-POC-arrhenius-L1': 10, 'RATE-POC-arrhenius-L2': 11, 'RATE-POC-arrhenius-L3': 12,
};
// Eight-character codec has its own permanent namespace. Never renumber these slots.
const expandedRateCodeSlots: Readonly<Record<string, number>> = {
  'RATE-EXP-orders-L1': 17, 'RATE-EXP-orders-L2': 18, 'RATE-EXP-orders-L3': 19,
  'RATE-EXP-graphs-L1': 33, 'RATE-EXP-graphs-L2': 34, 'RATE-EXP-graphs-L3': 35,
  'RATE-EXP-arrhenius-L1': 49, 'RATE-EXP-arrhenius-L2': 50, 'RATE-EXP-arrhenius-L3': 51,
  'RATE-NEW-orders-units-L1': 65,
  'RATE-NEW-orders-excess-L2': 68,
  'RATE-NEW-orders-three-L3': 69,
  'RATE-NEW-orders-ph-L3': 70,
  'RATE-NEW-orders-dilution-L3': 71,
  'RATE-NEW-graphs-shapes-L1': 81,
  'RATE-NEW-graphs-initial-L1': 82,
  'RATE-NEW-graphs-half-concentration-L1': 83,
  'RATE-NEW-graphs-deduce-L3': 84,
  'RATE-NEW-graphs-mixed-L3': 85,
  'RATE-NEW-arrhenius-temperature-L3': 97,
};
export const seededRateCodePattern = /^RE-(?:[0-9A-Z]{7}|[0-9A-Z]{8})$/i;
export function rateQuestionCode(questionId: string, seed: number): string {
  rateSeedCheck(seed);
  const expandedSlot = expandedRateCodeSlots[questionId];
  if (expandedSlot !== undefined) return `RE-${(seed * 256 + expandedSlot).toString(36).toUpperCase().padStart(8, '0')}`;
  const slot = rateCodeSlots[questionId];
  if (slot === undefined) throw Error('Not a generated rate question.');
  return `RE-${(seed * 16 + slot).toString(36).toUpperCase().padStart(7, '0')}`;
}
export function decodeRateQuestionCode(input: string) {
  const code = input.trim().toUpperCase();
  if (!seededRateCodePattern.test(code)) return null;
  const value = parseInt(code.slice(3), 36);
  const expanded = code.length === 11;
  const radix = expanded ? 256 : 16;
  const slots = expanded ? expandedRateCodeSlots : rateCodeSlots;
  const seed = Math.floor(value / radix);
  if (seed > 0xffffffff) return null;
  const questionId = Object.keys(slots).find(id => slots[id] === value % radix);
  const source = rateSource(questionId);
  return source ? { activityId: rateActivityId, questionId: source.questionId, level: source.level, seed } : null;
}
