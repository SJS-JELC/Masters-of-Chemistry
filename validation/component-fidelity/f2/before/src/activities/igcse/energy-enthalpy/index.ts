import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const energyEnthalpyAdapter: CurriculumAdapter = {
  id: 'igcse/energy-enthalpy',
  provider: () => import('./provider.ts').then((m) => m.energyProvider),
  marking: () => import('./marking.ts').then((m) => m.energyMarking),
  idleAllowance: () => 180000,
  idleRationale:
    'Original IGCSEQuestionTime facade grants 180000 ms for written energy reasoning and profile construction. Shared first assessment ends independent timing.',
};
