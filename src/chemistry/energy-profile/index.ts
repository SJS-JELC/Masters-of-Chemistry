import type {
  EnergyProfileState,
  EnergyArrowEnd,
  EditorSubmissionCheck,
} from '../../contracts/editors.ts';
import type { EnergyRecord } from '../../activities/igcse/energy-enthalpy/types.ts';
import { model, initial } from '../../activities/igcse/energy-enthalpy/source-core.js';
export const modelProfile = (q: EnergyRecord): EnergyProfileState => ({
  kind: 'energy-profile',
  ...model(q),
});
export const initialProfile = (q: EnergyRecord): EnergyProfileState => ({
  kind: 'energy-profile',
  ...initial(q),
});
export const endY = (m: EnergyProfileState, end: EnergyArrowEnd): number =>
  'anchor' in end ? m[end.anchor] : end.y;
/** Screen y decreases upwards. Level/arrow errors remain assessable; corrupt numbers do not. */
export function checkProfile(m: EnergyProfileState, q: EnergyRecord): EditorSubmissionCheck {
  const bad = () => ({
    status: 'malformed' as const,
    issues: [
      {
        code: 'profile-data',
        message: 'The energy profile contains malformed coordinates or endpoints.',
        objectIds: [],
      },
    ],
  });
  if (
    m.kind !== 'energy-profile' ||
    !m.arrows ||
    typeof m.arrows !== 'object' ||
    Array.isArray(m.arrows) ||
    ![m.r, m.p, m.peak].every((y) => Number.isFinite(y) && y >= 0 && y <= 415) ||
    !['left', 'right', 'vertical', 'horizontal', 'pathLabel'].every(
      (k) => typeof m[k as 'left'] === 'string',
    )
  )
    return bad();
  for (const [key, a] of Object.entries(m.arrows)) {
    if (!['ea', 'delta'].includes(key) || !a || !Number.isFinite(a.x) || a.x < 0 || a.x > 640)
      return bad();
    for (const end of [a.tail, a.head]) {
      if (
        !end ||
        ('anchor' in end
          ? !['r', 'p', 'peak'].includes(end.anchor)
          : !Number.isFinite(end.y) || end.y < 0 || end.y > 415)
      )
        return bad();
    }
  }
  const missing: string[] = [];
  const e = q.editor;
  if (!e) return bad();
  if (e.formula && (!m.left.trim() || !m.right.trim()))
    missing.push('Place a formula label on each end level.');
  if (e.axes && (!m.vertical.trim() || !m.horizontal.trim())) missing.push('Label both axes.');
  if (e.pathLabel && !m.pathLabel.trim()) missing.push('Label the new pathway.');
  for (const arrow of e.arrows)
    if (!m.arrows[arrow])
      missing.push(`Add the ${arrow === 'ea' ? 'activation energy' : 'enthalpy change'} arrow.`);
  return missing.length
    ? {
        status: 'incomplete',
        issues: missing.map((message) => ({ code: 'profile-incomplete', message, objectIds: [] })),
      }
    : { status: 'ready', chemicalIssues: [] };
}
