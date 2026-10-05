import type { MoleculeState } from './editors';
import type { ProfileId } from './identity';
import type { ContentBlock } from './question';
import type { MoleculeGraph } from './editors';

export type C3Classification = 'oxidation' | 'reduction' | 'hydrolysis';
export type C3BSlot = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'J' | 'K' | 'L' | 'M';
export type C3CSlot = 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
export type C3BUnitId = 'b-i' | 'b-ii' | 'b-iii' | 'b-iv-1' | 'b-iv-2' | 'b-iv-3' | 'b-iv-4';
export interface ChallengeCheck {
  readonly correct: number;
  readonly total: number;
  readonly passed: boolean;
  readonly drawingFingerprint: string; // guards stale check data, not question snapshots
}
export interface C3L6Progress {
  readonly kind: 'olympiad-completion';
  readonly course: 'alevel';
  readonly profileId: ProfileId;
  readonly activityId: 'alevel/c3l6-organic-reactions';
  readonly stage: 'intro' | 'a' | 'b' | 'c';
  readonly classifications: Readonly<Partial<Record<string, C3Classification>>>;
  readonly drawingsB: Readonly<Partial<Record<C3BSlot, MoleculeState>>>;
  readonly drawingsC: Readonly<Partial<Record<C3CSlot, MoleculeState>>>;
  readonly selected: Readonly<{ b: C3BSlot; c: C3CSlot }>;
  readonly aCheck: ChallengeCheck | null;
  readonly unitChecks: Readonly<Partial<Record<C3BUnitId, ChallengeCheck>>>;
  readonly slotChecks: Readonly<Partial<Record<C3CSlot, ChallengeCheck>>>;
  readonly completed: Readonly<{ a: boolean; b: boolean; c: boolean }>;
  /** Exact prior saved outcome retained separately from current chemical validation. */
  readonly historicalOutcome?: Readonly<{
    policyVersion: 'c3l6-source-bank-23';
    reason: 'K-orthoacid-erratum';
    raw: Omit<C3L6Progress, 'historicalOutcome'> & { readonly historicalOutcome?: never };
  }>;
  readonly gemId?: never;
  readonly score?: never;
  readonly mastery?: never;
  readonly revision?: never;
}
export interface C3L6Dependencies {
  readonly bUnits: readonly Readonly<{ id: C3BUnitId; slots: readonly C3BSlot[] }>[];
  readonly interchangeable: readonly (readonly [C3BSlot, C3BSlot])[];
  readonly unlocks: readonly Readonly<{
    stage: 'b' | 'c';
    requires: 'a-correct' | 'all-b-units-correct';
  }>[];
}
export interface C3MoleculeAnswer {
  readonly smiles: string;
  readonly formula: string;
  readonly graph: MoleculeGraph;
}
export interface C3DrawingSlot<Id extends C3BSlot | C3CSlot> {
  readonly id: Id;
  readonly label: string;
  readonly mass?: number;
  readonly alternatives: readonly C3MoleculeAnswer[];
}
/** Challenge content has stages/units instead of an artificial curriculum level. */
export interface C3L6Challenge {
  readonly activityId: 'alevel/c3l6-organic-reactions';
  readonly introduction: readonly ContentBlock[];
  readonly classifications: readonly Readonly<{
    id: string;
    label: string;
    reaction: readonly ContentBlock[];
    answer: C3Classification;
  }>[];
  readonly hydrolysis: readonly Readonly<{
    unitId: C3BUnitId;
    context: readonly ContentBlock[];
    slots: readonly C3DrawingSlot<C3BSlot>[];
  }>[];
  readonly network: Readonly<{
    context: readonly ContentBlock[];
    slots: readonly C3DrawingSlot<C3CSlot>[];
  }>;
  readonly dependencies: C3L6Dependencies;
}
export type ChallengeCommand =
  | Readonly<{ kind: 'classify'; id: string; value: C3Classification }>
  | Readonly<{ kind: 'restart' }>
  | Readonly<{ kind: 'draw-b'; slotId: C3BSlot; drawing: MoleculeState }>
  | Readonly<{ kind: 'draw-c'; slotId: C3CSlot; drawing: MoleculeState }>
  | Readonly<{ kind: 'check-a' }>
  | Readonly<{ kind: 'check-b-unit'; unitId: C3BUnitId }>
  | Readonly<{ kind: 'check-c-slot'; slotId: C3CSlot }>
  | Readonly<{ kind: 'select-slot'; stage: 'b'; slotId: C3BSlot }>
  | Readonly<{ kind: 'select-slot'; stage: 'c'; slotId: C3CSlot }>
  | Readonly<{ kind: 'navigate'; stage: C3L6Progress['stage'] }>;
export interface C3L6Policy {
  readonly transition: (
    challenge: C3L6Challenge,
    progress: C3L6Progress,
    command: ChallengeCommand,
  ) => Readonly<{ accepted: boolean; progress: C3L6Progress; message: string }>;
  readonly validateCompletion: (challenge: C3L6Challenge, progress: C3L6Progress) => C3L6Progress;
}
