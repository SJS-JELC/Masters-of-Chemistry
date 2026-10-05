// Revision, mastery and persistence use the same checked catalogue metadata.
import type { ALevelActivityId, IGCSEActivityId, Level, OlympiadActivityId } from '../contracts/index.ts';
import { activityDefinitions } from './definitions.ts';
import type { ActivityDefinition } from './registry.ts';
type CurriculumScope<Id, Course> = Readonly<{
  id: Id;
  course: Course;
  strand: 'curriculum';
  supportedLevels: readonly Level[];
  gems: readonly Readonly<{ id: string; supportedLevels: readonly Level[] }>[];
}>;
export type ActivityScope =
  | CurriculumScope<ALevelActivityId, 'alevel'>
  | CurriculumScope<IGCSEActivityId, 'igcse'>
  | Readonly<{
      id: OlympiadActivityId;
      course: 'alevel';
      strand: 'olympiad';
      supportedLevels: readonly [];
      gems: readonly [];
    }>;
export function deriveActivityScope(
  definitions: readonly ActivityDefinition[],
): readonly ActivityScope[] {
  return Object.freeze(
    definitions.map((definition) => {
      if (definition.strand === 'olympiad')
        return Object.freeze({
          id: definition.id,
          course: definition.course,
          strand: definition.strand,
          supportedLevels: Object.freeze([]) as readonly [],
          gems: Object.freeze([]) as readonly [],
        });
      const gems = Object.freeze(
        definition.gems.map((gem) =>
          Object.freeze({ id: gem.id, supportedLevels: Object.freeze([...gem.supportedLevels]) }),
        ),
      );
      const supportedLevels = Object.freeze(
        [...new Set(gems.flatMap((gem) => gem.supportedLevels))].sort(),
      );
      return definition.course === 'alevel'
        ? Object.freeze({
            id: definition.id,
            course: definition.course,
            strand: definition.strand,
            supportedLevels,
            gems,
          })
        : Object.freeze({
            id: definition.id,
            course: definition.course,
            strand: definition.strand,
            supportedLevels,
            gems,
          });
    }),
  );
}
export const activityScope = deriveActivityScope(activityDefinitions);
