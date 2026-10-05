import type { CurriculumAdapter } from '../../../catalogue/registry.ts';
import { acidMinutes } from './idle-allowances.ts';
import { decodeAcidCode } from './identity.ts';
/** Engine/banks load only when the shared host opens this activity. */
export const acidAdapter: CurriculumAdapter = {
  id: 'alevel/acid-base-calculations',
  provider: async () => (await import('./provider.ts')).acidProvider,
  marking: async () => (await import('./marking.ts')).acidMarking,
  idleAllowance(question) {
    const { templateId: template } = decodeAcidCode(question.ref.questionId);
    if (!template || !(template in acidMinutes))
      throw Error('No current acid question timing allowance.');
    return (acidMinutes[template as keyof typeof acidMinutes] * 60000) as
      | 60000
      | 180000
      | 300000
      | 600000;
  },
  idleRationale:
    'Exact original 38-template acidMinutes: 1 minute for logarithm conversions, 3 for routine direct calculations, 5 for linked calculations and 10 for demanding applications; based on operations, not visible field count.',
};
