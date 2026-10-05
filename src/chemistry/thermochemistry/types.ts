export type CalculationBlock =
  | { type: 'text'; text: string }
  | {
      type: 'math';
      role?: string;
      rows: readonly (readonly [string, string | { fraction: readonly [string, string] }])[];
    };
export interface NumericalResponse {
  key: string;
  symbol: string;
  unit: string;
  expected: number;
  accessibleLabel: string;
}
export interface CalorimetryExample {
  id: string;
  setup: 'solution' | 'combustion';
  group: string;
  name: string;
  sign: number;
  nominalDh: number;
  basis: string;
  massRoutes: readonly string[];
  amountRoutes: readonly string[];
  equation?: string;
}
export interface CalorimetryConfig {
  setup: string;
  example: string;
  difficulty: number;
  target: string;
  massRoute: string;
  amountRoute: string;
  temperatureRoute: string;
  structure: string;
}
export interface CalorimetryResult {
  seed: number;
  difficulty: 1 | 2 | 3;
  example: CalorimetryExample;
  config: CalorimetryConfig;
  rows: readonly (readonly string[])[];
  diagram: string;
  intro: string;
  parts: readonly string[];
  responses: readonly NumericalResponse[];
  answerParts: readonly (readonly CalculationBlock[])[];
  structure: string;
  values: {
    mass: number;
    initial: number;
    final: number;
    deltaT: number;
    q: number;
    qReported: number;
    qInKj: number;
    n: number | null;
    nReported: number | null;
    dh: number | null;
    dhReported: number | null;
  };
  labels: { group: string; target: string };
}
export interface BondInventory {
  bond: string;
  count: number;
  energy: number;
  subtotal: number;
}
export interface BondReaction {
  id: string;
  name: string;
  equation: string;
  description: string;
  svg: string;
  allowedLevels: readonly number[];
  broken: readonly BondInventory[];
  made: readonly BondInventory[];
  bondTable: readonly { bond: string; energy: number; required: boolean }[];
  brokenTotal: number;
  madeTotal: number;
  deltaH: number;
}
export interface BondResult {
  seed: number;
  difficulty: 1 | 2 | 3;
  reaction: BondReaction;
  questionType: 'enthalpy-change' | 'unknown-bond';
  unknownBond: null | { bond: string; count: number; energy: number; side: 'broken' | 'made' };
  bondTable: readonly { bond: string; energy: number | null; required: boolean }[];
  parts: readonly string[];
  responses: readonly NumericalResponse[];
  answerParts: readonly (readonly CalculationBlock[])[];
}
