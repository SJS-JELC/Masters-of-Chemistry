import type {
  MarkingPolicy,
  MarkingOutcome,
  Responses,
  MarkPointResult,
  LearningReviewPolicy,
} from '../../../contracts/index.ts';
import type { PracticalRecord, PracticalResponse } from './types.ts';
import { record, correctionSegments } from './provider.ts';
import { gradeQuestion } from './source-core.js';
import { score } from '../energy-enthalpy/marking.ts';
export function sourceResponse(q: PracticalRecord, responses: Responses): PracticalResponse {
  const answer: PracticalResponse = { fields: {}, selectedId: '', errorId: '', overrides: [] };
  q.fields.forEach((f, i) => {
    const r = q.correction && i === 0 ? responses.correction : responses[f.id];
    answer.fields[f.id] =
      r?.kind === 'correction'
        ? r.replacement
        : r?.kind === 'text'
          ? r.value
          : r?.kind === 'choice'
            ? f.multiselect
              ? [...r.selected]
              : (r.selected[0] ?? '')
            : '';
  });
  const r = responses.correction;
  if (r?.kind === 'correction' && r.selections.length === 1) {
    const s = r.selections[0];
    const matched = correctionSegments(q).find(
      (seg) => s && seg.start === s.start && seg.end === s.end && seg.text === s.text,
    );
    answer.errorId = matched?.id ?? '';
  }
  return answer;
}
function mark(
  question: Parameters<MarkingPolicy['mark']>[0],
  responses: Responses,
): MarkingOutcome {
  const q = record(question.ref.questionId),
    answer = sourceResponse(q, responses),
    issues: Extract<MarkingOutcome, { accepted: false }>['issues'][number][] = [];
  if (q.correction) {
    const r = responses.correction;
    if (r?.kind !== 'correction' || r.selections.length !== 1 || !r.replacement.trim())
      issues.push({
        partId: 'correction',
        message: 'Select one source phrase and enter its replacement.',
      });
    else if (!answer.errorId)
      issues.push({
        partId: 'correction',
        message: 'Select exactly one of the displayed source phrases.',
      });
  }
  q.fields.forEach((f, i) => {
    const r = responses[f.id];
    if (q.correction && i === 0) return;
    const value = answer.fields[f.id];
    if (
      f.multiselect
        ? !Array.isArray(value) || value.length !== (f.selectCount ?? f.answers.length)
        : !String(value ?? '').trim()
    )
      issues.push({
        partId: f.id,
        message: f.multiselect
          ? `Select exactly ${f.selectCount ?? f.answers.length} options.`
          : 'Complete this answer.',
      });
    if (
      f.options &&
      r?.kind === 'choice' &&
      (new Set(r.selected).size !== r.selected.length ||
        r.selected.some((s) => !f.options?.includes(s)))
    )
      issues.push({ partId: f.id, message: 'Choose from the displayed options.' });
  });
  if (issues.length) return { accepted: false, issues };
  const result = gradeQuestion(q, answer);
  const points: MarkPointResult[] = result.points.map((p) => {
    const f = q.fields.find((f) => f.id === p.id),
      partId = p.id === 'error' || (q.correction && p.id === q.fields[0]?.id) ? 'correction' : p.id;
    return {
      partId,
      pointId: p.id,
      earned: p.correct ? 1 : 0,
      available: 1,
      message: p.feedback ? `${p.model} — ${p.feedback}` : p.model,
      ...(f && !f.options
        ? { textClassification: p.correct ? ('accepted' as const) : ('rejected' as const) }
        : {}),
      ...(p.overrideable
        ? {
            learningReview: {
              kind: 'valid-alternative' as const,
              modelAnswer: p.model,
              rubric: [
                {
                  kind: 'text' as const,
                  text: p.feedback || 'Award only for a chemically equivalent response.',
                },
              ],
              eligible: true,
            },
          }
        : {}),
    };
  });
  return {
    accepted: true,
    marks: { earned: result.correctCount, available: result.total, points },
  };
}
export const practicalMarking: MarkingPolicy = {
  id: 'igcse-practical-source',
  mark,
  masteryScore: score,
};
/** Eligibility is rechecked against frozen source input; changed answers cannot bypass correction gates. */
export const practicalLearningReview: LearningReviewPolicy = {
  review: (q, first, assessment, _current, decisions) => {
    if (assessment.kind !== 'marked')
      throw Error('Practical alternatives require first automatic marks.');
    const eligibility = mark(q, first.responses);
    if (!eligibility.accepted) throw Error('Frozen practical input is incomplete.');
    const seen = new Set<string>();
    for (const d of decisions) {
      const key = d.partId + ':' + d.pointId;
      if (
        seen.has(key) ||
        !['equivalent', 'not-equivalent'].includes(d.judgement) ||
        !['student', 'teacher'].includes(d.reviewer)
      )
        throw Error('Invalid practical review decision.');
      seen.add(key);
      const point = eligibility.marks.points.find(
        (p) => p.partId === d.partId && p.pointId === d.pointId,
      );
      if (!point?.learningReview?.eligible || point.earned === point.available)
        throw Error('Correction prerequisites or free-text alternative eligibility not met.');
    }
    const points = assessment.marks.points.map((p) => ({
      ...p,
      earned: decisions.some(
        (d) => d.partId === p.partId && d.pointId === p.pointId && d.judgement === 'equivalent',
      )
        ? p.available
        : p.earned,
    }));
    return {
      kind: 'post-assessment-learning',
      decisions,
      reviewedMarks: {
        earned: points.reduce((n, p) => n + p.earned, 0),
        available: assessment.marks.available,
        points,
      },
    };
  },
};
