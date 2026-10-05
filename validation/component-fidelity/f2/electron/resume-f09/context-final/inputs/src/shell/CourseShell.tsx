import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useStore } from 'zustand';
import type { ActivityId, Course } from '../contracts/identity.ts';
import type { ActivityRegistry } from '../contracts/registry.ts';
import type { PlatformView } from '../contracts/integration.ts';
import { createNavigationViewStore } from './navigation-view.ts';
import { QuestionChrome, QuestionChromeContext } from './QuestionChrome.tsx';
import type { QuestionHeader } from './QuestionChrome.tsx';
import '../styles/platform.css';

/** Geometry retained from the original A Level landing/app.js gem icon. */
export function Gem() {
  return (
    <svg className="brand-gem" viewBox="-14 -16 28 34" aria-hidden="true">
      <path className="gem-body" d="M0 -13 L10.5 -4 L8 7.5 L0 14 L-8 7.5 L-10.5 -4 Z" />
      <path className="gem-facet" d="M0 -13 L0 6 L-8 7.5 L-10.5 -4 Z" />
      <path className="gem-facet second" d="M0 6 L8 7.5 L0 14 Z" />
    </svg>
  );
}

export interface CourseShellProps {
  readonly course: Course;
  readonly registry: ActivityRegistry;
  readonly children: ReactNode;
  readonly currentActivityId?: ActivityId;
  readonly onSelectActivity?: (activityId: ActivityId) => void;
  readonly currentView?: PlatformView;
  readonly onSelectView?: (view: PlatformView) => void;
  readonly focused?: boolean;
  readonly questionHeader?: QuestionHeader;
}
export function CourseShell({
  course,
  registry,
  children,
  currentActivityId,
  onSelectActivity,
  currentView = 'practice',
  onSelectView,
  focused = false,
  questionHeader,
}: CourseShellProps) {
  const navigationView = useMemo(() => createNavigationViewStore(), [course]);
  const curriculumOpen = useStore(navigationView, (state) => state.curriculumOpen);
  const olympiadOpen = useStore(navigationView, (state) => state.olympiadOpen);
  const curriculum = registry.curriculumFor(course);
  const olympiad = registry.activities.filter(
    (activity) => activity.course === course && activity.strand === 'olympiad',
  );
  const title = course === 'alevel' ? 'A Level Chemistry' : 'IGCSE Chemistry';
  return (
    <QuestionChromeContext.Provider value={questionHeader}>
      <div
        className={`course-shell ${focused ? 'course-focused' : ''} ${questionHeader ? 'course-question-screen' : ''}`}
      >
        <a className="skip-link" href="#main-content">
          Skip to question
        </a>
        {questionHeader ? (
          <QuestionChrome
            course={course}
            metadata={questionHeader}
            {...(onSelectView ? { onBack: () => onSelectView('home') } : {})}
          />
        ) : (
          <header className="site-header">
            <div className="brand">
              <img
                className="brand-eagle"
                src={`${import.meta.env.BASE_URL}assets/SJS-Eagle.svg`}
                alt="St John's School eagle"
              />
              <div>
                <p className="eyebrow">Masters of Chemistry</p>
                <h1>{title}</h1>
              </div>
            </div>
            <span className="course-badge">{course === 'alevel' ? 'OCR A' : 'IGCSE'}</span>
            {onSelectView && (
              <button type="button" onClick={() => onSelectView('home')}>
                Home
              </button>
            )}
          </header>
        )}
        {!questionHeader && onSelectView && (
          <nav className="platform-navigation" aria-label="Course views">
            {(
              [
                'practice',
                'revision',
                'teacher',
                'statistics',
                'import',
                ...(course === 'alevel' ? ['olympiad'] : []),
              ] as PlatformView[]
            ).map((item) => (
              <button
                type="button"
                key={item}
                aria-current={currentView === item ? 'page' : undefined}
                onClick={() => onSelectView(item)}
              >
                {item === 'import'
                  ? 'Import progress'
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>
        )}
        <div className="course-layout">
          {!questionHeader && (
            <nav className="course-navigation" aria-label={`${title} activities`}>
              <details
                open={curriculumOpen}
                onToggle={(event) =>
                  navigationView.getState().setCurriculumOpen(event.currentTarget.open)
                }
              >
                <summary>Curriculum activities</summary>
                <ul>
                  {curriculum.map((activity) => (
                    <li key={activity.id}>
                      {onSelectActivity ? (
                        <button
                          type="button"
                          aria-current={currentActivityId === activity.id ? 'page' : undefined}
                          onClick={() => onSelectActivity(activity.id)}
                        >
                          <Gem />
                          <span>{activity.title}</span>
                        </button>
                      ) : (
                        <span className="nav-label">
                          <Gem />
                          {activity.title}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
              {olympiad.length > 0 && (
                <details
                  open={olympiadOpen}
                  onToggle={(event) =>
                    navigationView.getState().setOlympiadOpen(event.currentTarget.open)
                  }
                >
                  <summary>Olympiad challenges</summary>
                  <ul>
                    {olympiad.map((activity) => (
                      <li key={activity.id}>
                        {onSelectActivity ? (
                          <button
                            type="button"
                            aria-current={currentActivityId === activity.id ? 'page' : undefined}
                            onClick={() => onSelectActivity(activity.id)}
                          >
                            {activity.title}
                          </button>
                        ) : (
                          <span className="nav-label">{activity.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </nav>
          )}
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
        <footer className="site-footer">Legends aren't born, they're forged</footer>
      </div>
    </QuestionChromeContext.Provider>
  );
}
