import { formulaIdentity, equationIdentity } from '../chemistry/formulae-equations/identity.ts';
import fixedIds from './canonical-fixed-ids.json' with { type: 'json' };

export const canonicalQuestionPattern = /^[A-Z]{2,3}-[A-Z0-9]{6}$/;
export const questionPrefixes: Readonly<Record<string, readonly string[]>> = {
  'alevel/acid-base-calculations': ['AB'],
  'alevel/electrons-bonding': ['EB'],
  'alevel/explaining-properties': ['EBP'],
  'alevel/electron-configurations': ['EC', 'ECB'],
  'alevel/dot-and-cross': ['DAC'],
  'alevel/ph-titration-curves': ['TC'],
  'igcse/calorimetry': ['CAL'],
  'igcse/bond-enthalpy': ['BE'],
  'igcse/structure-and-bonding': ['SBC'],
  'igcse/dot-and-cross': ['DC'],
  'igcse/energy-enthalpy': ['EE'],
  'igcse/energetics-practical': ['EP'],
};
export function isCanonicalQuestionId(activityId: string, id: unknown): id is string {
  // Exactly the twelve retained source IDs; keep the provider's metadata lazy.
  if (activityId === 'alevel/rate-equations')
    return typeof id === 'string' && /^RATE-POC-(orders|graphs|mechanisms|arrhenius)-L[123]$/.test(id);
  if (activityId === 'igcse/formulae') {
    if (typeof id !== 'string') return false;
    try { formulaIdentity(id); return true; } catch { return false; }
  }
  if (activityId === 'igcse/equations') {
    if (typeof id !== 'string') return false;
    try { equationIdentity(id); return true; } catch { return false; }
  }
  return (
    typeof id === 'string' &&
    canonicalQuestionPattern.test(id) &&
    !!questionPrefixes[activityId]?.includes(id.split('-')[0]!)
  );
}
export function validatePreviousQuestionIds(activityId: string, ids: readonly string[]): void {
  if (!Array.isArray(ids) || ids.some((id) => !isCanonicalQuestionId(activityId, id)))
    throw Error('Previous question IDs must use this activity’s canonical prefix and format.');
}
type FixedPrefix = keyof typeof fixedIds;
/** Permanent source provenance mapping. Permanent assignments are append-only; alias handling is explicit in activity identity helpers. */
export function fixedIdentity(prefix: FixedPrefix) {
  const forward: Readonly<Record<string, string>> = fixedIds[prefix];
  const reverse = new Map(Object.entries(forward).map(([sourceId, code]) => [code, sourceId]));
  if (
    reverse.size !== Object.keys(forward).length ||
    [...reverse.keys()].some((code) => !canonicalQuestionPattern.test(code))
  )
    throw Error('Invalid permanent fixed question mapping: ' + prefix);
  return {
    code(sourceId: string): string {
      const code = forward[sourceId];
      if (!code) throw Error('Unknown source provenance: ' + sourceId);
      return code;
    },
    sourceId(code: string): string {
      const source = reverse.get(code);
      if (!source) throw Error('Unknown canonical question code: ' + code);
      return source;
    },
    codes: Object.freeze([...reverse.keys()]),
  };
}
