import type { ContentBlock, QuestionPart, Response, Responses } from '../../../contracts/question.ts';
import type { Level, SourceReference } from '../../../contracts/identity.ts';
import type { RateExample, RateFactory } from './types.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const formula = (value: string): ContentBlock => ({ kind: 'formula', text: value });
const shown = (value: number) => Number(value.toPrecision(10)).toString();
const rateUnit = 'mol dm⁻³ s⁻¹';
const concentrationUnit = 'mol dm⁻³';
const units = ['mol dm⁻³ s⁻¹', 's⁻¹', 'dm³ mol⁻¹ s⁻¹', 'dm⁶ mol⁻² s⁻¹', 'dm⁹ mol⁻³ s⁻¹'] as const;
const sourceIds = {
  units: 'OCR_2020_OCT_H432-01_Q10',
  excess: 'OCR_2020_OCT_H432-01_Q20_P_A_I',
  three: 'OCR_2023_JUN_H432-01_Q17_P_A',
  ph: 'OCR_2019_JUN_H432-03_Q01_P_E',
  dilution: 'OCR_2023_JUN_H432-03_Q02_P_B',
} as const;
function sources(id: string): readonly SourceReference[] {
  return [
    { path: 'resources/curriculum/ocr-a-level/a-level-specification-map.md', sha256: 'c5d6ad6eaab14b2eae37d3b4f8d5dc89985ef6ca8e99c05452074221f1c83784', symbolOrSection: `U6 Teacher 1; OCR 5.1.1(a–c).${id === sourceIds.ph || id === sourceIds.dilution ? ' pH applications also use 5.1.3(d), (f)(i).' : ''}` },
    { path: 'resources/a-level-past-paper-atlas/data/aggregate.json', sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: `${id}; adapted question format, not a transcription. Anonymous reactant data are new illustrative data.` },
  ];
}
const base = (id: string, prompt: string) => ({ id, prompt: [text(prompt)], marks: 1, required: true, dependsOn: [] });
const choice = (id: string, prompt: string, values: readonly string[], correct: string): QuestionPart => ({
  ...base(id, prompt), kind: 'choice', presentation: 'single',
  options: values.map((value, index) => ({ id: String(index), content: [text(value)] })),
  acceptedOptionSets: [[String(values.indexOf(correct))]],
});
const numeric = (id: string, prompt: string, expected: number, unit = ''): QuestionPart => ({
  ...base(id, prompt), kind: 'numeric', unit,
  acceptance: { kind: 'relative', expected, relativeTolerance: 0.005, absoluteFloor: 1e-12 },
});
const typed = (id: string, prompt: string, expected: string): QuestionPart => ({
  ...base(id, prompt), kind: 'text', accepted: [expected], normalization: 'exact', presentation: 'single-line',
});
/** Correct option IDs are resolved after ordering; no position encodes correctness. */
function rotate<T>(values: readonly T[], offset: number): T[] {
  const start = offset % values.length;
  return [...values.slice(start), ...values.slice(0, start)];
}
function responses(parts: readonly QuestionPart[]): Responses {
  return Object.fromEntries(parts.map(part => {
    let answer: Response;
    if (part.kind === 'choice') answer = { kind: 'choice', selected: part.acceptedOptionSets[0]! };
    else if (part.kind === 'numeric' && part.acceptance.kind === 'relative') answer = { kind: 'numeric', raw: shown(part.acceptance.expected), unit: part.unit };
    else if (part.kind === 'text') answer = { kind: 'text', value: part.accepted[0]! };
    else throw Error('New orders use automatically marked standard parts only.');
    return [part.id, answer];
  }));
}
function check(level: Level, expected: Level, seed: number): number {
  if (level !== expected) throw Error(`This orders format requires level ${expected}.`);
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw Error('New orders require a uint32 seed.');
  return seed % 100;
}
function example(id: string, level: Level, seed: number, title: string, context: ContentBlock[], parts: QuestionPart[], workedAnswer: ContentBlock[], sourceId: string, validation: RateExample['validation']): RateExample {
  return {
    gem: 'orders',
    question: { ref: { activityId: 'alevel/rate-equations', questionId: id, level, seed }, title, context, parts,
      layout: 'multipart', submission: 'all-required-parts', scaffolds: [], hints: [], workedAnswer, sources: sources(sourceId) },
    correctResponses: responses(parts),
    validation: { specification: ['5.1.1(a)', '5.1.1(b)', '5.1.1(c)'], sourceId, ...validation },
  };
}
const orderChoice = (id: string, species: string, order: number) => choice(id, `Determine the order with respect to ${species}.`, ['0', '1', '2'], String(order));
const lawFactor = (species: string, order: number) => order === 0 ? '' : `[${species}]${order === 2 ? '²' : ''}`;
const law = (orders: readonly number[]) => `rate = k${orders.map((order, index) => lawFactor(['A', 'B', 'C'][index]!, order)).join('')}`;
const table = (rows: readonly (readonly string[])[], three = false): ContentBlock => ({ kind: 'table',
  headers: ['Experiment', '[A] / mol dm⁻³', '[B] / mol dm⁻³', ...(three ? ['[C] / mol dm⁻³'] : []), 'Initial rate / mol dm⁻³ s⁻¹'], rows });
