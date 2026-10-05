import { useId, useRef } from 'react';
import type { QuestionPart, Response } from '../contracts/question.ts';
import { CorrectionSegments } from './CorrectionSegments.tsx';
import { Content } from './Content.tsx';

/** Source component DOM from energetics-practical/app.js makeCorrection/makeFields.
 * Only response presentation lives here; assessment, timing and persistence belong to the host. */
export function EnergeticsResponseControl({
  part,
  response,
  readOnly,
  onResponse,
  fieldLabel,
  multiline = false,
}: {
  readonly part: QuestionPart;
  readonly response: Response | undefined;
  readonly readOnly: boolean;
  readonly onResponse: (response: Response) => void;
  readonly fieldLabel?: string;
  readonly multiline?: boolean;
}) {
  const id = useId();
  const replacement = useRef<HTMLInputElement>(null);
  if (part.kind === 'choice') {
    const selected = response?.kind === 'choice' ? response.selected : [];
    return (
      <fieldset className="choice-box mcq-field" disabled={readOnly}>
        <legend>{fieldLabel ?? 'Choose an answer'}</legend>
        <div className={`mcq-options options-${part.options.length}`}>
          {part.options.map((option) => (
            <label className="mcq-option" key={option.id}>
              <input
                type={part.presentation === 'multiple' ? 'checkbox' : 'radio'}
                name={id}
                checked={selected.includes(option.id)}
                onChange={(event) =>
                  onResponse({
                    kind: 'choice',
                    selected:
                      part.presentation === 'multiple'
                        ? event.target.checked
                          ? [...selected, option.id]
                          : selected.filter((value) => value !== option.id)
                        : [option.id],
                  })
                }
              />
              <span>
                <Content blocks={option.content} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  if (part.kind === 'correction') {
    const current =
      response?.kind === 'correction'
        ? response
        : { kind: 'correction' as const, selections: [], replacement: '' };
    return (
      <>
        <CorrectionSegments
          part={part}
          response={current}
          readOnly={readOnly}
          onResponse={onResponse}
          appearance="energetics-practical"
          onPicked={() => replacement.current?.focus()}
        />
        <div className="field-set">
          <label htmlFor={id}>{fieldLabel ?? 'Replacement / correction'}</label>
          <input
            data-answer-input="true"
            ref={replacement}
            id={id}
            className="answer-input"
            aria-label={fieldLabel ?? 'Replacement / correction'}
            readOnly={readOnly}
            value={current.replacement}
            onChange={(event) => onResponse({ ...current, replacement: event.target.value })}
          />
        </div>
      </>
    );
  }
  if (part.kind === 'text') {
    const value = response?.kind === 'text' ? response.value : '';
    const label = fieldLabel ?? 'Your answer';
    const props = {
      id,
      'data-answer-input': 'true',
      readOnly,
      value,
      'aria-label': label,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onResponse({ kind: 'text', value: event.target.value }),
    };
    return (
      <div className="field-set">
        <label htmlFor={id}>{label}</label>
        {multiline || part.presentation === 'multiline' || label.length > 100 ? (
          <textarea {...props} className="answer-area" rows={3} />
        ) : (
          <input {...props} className="answer-input" />
        )}
      </div>
    );
  }
  return null;
}
