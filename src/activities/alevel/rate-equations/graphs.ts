import type { ContentBlock, Question, QuestionPart, Responses } from '../../../contracts/question.ts';
import type { Level } from '../../../contracts/identity.ts';
import type { CurveGraph, RateFactory, RateGem, RateGraph } from './types.ts';
import { tangentGeometry } from './tangent-geometry.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const format = (value: number) => Number(value.toPrecision(4)).toString();
const rateAnswer = (value: number, figures = 3): string => {
  if (value !== 0 && (Math.abs(value) < 0.01 || Math.abs(value) >= 10000)) {
    const [coefficient, power] = value.toExponential(figures - 1).split('e');
    const exponent = String(Number(power)).replace(/[-0-9]/g, char =>
      char === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(char)]!);
    return `${coefficient} × 10${exponent}`;
  }
  return value.toPrecision(figures);
};
export const GAS_CONSTANT = 8.314;

/** k uses the curve's time unit. These integrated curves generate the data only;
 * deriving or recalling integrated rate laws is not required of the learner. */
export function concentrationAt(graph: CurveGraph, time: number): number {
  if (graph.order === 0) return Math.max(0, graph.initial - graph.k * time);
  if (graph.order === 1) return graph.initial * Math.exp(-graph.k * time);
  return graph.initial / (1 + graph.k * graph.initial * time);
}
export function gradientAt(graph: RateGraph, x: number): number {
  if (graph.kind === 'arrhenius') return graph.gradient;
  const concentration = concentrationAt(graph, x);
  return -graph.k * Math.pow(concentration, graph.order);
}
export function curveTimeAt(graph: CurveGraph, concentration: number): number {
  if (graph.order === 0) return (graph.initial - concentration) / graph.k;
  if (graph.order === 1) return Math.log(graph.initial / concentration) / graph.k;
  return (graph.initial / concentration - 1) / (graph.k * graph.initial);
}
function numeric(id: string, prompt: string, expected: number, unit: string, marks = 1): QuestionPart {
  return { id, kind: 'numeric', prompt: [text(prompt)], marks, required: true, dependsOn: [], unit,
    acceptance: { kind: 'relative', expected, relativeTolerance: 0.03, absoluteFloor: Math.abs(expected) * 0.001 }, inputMode: 'text' };
}
function numericResponses(parts: readonly QuestionPart[]): Responses {
  return Object.fromEntries(parts.map(part => [part.id, part.kind === 'numeric'
    ? { kind: 'numeric', raw: String(part.acceptance.expected), unit: part.unit }
    : { kind: 'choice', selected: ['first'] }]));
}
const sources: Question['sources'] = [
  { path: 'resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json', sha256: 'b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a', symbolOrSection: '5.1.1 (c–f, k); retained OCR archive, current-map version 3.1 May 2026' },
  { path: 'resources/a-level-past-paper-atlas/data/aggregate.json', sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: 'OCR_2024_JUN_H432-01_Q17_P_B; OCR_2021_OCT_H432-01_Q21_P_B_I–III; reviewed operation references, new numerical questions' },
];
function question(gem: RateGem, level: Level, seed: number, title: string, context: string[], parts: QuestionPart[], equations: string, answer: string): Question {
  return { ref: { activityId: 'alevel/acid-base-calculations', questionId: `RATE-POC-${gem}-L${level}`, seed, level }, title,
    context: [...context.map(text), ...(equations ? [text(equations)] : [])], layout: 'workspace', submission: 'all-required-parts', parts,
    scaffolds: [],
    hints: [], workedAnswer: [text(answer)], sources };
}
/** Select small independent parameter changes deterministically, including seed 0. */
function variant(seed: number, salt: number): number {
  const mixed = Math.imul((seed >>> 0) ^ salt, 2654435761) >>> 0;
  return mixed % 5;
}

