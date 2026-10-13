import type { ContentBlock, QuestionPart, Responses } from '../../../contracts/question.ts';
import { makeOrders } from './orders.ts';
import type { RateFactory } from './types.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const formula = (value: string): ContentBlock => ({ kind: 'formula', text: value });
const sources = makeOrders(1, 0).question.sources;
const base = (id: string, prompt: string) => ({ id, prompt: [text(prompt)], marks: 1, required: true, dependsOn: [] });
const choice = (id: string, prompt: string, accepted: number): QuestionPart => ({
  ...base(id, prompt), kind: 'choice', presentation: 'single',
  options: ['0', '1', '2'].map((value, index) => ({ id: String(index), content: [formula(value)] })),
  acceptedOptionSets: [[String(accepted)]],
});
const numeric = (id: string, prompt: string, expected: number, unit = ''): QuestionPart => ({
  ...base(id, prompt), kind: 'numeric', unit,
  acceptance: { kind: 'relative', expected, relativeTolerance: 0.005, absoluteFloor: 1e-12 },
});
const typed = (id: string, prompt: string, accepted: string): QuestionPart => ({
  ...base(id, prompt), kind: 'text', accepted: [accepted], normalization: 'exact', presentation: 'single-line',
});
const shown = (value: number) => Number(value.toPrecision(10)).toString();
const exponent = (value: number) => String(value).replace(/[0-9]/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]!);
const power = (species: string, order: number) => order === 0 ? '' : `[${species}]${order === 1 ? '' : '²'}`;
const equation = (m: number, n: number) => `rate = k${power('A', m)}${power('B', n)}`;
const unitFor = (order: number) => ['mol dm⁻³ s⁻¹', 's⁻¹', 'dm³ mol⁻¹ s⁻¹', 'dm⁶ mol⁻² s⁻¹', 'dm⁹ mol⁻³ s⁻¹'][order]!;

// The two independent ten-value concentration axes give 100 bounded contexts.
// Separate short cycles vary k, orders and readable concentration ratios.
const aValues = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.06] as const;
const bValues = [0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15] as const;
const kValues = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5] as const;
const comparisonFactors = [2, 3, 4] as const;
const predictionAFactors = [1.5, 2, 3] as const;
const predictionBFactors = [0.5, 0.25, 2] as const;

