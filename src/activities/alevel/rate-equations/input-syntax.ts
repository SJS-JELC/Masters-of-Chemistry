/** Bounded rate syntax: products of known concentration factors or SI-style unit factors. */
export type RateInputMode = 'rate-law' | 'units';
const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const subscripts = '₀₁₂₃₄₅₆₇₈₉';
const asciiSuperscripts = (value: string) => value.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, c => c === '⁻' ? '-' : c === '⁺' ? '+' : String(superscripts.indexOf(c)));
const asciiSubscripts = (value: string) => value.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, c => String(subscripts.indexOf(c)));
type Powers = Readonly<Record<string, number>>;
/** Ion charge belongs inside a concentration bracket; reaction order belongs outside it. */
function speciesKey(input: string): string | null {
  const unicodeCharge = /([⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻])$/.exec(input);
  if (unicodeCharge) {
    const formula = asciiSubscripts(input.slice(0, -unicodeCharge[0].length));
    if (!/^[A-Za-z0-9]+$/.test(formula)) return null;
    return formula + '|' + asciiSuperscripts(unicodeCharge[0]);
  }
  const ascii = asciiSubscripts(input).replace(/−/g, '-');
  const explicitCharge = /^([A-Za-z0-9]+)\^(\d*[+-])$/.exec(ascii);
  if (explicitCharge) return explicitCharge[1] + '|' + explicitCharge[2];
  const atomicCharge = /^([A-Z][a-z]?)(\d+)([+-])$/.exec(ascii);
  if (atomicCharge) return atomicCharge[1] + '|' + atomicCharge[2] + atomicCharge[3];
  const singleCharge = /^([A-Za-z0-9]+)([+-])$/.exec(ascii);
  if (singleCharge) return singleCharge[1] + '|' + singleCharge[2];
  return /^[A-Za-z0-9]+$/.test(ascii) ? ascii : null;
}

function exponent(input: string): { power: number; consumed: number } | null {
  // Omission means a power of one. Explicit ASCII/caret/unicode powers are integral.
  const value = asciiSuperscripts(input).replace(/−/g, '-');
  if (!/^[\^+\-\d]/.test(value)) return { power: 1, consumed: 0 };
  const match = /^(?:\^\(([+-]?\d+)\)|\^\{([+-]?\d+)\}|\^?([+-]?\d+))/.exec(value);
  if (!match) return null;
  const power = Number(match[1] ?? match[2] ?? match[3]);
  return Number.isSafeInteger(power) ? { power, consumed: match[0].length } : null;
}
const separator = /^[\s*×·]+/;

export function parseRateLaw(input: string, allowedSpecies: readonly string[]): Powers | null {
  let rest = input.trim();
  if (rest.startsWith('rate')) {
    const prefix = /^rate\s*=\s*/.exec(rest);
    if (!prefix) return null;
    rest = rest.slice(prefix[0].length);
  }
  const powers: Record<string, number> = Object.fromEntries(allowedSpecies.map(species => [species, 0]));
  let sawK = false;
  let count = 0;
  while (rest.length) {
    const gap = separator.exec(rest)?.[0] ?? '';
    if (gap) {
      if ((gap.match(/[*×·]/g)?.length ?? 0) > 1) return null;
      if (!count && /[*×·]/.test(gap)) return null;
      rest = rest.slice(gap.length);
      if (!rest) return /[*×·]/.test(gap) || !sawK ? null : powers;
    }
    if (rest.startsWith('k')) {
      if (sawK) return null;
      sawK = true;
      rest = rest.slice(1);
      if (++count > 8) return null;
      continue;
    }
    const factor = /^\[([^\[\]\s]+)\]/.exec(rest);
    if (!factor) return null;
    const key = speciesKey(factor[1]!);
    const species = allowedSpecies.find(candidate => key !== null && speciesKey(candidate) === key);
    if (!species) return null; // Unknown zero powers are still invalid.
    rest = rest.slice(factor[0].length);
    const exp = exponent(rest);
    if (!exp || exp.power < 0 || exp.power > 2) return null;
    powers[species] = (powers[species] ?? 0) + exp.power;
    if (powers[species]! > 2) return null;
    rest = rest.slice(exp.consumed);
    if (++count > 8) return null;
  }
  return sawK ? powers : null;
}

