import type { QuestionPlayerProps } from './QuestionPlayer.tsx';
import { record } from '../activities/igcse/energetics-practical/provider.ts';
import type { Response } from '../contracts/question.ts';
import { ResponseControl } from './ResponseControl.tsx';
import { QuestionLevelPill } from './QuestionLevelPill.tsx';
import './energetics-practical-pilot.css';

/** Component-level port of the original final practical question-workspace.
 * The common masthead, top code, level pill and footer remain host-owned. */
export function EnergeticsPracticalPilot({
  question,
  attempt,
  onCommand,
  onNext,
  saveStatus,
  onRetrySave,
  feedback,
  correctionFeedback,
  canNext = true,
  learningReviewEnabled = false,
}: QuestionPlayerProps) {
  const source = record(question.ref.questionId);
  const student = attempt.mode === 'student';
  const assessed = student && attempt.phase === 'assessed';
  const assessment = assessed ? attempt.firstAssessment : undefined;
  const shownAnswer =
    !student ||
    attempt.assistance.some((item) => item.kind === 'reveal' || item.kind === 'worked-answer');
  const responses = student ? attempt.currentResponses : {};
  const send = (partId: string, response: Response) => {
    if (student) onCommand({ kind: 'respond', partId, response });
  };
  const ready = question.parts.every((part) => {
    const response = responses[part.id];
    if (part.kind === 'correction')
      return (
        response?.kind === 'correction' &&
        response.selections.length === 1 &&
        !!response.replacement.trim()
      );
    if (part.kind === 'text') return response?.kind === 'text' && !!response.value.trim();
    if (part.kind === 'choice') {
      const field = source.fields.find((field) => field.id === part.id);
      return (
        response?.kind === 'choice' &&
        response.selected.length ===
          (field?.multiselect ? (field.selectCount ?? field.answers.length) : 1)
      );
    }
    return true;
  });
  const submit = () => onCommand({ kind: 'submit', at: Date.now() });
  return (
    <article className="question-player ep-pilot" aria-label="Energetics practical question">
      <header className="question-header">
        <QuestionLevelPill course="igcse" level={question.ref.level} />
      </header>
      {!student && (
        <p className="mode-notice">
          This read-only view creates no assessment or progress evidence.
        </p>
      )}
      <div className="question-workspace">
        <div
          className="question-content"
          onKeyDown={(event) => {
            if (
              event.key !== 'Enter' ||
              event.shiftKey ||
              event.nativeEvent.isComposing ||
              event.repeat ||
              !student
            )
              return;
            if (
              !(
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
              )
            )
              return;
            event.preventDefault();
            const fields = Array.from(
              event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
                '.field-set input, .field-set textarea',
              ),
            );
            const next = fields[fields.indexOf(event.target) + 1];
            if (next) next.focus();
            else if (ready) assessed ? onCommand({ kind: 'check-correction' }) : submit();
          }}
        >
          <div className="question-text">
            <p className="context">{source.context}</p>
            <p className="prompt">{source.prompt}</p>
          </div>
          <div className="answer-grid">
            {question.parts.map((part) => {
              const field =
                part.kind === 'correction'
                  ? source.fields[0]
                  : source.fields.find((field) => field.id === part.id);
              return (
                <ResponseControl
                  key={part.id}
                  part={part}
                  response={responses[part.id]}
                  readOnly={!student}
                  onResponse={(response) => send(part.id, response)}
                  appearance="energetics-practical"
                  {...(field
                    ? {
                        fieldLabel: field.label,
                        multiline: !!(field as typeof field & { multiline?: boolean }).multiline,
                      }
                    : {})}
                />
              );
            })}
          </div>
        </div>
        <aside className="marking" aria-label="Marking and feedback">
          {student && (
            <div className="actions">
              {!assessed && (
                <button type="button" className="button primary" disabled={!ready} onClick={submit}>
                  Check answer
                </button>
              )}
              {assessed && (
                <button
                  type="button"
                  className="button primary"
                  disabled={!ready}
                  onClick={() => onCommand({ kind: 'check-correction' })}
                >
                  Check correction
                </button>
              )}
              {!shownAnswer && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    onCommand({
                      kind: 'assist',
                      assistance: {
                        kind: assessed ? 'worked-answer' : 'reveal',
                        supportId: 'worked-answer',
                        at: Date.now(),
                      },
                    })
                  }
                >
                  {assessed ? 'Show worked answer' : 'Reveal answer (assisted)'}
                </button>
              )}
              {assessed && (
                <button
                  type="button"
                  className="button secondary next-button"
                  disabled={!canNext}
                  onClick={onNext}
                >
                  Next question
                </button>
              )}
            </div>
          )}
          {feedback && (
            <div className="status-message warning" role="alert">
              <strong>Response has not been assessed</strong>
              <p>{feedback.message}</p>
            </div>
          )}
          {assessment && (
            <section
              className="results assessment-feedback"
              aria-label="First assessment"
              role="status"
            >
              {assessment.kind === 'marked' ? (
                <>
                  <span className="score">
                    {assessment.marks.earned}/{assessment.marks.available}
                  </span>
                  <div className="field-results">
                    {assessment.marks.points.map((point) => {
                      const field = source.fields.find((field) => field.id === point.pointId);
                      const model =
                        field?.model ??
                        source.correction?.segments.find(
                          (segment) => segment.id === source.correction?.errorId,
                        )?.text;
                      const explanation =
                        point.pointId === 'error'
                          ? 'Identify the highlighted erroneous phrase before replacing it.'
                          : field?.feedback &&
                              point.partId === 'correction' &&
                              assessment.marks.points.find((item) => item.pointId === 'error')
                                ?.earned === 0
                            ? 'Identify the error first; this response cannot earn the correction mark yet.'
                            : field?.feedback;
                      const correct = point.earned === point.available;
                      const equivalent =
                        (attempt.mode === 'student' &&
                          attempt.phase === 'assessed' &&
                          attempt.learningReview?.decisions.some(
                            (decision) =>
                              decision.partId === point.partId &&
                              decision.pointId === point.pointId &&
                              decision.judgement === 'equivalent',
                          )) ||
                        false;
                      return (
                        <div
                          className={`result-row${correct ? ' is-correct' : ''}`}
                          key={`${point.partId}:${point.pointId}`}
                        >
                          <span
                            className="result-icon"
                            aria-label={correct ? 'Correct' : 'Incorrect'}
                          >
                            {correct ? '✓' : '✗'}
                          </span>
                          <div className="result-text">
                            {model ? (
                              <>
                                <em>{model}</em>
                                {explanation && <span>{explanation}</span>}
                              </>
                            ) : (
                              <span>{point.message}</span>
                            )}
                            {learningReviewEnabled &&
                              !correct &&
                              point.learningReview?.eligible && (
                                <button
                                  type="button"
                                  className="override-button"
                                  aria-pressed={equivalent}
                                  onClick={() =>
                                    onCommand({
                                      kind: 'review-valid-alternative',
                                      decision: {
                                        partId: point.partId,
                                        pointId: point.pointId,
                                        judgement: equivalent ? 'not-equivalent' : 'equivalent',
                                        reviewer: 'student',
                                      },
                                    })
                                  }
                                >
                                  My answer means the same
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p>Answer revealed. This attempt is assisted.</p>
              )}
              <p className="first-result-note">
                Your first submission and marks remain fixed. Corrections are for learning.
              </p>
              {attempt.mode === 'student' &&
                attempt.phase === 'assessed' &&
                attempt.learningReview && (
                  <p className="first-result-note">
                    Learning review: {attempt.learningReview.reviewedMarks.earned}/
                    {attempt.learningReview.reviewedMarks.available}. First marks remain unchanged.
                  </p>
                )}
            </section>
          )}
          {assessed && correctionFeedback && (
            <section
              className="results correction-feedback"
              aria-label="Learning correction check"
              role="status"
            >
              <h3>Learning correction check</h3>
              {'marks' in correctionFeedback ? (
                <>
                  <span className="score">
                    {correctionFeedback.marks.earned}/{correctionFeedback.marks.available}
                  </span>
                  <p>
                    {correctionFeedback.status === 'correct'
                      ? 'Correction is correct'
                      : 'Correction needs more work'}
                  </p>
                </>
              ) : (
                <>
                  {correctionFeedback.issues.map((issue, index) => (
                    <p key={index}>{issue.message}</p>
                  ))}
                </>
              )}
            </section>
          )}
          {shownAnswer && (
            <section className={`review-panel worked-answer${!student ? ' teacher-answer' : ''}`}>
              <h3>{student ? 'Worked answer' : 'Checked answer and diagrams'}</h3>
              {source.fields.map((field) => (
                <div className="review-answer" key={field.id}>
                  <p>Model: {field.model}</p>
                  <p>{field.feedback ?? 'Award this point for a chemically accurate response.'}</p>
                </div>
              ))}
              {source.correction && (
                <div className="review-answer">
                  Error model: select “
                  {
                    source.correction.segments.find(
                      (segment) => segment.id === source.correction?.errorId,
                    )?.text
                  }
                  ”, then apply the replacement and explanation above.
                </div>
              )}
              {!student && (
                <details className="source-provenance">
                  <summary>Question source and provenance</summary>
                  {question.sources.map((source) => (
                    <p key={source.path}>
                      {source.path} · {source.symbolOrSection} · SHA-256 {source.sha256}
                    </p>
                  ))}
                </details>
              )}
            </section>
          )}
          {saveStatus.kind === 'error' && (
            <div className="save-status save-error" role="alert">
              <strong>Work has not been saved.</strong> {saveStatus.error.message}
              {saveStatus.error.retryable && onRetrySave && (
                <button type="button" onClick={onRetrySave}>
                  Retry save
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
