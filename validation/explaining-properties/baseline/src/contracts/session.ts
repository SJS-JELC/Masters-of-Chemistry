import type {
  ALevelActivityId,
  AttemptId,
  Course,
  CurriculumQuestionRef,
  CurriculumTarget,
  GemId,
  IGCSEActivityId,
  Level,
  MasteryScore,
  Namespace,
  SessionId,
} from './identity';
import type { Assessment, FrozenResponse, TimingResult } from './attempt';

/** Historical data may lack timing, response, question and assistance; keep gaps absent. */
interface EvidenceBase {
  readonly kind: 'curriculum';
  readonly id: AttemptId;
  readonly profileId: string;
  readonly gemId: GemId;
  readonly score: MasteryScore;
  readonly completedAt: number;
  readonly selfAssessed?: boolean;
  readonly assisted?: boolean;
}
export type MarkedAssessment = Exclude<Assessment, { readonly kind: 'revealed' }>;
export type CurriculumEvidence = EvidenceBase &
  (
    | Readonly<{ course: 'alevel'; activityId?: ALevelActivityId; level: Level; grade?: never }>
    | Readonly<{ course: 'igcse'; activityId?: IGCSEActivityId; grade: Level; level?: never }>
  ) &
  (
    | Readonly<{
        provenance: 'new-attempt';
        independent: true;
        timing: TimingResult;
        ref: CurriculumQuestionRef;
        firstResponse: FrozenResponse;
        firstAssessment: MarkedAssessment;
      }>
    | Readonly<{
        provenance: 'legacy-import';
        timing?: TimingResult;
        ref?: CurriculumQuestionRef;
        firstResponse?: FrozenResponse;
        firstAssessment?: MarkedAssessment;
        sourceKey?: string;
        sourceLeafId?: string;
        progressionVersion?: 1 | 2;
        sourceQuestionId?: string;
        sourceFamily?: string;
        sourceStrand?: string;
      }>
  );
export interface MasterySetting {
  readonly gemId: GemId;
  readonly supportedLevels: readonly Readonly<{ level: Level; halfLife: number; label: string }>[];
  readonly threshold: number;
  readonly comparison: 'strictly-greater';
  readonly historicalAliases: readonly GemId[];
  /** Acid's old progression must not seed its new progression; preserve historical records. */
  readonly legacySourceKeys: readonly string[];
  readonly activeProgressionVersion?: 1 | 2;
}
export interface MasterySummary {
  readonly gemId: GemId;
  readonly level: Level;
  readonly score: number | null;
  readonly count: number;
  readonly mastered: boolean;
  readonly lastCompletedAt: number | null;
}
export interface CourseMastery {
  readonly course: Course;
  readonly summarize: (
    records: readonly CurriculumEvidence[],
    setting: MasterySetting,
    level: Level,
  ) => MasterySummary;
  readonly nextLevel: (summaries: readonly MasterySummary[]) => Level | null;
}
export interface RevisionLevelState {
  readonly target: CurriculumTarget;
  readonly mode: 'check' | 'practice';
  readonly required: 1 | 2;
  readonly streak: number;
  readonly confirmedAt: number | null;
  readonly initialScore: number | null;
}
export interface RevisionCurrent {
  readonly attemptId: AttemptId;
  readonly target: CurriculumTarget;
  readonly ref: CurriculumQuestionRef | null;
  readonly completed: boolean;
}
export interface RevisionSession {
  readonly kind: 'revision';
  readonly namespace: Namespace;
  readonly id: SessionId;
  readonly createdAt: number;
  readonly status: 'active' | 'paused' | 'complete';
  readonly selectedGemIds: readonly GemId[];
  readonly levels: readonly RevisionLevelState[];
  readonly round: readonly GemId[];
  readonly lastGemId: GemId | null;
  readonly current: RevisionCurrent | null;
  readonly previous: readonly Readonly<{ target: CurriculumTarget; ref: CurriculumQuestionRef }>[];
  readonly submittedAttemptIds: readonly AttemptId[];
}
export interface PracticeSession {
  readonly kind: 'practice';
  readonly namespace: Namespace;
  readonly id: SessionId;
  readonly target: CurriculumTarget;
  readonly selection: 'fixed-level' | 'mastery';
  readonly currentAttemptId: AttemptId | null;
  readonly previousQuestionIds: readonly string[];
  /** Explicit UI pause survives reload; absent historical state means active. */
  readonly paused?: boolean;
}
export type CurriculumSession = PracticeSession | RevisionSession;
export type RevisionOutcome = Readonly<{
  attemptId: AttemptId;
  score: MasteryScore;
  independent: boolean;
  completedAt: number;
}>;
export interface RevisionScheduler {
  readonly next: (
    session: RevisionSession,
    summaries: readonly MasterySummary[],
    now: number,
    attemptId: AttemptId,
  ) => RevisionSession;
  readonly accept: (
    session: RevisionSession,
    outcome: RevisionOutcome,
    summaries: readonly MasterySummary[],
    now: number,
  ) => RevisionSession;
}
