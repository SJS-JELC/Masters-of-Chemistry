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
  return graph ? <RateGraphTools graph={graph} assessed={assessed}
    {...(state ? { state } : {})} {...(onStateChange ? { onStateChange } : {})} /> : null;
}
