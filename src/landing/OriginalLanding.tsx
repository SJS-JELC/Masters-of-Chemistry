import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import type { OriginalLandingProps, LandingLaunchRequest } from '../contracts/landing';
import type { Course, Level } from '../contracts/identity';
import { catalogues, displayGems, type DisplayGem, type LandingGroup } from './catalogue';
import { landingProgress, readPreference, savePreference } from './progress';
import { captureTopicLayout, animateTopicLayout } from './animation';
import { StatsIcon } from './StatsIcon';
import { RecallIcon } from './RecallIcon';
import { GemPaths } from './GemPaths';
import { LoadingProvider, useLoading, useLoadingContext } from '../loading/LoadingProvider.tsx';
import eagle from '../../public/assets/landing/SJS-Eagle.svg?url';
import './adaptation.css';
import './alevel.css';
import './igcse.css';
import './standardisation.css';

const style = (values: Record<string, string>) => values as CSSProperties;
const bands: Record<number, string> = { 1: 'Grade 5–6', 2: 'Grade 7–8', 3: 'Grade 9' };
const token = () => crypto.randomUUID();
function setHash(id: string) {
  try {
    window.history.replaceState(
      null,
      '',
      location.pathname + location.search + (id ? '#' + id : ''),
    );
  } catch {
    /* Local file navigation can restrict history. */
  }
}
function rememberedSelection(course: Course, available: Set<string>) {
  const saved = readPreference<unknown>(course + ':selection', []);
  return new Set(
    Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === 'string' && available.has(id))
      : [],
  );
}
function Toggle({
  checked,
  label,
  left,
  right,
  onClick,
  id,
}: {
  checked: boolean;
  label: string;
  left: string;
  right: string;
  onClick: () => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      className="subject-toggle"
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-controls={id === 'flipYear' ? 't1-card t2-card' : undefined}
      onClick={onClick}
    >
      <span className="physical-label">{left}</span>
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-sun">☀</span>
        <span className="toggle-moon">☾</span>
        <span className="toggle-thumb" />
      </span>
      <span className="organic-label">{right}</span>
    </button>
  );
}
function MasteryBar({
  score,
  level,
  label,
  threshold,
  id,
}: {
  score: number | null;
  level: Level;
  label: string;
  threshold: number;
  id?: string;
}) {
  return (
    <span
      id={id}
      className={'mastery-bar' + (score !== null && score > threshold ? ' is-mastered' : '')}
      data-grade={level}
      data-level={level}
      role="meter"
      aria-label={label + ' mastery'}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={score ?? 0}
      aria-valuetext={
        score === null
          ? 'Not assessed yet'
          : score > threshold
            ? 'Above the mastery threshold'
            : 'Mastery threshold not yet exceeded'
      }
      style={style({
        '--mastery-fill': (score ?? 0) * 100 + '%',
        '--mastery-threshold': threshold * 100 + '%',
      })}
    >
      <span className="mastery-bar-fill" aria-hidden="true" />
      <span className="mastery-bar-threshold" aria-hidden="true" />
    </span>
  );
}

type Availability = ReturnType<
  typeof import('../foundation/gem-mastery-availability.ts').gemMasteryAvailability
>;
export interface PreparedLandingDetails {
  readonly gemId: string;
  readonly availability: Availability;
}
type LandingProps = OriginalLandingProps & { readonly preparedDetails?: PreparedLandingDetails };
let availabilityModule:
  | Promise<typeof import('../foundation/gem-mastery-availability.ts')>
  | undefined;
const availabilityCache = new WeakMap<
  OriginalLandingProps['registry'],
  Map<string, Availability>
