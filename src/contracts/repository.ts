import type { MaxwellProgress } from './maxwell.ts';
import type { AttemptId, Namespace, SessionId } from './identity';
import type { RecallAttempt, RecallEvidence, RecallProgress, RecallSession } from './recall';
import type {
  RecallPreferences,
  RecallFlashcardCheckpoint,
  RecallLaunchScope,
} from '../recall/session-contract';
import type { StudentAttempt } from './attempt';
import type { C3L6Progress, OlympiadProgress, IsomerProgress } from './olympiad';
import type { CurriculumEvidence, CurriculumSession } from './session';

export type StorageFailure = Readonly<{
  code: 'unavailable' | 'quota' | 'conflict' | 'invalid-data';
  message: string;
  retryable: boolean;
  /** Runtime recovery hint; this is not a persisted-data schema field. */
  recovery?: 'reload';
}>;
export type RepositoryResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: StorageFailure }>;
export interface RecallWrite {
  readonly attempt: RecallAttempt;
  readonly session?: RecallSession;
}
/** Transaction writes draft, immutable evidence (if any), and scheduler state together. */
export interface CurriculumWrite {
  readonly attempt: StudentAttempt;
  readonly evidence?: CurriculumEvidence;
  readonly session?: CurriculumSession;
}
export interface SaveReceipt {
  readonly attemptId: AttemptId;
  readonly evidence: 'inserted' | 'already-present' | 'none';
}
export interface ImportSource {
  readonly key: string;
  readonly fingerprint: string;
}
/** Exact user-supplied legacy source retained in the new database only. */
export interface LegacyImportArchive {
  readonly namespace: Namespace;
  readonly source: ImportSource;
  readonly rawText: string;
  readonly notes: readonly string[];
  readonly skipped: readonly Readonly<{ sourceId: string; reason: string }>[];
}
/** A parser checks legacy JSON before producing this payload; it never writes old keys. */
export interface ImportBatch {
  readonly namespace: Namespace;
  readonly source: ImportSource;
  readonly curriculum: readonly CurriculumEvidence[];
  readonly olympiad: readonly OlympiadProgress[];
}
export interface ImportReceipt {
  readonly source: ImportSource;
  readonly inserted: number;
  readonly duplicates: number;
  readonly skipped: readonly Readonly<{ sourceId: string; reason: string }>[];
}
export interface ChemistryRepository {
  readonly loadRecallPreferences: (
    namespace: Namespace,
  ) => Promise<RepositoryResult<RecallPreferences | null>>;
  readonly saveRecallPreferences: (
    preferences: RecallPreferences,
  ) => Promise<RepositoryResult<'saved'>>;
  readonly loadRecallFlashcards: (
    namespace: Namespace,
    scope: RecallLaunchScope,
  ) => Promise<RepositoryResult<RecallFlashcardCheckpoint | null>>;
  readonly saveRecallFlashcards: (
    checkpoint: RecallFlashcardCheckpoint,
  ) => Promise<RepositoryResult<'saved'>>;
  readonly loadRecallAttempt: (
    namespace: Namespace,
    id: AttemptId,
  ) => Promise<RepositoryResult<RecallAttempt | null>>;
  readonly recallHistory: (
    namespace: Namespace,
  ) => Promise<RepositoryResult<readonly RecallEvidence[]>>;
  readonly recallProgress: (
    namespace: Namespace,
  ) => Promise<RepositoryResult<readonly RecallProgress[]>>;
  readonly loadRecallSession: (
    namespace: Namespace,
    id: SessionId,
  ) => Promise<RepositoryResult<RecallSession | null>>;
  readonly saveRecall: (write: RecallWrite) => Promise<RepositoryResult<SaveReceipt>>;
  readonly saveRecallSession: (session: RecallSession) => Promise<RepositoryResult<SessionId>>;
  /** Release this instance's connection without changing stored records. */
  readonly close?: () => void;
  readonly loadAttempt: (
    namespace: Namespace,
    id: AttemptId,
  ) => Promise<RepositoryResult<StudentAttempt | null>>;
  readonly loadSession: (
    namespace: Namespace,
    id: SessionId,
  ) => Promise<RepositoryResult<CurriculumSession | null>>;
  readonly curriculumHistory: (
    namespace: Namespace,
  ) => Promise<RepositoryResult<readonly CurriculumEvidence[]>>;
  readonly saveCurriculum: (write: CurriculumWrite) => Promise<RepositoryResult<SaveReceipt>>;
  readonly saveSession: (session: CurriculumSession) => Promise<RepositoryResult<SessionId>>;
  readonly loadOlympiad: {
    (
      profileId: string,
      activityId: 'alevel/maxwells-demon',
    ): Promise<RepositoryResult<MaxwellProgress | null>>;
    (
      profileId: string,
      activityId?: 'alevel/c3l6-organic-reactions',
    ): Promise<RepositoryResult<C3L6Progress | null>>;
    (
      profileId: string,
      activityId: 'alevel/olympiad-2011-q4',
    ): Promise<RepositoryResult<IsomerProgress | null>>;
  };
  readonly saveOlympiad: (progress: OlympiadProgress) => Promise<RepositoryResult<'saved'>>;
  readonly importBatch: (batch: ImportBatch) => Promise<RepositoryResult<ImportReceipt>>;
  readonly saveImportArchive: (
    archive: LegacyImportArchive,
  ) => Promise<RepositoryResult<'saved' | 'already-present'>>;
  readonly importArchives: (
    namespace: Namespace,
  ) => Promise<RepositoryResult<readonly LegacyImportArchive[]>>;
}
