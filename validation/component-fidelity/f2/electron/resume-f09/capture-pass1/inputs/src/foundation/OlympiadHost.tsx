import { alphaDatabaseName } from '../persistence/alpha-namespace.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ActivityId, C3L6Progress, ChallengeCommand, IsomerCommand, OlympiadActivityId, OlympiadCommand, OlympiadProgress, PlatformView } from '../contracts/index.ts';
import { createChemistryRepository } from '../persistence/index.ts';
import { CourseShell } from '../shell/CourseShell.tsx';
import { productionRegistry } from './registry.ts';
import type { SaveStatus } from '../ui/QuestionPlayer.tsx';
import './olympiad.css';
type Runtime =
  | { id: 'alevel/c3l6-organic-reactions'; module: typeof import('../activities/olympiad/c3l6/index.ts') }
  | { id: 'alevel/olympiad-2011-q4'; module: typeof import('../activities/olympiad/isomers2011/index.ts') };
interface OlympiadHarness {
  snapshot: () => { progress: OlympiadProgress | null; saveStatus: SaveStatus; databaseName: string };
  flush: () => Promise<void>;
  command: (command: OlympiadCommand) => Promise<void>;
}
declare global { interface Window { __mastersOlympiad?: OlympiadHarness; } }

/** Separate challenge progress channel; never creates curriculum attempts, clocks or evidence. */
export function OlympiadHost({ activityId, onSelectCurriculum, onSelectChallenge, onSelectView, onNavigationGuard }: {
  readonly activityId?: OlympiadActivityId;
  readonly onSelectCurriculum: (id: ActivityId) => void;
  readonly onSelectChallenge: (id: OlympiadActivityId | undefined) => void;
  readonly onSelectView?: (view: PlatformView) => void;
  readonly onNavigationGuard?: (guard: (() => Promise<boolean>) | null) => void;
}) {
  const query = useMemo(() => new URLSearchParams(location.search), []), profileId = 'local';
  const run = (import.meta.env.DEV ? query.get('run') || 'local' : 'local').replace(/[^a-zA-Z0-9_-]/g, '').slice(0,60) || 'manual';
  const databaseName = alphaDatabaseName('alevel',run), repository = useMemo(() => createChemistryRepository(databaseName),[databaseName]);
  const [runtime,setRuntime] = useState<Runtime | null>(null), [progress,setProgress] = useState<OlympiadProgress | null>(null);
  const [readOnly,setReadOnly] = useState(query.get('mode') === 'teacher' || query.get('mode') === 'review');
  const [saveStatus,setSaveStatus] = useState<SaveStatus>({kind:'idle'}), [message,setMessage] = useState('');
  const stateRef = useRef<OlympiadProgress | null>(null), queue = useRef<Promise<void>>(Promise.resolve()), saveFailed = useRef(false);
  const generation = useRef(0), readOnlyRef = useRef(readOnly), activityRef = useRef(activityId);
  readOnlyRef.current = readOnly; activityRef.current = activityId;
  const apply = useCallback((value: OlympiadProgress) => { stateRef.current = value; setProgress(value); },[]);
  useEffect(() => {
    const version = ++generation.current;
    stateRef.current = null; setProgress(null); setRuntime(null); setMessage(''); setSaveStatus({kind:'idle'}); saveFailed.current = false;
    if (!activityId) return;
    void (async () => {
      await queue.current;
      if (version !== generation.current) return;
      if (activityId === 'alevel/c3l6-organic-reactions') {
        const module = await import('../activities/olympiad/c3l6/index.ts');
        const loaded = await repository.loadOlympiad(profileId);
        if (version !== generation.current) return;
        setRuntime({id: activityId,module});
        apply(loaded.ok && loaded.value ? module.c3Policy.validateCompletion(module.c3Challenge,loaded.value) : module.blankC3Progress(profileId));
        if (!loaded.ok) { setSaveStatus({kind:'error',error:loaded.error}); setMessage(loaded.error.message); }
      } else {
        const module = await import('../activities/olympiad/isomers2011/index.ts');
        const loaded = await repository.loadOlympiad(profileId, activityId);
        if (version !== generation.current) return;
        setRuntime({id:activityId,module});
        apply(loaded.ok && loaded.value ? module.isomerPolicy.validateCompletion(module.isomerChallenge, loaded.value) : module.blankIsomerProgress(profileId));
        if (!loaded.ok) { setSaveStatus({kind:'error',error:loaded.error}); setMessage(loaded.error.message); }
      }
    })().catch(error => { if (version === generation.current) setMessage(error instanceof Error ? error.message : 'The challenge could not be loaded.'); });
    return () => { generation.current++; };
  },[activityId,repository,apply]);
  const save = useCallback((value: OlympiadProgress) => {
    const version = generation.current;
    setSaveStatus({kind:'saving'});
    const copied = structuredClone(value);
    const operation = queue.current.then(async () => {
      const result = await repository.saveOlympiad(copied);
      if (version !== generation.current) return;
      saveFailed.current = !result.ok;
      setSaveStatus(result.ok ? {kind:'saved'} : {kind:'error',error:result.error});
    });
    queue.current = operation.catch(() => undefined);
    return operation;
  },[repository]);
  const command = useCallback(async (value: OlympiadCommand) => {
    const current = stateRef.current;
    if (!runtime || !current || readOnlyRef.current || current.activityId !== activityRef.current) return;
    let result;
    if (runtime.id === 'alevel/c3l6-organic-reactions' && current.activityId === runtime.id && !['draw','select-box','check'].includes(value.kind))
      result = runtime.module.c3Policy.transition(runtime.module.c3Challenge,current as C3L6Progress,value as ChallengeCommand);
    else if (runtime.id === 'alevel/olympiad-2011-q4' && current.activityId === runtime.id && ['draw','select-box','check','restart'].includes(value.kind))
      result = runtime.module.isomerPolicy.transition(runtime.module.isomerChallenge,current,value as IsomerCommand);
    if (!result) return;
    setMessage(result.message);
    if (result.accepted) { apply(result.progress); await save(result.progress); }
  },[runtime,apply,save]);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.__mastersOlympiad = {snapshot: () => ({progress:stateRef.current,saveStatus,databaseName}),flush: async () => {await queue.current;},command};
    return () => { delete window.__mastersOlympiad; };
  },[saveStatus,databaseName,command]);
  const leave = useCallback(async (action: () => void) => { await queue.current; if (!saveFailed.current) action(); },[]);
  useEffect(() => {
    onNavigationGuard?.(async () => {await queue.current; return !saveFailed.current;});
    return () => onNavigationGuard?.(null);
  },[onNavigationGuard]);
  const registration = activityId ? productionRegistry.get(activityId) : undefined;
  return <CourseShell course="alevel" registry={productionRegistry} currentView="olympiad"
    {...(activityId ? {currentActivityId:activityId} : {})}
    {...(registration ? {questionHeader:{subtopic:registration.title,questionId: activityId === 'alevel/olympiad-2011-q4' ? 'UK Olympiad 2011 Q4' : 'C3L6 2012 Q2'}} : {})}
    onSelectView={view => {void leave(() => onSelectView?.(view));}}
    onSelectActivity={id => {void leave(() => { if (productionRegistry.get(id)?.strand === 'olympiad') onSelectChallenge(id as OlympiadActivityId); else onSelectCurriculum(id); });}}>
    {!activityId ? <section className="olympiad-selector" aria-label="Olympiad challenges"><h1>Olympiad challenges</h1><p>Explore chemistry beyond the course. Your drawings and challenge completion save on this device.</p>{productionRegistry.activities.filter(a => a.strand === 'olympiad').map(a => <button type="button" key={a.id} onClick={() => onSelectChallenge(a.id as OlympiadActivityId)}>{a.title}</button>)}</section> : <>
      <section className="challenge-mode-controls" aria-label="Challenge mode">
        <button type="button" onClick={() => {void leave(() => onSelectChallenge(undefined));}}>All Olympiad challenges</button>
        <button type="button" onClick={() => setReadOnly(v => !v)}>{readOnly ? 'Return to challenge' : 'Teacher preview'}</button>
      </section>
      {readOnly && <p role="status">Teacher preview · reference answers · pupil progress is not saved</p>}
      {runtime?.id === 'alevel/c3l6-organic-reactions' && progress?.activityId === runtime.id ? <runtime.module.C3L6View challenge={runtime.module.c3Challenge} progress={progress} readOnly={readOnly} onCommand={value => {void command(value);}} {...(message ? {status:message} : {})} /> :
       runtime?.id === 'alevel/olympiad-2011-q4' && progress?.activityId === runtime.id ? <runtime.module.IsomerView challenge={runtime.module.isomerChallenge} progress={progress} readOnly={readOnly} onCommand={value => {void command(value);}} /> : <p role="status">{message || 'Loading challenge content...'}</p>}
      {!readOnly && saveStatus.kind === 'error' && <section aria-label="Challenge saving failure" className="save-status save-error" role="alert"><p>{saveStatus.error.message}</p>{saveStatus.error.retryable && <button type="button" onClick={() => {const value = stateRef.current; if (value) void save(value);}}>Retry save</button>}</section>}
    </>}
  </CourseShell>;
}
