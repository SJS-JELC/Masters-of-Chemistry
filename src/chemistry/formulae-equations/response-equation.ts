import { parseChemicalFormula } from './notation.ts';
import {
  parseParenthesizedState,
  parsePositiveCoefficient,
  type Rational,
  type StateSymbol,
} from './answer-syntax.ts';
export interface ResponseEquationSpecies {
  readonly formula: string;
  /** null preserves recognizable formula/state criteria despite invalid coefficient syntax. */
  readonly coefficient: Rational | null;
  readonly state?: StateSymbol;
}
export interface ResponseEquation {
  readonly reactants: readonly ResponseEquationSpecies[];
  readonly products: readonly ResponseEquationSpecies[];
}
/** Response parser is separate from the unchanged conventional integer model/atom parser. */
export function parseResponseEquation(input: string): ResponseEquation | null {
  if (input.length > 1000) return null;
  const sides = input
    .trim()
    .replace(/⟶|⟹|→|⇒|=/g, '->')
    .split('->');
  if (sides.length !== 2) return null;
  const parseSide = (side: string): ResponseEquationSpecies[] | null => {
    const result: ResponseEquationSpecies[] = [];
    for (const raw of side.split('+')) {
      let term = raw.trim();
      const suffix = term.match(/\(\s*(?:s|l|g|aq)\s*\)\s*$/i);
      const state = suffix ? parseParenthesizedState(suffix[0]) : null;
      if (suffix) term = term.slice(0, -suffix[0].length).trim();
      // Coefficient prefixes have no chemical letters. Numeric-looking invalid syntax
      // may retain recognizable species; arbitrary expressions/ambiguous species do not.
      const prefix = term.match(/^[\d\s.\/−\-¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+(?:[eE][−\-]?\d+)?/u)?.[0] ?? '';
      const formula = parseChemicalFormula(term.slice(prefix.length));
      if (!formula || formula.charge) return null;
      result.push({
        formula: formula.normalized,
        coefficient: parsePositiveCoefficient(prefix, { blankIsOne: true }),
        ...(state ? { state } : {}),
      });
    }
    if (!result.length || new Set(result.map((s) => s.formula)).size !== result.length) return null;
    return result;
  };
  const reactants = parseSide(sides[0]!),
    products = parseSide(sides[1]!);
  return reactants && products ? { reactants, products } : null;
}
