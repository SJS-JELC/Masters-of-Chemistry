import type { ContentBlock, QuestionPart, Responses } from '../../../contracts/question.ts';
import type { SourceReference } from '../../../contracts/identity.ts';
import type { RateFactory } from './types.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const formula = (value: string): ContentBlock => ({ kind: 'formula', text: value });
const sources: readonly SourceReference[] = [
  { path: 'resources/curriculum/ocr-a-level/a-level-specification-map.md', sha256: 'c5d6ad6eaab14b2eae37d3b4f8d5dc89985ef6ca8e99c05452074221f1c83784', symbolOrSection: 'U6 Teacher 1, Rate Equations; OCR 5.1.1(a–c)' },
  { path: 'resources/a-level-past-paper-atlas/data/aggregate.json', sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: 'OCR_2022_JUN_H432-01_Q16_P_A_II; OCR_2023_JUN_H432-01_Q17_P_A. Reasoning patterns; new abstract A/B data.' },
];
const base = (id: string, prompt: string) => ({ id, prompt: [text(prompt)], marks: 1, required: true, dependsOn: [] });
const choice = (id: string, prompt: string, options: readonly string[], accepted: number): QuestionPart => ({
  ...base(id, prompt), kind: 'choice', presentation: 'single',
  options: options.map((value, index) => ({ id: String(index), content: [formula(value)] })),
  acceptedOptionSets: [[String(accepted)]],
});
const numeric = (id: string, prompt: string, expected: number, unit = ''): QuestionPart => ({
  ...base(id, prompt), kind: 'numeric', unit,
  acceptance: { kind: 'relative', expected, relativeTolerance: 0.005, absoluteFloor: 1e-12 },
});
const typed = (id: string, prompt: string, accepted: string): QuestionPart => ({
  ...base(id, prompt), kind: 'text', accepted: [accepted], normalization: 'exact', presentation: 'single-line',
});
const shown = (value: number) => Number(value.toPrecision(8)).toString();
const exponent = (value: number) => String(value).replace(/[0-9]/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]!);
const power = (species: string, order: number) => order === 0 ? '' : `[${species}]${order === 1 ? '' : '²'}`;
const equation = (m: number, n: number) => `rate = k${power('A', m)}${power('B', n)}`;
const unitFor = (order: number) => [ 'mol dm⁻³ s⁻¹', 's⁻¹', 'dm³ mol⁻¹ s⁻¹', 'dm⁶ mol⁻² s⁻¹', 'dm⁹ mol⁻³ s⁻¹' ][order]!;

