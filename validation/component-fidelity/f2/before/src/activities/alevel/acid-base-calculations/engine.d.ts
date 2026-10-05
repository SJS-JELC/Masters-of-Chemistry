import type { Level } from '../../../contracts/index.ts';
export interface AcidResponse {
  readonly key: string;
  readonly prompt: string;
  readonly symbol: string;
  readonly unit: string;
  readonly expected: number;
  readonly format: 'sf3' | 'sf4' | 'dp2' | 'dp3' | 'integer';
  readonly tolerance: number;
}
export interface AcidQuestion {
  readonly version?: number;
  readonly legacy?: boolean;
  readonly seed: number;
  readonly level: Level;
  readonly templateId: string;
  readonly templateLabel: string;
  readonly familyLabel: string;
  readonly target: string;
  readonly reviewId: string;
  readonly intro: string;
  readonly rows: readonly Readonly<{ label: string; value: string }>[];
  readonly responses: readonly AcidResponse[];
  readonly allResponses: readonly AcidResponse[];
  readonly working: readonly string[];
  readonly answerParts: readonly (readonly string[])[];
  readonly audit: readonly Readonly<{ name: string; valid: boolean; detail: string }>[];
}
export type AcidScore =
  | Readonly<{ accepted: false; reason: string }>
  | Readonly<{
      accepted: true;
      results: readonly Readonly<{ entered: number; status: 'correct' | 'incorrect' }>[];
      score: 0 | 0.5 | 1;
    }>;
export interface AcidScope {
  readonly id: string;
  readonly label: string;
  readonly levels: Readonly<Record<Level, readonly string[]>>;
}
export const acidEngine: Readonly<{
  version: 2;
  LEVEL_LABELS: Readonly<Record<Level, string>>;
  scopes: readonly AcidScope[];
  templates: readonly Readonly<{
    id: string;
    familyLabel: string;
    label: string;
    target: string;
  }>[];
  scopeFor: (id: string) => AcidScope | null;
  templatesFor: (scope: string, level: Level) => string[];
  chooseTemplate: (
    scope: string,
    level: Level,
    used: readonly string[],
    random: number,
  ) => Readonly<{ templateId: string; used: string[] }>;
  generate: (template: string, level: Level, seed: number) => AcidQuestion;
  generateFromReview: (id: string) => AcidQuestion;
  score: (values: readonly string[], responses: readonly AcidResponse[]) => AcidScore;
  decodeCanonical: (id: string) => Readonly<{ templateId: string; level: Level; seed: number }>;
  reviewId: (template: string, level: Level, seed: number) => string;
}>;
