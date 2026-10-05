import { createContext, useContext } from 'react';
import type { Course } from '../contracts/identity.ts';
import type { Question } from '../contracts/question.ts';

export interface QuestionHeader {
  readonly subtopic: string;
  readonly questionId?: string;
}

export const QuestionChromeContext = createContext<QuestionHeader | undefined>(undefined);
export const useQuestionChrome = () => useContext(QuestionChromeContext);

/** These providers append a source review code to the title, in addition to the stable ref ID. */
export function questionDisplayTitle(question: Pick<Question, 'title' | 'ref'>): string {
  const separator = question.title.lastIndexOf(' · ');
  if (separator < 0) return question.title;
  const suffix = question.title.slice(separator + 3);
  const reviewPrefixes: Readonly<Record<string, string>> = {
    'alevel/dot-and-cross': 'DAC',
    'igcse/dot-and-cross': 'DC',
    'alevel/ph-titration-curves': 'TC',
    'igcse/energy-enthalpy': 'EE',
  };
  const prefix = reviewPrefixes[question.ref.activityId];
  const sourceReviewCode = !!prefix && new RegExp(`^${prefix}-[A-Z0-9]{6}$`).test(suffix);
  return suffix === question.ref.questionId || sourceReviewCode
    ? question.title.slice(0, separator)
    : question.title;
}

/** Only repeated activity labels are suppressed; specific scientific titles stay visible. */
export function repeatsQuestionSubtopic(title: string, header?: QuestionHeader): boolean {
  const normalise = (value: string) =>
    value
      .toLocaleLowerCase('en-GB')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  return !!header && normalise(title) === normalise(header.subtopic);
}

export function QuestionChrome({
  course,
  metadata,
  onBack,
  backLabel = 'Back to course map',
}: {
  readonly course: Course;
  readonly metadata: QuestionHeader;
  readonly onBack?: () => void;
  readonly backLabel?: string;
}) {
  const courseTitle = course === 'alevel' ? 'A Level Chemistry' : 'IGCSE Chemistry';
  return (
    <header className="question-masthead">
      <div className="question-brand">
        <button
          type="button"
          className="question-brand-mark"
          aria-label={backLabel}
          onClick={onBack}
          disabled={!onBack}
        >
          <img src={`${import.meta.env.BASE_URL}assets/SJS-Eagle.svg`} alt="" />
        </button>
        <div className="question-brand-title">
          <p className="question-wordmark">MASTERS OF CHEMISTRY</p>
          <h1 className="question-subject">
            {courseTitle} - {metadata.subtopic}
          </h1>
        </div>
      </div>
      <div className="question-header-actions">
        {metadata.questionId && (
          <span className="header-question-code" aria-label="Question ID">
            {metadata.questionId}
          </span>
        )}
        <button
          type="button"
          className="question-back"
          aria-label={backLabel}
          title={backLabel}
          onClick={onBack}
          disabled={!onBack}
        >
          <span aria-hidden="true">←</span>
        </button>
      </div>
    </header>
  );
}
