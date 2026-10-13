import { gradedActivityId } from './graded-question.ts';
import { restoreCheckedFeedback } from '../ui/current-feedback.ts';
import { activityDatabaseName } from '../persistence/alpha-namespace.ts';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type {
  Course,
  StudentAttempt,
  CurriculumSession,
  CurriculumTarget,
  CurriculumEvidence,
  Question,
  AttemptController,
  AttemptCommand,
  MasterySummary,
  Responses,
  CorrectionFeedback,
  ActivityId,
  QuestionProvider,
  MarkingPolicy,
  LearningReviewPolicy,
  CurriculumHostIntegration,
  StorageFailure,
  RepositoryResult,
} from '../contracts/index.ts';
import { productionRegistry } from './registry.ts';
import { createAttemptController, assessmentToEvidence } from '../domain/attempt/index.ts';
import { createActiveClock, bindBrowserAttemptTiming } from '../domain/timing/index.ts';
import {
  revisionScheduler,
  bindRevisionQuestion,
  pauseRevisionSession,
  resumeRevisionSession,
  selectPracticeQuestion,
  topicTargets,
} from '../domain/session/index.ts';
import { createCourseMastery } from '../domain/mastery/index.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import { CourseShell } from '../shell/CourseShell.tsx';
import { QuestionPlayer } from '../ui/QuestionPlayer.tsx';
import type { SaveStatus, PlayerFeedback } from '../ui/QuestionPlayer.tsx';
import { TeacherPicker } from '../ui/TeacherPicker.tsx';
import type { PlatformView, QuestionRef } from '../contracts/index.ts';
import type { CurriculumLaunchRequest } from '../contracts/landing.ts';
import { canContinueStoredSession } from './session-continuation.ts';
import { targetSubtopic } from './question-heading.ts';
import { LoadingProvider, useLoading, useLoadingContext } from '../loading/LoadingProvider.tsx';
import { prepareQuestionTools, type PreparedQuestionTools } from './question-tools.ts';
import type { PreparedCurriculum } from './prepare-curriculum.ts';
import {
  persistCurriculumResume,
  prepareCurriculum,
  prepareTeacher,
  type PreparedTeacher,
} from './prepare-curriculum.ts';
import type { LoadingTicket } from '../loading/coordinator.ts';
export { prepareCurriculum } from './prepare-curriculum.ts';
export type { PreparedCurriculum, PrepareCurriculumInput } from './prepare-curriculum.ts';
const RateResponseControl = lazy(async () => ({
  default: (await import('../activities/alevel/rate-equations/RateResponseControl.tsx'))
    .RateResponseControl,
}));
const RateGraphWorkspace = lazy(async () => ({
  default: (await import('../activities/alevel/rate-equations/RateGraphWorkspace.tsx'))
    .RateGraphWorkspace,
}));
interface Runtime {
  provider: QuestionProvider;
  policy: MarkingPolicy;
  learningReviewPolicy?: LearningReviewPolicy;
}
interface FailedWrite {
  readonly write: () => Promise<RepositoryResult<unknown>>;
  readonly onSaved?: () => void | Promise<void>;
  readonly error: StorageFailure;
  readonly kind: 'curriculum' | 'session';
  readonly owner: string;
}
interface ActivitySnapshot {
  readonly attempt: StudentAttempt | null;
  readonly session: CurriculumSession | null;
  readonly question: Question | null;
  readonly history: readonly CurriculumEvidence[];
  readonly saveStatus: SaveStatus;
  readonly databaseName: string;
  readonly selectedCount: number;
  readonly correctionFeedback: CorrectionFeedback | undefined;
}
export interface ActivityHarness {
  readonly snapshot: () => ActivitySnapshot;
  readonly flush: () => Promise<void>;
  readonly history: () => Promise<readonly CurriculumEvidence[]>;
  readonly respond: (partId: string, response: Responses[string]) => Promise<void>;
  readonly checkpoint: () => Promise<void>;
}
declare global {
  interface Window {
    __mastersActivity?: ActivityHarness;
  }
}

export type CurriculumHostProps = CurriculumHostIntegration & {
  readonly course: Course;
  readonly masterySessionId?: string;
  readonly onMasteryComplete?: () => void;
  readonly prepared?: PreparedCurriculum;
  readonly onSelectOlympiad?: (id?: import('../contracts/index.ts').OlympiadActivityId) => void;
};

