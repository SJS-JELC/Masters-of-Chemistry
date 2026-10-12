import { useEffect } from 'react';
import type { RecallFact, RecallExceptionEntryResponse, RecallField } from '../contracts/recall.ts';
import type { QuestionPlayerProps } from '../ui/QuestionPlayer.tsx';
import { QuestionPlayer } from '../ui/QuestionPlayer.tsx';
import { QuestionActions, useQuestionActions } from '../ui/QuestionActions.tsx';
import { useQuestionKeyboard } from '../ui/use-question-keyboard.ts';
import { Content } from '../ui/Content.tsx';
import { markRecallFactFields, recallFields } from './marking.ts';
import { decodeRecallExceptionEntries, encodeRecallExceptionEntries } from './compatibility.ts';
import { RecallResponseControl } from './RecallResponseControls.tsx';
import { isModelAnswerShown } from '../domain/attempt/model-answer.ts';
import { recallNotationText } from './notation.ts';
import './recall-test.css';
export type RecallTestPlayerProps = Readonly<{ fact: RecallFact }> &
  Pick<
    QuestionPlayerProps,
    | 'question'
    | 'attempt'
    | 'onCommand'
    | 'onNext'
    | 'saveStatus'
    | 'onRetrySave'
    | 'feedback'
    | 'canNext'
    | 'correctionFeedback'
  >;
