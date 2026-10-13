import { useMemo } from 'react';
import type { QuestionRef } from '../../../contracts/identity.ts';
import type { RateGraphWorkspaceState } from '../../../contracts/workspace.ts';
import { rateSource } from './identity.ts';
import { restoreRateExample } from './provider.ts';
import { RateGraphTools } from './RateGraphTools.tsx';
import { StaticRatePlots } from './StaticRatePlots.tsx';
/** Lazy graph reconstruction from the canonical ref; the shared host alone saves. */
export function RateGraphWorkspace({ questionRef, assessed, state, onStateChange }: {
  readonly questionRef: QuestionRef;
  readonly assessed: boolean;
  readonly state?: RateGraphWorkspaceState;
  readonly onStateChange?: (state: RateGraphWorkspaceState) => void;
}) {
  const source = rateSource(questionRef.questionId);
  const example = useMemo(() => restoreRateExample(questionRef), [questionRef]);
  const graph = example.graph;
  return <>
    {example.staticPlots && <StaticRatePlots plots={example.staticPlots} />}
    {graph && <>
    {graph.kind === 'arrhenius' && <aside className="arrhenius-data-book" aria-label="Excerpt from data book">
      <h3>Excerpt from data book</h3>
      <p>Arrhenius equation: <span className="arrhenius-data-equation">k = Ae<sup>−E<sub>a</sub>/RT</sup></span>
        {' or '}<span className="arrhenius-data-equation">ln k = −E<sub>a</sub>/RT + ln A</span></p>
      <p>Gas constant, R = 8.314 J mol<sup>−1</sup> K<sup>−1</sup></p>
    </aside>}
    <RateGraphTools graph={graph} assessed={assessed}
    compact={source?.gem === 'graphs'}
    snapConcentration={source?.gem === 'graphs' && source.level === 2}
    {...(state ? { state } : {})} {...(onStateChange ? { onStateChange } : {})} />
    </>}
  </>;
}