// Independent decimal concentration axes produce 100 different visible tables.
const concentrationsA = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05, 0.06] as const;
const concentrationsB = [0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15] as const;

const makeUnits: RateFactory = (level, seed) => {
  check(level, 1, seed);
  const overall = seed % units.length;
  const parts = [choice('overall-order', 'What is the overall order of this reaction?', ['0', '1', '2', '3', '4'], String(overall))];
  return example('RATE-NEW-orders-units-L1', level, seed, 'Overall order from the units of k',
    [text('All concentrations are measured in mol dm⁻³ and the reaction rate in mol dm⁻³ s⁻¹.'), formula(`Units of k: ${units[overall]}`)], parts,
    [text(`For overall order n, units of k are (mol dm⁻³)^(1 − n) s⁻¹. These units give n = ${overall}.`)], sourceIds.units,
    { specification: ['5.1.1(a)', '5.1.1(c)'], learningObjectives: ['Infer overall order from the dimensions of the rate constant.'], variantIndex: overall, variantCount: 5, overallOrder: overall, chemistryReview: 'Fixed dimensional-analysis pool for orders 0–4; no stoichiometry is used to infer order.' });
};

const excessPool = [
  {
    context: 'A student studies how the rate of the acid-catalysed reaction between ethanoic acid and methanol depends on [CH₃COOH]. Methanol is used in a large excess and temperature is held constant.',
    reason: 'The concentration of methanol changes by a negligible proportion during the measurements.',
    conclusion: 'This experiment alone cannot establish the true order with respect to methanol.',
  },
  {
    context: 'In an investigation of ethanoic acid reacting with a large excess of methanol at constant temperature, [CH₃OH] is effectively constant while [CH₃COOH] falls.',
    reason: 'The methanol concentration term can be included in an effective rate constant for this experiment.',
    conclusion: 'Methanol concentration must be varied separately to determine its true order.',
  },
] as const;
const makeExcess: RateFactory = (level, seed) => {
  check(level, 2, seed);
  const v = seed % excessPool.length, item = excessPool[v]!;
  const reasons = [item.reason, 'Methanol has no effect on rate because excess automatically proves zero order.', 'A large excess forces ethanoic acid to have first order.', 'It ensures methanol concentration decreases by the same fraction as ethanoic acid concentration.'];
  const conclusions = [item.conclusion, 'The true order in methanol must be zero.', 'The true order in methanol must be one.', 'The true order in methanol equals its stoichiometric coefficient.'];
  const parts = [choice('excess-reason', 'Select the useful kinetic reason for using a large excess of methanol.', rotate(reasons, v), item.reason),
    choice('excess-conclusion', 'What can validly be concluded about the true order in methanol?', rotate(conclusions, v + 1), item.conclusion)];
  return example('RATE-NEW-orders-excess-L2', level, seed, 'Large excess and the apparent rate law', [text(item.context)], parts,
    [text('Only a negligible fraction of the excess methanol is consumed, so its concentration is approximately constant. Its concentration factor is absorbed into an effective constant. This does not demonstrate that its true reaction order is zero: independently vary [CH₃OH] to investigate that order.')], sourceIds.excess,
    { specification: ['5.1.1(a)', '5.1.1(b)'], learningObjectives: ['Identify how excess reactant keeps its concentration approximately constant.', 'Distinguish a constant concentration term from evidence of intrinsic zero order.'], variantIndex: v, variantCount: excessPool.length, chemistryReview: 'The source mark scheme permits zero-order language for the excess experiment; this adaptation deliberately distinguishes an effectively constant term from the intrinsic order, without claiming the source assessed that added distinction.' });
};

