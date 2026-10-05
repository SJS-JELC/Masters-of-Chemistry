import type { TitrationCurveState, EditorSubmissionCheck } from '../../contracts/editors.ts';
import type { TitrationRecord } from './types.ts';
import { curve, clamp, snap, pieces, indicators } from './core.js';
export function checkSubmission(q: TitrationRecord, s: TitrationCurveState): EditorSubmissionCheck {
  const issue = (status: 'malformed' | 'incomplete', message: string): EditorSubmissionCheck => ({
    status,
    issues: [{ code: status, message, objectIds: [] }],
  });
  if (
    !s ||
    s.kind !== 'titration-curve' ||
    !Number.isFinite(s.initialPH) ||
    !Number.isFinite(s.finalPH) ||
    !Number.isFinite(s.equivalenceVolume)
  )
    return issue('malformed', 'Curve anchors must be finite numbers.');
  if (
    s.initialPH < 0 ||
    s.initialPH > 14 ||
    s.finalPH < 0 ||
    s.finalPH > 14 ||
    s.equivalenceVolume < 0.5 ||
    s.equivalenceVolume > q.maxVolume - 0.5
  )
    return issue('malformed', 'Curve anchors are outside the graph.');
  if (
    [s.initialPH, s.finalPH].some((v) => Math.abs(v - snap(v, 0.1)) > 0.000001) ||
    Math.abs(s.equivalenceVolume - snap(s.equivalenceVolume, 0.5)) > 0.000001
  )
    return issue('malformed', 'Use pH steps of 0.1 and volume steps of 0.5 cm³.');
  if (
    (s.before !== null && !pieces.some((p) => p.side === 'before' && p.id === s.before)) ||
    (s.after !== null && !pieces.some((p) => p.side === 'after' && p.id === s.after)) ||
    (s.indicator !== null && !indicators.some((i) => i.id === s.indicator))
  )
    return issue('malformed', 'A selected curve section or indicator is not recognised.');
  if (s.before === null || s.after === null || s.indicator === null)
    return issue('incomplete', 'Choose both curve sections and an indicator before checking.');
  return { status: 'ready', chemicalIssues: [] };
}
/** Preserve source anchor constraints, including deliberately incorrect mixed directions. */
export function constrain(q: TitrationRecord, s: TitrationCurveState): TitrationCurveState {
  const eq = curve(q, s).equivalencePH;
  let initialPH = clamp(s.initialPH, 0, 14),
    finalPH = clamp(s.finalPH, 0, 14);
  if (s.before?.includes('base')) initialPH = Math.max(initialPH, Math.min(13.9, eq + 0.1));
  if (s.before?.includes('acid')) initialPH = Math.min(initialPH, Math.max(0.1, eq - 0.1));
  if (s.after?.includes('base')) finalPH = Math.max(finalPH, Math.min(13.9, eq + 0.1));
  if (s.after?.includes('acid')) finalPH = Math.min(finalPH, Math.max(0.1, eq - 0.1));
  return {
    ...s,
    initialPH: snap(initialPH, 0.1),
    finalPH: snap(finalPH, 0.1),
    equivalenceVolume: clamp(snap(s.equivalenceVolume, 0.5), 0.5, q.maxVolume - 0.5),
  };
}
export function selectPiece(
  q: TitrationRecord,
  s: TitrationCurveState,
  side: 'before' | 'after',
  id: string,
): TitrationCurveState {
  let next = { ...s, [side]: id };
  const eq = curve(q, next).equivalencePH;
  if (side === 'before') {
    if (id.includes('base') && next.initialPH <= eq + 0.1)
      next = { ...next, initialPH: Math.max(11, eq + 1) };
    if (id.includes('acid') && next.initialPH >= eq - 0.1)
      next = { ...next, initialPH: Math.min(3, eq - 1) };
  } else {
    if (id.includes('base') && next.finalPH <= eq + 0.1)
      next = { ...next, finalPH: Math.max(12, eq + 1) };
    if (id.includes('acid') && next.finalPH >= eq - 0.1)
      next = { ...next, finalPH: Math.min(2, eq - 1) };
  }
  return constrain(q, next);
}