export function parseRateUnits(input: string): Powers | null {
  let rest = input.trim();
  const powers: Record<string, number> = { dm: 0, mol: 0, s: 0 };
  let count = 0;
  while (rest.length) {
    const factor = /^(dm|mol|s)/.exec(rest);
    if (!factor) return null;
    const unit = factor[1]!;
    rest = rest.slice(factor[0].length);
    const exp = exponent(rest);
    if (!exp || Math.abs(exp.power) > 9) return null;
    powers[unit] = (powers[unit] ?? 0) + exp.power;
    if (Math.abs(powers[unit]!) > 12) return null;
    rest = rest.slice(exp.consumed);
    const gap = separator.exec(rest)?.[0] ?? '';
    if (gap) {
      if ((gap.match(/[*×·]/g)?.length ?? 0) > 1) return null;
      rest = rest.slice(gap.length);
      if (!rest && /[*×·]/.test(gap)) return null;
    }
    if (++count > 8) return null;
  }
  return count ? powers : null;
}

function samePowers(a: Powers | null, b: Powers | null): boolean {
  return a !== null && b !== null && Object.keys(b).every(key => a[key] === b[key]);
}
export const equivalentRateLaw = (input: string, expected: string, allowedSpecies: readonly string[]) => samePowers(parseRateLaw(input, allowedSpecies), parseRateLaw(expected, allowedSpecies));
export const equivalentRateUnits = (input: string, expected: string) => samePowers(parseRateUnits(input), parseRateUnits(expected));

/** Formatting retains partial tokens. Boundary mapping preserves caret/selection when a caret is removed. */
export function formatRateInput(value: string, mode: RateInputMode, start = value.length, end = start): { value: string; start: number; end: number } {
  let result = '';
  let bracket = false;
  let inExponent = false;
  const boundaries = [0];
  for (let index = 0; index < value.length; index++) {
    const char = value[index]!;
    let emitted = char;
    if (mode === 'rate-law' && char === '[') { bracket = true; inExponent = false; }
    else if (mode === 'rate-law' && char === ']') { bracket = false; inExponent = true; }
    else if (bracket) {
      const opening = value.lastIndexOf('[', index);
      const closing = value.indexOf(']', opening);
      const token = value.slice(opening + 1, closing < 0 ? value.length : closing);
      const ascii = asciiSubscripts(token);
      const explicit = ascii.indexOf('^');
      const atomic = /^([A-Z][a-z]?)([0-9]+)([+\-−])$/.exec(ascii);
      const chargeStart = explicit >= 0 ? explicit : atomic ? atomic[1]!.length : -1;
      const relative = index - opening - 1;
      const digit = asciiSubscripts(char);
      if (chargeStart >= 0 && relative >= chargeStart) {
        if (char === '^') emitted = '';
        else if (/^[0-9]$/.test(digit)) emitted = superscripts[Number(digit)]!;
        else if (char === '+') emitted = '⁺';
        else if (/[-−]/.test(char)) emitted = '⁻';
      } else if (/^[0-9]$/.test(digit)) emitted = subscripts[Number(digit)]!;
      else if (char === '+') emitted = '⁺';
      else if (/[-−]/.test(char)) emitted = '⁻';
    }
    else if (!bracket) {
      if (mode === 'units' && /[A-Za-z]/.test(char)) inExponent = true;
      if (inExponent && char === '^' && /^[+\-−⁺⁻]?[0-9⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(value.slice(index + 1))) emitted = '';
      else if (inExponent && /[0-9]/.test(char)) emitted = superscripts[Number(char)]!;
      else if (inExponent && /[-−]/.test(char)) emitted = '⁻';
      else if (inExponent && char === '+') emitted = '⁺';
      else if (!/[\s\^(){}⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/.test(char) && !(mode === 'units' && /[A-Za-z]/.test(char))) inExponent = false;
    }
    result += emitted;
    boundaries.push(result.length);
  }
  return { value: result, start: boundaries[Math.max(0, Math.min(start, value.length))]!, end: boundaries[Math.max(0, Math.min(end, value.length))]! };
}
