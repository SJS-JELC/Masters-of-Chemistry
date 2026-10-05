import type {
  MarkingPolicy,
  MarkingOutcome,
  Question,
  Responses,
  RawMarks,
} from '../../../contracts/index.ts';
/** No keyword/AI marking: the shared controller freezes the text and collects ordered rubric evidence. */
function mark(question: Question, _responses: Responses): MarkingOutcome {
  if (question.parts.length)
    return {
      accepted: false,
      issues: question.parts.map((part) => ({
        partId: part.id,
        message:
          'Written explanations require sequential evidence-linked self-review after the response is frozen.',
      })),
    };
  return { accepted: true, marks: { earned: 0, available: 0, points: [] } };
}
/** Preserve MastersProgress.questionScore: all points=1; some points=0.5; none=0. */
export function structureMasteryScore(marks: RawMarks): 0 | 0.5 | 1 {
  if (
    !marks.points.length ||
    marks.points.some((point) => point.available !== 1 || ![0, 1].includes(point.earned)) ||
    marks.available !== marks.points.length ||
    marks.earned !== marks.points.reduce((sum, point) => sum + point.earned, 0)
  )
    throw Error('Structure mastery requires the complete boolean source rubric.');
  return marks.earned === marks.available ? 1 : marks.earned > 0 ? 0.5 : 0;
}
export const structureMarking: MarkingPolicy = {
  id: 'igcse-structure-source-rubric',
  mark,
  masteryScore: structureMasteryScore,
};
