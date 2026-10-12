import { createRoot } from 'react-dom/client';
import { RecallView } from '../../src/recall/RecallView.tsx';
import { createRepository } from '../../src/persistence/repository.ts';
import { createActiveClock } from '../../src/domain/timing/active-clock.ts';
import { createAttemptController, assessmentToEvidence } from '../../src/domain/attempt/attempt.ts';
import { createRecallProvider, recallRef } from '../../src/recall/provider.ts';
import { recallFacts, factsFor } from '../../src/recall/facts.ts';
import { createRecallMarkingPolicy } from '../../src/recall/marking.ts';
import { createRecallSession } from '../../src/recall/scheduler.ts';
import '../../src/styles/platform.css';
const params = new URLSearchParams(location.search),
  course = params.get('course') === 'alevel' ? 'alevel' : 'igcse';
Object.assign(window, {
  rf: {
    createRepository,
    createActiveClock,
    createAttemptController,
    assessmentToEvidence,
    createRecallProvider,
    recallRef,
    recallFacts,
    factsFor,
    createRecallMarkingPolicy,
    createRecallSession,
  },
});
createRoot(document.getElementById('root')!).render(
  <RecallView
    course={course}
    onHome={() => {}}
    mode={params.get('mode') === 'teacher' ? 'teacher' : 'student'}
    databaseName={'masters-of-chemistry-alpha-v2-recall-browser-' + params.get('run')}
  />,
);
