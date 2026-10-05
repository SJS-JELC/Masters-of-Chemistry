import { activityDefinitions } from '../catalogue/definitions.ts';
import { historicalLeaves } from '../catalogue/historical-leaves.ts';

interface BoundaryDefinition {
  readonly id: string;
  readonly course: 'alevel' | 'igcse';
  readonly strand: 'curriculum' | 'olympiad';
  readonly gems: readonly {
    readonly id: string;
    readonly supportedLevels: readonly number[];
    readonly mastery: { readonly historicalAliases: readonly string[] };
  }[];
}
interface HistoricalLeaf {
  readonly id: string;
  readonly activityId: string;
  readonly levels: readonly number[];
}
interface LeafBoundary {
  readonly activityId: string;
  readonly levels: readonly number[];
  readonly historicalOnly?: boolean;
}

/** Canonical content metadata supplies identities; persistence has no second active list. */
export function deriveCatalogueBoundary(
  definitions: readonly BoundaryDefinition[],
  historical: readonly HistoricalLeaf[] = [],
): {
  readonly activityIds: readonly string[];
  readonly leaves: Readonly<Record<string, LeafBoundary>>;
} {
  const leaves: Record<string, LeafBoundary> = Object.create(null);
  const activityIds: string[] = [];
  const add = (id: string, value: LeafBoundary) => {
    if (Object.hasOwn(leaves, id)) throw new Error('Duplicate catalogue leaf: ' + id);
    leaves[id] = Object.freeze({ ...value, levels: Object.freeze([...value.levels]) });
  };
  for (const definition of definitions) {
    if (definition.strand !== 'curriculum') continue;
    if (activityIds.includes(definition.id))
      throw new Error('Duplicate catalogue activity: ' + definition.id);
    activityIds.push(definition.id);
    for (const gem of definition.gems) {
      add(gem.id, { activityId: definition.id, levels: gem.supportedLevels });
      for (const alias of gem.mastery.historicalAliases) {
        add(alias, {
          activityId: definition.id,
          levels: gem.supportedLevels,
          historicalOnly: true,
        });
      }
    }
  }
  for (const leaf of historical) {
    if (!activityIds.includes(leaf.activityId))
      throw new Error('Historical leaf lacks a curriculum activity');
    add(leaf.id, { activityId: leaf.activityId, levels: leaf.levels, historicalOnly: true });
  }
  return { activityIds: Object.freeze(activityIds), leaves: Object.freeze(leaves) };
}

const boundary = deriveCatalogueBoundary(activityDefinitions, historicalLeaves);
export const curriculumActivityIds = boundary.activityIds;
export const leafBoundary = boundary.leaves;
