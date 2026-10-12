import { formulaIdentity, formulaIdentities } from './identity.ts';
import { allowedPairs, ionBank, type AllowedPair } from './ions.ts';
import { parseChemicalFormula } from './notation.ts';
export function validateSeed(seed: number): void {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('Seed must be uint32');
}
export function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}
export function compound(pair: AllowedPair) {
  const cation = ionBank.find((i) => i.id === pair.cationId),
    anion = ionBank.find((i) => i.id === pair.anionId);
  if (!cation || !anion || cation.charge <= 0 || anion.charge >= 0)
    throw Error('Invalid allowed ion pair');
  const divisor = gcd(cation.charge, -anion.charge),
    cationCount = -anion.charge / divisor,
    anionCount = cation.charge / divisor;
  const term = (formula: string, polyatomic: boolean, n: number) =>
    (polyatomic && n > 1 ? '(' + formula + ')' : formula) + (n > 1 ? n : '');
  const formula =
    term(cation.formula, cation.polyatomic, cationCount) +
    term(anion.formula, anion.polyatomic, anionCount);
  const composition: Record<string, number> = {};
  for (const [ion, n] of [
    [cation, cationCount],
    [anion, anionCount],
  ] as const)
    for (const [atom, count] of Object.entries(ion.composition))
      composition[atom] = (composition[atom] ?? 0) + count * n;
  const parsed = parseChemicalFormula(formula);
  if (
    !parsed ||
    parsed.charge ||
    JSON.stringify(Object.entries(parsed.composition).sort()) !==
      JSON.stringify(Object.entries(composition).sort()) ||
    cationCount * cation.charge + anionCount * anion.charge !== 0
  )
    throw Error('Compound invariant failed');
  const charge = (n: number) => '^' + (Math.abs(n) === 1 ? '' : Math.abs(n)) + (n > 0 ? '+' : '-');
  return {
    pair,
    cation,
    anion,
    cationCount,
    anionCount,
    formula,
    composition,
    explanationLines: [
      cation.name.charAt(0).toUpperCase() +
        cation.name.slice(1) +
        ' is ' +
        cation.formula +
        charge(cation.charge) +
        ' and ' +
        anion.name +
        ' is ' +
        anion.formula +
        charge(anion.charge) +
        '.',
      'The lowest whole-number ion ratio is ' + cationCount + ':' + anionCount + '.',
      'Total positive and negative charge cancel.',
      (anion.polyatomic && anionCount > 1) || (cation.polyatomic && cationCount > 1)
        ? 'Put brackets around each repeated polyatomic ion.'
        : 'No polyatomic ion is repeated, so no brackets are needed.',
    ] as const,
  };
}
/** New codes identify a permanent pair; the reproducing seed belongs to QuestionRef. */
export function formulaCode(pairId: string, seed: number): string {
  validateSeed(seed);
  const identity = formulaIdentities.find((row) => row.sourceId === pairId);
  if (!identity) throw Error('Unknown pair');
  return identity.code;
}
export function decodeFormulaCode(code: string, requestedSeed?: number) {
  const identity = formulaIdentity(code, requestedSeed);
  const pair = allowedPairs.find((p) => p.id === identity.sourceId);
  if (!pair) throw Error('Unknown pair');
  return { seed: identity.seed, ...compound(pair) };
}
export function selectFormula(level: number, seed: number, previousIds: readonly string[]): string {
  validateSeed(seed);
  if (level !== 1 && level !== 2) throw Error('Formulae supports levels 1 and 2');
  const previous = previousIds.map((id) => decodeFormulaCode(id)),
    last = previous.at(-1);
  const candidates = allowedPairs.filter((p) => p.level === level && p.id !== last?.pair.id);
  let n = seed >>> 0;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  const pair = candidates[(n >>> 0) % candidates.length]!;
  return formulaCode(pair.id, seed);
}
