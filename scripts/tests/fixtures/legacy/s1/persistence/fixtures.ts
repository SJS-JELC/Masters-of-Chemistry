import type { CurriculumWrite } from '../../../../../../src/contracts/repository.ts';
import type { StudentAttempt } from '../../../../../../src/contracts/attempt.ts';
import type { C3L6Progress } from '../../../../../../src/contracts/olympiad.ts';
export const namespace = { course: 'alevel' as const, profileId: 'synthetic-persistence' };
export function draft(attemptId = 'attempt-1'): Extract<StudentAttempt, {
    phase: 'answering';
}> {
    return { mode: 'student', namespace, attemptId, ref: { activityId: 'alevel/acid-base-calculations', questionId: 'AB2-fixture-1', seed: 17, level: 1 }, target: { course: 'alevel', activityId: 'alevel/acid-base-calculations', gemId: 'u6-t1-1-2', level: 1 }, currentResponses: { answer: { kind: 'numeric', raw: '0.10', unit: 'mol dm-3' } }, assistance: [], phase: 'answering', timing: { attemptId, activeMs: 5000, idleLimitMs: 180000, finished: false } };
}
export function assessed(attemptId = 'attempt-1', earned = 1): CurriculumWrite {
    const { timing: clock, ...base } = draft(attemptId), timing = { activeMs: clock.activeMs, idleLimitMs: clock.idleLimitMs };
    const firstResponse = { responses: base.currentResponses, submittedAt: 1000, timing, assistance: [] };
    const firstAssessment = { kind: 'marked' as const, assessedAt: 1100, marks: { earned, available: 1, points: [{ partId: 'answer', pointId: 'p1', earned, available: 1, message: 'Synthetic persistence fixture' }] }, score: (earned === 1 ? 1 : 0) as 0 | 1, selfAssessed: false as const };
    const attempt: StudentAttempt = { ...base, phase: 'assessed', firstResponse, firstAssessment };
    return { attempt, evidence: { kind: 'curriculum', id: attemptId, profileId: namespace.profileId, course: 'alevel', activityId: 'alevel/acid-base-calculations', gemId: 'u6-t1-1-2', level: 1, score: firstAssessment.score, completedAt: 1100, provenance: 'new-attempt', independent: true, timing, ref: base.ref, firstResponse, firstAssessment }, session: { kind: 'practice', namespace, id: 'practice-1', target: base.target, selection: 'fixed-level', currentAttemptId: attemptId, previousQuestionIds: [] } };
}
export function olympiad(profileId = namespace.profileId): C3L6Progress { return { kind: 'olympiad-completion', course: 'alevel', profileId, activityId: 'alevel/c3l6-organic-reactions', stage: 'intro', classifications: {}, drawingsB: { A: { kind: 'molecule', graph: { atoms: [{ id: 1, element: 'C', x: 0, y: 0, h: 4 }], bonds: [] }, history: [] } }, drawingsC: {}, selected: { b: 'A', c: 'R' }, aCheck: null, unitChecks: {}, slotChecks: {}, completed: { a: false, b: false, c: false } }; }
export const historic = [{ id: 'historical-untimed', leafId: 'l6-t2-1-4', level: 2, score: 0.5, completedAt: 123 }, { id: 'historical-old-acid', leafId: 'u6-t1-1-2', level: 1, score: 1, completedAt: 124, progressionVersion: 1 }];
