export type ChemicalEntryMode = 'formula' | 'equation';
export interface NotationRun {
  readonly text: string;
  readonly subscript: boolean;
  readonly superscript?: boolean;
}
const subscripts = '₀₁₂₃₄₅₆₇₈₉';

/** Keep parser-compatible digits; arrows shorten by one character, including before a caret. */
export function normalizeChemicalEntry(value: string, mode: ChemicalEntryMode) {
  const digits = value.replace(/[₀-₉]/g, (digit) => String(subscripts.indexOf(digit)));
  return mode === 'equation' ? digits.replace(/->/g, '→') : digits;
}
export function chemicalSelectionOffset(value: string, offset: number, mode: ChemicalEntryMode) {
  return normalizeChemicalEntry(value.slice(0, offset), mode).length;
}

/** Coefficients stay on the baseline; formula counts and ionic charges use distinct runs. */
export function chemicalNotationRuns(
  value: string,
  mode: ChemicalEntryMode,
  normalizeArrows = true,
): readonly NotationRun[] {
  const text = normalizeChemicalEntry(value, normalizeArrows ? mode : 'formula');
  const charge = new Set<number>();
  // Unicode charges are unambiguous, as are caret charges and monatomic ion suffixes.
  for (const match of text.matchAll(
    /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+|\^\d*[+−-]|\b[A-Z][a-z]?(\d*[+−-])(?=\s|$|[),])/g,
  )) {
    const suffix = match[1] ?? match[0];
    const start = match.index! + match[0].length - suffix.length;
    for (let i = start; i < start + suffix.length; i++) charge.add(i);
  }
  // A terminal +/- on a polyatomic formula is a unit charge (NH4+, OH-).
  for (const match of text.matchAll(/(?:[A-Z][a-z]?\d*|\([^)]*\)\d*)+([+−-])(?=\s|$|[),])/g))
    charge.add(match.index! + match[0].length - 1);
  const runs: { text: string; subscript: boolean; superscript?: boolean }[] = [];
  let numericSuffix = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (char === '^' && charge.has(i)) continue;
    const digit = /[0-9]/.test(char);
    if (digit && !/[0-9]/.test(text[i - 1] ?? ''))
      numericSuffix = mode === 'formula' || /[A-Za-z)\]]/.test(text[i - 1] ?? '');
    const superscript = charge.has(i);
    const subscript = digit && numericSuffix && !superscript;
    const previous = runs.at(-1);
    if (previous?.subscript === subscript && Boolean(previous?.superscript) === superscript)
      previous.text += char;
    else runs.push({ text: char, subscript, ...(superscript ? { superscript: true } : {}) });
  }
  return runs;
}

/** Select chemical tokens only; ordinary prose numerals and ratio/count explanations stay baseline. */
export function chemicalProseRuns(value: string): readonly NotationRun[] {
  const text = value.replace(/->/g, '→');
  const runs: NotationRun[] = [];
  const token =
    /(?:[A-Z][a-z]?(?:[0-9₀-₉]*)|\((?:[A-Z][a-z]?[0-9₀-₉]*)+\)[0-9₀-₉]*)+(?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+|\^\d*[+−-]|[+−-])?(?:\((?:s|l|g|aq)\))?/g;
  let end = 0;
  for (const match of text.matchAll(token)) {
    const start = match.index!;
    if (
      /[A-Za-z]/.test(text[start - 1] ?? '') ||
      /[A-Za-z]/.test(text[start + match[0].length] ?? '')
    )
      continue;
    if (start > end) runs.push({ text: text.slice(end, start), subscript: false });
    runs.push(...chemicalNotationRuns(match[0], 'equation'));
    end = start + match[0].length;
  }
  if (end < text.length) runs.push({ text: text.slice(end), subscript: false });
  return runs;
}
