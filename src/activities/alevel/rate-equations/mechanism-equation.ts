/** Bounded reader for the reviewed rate-mechanism species, independent of UI and the IGCSE parser. */
export type MechanismState = 'aq' | 's' | 'l' | 'g';
interface Species {
  readonly formula: string;
  readonly charge: number;
  readonly atoms: Readonly<Record<string, number>>;
  readonly states: readonly MechanismState[];
}
export const mechanismSpecies: Readonly<Record<string, Species>> = {
  NO2: { formula: 'NO2', charge: 0, atoms: { N: 1, O: 2 }, states: ['g'] },
  NO: { formula: 'NO', charge: 0, atoms: { N: 1, O: 1 }, states: ['g'] },
  NO3: { formula: 'NO3', charge: 0, atoms: { N: 1, O: 3 }, states: ['g'] },
  N2O4: { formula: 'N2O4', charge: 0, atoms: { N: 2, O: 4 }, states: ['g'] },
  N2: { formula: 'N2', charge: 0, atoms: { N: 2 }, states: ['g'] },
  O2: { formula: 'O2', charge: 0, atoms: { O: 2 }, states: ['g'] },
  CO: { formula: 'CO', charge: 0, atoms: { C: 1, O: 1 }, states: ['g'] },
  CO2: { formula: 'CO2', charge: 0, atoms: { C: 1, O: 2 }, states: ['g'] },
  F2: { formula: 'F2', charge: 0, atoms: { F: 2 }, states: ['g'] },
  F: { formula: 'F', charge: 0, atoms: { F: 1 }, states: ['g'] },
  NO2F: { formula: 'NO2F', charge: 0, atoms: { N: 1, O: 2, F: 1 }, states: ['g'] },
  'Fe3+': { formula: 'Fe', charge: 3, atoms: { Fe: 1 }, states: ['aq'] },
  'Fe2+': { formula: 'Fe', charge: 2, atoms: { Fe: 1 }, states: ['aq'] },
  'Fe+': { formula: 'Fe', charge: 1, atoms: { Fe: 1 }, states: ['aq'] },
  'I-': { formula: 'I', charge: -1, atoms: { I: 1 }, states: ['aq'] },
  'I2-': { formula: 'I2', charge: -1, atoms: { I: 2 }, states: ['aq'] },
  I2: { formula: 'I2', charge: 0, atoms: { I: 2 }, states: ['aq'] },
  '[FeI2]+': { formula: 'FeI2', charge: 1, atoms: { Fe: 1, I: 2 }, states: ['aq'] },
  'S2O3^2-': { formula: 'S2O3', charge: -2, atoms: { S: 2, O: 3 }, states: ['aq'] },
  'SO3^2-': { formula: 'SO3', charge: -2, atoms: { S: 1, O: 3 }, states: ['aq'] },
  'SO^2-': { formula: 'SO', charge: -2, atoms: { S: 1, O: 1 }, states: ['aq'] },
  'H+': { formula: 'H', charge: 1, atoms: { H: 1 }, states: ['aq'] },
  S: { formula: 'S', charge: 0, atoms: { S: 1 }, states: ['s'] },
  SO2: { formula: 'SO2', charge: 0, atoms: { S: 1, O: 2 }, states: ['g'] },
  H2O: { formula: 'H2O', charge: 0, atoms: { H: 2, O: 1 }, states: ['l'] },
};
export interface MechanismTerm {
  readonly species: string;
  readonly coefficient: number;
  readonly state?: MechanismState;
}
export interface MechanismEquation {
  readonly reactants: readonly MechanismTerm[];
  readonly products: readonly MechanismTerm[];
}
const add = (map: Record<string, number>, key: string, n: number) => { map[key] = (map[key] ?? 0) + n; };
const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function normalize(value: string): string {
  return value.replace(/[₀-₉]/g, c => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]/g, s => '^' + [...s.slice(0, -1)].map(c => superscripts.indexOf(c)).join('') + (s.endsWith('⁺') ? '+' : '-'))
    .replace(/−|–/g, '-').replace(/⟶|⟹|⇒|->|=>/g, '→');
}

/** Lex first, then resolve a complete formula/charge against the fixed catalogue.
 * A '+' immediately before another term is a separator; terminal '+' or '++' is an ionic charge.
 */
