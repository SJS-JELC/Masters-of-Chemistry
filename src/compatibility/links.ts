import type { Course, QuestionRef } from '../contracts/identity.ts';
import type { CompatibilityResolution } from '../contracts/integration.ts';
import type { QuestionProvider } from '../contracts/question.ts';

// Only migrated, source-owned pure providers. No original page scripts execute.
const providers = {
  alevel: {
    'explaining-properties': async () =>
      (await import('../activities/alevel/explaining-properties/provider.ts')).propertiesProvider,
    'acid-base-calculations': async () =>
      (await import('../activities/alevel/acid-base-calculations/provider.ts')).acidProvider,
    'electrons-bonding': async () =>
      (await import('../activities/alevel/electrons-bonding/provider.ts')).electronsBondingProvider,
    'electron-configurations': async () =>
      (await import('../activities/alevel/electron-configurations/provider.ts'))
        .electronConfigurationsProvider,
    'dot-and-cross': async () =>
      (await import('../activities/alevel/dot-and-cross/provider.ts')).dotCrossProvider,
    'ph-titration-curves': async () =>
      (await import('../activities/alevel/ph-titration-curves/provider.ts')).titrationProvider,
  },
  igcse: {
    calorimetry: async () =>
      (await import('../activities/igcse/calorimetry/provider.ts')).calorimetryProvider,
    'bond-enthalpy': async () =>
      (await import('../activities/igcse/bond-enthalpy/provider.ts')).bondProvider,
    'structure-and-bonding': async () =>
      (await import('../activities/igcse/structure-and-bonding/provider.ts')).structureProvider,
    'dot-and-cross': async () =>
      (await import('../activities/igcse/dot-and-cross/provider.ts')).igcseDotCrossProvider,
    'energy-enthalpy': async () =>
      (await import('../activities/igcse/energy-enthalpy/provider.ts')).energyProvider,
    'energetics-practical': async () =>
      (await import('../activities/igcse/energetics-practical/provider.ts')).practicalProvider,
  },
} satisfies Record<Course, Record<string, () => Promise<QuestionProvider>>>;
const unrecognized = (raw: string, reason: string): CompatibilityResolution => ({
  kind: 'unrecognized',
  raw,
  reason,
});
/** Accept current canonical question URLs or exact codes. */
export async function resolveCompatibilityLink(
  course: Course,
  input: string,
): Promise<CompatibilityResolution> {
  if (typeof input !== 'string' || input.length > 4096)
    return unrecognized(String(input), 'Link exceeds the supported length.');
  const raw = input.trim();
  if (!raw) return unrecognized(raw, 'Enter a question code or current question link.');
  let code = raw,
    activity: string | undefined,
    requestedLevel: number | undefined,
    requestedSeed: number | undefined;
  if (/[/?#]/.test(raw) || /^https?:/i.test(raw)) {
    let url: URL;
    try {
      url = new URL(raw, 'https://compatibility.invalid/');
    } catch {
      return unrecognized(raw, 'Malformed question link.');
    }
    if (!['http:', 'https:'].includes(url.protocol))
      return unrecognized(raw, 'Unsupported link protocol.');
    let path: string;
    try {
      path = decodeURI(url.pathname);
    } catch {
      return unrecognized(raw, 'Malformed URL encoding.');
    }
    const prefix = path.match(/^\/(alevel|igcse)(?:\/|$)/)?.[1];
    if (prefix && prefix !== course)
      return unrecognized(raw, 'This link belongs to the other course.');
    const courseParams = url.searchParams.getAll('course');
    if (courseParams.length > 1 || courseParams.some((value) => value !== course))
      return unrecognized(raw, 'Course identity does not match the link.');
    const match = path.match(/(?:^|\/)activities\/([^/]+)(?:\/index\.html|\/?)$/);
    if (match) activity = match[1];
    else if (
      path !== '/' &&
      !/\/(?:alevel|igcse)\/?$/.test(path) &&
      !path.endsWith('/index.html') &&
      !path.endsWith(`/${course}.html`)
    )
      return unrecognized(raw, 'Unsupported current activity route.');
    if (activity === 'rocket-recall')
      return unrecognized(raw, 'Rocket Recall is excluded from this application.');
    if (activity === 'c3l6-organic-reactions')
      return course === 'alevel'
        ? { kind: 'olympiad', activityId: 'alevel/c3l6-organic-reactions', source: raw }
        : unrecognized(raw, 'Olympiad is available only in the A Level course.');
    const codeKeys = ['review', 'question', 'code'];
    if (codeKeys.some((k) => url.searchParams.getAll(k).length > 1))
      return unrecognized(raw, 'Repeated question parameters.');
    const values = codeKeys.flatMap((k) => url.searchParams.getAll(k));
    if (!values.length || values.some((v) => !v || /[/?#]/.test(v)))
      return unrecognized(
        raw,
        'The link has no supported stable question code; choose an activity in Practice.',
      );
    // Multiple current code parameters must resolve to the same canonical reference.
    if (values.length > 1) {
      const decoded = await Promise.all(values.map((v) => resolveCompatibilityLink(course, v)));
      const refs = decoded.map((r) => (r.kind === 'curriculum' ? r.ref : null));
      if (refs.some((r) => !r) || refs.some((r) => JSON.stringify(r) !== JSON.stringify(refs[0])))
        return unrecognized(raw, 'Conflicting question parameters.');
    }
    code = values[0]!;
    const levels = [...url.searchParams.getAll('level'), ...url.searchParams.getAll('grade')];
    if (levels.length > 1 || levels.some((v) => !['1', '2', '3'].includes(v)))
      return unrecognized(raw, 'Invalid or ambiguous question level.');
    if (levels.length) requestedLevel = Number(levels[0]);
    const seeds = url.searchParams.getAll('seed');
    if (
      seeds.length > 1 ||
      seeds.some(
        (v) => !/^\d+$/.test(v) || !Number.isSafeInteger(Number(v)) || Number(v) > 0xffffffff,
      )
    )
      return unrecognized(raw, 'Invalid or ambiguous question seed.');
    if (seeds.length) requestedSeed = Number(seeds[0]);
    const activityParams = url.searchParams.getAll('activity');
    if (activityParams.length > 1) return unrecognized(raw, 'Ambiguous activity identity.');
    if (activityParams.length) {
      const [declaredCourse, declaredActivity] = activityParams[0]!.split('/');
      if (
        declaredCourse !== course ||
        !declaredActivity ||
        (activity && activity !== declaredActivity)
      )
        return unrecognized(raw, 'Activity identity does not match the link.');
      activity = declaredActivity;
    }
  }
  const table: Record<string, () => Promise<QuestionProvider>> = providers[course];
  if (activity && !table[activity])
    return unrecognized(raw, 'This activity is not included in this course.');
  const matches: QuestionRef[] = [];
  for (const [slug, load] of Object.entries(table)) {
    if (activity && slug !== activity) continue;
    const provider = await load();
    let ref = provider.resolveLink?.(code) ?? null;
    if (ref) {
      try {
        const encoded = /^(?:AB|CAL|BE|ECB)-/i.test(code);
        if (
          encoded &&
          ((requestedSeed !== undefined && requestedSeed !== ref.seed) ||
            (requestedLevel !== undefined && requestedLevel !== ref.level))
        )
          continue;
        if (!encoded)
          ref = {
            ...ref,
            ...(requestedSeed === undefined ? {} : { seed: requestedSeed }),
            ...(requestedLevel === undefined
              ? {}
              : { level: requestedLevel as QuestionRef['level'] }),
          };
        if (slug === 'dot-and-cross') {
          const record =
            course === 'alevel'
              ? (await import('../activities/alevel/dot-and-cross/provider.ts')).getRecord(
                  ref.questionId,
                )
              : (await import('../activities/igcse/dot-and-cross/provider.ts')).getRecord(
                  ref.questionId,
                );
          // Empty grade lists are the original teacher-only mixed examples. They remain
          // reproducible in review, while curriculum selection excludes them.
          if (record.grades.length && !record.grades.includes(ref.level)) continue;
        }
        provider.restore(ref);
        matches.push(ref);
      } catch {}
    }
  }
  const unique = matches.filter(
    (r, i) => matches.findIndex((x) => JSON.stringify(x) === JSON.stringify(r)) === i,
  );
  return unique.length === 1
    ? { kind: 'curriculum', ref: unique[0]!, source: raw }
    : unrecognized(
        raw,
        unique.length
          ? 'The code matches more than one activity; use its current activity link.'
          : 'Unknown or malformed question code for this course.',
      );
}
