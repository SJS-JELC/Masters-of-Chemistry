import { useLayoutEffect, useRef } from 'react';
import type { ComponentProps, ChangeEvent } from 'react';
import { formatScientificNumber } from './scientific-number-format.ts';

/** Keep the persisted text, visible exponent and marking input identical. */
export function ScientificNumberInput({ onChange, onCompositionStart, onCompositionEnd, ...props }: ComponentProps<'input'>) {
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const selection = useRef<{ start: number; end: number } | null>(null);
  useLayoutEffect(() => {
    const node = input.current;
    if (node && selection.current && node === document.activeElement) {
      node.setSelectionRange(selection.current.start, selection.current.end);
      selection.current = null;
    }
  });
  const format = (node: HTMLInputElement) => {
    const raw = node.value;
    const next = formatScientificNumber(raw);
    if (next === raw) return;
    const start = node.selectionStart ?? raw.length;
    const end = node.selectionEnd ?? start;
    selection.current = {
      start: formatScientificNumber(raw.slice(0, start)).length,
      end: formatScientificNumber(raw.slice(0, end)).length,
    };
    node.value = next;
    node.setSelectionRange(selection.current.start, selection.current.end);
  };
  return <input {...props} ref={input} type="text" inputMode="text"
    onChange={event => {
      if (!composing.current) format(event.currentTarget);
      onChange?.(event);
    }}
    onCompositionStart={event => { composing.current = true; onCompositionStart?.(event); }}
    onCompositionEnd={event => {
      composing.current = false;
      format(event.currentTarget);
      onChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
      onCompositionEnd?.(event);
    }} />;
}
