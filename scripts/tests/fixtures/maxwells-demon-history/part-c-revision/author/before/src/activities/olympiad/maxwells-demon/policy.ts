import type { MaxwellProgress, MaxwellPolicy, Level } from '../../../contracts/index.ts';
import { classifications, level2Tasks, level3Tasks, levelIds } from './content.ts';
export const blankMaxwellProgress = (profileId: string): MaxwellProgress => ({
  kind: 'olympiad-completion',
  course: 'alevel',
  profileId,
  activityId: 'alevel/maxwells-demon',
  level: 1,
  introduction: true,
  responses: Object.fromEntries(levelIds(2).map((id) => [id, ''])),
  checks: {},
  revealed: [],
});
export function parseNumber(value: string): number | null {
  const v = value.trim().replace(/−/g, '-');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(v))
    return null;
  const [n, d] = v.split('/').map(Number);
  const result = d === undefined ? n! : n! / d;
  return Number.isFinite(result) ? result : null;
}
export function isCorrect(id: string, value: string): boolean {
  const classification = classifications.find((t) => t.id === id);
  if (classification) {
    const a = value ? value.split('|').sort() : [];
    return JSON.stringify(a) === JSON.stringify([...classification.answers].sort());
  }
  const task = [...level2Tasks, ...level3Tasks].find((t) => t.id === id);
  if (!task) return false;
  if (typeof task.answer === 'string') return value.trim() === task.answer;
  const n = parseNumber(value);
  return n !== null && Math.abs(n - task.answer) <= (task.tolerance ?? 0.000001);
}
export function fingerprint(p: MaxwellProgress, level: Level): string {
  return fingerprintIds(p, levelIds(level));
}
function fingerprintIds(p: MaxwellProgress, ids: readonly string[]): string {
  let h = 2166136261;
  for (const c of JSON.stringify(ids.map((id) => [id, p.responses[id] ?? '']))) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
function check(p: MaxwellProgress, level: Level) {
  return {
    fingerprint: fingerprint(p, level),
    correct: levelIds(level).filter(
      (id) => Object.hasOwn(p.responses, id) && isCorrect(id, p.responses[id]!),
    ),
  };
}
export const maxwellPolicy: MaxwellPolicy = {
  validateCompletion(_challenge, p) {
    return migrateMaxwellProgress(p);
  },
  transition(_challenge, p, c) {
    if (c.kind === 'restart')
      return {
        accepted: true,
        progress: blankMaxwellProgress(p.profileId),
        message: 'Challenge restarted.',
      };
    if (c.kind === 'maxwell-level' && [1, 2, 3].includes(c.level))
      return {
        accepted: true,
        progress: { ...p, level: c.level, introduction: false },
        message: '',
      };
    if (c.kind === 'maxwell-introduction')
      return { accepted: true, progress: { ...p, introduction: true }, message: '' };
    if (c.kind === 'maxwell-answer') {
      const level = ([1, 2, 3] as const).find((l) => levelIds(l).includes(c.id));
      if (!level || c.value.length > 100)
        return { accepted: false, progress: p, message: 'Unknown response.' };
      const checks = { ...p.checks };
      delete checks[level];
      return {
        accepted: true,
        progress: { ...p, responses: { ...p.responses, [c.id]: c.value }, checks },
        message: '',
      };
    }
    if (c.kind === 'maxwell-check') {
      const current = check(p, p.level);
      return {
        accepted: true,
        progress: { ...p, checks: { ...p.checks, [p.level]: current } },
        message: '',
      };
    }
    return { accepted: false, progress: p, message: 'Unknown command.' };
  },
};
export function assertMaxwellProgress(value: unknown): asserts value is MaxwellProgress {
  if (!value || typeof value !== 'object') throw Error('Invalid Maxwell progress');
  const p = value as MaxwellProgress;
  const expected = [
    'kind',
    'course',
    'profileId',
    'activityId',
    'level',
    'responses',
    'checks',
    'revealed',
  ];
  if (
    Object.keys(p).some((k) => ![...expected, 'introduction'].includes(k)) ||
    (p.introduction !== undefined && typeof p.introduction !== 'boolean') ||
    expected.some((k) => !Object.hasOwn(p, k)) ||
    p.kind !== 'olympiad-completion' ||
    p.course !== 'alevel' ||
    p.activityId !== 'alevel/maxwells-demon' ||
    typeof p.profileId !== 'string' ||
    !p.profileId ||
    ![1, 2, 3].includes(p.level) ||
    !p.responses ||
    Array.isArray(p.responses) ||
    typeof p.responses !== 'object' ||
    !p.checks ||
    Array.isArray(p.checks) ||
    typeof p.checks !== 'object' ||
    !Array.isArray(p.revealed) ||
    new Set(p.revealed).size !== p.revealed.length ||
    p.revealed.some((l) => ![1, 2, 3].includes(l))
  )
    throw Error('Invalid Maxwell progress');
  const format = saveFormat(p);
  const ids =
    format === 'network'
      ? [...levelIds(1), ...previousLevel1Ids, ...levelIds(2), ...levelIds(3)]
      : [...legacyLevel1Ids, ...legacyLevel2Ids, ...levelIds(3)];
  if (
    ['l1-scaled', 'l1-reaction'].some((id) => Object.hasOwn(p.responses, id)) &&
    ['l1-carbon-atomisation', 'l1-sodium-chloride-formation'].some((id) =>
      Object.hasOwn(p.responses, id),
    )
  )
    throw Error('Hybrid Maxwell classification format');
  for (const [id, v] of Object.entries(p.responses))
    if (!ids.includes(id) || typeof v !== 'string' || v.length > 100)
      throw Error('Invalid Maxwell response');
  for (const [key, v] of Object.entries(p.checks)) {
    const l = Number(key) as Level;
    const expectedChecks =
      l === 1
        ? format === 'legacy'
          ? [legacyCheck(p, legacyLevel1Ids)]
          : ['l1-carbon-atomisation', 'l1-sodium-chloride-formation'].some((id) =>
                Object.hasOwn(p.responses, id),
              )
            ? [check(p, 1)]
            : ['l1-scaled', 'l1-reaction'].some((id) => Object.hasOwn(p.responses, id))
              ? [legacyCheck(p, previousLevel1Ids)]
              : [check(p, 1), legacyCheck(p, previousLevel1Ids)]
        : format === 'network' || l === 3
          ? [check(p, l)]
          : [legacyCheck(p, legacyLevel2Ids.slice(0, 9)), legacyCheck(p, legacyLevel2Ids)];
    if (
      !['1', '2', '3'].includes(key) ||
      !v ||
      Object.keys(v).sort().join(',') !== 'correct,fingerprint' ||
      !Array.isArray(v.correct) ||
      !expectedChecks.some((expected) => JSON.stringify(v) === JSON.stringify(expected))
    )
      throw Error('Stale or forged Maxwell completion');
  }
}

const previousLevel1Ids = [...levelIds(1).slice(0, 8), 'l1-scaled', 'l1-state', 'l1-reaction'];
const legacyLevel1Ids = [
  ...previousLevel1Ids.slice(0, 8),
  'l1-mean',
  ...previousLevel1Ids.slice(8),
];
const legacyLevel2Answers: Record<string, string | number> = {
  'l2-hydrogenation': -523.352,
  'l2-oxygen': 2,
  'l2-co2': 1,
  'l2-water': 2,
  'l2-oxygen-state': 'aq',
  'l2-oxidation': -580.46,
  'l2-CD': -128,
  'l2-BE': 317,
  'l2-GF': -374,
  'l2-low': 'F',
  'l2-middle': 'I',
  'l2-high': 'G',
  'l2-FI': 110,
  'l2-IG': 264,
  'l2-FG': 374,
};
const legacyLevel2Ids = Object.keys(legacyLevel2Answers);
function saveFormat(p: MaxwellProgress): 'legacy' | 'network' {
  const count = levelIds(2).filter((id) => Object.hasOwn(p.responses, id)).length;
  if (count !== 0 && count !== 12) throw Error('Incomplete Maxwell network format');
  return count === 12 ? 'network' : 'legacy';
}
function legacyCorrect(id: string, value: string): boolean {
  if (id === 'l1-mean') return value === 'bond';
  if (id === 'l1-scaled' || id === 'l1-reaction') return value === '';
  if (!Object.hasOwn(legacyLevel2Answers, id)) return isCorrect(id, value);
  const a = legacyLevel2Answers[id];
  if (typeof a === 'string') return value.trim() === a;
  const n = parseNumber(value);
  return (
    n !== null &&
    Math.abs(n - a!) <= (['l2-hydrogenation', 'l2-oxidation'].includes(id) ? 0.6 : 0.000001)
  );
}
function legacyCheck(p: MaxwellProgress, ids: readonly string[]) {
  return {
    fingerprint: fingerprintIds(p, ids),
    correct: ids.filter(
      (id) => Object.hasOwn(p.responses, id) && legacyCorrect(id, p.responses[id]!),
    ),
  };
}
/** Authenticate historical fingerprints before discarding retired answers and reveal flags. Loading is pure. */
export function migrateMaxwellProgress(value: unknown): MaxwellProgress {
  assertMaxwellProgress(value);
  const legacy = saveFormat(value) === 'legacy';
  const activeIds = [...levelIds(1), ...levelIds(2), ...levelIds(3)];
  const responses = Object.fromEntries(
    Object.entries(value.responses).filter(([id]) => activeIds.includes(id)),
  );
  if (legacy) {
    Object.assign(responses, Object.fromEntries(levelIds(2).map((id) => [id, ''])));
    for (const edge of ['CD', 'BE'])
      if (Object.hasOwn(value.responses, 'l2-' + edge))
        responses['l2-map-' + edge] = value.responses['l2-' + edge]!;
  }
  const p = { ...value, responses, revealed: [] };
  const checks = { ...value.checks };
  if (legacy) delete checks[2];
  if (checks[1]) checks[1] = check(p, 1);
  return { ...p, checks };
}
/** Empty toggle state is not an explicit general-reaction choice. */
export function toggleCategory(value: string | undefined, id: string): string {
  const selected = new Set((value ?? '').split('|').filter((v) => v && v !== 'unselected'));
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  return selected.size ? [...selected].sort().join('|') : 'unselected';
}
