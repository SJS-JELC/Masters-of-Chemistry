import { useId } from 'react';
import type { QuestionPart, ResponseFor } from '../contracts/question.ts';
export function CorrectionSegments({
  part,
  response,
  readOnly,
  onResponse,
  appearance,
  onPicked,
}: {
  readonly part: Extract<QuestionPart, { kind: 'correction' }>;
  readonly response: ResponseFor<'correction'>;
  readonly readOnly: boolean;
  readonly onResponse: (response: ResponseFor<'correction'>) => void;
  readonly appearance?: 'energetics-practical';
  readonly onPicked?: () => void;
}) {
  const name = useId(),
    multiple = part.segmentSelection === 'multiple';
  if (appearance === 'energetics-practical')
    return (
      <fieldset
        className="correction-box"
        disabled={readOnly}
        aria-label="Sample answer to correct"
      >
        <div className="correction-segments">
          {part.segments?.map((segment) => {
            const selected = response.selections.some(
              (range) => range.start === segment.start && range.end === segment.end,
            );
            if (!/[a-z0-9]/i.test(segment.text))
              return (
                <span className="correction-punctuation" key={segment.id}>
                  {segment.text}
                </span>
              );
            return (
              <button
                type="button"
                key={segment.id}
                data-error-id={segment.id}
                className={`error-segment${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => {
                  onResponse({
                    ...response,
                    selections: [{ start: segment.start, end: segment.end, text: segment.text }],
                  });
                  onPicked?.();
                }}
              >
                {segment.text}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  return (
    <fieldset className="correction-segments" disabled={readOnly}>
      <legend>Select the phrase to correct</legend>
      {part.segments?.map((segment) => {
        const selected = response.selections.some(
          (range) => range.start === segment.start && range.end === segment.end,
        );
        const range = { start: segment.start, end: segment.end, text: segment.text };
        return (
          <label className="choice-option" key={segment.id}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              checked={selected}
              onChange={(event) =>
                onResponse({
                  ...response,
                  selections: multiple
                    ? event.target.checked
                      ? [...response.selections, range]
                      : response.selections.filter(
                          (value) => value.start !== range.start || value.end !== range.end,
                        )
                    : [range],
                })
              }
            />
            {segment.text}
          </label>
        );
      })}
    </fieldset>
  );
}
