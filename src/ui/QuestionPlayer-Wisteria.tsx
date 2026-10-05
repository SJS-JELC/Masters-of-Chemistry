import { QuestionActions, useQuestionActions } from './QuestionActions.tsx';
import { useQuestionKeyboard } from './use-question-keyboard.ts';
import { useId, Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import type {
  AttemptCommand,
  CorrectionFeedback,
  PlayerAttempt,
  RubricReview,
} from '../contracts/attempt.ts';
import type { MarkingIssue, Question, Response } from '../contracts/question.ts';
import type { StorageFailure } from '../contracts/repository.ts';
import type { EditorSurfaceProps } from './EditorFrame.tsx';
import { Content } from './Content.tsx';
import { ResponseControl } from './ResponseControl.tsx';
import { TextRangePicker } from './TextRangePicker.tsx';
import { assessmentPointLabel } from './assessment-label.ts';
import {
  questionDisplayTitle,
  repeatsQuestionSubtopic,
  useQuestionChrome,
} from '../shell/QuestionChrome.tsx';
import { QuestionLevelPill } from './QuestionLevelPill.tsx';
import { sourceFamilies } from './source-family.ts';
const DotCrossPlayer = lazy(async () => ({
  default: (await import('./DotCrossPlayer.tsx')).DotCrossPlayer,
}));
const SourceQuestionPlayer = lazy(async () => ({
  default: (await import('./SourceQuestionPlayer.tsx')).SourceQuestionPlayer,
}));

export type SaveStatus =
  | Readonly<{ kind: 'idle' | 'saving' | 'saved' }>
  | Readonly<{ kind: 'error'; error: StorageFailure }>;
export interface PlayerFeedback {
  readonly message: string;
  readonly issues?: readonly MarkingIssue[];
}
export interface QuestionPlayerProps {
  readonly question: Question;
  readonly attempt: PlayerAttempt;
  readonly onCommand: (command: AttemptCommand) => void;
  readonly onNext: () => void;
  readonly saveStatus: SaveStatus;
  readonly onRetrySave?: () => void;
  readonly feedback?: PlayerFeedback;
  readonly canNext?: boolean;
  readonly correctionFeedback?: CorrectionFeedback;
  readonly learningReviewEnabled?: boolean;
  readonly renderEditor?: (props: EditorSurfaceProps) => ReactNode;
}

function RubricPanel({
  question,
  review,
  onCommand,
}: {
  readonly question: Question;
  readonly review: RubricReview;
  readonly onCommand: (command: AttemptCommand) => void;
}) {
  const part = question.parts.find((item) => item.id === review.partId);
  if (part?.kind !== 'explanation')
    return <p role="alert">The rubric could not be restored for this question.</p>;
  const active = part.rubric.find((point) => point.id === review.activePointId);
  const judgement = review.judgements.find((point) => point.pointId === review.activePointId);
  return (
    <section className="rubric-panel" aria-label="Self-review rubric">
      <h3>Review your frozen explanation</h3>
      <p>
        Your submitted sections are locked. Work through each marking point and identify evidence in
        your own answer.
      </p>
      <ol className="rubric-progress">
        {part.rubric.map((point) => {
          const decision = review.judgements.find((item) => item.pointId === point.id);
          return (
            <li
              key={point.id}
              aria-current={point.id === review.activePointId ? 'step' : undefined}
            >
              {point.text}{' '}
              <span className="badge">
                {decision?.status === 'met'
                  ? 'Evidence recorded'
                  : decision?.status === 'not-met'
                    ? 'Not met'
                    : point.id === review.activePointId
                      ? 'Current point'
                      : 'Pending'}
              </span>
              {decision?.status === 'met' && <blockquote>{decision.evidence.text}</blockquote>}
            </li>
          );
        })}
      </ol>
      {active && (
        <div className="rubric-active">
          <h4>
            {active.text} <span className="marks">[{active.marks}]</span>
          </h4>
          {active.reject && <p className="support-note">{active.reject}</p>}
          <div className="action-row">
            <button
              type="button"
              onClick={() =>
                onCommand({
                  kind: 'judge-rubric',
                  partId: part.id,
                  judgement: { pointId: active.id, status: 'awaiting-evidence' },
                })
              }
              disabled={judgement?.status === 'awaiting-evidence'}
            >
              My answer meets this point
            </button>
            <button
              type="button"
              onClick={() =>
                onCommand({
                  kind: 'judge-rubric',
                  partId: part.id,
                  judgement: { pointId: active.id, status: 'not-met' },
                })
              }
            >
              My answer does not meet this point
            </button>
          </div>
          {judgement?.status === 'awaiting-evidence' && (
            <TextRangePicker
              key={active.id}
              text={review.lockedText}
              label="Select evidence from your submitted answer"
              onPick={(evidence) =>
                onCommand({
                  kind: 'judge-rubric',
                  partId: part.id,
                  judgement: { pointId: active.id, status: 'met', evidence },
                })
              }
            />
          )}
        </div>
      )}
      {!active && (
        <p className="feedback-positive">All points in this section have been reviewed.</p>
      )}
    </section>
  );
}

/** Presentational player: identity, storage, time and evidence are supplied by its host. */
export function QuestionPlayer({
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
  renderEditor,
}: QuestionPlayerProps) {
  const instanceId = useId();
  const chrome = useQuestionChrome();
  const displayTitle = questionDisplayTitle(question);
  const repeatedTitle = repeatsQuestionSubtopic(displayTitle, chrome);
  const actions = useQuestionActions({
    attempt,
    correctionFeedback,
    onCommand,
    onNext,
    canNext,
    canCorrect: question.parts.some(
      (part) => part.kind !== 'explanation' && part.kind !== 'drawing-self-check',
    ),
  });
  const keyboard = useQuestionKeyboard(
    `${question.ref.activityId}:${question.ref.questionId}:${attempt.mode === 'student' ? attempt.attemptId : attempt.mode}`,
    attempt.mode === 'student',
    actions,
  );
  if (sourceFamilies[question.ref.activityId])
    return (
      <Suspense fallback={<p role="status">Loading written correction…</p>}>
        <SourceQuestionPlayer
          key={`${question.ref.activityId}:${question.ref.questionId}:${attempt.mode === 'student' ? attempt.attemptId : attempt.mode}`}
          question={question}
          attempt={attempt}
          onCommand={onCommand}
          onNext={onNext}
          saveStatus={saveStatus}
          {...(onRetrySave ? { onRetrySave } : {})}
          {...(feedback ? { feedback } : {})}
          {...(correctionFeedback ? { correctionFeedback } : {})}
          canNext={canNext}
          learningReviewEnabled={learningReviewEnabled}
          {...(renderEditor ? { renderEditor } : {})}
        />
      </Suspense>
    );
  if (question.parts.length === 1 && question.parts[0]?.kind === 'dot-and-cross')
    return (
      <Suspense fallback={<p role="status">Loading diagram workspace…</p>}>
        <DotCrossPlayer
          key={`${question.ref.activityId}:${question.ref.questionId}:${attempt.mode === 'student' ? attempt.attemptId : attempt.mode}`}
          question={question}
          attempt={attempt}
          onCommand={onCommand}
          onNext={onNext}
          saveStatus={saveStatus}
          {...(onRetrySave ? { onRetrySave } : {})}
          {...(feedback ? { feedback } : {})}
          canNext={canNext}
          {...(correctionFeedback ? { correctionFeedback } : {})}
          {...(renderEditor ? { renderEditor } : {})}
        />
      </Suspense>
    );
  const student = attempt.mode === 'student';
  const reviewing =
    student && (attempt.phase === 'rubric-review' || attempt.phase === 'drawing-review');
  const assessed = student && attempt.phase === 'assessed';
  const readOnly = !student || reviewing;
  const assessment = assessed ? attempt.firstAssessment : undefined;
  const canCheckCorrection =
    assessed &&
    question.parts.some(
      (part) => part.kind !== 'explanation' && part.kind !== 'drawing-self-check',
    );
  const assisted = student && attempt.assistance.length > 0;
  const shownSupport = student ? attempt.assistance : [];
  const showedAnswer =
    !student ||
    shownSupport.some((item) => item.kind === 'reveal' || item.kind === 'worked-answer');
  const sendResponse = (partId: string, response: Response) => {
    if (student && !readOnly) onCommand({ kind: 'respond', partId, response });
  };
  return (
    <article
      {...keyboard}
      className={`question-player layout-${question.layout}`}
      data-activity-id={question.ref.activityId}
      {...(repeatedTitle
        ? { 'aria-label': displayTitle }
        : { 'aria-labelledby': `${instanceId}-title` })}
    >
      <header className="question-header">
        <QuestionLevelPill
          course={question.ref.activityId.startsWith('igcse/') ? 'igcse' : 'alevel'}
          level={question.ref.level}
        />
        {!repeatedTitle && <h2 id={`${instanceId}-title`}>{displayTitle}</h2>}
      </header>
      {!student && (
        <p className="mode-notice" role="status">
          This read-only view creates no assessment or progress evidence.
        </p>
      )}
      <Content blocks={question.context} />
      {question.scaffolds
        .filter((scaffold) => scaffold.level === question.ref.level)
        .map((scaffold) => (
          <aside className="scaffold" key={scaffold.id} aria-label="Built-in support">
            <strong>Built-in support</strong>
            <p className="support-note">{scaffold.purpose}</p>
            <Content blocks={scaffold.content} />
          </aside>
        ))}
      {!student && (
        <section className="worked-answer teacher-answer">
          <h3>Checked answer and diagrams</h3>
          <Content blocks={question.workedAnswer} />
        </section>
      )}
      <div className="question-parts">
        {question.sentenceTokens && (
          <section
            className="question-part sentence-response"
            aria-label="Complete the explanation"
          >
            <p className="gap-sentence">
              {question.sentenceTokens.map((token, index) => {
                if (typeof token === 'string') return <span key={index}>{token}</span>;
                const part = question.parts.find((part) => part.id === token.partId);
                if (!part || part.kind !== 'text')
                  throw Error('Inline sentence must reference a text part.');
                return student ? (
                  <ResponseControl
                    key={`${part.id}:${actions.clearRevision}`}
                    part={part}
                    response={attempt.currentResponses[part.id]}
                    readOnly={readOnly}
                    appearance="inline-gap"
                    fieldLabel={part.prompt
                      .map((block) => (block.kind === 'text' ? block.text : ''))
                      .join(' ')}
                    onResponse={(response) => sendResponse(part.id, response)}
                  />
                ) : (
                  <strong key={part.id}>{part.accepted[0]}</strong>
                );
              })}
            </p>
            <p className="marks">
              {question.parts.length} gaps · {question.parts.length} marks
            </p>
            {feedback?.issues?.map((issue, index) => (
              <p className="validation-issue" key={index}>
                {issue.message}
              </p>
            ))}
          </section>
        )}
        {!question.sentenceTokens &&
          question.parts.map((part, index) => {
            return (
              <section
                className="question-part"
                key={part.id}
                aria-labelledby={`${instanceId}-part-${part.id}`}
              >
                <div className="part-heading">
                  <h3 id={`${instanceId}-part-${part.id}`}>
                    {question.parts.length > 1 ? `Part ${index + 1}` : 'Your response'}
                  </h3>
                  <span className="marks">
                    [{part.marks} {part.marks === 1 ? 'mark' : 'marks'}]
                  </span>
                </div>
                <Content blocks={part.prompt} />
                {!student && part.kind === 'correction' && <p>{part.sourceText}</p>}
                {student && (
                  <ResponseControl
                    key={`${part.id}:${actions.clearRevision}`}
                    part={part}
                    response={attempt.currentResponses[part.id]}
                    readOnly={readOnly}
                    onResponse={(response) => sendResponse(part.id, response)}
                    {...(renderEditor ? { renderEditor } : {})}
                    {...(part.kind === 'numeric' && part.workingFramework
                      ? {
                          workingAssisted: shownSupport.some(
                            (item) =>
                              item.kind === 'hint' &&
                              item.supportId === part.workingFramework!.supportId,
                          ),
                          onRequestSupport: () =>
                            onCommand({
                              kind: 'assist',
                              assistance: {
                                kind: 'hint',
                                supportId: part.workingFramework!.supportId,
                                at: Date.now(),
                              },
                            }),
                        }
                      : {})}
                  />
                )}
                {!student && part.kind === 'explanation' && (
                  <ul>
                    {part.rubric.map((point) => (
                      <li key={point.id}>
                        {point.text}
                        {point.reject && <p className="support-note">{point.reject}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {!student && part.kind === 'drawing-self-check' && (
                  <>
                    <Content blocks={part.model} />
                    <ul>
                      {part.criteria.map((criterion) => (
                        <li key={criterion}>{criterion}</li>
                      ))}
                    </ul>
                  </>
                )}
                {feedback?.issues
                  ?.filter((issue) => issue.partId === part.id)
                  .map((issue, item) => (
                    <div className="validation-issue" key={item}>
                      <p>
                        {issue.textClassification === 'unrecognized'
                          ? 'Answer not recognised: '
                          : issue.textClassification === 'empty'
                            ? 'Answer incomplete: '
                            : 'Check your response: '}
                        {issue.message}
                      </p>
                      {issue.rubricSupport && <Content blocks={issue.rubricSupport} />}
                    </div>
                  ))}
              </section>
            );
          })}
      </div>
      {feedback && (
        <div className="validation-issue" role="alert">
          <strong>Response has not been assessed</strong>
          <p>{feedback.message}</p>
        </div>
      )}
      {assessed && (
        <p className="support-note">
          You can edit your response for learning. Your first submission and marks remain fixed.
        </p>
      )}
      {student && attempt.phase === 'rubric-review' && (
        <>
          <div className="rubric-reviews">
            {attempt.reviews.map((review) => (
              <RubricPanel
                key={review.partId}
                question={question}
                review={review}
                onCommand={onCommand}
              />
            ))}
          </div>
          <button
            type="button"
            className="primary"
            disabled={attempt.reviews.some((review) => review.activePointId !== null)}
            onClick={() => onCommand({ kind: 'finish-rubric', at: Date.now() })}
          >
            Finish self-review
          </button>
        </>
      )}
      {student && attempt.phase === 'drawing-review' && (
        <section className="rubric-panel" aria-label="Drawing and equation self-check">
          <h3>Review your drawing or equation</h3>
          <p>
            Your submitted calculation is frozen. Compare the drawing or equation you made before
            calculating with the model below.
          </p>
          <p>
            Calculation: {attempt.automaticMarks.earned} / {attempt.automaticMarks.available} marks.
            The final aggregate result follows your self-check.
          </p>
          {attempt.automaticMarks.points.map((point) => (
            <p key={`${point.partId}-${point.pointId}`}>{point.message}</p>
          ))}
          {attempt.checks.map((check) => {
            const part = question.parts.find((item) => item.id === check.partId);
            if (part?.kind !== 'drawing-self-check')
              return (
                <p key={check.partId} role="alert">
                  The drawing model could not be restored.
                </p>
              );
            return (
              <section key={check.partId}>
                <Content blocks={part.model} />
                <ul>
                  {part.criteria.map((criterion) => (
                    <li key={criterion}>{criterion}</li>
                  ))}
                </ul>
                {check.judgement === 'pending' ? (
                  <div className="action-row">
                    <button
                      type="button"
                      onClick={() =>
                        onCommand({
                          kind: 'confirm-drawing',
                          partId: part.id,
                          matches: true,
                          at: Date.now(),
                        })
                      }
                    >
                      Yes, my drawing meets every criterion
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onCommand({
                          kind: 'confirm-drawing',
                          partId: part.id,
                          matches: false,
                          at: Date.now(),
                        })
                      }
                    >
                      No, my drawing needs correction
                    </button>
                  </div>
                ) : (
                  <p>
                    Self-check recorded:{' '}
                    {check.judgement === 'pass' ? 'meets the criteria' : 'needs correction'}.
                  </p>
                )}
              </section>
            );
          })}
        </section>
      )}
      {assessment && (
        <section className="assessment-feedback" aria-label="First assessment" role="status">
          <h3>{assessment.kind === 'revealed' ? 'Answer revealed' : 'First assessment'}</h3>
          {assessment.kind !== 'revealed' ? (
            <>
              <p className="score">
                {assessment.marks.earned} / {assessment.marks.available} marks
                {assessment.selfAssessed ? ' · self-assessed' : ''}
              </p>
              {assessment.marks.points.map((point) => (
                <div className="mark-feedback" key={`${point.partId}-${point.pointId}`}>
                  <p>
                    {point.available > 0 && (
                      <>
                        <strong>
                          {assessmentPointLabel(
                            question.parts.find((part) => part.id === point.partId),
                            point.earned,
                            point.available,
                          )}
                        </strong>
                        {' \u00b7 '}
                      </>
                    )}
                    {point.message}
                  </p>
                  {learningReviewEnabled &&
                    assessment.kind === 'marked' &&
                    point.earned < point.available &&
                    point.learningReview?.eligible && (
                      <details className="learning-review">
                        <summary>Review equivalent wording for learning</summary>
                        <p>
                          Compare your answer with the model and rubric. This review preserves your
                          first marks.
                        </p>
                        <p>
                          <strong>Model answer:</strong> {point.learningReview.modelAnswer}
                        </p>
                        <Content blocks={point.learningReview.rubric} />
                        <div className="action-row">
                          <button
                            type="button"
                            onClick={() =>
                              onCommand({
                                kind: 'review-valid-alternative',
                                decision: {
                                  partId: point.partId,
                                  pointId: point.pointId,
                                  judgement: 'equivalent',
                                  reviewer: 'student',
                                },
                              })
                            }
                          >
                            My wording is equivalent
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onCommand({
                                kind: 'review-valid-alternative',
                                decision: {
                                  partId: point.partId,
                                  pointId: point.pointId,
                                  judgement: 'not-equivalent',
                                  reviewer: 'student',
                                },
                              })
                            }
                          >
                            My wording is not equivalent
                          </button>
                        </div>
                      </details>
                    )}
                </div>
              ))}
            </>
          ) : (
            <p>This attempt is assisted; the reveal is not an independent assessed response.</p>
          )}
          {assisted && <p className="support-note">Support was requested during this attempt.</p>}
          {assessed && attempt.learningReview && (
            <p>
              Learning review: {attempt.learningReview.reviewedMarks.earned} /{' '}
              {attempt.learningReview.reviewedMarks.available} marks. First marks remain unchanged.
            </p>
          )}
        </section>
      )}
      {shownSupport
        .filter((item) => item.kind === 'hint')
        .map((item) => {
          const hint = question.hints.find((value) => value.id === item.supportId);
          return hint ? (
            <aside className="hint-panel" key={item.supportId}>
              <strong>Requested hint</strong>
              <Content blocks={hint.content} />
            </aside>
          ) : null;
        })}
      {canCheckCorrection && correctionFeedback && (
        <section
          className="correction-feedback"
          aria-label="Learning correction check"
          role="status"
        >
          <h3>Learning correction check</h3>
          <p className="support-note">
            This feedback checks your current automatic responses for learning. Your first result
            and revision progress stay fixed.
          </p>
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
                <p key={`${point.partId}-${point.pointId}`}>{point.message}</p>
              ))}
            </>
          ) : (
            <>
              <p>
                <strong>
                  {correctionFeedback.status === 'unrecognized'
                    ? 'Correction not recognised'
                    : 'Correction incomplete'}
                </strong>
              </p>
              {correctionFeedback.issues.map((issue, index) => (
                <div key={index}>
                  <p>{issue.message}</p>
                  {issue.rubricSupport && <Content blocks={issue.rubricSupport} />}
                </div>
              ))}
            </>
          )}
        </section>
      )}
      {student && showedAnswer && (
        <section className="worked-answer">
          <h3>Worked answer</h3>
          <Content blocks={question.workedAnswer} />
        </section>
      )}
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
      {student && (
        <footer className="player-footer">
          {!reviewing &&
            question.hints
              .filter((hint) => !shownSupport.some((item) => item.supportId === hint.id))
              .map((hint) => (
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
              ))}
          <QuestionActions actions={actions} />
          {saveStatus.kind === 'error' && (
            <div className="save-status save-error" role="alert">
              <>
                <strong>Work has not been saved.</strong> {saveStatus.error.message}
                {saveStatus.error.retryable && onRetrySave && (
                  <button type="button" onClick={onRetrySave}>
                    Retry save
                  </button>
                )}
              </>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
