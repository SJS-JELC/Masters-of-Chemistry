import type { Course, CurriculumTarget, GemId, Level } from './identity';
import type { ActivityRegistry } from './registry';
import type { CurriculumEvidence } from './session';

/** A user action has a stable token, so StrictMode cannot launch it twice. */
export type LandingLaunchRequest =
  | Readonly<{
      id: string;
      kind: 'practice';
      course: Course;
      gemId: GemId;
      selection: 'fixed-level';
      level: Level;
    }>
  | Readonly<{ id: string; kind: 'practice'; course: Course; gemId: GemId; selection: 'mastery' }>
  | Readonly<{ id: string; kind: 'revision'; course: Course; gemIds: readonly GemId[] }>;

export interface OriginalLandingProps {
  readonly course: Course;
  readonly registry: ActivityRegistry;
  readonly history: readonly CurriculumEvidence[];
  readonly onSelectCourse: (course: Course) => void;
  readonly onLaunch: (request: LandingLaunchRequest) => void;
  readonly onOpenStatistics: () => void;
  readonly onOpenRecall: () => void;
  readonly onOpenOlympiad: () => void;
  readonly onOpenTeacher: (gemId?: GemId) => void;
  readonly onOpenImport: () => void;
  readonly message?: string;
}

/** Validated request passed to the host; display-only gems never reach this boundary. */
export type CurriculumLaunchRequest =
  | Readonly<{
      id: string;
      kind: 'practice';
      target: CurriculumTarget;
      selection: 'fixed-level' | 'mastery';
      fresh: true;
    }>
  | Readonly<{
      id: string;
      kind: 'revision';
      course: Course;
      targets: readonly CurriculumTarget[];
      gemIds: readonly GemId[];
    }>;
