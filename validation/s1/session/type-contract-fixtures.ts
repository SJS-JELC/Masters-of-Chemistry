import type { CurriculumEvidence, CurriculumTarget, MasterySetting, PracticeSession, QuestionProvider, RevisionSession } from '../../../src/contracts/index.ts';
import { createCourseMastery } from '../../../src/domain/mastery/index.ts';
import { createRevisionSession, revisionScheduler, selectPracticeQuestion } from '../../../src/domain/session/index.ts';

// Compile-only domain composition: no fixture becomes a runtime activity registration.
export function composeSessionFixture(provider: QuestionProvider, evidence: readonly CurriculumEvidence[], setting: MasterySetting, target: CurriculumTarget): RevisionSession {
  const mastery = createCourseMastery(target.course);
  const summaries = setting.supportedLevels.map(({ level }) => mastery.summarize(evidence, setting, level));
  const selected = setting.supportedLevels.map(({ level }) => ({ ...target, level }));
  const session = createRevisionSession({ namespace: { course: target.course, profileId: 'type-only' }, id: 'type-only-session', selected, settings: [setting], summaries, now: Date.now() });
  const practice: PracticeSession = { kind: 'practice', namespace: session.namespace, id: 'type-only-practice', target, selection: 'fixed-level', currentAttemptId: null, previousQuestionIds: [] };
  selectPracticeQuestion({ session: practice, provider, seed: 123, summaries });
  return revisionScheduler.next(session, summaries, Date.now(), 'type-only-attempt');
}
