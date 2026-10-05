import type {
  AttemptId,
  CurriculumQuestionRef,
  CurriculumTarget,
  Namespace,
  QuestionRef,
} from './identity';
import type { MarkingIssue, Question, RawMarks, Response, Responses, TextRange } from './question';

export type IdleLimitMs = 60000 | 180000 | 300000 | 600000;
export interface TimingResult {
  readonly activeMs: number;
  readonly idleLimitMs: IdleLimitMs;
}
export interface TimingCheckpoint extends TimingResult {
  readonly attemptId: AttemptId;
  readonly finished: boolean;
}
export interface ClockSample {
  readonly monotonicMs: number;
  readonly wallMs: number;
  readonly visible: boolean;
  readonly focused: boolean;
  readonly suspended: boolean;
}
export interface ActiveClock {
  readonly attemptId: AttemptId;
  readonly sample: (sample: ClockSample) => void;
  readonly interact: (sample: ClockSample) => void;
  readonly pause: (sample: ClockSample) => void;
  readonly checkpoint: () => TimingCheckpoint | undefined;
  readonly finish: (sample: ClockSample) => TimingResult | undefined;
}
export interface Assistance {
  readonly kind: 'hint' | 'reveal' | 'worked-answer';
  readonly supportId: string;
  readonly at: number;
}
export type RubricJudgement =
  | Readonly<{ pointId: string; status: 'unjudged' }>
  | Readonly<{ pointId: string; status: 'awaiting-evidence' }>
  | Readonly<{ pointId: string; status: 'not-met' }>
  | Readonly<{ pointId: string; status: 'met'; evidence: TextRange }>;
export interface RubricReview {
  readonly partId: string;
  readonly lockedText: string;
  readonly judgements: readonly RubricJudgement[];
  readonly activePointId: string | null;
}
/** Produced only on an accepted submission; response/timing remain immutable afterwards. */
export interface FrozenResponse {
  readonly responses: Responses;
  readonly submittedAt: number;
  readonly timing: TimingResult;
  readonly assistance: readonly Assistance[];
}
export type Assessment =
  | Readonly<{
      kind: 'marked';
      assessedAt: number;
      marks: RawMarks;
      score: 0 | 0.5 | 1;
      selfAssessed: false;
    }>
  | Readonly<{
      kind: 'self-rubric';
      assessedAt: number;
      marks: RawMarks;
      score: 0 | 0.5 | 1;
      selfAssessed: true;
      reviews: readonly RubricReview[];
    }>
  | Readonly<{
      kind: 'self-drawing';
      assessedAt: number;
      marks: RawMarks;
      score: 0 | 0.5 | 1;
      selfAssessed: true;
      checks: readonly DrawingSelfCheck[];
    }>
  | Readonly<{ kind: 'revealed'; assessedAt: number; independent: false }>;
export interface DrawingSelfCheck {
  readonly partId: string;
  readonly judgement: 'pending' | 'pass' | 'fail';
}
export interface ValidAlternativeDecision {
  readonly partId: string;
  readonly pointId: string;
  readonly judgement: 'equivalent' | 'not-equivalent';
  readonly reviewer: 'student' | 'teacher';
}
/** Learning feedback after automatic assessment; cannot become new mastery evidence. */
export interface PostAssessmentReview {
  readonly kind: 'post-assessment-learning';
  readonly decisions: readonly ValidAlternativeDecision[];
  readonly reviewedMarks: RawMarks;
  readonly score?: never;
  readonly timing?: never;
  readonly independent?: never;
}
/** Ephemeral feedback for current automatic responses; never persisted as evidence. */
export type CorrectionFeedback = (
  | Readonly<{ kind: 'correction-learning'; status: 'correct' | 'wrong'; marks: RawMarks }>
  | Readonly<{
      kind: 'correction-learning';
      status: 'incomplete' | 'unrecognized';
      issues: readonly MarkingIssue[];
    }>
) &
  Readonly<{ score?: never; timing?: never; independent?: never }>;
/** Separate pure activity review policy checks source override eligibility/gates. */
export interface LearningReviewPolicy {
  readonly review: (
    question: Question,
    firstResponse: FrozenResponse,
    firstAssessment: Assessment,
    currentResponses: Responses,
    decisions: readonly ValidAlternativeDecision[],
  ) => PostAssessmentReview;
}
interface StudentAttemptBase {
  readonly mode: 'student';
  readonly namespace: Namespace;
  readonly attemptId: AttemptId;
  readonly ref: CurriculumQuestionRef;
  readonly target: CurriculumTarget;
  readonly currentResponses: Responses;
  readonly assistance: readonly Assistance[];
  /** Current action presentation only; immutable first evidence never includes these flags. */
  readonly currentResponseChanged?: true;
  readonly currentGiveUp?: true;
}
export type StudentAttempt = StudentAttemptBase &
  (
    | Readonly<{
        phase: 'answering';
        timing: TimingCheckpoint;
        firstResponse?: never;
        firstAssessment?: never;
        learningReview?: never;
      }>
    | Readonly<{
        phase: 'rubric-review';
        firstResponse: FrozenResponse;
        reviews: readonly RubricReview[];
        automaticMarks?: RawMarks;
        timing?: never;
        firstAssessment?: never;
        learningReview?: never;
      }>
    | Readonly<{
        phase: 'drawing-review';
        firstResponse: FrozenResponse;
        checks: readonly DrawingSelfCheck[];
        automaticMarks: RawMarks;
        timing?: never;
        firstAssessment?: never;
        learningReview?: never;
      }>
    | Readonly<{
        phase: 'assessed';
        firstResponse: FrozenResponse;
        firstAssessment: Assessment;
        learningReview?: PostAssessmentReview;
        timing?: never;
      }>
  );
/** Teacher and review render the same player but cannot produce a persistence bundle. */
export interface PreviewAttempt {
  readonly mode: 'teacher' | 'review';
  readonly ref: QuestionRef;
  readonly currentResponses: Responses;
}
export type PlayerAttempt = StudentAttempt | PreviewAttempt;
export type AttemptCommand =
  | Readonly<{ kind: 'respond'; partId: string; response: Response }>
  | Readonly<{ kind: 'clear' }>
  | Readonly<{ kind: 'assist'; assistance: Assistance }>
  | Readonly<{ kind: 'submit'; at: number }>
  | Readonly<{ kind: 'check-correction' }>
  | Readonly<{ kind: 'judge-rubric'; partId: string; judgement: RubricJudgement }>
  | Readonly<{ kind: 'finish-rubric'; at: number }>
  | Readonly<{ kind: 'confirm-drawing'; partId: string; matches: boolean; at: number }>
  | Readonly<{ kind: 'review-valid-alternative'; decision: ValidAlternativeDecision }>
  | Readonly<{ kind: 'pause' }>;
export type AttemptTransition =
  | Readonly<{ accepted: true; state: StudentAttempt; correctionFeedback?: CorrectionFeedback }>
  | Readonly<{ accepted: false; state: StudentAttempt; message: string }>;
/** The reducer is pure; clock/policy are explicit inputs in implementation. */
export interface AttemptController {
  readonly dispatch: (command: AttemptCommand) => AttemptTransition;
  readonly state: () => StudentAttempt;
  readonly sample: (sample: ClockSample) => StudentAttempt;
  readonly interact: (sample: ClockSample) => StudentAttempt;
  readonly checkpoint: () => StudentAttempt;
}
