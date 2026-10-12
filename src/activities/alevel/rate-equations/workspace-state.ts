import { isRateGraphWorkspaceState, type RateGraphWorkspaceState } from '../../../contracts/workspace.ts';
import type { RateGraph } from './types.ts';
import { concentrationAt } from './graphs.ts';
export type { RateGraphWorkspaceState } from '../../../contracts/workspace.ts';
const clamp = (v: number, low: number, high: number) => Math.min(high, Math.max(low, v));
export const rateGraphValueAt = (graph: RateGraph, x: number): number =>
  graph.kind === 'concentration' ? concentrationAt(graph, x) : graph.intercept + graph.gradient * x;
export function defaultRateGraphWorkspace(graph: RateGraph): RateGraphWorkspaceState {
  return { kind: 'rate-graph-tools', marker: graph.kind === 'concentration' ? graph.initialMarker : (graph.minX + graph.maxX) / 2, extended: false, readings: [null, null] };
}
/** Restore in the graph's underlying units. Saved y never overrides its checked curve. */
export function restoreRateGraphWorkspace(graph: RateGraph, saved?: RateGraphWorkspaceState): RateGraphWorkspaceState {
  if (!isRateGraphWorkspaceState(saved)) return defaultRateGraphWorkspace(graph);
  const extended = graph.kind === 'arrhenius' && saved.extended;
  const low = graph.kind === 'concentration' || extended ? 0 : graph.minX;
  const high = graph.kind === 'concentration' ? graph.maxTime : graph.maxX;
  const reading = (r: RateGraphWorkspaceState['readings'][number]) => {
    if (!r || graph.kind !== 'concentration') return null;
    const x = clamp(r.x, low, high);
    return { x, y: rateGraphValueAt(graph, x) };
  };
  return { kind: 'rate-graph-tools', marker: clamp(saved.marker, low, high), extended,
    readings: [reading(saved.readings[0]), reading(saved.readings[1])] };
}
