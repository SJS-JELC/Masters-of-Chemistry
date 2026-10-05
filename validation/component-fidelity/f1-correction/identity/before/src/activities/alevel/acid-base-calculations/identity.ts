import type { Level } from '../../../contracts/index.ts';
/** Permanent configuration indices, independent of provider/display order. Never reorder. */
export const acidTemplateIds = [
  'base-mass-concentration-dilution',
  'base-purity',
  'buffer-after-addition',
  'buffer-component-ratio',
  'buffer-direct',
  'buffer-mixed-volumes',
  'buffer-partial-target-alkali',
  'buffer-recipe-deviation',
  'buffer-salt-amount',
  'buffer-salt-mass',
  'buffer-salt-stock-volume',
  'buffer-target-volume-stocks',
  'dihydroxide-direct',
  'excess-strong-base',
  'h-to-ph',
  'partial-buffer-ka',
  'partial-buffer-moles',
  'partial-buffer-solutions',
  'ph-to-h',
  'strong-acid-dilution',
  'strong-acid-direct',
  'strong-acid-neutralisation',
  'strong-acid-preparation',
  'strong-base-direct',
  'strong-base-mass',
  'temperature-base',
  'water-ph-from-kw',
  'weak-acid-amount',
  'weak-acid-concentration-ph',
  'weak-acid-percent',
  'weak-acid-ph-ka',
  'weak-acid-ph-pka',
  'weak-acid-pka-concentration',
  'weak-acid-pka-ph',
  'weak-acid-preparation-ka',
  'weak-acid-purity',
  'weak-acid-reverse-concentration',
  'weak-acid-target-mass',
] as const;
export const acidCodeCapacity = 36 ** 6;
export const acidConfigurationRadix = acidTemplateIds.length * 3;
export const acidSeedCount = Math.floor(acidCodeCapacity / acidConfigurationRadix);
export const acidMaximumSeed = acidSeedCount - 1;
export function boundedAcidSeed(entropy: number): number {
  if (!Number.isSafeInteger(entropy) || entropy < 0 || entropy > 0xffffffff)
    throw Error('Selection entropy must be unsigned uint32.');
  return entropy % acidSeedCount;
}
export function acidCode(templateId: string, level: number, seed: number): string {
  const config = (acidTemplateIds as readonly string[]).indexOf(templateId);
  if (
    config < 0 ||
    ![1, 2, 3].includes(level) ||
    !Number.isSafeInteger(seed) ||
    seed < 0 ||
    seed >= acidSeedCount
  )
    throw Error('Unsupported acid configuration or bounded seed.');
  const value = seed * acidConfigurationRadix + (level - 1) * acidTemplateIds.length + config;
  return 'AB-' + value.toString(36).toUpperCase().padStart(6, '0');
}
export function decodeAcidCode(code: string): { templateId: string; level: Level; seed: number } {
  const match = /^AB-([0-9A-Z]{6})$/.exec(code);
  if (!match) throw Error('Invalid canonical acid question code.');
  const value = parseInt(match[1]!, 36),
    seed = Math.floor(value / acidConfigurationRadix);
  if (seed >= acidSeedCount) throw Error('Acid code is outside the bounded seed space.');
  const configuration = value % acidConfigurationRadix;
  return {
    templateId: acidTemplateIds[configuration % acidTemplateIds.length]!,
    level: (Math.floor(configuration / acidTemplateIds.length) + 1) as Level,
    seed,
  };
}