/** Real activity host: one controller, clock, repository and scheduler for both modes. */
function CurriculumHost({
  course,
  onSelectOlympiad,
  initialActivityId,
  registry: registryOverride,
  view,
  onSelectView,
  reviewRef,
  initialTeacherGroup,
  launchRequest: incomingLaunchRequest,
  onLaunchConsumed,
  onNavigationGuard,
  masterySessionId,
  onMasteryComplete,
  prepared,
}: CurriculumHostProps) {
  const loadingCoordinator = useLoading();
  // Preparation already selected and durably saved this launch before visibility.
  const launchRequest =
    prepared?.launchId === incomingLaunchRequest?.id ? undefined : incomingLaunchRequest;
  const query = useMemo(() => new URLSearchParams(location.search), []);
  const run =
    (import.meta.env.DEV ? query.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const databaseName = activityDatabaseName(
    course,
    run,
    import.meta.env.DEV,
    !!registryOverride,
    location.pathname,
  );
  const namespace = useMemo(() => ({ course, profileId: 'local' }), [course]);
  const repository = useMemo(() => createChemistryRepository(databaseName), [databaseName]);
  const reviewCode = query.get('review');
  const [preview, setPreview] = useState(
    view ? view === 'teacher' : query.get('mode') === 'teacher' || !!reviewCode,
  );
  const [sessionMode, setSessionMode] = useState<'practice' | 'revision'>(
    view
      ? view === 'revision'
        ? 'revision'
        : 'practice'
      : query.get('session') === 'revision'
        ? 'revision'
        : 'practice',
  );
  const [attempt, setAttempt] = useState<StudentAttempt | null>(prepared?.attempt ?? null);
  const [, setSession] = useState<CurriculumSession | null>(prepared?.session ?? null);
  const [question, setQuestion] = useState<Question | null>(prepared?.question ?? null);
  const [questionTools, setQuestionTools] = useState<PreparedQuestionTools | null>(
    prepared?.tools ?? null,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    prepared ? { kind: 'saved' } : { kind: 'idle' },
  );
  const [history, setHistory] = useState<readonly CurriculumEvidence[]>(prepared?.history ?? []);
  const [feedback, setFeedback] = useState<PlayerFeedback | undefined>();
  const [correctionFeedback, setCorrectionFeedback] = useState<CorrectionFeedback | undefined>();
  const loading = false;
  const readError: StorageFailure | null = null;
  const [paused, setPaused] = useState(
    prepared?.session?.kind === 'revision'
      ? prepared.session.status === 'paused'
      : prepared?.session?.paused === true,
  );
  const [nextLoading, setNextLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(prepared?.setupOpen ?? false);
  const [localView, setLocalView] = useState<PlatformView>(
    view ??
      (query.get('mode') === 'teacher' || reviewCode
        ? 'teacher'
        : query.get('session') === 'revision'
          ? 'revision'
          : 'practice'),
  );
  const [navigationBusy, setNavigationBusy] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    if (view) {
      setLocalView(view);
      setPreview(view === 'teacher');
      if (view !== 'teacher') setSessionMode(view === 'revision' ? 'revision' : 'practice');
    }
  }, [view]);
  const stateRef = useRef<StudentAttempt | null>(prepared?.attempt ?? null),
    sessionRef = useRef<CurriculumSession | null>(prepared?.session ?? null),
    controllerRef = useRef<AttemptController | null>(null);
  const timingDispose = useRef<(() => void) | null>(null);
  const frozen = useRef(false);
  const flushingDraft = useRef(false);
  const [activationVersion, setActivationVersion] = useState(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pendingSessionSave = useRef<CurriculumSession | null>(null);
  const failedSave = useRef<FailedWrite | null>(null);
  const failedSessionSave = useRef<FailedWrite | null>(null);
  const nextPending = useRef(false);
  const consumedLaunches = useRef(new Set<string>());
  const launchPending = useRef(false);
  const [launchFailed, setLaunchFailed] = useState(false);
  const awaitingLaunchSave = useRef<string | null>(null);
  const launchRequestRef = useRef(launchRequest);
  launchRequestRef.current = launchRequest;
  const currentView = view ?? localView;
  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;
  const departing = useRef(false);
  useEffect(() => {
    // A committed route/explicit launch supplies the next continuation intent.
    departing.current = false;
  }, [currentView, launchRequest?.id, initialActivityId]);
  const automaticContinuation = useRef<string | null>(null);
  const pendingCommands = useRef(new Set<Promise<void>>());
  const mounted = useRef(true),
    saveFailed = useRef(false);
  const registry = registryOverride ?? productionRegistry;
  const runtimes = useRef(new Map<ActivityId, Promise<Runtime>>());
  const activeRuntime = useRef<Runtime | null>(prepared?.runtime ?? null),
    questionRef = useRef<Question | null>(prepared?.question ?? null);
  const runtime = useCallback(
    (id: ActivityId) => {
      const saved = runtimes.current.get(id);
      if (saved) return saved;
      const registration = registry.get(id);
      if (!registration || registration.strand !== 'curriculum')
        throw Error('This activity is not available.');
      const loaded = Promise.all([
        registration.provider(),
        registration.marking(),
        registration.learningReview?.(),
      ])
        .then(
          ([provider, policy, learningReviewPolicy]): Runtime => ({
            provider,
            policy,
            ...(learningReviewPolicy ? { learningReviewPolicy } : {}),
          }),
        )
        .catch((error: unknown) => {
          // A failed load remains explicitly retryable; do not cache a rejected runtime forever.
          runtimes.current.delete(id);
          throw error;
        });
      runtimes.current.set(id, loaded);
      return loaded;
    },
    [registry],
  );
  const registrations = useMemo(() => registry.curriculumFor(course), [registry, course]);
  const allTargets = useMemo(
    () =>
      registrations.flatMap((registration) =>
        registration.gems.flatMap((gem) =>
          gem.supportedLevels.map(
            (level): CurriculumTarget =>
              registration.course === 'alevel'
                ? { course: 'alevel', activityId: registration.id, gemId: gem.id, level }
                : { course: 'igcse', activityId: registration.id, gemId: gem.id, level },
          ),
        ),
      ),
    [registrations],
  );
  const [targetKey, setTargetKey] = useState('');
  useEffect(() => {
    const item = allTargets.find((value) => value.activityId === initialActivityId);
    if (item) setTargetKey(`${item.gemId}:${item.level}`);
  }, [initialActivityId, allTargets]);
  const target =
    allTargets.find((item) => `${item.gemId}:${item.level}` === targetKey) || allTargets[0];
  const [selected, setSelected] = useState<readonly CurriculumTarget[]>([]);
  const summaries = useCallback(
    (records: readonly CurriculumEvidence[]): MasterySummary[] =>
      registrations.flatMap((registration) =>
        registration.gems.flatMap((gem) =>
          gem.supportedLevels.map((level) =>
            createCourseMastery(course).summarize(records, gem.mastery, level),
          ),
        ),
      ),
    [registrations, course],
  );
  const applySession = useCallback((value: CurriculumSession | null) => {
    sessionRef.current = value;
    setSession(value);
  }, []);
  const applyAttempt = useCallback((value: StudentAttempt) => {
    if (stateRef.current?.attemptId !== value.attemptId) setCorrectionFeedback(undefined);
    stateRef.current = value;
    setAttempt(value);
  }, []);
  const loadHistory = useCallback(async () => {
    const result = await repository.curriculumHistory(namespace);
    if (result.ok) {
      setHistory(result.value);
      return result.value;
    }
    saveFailed.current = true;
    setSaveStatus({ kind: 'error', error: result.error });
    return [];
  }, [repository, namespace]);
  const queueSave = useCallback(
    (
      write: () => Promise<RepositoryResult<unknown>>,
      onSaved?: () => void | Promise<void>,
      kind: FailedWrite['kind'] = 'curriculum',
      owner = 'current-session',
    ) => {
      setSaveStatus({ kind: 'saving' });
      queue.current = queue.current.then(async () => {
        const result = await write();
        const failure = kind === 'session' ? failedSessionSave : failedSave;
        if (result.ok) {
          if (
            !failure.current ||
            failure.current.write === write ||
            (kind === 'curriculum' && failure.current.owner === owner)
          )
            failure.current = null;
        } else {
          failure.current = {
            write,
            ...(onSaved ? { onSaved } : {}),
            error: result.error,
            kind,
            owner,
          };
        }
        // A saved correction does not resolve an uncommitted session transition.
        const unresolved = failedSessionSave.current ?? failedSave.current;
        saveFailed.current = unresolved !== null;
        if (!mounted.current) return;
        setSaveStatus(unresolved ? { kind: 'error', error: unresolved.error } : { kind: 'saved' });
        if (result.ok) await onSaved?.();
      });
      return queue.current;
    },
    [],
  );
  const commitSession = useCallback(
    (next: CurriculumSession) => {
      if (pendingSessionSave.current === next) pendingSessionSave.current = null;
      applySession(next);
      setPaused(next.kind === 'revision' ? next.status === 'paused' : next.paused === true);
    },
    [applySession],
  );
  const save = useCallback(
    (value: StudentAttempt) => {
      const evidence = assessmentToEvidence(value);
      return queueSave(
        () => {
          // Resolve association when this queued write runs. A completed or
          // pending terminal session must never be revived by an old correction.
          const currentSession = sessionRef.current;
          const referencesAttempt =
            currentSession?.kind === 'revision'
              ? currentSession.current?.attemptId === value.attemptId
              : currentSession?.currentAttemptId === value.attemptId;
          const sessionToSave =
            !pendingSessionSave.current && referencesAttempt ? currentSession : null;
          return repository.saveCurriculum({
            attempt: value,
            ...(evidence ? { evidence } : {}),
            ...(sessionToSave ? { session: sessionToSave } : {}),
          });
        },
        async () => {
          if (evidence) await loadHistory();
        },
        'curriculum',
        value.attemptId,
      );
    },
    [repository, loadHistory, queueSave],
  );
  const saveSession = useCallback(
    (next: CurriculumSession) => {
      pendingSessionSave.current = next;
      return queueSave(
        () => repository.saveSession(next),
        () => commitSession(next),
        'session',
      );
    },
    [repository, commitSession, queueSave],
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!prepared?.launchId) return;
    consumedLaunches.current.add(prepared.launchId);
    onLaunchConsumed?.(prepared.launchId);
  }, [prepared?.launchId, onLaunchConsumed]);
  // An existing persisted attempt enters this effect. Identity is created only by explicit Start/Next handlers.
  useEffect(() => {
    if (
      !attempt ||
      !questionTools ||
      frozen.current ||
      loadingCoordinator.pending ||
      preview ||
      paused ||
      loading ||
      readError ||
      setupOpen ||
      transitioning ||
      launchRequest ||
      currentView !== sessionRef.current?.kind
    ) {
      controllerRef.current = null;
      return;
    }
    const value = stateRef.current;
    if (!value) return;
    const clock = createActiveClock({
      attemptId: value.attemptId,
      idleLimitMs:
        value.phase === 'answering'
          ? value.timing.idleLimitMs
          : value.firstResponse.timing.idleLimitMs,
      ...(value.phase === 'answering'
        ? { saved: value.timing }
        : {
            completed: true,
            saved: { attemptId: value.attemptId, ...value.firstResponse.timing, finished: true },
          }),
    });
    const loaded = activeRuntime.current,
      content = questionRef.current;
    if (!loaded || !content) return;
    const controller = createAttemptController({
      question: content,
      state: value,
      policy: loaded.policy,
      ...(loaded.learningReviewPolicy ? { learningReviewPolicy: loaded.learningReviewPolicy } : {}),
      clock,
    });
    controllerRef.current = controller;
    const boundAttemptId = value.attemptId;
    const unbind = bindBrowserAttemptTiming({
      controller,
      onCheckpoint: (snapshot) => {
        // Disposal of the previous player must not overwrite a newly selected session.
        if (stateRef.current?.attemptId !== boundAttemptId) return;
        applyAttempt(snapshot);
        void save(snapshot);
      },
    });
    timingDispose.current = unbind;
    return () => {
      if (timingDispose.current === unbind) {
        timingDispose.current = null;
        unbind();
      }
      controllerRef.current = null;
    };
    // Persisted identity changes, pause and preview control binding; response rerenders must not recreate controllers.
  }, [
    attempt?.attemptId,
    questionTools,
    loadingCoordinator.pending,
    activationVersion,
    preview,
    paused,
    loading,
    readError,
    setupOpen,
    transitioning,
    launchRequest,
    currentView,
    applyAttempt,
    save,
  ]);
  const fresh = useCallback(
    (
      ref: StudentAttempt['ref'],
      selectedTarget: CurriculumTarget,
      attemptId: string,
      content?: Question,
    ): StudentAttempt => ({
      mode: 'student',
      namespace,
      attemptId,
      ref,
      target: selectedTarget,
      currentResponses: {},
      assistance: [],
      phase: 'answering',
      timing: {
        attemptId,
        activeMs: 0,
        idleLimitMs: (() => {
          const registration = registry.get(ref.activityId);
          if (!registration || registration.strand !== 'curriculum')
            throw Error('Unsupported timing activity');
          return registration.idleAllowance(content ?? questionRef.current!);
        })(),
        finished: false,
      },
    }),
    [namespace],
  );
  const commitPrepared = (value: PreparedCurriculum) => {
    flushSync(() => {
      activeRuntime.current = value.runtime;
      questionRef.current = value.question;
      stateRef.current = value.attempt;
      setAttempt(value.attempt);
      setQuestion(value.question);
      setQuestionTools(value.tools);
      applySession(value.session);
      setHistory(value.history);
      setPaused(
        value.session?.kind === 'revision'
          ? value.session.status === 'paused'
          : value.session?.paused === true,
      );
      setSetupOpen(value.setupOpen);
      setPreview(value.view === 'teacher');
      setLocalView(value.view);
      if (value.view !== 'teacher')
        setSessionMode(value.view === 'revision' ? 'revision' : 'practice');
      if (value.teacher) {
        setTeacherPayload(value.teacher);
        setTeacherActivity(value.teacher.activityId);
        setPreviewQuestion(value.teacher.question);
        setPreviewSubtopic(value.teacher.subtopic);
      }
      setSaveStatus({ kind: 'saved' });
      setFeedback(undefined);
      setCorrectionFeedback(undefined);
      frozen.current = false;
      departing.current = false;
      setActivationVersion((value) => value + 1);
    });
  };
  const start = async (request?: CurriculumLaunchRequest) => {
    const chosenMode = request?.kind ?? sessionMode;
    if (preview || loading || readError || (!target && !request)) return false;
    const chosen =
      request ??
      (chosenMode === 'revision'
        ? {
            id: crypto.randomUUID(),
            kind: 'revision' as const,
            course,
            targets: selected,
            gemIds: [...new Set(selected.map((item) => item.gemId))],
          }
        : {
            id: crypto.randomUUID(),
            kind: 'practice' as const,
            target: target!,
            selection: 'fixed-level' as const,
            fresh: true as const,
          });
    if (chosen.kind === 'revision' && !chosen.targets.length) {
      setFeedback({ message: 'Choose a topic with ADD ALL before launching revision.' });
      return false;
    }
    return loadingCoordinator.run(
      'question',
      async (ticket) => {
        if (!(await leaveRef.current()))
          throw Error('Your work has not saved. Retry saving before continuing.');
        return prepareCurriculum({
          course,
          databaseName,
          view: chosenMode,
          registry,
          repository,
          ticket,
          launchRequest: chosen,
          ...(masterySessionId ? { masterySessionId } : {}),
          ...(initialActivityId ? { initialActivityId } : {}),
        });
      },
      (value) => {
        commitPrepared(value);
        if (chosen.kind === 'revision') setSelected(chosen.targets);
        if (request) {
          consumedLaunches.current.add(request.id);
          onLaunchConsumed?.(request.id);
        }
      },
    );
  };
  const executeCommand = useCallback(
    async (value: AttemptCommand) => {
      const controller = controllerRef.current;
      if (
        !controller ||
        preview ||
        paused ||
        (frozen.current && !flushingDraft.current) ||
        loadingCoordinator.pending
      )
        return;
      const previousPhase = controller.state().phase;
      const result = controller.dispatch(value);
      if (!result.accepted) {
        setFeedback({ message: result.message });
        return;
      }
      // Persist checked presentation only; first evidence and scheduler stay fixed.
      if (value.kind === 'check-correction') {
        setFeedback(undefined);
        setCorrectionFeedback(result.correctionFeedback);
        const checked = controller.checkpoint();
        applyAttempt(checked);
        await save(checked);
        return;
      }
      if (value.kind === 'respond' || value.kind === 'clear') setCorrectionFeedback(undefined);
      setFeedback(undefined);
      setSaveStatus({ kind: 'saving' });
      const next = controller.checkpoint();
      applyAttempt(next);
      let nextSession = sessionRef.current;
      if (value.kind === 'pause') {
        setPaused(true);
        if (nextSession?.kind === 'revision') nextSession = pauseRevisionSession(nextSession);
        else if (nextSession?.kind === 'practice') nextSession = { ...nextSession, paused: true };
      }
      if (
        previousPhase !== 'assessed' &&
        next.phase === 'assessed' &&
        nextSession?.kind === 'revision'
      ) {
        const evidence = assessmentToEvidence(next),
          records = await loadHistory();
        const combined =
          evidence && !records.some((r) => r.id === evidence.id) ? [...records, evidence] : records;
        nextSession = revisionScheduler.accept(
          nextSession,
          {
            attemptId: next.attemptId,
            score: next.firstAssessment.kind === 'revealed' ? 0 : next.firstAssessment.score,
            independent: !!evidence,
            completedAt: next.firstAssessment.assessedAt,
          },
          summaries(combined),
          Date.now(),
        );
      }
      if (nextSession) applySession(nextSession);
      await save(next);
    },
    [
      preview,
      paused,
      loadingCoordinator.pending,
      applyAttempt,
      applySession,
      save,
      loadHistory,
      summaries,
    ],
  );
  const command = useCallback(
    (value: AttemptCommand) => {
      const pending = executeCommand(value);
      pendingCommands.current.add(pending);
      void pending.finally(() => pendingCommands.current.delete(pending));
      return pending;
    },
    [executeCommand],
  );
  const nextQuestion = async () => {
    if (nextPending.current || paused || preview || frozen.current) return;
    nextPending.current = true;
    setNextLoading(true);
    const id = crypto.randomUUID(),
      seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    try {
      await loadingCoordinator.run(
        'question',
        async (ticket) => {
          // Keep the outgoing attempt and DOM together while blur drafts and saves drain.
          await Promise.all([...pendingCommands.current]);
          await queue.current;
          if (saveFailed.current) await retry();
          if (saveFailed.current)
            throw Error('Your work has not saved. Retry saving before continuing.');
          const value = stateRef.current,
            current = sessionRef.current;
          if (!value || value.phase !== 'assessed' || !current)
            throw Error('Assess the current question before continuing.');
          const result = await repository.curriculumHistory(namespace);
          if (!result.ok) throw Error(result.error.message);
          const states = summaries(result.value);
          let nextSession: CurriculumSession,
            selectedTarget: CurriculumTarget,
            ref: StudentAttempt['ref'];
          let loaded: Runtime;
          if (current.kind === 'revision') {
            const next = revisionScheduler.next(current, states, Date.now(), id);
            if (!next.current) {
              const saved = await ticket.persist(() => repository.saveSession(next));
              if (!saved.ok) throw Error(saved.error.message);
              return { session: next, attempt: null, question: null, runtime: null, tools: null };
            }
            selectedTarget = next.current.target;
            loaded = await runtime(selectedTarget.activityId);
            ref = {
              ...loaded.provider.select({
                ...selectedTarget,
                seed,
                previousQuestionIds: next.previous
                  .filter((item) => item.target.activityId === selectedTarget.activityId)
                  .map((item) => item.ref.questionId),
              }),
              activityId: selectedTarget.activityId,
            };
            nextSession = bindRevisionQuestion(next, ref);
          } else {
            loaded = await runtime(current.target.activityId);
            const choice = selectPracticeQuestion({
              session: current,
              provider: loaded.provider,
              seed,
              summaries: states,
            });
            if (!choice) {
              const next = { ...current, currentAttemptId: null };
              const saved = await ticket.persist(() => repository.saveSession(next));
              if (!saved.ok) throw Error(saved.error.message);
              return { session: next, attempt: null, question: null, runtime: null, tools: null };
            }
            selectedTarget = choice.session.target;
            ref = choice.ref;
            nextSession = { ...choice.session, currentAttemptId: id };
          }
          const content = loaded.provider.restore(ref);
          const tools = await prepareQuestionTools(content, { standard: !!registryOverride });
          const nextAttempt = fresh(ref, selectedTarget, id, content);
          const saved = await ticket.persist(() =>
            repository.saveCurriculum({ attempt: nextAttempt, session: nextSession }),
          );
          if (!saved.ok) throw Error(saved.error.message);
          return {
            session: nextSession,
            attempt: nextAttempt,
            question: content,
            runtime: loaded,
            tools,
          };
        },
        (preparedNext) => {
          flushSync(() => {
            applySession(preparedNext.session);
            if (preparedNext.attempt && preparedNext.question) {
              activeRuntime.current = preparedNext.runtime;
              questionRef.current = preparedNext.question;
              setQuestion(preparedNext.question);
              setQuestionTools(preparedNext.tools);
              applyAttempt(preparedNext.attempt);
              setFeedback(undefined);
              setCorrectionFeedback(undefined);
              setPaused(false);
              setSaveStatus({ kind: 'saved' });
              departing.current = false;
              frozen.current = false;
              setActivationVersion((value) => value + 1);
            } else {
              if (masterySessionId) onMasteryComplete?.();
            }
          });
        },
      );
    } finally {
      nextPending.current = false;
      if (mounted.current) setNextLoading(false);
    }
  };
  const resume = async (ticket?: LoadingTicket) => {
    if (ticket) {
      const isCurrent = () => mounted.current && !ticket.signal.aborted && ticket.isCurrent();
      if (!isCurrent()) return false;
      await queue.current;
      if (!isCurrent()) return false;
      const original = sessionRef.current;
      if (!original) {
        departing.current = false;
        frozen.current = false;
        setActivationVersion((value) => value + 1);
        return true;
      }
      const retainedAttemptFailure = failedSave.current;
      const retainedSessionFailure = failedSessionSave.current;
      const requiredWrites = [retainedAttemptFailure, retainedSessionFailure]
        .filter((value): value is FailedWrite => !!value)
        .map((value) => value.write);
      // Do not use saveSession/onSaved: its callback could publish after supersession.
      const resumed = await persistCurriculumResume(original, repository, ticket, requiredWrites);
      if (!isCurrent() || !resumed || sessionRef.current !== original) return false;
      let restoredHistory: readonly CurriculumEvidence[] | undefined;
      if (retainedAttemptFailure) {
        const records = await repository.curriculumHistory(namespace);
        if (!isCurrent() || sessionRef.current !== original) return false;
        if (!records.ok) throw Error(records.error.message);
        restoredHistory = records.value;
      }
      // Recovery intentionally bypasses onSaved; publish only this current cancellation.
      if (failedSave.current === retainedAttemptFailure) failedSave.current = null;
      if (failedSessionSave.current === retainedSessionFailure) {
        failedSessionSave.current = null;
        pendingSessionSave.current = null;
      }
      saveFailed.current = !!failedSave.current || !!failedSessionSave.current;
      if (saveFailed.current) return false;
      if (restoredHistory) setHistory(restoredHistory);
      setSaveStatus({ kind: 'saved' });
      applySession(resumed);
      setPaused(
        resumed.kind === 'revision' ? resumed.status === 'paused' : resumed.paused === true,
      );
      setSetupOpen(false);
      departing.current = false;
      frozen.current = false;
      setActivationVersion((value) => value + 1);
      return true;
    }
    const current = sessionRef.current;
    if (!current) return false;
    const next =
      current.kind === 'revision' ? resumeRevisionSession(current) : { ...current, paused: false };
    setTransitioning(true);
    try {
      // commitSession runs only after the durable queued write (and again on Retry).
      await saveSession(next);
      if (saveFailed.current) return false;
    } finally {
      setTransitioning(false);
    }
    setSetupOpen(false);
    departing.current = false;
    frozen.current = false;
    setActivationVersion((value) => value + 1);
    return true;
  };
  const resumeRef = useRef(resume);
  resumeRef.current = resume;
  useEffect(() => {
    if (!paused) {
      automaticContinuation.current = null;
      return;
    }
    const stored = stateRef.current;
    const savedSession = sessionRef.current;
    if (
      !canContinueStoredSession({
        session: savedSession,
        attempt: stored,
        view: currentViewRef.current,
        launchRequest: launchRequestRef.current,
        ready:
          !loading &&
          !loadingCoordinator.pending &&
          !frozen.current &&
          !readError &&
          !preview &&
          !navigationBusy &&
          !transitioning &&
          saveStatus.kind !== 'error' &&
          !pendingSessionSave.current,
        setupOpen,
        departing: departing.current,
      })
    )
      return;
    const key = `${savedSession!.kind}:${stored!.attemptId}`;
    if (automaticContinuation.current === key) return;
    automaticContinuation.current = key;
    void resumeRef.current();
  }, [
    paused,
    loading,
    readError,
    preview,
    navigationBusy,
    transitioning,
    setupOpen,
    currentView,
    launchRequest,
    saveStatus.kind,
    loadingCoordinator.pending,
  ]);
  const retry = async () => {
    const commitRetryReadiness = () => {
      departing.current = false;
      const current = sessionRef.current;
      // Retrying a navigation checkpoint saves its paused session. The automatic
      // continuation path must durably resume that session before answering.
      setPaused(
        current?.kind === 'revision' ? current.status === 'paused' : current?.paused === true,
      );
    };
    const pending = failedSessionSave.current ?? failedSave.current;
    if (pending) {
      await queueSave(pending.write, pending.onSaved, pending.kind, pending.owner);
      if (!saveFailed.current) commitRetryReadiness();
      if (!saveFailed.current && awaitingLaunchSave.current) {
        onLaunchConsumed?.(awaitingLaunchSave.current);
        awaitingLaunchSave.current = null;
      }
      return;
    }
    const value = stateRef.current;
    if (value) {
      await save(value);
      if (!saveFailed.current) commitRetryReadiness();
    }
  };
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__mastersActivity = {
      snapshot: () => ({
        attempt: stateRef.current,
        session: sessionRef.current,
        question: questionRef.current,
        history,
        saveStatus,
        databaseName,
        selectedCount: selected.length,
        correctionFeedback,
      }),
      flush: async () => {
        await Promise.all([...pendingCommands.current]);
        await queue.current;
      },
      history: loadHistory,
      respond: async (partId, response) => {
        if (response) await command({ kind: 'respond', partId, response });
      },
      checkpoint: async () => {
        const current = controllerRef.current;
        if (current) {
          const state = current.checkpoint();
          applyAttempt(state);
          await save(state);
        }
      },
    };
    return () => {
      delete window.__mastersActivity;
    };
  }, [
    history,
    saveStatus,
    databaseName,
    selected.length,
    correctionFeedback,
    loadHistory,
    command,
    applyAttempt,
    save,
  ]);
  const freezeAttempt = useCallback(() => {
    if (frozen.current) return;
    frozen.current = true;
    departing.current = true;
    const dispose = timingDispose.current;
    timingDispose.current = null;
    dispose?.();
    // Coordinate/editor fields keep incomplete text locally until blur. Commit that
    // draft before the provider makes the retained surface inert, without opening
    // the host to later interactions during the asynchronous checkpoint.
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && focused.closest('.question-player')) {
      flushingDraft.current = true;
      try {
        focused.blur();
      } finally {
        flushingDraft.current = false;
      }
      const controller = controllerRef.current;
      if (controller && stateRef.current && !preview) {
        controller.dispatch({ kind: 'pause' });
        const state = controller.checkpoint();
        applyAttempt(state);
        void save(state);
      }
    }
  }, [preview, applyAttempt, save]);
  useEffect(
    () => loadingCoordinator.onFreeze(freezeAttempt),
    [loadingCoordinator.onFreeze, freezeAttempt],
  );
  const leaveAttempt = async () => {
    // Browser popstate uses this guard without selectView's navigationBusy state.
    // Suppress automatic continuation synchronously, before the pause/save yields.
    freezeAttempt();
    try {
      await Promise.all([...pendingCommands.current]);
      await queue.current;
      if (saveFailed.current) await retry();
      if (saveFailed.current) return false;
      if (stateRef.current && !preview && !paused) {
        const current = sessionRef.current;
        if (current)
          applySession(
            current.kind === 'revision'
              ? pauseRevisionSession(current)
              : { ...current, paused: true },
          );
        setPaused(true);
        await save(stateRef.current);
      }
      await queue.current;
      if (saveFailed.current) departing.current = false;
      return !saveFailed.current;
    } catch (error) {
      departing.current = false;
      throw error;
    }
  };
  const leaveRef = useRef(leaveAttempt);
  leaveRef.current = leaveAttempt;
  useEffect(() => {
    const guard = Object.assign(() => leaveRef.current(), {
      freeze: freezeAttempt,
      resume: (ticket?: LoadingTicket) => resumeRef.current(ticket),
    });
    onNavigationGuard?.(guard);
    return () => onNavigationGuard?.(null);
  }, [onNavigationGuard, freezeAttempt]);
  const startRef = useRef(start);
  startRef.current = start;
  useEffect(() => {
    if (
      !launchRequest ||
      loading ||
      readError ||
      preview ||
      launchPending.current ||
      consumedLaunches.current.has(launchRequest.id)
    )
      return;
    consumedLaunches.current.add(launchRequest.id);
    launchPending.current = true;
    setNavigationBusy(true);
    setLaunchFailed(false);
    void startRef
      .current(launchRequest)
      .then((opened) => {
        if (opened && !saveFailed.current) onLaunchConsumed?.(launchRequest.id);
        else if (opened) awaitingLaunchSave.current = launchRequest.id;
        else setLaunchFailed(true);
      })
      .catch((error: unknown) => {
        setLaunchFailed(true);
        setSetupOpen(true);
        setFeedback({
          message:
            error instanceof Error ? error.message : 'The selected practice could not be opened.',
        });
      })
      .finally(() => {
        launchPending.current = false;
        if (mounted.current) {
          setNavigationBusy(false);
        }
      });
  }, [launchRequest, loading, readError, preview, onLaunchConsumed]);
  const selectView = async (next: PlatformView) => {
    if (onSelectView) {
      onSelectView(next);
      return;
    }
    if (next === 'olympiad' && onSelectOlympiad) {
      onSelectOlympiad();
      return;
    }
    if (navigationBusy) return;
    setNavigationBusy(true);
    try {
      await loadingCoordinator.run(
        'screen',
        async (ticket) => {
          if (!(await leaveAttempt()))
            throw Error('Your work has not saved. Retry saving before leaving.');
          return prepareCurriculum({
            course,
            databaseName,
            registry,
            repository,
            view: next,
            ticket,
            ...(initialActivityId ? { initialActivityId } : {}),
            ...(initialTeacherGroup ? { initialTeacherGroup } : {}),
            ...(masterySessionId ? { masterySessionId } : {}),
          });
        },
        commitPrepared,
      );
    } finally {
      setNavigationBusy(false);
    }
  };
  const [teacherPayload, setTeacherPayload] = useState<PreparedTeacher | null>(
    prepared?.teacher ?? null,
  );
  const [teacherPickerRevision, setTeacherPickerRevision] = useState(0);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(
    prepared?.teacher?.question ?? null,
  );
  const [previewSubtopic, setPreviewSubtopic] = useState(prepared?.teacher?.subtopic ?? '');
  const [teacherActivity, setTeacherActivity] = useState<ActivityId>(
    prepared?.teacher?.activityId ??
      (reviewRef
        ? gradedActivityId(reviewRef.activityId)
        : (initialActivityId ?? registrations[0]!.id)),
  );
  const changeTeacher = (selection: {
    activityId?: ActivityId;
    reviewRef?: QuestionRef;
    code?: string;
  }) =>
    loadingCoordinator.run(
      'question',
      (ticket) =>
        prepareTeacher({ course, registry, ticket, activityId: teacherActivity, ...selection }),
      (value) => {
        flushSync(() => {
          setTeacherPayload(value);
          setTeacherActivity(value.activityId);
          setPreviewQuestion(value.question);
          setPreviewSubtopic(value.subtopic);
          if (selection.code !== undefined) setTeacherPickerRevision((value) => value + 1);
          frozen.current = false;
          departing.current = false;
        });
      },
    );
  const shownTools = preview ? teacherPayload?.tools : questionTools;
  const shownQuestion = preview ? previewQuestion : question;
  const shownAttempt =
    preview && previewQuestion
      ? { mode: 'teacher' as const, ref: previewQuestion.ref, currentResponses: {} }
      : attempt;
  const topics = [...new Set(registrations.flatMap((a) => a.gems.map((g) => g.topicId)))];
  const focused = !!shownQuestion && !setupOpen;
  const shownSubtopic = preview
    ? previewSubtopic || shownQuestion?.title
    : attempt
      ? targetSubtopic(registry, attempt.target)
      : undefined;
  const targetLabel = (item: CurriculumTarget) =>
    `${registrations.find((a) => a.id === item.activityId)?.gems.find((g) => g.id === item.gemId)?.label} \u00b7 Level ${item.level}`;
  const ReadyRateResponseControl = shownTools?.rate?.ResponseControl ?? RateResponseControl;
  const ReadyRateGraphWorkspace = shownTools?.rate?.GraphWorkspace ?? RateGraphWorkspace;
  const retainedQuestion = !!shownQuestion && !!shownAttempt;
  return (
    <CourseShell
      course={course}
      registry={registry}
      currentView={localView}
      onSelectView={(next) => void selectView(next)}
      focused={focused}
      {...(shownQuestion && shownSubtopic && !setupOpen && !launchRequest
        ? {
            questionHeader: {
              subtopic: shownSubtopic,
              questionId: shownQuestion.ref.questionId,
              seed: shownQuestion.ref.seed,
              activityId: shownQuestion.ref.activityId,
            },
          }
        : {})}
      {...(preview
        ? { currentActivityId: teacherActivity }
        : attempt
          ? { currentActivityId: attempt.ref.activityId }
          : {})}
      onSelectActivity={(activityId) => {
        if (productionRegistry.get(activityId)?.strand === 'olympiad') {
          onSelectOlympiad?.(activityId as import('../contracts/index.ts').OlympiadActivityId);
          return;
        }
        if (preview) {
          void changeTeacher({ activityId });
          return;
        }
        void loadingCoordinator.run(
          'question',
          async () => {
            if (!(await leaveAttempt()))
              throw Error('Your work has not saved. Retry saving before leaving.');
            return allTargets.find((t) => t.activityId === activityId);
          },
          (item) => {
            if (item) setTargetKey(`${item.gemId}:${item.level}`);
            setSetupOpen(true);
            frozen.current = false;
            departing.current = false;
          },
        );
      }}
    >
      {launchRequest && launchFailed && !loading && !readError && (
        <section role="alert" className="save-error">
          <p>
            The selected session could not start. Saved work must be available before continuing.
          </p>
          <button
            type="button"
            disabled={navigationBusy || saveStatus.kind === 'error'}
            onClick={() => {
              if (launchPending.current) return;
              launchPending.current = true;
              setNavigationBusy(true);
              setLaunchFailed(false);
              // Explicit retry keeps the token protected from effect reruns.
              void startRef
                .current(launchRequest)
                .then((opened) => {
                  if (opened && !saveFailed.current) onLaunchConsumed?.(launchRequest.id);
                  else if (opened) awaitingLaunchSave.current = launchRequest.id;
                  else setLaunchFailed(true);
                })
                .catch(() => setLaunchFailed(true))
                .finally(() => {
                  launchPending.current = false;
                  setNavigationBusy(false);
                });
            }}
          >
            Retry selected session
          </button>
        </section>
      )}
      {preview && teacherPayload ? (
        <TeacherPicker
          key={`${teacherActivity}:${teacherPickerRevision}`}
          course={course}
          registry={registry}
          activityId={teacherActivity}
          onActivity={(activityId) => {
            void changeTeacher({ activityId });
          }}
          onQuestion={(reviewRef) => {
            void changeTeacher({ reviewRef });
          }}
          onLookup={(code) => {
            void changeTeacher({ code });
          }}
          catalogue={teacherPayload.rows}
          selectedKey={teacherPayload.selectedKey}
          {...(teacherPayload.initialGroup ? { initialGroup: teacherPayload.initialGroup } : {})}
        />
      ) : (
        !launchRequest &&
        !loading &&
        (!attempt || setupOpen) && (
          <section aria-label="Practice setup" className="practice-setup">
            <h2>
              {sessionMode === 'revision' ? 'Build a revision session' : 'Choose your practice'}
            </h2>
            <label>
              Activity and level{' '}
              <select
                aria-label="Target"
                value={target ? `${target.gemId}:${target.level}` : ''}
                onChange={(event) => setTargetKey(event.target.value)}
              >
                {allTargets.map((item) => (
                  <option key={`${item.gemId}:${item.level}`} value={`${item.gemId}:${item.level}`}>
                    {targetLabel(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Session{' '}
              <select
                aria-label="Session"
                value={sessionMode}
                onChange={(event) => {
                  const mode = event.target.value === 'revision' ? 'revision' : 'practice';
                  setSessionMode(mode);
                  setLocalView(mode);
                }}
              >
                <option value="practice">Practice</option>
                <option value="revision">Revision</option>
              </select>
            </label>
            {sessionMode === 'revision' && (
              <div className="revision-topics">
                <h3>Revision topics</h3>
                {topics.map((topic) => (
                  <button
                    type="button"
                    key={topic}
                    onClick={() =>
                      setSelected((previous) => {
                        const additions = topicTargets(registrations, course, topic);
                        return [
                          ...previous,
                          ...additions.filter(
                            (a) =>
                              !previous.some((p) => p.gemId === a.gemId && p.level === a.level),
                          ),
                        ];
                      })
                    }
                  >
                    ADD ALL {topic}
                  </button>
                ))}
                <button type="button" onClick={() => setSelected([])}>
                  Clear selection
                </button>
                <p data-testid="selected-count">
                  {selected.length} supported target levels selected
                </p>
              </div>
            )}
            <div className="action-row">
              <button type="button" onClick={() => void selectView('teacher')}>
                Teacher preview
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => void start()}
                disabled={
                  loading ||
                  !!readError ||
                  preview ||
                  saveStatus.kind === 'saving' ||
                  (sessionMode === 'revision' && !selected.length)
                }
              >
                {sessionMode === 'revision' ? 'Start revision' : 'Start practice'}
              </button>
            </div>
          </section>
        )
      )}
      {!preview && (readError || loading || setupOpen) ? null : !preview &&
        !retainedQuestion &&
        (launchRequest || transitioning) ? null : paused && !preview && !retainedQuestion ? (
        saveStatus.kind === 'error' ? (
          <section className="save-error" role="alert">
            <p>Work has not saved. {saveStatus.error.message}</p>
            <button type="button" onClick={() => void retry()}>
              Retry save
            </button>
          </section>
        ) : null
      ) : shownQuestion && shownAttempt ? (
        <Suspense fallback={null}>
          <QuestionPlayer
            {...(shownTools?.standard ? { presentation: 'standard' as const } : {})}
            {...(shownQuestion.ref.activityId === 'alevel/rate-equations' && shownTools?.rate
              ? {
                  presentation: 'standard' as const,
                  responseControl: ReadyRateResponseControl,
                  workspace: (
                    <ReadyRateGraphWorkspace
                      key={
                        shownAttempt.mode === 'student'
                          ? shownAttempt.attemptId
                          : JSON.stringify(shownQuestion.ref)
                      }
                      questionRef={shownQuestion.ref}
                      assessed={
                        shownAttempt.mode !== 'student' || shownAttempt.phase === 'assessed'
                      }
                      {...(shownAttempt.mode === 'student'
                        ? {
                            ...(shownAttempt.workspace ? { state: shownAttempt.workspace } : {}),
                            onStateChange: (
                              workspace: import('../contracts/workspace.ts').RateGraphWorkspaceState,
                            ) => void command({ kind: 'workspace', workspace }),
                          }
                        : {})}
                    />
                  ),
                }
              : {})}
            question={shownQuestion}
            {...(shownTools ? { preparedTools: shownTools } : {})}
            attempt={shownAttempt}
            restoredFeedback={restoreCheckedFeedback(
              shownQuestion,
              shownAttempt,
              activeRuntime.current?.policy,
            )}
            onCommand={(value) => void command(value)}
            onNext={() => void nextQuestion()}
            saveStatus={saveStatus}
            onRetrySave={() => void retry()}
            {...(feedback ? { feedback } : {})}
            {...(correctionFeedback ? { correctionFeedback } : {})}
            learningReviewEnabled={registrations.some(
              (item) => item.id === shownQuestion.ref.activityId && !!item.learningReview,
            )}
            canNext={!paused && saveStatus.kind !== 'error' && !nextLoading}
            renderEditor={(props) =>
              (() => {
                const Editor =
                  shownTools?.editors?.[
                    props.part.kind as keyof NonNullable<PreparedQuestionTools['editors']>
                  ];
                if (!Editor) throw Error('The required question workspace was not prepared.');
                return <Editor {...props} />;
              })()
            }
          />
        </Suspense>
      ) : (
        <p>Choose an activity and level, then start a question.</p>
      )}
    </CourseShell>
  );
}

/** Existing direct authoring fixtures receive the same preparation/provider automatically. */
function CurriculumEntry(props: CurriculumHostProps) {
  const loading = useLoading();
  const [entry, setEntry] = useState<{ prepared: PreparedCurriculum; key: number } | null>(null);
  const guard = useRef<
    ((() => Promise<boolean>) & { resume?: (ticket: LoadingTicket) => Promise<boolean> }) | null
  >(null);
  const registerGuard = useCallback((value: (() => Promise<boolean>) | null) => {
    guard.current = value;
  }, []);
  useEffect(() => {
    if (props.onNavigationGuard) return;
    return loading.onCancel((ticket) => guard.current?.resume?.(ticket));
  }, [loading.onCancel, props.onNavigationGuard]);
  useEffect(() => {
    if (props.prepared) return;
    const url = new URL(location.href);
    const run =
      (import.meta.env.DEV ? url.searchParams.get('run') || 'local' : 'local')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 60) || 'manual';
    const view =
      props.view ??
      (url.searchParams.get('mode') === 'teacher' || url.searchParams.has('review')
        ? 'teacher'
        : url.searchParams.get('session') === 'revision'
          ? 'revision'
          : 'practice');
    const databaseName = activityDatabaseName(
      props.course,
      run,
      import.meta.env.DEV,
      !!props.registry,
      location.pathname,
    );
    void loading.run(
      'screen',
      async (ticket) => {
        if (guard.current && !(await guard.current()))
          throw Error('Your work has not saved. Retry saving before continuing.');
        return prepareCurriculum({
          course: props.course,
          databaseName,
          view,
          ticket,
          url: url.href,
          ...(props.registry ? { registry: props.registry } : {}),
          ...(props.launchRequest ? { launchRequest: props.launchRequest } : {}),
          ...(props.initialActivityId ? { initialActivityId: props.initialActivityId } : {}),
          ...(props.reviewRef ? { reviewRef: props.reviewRef } : {}),
          ...(props.initialTeacherGroup ? { initialTeacherGroup: props.initialTeacherGroup } : {}),
          ...(props.masterySessionId ? { masterySessionId: props.masterySessionId } : {}),
        });
      },
      (prepared, ticket) => {
        flushSync(() => setEntry({ prepared, key: ticket.id }));
      },
    );
  }, [
    props.prepared,
    props.course,
    props.view,
    props.registry,
    props.initialActivityId,
    props.reviewRef,
    props.initialTeacherGroup,
    props.masterySessionId,
  ]);
  if (props.prepared) return <CurriculumHost {...props} />;
  if (entry)
    return (
      <CurriculumHost
        key={entry.key}
        {...props}
        prepared={entry.prepared}
        onNavigationGuard={props.onNavigationGuard ?? registerGuard}
      />
    );
  return (
    <CourseShell
      course={props.course}
      registry={props.registry ?? productionRegistry}
      currentView={props.view ?? 'practice'}
      onSelectView={() => {}}
    >
      {null}
    </CourseShell>
  );
}

export function FoundationApp(props: CurriculumHostProps) {
  const context = useLoadingContext();
  return context ? (
    <CurriculumEntry {...props} />
  ) : (
    <LoadingProvider>
      <CurriculumEntry {...props} />
    </LoadingProvider>
  );
}
