import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { OriginalLanding } from '../../../src/landing';
import { productionRegistry } from '../../../src/foundation/registry';
import type { Course, Level } from '../../../src/contracts/identity';
import type { CurriculumEvidence } from '../../../src/contracts/session';
import '../../../src/styles/platform.css';
const params = new URLSearchParams(location.search),
  initial = params.get('course') === 'igcse' ? 'igcse' : 'alevel';
const grade = Number(params.get('grade') || 0),
  days = Number(params.get('days') || 0),
  now = Date.now();
const history: CurriculumEvidence[] = [];
for (const course of ['alevel', 'igcse'] as const)
  for (const activity of productionRegistry.curriculumFor(course))
    for (const gem of activity.gems)
      for (const level of gem.supportedLevels) {
        if (level > grade) continue;
        for (let index = 0; index < 16; index++)
          history.push({
            kind: 'curriculum',
            id: `fixture-${course}-${gem.id}-${level}-${index}`,
            profileId: 'local',
            course,
            gemId: gem.id,
            score: 1,
            completedAt: now - days * 86400000 - (16 - index) * 1000,
            provenance: 'legacy-import',
            progressionVersion: gem.mastery.activeProgressionVersion ?? 1,
            ...(course === 'alevel' ? { level: level as Level } : { grade: level as Level }),
          } as CurriculumEvidence);
      }
Object.assign(window, { landingFixture: { history, launches: [], actions: [] } });
function Harness() {
  const [course, setCourse] = useState<Course>(initial);
  return (
    <OriginalLanding
      course={course}
      registry={productionRegistry}
      history={history}
      onSelectCourse={(next) => {
        const url = new URL(location.href);
        url.searchParams.set('course', next);
        url.hash = '';
        window.history.replaceState(null, '', url);
        setCourse(next);
      }}
      onLaunch={(request) => (window as any).landingFixture.launches.push(request)}
      onOpenStatistics={() => (window as any).landingFixture.actions.push('statistics')}
      onOpenOlympiad={() => (window as any).landingFixture.actions.push('olympiad')}
      onOpenTeacher={(gemId) =>
        (window as any).landingFixture.actions.push({ action: 'teacher', gemId })
      }
      onOpenImport={() => (window as any).landingFixture.actions.push('import')}
    />
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Harness />
  </StrictMode>,
);
