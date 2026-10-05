import type { ActivityId, Course, Namespace, QuestionRef } from './identity';
import type { ActivityRegistry } from './registry';
import type { ImportBatch } from './repository';
import type { CurriculumLaunchRequest } from './landing';

export type PlatformView =
  | 'home'
  | 'practice'
  | 'revision'
  | 'recall'
  | 'teacher'
  | 'statistics'
  | 'import'
  | 'olympiad';
export interface CourseDataViewProps {
  readonly course: Course;
  readonly namespace: Namespace;
  readonly databaseName: string;
  readonly registry: ActivityRegistry;
}
export interface TeacherCatalogueEntry {
  readonly key: string;
  readonly label: string;
  readonly ref: QuestionRef;
  readonly group?: string;
}
export type CompatibilityResolution =
  | Readonly<{ kind: 'curriculum'; ref: QuestionRef; source: string }>
  | Readonly<{ kind: 'olympiad'; activityId: 'alevel/c3l6-organic-reactions'; source: string }>
  | Readonly<{ kind: 'unrecognized'; raw: string; reason: string }>;
export interface LegacyRejectedRecord {
  readonly sourceKey: string;
  readonly sourceId: string;
  readonly raw: unknown;
  readonly reason: string;
}
export interface LegacyImportPlan {
  readonly batches: readonly ImportBatch[];
  readonly rejected: readonly LegacyRejectedRecord[];
  readonly notes: readonly string[];
}
export interface CurriculumHostIntegration {
  readonly registry?: ActivityRegistry;
  readonly view?: Extract<PlatformView, 'practice' | 'revision' | 'teacher'>;
  readonly onSelectView?: (view: PlatformView) => void;
  readonly initialActivityId?: ActivityId;
  /** Exact resolved historical level/seed for read-only review. */
  readonly reviewRef?: QuestionRef;
  /** Source-owned IGCSE diagram category for an initial teacher catalogue selection. */
  readonly initialTeacherGroup?: 'ionic' | 'covalent';
  /** An explicit map action, consumed after restoration and the durable leave gate. */
  readonly launchRequest?: CurriculumLaunchRequest;
  readonly onLaunchConsumed?: (id: string) => void;
  /** Browser history must use the same save gate as the visible Home button. */
  readonly onNavigationGuard?: (guard: (() => Promise<boolean>) | null) => void;
}
