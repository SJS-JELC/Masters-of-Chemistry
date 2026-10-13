import type { ContentBlock, Question, QuestionPart, Responses } from '../../../contracts/question.ts';
import type { RateExample } from './types.ts';
import {
  mechanismNet, mechanismSideCounts, parseMechanismEquation,
  sameMechanismCounts, sameMechanismEquation,
} from './mechanism-equation.ts';

export type TypedMechanismContext = 'no2-co' | 'f2-no2' | 'iron-iodide' | 'thiosulfate';
const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const formula = (value: string): ContentBlock => ({ kind: 'formula', text: value });

/** Exact examples printed in the original OCR schemes; no algebraically invented pathways.
 * These are formal source-supported proposals, not claims of unique microscopic mechanisms.
 */
export const reviewedMechanismPairs: Readonly<Record<TypedMechanismContext, readonly (readonly [string, string])[]>> = {
  'no2-co': [
    ['2NO₂ → NO + NO₃', 'NO₃ + CO → NO₂ + CO₂'],
    ['2NO₂ → N₂O₄', 'N₂O₄ + CO → NO + NO₂ + CO₂'],
    ['2NO₂ → N₂ + 2O₂', 'N₂ + 2O₂ + CO → NO + NO₂ + CO₂'],
    ['2NO₂ → 2NO + O₂', 'NO + O₂ + CO → NO₂ + CO₂'],
  ],
  'f2-no2': [['F₂ + NO₂ → F + NO₂F', 'F + NO₂ → NO₂F']],
  'iron-iodide': [
    ['Fe³⁺ + 2I⁻ → [FeI₂]⁺', 'Fe³⁺ + [FeI₂]⁺ → 2Fe²⁺ + I₂'],
    ['Fe³⁺ + 2I⁻ → Fe²⁺ + I₂⁻', 'Fe³⁺ + I₂⁻ → Fe²⁺ + I₂'],
    ['Fe³⁺ + 2I⁻ → Fe⁺ + I₂', 'Fe³⁺ + Fe⁺ → 2Fe²⁺'],
  ],
  thiosulfate: [
    ['S₂O₃²⁻ → S + SO₃²⁻', 'SO₃²⁻ + 2H⁺ → SO₂ + H₂O'],
    ['S₂O₃²⁻ → SO₂ + SO²⁻', 'SO²⁻ + 2H⁺ → S + H₂O'],
  ],
};
const chemistry = {
  'no2-co': {
    title: 'Two-step mechanism: nitrogen dioxide and carbon monoxide',
    introduction: 'Carbon monoxide reacts with nitrogen dioxide in the gas phase. The measured rate is second order in NO₂ and zero order in CO.',
    overall: 'CO + NO₂ → NO + CO₂', rate: 'rate = k[NO₂]²', orders: { NO2: 2 },
    packet: 'OCR_2022_JUN_H432-01_Q16', hash: '451f75e1e5acdb3fb72767b0c61062c7fd7d0e242224403b55095c9ba7fa2ff6',
    unit: 'OCR_2022_JUN_H432-01_Q16_P_B', pages: 'packet p3 = QP PDF p11; packet p7 = MS PDF p13 (printed p12).',
    explanation: 'Two NO₂ molecules react in the slow first step, consistent with rate = k[NO₂]². The following fast step consumes the intermediate. Adding the steps and cancelling common species gives the overall equation.',
  },
  'f2-no2': {
    title: 'Two-step mechanism: fluorine and nitrogen dioxide',
    introduction: 'Fluorine reacts with nitrogen dioxide to form nitryl fluoride. The measured rate is first order in F₂ and first order in NO₂. F denotes a neutral fluorine atom.',
    overall: 'F₂ + 2NO₂ → 2NO₂F', rate: 'rate = k[F₂][NO₂]', orders: { F2: 1, NO2: 1 },
    packet: 'OCR_2024_JUN_H432-01_Q20', hash: '94457b16eae9c3e328be5d7e80f42cedb91e87654a0a7f50d0c2417b56b83200',
    unit: 'OCR_2024_JUN_H432-01_Q20_P_B', pages: 'packet p2 = QP PDF p22; packet p6 = MS PDF p26 (printed p25).',
    explanation: 'One F₂ and one NO₂ react in the slow elementary step, predicting rate = k[F₂][NO₂]. Cancelling the neutral F intermediate gives F₂ + 2NO₂ → 2NO₂F.',
  },
  'iron-iodide': {
    title: 'Two-step mechanism: iron(III) ions and iodide ions',
    introduction: 'Aqueous iron(III) ions react with aqueous iodide ions. The measured rate is first order in Fe³⁺ and second order in I⁻.',
    overall: '2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂', rate: 'rate = k[Fe³⁺][I⁻]²', orders: { 'Fe3+': 1, 'I-': 2 },
    packet: 'OCR_2018_JUN_H432-01_Q17', hash: '54049f8002c045d90917a3c091775535681d0adb862d71b72212f08e953c4ca0',
    unit: 'OCR_2018_JUN_H432-01_Q17_P_A', pages: 'packet p2 = QP PDF p14; packet p8 = MS PDF p10.',
    explanation: 'One Fe³⁺ and two I⁻ ions react in the slow elementary step, predicting rate = k[Fe³⁺][I⁻]². Both steps conserve atoms and charge. Cancelling the intermediate gives 2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂.',
  },
  thiosulfate: {
    title: 'Two-step mechanism: thiosulfate ions and hydrogen ions',
    introduction: 'Aqueous thiosulfate ions react with hydrogen ions to form sulfur, sulfur dioxide and water. The measured rate is first order in S₂O₃²⁻ and zero order in H⁺.',
    overall: 'S₂O₃²⁻ + 2H⁺ → S + SO₂ + H₂O', rate: 'rate = k[S₂O₃²⁻]', orders: { 'S2O3^2-': 1 },
    packet: 'OCR_2021_OCT_H432-01_Q21', hash: 'd78c5c74e56e5a55e9ab40c71934b951f5df50150e1e62ab3a76fcb51f20262a',
    unit: 'OCR_2021_OCT_H432-01_Q21_P_A_II', pages: 'packet p2 = QP PDF p23; packet p6 = MS PDF p19.',
    explanation: 'One thiosulfate ion reacts in the slow elementary step, predicting rate = k[S₂O₃²⁻]. H⁺ occurs only in the fast step and has order zero. Cancelling the intermediate gives S₂O₃²⁻ + 2H⁺ → S + SO₂ + H₂O.',
  },
} as const;

