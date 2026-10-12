/** Derived exact arithmetic only. Never persist bigint values in learner responses. */
export interface Rational {
  readonly numerator: bigint;
  readonly denominator: bigint;
}
export type StateSymbol = 's' | 'l' | 'g' | 'aq';
const unicodeFractions: Readonly<Record<string, readonly [bigint, bigint]>> = {
  '¼': [1n, 4n],
  '½': [1n, 2n],
  '¾': [3n, 4n],
  '⅐': [1n, 7n],
  '⅑': [1n, 9n],
  '⅒': [1n, 10n],
  '⅓': [1n, 3n],
  '⅔': [2n, 3n],
  '⅕': [1n, 5n],
  '⅖': [2n, 5n],
  '⅗': [3n, 5n],
  '⅘': [4n, 5n],
  '⅙': [1n, 6n],
  '⅚': [5n, 6n],
  '⅛': [1n, 8n],
  '⅜': [3n, 8n],
  '⅝': [5n, 8n],
  '⅞': [7n, 8n],
};
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
function reduced(numerator: bigint, denominator: bigint): Rational | null {
  if (numerator <= 0n || denominator <= 0n) return null;
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}
/** Unsigned integers, finite decimal notation, integer fractions or one vulgar fraction. */
export function parsePositiveCoefficient(
  raw: string,
  options: Readonly<{ blankIsOne?: boolean }> = {},
): Rational | null {
  if (raw.length > 128) return null;
  const value = raw.trim();
  if (!value) return options.blankIsOne ? { numerator: 1n, denominator: 1n } : null;
  if ((value.match(/\d/g) ?? []).length > 64) return null;
  const unicode = unicodeFractions[value];
  if (unicode) return reduced(unicode[0], unicode[1]);
  const fraction = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) return reduced(BigInt(fraction[1]!), BigInt(fraction[2]!));
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return null;
  const [whole, decimal] = value.split('.');
  return decimal === undefined
    ? reduced(BigInt(whole!), 1n)
    : reduced(BigInt((whole || '0') + decimal), 10n ** BigInt(decimal.length));
}
/** Complete round brackets are part of the learner answer; bare old symbols stay invalid. */
export function parseParenthesizedState(raw: string): StateSymbol | null {
  return (
    (raw.match(/^\s*\(\s*(s|l|g|aq)\s*\)\s*$/i)?.[1]?.toLowerCase() as StateSymbol | undefined) ??
    null
  );
}
export function rationalEquals(a: Rational, b: Rational): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}
/** One positive common scale earns all balancing credit, using exact cross products. */
export function proportionalCoefficientVectors(
  actual: readonly Rational[],
  expected: readonly Rational[],
): boolean {
  if (!actual.length || actual.length !== expected.length) return false;
  const a0 = actual[0]!,
    e0 = expected[0]!;
  return actual.every((a, i) => {
    const e = expected[i]!;
    return (
      a.numerator > 0n &&
      a.denominator > 0n &&
      e.numerator > 0n &&
      e.denominator > 0n &&
      a.numerator * e.denominator * a0.denominator * e0.numerator ===
        a.denominator * e.numerator * a0.numerator * e0.denominator
    );
  });
}
