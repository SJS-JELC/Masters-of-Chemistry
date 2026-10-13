import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { Course, Namespace } from '../contracts/identity.ts';
import type {
  AttemptCommand,
  AttemptController,
  CorrectionFeedback,
} from '../contracts/attempt.ts';
import type {
  RecallAttempt,
  RecallProgress,
  RecallSession,
  RecallFact,
} from '../contracts/recall.ts';
import type {
  ChemistryRepository,
  RepositoryResult,
  SaveReceipt,
} from '../contracts/repository.ts';
import type { Question } from '../contracts/question.ts';
import { createChemistryRepository } from '../persistence/repository.ts';
import { alphaDatabaseName } from '../persistence/alpha-namespace.ts';
import { createAttemptController } from '../domain/attempt/attempt.ts';
import { createActiveClock, browserClockSample } from '../domain/timing/active-clock.ts';
import { bindBrowserAttemptTiming } from '../domain/timing/browser-binding.ts';
import { QuestionPlayer, type SaveStatus, type PlayerFeedback } from '../ui/QuestionPlayer.tsx';
import { factsFor, recallCoverage } from './facts.ts';
import { createRecallProvider, recallRef } from './provider.ts';
import { createRecallMarkingPolicy, createRecallLearningReviewPolicy } from './marking.ts';
import { RecallTestPlayer } from './RecallTestPlayer.tsx';
import { RecallFlashcards, type FlashcardLeaveGuard } from './RecallFlashcards.tsx';
import { createViewRepositoryLifetime } from '../foundation/view-repository-lifetime.ts';
import {
  createHistoricalRecallMarkingPolicy,
  historicalRecallFields,
} from './historical-marking.ts';
import { recallAttemptRestoreDisposition } from './compatibility.ts';
import {
  factsForRecallScope,
  rememberRecallLaunch,
  type RecallLaunchScope,
  type RecallPreferences,
  type RecallMode,
  type RecallFlashcardCheckpoint,
} from './session-contract.ts';
import {
  initialRecallPreferences,
  addRecallTopics,
  toggleRecallTopics,
  allRecallTopicsSelected,
  activeRecallTopics,
  recallTopicMastery,
} from './recall-hub.ts';
import { prepareRecall, type PreparedRecall } from './prepare.ts';
import { useLoading } from '../loading/LoadingProvider.tsx';
import type { LoadingTicket } from '../loading/coordinator.ts';
import { repositoryError } from '../loading/module-errors.ts';
import { QuestionHeaderActions } from '../shell/QuestionChrome.tsx';
import { catalogues } from '../landing/catalogue.ts';
import { RecallIcon } from '../landing/RecallIcon.tsx';
import { GemPaths } from '../landing/GemPaths.tsx';
import './recall.css';
export type RecallLeaveGuard = (() => Promise<boolean>) & {
  freeze?: () => void;
  resume?: (ticket: LoadingTicket) => Promise<boolean>;
};
function recallSaved(result: RepositoryResult<unknown>): boolean {
  if (!result.ok && result.error.recovery === 'reload') throw repositoryError(result.error);
  return result.ok;
}
export interface RecallViewProps {
  readonly course: Course;
  readonly onHome: () => void;
  readonly profileId?: string;
  readonly gemIds?: readonly string[];
  readonly gemTitle?: string;
  readonly repository?: ChemistryRepository;
  readonly databaseName?: string;
  readonly prepared?: PreparedRecall;
  readonly mode?: 'student' | 'teacher';
  readonly onRegisterLeaveGuard?: (guard: RecallLeaveGuard | null) => void;
  readonly flowSessionId?: string;
  readonly autoStart?: boolean;
  readonly reviewFact?: Readonly<{ factId: string; historical: boolean }>;
  readonly onComplete?: () => void;
}
export function RecallView({
  course,
  onHome,
  profileId = 'local',
  gemIds,
  gemTitle,
  repository: provided,
  databaseName,
  prepared,
  mode = 'student',
  onRegisterLeaveGuard,
  flowSessionId,
  autoStart = false,
  reviewFact,
  onComplete,
}: RecallViewProps) {
  const loading = useLoading();
  const namespace = useMemo<Namespace>(() => ({ course, profileId }), [course, profileId]);
  const run =
    (import.meta.env.DEV ? new URL(location.href).searchParams.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const database = databaseName ?? alphaDatabaseName(course, run);
  const repository = useMemo(
    () => provided ?? prepared?.repository ?? createChemistryRepository(database),
    [provided, prepared?.repository, database],
  );
  const bank = useMemo(() => factsFor(course), [course]),
    coverage = useMemo(() => recallCoverage(course), [course]);
  const provider = useMemo(() => createRecallProvider(bank, course), [bank, course]);
  const policy = useMemo(() => createRecallMarkingPolicy(bank), [bank]);
  const [preferences, setPreferences] = useState<RecallPreferences>(
    () => prepared?.preferences ?? initialRecallPreferences(namespace),
  );
  const preferencesRef = useRef(preferences),
    preferencesDirty = useRef(false);
  const [scope, setScope] = useState<RecallLaunchScope>(
    () =>
      prepared?.scope ??
      (gemIds?.length === 1 ? { kind: 'gem', gemId: gemIds[0]! } : preferences.lastScope),
  );
  const [ready, setReady] = useState(!!prepared),
    [flashcards, setFlashcards] = useState(false);
  const [flashcardCheckpoint, setFlashcardCheckpoint] = useState<RecallFlashcardCheckpoint | null>(
    null,
  );
  const [flashcardFresh, setFlashcardFresh] = useState(false);
  const [visibleCardId, setVisibleCardId] = useState<string | null>(null);
  const flashLeaveGuard = useRef<FlashcardLeaveGuard | null>(null);
  const flashDrain = useRef<(() => Promise<unknown>) | null>(null);
  const repositoryLifetime = useRef(createViewRepositoryLifetime());
  const [currentFact, setCurrentFact] = useState<RecallFact | null>(null),
    [historical, setHistorical] = useState(false);
  const [progress, setProgress] = useState<readonly RecallProgress[]>(prepared?.progress ?? []);
  const [session, setSession] = useState<RecallSession | null>(null),
    sessionRef = useRef<RecallSession | null>(null);
  const [attempt, setAttempt] = useState<RecallAttempt | null>(null),
    controllerRef = useRef<AttemptController<RecallAttempt> | null>(null);
  const [question, setQuestion] = useState<Question | null>(null),
    [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [feedback, setFeedback] = useState<PlayerFeedback | undefined>(),
    [correction, setCorrection] = useState<CorrectionFeedback | undefined>();
  const teacherTraversal = useRef<{ factIds: readonly string[]; index: number } | null>(null);
  const [busy] = useState(false),
    [message, setMessage] = useState('');
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const failedWrites = useRef(
    new Map<string, { attempt: RecallAttempt; session: RecallSession | null }>(),
  );
  const detachTiming = useRef<(() => void) | null>(null),
    frozen = useRef(false),
    alive = useRef(true);
  const retainedPreferences = useRef<RecallPreferences | null>(null);
  const refreshSequence = useRef(0);
  const completion = useRef(onComplete);
  const surface = useRef<HTMLElement>(null);
  const needsDestinationFocus = useRef(false);
  completion.current = onComplete;
  const selected =
    gemIds && gemIds.length > 1
      ? factsFor(course, gemIds)
      : factsForRecallScope(bank, course, scope);
  const due = selected.filter(
    (f) => (progress.find((p) => p.factId === f.id)?.dueAt ?? 0) <= Date.now(),
  ).length;
  const setCurrentSession = (value: RecallSession | null) => {
    sessionRef.current = value;
    setSession(value);
  };
  const save = useCallback(
    (
      state: RecallAttempt,
      current: RecallSession | null = sessionRef.current,
    ): Promise<RepositoryResult<SaveReceipt>> => {
      if (mode === 'teacher')
        return Promise.resolve({
          ok: false,
          error: {
            code: 'invalid-data',
            message: 'Teacher views create no saved recall evidence.',
            retryable: false,
          },
        });
      const sessionForAttempt =
        current?.currentAttemptId === state.attemptId &&
        current.currentFactId === state.target.factId
          ? current
          : null;
      if (alive.current && controllerRef.current?.state().attemptId === state.attemptId)
        setSaveStatus({ kind: 'saving' });
      const operation = queue.current
        .catch(() => {})
        .then(() =>
          repository.saveRecall({
            attempt: state,
            ...(sessionForAttempt ? { session: sessionForAttempt } : {}),
          }),
        );
      queue.current = operation;
      void operation.then((result) => {
        if (result.ok) failedWrites.current.delete(state.attemptId);
        else
          failedWrites.current.set(state.attemptId, { attempt: state, session: sessionForAttempt });
        if (!alive.current) return;
        if (controllerRef.current?.state().attemptId === state.attemptId)
          setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
        if (result.ok && result.value.evidence !== 'none') {
          const sequence = ++refreshSequence.current;
          void repository.recallProgress(namespace).then((p) => {
            if (alive.current && sequence === refreshSequence.current && p.ok) setProgress(p.value);
          });
        }
      });
      return operation;
    },
    [repository, mode, namespace],
  );
  const freeze = useCallback(() => {
    if (!frozen.current) retainedPreferences.current = preferencesRef.current;
    frozen.current = true;
    const detach = detachTiming.current;
    detachTiming.current = null;
    detach?.();
    controllerRef.current?.dispatch({ kind: 'pause' });
    flashLeaveGuard.current?.freeze();
  }, []);
  const persistPreferences = useCallback(
    async (value: RecallPreferences, guarded = false) => {
      preferencesDirty.current = true;
      preferencesRef.current = value;
      if (alive.current) {
        if (!frozen.current) setPreferences(value);
        setSaveStatus({ kind: 'saving' });
      }
      const operation = queue.current
        .catch(() => {})
        .then(() => repository.saveRecallPreferences(value));
      queue.current = operation;
      const result = await operation;
      if (alive.current && preferencesRef.current === value)
        setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
      if (result.ok && preferencesRef.current === value) {
        preferencesDirty.current = false;
        if (alive.current) setMessage('');
      } else if (!result.ok && alive.current) setMessage(result.error.message);
      return guarded ? recallSaved(result) : result.ok;
    },
    [repository],
  );
  const pause = useCallback(async () => {
    const ticket = loading.snapshot().ticket;
    const controller = controllerRef.current,
      current = sessionRef.current;
    freeze();
    if (flashLeaveGuard.current && !(await flashLeaveGuard.current())) return false;
    await queue.current.catch(() => {});
    if (ticket && !ticket.isCurrent()) return false;
    for (const pending of [...failedWrites.current.values()])
      if (!recallSaved(await save(pending.attempt, pending.session))) return false;
    if (preferencesDirty.current && !(await persistPreferences(preferencesRef.current, true)))
      return false;
    if (ticket && !ticket.isCurrent()) return false;
    if (mode === 'teacher' || !controller || !current) return true;
    const paused = { ...current, status: 'paused' as const };
    const result = await save(controller.checkpoint(), paused);
    if (
      result.ok &&
      alive.current &&
      (!ticket || ticket.isCurrent()) &&
      controllerRef.current === controller
    )
      setCurrentSession(paused);
    return recallSaved(result);
  }, [freeze, mode, save, persistPreferences]);
  const resume = useCallback(
    async (ticket: LoadingTicket) => {
      if (!ticket.isCurrent()) return false;
      await queue.current.catch(() => {});
      for (const pending of [...failedWrites.current.values()]) {
        const result = await ticket.persist(() => save(pending.attempt, pending.session));
        if (!recallSaved(result) || !ticket.isCurrent()) return false;
      }
      if (
        preferencesDirty.current &&
        !(await ticket.persist(() => persistPreferences(preferencesRef.current, true)))
      )
        return false;
      // A started preference transaction may already have committed. Restore the
      // retained chooser selection/mode through the same serialized durable gate.
      if (retainedPreferences.current && preferencesRef.current !== retainedPreferences.current) {
        const value = retainedPreferences.current;
        if (!(await ticket.persist(() => persistPreferences(value, true))) || !ticket.isCurrent())
          return false;
        if (alive.current) setPreferences(value);
      }
      if (flashLeaveGuard.current && !(await ticket.persist(() => flashLeaveGuard.current!())))
        return false;
      const controller = controllerRef.current,
        current = sessionRef.current;
      if (mode !== 'teacher' && controller && current) {
        const active = { ...current, status: 'active' as const };
        const result = await ticket.persist(() => save(controller.checkpoint(), active));
        if (!recallSaved(result) || !ticket.isCurrent()) return false;
        if (alive.current) {
          setCurrentSession(active);
          setAttempt(controller.checkpoint());
        }
      }
      return ticket.isCurrent();
    },
    [repository, mode, save, persistPreferences],
  );
  useEffect(() => loading.onFreeze(freeze), [loading.onFreeze, freeze]);
  useEffect(
    () => (onRegisterLeaveGuard ? undefined : loading.onCancel(resume)),
    [loading.onCancel, resume, onRegisterLeaveGuard],
  );
  useEffect(() => {
    const guard: RecallLeaveGuard = Object.assign(pause, { freeze, resume });
    onRegisterLeaveGuard?.(guard);
    return () => onRegisterLeaveGuard?.(null);
  }, [onRegisterLeaveGuard, pause, freeze, resume]);
  const mount = useCallback(
    (state: RecallAttempt) => {
      const disposition = recallAttemptRestoreDisposition(state, bank);
      if (disposition.kind === 'fresh') throw Error('This answer format needs a fresh attempt.');
      const fact = disposition.fact,
        frozenHistorical = disposition.kind === 'history' && state.definitionId === undefined;
      let q = createRecallProvider([fact], course).restore(state.ref);
      if (frozenHistorical) {
        const { sentenceTokens: _tokens, ...historicalQuestion } = q;
        q = {
          ...historicalQuestion,
          parts: historicalRecallFields(fact).map((f) => ({
            id: f.id,
            kind: 'text' as const,
            prompt: [{ kind: 'text' as const, text: f.label }],
            marks: 1,
            required: true,
            dependsOn: [],
            accepted: [f.answer, ...f.accepted],
            normalization: 'exact' as const,
            presentation: 'single-line' as const,
          })),
        };
      }
      const clock = createActiveClock({
        attemptId: state.attemptId,
        idleLimitMs: 60000,
        now: () => ({ ...browserClockSample(), visible: false, focused: false }),
        ...(state.phase === 'answering' ? { saved: state.timing } : { completed: true }),
      });
      const controller = createAttemptController<RecallAttempt>({
        question: q,
        state,
        clock,
        policy: frozenHistorical ? createHistoricalRecallMarkingPolicy([fact]) : policy,
        ...(course === 'igcse' && !frozenHistorical
          ? { learningReviewPolicy: createRecallLearningReviewPolicy([fact]) }
          : {}),
      });
      controller.dispatch({ kind: 'pause' });
      controllerRef.current = controller;
      setAttempt(controller.state());
      setQuestion(q);
      setCurrentFact(fact);
      setHistorical(frozenHistorical);
      setCorrection(undefined);
      setFeedback(undefined);
    },
    [bank, course, policy],
  );
  const commitPrepared = useCallback(
    (value: PreparedRecall) => {
      needsDestinationFocus.current = true;
      const detach = detachTiming.current;
      detachTiming.current = null;
      detach?.();
      preferencesRef.current = value.preferences;
      preferencesDirty.current = false;
      setPreferences(value.preferences);
      setScope(value.scope);
      setProgress(value.progress);
      setReady(true);
      setMessage('');
      controllerRef.current = null;
      setAttempt(null);
      setQuestion(null);
      setCurrentFact(null);
      setFlashcards(false);
      setVisibleCardId(null);
      teacherTraversal.current = null;
      const destination = value.destination;
      if (destination.kind === 'test') {
        setCurrentSession(destination.session);
        mount(destination.attempt);
        setSaveStatus({ kind: 'saved' });
      } else if (destination.kind === 'teacher') {
        setCurrentFact(destination.fact);
        setHistorical(destination.historical);
        setQuestion(
          createRecallProvider([destination.fact], course).restore(
            recallRef(course, destination.fact.id),
          ),
        );
        teacherTraversal.current = { factIds: destination.factIds, index: destination.index };
      } else if (destination.kind === 'flashcards') {
        setFlashcardCheckpoint(destination.checkpoint);
        setFlashcardFresh(destination.fresh);
        setFlashcards(true);
      } else if (destination.kind === 'completed') {
        setCurrentSession(destination.session);
        completion.current?.();
      }
    },
    [mount, course],
  );
  useLayoutEffect(() => {
    if (prepared) commitPrepared(prepared);
  }, [prepared, commitPrepared]);
  useEffect(() => {
    alive.current = true;
    let retiringFlashDrain: (() => Promise<unknown>) | null = null;
    const release = provided
      ? undefined
      : repositoryLifetime.current.retain(repository, async () => {
          await Promise.allSettled([queue.current, retiringFlashDrain?.() ?? Promise.resolve()]);
        });
    if (!prepared)
      void loading.run(
        'screen',
        (ticket) =>
          prepareRecall({
            course,
            databaseName: database,
            ticket,
            repository,
            profileId,
            ...(gemIds ? { gemIds } : {}),
            mode,
            ...(reviewFact ? { reviewFact } : {}),
            ...(flowSessionId ? { flowSessionId } : {}),
            autoStart,
          }),
        commitPrepared,
      );
    return () => {
      alive.current = false;
      freeze();
      retiringFlashDrain = flashDrain.current;
      release?.();
    };
  }, [repository]);
  useEffect(() => {
    if (loading.pending || loading.error || !ready) return;
    frozen.current = false;
    retainedPreferences.current = null;
    const controller = controllerRef.current;
    if (!controller || !attempt || mode === 'teacher') return;
    controller.interact(browserClockSample());
    const detach = bindBrowserAttemptTiming({
      controller,
      onCheckpoint: (state) => {
        void save(state);
      },
    });
    detachTiming.current = detach;
    return () => {
      if (detachTiming.current === detach) {
        detachTiming.current = null;
        detach();
      }
    };
  }, [loading.pending, loading.error, ready, attempt?.attemptId, save, mode]);
  useEffect(() => {
    if (loading.pending || loading.error || !ready || !needsDestinationFocus.current) return;
    needsDestinationFocus.current = false;
    const focus = requestAnimationFrame(() => {
      if (loading.snapshot().pending || loading.snapshot().error || !surface.current) return;
      const destination =
        surface.current.querySelector<HTMLElement>('[data-answer-input]') ??
        surface.current.querySelector<HTMLElement>('.fc-card') ??
        surface.current.querySelector<HTMLElement>('.fc-resume h2, .recall-header h1');
      if (destination) {
        if (!destination.matches('input, textarea, select, button, [tabindex]'))
          destination.tabIndex = -1;
        destination.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(focus);
  }, [loading.pending, loading.error, ready, question, flashcards]);
  const inputFor = (ticket: LoadingTicket) => ({
    course,
    databaseName: database,
    ticket,
    repository,
    profileId,
    ...(gemIds ? { gemIds } : {}),
    mode,
    ...(flowSessionId ? { flowSessionId } : {}),
    preferences: preferencesRef.current,
    scope,
  });
  const launch = async (
    launchMode: RecallMode,
    kind: RecallSession['kind'] = 'recall-practice',
  ) => {
    if (!ready || frozen.current || !selected.length) return;
    const value = rememberRecallLaunch(preferencesRef.current, launchMode, scope);
    await loading.run(
      'question',
      async (ticket) => {
        if (!(await pause())) throw Error('Your work could not be saved. Retry before continuing.');
        if (!(await ticket.persist(() => persistPreferences(value, true))))
          throw Error('Your recall selection could not be saved.');
        return prepareRecall({ ...inputFor(ticket), preferences: value, launchMode, kind });
      },
      commitPrepared,
    );
  };
  const start = (kind: RecallSession['kind']) => launch('test', kind);
  const chooseTopics = (ids: readonly string[]) => {
    if (frozen.current) return;
    const value = {
      ...preferencesRef.current,
      globalTopicIds: ids,
      lastScope: { kind: 'global' as const, topicIds: ids },
    };
    void loading.run(
      'question',
      async (ticket) => {
        if (!(await pause())) throw Error('Your selection could not be saved.');
        if (!(await ticket.persist(() => persistPreferences(value, true))))
          throw Error('Your selection could not be saved.');
        return value;
      },
      (value) => {
        setScope(value.lastScope);
        setPreferences(value);
      },
    );
  };
  const command = (command: AttemptCommand) => {
    if (frozen.current || loading.pending || loading.error) return;
    const controller = controllerRef.current;
    if (!controller) return;
    const result = controller.dispatch(command);
    if (!result.accepted) {
      setFeedback({ message: result.message });
      return;
    }
    setAttempt(result.state);
    setFeedback(undefined);
    setCorrection(result.correctionFeedback);
    if (result.state.phase === 'assessed' && sessionRef.current)
      setCurrentSession({
        ...sessionRef.current,
        submittedAttemptIds: [
          ...new Set([...sessionRef.current.submittedAttemptIds, result.state.attemptId]),
        ],
      });
    void save(result.state);
  };
  const advance = async () => {
    if (frozen.current) return;
    if (mode === 'teacher') {
      const preview = teacherTraversal.current;
      if (!preview) return;
      await loading.run(
        'question',
        async () => {
          const index = preview.index + 1,
            factId = preview.factIds[index];
          return { index, fact: factId ? bank.find((f) => f.id === factId)! : null };
        },
        (value) => {
          teacherTraversal.current = { ...preview, index: value.index };
          setQuestion(value.fact ? provider.restore(recallRef(course, value.fact.id)) : null);
          setCurrentFact(value.fact);
          if (!value.fact) setMessage('Teacher preview complete. Choose another set to preview.');
        },
      );
      return;
    }
    if (!attempt || attempt.phase !== 'assessed' || !sessionRef.current) return;
    const previous = attempt,
      current = {
        ...sessionRef.current,
        visitedFactIds: [
          ...new Set([...sessionRef.current.visitedFactIds, previous.target.factId]),
        ],
        currentAttemptId: null,
        currentFactId: null,
      };
    await loading.run(
      'question',
      async (ticket) => {
        if (!(await pause())) throw Error('Your work could not be saved. Retry before continuing.');
        return prepareRecall({ ...inputFor(ticket), currentSession: current });
      },
      commitPrepared,
    );
  };
  const home = () => onHome();
  const returnToChooser = async () => {
    if (frozen.current) return;
    await loading.run(
      'question',
      async () => {
        if (!(await pause())) throw Error('Your work could not be saved. Retry before continuing.');
      },
      () => {
        needsDestinationFocus.current = true;
        controllerRef.current = null;
        setQuestion(null);
        setAttempt(null);
        setCurrentFact(null);
        setFlashcards(false);
        setVisibleCardId(null);
        teacherTraversal.current = null;
      },
    );
  };
  const scopeTitle =
    scope.kind === 'gem'
      ? gemTitle || coverage.find((g) => g.gemId === scope.gemId)?.label || 'Key Factual Recall'
      : 'Selected content';
  const activeTopics = activeRecallTopics(course, bank);
  const globalTopicIds = scope.kind === 'global' ? scope.topicIds : preferences.globalTopicIds;
  const topicGroups: readonly (readonly [string, string])[] =
    course === 'alevel'
      ? [
          ['l6-physical-inorganic', 'Lower Sixth · Physical / Inorganic'],
          ['l6-organic', 'Lower Sixth · Organic'],
          ['u6-physical-inorganic', 'Upper Sixth · Physical / Inorganic'],
          ['u6-organic', 'Upper Sixth · Organic'],
        ]
      : [
          ['fourth', 'Fourth Form'],
          ['lower', 'Lower Fifth'],
          ['upper', 'Upper Fifth'],
        ];
  const branchGroup: Readonly<Record<string, string>> = {
    'l6-physical-inorganic': 'l6-t1',
    'l6-organic': 'l6-t2',
    'u6-physical-inorganic': 'u6-t1',
    'u6-organic': 'u6-t2',
  };
  const topicLabel = (topicId: string) => recallTopicMastery(namespace, bank, topicId, progress);
  return (
    <main
      ref={surface}
      className={'recall-view recall-' + course}
      aria-label={(course === 'alevel' ? 'A Level' : 'IGCSE') + ' Recall'}
    >
      <header className="recall-header">
        <div>
          <p className="eyebrow">
            Masters of Chemistry / {course === 'alevel' ? 'A Level' : 'IGCSE'}
          </p>
          <h1>{flashcards ? 'Flashcards' : question ? 'Mastery Test' : 'Factual Recall'}</h1>
        </div>
        <QuestionHeaderActions
          course={course}
          activityId={course + '/recall'}
          {...((flashcards ? visibleCardId : question?.ref.questionId)
            ? { questionId: (flashcards ? visibleCardId : question?.ref.questionId)! }
            : {})}
          onBack={() =>
            void (reviewFact ? home() : flashcards || question ? returnToChooser() : home())
          }
          backLabel={
            !reviewFact && (flashcards || question) ? 'Back to Recall' : 'Back to course map'
          }
          disabled={busy}
        />
      </header>
      {message && <p role="alert">{message}</p>}

      {ready && !question && !flashcards && (
        <section className="recall-selection">
          {!flowSessionId && (
            <div className="recall-mode-choice" aria-label="Recall mode">
              {mode !== 'teacher' && (
                <button
                  aria-label="Flashcards"
                  className={preferences.mode === 'flashcards' ? 'is-preferred' : ''}
                  disabled={busy || !selected.length}
                  onClick={() => void launch('flashcards')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-collection-fill"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3m2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1" />
                  </svg>
                  <strong>Flashcards</strong>
                </button>
              )}
              <button
                aria-label={mode === 'teacher' ? 'Teacher preview' : 'Mastery Test'}
                className={preferences.mode === 'test' ? 'is-preferred' : ''}
                disabled={busy || !selected.length}
                onClick={() => void launch('test')}
              >
                <RecallIcon />
                <strong>{mode === 'teacher' ? 'Teacher preview' : 'Mastery Test'}</strong>
              </button>
            </div>
          )}
          {(gemIds || scope.kind === 'gem' || flowSessionId) && (
            <h2>{flowSessionId ? gemTitle || 'Key Factual Recall' : scopeTitle}</h2>
          )}
          {!flowSessionId && !gemIds && (
            <div className="recall-content-selection">
              <div className="recall-chosen" aria-label="Selected recall topics">
                {activeTopics
                  .filter((t) => globalTopicIds.includes(t.id))
                  .map((topic) => {
                    const mastery = topicLabel(topic.id);
                    return (
                      <button
                        key={topic.id}
                        data-recall-topic={topic.id}
                        data-recall-colour={mastery.colour}
                        title={mastery.label}
                        aria-label={'Remove ' + topic.title + ' · ' + mastery.label}
                        onClick={() => chooseTopics(globalTopicIds.filter((id) => id !== topic.id))}
                      >
                        {topic.title}
                        <span aria-hidden="true"> ×</span>
                      </button>
                    );
                  })}
              </div>
              <details className="recall-content-menu">
                <summary>+ Choose Content</summary>
                <div className="recall-content-dropdown">
                  <div className="recall-add-controls">
                    <button
                      aria-pressed={allRecallTopicsSelected(
                        globalTopicIds,
                        activeTopics.map((t) => t.id),
                      )}
                      onClick={() =>
                        chooseTopics(
                          toggleRecallTopics(
                            globalTopicIds,
                            activeTopics.map((t) => t.id),
                          ),
                        )
                      }
                    >
                      ADD ALL topics
                    </button>
                    <button onClick={() => chooseTopics([])}>Clear selection</button>
                    {scope.kind === 'gem' && (
                      <button onClick={() => chooseTopics(preferencesRef.current.globalTopicIds)}>
                        Use saved topics
                      </button>
                    )}
                  </div>
                  <div className="recall-topic-groups">
                    {topicGroups
                      .filter(([batchId]) => activeTopics.some((t) => t.batchId === batchId))
                      .map(([batchId, title]) => (
                        <fieldset
                          key={batchId}
                          style={
                            {
                              '--recall-branch-colour': catalogues[course].groups.find(
                                (group) => group.key === (branchGroup[batchId] ?? batchId),
                              )?.colour,
                            } as CSSProperties
                          }
                        >
                          <legend>
                            <span>{title}</span>
                            <button
                              aria-label={'Add all ' + title}
                              aria-pressed={allRecallTopicsSelected(
                                globalTopicIds,
                                activeTopics.filter((t) => t.batchId === batchId).map((t) => t.id),
                              )}
                              onClick={() =>
                                chooseTopics(
                                  toggleRecallTopics(
                                    globalTopicIds,
                                    activeTopics
                                      .filter((t) => t.batchId === batchId)
                                      .map((t) => t.id),
                                  ),
                                )
                              }
                            >
                              ADD ALL
                            </button>
                          </legend>
                          <div className="recall-topics">
                            {activeTopics
                              .filter((t) => t.batchId === batchId)
                              .map((topic) => {
                                const mastery = topicLabel(topic.id);
                                return (
                                  <button
                                    type="button"
                                    key={topic.id}
                                    data-recall-topic={topic.id}
                                    data-recall-colour={mastery.colour}
                                    title={mastery.label}
                                    aria-pressed={globalTopicIds.includes(topic.id)}
                                    onClick={() =>
                                      chooseTopics(
                                        globalTopicIds.includes(topic.id)
                                          ? globalTopicIds.filter((id) => id !== topic.id)
                                          : addRecallTopics(globalTopicIds, [topic.id]),
                                      )
                                    }
                                  >
                                    <svg
                                      className="recall-topic-gem"
                                      viewBox="-13 -16 26 32"
                                      role="img"
                                      aria-label={mastery.label}
                                    >
                                      <GemPaths />
                                    </svg>
                                    <span>
                                      {topic.title}
                                      <small>
                                        {mastery.factCount}{' '}
                                        {mastery.factCount === 1 ? 'fact' : 'facts'}
                                      </small>
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </fieldset>
                      ))}
                  </div>
                </div>
              </details>
            </div>
          )}
          <p className="recall-selection-count" role="status">
            {selected.length} {selected.length === 1 ? 'fact' : 'facts'} · {due} due now
          </p>
          {flowSessionId && (
            <button
              disabled={busy || !selected.length}
              onClick={() => void start('recall-practice')}
            >
              Test whole set / resume
            </button>
          )}
          {!selected.length && (
            <p>No active facts in this selection. Add another topic to begin.</p>
          )}
          {session?.status === 'complete' && (
            <p role="status">This recall set is complete for this session.</p>
          )}
          {saveStatus.kind === 'error' && (
            <button onClick={() => void persistPreferences(preferencesRef.current)}>
              Retry saving selection
            </button>
          )}
        </section>
      )}

      {flashcards && (
        <>
          <RecallFlashcards
            facts={selected}
            preparedCheckpoint={flashcardCheckpoint}
            preparedFreshDeck={flashcardFresh}
            namespace={namespace}
            scope={scope}
            repository={repository}
            mode={mode}
            onVisibleCardIdChange={setVisibleCardId}
            onRegisterLeaveGuard={(guard: FlashcardLeaveGuard | null) => {
              flashLeaveGuard.current = guard;
            }}
            onRegisterDrain={(drain) => {
              flashDrain.current = drain;
            }}
          />
        </>
      )}
      {question && currentFact && (attempt || mode === 'teacher') && (
        <>
          {course === 'igcse' && !historical ? (
            <RecallTestPlayer
              fact={currentFact}
              question={question}
              attempt={
                mode === 'teacher'
                  ? { mode: 'teacher', ref: question.ref, currentResponses: {} }
                  : attempt!
              }
              onCommand={command}
              onNext={() => void advance()}
              saveStatus={saveStatus}
              onRetrySave={() => {
                if (controllerRef.current) void save(controllerRef.current.checkpoint());
              }}
              canNext={!busy && saveStatus.kind !== 'error'}
              {...(feedback ? { feedback } : {})}
              {...(correction ? { correctionFeedback: correction } : {})}
            />
          ) : (
            <QuestionPlayer
              question={question}
              attempt={
                mode === 'teacher'
                  ? { mode: 'teacher', ref: question.ref, currentResponses: {} }
                  : attempt!
              }
              onCommand={command}
              onNext={() => void advance()}
              saveStatus={saveStatus}
              onRetrySave={() => {
                if (controllerRef.current) void save(controllerRef.current.checkpoint());
              }}
              canNext={!busy && saveStatus.kind !== 'error'}
              presentation="standard"
              recallPresentation
              {...(feedback ? { feedback } : {})}
              {...(correction ? { correctionFeedback: correction } : {})}
            />
          )}
          <div className="action-row">
            {mode === 'teacher' && !reviewFact && (
              <button disabled={busy} onClick={() => void advance()}>
                Next
              </button>
            )}
          </div>
          {attempt?.phase === 'assessed' &&
            !(
              attempt.firstAssessment.kind === 'marked' &&
              attempt.firstAssessment.score === 1 &&
              !attempt.firstResponse.assistance.length &&
              saveStatus.kind === 'saved'
            ) && (
              <p role="status">
                {attempt.firstAssessment.kind === 'revealed' ||
                attempt.firstResponse.assistance.length
                  ? 'Assisted recall stays due; no success recorded.'
                  : attempt.firstAssessment.kind === 'marked' && attempt.firstAssessment.score === 1
                    ? 'Independent recall checked. Save is pending.'
                    : 'This fact remains due now.'}
              </p>
            )}
        </>
      )}
    </main>
  );
}
