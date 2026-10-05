import type { AttemptId, Namespace, SessionId } from './identity';
import type { StudentAttempt } from './attempt';
import type { C3L6Progress } from './olympiad';
import type { CurriculumEvidence, CurriculumSession } from './session';

export type StorageFailure = Readonly<{
  code: 'unavailable' | 'quota' | 'conflict' | 'invalid-data';
  message: string;
  retryable: boolean;
}>;
export type RepositoryResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: StorageFailure }>;
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
  readonly olympiad: readonly C3L6Progress[];
}
export interface ImportReceipt {
  readonly source: ImportSource;
  readonly inserted: number;
  readonly duplicates: number;
  readonly skipped: readonly Readonly<{ sourceId: string; reason: string }>[];
}
export interface ChemistryRepository {
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
  readonly loadOlympiad: (profileId: string) => Promise<RepositoryResult<C3L6Progress | null>>;
  readonly saveOlympiad: (progress: C3L6Progress) => Promise<RepositoryResult<'saved'>>;
  readonly importBatch: (batch: ImportBatch) => Promise<RepositoryResult<ImportReceipt>>;
  readonly saveImportArchive: (
    archive: LegacyImportArchive,
  ) => Promise<RepositoryResult<'saved' | 'already-present'>>;
  readonly importArchives: (
    namespace: Namespace,
  ) => Promise<RepositoryResult<readonly LegacyImportArchive[]>>;
}
