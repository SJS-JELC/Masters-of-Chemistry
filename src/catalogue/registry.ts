import type {
  ALevelActivityId,
  IGCSEActivityId,
  ActivityId,
  CurriculumActivityId,
  Course,
  SourceReference,
  ActivityRegistry,
  ActivityRegistration,
  CurriculumRegistration,
  GemRegistration,
  QuestionProvider,
  MarkingPolicy,
  Question,
  IdleLimitMs,
  LearningReviewPolicy,
  OlympiadRegistration,
  OlympiadActivityId,
} from '../contracts/index.ts';
import { activityDefinitions } from './definitions.ts';

type DefinitionBase = Readonly<{
  title: string;
  source: readonly SourceReference[];
  gems: readonly GemRegistration[];
}>;
export type ActivityDefinition = DefinitionBase &
  (
    | Readonly<{ id: ALevelActivityId; course: 'alevel'; strand: 'curriculum' }>
    | Readonly<{ id: IGCSEActivityId; course: 'igcse'; strand: 'curriculum' }>
    | Readonly<{
        id: OlympiadActivityId;
        course: 'alevel';
        strand: 'olympiad';
        gems: readonly [];
      }>
  );
export interface CurriculumAdapter {
  readonly id: CurriculumActivityId;
  readonly provider: () => Promise<QuestionProvider>;
  readonly marking: () => Promise<MarkingPolicy>;
  readonly learningReview?: () => Promise<LearningReviewPolicy>;
  readonly idleAllowance: (question: Question) => IdleLimitMs;
  readonly idleRationale: string;
}
/** Definitions remain disabled until their complete checked activity adapter is supplied. */
export function createRegistry(
  adapters: readonly CurriculumAdapter[],
  olympiad?: OlympiadRegistration | readonly OlympiadRegistration[],
): ActivityRegistry {
  const seen = new Set<ActivityId>();
  const activities: ActivityRegistration[] = adapters.map((adapter) => {
    if (seen.has(adapter.id)) throw Error(`Duplicate activity adapter: ${adapter.id}`);
    seen.add(adapter.id);
    const definition = activityDefinitions.find((item) => item.id === adapter.id);
    if (!definition || definition.strand !== 'curriculum')
      throw Error(`Unknown curriculum adapter: ${adapter.id}`);
    const common = {
      title: definition.title,
      release: 'included' as const,
      source: definition.source,
      gems: definition.gems,
      strand: 'curriculum' as const,
      renderer: 'question-player' as const,
      revision: true as const,
      provider: adapter.provider,
      marking: adapter.marking,
      idleAllowance: adapter.idleAllowance,
      idleRationale: adapter.idleRationale,
      ...(adapter.learningReview ? { learningReview: adapter.learningReview } : {}),
    };
    return definition.course === 'alevel'
      ? { ...common, course: 'alevel' as const, id: definition.id }
      : { ...common, course: 'igcse' as const, id: definition.id };
  });
  for (const challenge of olympiad ? Array.isArray(olympiad) ? olympiad : [olympiad] : []) {
    if (
      !activityDefinitions.some(d => d.id === challenge.id && d.strand === 'olympiad') ||
      challenge.strand !== 'olympiad' ||
      challenge.revision !== false || seen.has(challenge.id)
    )
      throw Error('Invalid Olympiad registration');
    seen.add(challenge.id);
    activities.push(challenge);
  }
  return {
    activities: Object.freeze(activities),
    get: (id: ActivityId) => activities.find((item) => item.id === id),
    curriculumFor: (course: Course) =>
      activities.filter(
        (item): item is CurriculumRegistration =>
          item.strand === 'curriculum' && item.course === course,
      ),
  };
}
