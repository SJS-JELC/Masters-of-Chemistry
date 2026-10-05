import type { MarkingPolicy } from '../../../contracts/index.ts';
import { integrity, sourceResponse } from '../../../chemistry/electron-configuration/engine.ts';
import { mark } from '../../../chemistry/electron-configuration/core.js';
import { getVariant } from '../../../chemistry/electron-configuration/identity.ts';
export const electronConfigurationsMarking: MarkingPolicy = {
  id: 'electron-source-marking',
  mark(question, responses) {
    const response = responses.configuration;
    if (response?.kind !== 'electron-configuration')
      return {
        accepted: false,
        issues: [{ partId: 'configuration', message: 'Enter a configuration response.' }],
      };
    const check = integrity(response);
    if (check.status !== 'ready')
      return {
        accepted: false,
        issues: check.issues.map((issue) => ({ partId: 'configuration', message: issue.message })),
      };
    const result = mark(getVariant(question.ref.questionId), sourceResponse(response));
    if (!result.accepted)
      return {
        accepted: false,
        issues: [
          {
            partId: 'configuration',
            message: result.message ?? 'Complete the configuration response.',
          },
        ],
      };
    const earned = result.correct ? 1 : 0;
    return {
      accepted: true,
      marks: {
        earned,
        available: 1,
        points: [
          {
            partId: 'configuration',
            pointId: 'configuration-result',
            earned,
            available: 1,
            message: result.correct
              ? 'Correct configuration.'
              : (result.issues ?? ['Check the configuration.']).join(' '),
          },
        ],
      },
    };
  },
  masteryScore: (marks) => (marks.earned === marks.available ? 1 : 0),
};