function readSide(side: string): readonly MechanismTerm[] | null {
  const terms: MechanismTerm[] = [];
  let rest = side.trim();
  while (rest && terms.length < 8) {
    const count = /^(\d+)\s*/.exec(rest);
    const coefficient = count ? Number(count[1]) : 1;
    if (!Number.isInteger(coefficient) || coefficient < 1 || coefficient > 6) return null;
    if (count) rest = rest.slice(count[0].length);
    const token = /^(\[(?:[A-Z][a-z]?\d*)+\]|(?:[A-Z][a-z]?\d*)+)/.exec(rest);
    if (!token) return null;
    let formula = token[0].replace(/[\[\]]/g, '');
    rest = rest.slice(token[0].length).trimStart();
    let charge = 0;
    const explicit = /^\^(\d*)([+-])/.exec(rest);
    if (explicit) {
      const magnitude = Number(explicit[1] || 1);
      if (!Number.isInteger(magnitude) || magnitude < 1 || magnitude > 6) return null;
      charge = magnitude * (explicit[2] === '+' ? 1 : -1);
      rest = rest.slice(explicit[0].length).trimStart();
    } else if (rest.startsWith('-') || (rest.startsWith('+') && /^(?:\+|\((?:aq|s|l|g)\)|$)/.test(rest.slice(1).trimStart()))) {
      const singleChargeKnown = Object.values(mechanismSpecies).some(s => s.formula === formula && s.charge === (rest[0] === '+' ? 1 : -1));
      const mono = singleChargeKnown ? null : /^([A-Z][a-z]?)(\d+)$/.exec(formula);
      charge = (mono ? Number(mono[2]) : 1) * (rest[0] === '+' ? 1 : -1);
      if (mono) formula = mono[1]!;
      rest = rest.slice(1).trimStart();
    }
    const stateMatch = /^\((aq|s|l|g)\)/.exec(rest);
    const state = stateMatch?.[1] as MechanismState | undefined;
    if (stateMatch) rest = rest.slice(stateMatch[0].length).trimStart();
    const resolved = Object.entries(mechanismSpecies).find(([, s]) => s.formula === formula && s.charge === charge);
    if (!resolved || (state && !resolved[1].states.includes(state))) return null;
    terms.push({ species: resolved[0], coefficient, ...(state ? { state } : {}) });
    if (!rest) return terms;
    if (!rest.startsWith('+')) return null;
    rest = rest.slice(1).trimStart();
    if (!rest) return null;
  }
  return null;
}
export function parseMechanismEquation(value: string): MechanismEquation | null {
  if (!value || value.length > 500) return null;
  const sides = normalize(value).split('→');
  if (sides.length !== 2) return null;
  const reactants = readSide(sides[0]!);
  const products = readSide(sides[1]!);
  if (!reactants || !products) return null;
  const equation = { reactants, products };
  return mechanismEquationBalanced(equation) ? equation : null;
}
const signature = (map: Readonly<Record<string, number>>) => JSON.stringify(Object.entries(map).filter(([, n]) => n).sort(([a], [b]) => a.localeCompare(b)));
export function mechanismSideCounts(side: readonly MechanismTerm[]): Readonly<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const term of side) add(result, term.species, term.coefficient);
  return result;
}
export function mechanismEquationBalanced(equation: MechanismEquation): boolean {
  const totals = [equation.reactants, equation.products].map(side => {
    const counts: Record<string, number> = {};
    for (const t of side) {
      const s = mechanismSpecies[t.species]!;
      add(counts, 'charge', s.charge * t.coefficient);
      for (const [element, count] of Object.entries(s.atoms)) add(counts, element, count * t.coefficient);
    }
    return signature(counts);
  });
  return totals[0] === totals[1];
}
export function sameMechanismEquation(a: MechanismEquation, b: MechanismEquation): boolean {
  return signature(mechanismSideCounts(a.reactants)) === signature(mechanismSideCounts(b.reactants))
    && signature(mechanismSideCounts(a.products)) === signature(mechanismSideCounts(b.products));
}
export function mechanismNet(steps: readonly MechanismEquation[]): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const step of steps) {
    for (const term of step.reactants) add(counts, term.species, -term.coefficient);
    for (const term of step.products) add(counts, term.species, term.coefficient);
  }
  return Object.fromEntries(Object.entries(counts).filter(([, n]) => n));
}
export function sameMechanismCounts(a: Readonly<Record<string, number>>, b: Readonly<Record<string, number>>): boolean {
  return signature(a) === signature(b);
}
