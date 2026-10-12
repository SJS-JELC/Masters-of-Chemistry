import { useId, useRef, useLayoutEffect } from 'react';
import type { RecallField, RecallFieldOutcome } from '../contracts/recall.ts';
import { recallEntryForField } from './compatibility.ts';
import { recallEntryAcceptsRaw, recallNotationText, recallNotationTokens } from './notation.ts';
import type { ReactNode } from 'react';

export interface RecallResponseControlProps {
  readonly field: RecallField;
  readonly value: string;
  readonly readOnly?: boolean;
  readonly inline?: boolean;
  readonly outcome?: RecallFieldOutcome | undefined;
  readonly reviewedCorrect?: boolean;
  readonly onChange: (value: string) => void;
  readonly learningReview?: ReactNode;
  readonly learningReviewAction?: ReactNode;
}
/** Native raw input owns caret, selection, paste, deletion and IME; overlay is presentation only. */
export function RecallResponseControl({
  field,
  value,
  readOnly = false,
  inline = false,
  outcome,
  reviewedCorrect = false,
  onChange,
  learningReview,
  learningReviewAction,
}: RecallResponseControlProps) {
  const id = useId(),
    entry = recallEntryForField(field),
    composing = useRef(false),
    input = useRef<HTMLInputElement>(null),
    overlay = useRef<HTMLSpanElement>(null);
  const formatted = entry.kind === 'chemical-formula' || entry.kind === 'general-formula';
  const correct = reviewedCorrect || outcome?.correct;
  const state = outcome ? (correct ? 'correct' : 'incorrect') : undefined;
  const status = reviewedCorrect ? 'Marked as correct for learning.' : outcome?.message;
  const syncScroll = () => {
    if (overlay.current && input.current) overlay.current.scrollLeft = input.current.scrollLeft;
  };
  useLayoutEffect(syncScroll, [value]);
  return (
    <span
      className={`recall-response${inline ? ' recall-inline' : ''}${state ? ' recall-' + state : ''}`}
    >
      {!inline && (
        <label
          htmlFor={id}
          className={/^answer$/i.test(field.label.trim()) ? 'sr-only' : undefined}
        >
          {field.label}
        </label>
      )}
      {entry.kind === 'choice' && entry.presentation === 'buttons' ? (
        <span className="recall-choice-buttons" role="group" aria-label={field.label}>
          {entry.options.map(o => <button key={o.id} type="button" aria-pressed={value === o.id} disabled={readOnly}
            onClick={() => onChange(o.id)}>{o.label}</button>)}
        </span>
      ) : entry.kind === 'choice' ? (
        <select
          id={id}
          aria-label={field.label}
          aria-invalid={state === 'incorrect' ? true : undefined}
          aria-describedby={status ? id + '-status' : undefined}
          disabled={readOnly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Choose an answer</option>
          {entry.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="recall-answer-row">
        <span className={`recall-input-wrap${formatted ? ' recall-formatted' : ''}`}>
          <input
            ref={input}
            id={id}
            data-answer-input
            aria-label={field.label}
            aria-invalid={state === 'incorrect' ? true : undefined}
            aria-describedby={status ? id + '-status' : undefined}
            value={value}
            readOnly={readOnly}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode={entry.kind === 'numeric' ? 'decimal' : undefined}
            onChange={(e) => {
              if (composing.current || recallEntryAcceptsRaw(e.target.value, entry))
                onChange(e.target.value);
              syncScroll();
            }}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={(e) => {
              composing.current = false;
              onChange(e.currentTarget.value);
            }}
            onPaste={(e) => {
              if (!recallEntryAcceptsRaw(e.clipboardData.getData('text'), entry))
                e.preventDefault();
            }}
            onBeforeInput={(e) => {
              const native = e.nativeEvent as InputEvent;
              if (!native.isComposing && native.data && !recallEntryAcceptsRaw(native.data, entry))
                e.preventDefault();
            }}
            onScroll={syncScroll}
            onSelect={syncScroll}
          />
          {formatted && (
            <span ref={overlay} className="recall-notation-overlay" aria-hidden="true">
              {recallNotationTokens(value, entry).map((t, i) => (
                <span className={'recall-glyph recall-glyph-' + t.position} key={i}>
                  <span>{t.raw.normalize('NFKC')}</span>
                </span>
              ))}
            </span>
          )}
          {formatted && (
            <span className="sr-only">Formatted chemistry: {recallNotationText(value, entry)}</span>
          )}
        </span>
        {learningReviewAction}
        </span>
      )}
      {entry.kind === 'numeric' && entry.unit && <span className="recall-unit">{entry.unit}</span>}
      {status && (
        <span id={id + '-status'} className="recall-field-status" role="status">
          <span aria-hidden="true">{correct ? '✓' : '✗'} </span>
          {status}
        </span>
      )}
      {learningReview}
    </span>
  );
}