/** Initial-rate variants use unnamed reactants so changing order never changes a named reaction's chemistry. */
export const makeOrders: RateFactory = (level, seed) => {
  const variant = seed >>> 0;
  const a = 0.02 * (1 + variant % 4);
  const b = 0.04 * (1 + Math.floor(variant / 4) % 3);
  const k = 0.5 * (1 + Math.floor(variant / 12) % 5);
  const m = level === 1 ? variant % 3 : level === 2 ? 1 + variant % 2 : 2 - variant % 2;
  const n = level === 1 ? 0 : (1 + Math.floor(variant / 2)) % 3;
  const rate = k * a ** m * b ** n;
  const rows = level === 1
    ? [['1', shown(a), shown(rate)], ['2', shown(2 * a), shown(rate * 2 ** m)]]
    : level === 2
      ? [['1', shown(a), shown(b), shown(rate)], ['2', shown(2 * a), shown(b), shown(rate * 2 ** m)], ['3', shown(a), shown(2 * b), shown(rate * 2 ** n)]]
      : [['1', shown(a), shown(b), shown(rate)], ['2', shown(2 * a), shown(b), shown(rate * 2 ** m)], ['3', shown(3 * a), shown(2 * b), shown(rate * 3 ** m * 2 ** n)]];
  const parts: QuestionPart[] = [choice('order-a', 'Determine the order with respect to A.', ['0', '1', '2'], m)];
  const correctResponses: Record<string, Responses[string]> = { 'order-a': { kind: 'choice', selected: [String(m)] } };
  const workedAnswer: ContentBlock[] = [text(`Comparing experiments 1 and 2: [A] doubles while all other conditions are unchanged; rate changes by a factor of ${2 ** m}. The order with respect to A is ${m}.`)];
  if (level !== 1) {
    parts.push(choice('order-b', 'Determine the order with respect to B.', ['0', '1', '2'], n));
    parts.push(typed('rate-equation', 'Write the rate equation.', equation(m, n)));
    correctResponses['order-b'] = { kind: 'choice', selected: [String(n)] };
    correctResponses['rate-equation'] = { kind: 'text', value: equation(m, n) };
    workedAnswer.push(text(level === 2
      ? `Comparing experiments 1 and 3: [B] doubles at constant [A]; rate changes by ${2 ** n}. The order with respect to B is ${n}.`
      : `Comparing experiments 1 and 3: [A] triples and [B] doubles; rate changes by ${3 ** m * 2 ** n}. Divide that factor by the known A factor ${3 ** m}, leaving a factor of ${2 ** n} caused by doubling [B]. The order with respect to B is ${n}.`));
    workedAnswer.push(formula(equation(m, n)));
    if (level === 2) {
      parts.push(numeric('k', 'Calculate the numerical value of k.', k));
      parts.push(typed('k-units', 'Write the units of k.', unitFor(m + n)));
      correctResponses.k = { kind: 'numeric', raw: shown(k), unit: '' };
      correctResponses['k-units'] = { kind: 'text', value: unitFor(m + n) };
      workedAnswer.push(text(`k = rate / ([A]${exponent(m)} × [B]${exponent(n)})\n   = ${shown(rate)} / (${shown(a)}${exponent(m)} × ${shown(b)}${exponent(n)})\n   = ${shown(k)} ${unitFor(m + n)}.`));
    } else {
      const predictedRate = rate * 3 ** m * 0.5 ** n;
      parts.push(numeric('predicted-rate', `Predict the initial rate when [A] = ${shown(3 * a)} mol dm⁻³ and [B] = ${shown(b / 2)} mol dm⁻³ at the same temperature.`, predictedRate, 'mol dm⁻³ s⁻¹'));
      correctResponses['predicted-rate'] = { kind: 'numeric', raw: shown(predictedRate), unit: 'mol dm⁻³ s⁻¹' };
      workedAnswer.push(text(`Relative to experiment 1, [A] is multiplied by 3 and [B] by 1/2. New rate = ${shown(rate)} × 3${exponent(m)} × (1/2)${exponent(n)} = ${shown(predictedRate)} mol dm⁻³ s⁻¹.`));
    }
  }
  return {
    gem: 'orders',
    question: {
      ref: { activityId: 'alevel/acid-base-calculations', questionId: `RATE-POC-orders-L${level}`, seed, level },
      title: level === 1 ? 'Deduce an order from initial rates' : level === 2 ? 'Orders, rate equation and rate constant' : 'Simultaneous changes and a rate prediction',
      context: [text('Initial rates for a reaction between A and B are measured at constant temperature; only the listed concentrations vary.'),
        { kind: 'table', headers: level === 1 ? ['Experiment', '[A] / mol dm⁻³', 'Initial rate / mol dm⁻³ s⁻¹'] : ['Experiment', '[A] / mol dm⁻³', '[B] / mol dm⁻³', 'Initial rate / mol dm⁻³ s⁻¹'], rows },
        ...(level === 1 ? [text('[B] is held at the same concentration in both experiments.')] : [])],
      layout: 'multipart', submission: 'all-required-parts', parts,
      scaffolds: [],
      hints: [], workedAnswer, sources,
    },
    correctResponses,
    validation: { specification: ['5.1.1(a)', '5.1.1(b)', ...(level === 2 ? ['5.1.1(c)'] : [])], m, n, k, a, b, rate, rows, seeded: true, numericalTolerance: '0.5% relative; full generated values retained', chemistryReview: 'Orders inferred by varying concentrations, including B for zero-order variants; no excess-reactant inference. Named chemical identities are not assigned variable orders.' },
  };
};
