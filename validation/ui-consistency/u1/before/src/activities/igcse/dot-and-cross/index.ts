import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const igcseDotCrossAdapter: CurriculumAdapter = {
  id: 'igcse/dot-and-cross',
  provider: async () => (await import('./provider.ts')).igcseDotCrossProvider,
  marking: async () => (await import('./marking.ts')).igcseDotCrossMarking,
  idleAllowance: () => 180000,
  idleRationale:
    'Original IGCSE igcse-question-time.js uses180000ms (three minutes) for all spatial dot-and-cross questions, including larger level3 covalent diagrams.',
};
