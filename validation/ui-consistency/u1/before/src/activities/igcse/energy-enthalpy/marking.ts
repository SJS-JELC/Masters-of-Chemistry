import type {
  MarkingPolicy,
  MarkingOutcome,
  Question,
  Responses,
  MarkPointResult,
  RawMarks,
} from '../../../contracts/index.ts';
import { bank, record } from './provider.ts';
import { markField, check } from './source-core.js';
import { checkProfile } from '../../../chemistry/energy-profile/index.ts';
export const score = (marks: RawMarks): 0 | 0.5 | 1 =>
  marks.earned === marks.available ? 1 : marks.earned > 0 ? 0.5 : 0;
function mark(question: Question, responses: Responses): MarkingOutcome {
  const q = record(question.ref.questionId),
    points: MarkPointResult[] = [],
    issues: Extract<MarkingOutcome, { accepted: false }>['issues'][number][] = [];
  if (q.fields)
    q.fields.forEach((field, i) => {
      const partId = `field-${i}`,
        response = responses[partId],
        value =
          response?.kind === 'text'
            ? response.value
            : response?.kind === 'choice'
              ? (response.selected[0] ?? '')
              : '';
      const state = markField(field, value, bank);
      if (state === 'empty' || state === 'unknown')
        issues.push({
          partId,
          message:
            state === 'empty'
              ? 'Complete this answer.'
              : 'Not recognised. Use the requested word or phrase, or ask your teacher. No attempt is recorded.',
          textClassification: state === 'empty' ? 'empty' : 'unrecognized',
          rubricSupport: [{ kind: 'text', text: field.label }],
        });
      else
        points.push({
          partId,
          pointId: 'answer',
          earned: state === 'correct' ? 1 : 0,
          available: 1,
          message: q.points[i] ?? field.accept[0] ?? '',
          textClassification: state === 'correct' ? 'accepted' : 'rejected',
        });
    });
  else {
    const response = responses.profile;
    if (response?.kind !== 'energy-profile')
      issues.push({ partId: 'profile', message: 'Complete the profile.' });
    else {
      const valid = checkProfile(response, q);
      if (valid.status !== 'ready')
        issues.push(
          ...valid.issues.map((issue) => ({ partId: 'profile', message: issue.message })),
        );
      else
        check(q, response, bank).forEach((correct, i) =>
          points.push({
            partId: 'profile',
            pointId: q.checks?.[i] ?? `point-${i}`,
            earned: correct ? 1 : 0,
            available: 1,
            message: q.points[i] ?? '',
          }),
        );
    }
  }
  return issues.length
    ? { accepted: false, issues }
    : {
        accepted: true,
        marks: {
          earned: points.reduce((n, p) => n + p.earned, 0),
          available: points.reduce((n, p) => n + p.available, 0),
          points,
        },
      };
}
export const energyMarking: MarkingPolicy = {
  id: 'igcse-energy-source',
  mark,
  masteryScore: score,
};
