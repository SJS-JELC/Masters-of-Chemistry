import { QuestionActions, useQuestionActions } from './QuestionActions.tsx';
import { useQuestionKeyboard } from './use-question-keyboard.ts';
import { useEffect, useId, useRef, useState } from 'react';
import type { QuestionPlayerProps } from './QuestionPlayer.tsx';
import type { BankRecord } from '../chemistry/dot-and-cross/types.ts';
import type { DotCrossState } from '../contracts/editors.ts';
import { modelSVG } from '../chemistry/dot-and-cross/model.ts';
import { Content } from './Content.tsx';
import { ResponseControl } from './ResponseControl.tsx';
import {
  questionDisplayTitle,
  repeatsQuestionSubtopic,
  useQuestionChrome,
} from '../shell/QuestionChrome.tsx';
import { QuestionLevelPill } from './QuestionLevelPill.tsx';
import { responseFingerprint } from './action-state.ts';
import './dot-cross-player.css';

/** Source workspace presentation; the shared attempt/clock/repository still own every command. */
export function DotCrossPlayer({
  question,
  attempt,
  onCommand,
  onNext,
  saveStatus,
  onRetrySave,
  feedback,
  correctionFeedback,
  canNext = true,
  renderEditor,
}: QuestionPlayerProps) {
  const id = useId(),
    dialog = useRef<HTMLDialogElement>(null),
    revealedFeedback = useRef<typeof correctionFeedback>(undefined);
  const chrome = useQuestionChrome(),
    displayTitle = questionDisplayTitle(question),
    repeatedTitle = repeatsQuestionSubtopic(displayTitle, chrome);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [record, setRecord] = useState<BankRecord | null>(null);
  const [referenceError, setReferenceError] = useState('');
  const student = attempt.mode === 'student';
  const assessed = student && attempt.phase === 'assessed';
  const assessment = assessed ? attempt.firstAssessment : undefined;
  const support = student ? attempt.assistance : [];
  const part = question.parts[0];
  const current = part ? attempt.currentResponses[part.id] : undefined;
  const circles = current?.kind === 'dot-and-cross' ? current.circles !== false : true;
  // Present only a checked current drawing; first evidence and timing stay immutable.
  const sameFirst =
    assessed &&
    !attempt.currentResponseChanged &&
    responseFingerprint(attempt.currentResponses) ===
      responseFingerprint(attempt.firstResponse.responses);
  const checkedMarks =
    assessed && !attempt.currentResponseChanged
      ? correctionFeedback
        ? 'marks' in correctionFeedback && correctionFeedback !== revealedFeedback.current
          ? correctionFeedback.marks
          : undefined
        : !attempt.currentGiveUp && sameFirst && assessment?.kind !== 'revealed'
          ? assessment?.marks
          : undefined
      : undefined;
  const checkedStatus = checkedMarks
    ? checkedMarks.earned === checkedMarks.available
      ? 'correct'
      : 'incorrect'
    : undefined;
  useEffect(() => {
    let cancelled = false;
    setRecord(null);
    setReferenceError('');
    setAnswerOpen(false);
    void (async () => {
      const value =
        question.ref.activityId === 'alevel/dot-and-cross'
          ? (await import('../activities/alevel/dot-and-cross/provider.ts')).getRecord(
              question.ref.questionId,
            )
          : (await import('../activities/igcse/dot-and-cross/types.ts')).referenceRecord(
              (await import('../activities/igcse/dot-and-cross/provider.ts')).getRecord(
                question.ref.questionId,
              ),
            );
      if (!cancelled) setRecord(value);
    })().catch((error) => {
      if (!cancelled)
        setReferenceError(
          error instanceof Error ? error.message : 'Checked diagram could not be loaded.',
        );
    });
    return () => {
      cancelled = true;
    };
  }, [question.ref.activityId, question.ref.questionId]);
  useEffect(() => {
    if (answerOpen && !dialog.current?.open) dialog.current?.showModal();
    if (!answerOpen && dialog.current?.open) dialog.current.close();
  }, [answerOpen]);
  if (!part || part.kind !== 'dot-and-cross')
    throw Error('Dot workspace requires one diagram part.');
  const reference: DotCrossState | undefined = record
    ? { kind: 'dot-and-cross', ...record.reference }
    : undefined;
  const actions = useQuestionActions({
    attempt,
    correctionFeedback,
    onCommand,
    onNext,
    canNext,
    onShowAnswer: () => {
      revealedFeedback.current = correctionFeedback;
      setAnswerOpen(true);
    },
  });
  const keyboard = useQuestionKeyboard(
    `${question.ref.activityId}:${question.ref.questionId}:${attempt.mode === 'student' ? attempt.attemptId : attempt.mode}`,
    student,
    actions,
  );
  const answer = (
    <>
      {record ? (
        <div
          className="dot-answer-graphic"
          role="img"
          aria-label={`Checked dot-and-cross diagram of ${record.name}; ${record.explanation}`}
          dangerouslySetInnerHTML={{ __html: modelSVG(record, { circles }) }}
        />
      ) : (
        <p role="status">{referenceError || 'Loading checked diagram…'}</p>
      )}
      <Content
        blocks={question.workedAnswer.filter(
          (block) =>
            block.kind !== 'image' &&
            !(
              block.kind === 'text' && block.text.startsWith('On smaller screens, swipe or scroll')
            ),
        )}
      />
    </>
  );
  const pane = (
    <>
      {!student && (
        <p className="mode-notice" role="status">
          Read only. This view creates no assessment or progress evidence.
        </p>
      )}
      {feedback && (
        <div className="player-message" role="status">
          <p>{feedback.message}</p>
          {feedback.issues?.map((issue, index) => (
            <p key={index}>{issue.message}</p>
          ))}
        </div>
      )}
      {assessment && (
        <section className="assessment-feedback" aria-label="First assessment" role="status">
          <h3>{assessment.kind === 'revealed' ? 'Answer revealed' : 'First assessment'}</h3>
          {assessment.kind === 'revealed' ? (
            <p>This attempt is assisted; the reveal is not an independent assessed response.</p>
          ) : (
            <>
              <p className="score">
                {assessment.marks.earned} / {assessment.marks.available} marks
              </p>
              {assessment.marks.points.map((point) => (
                <p key={point.partId + '-' + point.pointId} className="mark-feedback">
                  {point.message}
                </p>
              ))}
            </>
          )}
          {support.length > 0 && (
            <p className="support-note">Support was requested during this attempt.</p>
          )}
        </section>
      )}
      {assessed && correctionFeedback && (
        <section
          className="correction-feedback"
          aria-label="Learning correction check"
          role="status"
        >
          <h3>Learning correction check</h3>
          <p className="support-note">Your first result and revision progress stay fixed.</p>
          {'marks' in correctionFeedback ? (
            <>
              <p className="score">
                {correctionFeedback.marks.earned} / {correctionFeedback.marks.available} learning
                marks
              </p>
              <p>
                <strong>
                  {correctionFeedback.status === 'correct'
                    ? 'Correction is correct'
                    : 'Correction needs more work'}
                </strong>
              </p>
              {correctionFeedback.marks.points.map((point) => (
                <p key={point.partId + '-' + point.pointId}>{point.message}</p>
              ))}
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
      {student && saveStatus.kind === 'error' && (
        <div className="save-status save-error" role="alert">
          <strong>Work has not been saved.</strong> {saveStatus.error.message}
          {saveStatus.error.retryable && onRetrySave && (
            <button type="button" onClick={onRetrySave}>
              Retry save
            </button>
          )}
        </div>
      )}
    </>
  );
  return (
    <article
      {...keyboard}
      className="question-player dot-cross-player layout-workspace"
      {...(repeatedTitle ? { 'aria-label': displayTitle } : { 'aria-labelledby': id + '-title' })}
    >
      <section className="dot-question-panel" aria-label="Question">
        <QuestionLevelPill
          course={question.ref.activityId.startsWith('igcse/') ? 'igcse' : 'alevel'}
          level={question.ref.level}
        />
        {!repeatedTitle && (
          <div className="heading-row">
            <h2 id={id + '-title'}>{displayTitle}</h2>
          </div>
        )}
        <Content blocks={question.context} />
      </section>
      {student && (
        <div className="dot-question-actions">
          <span
            className={`dot-check-status${checkedStatus ? ` ${checkedStatus}` : ''}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {checkedStatus === 'correct' ? 'Correct' : checkedStatus ? 'Incorrect' : ''}
          </span>
          <QuestionActions actions={actions} />
        </div>
      )}
      <ResponseControl
        key={`${part.id}:${actions.clearRevision}`}
        part={part}
        response={student ? current : reference}
        readOnly={!student}
        onResponse={(response) => {
          if (student) onCommand({ kind: 'respond', partId: part.id, response });
        }}
        {...(renderEditor ? { renderEditor } : {})}
      />
      <div className="dot-feedback">{pane}</div>
      {!student && (
        <section className="teacher-answer worked-answer">
          <h3>Checked answer and diagrams</h3>
          {answer}
        </section>
      )}
      <dialog
        ref={dialog}
        className="dot-answer-dialog"
        aria-labelledby={id + '-answer'}
        onCancel={() => setAnswerOpen(false)}
        onClose={() => setAnswerOpen(false)}
      >
        <button
          type="button"
          className="dot-close-answer"
          onClick={() => setAnswerOpen(false)}
          aria-label="Close answer"
        >
          Close
        </button>
        <h3 id={id + '-answer'}>Checked answer</h3>
        {answer}
      </dialog>
      {!student && (
        <details className="source-provenance">
          <summary>Question source and provenance</summary>
          <ul>
            {question.sources.map((source) => (
              <li key={source.path + source.symbolOrSection}>
                <code>{source.path}</code>
                <p>{source.symbolOrSection}</p>
                <small>
                  SHA-256: <code>{source.sha256}</code>
                </small>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
