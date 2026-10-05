import type { Assessment, AttemptCommand, MarkingOutcome, PostAssessmentReview, StudentAttempt } from '../../../src/contracts';

/** Unrecognized energy text preserves work and does not create a first assessment. */
export const unrecognizedEnergyText = {
  accepted: false, issues: [{ partId: 'energy-axis', textClassification: 'unrecognized',
    message: 'Use the requested word or phrase, or ask your teacher.',
    rubricSupport: [{ kind: 'text', text: 'The vertical axis represents energy.' }] }],
} as const satisfies MarkingOutcome;

export const practicalAfterReview = {
  mode: 'student', namespace: { course: 'igcse', profileId: 'synthetic' }, attemptId: 'practical-first',
  ref: { activityId: 'igcse/energetics-practical', questionId: 'EP-BJLHC1', seed: 0, level: 2 },
  target: { course: 'igcse', activityId: 'igcse/energetics-practical', gemId: 'lower-10-2', level: 2 },
  phase: 'assessed', currentResponses: { property: { kind: 'text', value: 'polystyrene impedes thermal energy conduction' } },
  assistance: [], firstResponse: {
    responses: { property: { kind: 'text', value: 'polystyrene impedes thermal energy conduction' } },
    submittedAt: 1000, timing: { activeMs: 800, idleLimitMs: 180000 }, assistance: [],
  },
  firstAssessment: { kind: 'marked', assessedAt: 1000, score: 0, selfAssessed: false,
    marks: { earned: 0, available: 1, points: [{ partId: 'property', pointId: 'property', earned: 0, available: 1,
      message: 'Compare with the model answer.', textClassification: 'rejected',
      learningReview: { kind: 'valid-alternative', eligible: true, modelAnswer: 'poor thermal conductor',
        rubric: [{ kind: 'text', text: 'Accept a valid equivalent description of thermal insulation.' }] } }] } },
  learningReview: { kind: 'post-assessment-learning',
    decisions: [{ partId: 'property', pointId: 'property', judgement: 'equivalent', reviewer: 'student' }],
    reviewedMarks: { earned: 1, available: 1, points: [{ partId: 'property', pointId: 'property', earned: 1, available: 1, message: 'Self-reviewed equivalent wording.' }] },
  },
} as const satisfies StudentAttempt;
export const validAlternativeCommand = {
  kind: 'review-valid-alternative', decision: { partId: 'property', pointId: 'property', judgement: 'not-equivalent', reviewer: 'student' },
} as const satisfies AttemptCommand;

// @ts-expect-error Learning review can change displayed marks, never independent score/timing.
export const scoringReview: PostAssessmentReview = { ...practicalAfterReview.learningReview, score: 1 };
// @ts-expect-error Post-assessment review is not an assessment for first/mastery evidence.
export const replacementAssessment: Assessment = practicalAfterReview.learningReview;
// @ts-expect-error Valid-equivalent self review cannot mutate first automatic evidence.
practicalAfterReview.firstAssessment.score = 1;
