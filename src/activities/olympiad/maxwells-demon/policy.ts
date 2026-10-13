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
/** A part unlocks only after every earlier part has been checked fully correct. */
export function maxwellPartUnlocked(p: MaxwellProgress, level: Level): boolean {
  return ([1, 2, 3] as const).filter((previous) => previous < level).every((previous) => {
    const saved = p.checks[previous];
    const current = check(p, previous);
    return saved?.fingerprint === current.fingerprint &&
      current.correct.length === levelIds(previous).length &&
      current.correct.every((id) => saved.correct.includes(id));
  });
}
export function availableMaxwellPart(p: MaxwellProgress): Level {
  return !maxwellPartUnlocked(p, 2) ? 1 : !maxwellPartUnlocked(p, 3) ? 2 : 3;
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
    if (c.kind === 'maxwell-level' && [1, 2, 3].includes(c.level)) {
      if (!maxwellPartUnlocked(p, c.level))
        return { accepted: false, progress: p, message: 'Complete and check all earlier parts first.' };
      return {
        accepted: true,
        progress: { ...p, level: c.level, introduction: false },
        message: '',
      };
    }
    if (c.kind === 'maxwell-introduction')
      return { accepted: true, progress: { ...p, introduction: true }, message: '' };
    if (c.kind === 'maxwell-answer') {
      const level = ([1, 2, 3] as const).find((l) => levelIds(l).includes(c.id));
      if (!level || c.value.length > 100)
        return { accepted: false, progress: p, message: 'Unknown response.' };
      if (!maxwellPartUnlocked(p, level))
        return { accepted: false, progress: p, message: 'Complete and check all earlier parts first.' };
      const checks = { ...p.checks };
      delete checks[level];
      const next = { ...p, responses: { ...p.responses, [c.id]: c.value }, checks };
      return {
        accepted: true,
        progress: { ...next, level: Math.min(next.level, availableMaxwellPart(next)) as Level },
        message: '',
      };
    }
    if (c.kind === 'maxwell-check') {
      if (!maxwellPartUnlocked(p, p.level))
        return { accepted: false, progress: p, message: 'Complete and check all earlier parts first.' };
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
      ? [...levelIds(1), ...previousLevel1Ids, ...levelIds(2), ...levelIds(3), ...previousLevel3Ids]
      : [...legacyLevel1Ids, ...legacyLevel2Ids, ...previousLevel3Ids];
  if (
    ['l1-scaled', 'l1-reaction'].some((id) => Object.hasOwn(p.responses, id)) &&
    ['l1-carbon-atomisation', 'l1-sodium-chloride-formation'].some((id) =>
      Object.hasOwn(p.responses, id),
    )
  )
    throw Error('Hybrid Maxwell classification format');
  const oldCTail = ['l3-j', 'l3-z'].some((id) => Object.hasOwn(p.responses, id));
  const newCTail = ['l3-coefficient-i', 'l3-estimate-j'].some((id) =>
    Object.hasOwn(p.responses, id),
  );
  if (oldCTail && newCTail) throw Error('Hybrid Maxwell coefficient format');
  for (const [id, v] of Object.entries(p.responses))
    if (!ids.includes(id) || typeof v !== 'string' || v.length > 100)
      throw Error('Invalid Maxwell response');
  for (const [key, v] of Object.entries(p.checks)) {
    const l = Number(key) as Level;
    const expectedChecks =
      l === 3
        ? oldCTail || format === 'legacy'
          ? [legacyCheck(p, previousLevel3Ids)]
          : newCTail
            ? [check(p, 3)]
            : [check(p, 3), legacyCheck(p, previousLevel3Ids)]
        : l === 1
          ? format === 'legacy'
            ? [legacyCheck(p, legacyLevel1Ids)]
            : ['l1-carbon-atomisation', 'l1-sodium-chloride-formation'].some((id) =>
                  Object.hasOwn(p.responses, id),
                )
              ? [check(p, 1)]
              : ['l1-scaled', 'l1-reaction'].some((id) => Object.hasOwn(p.responses, id))
                ? [legacyCheck(p, previousLevel1Ids)]
                : [check(p, 1), legacyCheck(p, previousLevel1Ids)]
          : format === 'network'
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
const previousLevel3Ids = [...levelIds(3).slice(0, 8), 'l3-j', 'l3-z'];
function saveFormat(p: MaxwellProgress): 'legacy' | 'network' {
  const count = levelIds(2).filter((id) => Object.hasOwn(p.responses, id)).length;
  if (count !== 0 && count !== 12) throw Error('Incomplete Maxwell network format');
  return count === 12 ? 'network' : 'legacy';
}
function legacyCorrect(id: string, value: string): boolean {
  if (id === 'l1-mean') return value === 'bond';
  if (id === 'l1-scaled' || id === 'l1-reaction') return value === '';
  if (id === 'l3-j' || id === 'l3-z') {
    const n = parseNumber(value);
    return (
      n !== null &&
      Math.abs(n - (id === 'l3-j' ? -11 / 18 : 493.65)) <= (id === 'l3-j' ? 0.000001 : 0.6)
    );
  }
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
  for (const [oldId, newId] of [
    ['l3-j', 'l3-coefficient-i'],
    ['l3-z', 'l3-estimate-j'],
  ])
    if (Object.hasOwn(value.responses, oldId!)) responses[newId!] = value.responses[oldId!]!;
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
  if (checks[3]) checks[3] = check(p, 3);
  const migrated = { ...p, checks };
  return { ...migrated, level: Math.min(p.level, availableMaxwellPart(migrated)) as Level };
}
/** Empty toggle state is not an explicit general-reaction choice. */
export function toggleCategory(value: string | undefined, id: string): string {
  const selected = new Set((value ?? '').split('|').filter((v) => v && v !== 'unselected'));
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  return selected.size ? [...selected].sort().join('|') : 'unselected';
}

/** C-only editing accepts incomplete numeric forms; complete assessment still uses parseNumber. */
export function acceptsNumericEdit(value: string): boolean {
  return (
    value.length <= 100 &&
    /^\s*[+\-−]?(?:\d*(?:\.\d*)?)\s*(?:\/\s*[+\-−]?(?:\d*(?:\.\d*)?)\s*)?$/.test(value)
  );
}

/** Historical invalid drafts may lose characters, but never gain/reorder them through this exception. */
export function acceptsNumericDeletion(before: string, after: string): boolean {
  if (after.length >= before.length) return false;
  let position = 0;
  for (const character of after) {
    position = before.indexOf(character, position);
    if (position < 0) return false;
    position++;
  }
  return true;
}
