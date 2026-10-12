import type { ContentBlock, Question, QuestionPart, Responses } from '../../../contracts/question.ts';
import type { Level } from '../../../contracts/identity.ts';
import type { CurveGraph, RateFactory, RateGem, RateGraph } from './types.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const format = (value: number) => Number(value.toPrecision(4)).toString();
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
function question(gem: RateGem, level: Level, seed: number, title: string, context: string[], parts: QuestionPart[], scaffold: string, answer: string): Question {
  return { ref: { activityId: 'alevel/acid-base-calculations', questionId: `RATE-POC-${gem}-L${level}`, seed, level }, title,
    context: context.map(text), layout: 'workspace', submission: 'all-required-parts', parts,
    scaffolds: scaffold ? [{ id: `${gem}-L${level}-support`, level, content: [text(scaffold)], purpose: 'Level-appropriate built-in equation support' }] : [],
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
    parts = [numeric('rate', `Determine the instantaneous rate of disappearance of A at t = ${format(marker)} s. Give a positive value.`, rate, 'mol dm⁻³ s⁻¹', 2)];
    q = question('graphs', level, seed, 'Instantaneous rate from a tangent', [
      'The graph shows the concentration of reactant A during a reaction at constant temperature.',
      `Move the marker to ${format(marker)} s. The tangent and its measurement triangle follow automatically. Use the signed coordinate changes shown on the graph to calculate the rate.`,
    ], parts, 'Gradient = Δ[A]/Δt. Rate of disappearance = −gradient. The triangle gives signed coordinate changes; calculate the rate yourself.',
    `At ${format(marker)} s, [A] = ${format(concentration)} mol dm⁻³. The tangent gradient is −${format(rate)} mol dm⁻³ s⁻¹, so the rate of disappearance is ${format(rate)} mol dm⁻³ s⁻¹.`);
  } else if (level === 2) {
    parts = [numeric('half-life-1', 'Measure the time for [A] to fall from its initial value to half its initial value.', halfLife, 's'),
      numeric('half-life-2', 'Measure the additional time for [A] to fall from half to one-quarter of its initial value.', halfLife, 's'),
      { id: 'order', kind: 'choice', prompt: [text('What order with respect to A is supported by these half-lives?')], marks: 1, required: true, dependsOn: [], presentation: 'single', options: [
        { id: 'zero', content: [text('Zero order')] }, { id: 'first', content: [text('First order')] }, { id: 'second', content: [text('Second order')] },
      ], acceptedOptionSets: [['first']] }, numeric('k', 'Determine the rate constant, k.', k, 's⁻¹', 2)];
    q = question('graphs', level, seed, 'Half-life, order and rate constant', [
      `At constant temperature, the initial concentration of A is ${format(initial)} mol dm⁻³. Use the graph to measure two successive half-lives, identify the order and calculate k.`,
      'Pin the half-concentration and quarter-concentration readings. Report the second half-life as an interval, rather than the total time from the start.',
    ], parts, 'For a first-order reaction, k = ln 2 / t½.',
    `The half-concentration is ${format(initial / 2)} mol dm⁻³ at ${format(halfLife)} s; the quarter-concentration is ${format(initial / 4)} mol dm⁻³ at ${format(2 * halfLife)} s. Both successive half-lives are ${format(halfLife)} s, supporting first order. k = ln 2 / ${format(halfLife)} = ${format(k)} s⁻¹.`);
  } else {
    parts = [numeric('concentration', 'Determine [A] at t = 3.00 min.', concentration, 'mol dm⁻³'),
      numeric('rate', 'Determine the instantaneous rate of disappearance of A at t = 3.00 min, in mol dm⁻³ s⁻¹.', rate / 60, 'mol dm⁻³ s⁻¹', 2),
      numeric('k', 'Use your concentration and rate to calculate k in s⁻¹.', k / 60, 's⁻¹', 2)];
    q = question('graphs', level, seed, 'Rate constant with a time-unit conversion', [
      'The reaction is first order with respect to A: rate = k[A]. The concentration–time graph has time in minutes.',
      'Use the graph at 3.00 min to determine the concentration, the instantaneous rate in mol dm⁻³ s⁻¹ and the rate constant in s⁻¹. Temperature is constant.',
    ], parts, '', `At 3.00 min, [A] = ${format(concentration)} mol dm⁻³. The magnitude of the tangent gradient is ${format(rate)} mol dm⁻³ min⁻¹. Divide by 60 to obtain ${format(rate / 60)} mol dm⁻³ s⁻¹. k = rate/[A] = ${format(k / 60)} s⁻¹.`);
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
  let parts: QuestionPart[];
  let q: Question;
  if (level === 1) {
    parts = [numeric('ea', 'Calculate the activation energy in kJ mol⁻¹.', activationEnergy, 'kJ mol⁻¹', 2)];
    q = question('arrhenius', level, seed, 'Activation energy from a supplied gradient', [
      `A first-order reaction gives a straight line when ln(k/(s⁻¹)) is plotted against 1/T in K⁻¹. The supplied gradient is ${gradient} K.`,
      'R = 8.314 J mol⁻¹ K⁻¹. Temperature T is in kelvin.',
    ], parts, 'ln k = −Eₐ/(RT) + ln A. For ln k against 1/T: gradient = −Eₐ/R. Convert joules to kilojoules.',
    `Eₐ = −(${gradient}) × 8.314 = ${format(activationEnergy * 1000)} J mol⁻¹ = ${format(activationEnergy)} kJ mol⁻¹.`);
  } else if (level === 2) {
    parts = [numeric('scaled-gradient', 'Measure the gradient with respect to the displayed 1000/T axis.', gradient / 1000, 'K'),
      numeric('gradient', 'Convert this to the gradient for ln k against 1/T.', gradient, 'K'),
      numeric('ea', 'Determine the activation energy.', activationEnergy, 'kJ mol⁻¹', 2)];
    q = question('arrhenius', level, seed, 'Arrhenius gradient with a scaled axis', [
      'For a first-order reaction, the graph plots ln(k/(s⁻¹)) against 1000/T (K⁻¹). Calculate the gradient on the displayed axis, the corresponding gradient against 1/T, and Eₐ.',
      'R = 8.314 J mol⁻¹ K⁻¹. The displayed coordinate 3.00 means 1/T = 0.00300 K⁻¹.',
    ], parts, 'Use ln k = −Eₐ/(RT) + ln A. The actual change in 1/T is the displayed change in 1000/T divided by 1000.',
    `The displayed-axis gradient is ${format(gradient / 1000)} K. Δ(1/T) = Δ(1000/T)/1000, so the gradient against 1/T is ${gradient} K. Eₐ = −gradient × R = ${format(activationEnergy)} kJ mol⁻¹.`);
  } else {
    parts = [numeric('intercept', 'Determine the true y-intercept, ln(A/(s⁻¹)), at 1/T = 0.', intercept, ''),
      numeric('a', 'Calculate the pre-exponential factor A.', A, 's⁻¹', 2),
      numeric('k-new', `Calculate k at ${temperature} K.`, newK, 's⁻¹', 3)];
    q = question('arrhenius', level, seed, 'True intercept and a new temperature', [
      `The supplied line is ln(k/(s⁻¹)) against 1/T for a first-order reaction. Determine the true intercept, calculate A and predict k at ${temperature} K.`,
      'Use ln k = −Eₐ/(RT) + ln A and R = 8.314 J mol⁻¹ K⁻¹. The left edge of the initial plotted range is not 1/T = 0. You can extend the line to zero using the graph control.',
    ], parts, '', `The true intercept at 1/T = 0 is ${format(intercept)}, so A = exp(${format(intercept)}) = ${format(A)} s⁻¹. The gradient against 1/T is ${gradient} K. At ${temperature} K, ln k = ${format(intercept)} + (${gradient})/${temperature} = ${format(intercept + gradient / temperature)}, so k = ${format(newK)} s⁻¹.`);
  }
  return { gem: 'arrhenius', question: q, graph, correctResponses: numericResponses(parts), validation: {
    specification: '5.1.1(k)', gradientAgainstReciprocalT: gradient, displayedGradient: gradient / (graph.scaledX ? 1000 : 1), activationEnergyKJ: activationEnergy,
    trueIntercept: intercept, leftEdgeLnK: intercept + gradient * graph.minX, A, newTemperatureKelvin: temperature, newK,
    underlyingXUnit: 'K⁻¹', scaledXAxisConversion: 'displayed x = 1000 × underlying x; underlying gradient = 1000 × displayed gradient',
  } };
};
