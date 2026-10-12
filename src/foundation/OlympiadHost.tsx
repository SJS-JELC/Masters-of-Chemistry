import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ActivityId,
  C3L6Progress,
  ChallengeCommand,
  IsomerCommand,
  MaxwellCommand,
  OlympiadActivityId,
  OlympiadCommand,
  OlympiadProgress,
  PlatformView,
} from '../contracts/index.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import { CourseShell } from '../shell/CourseShell.tsx';
import { productionRegistry } from './registry.ts';
import type { SaveStatus } from '../ui/QuestionPlayer.tsx';
import type { StorageFailure } from '../contracts/repository.ts';
import { repositoryError, isModuleLoadFailure } from '../loading/module-errors.ts';
import { OlympiadLanding } from '../landing/OlympiadLanding.tsx';
import './olympiad.css';
import { useLoading } from '../loading/LoadingProvider.tsx';
import type { LoadingTicket } from '../loading/coordinator.ts';
import type { PreparedOlympiad } from './prepare-olympiad.ts';
import { createViewRepositoryLifetime } from './view-repository-lifetime.ts';
export { prepareOlympiad, type PreparedOlympiad } from './prepare-olympiad.ts';
import { OlympiadSaveNotice } from '../activities/olympiad/DrawingDialog.tsx';
interface OlympiadHarness {
  snapshot: () => {
    progress: OlympiadProgress | null;
    saveStatus: SaveStatus;
    databaseName: string;
  };
  flush: () => Promise<void>;
  command: (command: OlympiadCommand) => Promise<void>;
}
declare global {
  interface Window {
    __mastersOlympiad?: OlympiadHarness;
  }
}

type ChallengeGuard = (() => Promise<boolean>) & {
  freeze: () => void;
  resume: (ticket?: LoadingTicket) => Promise<boolean>;
};

