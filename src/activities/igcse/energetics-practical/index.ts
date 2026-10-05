import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const energeticsPracticalAdapter: CurriculumAdapter = {
  id: 'igcse/energetics-practical',
  provider: () => import('./provider.ts').then((m) => m.practicalProvider),
  marking: () => import('./marking.ts').then((m) => m.practicalMarking),
  learningReview: () => import('./marking.ts').then((m) => m.practicalLearningReview),
  idleAllowance: () => 180000,
  idleRationale:
    'Original IGCSEQuestionTime uses 180000 ms for practical explanations, correction phrases and apparatus/data reasoning. Equivalent-wording learning review cannot alter independent timing.',
};