export function makeTypedMechanism(context: TypedMechanismContext): RateExample {
  if (!Object.hasOwn(chemistry, context)) throw new Error('Unknown typed mechanism context.');
  const c = chemistry[context];
  const pairs = reviewedMechanismPairs[context];
  const parts: QuestionPart[] = [1, 2].map((step, index) => ({
    id: `mechanism-step-${step}`, kind: 'text', prompt: [text(`Step ${step} (${step === 1 ? 'slow' : 'fast'})`)],
    marks: 1, required: true, presentation: 'single-line', normalization: 'exact',
    accepted: pairs.map(pair => pair[index]!),
    dependsOn: step === 1 ? [] : [{ partId: 'mechanism-step-1', condition: 'response-reference' }],
  }));
  return {
    gem: 'mechanisms',
    question: {
      ref: { activityId: 'alevel/rate-equations', questionId: `RATE-NEW-mechanisms-${context}-L3`, seed: 0, level: 3 },
      title: c.title,
      context: [text(c.introduction), formula(`Overall: ${c.overall}`), formula(`Measured: ${c.rate}`),
        text('Suggest a possible two-step mechanism. Treat the slow first step as elementary; its reacting species must match the measured rate equation. Write an equation for each step.')],
      layout: 'multipart', submission: 'all-required-parts', parts, scaffolds: [], hints: [],
      workedAnswer: [formula(`Step 1 (slow): ${pairs[0]![0]}`), formula(`Step 2 (fast): ${pairs[0]![1]}`), text(c.explanation),
        ...pairs.slice(1).flatMap(pair => [text('Another source-supported proposal:'), formula(`Step 1 (slow): ${pair[0]}`), formula(`Step 2 (fast): ${pair[1]}`)]),
        text('Rate data identify a consistent proposal; they do not prove a unique mechanism.')],
      sources: [
        { path: 'resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json', sha256: 'b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a', symbolOrSection: '5.1.1(i): possible mechanisms from a rate equation and overall reaction.' },
        { path: 'resources/a-level-past-paper-atlas/data/aggregate.json', sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: c.unit },
        { path: `resources/a-level-past-paper-atlas/packets/${c.packet}.pdf`, sha256: c.hash, symbolOrSection: `${c.unit}; ${c.pages}` },
      ],
    },
    correctResponses: { 'mechanism-step-1': { kind: 'text', value: pairs[0]![0] }, 'mechanism-step-2': { kind: 'text', value: pairs[0]![1] } },
    validation: { seeded: false, specification: ['5.1.1(i)'], sourceUnits: [c.unit], acceptedPairCount: pairs.length,
      chemistryReview: 'All printed OCR alternatives reopened and visually reviewed. Each allowed step conserves atoms and charge; slow reactant molecularity matches the measured law. Each pair sums exactly to the stated net equation. Step 2 must match the submitted reviewed Step 1. Formal source proposals are not claims of a unique mechanism.',
      adaptation: context === 'f2-no2' ? 'Source supplies the fast step and asks for slow step/rate; this new fixed question supplies the source-derived rate and asks for both equations.' : 'Source mechanism task adapted to two typed equation fields with an explicit source-reviewed allowed-pair list.' },
  };
}

/** Dependent marking for this new family only. No scaling, spectator cancellation or invented intermediates. */
export function markTypedMechanismSteps(question: Question, responses: Responses): Readonly<Record<string, boolean>> | null {
  const match = /^RATE-NEW-mechanisms-(no2-co|f2-no2|iron-iodide|thiosulfate)-L3$/.exec(question.ref.questionId);
  if (!match) return null;
  const context = match[1] as TypedMechanismContext;
  const slowResponse = responses['mechanism-step-1'];
  const fastResponse = responses['mechanism-step-2'];
  const slow = slowResponse?.kind === 'text' ? parseMechanismEquation(slowResponse.value) : null;
  const fast = fastResponse?.kind === 'text' ? parseMechanismEquation(fastResponse.value) : null;
  const c = chemistry[context];
  const overall = parseMechanismEquation(c.overall)!;
  const candidates = reviewedMechanismPairs[context].filter(pair => slow &&
    sameMechanismEquation(slow, parseMechanismEquation(pair[0])!) &&
    sameMechanismCounts(mechanismSideCounts(slow.reactants), c.orders));
  const firstCorrect = candidates.length > 0;
  const secondCorrect = Boolean(slow && fast && candidates.some(pair => sameMechanismEquation(fast, parseMechanismEquation(pair[1])!)) &&
    sameMechanismCounts(mechanismNet([slow, fast]), mechanismNet([overall])));
  return { 'mechanism-step-1': firstCorrect, 'mechanism-step-2': secondCorrect };
}
