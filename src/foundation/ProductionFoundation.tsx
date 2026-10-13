import { gradedActivityId } from './graded-question.ts';
import { alphaDatabaseName } from '../persistence/alpha-namespace.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLoading } from '../loading/LoadingProvider.tsx';
import type { LoadingTicket } from '../loading/coordinator.ts';
import type { PreparedCurriculum } from './prepare-curriculum.ts';
import type {
  ActivityId,
  Course,
  CurriculumEvidence,
  PlatformView,
  QuestionRef,
  OlympiadActivityId,
} from '../contracts/index.ts';
import type { CurriculumLaunchRequest, LandingLaunchRequest } from '../contracts/landing.ts';
import { CourseShell } from '../shell/CourseShell.tsx';
import { productionRegistry } from './registry.ts';
import {
  afterGemRecall,
  initialGemMasteryStage,
  readGemMasteryFlow,
  writeGemMasteryFlow,
  gemRecallSessionId,
  gemGradeSessionId,
  type GemMasteryFlow,
} from './gem-mastery-flow.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import {
  COURSE_PREFERENCE_KEY,
  explicitCourse,
  routeCourse,
  routeView,
  validateLandingLaunch,
} from '../shell/navigation-view.ts';
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
  const raw =
    url.searchParams.get('activity') ||
    (url.searchParams.get('olympiad') === 'c3l6' ? 'alevel/c3l6-organic-reactions' : null);
  const slug = url.pathname.match(/activities\/([^/]+)/)?.[1];
  return productionRegistry.activities.find(
    (item) => item.course === course && (item.id === raw || item.id === `${course}/${slug}`),
  )?.id;
}
function launchFromURL(url: URL, course: Course): CurriculumLaunchRequest | undefined {
  const source = url;
  const flow = readGemMasteryFlow(url, course, productionRegistry);
  if (flow?.stage === 'grades') {
    return (
      validateLandingLaunch(
        {
          id: gemGradeSessionId(flow),
          kind: 'practice',
          course,
          gemId: flow.gemId,
          selection: 'mastery',
        },
        productionRegistry,
      ) ?? undefined
    );
  }
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
interface Destination {
  course: Course;
  view: PlatformView;
  url: URL;
  requestedActivity?: ActivityId | undefined;
  launchRequest?: CurriculumLaunchRequest | undefined;
  reviewRef?: QuestionRef;
  recallReview?: Readonly<{ factId: string; historical: boolean }>;
  recallGems?: readonly string[] | undefined;
  recallTeacher?: boolean;
  masteryFlow?: GemMasteryFlow | undefined;
  teacherGroup?: 'ionic' | 'covalent' | undefined;
  linkMessage?: string;
}
interface PreparedScreen {
  Landing?: typeof import('../landing/index.ts').OriginalLanding;
  Curriculum?: typeof import('./ActivityHost.tsx').FoundationApp;
  Recall?: typeof import('../recall/RecallView.tsx').RecallView;
  Statistics?: typeof import('../statistics/index.ts').StatisticsView;
  Olympiad?: typeof import('./OlympiadHost.tsx').OlympiadHost;
  Import?: typeof import('../compatibility/index.ts').LegacyImportView;
  history?: readonly CurriculumEvidence[];
  homeDetails?: import('../landing/index.ts').PreparedLandingDetails | undefined;
  curriculum?: PreparedCurriculum;
  statistics?: import('../statistics/index.ts').PreparedStatistics;
  olympiad?: import('./OlympiadHost.tsx').PreparedOlympiad;
  imported?: import('../compatibility/LegacyImportView.tsx').PreparedImport;
  recall?: import('../recall/prepare.ts').PreparedRecall;
}
type LeaveGuard = (() => Promise<boolean>) & {
  freeze?: () => void;
  resume?: (ticket?: LoadingTicket) => Promise<boolean>;
};
function destination(url: URL, entryCourse: Course): Destination {
  const course = routeCourse(url, rememberedCourse(), entryCourse);
  return {
    course,
    view: routeView(url, course),
    url,
    requestedActivity: activityFromURL(url, course),
    launchRequest: launchFromURL(url, course),
    masteryFlow: readGemMasteryFlow(url, course, productionRegistry),
    recallGems: url.searchParams.has('recallGem')
      ? url.searchParams.getAll('recallGem')
      : undefined,
    recallTeacher:
      url.searchParams.get('view') === 'recall' && url.searchParams.get('mode') === 'teacher',
    teacherGroup: teacherGroupFromURL(url, course),
  };
}
export function FoundationApp({ course: entryCourse }: { readonly course: Course }) {
  const initialURL = useMemo(() => new URL(location.href), []);
  const initial = useMemo(() => destination(initialURL, entryCourse), []);
  const [shown, setShown] = useState<{ route: Destination; prepared: PreparedScreen; key: number }>(
    { route: initial, prepared: {}, key: 0 },
  );
  const { route, prepared } = shown;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const {
    course,
    view,
    requestedActivity,
    launchRequest,
    reviewRef,
    recallReview,
    recallGems,
    recallTeacher,
    masteryFlow,
    teacherGroup,
    linkMessage,
  } = route;
  const namespace = useMemo(() => ({ course, profileId: 'local' }), [course]);
  const run =
    (import.meta.env.DEV ? initialURL.searchParams.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const databaseName = alphaDatabaseName(course, run);
  const loading = useLoading();
  const navigationGuard = useRef<LeaveGuard | null>(null);
  const committedURL = useRef(initialURL.href);
  const booted = useRef(false);
  const completedStage = useRef<string | null>(null);
  const registerGuard = useCallback((guard: (() => Promise<boolean>) | null) => {
    navigationGuard.current = guard;
  }, []);
  useEffect(() => loading.onFreeze(() => navigationGuard.current?.freeze?.()), [loading.onFreeze]);
  useEffect(
    () =>
      loading.onCancel(async (ticket) => {
        if (!ticket.isCurrent()) return false;
        if (!shownRef.current.key) {
          if (ticket.operation === 'reload') return true;
          const home: Destination = {
            course: shownRef.current.route.course,
            view: 'home',
            url: cleanURL('home', shownRef.current.route.course),
          };
          const ready = await prepareScreen(home, ticket);
          if (!ticket.isCurrent()) return false;
          history.replaceState(history.state, '', ready.route.url);
          committedURL.current = ready.route.url.href;
          flushSync(() => setShown({ ...ready, key: ticket.id }));
          return true;
        }
        const resumed = await (navigationGuard.current?.resume?.(ticket) ?? true);
        if (!ticket.isCurrent() || resumed === false) return false;
        if (ticket.operation !== 'reload' && location.href !== committedURL.current)
          history.replaceState(history.state, '', committedURL.current);
        return true;
      }),
    [loading.onCancel],
  );
  useEffect(
    () =>
      loading.onReload((ticket) => {
        if (!ticket.isCurrent()) return;
        if (location.href === committedURL.current) location.reload();
        else location.replace(committedURL.current);
      }),
    [loading.onReload],
  );
  async function resolveLink(next: Destination): Promise<Destination> {
    const input = linkInput(next.url);
    if (!input) return next;
    const { resolveCompatibilityLink } = await import('../compatibility/index.ts');
    let selectedCourse = next.course;
    let result = await resolveCompatibilityLink(selectedCourse, input);
    const bare =
      !explicitCourse(next.url) && !next.url.searchParams.has('activity') && !next.url.hash;
    if (bare) {
      const normalized = new URL(input);
      normalized.pathname = '/index.html';
      const other: Course = selectedCourse === 'alevel' ? 'igcse' : 'alevel';
      const [first, second] = await Promise.all([
        resolveCompatibilityLink(selectedCourse, normalized.href),
        resolveCompatibilityLink(other, normalized.href),
      ]);
      result = first;
      if (
        first.kind === 'unrecognized' &&
        (second.kind === 'curriculum' || second.kind === 'recall')
      ) {
        result = second;
        selectedCourse = other;
      } else if (first.kind === 'curriculum' && second.kind === 'curriculum')
        next = {
          ...next,
          linkMessage:
            'This code matches both courses. The selected course has been retained; use an activity link to choose the other course.',
        };
    }
    const url = new URL(next.url);
    url.searchParams.set('course', selectedCourse);
    if (result.kind === 'recall') {
      url.searchParams.set('view', 'recall');
      url.searchParams.set('mode', 'teacher');
      return {
        ...next,
        course: selectedCourse,
        view: 'recall',
        url,
        recallTeacher: true,
        recallGems: undefined,
        recallReview: { factId: result.ref.questionId, historical: result.historical },
      };
    }
    if (result.kind === 'curriculum') {
      url.searchParams.set('view', 'teacher');
      url.searchParams.set('review', result.ref.questionId);
      url.searchParams.set('level', String(result.ref.level));
      url.searchParams.set('seed', String(result.ref.seed));
      url.searchParams.set('activity', result.ref.activityId);
      return {
        ...next,
        course: selectedCourse,
        view: 'teacher',
        url,
        reviewRef: result.ref,
        requestedActivity: gradedActivityId(result.ref.activityId),
      };
    }
    if (result.kind === 'olympiad' && next.course === 'alevel')
      return { ...next, view: 'olympiad', requestedActivity: result.activityId };
    return {
      ...next,
      view: 'home',
      linkMessage:
        result.kind === 'unrecognized' ? result.reason : 'This link belongs to another course.',
    };
  }
  async function prepareScreen(
    next: Destination,
    ticket: LoadingTicket,
  ): Promise<{ route: Destination; prepared: PreparedScreen; dispose?: () => void }> {
    next = await resolveLink(next);
    const db = alphaDatabaseName(next.course, run),
      ns = { course: next.course, profileId: 'local' };
    if (next.view === 'home') {
      const { OriginalLanding, prepareLandingDetails } = await import('../landing/index.ts');
      const repository = createChemistryRepository(db);
      try {
        const [result, homeDetails] = await Promise.all([
          repository.curriculumHistory(ns),
          prepareLandingDetails(next.course, next.url.hash, productionRegistry),
        ]);
        if (!result.ok)
          throw Error('Saved progress could not be read. Return Home or reload to retry.');
        return {
          route: next,
          prepared: { Landing: OriginalLanding, history: result.value, homeDetails },
        };
      } finally {
        repository.close?.();
      }
    }
    if (next.masteryFlow?.stage === 'complete') return { route: next, prepared: {} };
    if (next.view === 'recall') {
      const { RecallView } = await import('../recall/RecallView.tsx');
      const { prepareRecall } = await import('../recall/prepare.ts');
      const recall = await prepareRecall({
        course: next.course,
        databaseName: db,
        ticket,
        mode: next.recallTeacher ? 'teacher' : 'student',
        ...(next.masteryFlow?.stage === 'recall'
          ? {
              gemIds: [next.masteryFlow.gemId],
              flowSessionId: gemRecallSessionId(next.masteryFlow),
              autoStart: true,
            }
          : next.recallGems
            ? { gemIds: next.recallGems }
            : {}),
        ...(next.recallReview ? { reviewFact: next.recallReview } : {}),
      });
      return {
        route: next,
        prepared: { Recall: RecallView, recall },
        dispose: () => recall.dispose(),
      };
    }
    if (next.view === 'statistics') {
      const { StatisticsView, prepareStatistics } = await import('../statistics/index.ts');
      const statistics = await prepareStatistics({
        course: next.course,
        namespace: ns,
        databaseName: db,
        registry: productionRegistry,
        ticket,
      });
      return { route: next, prepared: { Statistics: StatisticsView, statistics } };
    }
    if (next.view === 'olympiad') {
      const { OlympiadHost, prepareOlympiad } = await import('./OlympiadHost.tsx');
      const olympiad = await prepareOlympiad({
        databaseName: db,
        profileId: 'local',
        url: next.url,
        ticket,
        ...(next.requestedActivity &&
        productionRegistry.get(next.requestedActivity)?.strand === 'olympiad'
          ? { activityId: next.requestedActivity as OlympiadActivityId }
          : {}),
      });
      return { route: next, prepared: { Olympiad: OlympiadHost, olympiad } };
    }
    if (next.view === 'import') {
      const { LegacyImportView, prepareImport } = await import('../compatibility/index.ts');
      const imported = await prepareImport({
        course: next.course,
        namespace: ns,
        databaseName: db,
        registry: productionRegistry,
        ticket,
      });
      return { route: next, prepared: { Import: LegacyImportView, imported } };
    }
    const { FoundationApp: Curriculum, prepareCurriculum } = await import('./ActivityHost.tsx');
    const curriculum = await prepareCurriculum({
      course: next.course,
      databaseName: db,
      view: next.view as 'practice' | 'revision' | 'teacher',
      ticket,
      url: next.url.href,
      ...(next.launchRequest ? { launchRequest: next.launchRequest } : {}),
      ...(next.requestedActivity ? { initialActivityId: next.requestedActivity } : {}),
      ...(next.reviewRef ? { reviewRef: next.reviewRef } : {}),
      ...(next.teacherGroup ? { initialTeacherGroup: next.teacherGroup } : {}),
      ...(next.masteryFlow?.stage === 'grades'
        ? { masterySessionId: gemGradeSessionId(next.masteryFlow) }
        : {}),
    });
    return { route: next, prepared: { Curriculum, curriculum } };
  }
  function navigate(
    next: Destination | ((ticket: LoadingTicket) => Promise<Destination>),
    historyMode: 'push' | 'replace' | 'pop' = 'push',
    focusDestination = true,
  ) {
    return loading.run(
      'screen',
      async (ticket) => {
        if (navigationGuard.current && !(await navigationGuard.current())) {
          if (historyMode === 'pop') history.replaceState(history.state, '', committedURL.current);
          throw Error('Your work has not saved. Retry saving before leaving.');
        }
        const intended = typeof next === 'function' ? await next(ticket) : next;
        if (!ticket.isCurrent()) throw new DOMException('Navigation superseded', 'AbortError');
        return prepareScreen(intended, ticket);
      },
      (value, ticket) => {
        if (!ticket.isCurrent()) return;
        const url = value.route.url;
        url.searchParams.set('course', value.route.course);
        if (historyMode === 'push') history.pushState(null, '', url);
        else if (historyMode === 'replace') history.replaceState(history.state, '', url);
        committedURL.current = url.href;
        try {
          localStorage.setItem(COURSE_PREFERENCE_KEY, value.route.course);
        } catch {
          /* Optional preference. */
        }
        flushSync(() => setShown({ ...value, key: ticket.id }));
        requestAnimationFrame(() => {
          if (!ticket.isCurrent()) return;
          const heading =
            document.querySelector<HTMLElement>('#loading-surface dialog[open] button') ??
            document.querySelector<HTMLElement>(
              '#loading-surface h1,#loading-surface h2,#loading-surface .question-player',
            );
          if (heading && focusDestination) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
          }
          if (historyMode !== 'pop') window.scrollTo(0, 0);
        });
      },
    );
  }
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    void navigate(initial, 'replace', false);
  }, []);
  useEffect(() => {
    const pop = () => {
      void navigate(destination(new URL(location.href), entryCourse), 'pop');
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [entryCourse]);
  function cleanURL(next: PlatformView, nextCourse = course) {
    const url = new URL(committedURL.current);
    url.search = '';
    url.hash = '';
    if (import.meta.env.DEV && run !== 'local') url.searchParams.set('run', run);
    url.searchParams.set('course', nextCourse);
    url.searchParams.set('view', next);
    return url;
  }
  function selectView(next: PlatformView) {
    if (next === 'olympiad' && course !== 'alevel') return;
    void navigate({ course, view: next, url: cleanURL(next) });
  }
  function selectCourse(next: Course) {
    if (next !== course) void navigate({ course: next, view: 'home', url: cleanURL('home', next) });
  }
  function openRecall(gemId?: string, teacher = false) {
    const url = cleanURL('recall');
    if (gemId) url.searchParams.set('recallGem', gemId);
    if (teacher) url.searchParams.set('mode', 'teacher');
    void navigate({
      course,
      view: 'recall',
      url,
      recallGems: gemId ? [gemId] : undefined,
      recallTeacher: teacher,
    });
  }
  function selectChallenge(id: OlympiadActivityId | undefined) {
    const url = cleanURL('olympiad');
    if (id) url.searchParams.set('activity', id);
    void navigate({ course, view: 'olympiad', url, requestedActivity: id });
  }
  function selectActivity(id: ActivityId) {
    if (productionRegistry.get(id)?.strand === 'olympiad')
      selectChallenge(id as OlympiadActivityId);
    else {
      const url = cleanURL('practice');
      url.searchParams.set('activity', id);
      void navigate({ course, view: 'practice', url, requestedActivity: id });
    }
  }
  function selectTeacher(gemId?: string) {
    const registration = gemId
      ? productionRegistry
          .curriculumFor(course)
          .find((item) => item.gems.some((gem) => gem.id === gemId))
      : undefined;
    const id = registration?.id,
      category =
        course === 'igcse' && id === 'igcse/dot-and-cross'
          ? gemId === 'fourth-3-1'
            ? 'ionic'
            : gemId === 'fourth-3-2'
              ? 'covalent'
              : undefined
          : undefined;
    const url = cleanURL('teacher');
    if (id) url.searchParams.set('activity', id);
    if (category) url.searchParams.set('category', category);
    void navigate({ course, view: 'teacher', url, requestedActivity: id, teacherGroup: category });
  }
  async function launch(request: LandingLaunchRequest) {
    if (request.course !== course) return;
    if (request.kind === 'gem-mastery') {
      await navigate(async () => {
        const { gemMasteryAvailability } = await import('./gem-mastery-availability.ts');
        const available = gemMasteryAvailability(course, request.gemId, productionRegistry),
          stage = initialGemMasteryStage(available.facts, !!available.target);
        if (!stage)
          throw Error('No factual recall or graded activity is available for this gem yet.');
        const flow: GemMasteryFlow = { token: request.id, course, gemId: request.gemId, stage };
        const url = cleanURL(stage === 'recall' ? 'recall' : 'practice');
        writeGemMasteryFlow(url, flow);
        if (stage === 'recall') url.searchParams.set('recallGem', flow.gemId);
        return { ...destination(url, entryCourse), masteryFlow: flow };
      });
      return;
    }
    const valid = validateLandingLaunch(request, productionRegistry);
    if (!valid) return;
    const url = cleanURL(request.kind);
    url.searchParams.set('fresh', '1');
    if (valid.kind === 'practice') {
      url.searchParams.set('activity', valid.target.activityId);
      url.searchParams.set('gem', valid.target.gemId);
      url.searchParams.set('practice', valid.selection);
      url.searchParams.set('level', String(valid.target.level));
    }
    await navigate({
      course,
      view: valid.kind,
      url,
      launchRequest: valid,
      ...(valid.kind === 'practice' ? { requestedActivity: valid.target.activityId } : {}),
    });
  }
  function completeMasteryStage() {
    const current = masteryFlow;
    if (!current || current.stage === 'complete') return;
    const key = current.token + ':' + current.stage;
    if (completedStage.current === key) return;
    completedStage.current = key;
    const graded = productionRegistry
      .curriculumFor(course)
      .some((item) =>
        item.gems.some((gem) => gem.id === current.gemId && gem.supportedLevels.length),
      );
    const next = {
      ...current,
      stage: current.stage === 'recall' ? afterGemRecall(graded) : ('complete' as const),
    };
    const url = cleanURL('practice');
    writeGemMasteryFlow(url, next);
    void navigate({ ...destination(url, entryCourse), masteryFlow: next }, 'replace');
  }
  const consumeLaunch = useCallback((id: string) => {
    const url = new URL(committedURL.current);
    url.searchParams.delete('fresh');
    url.searchParams.delete('leaf');
    history.replaceState(history.state, '', url);
    committedURL.current = url.href;
    setShown((current) =>
      current.route.launchRequest?.id === id
        ? { ...current, route: { ...current.route, url, launchRequest: undefined } }
        : current,
    );
  }, []);
  if (!shown.key)
    return (
      <div className="loading-initial">
        <img src={`${import.meta.env.BASE_URL}assets/SJS-Eagle.svg`} alt="St John's School" />
      </div>
    );
  const { Landing, Curriculum, Recall, Statistics, Olympiad, Import } = prepared;
  if (view === 'home' && Landing)
    return (
      <Landing
        key={shown.key}
        course={course}
        registry={productionRegistry}
        history={prepared.history ?? []}
        {...(prepared.homeDetails ? { preparedDetails: prepared.homeDetails } : {})}
        onSelectCourse={selectCourse}
        onLaunch={launch}
        onOpenStatistics={() => selectView('statistics')}
        onOpenRecall={openRecall}
        onOpenOlympiad={() => selectView('olympiad')}
        onOpenTeacher={selectTeacher}
        onOpenImport={() => selectView('import')}
        {...(linkMessage ? { message: linkMessage } : {})}
      />
    );
  if (view === 'recall' && Recall)
    return (
      <Recall
        key={shown.key}
        {...(prepared.recall ? { prepared: prepared.recall } : {})}
        course={course}
        onHome={() => selectView('home')}
        databaseName={databaseName}
        {...(masteryFlow?.stage === 'recall'
          ? {
              gemIds: [masteryFlow.gemId],
              flowSessionId: gemRecallSessionId(masteryFlow),
              autoStart: true,
              onComplete: completeMasteryStage,
            }
          : recallGems
            ? { gemIds: recallGems }
            : {})}
        mode={recallTeacher ? 'teacher' : 'student'}
        {...(recallReview ? { reviewFact: recallReview } : {})}
        onRegisterLeaveGuard={registerGuard}
      />
    );
  if (masteryFlow?.stage === 'complete')
    return (
      <CourseShell
        course={course}
        registry={productionRegistry}
        currentView="practice"
        onSelectView={selectView}
        onSelectActivity={selectActivity}
      >
        <section className="practice-setup" aria-label="Mastery run complete">
          <h1>Mastery run complete</h1>
          <p>
            The available stages are complete for this run. Incorrect or revealed recall facts
            remain due in Recall; graded awards use your independent assessments.
          </p>
          <button type="button" onClick={() => selectView('home')}>
            Choose another gem
          </button>
        </section>
      </CourseShell>
    );
  if (view === 'olympiad' && Olympiad && prepared.olympiad)
    return (
      <Olympiad
        key={shown.key}
        prepared={prepared.olympiad}
        {...(requestedActivity && productionRegistry.get(requestedActivity)?.strand === 'olympiad'
          ? { activityId: requestedActivity as OlympiadActivityId }
          : {})}
        onSelectChallenge={selectChallenge}
        onSelectCurriculum={selectActivity}
        onSelectView={selectView}
        onNavigationGuard={registerGuard}
      />
    );
  if (view === 'statistics' && Statistics && prepared.statistics)
    return (
      <Statistics
        key={shown.key}
        course={course}
        namespace={namespace}
        databaseName={databaseName}
        registry={productionRegistry}
        prepared={prepared.statistics}
        onBack={() => selectView('home')}
      />
    );
  if (view === 'import' && Import && prepared.imported)
    return (
      <CourseShell
        course={course}
        registry={productionRegistry}
        currentView={view}
        onSelectView={selectView}
        onSelectActivity={selectActivity}
      >
        <Import
          prepared={prepared.imported}
          onNavigationGuard={registerGuard}
          course={course}
          namespace={namespace}
          databaseName={databaseName}
          registry={productionRegistry}
        />
      </CourseShell>
    );
  if (!Curriculum) return null;
  return (
    <>
      {linkMessage && <p role="status">{linkMessage}</p>}
      <Curriculum
        key={shown.key}
        course={course}
        view={view === 'revision' ? 'revision' : view === 'teacher' ? 'teacher' : 'practice'}
        onSelectView={selectView}
        onSelectOlympiad={(id) => (id ? selectChallenge(id) : selectView('olympiad'))}
        onNavigationGuard={registerGuard}
        onLaunchConsumed={consumeLaunch}
        {...(prepared.curriculum ? { prepared: prepared.curriculum } : {})}
        {...(requestedActivity ? { initialActivityId: requestedActivity } : {})}
        {...(reviewRef ? { reviewRef } : {})}
        {...(teacherGroup ? { initialTeacherGroup: teacherGroup } : {})}
        {...(launchRequest ? { launchRequest } : {})}
        {...(masteryFlow?.stage === 'grades'
          ? {
              masterySessionId: gemGradeSessionId(masteryFlow),
              onMasteryComplete: completeMasteryStage,
            }
          : {})}
      />
    </>
  );
}
export { FoundationApp as ProductionFoundation };