const threeOrders = [[1, 1, 2], [2, 1, 1], [1, 0, 2], [2, 0, 1], [1, 2, 1], [1, 1, 1], [2, 1, 0]] as const;
const makeThree: RateFactory = (level, seed) => {
  const v = check(level, 3, seed), column = v % 10, row = Math.floor(v / 10);
  const a = concentrationsA[column]!, b = concentrationsB[row]!, c = 0.01 + (v % 5) * 0.005;
  const orders = threeOrders[v % threeOrders.length]!, [m, n, p] = orders;
  const k = 0.5 + (row + 2 * column) / 4;
  const aFactor = [3, 2, 4][Math.floor(v / 7) % 3]!;
  const simultaneousAFactor = [2, 3][Math.floor(v / 5) % 2]!;
  const bFactor = [0.5, 0.25][Math.floor(v / 11) % 2]!;
  const cFactor = [5, 2, 3][Math.floor(v / 13) % 3]!;
  const rate = k * a ** m * b ** n * c ** p;
  const rows = [
    ['1', shown(a), shown(b), shown(c), shown(rate)],
    ['2', shown(a * aFactor), shown(b), shown(c), shown(rate * aFactor ** m)],
    ['3', shown(a * simultaneousAFactor), shown(b * bFactor), shown(c), shown(rate * simultaneousAFactor ** m * bFactor ** n)],
    ['4', shown(a), shown(b * bFactor), shown(c * cFactor), shown(rate * bFactor ** n * cFactor ** p)],
  ];
  const overall = m + n + p;
  const parts = [orderChoice('order-a', 'A', m), orderChoice('order-b', 'B', n), orderChoice('order-c', 'C', p),
    typed('rate-equation', 'Write the rate equation.', law(orders)), numeric('k', 'Calculate the numerical value of k.', k), typed('k-units', 'Write the units of k.', units[overall]!)];
  return example('RATE-NEW-orders-three-L3', level, seed, 'Three reactants with simultaneous concentration changes',
    [text('Initial rates for an illustrative reaction between A, B and C are measured at the same temperature. Only the listed concentrations change.'), table(rows, true)], parts,
    [text(`Experiments 1→2 isolate A: concentration factor ${aFactor}, rate factor ${aFactor ** m}, so order ${m}.`),
      text(`Experiments 1→3 change A and B. Divide the rate factor ${shown(simultaneousAFactor ** m * bFactor ** n)} by ${simultaneousAFactor ** m} for A; B gives ${shown(bFactor ** n)} for concentration factor ${bFactor}, so order ${n}.`),
      text(`Experiments 1→4 change B and C. Remove B's factor ${shown(bFactor ** n)}; the remaining factor ${cFactor ** p} for C corresponds to order ${p}.`),
      formula(law(orders)), text(`Using experiment 1: k = ${shown(rate)} / (${shown(a)}^${m} × ${shown(b)}^${n} × ${shown(c)}^${p}) = ${shown(k)} ${units[overall]}.`)], sourceIds.three,
    { learningObjectives: ['Deduce three reactant orders from controlled and simultaneous concentration changes.', 'Write the rate law and calculate k with its units.'], variantIndex: v, variantCount: 100, chemistryReview: 'A controlled first comparison supplies A order, followed by two independent simultaneous-change equations for B then C. Each species has order 0–2; total order is bounded at 4. No named bromine reaction is assigned variable orders.' });
};

