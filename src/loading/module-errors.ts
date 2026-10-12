const preloadFailures = new WeakSet<object>();
/** Vite owns JS/CSS readiness; retain its error rather than importing a guessed URL. */
export function captureModulePreloadError(event: Event): void {
  const payload = (event as Event & { payload?: unknown }).payload;
  if (payload && typeof payload === 'object') preloadFailures.add(payload);
}
export class ModuleLoadError extends Error {
  readonly recovery = 'reload' as const;
  readonly cause: unknown;
  constructor(cause: unknown) {
    super('A required part of the app could not load. Reload the app to try again.');
    this.name = 'ModuleLoadError';
    this.cause = cause;
  }
}
export function isModuleLoadFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  if ('recovery' in error && error.recovery === 'reload') return true;
  if (preloadFailures.has(error)) return true;
  return (
    'message' in error &&
    /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|unable to preload css/i.test(
      String(error.message),
    )
  );
}
export function loadingError(error: unknown): Error {
  if (isModuleLoadFailure(error))
    return error instanceof ModuleLoadError ? error : new ModuleLoadError(error);
  return error instanceof Error ? error : new Error(String(error));
}
export function repositoryError(error: {
  readonly message: string;
  readonly recovery?: 'reload';
}): Error {
  return error.recovery === 'reload' ? new ModuleLoadError(error) : new Error(error.message);
}
