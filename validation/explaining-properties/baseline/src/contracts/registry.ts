import type { IdleLimitMs, LearningReviewPolicy } from './attempt';
import type {
  ALevelActivityId,
  ActivityId,
  Course,
  GemId,
  IGCSEActivityId,
  Level,
  SourceReference,
} from './identity';
import type { C3L6Challenge, C3L6Dependencies, C3L6Policy, IsomerChallenge, IsomerPolicy } from './olympiad';
import type { MarkingPolicy, Question, QuestionProvider } from './question';
import type { MasterySetting } from './session';

export interface GemRegistration {
  readonly id: GemId;
  readonly topicId: string;
  readonly label: string;
  readonly supportedLevels: readonly Level[];
  readonly mastery: MasterySetting;
}
interface RegistrationBase {
  readonly title: string;
  readonly release: 'included'; // only authorised registrations exist in the runtime registry
  readonly source: readonly SourceReference[];
}
export type CurriculumRegistration = RegistrationBase &
  (
    | Readonly<{ course: 'alevel'; id: ALevelActivityId }>
    | Readonly<{ course: 'igcse'; id: IGCSEActivityId }>
  ) &
  Readonly<{
    strand: 'curriculum';
    gems: readonly GemRegistration[];
    renderer: 'question-player';
    provider: () => Promise<QuestionProvider>;
    marking: () => Promise<MarkingPolicy>;
    learningReview?: () => Promise<LearningReviewPolicy>;
    idleAllowance: (question: Question) => IdleLimitMs;
    idleRationale: string;
    revision: true;
  }>;
export type OlympiadRegistration = RegistrationBase &
  (Readonly<{
    id: 'alevel/c3l6-organic-reactions';
    course: 'alevel';
    strand: 'olympiad';
    renderer: 'staged-molecule-challenge';
    dependencies: C3L6Dependencies;
    provider: () => Promise<C3L6Challenge>;
    marking: () => Promise<C3L6Policy>;
    revision: false;
    gems?: never;
    mastery?: never;
    idleAllowance?: never;
  }> | Readonly<{
    id: 'alevel/olympiad-2011-q4';
    course: 'alevel';
    strand: 'olympiad';
    renderer: 'seven-isomer-challenge';
    provider: () => Promise<IsomerChallenge>;
    marking: () => Promise<IsomerPolicy>;
    revision: false;
    gems?: never;
    mastery?: never;
    idleAllowance?: never;
  }>);
export type ActivityRegistration = CurriculumRegistration | OlympiadRegistration;
/** Explicit source-owned array, checked for duplicates/exact scope by integration. */
export interface ActivityRegistry {
  readonly activities: readonly ActivityRegistration[];
  readonly get: (id: ActivityId) => ActivityRegistration | undefined;
  readonly curriculumFor: (course: Course) => readonly CurriculumRegistration[];
}
