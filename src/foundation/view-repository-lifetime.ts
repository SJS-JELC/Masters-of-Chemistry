interface ViewRepository {
  close?: () => void;
}

/** Keep an effect's repository alive through React replay; retire it after real release and writes. */
export function createViewRepositoryLifetime() {
  const leases = new Map<ViewRepository, { count: number; generation: number }>();
  return {
    retain(repository: ViewRepository, drain: () => Promise<unknown>): () => void {
      const entry = leases.get(repository) ?? { count: 0, generation: 0 };
      entry.count++;
      entry.generation++;
      leases.set(repository, entry);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        entry.count--;
        const generation = ++entry.generation;
        void Promise.resolve()
          .then(drain)
          .catch(() => undefined)
          .then(() => {
            if (
              leases.get(repository) !== entry ||
              entry.count !== 0 ||
              entry.generation !== generation
            )
              return;
            leases.delete(repository);
            repository.close?.();
          });
      };
    },
  };
}
