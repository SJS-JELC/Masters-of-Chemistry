/** Unmarked measuring state in graph units; no rendered/question snapshots. */
export interface RateGraphReading {
  readonly x: number;
  readonly y: number;
}
export interface RateGraphWorkspaceState {
  readonly tangentAdded?: boolean;
  readonly kind: 'rate-graph-tools';
  readonly marker: number;
  readonly extended: boolean;
  readonly readings: readonly [RateGraphReading | null, RateGraphReading | null];
}
export type UnmarkedWorkspaceState = RateGraphWorkspaceState;
// Serialization bounds, intentionally broader than the checked question ranges.
// The graph component clamps x and recomputes y from the analytical model.
const bounded = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 1e9;
const exact = (v: Record<string, unknown>, names: readonly string[]) =>
  Object.keys(v).length === names.length && names.every(k => Object.hasOwn(v, k));
const plain = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
export function isRateGraphWorkspaceState(value: unknown): value is RateGraphWorkspaceState {
  if (!plain(value) || !exact(value, ['kind', 'marker', 'extended', 'readings', ...(Object.hasOwn(value, 'tangentAdded') ? ['tangentAdded'] : [])]) ||
    (Object.hasOwn(value, 'tangentAdded') && typeof value.tangentAdded !== 'boolean') ||
    value.kind !== 'rate-graph-tools' || !bounded(value.marker) || value.marker < 0 ||
    typeof value.extended !== 'boolean' || !Array.isArray(value.readings) || value.readings.length !== 2 ||
    !Object.hasOwn(value.readings, 0) || !Object.hasOwn(value.readings, 1) || Object.keys(value.readings).length !== 2) return false;
  return value.readings.every(r => r === null || (plain(r) && exact(r, ['x', 'y']) && bounded(r.x) && r.x >= 0 && bounded(r.y)));
}
/** Closed graph-family ownership without importing any content or UI into the shell. */
export function supportsRateGraphWorkspace(ref: { readonly activityId: string; readonly questionId: string; readonly level: number }): boolean {
  return ref.activityId === 'alevel/rate-equations' && [1, 2, 3].includes(ref.level) &&
    (ref.questionId === `RATE-POC-graphs-L${ref.level}` || ref.questionId === `RATE-POC-arrhenius-L${ref.level}`);
}
export function sameRateGraphWorkspace(a: RateGraphWorkspaceState | undefined, b: RateGraphWorkspaceState): boolean {
  return !!a && !!a.tangentAdded === !!b.tangentAdded && a.marker === b.marker && a.extended === b.extended && a.readings.every((r, i) =>
    r === null ? b.readings[i] === null : b.readings[i]?.x === r.x && b.readings[i]?.y === r.y);
}
