import { useRef } from 'react';
import type { AttemptCommand, RubricReview } from '../contracts/attempt.ts';
import type { QuestionPart } from '../contracts/question.ts';
import { TextRangePicker } from './TextRangePicker.tsx';

type Explanation = Extract<QuestionPart, { kind: 'explanation' }>;
export function SourceRubricScheme({
  part,
  review,
  onCommand,
}: {
  part: Explanation;
  review: RubricReview;
  onCommand: (c: AttemptCommand) => void;
}) {
  return (
    <section className="review-card marking-card">
      <h3>Mark scheme</h3>
      <ol className="scheme-list">
        {part.rubric.map((point, index) => {
          const active = review.activePointId === point.id;
          const decision = review.judgements.find((x) => x.pointId === point.id);
          const judged = decision?.status === 'met' || decision?.status === 'not-met';
          const awaiting = decision?.status === 'awaiting-evidence';
          return (
            <li
              className={`scheme-point point-${index + 1}${active ? ' active' : !judged ? ' future' : ''}${judged ? ` ${decision.status}` : ''}`}
              key={point.id}
            >
              <div className="point-main">
                <span className="point-number">{index + 1}</span>
                <p className="point-text">{point.text}</p>
              </div>
              {point.reject && <p className="exclusion">NO MARK: {point.reject}</p>}
              {active && (
                <span className="next-label">
                  {awaiting ? 'NOW HIGHLIGHT YOUR ANSWER' : 'DO THIS NEXT'}
                </span>
              )}
              {decision?.status === 'met' && (
                <blockquote className="evidence-quote">{decision.evidence.text}</blockquote>
              )}
              <div className="decision-row">
                <button
                  type="button"
                  className="decision no"
                  disabled={!active || awaiting}
                  onClick={() =>
                    onCommand({
                      kind: 'judge-rubric',
                      partId: part.id,
                      judgement: { pointId: point.id, status: 'not-met' },
                    })
                  }
                >
                  ✗ Not met
                </button>
                <button
                  type="button"
                  className="decision yes"
                  disabled={!active || awaiting}
                  onClick={() =>
                    onCommand({
                      kind: 'judge-rubric',
                      partId: part.id,
                      judgement: { pointId: point.id, status: 'awaiting-evidence' },
                    })
                  }
                >
                  ✓ Met
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mark-footer">
        <p>
          {review.judgements.filter((x) => x.status === 'met' || x.status === 'not-met').length}/
          {part.rubric.length} points reviewed
        </p>
        <button
          type="button"
          disabled={review.activePointId !== null}
          onClick={() => onCommand({ kind: 'finish-rubric', at: Date.now() })}
        >
          Finish marking
        </button>
      </div>
    </section>
  );
}
export function SourceFrozenAnswer({
  review,
  onCommand,
}: {
  review: RubricReview;
  onCommand: (c: AttemptCommand) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const decision = review.judgements.find((x) => x.pointId === review.activePointId);
  const awaiting = decision?.status === 'awaiting-evidence';
  const choose = (start: number, end: number) => {
    if (
      !awaiting ||
      !review.activePointId ||
      start < 0 ||
      end <= start ||
      end > review.lockedText.length
    )
      return;
    onCommand({
      kind: 'judge-rubric',
      partId: review.partId,
      judgement: {
        pointId: review.activePointId,
        status: 'met',
        evidence: { start, end, text: review.lockedText.slice(start, end) },
      },
    });
    window.getSelection()?.removeAllRanges();
  };
  const select = () => {
    const selection = window.getSelection(),
      node = container.current;
    if (!selection?.rangeCount || !node || !awaiting) return;
    const range = selection.getRangeAt(0);
    if (!node.contains(range.startContainer) || !node.contains(range.endContainer)) return;
    const prefix = range.cloneRange();
    prefix.selectNodeContents(node);
    prefix.setEnd(range.startContainer, range.startOffset);
    const start = prefix.toString().length;
    choose(start, start + range.toString().length);
  };
  const evidence = review.judgements.flatMap((x, i) =>
    x.status === 'met' ? [{ ...x.evidence, index: i + 1 }] : [],
  );
  const bounds = [
    ...new Set([0, review.lockedText.length, ...evidence.flatMap((x) => [x.start, x.end])]),
  ].sort((a, b) => a - b);
  return (
    <section className="review-card answer-card">
      <h3>Your locked answer</h3>
      <p className={`instruction${awaiting ? ' awaiting' : ''}`}>
        {awaiting
          ? 'Highlight the words in your answer that meet this marking point.'
          : review.activePointId
            ? 'Review the next marking point on the left.'
            : 'All points reviewed. Finish marking to record your self-assessed score.'}
      </p>
      <div
        ref={container}
        className="locked-answer"
        tabIndex={0}
        onPointerUp={select}
        onKeyUp={select}
      >
        {bounds.slice(0, -1).map((start, i) => {
          const end = bounds[i + 1]!;
          const point = evidence.find((x) => x.start <= start && x.end >= end);
          return point ? (
            <mark className={`evidence point-${point.index}`} key={start}>
              {review.lockedText.slice(start, end)}
            </mark>
          ) : (
            <span key={start}>{review.lockedText.slice(start, end)}</span>
          );
        })}
      </div>
      <p className="auto-note">
        Release the mouse or lift your finger after selecting text to save your evidence.
      </p>
      {awaiting && (
        <details className="keyboard-evidence">
          <summary>Keyboard evidence selection</summary>
          <TextRangePicker
            text={review.lockedText}
            label="Select evidence in your locked answer"
            onPick={(range) => choose(range.start, range.end)}
          />
        </details>
      )}
    </section>
  );
}
