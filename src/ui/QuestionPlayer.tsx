import { QuestionActions, useQuestionActions } from './QuestionActions.tsx';
import { useQuestionKeyboard } from './use-question-keyboard.ts';
import { useId, Suspense, lazy } from 'react';
import type { ComponentType, ReactNode } from 'react';
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
import type { ResponseControlProps } from './ResponseControl.tsx';
import { TextRangePicker } from './TextRangePicker.tsx';
import { responseFingerprint } from './action-state.ts';
import type { ResponseStatus } from './current-feedback.ts';
import {
  questionDisplayTitle,
  repeatsQuestionSubtopic,
  useQuestionChrome,
} from '../shell/QuestionChrome.tsx';
import { QuestionLevelPill } from './QuestionLevelPill.tsx';
import { isModelAnswerShown, isModelAnswerPanelShown } from '../domain/attempt/model-answer.ts';
import { chemicalQuestionTitle } from './chemical-presentation.ts';
import { sourceFamilies } from './source-family.ts';
import type { PreparedQuestionTools } from '../foundation/question-tools.ts';
const DotCrossPlayer = lazy(async () => ({
  default: (await import('./DotCrossPlayer.tsx')).DotCrossPlayer,
}));
const SourceQuestionPlayer = lazy(async () => ({
  default: (await import('./SourceQuestionPlayer.tsx')).SourceQuestionPlayer,
}));
const ChemicalQuestionBody = lazy(async () => ({
  default: (await import('./ChemicalQuestionBody.tsx')).ChemicalQuestionBody,
}));
const ChemicalWorkedAnswer = lazy(async () => ({
  default: (await import('./ChemicalQuestionBody.tsx')).ChemicalWorkedAnswer,
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
  readonly restoredFeedback?: CorrectionFeedback | undefined;
  readonly learningReviewEnabled?: boolean;
  readonly renderEditor?: (props: EditorSurfaceProps) => ReactNode;
  /** Optional unmarked interactive workspace; responses still use the shared controls. */
  readonly workspace?: ReactNode;
  /** Authoring families can use standard controls under an existing DEV activity context. */
  readonly presentation?: 'standard';
  /** Recall hosts opt in to compact labels and automatic post-check model feedback. */
  readonly recallPresentation?: boolean;
  /** Optional authoring response surface; commands/attempt semantics stay shared. */
  readonly responseControl?: ComponentType<ResponseControlProps>;
  readonly preparedTools?: PreparedQuestionTools;
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
      <p>Select evidence for each point in your submitted answer.</p>
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
  restoredFeedback,
  canNext = true,
  learningReviewEnabled = false,
  renderEditor,
  workspace,
  presentation,
  recallPresentation = false,
  responseControl,
  preparedTools,
}: QuestionPlayerProps) {
  const ReadySourcePlayer = preparedTools?.SourcePlayer ?? SourceQuestionPlayer;
  const ReadyDotPlayer = preparedTools?.DotPlayer ?? DotCrossPlayer;
  const ReadyChemicalBody = preparedTools?.ChemicalBody ?? ChemicalQuestionBody;
  const ReadyChemicalAnswer = preparedTools?.ChemicalAnswer ?? ChemicalWorkedAnswer;
  const PlayerResponseControl = responseControl ?? ResponseControl;
  const instanceId = useId();
  const chrome = useQuestionChrome();
  const chemical = question.chemicalPresentation;
  const displayTitle = chemical ? chemicalQuestionTitle(chemical) : questionDisplayTitle(question);
  const repeatedTitle =
    recallPresentation || (!chemical && repeatsQuestionSubtopic(displayTitle, chrome));
  const actions = useQuestionActions({
    attempt,
    modelAnswerVisible:
      isModelAnswerShown(attempt) ||
      (recallPresentation && attempt.mode === 'student' && attempt.phase === 'assessed'),
    ready:
      !recallPresentation ||
      question.parts
        .filter((part) => part.required)
        .every((part) => {
          const response = attempt.currentResponses[part.id];
          return response?.kind === 'text' && !!response.value.trim();
        }),
    correctionFeedback: correctionFeedback ?? restoredFeedback,
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
  if (presentation !== 'standard' && sourceFamilies[question.ref.activityId])
    return (
      <Suspense fallback={null}>
        <ReadySourcePlayer
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
          {...(preparedTools ? { preparedTools } : {})}
          {...(renderEditor ? { renderEditor } : {})}
        />
      </Suspense>
    );
  if (
    presentation !== 'standard' &&
    question.parts.length === 1 &&
    question.parts[0]?.kind === 'dot-and-cross'
  )
    return (
      <Suspense fallback={null}>
        <ReadyDotPlayer
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
          {...(preparedTools ? { preparedTools } : {})}
        />
      </Suspense>
    );
  const student = attempt.mode === 'student';
  const reviewing =
    student && (attempt.phase === 'rubric-review' || attempt.phase === 'drawing-review');
  const assessed = student && attempt.phase === 'assessed';
  const readOnly = !student || reviewing;
  const assessment = assessed ? attempt.firstAssessment : undefined;
  const properties = question.ref.activityId === 'alevel/explaining-properties';
  const checkedFeedback = correctionFeedback ?? restoredFeedback;
  const sameFirst =
    assessed &&
    !attempt.currentResponseChanged &&
    responseFingerprint(attempt.currentResponses) ===
      responseFingerprint(attempt.firstResponse.responses);
  const currentMarks =
    checkedFeedback && 'marks' in checkedFeedback
      ? checkedFeedback.marks
      : sameFirst && assessment?.kind !== 'revealed'
        ? assessment?.marks
        : undefined;
  const pointStatus = (partId: string, pointId?: string): ResponseStatus | undefined => {
    const points = currentMarks?.points.filter(
      (point) => point.partId === partId && (!pointId || point.pointId === pointId),
    );
    return points?.length
      ? points.every((point) => point.earned === point.available)
        ? 'correct'
        : 'incorrect'
      : undefined;
  };
  const shownSupport = student ? attempt.assistance : [];
  const selfReviewComplete =
    !assessment ||
    assessment.kind === 'revealed' ||
    assessment.marks.points
      .filter((point) => {
        const part = question.parts.find((part) => part.id === point.partId);
        return part?.kind === 'explanation' || part?.kind === 'drawing-self-check';
      })
      .every((point) => point.earned === point.available);
  const showedAnswer = isModelAnswerPanelShown(attempt);
  const sendResponse = (partId: string, response: Response) => {
    if (student && !readOnly) onCommand({ kind: 'respond', partId, response });
  };
  return (
    <article
      {...keyboard}
      className={`question-player layout-${question.layout}${properties ? ' properties-player' : ''}${chemical ? ' chemical-question-player' : ''}${recallPresentation ? ' recall-test-player recall-shared-player' : ''}`}
      {...(repeatedTitle
        ? { 'aria-label': displayTitle }
        : { 'aria-labelledby': `${instanceId}-title` })}
    >
      <header className="question-header">
        {!recallPresentation &&
          (question.ref.activityId === 'alevel/recall' ||
          question.ref.activityId === 'igcse/recall' ? (
            <span className="question-level-pill">KEY FACTUAL RECALL</span>
          ) : (
            <QuestionLevelPill
              course={question.ref.activityId.startsWith('igcse/') ? 'igcse' : 'alevel'}
              level={question.ref.level}
            />
          ))}
        {!repeatedTitle && <h2 id={`${instanceId}-title`}>{displayTitle}</h2>}
      </header>
      {!student && (
        <p className="mode-notice" role="status">
          This read-only view creates no assessment or progress evidence.
        </p>
      )}
      {!chemical && <Content blocks={question.context} />}
      {workspace}
      {question.scaffolds
        .filter((scaffold) => scaffold.level === question.ref.level)
        .map((scaffold) => (
          <aside className="scaffold" key={scaffold.id} aria-label="Built-in support">
            <strong>Built-in support</strong>
            <p className="support-note">{scaffold.purpose}</p>
            <Content blocks={scaffold.content} />
          </aside>
        ))}
      <div className="question-parts">
        {chemical && (
          <Suspense fallback={null}>
            <ReadyChemicalBody
              key={`${question.ref.questionId}:${actions.clearRevision}`}
              question={question}
              responses={student ? attempt.currentResponses : {}}
              student={student}
              readOnly={readOnly}
              status={pointStatus}
              onResponse={sendResponse}
            />
          </Suspense>
        )}
        {!chemical && question.sentenceTokens && (
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
                  <PlayerResponseControl
                    key={`${part.id}:${actions.clearRevision}`}
                    part={part}
                    response={attempt.currentResponses[part.id]}
                    readOnly={readOnly}
                    appearance="inline-gap"
                    status={pointStatus(part.id)}
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
            {feedback?.issues?.map((issue, index) => (
              <p className="validation-issue" key={index}>
                {issue.message}
              </p>
            ))}
          </section>
        )}
        {!chemical &&
          !question.sentenceTokens &&
          question.parts.map((part, index) => {
            return (
              <section
                className="question-part"
                key={part.id}
                {...(properties || recallPresentation
                  ? {
                      'aria-label': recallPresentation
                        ? part.prompt
                            .map((block) => (block.kind === 'text' ? block.text : ''))
                            .join(' ') || 'Answer'
                        : 'Select and correct one error',
                    }
                  : { 'aria-labelledby': `${instanceId}-part-${part.id}` })}
              >
                {!properties && !recallPresentation && (
                  <div className="part-heading">
                    <h3 id={`${instanceId}-part-${part.id}`}>
                      {question.parts.length > 1 ? `Part ${index + 1}` : 'Your response'}
                    </h3>
                    <span className="marks">
                      [{part.marks} {part.marks === 1 ? 'mark' : 'marks'}]
                    </span>
                  </div>
                )}
                {!(
                  recallPresentation &&
                  part.prompt.length === 1 &&
                  part.prompt[0]?.kind === 'text' &&
                  /^answer$/i.test(part.prompt[0].text.trim())
                ) && <Content blocks={part.prompt} />}
                {!student && part.kind === 'correction' && <p>{part.sourceText}</p>}
                {student && (
                  <PlayerResponseControl
                    key={`${part.id}:${actions.clearRevision}`}
                    part={part}
                    response={attempt.currentResponses[part.id]}
                    readOnly={readOnly}
                    {...(recallPresentation
                      ? {
                          compactLabel: true,
                          fieldLabel:
                            part.prompt
                              .map((block) => (block.kind === 'text' ? block.text : ''))
                              .join(' ') || 'Answer',
                        }
                      : {})}
                    status={pointStatus(part.id)}
                    selectionStatus={pointStatus(part.id, 'selection')}
                    replacementStatus={pointStatus(part.id, 'replacement')}
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
      {(!student ||
        (recallPresentation && assessed) ||
        showedAnswer ||
        (actions.state.currentCorrect && selfReviewComplete)) && (
        <section
          className={`worked-answer${!student ? ' teacher-answer' : ''}`}
          aria-label="Model answer"
        >
          <h3>MODEL ANSWER</h3>
          {chemical ? (
            <Suspense fallback={null}>
              <ReadyChemicalAnswer question={question} />
            </Suspense>
          ) : (
            <Content blocks={question.workedAnswer} />
          )}
        </section>
      )}
      {student &&
        currentMarks &&
        !question.sentenceTokens &&
        !question.parts.every((part) => part.kind === 'correction') && (
          <p className="response-result" role="status">
            {currentMarks.earned === currentMarks.available && selfReviewComplete
              ? 'Correct.'
              : 'Check your response.'}
          </p>
        )}
      {student && question.sentenceTokens && currentMarks && (
        <p className="sr-only" role="status">
          {currentMarks.earned === currentMarks.available
            ? 'All gaps correct.'
            : 'Some gaps need correction. Each gap has its checked status.'}
        </p>
      )}
      {student && chemical?.kind === 'equation-writing' && currentMarks && (
        <section className="chemical-point-feedback" aria-label="Equation feedback" role="status">
          {currentMarks.points.map((point) => (
            <p
              key={`${point.partId}:${point.pointId}`}
              className={
                point.earned === point.available
                  ? 'chemical-result-correct'
                  : 'chemical-result-incorrect'
              }
            >
              <span aria-label={point.earned === point.available ? 'correct' : 'incorrect'}>
                {point.earned === point.available ? '✓' : '❌'}
              </span>{' '}
              <strong>
                {point.pointId === 'formulae'
                  ? 'Formulae'
                  : point.pointId === 'coefficients'
                    ? 'Balancing'
                    : 'State Symbols'}
              </strong>
            </p>
          ))}
        </section>
      )}
      {checkedFeedback && 'issues' in checkedFeedback && (
        <div className="validation-issue" role="status">
          {[...new Set(checkedFeedback.issues.map((issue) => issue.message))].map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      )}
      {feedback && (
        <div className="validation-issue" role="alert">
          <p>{feedback.message}</p>
        </div>
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
          <p>Compare your submitted drawing or equation with the model.</p>
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
      {assessment?.kind !== 'revealed' && assessment && learningReviewEnabled && (
        <div className="equivalent-reviews">
          {assessment.marks.points
            .filter((point) => point.earned < point.available && point.learningReview?.eligible)
            .map((point) => (
              <details
                onClick={(event) => {
                  if (!event.currentTarget.open && (event.target as Element).closest('summary'))
                    actions.acknowledgeModelAnswer();
                }}
                onToggle={(event) => {
                  if (event.currentTarget.open && !isModelAnswerShown(attempt))
                    actions.acknowledgeModelAnswer();
                }}
                className="learning-review"
                key={`${point.partId}-${point.pointId}`}
              >
                <summary>Review equivalent wording</summary>
                <p>
                  <strong>Model answer:</strong> {point.learningReview!.modelAnswer}
                </p>
                <Content blocks={point.learningReview!.rubric} />
                <div className="action-row">
                  {(['equivalent', 'not-equivalent'] as const).map((judgement) => (
                    <button
                      type="button"
                      key={judgement}
                      onClick={() =>
                        onCommand({
                          kind: 'review-valid-alternative',
                          decision: {
                            partId: point.partId,
                            pointId: point.pointId,
                            judgement,
                            reviewer: 'student',
                          },
                        })
                      }
                    >
                      {judgement === 'equivalent'
                        ? 'My wording is equivalent'
                        : 'My wording is not equivalent'}
                    </button>
                  ))}
                </div>
              </details>
            ))}
        </div>
      )}
      {!properties &&
        shownSupport
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
          <QuestionActions actions={actions} variant={recallPresentation ? 'check-next' : 'full'} />
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
