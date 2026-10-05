import type { CurriculumQuestionRef, Seed } from '../../contracts/identity.ts';
import type { Question, QuestionProvider } from '../../contracts/question.ts';
import type { MasterySummary, PracticeSession } from '../../contracts/session.ts';
import { nextMasteryLevel } from '../mastery/course-mastery.ts';
import { supportedCurriculumLevels, validCurriculumTarget } from './selection.ts';

export interface PracticeSelection {
  readonly session: PracticeSession;
  readonly question: Question;
  readonly ref: CurriculumQuestionRef;
}
export interface SelectPracticeInput {
  readonly session: PracticeSession;
  readonly provider: QuestionProvider;
  readonly seed: Seed;
  readonly summaries: readonly MasterySummary[];
}

export function selectPracticeQuestion({
  session,
  provider,
  seed,
  summaries,
}: SelectPracticeInput): PracticeSelection | null {
  if (
    !validCurriculumTarget(session.target) ||
    session.target.course !== session.namespace.course ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xffffffff
  ) {
    throw new Error('Invalid practice target or seed.');
  }
  const relevant = supportedCurriculumLevels(session.target).map(
    (level) =>
      summaries.find(
        (summary) => summary.gemId === session.target.gemId && summary.level === level,
      ) ?? {
        gemId: session.target.gemId,
        level,
        score: null,
        count: 0,
        mastered: false,
        lastCompletedAt: null,
      },
  );
  const level =
    session.selection === 'fixed-level' ? session.target.level : nextMasteryLevel(relevant);
  if (level === null) return null;
  const target = { ...session.target, level };
  if (!validCurriculumTarget(target)) throw new Error('Unsupported practice level.');
  const chosen = provider.select({
    activityId: target.activityId,
    gemId: target.gemId,
    level,
    seed,
    previousQuestionIds: session.previousQuestionIds,
  });
  if (
    chosen.activityId !== target.activityId ||
    chosen.level !== level ||
    !chosen.questionId ||
    !Number.isInteger(chosen.seed) ||
    chosen.seed < 0 ||
    chosen.seed > 0xffffffff
  ) {
    throw new Error('Provider selected a question outside the practice target.');
  }
  // Reconstruct a curriculum ref from the validated target rather than narrowing by cast.
  const ref: CurriculumQuestionRef = {
    activityId: target.activityId,
    questionId: chosen.questionId,
    seed: chosen.seed,
    level,
  };
  const question = provider.restore(ref);
  if (
    question.ref.activityId !== ref.activityId ||
    question.ref.questionId !== ref.questionId ||
    question.ref.seed !== ref.seed ||
    question.ref.level !== ref.level
  ) {
    throw new Error('Provider restored a different question identity.');
  }
  return {
    ref,
    question,
    session: {
      ...session,
      target,
      previousQuestionIds: [...session.previousQuestionIds, ref.questionId],
    },
  };
}
