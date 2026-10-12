import type { CourseDataViewProps } from '../contracts/integration.ts';
import type { LoadingTicket } from '../loading/coordinator.ts';
import type { ChemistryRepository } from '../contracts/repository.ts';
import { createChemistryRepository } from '../persistence/repository.ts';
import { repositoryError } from '../loading/module-errors.ts';
export interface PreparedImport {
  readonly course: CourseDataViewProps['course'];
  readonly profileId: string;
  readonly databaseName: string;
}
export async function prepareImport({
  course,
  namespace,
  databaseName,
  ticket,
  repository: suppliedRepository,
}: CourseDataViewProps & {
  readonly ticket: LoadingTicket;
  readonly repository?: ChemistryRepository;
}): Promise<PreparedImport> {
  if (namespace.course !== course) throw Error('Import course and profile do not match.');
  const repository = suppliedRepository ?? createChemistryRepository(databaseName);
  try {
    const available = await repository.curriculumHistory(namespace);
    if (!ticket.isCurrent()) throw new DOMException('Import startup superseded', 'AbortError');
    if (!available.ok) throw repositoryError(available.error);
    return { course, profileId: namespace.profileId, databaseName };
  } finally {
    if (!suppliedRepository) repository.close?.();
  }
}
