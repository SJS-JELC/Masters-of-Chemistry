import type { RecallEntry } from '../contracts/recall.ts';
export type RecallNotationToken = Readonly<{
  raw: string;
  display: string;
  position: 'normal' | 'sub' | 'sup' | 'hidden';
}>;
const sub: Readonly<Record<string, string>> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  n: 'ₙ',
  '+': '₊',
  '-': '₋',
};
const sup: Readonly<Record<string, string>> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
};
/** Formatting derives solely from declared field notation and raw character positions. */
export function recallNotationTokens(
  raw: string,
  entry: RecallEntry,
): readonly RecallNotationToken[] {
  let digits = 0,
    explicitCharge = false;
  return Array.from(raw).map((char) => {
    const c = char.normalize('NFKC').replace(/−/g, '-');
    let position: RecallNotationToken['position'] = 'normal';
    if (entry.kind === 'general-formula' && /[n0-9+-]/.test(c)) position = 'sub';
    if (entry.kind === 'chemical-formula') {
      if (entry.notation === 'molecular' && /\d/.test(c)) position = 'sub';
      if (entry.notation === 'ion') {
        if (c === '^') {
          explicitCharge = true;
          position = 'hidden';
        } else if (/[+-]/.test(c)) position = 'sup';
        else if (/\d/.test(c)) {
          position = explicitCharge || digits >= entry.atomCountDigits ? 'sup' : 'sub';
          digits++;
        }
      }
    }
    return {
      raw: char,
      position,
      display:
        position === 'hidden'
          ? ''
          : position === 'sub'
            ? (sub[c] ?? char)
            : position === 'sup'
              ? (sup[c] ?? char)
              : char,
    };
  });
}
export function recallNotationText(raw: string, entry: RecallEntry): string {
  return recallNotationTokens(raw, entry)
    .map((t) => t.display)
    .join('');
}
export function recallEntryAcceptsRaw(raw: string, entry: RecallEntry): boolean {
  if (entry.kind === 'numeric') return /^[\d./]*$/.test(raw);
  if (entry.kind === 'signed-charge') return /^[\d+−\-]*$/.test(raw);
  return true;
}