/** Separate challenge progress channel; never creates curriculum attempts, clocks or evidence. */
export function OlympiadHost({
  prepared,
  onSelectCurriculum,
  onSelectChallenge,
  onSelectView,
  onNavigationGuard,
}: {
  readonly prepared: PreparedOlympiad;
  readonly activityId?: OlympiadActivityId;
  readonly onSelectCurriculum: (id: ActivityId) => void;
  readonly onSelectChallenge: (id: OlympiadActivityId | undefined) => void;
  readonly onSelectView?: (view: PlatformView) => void;
  readonly onNavigationGuard?: (guard: (() => Promise<boolean>) | null) => void;
}) {
  const { activityId, databaseName, readOnly, runtime, completion } = prepared;
  const repository = useMemo(() => createChemistryRepository(databaseName), [databaseName]);
  const loading = useLoading();
  const [progress, setProgress] = useState(prepared.progress);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: 'idle' });
  const [message, setMessage] = useState('');
  const stateRef = useRef<OlympiadProgress | null>(prepared.progress);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const lifetime = useRef(createViewRepositoryLifetime());
  const saveFailed = useRef(false),
    frozen = useRef(false),
    generation = useRef(0);
  const saveFailure = useRef<StorageFailure | null>(null);
  const readOnlyRef = useRef(readOnly),
    activityRef = useRef(activityId);
  readOnlyRef.current = readOnly;
  activityRef.current = activityId;
  const apply = useCallback((value: OlympiadProgress) => {
    stateRef.current = value;
    setProgress(value);
  }, []);
  useEffect(() => {
    const release = lifetime.current.retain(repository, () => queue.current);
    return () => {
      generation.current++;
      release();
    };
  }, [repository]);
  const save = useCallback(
    (value: OlympiadProgress) => {
      const version = generation.current;
      setSaveStatus({ kind: 'saving' });
      const copied = structuredClone(value);
      const operation = queue.current.then(async () => {
        try {
          const result = await repository.saveOlympiad(copied);
          if (version !== generation.current) return;
          saveFailed.current = !result.ok;
          saveFailure.current = result.ok ? null : result.error;
          setSaveStatus(result.ok ? { kind: 'saved' } : { kind: 'error', error: result.error });
        } catch (error) {
          if (version !== generation.current) return;
          saveFailed.current = true;
          saveFailure.current = {
            code: 'unavailable',
            message:
              error instanceof Error ? error.message : 'Challenge progress could not be saved.',
            retryable: !isModuleLoadFailure(error),
            ...(isModuleLoadFailure(error) ? { recovery: 'reload' } : {}),
          };
          setSaveStatus({
            kind: 'error',
            error: saveFailure.current,
          });
        }
      });
      queue.current = operation.catch(() => undefined);
      return operation;
    },
    [repository],
  );
  const command = useCallback(
    async (value: OlympiadCommand) => {
      const current = stateRef.current;
      if (
        frozen.current ||
        loading.snapshot().pending ||
        loading.snapshot().error ||
        !runtime ||
        !current ||
        readOnlyRef.current ||
        current.activityId !== activityRef.current
      )
        return;
      let result;
      if (
        runtime.id === 'alevel/c3l6-organic-reactions' &&
        current.activityId === runtime.id &&
        !['draw', 'select-box', 'check'].includes(value.kind)
      )
        result = runtime.module.c3Policy.transition(
          runtime.module.c3Challenge,
          current as C3L6Progress,
          value as ChallengeCommand,
        );
      else if (
        runtime.id === 'alevel/olympiad-2011-q4' &&
        current.activityId === runtime.id &&
        ['draw', 'select-box', 'check', 'restart'].includes(value.kind)
      )
        result = runtime.module.isomerPolicy.transition(
          runtime.module.isomerChallenge,
          current,
          value as IsomerCommand,
        );
      else if (
        runtime.id === 'alevel/maxwells-demon' &&
        current.activityId === runtime.id &&
        (value.kind.startsWith('maxwell-') || value.kind === 'restart')
      )
        result = runtime.module.maxwellPolicy.transition(
          runtime.module.maxwellChallenge,
          current,
          value as MaxwellCommand,
        );
      if (!result) return;
      setMessage(result.message);
      if (result.accepted) {
        apply(result.progress);
        await save(result.progress);
      }
    },
    [runtime, apply, save, loading.snapshot],
  );
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__mastersOlympiad = {
      snapshot: () => ({ progress: stateRef.current, saveStatus, databaseName }),
      flush: async () => {
        await queue.current;
      },
      command,
    };
    return () => {
      delete window.__mastersOlympiad;
    };
  }, [saveStatus, databaseName, command]);
  const freeze = useCallback(() => {
    frozen.current = true;
  }, []);
  const resume = useCallback(
    async (ticket?: LoadingTicket) => {
      await queue.current;
      if (ticket && !ticket.isCurrent()) return false;
      if (saveFailed.current && stateRef.current) {
        const value = stateRef.current;
        if (ticket) await ticket.persist(() => save(value));
        else await save(value);
        if (ticket && !ticket.isCurrent()) return false;
      }
      if (saveFailure.current?.recovery === 'reload') throw repositoryError(saveFailure.current);
      if (saveFailed.current) return false;
      frozen.current = false;
      return true;
    },
    [save],
  );
  useEffect(() => loading.onFreeze(freeze), [loading.onFreeze, freeze]);
  useEffect(() => loading.onCancel(resume), [loading.onCancel, resume]);
  const leave = useCallback((action: () => void) => {
    if (!frozen.current) action();
  }, []);
  useEffect(() => {
    const guard: ChallengeGuard = Object.assign(
      async () => {
        await queue.current;
        if (saveFailed.current && stateRef.current) await save(stateRef.current);
        if (saveFailure.current?.recovery === 'reload') throw repositoryError(saveFailure.current);
        return !saveFailed.current;
      },
      { freeze, resume },
    );
    onNavigationGuard?.(guard);
    return () => onNavigationGuard?.(null);
  }, [onNavigationGuard, freeze, resume, save]);
  const saveNotice =
    !readOnly && saveStatus.kind === 'error' ? (
      <section
        aria-label="Challenge saving failure"
        className="save-status save-error"
        role="alert"
      >
        <p>{saveStatus.error.message}</p>
        {saveStatus.error.retryable && (
          <button
            type="button"
            onClick={() => {
              const value = stateRef.current;
              if (value) void save(value);
            }}
          >
            Retry save
          </button>
        )}
      </section>
    ) : null;
  const registration = activityId ? productionRegistry.get(activityId) : undefined;
  if (!activityId)
    return (
      <OlympiadLanding
        challenges={productionRegistry.activities.filter((a) => a.strand === 'olympiad')}
        completion={completion}
        loading={false}
        {...(message ? { message } : {})}
        onLaunch={onSelectChallenge}
        onBack={() => {
          void leave(() => onSelectView?.('home'));
        }}
      />
    );
  return (
    <CourseShell
      course="alevel"
      registry={productionRegistry}
      currentView="olympiad"
      {...(activityId ? { currentActivityId: activityId } : {})}
      {...(registration ? { questionHeader: { subtopic: registration.title } } : {})}
      onQuestionBack={() => {
        void leave(() => onSelectChallenge(undefined));
      }}
      questionBackLabel="Back to Olympiad landing"
      onSelectView={(view) => {
        void leave(() => onSelectView?.(view));
      }}
      onSelectActivity={(id) => {
        void leave(() => {
          if (productionRegistry.get(id)?.strand === 'olympiad')
            onSelectChallenge(id as OlympiadActivityId);
          else onSelectCurriculum(id);
        });
      }}
    >
      <OlympiadSaveNotice.Provider value={saveNotice}>
        <div className="olympiad-question-frame">
          {readOnly && (
            <p role="status">Teacher preview · reference answers · pupil progress is not saved</p>
          )}
          {runtime?.id === 'alevel/maxwells-demon' && progress?.activityId === runtime.id ? (
            <runtime.module.MaxwellView
              progress={progress}
              readOnly={readOnly}
              onCommand={(value) => {
                void command(value);
              }}
              {...(message ? { status: message } : {})}
            />
          ) : runtime?.id === 'alevel/c3l6-organic-reactions' &&
            progress?.activityId === runtime.id ? (
            <runtime.module.C3L6View
              challenge={runtime.module.c3Challenge}
              progress={progress}
              readOnly={readOnly}
              onCommand={(value) => {
                void command(value);
              }}
              {...(message ? { status: message } : {})}
            />
          ) : runtime?.id === 'alevel/olympiad-2011-q4' && progress?.activityId === runtime.id ? (
            <runtime.module.IsomerView
              challenge={runtime.module.isomerChallenge}
              progress={progress}
              readOnly={readOnly}
              onCommand={(value) => {
                void command(value);
              }}
            />
          ) : null}
          {saveNotice}
        </div>
      </OlympiadSaveNotice.Provider>
    </CourseShell>
  );
}
