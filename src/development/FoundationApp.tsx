import { alphaDatabaseName } from '../persistence/alpha-namespace.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from '../contracts/index.ts';
import { activityDefinitions } from '../catalogue/definitions.ts';
import { createRegistry } from '../catalogue/registry.ts';
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
import { createRepository } from '../persistence/repository.ts';
import { CourseShell } from '../shell/CourseShell.tsx';
import { QuestionPlayer } from '../ui/QuestionPlayer.tsx';
import type { SaveStatus, PlayerFeedback } from '../ui/QuestionPlayer.tsx';
import {
  createFixtureProvider,
  fixtureMarking,
  fixtureLearningReview,
  fixtureKinds,
  fixtureKind,
  fixtureQuestion,
  fixtureRef,
  wrongMolecule,
} from './fixtures.ts';
import type { FixtureKind } from './fixtures.ts';

interface FoundationSnapshot {
  readonly attempt: StudentAttempt | null;
  readonly session: CurriculumSession | null;
  readonly question: Question | null;
  readonly history: readonly CurriculumEvidence[];
  readonly saveStatus: SaveStatus;
  readonly databaseName: string;
  readonly selectedCount: number;
  readonly correctionFeedback: CorrectionFeedback | undefined;
}
export interface FoundationHarness {
  readonly snapshot: () => FoundationSnapshot;
  readonly flush: () => Promise<void>;
  readonly history: () => Promise<readonly CurriculumEvidence[]>;
  readonly persistenceScenarios: () => Promise<object>;
  readonly respond: (partId: string, response: Responses[string]) => Promise<void>;
  readonly checkpoint: () => Promise<void>;
}
declare global {
  interface Window {
    __mastersFoundation?: FoundationHarness;
  }
}

