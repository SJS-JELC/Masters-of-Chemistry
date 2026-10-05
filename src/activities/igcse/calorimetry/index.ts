import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const calorimetryAdapter: CurriculumAdapter = {
  id: 'igcse/calorimetry',
  provider: () => import('./provider.ts').then((m) => m.calorimetryProvider),
  marking: () => import('./marking.ts').then((m) => m.calorimetryMarking),
  idleAllowance: () => 180000,
  idleRationale:
    'Original IGCSEQuestionTime: three minutes idle for linked calorimetry calculations; first all-parts submission stops independent timing.',
};
