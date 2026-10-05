import type { Level, QuestionRef } from '../contracts/index.ts';
import { questionPrefixes } from '../content/canonical-identity.ts';
/** DEV-only reserved/synthetic context. Never registers a production template. */
export const developmentSlotCount = 64;
export const developmentRadix = 192;
export const developmentSeedCount = Math.floor(36 ** 6 / developmentRadix);
export const developmentMaximumSeed = developmentSeedCount - 1;
export const fixtureSlots = Object.freeze({
  numeric: 38, 'automatic-text': 39, 'self-rubric': 40, 'self-drawing': 41,
  choice: 42, 'choice-dropdown': 43, 'choice-multiple': 44, correction: 45,
  diagram: 46, editor: 47,
});
export function developmentSeed(entropy: number): number {
  if (!Number.isSafeInteger(entropy) || entropy < 0 || entropy > 0xffffffff)
    throw Error('Development selection entropy must be unsigned uint32.');
  return entropy % developmentSeedCount;
}
export function developmentCode(activityId: string, slot: number, level: number, seed: number): string {
  const prefix = questionPrefixes[activityId]?.[0];
  if (!prefix || !Number.isInteger(slot) || slot < 38 || slot >= developmentSlotCount ||
      ![1, 2, 3].includes(level) || !Number.isSafeInteger(seed) || seed < 0 || seed >= developmentSeedCount)
    throw Error('Unsupported development configuration or bounded seed.');
  const value = seed * developmentRadix + (level - 1) * developmentSlotCount + slot;
  return prefix + '-' + value.toString(36).toUpperCase().padStart(6, '0');
}
export function decodeDevelopmentCode(activityId: string, code: string) {
  const prefix = questionPrefixes[activityId]?.[0];
  const match = prefix && new RegExp('^' + prefix + '-([A-Z0-9]{6})$').exec(code);
  if (!match) throw Error('Invalid canonical development question code.');
  const value = parseInt(match[1]!, 36), seed = Math.floor(value / developmentRadix),
    configuration = value % developmentRadix, slot = configuration % developmentSlotCount,
    level = (Math.floor(configuration / developmentSlotCount) + 1) as Level;
  if (seed >= developmentSeedCount || slot < 38) throw Error('Unavailable development slot or seed.');
  return { slot, level, seed };
}
export function validateDevelopmentRef(ref: QuestionRef, slot: number): void {
  const actual = decodeDevelopmentCode(ref.activityId, ref.questionId);
  if (actual.slot !== slot || actual.level !== ref.level || actual.seed !== ref.seed)
    throw Error('Development code, configuration, level and seed disagree.');
}
