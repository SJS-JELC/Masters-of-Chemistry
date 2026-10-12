import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChemicalEntryMode } from './chemical-notation.ts';
import {
  chemicalNotationRuns,
  chemicalProseRuns,
  chemicalSelectionOffset,
  normalizeChemicalEntry,
} from './chemical-notation.ts';
import type { ResponseStatus } from './current-feedback.ts';
import './chemical-question.css';

export function ChemicalNotation({
  value,
  mode = 'equation',
  normalizeArrows = true,
}: {
  readonly value: string;
  readonly mode?: ChemicalEntryMode;
  readonly normalizeArrows?: boolean;
}) {
  return (
    <>
      {chemicalNotationRuns(value, mode, normalizeArrows).map((run, i) =>
        run.superscript ? (
          <sup key={i}>{run.text}</sup>
        ) : run.subscript ? (
          <sub key={i}>{run.text}</sub>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  );
}

export function ChemicalProse({ value }: { readonly value: string }) {
  return (
    <>
      {chemicalProseRuns(value).map((run, i) =>
        run.superscript ? (
          <sup key={i}>{run.text}</sup>
        ) : run.subscript ? (
          <sub key={i}>{run.text}</sub>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  );
}

/** Native editing owns caret, selection, IME and mobile input; the overlay only draws notation. */
export function ChemicalEntry({
  value,
  mode,
  label,
  readOnly,
  status,
  onChange,
}: {
  readonly value: string;
  readonly mode: ChemicalEntryMode;
  readonly label: string;
  readonly readOnly: boolean;
  readonly status?: ResponseStatus | undefined;
  readonly onChange: (value: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const selection = useRef<{
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
  } | null>(null);
  const [compositionValue, setCompositionValue] = useState<string | null>(null);
  const [scroll, setScroll] = useState(0);
  const syncScroll = () => setScroll(input.current?.scrollLeft ?? 0);
  const commit = (raw: string) => {
    const field = input.current;
    const normalized = normalizeChemicalEntry(raw, mode);
    if (field && normalized !== raw)
      selection.current = {
        start: chemicalSelectionOffset(raw, field.selectionStart ?? raw.length, mode),
        end: chemicalSelectionOffset(raw, field.selectionEnd ?? raw.length, mode),
        direction: field.selectionDirection ?? 'none',
      };
    // An equivalent paste can leave the controlled value unchanged, so apply its caret now too.
    if (field && selection.current) {
      field.value = normalized;
      field.setSelectionRange(
        selection.current.start,
        selection.current.end,
        selection.current.direction,
      );
    }
    onChange(normalized);
    requestAnimationFrame(syncScroll);
  };
  useLayoutEffect(() => {
    if (selection.current && input.current && !composing.current) {
      const { start, end, direction } = selection.current;
      input.current.setSelectionRange(start, end, direction);
      selection.current = null;
    }
    syncScroll();
  }, [value, compositionValue]);
  const shown = compositionValue ?? value;
  return (
    <div className={`chemical-entry chemical-entry-${mode}`} data-response-status={status}>
      <div className="chemical-entry-viewport" aria-hidden="true">
        <span className="chemical-entry-notation" style={{ transform: `translateX(-${scroll}px)` }}>
          <ChemicalNotation value={shown} mode={mode} normalizeArrows={compositionValue === null} />
        </span>
      </div>
      <input
        ref={input}
        id={id}
        aria-label={label}
        data-answer-input="true"
        data-chemical-entry={mode}
        aria-invalid={status === 'incorrect' ? true : undefined}
        aria-describedby={status ? `${id}-status` : undefined}
        value={shown}
        readOnly={readOnly}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        onScroll={syncScroll}
        onSelect={syncScroll}
        onKeyUp={() => requestAnimationFrame(syncScroll)}
        onChange={(event) => {
          if (composing.current || (event.nativeEvent as InputEvent).isComposing)
            setCompositionValue(event.target.value);
          else commit(event.target.value);
        }}
        onCompositionStart={() => {
          composing.current = true;
          setCompositionValue(input.current?.value ?? value);
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          setCompositionValue(null);
          commit(event.currentTarget.value);
        }}
      />
      {status && (
        <span className="sr-only" id={`${id}-status`}>
          {status === 'correct' ? 'Correct' : 'Needs correction'}
        </span>
      )}
    </div>
  );
}