const initialRates = [0.00024, 0.00036, 0.00048, 0.0006, 0.00072, 0.00084, 0.00096, 0.0012, 0.0018, 0.0024] as const;
const makePh: RateFactory = (level, seed) => {
  const v = check(level, 3, seed), column = v % 10, row = Math.floor(v / 10);
  const initialPh = 1 + row * 0.1;
  const finalPh = initialPh + [0.5, 1, 1.5, 2, 2.5][row % 5]!;
  const initialRate = initialRates[column]!;
  const initialH = 10 ** -initialPh, finalH = 10 ** -finalPh;
  const factor = finalH / initialH, newRate = initialRate * factor;
  const parts = [numeric('initial-h', 'Calculate [H⁺] at the initial pH.', initialH, concentrationUnit),
    numeric('final-h', 'Calculate [H⁺] at the new pH.', finalH, concentrationUnit),
    numeric('concentration-factor', 'Calculate the concentration factor [H⁺]new ÷ [H⁺]initial.', factor),
    numeric('predicted-rate', 'Calculate the initial rate at the new pH.', newRate, rateUnit)];
  return example('RATE-NEW-orders-ph-L3', level, seed, 'A pH change and a first-order rate',
    [text('A reaction is first order with respect to H⁺. All other reactant concentrations and temperature remain unchanged.'),
      { kind: 'table', headers: ['Condition', 'pH', 'Initial rate / mol dm⁻³ s⁻¹'], rows: [['Initial', initialPh.toFixed(2), shown(initialRate)], ['New', finalPh.toFixed(2), 'To be calculated']] }], parts,
    [text(`[H⁺]initial = 10^−${initialPh.toFixed(2)} = ${shown(initialH)} mol dm⁻³; [H⁺]new = 10^−${finalPh.toFixed(2)} = ${shown(finalH)} mol dm⁻³.`),
      text(`First order: new rate = ${shown(initialRate)} × (${shown(finalH)} / ${shown(initialH)}) = ${shown(newRate)} ${rateUnit}.`)], sourceIds.ph,
    { variantIndex: v, variantCount: 100, specification: ['5.1.1(c)', '5.1.3(d)'], learningObjectives: ['Convert pH to hydrogen-ion concentration.', 'Predict a first-order rate from a pH change while other conditions are fixed.'], chemistryReview: 'pH converted through [H+] = 10^−pH. Other concentrations and temperature held fixed; first-order law is supplied, never inferred from pH.' });
};

const acidConcentrations = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.68, 0.75, 0.8, 1] as const;
const makeDilution: RateFactory = (level, seed) => {
  const v = check(level, 3, seed), column = v % 10, row = Math.floor(v / 10);
  const initialConcentration = acidConcentrations[column]!, finalPh = 1.2 + row * 0.2;
  const initialRate = initialRates[(column + 3 * row) % 10]!;
  const finalConcentration = 10 ** -finalPh, factor = finalConcentration / initialConcentration;
  const newRate = initialRate * factor;
  const parts = [numeric('diluted-concentration', 'Calculate the HCl concentration of the diluted acid.', finalConcentration, concentrationUnit),
    numeric('concentration-factor', 'Calculate the concentration factor [HCl]diluted ÷ [HCl]original.', factor),
    numeric('predicted-rate', 'Determine the initial rate using the diluted acid.', newRate, rateUnit)];
  return example('RATE-NEW-orders-dilution-L3', level, seed, 'Diluted strong acid and the reaction rate',
    [text('A reaction is first order with respect to HCl(aq). Treat hydrochloric acid as a fully dissociated monoprotic strong acid, so [HCl] = [H⁺].'),
      { kind: 'table', headers: ['Acid sample', '[HCl] / mol dm⁻³', 'pH', 'Initial rate / mol dm⁻³ s⁻¹'], rows: [['Original', shown(initialConcentration), 'Not needed', shown(initialRate)], ['Diluted with water', 'To be calculated', finalPh.toFixed(2), 'To be calculated']] },
      text('The same volume of acid is used in each otherwise identical reaction mixture. All other reactant concentrations, total reaction volume and temperature are held unchanged.')], parts,
    [text(`Diluted [HCl] = [H⁺] = 10^−${finalPh.toFixed(2)} = ${shown(finalConcentration)} mol dm⁻³.`),
      text(`The concentration factor is ${shown(finalConcentration)} / ${shown(initialConcentration)} = ${shown(factor)}. First order: new rate = ${shown(initialRate)} × ${shown(factor)} = ${shown(newRate)} ${rateUnit}.`)], sourceIds.dilution,
    { variantIndex: v, variantCount: 100, specification: ['5.1.1(c)', '5.1.3(d)', '5.1.3(f)(i)'], learningObjectives: ['Obtain diluted strong-acid concentration from pH.', 'Use the diluted/original concentration ratio to predict a first-order rate.'], chemistryReview: 'All cases are actual dilutions; strong monoprotic dissociation and matched reaction mixing are explicit. The rate factor equals the stock acid concentration ratio because identical mixing dilutes both samples by the same amount.' });
};

export const newOrderFactories: Readonly<Record<string, RateFactory>> = {
  'RATE-NEW-orders-units-L1': makeUnits,
  'RATE-NEW-orders-excess-L2': makeExcess,
  'RATE-NEW-orders-three-L3': makeThree,
  'RATE-NEW-orders-ph-L3': makePh,
  'RATE-NEW-orders-dilution-L3': makeDilution,
};
