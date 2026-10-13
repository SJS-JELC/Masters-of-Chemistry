import { useId, useLayoutEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { ResponseControl } from '../../../ui/ResponseControl.tsx';
import { ScientificNumberInput } from '../../../ui/ScientificNumberInput.tsx';
import { ChemicalEntry } from '../../../ui/ChemicalEntry.tsx';
import type { ResponseControlProps } from '../../../ui/ResponseControl.tsx';
import { Content } from '../../../ui/Content.tsx';
import { formatRateInput } from './input-syntax.ts';
import type { RateInputMode } from './input-syntax.ts';
import './response-controls.css';

function TypedRateAnswer({ part, response, readOnly, onResponse, status }: ResponseControlProps & { readonly mode: RateInputMode }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const selection = useRef<{ start: number; end: number } | null>(null);
  const mode = part.id === 'k-units' ? 'units' : 'rate-law';
  const value = response?.kind === 'text' ? response.value : '';
  useLayoutEffect(() => {
    const node = input.current;
    if (selection.current && node && node === document.activeElement) {
      node.setSelectionRange(selection.current.start, selection.current.end);
      selection.current = null;
    }
  });
  const update = (node: HTMLInputElement, format: boolean) => {
    const next = format ? formatRateInput(node.value, mode, node.selectionStart ?? node.value.length, node.selectionEnd ?? node.value.length)
      : { value: node.value, start: node.selectionStart ?? 0, end: node.selectionEnd ?? 0 };
    selection.current = format ? { start: next.start, end: next.end } : null;
    onResponse({ kind: 'text', value: next.value });
  };
  return <label className="response-label rate-typed-answer" htmlFor={id}>
    <input ref={input} id={id} data-answer-input="true" data-rate-input={mode} type="text" value={value}
      aria-label={part.prompt.map(block => block.kind === 'text' ? block.text : '').join(' ')}
      aria-invalid={status === 'incorrect' ? true : undefined} data-response-status={status}
      readOnly={readOnly} autoComplete="off" autoCapitalize="off" spellCheck={false}
      onCompositionStart={() => { composing.current = true; selection.current = null; }}
      onCompositionEnd={event => { composing.current = false; update(event.currentTarget, true); }}
      onChange={event => update(event.currentTarget, !composing.current)} />
  </label>;
}

/** Shared practice/revision controls; response values remain the shared standard response union. */
export function RateResponseControl(props: ResponseControlProps) {
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const { part, response, readOnly, onResponse } = props;
  if (part.kind === 'text' && (part.id === 'mechanism-step-1' || part.id === 'mechanism-step-2'))
    return <ChemicalEntry value={response?.kind === 'text' ? response.value : ''} mode="equation"
      label={part.prompt.map(block => block.kind === 'text' ? block.text : '').join(' ')}
      readOnly={readOnly} status={props.status} onChange={value => onResponse({ kind: 'text', value })} />;
  if (part.kind === 'text' && (part.id === 'rate-equation' || part.id === 'k-units'))
    return <TypedRateAnswer {...props} mode={part.id === 'k-units' ? 'units' : 'rate-law'} />;
  if (part.kind === 'numeric' && !part.workingFramework) {
    const label = part.prompt.map(block => block.kind === 'text' ? block.text : '').join(' ');
    return <label className="response-label rate-numeric-answer" htmlFor={id}>
      <ScientificNumberInput id={id} data-answer-input="true" aria-label={`${label}${part.unit ? ` (${part.unit})` : ''}`}
        aria-invalid={props.status === 'incorrect' ? true : undefined} data-response-status={props.status}
        inputMode={part.inputMode ?? 'decimal'} readOnly={readOnly}
        value={response?.kind === 'numeric' ? response.raw : ''}
        onChange={event => onResponse({ kind: 'numeric', raw: event.target.value, unit: part.unit,
          ...(response?.kind === 'numeric' && response.working ? { working: response.working } : {}) })} />
      {part.unit && <span className="unit">{part.unit}</span>}
    </label>;
  }
  if (part.kind !== 'choice') return <ResponseControl {...props} />;
  const selected = response?.kind === 'choice' ? response.selected : [];
  const multiple = part.presentation === 'multiple';
  const choose = (optionId: string) => {
    if (readOnly) return;
    onResponse({ kind: 'choice', selected: multiple
      ? selected.includes(optionId) ? selected.filter(value => value !== optionId) : [...selected, optionId]
      : [optionId] });
  };
  const key = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (readOnly || multiple) return;
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % part.options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + part.options.length - 1) % part.options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = part.options.length - 1;
    else return;
    event.preventDefault();
    choose(part.options[next]!.id);
    buttons.current[next]?.focus();
  };
  const tabIndex = Math.max(0, part.options.findIndex(option => selected.includes(option.id)));
  return <fieldset className="rate-choice-field" disabled={readOnly}>
    <legend id={id} className={multiple ? undefined : 'sr-only'}>{part.prompt.map(block => block.kind === 'text' ? block.text : '').join(' ')}{multiple ? ' Choose all that apply.' : ''}</legend>
    <div className="rate-choice-buttons" role={multiple ? 'group' : 'radiogroup'} aria-labelledby={id}>
      {part.options.map((option, index) => <button type="button" key={option.id}
        ref={node => { buttons.current[index] = node; }}
        className="rate-choice-button" role={multiple ? 'checkbox' : 'radio'} aria-checked={selected.includes(option.id)}
        disabled={readOnly} tabIndex={multiple || index === tabIndex ? 0 : -1}
        onClick={() => choose(option.id)} onKeyDown={event => key(event, index)}>
        <Content blocks={option.content} />
      </button>)}
    </div>
  </fieldset>;
}
