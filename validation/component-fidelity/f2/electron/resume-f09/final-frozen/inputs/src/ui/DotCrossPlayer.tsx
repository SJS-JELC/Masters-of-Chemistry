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
    dialog = useRef<HTMLDialogElement>(null);
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
  const showedAnswer =
    !student || support.some((s) => s.kind === 'reveal' || s.kind === 'worked-answer');
  const part = question.parts[0];
  const current = part ? attempt.currentResponses[part.id] : undefined;
  const first = assessed && part ? attempt.firstResponse.responses[part.id] : undefined;
  const sameDiagram =
    current?.kind === 'dot-and-cross' &&
    first?.kind === 'dot-and-cross' &&
    JSON.stringify([current.atoms, current.electrons, current.groups]) ===
      JSON.stringify([first.atoms, first.electrons, first.groups]);
  const currentCorrect =
    correctionFeedback?.status === 'correct' ||
    (!correctionFeedback &&
      sameDiagram &&
      assessment &&
      assessment.kind !== 'revealed' &&
      assessment.marks.earned === assessment.marks.available);
  const circles = current?.kind === 'dot-and-cross' ? current.circles !== false : true;
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
  const openAnswer = () => {
    if (student && !showedAnswer)
      onCommand({
        kind: 'assist',
        assistance: {
          kind: assessed ? 'worked-answer' : 'reveal',
          supportId: 'worked-answer',
          at: Date.now(),
        },
      });
    setAnswerOpen(true);
  };
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
      {student ? (
        <div className="actions">
          <button
            type="button"
            className={currentCorrect ? '' : 'primary'}
            data-dot-action="check"
            onClick={() =>
              onCommand(
                assessed ? { kind: 'check-correction' } : { kind: 'submit', at: Date.now() },
              )
            }
          >
            {assessed ? 'Check correction' : 'Check diagram'}
          </button>
          <button type="button" disabled={!assessed} onClick={openAnswer}>
            Show answer
          </button>
          <button
            type="button"
            className={currentCorrect ? 'primary' : ''}
            data-dot-action="next"
            disabled={!assessed || !canNext}
            onClick={onNext}
          >
            Next question →
          </button>
        </div>
      ) : (
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
      <details className="dot-help">
        <summary>Help and drawing conventions</summary>
        {question.scaffolds
          .filter((scaffold) => scaffold.level === question.ref.level)
          .map((scaffold) => (
            <section key={scaffold.id}>
              <p>{scaffold.purpose}</p>
              <Content blocks={scaffold.content} />
            </section>
          ))}
        {student &&
          question.hints.map((hint) =>
            support.some((item) => item.supportId === hint.id) ? (
              <section key={hint.id} className="hint">
                <Content blocks={hint.content} />
              </section>
            ) : (
              <button
                type="button"
                key={hint.id}
                onClick={() =>
                  onCommand({
                    kind: 'assist',
                    assistance: { kind: 'hint', supportId: hint.id, at: Date.now() },
                  })
                }
              >
                Request hint
              </button>
            ),
          )}
        {student && !showedAnswer && (
          <button type="button" onClick={openAnswer}>
            Reveal answer (assisted)
          </button>
        )}
      </details>
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
      <ResponseControl
        part={part}
        response={student ? current : reference}
        readOnly={!student}
        onResponse={(response) => {
          if (student) onCommand({ kind: 'respond', partId: part.id, response });
        }}
        workspaceAside={pane}
        {...(renderEditor ? { renderEditor } : {})}
      />
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
