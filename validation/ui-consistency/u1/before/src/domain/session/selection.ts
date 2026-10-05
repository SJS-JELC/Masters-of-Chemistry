import { activityScope } from '../../catalogue/scope.ts';
import type { Course, CurriculumTarget, GemId, Level } from '../../contracts/identity.ts';
import type { CurriculumRegistration } from '../../contracts/registry.ts';

/** Validate source-owned target identities, not catalogue display order. */
export function validCurriculumTarget(target: CurriculumTarget): boolean {
  for (const activity of activityScope) {
    if (
      activity.strand !== 'curriculum' ||
      activity.id !== target.activityId ||
      activity.course !== target.course
    )
      continue;
    for (const gem of activity.gems) {
      const levels: readonly Level[] = gem.supportedLevels;
      if (gem.id === target.gemId && levels.includes(target.level)) return true;
    }
  }
  return false;
}

export function supportedCurriculumLevels(target: CurriculumTarget): readonly Level[] {
  for (const activity of activityScope) {
    if (
      activity.strand !== 'curriculum' ||
      activity.id !== target.activityId ||
      activity.course !== target.course
    )
      continue;
    const gem = activity.gems.find((item) => item.id === target.gemId);
    if (gem) return gem.supportedLevels;
  }
  throw new Error('Unknown curriculum gem.');
}

function targetFor(
  registration: CurriculumRegistration,
  gemId: GemId,
  level: Level,
): CurriculumTarget {
  return registration.course === 'alevel'
    ? { course: registration.course, activityId: registration.id, gemId, level }
    : { course: registration.course, activityId: registration.id, gemId, level };
}

export function selectCurriculumTargets(
  registrations: readonly CurriculumRegistration[],
  course: Course,
  selectedGemIds: readonly GemId[],
): readonly CurriculumTarget[] {
  if (new Set(selectedGemIds).size !== selectedGemIds.length)
    throw new Error('Duplicate gem selection.');
  const targets: CurriculumTarget[] = [];
  for (const gemId of selectedGemIds) {
    const owners = registrations.filter(
      (registration) =>
        registration.course === course && registration.gems.some((gem) => gem.id === gemId),
    );
    if (owners.length !== 1) throw new Error('Select a uniquely registered curriculum gem.');
    const owner = owners[0];
    if (!owner) throw new Error('Unavailable curriculum gem.');
    const gem = owner.gems.find((item) => item.id === gemId);
    if (!gem || !gem.supportedLevels.length) throw new Error('Gem has no supported levels.');
    for (const level of gem.supportedLevels) {
      const target = targetFor(owner, gem.id, level);
      if (!validCurriculumTarget(target)) throw new Error('Unsupported curriculum target.');
      targets.push(target);
    }
  }
  return targets;
}

export function topicTargets(
  registrations: readonly CurriculumRegistration[],
  course: Course,
  topicId: string,
): readonly CurriculumTarget[] {
  const ids = registrations
    .filter((registration) => registration.course === course)
    .flatMap((registration) =>
      registration.gems.filter((gem) => gem.topicId === topicId).map((gem) => gem.id),
    );
  return selectCurriculumTargets(registrations, course, ids);
}

export function sameTarget(a: CurriculumTarget, b: CurriculumTarget): boolean {
  return (
    a.course === b.course &&
    a.activityId === b.activityId &&
    a.gemId === b.gemId &&
    a.level === b.level
  );
}
