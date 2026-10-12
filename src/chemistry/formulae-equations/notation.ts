/** Case-sensitive chemical notation. No flattening of groups or ratios for marking. */
const subscripts = '₀₁₂₃₄₅₆₇₈₉';
const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const elements = new Set(
  'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(
    ' ',
  ),
);
export interface ParsedFormula {
  readonly normalized: string;
  readonly composition: Readonly<Record<string, number>>;
  readonly charge: number;
}
export function parseChemicalFormula(input: string): ParsedFormula | null {
  if (input.length > 200) return null;
  let value = input.trim().replace(/[₀-₉]/g, (c) => String(subscripts.indexOf(c)));
  value = value.replace(
    /([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/u,
    (_, n: string, sign: string) =>
      '^' + [...n].map((c) => superscripts.indexOf(c)).join('') + (sign === '⁺' ? '+' : '-'),
  );
  value = value.replace(/\s+/g, '').replace(/^([A-Z][a-z]?)([2-9])([+-])$/, '$1^$2$3');
  const chargeMatch = value.match(/(?:\^(\d*)([+-])|([+-]))$/);
  let charge = 0;
  if (chargeMatch) {
    const magnitude = chargeMatch[1] ? Number(chargeMatch[1]) : 1;
    if (!Number.isSafeInteger(magnitude) || magnitude < 1 || magnitude > 9) return null;
    charge = magnitude * ((chargeMatch[2] ?? chargeMatch[3]) === '+' ? 1 : -1);
    value = value.slice(0, -chargeMatch[0].length);
  }
  if (!value || !/^[A-Za-z0-9()]+$/.test(value)) return null;
  let pos = 0;
  const number = () => {
    const start = pos;
    while (/\d/.test(value[pos] ?? '') && pos < value.length) pos++;
    if (pos === start) return 1;
    const n = Number(value.slice(start, pos));
    return n >= 2 && n <= 999 && !value.slice(start, pos).startsWith('0') ? n : NaN;
  };
  const group = (nested: boolean): Record<string, number> | null => {
    const result: Record<string, number> = {};
    let terms = 0;
    while (pos < value.length && value[pos] !== ')') {
      let atomCounts: Record<string, number>;
      if (value[pos] === '(') {
        if (nested) return null;
        pos++;
        const inside = group(true);
        if (!inside || value[pos] !== ')') return null;
        pos++;
        atomCounts = inside;
      } else {
        const match = value.slice(pos).match(/^[A-Z][a-z]?/);
        if (!match || !elements.has(match[0])) return null;
        pos += match[0].length;
        atomCounts = { [match[0]]: 1 };
      }
      const n = number();
      if (!Number.isFinite(n)) return null;
      for (const [element, count] of Object.entries(atomCounts))
        result[element] = (result[element] ?? 0) + count * n;
      terms++;
    }
    return terms ? result : null;
  };
  const composition = group(false);
  if (!composition || pos !== value.length) return null;
  const suffix = charge
    ? '^' + (Math.abs(charge) === 1 ? '' : Math.abs(charge)) + (charge > 0 ? '+' : '-')
    : '';
  return { normalized: value + suffix, composition, charge };
}
export const normalizeChemicalFormula = (input: string): string | null =>
  parseChemicalFormula(input)?.normalized ?? null;
export interface EquationSpecies {
  readonly formula: string;
  readonly coefficient: number;
  readonly state?: 's' | 'l' | 'g' | 'aq';
}
export interface ParsedEquation {
  readonly reactants: readonly EquationSpecies[];
  readonly products: readonly EquationSpecies[];
  readonly normalized: string;
}
export function parseChemicalEquation(input: string): ParsedEquation | null {
  if (input.length > 1000) return null;
  const sides = input
    .trim()
    .replace(/⟶|⟹|→|⇒|=/g, '->')
    .split('->');
  if (sides.length !== 2) return null;
  const parseSide = (side: string): EquationSpecies[] | null => {
    const terms = side.split('+');
    const result: EquationSpecies[] = [];
    for (const term of terms) {
      const match = term.trim().match(/^(?:(\d+)\s*)?(.+?)(?:\s*\((s|l|g|aq)\))?$/);
      if (!match) return null;
      const coefficient = match[1] ? Number(match[1]) : 1;
      const parsed = parseChemicalFormula(match[2]!);
      if (
        !parsed ||
        parsed.charge ||
        !Number.isSafeInteger(coefficient) ||
        coefficient < 1 ||
        coefficient > 999
      )
        return null;
      const state = match[3] as EquationSpecies['state'];
      result.push({ formula: parsed.normalized, coefficient, ...(state ? { state } : {}) });
    }
    if (!result.length || new Set(result.map((s) => s.formula)).size !== result.length) return null;
    return result;
  };
  const reactants = parseSide(sides[0]!),
    products = parseSide(sides[1]!);
  if (!reactants || !products) return null;
  const key = (side: readonly EquationSpecies[]) =>
    side
      .map((s) => String(s.coefficient) + s.formula + (s.state ? '(' + s.state + ')' : ''))
      .sort()
      .join('+');
  return { reactants, products, normalized: key(reactants) + '->' + key(products) };
}
export const normalizeChemicalEquation = (input: string): string | null =>
  parseChemicalEquation(input)?.normalized ?? null;
/** Atom totals are computed from the parsed formulae, including repeated bracketed groups. */
export function equationAtomCounts(equation: string): readonly Readonly<{element: string; reactants: number; products: number}>[] | null {
  const parsed = parseChemicalEquation(equation);
  if (!parsed) return null;
  const counts = (side: readonly EquationSpecies[]) => {
    const out: Record<string, number> = {};
    for (const species of side) {
      const formula = parseChemicalFormula(species.formula)!;
      for (const [element, count] of Object.entries(formula.composition))
        out[element] = (out[element] ?? 0) + count * species.coefficient;
    }
    return out;
  };
  const reactants = counts(parsed.reactants), products = counts(parsed.products);
  return [...new Set([...Object.keys(reactants), ...Object.keys(products)])].map(element => ({
    element, reactants: reactants[element] ?? 0, products: products[element] ?? 0,
  }));
}
export function equationBalance(equation: string): boolean {
  const counts = equationAtomCounts(equation);
  return !!counts && counts.every(row => row.reactants === row.products);
}
