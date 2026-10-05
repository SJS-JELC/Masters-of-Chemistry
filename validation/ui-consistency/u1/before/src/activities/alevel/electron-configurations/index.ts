import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
export const electronConfigurationsAdapter: CurriculumAdapter = {
  id: 'alevel/electron-configurations',
  provider: async () => (await import('./provider.ts')).electronConfigurationsProvider,
  marking: async () => (await import('./marking.ts')).electronConfigurationsMarking,
  idleAllowance: (question) => {
    const part = question.parts[0];
    return part?.kind === 'electron-configuration' &&
      part.markingPolicyId.startsWith('electron:identify:')
      ? 60000
      : 180000;
  },
  idleRationale:
    'Exact active levels-app electron allowance: three minutes for build and isoelectronic matching; one minute for identifying the element.',
};
