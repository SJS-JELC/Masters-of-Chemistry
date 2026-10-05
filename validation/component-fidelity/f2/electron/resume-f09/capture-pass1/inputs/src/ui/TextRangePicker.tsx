import { useId, useState } from 'react';
import type { TextRange } from '../contracts/question.ts';

/** Native keyboard selection and explicit offsets both select the same immutable text. */
export function TextRangePicker({
  text,
  label,
  onPick,
  disabled = false,
}: {
  readonly text: string;
  readonly label: string;
  readonly onPick: (range: TextRange) => void;
  readonly disabled?: boolean;
}) {
  const id = useId();
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('0');
  const first = Number(start),
    last = Number(end);
  const valid =
    start !== '' &&
    end !== '' &&
    Number.isInteger(first) &&
    Number.isInteger(last) &&
    first >= 0 &&
    last > first &&
    last <= text.length;
  return (
    <div className="range-picker">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className="locked-text"
        value={text}
        readOnly
        rows={Math.min(12, Math.max(4, text.split('\n').length + 2))}
        onSelect={(event) => {
          setStart(String(event.currentTarget.selectionStart));
          setEnd(String(event.currentTarget.selectionEnd));
        }}
      />
      <p className="support-note">
        Select text with a pointer, or focus the answer and press Ctrl + A to select all. For a
        precise keyboard range, enter character positions below; the first character is position 0.
      </p>
      <div className="range-offsets">
        <label>
          Start
          <input
            type="number"
            min={0}
            max={text.length}
            value={start}
            disabled={disabled}
            onChange={(event) => setStart(event.target.value)}
          />
        </label>
        <label>
          End (exclusive)
          <input
            type="number"
            min={0}
            max={text.length}
            value={end}
            disabled={disabled}
            onChange={(event) => setEnd(event.target.value)}
          />
        </label>
        <button
          type="button"
          disabled={disabled || !valid}
          onClick={() => onPick({ start: first, end: last, text: text.slice(first, last) })}
        >
          Use selected text
        </button>
      </div>
      <p className="range-preview" aria-live="polite">
        {valid ? `Selected: “${text.slice(first, last)}”` : 'Select a nonempty range.'}
      </p>
    </div>
  );
}
