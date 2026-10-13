import type { Level, SourceReference } from '../../../contracts/identity.ts';
import type { ContentBlock, QuestionPart, Responses } from '../../../contracts/question.ts';
import type { RateExample } from './types.ts';

type MechanismContext = 'iron-iodide' | 'thiosulfate';
const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const formula = (value: string): ContentBlock => ({ kind: 'formula', text: value });
const specification: SourceReference = {
  path: 'resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json',
  sha256: 'b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a',
  symbolOrSection: '5.1.1(i): predict a rate equation consistent with the rate-determining step; possible mechanisms from the rate equation and overall reaction.',
};
const aggregate = {
  path: 'resources/a-level-past-paper-atlas/data/aggregate.json',
  sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7',
};

// These are source-supported classroom proposals, not claims of unique real mechanisms.
// Named chemistry is fixed; no seed changes the ions, stoichiometry or kinetic orders.
const chemistry = {
  'iron-iodide': {
    introduction: 'A possible mechanism is proposed for the reaction between aqueous iron(III) ions and iodide ions. The proposed steps are elementary.',
    overall: '2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂',
    slow: 'Fe³⁺ + 2I⁻ → [FeI₂]⁺',
    fast: 'Fe³⁺ + [FeI₂]⁺ → 2Fe²⁺ + I₂',
    rate: 'rate = k[Fe³⁺][I⁻]²',
    orders: 'Experiments at constant temperature show first order with respect to Fe³⁺ and second order with respect to I⁻.',
    slowAlternatives: ['[FeI₂]⁺ → Fe³⁺ + 2I⁻', 'Fe³⁺ + 2I⁻ → Fe²⁺ + I₂⁻'],
    mechanisms: [
      ['Fe³⁺ + I⁻ → Fe²⁺ + I', 'Fe³⁺ + I + I⁻ → Fe²⁺ + I₂'],
      ['Fe³⁺ + 2I⁻ → [FeI₂]⁺', '[FeI₂]⁺ → Fe³⁺ + 2I⁻'],
      ['Fe³⁺ + 2I⁻ → [FeI₂]⁺', 'Fe³⁺ + [FeI₂]⁺ → 2Fe²⁺ + I₂'],
    ],
    explanation: 'One Fe³⁺ and two I⁻ ions react in the slow elementary step, predicting rate = k[Fe³⁺][I⁻]². The intermediate [FeI₂]⁺ is formed in step 1 and consumed in step 2. Adding the steps gives 2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂.',
    missingExplanation: 'Only Fe³⁺ + 2I⁻ → [FeI₂]⁺ produces the intermediate consumed by the supplied fast step and gives the stated overall equation. The reverse association consumes [FeI₂]⁺ again. The other alternative produces I₂⁻ instead of [FeI₂]⁺; its valid partner step would be different.',
    alternativesExplanation: 'The first alternative sums to the overall equation but predicts rate = k[Fe³⁺][I⁻], so its iodide order is wrong. In the second, the fast step reverses the slow step: all species cancel and there is no net reaction. I in the first alternative denotes a neutral iodine atom.',
    packetPath: 'resources/a-level-past-paper-atlas/packets/OCR_2018_JUN_H432-01_Q17.pdf',
    packetHash: '54049f8002c045d90917a3c091775535681d0adb862d71b72212f08e953c4ca0',
    unit: 'OCR_2018_JUN_H432-01_Q17_P_A',
    sourceSection: 'OCR June 2018 H432/01 Q17(a); packet p2 = QP PDF p14; packet p8 = MS PDF p10. Rate law and [FeI₂]⁺ two-step proposal adapted into fixed automatically marked exercises.',
  },
  thiosulfate: {
    introduction: 'A possible mechanism is proposed for the reaction between aqueous thiosulfate ions and hydrogen ions. The proposed steps are elementary.',
    overall: 'S₂O₃²⁻ + 2H⁺ → S + SO₂ + H₂O',
    slow: 'S₂O₃²⁻ → S + SO₃²⁻',
    fast: 'SO₃²⁻ + 2H⁺ → SO₂ + H₂O',
    rate: 'rate = k[S₂O₃²⁻]',
    orders: 'Experiments at constant temperature show first order with respect to S₂O₃²⁻ and zero order with respect to H⁺ when its concentration is independently varied.',
    slowAlternatives: ['S₂O₃²⁻ + H⁺ → HS₂O₃⁻', 'S₂O₃²⁻ → SO₂ + SO²⁻'],
    mechanisms: [
      ['S₂O₃²⁻ + H⁺ → HS₂O₃⁻', 'HS₂O₃⁻ + H⁺ → S + SO₂ + H₂O'],
      ['S₂O₃²⁻ → S + SO₃²⁻', 'S + SO₃²⁻ → S₂O₃²⁻'],
      ['S₂O₃²⁻ → S + SO₃²⁻', 'SO₃²⁻ + 2H⁺ → SO₂ + H₂O'],
    ],
    explanation: 'One S₂O₃²⁻ ion reacts in the slow elementary step, predicting rate = k[S₂O₃²⁻]. H⁺ is involved only in the following fast step and has order zero in this prediction. Cancelling the intermediate SO₃²⁻ gives S₂O₃²⁻ + 2H⁺ → S + SO₂ + H₂O.',
    missingExplanation: 'Only S₂O₃²⁻ → S + SO₃²⁻ produces the sulfite intermediate consumed by the supplied fast step and gives the stated overall equation. Protonation produces HS₂O₃⁻. The other decomposition produces SO²⁻; although the source allows a mechanism using that intermediate, it needs a different second step.',
    alternativesExplanation: 'The first alternative sums to the overall equation but predicts rate = k[S₂O₃²⁻][H⁺], contradicting the measured zero order in H⁺. In the second, the fast step reverses the slow step: all species cancel and there is no net reaction.',
    packetPath: 'resources/a-level-past-paper-atlas/packets/OCR_2021_OCT_H432-01_Q21.pdf',
    packetHash: 'd78c5c74e56e5a55e9ab40c71934b951f5df50150e1e62ab3a76fcb51f20262a',
    unit: 'OCR_2021_OCT_H432-01_Q21_P_A_II',
    sourceSection: 'OCR October 2021 H432/01 Q21(a)(ii); packet p2 = QP PDF p23; packet p6 = MS PDF p19. Source-supplied rate equation and sulfite-intermediate proposal adapted into fixed automatically marked exercises.',
  },
} as const;

