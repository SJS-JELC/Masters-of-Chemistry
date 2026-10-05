/** Stable source IDs are copied verbatim; never derive them from display order. */
export type Course = 'alevel' | 'igcse';
export type Level = 1 | 2 | 3;
export type MasteryScore = 0 | 0.5 | 1;
export type QuestionId = string;
export type PartId = string;
export type AttemptId = string;
export type ProfileId = string;
export type SessionId = string;
export type GemId = string;
/** Validate unsigned 32-bit integer at provider/import boundaries. */
export type Seed = number;
export type ALevelActivityId =
  | 'alevel/acid-base-calculations'
  | 'alevel/electrons-bonding'
  | 'alevel/explaining-properties'
  | 'alevel/electron-configurations'
  | 'alevel/dot-and-cross'
  | 'alevel/ph-titration-curves';
export type IGCSEActivityId =
  | 'igcse/calorimetry'
  | 'igcse/bond-enthalpy'
  | 'igcse/structure-and-bonding'
  | 'igcse/dot-and-cross'
  | 'igcse/energy-enthalpy'
  | 'igcse/energetics-practical';
export type CurriculumActivityId = ALevelActivityId | IGCSEActivityId;
export type OlympiadActivityId = 'alevel/c3l6-organic-reactions' | 'alevel/olympiad-2011-q4';
export type ActivityId = CurriculumActivityId | OlympiadActivityId;
export type Namespace = Readonly<{ course: Course; profileId: ProfileId }>;
export type CurriculumTarget =
  | Readonly<{ course: 'alevel'; activityId: ALevelActivityId; gemId: GemId; level: Level }>
  | Readonly<{ course: 'igcse'; activityId: IGCSEActivityId; gemId: GemId; level: Level }>;
/** Fixed questions also carry a seed (normally 0); content is restored by provider. */
export interface QuestionRef {
  readonly activityId: ActivityId;
  readonly questionId: QuestionId;
  readonly seed: Seed;
  readonly level: Level;
}
export interface CurriculumQuestionRef extends QuestionRef {
  readonly activityId: CurriculumActivityId;
}
export interface SourceReference {
  readonly path: string;
  readonly sha256: string;
  readonly symbolOrSection: string;
}
