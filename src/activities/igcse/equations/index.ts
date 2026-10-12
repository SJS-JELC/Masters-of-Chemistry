import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const equationsAdapter: CurriculumAdapter = {
  id: 'igcse/equations',
  provider: () => import('./provider.ts').then((m) => m.equationsProvider),
  marking: () => import('./marking.ts').then((m) => m.equationsMarking),
  idleAllowance: () => 180000,
  idleRationale:
    'Three minutes idle allows counting atoms and translating a coherent reaction description into a symbol equation. Shared first assessment stops independent timing.',
};
