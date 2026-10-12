import { loadingError } from './module-errors.ts';
export type LoadingScope = 'screen' | 'question' | 'tool';
export interface LoadingTicket {
  readonly id: number;
  readonly scope: LoadingScope;
  readonly signal: AbortSignal;
  readonly operation?: 'cancel' | 'reload';
  isCurrent(): boolean;
  persist<T>(write: () => Promise<T>): Promise<T>;
}
export interface LoadingSnapshot {
  readonly pending: boolean;
  readonly visible: boolean;
  readonly error: Error | null;
  readonly ticket: LoadingTicket | null;
}
export function createLoadingCoordinator(
  options: {
    delayMs?: number;
    setTimer?: typeof setTimeout;
    clearTimer?: typeof clearTimeout;
    beforePrepare?: (ticket: LoadingTicket) => Promise<void>;
    initialVisible?: boolean;
    initialDelayMs?: () => number;
    reload?: (ticket: LoadingTicket) => void | Promise<void>;
  } = {},
) {
  let sequence = 0;
  let state: LoadingSnapshot = {
    pending: false,
    visible: options.initialVisible ?? false,
    error: null,
    ticket: null,
  };
  let abort: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let writes: Promise<unknown> = Promise.resolve();
  let pendingWrites = 0;
  let retry: (() => Promise<boolean>) | null = null;
  let cancellationDrain: Promise<boolean> | null = null;
  const listeners = new Set<() => void>();
  const freezeStart = new Set<() => void>();
  const freeze = new Set<() => void>();
  const thaw = new Set<(ticket: LoadingTicket) => boolean | void | Promise<boolean | void>>();
  const restored = new Set<(ticket: LoadingTicket) => void>();
  const reloaders = new Set<(ticket: LoadingTicket) => void | Promise<void>>();
  const schedule = options.setTimer ?? setTimeout;
  const unschedule = options.clearTimer ?? clearTimeout;
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const clear = () => {
    if (timer !== undefined) unschedule(timer);
    timer = undefined;
  };
  const cancelled = () => new DOMException('Loading request superseded', 'AbortError');
  const makeTicket = (
    scope: LoadingScope,
    controller: AbortController,
    id: number,
  ): LoadingTicket => {
    const ticket: LoadingTicket = {
      id,
      scope,
      signal: controller.signal,
      isCurrent: () => sequence === id && !controller.signal.aborted,
      persist<T>(write: () => Promise<T>): Promise<T> {
        pendingWrites++;
        const next = writes
          .catch(() => undefined)
          .then(() => {
            if (!ticket.isCurrent()) throw cancelled();
            return write();
          });
        writes = next.then(
          () => {
            pendingWrites--;
          },
          () => {
            pendingWrites--;
          },
        );
        return next;
      },
    };
    return ticket;
  };
  async function run<T>(
    scope: LoadingScope,
    prepare: (ticket: LoadingTicket) => Promise<T>,
    commit: (value: T, ticket: LoadingTicket) => void | Promise<void>,
  ): Promise<boolean> {
    const previousVisible = state.visible;
    const draining = cancellationDrain;
    const writing = pendingWrites ? writes : null;
    abort?.abort();
    clear();
    const controller = new AbortController();
    abort = controller;
    const id = ++sequence;
    const ticket = makeTicket(scope, controller, id);
    retry = () => run(scope, prepare, commit);
    state = { pending: true, visible: previousVisible, error: null, ticket };
    try {
      for (const listener of freezeStart) listener();
      for (const listener of freeze) listener();
      emit();
      if (!previousVisible)
        timer = schedule(
          () => {
            if (ticket.isCurrent() && state.pending) {
              state = { ...state, visible: true };
              emit();
            }
          },
          id === 1
            ? (options.initialDelayMs?.() ?? options.delayMs ?? 200)
            : (options.delayMs ?? 200),
        );
      if (draining) {
        await draining;
        if (!ticket.isCurrent()) return false;
      }
      if (writing) {
        await writing;
        if (!ticket.isCurrent()) return false;
      }
      if (options.beforePrepare) {
        await options.beforePrepare(ticket);
        if (!ticket.isCurrent()) return false;
      }
      const prepared = await prepare(ticket);
      await writes;
      if (!ticket.isCurrent()) {
        (prepared as { dispose?: () => void } | null)?.dispose?.();
        return false;
      }
      await commit(prepared, ticket);
      if (!ticket.isCurrent()) return false;
      clear();
      state = { pending: false, visible: false, error: null, ticket: null };
      retry = null;
      emit();
      return true;
    } catch (error) {
      if (!ticket.isCurrent()) return false;
      clear();
      state = {
        pending: false,
        visible: false,
        error: loadingError(error),
        ticket,
      };
      emit();
      return false;
    }
  }
  async function recover(kind: 'cancel' | 'reload'): Promise<boolean> {
    if (!state.pending && !state.error) return true;
    const previous = cancellationDrain;
    const previousVisible = state.visible;
    const scope = state.ticket?.scope ?? 'screen';
    abort?.abort();
    clear();
    const controller = new AbortController();
    abort = controller;
    const ticket: LoadingTicket = { ...makeTicket(scope, controller, ++sequence), operation: kind };
    retry = () => recover(kind);
    state = { pending: true, visible: previousVisible, error: null, ticket };
    emit();
    if (!previousVisible)
      timer = schedule(() => {
        if (ticket.isCurrent() && state.pending) {
          state = { ...state, visible: true };
          emit();
        }
      }, options.delayMs ?? 200);
    const operation = (async () => {
      try {
        if (previous) await previous;
        await writes;
        if (!ticket.isCurrent()) return false;
        for (const listener of thaw) {
          if (!ticket.isCurrent()) return false;
          const result = await listener(ticket);
          if (!ticket.isCurrent()) return false;
          if (result === false)
            throw Error('Your work could not be resumed. Retry saving before continuing.');
        }
        await writes;
        if (!ticket.isCurrent()) return false;
        if (kind === 'reload') {
          const handlers = reloaders.size ? [...reloaders] : options.reload ? [options.reload] : [];
          if (!handlers.length) throw Error('Reload is unavailable. Cancel or retry saving.');
          for (const handler of handlers) {
            if (!ticket.isCurrent()) return false;
            await handler(ticket);
          }
          return ticket.isCurrent();
        }
        clear();
        retry = null;
        state = { pending: false, visible: false, error: null, ticket: null };
        emit();
        for (const listener of restored) {
          if (ticket.isCurrent()) listener(ticket);
        }
        return true;
      } catch (error) {
        if (!ticket.isCurrent()) return false;
        clear();
        state = {
          pending: false,
          visible: false,
          error: loadingError(error),
          ticket,
        };
        emit();
        return false;
      }
    })();
    cancellationDrain = operation;
    try {
      return await operation;
    } finally {
      if (cancellationDrain === operation) cancellationDrain = null;
    }
  }
  return {
    snapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    onFreezeStart(listener: () => void) {
      freezeStart.add(listener);
      return () => {
        freezeStart.delete(listener);
      };
    },
    onFreeze(listener: () => void) {
      freeze.add(listener);
      return () => {
        freeze.delete(listener);
      };
    },
    onCancel(listener: (ticket: LoadingTicket) => boolean | void | Promise<boolean | void>) {
      thaw.add(listener);
      return () => {
        thaw.delete(listener);
      };
    },
    onCancelComplete(listener: (ticket: LoadingTicket) => void) {
      restored.add(listener);
      return () => {
        restored.delete(listener);
      };
    },
    onReload(listener: (ticket: LoadingTicket) => void | Promise<void>) {
      reloaders.add(listener);
      return () => {
        reloaders.delete(listener);
      };
    },
    run,
    retry: () => retry?.() ?? Promise.resolve(false),
    cancel: () => recover('cancel'),
    reload: () => recover('reload'),
  };
}
export type LoadingCoordinator = ReturnType<typeof createLoadingCoordinator>;
