import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const titrationAdapter: CurriculumAdapter = {
  id: 'alevel/ph-titration-curves',
  provider: async () => (await import('./provider.ts')).titrationProvider,
  marking: async () => (await import('./marking.ts')).titrationMarking,
  idleAllowance: () => 600000,
  idleRationale:
    'Original titration allowance: ten minutes for the multipart equilibrium calculation, curve construction and indicator selection at both supported levels.',
};
