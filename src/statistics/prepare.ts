import type { CourseDataViewProps } from '../contracts/integration.ts';
import type { CurriculumEvidence } from '../contracts/session.ts';
import type { RecallEvidence, RecallProgress } from '../contracts/recall.ts';
import type { ChemistryRepository } from '../contracts/repository.ts';
import type { LoadingCoordinator, LoadingTicket } from '../loading/coordinator.ts';
import { createChemistryRepository } from '../persistence/repository.ts';
import { repositoryError } from '../loading/module-errors.ts';

export interface PreparedStatistics {
  readonly course: CourseDataViewProps['course'];
  readonly profileId: string;
  readonly databaseName: string;
  readonly history: readonly CurriculumEvidence[];
  readonly recallHistory: readonly RecallEvidence[];
  readonly recallProgress: readonly RecallProgress[];
  readonly snapshotAt: number;
}

/** Load both channels before showing a chart. Never estimate missing historical time. */
export async function prepareStatistics({
  course,
  namespace,
  databaseName,
  ticket,
  repository: suppliedRepository,
}: CourseDataViewProps & {
  readonly ticket: LoadingTicket;
  readonly repository?: ChemistryRepository;
}): Promise<PreparedStatistics> {
  if (namespace.course !== course) throw Error('Statistics course and profile do not match.');
  const repository = suppliedRepository ?? createChemistryRepository(databaseName);
  try {
    const [curriculum, recall, progress] = await Promise.all([
      repository.curriculumHistory(namespace),
      repository.recallHistory(namespace),
      repository.recallProgress(namespace),
    ]);
    if (!ticket.isCurrent()) throw new DOMException('Statistics read superseded', 'AbortError');
    if (!curriculum.ok)
      throw repositoryError({
        ...curriculum.error,
        message: `Saved statistics could not be read. ${curriculum.error.message}`,
      });
    if (!recall.ok)
      throw repositoryError({
        ...recall.error,
        message: `Saved Recall timing could not be read. ${recall.error.message}`,
      });
    if (!progress.ok) throw repositoryError(progress.error);
    return {
      course,
      profileId: namespace.profileId,
      databaseName,
      history: curriculum.value,
      recallHistory: recall.value,
      recallProgress: progress.value,
      snapshotAt: Date.now(),
    };
  } finally {
    if (!suppliedRepository) repository.close?.();
  }
}

/** Browser focus is an optional refresh, never a newer navigation intent. */
export function refreshStatistics(
  coordinator: LoadingCoordinator,
  prepare: (ticket: LoadingTicket) => Promise<PreparedStatistics>,
  commit: (value: PreparedStatistics) => void,
): Promise<boolean> {
  const state = coordinator.snapshot();
  if (state.pending || state.error) return Promise.resolve(false);
  return coordinator.run('tool', prepare, commit);
}
