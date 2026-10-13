import { useMemo } from 'react';
import type { QuestionRef } from '../../../contracts/identity.ts';
import type { RateGraphWorkspaceState } from '../../../contracts/workspace.ts';
import { restoreRateExample } from './provider.ts';
import { RateGraphTools } from './RateGraphTools.tsx';
/** Lazy graph reconstruction from the canonical ref; the shared host alone saves. */
export function RateGraphWorkspace({ questionRef, assessed, state, onStateChange }: {
  readonly questionRef: QuestionRef;
  readonly assessed: boolean;
  readonly state?: RateGraphWorkspaceState;
  readonly onStateChange?: (state: RateGraphWorkspaceState) => void;
}) {
  const graph = useMemo(() => restoreRateExample(questionRef).graph, [questionRef]);
  return graph ? <>
    {graph.kind === 'arrhenius' && <aside className="arrhenius-data-book" aria-label="Excerpt from data book">
      <h3>Excerpt from data book</h3>
      <p>Arrhenius equation: <span className="arrhenius-data-equation">k = Ae<sup>−E<sub>a</sub>/RT</sup></span>
        {' or '}<span className="arrhenius-data-equation">ln k = −E<sub>a</sub>/RT + ln A</span></p>
      <p>Gas constant, R = 8.314 J mol<sup>−1</sup> K<sup>−1</sup></p>
    </aside>}
    <RateGraphTools graph={graph} assessed={assessed}
    compact={/^RATE-POC-graphs-L[123]$/.test(questionRef.questionId)}
    snapConcentration={questionRef.questionId === 'RATE-POC-graphs-L2'}
    {...(state ? { state } : {})} {...(onStateChange ? { onStateChange } : {})} />
  </> : null;
}
