import type { ContentBlock, Question } from '../../../contracts/question.ts';
import type { ArrheniusGraph, RateFactory } from './types.ts';
import { GAS_CONSTANT } from './graphs.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const superscript = (value: string) => value.replace(/[-0-9]/g, char =>
  char === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(char)]!);
const standardForm = (value: number, figures = 5): string => {
  const [coefficient, power] = value.toExponential(figures - 1).split('e');
  return `${coefficient} × 10${superscript(String(Number(power)))}`;
};

// New numerical practice based solely on Q21(b)(iii)'s reverse-temperature operation.
// The source mark scheme's reciprocal-temperature unit typo is corrected to K⁻¹.
const sources: Question['sources'] = [
  { path: 'resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json', sha256: 'b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a', symbolOrSection: '5.1.1(k); retained OCR archive, current-map version 3.1 May 2026; consulted 13 October 2026' },
  { path: 'resources/a-level-past-paper-atlas/data/aggregate.json', sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: 'OCR_2021_OCT_H432-01_Q21_P_B_III only; new numerical data, reviewed reverse-temperature operation' },
  { path: 'resources/a-level-past-paper-atlas/packets/OCR_2021_OCT_H432-01_Q21.pdf', sha256: 'd78c5c74e56e5a55e9ab40c71934b951f5df50150e1e62ab3a76fcb51f20262a', symbolOrSection: 'Packet pages 3/4: Graph 21.2 and Q21(b)(iii); page 7: mark scheme; source QP pages 24/25 and MS page 20' },
];

const makeTemperature: RateFactory = (level, seed) => {
  if (level !== 3 || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new RangeError('Reverse Arrhenius temperature requires Level 3 and a uint32 seed.');
  const index = seed % 100;
  const first = index % 10, second = Math.floor(index / 10);
  // Ten gradients × ten intercepts give 100 distinct lines, not marker-only variants.
  const gradient = -6000 - first * 100;
  const intercept = 16 + second * 0.15;
  const targetKelvin = 322.5 + second * 4 + first * 0.6;
  // The rounded, visible k is the authoritative supplied datum for the answer.
  const givenK = Number(Math.exp(intercept + gradient / targetKelvin).toPrecision(5));
  const lnK = Math.log(givenK);
  const reciprocalT = (lnK - intercept) / gradient;
  const kelvin = 1 / reciprocalT;
  const celsius = kelvin - 273.15;
  const graph: ArrheniusGraph = {
    kind: 'arrhenius', gradient, intercept, minX: 0.0025, maxX: 0.0035,
    scaledX: index % 2 === 0,
  };
  const temperatures = [300, 320, 340, 360, 380];
  const table: ContentBlock = {
    kind: 'table', headers: ['k / s⁻¹', 'ln(k)', 'T / K', '(1/T) / K⁻¹'],
    rows: temperatures.map(T => {
      const log = intercept + gradient / T;
      return [standardForm(Math.exp(log)), log.toFixed(5), String(T), standardForm(1 / T)];
    }),
  };
  const question: Question = {
    ref: { activityId: 'alevel/rate-equations', questionId: 'RATE-NEW-arrhenius-temperature-L3', level, seed },
    title: 'Temperature from an Arrhenius graph', layout: 'workspace', submission: 'all-required-parts',
    context: [text('The graph and table show how the rate constant of a first-order reaction changes with temperature.'), table],
    parts: [{
      id: 'temperature', kind: 'numeric', required: true, marks: 2, dependsOn: [],
      prompt: [text(`Using the Arrhenius graph, determine the temperature at which k = ${standardForm(givenK)} s⁻¹. Give your answer in °C to 3 significant figures.`)],
      unit: '°C', inputMode: 'text', acceptance: { kind: 'absolute', expected: celsius, tolerance: 1.1 },
    }],
    scaffolds: [], hints: [], sources,
    workedAnswer: [text([
      `ln k = ln(${standardForm(givenK)})\n     = ${lnK.toFixed(5)}`,
      `From the graph${graph.scaledX ? ', converting the displayed reciprocal-temperature scale to K⁻¹' : ''}:\n1/T = ${standardForm(reciprocalT, 6)} K⁻¹`,
      `T = 1 / (${standardForm(reciprocalT, 6)})\n  = ${kelvin.toFixed(2)} K`,
      `Temperature in °C = T − 273.15\n                  = ${kelvin.toFixed(2)} − 273.15\n                  = ${celsius.toPrecision(3)} °C (3 s.f.)`,
    ].join('\n\n'))],
  };
  return { gem: 'arrhenius', question, graph,
    correctResponses: { temperature: { kind: 'numeric', raw: String(celsius), unit: '°C' } },
    validation: {
      specification: '5.1.1(k)', sourceUnitId: 'OCR_2021_OCT_H432-01_Q21_P_B_III',
      variantIndex: index, variantCount: 100, dataTemperaturesKelvin: temperatures,
      gradientAgainstReciprocalT: gradient, displayedGradient: gradient / (graph.scaledX ? 1000 : 1),
      activationEnergyKJ: -gradient * GAS_CONSTANT / 1000, trueIntercept: intercept,
      givenK, lnK, reciprocalTemperature: reciprocalT, temperatureKelvin: kelvin, temperatureCelsius: celsius,
      underlyingXUnit: 'K⁻¹', celsiusOffset: 273.15, absoluteToleranceCelsius: 1.1,
      model: 'Illustrative first-order Arrhenius data; solve from the supplied five-significant-figure k.',
    },
  };
};

export const newArrheniusFactories: Record<string, RateFactory> = {
  'RATE-NEW-arrhenius-temperature-L3': makeTemperature,
};
