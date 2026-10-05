import { useId } from 'react';
import type { ReactNode } from 'react';
import type { QuestionPart, Response, ResponseFor } from '../contracts/question.ts';
import type { EditorSurfaceProps } from './EditorFrame.tsx';
import { EditorFrame } from './EditorFrame.tsx';
import { Content } from './Content.tsx';
import { TextRangePicker } from './TextRangePicker.tsx';
import { NumericWorkingControl } from './NumericWorkingControl.tsx';
import { CorrectionSegments } from './CorrectionSegments.tsx';
import { EnergeticsResponseControl } from './EnergeticsResponseControl.tsx';

export interface ResponseControlProps {
  readonly part: QuestionPart;
  readonly response: Response | undefined;
  readonly readOnly: boolean;
  readonly onResponse: (response: Response) => void;
  readonly renderEditor?: (props: EditorSurfaceProps) => ReactNode;
  readonly workspaceAside?: ReactNode;
  readonly workingAssisted?: boolean;
  readonly onRequestSupport?: () => void;
  readonly appearance?: 'energetics-practical' | 'source';
  readonly fieldLabel?: string;
  readonly multiline?: boolean;
}

export function ResponseControl({
  part,
  response,
  readOnly,
  onResponse,
  renderEditor,
  workspaceAside,
  workingAssisted = false,
  onRequestSupport,
  appearance,
  fieldLabel,
  multiline,
}: ResponseControlProps) {
  const id = useId();
  if (appearance === 'energetics-practical' && ['text', 'correction', 'choice'].includes(part.kind))
    return (
      <EnergeticsResponseControl
        part={part}
        response={response}
        readOnly={readOnly}
        onResponse={onResponse}
        {...(fieldLabel ? { fieldLabel } : {})}
        {...(multiline ? { multiline } : {})}
      />
    );
  switch (part.kind) {
    case 'choice': {
      const selected = response?.kind === 'choice' ? response.selected : [];
      if (part.presentation === 'dropdown')
        return (
          <div className="response-label">
            <label htmlFor={id}>Answer</label>
            <select
              id={id}
              disabled={readOnly}
              value={selected[0] ?? ''}
              onChange={(event) =>
                onResponse({
                  kind: 'choice',
                  selected: event.target.value ? [event.target.value] : [],
                })
              }
            >
              <option value="">Choose an answer</option>
              {part.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.content
                    .map((block) =>
                      block.kind === 'text' || block.kind === 'formula'
                        ? block.text
                        : block.kind === 'image'
                          ? block.alt
                          : block.headers.join(', '),
                    )
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>
        );
      return (
        <fieldset className="choice-options" disabled={readOnly}>
          <legend>
            {part.presentation === 'multiple' ? 'Choose all that apply' : 'Choose one answer'}
          </legend>
          {part.options.map((option) => (
            <label className="choice-option" key={option.id}>
              <input
                type={part.presentation === 'multiple' ? 'checkbox' : 'radio'}
                name={id}
                checked={selected.includes(option.id)}
                onChange={(event) =>
                  onResponse({
                    kind: 'choice',
                    selected:
                      part.presentation === 'single'
                        ? [option.id]
                        : event.target.checked
                          ? [...selected, option.id]
                          : selected.filter((value) => value !== option.id),
                  })
                }
              />
              <Content blocks={option.content} />
            </label>
          ))}
        </fieldset>
      );
    }
    case 'text': {
      const value = response?.kind === 'text' ? response.value : '';
      return (
        <label className="response-label" htmlFor={id}>
          Your answer
          {part.presentation === 'multiline' ? (
            <textarea
              id={id}
              aria-label="Your answer"
              rows={7}
              readOnly={readOnly}
              value={value}
              onChange={(event) => onResponse({ kind: 'text', value: event.target.value })}
            />
          ) : (
            <input
              id={id}
              readOnly={readOnly}
              value={value}
              onChange={(event) => onResponse({ kind: 'text', value: event.target.value })}
            />
          )}
        </label>
      );
    }
    case 'numeric':
      return (
        <NumericWorkingControl
          part={part}
          response={response?.kind === 'numeric' ? response : undefined}
          readOnly={readOnly}
          assisted={workingAssisted}
          onResponse={onResponse}
          {...(onRequestSupport ? { onRequestSupport } : {})}
        />
      );
    case 'explanation': {
      const sections = response?.kind === 'explanation' ? response.sections : [];
      const groups = [...new Set(part.sections.map((section) => section.group ?? ''))];
      return (
        <div className="explanation-sections">
          {groups.map((group) => (
            <fieldset key={group} className="explanation-group">
              <legend>{group || 'Your explanation'}</legend>
              {part.sections
                .filter((section) => (section.group ?? '') === group)
                .map((section) => {
                  const value = sections.find((item) => item.id === section.id)?.text ?? '';
                  const update = (value: string) =>
                    onResponse({
                      kind: 'explanation',
                      sections: part.sections.map((item) => ({
                        id: item.id,
                        text:
                          item.id === section.id
                            ? value
                            : (sections.find((value) => value.id === item.id)?.text ?? ''),
                      })),
                    });
                  return (
                    <label
                      className="response-label"
                      key={section.id}
                      htmlFor={`${id}-${section.id}`}
                    >
                      {section.label}
                      {section.help && <span className="support-note">{section.help}</span>}
                      {section.presentation === 'single-line' ? (
                        <input
                          id={`${id}-${section.id}`}
                          readOnly={readOnly}
                          value={value}
                          onChange={(event) => update(event.target.value)}
                        />
                      ) : (
                        <textarea
                          id={`${id}-${section.id}`}
                          aria-label={section.label}
                          rows={5}
                          readOnly={readOnly}
                          value={value}
                          onChange={(event) => update(event.target.value)}
                        />
                      )}
                    </label>
                  );
                })}
            </fieldset>
          ))}
        </div>
      );
    }
    case 'correction': {
      const current: ResponseFor<'correction'> =
        response?.kind === 'correction'
          ? response
          : { kind: 'correction', selections: [], replacement: '' };
      return (
        <div>
          {part.segments ? (
            <CorrectionSegments
              part={part}
              response={current}
              readOnly={readOnly}
              onResponse={onResponse}
            />
          ) : (
            <TextRangePicker
              text={part.sourceText}
              label="Select the text to correct"
              disabled={readOnly}
              onPick={(range) =>
                onResponse({ ...current, selections: [...current.selections, range] })
              }
            />
          )}
          <ul className="selected-ranges">
            {current.selections.map((range, index) => (
              <li key={`${index}-${range.start}-${range.end}`}>
                “{range.text}” ({range.start}–{range.end}){' '}
                <button
                  type="button"
                  disabled={readOnly}
                  aria-label={`Remove selection ${index + 1}`}
                  onClick={() =>
                    onResponse({
                      ...current,
                      selections: current.selections.filter((_, item) => item !== index),
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <label className="response-label" htmlFor={id}>
            Replacement / correction
            <textarea
              id={id}
              aria-label="Replacement / correction"
              rows={4}
              readOnly={readOnly}
              value={current.replacement}
              onChange={(event) => onResponse({ ...current, replacement: event.target.value })}
            />
          </label>
        </div>
      );
    }
    case 'diagram-selection': {
      const selected = response?.kind === 'diagram-selection' ? response.selectedObjectIds : [];
      return (
        <div>
          <Content blocks={part.diagram} />
          <fieldset className="diagram-options" disabled={readOnly}>
            <legend>Select labelled objects in the diagram</legend>
            {part.objectIds.map((objectId) => (
              <label className="choice-option" key={objectId}>
                <input
                  type="checkbox"
                  checked={selected.includes(objectId)}
                  onChange={(event) =>
                    onResponse({
                      kind: 'diagram-selection',
                      selectedObjectIds: event.target.checked
                        ? [...selected, objectId]
                        : selected.filter((value) => value !== objectId),
                    })
                  }
                />
                {objectId}
              </label>
            ))}
          </fieldset>
        </div>
      );
    }
    case 'drawing-self-check':
      return (
        <p className="support-note">
          Complete your drawing or equation before calculating. After submitting your calculation,
          compare it with the model and confirm whether it meets every criterion.
        </p>
      );
    default:
      if ((part.kind === 'dot-and-cross' || appearance === 'source') && renderEditor)
        return renderEditor({
          part,
          response,
          readOnly,
          onResponse,
          ...(workspaceAside ? { workspaceAside } : {}),
        });
      return (
        <EditorFrame title="Diagram workspace" readOnly={readOnly}>
          {renderEditor ? (
            renderEditor({ part, response, readOnly, onResponse })
          ) : (
            <p role="status">The activity's editor surface has not been loaded.</p>
          )}
        </EditorFrame>
      );
  }
}
