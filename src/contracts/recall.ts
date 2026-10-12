import type {
  Course,
  GemId,
  Namespace,
  SourceReference,
  RecallQuestionRef,
  RecallTarget,
} from './identity';
import type { StudentAttemptFor, FrozenResponse, Assessment } from './attempt';
import type { RecallLaunchScope, RecallMode } from '../recall/session-contract';
export type RecallMatching =
  | Readonly<{ kind: 'text'; caseSensitive?: boolean }>
  | Readonly<{ kind: 'chemical' }>
  | Readonly<{
      kind: 'numeric';
      values: readonly number[];
      minimum?: number;
      maximum?: number;
      unit?: string;
    }>
  | Readonly<{
      kind: 'concepts';
      all: readonly (readonly string[])[];
      reject?: readonly string[];
      /** Approved complete-response patterns, combined with concept/negation checks. */
      patterns?: readonly string[];
    }>;
/** Entry controls do not rewrite, correct or canonicalise the learner's raw response. */
export type RecallEntry =
  | Readonly<{ kind: 'text' }>
  | Readonly<{ kind: 'choice'; presentation?: 'buttons'; options: readonly Readonly<{ id: string; label: string }>[] }>
  | Readonly<{ kind: 'numeric'; unit: string }>
  | Readonly<{ kind: 'signed-charge'; requireSign: boolean }>
  | Readonly<{ kind: 'chemical-formula'; notation: 'molecular' }>
  | Readonly<{
      kind: 'chemical-formula';
      notation: 'ion';
      /** Number of numeric characters in the body before charge entry, not their values. */
      atomCountDigits: number;
    }>
  | Readonly<{ kind: 'general-formula' }>;
export type RecallAlternativePolicy =
  | Readonly<{ kind: 'none' }>
  | Readonly<{ kind: 'valid-alternative'; guidance: string }>;
export const CURRENT_RECALL_DEFINITION_ID = 'recall-main-20261010' as const;
export type RecallDefinitionId = typeof CURRENT_RECALL_DEFINITION_ID;
/** Missing definitionId identifies the frozen pre-amendment definition and marker. */
export interface RecallDefinitionReference {
  readonly definitionId?: RecallDefinitionId;
}
export interface RecallFieldOutcome {
  readonly fieldId: string;
  /** Collection entries share the collection partId and use fieldId as pointId. */
  readonly partId: string;
  readonly correct: boolean;
  readonly classification: 'accepted' | 'rejected' | 'empty' | 'unrecognized';
  /** Distinct group assignment is retained; duplicate responses cannot earn twice. */
  readonly matchedGroupId?: string;
  readonly matchedPairId?: string;
  readonly message: string;
  readonly alternativeEligible: boolean;
}
export interface RecallFactOutcome {
  readonly correct: boolean;
  readonly fields: readonly RecallFieldOutcome[];
  readonly missingGroupIds: readonly string[];
}
/** Hidden expected groups; the entry count starts at zero, never at group count. */
export interface RecallExceptionEntryResponse {
  readonly id: string;
  readonly value: string;
}
export interface RecallExceptionCollection {
  readonly id: string;
  readonly label: string;
  readonly responsePrefix: string;
  readonly entry: Readonly<{ kind: 'text' }>;
  readonly alternative?: RecallAlternativePolicy;
  readonly groups: readonly RecallField[];
}
/** A method/result tuple is assigned as a whole, never by independent column order. */
export interface RecallResponsePair {
  readonly id: string;
  readonly fieldIds: readonly string[];
}
export interface RecallAnswerPair {
  readonly id: string;
  readonly fields: readonly RecallField[];
}
/** One stable fact and progress record, however many gems share it. */
export interface RecallField {
  readonly id: string;
  readonly label: string;
  readonly answer: string;
  readonly accepted: readonly string[];
  readonly matching?: RecallMatching;
  readonly entry?: RecallEntry;
  /** Default is none; only explicitly approved ambiguous typed fields allow review. */
  readonly alternative?: RecallAlternativePolicy;
}
export interface RecallFact {
  readonly id: string;
  readonly course: Course;
  readonly prompt: string;
  readonly answer: string;
  readonly accepted?: readonly string[];
  readonly gemIds: readonly GemId[];
  readonly sources: readonly SourceReference[];
  readonly matching?: RecallMatching;
  readonly fields?: readonly RecallField[];
  readonly fieldOrder?: 'labelled' | 'any' | 'exceptions' | 'pairs';
  readonly answerGroups?: readonly RecallField[];
  readonly context?: readonly string[];
  readonly entry?: RecallEntry;
  readonly alternative?: RecallAlternativePolicy;
  /** Explicit revision for same-shaped responses whose meaning/order changed (e.g. Q091). */
  readonly responseFormat?: string;
  readonly sentenceTokens?: readonly (string | Readonly<{ fieldId: string }>)[];
  readonly exceptionCollection?: RecallExceptionCollection;
  readonly responsePairs?: readonly RecallResponsePair[];
  readonly answerPairs?: readonly RecallAnswerPair[];
  readonly pairCoverage?: 'one' | 'all';
  /** Presentation only: choose one authored pair for the model without narrowing accepted pairs. */
  readonly modelAnswerPairId?: string;
}
export type RecallAttempt = StudentAttemptFor<RecallQuestionRef, RecallTarget> &
  RecallDefinitionReference;
/** Dedicated first-assessment evidence; never contributes to graded mastery. */
export interface RecallEvidence extends RecallDefinitionReference {
  readonly kind: 'recall';
  readonly id: string;
  readonly namespace: Namespace;
  readonly factId: string;
  readonly ref: RecallQuestionRef;
  readonly completedAt: number;
  readonly outcome: 'correct' | 'wrong' | 'assisted' | 'revealed';
  readonly firstResponse: FrozenResponse;
  readonly firstAssessment: Assessment;
}
export interface RecallProgress {
  readonly namespace: Namespace;
  readonly factId: string;
  readonly stage: 0 | 1 | 2 | 3 | 4 | 5;
  readonly dueAt: number;
  readonly lastAdvancedDate: string | null;
  readonly lastCompletedAt: number;
  readonly lastAttemptId: string | null;
}
export interface RecallSession {
  /** Legacy sessions default to test and derive global/gem scope from gemIds. */
  readonly mode?: RecallMode;
  readonly scope?: RecallLaunchScope;
  readonly kind: 'recall-practice' | 'recall-revision';
  readonly id: string;
  readonly namespace: Namespace;
  /** Null selects the global bank; gem sets always include every linked fact. */
  readonly gemIds: readonly string[] | null;
  readonly factIds: readonly string[];
  readonly currentAttemptId: string | null;
  readonly currentFactId: string | null;
  readonly submittedAttemptIds: readonly string[];
  readonly visitedFactIds: readonly string[];
  readonly status: 'active' | 'paused' | 'complete';
}