export const makeGraphs: RateFactory = (level, seed) => {
  const v = variant(seed, 0x51);
  const initial = level === 3 ? (1.2 + v * 0.1) * 1e-7 : 0.12 + v * 0.02;
  const halfLife = level === 3 ? 2 + v * 0.25 : 40 + v * 10;
  const k = Math.LN2 / halfLife;
  const marker = level === 3 ? 3 : halfLife / 2;
  const graph: CurveGraph = { kind: 'concentration', initial, k, order: 1, maxTime: halfLife * 3.2, timeUnit: level === 3 ? 'min' : 's', initialMarker: marker };
  const concentration = concentrationAt(graph, marker);
  const rate = -gradientAt(graph, marker);
  let parts: QuestionPart[];
  let q: Question;
  if (level === 1) {
    parts = [numeric('rate', `Determine the rate at t = ${format(marker)} s. Give a positive value to 3 significant figures.`, rate, 'mol dm⁻³ s⁻¹', 2)];
    q = question('graphs', level, seed, 'Calculating rate', [
      'The graph shows the concentration of reactant A during a reaction at constant temperature.',
    ], parts, '',
    `At ${format(marker)} s, [A] = ${format(concentration)} mol dm⁻³. The tangent gradient is −${rateAnswer(rate)} mol dm⁻³ s⁻¹, so the rate of disappearance is ${rateAnswer(rate)} mol dm⁻³ s⁻¹ (3 s.f.).`);
  } else if (level === 2) {
    parts = [numeric('half-life-1', 'Measure the time for [A] to fall from its initial value to half its initial value.', halfLife, 's'),
      numeric('half-life-2', 'Measure the additional time for [A] to fall from half to one-quarter of its initial value.', halfLife, 's'),
      { id: 'order', kind: 'choice', prompt: [text('What order with respect to A is supported by these half-lives?')], marks: 1, required: true, dependsOn: [], presentation: 'single', options: [
        { id: 'zero', content: [text('Zero order')] }, { id: 'first', content: [text('First order')] }, { id: 'second', content: [text('Second order')] },
      ], acceptedOptionSets: [['first']] }, numeric('k', 'Determine the rate constant, k.', k, 's⁻¹', 2)];
    q = question('graphs', level, seed, 'Half-life, order and rate constant', [
      `At constant temperature, the initial concentration of A is ${format(initial)} mol dm⁻³.`,
    ], parts, '',
    `The half-concentration is ${format(initial / 2)} mol dm⁻³ at ${format(halfLife)} s; the quarter-concentration is ${format(initial / 4)} mol dm⁻³ at ${format(2 * halfLife)} s. Both successive half-lives are ${format(halfLife)} s, supporting first order. k = ln 2 / ${format(halfLife)} = ${format(k)} s⁻¹.`);
  } else {
    parts = [numeric('concentration', 'Determine [A] at t = 3.00 min.', concentration, 'mol dm⁻³'),
      numeric('rate', 'Determine the rate at t = 3.00 min. Give your answer as a positive value.', rate / 60, 'mol dm⁻³ s⁻¹', 2),
      numeric('k', 'Use your concentration and rate to calculate k in s⁻¹.', k / 60, 's⁻¹', 2)];
    const triangle = tangentGeometry(0, graph.maxTime, 0, initial * 1.1, marker, concentration, -rate, true);
    const dt = Number(triangle.dx.toPrecision(5));
    const seconds = dt * 60;
    q = question('graphs', level, seed, 'Rate constant with a time-unit conversion', [
      'At constant temperature, the reaction is first order with respect to A: rate = k[A].',
    ], parts, '', [
      `(a) At t = 3.00 min:\n[A] = ${rateAnswer(concentration)} mol dm⁻³`,
      `(b) Using the tangent triangle at t = 3.00 min:\nΔt = ${dt} min × 60 = ${Number(seconds.toPrecision(7))} s\nΔ[A] = −${rateAnswer(-triangle.dy, 5)} mol dm⁻³\nRate = −Δ[A] / Δt\n       = ${rateAnswer(-triangle.dy, 5)} / ${Number(seconds.toPrecision(7))}\n       = ${rateAnswer(rate / 60)} mol dm⁻³ s⁻¹`,
      `(c) Using unrounded values:\nk = rate / [A]\n   = (${rateAnswer(rate / 60, 5)}) / (${rateAnswer(concentration, 5)})\n   = ${rateAnswer(k / 60)} s⁻¹`,
    ].join('\n\n'));
  }
  return { gem: 'graphs', question: q, graph, correctResponses: numericResponses(parts), validation: {
    specification: '5.1.1(c–f)', initial, halfLife, kInGraphTimeUnit: k, marker, concentration, rateInGraphTimeUnit: rate,
    halfConcentrationTime: halfLife, quarterConcentrationTime: 2 * halfLife, ratePerSecond: rate / (level === 3 ? 60 : 1), kPerSecond: k / (level === 3 ? 60 : 1),
    model: 'first-order analytical concentration curve; integrated law is generator-only',
  } };
};

