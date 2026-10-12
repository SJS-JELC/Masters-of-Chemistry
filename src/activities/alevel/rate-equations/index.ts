import type { CurriculumAdapter } from '../../../catalogue/registry.ts';

export const rateAdapter: CurriculumAdapter = {
  id: 'alevel/rate-equations',
  provider: async () => (await import('./provider.ts')).rateProvider,
  marking: async () => (await import('./marking.ts')).rateMarking,
  idleAllowance: () => 300000,
  idleRationale: 'Five minutes retained from the checked rate POC for multipart initial-rate tables, graph readings, unit conversion and Arrhenius calculations.',
};