/** Expanded initial-rate data retain anonymous A/B: no named chemistry acquires invented orders. */
export const makeExpandedOrders: RateFactory = (level, seed) => {
  if (![1, 2, 3].includes(level)) throw new Error('Unsupported expanded orders level.');
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Expanded orders require a uint32 seed.');
  const variantIndex = seed % 100;
  const column = variantIndex % 10;
  const row = Math.floor(variantIndex / 10);
  const a = aValues[column]!;
  const b = bValues[row]!;
  const k = kValues[(row + 3 * column) % kValues.length]!;
  const m = level === 1 ? variantIndex % 3 : 1 + Math.floor(variantIndex / 3) % 2;
  const n = level === 1 ? 0 : Math.floor(variantIndex / 6) % 3;
  const aFactor = comparisonFactors[Math.floor(variantIndex / 3) % 3]!;
  const bFactor = comparisonFactors[Math.floor(variantIndex / 9) % 3]!;
  const simultaneousAFactor = comparisonFactors[Math.floor(variantIndex / 5) % 3]!;
  const predictionAFactor = predictionAFactors[Math.floor(variantIndex / 7) % 3]!;
  const predictionBFactor = predictionBFactors[Math.floor(variantIndex / 11) % 3]!;
  const rate = k * a ** m * b ** n;
  const rows = level === 1
    ? [['1', shown(a), shown(rate)], ['2', shown(aFactor * a), shown(rate * aFactor ** m)]]
    : [
      ['1', shown(a), shown(b), shown(rate)],
      ['2', shown(aFactor * a), shown(b), shown(rate * aFactor ** m)],
      ['3', shown(level === 2 ? a : simultaneousAFactor * a), shown(bFactor * b), shown(rate * (level === 2 ? 1 : simultaneousAFactor ** m) * bFactor ** n)],
    ];
  const parts: QuestionPart[] = [choice('order-a', 'Determine the order with respect to A.', m)];
  const correctResponses: Record<string, Responses[string]> = { 'order-a': { kind: 'choice', selected: [String(m)] } };
  const workedAnswer: ContentBlock[] = [text(`Comparing experiments 1 and 2: [A] changes by a factor of ${aFactor} while all other conditions are unchanged; rate changes by a factor of ${aFactor ** m}. The order with respect to A is ${m}.`)];
  let predictedRate: number | undefined;
  if (level !== 1) {
    parts.push(choice('order-b', 'Determine the order with respect to B.', n));
    parts.push(typed('rate-equation', 'Write the rate equation.', equation(m, n)));
    correctResponses['order-b'] = { kind: 'choice', selected: [String(n)] };
    correctResponses['rate-equation'] = { kind: 'text', value: equation(m, n) };
    workedAnswer.push(text(level === 2
      ? `Comparing experiments 1 and 3: [B] changes by a factor of ${bFactor} at constant [A]; rate changes by ${bFactor ** n}. The order with respect to B is ${n}.`
      : `Comparing experiments 1 and 3: [A] changes by a factor of ${simultaneousAFactor} and [B] by ${bFactor}; rate changes by ${simultaneousAFactor ** m * bFactor ** n}. Divide that factor by the known A factor ${simultaneousAFactor ** m}, leaving a factor of ${bFactor ** n} caused by the change in [B]. The order with respect to B is ${n}.`));
    workedAnswer.push(formula(equation(m, n)));
    if (level === 2) {
      parts.push(numeric('k', 'Calculate the numerical value of k.', k));
      parts.push(typed('k-units', 'Write the units of k.', unitFor(m + n)));
      correctResponses.k = { kind: 'numeric', raw: shown(k), unit: '' };
      correctResponses['k-units'] = { kind: 'text', value: unitFor(m + n) };
      workedAnswer.push(text(`k = rate / ([A]${exponent(m)} × [B]${exponent(n)})\n   = ${shown(rate)} / (${shown(a)}${exponent(m)} × ${shown(b)}${exponent(n)})\n   = ${shown(k)} ${unitFor(m + n)}.`));
    } else {
      predictedRate = rate * predictionAFactor ** m * predictionBFactor ** n;
      parts.push(numeric('predicted-rate', `Predict the initial rate when [A] = ${shown(predictionAFactor * a)} mol dm⁻³ and [B] = ${shown(predictionBFactor * b)} mol dm⁻³ at the same temperature.`, predictedRate, 'mol dm⁻³ s⁻¹'));
      correctResponses['predicted-rate'] = { kind: 'numeric', raw: shown(predictedRate), unit: 'mol dm⁻³ s⁻¹' };
      workedAnswer.push(text(`Relative to experiment 1, [A] is multiplied by ${predictionAFactor} and [B] by ${predictionBFactor}. New rate = ${shown(rate)} × ${predictionAFactor}${exponent(m)} × (${predictionBFactor})${exponent(n)} = ${shown(predictedRate)} mol dm⁻³ s⁻¹.`));
    }
  }
  return {
    gem: 'orders',
    question: {
      ref: { activityId: 'alevel/rate-equations', questionId: `RATE-EXP-orders-L${level}`, seed, level },
      title: level === 1 ? 'Deduce an order from initial rates' : level === 2 ? 'Orders, rate equation and rate constant' : 'Simultaneous changes and a rate prediction',
      context: [text('Initial rates for a reaction between A and B are measured at constant temperature; only the listed concentrations vary.'),
        { kind: 'table', headers: level === 1 ? ['Experiment', '[A] / mol dm⁻³', 'Initial rate / mol dm⁻³ s⁻¹'] : ['Experiment', '[A] / mol dm⁻³', '[B] / mol dm⁻³', 'Initial rate / mol dm⁻³ s⁻¹'], rows },
        ...(level === 1 ? [text('[B] is held at the same concentration in both experiments.')] : [])],
      layout: 'multipart', submission: 'all-required-parts', parts,
      scaffolds: [], hints: [], workedAnswer, sources,
    },
    correctResponses,
    validation: {
      specification: ['5.1.1(a)', '5.1.1(b)', ...(level === 2 ? ['5.1.1(c)'] : [])],
      variantIndex, variantCount: 100, m, n, k, a, b, rate, rows,
      aFactor, bFactor, simultaneousAFactor, predictionAFactor, predictionBFactor,
      ...(predictedRate === undefined ? {} : { predictedRate }),
      seeded: true, numericalTolerance: '0.5% relative; table values displayed to 10 significant figures',
      chemistryReview: 'Orders inferred from controlled initial-rate comparisons; zero-order B is tested by changing B, not by an excess-reactant claim. A/B are abstract reactants. Units follow rate divided by concentration raised to total order.',
    },
  };
};