export const makeArrhenius: RateFactory = (level, seed) => {
  const v = variant(seed, 0x6a);
  const gradient = -(level === 1 ? 5600 : level === 2 ? 6800 : 8000) - v * 200;
  const intercept = level === 3 ? 24 + v * 0.2 : 20;
  const temperature = 330 + v * 5;
  const activationEnergy = -gradient * GAS_CONSTANT / 1000;
  const A = Math.exp(intercept);
  const newK = Math.exp(intercept + gradient / temperature);
  const graph: RateGraph = { kind: 'arrhenius', gradient, intercept, minX: 0.0025, maxX: 0.0035, scaledX: level === 2 };
  const dataTable: ContentBlock = {
    kind: 'table',
    headers: ['k / s⁻¹', 'ln(k)', 'T / K', '(1/T) / K⁻¹'],
    rows: [300, 320, 340, 360, 380].map(T => {
      const lnK = intercept + gradient / T;
      return [rateAnswer(Math.exp(lnK), 5), lnK.toFixed(5), String(T), rateAnswer(1 / T, 5)];
    }),
  };
  let parts: QuestionPart[];
  let q: Question;
  if (level === 1) {
    parts = [numeric('ea', 'Calculate the activation energy in kJ mol⁻¹.', activationEnergy, 'kJ mol⁻¹', 2)];
    q = question('arrhenius', level, seed, 'Activation energy from Arrhenius data', [], parts, '',
    `Eₐ = −(${gradient}) × 8.314 = ${format(activationEnergy * 1000)} J mol⁻¹ = ${format(activationEnergy)} kJ mol⁻¹.`);
    q = { ...q, context: [dataTable] };
  } else if (level === 2) {
    parts = [numeric('scaled-gradient', 'Measure the gradient using the displayed axis values.', gradient / 1000, '10³ K'),
      numeric('gradient', 'Convert this to the gradient for ln k against 1/T.', gradient, 'K'),
      numeric('ea', 'Determine the activation energy.', activationEnergy, 'kJ mol⁻¹', 2)];
    q = question('arrhenius', level, seed, 'Arrhenius gradient with a scaled axis', [], parts, '',
    `The gradient using the displayed axis values is ${format(gradient / 1000)} × 10³ K. Each horizontal axis unit represents 10⁻³ K⁻¹, so the gradient against 1/T is ${gradient} K. Eₐ = −gradient × R = ${format(activationEnergy)} kJ mol⁻¹.`);
    q = { ...q, context: [dataTable] };
  } else {
    parts = [numeric('intercept', 'Determine the y-intercept, ln(A), at 1/T = 0.', intercept, ''),
      numeric('a', 'Calculate A.', A, 's⁻¹', 2),
      numeric('k-new', `Calculate k at ${temperature} K.`, newK, 's⁻¹', 3)];
    q = question('arrhenius', level, seed, 'True intercept and a new temperature', [], parts, '', [
      `(a) At 1/T = 0, the y-intercept is:\nln(A) = ${format(intercept)}`,
      `(b) A = e${format(intercept).replace(/[0-9.\-]/g, char => char === '.' ? '·' : char === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(char)]!)}\n       = ${rateAnswer(A)} s⁻¹`,
      `(c) At T = ${temperature} K:\nln k = ${format(intercept)} + (${gradient})/${temperature}\n       = ${format(intercept + gradient / temperature)}\nk = ${rateAnswer(newK)} s⁻¹`,
    ].join('\n\n'));
    q = { ...q, context: [dataTable] };
  }
  return { gem: 'arrhenius', question: q, graph, correctResponses: numericResponses(parts), validation: {
    specification: '5.1.1(k)', gradientAgainstReciprocalT: gradient, displayedGradient: gradient / (graph.scaledX ? 1000 : 1), activationEnergyKJ: activationEnergy,
    trueIntercept: intercept, leftEdgeLnK: intercept + gradient * graph.minX, A, newTemperatureKelvin: temperature, newK,
    underlyingXUnit: 'K⁻¹', scaledXAxisConversion: 'displayed x = 1000 × underlying x; underlying gradient = 1000 × displayed gradient',
  } };
};
