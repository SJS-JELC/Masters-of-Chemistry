import { useId } from 'react';
import type { QuestionPart, Response } from '../contracts/question.ts';
import type { SourceField } from './source-presentation.ts';
import { EnergeticsResponseControl } from './EnergeticsResponseControl.tsx';
import { NumericWorkingControl } from './NumericWorkingControl.tsx';
import { Content } from './Content.tsx';

export function SourceResponseControl({
  part,
  response,
  readOnly,
  onResponse,
  family,
  field,
  assisted = false,
  onRequestSupport,
  index = 0,
}: {
  part: QuestionPart;
  response: Response | undefined;
  readOnly: boolean;
  onResponse: (response: Response) => void;
  family: string;
  field?: SourceField;
  assisted?: boolean;
  onRequestSupport?: () => void;
  index?: number;
}) {
  const id = useId();
  const label =
    field?.label ??
    part.prompt.map((b) => (b.kind === 'text' || b.kind === 'formula' ? b.text : '')).join(' ');
  if (family === 'practical')
    return (
      <EnergeticsResponseControl
        part={part}
        response={response}
        readOnly={readOnly}
        onResponse={onResponse}
        fieldLabel={label}
        multiline={field?.multiline ?? label.length > 100}
      />
    );
  if (part.kind === 'numeric')
    return (
      <NumericWorkingControl
        part={part}
        response={response?.kind === 'numeric' ? response : undefined}
        readOnly={readOnly}
        assisted={assisted}
        onResponse={onResponse}
        source={{ family, label, symbol: field?.symbol ?? '', index }}
        {...(onRequestSupport ? { onRequestSupport } : {})}
      />
    );
  if (part.kind === 'text')
    return (
      <div className="answer-field">
        <label htmlFor={id}>{label}</label>
        {family === 'bonding' || field?.multiline || part.presentation === 'multiline' ? (
          <textarea
            id={id}
            className="answer-input"
            rows={4}
            autoComplete="off"
            spellCheck={false}
            maxLength={1200}
            readOnly={readOnly}
            value={response?.kind === 'text' ? response.value : ''}
            onChange={(e) => onResponse({ kind: 'text', value: e.target.value })}
          />
        ) : (
          <input
            id={id}
            className="answer-input"
            autoComplete="off"
            spellCheck={false}
            maxLength={180}
            readOnly={readOnly}
            value={response?.kind === 'text' ? response.value : ''}
            onChange={(e) => onResponse({ kind: 'text', value: e.target.value })}
          />
        )}
        <p className="field-note" aria-live="polite" />
      </div>
    );
  if (part.kind === 'choice') {
    const selected = response?.kind === 'choice' ? response.selected : [];
    return (
      <div className="answer-field choice-field">
        <fieldset disabled={readOnly}>
          <legend>{label}</legend>
          <div className="answer-options">
            {part.options.map((option) => (
              <button
                type="button"
                key={option.id}
                className={`answer-option${selected.includes(option.id) ? ' selected' : ''}`}
                aria-pressed={selected.includes(option.id)}
                onClick={() =>
                  onResponse({
                    kind: 'choice',
                    selected:
                      part.presentation === 'multiple'
                        ? selected.includes(option.id)
                          ? selected.filter((x) => x !== option.id)
                          : [...selected, option.id]
                        : [option.id],
                  })
                }
              >
                <Content blocks={option.content} />
              </button>
            ))}
          </div>
          <p className="field-note" aria-live="polite" />
        </fieldset>
      </div>
    );
  }
  if (part.kind === 'explanation') {
    const sections = response?.kind === 'explanation' ? response.sections : [];
    const render = (section: (typeof part.sections)[number]) => {
      const short = section.presentation === 'single-line';
      const value = sections.find((x) => x.id === section.id)?.text ?? '';
      const update = (text: string) =>
        onResponse({
          kind: 'explanation',
          sections: part.sections.map((x) => ({
            id: x.id,
            text: x.id === section.id ? text : (sections.find((s) => s.id === x.id)?.text ?? ''),
          })),
        });
      return (
        <section
          key={section.id}
          className={`scaffold-section${short ? ' compact' : ''}${section.id === 'comparison' ? ' comparison-writing' : ''}`}
        >
          <label htmlFor={`${id}-${section.id}`}>{section.label}</label>
          {section.help && <p className="scaffold-help">{section.help}</p>}
          {short ? (
            <input
              id={`${id}-${section.id}`}
              className="student-response short-response"
              readOnly={readOnly}
              value={value}
              onChange={(e) => update(e.target.value)}
            />
          ) : (
            <textarea
              id={`${id}-${section.id}`}
              className="student-response"
              readOnly={readOnly}
              value={value}
              onChange={(e) => update(e.target.value)}
            />
          )}
        </section>
      );
    };
    const groups = [...new Set(part.sections.flatMap((x) => (x.group ? [x.group] : [])))];
    return (
      <div className="response-form">
        <p className="level-intro">{label}</p>
        {groups.length > 0 && (
          <div className="guided-comparison-grid">
            {groups.map((group) => (
              <section className="guided-substance" key={group}>
                <h3>{group}</h3>
                <div className="scaffold-sections">
                  {part.sections.filter((x) => x.group === group).map(render)}
                </div>
              </section>
            ))}
          </div>
        )}
        {part.sections.filter((x) => !x.group).map(render)}
      </div>
    );
  }
  if (part.kind === 'drawing-self-check')
    return (
      <div className="drawing-instruction">
        <Content blocks={part.prompt} />
      </div>
    );
  return null;
}
