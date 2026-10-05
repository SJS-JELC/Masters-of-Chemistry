import { ALPHA_COURSE_PREFERENCE_KEY } from '../persistence/alpha-namespace.ts';
import { createStore } from 'zustand/vanilla';
import type { Course, CurriculumTarget, PlatformView } from '../contracts/index.ts';
import type { ActivityRegistry } from '../contracts/registry.ts';
import type { CurriculumLaunchRequest, LandingLaunchRequest } from '../contracts/landing.ts';

export const COURSE_PREFERENCE_KEY = ALPHA_COURSE_PREFERENCE_KEY;
export function explicitCourse(url: URL): Course | undefined {
  const declared = url.searchParams.get('course');
  if (declared === 'alevel' || declared === 'igcse') return declared;
  const activityCourse = url.searchParams.get('activity')?.split('/')[0];
  if (activityCourse === 'alevel' || activityCourse === 'igcse') return activityCourse;
  // Landing leaf IDs have source-owned course prefixes, including hidden aliases.
  if (/^#(?:l6|u6)-/.test(url.hash)) return 'alevel';
  if (/^#(?:fourth|lower|upper)-/.test(url.hash)) return 'igcse';
  return undefined;
}
export function routeCourse(url: URL, remembered: string | null, entry: Course): Course {
  return (
    explicitCourse(url) ?? (remembered === 'alevel' || remembered === 'igcse' ? remembered : entry)
  );
}
export function routeView(url: URL, course: Course): PlatformView {
  let query = url.searchParams;
  const value = query.get('view');
  if (
    ['home', 'practice', 'revision', 'teacher', 'statistics', 'import', 'olympiad'].includes(
      value || '',
    ) &&
    (value !== 'olympiad' || course === 'alevel')
  )
    return value as PlatformView;
  if (
    course === 'alevel' &&
    (query.get('olympiad') === 'c3l6' || ['alevel/c3l6-organic-reactions','alevel/olympiad-2011-q4'].includes(query.get('activity') || ''))
  )
    return 'olympiad';
  if (
    ['teacher', 'review'].includes(query.get('mode') || '') ||
    query.has('review') ||
    query.has('question') ||
    query.has('code')
  )
    return 'teacher';
  if (query.get('session') === 'revision') return 'revision';
  return query.has('activity') || query.has('leaf') ? 'practice' : 'home';
}
/** Only exact registered leaves and genuinely supported levels cross into the host. */
export function validateLandingLaunch(
  request: LandingLaunchRequest,
  registry: ActivityRegistry,
): CurriculumLaunchRequest | null {
  if (!request.id || !['alevel', 'igcse'].includes(request.course)) return null;
  const registrations = registry.curriculumFor(request.course);
  const targetsFor = (gemId: string): CurriculumTarget[] =>
    registrations.flatMap((registration) =>
      registration.gems
        .filter((gem) => gem.id === gemId)
        .flatMap((gem) =>
          gem.supportedLevels.map(
            (level) =>
              ({
                course: registration.course,
                activityId: registration.id,
                gemId,
                level,
              }) as CurriculumTarget,
          ),
        ),
    );
  if (request.kind === 'practice') {
    const targets = targetsFor(request.gemId);
    const target =
      request.selection === 'mastery'
        ? targets[0]
        : targets.find((item) => item.level === request.level);
    return target
      ? { id: request.id, kind: 'practice', target, selection: request.selection, fresh: true }
      : null;
  }
  const gemIds = [...new Set(request.gemIds)].sort();
  if (!gemIds.length || gemIds.some((id) => !targetsFor(id).length)) return null;
  return {
    id: request.id,
    kind: 'revision',
    course: request.course,
    gemIds,
    targets: gemIds.flatMap(targetsFor),
  };
}
export function sameRevisionSelection(
  a: readonly CurriculumTarget[],
  b: readonly CurriculumTarget[],
): boolean {
  const key = (target: CurriculumTarget) =>
    `${target.course}/${target.activityId}/${target.gemId}/${target.level}`;
  const first = [...new Set(a.map(key))].sort(),
    second = [...new Set(b.map(key))].sort();
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

interface NavigationView {
  readonly curriculumOpen: boolean;
  readonly olympiadOpen: boolean;
  readonly setCurriculumOpen: (open: boolean) => void;
  readonly setOlympiadOpen: (open: boolean) => void;
}

/** A fresh transient view store per shell; no attempts, course evidence or persistence. */
export function createNavigationViewStore() {
  return createStore<NavigationView>()((set) => ({
    curriculumOpen: true,
    olympiadOpen: false,
    setCurriculumOpen: (open) =>
      set((state) => (state.curriculumOpen === open ? state : { curriculumOpen: open })),
    setOlympiadOpen: (open) =>
      set((state) => (state.olympiadOpen === open ? state : { olympiadOpen: open })),
  }));
}
