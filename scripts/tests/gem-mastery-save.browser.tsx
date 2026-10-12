import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RecallView } from '../../src/recall/RecallView.tsx';
import { createChemistryRepository } from '../../src/persistence/repository.ts';
import type { ChemistryRepository } from '../../src/contracts/repository.ts';
const repository = createChemistryRepository(
  'masters-of-chemistry-alpha-v2-igcse-mastery-save-gate',
);
const state = { completions: 0, completionWrites: 0, failuresRemaining: 1, repository };
(window as unknown as { masterySaveGate: typeof state }).masterySaveGate = state;
const guarded: ChemistryRepository = {
  ...repository,
  async saveRecallSession(session) {
    if (session.status === 'complete') {
      state.completionWrites++;
      if (state.failuresRemaining-- > 0)
        return {
          ok: false,
          error: { code: 'quota', retryable: true, message: 'Synthetic completion save blocked.' },
        };
    }
    return repository.saveRecallSession(session);
  },
};
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecallView
      course="igcse"
      gemIds={['fourth-1-1']}
      repository={guarded}
      flowSessionId="mastery-recall:save-gate:fourth-1-1"
      autoStart
      onHome={() => {}}
      onComplete={() => {
        state.completions++;
      }}
    />
  </StrictMode>,
);
