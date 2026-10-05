import type { Level } from '../../../contracts/index.ts';
/** Explicit permanent slots. Assign future templates only to unused slots; never renumber. */
export const acidTemplateSlots: Readonly<Record<string, number>> = Object.freeze({
  "base-mass-concentration-dilution": 0,
  "base-purity": 1,
  "buffer-after-addition": 2,
  "buffer-component-ratio": 3,
  "buffer-direct": 4,
  "buffer-mixed-volumes": 5,
  "buffer-partial-target-alkali": 6,
  "buffer-recipe-deviation": 7,
  "buffer-salt-amount": 8,
  "buffer-salt-mass": 9,
  "buffer-salt-stock-volume": 10,
  "buffer-target-volume-stocks": 11,
  "dihydroxide-direct": 12,
  "excess-strong-base": 13,
  "h-to-ph": 14,
  "partial-buffer-ka": 15,
  "partial-buffer-moles": 16,
  "partial-buffer-solutions": 17,
  "ph-to-h": 18,
  "strong-acid-dilution": 19,
  "strong-acid-direct": 20,
  "strong-acid-neutralisation": 21,
  "strong-acid-preparation": 22,
  "strong-base-direct": 23,
  "strong-base-mass": 24,
  "temperature-base": 25,
  "water-ph-from-kw": 26,
  "weak-acid-amount": 27,
  "weak-acid-concentration-ph": 28,
  "weak-acid-percent": 29,
  "weak-acid-ph-ka": 30,
  "weak-acid-ph-pka": 31,
  "weak-acid-pka-concentration": 32,
  "weak-acid-pka-ph": 33,
  "weak-acid-preparation-ka": 34,
  "weak-acid-purity": 35,
  "weak-acid-reverse-concentration": 36,
  "weak-acid-target-mass": 37
});
export const acidTemplateIds = Object.freeze(Object.keys(acidTemplateSlots));
export const acidTemplateSlotCount = 64;
export const acidConfigurationRadix = 192;
export const acidCodeCapacity = 36 ** 6;
export const acidSeedCount = Math.floor(acidCodeCapacity / acidConfigurationRadix);
export const acidMaximumSeed = acidSeedCount - 1;
export function boundedAcidSeed(entropy: number): number {
  if (!Number.isSafeInteger(entropy) || entropy < 0 || entropy > 0xffffffff)
    throw Error('Selection entropy must be unsigned uint32.');
  return entropy % acidSeedCount;
}
/** This same factory handles the current map and future reserved-slot registrations. */
export function createAcidCodec(templateSlots: Readonly<Record<string, number>>) {
  const forward = new Map(Object.entries(templateSlots));
  const reverse = new Map<number, string>();
  for (const [template, slot] of forward) {
    if (!template || !Number.isInteger(slot) || slot < 0 || slot >= acidTemplateSlotCount || reverse.has(slot))
      throw Error('Invalid permanent acid template slot.');
    reverse.set(slot, template);
  }
  return {
    encode(templateId: string, level: number, seed: number): string {
      const slot = forward.get(templateId);
      if (slot === undefined || ![1, 2, 3].includes(level) || !Number.isSafeInteger(seed) || seed < 0 || seed >= acidSeedCount)
        throw Error('Unsupported acid configuration or bounded seed.');
      const value = seed * acidConfigurationRadix + (level - 1) * acidTemplateSlotCount + slot;
      return 'AB-' + value.toString(36).toUpperCase().padStart(6, '0');
    },
    decode(code: string): { templateId: string; level: Level; seed: number } {
      const match = /^AB-([0-9A-Z]{6})$/.exec(code);
      if (!match) throw Error('Invalid canonical acid question code.');
      const value = parseInt(match[1]!, 36), seed = Math.floor(value / acidConfigurationRadix);
      if (seed >= acidSeedCount) throw Error('Acid code is outside the bounded seed space.');
      const configuration = value % acidConfigurationRadix;
      const templateId = reverse.get(configuration % acidTemplateSlotCount);
      if (!templateId) throw Error('Acid code uses a reserved template slot.');
      return { templateId, level: (Math.floor(configuration / acidTemplateSlotCount) + 1) as Level, seed };
    },
  };
}
const currentCodec = createAcidCodec(acidTemplateSlots);
export const acidCode = currentCodec.encode;
export const decodeAcidCode = currentCodec.decode;