>();
async function availabilityFor(
  course: Course,
  gemId: string,
  registry: OriginalLandingProps['registry'],
): Promise<Availability> {
  let cache = availabilityCache.get(registry);
  if (!cache) {
    cache = new Map();
    availabilityCache.set(registry, cache);
  }
  const key = course + ':' + gemId,
    saved = cache.get(key);
  if (saved) return saved;
  availabilityModule ??= import('../foundation/gem-mastery-availability.ts').catch((error) => {
    availabilityModule = undefined;
    throw error;
  });
  const module = await availabilityModule;
  const value = module.gemMasteryAvailability(course, gemId, registry);
  cache.set(key, value);
  return value;
}
/** Ordinary map entry does not require Recall content; a linked gem menu does. */
export async function prepareLandingDetails(
  course: Course,
  hash: string,
  registry: OriginalLandingProps['registry'],
): Promise<PreparedLandingDetails | undefined> {
  const raw = hash.replace(/^#/, '');
  const id = catalogues[course].display.redirects[raw] || raw;
  if (!displayGems(course).some((gem) => gem.id === id)) return;
  return { gemId: id, availability: await availabilityFor(course, id, registry) };
}
export function OriginalLanding(props: LandingProps) {
  const coordinator = useLoadingContext();
  const content = (
    <div className="landing-course-stage">
      <div className="landing-course-surface">
        <CourseLanding key={props.course} {...props} />
      </div>
    </div>
  );
  return coordinator ? content : <LoadingProvider>{content}</LoadingProvider>;
}
function CourseLanding(props: LandingProps) {
  const loading = useLoading();
  const { course, registry, history: records } = props;
  const isA = course === 'alevel';
  const catalogue = catalogues[course];
  const gems = useMemo(() => displayGems(course), [course]);
  const registrations = useMemo(
    () =>
      new Map(
        registry
          .curriculumFor(course)
          .flatMap((activity) => activity.gems.map((gem) => [gem.id, gem] as const)),
      ),
    [registry, course],
  );
  const available = useMemo(() => new Set(registrations.keys()), [registrations]);
  const initialGem = props.preparedDetails
    ? gems.find((gem) => gem.id === props.preparedDetails!.gemId)
    : undefined;
  const [year, setYear] = useState<'l6' | 'u6'>(() =>
    initialGem
      ? initialGem.group.key.startsWith('u6')
        ? 'u6'
        : 'l6'
      : readPreference<string>(course + ':year', 'l6') === 'u6'
        ? 'u6'
        : 'l6',
  );
  const [expanded, setExpanded] = useState<Record<string, string>>(() =>
    initialGem
      ? {
          [columnKey(initialGem.group, initialGem.topicNumber)]:
            initialGem.group.key + '-topic-' + initialGem.topicNumber,
        }
      : {},
  );
  const [selected, setSelected] = useState<DisplayGem | null>(() =>
    props.preparedDetails
      ? (gems.find((gem) => gem.id === props.preparedDetails!.gemId) ?? null)
      : null,
  );
  const [detailAvailability, setDetailAvailability] = useState<Availability | undefined>(
    props.preparedDetails?.availability,
  );
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState(() => rememberedSelection(course, available));
  const [teacher, setTeacher] = useState(
    () => readPreference<string>(course + ':mode', 'pupil') === 'teacher',
  );
  const [navigationReady, setNavigationReady] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    lastGem = useRef<Element | null>(null),
    closeButton = useRef<HTMLButtonElement>(null);
  const progress = useMemo(
    () =>
      new Map(
        gems.map((gem) => [gem.id, landingProgress(course, records, registrations.get(gem.id))]),
      ),
    [course, gems, records, registrations],
  );
  useEffect(() => {
    savePreference(course + ':year', year);
  }, [course, year]);
  useEffect(() => {
    savePreference(course + ':selection', [...selection]);
  }, [course, selection]);
  useEffect(() => {
    savePreference(course + ':mode', teacher ? 'teacher' : 'pupil');
  }, [course, teacher]);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setNavigationReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  function closeDetails(focus = true) {
    dialog.current?.close();
    setSelected(null);
    if (focus && (lastGem.current as HTMLElement)?.isConnected)
      (lastGem.current as HTMLElement).focus({ preventScroll: true });
    setHash(isA ? year + '-t1' : '');
  }
  function prepareDetails(gem: DisplayGem, trigger?: Element) {
    if (trigger) lastGem.current = trigger;
    void loading.run(
      'tool',
      () => availabilityFor(course, gem.id, registry),
      (availability) => {
        setDetailAvailability(availability);
        if (isA) setYear(gem.group.key.startsWith('u6') ? 'u6' : 'l6');
        const topicId = gem.group.key + '-topic-' + gem.topicNumber;
        setExpanded((current) => ({
          ...current,
          [columnKey(gem.group, gem.topicNumber)]: topicId,
        }));
        setSelected(gem);
        setHash(gem.id);
      },
    );
  }
  useEffect(() => {
    function hash() {
      if (loading.snapshot().pending) return;
      const old = location.hash.slice(1),
        id = catalogue.display.redirects[old] || old;
      const gem = gems.find((gem) => gem.id === id);
      if (gem) {
        if (selected?.id !== gem.id) prepareDetails(gem);
      } else if (isA) {
        const match = /^(l6|u6)-(t1|t2)(?:-topic-(\d+))?$/.exec(id);
        if (match) {
          setYear(match[1] === 'u6' ? 'u6' : 'l6');
          const group = catalogue.groups.find((g) => g.key === match[1] + '-' + match[2]);
          if (group && match[3])
            setExpanded((current) => ({ ...current, [columnKey(group, Number(match[3]))]: id }));
        }
      }
    }
    hash();
    window.addEventListener('hashchange', hash);
    return () => window.removeEventListener('hashchange', hash);
  }, [course, loading.pending]);
  useLayoutEffect(() => {
    if (!selected) return;
    lastGem.current = root.current?.querySelector(`[data-leaf="${selected.id}"]`) ?? null;
    const node = dialog.current;
    if (!node) return;
    if (!node.open) {
      if (isA) node.showModal();
      else node.show();
    }
    closeButton.current?.focus({ preventScroll: true });
  }, [selected, isA]);
  useEffect(() => {
    function outside(event: MouseEvent) {
      if (
        event
          .composedPath()
          .some((node) => node instanceof Element && node.classList.contains('loading-error'))
      )
        return;
      if (loading.snapshot().pending || loading.snapshot().error) return;
      if (!selected || isA) return;
      const target = event.target as Element;
      if (!dialog.current?.contains(target) && !target.closest('.gem,.gem-name'))
        closeDetails(false);
    }
    function escape(event: KeyboardEvent) {
      if (
        event
          .composedPath()
          .some((node) => node instanceof Element && node.classList.contains('loading-error'))
      )
        return;
      if (loading.snapshot().pending || loading.snapshot().error) return;
      if (event.key === 'Escape' && selected) {
        event.preventDefault();
        closeDetails();
      }
    }
    document.addEventListener('click', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('click', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [selected, isA, year]);
  function columnKey(group: LandingGroup, number: number) {
    if (!isA) return group.key;
    const index = group.topics.findIndex((topic) => topic[0] === number);
    return group.key + ':' + (index < Math.ceil(group.topics.length / 2) ? 0 : 1);
  }
  function expandTopic(group: LandingGroup, number: number) {
    const key = columnKey(group, number),
      id = group.key + '-topic-' + number,
      opening = expanded[key] !== id;
    const animate = isA && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sections = animate
      ? Array.from(
          root.current!.querySelectorAll<HTMLElement>(`[data-column="${key}"] .topic-section`),
        ).filter(
          (section) => section.dataset.topic === id || section.classList.contains('expanded'),
        )
      : [];
    const before = animate ? captureTopicLayout(sections) : [];
    flushSync(() => setExpanded((current) => ({ ...current, [key]: opening ? id : '' })));
    if (animate) animateTopicLayout(before);
    if (isA) setHash(opening ? id : group.key);
  }
  function toggleSelection(ids: readonly string[]) {
    setSelection((current) => {
      const next = new Set(current),
        remove = ids.every((id) => next.has(id));
      ids.forEach((id) => (remove ? next.delete(id) : next.add(id)));
      return next;
    });
  }
  function openGem(gem: DisplayGem, event: React.MouseEvent | React.KeyboardEvent) {
    if (selecting) {
      if (available.has(gem.id)) toggleSelection([gem.id]);
      return;
    }
    prepareDetails(gem, event.currentTarget);
  }
  function launch(request: LandingLaunchRequest) {
    props.onLaunch(request);
  }
  function topic(group: LandingGroup, [number, name]: LandingGroup['topics'][number]) {
    const topicId = group.key + '-topic-' + number,
      key = columnKey(group, number),
      topicGems = gems.filter((gem) => gem.group.key === group.key && gem.topicNumber === number),
      ids = topicGems.map((gem) => gem.id).filter((id) => available.has(id)),
      all = ids.length > 0 && ids.every((id) => selection.has(id));
    return (
      <section
        key={topicId}
        className={'topic-section' + (expanded[key] === topicId ? ' expanded' : '')}
        data-topic={topicId}
        aria-labelledby={isA ? topicId : 'topic-' + number}
        onClick={(event) => {
          if (!(event.target as Element).closest('.gem,.gem-entry,.test-topic-all'))
            expandTopic(group, number);
        }}
      >
        <h3 id={isA ? topicId : 'topic-' + number}>
          <button
            type="button"
            className="topic-trigger"
            aria-expanded={expanded[key] === topicId}
            aria-controls={topicId + '-gems'}
          >
            <span>{name}</span>
          </button>
          {ids.length > 0 && (
            <button
              type="button"
              className="test-topic-all"
              aria-pressed={all}
              aria-label={(all ? 'Remove' : 'Add') + ' all available gems in ' + name}
              onClick={(event) => {
                event.stopPropagation();
                toggleSelection(ids);
              }}
            >
              {all ? 'REMOVE ALL' : 'ADD ALL'}
            </button>
          )}
        </h3>
        <div className="topic-gems" id={topicId + '-gems'}>
          {topicGems.map((gem) => {
            const runnable = available.has(gem.id),
              activity = catalogue.activities[gem.id],
              state = progress.get(gem.id)!;
            const classes =
              'gem ' +
              (runnable ? 'available ' + (activity?.type || '') : 'unavailable') +
              ' ' +
              state.freshness +
              (selected?.id === gem.id ? ' is-selected' : '') +
              (selecting && selection.has(gem.id) ? ' test-selected' : '') +
              (selecting && !runnable ? ' test-unavailable' : '');
            const label = selecting
              ? gem.name +
                (runnable
                  ? selection.has(gem.id)
                    ? ', selected for test'
                    : ', select for test'
                  : ', Questions not available yet')
              : isA
                ? gem.name +
                  (runnable
                    ? `, ${state.grade ? 'Level ' + state.grade + ' mastered' : 'no level mastered yet'}, practice available`
                    : ', no activity available yet')
                : teacher
                  ? gem.name + (runnable ? ', choose questions' : ', activity coming soon')
                  : gem.name +
                    ', ' +
                    (state.grade ? bands[state.grade] + ' mastered' : 'no level mastered yet') +
                    ', ' +
                    (state.score === null ? 'not assessed' : 'mastery recorded') +
                    ', ' +
                    (state.days === null
                      ? 'no review recorded'
                      : 'reviewed ' + state.days + ' days ago') +
                    ', ' +
                    (runnable ? 'activity available' : 'activity coming soon');
            const attrs = {
              'data-leaf': gem.id,
              'data-mastery-grade': runnable || !isA ? state.grade : undefined,
              'data-freshness': !isA && state.score === null ? 'unreviewed' : state.freshness,
              'data-assessed': state.score !== null,
              'aria-label': label,
              'aria-haspopup': selecting ? undefined : ('dialog' as const),
              'aria-controls': selecting ? undefined : 'gemDetails',
              'aria-expanded': selecting ? undefined : selected?.id === gem.id,
              'aria-pressed': selecting ? selection.has(gem.id) : undefined,
              'aria-disabled': selecting ? !runnable : undefined,
            };
            if (isA)
              return (
                <button
                  key={gem.id}
                  type="button"
                  className={classes}
                  {...attrs}
                  title={gem.name}
                  onClick={(event) => openGem(gem, event)}
                >
                  <svg viewBox="-14 -16 28 34" aria-hidden="true">
                    <GemPaths />
                  </svg>
                  <span className="gem-name">{gem.name}</span>
                </button>
              );
            return (
              <div className="gem-entry" key={gem.id}>
                <svg className="gem-slot" viewBox="2 2 44 44">
                  <g
                    className={classes}
                    {...attrs}
                    data-activity-type={activity?.type || 'unavailable'}
                    transform="translate(24.0 24.0) rotate(0.0)"
                    tabIndex={0}
                    role="button"
                    onClick={(event) => openGem(gem, event)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openGem(gem, event);
                      }
                    }}
                  >
                    <rect x="-22" y="-22" width="44" height="44" fill="transparent" />
                    <title>{label}</title>
                    <GemPaths igcse />
                  </g>
                </svg>
                <button
                  type="button"
                  className="gem-name"
                  aria-haspopup={selecting ? undefined : 'dialog'}
                  aria-controls="gemDetails"
                  onClick={(event) => {
                    event.stopPropagation();
                    openGem(gem, event);
                  }}
                >
                  {gem.name}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
  const detailRegistration = selected ? registrations.get(selected.id) : undefined;
  const detailState = selected ? progress.get(selected.id) : undefined;
  const detailActivity = selected ? catalogue.activities[selected.id] : undefined;
  const choices = selected ? (
    <div
      id={isA ? 'detailStats' : 'practiceChoices'}
      className="practice-choices"
      aria-label="Choose practice mode"
    >
      <button
        type="button"
        className="practice-choice"
        data-practice="mastery"
        disabled={!detailAvailability?.facts && !detailAvailability?.target}
        onClick={() => {
          if (teacher) {
            if (detailRegistration) props.onOpenTeacher(selected.id);
            else props.onOpenRecall(selected.id, true);
          } else launch({ id: token(), kind: 'gem-mastery', course, gemId: selected.id });
        }}
      >
        <strong>MASTERY</strong>
        <span>
          {teacher
            ? 'Teacher preview · no learner evidence'
            : detailAvailability?.facts
              ? detailRegistration
                ? 'Whole factual recall set, then available graded levels'
                : 'Whole factual recall set · no graded activity yet'
              : detailRegistration
                ? 'Available graded levels · no linked facts yet'
                : 'No factual recall or graded activity available yet'}
        </span>
      </button>
      {!!detailAvailability?.facts && (
        <button
          type="button"
          className="practice-choice"
          data-practice="recall"
          onClick={() => {
            const gemId = selected.id;
            props.onOpenRecall(gemId, teacher);
          }}
        >
          <strong>KEY FACTUAL RECALL</strong>
          <span>Flashcards or test · shared recall progress</span>
        </button>
      )}
      {(detailRegistration?.supportedLevels ?? []).map((option) => {
        const level = option as Level,
          label = isA
            ? detailRegistration!.mastery.supportedLevels.find((band) => band.level === level)
                ?.label || 'Level ' + level
            : bands[level]!;
        return (
          <a
            key={option}
            href={'?course=' + course + '&gem=' + selected.id + '&practice=' + option}
            className="practice-choice"
            data-practice={option}
            onClick={(event) => {
              event.preventDefault();
              if (teacher) {
                props.onOpenTeacher(selected.id);
                return;
              }
              launch({
                id: token(),
                kind: 'practice',
                course,
                gemId: selected.id,
                selection: 'fixed-level',
                level,
              });
            }}
          >
            <strong>{label}</strong>
            <span>
              <MasteryBar
                score={detailState?.states.find((state) => state.level === level)?.score ?? null}
                level={level}
                label={label}
                threshold={detailRegistration!.mastery.threshold}
              />
            </span>
          </a>
        );
      })}
    </div>
  ) : null;
  return (
    <div
      ref={root}
      className={
        'original-landing ' +
        course +
        (navigationReady ? ' navigation-ready' : '') +
        (selecting ? ' test-selecting' : '')
      }
      data-learning-mode={teacher ? 'teacher' : 'pupil'}
    >
      <div className="stars" aria-hidden="true" />
      {isA && (
        <a className="skip-link" href="#course">
          Skip to course topics
        </a>
      )}
      <main className={(isA ? 'ocr-shell' : 'shell') + ' landing-shell'}>
        <header className={(isA ? 'ocr-brand' : 'brand') + ' landing-header'}>
          {isA ? (
            <span className="brand-mark landing-eagle">
              <img src={eagle} alt="St John's School eagle" />
            </span>
          ) : (
            <button
              className="brand-mark mode-eagle landing-eagle"
              type="button"
              data-mode-toggle
              aria-pressed={teacher}
              title={teacher ? 'Switch to pupil practice' : 'Switch to teacher question selection'}
              aria-label={
                teacher ? 'Switch to pupil practice' : 'Switch to teacher question selection'
              }
              onClick={() => setTeacher(!teacher)}
            >
              <img src={eagle} alt="St John's School eagle" />
            </button>
          )}
          <div className="landing-title">
            <p className="eyebrow">
              {isA ? 'SJS - OCR CHEMISTRY A - H432' : 'SJS - PEARSON IGCSE CHEMISTRY - 4CH1'}
            </p>
            <h1>
              Masters of <span>{isA ? 'A Level Chemistry' : 'IGCSE Chemistry'}</span>
            </h1>
          </div>
          <div className="landing-switches">
            <Toggle
              id="flipCourse"
              checked={isA}
              label="A Level Chemistry"
              left="IGCSE"
              right="A Level"
              onClick={() => props.onSelectCourse(isA ? 'igcse' : 'alevel')}
            />
            {isA ? (
              <Toggle
                id="flipYear"
                checked={year === 'u6'}
                label="Upper Sixth"
                left="Lower Sixth"
                right="Upper Sixth"
                onClick={() => {
                  closeDetails(false);
                  setYear(year === 'l6' ? 'u6' : 'l6');
                  setHash((year === 'l6' ? 'u6' : 'l6') + '-t1');
                }}
              />
            ) : (
              <div className="site-tools">
                <span className="prototype-tag" data-mode-label>
                  {teacher ? 'Question selection' : 'Pupil practice'}
                </span>
              </div>
            )}
          </div>
        </header>
        <div className="test-tile-row">
          <button
            className="test-tile"
            id="testModeTile"
            type="button"
            aria-expanded={selecting}
            aria-controls="testSelection"
            onClick={() => {
              closeDetails(false);
              setSelecting(!selecting);
            }}
          >
            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 5h16l5 8-13 15L3 13 8 5Z" />
              <path d="m8 5 8 23L24 5M3 13h26M8 5l8 8 8-8" />
            </svg>
            <span>Revision</span>
          </button>
          <button
            className="test-tile recall-tile"
            id="recallTile"
            type="button"
            onClick={() => props.onOpenRecall(undefined, teacher)}
          >
            <RecallIcon />
            <span>Recall</span>
          </button>
          <button
            className="test-tile stats-tile"
            id="statsTile"
            type="button"
            onClick={props.onOpenStatistics}
          >
            <StatsIcon />
            <span>Stats</span>
          </button>
          {isA && (
            <button
              className="test-tile olympiad-tile"
              id="olympiadTile"
              type="button"
              onClick={props.onOpenOlympiad}
            >
              <svg
                viewBox="0 0 40 28"
                role="img"
                aria-labelledby="olympiadRingsTitle"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <title id="olympiadRingsTitle">Five interlocking rings</title>
                <circle cx="8" cy="8" r="7" />
                <circle cx="20" cy="8" r="7" />
                <circle cx="32" cy="8" r="7" />
                <circle cx="14" cy="18" r="7" />
                <circle cx="26" cy="18" r="7" />
              </svg>
              <span>Olympiad</span>
            </button>
          )}
          {selecting && (
            <section
              id="testSelection"
              className="test-selection"
              aria-label="Choose gems for revision"
            >
              <div className="test-selection-content">
                <p id="testSelectionTitle" tabIndex={-1} hidden={selection.size > 0}>
                  Select gems below
                </p>
                {isA && (
                  <div
                    id="testYearBulk"
                    className="test-year-bulk"
                    aria-label="Select a whole year"
                  >
                    {(['l6', 'u6'] as const).map((y) => {
                      const ids = [...available].filter((id) => id.startsWith(y + '-')),
                        all = ids.length > 0 && ids.every((id) => selection.has(id));
                      return (
                        <button
                          key={y}
                          type="button"
                          data-year={y}
                          disabled={!ids.length}
                          aria-pressed={all}
                          onClick={() => toggleSelection(ids)}
                        >
                          {all ? 'REMOVE ALL' : 'ADD ALL'}{' '}
                          {y === 'l6' ? 'LOWER SIXTH' : 'UPPER SIXTH'}
                        </button>
                      );
                    })}
                  </div>
                )}
                <ul id="testChosen" className="test-chosen" aria-label="Selected gems">
                  {[...selection].map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        aria-label={'Remove ' + gems.find((gem) => gem.id === id)?.name}
                        onClick={() => toggleSelection([id])}
                      >
                        {gems.find((gem) => gem.id === id)?.name} ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="test-selection-tools">
                  <span id="testSelectionCount" role="status">
                    {selection.size} {selection.size === 1 ? 'gem selected' : 'gems selected'}
                  </span>
                  <button
                    id="testClear"
                    type="button"
                    disabled={!selection.size}
                    onClick={() => setSelection(new Set())}
                  >
                    Clear selection
                  </button>
                  <button id="testCancel" type="button" onClick={() => setSelecting(false)}>
                    Cancel
                  </button>
                </div>
              </div>
              <button
                id="testStart"
                type="button"
                disabled={!selection.size}
                aria-label="Go: start revision"
                onClick={() =>
                  launch({ id: token(), kind: 'revision', course, gemIds: [...selection] })
                }
              >
                GO<span aria-hidden="true">&gt;</span>
              </button>
            </section>
          )}
        </div>
        {props.message && (
          <p className="landing-message" role="status">
            {props.message}
          </p>
        )}
        {isA ? (
          <section id="course" aria-label="Course topics">
            <div className="curriculum-panel" id="yearGrid">
              {['t1', 't2'].map((side) => (
                <div key={side} className="flip-stage" id={side + '-stage'}>
                  <div
                    className={'flip-card' + (year === 'u6' ? ' is-flipped' : '')}
                    id={side + '-card'}
                  >
                    {catalogue.groups
                      .filter((group) => group.key.endsWith(side))
                      .map((group) => {
                        const active = group.key.startsWith(year),
                          split = Math.ceil(group.topics.length / 2);
                        return (
                          <section
                            key={group.key}
                            id={group.key}
                            className={
                              'year-card ' + (group.key.startsWith('u6') ? 'back' : 'front')
                            }
                            style={style({ '--accent': group.colour })}
                            aria-labelledby={'heading-' + group.key}
                            aria-hidden={!active}
                            inert={!active}
                          >
                            <header className="year-heading">
                              <h2 id={'heading-' + group.key}>
                                {side === 't1' ? 'Physical' : 'Organic'}
                              </h2>
                              <p className="subject-label">
                                {group.key.startsWith('l6') ? 'Lower Sixth' : 'Upper Sixth'}
                              </p>
                            </header>
                            <div className="year-topics">
                              {[0, 1].map((column) => (
                                <div
                                  key={column}
                                  className="topic-column"
                                  data-column={group.key + ':' + column}
                                >
                                  {group.topics
                                    .slice(
                                      column === 0 ? 0 : split,
                                      column === 0 ? split : undefined,
                                    )
                                    .map((item) => topic(group, item))}
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="map-layout">
            <section className="panel curriculum-panel" aria-labelledby="mapHeading">
              <h2 id="mapHeading" className="visually-hidden">
                Chemistry topics
              </h2>
              <div className="map-canvas">
                <div
                  className="year-grid sparkles-on"
                  id="yearGrid"
                  aria-label="Chemistry topics by teaching year"
                >
                  {catalogue.groups.map((group) => (
                    <section
                      key={group.key}
                      className="year-card year-group"
                      data-year={group.key}
                      style={style({ '--year-colour': group.colour })}
                      aria-labelledby={'year-' + group.key}
                    >
                      <header className="year-card-heading">
                        <h2 id={'year-' + group.key}>{group.name}</h2>
                      </header>
                      {group.topics.map((item) => topic(group, item))}
                    </section>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
        <dialog
          ref={dialog}
          id="gemDetails"
          className={isA ? undefined : 'panel detail-panel'}
          style={style({ '--accent': selected?.group.colour || '#55f6ff' })}
          aria-labelledby={isA ? 'detailName' : 'detailTopic detailSubbranch'}
          aria-describedby={isA ? 'detailPath activityNote' : undefined}
          onCancel={(event) => {
            event.preventDefault();
            if (loading.snapshot().pending || loading.snapshot().error) return;
            closeDetails();
          }}
          onClick={(event) => {
            if (!isA) return;
            const box = event.currentTarget.getBoundingClientRect();
            if (
              event.target === event.currentTarget &&
              (event.clientX < box.left ||
                event.clientX > box.right ||
                event.clientY < box.top ||
                event.clientY > box.bottom)
            )
              closeDetails();
          }}
        >
          {isA ? (
            <>
              <form
                method="dialog"
                onSubmit={(event) => {
                  event.preventDefault();
                  closeDetails();
                }}
              >
                <button ref={closeButton} className="close-details" aria-label="Close gem details">
                  ×
                </button>
              </form>
              <p className="eyebrow" id="detailPath">
                {selected?.group.name} · {selected?.topicName}
              </p>
              <h2 id="detailName">{selected?.name}</h2>
              {choices || (
                <div id="detailStats">
                  <p className="mastery-status">Not assessed</p>
                  <p className="mastery-note">No practice activity is available yet.</p>
                </div>
              )}
              <p className="activity-status" id="activityStatus">
                {detailRegistration ? 'Practice available' : 'No activity available yet'}
              </p>
              <p id="activityNote">
                {detailRegistration
                  ? detailActivity?.note
                  : 'A practice activity has not yet been added for this subtopic.'}
              </p>
            </>
          ) : (
            <>
              <button
                ref={closeButton}
                className="close-button detail-close"
                id="closeDetails"
                type="button"
                aria-label="Close topic details"
                onClick={() => closeDetails()}
              >
                ×
              </button>
              <div className="selection-summary">
                <p className="kicker" id="detailKicker">
                  SELECTED GEM
                </p>
                <h3 className="detail-heading">
                  <span id="detailTopic">{selected?.topicName}</span>
                  <span className="detail-separator" aria-hidden="true">
                    ›
                  </span>
                  <span id="detailSubbranch">{selected?.name}</span>
                </h3>
                <p className="detail-path" id="detailPath">
                  {selected?.group.name} •{' '}
                  {detailRegistration ? detailActivity?.typeLabel : 'No activity'}
                </p>
              </div>
              {choices}
              <div className="gem-progress" aria-live="polite" hidden={Boolean(choices)}>
                <div>
                  <span id="masteryBand">{bands[detailState?.grade || 1]} mastery</span>
                  <strong id="gemMastery">
                    {detailState?.score === null
                      ? 'Not assessed yet'
                      : detailState?.grade
                        ? 'Mastery threshold exceeded'
                        : 'Building mastery'}
                  </strong>
                  <MasteryBar
                    id="gemMasteryMeter"
                    score={detailState?.score ?? null}
                    level={(detailState?.grade || 1) as Level}
                    label={bands[detailState?.grade || 1]!}
                    threshold={detailRegistration?.mastery.threshold ?? 0.8}
                  />
                </div>
                <div>
                  <span>Freshness</span>
                  <strong id="gemFreshness">
                    {detailState?.freshness === 'fresh'
                      ? 'Bright gleam'
                      : detailState?.freshness === 'steady'
                        ? 'Soft gleam'
                        : detailState?.freshness === 'due'
                          ? 'Review due'
                          : 'No review recorded'}
                  </strong>
                  <small id="gemReviewed">
                    {detailState?.days === null
                      ? ''
                      : detailState?.days === 0
                        ? 'Last reviewed today'
                        : 'Last reviewed ' + detailState?.days + ' days ago'}
                  </small>
                </div>
              </div>
              <div
                className="activity-type-card"
                id="activityTypeCard"
                data-type={detailRegistration ? detailActivity?.type : 'unavailable'}
                hidden={Boolean(choices)}
              >
                <svg
                  className="detail-gem"
                  id="detailGem"
                  viewBox="-14 -16 28 34"
                  aria-hidden="true"
                  style={{
                    color: (
                      {
                        calculation: '#55f6ff',
                        diagram: '#7ef2ce',
                        'long-answer': '#ff5ecb',
                        'short-answer': '#54f5b5',
                        unavailable: '#68708a',
                      } as Record<string, string>
                    )[detailRegistration ? detailActivity?.type || 'unavailable' : 'unavailable'],
                  }}
                >
                  <path
                    d="M0 -14 L11 -5 L8 8 L0 15 L-8 8 L-11 -5 Z"
                    fill="currentColor"
                    stroke="rgba(255,255,255,.8)"
                  />
                  <path d="M0 -14 L0 7 L-8 8 L-11 -5 Z" fill="rgba(255,255,255,.22)" />
                </svg>
                <div>
                  <strong id="activityType">
                    {detailRegistration
                      ? detailActivity?.typeLabel + ' activity'
                      : 'Activity not available'}
                  </strong>
                  <span id="activityStatus">
                    {detailRegistration ? 'Ready to use' : 'Planned resource'}
                  </span>
                </div>
              </div>
              <div className="activity-action" id="activityAction">
                {teacher && detailRegistration ? (
                  <a
                    className="activity-link"
                    id="activityLink"
                    href={'?course=' + course + '&view=teacher&gem=' + selected?.id}
                    data-type={detailActivity?.type}
                    onClick={(event) => {
                      event.preventDefault();
                      props.onOpenTeacher(selected?.id);
                    }}
                  >
                    {detailActivity?.type === 'diagram'
                      ? 'Choose diagram questions'
                      : 'Choose and print questions'}
                  </a>
                ) : null}
                <p
                  className="activity-unavailable"
                  id="activityUnavailable"
                  hidden={Boolean(detailRegistration)}
                >
                  No activity has been added for this subtopic yet.
                </p>
              </div>
              <p className="progress-note">
                Yellow: Grade 5–6. Green: Grade 7–8. Purple: Grade 9. Shine shows freshness; dull
                gems are due for review.
              </p>
            </>
          )}
        </dialog>
        <div className="landing-support">
          <button type="button" onClick={() => props.onOpenTeacher()}>
            Teacher
          </button>
          <button type="button" onClick={props.onOpenImport}>
            Import progress
          </button>
        </div>
        <p className="closing-line">Legends aren't born, they're forged</p>
      </main>
    </div>
  );
}
