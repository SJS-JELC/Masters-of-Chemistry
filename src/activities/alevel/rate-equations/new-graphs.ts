import type { ContentBlock, Question, QuestionPart, Responses } from '../../../contracts/question.ts';
import type { Level } from '../../../contracts/identity.ts';
import type { CurveGraph, RateFactory, StaticRatePlot } from './types.ts';
import { tangentGeometry } from './tangent-geometry.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const fmt = (value: number) => {
  if (value !== 0 && (Math.abs(value) < 0.001 || Math.abs(value) >= 10000)) {
    const [coefficient, exponent] = value.toExponential(5).split('e');
    const power = String(Number(exponent)).replace(/[-0-9]/g, c => c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!);
    return `${Number(coefficient)} × 10${power}`;
  }
  return Number(value.toPrecision(6)).toString();
};
const sourceRoot = 'resources/a-level-past-paper-atlas/';
const packets = {
  shapes: [
    ['OCR_2017_JUN_H432-01_Q06-Q10', 'e74d408796290b1c5811ea52d5788ff02f60e710e9852bc346b965142909bd02', 'Q10; QP packet p4, MS p6: zero-order concentration–time'],
    ['OCR_2018_JUN_H432-01_Q06-Q10', '2943e88f00e63f2493b018228100af2b1a2e120fa7a8de507139ab3326931f15', 'Q8; QP packet p3, MS p6: first-order rate–concentration'],
    ['OCR_2024_JUN_H432-01_Q06-Q10', '5698ac38005959000945e7c1b1cb42972058425f2ba7a08036b56f48533a1c09', 'Q10; QP packet p3, MS p5: zero-order rate–concentration'],
  ],
  initial: [['OCR_2024_JUN_H432-01_Q17', 'fde19074d892ffafe5b88a84e690b9e1c605ce2bf51d362c03a9b2596627da84', 'Q17(b); QP packet pp2–3, MS pp7–11: tangent rate; adapted to t = 0']],
  'half-concentration': [['OCR_2023_JUN_H432-01_Q06-Q10', '0c36b4469b2b688b1035dbcd9c69ea2e2208cf47c76cd95ecb47fec208e8b449', 'Q7; QP packet p2, MS p5: initial concentration and first-order half-life']],
  deduce: [['OCR_2024_JUN_H432-01_Q17', 'fde19074d892ffafe5b88a84e690b9e1c605ce2bf51d362c03a9b2596627da84', 'Q17(b); QP packet pp2–3, MS pp7–11: deduce order, tangent rate and k']],
  mixed: [['OCR_2025_JUN_H432-03_Q03', '5904091f47151490508d5acbd6e3e880243740d63bf3346b3fa36e9c1eac206d', 'Q3(b); QP packet pp3–4, MS pp7–9: mixed representations and multi-step inference']],
} as const;
type Format = keyof typeof packets;
function sources(format: Format): Question['sources'] {
  return [
    { path: `${sourceRoot}run2/specification-evidence/sections.json`, sha256: 'b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a', symbolOrSection: 'OCR Chemistry A 5.1.1(b–g,i); retained 2016 specification archive, current map 3.1 May 2026; reviewed 13 October 2026' },
    { path: `${sourceRoot}data/aggregate.json`, sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: `Accepted Run 2 records; ${format}; new authored questions, not copied numerical data` },
    ...packets[format].map(([id, sha256, symbolOrSection]) => ({ path: `${sourceRoot}packets/${id}.pdf`, sha256, symbolOrSection })),
  ];
}
function configuration(level: Level, seed: number, expectedLevel: Level) {
  if (level !== expectedLevel || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new RangeError('New rate graph format requires its registered level and a uint32 seed.');
  return { index: seed % 100, a: seed % 10, b: Math.floor((seed % 100) / 10) };
}
function numeric(id: string, prompt: string, expected: number, unit: string, marks = 1): QuestionPart {
  return { id, kind: 'numeric', prompt: [text(prompt)], marks, required: true, dependsOn: [], unit, inputMode: 'text',
    acceptance: { kind: 'relative', expected, relativeTolerance: 0.03, absoluteFloor: Math.abs(expected) * 0.001 } };
}
function choice(id: string, prompt: string, options: readonly (readonly [string, string])[], correct: string, marks = 1): QuestionPart {
  return { id, kind: 'choice', prompt: [text(prompt)], marks, required: true, dependsOn: [], presentation: 'single',
    options: options.map(([id, label]) => ({ id, content: [text(label)] })), acceptedOptionSets: [[correct]] };
}
function written(id: string, prompt: string, answer: string, marks = 1): QuestionPart {
  return { id, kind: 'text', prompt: [text(prompt)], marks, required: true, dependsOn: [], accepted: [answer], normalization: 'chemical-text' };
}
const orderOptions = [['zero', 'Zero order'], ['first', 'First order'], ['second', 'Second order']] as const;
const orderId = (order: number) => ['zero', 'first', 'second'][order]!;
const kUnits = (order: number) => ['mol dm⁻³ s⁻¹', 's⁻¹', 'dm³ mol⁻¹ s⁻¹'][order]!;
function responses(parts: readonly QuestionPart[]): Responses {
  return Object.fromEntries(parts.map(p => [p.id, p.kind === 'numeric' ? { kind: 'numeric', raw: String(p.acceptance.expected), unit: p.unit }
    : p.kind === 'choice' ? { kind: 'choice', selected: p.acceptedOptionSets[0]! }
    : p.kind === 'text' ? { kind: 'text', value: p.accepted[0]! } : undefined]));
}
function question(format: Format, level: Level, seed: number, title: string, context: ContentBlock[], parts: QuestionPart[], worked: string): Question {
  return { ref: { activityId: 'alevel/rate-equations', questionId: `RATE-NEW-graphs-${format}-L${level}`, level, seed },
    title, context, parts, workedAnswer: [text(worked)], layout: 'workspace', submission: 'all-required-parts', scaffolds: [], hints: [], sources: sources(format) };
}
function plot(id: string, title: string, xLabel: string, yLabel: string, maxX: number, maxY: number, value: (x: number) => number): StaticRatePlot {
  return { id, title, xLabel, yLabel, maxX, maxY, points: Array.from({ length: 81 }, (_, i) => { const x = maxX * (i / 80); return { x, y: value(x) }; }) };
}
const makeShapes: RateFactory = (level, seed) => {
  configuration(level, seed, 1);
  const index = seed % 4, order = index === 3 ? 0 : index;
  const concentrationTime = index === 3;
  const evidence = concentrationTime
    ? plot('shape', 'Concentration against time', 'Time / arbitrary units', '[A] / arbitrary units', 4, 1.1, t => 1 - t / 5)
    : plot('shape', 'Rate against concentration', '[A] / arbitrary units', 'Rate / arbitrary units', 1, 1.1, c => order === 0 ? 0.6 : c ** order);
  const parts = [choice('order', 'What is the order with respect to A?', orderOptions, orderId(order))];
  const reason = concentrationTime ? 'The constant negative gradient means the rate is constant as [A] decreases.'
    : order === 0 ? 'The horizontal line shows rate is independent of [A].'
    : order === 1 ? 'The straight line through the origin shows rate is directly proportional to [A].'
    : 'The upward curve shows rate is proportional to [A]²; doubling [A] quadruples rate.';
  return { gem: 'graphs', staticPlots: [evidence], question: question('shapes', level, seed, 'Recognising rate graphs',
    [text(concentrationTime ? 'Reactant A is monitored at constant temperature.' : 'Initial rates are measured at constant temperature; all other reactant concentrations are held constant.')], parts,
    `${orderId(order)} order. ${reason}`), correctResponses: responses(parts), validation: {
      conceptualPoolSize: 4, variantIndex: index, variantCount: 4, order, representation: concentrationTime ? 'concentration-time' : 'rate-concentration',
      specification: concentrationTime ? '5.1.1(d)(i)' : '5.1.1(g)(i)', fixedConceptualPool: true,
    } };
};
const makeInitial: RateFactory = (level, seed) => {
  const { index, a, b } = configuration(level, seed, 1);
  const initial = (120 + 20 * a) / 1000, halfLife = 30 + 5 * b, k = Math.LN2 / halfLife;
  const graph: CurveGraph = { kind: 'concentration', initial, k, order: 1, maxTime: halfLife * 3.2, timeUnit: 's', initialMarker: 0 };
  const rate = initial * k;
  const parts = [numeric('rate', 'Use a tangent at t = 0 to determine the initial rate of disappearance of A. Give a positive value to 3 significant figures.', rate, 'mol dm⁻³ s⁻¹', 2)];
  return { gem: 'graphs', graph, question: question('initial', level, seed, 'Initial rate from a tangent',
    [text('The concentration of A is monitored at constant temperature. Initial rate is measured at the start of the reaction.')], parts,
    `At t = 0, the tangent gradient is −${fmt(rate)} mol dm⁻³ s⁻¹. Rate of disappearance = −gradient = ${rate.toPrecision(3)} mol dm⁻³ s⁻¹.`),
    correctResponses: responses(parts), validation: { specification: '5.1.1(d)(ii)', variantIndex: index, variantCount: 100, initial, halfLife, rate, initialTangent: true } };
};
const makeHalfConcentration: RateFactory = (level, seed) => {
  const { index, a, b } = configuration(level, seed, 1);
  const initial = (10 + a) / 100, halfLife = 12 + 2 * b, factor = [0.5, 2, 3, 4][(a + b) % 4]!;
  const parts = [numeric('half-life', 'Determine the half-life in experiment 2.', halfLife, 'min'),
    choice('reason', 'Choose the reason for your answer.', [
      ['independent', 'At fixed temperature, a first-order half-life is independent of the initial concentration.'],
      ['proportional', 'Half-life increases in direct proportion to initial concentration.'],
      ['inverse', 'Half-life decreases in inverse proportion to initial concentration.'],
    ], 'independent')];
  return { gem: 'graphs', question: question('half-concentration', level, seed, 'Initial concentration and half-life', [
    text('The reaction is first order with respect to A. Both experiments are at the same temperature and otherwise identical conditions.'),
    { kind: 'table', headers: ['Experiment', 'Initial [A] / mol dm⁻³', 'Half-life / min'], rows: [['1', fmt(initial), String(halfLife)], ['2', fmt(initial * factor), 'To determine']] },
  ], parts, `The half-life remains ${halfLife} min. Changing initial [A] from ${fmt(initial)} to ${fmt(initial * factor)} mol dm⁻³ does not change k at fixed temperature. t½ = ln 2/k, so it is unchanged.`),
    correctResponses: responses(parts), validation: { specification: '5.1.1(e–f)', variantIndex: index, variantCount: 100, initial, changedInitial: initial * factor, halfLife } };
};
const makeDeduce: RateFactory = (level, seed) => {
  const { index, a, b } = configuration(level, seed, 3);
  const order = (index % 2) as 0 | 1, initial = (120 + 20 * a) / 1000, halfLife = 2 + b * 0.2;
  const k = order === 0 ? initial / (2 * halfLife) : Math.LN2 / halfLife;
  const maxTime = halfLife * (order === 0 ? 1.9 : 3.2);
  const marker = Math.round(halfLife * 5) / 10;
  const graph: CurveGraph = { kind: 'concentration', initial, k, order, maxTime, timeUnit: 'min', initialMarker: marker };
  const concentration = order === 0 ? initial - k * marker : initial * Math.exp(-k * marker);
  const rate = k * concentration ** order / 60;
  const nextHalfLife = halfLife * (order === 0 ? 0.5 : 1);
  const parts = [numeric('half-life-1', 'Measure the time for [A] to fall from its initial value to half that value.', halfLife, 'min'),
    numeric('half-life-2', 'Measure the additional time for [A] to fall from half to one-quarter of its initial value.', nextHalfLife, 'min'),
    choice('order', 'Deduce the order with respect to A.', orderOptions, orderId(order)),
    choice('reason', 'Which evidence supports your order?', [
      ['halving', 'Successive half-lives halve, so the rate remains constant as concentration falls.'],
      ['constant', 'Successive half-lives are constant, so halving concentration halves rate.'],
      ['doubling', 'Successive half-lives double, so halving concentration quarters rate.'],
    ], ['halving', 'constant', 'doubling'][order]!),
    numeric('concentration', `Read [A] at t = ${fmt(marker)} min.`, concentration, 'mol dm⁻³'),
    numeric('rate', `Determine the rate of disappearance at t = ${fmt(marker)} min. Convert the time interval to seconds.`, rate, 'mol dm⁻³ s⁻¹', 2),
    numeric('k', 'Calculate k using your order, concentration and rate. Use seconds as the time unit.', k / 60, '', 2),
    written('k-units', 'Determine the units of k, using seconds as the time unit.', kUnits(order))];
  const context = [text('Only A affects the rate. The concentration of A is monitored at constant temperature. The order is not supplied.')];
  const triangle = tangentGeometry(0, maxTime, 0, initial * 1.1, marker, concentration, -rate * 60, true);
  const dt = Number(triangle.dx.toPrecision(5)), seconds = Number((dt * 60).toPrecision(7));
  return { gem: 'graphs', graph, question: question('deduce', level, seed, 'Deduce order, rate and rate constant', context, parts,
    `Successive half-lives are ${fmt(halfLife)} and ${fmt(nextHalfLife)} min: they ${['halve', 'remain constant', 'double'][order]}. This supports ${orderId(order)} order.\n\nAt ${fmt(marker)} min, [A] = ${fmt(concentration)} mol dm⁻³.\nUsing the tangent triangle:\nΔt = ${dt} min × 60 = ${seconds} s\nΔ[A] = −${fmt(-triangle.dy)} mol dm⁻³\nRate = −Δ[A]/Δt = ${fmt(-triangle.dy)}/${seconds} = ${rate.toPrecision(3)} mol dm⁻³ s⁻¹.\n\nk = rate/[A]${order === 0 ? '⁰ = rate' : ''} = ${fmt(k / 60)} ${kUnits(order)}.`),
    correctResponses: responses(parts), validation: { specification: '5.1.1(c–f)', variantIndex: index, variantCount: 100,
      order, firstHalfLife: halfLife, secondHalfLife: nextHalfLife, concentration, ratePerSecond: rate, kPerSecond: k / 60 } };
};
const makeMixed: RateFactory = (level, seed) => {
  const { index, a, b } = configuration(level, seed, 3);
  const initialA = (10 + a) / 10000, initialC = (15 + b * 2) / 100, initialB = 0.2;
  const k = (20 + index * 2) / 100000, factor = a % 2 === 0 ? 2 : 3, rate = k * initialA * initialC;
  // A and catalyst C are maintained at constant concentrations during experiment 2.
  const bInitial = (20 + a) / 1000, bRate = k * 0.5 * 0.5, maxTime = 0.8 * bInitial / bRate;
  const staticPlots = [
    plot('b-time', 'Experiment 2: concentration of B against time', 'Time / s', '[B] / mol dm⁻³', maxTime, bInitial * 1.1, t => bInitial - bRate * t),
    plot('c-rate', 'Experiment 3: initial rate against concentration of C', '[C] / mol dm⁻³', 'Initial rate / mol dm⁻³ s⁻¹', initialC * 2, rate * 2.2, c => k * initialA * c),
  ];
  const law = 'rate = k[A][C]';
  const parts = [choice('order-a', 'Determine the order with respect to A.', orderOptions, 'first'),
    choice('order-b', 'Determine the order with respect to B.', orderOptions, 'zero'),
    choice('order-c', 'Determine the order with respect to C.', orderOptions, 'first'),
    written('rate-equation', 'Write the rate equation.', law, 2),
    numeric('k', 'Use experiment 1 to calculate k.', k, 'dm³ mol⁻¹ s⁻¹', 2),
    written('k-units', 'State the units of k.', 'dm³ mol⁻¹ s⁻¹'),
    choice('reason', 'Which conclusion supports a mechanism with more than one step?', [
      ['mismatch', 'B is in the overall reaction but absent from the rate equation; C is in the rate equation but cancels from the overall reaction. The rate equation cannot describe one elementary overall step.'],
      ['coefficients', 'The powers in a rate equation must always equal the coefficients in the overall reaction, so the data must be wrong.'],
      ['no-b', 'Zero order in B means B never takes part in any step of the reaction.'],
      ['catalyst', 'Because C is a catalyst, it must have zero order and never take part in the rate-determining step.'],
    ], 'mismatch', 2)];
  return { gem: 'graphs', staticPlots, question: question('mixed', level, seed, 'Combine kinetic evidence', [
    text('A and B react to form products. C is a catalyst: it is regenerated and cancels from the overall equation. All experiments are at the same temperature.'),
    text('Experiment 1 changes only initial [A]. Experiment 2 monitors [B] while [A] and [C] are maintained constant at 0.500 mol dm⁻³. Experiment 3 changes only initial [C], keeping [A] and [B] at the values in experiment 1.'),
    { kind: 'table', headers: ['Experiment 1 trial', '[A] / mol dm⁻³', '[B] / mol dm⁻³', '[C] / mol dm⁻³', 'Initial rate / mol dm⁻³ s⁻¹'], rows: [
      ['1', fmt(initialA), fmt(initialB), fmt(initialC), fmt(rate)],
      ['2', fmt(initialA * factor), fmt(initialB), fmt(initialC), fmt(rate * factor)],
    ] },
  ], parts, `[A] increases by a factor of ${factor} and rate increases by ${factor}: first order in A. The B concentration–time graph has constant negative gradient: zero order in B. The initial rate–[C] graph is a straight line through the origin: first order in C. ${law}. k = ${fmt(rate)}/(${fmt(initialA)} × ${fmt(initialC)}) = ${fmt(k)} dm³ mol⁻¹ s⁻¹. B is consumed overall but absent from the rate equation; catalytic C affects rate but cancels overall. These results support more than one step; zero order does not mean B is absent from the mechanism.`),
    correctResponses: responses(parts), validation: { specification: '5.1.1(b–d,g,i)', variantIndex: index, variantCount: 100, species: ['A', 'B', 'C'],
      orders: [1, 0, 1], primaryGemOnly: 'graphs', k, tableRate: rate, concentrationFactor: factor, bConcentrationGradient: -bRate } };
};

export const newGraphFactories: Readonly<Record<string, RateFactory>> = {
  'RATE-NEW-graphs-shapes-L1': makeShapes,
  'RATE-NEW-graphs-initial-L1': makeInitial,
  'RATE-NEW-graphs-half-concentration-L1': makeHalfConcentration,
  'RATE-NEW-graphs-deduce-L3': makeDeduce,
  'RATE-NEW-graphs-mixed-L3': makeMixed,
};
