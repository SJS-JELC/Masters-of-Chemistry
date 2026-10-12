import { alphaDatabaseName } from '../persistence/alpha-namespace.ts';
import type { OlympiadActivityId, OlympiadProgress } from '../contracts/index.ts';
import type { ChemistryRepository } from '../contracts/repository.ts';
import { createChemistryRepository } from '../persistence/repository.ts';
import { productionRegistry } from './registry.ts';
import { olympiadCompletion, type ChallengeCompletion } from '../landing/olympiad-completion.ts';
import type { LoadingTicket } from '../loading/coordinator.ts';
import { repositoryError } from '../loading/module-errors.ts';
export type Runtime =
  | {
      id: 'alevel/c3l6-organic-reactions';
      module: typeof import('../activities/olympiad/c3l6/index.ts');
    }
  | {
      id: 'alevel/maxwells-demon';
      module: typeof import('../activities/olympiad/maxwells-demon/index.ts');
    }
  | {
      id: 'alevel/olympiad-2011-q4';
      module: typeof import('../activities/olympiad/isomers2011/index.ts');
    };
export interface PreparedOlympiad {
  readonly activityId?: OlympiadActivityId;
  readonly databaseName: string;
  readonly profileId: string;
  readonly readOnly: boolean;
  readonly runtime: Runtime | null;
  readonly progress: OlympiadProgress | null;
  readonly completion: Partial<Record<OlympiadActivityId, ChallengeCompletion>>;
}

/** Resolve the intended route, modules and saved drawings before mounting a challenge. */
export async function prepareOlympiad({
  activityId,
  databaseName,
  profileId = 'local',
  url,
  ticket,
  repository: suppliedRepository,
  loadRuntime,
}: {
  readonly activityId?: OlympiadActivityId;
  readonly databaseName?: string;
  readonly profileId?: string;
  readonly url?: string | URL;
  readonly ticket: LoadingTicket;
  readonly repository?: ChemistryRepository;
  readonly loadRuntime?: (id: OlympiadActivityId) => Promise<Runtime>;
}): Promise<PreparedOlympiad> {
  const intended = url ? new URL(url) : null;
  const mode = intended?.searchParams.get('mode');
  const run =
    (import.meta.env?.DEV ? intended?.searchParams.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const db = databaseName ?? alphaDatabaseName('alevel', run);
  const requested = activityId ?? intended?.searchParams.get('activity') ?? undefined;
  if (
    requested &&
    !productionRegistry.activities.some(
      (item) => item.id === requested && item.strand === 'olympiad',
    )
  )
    throw Error('This Olympiad challenge is unavailable.');
  const id = requested as OlympiadActivityId | undefined;
  const repository = suppliedRepository ?? createChemistryRepository(db);
  const read = async (challengeId: OlympiadActivityId) => {
    const loaded =
      challengeId === 'alevel/c3l6-organic-reactions'
        ? await repository.loadOlympiad(profileId)
        : challengeId === 'alevel/maxwells-demon'
          ? await repository.loadOlympiad(profileId, challengeId)
          : await repository.loadOlympiad(profileId, challengeId);
    if (!ticket.isCurrent()) throw new DOMException('Challenge read superseded', 'AbortError');
    if (!loaded.ok)
      throw repositoryError({
        ...loaded.error,
        message: `Saved challenge progress could not be read. ${loaded.error.message}`,
      });
    return loaded.value;
  };
  try {
    const base = { databaseName: db, profileId, readOnly: mode === 'teacher' || mode === 'review' };
    if (!id) {
      const loaded = await Promise.all(
        productionRegistry.activities
          .filter((item) => item.strand === 'olympiad')
          .map(async (item) => {
            const challengeId = item.id as OlympiadActivityId;
            return [challengeId, olympiadCompletion(await read(challengeId), challengeId)] as const;
          }),
      );
      return { ...base, runtime: null, progress: null, completion: Object.fromEntries(loaded) };
    }
    const loaded = await read(id);
    let runtime: Runtime, progress: OlympiadProgress;
    if (id === 'alevel/c3l6-organic-reactions') {
      const selected = loadRuntime
        ? await loadRuntime(id)
        : ({ id, module: await import('../activities/olympiad/c3l6/index.ts') } as const);
      if (selected.id !== id) throw Error('Challenge module does not match its route.');
      const module = selected.module;
      runtime = { id, module };
      progress =
        loaded?.activityId === id
          ? module.c3Policy.validateCompletion(module.c3Challenge, loaded)
          : module.blankC3Progress(profileId);
    } else if (id === 'alevel/maxwells-demon') {
      const selected = loadRuntime
        ? await loadRuntime(id)
        : ({ id, module: await import('../activities/olympiad/maxwells-demon/index.ts') } as const);
      if (selected.id !== id) throw Error('Challenge module does not match its route.');
      const module = selected.module;
      runtime = { id, module };
      progress =
        loaded?.activityId === id
          ? module.maxwellPolicy.validateCompletion(module.maxwellChallenge, loaded)
          : module.blankMaxwellProgress(profileId);
    } else {
      const selected = loadRuntime
        ? await loadRuntime(id)
        : ({ id, module: await import('../activities/olympiad/isomers2011/index.ts') } as const);
      if (selected.id !== id) throw Error('Challenge module does not match its route.');
      const module = selected.module;
      runtime = { id, module };
      progress =
        loaded?.activityId === id
          ? module.isomerPolicy.validateCompletion(module.isomerChallenge, loaded)
          : module.blankIsomerProgress(profileId);
    }
    if (!ticket.isCurrent()) throw new DOMException('Challenge module superseded', 'AbortError');
    return { ...base, activityId: id, runtime, progress, completion: {} };
  } finally {
    if (!suppliedRepository) repository.close?.();
  }
}
