import type { MaxwellProgress, MaxwellPolicy, Level } from '../../../contracts/index.ts';
import { classifications, level2Tasks, level3Tasks, levelIds } from './content.ts';
export const blankMaxwellProgress = (profileId: string): MaxwellProgress => ({
  kind: 'olympiad-completion',
  course: 'alevel',
  profileId,
  activityId: 'alevel/maxwells-demon',
  level: 1,
  responses: {},
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
  let h = 2166136261;
  for (const c of JSON.stringify(levelIds(level).map((id) => [id, p.responses[id] ?? '']))) {
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
    const checks: MaxwellProgress['checks'] = {};
    for (const level of [1, 2, 3] as const) {
      if (p.checks[level]?.fingerprint === fingerprint(p, level))
        Object.assign(checks, { [level]: check(p, level) });
    }
    return { ...p, checks };
  },
  transition(_challenge, p, c) {
    if (c.kind === 'restart')
      return {
        accepted: true,
        progress: blankMaxwellProgress(p.profileId),
        message: 'Challenge restarted.',
      };
    if (c.kind === 'maxwell-level' && [1, 2, 3].includes(c.level))
      return { accepted: true, progress: { ...p, level: c.level }, message: '' };
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
    if (c.kind === 'maxwell-reveal')
      return {
        accepted: true,
        progress: { ...p, revealed: [...new Set([...p.revealed, p.level])] },
        message: 'Worked answers opened.',
      };
    if (c.kind === 'maxwell-check') {
      const current = check(p, p.level);
      return {
        accepted: true,
        progress: { ...p, checks: { ...p.checks, [p.level]: current } },
        message:
          current.correct.length +
          ' / ' +
          levelIds(p.level).length +
          ' correct in Level ' +
          p.level +
          '.',
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
    Object.keys(p).some((k) => !expected.includes(k)) ||
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
  const ids = [...levelIds(1), ...levelIds(2), ...levelIds(3)];
  for (const [id, v] of Object.entries(p.responses))
    if (!ids.includes(id) || typeof v !== 'string' || v.length > 100)
      throw Error('Invalid Maxwell response');
  for (const [key, v] of Object.entries(p.checks)) {
    const l = Number(key) as Level;
    if (
      ![1, 2, 3].includes(l) ||
      !v ||
      Object.keys(v).sort().join(',') !== 'correct,fingerprint' ||
      !Array.isArray(v.correct) ||
      JSON.stringify(v) !== JSON.stringify(check(p, l))
    )
      throw Error('Stale or forged Maxwell completion');
  }
}