/** DEV entry only. Synthetic providers exercise actual shared layers; no production bank is replaced. */
export function FoundationApp({ course }: { readonly course: Course }) {
  const query = useMemo(() => new URLSearchParams(location.search), []);
  const run =
    (query.get('run') || 'manual').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60) || 'manual';
  const databaseName = alphaDatabaseName(course, 'dev-controls-' + run);
  const namespace = useMemo(() => ({ course, profileId: 'development-fixture-profile' }), [course]);
  const fault = useRef(false);
  const repository = useMemo(
    () =>
      createRepository(databaseName, (point) => {
        if (fault.current && point === 'after-attempt')
          throw new DOMException('Injected development save failure', 'QuotaExceededError');
      }),
    [databaseName],
  );
  const [kind, setKind] = useState<FixtureKind>(fixtureKind(query.get('fixture')));
  const [preview, setPreview] = useState(query.get('mode') === 'teacher');
  const [sessionMode, setSessionMode] = useState<'practice' | 'revision'>(
    query.get('session') === 'revision' ? 'revision' : 'practice',
  );
  const [attempt, setAttempt] = useState<StudentAttempt | null>(null);
  const [session, setSession] = useState<CurriculumSession | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<readonly CurriculumEvidence[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [feedback, setFeedback] = useState<PlayerFeedback | undefined>();
  const [correctionFeedback, setCorrectionFeedback] = useState<CorrectionFeedback | undefined>();
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [clockDisplay, setClockDisplay] = useState(0);
  const stateRef = useRef<StudentAttempt | null>(null),
    sessionRef = useRef<CurriculumSession | null>(null),
    controllerRef = useRef<AttemptController | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pendingCommands = useRef(new Set<Promise<void>>());
  const mounted = useRef(true);
  const registry = useMemo(
    () =>
      createRegistry(
        activityDefinitions.flatMap((definition) => {
          if (definition.strand !== 'curriculum') return [];
          const levels = [...new Set(definition.gems.flatMap((gem) => gem.supportedLevels))];
          return [
            {
              id: definition.id,
              provider: async () => createFixtureProvider(definition.id, kind, levels),
              marking: async () => fixtureMarking,
              idleAllowance: () => 60000 as const,
              idleRationale:
                'Development fixture uses the tested one-minute source allowance; actual activity adapters retain source-specific allowances.',
            },
          ];
        }),
      ),
    [kind],
  );
  const registrations = registry.curriculumFor(course);
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
  const target =
    allTargets.find((item) => `${item.gemId}:${item.level}` === targetKey) || allTargets[0];
  const [selected, setSelected] = useState<readonly CurriculumTarget[]>([]);
  const [failureShown, setFailureShown] = useState(false);
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
    setQuestion(fixtureQuestion(value.ref));
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
        if (!mounted.current) return;
        setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
        if (result.ok && evidence) await loadHistory();
      });
      return queue.current;
    },
    [repository, loadHistory],
  );
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    void (async () => {
      await loadHistory();
      const loaded = await repository.loadSession(namespace, 'development-session');
      if (cancelled) return;
      if (!loaded.ok) {
        setSaveStatus({ kind: 'error', error: loaded.error });
        setLoading(false);
        return;
      }
      if (loaded.value) {
        applySession(loaded.value);
        setSessionMode(loaded.value.kind);
        const id =
          loaded.value.kind === 'revision'
            ? loaded.value.current?.attemptId
            : loaded.value.currentAttemptId;
        if (id) {
          const result = await repository.loadAttempt(namespace, id);
          if (!cancelled && result.ok && result.value) {
            applyAttempt(result.value);
            setSaveStatus({ kind: 'saved' });
            setPaused(loaded.value.kind === 'revision' && loaded.value.status === 'paused');
          }
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [repository, namespace, loadHistory, applySession, applyAttempt]);
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
    const controller = createAttemptController({
      question: fixtureQuestion(value.ref),
      state: value,
      policy: fixtureMarking,
      learningReviewPolicy: fixtureLearningReview,
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
      applySession(nextSession);
      applyAttempt(value);
      setPaused(false);
      setFeedback(undefined);
      await save(value, nextSession);
    },
    [applySession, applyAttempt, save],
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
      timing: { attemptId, activeMs: 0, idleLimitMs: 60000, finished: false },
    }),
    [namespace],
  );
  const start = async () => {
    if (!target || preview) return;
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
        id: 'development-session',
        selected,
        settings: registrations.flatMap((a) => a.gems.map((g) => g.mastery)),
        summaries: states,
        now: Date.now(),
      });
      const next = revisionScheduler.next(initial, states, Date.now(), id);
      if (!next.current) return;
      const ref = fixtureRef(next.current.target, kind, seed),
        bound = bindRevisionQuestion(next, ref);
      await adopt(fresh(ref, next.current.target, id), bound);
    } else {
      const initial = {
        kind: 'practice' as const,
        namespace,
        id: 'development-session',
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
    await queue.current;
    if (saveStatus.kind === 'error') return;
    const value = stateRef.current,
      current = sessionRef.current;
    if (!value || value.phase !== 'assessed' || !current) return;
    const id = crypto.randomUUID(),
      seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1,
      records = await loadHistory(),
      states = summaries(records);
    if (current.kind === 'revision') {
      const next = revisionScheduler.next(current, states, Date.now(), id);
      if (!next.current) {
        applySession(next);
        await repository.saveSession(next);
        return;
      }
      const ref = fixtureRef(next.current.target, kind, seed);
      await adopt(fresh(ref, next.current.target, id), bindRevisionQuestion(next, ref));
    } else {
      const registration = registry.get(current.target.activityId);
      if (!registration || registration.strand !== 'curriculum') return;
      const choice = selectPracticeQuestion({
        session: current,
        provider: await registration.provider(),
        seed,
        summaries: states,
      });
      if (choice)
        await adopt(
          fresh(
            { ...choice.ref, activityId: current.target.activityId },
            choice.session.target,
            id,
          ),
          { ...choice.session, currentAttemptId: id },
        );
    }
  };
  const resume = async () => {
    const current = sessionRef.current;
    if (current?.kind === 'revision') {
      const next = resumeRevisionSession(current);
      applySession(next);
      await repository.saveSession(next);
    }
    setPaused(false);
  };
  const retry = async () => {
    fault.current = false;
    setFailureShown(false);
    const value = stateRef.current;
    if (value) await save(value);
  };
  useEffect(() => {
    window.__mastersFoundation = {
      snapshot: () => ({
        attempt: stateRef.current,
        session: sessionRef.current,
        question: stateRef.current ? fixtureQuestion(stateRef.current.ref) : null,
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
      persistenceScenarios: async () => {
        const module = await import('../../validation/s1/persistence/browser-scenarios.ts');
        return module.runPersistenceScenarios();
      },
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
      delete window.__mastersFoundation;
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
  const previewQuestion = target ? fixtureQuestion(fixtureRef(target, kind, 0)) : null;
  const shownQuestion = preview ? previewQuestion : question;
  const shownAttempt =
    preview && previewQuestion
      ? { mode: 'teacher' as const, ref: previewQuestion.ref, currentResponses: {} }
      : attempt;
  const topics = [...new Set(registrations.flatMap((a) => a.gems.map((g) => g.topicId)))];
  return (
    <CourseShell
      course={course}
      registry={registry}
      {...(attempt ? { currentActivityId: attempt.ref.activityId } : {})}
      onSelectActivity={(activityId) => {
        const item = allTargets.find((t) => t.activityId === activityId);
        if (item) setTargetKey(`${item.gemId}:${item.level}`);
      }}
    >
      <section className="mode-notice">
        <strong>S1 foundation development harness</strong>
        <p>
          These synthetic controls test the real shared runtime. Source activity labels and levels
          are metadata; complete chemistry banks are migrated in later stages. This harness is
          absent from production builds.
        </p>
      </section>
      <section aria-label="Development fixture setup">
        <label>
          Fixture{' '}
          <select
            aria-label="Fixture"
            value={kind}
            onChange={(event) => setKind(fixtureKind(event.target.value))}
          >
            {fixtureKinds.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>{' '}
        <label>
          Target{' '}
          <select
            aria-label="Target"
            value={target ? `${target.gemId}:${target.level}` : ''}
            onChange={(event) => setTargetKey(event.target.value)}
          >
            {allTargets.map((item) => (
              <option key={`${item.gemId}:${item.level}`} value={`${item.gemId}:${item.level}`}>
                {item.gemId} · Level {item.level}
              </option>
            ))}
          </select>
        </label>{' '}
        <label>
          Session{' '}
          <select
            aria-label="Session"
            value={sessionMode}
            onChange={(event) =>
              setSessionMode(event.target.value === 'revision' ? 'revision' : 'practice')
            }
          >
            <option value="practice">Practice</option>
            <option value="revision">Revision</option>
          </select>
        </label>{' '}
        <button
          type="button"
          onClick={() => {
            setPreview((value) => !value);
          }}
        >
          {' '}
          {preview ? 'Return to student' : 'Teacher preview'}{' '}
        </button>{' '}
        <button type="button" onClick={() => void start()} disabled={loading || preview}>
          Start fixture
        </button>
        {sessionMode === 'revision' && (
          <div>
            <h3>Revision topic selection</h3>
            {topics.map((topic) => (
              <button
                type="button"
                key={topic}
                onClick={() => setSelected(topicTargets(registrations, course, topic))}
              >
                ADD ALL {topic}
              </button>
            ))}
            <p data-testid="selected-count">{selected.length} supported target levels selected</p>
          </div>
        )}
        <div className="action-row">
          <button
            type="button"
            onClick={() => {
              fault.current = !fault.current;
              setFailureShown(fault.current);
            }}
          >
            {failureShown ? 'Disable save failure' : 'Simulate save failure'}
          </button>
          <button type="button" onClick={() => void retry()}>
            Retry save
          </button>
          {paused && (
            <button type="button" onClick={() => void resume()}>
              Resume saved attempt
            </button>
          )}
        </div>
      </section>
      {paused && (
        <p role="status">Attempt paused. Resume preserves its question, answer and timing.</p>
      )}
      {shownQuestion && shownAttempt ? (
        <QuestionPlayer
          question={shownQuestion}
          attempt={shownAttempt}
          onCommand={(value) => void command(value)}
          onNext={() => void nextQuestion()}
          saveStatus={saveStatus}
          onRetrySave={() => void retry()}
          {...(feedback ? { feedback } : {})}
          {...(correctionFeedback ? { correctionFeedback } : {})}
          learningReviewEnabled={shownQuestion.parts.some((part) => part.kind === 'text')}
          canNext={!paused && saveStatus.kind !== 'error' && saveStatus.kind !== 'saving'}
          renderEditor={({ part, response, readOnly, onResponse }) =>
            part.kind === 'molecule' ? (
              <div>
                <p>
                  Development editor surface: semantic graph state only; the full checked chemical
                  editor is migrated later.
                </p>
                <p data-testid="editor-atoms">
                  {response?.kind === 'molecule' ? response.graph.atoms.length : 0} atoms
                </p>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() =>
                    onResponse({
                      kind: 'molecule',
                      graph: { atoms: [{ id: 1, element: 'C', x: 0, y: 0 }], bonds: [] },
                      history: [],
                    })
                  }
                >
                  Add carbon atom
                </button>
                <button type="button" disabled={readOnly} onClick={() => onResponse(wrongMolecule)}>
                  Set excessive-valence drawing
                </button>
              </div>
            ) : (
              <p>Editor adapter not migrated.</p>
            )
          }
        />
      ) : (
        <p>Choose a fixture and start; no attempt is created merely by rendering the page.</p>
      )}
      <section aria-label="Foundation evidence" className="scaffold">
        <p data-testid="evidence-count">{history.length} independent curriculum evidence records</p>
        <p data-testid="attempt-phase">Phase: {attempt?.phase || 'none'}</p>
        <p data-testid="active-time">Active time: {clockDisplay} ms</p>
        <p data-testid="attempt-id">Attempt: {attempt?.attemptId || 'none'}</p>
        <p data-testid="session-current">
          Session: {session?.kind || 'none'} {session?.kind === 'revision' ? session.status : ''}
        </p>
      </section>
    </CourseShell>
  );
}
