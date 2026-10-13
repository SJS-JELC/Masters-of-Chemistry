import type { Question, Responses } from '../../../contracts/question.ts';
import type { Level } from '../../../contracts/identity.ts';

/** Checked rate family context; stable semantic gem registrations live in identity.ts. */
export type RateGem = 'orders' | 'graphs' | 'mechanisms' | 'arrhenius';
export interface CurveGraph {
  readonly kind: 'concentration';
  readonly initial: number;
  readonly k: number;
  readonly order: 0 | 1 | 2;
  readonly maxTime: number;
  readonly timeUnit: 's' | 'min';
  readonly initialMarker: number;
}
export interface ArrheniusGraph {
  readonly kind: 'arrhenius';
  readonly gradient: number;
  readonly intercept: number;
  readonly minX: number;
  readonly maxX: number;
  /** Display x as 1000/T; underlying x remains 1/T in K^-1. */
  readonly scaledX: boolean;
}
export type RateGraph = CurveGraph | ArrheniusGraph;
/** Static evidence panels regenerate from the ref; they create no assessed drawing state. */
export interface StaticRatePlot {
  readonly id: string;
  readonly title: string;
  readonly xLabel: string;
  readonly yLabel: string;
  readonly points: readonly Readonly<{ x: number; y: number }>[];
  readonly maxX: number;
  readonly maxY: number;
}
export interface RateExample {
  readonly gem: RateGem;
  readonly question: Question;
  readonly graph?: RateGraph;
  readonly staticPlots?: readonly StaticRatePlot[];
  readonly correctResponses: Responses;
  readonly validation: Readonly<Record<string, unknown>>;
}
export type RateFactory = (level: Level, seed: number) => RateExample;