const ratePart = (accepted: string): QuestionPart => ({
  id: 'rate-equation', prompt: [text('Write the rate equation.')], marks: 1,
  required: true, dependsOn: [], kind: 'text', accepted: [accepted],
  normalization: 'exact', presentation: 'single-line',
});
const choice = (id: string, prompt: string, options: readonly (readonly ContentBlock[])[], accepted: number): QuestionPart => ({
  id, prompt: [text(prompt)], marks: 1, required: true, dependsOn: [], kind: 'choice', presentation: 'single',
  options: options.map((content, index) => ({ id: String(index), content })), acceptedOptionSets: [[String(accepted)]],
});

/** Six permanent fixed questions. Callers must retain seed 0 in their references. */
export function makeExpandedMechanism(contextName: MechanismContext, level: Level): RateExample {
  if (!Object.hasOwn(chemistry, contextName) || ![1, 2, 3].includes(level)) throw new Error('Unknown fixed mechanism question.');
  const c = chemistry[contextName];
  let context: ContentBlock[];
  let parts: QuestionPart[];
  let correctResponses: Responses;
  let workedAnswer: ContentBlock[];
  if (level === 1) {
    context = [text(c.introduction), formula(`Overall: ${c.overall}`), formula(`Step 1 (slow): ${c.slow}`), formula(`Step 2 (fast): ${c.fast}`)];
    parts = [ratePart(c.rate)];
    correctResponses = { 'rate-equation': { kind: 'text', value: c.rate } };
    workedAnswer = [formula(c.rate), text(c.explanation)];
  } else if (level === 2) {
    context = [text(c.introduction), formula(`Overall: ${c.overall}`), formula('Step 1 (slow): missing'), formula(`Step 2 (fast): ${c.fast}`)];
    parts = [choice('missing-step', 'Select the missing first step. The two steps must add to the overall equation.',
      [c.slowAlternatives[0], c.slow, c.slowAlternatives[1]].map(step => [formula(step)]), 1), ratePart(c.rate)];
    correctResponses = { 'missing-step': { kind: 'choice', selected: ['1'] }, 'rate-equation': { kind: 'text', value: c.rate } };
    workedAnswer = [formula(`Step 1 (slow): ${c.slow}`), formula(c.rate), text(c.missingExplanation), text(c.explanation)];
  } else {
    context = [text(c.orders), formula(`Measured: ${c.rate}`), formula(`Overall: ${c.overall}`),
      text(contextName === 'iron-iodide' ? 'The proposed steps are elementary. I denotes a neutral iodine atom.' : 'The proposed steps are elementary.')];
    parts = [choice('mechanism', 'Which proposed mechanism matches the measured orders and the overall equation?',
      c.mechanisms.map(([slow, fast]) => [formula(`Step 1 (slow): ${slow}`), formula(`Step 2 (fast): ${fast}`)]), 2)];
    correctResponses = { mechanism: { kind: 'choice', selected: ['2'] } };
    workedAnswer = [formula(`Step 1 (slow): ${c.slow}`), formula(`Step 2 (fast): ${c.fast}`), text(c.explanation),
      text(c.alternativesExplanation), text('Rate data identify a consistent proposal; they do not prove a unique mechanism.')];
  }
  return {
    gem: 'mechanisms',
    question: {
      ref: { activityId: 'alevel/rate-equations', questionId: `RATE-EXP-mechanisms-${contextName}-L${level}`, seed: 0, level },
      title: level === 1 ? 'Rate equation from a slow step' : level === 2 ? 'Complete a two-step mechanism' : 'Match a mechanism to experimental orders',
      context, layout: 'multipart', submission: 'all-required-parts', parts, scaffolds: [], hints: [], workedAnswer,
      sources: [specification, { ...aggregate, symbolOrSection: c.unit },
        { path: c.packetPath, sha256: c.packetHash, symbolOrSection: c.sourceSection }],
    },
    correctResponses,
    validation: {
      specification: ['5.1.1(a)', '5.1.1(i)'], seeded: false, sourceUnits: [c.unit],
      chemistryReview: 'Source packet question and mark-scheme images checked. Every offered equation conserves atoms and charge; accepted steps cancel the intermediate and give the supplied overall reaction. First elementary slow-step molecularity gives the accepted rate law. Exactly one option meets each choice prompt.',
      adaptation: 'Fixed A-level mechanism proposals using source rate laws and correct steps; balanced distractors are teaching alternatives, not asserted real mechanisms. No equilibrium or intermediate substitution is required. State symbols are omitted consistently in the ion equations.',
    },
  };
}
