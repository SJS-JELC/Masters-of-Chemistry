import type { ProfileId, Level } from './identity.ts';
export interface MaxwellCheck {
  readonly fingerprint: string;
  readonly correct: readonly string[];
}
export interface MaxwellProgress {
  readonly kind: 'olympiad-completion';
  readonly course: 'alevel';
  readonly profileId: ProfileId;
  readonly activityId: 'alevel/maxwells-demon';
  readonly level: Level;
  readonly introduction?: boolean;
  readonly responses: Readonly<Record<string, string>>;
  readonly checks: Readonly<Partial<Record<Level, MaxwellCheck>>>;
  readonly revealed: readonly Level[];
}
export type MaxwellCommand =
  | Readonly<{ kind: 'maxwell-level'; level: Level }>
  | Readonly<{ kind: 'maxwell-answer'; id: string; value: string }>
  | Readonly<{ kind: 'maxwell-check' | 'maxwell-introduction' }>
  | Readonly<{ kind: 'restart' }>;
export interface MaxwellChallenge {
  readonly activityId: 'alevel/maxwells-demon';
}
export interface MaxwellPolicy {
  readonly transition: (
    challenge: MaxwellChallenge,
    p: MaxwellProgress,
    c: MaxwellCommand,
  ) => Readonly<{ accepted: boolean; progress: MaxwellProgress; message: string }>;
  readonly validateCompletion: (challenge: MaxwellChallenge, p: MaxwellProgress) => MaxwellProgress;
}
