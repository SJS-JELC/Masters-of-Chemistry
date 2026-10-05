import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../../../..'),here=import.meta.dirname,before=JSON.parse(fs.readFileSync(path.join(here,'before-manifest.json'),'utf8'));
for(const f of ['src/foundation/ActivityHost.tsx','src/persistence/alpha-namespace.ts']){const dest=path.join(here,'before',f);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,f),dest);before.files.push({path:f,sha256:crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex')});}
fs.writeFileSync(path.join(here,'before-manifest.json'),JSON.stringify(before,null,2));
const old=fs.readFileSync(path.join(root,'src/activities/alevel/acid-base-calculations/identity.ts'),'utf8'),rows=[...old.matchAll(/^  '([^']+)'/gm)].map(m=>m[1]);
const output=`import type { Level } from '../../../contracts/index.ts';
/** Explicit permanent slots. Assign future templates only to unused slots; never renumber. */
export const acidTemplateSlots: Readonly<Record<string, number>> = Object.freeze(${JSON.stringify(Object.fromEntries(rows.map((id,index)=>[id,index])),null,2)});
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
`;
fs.writeFileSync(path.join(root,'src/activities/alevel/acid-base-calculations/identity.ts'),output);