/** The full model retains answer conditions, alternate methods and human-readable option labels. */
export function RecallModelAnswer({ fact }: Readonly<{ fact: RecallFact }>) {
  return (
    <section className="worked-answer" aria-label="Model answer">
      <h3>MODEL ANSWER</h3>
      <Content
        blocks={[
          {
            kind: 'text',
            text:
              !fact.fields && fact.entry
                ? recallNotationText(fact.answer, fact.entry)
                : fact.answer,
          },
          ...(fact.context ?? []).map((text) => ({ kind: 'text' as const, text })),
        ]}
      />
    </section>
  );
}
export function RecallTestPlayer(props: RecallTestPlayerProps) {
  if (props.fact.course === 'alevel') {
    const { fact: _, ...player } = props;
    return <QuestionPlayer {...player} presentation="standard" recallPresentation />;
  }
  return <IGCSERecallTestPlayer {...props} />;
}
function IGCSERecallTestPlayer({
  fact,
  question,
  attempt,
  onCommand,
  onNext,
  saveStatus,
  onRetrySave,
  feedback,
  canNext = true,
  correctionFeedback,
}: RecallTestPlayerProps) {
  const student = attempt.mode === 'student',
    assessed = student && attempt.phase === 'assessed';
  const fields = recallFields(fact),
    collection = fact.exceptionCollection;
  const value = (id: string) => {
    const r = attempt.currentResponses[id];
    return r?.kind === 'text' ? r.value : '';
  };
  const send = (id: string, text: string) => {
    if (student)
      onCommand({ kind: 'respond', partId: id, response: { kind: 'text', value: text } });
  };
  useEffect(() => {
    if (
      student &&
      attempt.phase === 'answering' &&
      collection &&
      !attempt.currentResponses[collection.id]
    )
      onCommand({
        kind: 'respond',
        partId: collection.id,
        response: { kind: 'text', value: '[]' },
      });
  }, [student, attempt, collection, onCommand]);
  let entries: readonly RecallExceptionEntryResponse[] = [];
  let malformed = false;
  if (collection)
    try {
      entries = decodeRecallExceptionEntries(value(collection.id) || '[]');
    } catch {
      malformed = true;
    }
  const modelVisible = !student || assessed || isModelAnswerShown(attempt);
  const ready =
    fields.every((f) => value(f.id).trim()) && !malformed && entries.every((e) => e.value.trim());
  const actions = useQuestionActions({
    attempt,
    onCommand,
    onNext,
    ready,
    canNext,
    correctionFeedback,
    modelAnswerVisible: modelVisible,
  });
  const keyboard = useQuestionKeyboard(
    `${question.ref.questionId}:${student ? attempt.attemptId : attempt.mode}`,
    student,
    actions,
  );
  const readOnly = !student;
  const result =
    assessed && attempt.firstAssessment.kind === 'marked'
      ? markRecallFactFields(fact, attempt.firstResponse.responses)
      : undefined;
  const review = assessed ? attempt.learningReview : undefined;
  const frozenCollection =
    assessed && collection ? attempt.firstResponse.responses[collection.id] : undefined;
  const collectionUnchanged =
    frozenCollection?.kind === 'text' &&
    collection &&
    frozenCollection.value === value(collection.id);
  const renderField = (f: RecallField, inline = false) => {
    const frozen = assessed ? attempt.firstResponse.responses[f.id] : undefined;
    const unchanged = frozen?.kind === 'text' && frozen.value === value(f.id);
    const outcome = unchanged ? result?.fields.find((r) => r.fieldId === f.id) : undefined;
    const decision = review?.decisions.find((d) => d.partId === f.id && d.pointId === f.id);
    return (
      <RecallResponseControl
        key={f.id}
        field={f}
        value={student ? value(f.id) : ''}
        readOnly={readOnly}
        inline={inline}
        outcome={outcome}
        reviewedCorrect={unchanged && decision?.judgement === 'equivalent'}
        onChange={(v) => send(f.id, v)}
        learningReviewAction={unchanged && outcome?.alternativeEligible ? (
            <button className="recall-mark-correct" type="button" onClick={() => onCommand({
              kind: 'review-valid-alternative', decision: {
                partId: f.id, pointId: f.id, judgement: decision?.judgement === 'equivalent' ? 'not-equivalent' : 'equivalent', reviewer: 'student',
              },
            })}>{decision?.judgement === 'equivalent' ? 'Undo mark as correct' : 'Mark as correct'}</button>
        ) : undefined}
        learningReview={unchanged && outcome?.alternativeEligible ? (
          <span className="recall-learning-review-direct">
            <details><summary>Equivalent wording guidance</summary>
              <p>{f.alternative?.kind === 'valid-alternative' ? f.alternative.guidance : ''}</p>
              <p>Learning review leaves your first automatic result and recall stage unchanged.</p>
            </details>
          </span>
        ) : undefined}
      />
    );
  };
  const saveEntries = (next: readonly RecallExceptionEntryResponse[]) => {
    if (collection) send(collection.id, encodeRecallExceptionEntries(next));
  };
  const addException = () => {
    if (!collection) return;
    let n = 1;
    while (entries.some((e) => e.id === collection.responsePrefix + n)) n++;
    saveEntries([...entries, { id: collection.responsePrefix + n, value: '' }]);
  };
  return (
    <article
      {...keyboard}
      className="question-player recall-test-player"
      aria-label="Key Factual Recall"
    >
      <header className="question-header">
        <h2>{fact.prompt}</h2>
      </header>
      {!student && (
        <p className="mode-notice" role="status">
          This read-only view creates no assessment or progress evidence.
        </p>
      )}
      {!!fact.context?.length && (
        <Content blocks={fact.context.map((text) => ({ kind: 'text', text }))} />
      )}
      {student && fact.sentenceTokens ? (
        <div className="recall-gap-sentence" aria-label="Complete the definition">
          {fact.sentenceTokens.map((t, i) =>
            typeof t === 'string' ? (
              <span key={i}>{t}</span>
            ) : (
              renderField(fields.find((f) => f.id === t.fieldId)!, true)
            ),
          )}
        </div>
      ) : (
        student && <div className="recall-fields">{fields.map((f) => renderField(f))}</div>
      )}
      {student && collection && (
        <section className="recall-exceptions" aria-label={collection.label}>
          <h3>{collection.label}</h3>
          {entries.map((e, i) => {
            const frozenRaw =
              assessed && collection ? attempt.firstResponse.responses[collection.id] : undefined;
            const outcome =
              frozenRaw?.kind === 'text' && frozenRaw.value === value(collection.id)
                ? result?.fields.find((r) => r.fieldId === e.id)
                : undefined;
            return (
              <div key={e.id} className="recall-exception-row">
                <RecallResponseControl
                  field={{
                    id: e.id,
                    label: `Exception ${i + 1}`,
                    answer: '',
                    accepted: [],
                    entry: { kind: 'text' },
                  }}
                  value={e.value}
                  readOnly={readOnly}
                  outcome={outcome}
                  onChange={(v) =>
                    saveEntries(entries.map((x) => (x.id === e.id ? { ...x, value: v } : x)))
                  }
                />
                <button
                  type="button"
                  disabled={readOnly}
                  aria-label={`Remove exception ${i + 1}`}
                  onClick={() => saveEntries(entries.filter((x) => x.id !== e.id))}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button type="button" disabled={readOnly} onClick={addException}>
            Add exception
          </button>
          {malformed && (
            <p role="alert">
              Saved exception entries could not be read. Clear this response to enter them again.
            </p>
          )}
          {(collectionUnchanged ? result : undefined)?.fields
            .filter((r) => r.fieldId === collection.id)
            .map((r) => (
              <p
                key={r.fieldId}
                className={r.correct ? 'recall-correct' : 'recall-collection-status'}
                role="status"
              >
                {r.message}
              </p>
            ))}
        </section>
      )}
      {modelVisible && <RecallModelAnswer fact={fact} />}
      {student && result && !result.correct && (
        <p role="status">Compare your first checked response with the model answer.</p>
      )}
      {feedback && (
        <div role="alert" className="validation-issue">
          <p>{feedback.message}</p>
          {feedback.issues?.map((i, n) => (
            <p key={n}>{i.message}</p>
          ))}
        </div>
      )}
      {student && (
        <footer className="player-footer">
          <QuestionActions actions={actions} variant="check-next" />
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
        </footer>
      )}
    </article>
  );
}
