import type { Course, CurriculumTarget } from '../contracts/identity.ts';
import type { ActivityRegistry } from '../contracts/registry.ts';
import { recallCoverage } from '../recall/facts.ts';
/** Recall catalogue remains behind the lazy landing/Recall boundary. */
export function gemMasteryAvailability(course: Course, gemId: string, registry: ActivityRegistry) {
  const recall = recallCoverage(course).find((gem) => gem.gemId === gemId);
  const registration = registry
    .curriculumFor(course)
    .find((item) => item.gems.some((gem) => gem.id === gemId));
  const gem = registration?.gems.find((item) => item.id === gemId);
  const firstLevel = gem?.supportedLevels[0];
  const target =
    registration && firstLevel !== undefined
      ? ({ course, activityId: registration.id, gemId, level: firstLevel } as CurriculumTarget)
      : null;
  return { known: !!recall || !!gem, facts: recall?.factIds.length ?? 0, target };
}
