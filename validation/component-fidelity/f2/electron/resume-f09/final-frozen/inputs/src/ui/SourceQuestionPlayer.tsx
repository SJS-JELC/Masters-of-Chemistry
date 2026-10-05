import { lazy, Suspense, use } from 'react';
import type { ContentBlock, QuestionPart, Response } from '../contracts/question.ts';
import type { QuestionPlayerProps } from './QuestionPlayer.tsx';
import { sourcePresentation } from './source-presentation.ts';
import { SourceResponseControl } from './SourceResponseControl.tsx';
import { ResponseControl } from './ResponseControl.tsx';
import { QuestionLevelPill } from './QuestionLevelPill.tsx';
import { SourceFrozenAnswer, SourceRubricScheme } from './SourceRubricReview.tsx';
import { assessmentPointLabel } from './assessment-label.ts';
import type { CalculationBlock } from '../chemistry/thermochemistry/types.ts';
import './source-components.css';
import './source-adapters.css';
import './energetics-practical-pilot.css';

const ElectronReference = lazy(async () => ({
  default: (await import('../editors/electron-configuration/index.tsx'))
    .ElectronConfigurationReference,
}));
// Exact graphDiagram() markup from canonical energetics-practical/diagrams.js.
const practicalGraph =
  '<svg class="practical-svg graph-svg" viewBox="0 0 760 330" role="img" aria-label="Temperature against volume of acid added graph"><rect class="svg-backdrop" x="0" y="0" width="760" height="330" rx="18"></rect><path d="M106 259 L106 48 M106 259 L697 259" class="axis"></path><path d="M119 234 L464 82 L680 155" class="curve"></path><path d="M464 82 L464 259" class="guide"></path><text x="398" y="309" class="axis-label">volume of acid added</text><text x="30" y="178" class="axis-label" transform="rotate(-90 30 178)">temperature</text><text x="478" y="69" class="graph-note">maximum</text><circle cx="464" cy="82" r="7" class="point"></circle></svg>';

