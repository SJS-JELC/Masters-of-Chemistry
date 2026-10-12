import {
  Component,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  createLoadingCoordinator,
  type LoadingCoordinator,
  type LoadingScope,
} from './coordinator.ts';
import './loading.css';
import { captureModulePreloadError, isModuleLoadFailure } from './module-errors.ts';
const Context = createContext<LoadingCoordinator | null>(null);
export function useLoadingContext() {
  return useContext(Context);
}
export function useLoading() {
  const coordinator = useContext(Context);
  if (!coordinator) throw Error('Missing loading coordinator');
  const snapshot = useSyncExternalStore(coordinator.subscribe, coordinator.snapshot);
  return { ...coordinator, ...snapshot };
}
declare global {
  interface Window {
    __mastersLoading?: LoadingCoordinator & {
      delay(scope: LoadingScope, milliseconds: number): void;
      failNext(scope: LoadingScope): void;
    };
  }
}
export function LoadingProvider({ children }: { readonly children: ReactNode }) {
  const delays = useRef(new Map<LoadingScope, number>()),
    failures = useRef(new Set<LoadingScope>());
  const coordinator = useRef<LoadingCoordinator | null>(null);
  const bootstrapPresent = useRef(!!document.getElementById('loading-bootstrap'));
  if (!coordinator.current)
    coordinator.current = createLoadingCoordinator({
      initialVisible:
        !!document.getElementById('loading-bootstrap') &&
        getComputedStyle(document.getElementById('loading-bootstrap')!).opacity === '1',
      initialDelayMs: () => (bootstrapPresent.current ? Math.max(0, 200 - performance.now()) : 200),
      reload: (ticket) => {
        if (ticket.isCurrent()) location.reload();
      },
      beforePrepare: async (ticket) => {
        if (!import.meta.env.DEV) return;
        const delay = delays.current.get(ticket.scope) ?? 0;
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        if (failures.current.delete(ticket.scope)) throw Error('Injected loading failure');
      },
    });
  const current = coordinator.current;
  const snapshot = useSyncExternalStore(current.subscribe, current.snapshot);
  const focused = useRef<HTMLElement | null>(null);
  const retainedDialogs = useRef(new Map<HTMLDialogElement, boolean>());
  useLayoutEffect(
    () =>
      current.onFreezeStart(() => {
        const surface = document.getElementById('loading-surface');
        // Capture before a host blurs an editor to flush its local draft.
        if (!surface?.inert) focused.current = document.activeElement as HTMLElement;
      }),
    [current],
  );
  useEffect(() => {
    window.addEventListener('vite:preloadError', captureModulePreloadError);
    return () => window.removeEventListener('vite:preloadError', captureModulePreloadError);
  }, []);
  useEffect(
    () =>
      current.onFreeze(() => {
        const surface = document.getElementById('loading-surface');
        surface?.setAttribute('inert', '');
        for (const dialog of Array.from(
          document.querySelectorAll<HTMLDialogElement>('#loading-surface dialog[open]'),
        )) {
          if (!retainedDialogs.current.has(dialog))
            retainedDialogs.current.set(dialog, dialog.inert);
          dialog.inert = true;
        }
      }),
    [current],
  );
  useEffect(
    () =>
      current.onCancelComplete((ticket) => {
        requestAnimationFrame(() => {
          const latest = current.snapshot();
          if (
            ticket.isCurrent() &&
            !latest.pending &&
            !latest.error &&
            focused.current?.isConnected
          )
            focused.current.focus({ preventScroll: true });
        });
      }),
    [current],
  );
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__mastersLoading = {
      ...current,
      delay: (scope, ms) => {
        delays.current.set(scope, ms);
      },
      failNext: (scope) => {
        failures.current.add(scope);
      },
    };
    return () => {
      delete window.__mastersLoading;
    };
  }, [current]);
  useLayoutEffect(() => {
    document.getElementById('loading-bootstrap')?.remove();
  }, []);
  const blocked = snapshot.pending || !!snapshot.error;
  useLayoutEffect(() => {
    const surface = document.getElementById('loading-surface');
    if (surface) surface.inert = blocked;
    if (blocked) return;
    for (const [dialog, inert] of retainedDialogs.current) {
      if (dialog.isConnected) dialog.inert = inert;
    }
    retainedDialogs.current.clear();
  }, [snapshot]);
  return (
    <Context.Provider value={current}>
      <div id="loading-surface" inert={blocked} aria-busy={snapshot.pending}>
        {children}
      </div>
      {snapshot.visible && (
        <>
          <LoadingBar />
          <span className="loading-announcement" role="status">
            Loading…
          </span>
        </>
      )}
      {snapshot.error && <LoadingError error={snapshot.error} coordinator={current} />}
    </Context.Provider>
  );
}
function LoadingBar() {
  const node = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    node.current?.showPopover();
    return () => {
      node.current?.hidePopover();
    };
  }, []);
  return (
    <div
      ref={node}
      popover="manual"
      className="loading-bar"
      data-testid="loading-bar"
      aria-hidden="true"
    />
  );
}
function LoadingError({
  error,
  coordinator,
}: {
  readonly error: Error;
  readonly coordinator: LoadingCoordinator;
}) {
  const node = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = node.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      ref={node}
      className="loading-error"
      aria-label="Could not continue"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onCancel={(event) => {
        event.preventDefault();
        void coordinator.cancel();
      }}
    >
      <p role="alert">{error.message}</p>
      {isModuleLoadFailure(error) ? (
        <button data-testid="loading-reload" onClick={() => void coordinator.reload()}>
          Reload app
        </button>
      ) : (
        <button data-testid="loading-retry" onClick={() => void coordinator.retry()}>
          Retry
        </button>
      )}
      <button data-testid="loading-cancel" onClick={() => void coordinator.cancel()}>
        Cancel
      </button>
    </dialog>
  );
}
export class LoadingErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <section className="loading-error" role="alert">
        <p>This screen could not open. {this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })}>Retry</button>
        <button onClick={() => location.reload()}>Reload</button>
      </section>
    ) : (
      this.props.children
    );
  }
}
