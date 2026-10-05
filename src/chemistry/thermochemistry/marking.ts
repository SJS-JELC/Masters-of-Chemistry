import type { MarkingOutcome, RawMarks, Responses } from '../../contracts/question.ts';
import type { NumericalResponse } from './types.ts';
import { parseNumeric, numericalTolerance } from './presentation.ts';
export function markNumbers(
  parts: readonly NumericalResponse[],
  responses: Responses,
): MarkingOutcome {
  const missing = parts.filter((p) => {
    const r = responses[p.key];
    return r?.kind !== 'numeric' || r.unit !== p.unit || !r.raw.trim();
  });
  if (missing.length)
    return {
      accepted: false,
      issues: missing.map((p) => ({
        partId: p.key,
        message: 'Complete every required numerical response before checking.',
      })),
    };
  const points = parts.map((p) => {
    const r = responses[p.key],
      value = r?.kind === 'numeric' ? parseNumeric(r.raw) : NaN,
      correct =
        Number.isFinite(value) && Math.abs(value - p.expected) <= numericalTolerance(p.expected);
    return {
      partId: p.key,
      pointId: 'numeric',
      earned: correct ? 1 : 0,
      available: 1,
      message: correct
        ? 'Correct to the required numerical precision.'
        : 'This numerical value is incorrect. Compare it with the worked calculation.',
    };
  });
  return {
    accepted: true,
    marks: {
      points,
      earned: points.reduce((sum, p) => sum + p.earned, 0),
      available: points.length,
    },
  };
}
export function score(marks: RawMarks): 0 | 0.5 | 1 {
  return marks.available > 0 && marks.earned === marks.available ? 1 : marks.earned > 0 ? 0.5 : 0;
}
