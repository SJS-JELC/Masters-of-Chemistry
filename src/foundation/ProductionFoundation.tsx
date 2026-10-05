import { alphaDatabaseName } from '../persistence/alpha-namespace.ts';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ActivityId,
  Course,
  CurriculumEvidence,
  PlatformView,
  QuestionRef,
  OlympiadActivityId,
} from '../contracts/index.ts';
import type { CurriculumLaunchRequest, LandingLaunchRequest } from '../contracts/landing.ts';
import { FoundationApp as CurriculumHost } from './ActivityHost.tsx';
import { CourseShell } from '../shell/CourseShell.tsx';
import { productionRegistry } from './registry.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import {
  COURSE_PREFERENCE_KEY,
  explicitCourse,
  routeCourse,
  routeView,
  validateLandingLaunch,
} from '../shell/navigation-view.ts';
const OriginalLanding = lazy(async () => ({
  default: (await import('../landing/index.ts')).OriginalLanding,
}));
const OlympiadHost = lazy(async () => ({
  default: (await import('./OlympiadHost.tsx')).OlympiadHost,
}));
const StatisticsView = lazy(async () => ({
  default: (await import('../statistics/index.ts')).StatisticsView,
}));
const RecallView = lazy(async () => ({
  default: (await import('../recall/RecallView.tsx')).RecallView,
}));
const LegacyImportView = lazy(async () => ({
  default: (await import('../compatibility/index.ts')).LegacyImportView,
}));
function rememberedCourse(): string | null {
  try {
    return localStorage.getItem(COURSE_PREFERENCE_KEY);
  } catch {
    return null;
  }
}
function linkInput(url: URL): string | null {
  const source = url;
  return ['review', 'question', 'code'].some((key) => source.searchParams.has(key))
    ? source.href
    : null;
}
function activityFromURL(url: URL, course: Course): ActivityId | undefined {
  const raw = url.searchParams.get('activity') || (url.searchParams.get('olympiad') === 'c3l6' ? 'alevel/c3l6-organic-reactions' : null);
  const slug = url.pathname.match(/activities\/([^/]+)/)?.[1];
  return productionRegistry.activities.find(
    (item) => item.course === course && (item.id === raw || item.id === `${course}/${slug}`),
  )?.id;
}
function launchFromURL(url: URL, course: Course): CurriculumLaunchRequest | undefined {
  const source = url;
  if (['teacher', 'review'].includes(source.searchParams.get('mode') || '')) return;
  if (
    linkInput(url) ||
    (source.searchParams.get('fresh') !== '1' && !source.searchParams.has('leaf'))
  )
    return;
  const activityId = activityFromURL(url, course),
    rawGem = source.searchParams.get('gem') || source.searchParams.get('leaf');
  const registrations = productionRegistry
    .curriculumFor(course)
    .filter((item) => !activityId || item.id === activityId);
  const gem = registrations.flatMap((item) => item.gems).find((item) => item.id === rawGem);
  if (!gem) return;
  const level = Number(
    source.searchParams.get('level') || source.searchParams.get('grade') || gem.supportedLevels[0],
  );
  const request: LandingLaunchRequest =
    source.searchParams.get('practice') === 'mastery'
      ? { id: crypto.randomUUID(), kind: 'practice', course, gemId: gem.id, selection: 'mastery' }
      : {
          id: crypto.randomUUID(),
          kind: 'practice',
          course,
          gemId: gem.id,
          selection: 'fixed-level',
          level: level as 1 | 2 | 3,
        };
  return validateLandingLaunch(request, productionRegistry) ?? undefined;
}
function teacherGroupFromURL(url: URL, course: Course): 'ionic' | 'covalent' | undefined {
  if (
    course !== 'igcse' ||
    activityFromURL(url, course) !== 'igcse/dot-and-cross' ||
    linkInput(url)
  )
    return;
  const source = url;
  const category = source.searchParams.get('category');
  return category === 'ionic' || category === 'covalent' ? category : undefined;
}
/** Both static entry points mount this switchable, course-separated platform. */
export function FoundationApp({ course: entryCourse }: { readonly course: Course }) {
  const initialURL = useMemo(() => new URL(location.href), []);
  const [course, setCourse] = useState<Course>(() =>
    routeCourse(initialURL, rememberedCourse(), entryCourse),
  );
  const [view, setView] = useState<PlatformView>(() =>
    routeView(initialURL, routeCourse(initialURL, rememberedCourse(), entryCourse)),
  );
  const [requestedActivity, setRequestedActivity] = useState<ActivityId | undefined>(() =>
    activityFromURL(initialURL, routeCourse(initialURL, rememberedCourse(), entryCourse)),
  );
  const [reviewRef, setReviewRef] = useState<QuestionRef | undefined>();
  const [teacherGroup, setTeacherGroup] = useState<'ionic' | 'covalent' | undefined>(() =>
    teacherGroupFromURL(initialURL, routeCourse(initialURL, rememberedCourse(), entryCourse)),
  );
  const [linkMessage, setLinkMessage] = useState('');
  const [pendingLink, setPendingLink] = useState(() => linkInput(initialURL));
  const [launchRequest, setLaunchRequest] = useState<CurriculumLaunchRequest | undefined>(() =>
    launchFromURL(initialURL, routeCourse(initialURL, rememberedCourse(), entryCourse)),
  );
  const [historyRecords, setHistoryRecords] = useState<readonly CurriculumEvidence[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const navigationGuard = useRef<(() => Promise<boolean>) | null>(null);
  const currentURL = useRef(initialURL.href);
  const popBusy = useRef(false);
  const namespace = useMemo(() => ({ course, profileId: 'local' }), [course]);
  const run =
    (import.meta.env.DEV ? initialURL.searchParams.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const databaseName = alphaDatabaseName(course, run);
  useEffect(() => {
    try {
      localStorage.setItem(COURSE_PREFERENCE_KEY, course);
    } catch {
      /* Preference is optional; evidence remains in IndexedDB. */
    }
  }, [course]);
  useEffect(() => {
    if (view !== 'home') return;
    let cancelled = false;
    const repository = createChemistryRepository(databaseName);
    setHistoryLoading(true);
    void repository
      .curriculumHistory(namespace)
      .then((result) => {
        if (cancelled) return;
        if (result.ok) setHistoryRecords(result.value);
        else {
          setHistoryRecords([]);
          setLinkMessage('Saved progress could not be read. Return Home or reload to retry.');
        }
        setHistoryLoading(false);
      })
      .finally(() => repository.close?.());
    return () => {
      cancelled = true;
    };
  }, [view, databaseName, namespace]);
  const registerGuard = useCallback((guard: (() => Promise<boolean>) | null) => {
    navigationGuard.current = guard;
  }, []);
  const writeURL = useCallback(
    (url: URL, replace = false, urlCourse = course) => {
      url.searchParams.set('course', urlCourse);
      if (replace) history.replaceState(null, '', url);
      else history.pushState(null, '', url);
      currentURL.current = url.href;
    },
    [course],
  );
  const selectView = useCallback(
    (next: PlatformView) => {
      if (next === 'olympiad' && course !== 'alevel') return;
      const url = new URL(location.href);
      for (const key of [
        'review',
        'question',
        'code',
        'mode',
        'session',
        'olympiad',
        'level',
        'grade',
        'seed',
        'activity',
        'gem',
        'fresh',
        'practice',
        'category',
      ])
        url.searchParams.delete(key);
      url.hash = '';
      url.searchParams.set('view', next);
      if (next === 'olympiad') setRequestedActivity(undefined);
      writeURL(url);
      setReviewRef(undefined);
      setTeacherGroup(undefined);
      setPendingLink(null);
      setLinkMessage('');
      setLaunchRequest(undefined);
      setView(next);
    },
    [course, writeURL],
  );
  const selectCourse = useCallback(
    (next: Course) => {
      if (next === course) return;
      const url = new URL(location.href);
      url.search = '';
      url.hash = '';
      if (import.meta.env.DEV && run !== 'local') url.searchParams.set('run', run);
      url.searchParams.set('course', next);
      url.searchParams.set('view', 'home');
      history.pushState(null, '', url);
      currentURL.current = url.href;
      setCourse(next);
      setView('home');
      setReviewRef(undefined);
      setPendingLink(null);
      setRequestedActivity(undefined);
      setLaunchRequest(undefined);
      setHistoryRecords([]);
      setLinkMessage('');
    },
    [course, run],
  );
  const selectChallenge = useCallback((id: OlympiadActivityId | undefined) => {
    selectView('olympiad');
    setRequestedActivity(id);
    const url = new URL(location.href);
    if (id) url.searchParams.set('activity',id);
    writeURL(url,true);
  },[selectView,writeURL]);
  const selectActivity = useCallback(
    (id: ActivityId) => {
      if (productionRegistry.get(id)?.strand === 'olympiad') selectChallenge(id as OlympiadActivityId);
      else {
        setRequestedActivity(id);
        selectView('practice');
      }
    },
    [selectView,selectChallenge],
  );
  const selectTeacher = useCallback(
    (gemId?: string) => {
      let chosenActivity: ActivityId | undefined;
      if (gemId) {
        const registration = productionRegistry
          .curriculumFor(course)
          .find((item) => item.gems.some((gem) => gem.id === gemId));
        if (!registration) {
          setLinkMessage('Teacher questions are not available for this gem.');
          return;
        }
        setRequestedActivity(registration.id);
        chosenActivity = registration.id;
      }
      selectView('teacher');
      const category =
        course === 'igcse' && chosenActivity === 'igcse/dot-and-cross'
          ? gemId === 'fourth-3-1'
            ? 'ionic'
            : gemId === 'fourth-3-2'
              ? 'covalent'
              : undefined
          : undefined;
      setTeacherGroup(category);
      if (chosenActivity) {
        const url = new URL(location.href);
        url.searchParams.set('activity', chosenActivity);
        if (category) url.searchParams.set('category', category);
        writeURL(url, true);
      }
    },
    [course, selectView, writeURL],
  );
  const launch = useCallback(
    (request: LandingLaunchRequest) => {
      const validated = validateLandingLaunch(request, productionRegistry);
      if (!validated || request.course !== course) {
        setLinkMessage('This activity or level is not available.');
        return;
      }
      const url = new URL(location.href);
      url.hash = '';
      for (const key of [
        'review',
        'question',
        'code',
        'mode',
        'olympiad',
        'level',
        'grade',
        'seed',
        'activity',
        'gem',
        'fresh',
        'practice',
        'session',
      ])
        url.searchParams.delete(key);
      url.searchParams.set('view', request.kind);
      url.searchParams.set('fresh', '1');
      if (validated.kind === 'practice') {
        url.searchParams.set('activity', validated.target.activityId);
        url.searchParams.set('gem', validated.target.gemId);
        url.searchParams.set('practice', validated.selection);
        url.searchParams.set('level', String(validated.target.level));
        setRequestedActivity(validated.target.activityId);
      }
      writeURL(url);
      setReviewRef(undefined);
      setPendingLink(null);
      setLinkMessage('');
      setLaunchRequest(validated);
      setView(request.kind);
    },
    [course, writeURL],
  );
  const consumeLaunch = useCallback((id: string) => {
    setLaunchRequest((request) => (request?.id === id ? undefined : request));
    const url = new URL(location.href);
    url.searchParams.delete('fresh');
    url.searchParams.delete('leaf');
    history.replaceState(null, '', url);
    currentURL.current = url.href;
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (!pendingLink) return;
    void (async () => {
      const { resolveCompatibilityLink } = await import('../compatibility/index.ts');
      const destination = new URL(location.href);
      const bareCode =
        !explicitCourse(destination) &&
        !destination.searchParams.has('activity') &&
        !destination.hash;
      let resolvedCourse = course;
      let ambiguousCode = false;
      let result;
      if (bareCode) {
        // Course entry filenames are defaults; the exact stable code supplies identity.
        const normalized = new URL(pendingLink);
        normalized.pathname = '/index.html';
        const otherCourse: Course = course === 'alevel' ? 'igcse' : 'alevel';
        const [selectedResult, otherResult] = await Promise.all([
          resolveCompatibilityLink(course, normalized.href),
          resolveCompatibilityLink(otherCourse, normalized.href),
        ]);
        result = selectedResult;
        if (selectedResult.kind === 'unrecognized' && otherResult.kind === 'curriculum') {
          result = otherResult;
          resolvedCourse = otherCourse;
        } else if (selectedResult.kind === 'curriculum' && otherResult.kind === 'curriculum') {
          ambiguousCode = true;
        }
      } else result = await resolveCompatibilityLink(course, pendingLink);
      if (cancelled) return;
      if (ambiguousCode)
        setLinkMessage(
          'This code matches both courses. The selected course has been retained; use an activity link to choose the other course.',
        );
      if (result.kind === 'curriculum') {
        setCourse(resolvedCourse);
        setReviewRef(result.ref);
        setRequestedActivity(result.ref.activityId);
        setView('teacher');
        const url = new URL(location.href);
        url.searchParams.set('view', 'teacher');
        url.searchParams.set('review', result.ref.questionId);
        url.searchParams.set('level', String(result.ref.level));
        url.searchParams.set('seed', String(result.ref.seed));
        url.searchParams.set('activity', result.ref.activityId);
        writeURL(url, true, resolvedCourse);
      } else if (result.kind === 'olympiad' && course === 'alevel') { setRequestedActivity(result.activityId); setView('olympiad'); }
      else {
        setLinkMessage(
          result.kind === 'unrecognized' ? result.reason : 'This link belongs to another course.',
        );
        setView('home');
      }
      setPendingLink(null);
    })().catch(() => {
      if (!cancelled) {
        setLinkMessage('This saved link could not be opened.');
        setPendingLink(null);
        setView('home');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [course, pendingLink, writeURL]);
  useEffect(() => {
    const pop = async () => {
      if (popBusy.current) return;
      popBusy.current = true;
      const destination = new URL(location.href),
        before = currentURL.current;
      try {
        if (navigationGuard.current && !(await navigationGuard.current())) {
          history.pushState(null, '', before);
          currentURL.current = before;
          return;
        }
        currentURL.current = destination.href;
        const next = routeCourse(destination, rememberedCourse(), entryCourse);
        setCourse(next);
        setView(routeView(destination, next));
        setRequestedActivity(activityFromURL(destination, next));
        setReviewRef(undefined);
        setTeacherGroup(teacherGroupFromURL(destination, next));
        setLaunchRequest(launchFromURL(destination, next));
        setPendingLink(linkInput(destination));
        setLinkMessage('');
      } finally {
        popBusy.current = false;
      }
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [entryCourse]);
  if (pendingLink) return <p role="status">Opening saved question...</p>;
  if (view === 'home')
    return (
      <Suspense fallback={<p role="status">Loading chemistry map...</p>}>
        <OriginalLanding
          course={course}
          registry={productionRegistry}
          history={historyRecords}
          onSelectCourse={selectCourse}
          onLaunch={launch}
          onOpenStatistics={() => selectView('statistics')}
          onOpenRecall={() => selectView('recall')}
          onOpenOlympiad={() => selectView('olympiad')}
          onOpenTeacher={selectTeacher}
          onOpenImport={() => selectView('import')}
          {...(linkMessage || historyLoading
            ? { message: linkMessage || 'Reading saved progress...' }
            : {})}
        />
      </Suspense>
    );
  if (view === 'recall')
    return (
      <Suspense fallback={<p role="status">Loading Recall...</p>}>
        <RecallView course={course} onHome={() => selectView('home')} />
      </Suspense>
    );
  if (view === 'olympiad' && course === 'alevel')
    return (
      <Suspense fallback={<p role="status">Loading Olympiad challenge...</p>}>
        <OlympiadHost
          {...(requestedActivity && productionRegistry.get(requestedActivity)?.strand === 'olympiad' ? {activityId:requestedActivity as OlympiadActivityId} : {})}
          onSelectChallenge={selectChallenge}
          onSelectCurriculum={selectActivity}
          onSelectView={selectView}
          onNavigationGuard={registerGuard}
        />
      </Suspense>
    );
  if (view === 'statistics')
    return (
      <Suspense fallback={<p role="status">Loading saved statistics...</p>}>
        <StatisticsView
          course={course}
          namespace={namespace}
          databaseName={databaseName}
          registry={productionRegistry}
          onBack={() => selectView('home')}
        />
      </Suspense>
    );
  if (view === 'import')
    return (
      <CourseShell
        course={course}
        registry={productionRegistry}
        currentView={view}
        onSelectView={selectView}
        onSelectActivity={selectActivity}
      >
        <Suspense fallback={<p role="status">Loading saved progress...</p>}>
          <LegacyImportView
            course={course}
            namespace={namespace}
            databaseName={databaseName}
            registry={productionRegistry}
          />
        </Suspense>
      </CourseShell>
    );
  return (
    <>
      {linkMessage && <p role="status">{linkMessage}</p>}
      <CurriculumHost
        key={course}
        course={course}
        view={view === 'olympiad' ? 'practice' : view}
        onSelectView={selectView}
        onSelectOlympiad={(id) => id ? selectChallenge(id) : selectView('olympiad')}
        onNavigationGuard={registerGuard}
        onLaunchConsumed={consumeLaunch}
        {...(requestedActivity ? { initialActivityId: requestedActivity } : {})}
        {...(reviewRef ? { reviewRef } : {})}
        {...(teacherGroup ? { initialTeacherGroup: teacherGroup } : {})}
        {...(launchRequest ? { launchRequest } : {})}
      />
    </>
  );
}
export { FoundationApp as ProductionFoundation };
