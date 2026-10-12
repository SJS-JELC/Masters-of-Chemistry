import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Course, Namespace } from '../contracts/identity.ts';
import { CURRENT_RECALL_DEFINITION_ID } from '../contracts/recall.ts';
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
import { createActiveClock } from '../domain/timing/active-clock.ts';
import { bindBrowserAttemptTiming } from '../domain/timing/browser-binding.ts';
import { QuestionPlayer, type SaveStatus, type PlayerFeedback } from '../ui/QuestionPlayer.tsx';
import { factsFor, recallCoverage } from './facts.ts';
import { createRecallProvider, recallRef } from './provider.ts';
import { createRecallMarkingPolicy, createRecallLearningReviewPolicy } from './marking.ts';
import { createRecallSession, selectRecallFact } from './scheduler.ts';
import { RecallTestPlayer } from './RecallTestPlayer.tsx';
import { RecallFlashcards } from './RecallFlashcards.tsx';
import {
  createHistoricalRecallMarkingPolicy,
  historicalRecallFields,
} from './historical-marking.ts';
import { historicalRecallFact, recallAttemptRestoreDisposition } from './compatibility.ts';
import {
  factsForRecallScope,
  topicsFor,
  rememberRecallLaunch,
  type RecallLaunchScope,
  type RecallPreferences,
  type RecallMode,
} from './session-contract.ts';
import {
  initialRecallPreferences,
  recallTestSessionId,
  reconcileRecallTestSession,
  addRecallTopics,
  toggleRecallTopics,
  allRecallTopicsSelected,
  activeRecallTopics,
  recallTopicMastery,
} from './recall-hub.ts';
import { QuestionHeaderActions } from '../shell/QuestionChrome.tsx';
import { catalogues } from '../landing/catalogue.ts';
import type { CSSProperties } from 'react';
import { RecallIcon } from '../landing/RecallIcon.tsx';
import { GemPaths } from '../landing/GemPaths.tsx';
import './recall.css';
export interface RecallViewProps {
  readonly course: Course;
  readonly onHome: () => void;
  readonly profileId?: string;
  readonly gemIds?: readonly string[];
  readonly gemTitle?: string;
  readonly repository?: ChemistryRepository;
  readonly databaseName?: string;
  readonly mode?: 'student' | 'teacher';
  readonly onRegisterLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
  readonly flowSessionId?: string;
  readonly autoStart?: boolean;
  /** Exact compatibility lookup is teacher-only, including frozen retired definitions. */
  readonly reviewFact?: Readonly<{factId: string; historical: boolean}>;
  /** Called only after the completed whole-set session has durably saved. */
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
  mode = 'student',
  onRegisterLeaveGuard,
  flowSessionId,
  autoStart = false,
  reviewFact,
  onComplete,
}: RecallViewProps) {
  const autoStarted = useRef<string | null>(null);
  const completion = useRef(onComplete);
  completion.current = onComplete;
  const namespace = useMemo<Namespace>(() => ({ course, profileId }), [course, profileId]);
  const run =
    (import.meta.env.DEV ? new URL(location.href).searchParams.get('run') || 'local' : 'local')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 60) || 'manual';
  const repository = useMemo(
    () => provided ?? createChemistryRepository(databaseName ?? alphaDatabaseName(course, run)),
    [provided, databaseName, course, run],
  );
  const bank = useMemo(() => factsFor(course), [course]),
    coverage = useMemo(() => recallCoverage(course), [course]);
  const provider = useMemo(() => createRecallProvider(bank, course), [bank, course]);
  const policy = useMemo(() => createRecallMarkingPolicy(bank), [bank]);
  const [preferences, setPreferences] = useState<RecallPreferences>(() =>
    initialRecallPreferences(namespace),
  );
  const preferencesRef = useRef(preferences);
  const preferencesDirty = useRef(false);
  const [scope, setScope] = useState<RecallLaunchScope>(() =>
    gemIds?.length === 1 ? { kind: 'gem', gemId: gemIds[0]! } : preferences.lastScope,
  );
  const [ready, setReady] = useState(false);
  const [flashcards, setFlashcards] = useState(false);
  const [visibleCardId, setVisibleCardId] = useState<string | null>(null);
  const flashLeaveGuard = useRef<(() => Promise<boolean>) | null>(null);
  const [currentFact, setCurrentFact] = useState<RecallFact | null>(null);
  const [historical, setHistorical] = useState(false);
  const selection = gemIds?.length ? gemIds : scope.kind === 'gem' ? [scope.gemId] : null;
  const [progress, setProgress] = useState<readonly RecallProgress[]>([]);
  const [session, setSession] = useState<RecallSession | null>(null),
    sessionRef = useRef<RecallSession | null>(null);
  const [attempt, setAttempt] = useState<RecallAttempt | null>(null),
    controllerRef = useRef<AttemptController<RecallAttempt> | null>(null);
  const [question, setQuestion] = useState<Question | null>(null),
    [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [feedback, setFeedback] = useState<PlayerFeedback | undefined>(),
    [correction, setCorrection] = useState<CorrectionFeedback | undefined>();
  const teacherTraversal = useRef<{ factIds: readonly string[]; index: number } | null>(null);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const liveRepository = useRef<ChemistryRepository | null>(null);
  const selected =
      gemIds && gemIds.length > 1
        ? factsFor(course, gemIds)
        : factsForRecallScope(bank, course, scope),
    due = selected.filter(
      (f) => (progress.find((p) => p.factId === f.id)?.dueAt ?? 0) <= Date.now(),
    ).length;
  const setCurrentSession = (value: RecallSession | null) => {
    sessionRef.current = value;
    setSession(value);
  };
  const refresh = useCallback(async () => {
    const p = await repository.recallProgress(namespace);
    if (p.ok) setProgress(p.value);
    else setMessage(p.error.message);
  }, [repository, namespace]);
  useEffect(() => {
    liveRepository.current = repository;
    void refresh();
    return () => {
      liveRepository.current = null;
      if (!provided)
        void queue.current.finally(() => {
          // StrictMode immediately reuses this connection; only a real departure closes it.
          if (liveRepository.current !== repository) repository.close?.();
        });
    };
  }, [refresh, repository, provided]);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    controllerRef.current = null;
    setAttempt(null);
    setQuestion(null);
    setFlashcards(false);
    setVisibleCardId(null);
    setCurrentFact(null);
    setCurrentSession(null);
    teacherTraversal.current = null;
    autoStarted.current = null;
    void repository.loadRecallPreferences(namespace).then((result) => {
      if (cancelled) return;
      const value = result.ok && result.value ? result.value : initialRecallPreferences(namespace);
      preferencesRef.current = value;
      setPreferences(value);
      setScope(gemIds?.length === 1 ? { kind: 'gem', gemId: gemIds[0]! } : value.lastScope);
      if (!result.ok) setMessage(result.error.message);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [repository, namespace, gemIds?.join(',')]);
  const persistPreferences = useCallback(
    async (value: RecallPreferences) => {
      preferencesDirty.current = true;
      preferencesRef.current = value;
      setPreferences(value);
      setSaveStatus({ kind: 'saving' });
      const operation = queue.current
        .catch(() => {})
        .then(() => repository.saveRecallPreferences(value));
      queue.current = operation;
      const result = await operation;
      setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
      if (!result.ok) setMessage(result.error.message);
      if (result.ok && preferencesRef.current === value) {
        preferencesDirty.current = false;
        setMessage('');
      }
      return result.ok;
    },
    [repository],
  );
  const chooseTopics = (ids: readonly string[]) => {
    const value = {
      ...preferencesRef.current,
      globalTopicIds: ids,
      lastScope: { kind: 'global' as const, topicIds: ids },
    };
    setScope(value.lastScope);
    void persistPreferences(value);
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
      // Timing disposal can checkpoint the previous attempt after Next has moved the
      // session pointer. Persist that attempt alone; never pair it with or rewind the new session.
      const sessionForAttempt =
        current?.currentAttemptId === state.attemptId &&
        current.currentFactId === state.target.factId &&
        current.namespace.course === state.namespace.course &&
        current.namespace.profileId === state.namespace.profileId
          ? current
          : null;
      const isVisibleAttempt = () => controllerRef.current?.state().attemptId === state.attemptId;
      if (isVisibleAttempt()) setSaveStatus({ kind: 'saving' });
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
        if (isVisibleAttempt())
          setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
        if (result.ok && result.value.evidence !== 'none') void refresh();
      });
      return operation;
    },
    [repository, mode, refresh],
  );
  const mount = useCallback(
    (state: RecallAttempt) => {
      const disposition = recallAttemptRestoreDisposition(state, bank);
      if (disposition.kind === 'fresh') throw Error('This answer format needs a fresh attempt.');
      const fact = disposition.fact;
      const frozenHistorical = disposition.kind === 'history' && state.definitionId === undefined;
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
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || !attempt || mode === 'teacher') return;
    return bindBrowserAttemptTiming({
      controller,
      onCheckpoint: (state) => {
        void save(state);
      },
    });
  }, [attempt?.attemptId, save, mode]);
  const next = useCallback(
    async (current: RecallSession, freshFactId?: string) => {
      const result = await repository.recallProgress(namespace);
      const records = result.ok ? result.value : progress;
      const id =
        freshFactId && current.factIds.includes(freshFactId)
          ? freshFactId
          : selectRecallFact(current, records, Date.now());
      if (!id) {
        const completed = {
          ...current,
          status: 'complete' as const,
          currentAttemptId: null,
          currentFactId: null,
        };
        const saved = await repository.saveRecallSession(completed);
        if (!saved.ok) {
          setMessage(saved.error.message);
          return;
        }
        setCurrentSession(completed);
        controllerRef.current = null;
        setAttempt(null);
        setQuestion(null);
        completion.current?.();
        return;
      }
      const ref = recallRef(course, id),
        attemptId = crypto.randomUUID();
      const state: RecallAttempt = {
        mode: 'student',
        definitionId: CURRENT_RECALL_DEFINITION_ID,
        namespace,
        attemptId,
        ref,
        target: { kind: 'recall', course, activityId: ref.activityId, factId: id, level: 1 },
        currentResponses: {},
        assistance: [],
        phase: 'answering',
        timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
      };
      const updated = {
        ...current,
        currentAttemptId: attemptId,
        currentFactId: id,
        status: 'active' as const,
      };
      setCurrentSession(updated);
      mount(state);
      await save(state, updated);
    },
    [repository, namespace, progress, course, mount, save],
  );
  useEffect(() => {
    if (!ready || mode !== 'teacher' || !reviewFact) return;
    const fact = reviewFact.historical ? historicalRecallFact(course, reviewFact.factId) : bank.find(f => f.id === reviewFact.factId);
    if (!fact) { setMessage('This question is unavailable for review.'); return; }
    teacherTraversal.current = null;
    setCurrentFact(fact);
    setHistorical(reviewFact.historical);
    setQuestion(createRecallProvider([fact], course).restore(recallRef(course, fact.id)));
  }, [ready, mode, reviewFact?.factId, reviewFact?.historical, course, bank]);
  const start = async (kind: RecallSession['kind']) => {
    if (!selected.length) return;
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'teacher') {
        teacherTraversal.current = { factIds: selected.map((fact) => fact.id), index: 0 };
        setCurrentFact(selected[0]!);
        setHistorical(false);
        setQuestion(provider.restore(recallRef(course, selected[0]!.id)));
        return;
      }
      const id = flowSessionId ?? recallTestSessionId(namespace, scope, kind);
      let stored = await repository.loadRecallSession(namespace, id);
      // Read pre-amendment whole-bank/gem queues without overwriting their saved records.
      if (stored.ok && !stored.value && !flowSessionId) {
        const legacyId =
          'recall:' +
          kind +
          ':' +
          (selection === null ? 'global' : [...selection].sort().join(','));
        const legacy = await repository.loadRecallSession(namespace, legacyId);
        if (!legacy.ok) stored = legacy;
        else if (
          legacy.value &&
          (selection !== null ||
            (scope.kind === 'global' && scope.topicIds.length === topicsFor(course).length))
        )
          stored = { ok: true, value: { ...legacy.value, id } };
      }
      if (!stored.ok) {
        setMessage(stored.error.message);
        return;
      }
      if (flowSessionId && stored.value?.status === 'complete') {
        setCurrentSession(stored.value);
        completion.current?.();
        return;
      }
      const reconciled = stored.value
        ? reconcileRecallTestSession(stored.value, course, bank, selected, scope)
        : null;
      const restoredSession =
        reconciled && gemIds && gemIds.length > 1
          ? (() => {
              const { scope: _scope, ...legacy } = reconciled;
              return legacy;
            })()
          : reconciled;
      if (restoredSession?.currentAttemptId && restoredSession.status !== 'complete') {
        const resumed = await repository.loadRecallAttempt(
          namespace,
          restoredSession.currentAttemptId,
        );
        if (!resumed.ok) {
          setMessage(resumed.error.message);
          return;
        }
        if (!resumed.value) {
          setMessage('The saved recall attempt is missing. Its session was preserved for review.');
          return;
        }
        const current = { ...restoredSession, status: 'active' as const };
        const disposition = recallAttemptRestoreDisposition(resumed.value, bank);
        if (disposition.kind === 'fresh') {
          setMessage(
            'The saved response format has changed. Your earlier attempt is preserved; this question starts a fresh attempt.',
          );
          await next(
            { ...current, currentAttemptId: null, currentFactId: null },
            resumed.value.target.factId,
          );
          return;
        }
        const state =
          disposition.kind === 'resume'
            ? { ...resumed.value, definitionId: disposition.definitionId }
            : resumed.value;
        setCurrentSession(current);
        mount(state);
        await save(state, current);
        return;
      }
      const current: RecallSession =
        restoredSession && restoredSession.status !== 'complete'
          ? { ...restoredSession, status: 'active' }
          : {
              ...createRecallSession(
                namespace,
                id,
                kind,
                selected.map((f) => f.id),
                selection,
              ),
              mode: 'test',
              ...(gemIds && gemIds.length > 1 ? {} : { scope }),
            };
      setCurrentSession(current);
      await next(current);
    } finally {
      setBusy(false);
    }
  };
  const startRef = useRef(start);
  startRef.current = start;
  useEffect(() => {
    if (
      !ready ||
      !autoStart ||
      !flowSessionId ||
      mode !== 'student' ||
      autoStarted.current === flowSessionId
    )
      return;
    autoStarted.current = flowSessionId;
    void startRef.current('recall-practice');
  }, [ready, autoStart, flowSessionId, mode]);
  const pause = useCallback(async () => {
    const controller = controllerRef.current,
      current = sessionRef.current;
    if (flashLeaveGuard.current && !(await flashLeaveGuard.current())) return false;
    await queue.current.catch(() => {});
    if (preferencesDirty.current && !(await persistPreferences(preferencesRef.current)))
      return false;
    if (mode === 'teacher' || !controller || !current) return true;
    controller.dispatch({ kind: 'pause' });
    const paused = { ...current, status: 'paused' as const };
    setCurrentSession(paused);
    const result = await save(controller.checkpoint(), paused);
    return result.ok;
  }, [mode, save, persistPreferences]);
  useEffect(() => {
    onRegisterLeaveGuard?.(pause);
    return () => onRegisterLeaveGuard?.(null);
  }, [onRegisterLeaveGuard, pause]);
  const command = (command: AttemptCommand) => {
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
    if (result.state.phase === 'assessed' && sessionRef.current) {
      setCurrentSession({
        ...sessionRef.current,
        submittedAttemptIds: [
          ...new Set([...sessionRef.current.submittedAttemptIds, result.state.attemptId]),
        ],
      });
    }
    void save(result.state);
  };
  const advance = async () => {
    if (mode === 'teacher') {
      const preview = teacherTraversal.current;
      if (!preview || busy) return;
      const index = preview.index + 1;
      const factId = preview.factIds[index];
      teacherTraversal.current = { ...preview, index };
      setQuestion(factId ? provider.restore(recallRef(course, factId)) : null);
      setCurrentFact(factId ? bank.find((f) => f.id === factId)! : null);
      if (!factId) setMessage('Teacher preview complete. Choose another set to preview.');
      return;
    }
    if (!attempt || attempt.phase !== 'assessed' || !sessionRef.current || busy) return;
    setBusy(true);
    try {
      const stored = await save(controllerRef.current!.checkpoint());
      if (!stored.ok) return;
      const current = {
        ...sessionRef.current,
        visitedFactIds: [...new Set([...sessionRef.current.visitedFactIds, attempt.target.factId])],
        currentAttemptId: null,
        currentFactId: null,
      };
      await next(current);
    } finally {
      setBusy(false);
    }
  };
  const home = async () => {
    if (await pause()) onHome();
  };
  const launch = async (
    launchMode: RecallMode,
    kind: RecallSession['kind'] = 'recall-practice',
  ) => {
    if (!ready || busy || !selected.length) return;
    if (
      !(await persistPreferences(rememberRecallLaunch(preferencesRef.current, launchMode, scope)))
    )
      return;
    if (launchMode === 'flashcards') setFlashcards(true);
    else await start(kind);
  };
  const returnToChooser = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!(await pause())) return;
      // Keep the consumed auto-start token and flow session so explicit Resume
      // returns to the same parent mastery step without immediately relaunching.
      controllerRef.current = null;
      setQuestion(null);
      setAttempt(null);
      setCurrentFact(null);
      setFlashcards(false);
      setVisibleCardId(null);
      teacherTraversal.current = null;
    } finally {
      setBusy(false);
    }
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
          onBack={() => void (reviewFact ? home() : flashcards || question ? returnToChooser() : home())}
          backLabel={!reviewFact && (flashcards || question) ? 'Back to Recall' : 'Back to course map'}
          disabled={busy}
        />
      </header>
      {message && <p role="alert">{message}</p>}
      {!ready && <p role="status">Loading your recall selection…</p>}
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
                      aria-pressed={allRecallTopicsSelected(globalTopicIds, activeTopics.map(t => t.id))}
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
                              aria-pressed={allRecallTopicsSelected(globalTopicIds, activeTopics.filter(t => t.batchId === batchId).map(t => t.id))}
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
            namespace={namespace}
            scope={scope}
            repository={repository}
            onVisibleCardIdChange={setVisibleCardId}
            onRegisterLeaveGuard={(guard: (() => Promise<boolean>) | null) => {
              flashLeaveGuard.current = guard;
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
            !(attempt.firstAssessment.kind === 'marked' &&
              attempt.firstAssessment.score === 1 &&
              !attempt.firstResponse.assistance.length &&
              saveStatus.kind === 'saved') && (
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
