import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const structureAdapter: CurriculumAdapter = {
  id: 'igcse/structure-and-bonding',
  provider: () => import('./provider.ts').then((module) => module.structureProvider),
  marking: () => import('./marking.ts').then((module) => module.structureMarking),
  idleAllowance: () => 180000,
  idleRationale:
    'Original IGCSEQuestionTime uses a 180000 ms idle allowance for written structure/property reasoning. Independent timing ends when all written sections freeze, before sequential rubric self-review.',
};
