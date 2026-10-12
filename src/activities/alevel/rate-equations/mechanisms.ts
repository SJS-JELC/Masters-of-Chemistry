import type { ContentBlock, QuestionPart } from '../../../contracts/question.ts';
import type { SourceReference } from '../../../contracts/identity.ts';
import type { RateFactory } from './types.ts';

const text = (value: string): ContentBlock => ({ kind: 'text', text: value });
const formula = (value: string): ContentBlock => ({ kind: 'formula', text: value });
const sources: readonly SourceReference[] = [
  { path: 'resources/a-level-past-paper-atlas/run2/specification-evidence/sections.json', sha256: 'b6c12f95c801adfb8725395c267ac12ba640ca16d925aa82ea9a37582804183a', symbolOrSection: '5.1.1(i): rate equations consistent with rate-determining steps; possible mechanisms from measured rate and overall equation.' },
  { path: 'resources/a-level-past-paper-atlas/data/aggregate.json', sha256: 'ec553a5ba6045da2008285264a9a94425e44c4179ceee6095a8f9884149296c7', symbolOrSection: 'OCR_2022_JUN_H432-01_Q16_P_B; OCR_2024_JUN_H432-01_Q20_P_B. Fixed accepted chemistry, adapted to automatically marked parts.' },
];
const choice = (id: string, prompt: string, options: readonly (readonly ContentBlock[])[], accepted: number): QuestionPart => ({
  id, prompt: [text(prompt)], marks: 1, required: true, dependsOn: [], kind: 'choice', presentation: 'single',
  options: options.map((content, index) => ({ id: String(index), content })), acceptedOptionSets: [[String(accepted)]],
});
const typedRate = (prompt: string, accepted: string): QuestionPart => ({
  id: 'rate-equation', prompt: [text(prompt)], marks: 1, required: true, dependsOn: [],
  kind: 'text', accepted: [accepted], normalization: 'exact', presentation: 'single-line',
});

/** Fixed, source-reviewed mechanism examples: seed remains identity metadata, never changes the chemistry. */
export const makeMechanisms: RateFactory = (level, seed) => {
  let context: ContentBlock[];
  let parts: QuestionPart[];
  let workedAnswer: ContentBlock[];
  let correctResponses;
  if (level === 1) {
    context = [text('A possible mechanism is proposed for CO + NO₂ → NO + CO₂. Treat each displayed step as an elementary step; the first step is rate determining.'),
      formula('Step 1 (slow): 2NO₂ → NO + NO₃'), formula('Step 2 (fast): NO₃ + CO → NO₂ + CO₂')];
    parts = [typedRate('Write the rate equation consistent with the supplied slow first step.', 'rate = k[NO₂]²')];
    correctResponses = { 'rate-equation': { kind: 'text' as const, value: 'rate = k[NO₂]²' } };
    workedAnswer = [formula('rate = k[NO₂]²'), text('Two NO₂ species react in the elementary slow step. CO is involved only in the following fast step and does not appear in this predicted rate equation. NO₃ is formed in step 1 and consumed in step 2; adding the steps gives CO + NO₂ → NO + CO₂.')];
  } else if (level === 2) {
    context = [text('Fluorine reacts with nitrogen dioxide by a proposed two-step mechanism. The first step is slow and the second is fast. Each step is elementary.'),
      formula('Overall: F₂ + 2NO₂ → 2NO₂F'), formula('Step 1 (slow): missing'), formula('Step 2 (fast): F + NO₂ → NO₂F')];
    parts = [choice('missing-step', 'Select the missing first step. The two steps must add to the overall equation.',
      ['F₂ → 2F', 'F₂ + NO₂ → F + NO₂F', 'F₂ + 2NO₂ → 2NO₂F'].map(value => [formula(value)]), 1),
      typedRate('Write the rate equation consistent with that slow first step.', 'rate = k[F₂][NO₂]')];
    correctResponses = { 'missing-step': { kind: 'choice' as const, selected: ['1'] }, 'rate-equation': { kind: 'text' as const, value: 'rate = k[F₂][NO₂]' } };
    workedAnswer = [formula('Step 1 (slow): F₂ + NO₂ → F + NO₂F'), formula('rate = k[F₂][NO₂]'), text('Adding F₂ + NO₂ → F + NO₂F and F + NO₂ → NO₂F cancels the intermediate F atom and gives F₂ + 2NO₂ → 2NO₂F. The slow elementary step involves one F₂ and one NO₂. F is a neutral fluorine atom, not F⁻.')];
  } else {
    context = [text('Experiments at constant temperature show second order with respect to NO₂ and zero order with respect to CO when CO concentration is independently varied.'),
      formula('Measured: rate = k[NO₂]²'), formula('Overall: CO + NO₂ → NO + CO₂'),
      text('Select a possible two-step mechanism consistent with both results. Each first step shown is elementary and rate determining. O denotes a neutral oxygen atom.')];
    parts = [choice('mechanism', 'Which proposed mechanism matches the measured orders and the overall equation?', [
      [formula('Step 1 (slow): NO₂ → NO + O'), formula('Step 2 (fast): O + CO → CO₂')],
      [formula('Step 1 (slow): NO₂ + CO → NO + CO₂'), formula('Step 2 (fast): NO + NO₂ → N₂O₃')],
      [formula('Step 1 (slow): 2NO₂ → NO + NO₃'), formula('Step 2 (fast): NO₃ + CO → NO₂ + CO₂')],
    ], 2)];
    correctResponses = { mechanism: { kind: 'choice' as const, selected: ['2'] } };
    workedAnswer = [formula('Step 1 (slow): 2NO₂ → NO + NO₃'), formula('Step 2 (fast): NO₃ + CO → NO₂ + CO₂'),
      text('The slow elementary step predicts rate = k[NO₂]². Cancelling NO₃ and one NO₂ from the summed steps gives CO + NO₂ → NO + CO₂. The first alternative sums correctly but predicts first order in NO₂. The second predicts rate = k[NO₂][CO] and sums to CO + 2NO₂ → CO₂ + N₂O₃, which is a different overall reaction. Rate data identify a consistent proposal; they do not prove a unique mechanism.')];
  }
  return {
    gem: 'mechanisms',
    question: {
      ref: { activityId: 'alevel/acid-base-calculations', questionId: `RATE-POC-mechanisms-L${level}`, seed, level },
      title: level === 1 ? 'Rate equation from a slow step' : level === 2 ? 'Complete a two-step mechanism' : 'Match a mechanism to experimental orders',
      context, layout: 'multipart', submission: 'all-required-parts', parts,
      scaffolds: level === 1 ? [{ id: 'slow-step', level: 1, content: [text('Use the reactants in the elementary slow first step to predict the concentration factors. Check the overall equation by adding steps and cancelling intermediates.')], purpose: 'Connect elementary slow-step reactants to rate law.' }] : [],
      hints: [], workedAnswer, sources,
    },
    correctResponses,
    validation: { specification: ['5.1.1(a)', '5.1.1(i)'], seeded: false, chemistryReview: 'All offered step equations conserve atoms and charge. Correct steps cancel intermediates and yield the specified overall equation. Rate predictions use a supplied elementary slow first step, without equilibrium/intermediate substitution or an inference from excess reactant.', sourceUnits: level === 2 ? ['OCR_2024_JUN_H432-01_Q20_P_B'] : ['OCR_2022_JUN_H432-01_Q16_P_B'], oldClassificationNote: 'OCR_2024 Q20(b) is mechanism content under 5.1.1(i), regardless of its historical l6-t1-9-1 mapping; atlas preserved.' },
  };
};
