import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from '../contracts/index.ts';
import { productionRegistry } from './registry.ts';
import { createAttemptController, assessmentToEvidence } from '../domain/attempt/index.ts';
import { createActiveClock, bindBrowserAttemptTiming } from '../domain/timing/index.ts';
import {
  createRevisionSession,
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
const DotCrossEditor = lazy(async () => ({
  default: (await import('../editors/dot-and-cross/index.ts')).DotCrossEditor,
}));
const TitrationCurveEditor = lazy(async () => ({
  default: (await import('../editors/titration-curve/index.ts')).TitrationCurveEditor,
}));
const ElectronConfigurationEditor = lazy(async () => ({
  default: (await import('../editors/electron-configuration/index.tsx'))
    .ElectronConfigurationEditor,
}));
const EnergyProfileEditor = lazy(async () => ({
  default: (await import('../editors/energy-profile/index.tsx')).EnergyProfileEditor,
}));
interface Runtime {
  provider: QuestionProvider;
  policy: MarkingPolicy;
  learningReviewPolicy?: LearningReviewPolicy;
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

/** Real activity host: one controller, clock, repository and scheduler for both modes. */
export function FoundationApp({
  course,
  onSelectOlympiad,
  initialActivityId,
  registry: registryOverride,
  view,
  onSelectView,
  reviewRef,
}: CurriculumHostIntegration & {
  readonly course: Course;
  readonly onSelectOlympiad?: () => void;
}) {
  const query = useMemo(() => new URLSearchParams(location.search), []);
  const run =
    (import.meta.env.DEV ? query.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const databaseName = `masters-of-chemistry-${course}-${run}`;
  const namespace = useMemo(() => ({ course, profileId: 'local' }), [course]);
  const [readVersion, setReadVersion] = useState(0);
  const repository = useMemo(
    () => createChemistryRepository(databaseName),
    [databaseName, readVersion],
  );
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
  const [attempt, setAttempt] = useState<StudentAttempt | null>(null);
  const [session, setSession] = useState<CurriculumSession | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<readonly CurriculumEvidence[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [feedback, setFeedback] = useState<PlayerFeedback | undefined>();
  const [correctionFeedback, setCorrectionFeedback] = useState<CorrectionFeedback | undefined>();
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<StorageFailure | null>(null);
  const [paused, setPaused] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [localView, setLocalView] = useState<PlatformView>(
    view ??
      (query.get('mode') === 'teacher' || reviewCode
        ? 'teacher'
        : query.get('session') === 'revision'
          ? 'revision'
          : 'practice'),
  );
  const [navigationBusy, setNavigationBusy] = useState(false);
  useEffect(() => {
    if (view) {
      setLocalView(view);
      setPreview(view === 'teacher');
      if (view !== 'teacher') setSessionMode(view === 'revision' ? 'revision' : 'practice');
    }
  }, [view]);
  const [clockDisplay, setClockDisplay] = useState(0);
  const stateRef = useRef<StudentAttempt | null>(null),
    sessionRef = useRef<CurriculumSession | null>(null),
    controllerRef = useRef<AttemptController | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const nextPending = useRef(false);
  const pendingCommands = useRef(new Set<Promise<void>>());
  const mounted = useRef(true),
    saveFailed = useRef(false);
  const registry = registryOverride ?? productionRegistry;
  const runtimes = useRef(new Map<ActivityId, Promise<Runtime>>());
  const activeRuntime = useRef<Runtime | null>(null),
    questionRef = useRef<Question | null>(null);
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
      ]).then(
        ([provider, policy, learningReviewPolicy]): Runtime => ({
          provider,
          policy,
          ...(learningReviewPolicy ? { learningReviewPolicy } : {}),
        }),
      );
      runtimes.current.set(id, loaded);
      return loaded;
    },
    [registry],
  );
  const resolve = useCallback(
    async (value: StudentAttempt) => {
      const loaded = await runtime(value.ref.activityId);
      const content = loaded.provider.restore(value.ref);
      activeRuntime.current = loaded;
      questionRef.current = content;
      setQuestion(content);
    },
    [runtime],
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
    setClockDisplay(
      value.phase === 'answering' ? value.timing.activeMs : value.firstResponse.timing.activeMs,
    );
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
  const save = useCallback(
    (value: StudentAttempt, currentSession: CurriculumSession | null = sessionRef.current) => {
      setSaveStatus({ kind: 'saving' });
      queue.current = queue.current.then(async () => {
        const evidence = assessmentToEvidence(value);
        const result = await repository.saveCurriculum({
          attempt: value,
          ...(evidence ? { evidence } : {}),
          ...(currentSession ? { session: currentSession } : {}),
        });
        saveFailed.current = !result.ok;
        if (!mounted.current) return;
        setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
        if (result.ok && evidence) await loadHistory();
      });
      return queue.current;
    },
    [repository, loadHistory],
  );
  const readSavedData = useCallback(
    async (cancelled: () => boolean = () => false) => {
      setLoading(true);
      try {
        const records = await repository.curriculumHistory(namespace);
        if (cancelled()) return;
        if (!records.ok) {
          setReadError(records.error);
          return;
        }
        const loaded = await repository.loadSession(namespace, 'current-session');
        if (cancelled()) return;
        if (!loaded.ok) {
          setReadError(loaded.error);
          return;
        }
        if (loaded.value) {
          const id =
            loaded.value.kind === 'revision'
              ? loaded.value.current?.attemptId
              : loaded.value.currentAttemptId;
          if (id) {
            const result = await repository.loadAttempt(namespace, id);
            if (cancelled()) return;
            if (!result.ok) {
              setReadError(result.error);
              return;
            }
            if (!result.value) {
              setReadError({
                code: 'invalid-data',
                message: 'The saved session references a missing attempt.',
                retryable: false,
              });
              return;
            }
            if (result.value) {
              await resolve(result.value);
              if (cancelled()) return;
              applyAttempt(result.value);
              setTargetKey(`${result.value.target.gemId}:${result.value.target.level}`);
              setSaveStatus({ kind: 'saved' });
              setPaused(
                loaded.value.kind === 'revision'
                  ? loaded.value.status === 'paused'
                  : loaded.value.paused === true,
              );
            }
          }
          applySession(loaded.value);
          if (view && view !== 'teacher' && view !== loaded.value.kind) setSetupOpen(true);
          setSessionMode(
            view && view !== 'teacher'
              ? view === 'revision'
                ? 'revision'
                : 'practice'
              : loaded.value.kind,
          );
        }
        setHistory(records.value);
        setReadError(null);
      } catch (error) {
        if (!cancelled())
          setReadError({
            code: 'invalid-data',
            message:
              error instanceof Error ? error.message : 'The saved question could not be restored.',
            retryable: false,
          });
      } finally {
        if (!cancelled()) setLoading(false);
      }
    },
    [repository, namespace, applySession, applyAttempt, resolve, view],
  );
  const readSavedDataRef = useRef(readSavedData);
  readSavedDataRef.current = readSavedData;
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    void readSavedDataRef.current(() => cancelled);
    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [repository, namespace, resolve]);
  // An existing persisted attempt enters this effect. Identity is created only by explicit Start/Next handlers.
  useEffect(() => {
    if (!attempt || preview || paused) {
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
    const display = window.setInterval(() => {
      const current = controller.checkpoint();
      setClockDisplay(
        current.phase === 'answering'
          ? current.timing.activeMs
          : current.firstResponse.timing.activeMs,
      );
    }, 1000);
    return () => {
      window.clearInterval(display);
      unbind();
      controllerRef.current = null;
    };
    // Persisted identity changes, pause and preview control binding; response rerenders must not recreate controllers.
  }, [attempt?.attemptId, preview, paused, applyAttempt, save]);
  const adopt = useCallback(
    async (value: StudentAttempt, nextSession: CurriculumSession) => {
      await resolve(value);
      applySession(nextSession);
      applyAttempt(value);
      setPaused(false);
      setFeedback(undefined);
      await save(value, nextSession);
    },
    [applySession, applyAttempt, save, resolve],
  );
  const fresh = useCallback(
    (
      ref: StudentAttempt['ref'],
      selectedTarget: CurriculumTarget,
      attemptId: string,
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
          return registration.idleAllowance(questionRef.current!);
        })(),
        finished: false,
      },
    }),
    [namespace],
  );
  const start = async () => {
    if (!target || preview || loading || readError) return;
    if (!(await leaveAttempt())) return;
    setSetupOpen(false);
    const records = await loadHistory(),
      states = summaries(records),
      id = crypto.randomUUID(),
      seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    if (sessionMode === 'revision') {
      if (!selected.length) {
        setFeedback({ message: 'Choose a topic with ADD ALL before launching revision.' });
        return;
      }
      const initial = createRevisionSession({
        namespace,
        id: 'current-session',
        selected,
        settings: registrations.flatMap((a) => a.gems.map((g) => g.mastery)),
        summaries: states,
        now: Date.now(),
      });
      const next = revisionScheduler.next(initial, states, Date.now(), id);
      if (!next.current) return;
      const loaded = await runtime(next.current.target.activityId);
      const ref = loaded.provider.select({
        ...next.current.target,
        seed,
        previousQuestionIds: next.previous
          .filter((item) => item.target.activityId === next.current!.target.activityId)
          .map((item) => item.ref.questionId),
      });
      questionRef.current = loaded.provider.restore(ref);
      await adopt(
        fresh({ ...ref, activityId: next.current.target.activityId }, next.current.target, id),
        bindRevisionQuestion(next, { ...ref, activityId: next.current.target.activityId }),
      );
    } else {
      const initial = {
        kind: 'practice' as const,
        namespace,
        id: 'current-session',
        target,
        selection: 'fixed-level' as const,
        currentAttemptId: null,
        previousQuestionIds: [],
      };
      const registration = registry.get(target.activityId);
      if (!registration || registration.strand !== 'curriculum') return;
      const provider = await registration.provider(),
        choice = selectPracticeQuestion({ session: initial, provider, seed, summaries: states });
      if (!choice) return;
      questionRef.current = provider.restore(choice.ref);
      await adopt(fresh({ ...choice.ref, activityId: target.activityId }, target, id), {
        ...choice.session,
        currentAttemptId: id,
      });
    }
  };
  const executeCommand = useCallback(
    async (value: AttemptCommand) => {
      const controller = controllerRef.current;
      if (!controller || preview || paused) return;
      const previousPhase = controller.state().phase;
      const result = controller.dispatch(value);
      if (!result.accepted) {
        setFeedback({ message: result.message });
        return;
      }
      // A correction check is transient learning feedback: no repository or scheduler action.
      if (value.kind === 'check-correction') {
        setFeedback(undefined);
        setCorrectionFeedback(result.correctionFeedback);
        return;
      }
      if (value.kind === 'respond') setCorrectionFeedback(undefined);
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
      await save(next, nextSession);
    },
    [preview, paused, applyAttempt, applySession, save, loadHistory, summaries],
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
    if (nextPending.current || paused || preview) return;
    nextPending.current = true;
    setNextLoading(true);
    try {
      // Blur can commit an editor draft between pointerdown and click. Keep Next
      // clickable during that save, then await its actual result before advancing.
      await queue.current;
      if (!mounted.current || saveFailed.current) return;
      const value = stateRef.current,
        current = sessionRef.current;
      if (
        !value ||
        value.phase !== 'assessed' ||
        !current ||
        (current.kind === 'revision' ? current.status === 'paused' : current.paused)
      )
        return;
      const id = crypto.randomUUID(),
        seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1,
        records = await loadHistory(),
        states = summaries(records);
      if (saveFailed.current || !mounted.current) return;
      if (current.kind === 'revision') {
        const next = revisionScheduler.next(current, states, Date.now(), id);
        if (!next.current) {
          applySession(next);
          await repository.saveSession(next);
          return;
        }
        const loaded = await runtime(next.current.target.activityId);
        const ref = loaded.provider.select({
          ...next.current.target,
          seed,
          previousQuestionIds: next.previous
            .filter((item) => item.target.activityId === next.current!.target.activityId)
            .map((item) => item.ref.questionId),
        });
        questionRef.current = loaded.provider.restore(ref);
        await adopt(
          fresh({ ...ref, activityId: next.current.target.activityId }, next.current.target, id),
          bindRevisionQuestion(next, { ...ref, activityId: next.current.target.activityId }),
        );
      } else {
        const registration = registry.get(current.target.activityId);
        if (!registration || registration.strand !== 'curriculum') return;
        const choice = selectPracticeQuestion({
          session: current,
          provider: await registration.provider(),
          seed,
          summaries: states,
        });
        if (choice) {
          questionRef.current = (await registration.provider()).restore(choice.ref);
          await adopt(
            fresh(
              { ...choice.ref, activityId: current.target.activityId },
              choice.session.target,
              id,
            ),
            { ...choice.session, currentAttemptId: id },
          );
        }
      }
    } finally {
      nextPending.current = false;
      if (mounted.current) setNextLoading(false);
    }
  };
  const resume = async () => {
    const current = sessionRef.current;
    if (current) {
      const next =
        current.kind === 'revision'
          ? resumeRevisionSession(current)
          : { ...current, paused: false };
      applySession(next);
      const value = stateRef.current;
      if (value) await save(value, next);
      else await repository.saveSession(next);
    }
    setSetupOpen(false);
    setPaused(false);
  };
  const retry = async () => {
    const value = stateRef.current;
    if (value) await save(value);
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
  const leaveAttempt = async () => {
    await Promise.all([...pendingCommands.current]);
    if (controllerRef.current && !preview && !paused) await command({ kind: 'pause' });
    await queue.current;
    return !saveFailed.current;
  };
  const selectView = async (next: PlatformView) => {
    if (navigationBusy) return;
    setNavigationBusy(true);
    try {
      if (!(await leaveAttempt())) {
        setFeedback({
          message: 'Navigation paused because work has not saved. Retry saving before leaving.',
        });
        return;
      }
      setSetupOpen(
        (next === 'practice' || next === 'revision') && sessionRef.current?.kind !== next,
      );
      setLocalView(next);
      setPreview(next === 'teacher');
      if (next === 'practice' || next === 'revision') setSessionMode(next);
      if (next === 'olympiad') onSelectOlympiad?.();
      onSelectView?.(next);
    } finally {
      setNavigationBusy(false);
    }
  };
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [teacherActivity, setTeacherActivity] = useState<ActivityId>(
    reviewRef?.activityId ?? initialActivityId ?? registrations[0]!.id,
  );
  const openTeacherQuestion = useCallback(
    async (ref: QuestionRef) => {
      const loaded = await runtime(ref.activityId);
      setPreviewQuestion(loaded.provider.restore(ref));
    },
    [runtime],
  );
  const shownQuestion = preview ? previewQuestion : question;
  const shownAttempt =
    preview && previewQuestion
      ? { mode: 'teacher' as const, ref: previewQuestion.ref, currentResponses: {} }
      : attempt;
  const topics = [...new Set(registrations.flatMap((a) => a.gems.map((g) => g.topicId)))];
  const focused = !!attempt && !preview && !paused && !setupOpen;
  const targetLabel = (item: CurriculumTarget) =>
    `${registrations.find((a) => a.id === item.activityId)?.gems.find((g) => g.id === item.gemId)?.label} \u00b7 Level ${item.level}`;
  return (
    <CourseShell
      course={course}
      registry={registry}
      currentView={localView}
      onSelectView={(next) => void selectView(next)}
      focused={focused}
      {...(preview
        ? { currentActivityId: teacherActivity }
        : attempt
          ? { currentActivityId: attempt.ref.activityId }
          : {})}
      onSelectActivity={(activityId) => {
        if (activityId === 'alevel/c3l6-organic-reactions') {
          void selectView('olympiad');
          return;
        }
        if (preview) {
          setTeacherActivity(activityId);
          return;
        }
        void leaveAttempt().then((saved) => {
          if (!saved) return;
          const item = allTargets.find((t) => t.activityId === activityId);
          if (item) setTargetKey(`${item.gemId}:${item.level}`);
          setSetupOpen(true);
        });
      }}
    >
      {readError && (
        <section className="save-error" role="alert" aria-label="Saved data unavailable">
          <h2>Saved data could not be loaded</h2>
          <p>
            {readError.code === 'invalid-data'
              ? 'The saved session, question or history is invalid and could not be restored.'
              : 'Browser storage is unavailable, so your saved session and history could not be read.'}
          </p>
          <p>
            Your saved records have not been cleared. Practice and revision are unavailable until
            the saved data can be read.
          </p>
          <p>{readError.message}</p>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              // Startup reads have finished; release their failed or obsolete connection.
              repository.close?.();
              setReadVersion((value) => value + 1);
            }}
          >
            {loading ? 'Reading saved data...' : 'Retry reading saved data'}
          </button>
        </section>
      )}
      {loading && !readError && <p role="status">Reading saved session and history...</p>}
      {!preview && attempt && (
        <section className="focus-controls" aria-label="Current session">
          <span>
            {session?.kind === 'revision' ? 'Revision' : 'Practice'} {'\u00b7'}{' '}
            {targetLabel(attempt.target)}
          </span>
          <div className="action-row">
            <button
              type="button"
              disabled={navigationBusy}
              aria-expanded={setupOpen}
              onClick={() => {
                if (setupOpen) setSetupOpen(false);
                else
                  void leaveAttempt().then((saved) => {
                    if (saved) setSetupOpen(true);
                  });
              }}
            >
              Change activity or view
            </button>
            {!paused && (
              <button type="button" onClick={() => void command({ kind: 'pause' })}>
                Pause and save
              </button>
            )}
          </div>
        </section>
      )}
      {preview ? (
        <TeacherPicker
          course={course}
          registry={registry}
          activityId={teacherActivity}
          onActivity={setTeacherActivity}
          onQuestion={openTeacherQuestion}
          {...(reviewRef || previewQuestion
            ? { initialRef: reviewRef ?? previewQuestion!.ref }
            : reviewCode
              ? { initialCode: reviewCode }
              : {})}
        />
      ) : (
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
      {paused && !preview && !readError && !loading && (
        <section className="pause-notice">
          <p role="status">Attempt paused. Resume preserves its question, answer and timing.</p>
          <button type="button" onClick={() => void resume()}>
            Resume saved attempt
          </button>
          {saveStatus.kind === 'error' && (
            <div className="save-error" role="alert">
              <p>Work has not saved. {saveStatus.error.message}</p>
              <button type="button" onClick={() => void retry()}>
                Retry save
              </button>
            </div>
          )}
        </section>
      )}
      {!preview && (readError || loading) ? null : paused && !preview ? (
        <p>Resume your saved attempt to continue.</p>
      ) : shownQuestion && shownAttempt ? (
        <QuestionPlayer
          question={shownQuestion}
          attempt={shownAttempt}
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
            props.part.kind === 'dot-and-cross' ? (
              <Suspense fallback={<p role="status">Loading diagram workspace...</p>}>
                <DotCrossEditor {...props} />
              </Suspense>
            ) : props.part.kind === 'titration-curve' ? (
              <Suspense fallback={<p role="status">Loading curve workspace...</p>}>
                <TitrationCurveEditor {...props} />
              </Suspense>
            ) : props.part.kind === 'electron-configuration' ? (
              <Suspense fallback={<p role="status">Loading configuration workspace...</p>}>
                <ElectronConfigurationEditor {...props} />
              </Suspense>
            ) : props.part.kind === 'energy-profile' ? (
              <Suspense fallback={<p role="status">Loading energy profile workspace...</p>}>
                <EnergyProfileEditor {...props} />
              </Suspense>
            ) : (
              <p>Diagram workspace is unavailable for this activity.</p>
            )
          }
        />
      ) : (
        <p>Choose an activity and level, then start a question.</p>
      )}
      {!preview && !readError && !loading && (
        <section aria-label="Practice progress" className="practice-progress">
          <p data-testid="saved-result-count">
            {history.length} saved practice {history.length === 1 ? 'result' : 'results'}
          </p>
          <p>
            {attempt && attempt.phase !== 'answering'
              ? 'Time before first submission'
              : 'Active answering time'}
            : {Math.floor(clockDisplay / 60000)}:
            {String(Math.floor(clockDisplay / 1000) % 60).padStart(2, '0')}
          </p>
          {session?.kind === 'revision' && (
            <p>
              {session.status === 'complete'
                ? 'Revision complete'
                : session.status === 'paused'
                  ? 'Revision paused'
                  : 'Revision in progress'}
            </p>
          )}
        </section>
      )}
      {import.meta.env.DEV && (
        <details className="development-verification">
          <summary>Development verification</summary>
          <p data-testid="evidence-count">
            {history.length} independent curriculum evidence records
          </p>
          <p data-testid="attempt-phase">Phase: {attempt?.phase || 'none'}</p>
          <p data-testid="active-time">Active time: {clockDisplay} ms</p>
          <p data-testid="attempt-id">Attempt: {attempt?.attemptId || 'none'}</p>
          <p data-testid="session-current">
            Session: {session?.kind || 'none'} {session?.kind === 'revision' ? session.status : ''}
          </p>
        </details>
      )}
    </CourseShell>
  );
}
