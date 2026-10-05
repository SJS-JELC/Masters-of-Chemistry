import type { Course, Level } from '../contracts/identity.ts';

export function QuestionLevelPill({
  course,
  level,
  olympiad = false,
}: {
  readonly course: Course;
  readonly level?: Level;
  readonly olympiad?: boolean;
}) {
  const label = olympiad
    ? 'OLYMPIAD QUESTION'
    : course === 'igcse'
      ? `${level === 1 ? 'GRADE 5–6' : level === 2 ? 'GRADE 7–8' : 'GRADE 9'} QUESTION`
      : `LEVEL ${level} QUESTION`;
  return (
    <span
      className={`question-level-pill ${olympiad ? 'question-level-olympiad' : `question-level-${level}`}`}
    >
      {label}
    </span>
  );
}