/** Native source content: authored vector diagrams retain their actual SVG DOM. */
function SourceContent({ blocks }: { blocks: readonly ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'image') {
          if (block.src.startsWith('data:image/svg+xml') && block.src.includes(','))
            return (
              <div
                key={i}
                className="diagram diagram-wrap"
                role="img"
                aria-label={block.alt}
                dangerouslySetInnerHTML={{
                  __html: decodeURIComponent(block.src.slice(block.src.indexOf(',') + 1)),
                }}
              />
            );
          return <img key={i} className="content-image" src={block.src} alt={block.alt} />;
        }
        if (block.kind === 'table')
          return (
            <div key={i} className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {block.headers.map((x, n) => (
                      <th key={n} scope="col">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, n) => (
                    <tr key={n}>
                      {row.map((x, c) =>
                        c === 0 ? (
                          <th key={c} scope="row">
                            {x}
                          </th>
                        ) : (
                          <td key={c}>{x}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={i} className={block.kind === 'formula' ? 'question-equation' : 'source-prompt'}>
            {block.text}
          </p>
        );
      })}
    </>
  );
}
function Calculations({ parts }: { parts: readonly (readonly CalculationBlock[])[] }) {
  return (
    <>
      {parts.map((blocks, i) => (
        <section className="answer-part" key={i}>
          <h4>({String.fromCharCode(97 + i)})</h4>
          {blocks.map((block, n) =>
            block.type === 'text' ? (
              <p key={n}>{block.text}</p>
            ) : (
              <div className="math-block" key={n}>
                {block.rows.map(([left, right], r) => (
                  <div className="source-math-row" key={r}>
                    <span className="math-lhs">{left}</span>
                    <span className="math-equals">=</span>
                    <span className="math-rhs">
                      {typeof right === 'string' ? (
                        right
                      ) : (
                        <span className="fraction">
                          <span className="fraction-top">{right.fraction[0]}</span>
                          <span className="fraction-bottom">{right.fraction[1]}</span>
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ),
          )}
        </section>
      ))}
    </>
  );
}
function responseReady(
  part: QuestionPart,
  response: Response | undefined,
  count?: number,
): boolean {
  if (!part.required) return true;
  switch (part.kind) {
    case 'text':
      return response?.kind === 'text' && !!response.value.trim();
    case 'numeric':
      return response?.kind === 'numeric' && !!response.raw.trim();
    case 'choice':
      return (
        response?.kind === 'choice' &&
        response.selected.length > 0 &&
        (count === undefined || response.selected.length === count)
      );
    case 'correction':
      return (
        response?.kind === 'correction' &&
        response.selections.length > 0 &&
        !!response.replacement.trim()
      );
    case 'explanation':
      return (
        response?.kind === 'explanation' &&
        part.sections.every(
          (s) =>
            (response.sections.find((x) => x.id === s.id)?.text.trim().length ?? 0) >=
            (s.minLength ?? 1),
        )
      );
    case 'drawing-self-check':
      return true;
    default:
      return response !== undefined;
  }
}
/** All assessment/timing/storage remains in the shared controller. This component only presents it. */
export function SourceQuestionPlayer(props: QuestionPlayerProps) {
  const {
    question,
    attempt,
    onCommand,
    onNext,
    feedback,
    correctionFeedback,
    saveStatus,
    onRetrySave,
    renderEditor,
    canNext = true,
    learningReviewEnabled = false,
  } = props;
  const source = use(sourcePresentation(question)),
    family = source.family;
  const student = attempt.mode === 'student';
  const assessed = student && attempt.phase === 'assessed';
  const reviewing =
    student && (attempt.phase === 'rubric-review' || attempt.phase === 'drawing-review');
  const assessment = assessed ? attempt.firstAssessment : undefined;
  const shownAnswer =
    !student ||
    (student && attempt.assistance.some((a) => a.kind === 'reveal' || a.kind === 'worked-answer'));
  const responses = attempt.currentResponses;
  const embedded =
    question.parts.length === 1 &&
    ['electron-configuration', 'energy-profile', 'titration-curve'].includes(
      question.parts[0]!.kind,
    );
  const ready = question.parts.every((part) =>
    responseReady(part, responses[part.id], source.fields[part.id]?.count),
  );
  const send = (partId: string, response: Response) => {
    if (student && !reviewing) onCommand({ kind: 'respond', partId, response });
  };
  const assist = (supportId: string, kind: 'hint' | 'reveal' | 'worked-answer') =>
    onCommand({ kind: 'assist', assistance: { kind, supportId, at: Date.now() } });
  const models = () =>
    family === 'electron' ? (
      <Suspense fallback={<p>Loading checked answer…</p>}>
        <ElectronReference questionId={question.ref.questionId} />
      </Suspense>
    ) : embedded && (family === 'energy' || family === 'titration') ? (
      <>
        <SourceContent blocks={question.workedAnswer.filter((block) => block.kind !== 'image')} />
        {student &&
          question.parts.map((part) => (
            <ResponseControl
              key={`model:${question.ref.questionId}:${part.id}`}
              part={part}
              response={source.modelResponses?.[part.id]}
              readOnly
              onResponse={() => {}}
              appearance="source"
              {...(renderEditor ? { renderEditor } : {})}
            />
          ))}
      </>
    ) : source.practical ? (
      <>
        {source.practical.fields.map((field) => (
          <div className="review-answer" key={field.id}>
            <p>Model: {field.model}</p>
            <p>{field.feedback}</p>
          </div>
        ))}
        {source.practical.correction && (
          <p>
            Error model: select “
            {
              source.practical.correction.segments.find(
                (s) => s.id === source.practical!.correction!.errorId,
              )?.text
            }
            ”.
          </p>
        )}
      </>
    ) : source.calculations ? (
      <>
        <SourceContent blocks={question.workedAnswer.filter((block) => block.kind === 'image')} />
        <Calculations parts={source.calculations} />
      </>
    ) : (
      <SourceContent blocks={question.workedAnswer} />
    );
  const rubric =
    student && attempt.phase === 'rubric-review'
      ? attempt.reviews
      : assessment?.kind === 'self-rubric'
        ? assessment.reviews
        : [];
  const pane = (
    <aside
      className={`marking marking-pane${family === 'practical' ? ' marking' : ''}`}
      aria-label="Marking and feedback"
    >
      {family === 'titration' && (
        <div className="answer-copy">
          <h2>Does the curve fit the chemistry?</h2>
        </div>
      )}
      {rubric.map((review) => {
        const part = question.parts.find((p) => p.id === review.partId);
        return part?.kind === 'explanation' ? (
          <SourceRubricScheme
            key={review.partId}
            part={part}
            review={review}
            onCommand={onCommand}
          />
        ) : null;
      })}
      {student && !reviewing && (
        <div className="actions pupil-answer-actions">
          {!assessed && (
            <button
              type="button"
              className="button primary check-answer"
              disabled={!ready}
              onClick={() => onCommand({ kind: 'submit', at: Date.now() })}
            >
              {family === 'acid' ? 'Check answers' : 'Check answer'}
            </button>
          )}
          {assessed && assessment?.kind !== 'self-rubric' && assessment?.kind !== 'revealed' && (
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
              onClick={() => assist('worked-answer', assessed ? 'worked-answer' : 'reveal')}
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
      {student &&
        !reviewing &&
        question.hints
          .filter(
            (hint) =>
              !question.parts.some(
                (p) => p.kind === 'numeric' && p.workingFramework?.supportId === hint.id,
              ),
          )
          .map((hint) => (
            <div className="source-hint" key={hint.id}>
              {attempt.assistance.some((x) => x.supportId === hint.id) ? (
                <SourceContent blocks={hint.content} />
              ) : (
                <button type="button" onClick={() => assist(hint.id, 'hint')}>
                  Show hint
                </button>
              )}
            </div>
          ))}
      {feedback && (
        <div className="status-message warning validation-issue" role="alert">
          <strong>Response has not been assessed</strong>
          <p>{feedback.message}</p>
          {feedback.issues?.map((issue, i) => (
            <p key={i}>{issue.message}</p>
          ))}
        </div>
      )}
      {assessment && (
        <section
          className="results assessment-feedback feedback"
          role="status"
          aria-label="First assessment"
        >
          {assessment.kind === 'revealed' ? (
            <p>Answer revealed. This attempt is assisted.</p>
          ) : (
            <>
              <h3 className="score">
                {assessment.kind === 'self-rubric' ? 'Self-assessed score: ' : ''}
                {assessment.marks.earned}/{assessment.marks.available}
              </h3>
              <div className="field-results mark-list">
                {assessment.marks.points.map((point) => {
                  const correct = point.earned === point.available;
                  const field = source.fields[point.pointId] ?? source.fields[point.partId];
                  const errorModel = source.practical?.correction?.segments.find(
                    (s) => s.id === source.practical?.correction?.errorId,
                  )?.text;
                  const model = point.pointId === 'error' ? errorModel : field?.model;
                  const equivalent =
                    (assessed &&
                      attempt.learningReview?.decisions.some(
                        (x) =>
                          x.partId === point.partId &&
                          x.pointId === point.pointId &&
                          x.judgement === 'equivalent',
                      )) ||
                    false;
                  return (
                    <div
                      className={`result-row ${correct ? 'is-correct pass' : 'fail'}`}
                      key={`${point.partId}:${point.pointId}`}
                    >
                      <span className="result-icon" aria-label={correct ? 'Correct' : 'Incorrect'}>
                        {correct ? '✓' : '✗'}
                      </span>
                      <div className="result-text">
                        {family === 'titration' ? (
                          <span className="curve-check">{point.message}</span>
                        ) : (
                          <>
                            {family === 'practical' && model ? (
                              <em>{model}</em>
                            ) : (
                              <strong>
                                {assessmentPointLabel(
                                  question.parts.find((p) => p.id === point.partId),
                                  point.earned,
                                  point.available,
                                )}
                              </strong>
                            )}
                            <span>
                              {point.pointId === 'error'
                                ? 'Identify the highlighted erroneous phrase before replacing it.'
                                : (field?.feedback ?? point.message)}
                            </span>
                          </>
                        )}
                        {learningReviewEnabled && !correct && point.learningReview?.eligible && (
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
              {source.feedback && <p>{source.feedback}</p>}
            </>
          )}
          <p className="first-result-note">
            Your first submission and marks remain fixed. Corrections are for learning.
          </p>
          {assessed && attempt.learningReview && (
            <p>
              Learning review: {attempt.learningReview.reviewedMarks.earned}/
              {attempt.learningReview.reviewedMarks.available}. First marks remain unchanged.
            </p>
          )}
        </section>
      )}
      {assessed && correctionFeedback && (
        <section
          className="results correction-feedback"
          role="status"
          aria-label="Learning correction check"
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
            correctionFeedback.issues.map((x, i) => <p key={i}>{x.message}</p>)
          )}
        </section>
      )}
      {shownAnswer && (
        <section className={`review-panel worked-answer${!student ? ' teacher-answer' : ''}`}>
          <h3>{student ? 'Worked answer' : 'Checked answer and diagrams'}</h3>
          {models()}
        </section>
      )}
      {student &&
        attempt.phase === 'drawing-review' &&
        attempt.checks.map((check) => {
          const part = question.parts.find((p) => p.id === check.partId);
          return part?.kind === 'drawing-self-check' ? (
            <section key={part.id} className="review-panel">
              <SourceContent blocks={part.model} />
              <ul>
                {part.criteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
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
                My drawing meets every criterion
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
                My drawing needs correction
              </button>
            </section>
          ) : null;
        })}
      {saveStatus.kind === 'error' && (
        <p role="alert">
          Work has not been saved. {saveStatus.error.message}
          {onRetrySave && (
            <button type="button" onClick={onRetrySave}>
              Retry save
            </button>
          )}
        </p>
      )}
      {!student && (
        <details className="source-provenance">
          <summary>Question source and provenance</summary>
          {question.sources.map((s) => (
            <p key={s.path}>
              {s.path} · {s.symbolOrSection} · SHA-256 {s.sha256}
            </p>
          ))}
        </details>
      )}
    </aside>
  );
  const content = (
    <div
      className="question-content source-content"
      onKeyDown={(event) => {
        if (
          event.key !== 'Enter' ||
          event.shiftKey ||
          event.nativeEvent.isComposing ||
          event.repeat ||
          !student ||
          reviewing ||
          family === 'comparison'
        )
          return;
        if (
          !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        )
          return;
        event.preventDefault();
        const inputs = Array.from(
          event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            'input:not([type=radio]):not([type=checkbox]),textarea',
          ),
        );
        const next = inputs[inputs.indexOf(event.target) + 1];
        if (next) next.focus();
        else if (ready)
          onCommand(assessed ? { kind: 'check-correction' } : { kind: 'submit', at: Date.now() });
      }}
    >
      {source.practical ? (
        <div className="question-text">
          <p className="context">{source.practical.context}</p>
          <p className="prompt">{source.practical.prompt}</p>
          {source.practical.diagram === 'graph' && (
            <div className="diagram-wrap" dangerouslySetInnerHTML={{ __html: practicalGraph }} />
          )}
        </div>
      ) : (
        <div className="question-text">
          <SourceContent blocks={question.context} />
        </div>
      )}
      {rubric.length > 0 ? (
        rubric.map((review) => (
          <SourceFrozenAnswer key={review.partId} review={review} onCommand={onCommand} />
        ))
      ) : (
        <div
          className={
            family === 'practical'
              ? 'answer-grid'
              : family === 'bonding'
                ? 'written'
                : family === 'acid'
                  ? 'response-list'
                  : family === 'calorimetry' || family === 'bond'
                    ? 'exam-parts'
                    : 'source-fields'
          }
        >
          {question.parts.map((part, index) =>
            embedded ? (
              <ResponseControl
                key={`${question.ref.questionId}:${part.id}`}
                part={part}
                response={
                  !student
                    ? (source.modelResponses?.[part.id] ?? responses[part.id])
                    : responses[part.id]
                }
                readOnly={!student || reviewing}
                onResponse={(response) => send(part.id, response)}
                appearance="source"
                workspaceAside={pane}
                {...(renderEditor ? { renderEditor } : {})}
              />
            ) : (
              <SourceResponseControl
                key={`${question.ref.questionId}:${part.id}`}
                part={part}
                response={responses[part.id]}
                readOnly={!student || reviewing}
                onResponse={(response) => send(part.id, response)}
                family={family}
                index={index}
                single={question.parts.length === 1}
                result={(() => {
                  const marks =
                    correctionFeedback && 'marks' in correctionFeedback
                      ? correctionFeedback.marks
                      : assessment && 'marks' in assessment
                        ? assessment.marks
                        : undefined;
                  const points = marks?.points.filter((point) => point.partId === part.id);
                  return points?.length
                    ? points.every((point) => point.earned === point.available)
                      ? 'correct'
                      : 'incorrect'
                    : undefined;
                })()}
                {...(source.fields[part.id] ? { field: source.fields[part.id] } : {})}
                assisted={
                  student &&
                  part.kind === 'numeric' &&
                  !!part.workingFramework &&
                  attempt.assistance.some((a) => a.supportId === part.workingFramework!.supportId)
                }
                {...(student && part.kind === 'numeric' && part.workingFramework
                  ? { onRequestSupport: () => assist(part.workingFramework!.supportId, 'hint') }
                  : {})}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
  return (
    <article
      className={`question-player source-player source-${family}${family === 'practical' ? ' ep-pilot' : ''}${family === 'comparison' ? ' comparison-pupil' : ''}${embedded ? ' source-embedded' : ''}`}
      aria-label={question.title}
    >
      <header className="question-header">
        <QuestionLevelPill
          course={question.ref.activityId.startsWith('igcse/') ? 'igcse' : 'alevel'}
          level={question.ref.level}
        />
      </header>
      {!student && (
        <p className="mode-notice">
          This read-only view creates no assessment or progress evidence.
        </p>
      )}
      {embedded ? (
        content
      ) : (
        <div
          className={`question-workspace${family === 'comparison' && rubric.length > 0 ? ' review-workspace' : ''}`}
        >
          {content}
          {pane}
        </div>
      )}
    </article>
  );
}
