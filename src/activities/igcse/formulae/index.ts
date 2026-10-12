import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const formulaeAdapter: CurriculumAdapter = {
  id: 'igcse/formulae',
  provider: () => import('./provider.ts').then((m) => m.formulaeProvider),
  marking: () => import('./marking.ts').then((m) => m.formulaeMarking),
  idleAllowance: () => 60000,
  idleRationale:
    'One minute without interaction allows recalling ion charges and writing a short neutral formula. Shared first assessment stops independent timing.',
};
