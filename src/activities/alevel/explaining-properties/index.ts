import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const propertiesAdapter: CurriculumAdapter = {
  id: 'alevel/explaining-properties',
  provider: async () => (await import('./provider.ts')).propertiesProvider,
  marking: async () => (await import('./marking.ts')).propertiesMarking,
  idleAllowance: () => 180000,
  idleRationale:
    'Three minutes for reading multipart ionic-property explanations, inspecting lattice fragments and writing short chemically meaningful replacements. Shared active timing stops on first assessment, hidden/background/suspension, or pause; no visible timer.',
};
