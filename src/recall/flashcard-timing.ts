import type { FlashcardStudyTime } from '../contracts/flashcard-time.ts';
import type { Namespace } from '../contracts/identity.ts';
import type { RepositoryResult, StorageFailure } from '../contracts/repository.ts';
interface Sample {
  readonly monotonicMs: number;
  readonly wallMs: number;
}
const clock = (): Sample => ({ monotonicMs: performance.now(), wallMs: Date.now() });
export interface FlashcardTimingOptions {
  readonly namespace: Namespace;
  readonly scopeKey: string;
  readonly now?: () => Sample;
  readonly load: () => Promise<RepositoryResult<readonly FlashcardStudyTime[]>>;
  readonly save: (record: FlashcardStudyTime) => Promise<RepositoryResult<'saved'>>;
  readonly onFailure?: (failure: StorageFailure | null) => void;
}
export function localDayStart(wallMs: number): number {
  const date = new Date(wallMs);
  date.setHours(0, 0, 0, 0);
  return +date;
}
function nextDay(day: number): number {
  const date = new Date(day);
  date.setDate(date.getDate() + 1);
  return +date;
}
/** Elapsed time, capped across both sides and revisits of a card in one deck run. */
export function createFlashcardTiming(options: FlashcardTimingOptions) {
  const now = options.now ?? clock;
  const totals = new Map<string, FlashcardStudyTime>();
  const saved = new Map<string, number>();
  let previous = now(),
    card: string | null = null;
  let eligible = false,
    frozen = false,
    loaded = false;
  let loading: Promise<boolean> | undefined;
  let failure: StorageFailure | null = null;
  let tail = Promise.resolve(true);
  function report(value: StorageFailure | null) {
    failure = value;
    options.onFailure?.(value);
  }
  function unavailable() {
    report({
      code: 'unavailable',
      message: 'Could not save flashcard time. Retry before leaving.',
      retryable: true,
    });
  }
  function collect(next: Sample) {
    if (eligible && !frozen && loaded && card) {
      const used = [...totals.values()]
        .filter((r) => r.sessionId === card)
        .reduce((sum, r) => sum + r.activeMs, 0);
      let remaining = Math.max(
        0,
        Math.min(
          15000 - used,
          Math.floor(next.monotonicMs - previous.monotonicMs),
          next.wallMs - previous.wallMs,
        ),
      );
      let cursor = previous.wallMs;
      while (remaining > 0) {
        const dayStart = localDayStart(cursor),
          amount = Math.min(remaining, nextDay(dayStart) - cursor);
        const id = `${card}:${dayStart}`;
        totals.set(id, {
          kind: 'flashcards',
          id,
          namespace: options.namespace,
          sessionId: card,
          scopeKey: options.scopeKey,
          dayStart,
          activeMs: (totals.get(id)?.activeMs ?? 0) + amount,
          cardLimitMs: 15000,
          updatedAt: next.wallMs,
        });
        cursor += amount;
        remaining -= amount;
      }
    }
    previous = next;
  }
  function ready(): Promise<boolean> {
    if (loaded) return Promise.resolve(true);
    if (loading) return loading;
    loading = (async () => {
      try {
        const result = await options.load();
        if (!result.ok) {
          report(result.error);
          return false;
        }
        for (const record of result.value)
          if (record.scopeKey === options.scopeKey) {
            totals.set(record.id, record);
            saved.set(record.id, record.activeMs);
          }
        loaded = true;
        previous = now();
        report(null);
        return true;
      } catch {
        unavailable();
        return false;
      } finally {
        loading = undefined;
      }
    })();
    return loading;
  }
  function persist(): Promise<boolean> {
    if (!loaded && !eligible) return Promise.resolve(true);
    const records = [...totals.values()];
    tail = tail.then(async () => {
      if (!(await ready())) return false;
      try {
        for (const record of records)
          if ((saved.get(record.id) ?? 0) < record.activeMs) {
            const result = await options.save(record);
            if (!result.ok) {
              report(result.error);
              return false;
            }
            saved.set(record.id, record.activeMs);
          }
        report(null);
        return true;
      } catch {
        unavailable();
        return false;
      }
    });
    return tail;
  }
  return {
    ready,
    persist,
    records: () => [...totals.values()],
    failure: () => failure,
    setCard(runId: string, factId: string | null, next = now()) {
      collect(next);
      card = factId ? `${runId}:${factId}` : null;
    },
    setEligible(value: boolean, next = now()) {
      collect(next);
      eligible = value && !frozen;
    },
    sample(next = now()) {
      collect(next);
    },
    pause(next = now()) {
      collect(next);
      eligible = false;
    },
    freeze(next = now()) {
      collect(next);
      frozen = true;
      eligible = false;
    },
    resume() {
      frozen = false;
    },
    flush(next = now()) {
      collect(next);
      eligible = false;
      return persist();
    },
  };
}
export function bindFlashcardTiming(options: {
  controller: ReturnType<typeof createFlashcardTiming>;
  isEligible: () => boolean;
}) {
  const { controller, isEligible } = options;
  let attached = true;
  controller.resume();
  void controller.ready().then((ok) => {
    if (attached && ok) controller.setEligible(isEligible());
  });
  const interval = window.setInterval(() => {
    controller.setEligible(isEligible());
    void controller.persist();
  }, 5000);
  const leave = () => {
    controller.freeze();
    void controller.persist();
  };
  window.addEventListener('pagehide', leave);
  return () => {
    attached = false;
    window.clearInterval(interval);
    window.removeEventListener('pagehide', leave);
    controller.setEligible(false);
    void controller.persist();
  };
}
